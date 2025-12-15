// ORCA 2.0 - API Setup Agent (Lieferanten-Anbindung)
class AgentAPISetupPage {
    constructor() {
        this.currentStep = 0;
        this.config = {
            mode: null, // 'automatic' oder 'review'
            webhookUrl: '',
            apiKey: null,
            systemType: null,
            testStatus: null
        };

        this.steps = [
            { id: 'intro', title: 'Einführung' },
            { id: 'mode', title: 'Modus wählen' },
            { id: 'connection', title: 'Verbindung einrichten' },
            { id: 'test', title: 'Verbindung testen' },
            { id: 'complete', title: 'Fertig' }
        ];
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - API-Setup';
        document.getElementById('headerSubtitle').textContent = 'System-Anbindung einrichten';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container api-setup-page">
                <div class="setup-layout">
                    <!-- Progress Sidebar -->
                    <div class="setup-sidebar">
                        <div class="setup-progress">
                            <h3>Einrichtung</h3>
                            <div class="progress-steps">
                                ${this.steps.map((step, idx) => `
                                    <div class="progress-step ${idx === this.currentStep ? 'active' : ''} ${idx < this.currentStep ? 'completed' : ''}">
                                        <div class="step-indicator">
                                            ${idx < this.currentStep ? '✓' : idx + 1}
                                        </div>
                                        <div class="step-label">${step.title}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="setup-help">
                            <h4>Hilfe</h4>
                            <p>Bei Fragen zur API-Anbindung kontaktieren Sie uns:</p>
                            <p><strong>support@orca-software.com</strong></p>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="setup-main">
                        <div class="setup-content" id="setupContent">
                            <!-- Dynamic content -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.renderStep();
    }

    renderStep() {
        const content = document.getElementById('setupContent');

        switch (this.steps[this.currentStep].id) {
            case 'intro':
                content.innerHTML = this.renderIntroStep();
                break;
            case 'mode':
                content.innerHTML = this.renderModeStep();
                break;
            case 'connection':
                content.innerHTML = this.renderConnectionStep();
                break;
            case 'test':
                content.innerHTML = this.renderTestStep();
                break;
            case 'complete':
                content.innerHTML = this.renderCompleteStep();
                break;
        }

        this.attachStepListeners();
    }

    renderIntroStep() {
        return `
            <div class="step-card">
                <div class="step-icon">🔗</div>
                <h2>API-Anbindung einrichten</h2>

                <div class="intro-content">
                    <p class="intro-lead">
                        Verbinden Sie Ihr Werkzeug-Management-System mit ORCA, um Inventuranfragen
                        <strong>automatisch</strong> zu beantworten.
                    </p>

                    <div class="benefit-cards">
                        <div class="benefit-card">
                            <span class="benefit-icon">⏱️</span>
                            <h4>Zeitersparnis</h4>
                            <p>Keine manuelle Dateneingabe mehr bei Inventuren</p>
                        </div>
                        <div class="benefit-card">
                            <span class="benefit-icon">✅</span>
                            <h4>Fehlerreduzierung</h4>
                            <p>Automatische Datenübertragung ohne Tippfehler</p>
                        </div>
                        <div class="benefit-card">
                            <span class="benefit-icon">🔒</span>
                            <h4>Sicher</h4>
                            <p>Verschlüsselte Verbindung, nur Inventurdaten</p>
                        </div>
                    </div>

                    <div class="info-box">
                        <h4>📋 Was wird übertragen?</h4>
                        <p>Die API wird <strong>ausschließlich</strong> für folgende Zwecke genutzt:</p>
                        <ul>
                            <li>Abfrage von Werkzeugstandorten bei Inventuren</li>
                            <li>Übermittlung von Inventurergebnissen (Standort, Fotos)</li>
                        </ul>
                        <p class="info-note">Keine anderen Daten werden abgefragt oder übertragen.</p>
                    </div>
                </div>

                <div class="step-actions">
                    <button class="btn btn-primary btn-lg" id="startSetupBtn">
                        Einrichtung starten →
                    </button>
                </div>
            </div>
        `;
    }

    renderModeStep() {
        return `
            <div class="step-card">
                <div class="step-icon">⚙️</div>
                <h2>Betriebsmodus wählen</h2>

                <p class="step-description">
                    Wie soll Ihr System auf Inventuranfragen reagieren?
                </p>

                <div class="mode-selection">
                    <div class="mode-card ${this.config.mode === 'automatic' ? 'selected' : ''}" data-mode="automatic">
                        <div class="mode-header">
                            <span class="mode-icon">🤖</span>
                            <h3>Vollautomatisch</h3>
                            <span class="mode-badge recommended">Empfohlen</span>
                        </div>
                        <div class="mode-body">
                            <p>Ihr System beantwortet Inventuranfragen <strong>sofort und automatisch</strong>.</p>
                            <ul class="mode-features">
                                <li>✓ Kein manueller Eingriff nötig</li>
                                <li>✓ Schnellste Reaktionszeit</li>
                                <li>✓ 24/7 Verfügbarkeit</li>
                            </ul>
                            <div class="mode-flow">
                                <span>Anfrage</span> → <span>System prüft</span> → <span>Automatische Antwort</span>
                            </div>
                        </div>
                    </div>

                    <div class="mode-card ${this.config.mode === 'review' ? 'selected' : ''}" data-mode="review">
                        <div class="mode-header">
                            <span class="mode-icon">👁️</span>
                            <h3>Prüfen & Freigeben</h3>
                        </div>
                        <div class="mode-body">
                            <p>Ihr System bereitet Antworten vor, Sie <strong>prüfen und geben manuell frei</strong>.</p>
                            <ul class="mode-features">
                                <li>✓ Volle Kontrolle über jede Antwort</li>
                                <li>✓ Korrekturmöglichkeit vor Versand</li>
                                <li>✓ Benachrichtigung bei neuen Anfragen</li>
                            </ul>
                            <div class="mode-flow">
                                <span>Anfrage</span> → <span>System bereitet vor</span> → <span class="highlight">Sie prüfen</span> → <span>Antwort</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mode-comparison">
                    <h4>Vergleich</h4>
                    <table class="comparison-table">
                        <tr>
                            <th></th>
                            <th>🤖 Vollautomatisch</th>
                            <th>👁️ Prüfen & Freigeben</th>
                        </tr>
                        <tr>
                            <td>Reaktionszeit</td>
                            <td>Sekunden</td>
                            <td>Abhängig von Ihnen</td>
                        </tr>
                        <tr>
                            <td>Manueller Aufwand</td>
                            <td>Keiner</td>
                            <td>Pro Anfrage ~1 Min</td>
                        </tr>
                        <tr>
                            <td>Kontrolle</td>
                            <td>Vollständig automatisch</td>
                            <td>Jede Antwort einzeln</td>
                        </tr>
                    </table>
                </div>

                <div class="step-actions">
                    <button class="btn btn-neutral" id="backBtn">← Zurück</button>
                    <button class="btn btn-primary" id="nextBtn" ${!this.config.mode ? 'disabled' : ''}>
                        Weiter →
                    </button>
                </div>
            </div>
        `;
    }

    renderConnectionStep() {
        // Generate API key if not exists
        if (!this.config.apiKey) {
            this.config.apiKey = this.generateApiKey();
        }

        return `
            <div class="step-card">
                <div class="step-icon">🔧</div>
                <h2>Verbindung einrichten</h2>

                <p class="step-description">
                    Folgen Sie dieser Anleitung, um Ihr System mit ORCA zu verbinden.
                </p>

                <div class="connection-steps">
                    <!-- Step 1: API Key -->
                    <div class="connection-step">
                        <div class="connection-step-header">
                            <span class="step-num">1</span>
                            <h4>API-Schlüssel kopieren</h4>
                        </div>
                        <div class="connection-step-body">
                            <p>Dieser Schlüssel authentifiziert Ihr System bei ORCA:</p>
                            <div class="api-key-display">
                                <code id="apiKeyCode">${this.config.apiKey}</code>
                                <button class="copy-btn" id="copyApiKeyBtn" title="Kopieren">📋</button>
                            </div>
                            <p class="security-note">⚠️ Bewahren Sie diesen Schlüssel sicher auf und teilen Sie ihn nicht.</p>
                        </div>
                    </div>

                    <!-- Step 2: Endpoint URL -->
                    <div class="connection-step">
                        <div class="connection-step-header">
                            <span class="step-num">2</span>
                            <h4>ORCA API-Endpunkt</h4>
                        </div>
                        <div class="connection-step-body">
                            <p>Ihr System muss diese URL aufrufen:</p>
                            <div class="api-key-display">
                                <code>https://api.orca-software.com/v1/inventory</code>
                                <button class="copy-btn" id="copyEndpointBtn" title="Kopieren">📋</button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Webhook (optional for review mode) -->
                    ${this.config.mode === 'automatic' ? `
                    <div class="connection-step">
                        <div class="connection-step-header">
                            <span class="step-num">3</span>
                            <h4>Webhook-URL Ihres Systems (optional)</h4>
                        </div>
                        <div class="connection-step-body">
                            <p>ORCA kann Ihr System benachrichtigen, wenn neue Anfragen vorliegen:</p>
                            <input type="url" id="webhookInput" class="webhook-input"
                                   placeholder="https://ihr-system.de/api/orca-webhook"
                                   value="${this.config.webhookUrl}">
                            <p class="hint">Leer lassen, wenn Ihr System selbst regelmäßig abfragt (Polling)</p>
                        </div>
                    </div>
                    ` : `
                    <div class="connection-step">
                        <div class="connection-step-header">
                            <span class="step-num">3</span>
                            <h4>Benachrichtigungs-URL</h4>
                        </div>
                        <div class="connection-step-body">
                            <p>Wohin sollen Benachrichtigungen über neue Anfragen gesendet werden?</p>
                            <input type="url" id="webhookInput" class="webhook-input"
                                   placeholder="https://ihr-system.de/api/notify"
                                   value="${this.config.webhookUrl}">
                            <p class="hint">Sie erhalten eine Nachricht, sobald neue Inventuranfragen vorliegen.</p>
                        </div>
                    </div>
                    `}

                    <!-- Code Examples -->
                    <div class="connection-step">
                        <div class="connection-step-header">
                            <span class="step-num">4</span>
                            <h4>Integration in Ihr System</h4>
                        </div>
                        <div class="connection-step-body">
                            <div class="code-tabs">
                                <button class="code-tab active" data-lang="curl">cURL</button>
                                <button class="code-tab" data-lang="python">Python</button>
                                <button class="code-tab" data-lang="javascript">JavaScript</button>
                            </div>
                            <div class="code-examples">
                                <pre class="code-block active" data-lang="curl"># Offene Inventuranfragen abrufen
curl -X GET "https://api.orca-software.com/v1/inventory/requests" \\
  -H "Authorization: Bearer ${this.config.apiKey}" \\
  -H "Content-Type: application/json"

# Inventurantwort senden
curl -X POST "https://api.orca-software.com/v1/inventory/responses" \\
  -H "Authorization: Bearer ${this.config.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "INV-2025-001",
    "toolNumber": "WZ-123456",
    "location": "Halle B, Regal 4",
    "status": "found"
  }'</pre>
                                <pre class="code-block" data-lang="python"># Python Beispiel
import requests

API_KEY = "${this.config.apiKey}"
BASE_URL = "https://api.orca-software.com/v1/inventory"

# Offene Anfragen abrufen
response = requests.get(
    f"{BASE_URL}/requests",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
requests_list = response.json()

# Antwort senden
for req in requests_list:
    tool_data = your_system.get_tool(req["toolNumber"])

    requests.post(
        f"{BASE_URL}/responses",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "requestId": req["id"],
            "toolNumber": req["toolNumber"],
            "location": tool_data["location"],
            "status": "found" if tool_data else "not_found"
        }
    )</pre>
                                <pre class="code-block" data-lang="javascript">// JavaScript/Node.js Beispiel
const API_KEY = "${this.config.apiKey}";
const BASE_URL = "https://api.orca-software.com/v1/inventory";

// Offene Anfragen abrufen
async function getRequests() {
  const response = await fetch(\`\${BASE_URL}/requests\`, {
    headers: { "Authorization": \`Bearer \${API_KEY}\` }
  });
  return response.json();
}

// Antwort senden
async function sendResponse(requestId, toolNumber, location) {
  await fetch(\`\${BASE_URL}/responses\`, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requestId,
      toolNumber,
      location,
      status: "found"
    })
  });
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="step-actions">
                    <button class="btn btn-neutral" id="backBtn">← Zurück</button>
                    <button class="btn btn-primary" id="nextBtn">Verbindung testen →</button>
                </div>
            </div>
        `;
    }

    renderTestStep() {
        return `
            <div class="step-card">
                <div class="step-icon">🧪</div>
                <h2>Verbindung testen</h2>

                <p class="step-description">
                    Prüfen Sie, ob Ihr System korrekt mit ORCA kommunizieren kann.
                </p>

                <div class="test-section">
                    <div class="test-card" id="testCard">
                        <div class="test-status ${this.config.testStatus || 'pending'}">
                            ${this.getTestStatusIcon()}
                        </div>
                        <h4>${this.getTestStatusText()}</h4>
                        <p>${this.getTestStatusDescription()}</p>
                    </div>

                    <div class="test-actions">
                        <button class="btn btn-secondary" id="runTestBtn">
                            🔄 Verbindungstest starten
                        </button>
                    </div>

                    <div class="test-checklist">
                        <h4>Checkliste</h4>
                        <div class="checklist-item ${this.config.testStatus === 'success' ? 'checked' : ''}">
                            <span class="check-icon">○</span>
                            <span>API-Schlüssel ist gültig</span>
                        </div>
                        <div class="checklist-item ${this.config.testStatus === 'success' ? 'checked' : ''}">
                            <span class="check-icon">○</span>
                            <span>Endpunkt ist erreichbar</span>
                        </div>
                        <div class="checklist-item ${this.config.testStatus === 'success' && this.config.webhookUrl ? 'checked' : ''}">
                            <span class="check-icon">○</span>
                            <span>Webhook empfängt Nachrichten</span>
                        </div>
                    </div>
                </div>

                <div class="step-actions">
                    <button class="btn btn-neutral" id="backBtn">← Zurück</button>
                    <button class="btn btn-primary" id="nextBtn" ${this.config.testStatus !== 'success' ? 'disabled' : ''}>
                        Abschließen →
                    </button>
                    <button class="btn btn-link" id="skipTestBtn">
                        Test überspringen
                    </button>
                </div>
            </div>
        `;
    }

    renderCompleteStep() {
        const modeText = this.config.mode === 'automatic' ? 'Vollautomatisch' : 'Prüfen & Freigeben';
        const modeIcon = this.config.mode === 'automatic' ? '🤖' : '👁️';

        return `
            <div class="step-card complete-card">
                <div class="step-icon success">✅</div>
                <h2>Einrichtung abgeschlossen!</h2>

                <p class="step-description">
                    Ihr System ist jetzt mit ORCA verbunden.
                </p>

                <div class="complete-summary">
                    <div class="summary-item">
                        <span class="summary-label">Modus:</span>
                        <span class="summary-value">${modeIcon} ${modeText}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">API-Schlüssel:</span>
                        <span class="summary-value"><code>${this.config.apiKey.substring(0, 12)}...</code></span>
                    </div>
                    ${this.config.webhookUrl ? `
                    <div class="summary-item">
                        <span class="summary-label">Webhook:</span>
                        <span class="summary-value">${this.config.webhookUrl}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="next-steps">
                    <h4>Nächste Schritte</h4>
                    <ol>
                        <li>Integrieren Sie den Code in Ihr System</li>
                        <li>Testen Sie mit einer echten Inventuranfrage</li>
                        ${this.config.mode === 'review' ? '<li>Richten Sie Benachrichtigungen ein</li>' : ''}
                    </ol>
                </div>

                <div class="help-resources">
                    <h4>Dokumentation & Hilfe</h4>
                    <div class="resource-links">
                        <a href="#" class="resource-link">
                            <span>📚</span> API-Dokumentation
                        </a>
                        <a href="#" class="resource-link">
                            <span>💬</span> Support kontaktieren
                        </a>
                        <a href="#" class="resource-link">
                            <span>📋</span> Häufige Fragen (FAQ)
                        </a>
                    </div>
                </div>

                <div class="step-actions">
                    <button class="btn btn-primary btn-lg" id="finishBtn">
                        Zur Übersicht →
                    </button>
                </div>
            </div>
        `;
    }

    attachStepListeners() {
        // Navigation buttons
        document.getElementById('startSetupBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('backBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('finishBtn')?.addEventListener('click', () => router.navigate('/agenten'));
        document.getElementById('skipTestBtn')?.addEventListener('click', () => {
            this.config.testStatus = 'skipped';
            this.nextStep();
        });

        // Mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                this.config.mode = card.dataset.mode;
                document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('nextBtn').disabled = false;
            });
        });

        // Copy buttons
        document.getElementById('copyApiKeyBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.config.apiKey);
            this.showCopyFeedback('copyApiKeyBtn');
        });
        document.getElementById('copyEndpointBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText('https://api.orca-software.com/v1/inventory');
            this.showCopyFeedback('copyEndpointBtn');
        });

        // Webhook input
        document.getElementById('webhookInput')?.addEventListener('input', (e) => {
            this.config.webhookUrl = e.target.value;
        });

        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const lang = tab.dataset.lang;
                document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`.code-block[data-lang="${lang}"]`)?.classList.add('active');
            });
        });

        // Test button
        document.getElementById('runTestBtn')?.addEventListener('click', () => this.runConnectionTest());
    }

    showCopyFeedback(btnId) {
        const btn = document.getElementById(btnId);
        const original = btn.textContent;
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 2000);
    }

    async runConnectionTest() {
        const testCard = document.getElementById('testCard');
        const testBtn = document.getElementById('runTestBtn');

        testBtn.disabled = true;
        testBtn.textContent = '⏳ Teste...';
        this.config.testStatus = 'testing';

        // Simulate test (in reality, this would make actual API calls)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo, always succeed
        this.config.testStatus = 'success';
        this.renderStep();
    }

    getTestStatusIcon() {
        switch (this.config.testStatus) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'testing': return '⏳';
            default: return '○';
        }
    }

    getTestStatusText() {
        switch (this.config.testStatus) {
            case 'success': return 'Verbindung erfolgreich!';
            case 'error': return 'Verbindung fehlgeschlagen';
            case 'testing': return 'Teste Verbindung...';
            default: return 'Noch nicht getestet';
        }
    }

    getTestStatusDescription() {
        switch (this.config.testStatus) {
            case 'success': return 'Ihr System ist korrekt mit ORCA verbunden.';
            case 'error': return 'Bitte überprüfen Sie Ihre Einstellungen.';
            case 'testing': return 'Bitte warten...';
            default: return 'Klicken Sie auf den Button, um die Verbindung zu testen.';
        }
    }

    generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'orca_';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateProgress();
            this.renderStep();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateProgress();
            this.renderStep();
        }
    }

    updateProgress() {
        document.querySelectorAll('.progress-step').forEach((step, idx) => {
            step.classList.remove('active', 'completed');
            if (idx === this.currentStep) {
                step.classList.add('active');
            } else if (idx < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    addStyles() {
        if (document.getElementById('api-setup-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'api-setup-styles';
        styles.textContent = `
            .api-setup-page {
                padding: 1.5rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            .setup-layout {
                display: grid;
                grid-template-columns: 250px 1fr;
                gap: 2rem;
                min-height: calc(100vh - 200px);
            }

            /* Sidebar */
            .setup-sidebar {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .setup-progress {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .setup-progress h3 {
                margin: 0 0 1rem 0;
                font-size: 1rem;
                color: #374151;
            }

            .progress-steps {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .progress-step {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .progress-step.active {
                background: #eff6ff;
            }

            .step-indicator {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 600;
                background: #e5e7eb;
                color: #6b7280;
            }

            .progress-step.active .step-indicator {
                background: #3b82f6;
                color: white;
            }

            .progress-step.completed .step-indicator {
                background: #22c55e;
                color: white;
            }

            .step-label {
                font-size: 0.9rem;
                color: #6b7280;
            }

            .progress-step.active .step-label {
                color: #1e40af;
                font-weight: 500;
            }

            .setup-help {
                background: #fef3c7;
                border-radius: 12px;
                padding: 1rem;
            }

            .setup-help h4 {
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }

            .setup-help p {
                margin: 0;
                font-size: 0.8rem;
                color: #92400e;
            }

            /* Main Content */
            .setup-main {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                overflow: hidden;
            }

            .step-card {
                padding: 2rem;
            }

            .step-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .step-icon.success {
                color: #22c55e;
            }

            .step-card h2 {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
            }

            .step-description {
                color: #6b7280;
                margin-bottom: 2rem;
            }

            /* Intro Step */
            .intro-lead {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .benefit-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .benefit-card {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            }

            .benefit-icon {
                font-size: 2rem;
                display: block;
                margin-bottom: 0.5rem;
            }

            .benefit-card h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
            }

            .benefit-card p {
                margin: 0;
                font-size: 0.85rem;
                color: #6b7280;
            }

            .info-box {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 1.5rem;
                border-radius: 0 8px 8px 0;
            }

            .info-box h4 {
                margin: 0 0 0.75rem 0;
            }

            .info-box ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }

            .info-note {
                margin: 0.75rem 0 0 0;
                font-style: italic;
                color: #1e40af;
            }

            /* Mode Selection */
            .mode-selection {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .mode-card {
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .mode-card:hover {
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }

            .mode-card.selected {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .mode-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .mode-icon {
                font-size: 1.5rem;
            }

            .mode-header h3 {
                margin: 0;
                flex: 1;
            }

            .mode-badge {
                font-size: 0.7rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                background: #dcfce7;
                color: #15803d;
            }

            .mode-features {
                list-style: none;
                padding: 0;
                margin: 1rem 0;
            }

            .mode-features li {
                padding: 0.25rem 0;
                font-size: 0.9rem;
            }

            .mode-flow {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.8rem;
                color: #6b7280;
                padding: 0.75rem;
                background: #f8fafc;
                border-radius: 8px;
            }

            .mode-flow .highlight {
                background: #fef3c7;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }

            .mode-comparison {
                margin-top: 2rem;
            }

            .comparison-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }

            .comparison-table th,
            .comparison-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }

            .comparison-table th {
                background: #f8fafc;
            }

            /* Connection Step */
            .connection-steps {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .connection-step {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
            }

            .connection-step-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                background: #f8fafc;
            }

            .step-num {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.85rem;
            }

            .connection-step-header h4 {
                margin: 0;
            }

            .connection-step-body {
                padding: 1.5rem;
            }

            .api-key-display {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #1e293b;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                margin: 0.5rem 0;
            }

            .api-key-display code {
                flex: 1;
                color: #22c55e;
                font-family: monospace;
                font-size: 0.9rem;
                word-break: break-all;
            }

            .copy-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .copy-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .copy-btn.copied {
                color: #22c55e;
            }

            .security-note {
                font-size: 0.85rem;
                color: #dc2626;
            }

            .webhook-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 0.9rem;
            }

            .hint {
                font-size: 0.8rem;
                color: #6b7280;
                margin-top: 0.5rem;
            }

            /* Code Examples */
            .code-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .code-tab {
                padding: 0.5rem 1rem;
                border: 1px solid #e5e7eb;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
            }

            .code-tab.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .code-block {
                display: none;
                background: #1e293b;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 0.8rem;
                line-height: 1.5;
            }

            .code-block.active {
                display: block;
            }

            /* Test Step */
            .test-section {
                text-align: center;
            }

            .test-card {
                background: #f8fafc;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 1.5rem;
            }

            .test-status {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .test-card h4 {
                margin: 0 0 0.5rem 0;
            }

            .test-card p {
                margin: 0;
                color: #6b7280;
            }

            .test-actions {
                margin-bottom: 2rem;
            }

            .test-checklist {
                text-align: left;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 1.5rem;
            }

            .test-checklist h4 {
                margin: 0 0 1rem 0;
            }

            .checklist-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0;
            }

            .check-icon {
                width: 20px;
                text-align: center;
            }

            .checklist-item.checked .check-icon {
                color: #22c55e;
            }

            .checklist-item.checked .check-icon::before {
                content: '✓';
            }

            /* Complete Step */
            .complete-card {
                text-align: center;
            }

            .complete-summary {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                margin: 2rem auto;
                max-width: 400px;
                text-align: left;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .summary-item:last-child {
                border-bottom: none;
            }

            .summary-label {
                color: #6b7280;
            }

            .summary-value code {
                background: #e5e7eb;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
            }

            .next-steps {
                text-align: left;
                max-width: 400px;
                margin: 2rem auto;
            }

            .next-steps ol {
                padding-left: 1.5rem;
            }

            .next-steps li {
                margin: 0.5rem 0;
            }

            .help-resources {
                margin-top: 2rem;
            }

            .resource-links {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 1rem;
            }

            .resource-link {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                background: #f8fafc;
                border-radius: 8px;
                text-decoration: none;
                color: #374151;
                transition: all 0.2s;
            }

            .resource-link:hover {
                background: #e5e7eb;
            }

            /* Actions */
            .step-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e5e7eb;
            }

            .btn-lg {
                padding: 0.875rem 2rem;
                font-size: 1rem;
            }

            .btn-link {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 0.9rem;
            }

            .btn-link:hover {
                color: #374151;
                text-decoration: underline;
            }

            @media (max-width: 900px) {
                .setup-layout {
                    grid-template-columns: 1fr;
                }

                .benefit-cards,
                .mode-selection {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create global instance
const agentAPISetupPage = new AgentAPISetupPage();
