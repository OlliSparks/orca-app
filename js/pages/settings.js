// ORCA 2.0 - Settings Page
class SettingsPage {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        const saved = localStorage.getItem('orca_api_config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing config:', e);
            }
        }
        return {
            mode: 'mock',
            bearerToken: '',
            supplierNumber: '133188',
            baseURL: 'https://int.bmw.organizingcompanyassets.com/api/orca'
        };
    }

    saveConfig(config) {
        localStorage.setItem('orca_api_config', JSON.stringify(config));
        this.config = config;

        // Update API service
        if (typeof api !== 'undefined') {
            api.updateConfig(config);
        }
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Einstellungen';

        // Hide header stats
        const headerStats = document.querySelector('.header-stats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        const config = this.config;
        const isConnected = config.mode === 'live' && config.bearerToken;

        app.innerHTML = `
            <div class="container">
                <div class="settings-widget">
                    <h2>API-Konfiguration</h2>
                    <p class="settings-description">
                        Konfigurieren Sie hier die Verbindung zum ORCA-Backend.
                        Im Mock-Modus werden Testdaten verwendet, im Live-Modus werden echte Daten vom Server geladen.
                    </p>

                    <div class="settings-section">
                        <h3>Verbindungsmodus</h3>
                        <div class="mode-toggle">
                            <label class="mode-option ${config.mode === 'mock' ? 'active' : ''}">
                                <input type="radio" name="apiMode" value="mock" ${config.mode === 'mock' ? 'checked' : ''}>
                                <span class="mode-icon">🧪</span>
                                <span class="mode-label">Mock-Modus</span>
                                <span class="mode-desc">Testdaten für Entwicklung</span>
                            </label>
                            <label class="mode-option ${config.mode === 'live' ? 'active' : ''}">
                                <input type="radio" name="apiMode" value="live" ${config.mode === 'live' ? 'checked' : ''}>
                                <span class="mode-icon">🔗</span>
                                <span class="mode-label">Live-Modus</span>
                                <span class="mode-desc">Echte API-Verbindung</span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section" id="liveSettings" style="${config.mode === 'live' ? '' : 'display: none;'}">
                        <h3>Live-API Einstellungen</h3>

                        <div class="form-group">
                            <label for="baseURL">API Base URL</label>
                            <input type="text" id="baseURL" class="settings-input"
                                   value="${config.baseURL}"
                                   placeholder="https://int.bmw.organizingcompanyassets.com/api/orca">
                        </div>

                        <div class="form-group">
                            <label for="supplierNumber">Lieferantennummer</label>
                            <input type="text" id="supplierNumber" class="settings-input"
                                   value="${config.supplierNumber}"
                                   placeholder="z.B. 9999999">
                            <span class="form-hint">Die Nummer Ihres Unternehmens im ORCA-System</span>
                        </div>

                        <div class="form-group">
                            <label for="bearerToken">Bearer Token</label>
                            <textarea id="bearerToken" class="settings-input settings-textarea"
                                      rows="4" placeholder="eyJhbGciOiJSUzI1NiIs...">${config.bearerToken}</textarea>
                            <span class="form-hint">
                                Der Token läuft nach einiger Zeit ab und muss dann erneuert werden.
                                <a href="https://int.bmw.organizingcompanyassets.com" target="_blank">Token hier erneuern</a>
                            </span>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="settings-btn secondary" id="resetBtn">
                            ↺ Zurücksetzen
                        </button>
                        <button class="settings-btn primary" id="saveBtn">
                            ✓ Speichern
                        </button>
                    </div>

                    <div class="connection-status" id="connectionStatus" style="display: none;">
                        <div class="status-indicator" id="statusIndicator"></div>
                        <span id="statusText"></span>
                    </div>
                </div>

                <div class="settings-widget" id="connectionTestWidget" style="${config.mode === 'live' ? '' : 'display: none;'}">
                    <h2>Verbindungstest</h2>
                    <p class="settings-description">
                        Testen Sie die Verbindung zum ORCA-Backend mit den aktuellen Einstellungen.
                    </p>

                    <button class="settings-btn test" id="testConnectionBtn">
                        🔍 Verbindung testen
                    </button>

                    <div class="test-results" id="testResults" style="display: none;">
                        <div class="test-result" id="profileResult">
                            <span class="test-icon">⏳</span>
                            <span class="test-label">Profil abrufen</span>
                            <span class="test-status"></span>
                        </div>
                        <div class="test-result" id="inventoryResult">
                            <span class="test-icon">⏳</span>
                            <span class="test-label">Inventurdaten laden</span>
                            <span class="test-status"></span>
                        </div>
                    </div>

                    <div class="user-info" id="userInfo" style="display: none;">
                        <h4>Angemeldeter Benutzer</h4>
                        <div class="user-details" id="userDetails"></div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Mode toggle
        document.querySelectorAll('input[name="apiMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const mode = e.target.value;
                document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('active'));
                e.target.closest('.mode-option').classList.add('active');

                const liveSettings = document.getElementById('liveSettings');
                const testWidget = document.getElementById('connectionTestWidget');

                if (mode === 'live') {
                    liveSettings.style.display = '';
                    testWidget.style.display = '';
                } else {
                    liveSettings.style.display = 'none';
                    testWidget.style.display = 'none';
                }
            });
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => this.saveSettings());

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSettings());

        // Test connection button
        document.getElementById('testConnectionBtn').addEventListener('click', () => this.testConnection());
    }

    saveSettings() {
        const mode = document.querySelector('input[name="apiMode"]:checked').value;
        const config = {
            mode: mode,
            baseURL: document.getElementById('baseURL').value.trim(),
            supplierNumber: document.getElementById('supplierNumber').value.trim(),
            bearerToken: document.getElementById('bearerToken').value.trim()
        };

        this.saveConfig(config);
        this.showStatus('success', '✓ Einstellungen gespeichert');
    }

    resetSettings() {
        const defaultConfig = {
            mode: 'mock',
            bearerToken: '',
            supplierNumber: '133188',
            baseURL: 'https://int.bmw.organizingcompanyassets.com/api/orca'
        };

        this.saveConfig(defaultConfig);
        this.render(); // Re-render with defaults
        this.showStatus('info', '↺ Einstellungen zurückgesetzt');
    }

    async testConnection() {
        const testResults = document.getElementById('testResults');
        const profileResult = document.getElementById('profileResult');
        const inventoryResult = document.getElementById('inventoryResult');
        const userInfo = document.getElementById('userInfo');

        testResults.style.display = 'block';
        userInfo.style.display = 'none';

        // Reset results
        this.setTestResult(profileResult, 'pending', 'Wird getestet...');
        this.setTestResult(inventoryResult, 'pending', 'Wartet...');

        // Save current settings first
        this.saveSettings();

        try {
            // Test 1: Profile
            const profileResponse = await api.getProfile();

            if (profileResponse.success) {
                this.setTestResult(profileResult, 'success', 'Erfolgreich');

                // Show user info
                userInfo.style.display = 'block';
                document.getElementById('userDetails').innerHTML = `
                    <div><strong>Name:</strong> ${profileResponse.data.name || 'N/A'}</div>
                    <div><strong>E-Mail:</strong> ${profileResponse.data.email || 'N/A'}</div>
                    <div><strong>Unternehmen:</strong> ${profileResponse.data.company || 'N/A'}</div>
                `;

                // Test 2: Inventory
                this.setTestResult(inventoryResult, 'pending', 'Wird getestet...');

                const tasksResponse = await api.getTasks();
                if (tasksResponse.success) {
                    const count = tasksResponse.data ? tasksResponse.data.length : 0;
                    this.setTestResult(inventoryResult, 'success', `${count} Aufgaben gefunden`);
                } else {
                    this.setTestResult(inventoryResult, 'warning', 'Keine Daten gefunden');
                }
            } else {
                this.setTestResult(profileResult, 'error', profileResponse.error || 'Fehler');
                this.setTestResult(inventoryResult, 'error', 'Übersprungen');
            }
        } catch (error) {
            console.error('Connection test error:', error);
            this.setTestResult(profileResult, 'error', error.message || 'Verbindungsfehler');
            this.setTestResult(inventoryResult, 'error', 'Übersprungen');
        }
    }

    setTestResult(element, status, text) {
        const icon = element.querySelector('.test-icon');
        const statusEl = element.querySelector('.test-status');

        const icons = {
            pending: '⏳',
            success: '✓',
            error: '✗',
            warning: '⚠'
        };

        icon.textContent = icons[status] || '⏳';
        statusEl.textContent = text;

        element.className = 'test-result ' + status;
    }

    showStatus(type, message) {
        const statusEl = document.getElementById('connectionStatus');
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');

        statusEl.style.display = 'flex';
        statusEl.className = 'connection-status ' + type;
        text.textContent = message;

        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Create global instance
const settingsPage = new SettingsPage();
