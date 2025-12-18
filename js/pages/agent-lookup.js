// ORCA 2.0 - Lookup-Agent (Intern)
// Universelle Suche: Erkennt Eingaben automatisch und findet zugehörige Daten

class AgentLookupPage {
    constructor() {
        this.lastResult = null;
        this.isSearching = false;
    }

    render() {
        const container = document.getElementById('app');
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Lookup-Agent';
        document.getElementById('headerSubtitle').textContent = 'Universelle Suche';
        document.getElementById('headerStats').style.display = 'none';

        container.innerHTML = `
            <div class="lookup-agent-page">
                <style>${this.getStyles()}</style>

                <div class="lookup-layout">
                    <!-- Sidebar mit Statistik -->
                    <aside class="lookup-sidebar">
                        <div class="sidebar-section">
                            <h3>📊 Katalog-Status</h3>
                            <div class="stat-item">
                                <span>API-Endpoints</span>
                                <span class="stat-value">${this.getApiCount()}</span>
                            </div>
                            <div class="stat-item">
                                <span>Entity-Typen</span>
                                <span class="stat-value">${this.getEntityCount()}</span>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>🔍 Erkannte Typen</h3>
                            <div class="type-list">
                                ${this.renderTypeList()}
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>💡 Beispiele</h3>
                            <div class="example-chips">
                                <button onclick="agentLookupPage.search('10255187')">10255187</button>
                                <button onclick="agentLookupPage.search('A1-0010010376')">A1-0010010376</button>
                                <button onclick="agentLookupPage.search('I2')">I2</button>
                                <button onclick="agentLookupPage.search('Radolfzell')">Radolfzell</button>
                                <button onclick="agentLookupPage.search('IVL')">IVL</button>
                            </div>
                        </div>
                    </aside>

                    <!-- Hauptbereich -->
                    <main class="lookup-main">
                        <div class="search-box">
                            <h2>🔎 Was möchtest du finden?</h2>
                            <p class="search-hint">Gib eine Werkzeugnummer, Bestellposition, Status-Code oder andere ORCA-Kennung ein</p>
                            <div class="search-input-row">
                                <input
                                    type="text"
                                    id="lookupInput"
                                    placeholder="z.B. 10255187, A1-0010010376, I2, Radolfzell..."
                                    onkeydown="if(event.key==='Enter') agentLookupPage.search()"
                                    autocomplete="off"
                                >
                                <button onclick="agentLookupPage.search()" class="search-btn" ${this.isSearching ? 'disabled' : ''}>
                                    ${this.isSearching ? '⏳' : '🔍'} Suchen
                                </button>
                            </div>
                        </div>

                        <div id="lookupResult" class="result-area">
                            ${this.lastResult ? this.renderResult(this.lastResult) : this.renderEmptyState()}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }

    getApiCount() {
        if (typeof API_CATALOG === 'undefined') return '?';
        return Object.keys(API_CATALOG).filter(k => !['version', 'baseUrl'].includes(k)).length;
    }

    getEntityCount() {
        if (typeof ENTITY_PATTERNS === 'undefined') return '?';
        return Object.keys(ENTITY_PATTERNS).length;
    }

    renderTypeList() {
        if (typeof ENTITY_PATTERNS === 'undefined') {
            return '<p class="warning">Entity-Patterns nicht geladen</p>';
        }

        const types = [
            { key: 'toolNumber', icon: '🔧' },
            { key: 'orderPosition', icon: '📋' },
            { key: 'inventoryNumber', icon: '📦' },
            { key: 'inventoryStatus', icon: '🏷️' },
            { key: 'processStatus', icon: '🚚' },
            { key: 'postalCode', icon: '📍' },
            { key: 'email', icon: '📧' },
            { key: 'uuid', icon: '🔑' }
        ];

        return types.map(t => {
            const entity = ENTITY_PATTERNS[t.key];
            if (!entity) return '';
            return `<div class="type-item">${t.icon} ${entity.name}</div>`;
        }).join('');
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔎</div>
                <h3>Bereit zur Suche</h3>
                <p>Gib oben einen Wert ein und ich erkenne automatisch was es ist und wo ich es finde.</p>
            </div>
        `;
    }

    async search(value) {
        const input = value || document.getElementById('lookupInput')?.value?.trim();
        if (!input) return;

        // Input-Feld aktualisieren falls Beispiel geklickt
        const inputEl = document.getElementById('lookupInput');
        if (inputEl) inputEl.value = input;

        this.isSearching = true;
        this.render();

        // Entity erkennen
        const recognition = this.recognize(input);

        // Ergebnis zusammenstellen
        this.lastResult = {
            input,
            recognition,
            timestamp: new Date().toISOString()
        };

        // API-Call versuchen wenn Token vorhanden
        if (recognition.match && recognition.strategy) {
            try {
                const apiResult = await this.executeSearch(recognition);
                this.lastResult.apiResult = apiResult;
            } catch (error) {
                this.lastResult.error = error.message;
            }
        }

        this.isSearching = false;
        this.render();
    }

