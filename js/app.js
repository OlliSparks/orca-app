// ORCA 2.0 - Main Application
class OrcaApp {
    constructor() {
        this.init();
    }

    init() {
        // Register routes
        this.registerRoutes();

        // Check API connection
        this.checkAPIStatus();

        // Start the router
        router.handleRouteChange();

        console.log('ORCA 2.0 App initialized');
    }

    registerRoutes() {
        // Dashboard (Homepage - wird als Startseite angezeigt)
        router.addRoute('/', () => {
            dashboardPage.render();
        });

        router.addRoute('/dashboard', () => {
            dashboardPage.render();
        });

        // Werkzeugübersicht
        router.addRoute('/tools', () => {
            fmListPage.render();
        });

        // FM-Akte Suche
        router.addRoute('/fm-akte', () => {
            fmSearchPage.render();
        });

        // Werkzeugakte Detail (mit dynamischer ID)
        router.addRoute('/detail/:id', (params) => {
            const id = params.id || 1;
            fmDetailPage.render(id);
        });

        // Inventur
        router.addRoute('/inventur', () => {
            inventurPage.render();
        });

        // Planung
        router.addRoute('/planung', () => {
            planungPage.render();
        });

        // ABL (Abnahmebereitschaft)
        router.addRoute('/abl', () => {
            ablPage.render();
        });

        // Verlagerung
        router.addRoute('/verlagerung', () => {
            verlagerungPage.render();
        });

        // Vertragspartnerwechsel
        router.addRoute('/partnerwechsel', () => {
            partnerwechselPage.render();
        });

        // Verschrottung
        router.addRoute('/verschrottung', () => {
            verschrottungPage.render();
        });

        // Einstellungen
        router.addRoute('/settings', () => {
            settingsPage.render();
        });

        router.addRoute('/unternehmen', () => {
            unternehmenPage.render();
        });
    }

    async checkAPIStatus() {
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        const isLiveMode = config.mode === 'live';
        const statusElement = document.getElementById('apiStatus');

        if (statusElement) {
            if (isLiveMode) {
                // Im Live-Modus: Status ausblenden
                statusElement.style.display = 'none';
            } else {
                // Im Mock-Modus: Hinweis anzeigen
                statusElement.style.display = '';
                statusElement.innerHTML = '⚠️ Mock-Daten aktiv';
                statusElement.style.color = '#f97316';
            }
        }
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.orcaApp = new OrcaApp();
    });
} else {
    window.orcaApp = new OrcaApp();
}
