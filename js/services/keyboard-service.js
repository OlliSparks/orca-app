// ORCA 2.0 - Keyboard Navigation Service
// Verbesserte Tastaturnavigation und Shortcuts

class KeyboardService {
    constructor() {
        this.shortcuts = new Map();
        this.focusableElements = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            // Global keyboard event handler
            document.addEventListener('keydown', (e) => this.handleKeydown(e));

            // Register default shortcuts
            this.registerDefaultShortcuts();

            // Initialize focus trap for modals
            this.initModalFocusTrap();

            console.log('KeyboardService initialized');
        } catch (e) {
            console.warn('[Keyboard] Init error:', e);
        }
    }

    // Register default application shortcuts
    registerDefaultShortcuts() {
        // Navigation shortcuts
        this.register('g+d', () => router.navigate('/dashboard'), 'Zum Dashboard');
        this.register('g+i', () => router.navigate('/inventur'), 'Zur Inventur');
        this.register('g+v', () => router.navigate('/verlagerung'), 'Zur Verlagerung');
        this.register('g+a', () => router.navigate('/agenten'), 'Zu den Agenten');
        this.register('g+s', () => router.navigate('/settings'), 'Zu Einstellungen');
        this.register('g+m', () => router.navigate('/messages'), 'Zu Nachrichten');
        this.register('g+u', () => router.navigate('/unternehmen'), 'Zu Unternehmen');

        // Action shortcuts
        this.register('/', () => this.focusSearch(), 'Suche fokussieren');
        this.register('Escape', () => this.closeActiveModal(), 'Modal schließen');
        this.register('?', () => this.showShortcutsHelp(), 'Shortcuts anzeigen', { shift: true });

        // Table/List navigation
        this.register('j', () => this.navigateList('down'), 'Nächstes Element');
        this.register('k', () => this.navigateList('up'), 'Vorheriges Element');
        this.register('Enter', () => this.activateCurrentItem(), 'Element öffnen');
    }

    // Register a keyboard shortcut
    register(keys, callback, description = '', modifiers = {}) {
        const normalizedKeys = this.normalizeKeys(keys, modifiers);
        this.shortcuts.set(normalizedKeys, {
            callback,
            description,
            keys: keys,
            modifiers
        });
    }

    // Unregister a shortcut
    unregister(keys, modifiers = {}) {
        const normalizedKeys = this.normalizeKeys(keys, modifiers);
        this.shortcuts.delete(normalizedKeys);
    }

    // Normalize key combination string
    normalizeKeys(keys, modifiers = {}) {
        let prefix = '';
        if (modifiers.ctrl) prefix += 'ctrl+';
        if (modifiers.alt) prefix += 'alt+';
        if (modifiers.shift) prefix += 'shift+';
        if (modifiers.meta) prefix += 'meta+';
        return prefix + keys.toLowerCase();
    }

    // Handle keydown events
    handleKeydown(e) {
        // Skip if user is typing in an input field
        if (this.isInputFocused() && !['Escape', 'Enter'].includes(e.key)) {
            return;
        }

        // Build key combination string
        let keyCombo = '';
        if (e.ctrlKey) keyCombo += 'ctrl+';
        if (e.altKey) keyCombo += 'alt+';
        if (e.shiftKey) keyCombo += 'shift+';
        if (e.metaKey) keyCombo += 'meta+';
        keyCombo += e.key.toLowerCase();

        // Check for two-key shortcuts (g+x pattern)
        if (this.pendingKey) {
            const twoKeyCombo = `${this.pendingKey}+${e.key.toLowerCase()}`;
            if (this.shortcuts.has(twoKeyCombo)) {
                e.preventDefault();
                this.shortcuts.get(twoKeyCombo).callback();
                this.pendingKey = null;
                this.hidePendingIndicator();
                return;
            }
            this.pendingKey = null;
            this.hidePendingIndicator();
        }

        // Check for single-key shortcuts
        if (this.shortcuts.has(keyCombo)) {
            e.preventDefault();
            this.shortcuts.get(keyCombo).callback();
            return;
        }

        // Check if this could be first key of two-key combo
        if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            this.pendingKey = 'g';
            this.showPendingIndicator('g');
            setTimeout(() => {
                this.pendingKey = null;
                this.hidePendingIndicator();
            }, 1500);
            return;
        }

        // Arrow key navigation in lists/tables
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleArrowNavigation(e);
        }

        // Tab trap in modals
        if (e.key === 'Tab') {
            this.handleTabInModal(e);
        }
    }

    // Check if user is focused on an input element
    isInputFocused() {
        const active = document.activeElement;
        if (!active) return false;
        const tagName = active.tagName.toLowerCase();
        return ['input', 'textarea', 'select'].includes(tagName) ||
               active.isContentEditable;
    }

    // Show pending key indicator
    showPendingIndicator(key) {
        let indicator = document.getElementById('keyboardPendingIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'keyboardPendingIndicator';
            indicator.className = 'keyboard-pending-indicator';
            document.body.appendChild(indicator);
        }
        indicator.textContent = `${key} + ...`;
        indicator.classList.add('visible');
    }

    hidePendingIndicator() {
        const indicator = document.getElementById('keyboardPendingIndicator');
        if (indicator) {
            indicator.classList.remove('visible');
        }
    }

    // Focus the search input
    focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[type="text"][placeholder*="such"], input[id*="search"], input[id*="Search"], #glossarSearch');
        for (const input of searchInputs) {
            if (input.offsetParent !== null) { // Is visible
                input.focus();
                input.select();
                return;
            }
        }
    }

    // Close the currently active modal
    closeActiveModal() {
        // Check for various modal types
        const modals = document.querySelectorAll('.modal.active, .onboarding-modal, .help-modal, .error-dialog-overlay.visible, [class*="modal"].active');
        for (const modal of modals) {
            // Try clicking close button first
            const closeBtn = modal.querySelector('.modal-close, .btn-close, .close-btn, [onclick*="close"]');
            if (closeBtn) {
                closeBtn.click();
                return;
            }
            // Otherwise just remove/hide it
            modal.classList.remove('active', 'visible');
            modal.remove && modal.remove();
        }
    }

    // Show keyboard shortcuts help
    showShortcutsHelp() {
        const shortcuts = Array.from(this.shortcuts.entries())
            .filter(([_, data]) => data.description)
            .map(([combo, data]) => ({ combo: data.keys, description: data.description }));

        const groupedShortcuts = {
            'Navigation': shortcuts.filter(s => s.combo.startsWith('g+')),
            'Aktionen': shortcuts.filter(s => !s.combo.startsWith('g+'))
        };

        const overlay = document.createElement('div');
        overlay.className = 'keyboard-shortcuts-overlay';
        overlay.innerHTML = `
            <div class="keyboard-shortcuts-modal">
                <div class="shortcuts-header">
                    <h2>Tastatur-Shortcuts</h2>
                    <button class="shortcuts-close" onclick="this.closest('.keyboard-shortcuts-overlay').remove()">×</button>
                </div>
                <div class="shortcuts-content">
                    ${Object.entries(groupedShortcuts).map(([group, items]) => `
                        <div class="shortcuts-group">
                            <h3>${group}</h3>
                            <div class="shortcuts-list">
                                ${items.map(s => `
                                    <div class="shortcut-item">
                                        <kbd class="shortcut-key">${this.formatKeyCombo(s.combo)}</kbd>
                                        <span class="shortcut-desc">${s.description}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    <div class="shortcuts-group">
                        <h3>Listen & Tabellen</h3>
                        <div class="shortcuts-list">
                            <div class="shortcut-item">
                                <kbd class="shortcut-key">↑ / ↓</kbd>
                                <span class="shortcut-desc">Navigation in Listen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd class="shortcut-key">Enter</kbd>
                                <span class="shortcut-desc">Element öffnen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd class="shortcut-key">Tab</kbd>
                                <span class="shortcut-desc">Nächstes Feld</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="shortcuts-footer">
                    <span>Drücken Sie <kbd>Escape</kbd> zum Schließen</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Close on Escape or click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    // Format key combination for display
    formatKeyCombo(combo) {
        return combo
            .replace(/\+/g, ' + ')
            .replace('ctrl', 'Strg')
            .replace('shift', '⇧')
            .replace('alt', 'Alt')
            .replace('meta', '⌘')
            .replace('escape', 'Esc')
            .toUpperCase();
    }

    // Handle arrow key navigation in lists and tables
    handleArrowNavigation(e) {
        const container = document.querySelector('.tool-cards, .ag-body-viewport, .inventory-table tbody, [data-keyboard-nav]');
        if (!container) return;

        const items = container.querySelectorAll('.tool-card, .ag-row, tr:not(.skeleton-row), [data-nav-item]');
        if (items.length === 0) return;

        const currentIndex = Array.from(items).findIndex(item =>
            item.classList.contains('keyboard-focused') || item.classList.contains('selected')
        );

        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                newIndex = Math.min(currentIndex + 1, items.length - 1);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                newIndex = Math.max(currentIndex - 1, 0);
                break;
        }

        if (newIndex !== currentIndex && newIndex >= 0) {
            e.preventDefault();

            // Remove focus from current
            items.forEach(item => item.classList.remove('keyboard-focused'));

            // Add focus to new
            const newItem = items[newIndex];
            newItem.classList.add('keyboard-focused');
            newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Focus first focusable element in item
            const focusable = newItem.querySelector(this.focusableElements);
            if (focusable) focusable.focus();
        }
    }

    // Navigate list with j/k keys
    navigateList(direction) {
        const container = document.querySelector('.tool-cards, .inventory-table tbody, [data-keyboard-nav]');
        if (!container) return;

        const items = container.querySelectorAll('.tool-card, tr:not(.skeleton-row), [data-nav-item]');
        if (items.length === 0) return;

        const currentIndex = Array.from(items).findIndex(item =>
            item.classList.contains('keyboard-focused')
        );

        let newIndex = currentIndex;

        if (direction === 'down') {
            newIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, items.length - 1);
        } else if (direction === 'up') {
            newIndex = currentIndex === -1 ? items.length - 1 : Math.max(currentIndex - 1, 0);
        }

        if (newIndex >= 0 && newIndex < items.length) {
            items.forEach(item => item.classList.remove('keyboard-focused'));
            const newItem = items[newIndex];
            newItem.classList.add('keyboard-focused');
            newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Activate (click) the current keyboard-focused item
    activateCurrentItem() {
        if (this.isInputFocused()) return;

        const focusedItem = document.querySelector('.keyboard-focused');
        if (focusedItem) {
            // Try to find and click a link or button
            const clickable = focusedItem.querySelector('a, button, [onclick]') || focusedItem;
            clickable.click();
        }
    }

    // Initialize focus trap for modals
    initModalFocusTrap() {
        // MutationObserver to detect when modals are opened
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active') || target.classList.contains('visible')) {
                        this.trapFocusInModal(target);
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    }

    // Trap focus within a modal
    trapFocusInModal(modal) {
        const focusableContent = modal.querySelectorAll(this.focusableElements);
        if (focusableContent.length === 0) return;

        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        // Focus first element
        firstFocusable.focus();
    }

    // Handle Tab key in modals
    handleTabInModal(e) {
        const modal = document.querySelector('.modal.active, .onboarding-modal, .help-modal, .error-dialog-overlay.visible');
        if (!modal) return;

        const focusableContent = modal.querySelectorAll(this.focusableElements);
        if (focusableContent.length === 0) return;

        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    // Add skip-to-content link
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#app';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Zum Hauptinhalt springen';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Announce text to screen readers
    announce(text, priority = 'polite') {
        let announcer = document.getElementById('a11y-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'a11y-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        announcer.textContent = '';
        setTimeout(() => announcer.textContent = text, 100);
    }
}

// Globale Instanz
const keyboardService = new KeyboardService();
