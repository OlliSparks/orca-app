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

        // Create theme toggle button
        this.createToggleButton();
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
        metaTheme.content = this.currentTheme === 'dark' ? '#1a1a2e' : '#ffffff';

        // Update toggle button
        this.updateToggleButton();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('orca_theme', this.currentTheme);
        this.applyTheme();

        // Announce change
        if (typeof keyboardService !== 'undefined' && keyboardService.announce) {
            keyboardService.announce(`${this.currentTheme === 'dark' ? 'Dunkelmodus' : 'Hellmodus'} aktiviert`);
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

    createToggleButton() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.insertToggleButton());
        } else {
            this.insertToggleButton();
        }
    }

    insertToggleButton() {
        // Find header-stats or header for insertion
        const headerStats = document.getElementById('headerStats');
        if (!headerStats) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.title = 'Dunkelmodus umschalten';
        toggleBtn.onclick = () => this.toggle();
        toggleBtn.innerHTML = `
            <span class="theme-icon-light">☀️</span>
            <span class="theme-icon-dark">🌙</span>
        `;

        // Insert before header stats
        headerStats.parentNode.insertBefore(toggleBtn, headerStats);
        this.updateToggleButton();
    }

    updateToggleButton() {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.classList.toggle('dark-active', this.currentTheme === 'dark');
            btn.title = this.currentTheme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren';
        }
    }
}

// Globale Instanz
const themeService = new ThemeService();
