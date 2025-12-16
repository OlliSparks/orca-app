// ORCA 2.0 - Offline Service
// Service Worker Registration und Offline-Status Management

class OfflineService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.pendingActions = [];
        this.init();
    }

    async init() {
        // Register Service Worker
        await this.registerServiceWorker();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Load pending actions from storage
        this.loadPendingActions();

        // Create offline indicator
        this.createOfflineIndicator();

        // Initial status check
        this.updateOnlineStatus();

        console.log('[OfflineService] Initialized');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('[OfflineService] Service Worker registered:', this.swRegistration.scope);

                // Listen for updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;
                    console.log('[OfflineService] New Service Worker installing...');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateNotification();
                        }
                    });
                });

                // Handle controller change
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('[OfflineService] Controller changed');
                });

            } catch (error) {
                console.error('[OfflineService] Service Worker registration failed:', error);
            }
        } else {
            console.warn('[OfflineService] Service Workers not supported');
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.updateOnlineStatus();
        console.log('[OfflineService] Back online');

        // Sync pending actions
        this.syncPendingActions();

        // Show notification
        if (typeof errorService !== 'undefined') {
            errorService.success('Verbindung wiederhergestellt', 'Online');
        }
    }

    handleOffline() {
        this.isOnline = false;
        this.updateOnlineStatus();
        console.log('[OfflineService] Gone offline');

        // Show notification
        if (typeof errorService !== 'undefined') {
            errorService.warning(
                'Sie arbeiten jetzt offline. Änderungen werden gespeichert und später synchronisiert.',
                'Offline-Modus'
            );
        }
    }

    updateOnlineStatus() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.toggle('offline', !this.isOnline);
            indicator.classList.toggle('online', this.isOnline);
        }

        // Update body class
        document.body.classList.toggle('is-offline', !this.isOnline);
    }

    createOfflineIndicator() {
        if (document.getElementById('offlineIndicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator online';
        indicator.innerHTML = `
            <span class="offline-icon">📶</span>
            <span class="offline-text">Online</span>
        `;
        document.body.appendChild(indicator);
    }

    showUpdateNotification() {
        if (typeof errorService !== 'undefined') {
            const toast = errorService.showToast({
                title: 'Update verfügbar',
                message: 'Eine neue Version ist verfügbar.',
                icon: '🔄',
                type: 'info',
                suggestions: [],
                action: {
                    text: 'Jetzt aktualisieren',
                    handler: () => this.applyUpdate()
                }
            });
        }
    }

    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    // === PENDING ACTIONS MANAGEMENT ===

    loadPendingActions() {
        try {
            const stored = localStorage.getItem('orca_pending_actions');
            this.pendingActions = stored ? JSON.parse(stored) : [];
        } catch {
            this.pendingActions = [];
        }
    }

    savePendingActions() {
        localStorage.setItem('orca_pending_actions', JSON.stringify(this.pendingActions));
    }

    addPendingAction(action) {
        this.pendingActions.push({
            ...action,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            synced: false
        });
        this.savePendingActions();
        this.updatePendingBadge();

        console.log('[OfflineService] Action queued:', action.type);
    }

    async syncPendingActions() {
        if (!this.isOnline || this.pendingActions.length === 0) return;

        console.log('[OfflineService] Syncing', this.pendingActions.length, 'pending actions...');

        const actionsToSync = [...this.pendingActions];

        for (const action of actionsToSync) {
            if (action.synced) continue;

            try {
                await this.executeAction(action);
                action.synced = true;
                console.log('[OfflineService] Action synced:', action.id);
            } catch (error) {
                console.error('[OfflineService] Failed to sync action:', action.id, error);
            }
        }

        // Remove synced actions
        this.pendingActions = this.pendingActions.filter(a => !a.synced);
        this.savePendingActions();
        this.updatePendingBadge();

        if (this.pendingActions.length === 0 && actionsToSync.length > 0) {
            errorService.success(
                `${actionsToSync.length} Aktion(en) erfolgreich synchronisiert`,
                'Synchronisiert'
            );
        }
    }

    async executeAction(action) {
        // Execute different action types
        switch (action.type) {
            case 'inventur_confirm':
                // API call to confirm inventur
                break;
            case 'verlagerung_request':
                // API call to request relocation
                break;
            case 'message_send':
                // API call to send message
                break;
            default:
                console.warn('[OfflineService] Unknown action type:', action.type);
        }
    }

    updatePendingBadge() {
        const count = this.pendingActions.filter(a => !a.synced).length;
        const badge = document.getElementById('pendingActionsBadge');

        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    getPendingCount() {
        return this.pendingActions.filter(a => !a.synced).length;
    }

    // === CACHE MANAGEMENT ===

    async cachePages(urls) {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'CACHE_URLS',
                urls: urls
            });
        }
    }

    async clearCache() {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'CLEAR_CACHE'
            });
        }
    }

    // === BACKGROUND SYNC ===

    async requestSync(tag) {
        if ('sync' in this.swRegistration) {
            try {
                await this.swRegistration.sync.register(tag);
                console.log('[OfflineService] Sync registered:', tag);
            } catch (error) {
                console.error('[OfflineService] Sync registration failed:', error);
            }
        }
    }

    // === STATUS HELPERS ===

    getOnlineStatus() {
        return this.isOnline;
    }

    isOffline() {
        return !this.isOnline;
    }
}

// Globale Instanz
const offlineService = new OfflineService();
