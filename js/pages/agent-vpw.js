// ORCA 2.0 - VPW-Agent (Vertragspartnerwechsel) (Platzhalter)
class AgentVPWPage {
    constructor() {
        this.isComingSoon = true;
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - VPW-Agent';
        document.getElementById('headerSubtitle').textContent = 'Vertragspartnerwechsel durchführen';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container agent-placeholder-page">
                <div class="placeholder-content">
                    <div class="placeholder-icon">🔄</div>
                    <h1>VPW-Agent</h1>
                    <p class="placeholder-subtitle">Dieser Agent befindet sich in Entwicklung</p>

                    <div class="feature-preview">
                        <h3>Geplante Funktionen</h3>
                        <div class="feature-list">
                            <div class="feature-item">
                                <span class="feature-icon">🏢</span>
                                <div class="feature-text">
                                    <strong>Partnerwahl</strong>
                                    <p>Neuen Vertragspartner auswählen und zuordnen</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📋</span>
                                <div class="feature-text">
                                    <strong>Übergabe-Protokoll</strong>
                                    <p>Dokumentation des Werkzeugzustands bei Übergabe</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📸</span>
                                <div class="feature-text">
                                    <strong>Foto-Dokumentation</strong>
                                    <p>Werkzeug-Zustand fotografisch festhalten</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">✅</span>
                                <div class="feature-text">
                                    <strong>Workflow-Integration</strong>
                                    <p>Nahtlose Integration in den VPW-Prozess</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button class="back-btn" onclick="router.navigate('/agenten')">
                        ← Zurück zur Agenten-Übersicht
                    </button>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        // Reuse styles from agent-verschrottung if already loaded
        if (document.getElementById('agent-placeholder-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-placeholder-styles';
        styles.textContent = `
            .agent-placeholder-page {
                min-height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }

            .placeholder-content {
                text-align: center;
                max-width: 600px;
            }

            .placeholder-icon {
                font-size: 5rem;
                margin-bottom: 1rem;
            }

            .placeholder-content h1 {
                font-size: 2rem;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .placeholder-subtitle {
                font-size: 1.1rem;
                color: #6b7280;
                margin-bottom: 2rem;
            }

            .feature-preview {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                text-align: left;
            }

            .feature-preview h3 {
                font-size: 1rem;
                color: #374151;
                margin-bottom: 1rem;
                text-align: center;
            }

            .feature-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .feature-item {
                display: flex;
                gap: 1rem;
                align-items: flex-start;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
            }

            .feature-item .feature-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .feature-text strong {
                display: block;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .feature-text p {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0;
            }

            .back-btn {
                padding: 0.75rem 1.5rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: background 0.2s;
            }

            .back-btn:hover {
                background: #2563eb;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentVPWPage = new AgentVPWPage();
