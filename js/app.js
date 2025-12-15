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

        // ABL Detail (mit dynamischer ID)
        router.addRoute('/abl-detail/:id', (params) => {
            const id = params.id;
            ablDetailPage.render(id);
        });

        // Verlagerung
        router.addRoute('/verlagerung', () => {
            verlagerungPage.render();
        });

        // Verlagerung Detail (mit dynamischer ID)
        router.addRoute('/verlagerung/:id', (params) => {
            const id = params.id;
            verlagerungDetailPage.render(id);
        });

        // Vertragspartnerwechsel
        router.addRoute('/partnerwechsel', () => {
            partnerwechselPage.render();
        });

        // Vertragspartnerwechsel Detail (mit dynamischer ID)
        router.addRoute('/partnerwechsel/:id', (params) => {
            const id = params.id;
            partnerwechselDetailPage.render(id);
        });

        // Verschrottung
        router.addRoute('/verschrottung', () => {
            verschrottungPage.render();
        });

        // Verschrottung Detail (mit dynamischer ID)
        router.addRoute('/verschrottung-detail/:id', (params) => {
            const id = params.id;
            verschrottungDetailPage.render(id);
        });

        // Einstellungen
        router.addRoute('/settings', () => {
            settingsPage.render();
        });

        router.addRoute('/unternehmen', () => {
            unternehmenPage.render();
        });

        // KPI Dashboard
        router.addRoute('/kpi', () => {
            kpiPage.render();
        });

        // Agenten Übersicht
        router.addRoute('/agenten', () => {
            agentenPage.render();
        });

        // Inventur-Agent
        router.addRoute('/agent-inventur', () => {
            agentInventurPage.render();
        });

        // ABL-Agent
        router.addRoute('/agent-abl', () => {
            agentABLPage.render();
        });

        // Reporting-Agent
        router.addRoute('/agent-reporting', () => {
            agentReportingPage.render();
        });

        // Verschrottungs-Agent (Platzhalter)
        router.addRoute('/agent-verschrottung', () => {
            agentVerschrottungPage.render();
        });

        // Inventurplanungs-Agent (Platzhalter)
        router.addRoute('/agent-inventurplanung', () => {
            agentInventurplanungPage.render();
        });

        // Verlagerungs-Agent (Platzhalter)
        router.addRoute('/agent-verlagerung', () => {
            agentVerlagerungPage.render();
        });

        // VPW-Agent (Platzhalter)
        router.addRoute('/agent-vpw', () => {
            agentVPWPage.render();
        });

        // API-Setup-Agent (Lieferanten-Anbindung)
        router.addRoute('/agent-api-setup', () => {
            agentAPISetupPage.render();
        });

        // API-Monitor-Agent (Admin-Übersicht)
        router.addRoute('/agent-api-monitor', () => {
            agentAPIMonitorPage.render();
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
                // Im Mock-Modus: Hinweis anzeigen mit Quelle
                statusElement.style.display = '';

                // Prüfe ob importierte Mock-Daten vorhanden sind
                let mockInfo = '⚠️ Mock-Daten aktiv';
                if (typeof api !== 'undefined' && api.mockDataInfo) {
                    const count = api.mockDataInfo.count || 0;
                    const source = api.mockDataInfo.source || 'Import';
                    mockInfo = `📊 Mock-Daten (${count} Assets aus ${source})`;
                }

                statusElement.innerHTML = mockInfo;
                statusElement.style.color = '#f97316';
                statusElement.style.background = '#fef3c7';
                statusElement.style.padding = '0.25rem 0.5rem';
                statusElement.style.borderRadius = '4px';
                statusElement.style.fontSize = '0.75rem';
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
