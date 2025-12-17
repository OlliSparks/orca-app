// ORCA 2.0 - Einstellungen Seite

class EinstellungenPage {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            return JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        } catch {
            return {};
        }
    }

    saveConfig() {
        localStorage.setItem('orca_api_config', JSON.stringify(this.config));
    }

    render() {
        const container = document.getElementById('app');

        document.getElementById('headerTitle').textContent = 'orca 2.0 - Einstellungen';
        document.getElementById('headerSubtitle').textContent = 'Anwendungseinstellungen';
        document.getElementById('headerStats').style.display = 'none';

        container.innerHTML = `
            <div class="einstellungen-page">
                <style>${this.getStyles()}</style>

                <div class="settings-grid">
                    <!-- KI-Einstellungen -->
                    <div class="settings-card">
                        <div class="card-header">
                            <span class="card-icon">🤖</span>
                            <h2>KI-Einstellungen</h2>
                        </div>
                        <div class="card-content">
                            <div class="form-group">
                                <label for="claudeApiKey">Claude API Key</label>
                                <div class="input-with-action">
                                    <input type="password"
                                           id="claudeApiKey"
                                           placeholder="sk-ant-api03-..."
                                           value="${this.config.claudeApiKey || ''}"
                                           onchange="einstellungenPage.updateApiKey(this.value)">
                                    <button class="btn-toggle-visibility" onclick="einstellungenPage.toggleKeyVisibility()">
                                        👁
                                    </button>
                                </div>
                                <p class="form-hint">
                                    Holen Sie sich einen API Key von <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>
                                </p>
                            </div>

                            <div class="api-status ${this.config.claudeApiKey ? 'connected' : 'disconnected'}">
                                ${this.config.claudeApiKey
                                    ? '✅ API Key konfiguriert'
                                    : '⚠️ Kein API Key - Allgemein-Agent nutzt Fallback-Modus'}
                            </div>

                            <button class="btn-test" onclick="einstellungenPage.testApiKey()">
                                🧪 API Key testen
                            </button>
                        </div>
                    </div>

                    <!-- Erscheinungsbild -->
                    <div class="settings-card">
                        <div class="card-header">
                            <span class="card-icon">🎨</span>
                            <h2>Erscheinungsbild</h2>
                        </div>
                        <div class="card-content">
                            <div class="form-group">
                                <label>Farbschema</label>
                                <div class="theme-options">
                                    <button class="theme-option ${this.getCurrentTheme() === 'light' ? 'active' : ''}"
                                            onclick="einstellungenPage.setTheme('light')">
                                        ☀️ Hell
                                    </button>
                                    <button class="theme-option ${this.getCurrentTheme() === 'dark' ? 'active' : ''}"
                                            onclick="einstellungenPage.setTheme('dark')">
                                        🌙 Dunkel
                                    </button>
                                    <button class="theme-option ${this.getCurrentTheme() === 'system' ? 'active' : ''}"
                                            onclick="einstellungenPage.setTheme('system')">
                                        💻 System
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Daten -->
                    <div class="settings-card">
                        <div class="card-header">
                            <span class="card-icon">💾</span>
                            <h2>Lokale Daten</h2>
                        </div>
                        <div class="card-content">
                            <div class="data-info">
                                <div class="data-item">
                                    <span>Skills</span>
                                    <span>${this.getStorageSize('orca_skills')}</span>
                                </div>
                                <div class="data-item">
                                    <span>Bugs</span>
                                    <span>${this.getStorageSize('orca_bugs')}</span>
                                </div>
                                <div class="data-item">
                                    <span>Backlog</span>
                                    <span>${this.getStorageSize('orca_backlog')}</span>
                                </div>
                                <div class="data-item">
                                    <span>Berechtigungen</span>
                                    <span>${this.getStorageSize('orca_permission_matrix')}</span>
                                </div>
                            </div>

                            <button class="btn-danger" onclick="einstellungenPage.clearLocalData()">
                                🗑️ Lokale Daten löschen
                            </button>
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="settings-card">
                        <div class="card-header">
                            <span class="card-icon">ℹ️</span>
                            <h2>Über ORCA 2.0</h2>
                        </div>
                        <div class="card-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Version</span>
                                    <span class="info-value">2.0.0-beta</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Build</span>
                                    <span class="info-value">${new Date().toISOString().split('T')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="testResult" class="test-result" style="display:none;"></div>
            </div>
        `;
    }

    updateApiKey(value) {
        this.config.claudeApiKey = value.trim();
        this.saveConfig();
        this.render();
        if (typeof errorService !== 'undefined') {
            errorService.showToast('API Key gespeichert', 'success');
        }
    }

    toggleKeyVisibility() {
        const input = document.getElementById('claudeApiKey');
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    async testApiKey() {
        const key = this.config.claudeApiKey;
        if (!key) {
            if (typeof errorService !== 'undefined') {
                errorService.showToast('Kein API Key eingegeben', 'error');
            }
            return;
        }

        const resultDiv = document.getElementById('testResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '⏳ Teste API Key...';
        resultDiv.className = 'test-result testing';

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Hi' }]
                })
            });

            if (response.ok) {
                resultDiv.innerHTML = '✅ API Key funktioniert!';
                resultDiv.className = 'test-result success';
            } else {
                const error = await response.json();
                resultDiv.innerHTML = `❌ Fehler: ${error.error?.message || 'Ungültiger Key'}`;
                resultDiv.className = 'test-result error';
            }
        } catch (e) {
            resultDiv.innerHTML = `❌ Verbindungsfehler: ${e.message}`;
            resultDiv.className = 'test-result error';
        }
    }

    getCurrentTheme() {
        return localStorage.getItem('orca_theme') || 'system';
    }

    setTheme(theme) {
        localStorage.setItem('orca_theme', theme);

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        this.render();
    }

    getStorageSize(key) {
        const data = localStorage.getItem(key);
        if (!data) return '0 B';
        const bytes = new Blob([data]).size;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
        return `${(bytes/1024/1024).toFixed(1)} MB`;
    }

    clearLocalData() {
        if (confirm('Alle lokalen ORCA-Daten löschen? (Skills, Bugs, Backlog, Berechtigungen)')) {
            ['orca_skills', 'orca_bugs', 'orca_backlog', 'orca_permission_matrix',
             'orca_skill_categories', 'orca_notifications'].forEach(key => {
                localStorage.removeItem(key);
            });
            if (typeof errorService !== 'undefined') {
                errorService.showToast('Lokale Daten gelöscht', 'success');
            }
            this.render();
        }
    }

    getStyles() {
        return `
            .einstellungen-page { padding: 1.5rem; max-width: 1000px; margin: 0 auto; }

            .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }

            .settings-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
            .card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
            .card-icon { font-size: 1.3rem; }
            .card-header h2 { margin: 0; font-size: 1.1rem; color: #2c4a8c; font-weight: 600; }
            .card-content { padding: 1.25rem; }

            .form-group { margin-bottom: 1.25rem; }
            .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
            .form-hint { font-size: 0.8rem; color: #6b7280; margin-top: 0.4rem; }
            .form-hint a { color: #2c4a8c; }

            .input-with-action { display: flex; gap: 0.5rem; }
            .input-with-action input { flex: 1; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; font-family: monospace; }
            .input-with-action input:focus { outline: none; border-color: #2c4a8c; box-shadow: 0 0 0 3px rgba(44,74,140,0.1); }
            .btn-toggle-visibility { padding: 0.6rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }

            .api-status { padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; margin-bottom: 1rem; }
            .api-status.connected { background: #dcfce7; color: #166534; }
            .api-status.disconnected { background: #fef3c7; color: #92400e; }

            .btn-test { width: 100%; padding: 0.6rem; background: #2c4a8c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
            .btn-test:hover { background: #1e3a6d; }

            .test-result { margin-top: 1rem; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; }
            .test-result.testing { background: #e0e7ff; color: #3730a3; }
            .test-result.success { background: #dcfce7; color: #166534; }
            .test-result.error { background: #fee2e2; color: #991b1b; }

            .theme-options { display: flex; gap: 0.5rem; }
            .theme-option { flex: 1; padding: 0.75rem; background: #f3f4f6; border: 2px solid transparent; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
            .theme-option:hover { background: #e5e7eb; }
            .theme-option.active { background: #e0e7ff; border-color: #2c4a8c; color: #2c4a8c; }

            .data-info { margin-bottom: 1rem; }
            .data-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
            .data-item:last-child { border-bottom: none; }

            .btn-danger { width: 100%; padding: 0.6rem; background: white; color: #dc2626; border: 1px solid #dc2626; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
            .btn-danger:hover { background: #fef2f2; }

            .info-grid { display: flex; flex-direction: column; gap: 0.5rem; }
            .info-item { display: flex; justify-content: space-between; }
            .info-label { color: #6b7280; }
            .info-value { font-weight: 500; }

            /* Dark mode */
            [data-theme="dark"] .settings-card { background: #1e293b; }
            [data-theme="dark"] .card-header { background: #0f172a; border-color: #334155; }
            [data-theme="dark"] .card-header h2 { color: #60a5fa; }
            [data-theme="dark"] .form-group label { color: #e2e8f0; }
            [data-theme="dark"] .input-with-action input { background: #0f172a; border-color: #334155; color: #e2e8f0; }
            [data-theme="dark"] .btn-toggle-visibility { background: #334155; border-color: #475569; color: #e2e8f0; }
            [data-theme="dark"] .theme-option { background: #334155; color: #e2e8f0; }
            [data-theme="dark"] .theme-option.active { background: #1e3a5f; }
            [data-theme="dark"] .data-item { border-color: #334155; color: #e2e8f0; }
            [data-theme="dark"] .info-label { color: #94a3b8; }
            [data-theme="dark"] .info-value { color: #e2e8f0; }

            @media (max-width: 480px) {
                .settings-grid { grid-template-columns: 1fr; }
                .theme-options { flex-direction: column; }
            }
        `;
    }
}

const einstellungenPage = new EinstellungenPage();
