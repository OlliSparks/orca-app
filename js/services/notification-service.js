// ORCA 2.0 - Notification Service
// Push-Notifications und In-App Benachrichtigungen

class NotificationService {
    constructor() {
        this.permission = 'default';
        this.subscription = null;
        this.notificationQueue = [];
        this.init();
    }

    async init() {
        // Check notification support
        if (!('Notification' in window)) {
            console.warn('[NotificationService] Notifications not supported');
            return;
        }

        this.permission = Notification.permission;
        console.log('[NotificationService] Permission status:', this.permission);

        // If already granted, get subscription
        if (this.permission === 'granted') {
            await this.getSubscription();
        }

        // Create notification center UI
        this.createNotificationCenter();

        // Load stored notifications
        this.loadNotifications();
    }

    // Request permission for notifications
    async requestPermission() {
        if (!('Notification' in window)) {
            errorService.info('Ihr Browser unterstützt keine Push-Benachrichtigungen.', 'Nicht unterstützt');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission === 'denied') {
            errorService.warning(
                'Benachrichtigungen wurden blockiert. Bitte aktivieren Sie diese in den Browser-Einstellungen.',
                'Blockiert'
            );
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            this.permission = result;

            if (result === 'granted') {
                errorService.success('Benachrichtigungen aktiviert!', 'Aktiviert');
                await this.getSubscription();
                return true;
            } else {
                errorService.info('Benachrichtigungen wurden nicht aktiviert.', 'Abgelehnt');
                return false;
            }
        } catch (error) {
            console.error('[NotificationService] Permission request failed:', error);
            return false;
        }
    }

    // Get push subscription
    async getSubscription() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('[NotificationService] Push not supported');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();

            if (!this.subscription) {
                // Create new subscription (would need VAPID key from server)
                console.log('[NotificationService] No subscription found');
            }

