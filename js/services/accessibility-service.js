// ORCA 2.0 - Accessibility Service
// ARIA-Labels, Screen Reader Support, Fokus-Management

class AccessibilityService {
    constructor() {
        this.announcements = [];
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            // Live-Region für Ankündigungen erstellen
            this.createLiveRegion();

            // ARIA-Labels automatisch hinzufügen
            this.setupAutoARIA();

            // Skip-Links für Tastatur-Navigation
            this.createSkipLinks();

            // Fokus-Trap für Modals
            this.setupFocusTrap();

            // Fokus-Sichtbarkeit verbessern
            this.setupFocusVisibility();

            // Kontrast-Modus erkennen
            this.checkContrastMode();
        } catch (e) {
            console.warn('[A11y] Init error:', e);
        }
    }

    // Live-Region für Screen Reader Ankündigungen
    createLiveRegion() {
        if (!document.body) return;

        const region = document.createElement('div');
        region.id = 'a11y-live-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);

        // Assertive Region für wichtige Meldungen
        const assertive = document.createElement('div');
        assertive.id = 'a11y-live-assertive';
        assertive.setAttribute('role', 'alert');
        assertive.setAttribute('aria-live', 'assertive');
        assertive.setAttribute('aria-atomic', 'true');
        assertive.className = 'sr-only';
        document.body.appendChild(assertive);
    }

    // Screen Reader Ankündigung
    announce(message, priority = 'polite') {
        const region = document.getElementById(priority === 'assertive' ? 'a11y-live-assertive' : 'a11y-live-region');
        if (!region) return;

        // Kurz leeren dann neu setzen (für wiederholte Meldungen)
        region.textContent = '';
        setTimeout(() => {
            region.textContent = message;
        }, 50);
    }

    // ARIA-Labels automatisch setzen
    setupAutoARIA() {
        if (!document.body) return;

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

        try {
            // Buttons ohne Text
            if (el.tagName === 'BUTTON' && !el.textContent.trim() && !el.getAttribute('aria-label')) {
                const label = el.title || this.guessLabelFromClass(el.className);
                if (label) {
                    el.setAttribute('aria-label', label);
                }
            }

            // Links ohne Text
            if (el.tagName === 'A' && !el.textContent.trim() && !el.getAttribute('aria-label')) {
                const label = el.title || this.guessLabelFromClass(el.className);
                if (label) {
                    el.setAttribute('aria-label', label);
                }
            }

            // Filter-Chips als Toggle-Buttons
            if (el.classList && el.classList.contains('filter-chip')) {
                el.setAttribute('role', 'button');
                el.setAttribute('aria-pressed', el.classList.contains('active') ? 'true' : 'false');
            }

            el.dataset.a11yEnhanced = 'true';
        } catch (e) {
            // Ignore errors on individual elements
        }
    }

    guessLabelFromClass(className) {
        if (!className) return null;
        const labelMap = {
            'close': 'Schließen',
            'search': 'Suchen',
            'menu': 'Menü',
            'settings': 'Einstellungen',
            'edit': 'Bearbeiten',
            'delete': 'Löschen',
            'add': 'Hinzufügen',
            'save': 'Speichern',
            'cancel': 'Abbrechen',
            'back': 'Zurück',
            'next': 'Weiter',
            'help': 'Hilfe',
            'theme': 'Design wechseln'
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
        if (!document.body) return;

        const skipNav = document.createElement('a');
        skipNav.href = '#main-content';
        skipNav.className = 'skip-link';
        skipNav.textContent = 'Zum Hauptinhalt springen';
        document.body.insertBefore(skipNav, document.body.firstChild);

        // Main-Content ID setzen falls nötig
        const app = document.getElementById('app');
        if (app && !document.getElementById('main-content')) {
            app.id = 'main-content';
        }
    }

    // Fokus-Trap für Modals
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
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
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
        }
    }
}

// Globale Instanz
const a11yService = new AccessibilityService();
