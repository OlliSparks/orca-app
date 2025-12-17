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

        // Initialize role dropdown
        this.initRoleDropdown();

        // Initialize onboarding (tooltips, first-visit check)
        this.initOnboarding();

        // Check for new messages after a short delay
        setTimeout(() => this.checkNewMessages(), 1000);

        console.log('ORCA 2.0 App initialized');
    }

    initRoleDropdown() {
        const dropdown = document.getElementById('roleDropdown');
        if (dropdown && typeof permissionService !== 'undefined') {
            const currentRole = permissionService.getCurrentRole();
            dropdown.value = currentRole;
            
            // Update dropdown appearance based on role category
            const roleInfo = permissionService.getRoleInfo(currentRole);
            if (roleInfo) {
                dropdown.style.borderColor = roleInfo.color;
            }
        }
    }

    initOnboarding() {
        // Show first visit modal if this is user's first visit
        if (onboardingService.isFirstVisit()) {
            // Small delay to ensure page is fully rendered
            setTimeout(() => {
                onboardingService.showFirstVisitModal();
            }, 500);
        }

        // Initialize tooltips
        onboardingService.initTooltips();
    }

    async checkNewMessages() {
        try {
            // Sync messages with processes
            await messageService.syncWithProcesses();

            // Get new messages since last check
            const newMessages = messageService.getNewMessagesSinceLastCheck();

            // Popup deaktiviert - stört die Benutzer
            // if (newMessages.length > 0) {
            //     MessagesPage.showNewMessagesPopup(newMessages);
            // }
            messageService.updateLastSync();
        } catch (error) {
            console.error('Error checking new messages:', error);
        }
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

        // Nachrichten
        router.addRoute('/messages', () => {
            messagesPage.render();
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

        // Berechtigungs-Agent (Intern)
        router.addRoute('/agent-berechtigungen', () => {
            agentBerechtigungenPage.render();
        });

        // Bug-Agent (Intern)
        router.addRoute('/agent-bugs', () => {
            agentBugsPage.render();
        });

        // Backlog-Agent (Intern)
        router.addRoute('/agent-skills', () => {
            agentSkillsPage.render();
        });

        router.addRoute('/agent-backlog', () => {
            agentBacklogPage.render();
        });

        // Verlagerung beantragen Agent
        router.addRoute('/agent-verlagerung-beantragen', () => {
            agentVerlagerungBeantragenPage.render();
        });

        // Verlagerung durchführen Agent
        router.addRoute('/agent-verlagerung-durchfuehren', () => {
            agentVerlagerungDurchfuehrenPage.render();
        });

        // Glossar & Hilfe
        router.addRoute('/glossar', () => {
            glossarPage.render();
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
