// ORCA 2.0 - Lookup-Agent (Intern)
// Universelle Suche: Erkennt Eingaben automatisch und findet zugehörige Daten

class AgentLookupPage {
    constructor() {
        this.lastResult = null;
        this.isSearching = false;

        // Verknüpfungs-Map: Welche Objekte können zu welchem Typ geladen werden?
        this.relatedObjectsMap = {
            toolNumber: [
                { name: 'FM-Akte', icon: '📁', route: '/fm-akte?tool={key}', loader: null },
                { name: 'Prozess-Historie', icon: '📜', loader: 'loadProcessHistory' },
                { name: 'Inventuren', icon: '📦', loader: 'loadAssetInventories' },
                { name: 'Dokumente', icon: '📄', loader: 'loadAssetDocuments' }
            ],
            companyNumber: [
                { name: 'Standorte', icon: '📍', loader: 'loadCompanyLocations' },
                { name: 'Lieferanten', icon: '🏭', loader: 'loadCompanySuppliers' },
                { name: 'User', icon: '👥', loader: 'loadCompanyUsers' },
                { name: 'Werkzeuge', icon: '🔧', loader: 'loadCompanyAssets' }
            ],
            companyName: [
                { name: 'Standorte', icon: '📍', loader: 'loadCompanyLocations' },
                { name: 'Lieferanten', icon: '🏭', loader: 'loadCompanySuppliers' },
                { name: 'User', icon: '👥', loader: 'loadCompanyUsers' }
            ],
            inventoryNumber: [
                { name: 'Positionen', icon: '📋', loader: 'loadInventoryPositions' },
                { name: 'Partitionen', icon: '📊', loader: 'loadInventoryPartitions' }
            ],
            uuid: [
                { name: 'Details', icon: '🔍', loader: 'loadUuidDetails' },
                { name: 'Historie', icon: '📜', loader: 'loadUuidHistory' },
                { name: 'Positionen', icon: '📋', loader: 'loadUuidPositions' }
            ],
            orderPosition: [
                { name: 'Werkzeug-Details', icon: '🔧', loader: 'loadOrderPositionAsset' }
            ],
            email: [
                { name: 'User-Profil', icon: '👤', loader: 'loadUserByEmail' },
                { name: 'Firmen', icon: '🏢', loader: 'loadUserCompanies' },
                { name: 'Gruppen', icon: '👥', loader: 'loadUserGroups' }
            ]
        };
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

                // Verknüpfte Objekte laden wenn primäres Ergebnis erfolgreich
                if (apiResult?.success && recognition.match?.type) {
                    console.log('Loading related objects for type:', recognition.match.type);
                    console.log('Primary data:', apiResult.data);
                    const relatedObjects = await this.loadRelatedObjects(
                        recognition.match.type,
                        apiResult.data,
                        input
                    );
                    console.log('Related objects loaded:', relatedObjects);
                    this.lastResult.relatedObjects = relatedObjects;
                } else {
                    console.log('Skipping related objects - success:', apiResult?.success, 'type:', recognition.match?.type);
                }
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

        // Prüfe ob api verfügbar ist
        if (typeof api === 'undefined') {
            return { error: 'API Service nicht verfügbar' };
        }

        const strategy = recognition.strategy;
        const entityType = recognition.matches?.[0]?.type;
        const value = recognition.matches?.[0]?.value || recognition.input;

        try {
            // Nutze api.js Methoden je nach Entity-Typ
            if (entityType === 'toolNumber') {
                // Werkzeugnummer -> api.getAssetByNumber()
                const result = await api.getAssetByNumber(value);
                return {
                    success: result.success,
                    endpoint: 'assetList',
                    data: result.success ? result.data : null,
                    error: result.error,
                    count: result.success ? 1 : 0
                };
            }

            if (entityType === 'companyNumber' || entityType === 'companyName') {
                // Firma -> api.searchCompanies()
                const result = await api.searchCompanies(value);
                return {
                    success: Array.isArray(result) && result.length > 0,
                    endpoint: 'companiesSearch',
                    data: result,
                    count: Array.isArray(result) ? result.length : 0
                };
            }

            if (entityType === 'inventoryNumber') {
                // Inventurnummer -> api.getInventoryList()
                const result = await api.getInventoryList();
                const filtered = Array.isArray(result)
                    ? result.filter(inv => inv.inventoryNumber?.includes(value))
                    : [];
                return {
                    success: filtered.length > 0,
                    endpoint: 'inventoryList',
                    data: filtered,
                    count: filtered.length
                };
            }

            if (entityType === 'uuid') {
                // UUID -> könnte Asset, Prozess oder Inventur sein
                // Versuche Asset zuerst
                try {
                    const assetResult = await api.call(`/asset/${value}`, 'GET');
                    if (assetResult) {
                        return {
                            success: true,
                            endpoint: 'assetDetail',
                            data: assetResult,
                            count: 1
                        };
                    }
                } catch (e) {
                    // Asset nicht gefunden, versuche Prozess
                }

                try {
                    const processResult = await api.call(`/process/${value}`, 'GET');
                    if (processResult) {
                        return {
                            success: true,
                            endpoint: 'processDetail',
                            data: processResult,
                            count: 1
                        };
                    }
                } catch (e) {
                    // Prozess nicht gefunden
                }

                return { error: 'UUID nicht gefunden (weder Asset noch Prozess)' };
            }

            // Fallback: Generische Suche über asset-list
            const fallbackResult = await api.getAssetByNumber(value);
            return {
                success: fallbackResult.success,
                endpoint: 'assetList',
                data: fallbackResult.success ? fallbackResult.data : null,
                error: fallbackResult.error,
                count: fallbackResult.success ? 1 : 0
            };

        } catch (error) {
            return { error: error.message };
        }
    }