    recognize(input) {
        if (typeof EntityRecognizer === 'undefined') {
            return { error: 'EntityRecognizer nicht verfügbar' };
        }

        const matches = EntityRecognizer.analyze(input);
        const bestMatch = matches[0] || null;
        const strategy = EntityRecognizer.getSearchStrategy(input);

        return {
            input,
            matches,
            match: bestMatch,
            strategy,
            explanation: EntityRecognizer.explain(input)
        };
    }

    async executeSearch(recognition) {
        if (!recognition.strategy) return null;

        // Token von api.bearerToken holen (gleiche Quelle wie alle anderen API-Calls)
        let token = null;
        if (typeof api !== 'undefined' && api.bearerToken) {
            token = api.bearerToken.startsWith('Bearer ')
                ? api.bearerToken.substring(7)
                : api.bearerToken;
        }
        if (!token) {
            return { noToken: true, message: 'Kein Auth-Token verfügbar. Bitte einloggen.' };
        }

        const strategy = recognition.strategy;
        let endpoint, params;

        // Primary Strategy extrahieren
        if (strategy.primary) {
            endpoint = strategy.primary.endpoint;
            params = strategy.primary.params;
        } else if (strategy.tryInOrder) {
            // Bei UUID: ersten Versuch nehmen
            endpoint = strategy.tryInOrder[0].endpoint;
            params = strategy.tryInOrder[0].params;
        } else {
            return null;
        }

        // API-Katalog verwenden
        if (typeof API_CATALOG === 'undefined') {
            return { error: 'API_CATALOG nicht verfügbar' };
        }

        const apiDef = API_CATALOG[endpoint];
        if (!apiDef) {
            return { error: `Endpoint ${endpoint} nicht im Katalog gefunden` };
        }

        // URL bauen
        let url = API_CATALOG.baseUrl + apiDef.path;

        // Path-Parameter ersetzen
        if (apiDef.input?.pathParams) {
            for (const p of apiDef.input.pathParams) {
                if (params[p.name]) {
                    url = url.replace(`{${p.name}}`, params[p.name]);
                }
            }
        }

        // Query-Parameter anhängen
        const queryParts = [];
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && !apiDef.input?.pathParams?.some(p => p.name === key)) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParts.push(`${key}=${encodeURIComponent(v)}`));
                    } else {
                        queryParts.push(`${key}=${encodeURIComponent(value)}`);
                    }
                }
            }
        }

        // Für inventory-list: status ist required
        if (endpoint === 'inventoryList' && !params.status) {
            ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'].forEach(s => {
                queryParts.push(`status=${s}`);
            });
        }

        if (queryParts.length > 0) {
            url += '?' + queryParts.join('&');
        }

        // Fetch
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                return {
                    error: `HTTP ${response.status}`,
                    url,
                    endpoint
                };
            }

            const data = await response.json();
            return {
                success: true,
                url,
                endpoint,
                data,
                count: Array.isArray(data) ? data.length : 1
            };

        } catch (error) {
            return { error: error.message, url };
        }
    }

    renderResult(result) {
        if (!result) return '';

        let html = `
            <div class="result-card">
                <div class="result-header">
                    <h3>Eingabe: <code>${result.input}</code></h3>
                    <span class="timestamp">${new Date(result.timestamp).toLocaleTimeString('de-DE')}</span>
                </div>
        `;

        // Erkennung
        if (result.recognition) {
            const rec = result.recognition;

            if (rec.match) {
                html += `
                    <div class="recognition-box success">
                        <div class="recognition-header">
                            <span class="rec-icon">✓</span>
                            <strong>${rec.match.name}</strong>
                        </div>
                        <p>${rec.match.description}</p>
                        ${rec.match.value ? `<div class="rec-value">= ${rec.match.value}</div>` : ''}
                    </div>
                `;

                // Weitere Möglichkeiten
                if (rec.matches.length > 1) {
                    html += `<div class="alt-matches">Weitere Möglichkeiten: ${rec.matches.slice(1).map(m => m.name).join(', ')}</div>`;
                }

                // Such-Strategie
                if (rec.strategy) {
                    html += `
                        <div class="strategy-box">
                            <h4>📡 Such-Strategie</h4>
                            <pre>${JSON.stringify(rec.strategy, null, 2)}</pre>
                        </div>
                    `;
                }

            } else {
                html += `
                    <div class="recognition-box warning">
                        <div class="recognition-header">
                            <span class="rec-icon">?</span>
                            <strong>Unbekannter Typ</strong>
                        </div>
                        <p>Konnte keinem ORCA-Datentyp zugeordnet werden.</p>
                    </div>
                `;
            }
        }

        // API-Ergebnis
        if (result.apiResult) {
            const api = result.apiResult;

            if (api.noToken) {
                html += `
                    <div class="api-box warning">
                        <h4>🔐 Authentifizierung erforderlich</h4>
                        <p>${api.message}</p>
                    </div>
                `;
            } else if (api.error) {
                html += `
                    <div class="api-box error">
                        <h4>❌ API-Fehler</h4>
                        <p>${api.error}</p>
                        ${api.url ? `<code class="api-url">${api.url}</code>` : ''}
                    </div>
                `;
            } else if (api.success) {
                html += `
                    <div class="api-box success">
                        <h4>✅ API-Ergebnis</h4>
                        <div class="api-meta">
                            <span>Endpoint: <code>${api.endpoint}</code></span>
                            <span>Treffer: <strong>${api.count}</strong></span>
                        </div>
                        <code class="api-url">${api.url}</code>
                        <div class="api-data">
                            <details>
                                <summary>Rohdaten anzeigen (${JSON.stringify(api.data).length} Bytes)</summary>
                                <pre>${JSON.stringify(api.data, null, 2).substring(0, 5000)}${JSON.stringify(api.data).length > 5000 ? '\n...(gekürzt)' : ''}</pre>
                            </details>
                        </div>
                        ${this.renderDataPreview(api.data)}
                    </div>
                `;
            }
        }

        html += '</div>';
        return html;
    }

    renderDataPreview(data) {
        if (!data) return '';

        const items = Array.isArray(data) ? data.slice(0, 5) : [data];
        if (items.length === 0) return '<p class="no-data">Keine Daten gefunden</p>';

        let html = '<div class="data-preview"><h4>Vorschau</h4><div class="preview-cards">';

        items.forEach((item, i) => {
            const key = item.context?.key || item.key || '?';
            const meta = item.meta || {};

            // Wichtigste Felder extrahieren
            const fields = [];
            if (meta.identifier) fields.push(['Kennung', meta.identifier]);
            if (meta.inventoryNumber) fields.push(['Inv-Nr', meta.inventoryNumber]);
            if (meta.name) fields.push(['Name', meta.name]);
            if (meta.status) fields.push(['Status', meta.status]);
            if (meta.assetCity || item.assetCity) fields.push(['Stadt', meta.assetCity || item.assetCity]);

            html += `
                <div class="preview-card">
                    <div class="preview-key">${key.substring(0, 8)}...</div>
                    ${fields.map(([label, value]) => `
                        <div class="preview-field">
                            <span class="field-label">${label}:</span>
                            <span class="field-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        if (Array.isArray(data) && data.length > 5) {
            html += `<div class="more-items">... und ${data.length - 5} weitere</div>`;
        }

        html += '</div></div>';
        return html;
    }

    getStyles() {
        return `
            .lookup-agent-page {
                padding: 1rem;
                height: calc(100vh - 80px);
            }

            .lookup-layout {
                display: grid;
                grid-template-columns: 260px 1fr;
                gap: 1.5rem;
                height: 100%;
                max-width: 1400px;
                margin: 0 auto;
            }

            /* Sidebar */
            .lookup-sidebar {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                height: fit-content;
            }

            .sidebar-section {
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .sidebar-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .sidebar-section h3 {
                font-size: 0.85rem;
                font-weight: 600;
                color: #6b7280;
                margin: 0 0 0.75rem 0;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
            }

            .stat-value {
                font-weight: 600;
                color: #2c4a8c;
            }

            .type-list {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .type-item {
                font-size: 0.85rem;
                padding: 0.25rem 0;
                color: #374151;
            }

            .example-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .example-chips button {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-family: monospace;
            }

            .example-chips button:hover {
                background: #f0f4ff;
                border-color: #2c4a8c;
            }

            /* Main */
            .lookup-main {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .search-box {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .search-box h2 {
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
                color: #1e3a5f;
            }

            .search-hint {
                color: #6b7280;
                margin: 0 0 1rem 0;
                font-size: 0.9rem;
            }

            .search-input-row {
                display: flex;
                gap: 0.75rem;
            }

            .search-input-row input {
                flex: 1;
                padding: 0.875rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                font-family: monospace;
            }

            .search-input-row input:focus {
                outline: none;
                border-color: #2c4a8c;
            }

            .search-btn {
                padding: 0 1.5rem;
                background: #2c4a8c;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
            }

            .search-btn:hover:not(:disabled) {
                background: #1e3a6e;
            }

            .search-btn:disabled {
                background: #9ca3af;
            }

            /* Result Area */
            .result-area {
                flex: 1;
                overflow-y: auto;
            }

            .empty-state {
                background: white;
                border-radius: 12px;
                padding: 3rem;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .empty-state h3 {
                margin: 0 0 0.5rem 0;
                color: #1e3a5f;
            }

            .empty-state p {
                color: #6b7280;
                margin: 0;
            }

            .result-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .result-header h3 {
                margin: 0;
                font-size: 1rem;
            }

            .result-header code {
                background: #f0f4ff;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                color: #2c4a8c;
            }

            .timestamp {
                color: #9ca3af;
                font-size: 0.85rem;
            }

            .recognition-box {
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .recognition-box.success {
                background: #ecfdf5;
                border: 1px solid #10b981;
            }

            .recognition-box.warning {
                background: #fffbeb;
                border: 1px solid #f59e0b;
            }

            .recognition-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .rec-icon {
                font-size: 1.25rem;
            }

            .rec-value {
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: white;
                border-radius: 4px;
                font-family: monospace;
            }

            .alt-matches {
                font-size: 0.85rem;
                color: #6b7280;
                margin-bottom: 1rem;
            }

            .strategy-box {
                background: #f8fafc;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
            }

            .strategy-box h4 {
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }

            .strategy-box pre {
                margin: 0;
                font-size: 0.8rem;
                overflow-x: auto;
            }

            .api-box {
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
            }

            .api-box.success {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
            }

            .api-box.warning {
                background: #fffbeb;
                border: 1px solid #f59e0b;
            }

            .api-box.error {
                background: #fef2f2;
                border: 1px solid #ef4444;
            }

            .api-box h4 {
                margin: 0 0 0.75rem 0;
            }

            .api-meta {
                display: flex;
                gap: 1.5rem;
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
            }

            .api-url {
                display: block;
                padding: 0.5rem;
                background: rgba(0,0,0,0.05);
                border-radius: 4px;
                font-size: 0.75rem;
                word-break: break-all;
                margin-bottom: 1rem;
            }

            .api-data details {
                margin-top: 0.5rem;
            }

            .api-data summary {
                cursor: pointer;
                color: #6b7280;
                font-size: 0.85rem;
            }

            .api-data pre {
                margin-top: 0.5rem;
                padding: 1rem;
                background: #1e293b;
                color: #e2e8f0;
                border-radius: 8px;
                font-size: 0.75rem;
                overflow-x: auto;
                max-height: 300px;
            }

            .data-preview {
                margin-top: 1rem;
            }

            .data-preview h4 {
                margin: 0 0 0.75rem 0;
                font-size: 0.9rem;
            }

            .preview-cards {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 0.75rem;
            }

            .preview-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 0.75rem;
            }

            .preview-key {
                font-family: monospace;
                font-size: 0.75rem;
                color: #9ca3af;
                margin-bottom: 0.5rem;
            }

            .preview-field {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                padding: 0.125rem 0;
            }

            .field-label {
                color: #6b7280;
            }

            .field-value {
                font-weight: 500;
            }

            .more-items {
                color: #6b7280;
                font-size: 0.85rem;
                text-align: center;
                padding: 0.5rem;
            }

            .no-data {
                color: #9ca3af;
                font-style: italic;
            }

            /* Dark Mode */
            [data-theme="dark"] .lookup-sidebar,
            [data-theme="dark"] .search-box,
            [data-theme="dark"] .empty-state,
            [data-theme="dark"] .result-card {
                background: #1e293b;
            }

            [data-theme="dark"] .sidebar-section {
                border-bottom-color: #334155;
            }

            [data-theme="dark"] .search-box h2,
            [data-theme="dark"] .empty-state h3 {
                color: #e2e8f0;
            }

            [data-theme="dark"] .search-input-row input {
                background: #0f172a;
                border-color: #334155;
                color: #e2e8f0;
            }

            [data-theme="dark"] .result-header {
                border-bottom-color: #334155;
            }

            [data-theme="dark"] .preview-card {
                background: #0f172a;
                border-color: #334155;
            }

            /* Responsive */
            @media (max-width: 900px) {
                .lookup-layout {
                    grid-template-columns: 1fr;
                }

                .lookup-sidebar {
                    display: none;
                }
            }
        `;
    }
}

const agentLookupPage = new AgentLookupPage();
