// ORCA 2.0 - Reporting Agent (Daten-zentrierter Ansatz)
class AgentReportingPage {
    constructor() {
        this.gridData = null;  // Die geladenen Basis-Daten
        this.isLoading = false;
        this.currentView = 'data'; // 'data' oder spezifische Auswertung
        this.agGridInstance = null; // AG Grid instance
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Reporting-Agent';
        document.getElementById('headerSubtitle').textContent = 'Ihre Daten analysieren und exportieren';
        document.getElementById('headerStats').style.display = 'none';

        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        // Check if data is already loaded
        if (this.gridData && this.gridData.length > 0) {
            this.renderDataView();
        } else {
            this.renderLoadView();
        }

        this.addStyles();
    }

    // =============== PHASE 1: Daten laden ===============
    renderLoadView() {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="container reporting-page">
                <div class="load-view">
                    <div class="load-card">
                        <div class="load-icon">📊</div>
                        <h2>Fertigungsmittel-Daten laden</h2>
                        <p>Laden Sie Ihre Werkzeugdaten, um Auswertungen und Reports zu erstellen.</p>

                        <button class="load-btn" id="loadDataBtn">
                            <span class="btn-icon">⬇️</span>
                            Daten laden
                        </button>

                        <div class="load-info">
                            <div class="info-item">
                                <span class="info-icon">🔧</span>
                                <span>Alle Ihre Fertigungsmittel</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">📍</span>
                                <span>Standorte & Status</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">📋</span>
                                <span>Prozess-Informationen</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="loading-overlay" id="loadingOverlay" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Daten werden geladen...</p>
                </div>
            </div>
        `;

        document.getElementById('loadDataBtn')?.addEventListener('click', () => this.loadData());
    }

    async loadData() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';

        try {
            const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
            const supplierNumber = config.supplierNumber || config.supplierId || config.companyKey;

            if (!supplierNumber) {
                alert('Bitte konfigurieren Sie eine Lieferantennummer in den Einstellungen.');
                if (overlay) overlay.style.display = 'none';
                return;
            }

            console.log('Loading data for supplier:', supplierNumber);
            const response = await api.getAssetsGridReport(supplierNumber);

            this.gridData = response.gridData || response.content || response || [];
            this.currentView = 'data';

            // Render the data view
            this.renderDataView();

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Fehler beim Laden: ' + error.message);
            if (overlay) overlay.style.display = 'none';
        }
    }

    // =============== PHASE 2: Daten anzeigen + Auswertungen ===============
    renderDataView() {
        const app = document.getElementById('app');
        const data = this.gridData;

        // Berechne Statistiken
        const stats = this.calculateStats(data);

        app.innerHTML = `
            <div class="container reporting-page data-loaded">
                <!-- Header mit Daten-Übersicht -->
                <div class="data-header">
                    <div class="data-summary">
                        <div class="summary-main">
                            <span class="summary-count">${data.length}</span>
                            <span class="summary-label">Fertigungsmittel geladen</span>
                        </div>
                        <div class="summary-stats">
                            ${stats.countries ? `<span class="stat-pill">🌍 ${stats.countries} Länder</span>` : ''}
                            ${stats.owners ? `<span class="stat-pill">🏢 ${stats.owners} Eigentümer</span>` : ''}
                            ${stats.statuses ? `<span class="stat-pill">📊 ${stats.statuses} Status-Typen</span>` : ''}
                        </div>
                    </div>
                    <div class="data-actions">
                        <button class="action-btn-small" id="refreshDataBtn" title="Daten neu laden">🔄</button>
                        <button class="action-btn-small" id="exportAllBtn" title="Alle Daten exportieren">📥</button>
                    </div>
                </div>

                <!-- Haupt-Layout: Daten links, Auswertungen rechts -->
                <div class="data-layout">
                    <!-- Linke Seite: Datentabelle -->
                    <div class="data-panel">
                        <div class="panel-header">
                            <h3>📋 Ihre Daten</h3>
                            <div class="view-tabs">
                                <button class="view-tab ${this.currentView === 'data' ? 'active' : ''}" data-view="data">AG Grid</button>
                                ${this.currentView !== 'data' ? `<button class="view-tab active" data-view="${this.currentView}">${this.getViewName(this.currentView)}</button>` : ''}
                            </div>
                        </div>
                        ${this.currentView === 'data' ? `
                        <div class="filter-toolbar">
                            <div class="filter-info">
                                <span id="filteredCount">${data.length} Einträge</span>
                            </div>
                            <div class="filter-actions">
                                <select id="savedFiltersDropdown" class="filter-select">
                                    <option value="">Filter laden...</option>
                                </select>
                                <button id="deleteFilterBtn" class="filter-btn small" title="Ausgewählten Filter löschen">🗑️</button>
                                <button id="saveFilterBtn" class="filter-btn" title="Aktuellen Filter speichern">💾 Speichern</button>
                                <button id="clearFiltersBtn" class="filter-btn" title="Alle Filter zurücksetzen">✖️ Reset</button>
                                <div class="export-dropdown">
                                    <button id="exportFilteredBtn" class="filter-btn primary">📥 Export</button>
                                    <div class="export-menu" id="exportMenu">
                                        <button data-format="xlsx">Excel (.xlsx)</button>
                                        <button data-format="csv">CSV (.csv)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        <div class="panel-content" id="dataContent">
                            ${this.currentView === 'data' ? this.renderDataTable(data) : this.renderAnalysisView(this.currentView, data)}
                        </div>
                    </div>

                    <!-- Rechte Seite: Auswertungen -->
                    <div class="analysis-panel">
                        <div class="panel-header">
                            <h3>📈 Auswertungen</h3>
                        </div>
                        <div class="panel-content">
                            <p class="analysis-intro">Was möchten Sie aus Ihren Daten erfahren?</p>

                            <div class="analysis-category">
                                <h4>⚙️ Operativ</h4>
                                <div class="analysis-options">
                                    <button class="analysis-btn" data-view="process-status">
                                        <span class="btn-title">Prozess-Status</span>
                                        <span class="btn-desc">Verteilung nach Status</span>
                                    </button>
                                    <button class="analysis-btn" data-view="location-result">
                                        <span class="btn-title">Standort-Ergebnisse</span>
                                        <span class="btn-desc">Gefunden / Nicht gefunden</span>
                                    </button>
                                    <button class="analysis-btn" data-view="due-dates">
                                        <span class="btn-title">Fälligkeiten</span>
                                        <span class="btn-desc">Überfällig / Anstehend</span>
                                    </button>
                                </div>
                            </div>

                            <div class="analysis-category">
                                <h4>🌍 Geografisch</h4>
                                <div class="analysis-options">
                                    <button class="analysis-btn" data-view="by-country">
                                        <span class="btn-title">Nach Land</span>
                                        <span class="btn-desc">Geografische Verteilung</span>
                                    </button>
                                    <button class="analysis-btn" data-view="by-city">
                                        <span class="btn-title">Nach Stadt</span>
                                        <span class="btn-desc">Standort-Übersicht</span>
                                    </button>
                                </div>
                            </div>

                            <div class="analysis-category">
                                <h4>🏢 Organisation</h4>
                                <div class="analysis-options">
                                    <button class="analysis-btn" data-view="by-owner">
                                        <span class="btn-title">Nach Eigentümer</span>
                                        <span class="btn-desc">Wer besitzt was?</span>
                                    </button>
                                    <button class="analysis-btn" data-view="by-lifecycle">
                                        <span class="btn-title">Lifecycle-Status</span>
                                        <span class="btn-desc">Aktiv / Inaktiv / etc.</span>
                                    </button>
                                </div>
                            </div>

                            <div class="export-section">
                                <h4>📥 Export</h4>
                                <div class="export-buttons">
                                    <button class="export-btn" data-format="xlsx">Excel</button>
                                    <button class="export-btn" data-format="csv">CSV</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachDataViewListeners();
    }

    calculateStats(data) {
        const stats = {};

        // Zähle eindeutige Länder
        const countries = new Set();
        const owners = new Set();
        const statuses = new Set();

        data.forEach(item => {
            if (item['Land'] && item['Land'] !== '-') countries.add(item['Land']);
            if (item['Eigentümer'] && item['Eigentümer'] !== '-') owners.add(item['Eigentümer']);
            if (item['Fertigungsmittel-Lifecyclestatus'] && item['Fertigungsmittel-Lifecyclestatus'] !== '-') {
                statuses.add(item['Fertigungsmittel-Lifecyclestatus']);
            }
        });

        stats.countries = countries.size || null;
        stats.owners = owners.size || null;
        stats.statuses = statuses.size || null;

        return stats;
    }

    renderDataTable(data) {
        if (!data || data.length === 0) {
            return '<div class="no-data">Keine Daten vorhanden</div>';
        }

        // AG Grid Container mit Theme-Klasse zurückgeben
        return `
            <div id="agGridContainer" class="ag-grid-container ag-theme-alpine"></div>
        `;
    }

    initializeAgGrid(data) {
        // Destroy existing grid if present
        if (this.agGridInstance) {
            this.agGridInstance.destroy();
            this.agGridInstance = null;
        }

        const gridContainer = document.getElementById('agGridContainer');
        if (!gridContainer || !data || data.length === 0) return;

        // Spalten-Definitionen basierend auf den Daten erstellen
        const allColumns = Object.keys(data[0] || {}).filter(k => !k.startsWith('_'));

        // Priorisierte Spalten (diese werden zuerst angezeigt)
        const priorityColumns = [
            'Inventarnummer',
            'Werkzeugbezeichnung',
            'Lieferantenname',
            'Stadt',
            'Land',
            'Fertigungsmittel-Lifecyclestatus',
            'Prozessstatus',
            'Standortergebnis'
        ];

        // Sortiere Spalten: Priorität zuerst, dann alphabetisch
        const sortedColumns = [
            ...priorityColumns.filter(col => allColumns.includes(col)),
            ...allColumns.filter(col => !priorityColumns.includes(col)).sort()
        ];

        const columnDefs = sortedColumns.map(key => ({
            field: key,
            headerName: this.getColumnHeaderName(key),
            sortable: true,
            filter: 'agTextColumnFilter',
            floatingFilter: true, // Filter direkt unter Header
            resizable: true,
            minWidth: 120,
            flex: key === 'Werkzeugbezeichnung' ? 2 : 1,
            filterParams: {
                buttons: ['reset', 'apply'],
                closeOnApply: true
            },
            cellRenderer: (params) => {
                const value = params.value;
                if (!value || value === '-') return '<span style="color: #d1d5db;">-</span>';
                if (key === 'Fertigungsmittel-Lifecyclestatus' || key === 'Prozessstatus') {
                    return `<span class="status-badge">${value}</span>`;
                }
                return value;
            }
        }));

        // Store reference to this for callbacks
        const self = this;

        // AG Grid Optionen
        this.gridOptions = {
            columnDefs: columnDefs,
            rowData: data,
            defaultColDef: {
                sortable: true,
                filter: true,
                floatingFilter: true,
                resizable: true,
                minWidth: 80
            },
            pagination: false,
            domLayout: 'normal',
            rowHeight: 40,
            headerHeight: 44,
            floatingFiltersHeight: 36,
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true,
            suppressRowClickSelection: true,
            cacheQuickFilter: true,
            // Event: Filter geändert - Update Zähler
            onFilterChanged: () => {
                self.updateFilteredCount();
            }
        };

        // Grid initialisieren
        this.agGridInstance = agGrid.createGrid(gridContainer, this.gridOptions);

        // Initial count update
        setTimeout(() => this.updateFilteredCount(), 100);

        console.log(`AG Grid initialisiert mit ${data.length} Zeilen und ${columnDefs.length} Spalten`);
    }

    updateFilteredCount() {
        const countEl = document.getElementById('filteredCount');
        if (!countEl || !this.agGridInstance) return;

        let filteredCount = 0;
        this.agGridInstance.forEachNodeAfterFilter(() => filteredCount++);

        const total = this.gridData?.length || 0;
        if (filteredCount === total) {
            countEl.textContent = `${total} Einträge`;
        } else {
            countEl.textContent = `${filteredCount} von ${total} gefiltert`;
        }
    }

    // =============== Filter Management ===============
    getSavedFilters() {
        const saved = localStorage.getItem('orca_reporting_filters');
        return saved ? JSON.parse(saved) : [];
    }

    saveCurrentFilter() {
        if (!this.agGridInstance) return;

        const filterModel = this.agGridInstance.getFilterModel();
        if (!filterModel || Object.keys(filterModel).length === 0) {
            alert('Keine aktiven Filter zum Speichern.');
            return;
        }

        const name = prompt('Name für diesen Filter:');
        if (!name) return;

        const filters = this.getSavedFilters();
        filters.push({
            id: Date.now(),
            name: name,
            filter: filterModel,
            created: new Date().toISOString()
        });

        localStorage.setItem('orca_reporting_filters', JSON.stringify(filters));
        this.renderFilterDropdown();
        alert(`Filter "${name}" gespeichert!`);
    }

    loadFilter(filterId) {
        const filters = this.getSavedFilters();
        const filter = filters.find(f => f.id === filterId);

        if (filter && this.agGridInstance) {
            this.agGridInstance.setFilterModel(filter.filter);
            console.log(`Filter "${filter.name}" geladen`);
        }
    }

    deleteFilter(filterId) {
        let filters = this.getSavedFilters();
        const filter = filters.find(f => f.id === filterId);

        if (confirm(`Filter "${filter?.name}" wirklich löschen?`)) {
            filters = filters.filter(f => f.id !== filterId);
            localStorage.setItem('orca_reporting_filters', JSON.stringify(filters));
            this.renderFilterDropdown();
        }
    }

    clearAllFilters() {
        if (this.agGridInstance) {
            this.agGridInstance.setFilterModel(null);
        }
    }

    renderFilterDropdown() {
        const dropdown = document.getElementById('savedFiltersDropdown');
        if (!dropdown) return;

        const filters = this.getSavedFilters();

        if (filters.length === 0) {
            dropdown.innerHTML = '<option value="">Keine gespeicherten Filter</option>';
            dropdown.disabled = true;
        } else {
            dropdown.disabled = false;
            dropdown.innerHTML = `
                <option value="">Filter laden...</option>
                ${filters.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
            `;
        }
    }

    // =============== Export Filtered Data ===============
    exportFilteredData(format) {
        if (!this.agGridInstance) {
            alert('Keine Daten zum Exportieren.');
            return;
        }

        // Sammle nur gefilterte/sichtbare Zeilen
        const filteredData = [];
        this.agGridInstance.forEachNodeAfterFilter(node => {
            if (node.data) {
                // Entferne interne Felder
                const cleanData = {};
                Object.keys(node.data).forEach(key => {
                    if (!key.startsWith('_')) {
                        cleanData[key] = node.data[key];
                    }
                });
                filteredData.push(cleanData);
            }
        });

        if (filteredData.length === 0) {
            alert('Keine Daten nach Filterung vorhanden.');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const suffix = filteredData.length < this.gridData.length ? '-gefiltert' : '';

        if (format === 'xlsx' && typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.json_to_sheet(filteredData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Fertigungsmittel');
            XLSX.writeFile(wb, `fertigungsmittel${suffix}-${timestamp}.xlsx`);
        } else if (format === 'csv') {
            const columns = Object.keys(filteredData[0] || {});
            const header = columns.join(';');
            const rows = filteredData.map(item =>
                columns.map(col => {
                    let val = item[col];
                    if (typeof val === 'object') val = val?.name || JSON.stringify(val);
                    return `"${String(val || '').replace(/"/g, '""')}"`;
                }).join(';')
            );
            const csv = [header, ...rows].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, `fertigungsmittel${suffix}-${timestamp}.csv`);
        }

        console.log(`Exportiert: ${filteredData.length} Zeilen als ${format.toUpperCase()}`);
    }

    getColumnHeaderName(key) {
        // Spalten-Übersetzungen
        const translations = {
            'Inventarnummer': 'Inv.-Nr.',
            'Werkzeugbezeichnung': 'Bezeichnung',
            'Lieferantenname': 'Lieferant',
            'Fertigungsmittel-Lifecyclestatus': 'Lifecycle-Status',
            'Prozessstatus': 'Prozess-Status',
            'Standortergebnis': 'Standort-Ergebnis',
            'BMW Inventurfrist': 'Inventurfrist'
        };
        return translations[key] || key;
    }

    formatCell(value, key) {
        if (!value || value === '-') return '<span class="empty">-</span>';

        if (key === 'Fertigungsmittel-Lifecyclestatus' || key === 'Prozessstatus') {
            return `<span class="status-badge">${value}</span>`;
        }

        // Kürze lange Werte
        if (typeof value === 'string' && value.length > 30) {
            return `<span title="${value}">${value.substring(0, 30)}...</span>`;
        }

        return value;
    }

    getViewName(view) {
        const names = {
            'data': 'Tabelle',
            'process-status': 'Prozess-Status',
            'location-result': 'Standort-Ergebnisse',
            'due-dates': 'Fälligkeiten',
            'by-country': 'Nach Land',
            'by-city': 'Nach Stadt',
            'by-owner': 'Nach Eigentümer',
            'by-lifecycle': 'Lifecycle-Status'
        };
        return names[view] || view;
    }

    // =============== Auswertungs-Views ===============
    renderAnalysisView(viewType, data) {
        switch (viewType) {
            case 'process-status':
                return this.renderGroupedAnalysis(data, 'Prozessstatus', 'Prozess-Status');
            case 'location-result':
                return this.renderGroupedAnalysis(data, 'Standortergebnis', 'Standort-Ergebnisse');
            case 'due-dates':
                return this.renderDueDatesAnalysis(data);
            case 'by-country':
                return this.renderGroupedAnalysis(data, 'Land', 'Verteilung nach Land');
            case 'by-city':
                return this.renderGroupedAnalysis(data, 'Stadt', 'Verteilung nach Stadt');
            case 'by-owner':
                return this.renderGroupedAnalysis(data, 'Eigentümer', 'Verteilung nach Eigentümer');
            case 'by-lifecycle':
                return this.renderGroupedAnalysis(data, 'Fertigungsmittel-Lifecyclestatus', 'Lifecycle-Status');
            default:
                return this.renderDataTable(data);
        }
    }

    renderGroupedAnalysis(data, groupField, title) {
        // Gruppiere Daten
        const groups = {};
        let total = 0;

        data.forEach(item => {
            const key = item[groupField] || 'Nicht angegeben';
            if (!groups[key]) {
                groups[key] = { count: 0, items: [] };
            }
            groups[key].count++;
            groups[key].items.push(item);
            total++;
        });

        // Sortiere nach Anzahl
        const sorted = Object.entries(groups).sort((a, b) => b[1].count - a[1].count);
        const maxCount = sorted[0]?.[1].count || 1;

        // Farben für die Bars
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

        return `
            <div class="analysis-result">
                <div class="analysis-header">
                    <h3>${title}</h3>
                    <span class="analysis-total">${total} Einträge in ${sorted.length} Gruppen</span>
                </div>

                <div class="analysis-chart">
                    ${sorted.map(([label, info], idx) => `
                        <div class="chart-row" data-group="${label}">
                            <div class="chart-label" title="${label}">${label.length > 25 ? label.substring(0, 25) + '...' : label}</div>
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="width: ${(info.count / maxCount * 100)}%; background: ${colors[idx % colors.length]}"></div>
                            </div>
                            <div class="chart-value">${info.count}</div>
                            <div class="chart-percent">${Math.round(info.count / total * 100)}%</div>
                        </div>
                    `).join('')}
                </div>

                <div class="back-to-data">
                    <button class="back-btn" data-view="data">← Zurück zur Datentabelle</button>
                </div>
            </div>
        `;
    }

    renderDueDatesAnalysis(data) {
        const now = new Date();
        const categories = {
            'Überfällig': { count: 0, items: [] },
            'Diese Woche': { count: 0, items: [] },
            'Dieser Monat': { count: 0, items: [] },
            'Später': { count: 0, items: [] },
            'Kein Datum': { count: 0, items: [] }
        };

        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        data.forEach(item => {
            const dueDateStr = item['Fälligkeitsdatum'] || item['BMW Inventurfrist'];

            if (!dueDateStr || dueDateStr === '-') {
                categories['Kein Datum'].count++;
                categories['Kein Datum'].items.push(item);
                return;
            }

            try {
                // Parse German date format (DD.MM.YYYY)
                let date;
                if (dueDateStr.includes('.')) {
                    const parts = dueDateStr.split('.');
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    date = new Date(dueDateStr);
                }

                const diff = date.getTime() - now.getTime();

                if (diff < 0) {
                    categories['Überfällig'].count++;
                    categories['Überfällig'].items.push(item);
                } else if (diff < oneWeek) {
                    categories['Diese Woche'].count++;
                    categories['Diese Woche'].items.push(item);
                } else if (diff < oneMonth) {
                    categories['Dieser Monat'].count++;
                    categories['Dieser Monat'].items.push(item);
                } else {
                    categories['Später'].count++;
                    categories['Später'].items.push(item);
                }
            } catch {
                categories['Kein Datum'].count++;
                categories['Kein Datum'].items.push(item);
            }
        });

        const total = data.length;
        const colors = {
            'Überfällig': '#ef4444',
            'Diese Woche': '#f59e0b',
            'Dieser Monat': '#3b82f6',
            'Später': '#10b981',
            'Kein Datum': '#9ca3af'
        };

        const sorted = Object.entries(categories).filter(([_, info]) => info.count > 0);
        const maxCount = Math.max(...sorted.map(([_, info]) => info.count)) || 1;

        return `
            <div class="analysis-result">
                <div class="analysis-header">
                    <h3>Fälligkeiten</h3>
                    <span class="analysis-total">${total} Einträge</span>
                </div>

                <div class="analysis-chart">
                    ${sorted.map(([label, info]) => `
                        <div class="chart-row" data-group="${label}">
                            <div class="chart-label">${label}</div>
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="width: ${(info.count / maxCount * 100)}%; background: ${colors[label]}"></div>
                            </div>
                            <div class="chart-value">${info.count}</div>
                            <div class="chart-percent">${Math.round(info.count / total * 100)}%</div>
                        </div>
                    `).join('')}
                </div>

                <div class="back-to-data">
                    <button class="back-btn" data-view="data">← Zurück zur Datentabelle</button>
                </div>
            </div>
        `;
    }

    // =============== Event Listeners ===============
    attachDataViewListeners() {
        // Initialize AG Grid if we're in data view
        if (this.currentView === 'data' && this.gridData) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                this.initializeAgGrid(this.gridData);
                this.renderFilterDropdown();
            }, 50);
        }

        // Refresh data
        document.getElementById('refreshDataBtn')?.addEventListener('click', () => {
            this.gridData = null;
            if (this.agGridInstance) {
                this.agGridInstance.destroy();
                this.agGridInstance = null;
            }
            this.loadData();
        });

        // Export all
        document.getElementById('exportAllBtn')?.addEventListener('click', () => {
            this.exportFilteredData('xlsx');
        });

        // Filter Toolbar Listeners
        document.getElementById('saveFilterBtn')?.addEventListener('click', () => {
            this.saveCurrentFilter();
        });

        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        document.getElementById('savedFiltersDropdown')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadFilter(parseInt(e.target.value));
            }
        });

        document.getElementById('deleteFilterBtn')?.addEventListener('click', () => {
            const dropdown = document.getElementById('savedFiltersDropdown');
            if (dropdown?.value) {
                this.deleteFilter(parseInt(dropdown.value));
            }
        });

        // Export dropdown toggle
        document.getElementById('exportFilteredBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = document.getElementById('exportMenu');
            if (menu) {
                menu.classList.toggle('show');
            }
        });

        // Export menu options
        document.querySelectorAll('#exportMenu button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportFilteredData(btn.dataset.format);
                document.getElementById('exportMenu')?.classList.remove('show');
            });
        });

        // Close export menu on outside click
        document.addEventListener('click', () => {
            document.getElementById('exportMenu')?.classList.remove('show');
        });

        // View tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentView = tab.dataset.view;
                this.renderDataView();
            });
        });

        // Analysis buttons
        document.querySelectorAll('.analysis-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                this.renderDataView();
            });
        });

        // Back button
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                this.renderDataView();
            });
        });

        // Export buttons (analysis panel)
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.exportFilteredData(btn.dataset.format);
            });
        });
    }

    // =============== Export ===============
    exportData(format) {
        if (!this.gridData || this.gridData.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const data = this.gridData;

        if (format === 'csv') {
            const columns = Object.keys(data[0] || {}).filter(k => !k.startsWith('_'));
            const header = columns.join(';');
            const rows = data.map(item =>
                columns.map(col => {
                    let val = item[col];
                    if (typeof val === 'object') val = val?.name || JSON.stringify(val);
                    return `"${String(val || '').replace(/"/g, '""')}"`;
                }).join(';')
            );
            const csv = [header, ...rows].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, `fertigungsmittel-${timestamp}.csv`);

        } else if (format === 'xlsx' && typeof XLSX !== 'undefined') {
            // Filter out internal fields
            const cleanData = data.map(item => {
                const clean = {};
                Object.keys(item).forEach(key => {
                    if (!key.startsWith('_')) {
                        clean[key] = item[key];
                    }
                });
                return clean;
            });

            const ws = XLSX.utils.json_to_sheet(cleanData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Fertigungsmittel');
            XLSX.writeFile(wb, `fertigungsmittel-${timestamp}.xlsx`);

        } else {
            // Fallback JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadBlob(blob, `fertigungsmittel-${timestamp}.json`);
        }
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // =============== Styles ===============
    addStyles() {
        if (document.getElementById('reporting-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'reporting-styles';
        styles.textContent = `
            .reporting-page {
                padding: 1.5rem;
                max-width: 1400px;
                margin: 0 auto;
            }

            /* ===== Load View ===== */
            .load-view {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 60vh;
            }

            .load-card {
                background: white;
                border-radius: 16px;
                padding: 3rem;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }

            .load-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .load-card h2 {
                margin-bottom: 0.5rem;
                color: #1f2937;
            }

            .load-card p {
                color: #6b7280;
                margin-bottom: 2rem;
            }

            .load-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 2.5rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .load-btn:hover {
                background: #2563eb;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .load-info {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid #e5e7eb;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                color: #6b7280;
            }

            .info-icon {
                font-size: 1.1rem;
            }

            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                z-index: 1000;
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* ===== Data View ===== */
            .data-loaded {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .data-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }

            .summary-main {
                display: flex;
                align-items: baseline;
                gap: 0.75rem;
            }

            .summary-count {
                font-size: 2rem;
                font-weight: 700;
                color: #3b82f6;
            }

            .summary-label {
                font-size: 1rem;
                color: #6b7280;
            }

            .summary-stats {
                display: flex;
                gap: 0.75rem;
                margin-top: 0.5rem;
            }

            .stat-pill {
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.8rem;
                color: #4b5563;
            }

            .data-actions {
                display: flex;
                gap: 0.5rem;
            }

            .action-btn-small {
                width: 40px;
                height: 40px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .action-btn-small:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            /* Layout */
            .data-layout {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 1rem;
                min-height: calc(100vh - 280px);
            }

            .data-panel, .analysis-panel {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.25rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .panel-header h3 {
                margin: 0;
                font-size: 1rem;
                color: #374151;
            }

            .panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .data-panel .panel-content {
                padding: 0;
                overflow: hidden;
            }

            /* View Tabs */
            .view-tabs {
                display: flex;
                gap: 0.25rem;
            }

            .view-tab {
                padding: 0.4rem 0.75rem;
                border: none;
                background: transparent;
                border-radius: 6px;
                font-size: 0.8rem;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }

            .view-tab:hover {
                background: #f3f4f6;
            }

            .view-tab.active {
                background: #3b82f6;
                color: white;
            }

            /* Data Table */
            .data-table-wrapper {
                overflow-x: auto;
            }

            .data-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }

            .data-table th {
                text-align: left;
                padding: 0.75rem;
                background: #f9fafb;
                border-bottom: 2px solid #e5e7eb;
                font-weight: 600;
                color: #374151;
                white-space: nowrap;
                position: sticky;
                top: 0;
            }

            .data-table td {
                padding: 0.625rem 0.75rem;
                border-bottom: 1px solid #f3f4f6;
                color: #1f2937;
            }

            .data-table tbody tr:hover {
                background: #f9fafb;
            }

            .data-table .empty {
                color: #d1d5db;
            }

            .data-table .status-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                background: #e0f2fe;
                color: #0369a1;
                border-radius: 4px;
                font-size: 0.75rem;
            }

            .table-footer {
                text-align: center;
                padding: 0.75rem;
                color: #6b7280;
                font-size: 0.8rem;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }

            /* ===== AG Grid Container ===== */
            .ag-grid-container {
                width: 100%;
                height: 100%;
                min-height: 500px;
            }

            .data-panel .panel-content .ag-grid-container {
                height: calc(100vh - 340px);
            }

            .ag-theme-alpine {
                --ag-header-background-color: #f9fafb;
                --ag-header-foreground-color: #374151;
                --ag-border-color: #e5e7eb;
                --ag-row-hover-color: #f3f4f6;
                --ag-selected-row-background-color: #eff6ff;
            }

            /* AG Grid Status Badge */
            .ag-cell .status-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                background: #e0f2fe;
                color: #0369a1;
                border-radius: 4px;
                font-size: 0.75rem;
            }

            /* ===== Filter Toolbar ===== */
            .filter-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 1.25rem;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                gap: 1rem;
            }

            .filter-info {
                font-size: 0.9rem;
                color: #374151;
                font-weight: 500;
            }

            #filteredCount {
                color: #3b82f6;
            }

            .filter-actions {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-select {
                padding: 0.4rem 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 0.85rem;
                background: white;
                cursor: pointer;
                min-width: 160px;
            }

            .filter-select:disabled {
                background: #f3f4f6;
                color: #9ca3af;
                cursor: not-allowed;
            }

            .filter-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.4rem 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .filter-btn:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            .filter-btn.small {
                padding: 0.4rem 0.5rem;
            }

            .filter-btn.primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .filter-btn.primary:hover {
                background: #2563eb;
            }

            /* Export Dropdown */
            .export-dropdown {
                position: relative;
            }

            .export-menu {
                display: none;
                position: absolute;
                right: 0;
                top: 100%;
                margin-top: 0.25rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 100;
                min-width: 140px;
            }

            .export-menu.show {
                display: block;
            }

            .export-menu button {
                display: block;
                width: 100%;
                padding: 0.6rem 1rem;
                border: none;
                background: transparent;
                text-align: left;
                font-size: 0.85rem;
                cursor: pointer;
                transition: background 0.15s;
            }

            .export-menu button:hover {
                background: #f3f4f6;
            }

            .export-menu button:first-child {
                border-radius: 8px 8px 0 0;
            }

            .export-menu button:last-child {
                border-radius: 0 0 8px 8px;
            }

            /* Analysis Panel */
            .analysis-intro {
                color: #6b7280;
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }

            .analysis-category {
                margin-bottom: 1.25rem;
            }

            .analysis-category h4 {
                font-size: 0.8rem;
                color: #9ca3af;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            .analysis-options {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .analysis-btn {
                display: flex;
                flex-direction: column;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            }

            .analysis-btn:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .btn-title {
                font-weight: 500;
                color: #1f2937;
                font-size: 0.9rem;
            }

            .btn-desc {
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.2rem;
            }

            /* Export Section */
            .export-section {
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
            }

            .export-section h4 {
                font-size: 0.8rem;
                color: #9ca3af;
                margin-bottom: 0.5rem;
            }

            .export-buttons {
                display: flex;
                gap: 0.5rem;
            }

            .export-btn {
                flex: 1;
                padding: 0.6rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 0.85rem;
                color: #374151;
                transition: all 0.2s;
            }

            .export-btn:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            /* Analysis Result */
            .analysis-result {
                padding: 0.5rem;
            }

            .analysis-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .analysis-header h3 {
                margin: 0;
                font-size: 1.1rem;
                color: #1f2937;
            }

            .analysis-total {
                font-size: 0.85rem;
                color: #6b7280;
            }

            .analysis-chart {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .chart-row {
                display: grid;
                grid-template-columns: 150px 1fr 50px 50px;
                align-items: center;
                gap: 0.75rem;
            }

            .chart-label {
                font-size: 0.85rem;
                color: #374151;
                text-align: right;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .chart-bar-container {
                height: 24px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
            }

            .chart-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .chart-value {
                font-weight: 600;
                color: #1f2937;
                text-align: right;
            }

            .chart-percent {
                font-size: 0.8rem;
                color: #6b7280;
                text-align: right;
            }

            .back-to-data {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
            }

            .back-btn {
                padding: 0.6rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 0.85rem;
                color: #374151;
                transition: all 0.2s;
            }

            .back-btn:hover {
                background: #f3f4f6;
            }

            .no-data {
                text-align: center;
                padding: 3rem;
                color: #9ca3af;
            }

            /* Responsive */
            @media (max-width: 900px) {
                .data-layout {
                    grid-template-columns: 1fr;
                }

                .chart-row {
                    grid-template-columns: 100px 1fr 40px 40px;
                }

                .load-info {
                    flex-direction: column;
                    gap: 0.75rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentReportingPage = new AgentReportingPage();
