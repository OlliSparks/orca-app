// ORCA 2.0 - Accessibility Service
// ARIA-Labels, Screen Reader Support, Fokus-Management

class AccessibilityService {
    constructor() {
        this.announcements = [];
        this.init();
    }

    init() {
        // Live-Region fuer Ankuendigungen erstellen
        this.createLiveRegion();

        // ARIA-Labels automatisch hinzufuegen
        this.setupAutoARIA();

        // Skip-Links fuer Tastatur-Navigation
        this.createSkipLinks();

        // Fokus-Trap fuer Modals
        this.setupFocusTrap();

        // Fokus-Sichtbarkeit verbessern
        this.setupFocusVisibility();

        // Kontrast-Modus erkennen
        this.checkContrastMode();
    }

    // Live-Region fuer Screen Reader Ankuendigungen
    createLiveRegion() {
        const region = document.createElement('div');
        region.id = 'a11y-live-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);

        // Assertive Region fuer wichtige Meldungen
        const assertive = document.createElement('div');
        assertive.id = 'a11y-live-assertive';
        assertive.setAttribute('role', 'alert');
        assertive.setAttribute('aria-live', 'assertive');
        assertive.setAttribute('aria-atomic', 'true');
        assertive.className = 'sr-only';
        document.body.appendChild(assertive);
    }

    // Screen Reader Ankuendigung
    announce(message, priority = 'polite') {
        const region = document.getElementById(priority === 'assertive' ? 'a11y-live-assertive' : 'a11y-live-region');
        if (!region) return;

        // Kurz leeren dann neu setzen (fuer wiederholte Meldungen)
        region.textContent = '';
        setTimeout(() => {
            region.textContent = message;
        }, 50);
    }

    // ARIA-Labels automatisch setzen
    setupAutoARIA() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        this.enhanceElement(node);
                        if (node.querySelectorAll) {
                            node.querySelectorAll('*').forEach(el => this.enhanceElement(el));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Bestehende Elemente verbessern
        document.querySelectorAll('*').forEach(el => this.enhanceElement(el));
    }

    enhanceElement(el) {
        if (!el || el.dataset.a11yEnhanced) return;

        // Buttons ohne Text
        if (el.tagName === 'BUTTON' && !el.textContent.trim() && !el.getAttribute('aria-label')) {
            const icon = el.querySelector('svg, img, span');
            if (icon) {
                // Versuchen Label aus Title oder Class abzuleiten
                const label = el.title || this.guessLabelFromClass(el.className);
                if (label) {
                    el.setAttribute('aria-label', label);
                }
            }
        }

        // Links ohne Text
        if (el.tagName === 'A' && !el.textContent.trim() && !el.getAttribute('aria-label')) {
            const label = el.title || this.guessLabelFromClass(el.className);
            if (label) {
                el.setAttribute('aria-label', label);
            }
        }

        // Icons im Button
        if (el.classList.contains('icon') || el.tagName === 'SVG') {
            el.setAttribute('aria-hidden', 'true');
        }

        // Inputs ohne Labels
        if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') && !el.id) {
            // ID generieren falls noetig
            el.id = 'input_' + Math.random().toString(36).substr(2, 9);
        }

        // Progress-Elemente
        if (el.classList.contains('progress') || el.classList.contains('loading-bar')) {
            el.setAttribute('role', 'progressbar');
            el.setAttribute('aria-valuemin', '0');
            el.setAttribute('aria-valuemax', '100');
        }

        // Tabellen
        if (el.tagName === 'TABLE' && !el.getAttribute('role')) {
            el.setAttribute('role', 'table');
        }

        // Navigations-Elemente
        if (el.classList.contains('nav') || el.classList.contains('sidebar')) {
            if (!el.getAttribute('role')) {
                el.setAttribute('role', 'navigation');
            }
        }

        // Modals
        if (el.classList.contains('modal')) {
            el.setAttribute('role', 'dialog');
            el.setAttribute('aria-modal', 'true');
        }

        // Tabs
        if (el.classList.contains('tabs')) {
            el.setAttribute('role', 'tablist');
        }
        if (el.classList.contains('tab')) {
            el.setAttribute('role', 'tab');
        }
        if (el.classList.contains('tab-content')) {
            el.setAttribute('role', 'tabpanel');
        }

        // Alerts/Notifications
        if (el.classList.contains('toast') || el.classList.contains('alert') || el.classList.contains('notification')) {
            el.setAttribute('role', 'alert');
        }

        // Filter-Chips als Toggle-Buttons
        if (el.classList.contains('filter-chip')) {
            el.setAttribute('role', 'button');
            el.setAttribute('aria-pressed', el.classList.contains('active') ? 'true' : 'false');
        }

