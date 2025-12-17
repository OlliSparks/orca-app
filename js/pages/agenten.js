// ORCA 2.0 - Agenten Übersicht
class AgentenPage {
    constructor() {
        this.agents = [
            {
                id: 'allgemein',
                name: 'Allgemein-Agent',
                icon: '🤖',
                description: 'Freier KI-Assistent mit ORCA-Kontext. Nur Glossar und Skills als Wissensbasis.',
                features: ['ORCA-Glossar', 'Skills-Suche', 'Prozess-Navigation'],
                status: 'active',
                route: '/agent-allgemein',
                internal: true
            },
            {
                id: 'inventur',
                name: 'Inventur-Agent',
                icon: '🤖',
                description: 'Importieren Sie Ihre Werkzeugdaten aus beliebigen Quellen. Der Agent analysiert und ordnet sie automatisch Ihren offenen Inventuren zu.',
                features: ['Excel/CSV Import', 'Screenshot-Analyse', 'API-Anbindung', 'Automatisches Matching'],
                status: 'active',
                route: '/agent-inventur'
            },
            {
                id: 'abl',
                name: 'ABL-Agent',
                icon: '📦',
                description: 'Erstellen Sie Abnahmebereitschaftserklärungen Schritt für Schritt. Der Agent führt Sie durch den Prozess und erstellt die ABL automatisch.',
                features: ['Foto-Upload', 'Standort-Erkennung', 'Schritt-für-Schritt Dialog', 'Automatische ABL-Erstellung'],
                status: 'active',
                route: '/agent-abl'
            },
            {
                id: 'reporting',
                name: 'Reporting-Agent',
                icon: '📊',
                description: 'Laden Sie Reports aus dem ORCA-System und exportieren Sie diese in verschiedenen Formaten (PDF, Excel, CSV).',
                features: ['Fertigungsmittel-Report', 'Inventur-Reports', 'PDF/Excel Export', 'Custom-Auswertungen'],
                status: 'active',
                route: '/agent-reporting'
            },
            {
                id: 'verlagerung-beantragen',
                name: 'Verlagerung beantragen',
                icon: '🚚',
                description: 'Erstellen Sie Verlagerungsanträge Schritt für Schritt. Erfassen Sie Werkzeuge, Maße, Zolltarifnummern und Zielstandorte.',
                features: ['Werkzeug-Auswahl', 'Maße & Gewicht', 'Zolltarifnummer', 'Quell-/Ziel-Standort'],
                status: 'active',
                route: '/agent-verlagerung-beantragen'
            },
            {
                id: 'verlagerung-durchführen',
                name: 'Verlagerung durchführen',
                icon: '📦',
                description: 'Führen Sie genehmigte Verlagerungen durch. Dokumentieren Sie Versand, Transport, Zolldokumente und Empfangsbestätigung.',
                features: ['Versand-Dokumentation', 'Spedition & Tracking', 'Zolldokumente', 'Empfangsbestätigung'],
                status: 'active',
                route: '/agent-verlagerung-durchführen'
            },
            {
                id: 'vpw',
                name: 'VPW-Agent',
                icon: '🔄',
                description: 'Führen Sie Vertragspartnerwechsel durch. Der Agent unterstützt Sie bei der Dokumentation und Übergabe.',
                features: ['Partnerwahl', 'Übergabe-Protokoll', 'Foto-Dokumentation', 'Workflow-Integration'],
                status: 'coming-soon',
                route: '/agent-vpw'
            },
            {
                id: 'verschrottung',
                name: 'Verschrottungs-Agent',
                icon: '♻️',
                description: 'Erfassen Sie Verschrottungsanträge schnell und einfach. Der Agent führt Sie durch den Prozess und dokumentiert alles automatisch.',
                features: ['Foto-Dokumentation', 'Schritt-für-Schritt Dialog', 'Automatische Antragserstellung'],
                status: 'coming-soon',
                route: '/agent-verschrottung'
            },
            {
                id: 'inventurplanung',
                name: 'Inventurplanungs-Agent',
                icon: '📅',
                description: 'Was weißt du schon? Erledige am Rechner, was geht - plane den Rest als Tour.',
                features: ['Daten-Import', 'Sofort bestätigen', 'Tour planen'],
                status: 'active',
                route: '/agent-inventurplanung'
            },
            {
                id: 'api-setup',
                name: 'Integrations-Assistent',
                icon: '🔗',
                description: 'Verbinden Sie Ihre Werkzeugdaten mit ORCA. Wählen Sie aus 3 einfachen Wegen – vom manuellen Upload bis zur automatischen Synchronisation.',
                features: ['3 Integrationswege', 'Kein IT-Aufwand nötig', 'Stammdaten-Sync', 'Auto-Export'],
                status: 'active',
                route: '/agent-api-setup'
            },
            {
                id: 'api-monitor',
                name: 'API-Monitor',
                icon: '📡',
                description: 'Übersicht aller angebundenen Lieferanten-Systeme. Status, Aktivitäten und Statistiken.',
                features: ['Verbindungsstatus', 'Aktivitätslog', 'Antwort-Statistiken', 'Fehlerüberwachung'],
                status: 'active',
                route: '/agent-api-monitor',
                internal: true
            },
            {
                id: 'berechtigungen',
                name: 'Berechtigungs-Agent',
                icon: '🔐',
                description: 'Verwalten Sie Rollen und Zugriffsrechte. Bearbeiten Sie die Berechtigungsmatrix und prüfen Sie Zugriffsrechte.',
                features: ['Matrix-Editor', 'Rollen-Prüfung', 'Export/Import', 'Zugriffsanalyse'],
                status: 'active',
                route: '/agent-berechtigungen',
                internal: true
            },
            {
                id: 'bugs',
                name: 'Bug-Agent',
                icon: '🐛',
                description: 'Melden und verfolgen Sie Bugs. Strukturierte Erfassung mit Screenshots, Prioritäten und Status-Tracking.',
                features: ['Bug-Erfassung', 'Screenshot-Upload', 'Prioritäten', 'Claude-Export'],
                status: 'active',
                route: '/agent-bugs',
                internal: true
            },
            {
                id: 'skills',
                name: 'Skill-Agent',
                icon: '🎯',
                description: 'Erstellen und bearbeiten Sie Claude Code Skills. Verwalten Sie Kategorien und exportieren Sie Skills als Markdown.',
                features: ['Skills erstellen', 'Kategorien verwalten', 'Import/Export', 'Diff-Vorschau'],
                status: 'active',
                route: '/agent-skills',
                internal: true
            },
            {
                id: 'backlog',
                name: 'Backlog-Agent',
                icon: '📋',
                description: 'Sammeln Sie Feature-Requests und Verbesserungsideen. Kanban-Board mit Story Points und Kategorien.',
                features: ['Kanban-Board', 'Story Points', 'Kategorien', 'Export'],
                status: 'active',
                route: '/agent-backlog',
                internal: true
            }
        ];
    }