            return this.subscription;
        } catch (error) {
            console.error('[NotificationService] Failed to get subscription:', error);
            return null;
        }
    }

    // Show a notification
    async show(title, options = {}) {
        const defaultOptions = {
            icon: '/assets/orca-logo.svg',
            badge: '/assets/orca-logo.svg',
            tag: 'orca-notification',
            renotify: false,
            requireInteraction: false,
            silent: false,
            vibrate: [100, 50, 100],
            data: {
                url: options.url || '/',
                timestamp: Date.now()
            },
            actions: options.actions || []
        };

        const mergedOptions = { ...defaultOptions, ...options };

        // Store notification in history
        this.addToHistory({
            title,
            ...mergedOptions,
            read: false
        });

        // Show browser notification if permitted
        if (this.permission === 'granted') {
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification(title, mergedOptions);
                } else {
                    new Notification(title, mergedOptions);
                }
                return true;
            } catch (error) {
                console.error('[NotificationService] Failed to show notification:', error);
            }
        }

        // Fallback: Show in-app notification
        this.showInApp(title, mergedOptions);
        return true;
    }

    // Show in-app notification popup
    showInApp(title, options = {}) {
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.innerHTML = `
            <div class="notification-popup-icon">${options.icon ? '🔔' : '📬'}</div>
            <div class="notification-popup-content">
                <strong class="notification-popup-title">${title}</strong>
                ${options.body ? `<p class="notification-popup-body">${options.body}</p>` : ''}
            </div>
            <button class="notification-popup-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Click handler
        popup.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-popup-close')) {
                if (options.data && options.data.url) {
                    router.navigate(options.data.url);
                }
                popup.remove();
            }
        });

        document.body.appendChild(popup);

        // Animation
        requestAnimationFrame(() => popup.classList.add('visible'));

        // Auto-hide
        setTimeout(() => {
            popup.classList.remove('visible');
            setTimeout(() => popup.remove(), 300);
        }, 5000);
    }

    // Notification Center UI
    createNotificationCenter() {
        if (document.getElementById('notificationCenter')) return;

        const center = document.createElement('div');
        center.id = 'notificationCenter';
        center.className = 'notification-center';
        center.innerHTML = `
            <div class="notification-center-header">
                <h3>Benachrichtigungen</h3>
                <div class="notification-center-actions">
                    <button class="btn-mark-all-read" onclick="notificationService.markAllRead()">
                        Alle als gelesen markieren
                    </button>
                    <button class="notification-center-close" onclick="notificationService.closeCenter()">×</button>
                </div>
            </div>
            <div class="notification-center-content" id="notificationCenterContent">
                <div class="notification-empty">
                    <span class="notification-empty-icon">🔔</span>
                    <p>Keine neuen Benachrichtigungen</p>
                </div>
            </div>
            <div class="notification-center-footer">
                <button class="btn-notification-settings" onclick="notificationService.openSettings()">
                    ⚙️ Einstellungen
                </button>
            </div>
        `;

        document.body.appendChild(center);
    }

    openCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            center.classList.add('open');
            this.renderNotifications();
        }
    }

    closeCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            center.classList.remove('open');
        }
    }

    toggleCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            if (center.classList.contains('open')) {
                this.closeCenter();
            } else {
                this.openCenter();
            }
        }
    }

    // Notification History Management
    loadNotifications() {
        try {
            const stored = localStorage.getItem('orca_notifications');
            this.notifications = stored ? JSON.parse(stored) : [];
        } catch {
            this.notifications = [];
        }
        this.updateBadge();
    }

    saveNotifications() {
        localStorage.setItem('orca_notifications', JSON.stringify(this.notifications.slice(0, 50)));
    }

    addToHistory(notification) {
        this.notifications.unshift({
            id: Date.now(),
            ...notification,
            timestamp: new Date().toISOString()
        });
        this.saveNotifications();
        this.updateBadge();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadge();
            this.renderNotifications();
        }
    }

    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    }

    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    updateBadge() {
        const count = this.getUnreadCount();
        let badge = document.getElementById('notificationBadge');

        if (!badge) {
            // Create badge in header
            const headerStats = document.getElementById('headerStats');
            if (headerStats) {
                badge = document.createElement('span');
                badge.id = 'notificationBadge';
                badge.className = 'notification-badge';
                badge.onclick = () => this.toggleCenter();
                headerStats.parentNode.insertBefore(badge, headerStats);
            }
        }

        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    renderNotifications() {
        const content = document.getElementById('notificationCenterContent');
        if (!content) return;

        if (this.notifications.length === 0) {
            content.innerHTML = `
                <div class="notification-empty">
                    <span class="notification-empty-icon">🔔</span>
                    <p>Keine neuen Benachrichtigungen</p>
                </div>
            `;
            return;
        }

        content.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                <div class="notification-item-icon">
                    ${this.getNotificationIcon(n.type)}
                </div>
                <div class="notification-item-content" onclick="notificationService.handleNotificationClick(${n.id}, '${n.data?.url || '/'}')">
                    <strong class="notification-item-title">${n.title}</strong>
                    ${n.body ? `<p class="notification-item-body">${n.body}</p>` : ''}
                    <span class="notification-item-time">${this.formatTime(n.timestamp)}</span>
                </div>
                <button class="notification-item-delete" onclick="notificationService.deleteNotification(${n.id})">×</button>
            </div>
        `).join('');
    }

    handleNotificationClick(id, url) {
        this.markAsRead(id);
        this.closeCenter();
        if (url && url !== '/') {
            router.navigate(url);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'inventur': '📋',
            'verlagerung': '🚚',
            'message': '📬',
            'system': '⚙️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || '🔔';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Gerade eben';
        if (diff < 3600000) return `vor ${Math.floor(diff / 60000)} Min.`;
        if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)} Std.`;
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }

    openSettings() {
        this.closeCenter();
        router.navigate('/settings');
    }

    // Predefined notification types
    notifyInventur(message, processId = null) {
        this.show('Inventur', {
            body: message,
            tag: 'inventur-' + (processId || Date.now()),
            data: { url: '/inventur', type: 'inventur' }
        });
    }

    notifyVerlagerung(message, processId = null) {
        this.show('Verlagerung', {
            body: message,
            tag: 'verlagerung-' + (processId || Date.now()),
            data: { url: '/verlagerung', type: 'verlagerung' }
        });
    }

    notifyMessage(message, fromUser = null) {
        this.show('Neue Nachricht' + (fromUser ? ` von ${fromUser}` : ''), {
            body: message,
            tag: 'message-' + Date.now(),
            data: { url: '/messages', type: 'message' }
        });
    }

    notifySystem(title, message) {
        this.show(title, {
            body: message,
            tag: 'system-' + Date.now(),
            data: { type: 'system' }
        });
    }
}

// Globale Instanz
const notificationService = new NotificationService();