    // Lädt alle verknüpften Objekte basierend auf Entity-Typ und primären Daten
    async loadRelatedObjects(entityType, primaryData, inputValue) {
        const relatedConfig = this.relatedObjectsMap[entityType];
        if (!relatedConfig) return [];

        const results = [];
        const key = primaryData?.key || primaryData?.context?.key || primaryData?.originalData?.context?.key;

        for (const config of relatedConfig) {
            try {
                let data = null;
                let route = config.route;
                let count = 0;

                // Loader aufrufen wenn vorhanden
                if (config.loader && this[config.loader]) {
                    const result = await this[config.loader](key, primaryData, inputValue);
                    data = result?.data;
                    count = result?.count || (Array.isArray(data) ? data.length : (data ? 1 : 0));
                    route = result?.route || route;
                }

                // Route mit Key ersetzen
                if (route && key) {
                    route = route.replace('{key}', key).replace('{value}', inputValue);
                }

                results.push({
                    name: config.name,
                    icon: config.icon,
                    route,
                    data,
                    count,
                    loaded: config.loader ? true : false
                });
            } catch (e) {
                results.push({
                    name: config.name,
                    icon: config.icon,
                    error: e.message,
                    count: 0
                });
            }
        }

        return results;
    }

    // === LOADER FUNKTIONEN ===

    // Werkzeug: Prozess-Historie laden
    async loadProcessHistory(assetKey) {
        if (!assetKey) return { data: null, count: 0 };
        try {
            const data = await api.call(`/asset/${assetKey}/process-history`, 'GET');
            return {
                data,
                count: Array.isArray(data) ? data.length : 0,
                route: `/verlagerung?asset=${assetKey}`
            };
        } catch (e) {
            return { data: null, count: 0, error: e.message };
        }
    }

