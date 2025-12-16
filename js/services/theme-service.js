// ORCA 2.0 - Theme Service
// Light/Dark Mode Management

class ThemeService {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Load saved preference or use system preference
        const saved = localStorage.getItem('orca_theme');
        if (saved) {
            this.currentTheme = saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
        }

        // Apply theme
        this.applyTheme();

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('orca_theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.classList.toggle('dark-mode', this.currentTheme === 'dark');

        // Update meta theme-color for mobile browsers
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = this.currentTheme === 'dark' ? '#1a1a2e' : '#2c4a8c';

        // Update SVG icons in header button
        this.updateIcons();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('orca_theme', this.currentTheme);
        this.applyTheme();

        // Announce change for accessibility
        if (typeof a11yService !== 'undefined') {
            a11yService.announce(this.currentTheme === 'dark' ? 'Dunkelmodus aktiviert' : 'Hellmodus aktiviert');
        }
    }

    updateIcons() {
        // Update the header button icons
        const sunIcon = document.querySelector('.header-action-btn .icon-sun');
        const moonIcon = document.querySelector('.header-action-btn .icon-moon');

        if (sunIcon && moonIcon) {
            if (this.currentTheme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            localStorage.setItem('orca_theme', this.currentTheme);
            this.applyTheme();
        }
    }

    getTheme() {
        return this.currentTheme;
    }

    isDark() {
        return this.currentTheme === 'dark';
    }
}

// Globale Instanz
const themeService = new ThemeService();