        el.dataset.a11yEnhanced = 'true';
    }

    guessLabelFromClass(className) {
        const labelMap = {
            'close': 'Schliessen',
            'search': 'Suchen',
            'menu': 'Menue',
            'nav': 'Navigation',
            'settings': 'Einstellungen',
            'edit': 'Bearbeiten',
            'delete': 'Loeschen',
            'add': 'Hinzufuegen',
            'remove': 'Entfernen',
            'save': 'Speichern',
            'cancel': 'Abbrechen',
            'back': 'Zurueck',
            'next': 'Weiter',
            'prev': 'Zurueck',
            'help': 'Hilfe',
            'info': 'Information',
            'expand': 'Erweitern',
            'collapse': 'Einklappen',
            'theme': 'Design wechseln',
            'dark': 'Dunkelmodus',
            'light': 'Hellmodus'
        };

        const classes = className.toLowerCase().split(/\s+/);
        for (const cls of classes) {
            for (const [key, label] of Object.entries(labelMap)) {
                if (cls.includes(key)) return label;
            }
        }
        return null;
    }

    // Skip-Links erstellen
    createSkipLinks() {
        const skipNav = document.createElement('a');
        skipNav.href = '#main-content';
        skipNav.className = 'skip-link';
        skipNav.textContent = 'Zum Hauptinhalt springen';
        document.body.insertBefore(skipNav, document.body.firstChild);

        // Main-Content ID setzen falls noetig
        const app = document.getElementById('app');
        if (app && !document.getElementById('main-content')) {
            app.id = 'main-content';
        }
    }

    // Fokus-Trap fuer Modals
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const modal = document.querySelector('.modal.active, .modal.show, [role="dialog"][aria-modal="true"]:not([hidden])');
            if (!modal) return;

            const focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // Fokus-Sichtbarkeit nur bei Tastatur
    setupFocusVisibility() {
        let isUsingKeyboard = false;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-nav');
        });
    }

    // Hohen Kontrast erkennen
    checkContrastMode() {
        if (window.matchMedia) {
            const highContrast = window.matchMedia('(prefers-contrast: more)');
            if (highContrast.matches) {
                document.body.classList.add('high-contrast');
            }

            highContrast.addEventListener('change', (e) => {
                document.body.classList.toggle('high-contrast', e.matches);
            });
        }
    }

    // Fokus auf Element setzen
    focusElement(selector) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (el) {
            el.focus();
            // Fuer Screen Reader ankuendigen
            if (el.getAttribute('aria-label')) {
                this.announce(el.getAttribute('aria-label'));
            }
        }
    }

    // Fokus in Container verwalten
    trapFocus(container) {
        const focusable = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length > 0) {
            focusable[0].focus();
        }

        container.dataset.focusTrap = 'true';
    }

    releaseFocus(container) {
        delete container.dataset.focusTrap;
    }

    // Seitenbereich ankuendigen
    announceRegion(regionName) {
        this.announce('Bereich: ' + regionName);
    }

    // Ladezustand ankuendigen
    announceLoading(isLoading, context = '') {
        if (isLoading) {
            this.announce(context ? context + ' wird geladen' : 'Wird geladen');
        } else {
            this.announce(context ? context + ' geladen' : 'Geladen');
        }
    }

    // Fehler ankuendigen
    announceError(message) {
        this.announce(message, 'assertive');
    }

    // Erfolg ankuendigen
    announceSuccess(message) {
        this.announce(message);
    }

    // Aenderung ankuendigen
    announceChange(message) {
        this.announce(message);
    }

    // Hilfstext fuer ein Element hinzufuegen
    addDescription(element, text) {
        const descId = 'desc_' + Math.random().toString(36).substr(2, 9);

        const desc = document.createElement('span');
        desc.id = descId;
        desc.className = 'sr-only';
        desc.textContent = text;

        element.appendChild(desc);
        element.setAttribute('aria-describedby', descId);

        return descId;
    }

    // Label fuer ein Element setzen
    setLabel(element, label) {
        element.setAttribute('aria-label', label);
    }

    // Element als expanded/collapsed markieren
    setExpanded(element, isExpanded) {
        element.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }

    // Element als selected markieren
    setSelected(element, isSelected) {
        element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    }

    // Element als pressed markieren (Toggle)
    setPressed(element, isPressed) {
        element.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
    }

    // Element als busy markieren
    setBusy(element, isBusy) {
        element.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    }

    // Progress-Wert setzen
    setProgress(element, value, max = 100) {
        element.setAttribute('aria-valuenow', value);
        element.setAttribute('aria-valuemax', max);
        element.setAttribute('aria-valuetext', Math.round((value / max) * 100) + '% abgeschlossen');
    }
}

// Globale Instanz
const a11yService = new AccessibilityService();