    // Lieferanten-Agenten (alle außer interne)
    getSupplierAgents() {
        return this.agents
            .filter(a => !a.internal)
            .sort((a, b) => {
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return 0;
            });
    }

    // Interne Agenten (mit internal: true Flag)
    getInternalAgents() {
        return this.agents.filter(a => a.internal === true);
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Agenten';
        document.getElementById('headerSubtitle').textContent = 'KI-gestützte Assistenten für Ihre Prozesse';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        const supplierAgents = this.getSupplierAgents();
        // Interne Agenten nur für Support anzeigen
        const showInternalAgents = typeof permissionService !== 'undefined' && permissionService.getCurrentRole() === 'SUP';
        const internalAgents = showInternalAgents ? this.getInternalAgents() : [];

        app.innerHTML = `
            <div class="container agenten-page">
                <div class="page-intro">
                    <h2>Willkommen bei den ORCA-Agenten</h2>
                    <p>Unsere KI-Agenten helfen Ihnen, Ihre Daten effizient zu verarbeiten und mit dem System zu verbinden.
                       Wählen Sie einen Agenten, um zu starten.</p>
                </div>

                <div class="agents-info">
                    <div class="info-card">
                        <div class="info-icon">💡</div>
                        <div class="info-content">
                            <h4>Wie funktionieren die Agenten?</h4>
                            <p>Die Agenten nutzen KI, um Ihre Daten zu verstehen und intelligent mit dem ORCA-System zu verknüpfen.
                               Sie können Daten in verschiedenen Formaten hochladen - der Agent kümmert sich um den Rest.</p>
                        </div>
                    </div>
                </div>

                <div class="agents-section">
                    <div class="section-header">
                        <h3>🏭 Lieferanten-Agenten</h3>
                        <p>Assistenten für Ihre täglichen Aufgaben</p>
                    </div>
                    <div class="agents-grid">
                        ${supplierAgents.map(agent => this.renderAgentCard(agent)).join('')}
                    </div>
                </div>

                ${internalAgents.length > 0 ? `
                <div class="agents-section internal-section">
                    <div class="section-header">
                        <h3>🔧 Interne Agenten</h3>
                        <p>Werkzeuge für Administration und Monitoring</p>
                    </div>
                    <div class="agents-grid">
                        ${internalAgents.map(agent => this.renderAgentCard(agent)).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        this.attachEventListeners();
        this.addStyles();
    }

    renderAgentCard(agent) {
        const isActive = agent.status === 'active';
        const statusBadge = isActive
            ? '<span class="agent-badge active">Verfügbar</span>'
            : '<span class="agent-badge coming-soon">Demnächst</span>';

        return `
            <div class="agent-card ${isActive ? 'active' : 'disabled'}" data-agent-id="${agent.id}">
                <div class="agent-header">
                    <div class="agent-icon">${agent.icon}</div>
                    ${statusBadge}
                </div>
                <h3 class="agent-name">${agent.name}</h3>
                <p class="agent-description">${agent.description}</p>
                <div class="agent-features">
                    ${agent.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
                ${isActive
                    ? `<button class="agent-btn primary" data-route="${agent.route}">Agent starten →</button>`
                    : `<button class="agent-btn disabled" disabled>Bald verfügbar</button>`
                }
            </div>
        `;
    }

    attachEventListeners() {
        // Agent cards click
        document.querySelectorAll('.agent-card.active').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('agent-btn')) return;
                const route = card.querySelector('.agent-btn')?.dataset.route;
                if (route) router.navigate(route);
            });
        });

        // Agent buttons
        document.querySelectorAll('.agent-btn.primary').forEach(btn => {
            btn.addEventListener('click', () => {
                const route = btn.dataset.route;
                if (route) router.navigate(route);
            });
        });
    }

    addStyles() {
        if (document.getElementById('agenten-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agenten-styles';
        styles.textContent = `
            .agenten-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }

            .page-intro {
                text-align: center;
                margin-bottom: 3rem;
            }

            .page-intro h2 {
                font-size: 1.75rem;
                color: #1f2937;
                margin-bottom: 0.75rem;
            }

            .page-intro p {
                color: #6b7280;
                max-width: 600px;
                margin: 0 auto;
                line-height: 1.6;
            }

            .agents-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .agent-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                border: 2px solid #e5e7eb;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .agent-card.active:hover {
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                transform: translateY(-2px);
            }

            .agent-card.disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .agent-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .agent-icon {
                font-size: 2.5rem;
                line-height: 1;
            }

            .agent-badge {
                font-size: 0.75rem;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-weight: 500;
            }

            .agent-badge.active {
                background: #dcfce7;
                color: #166534;
            }

            .agent-badge.coming-soon {
                background: #fef3c7;
                color: #92400e;
            }

            .agent-name {
                font-size: 1.25rem;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .agent-description {
                color: #6b7280;
                font-size: 0.9rem;
                line-height: 1.5;
                margin-bottom: 1rem;
            }

            .agent-features {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .feature-tag {
                background: #f3f4f6;
                color: #4b5563;
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }

            .agent-btn {
                width: 100%;
                padding: 0.75rem;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .agent-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .agent-btn.primary:hover {
                background: #2563eb;
            }

            .agent-btn.disabled {
                background: #e5e7eb;
                color: #9ca3af;
                cursor: not-allowed;
            }

            .agents-info {
                margin-bottom: 2rem;
            }

            .agents-section {
                margin-bottom: 3rem;
            }

            .section-header {
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e5e7eb;
            }

            .section-header h3 {
                font-size: 1.25rem;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .section-header p {
                color: #6b7280;
                font-size: 0.9rem;
                margin: 0;
            }

            .internal-section {
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px dashed #d1d5db;
            }

            .internal-section .section-header {
                border-bottom-color: #fbbf24;
            }

            .internal-section .agent-card.active:hover {
                border-color: #f59e0b;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
            }

            .info-card {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                gap: 1rem;
                align-items: flex-start;
            }

            .info-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .info-content h4 {
                color: #0369a1;
                margin-bottom: 0.5rem;
            }

            .info-content p {
                color: #0c4a6e;
                font-size: 0.9rem;
                line-height: 1.5;
                margin: 0;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentenPage = new AgentenPage();