    // Werkzeug: Inventuren finden
    async loadAssetInventories(assetKey, primaryData) {
        // Suche Inventuren die dieses Asset enthalten
        const inventoryNumber = primaryData?.inventoryNumber || primaryData?.meta?.inventoryNumber;
        if (!inventoryNumber) return { data: null, count: 0 };

        try {
            const inventories = await api.getInventoryList();
            const matching = Array.isArray(inventories)
                ? inventories.filter(inv => inv.inventoryNumber === inventoryNumber)
                : [];
            return {
                data: matching,
                count: matching.length,
                route: matching.length === 1 ? `/inventur-detail?key=${matching[0].key}` : '/inventur'
            };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Werkzeug: Dokumente laden
    async loadAssetDocuments(assetKey) {
        if (!assetKey) return { data: null, count: 0 };
        try {
            const data = await api.call(`/asset/${assetKey}/documents`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Firma: Standorte laden
    async loadCompanyLocations(companyKey, primaryData) {
        const key = companyKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/companies/${key}/locations`, 'GET');
            return {
                data,
                count: Array.isArray(data) ? data.length : 0,
                route: `/unternehmen?key=${key}`
            };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Firma: Lieferanten laden
    async loadCompanySuppliers(companyKey, primaryData) {
        const key = companyKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/companies/${key}/suppliers`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Firma: User laden
    async loadCompanyUsers(companyKey, primaryData) {
        const key = companyKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/access/companies/${key}/users`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Firma: Werkzeuge laden (über asset-list mit Supplier-Filter)
    async loadCompanyAssets(companyKey, primaryData) {
        const supplierNumber = primaryData?.supplierNumber || primaryData?.[0]?.supplierNumber;
        if (!supplierNumber) return { data: null, count: 0 };
        try {
            const data = await api.call(`/asset-list?supplier=${supplierNumber}&limit=10`, 'GET');
            return {
                data,
                count: Array.isArray(data) ? data.length : 0,
                route: `/werkzeuge?supplier=${supplierNumber}`
            };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Inventur: Positionen laden
    async loadInventoryPositions(inventoryKey, primaryData) {
        const key = inventoryKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/inventory/${key}/positions`, 'GET');
            return {
                data,
                count: Array.isArray(data) ? data.length : 0,
                route: `/inventur-detail?key=${key}`
            };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Inventur: Partitionen laden
    async loadInventoryPartitions(inventoryKey, primaryData) {
        const key = inventoryKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/inventory/${key}/partitions`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // UUID: Details laden (versucht Asset, dann Prozess, dann Inventur)
    async loadUuidDetails(uuid) {
        if (!uuid) return { data: null, count: 0 };

        // Versuche Asset
        try {
            const asset = await api.call(`/asset/${uuid}`, 'GET');
            if (asset) return { data: asset, count: 1, route: `/fm-akte?key=${uuid}`, type: 'Asset' };
        } catch (e) {}

        // Versuche Prozess
        try {
            const process = await api.call(`/process/${uuid}`, 'GET');
            if (process) return { data: process, count: 1, route: `/verlagerung?key=${uuid}`, type: 'Prozess' };
        } catch (e) {}

        // Versuche Inventur
        try {
            const inventory = await api.call(`/inventory/${uuid}`, 'GET');
            if (inventory) return { data: inventory, count: 1, route: `/inventur-detail?key=${uuid}`, type: 'Inventur' };
        } catch (e) {}

        return { data: null, count: 0 };
    }

    // UUID: Historie laden
    async loadUuidHistory(uuid) {
        if (!uuid) return { data: null, count: 0 };
        try {
            const data = await api.call(`/process/${uuid}/history`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // UUID: Positionen laden
    async loadUuidPositions(uuid) {
        if (!uuid) return { data: null, count: 0 };
        try {
            const data = await api.call(`/process/${uuid}/positions`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // Bestellposition: Werkzeug laden
    async loadOrderPositionAsset(_, __, inputValue) {
        try {
            const result = await api.getAssetByNumber(inputValue);
            if (result.success) {
                return {
                    data: result.data,
                    count: 1,
                    route: `/fm-akte?key=${result.data.key}`
                };
            }
            return { data: null, count: 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // User: Nach Email suchen
    async loadUserByEmail(_, __, email) {
        try {
            const users = await api.call(`/users?query=${encodeURIComponent(email)}`, 'GET');
            return { data: users, count: Array.isArray(users) ? users.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // User: Firmen laden
    async loadUserCompanies(userKey, primaryData) {
        const key = userKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/users/${key}/companies`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
        }
    }

    // User: Gruppen laden
    async loadUserGroups(userKey, primaryData) {
        const key = userKey || primaryData?.key || primaryData?.[0]?.key;
        if (!key) return { data: null, count: 0 };
        try {
            const data = await api.call(`/users/${key}/groups`, 'GET');
            return { data, count: Array.isArray(data) ? data.length : 0 };
        } catch (e) {
            return { data: null, count: 0 };
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

        // Verknüpfte Objekte anzeigen
        if (result.relatedObjects && result.relatedObjects.length > 0) {
            html += this.renderRelatedObjects(result.relatedObjects);
        }

        html += '</div>';
        return html;
    }

    renderRelatedObjects(relatedObjects) {
        if (!relatedObjects || relatedObjects.length === 0) return '';

        let html = `
            <div class="related-objects-section">
                <h4>🔗 Verknüpfte Objekte</h4>
                <div class="related-cards">
        `;

        for (const obj of relatedObjects) {
            const hasData = obj.count > 0;
            const clickable = hasData && obj.route;

            html += `
                <div class="related-card ${hasData ? 'has-data' : 'no-data'} ${clickable ? 'clickable' : ''}"
                     ${clickable ? `onclick="window.location.hash='${obj.route}'"` : ''}>
                    <div class="related-icon">${obj.icon}</div>
                    <div class="related-info">
                        <div class="related-name">${obj.name}</div>
                        <div class="related-count">
                            ${obj.error
                                ? `<span class="error-text">Fehler</span>`
                                : obj.count > 0
                                    ? `<strong>${obj.count}</strong> gefunden`
                                    : 'Keine'
                            }
                        </div>
                    </div>
                    ${clickable ? '<div class="related-arrow">→</div>' : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

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

            /* Related Objects */
            .related-objects-section {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 2px solid #e5e7eb;
            }

            .related-objects-section h4 {
                margin: 0 0 1rem 0;
                font-size: 1rem;
                color: #374151;
            }

            .related-cards {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 0.75rem;
            }

            .related-card {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                transition: all 0.2s;
            }

            .related-card.has-data {
                background: #f0fdf4;
                border-color: #86efac;
            }

            .related-card.clickable {
                cursor: pointer;
            }

            .related-card.clickable:hover {
                background: #dcfce7;
                border-color: #22c55e;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
            }

            .related-card.no-data {
                background: #f9fafb;
                border-color: #e5e7eb;
                opacity: 0.7;
            }

            .related-icon {
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .related-info {
                flex: 1;
                min-width: 0;
            }

            .related-name {
                font-weight: 600;
                font-size: 0.9rem;
                color: #1f2937;
            }

            .related-count {
                font-size: 0.8rem;
                color: #6b7280;
                margin-top: 0.125rem;
            }

            .related-count strong {
                color: #22c55e;
            }

            .related-count .error-text {
                color: #ef4444;
            }

            .related-arrow {
                font-size: 1.25rem;
                color: #22c55e;
                opacity: 0;
                transition: opacity 0.2s, transform 0.2s;
            }

            .related-card.clickable:hover .related-arrow {
                opacity: 1;
                transform: translateX(3px);
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

            [data-theme="dark"] .related-objects-section {
                border-top-color: #334155;
            }

            [data-theme="dark"] .related-objects-section h4 {
                color: #e2e8f0;
            }

            [data-theme="dark"] .related-card {
                background: #1e293b;
                border-color: #334155;
            }

            [data-theme="dark"] .related-card.has-data {
                background: #14532d;
                border-color: #22c55e;
            }

            [data-theme="dark"] .related-icon {
                background: #0f172a;
            }

            [data-theme="dark"] .related-name {
                color: #e2e8f0;
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
