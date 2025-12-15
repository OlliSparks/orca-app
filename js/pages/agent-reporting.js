// ORCA 2.0 - Reporting Agent
class AgentReportingPage {
    constructor() {
        this.availableReports = [];
        this.selectedReport = null;
        this.reportData = null;
        this.isLoading = false;
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Reporting-Agent';
        document.getElementById('headerSubtitle').textContent = 'Reports abrufen und analysieren';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container agent-reporting-page">
                <div class="reporting-layout">
                    <!-- Sidebar with report types -->
                    <div class="reporting-sidebar">
                        <div class="sidebar-section">
                            <h3>Report-Typ</h3>
                            <div class="report-types">
                                <button class="report-type active" data-type="assets">
                                    <span class="type-icon">🔧</span>
                                    <span class="type-label">Fertigungsmittel</span>
                                </button>
                                <button class="report-type" data-type="inventory">
                                    <span class="type-icon">📋</span>
                                    <span class="type-label">Inventur-Reports</span>
                                </button>
                                <button class="report-type" data-type="scrapping">
                                    <span class="type-icon">🗑️</span>
                                    <span class="type-label">Verschrottungs-Reports</span>
                                </button>
                                <button class="report-type" data-type="custom">
                                    <span class="type-icon">📊</span>
                                    <span class="type-label">Eigene Auswertung</span>
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-section" id="reportFilterSection">
                            <h3>Fertigungsmittel laden</h3>
                            <p class="filter-hint">Lädt alle Werkzeuge des konfigurierten Lieferanten.</p>
                            <button class="agent-btn primary" id="loadAssetsBtn">
                                <span>Fertigungsmittel laden</span>
                            </button>
                        </div>

                        <div class="sidebar-section" id="reportListSection" style="display: none;">
                            <h3>Verfügbare Reports</h3>
                            <div class="report-list" id="reportList">
                                <!-- Dynamic content -->
                            </div>
                        </div>
                    </div>

                    <!-- Main content area -->
                    <div class="reporting-main">
                        <div class="report-container" id="reportContainer">
                            <!-- Initial state -->
                            <div class="report-placeholder" id="reportPlaceholder">
                                <div class="placeholder-icon">📊</div>
                                <h2>Reporting-Agent</h2>
                                <p>Wählen Sie einen Report-Typ und laden Sie verfügbare Reports.</p>
                                <div class="placeholder-features">
                                    <div class="feature">
                                        <span class="feature-icon">📋</span>
                                        <span>Inventur-Reports</span>
                                    </div>
                                    <div class="feature">
                                        <span class="feature-icon">🗑️</span>
                                        <span>Verschrottungs-Reports</span>
                                    </div>
                                    <div class="feature">
                                        <span class="feature-icon">📥</span>
                                        <span>PDF/XLSX Export</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Loading state -->
                            <div class="report-loading" id="reportLoading" style="display: none;">
                                <div class="loading-spinner"></div>
                                <p>Report wird geladen...</p>
                            </div>

                            <!-- Report content -->
                            <div class="report-content" id="reportContent" style="display: none;">
                                <!-- Dynamic content -->
                            </div>
                        </div>
                    </div>

                    <!-- Report actions sidebar -->
                    <div class="reporting-actions" id="reportActions" style="display: none;">
                        <div class="actions-header">
                            <h3>Aktionen</h3>
                        </div>
                        <div class="actions-content">
                            <div class="export-section">
                                <h4>Export</h4>
                                <button class="action-btn" id="exportPdfBtn">
                                    <span class="btn-icon">📄</span>
                                    <span>Als PDF</span>
                                </button>
                                <button class="action-btn" id="exportXlsxBtn">
                                    <span class="btn-icon">📊</span>
                                    <span>Als Excel</span>
                                </button>
                                <button class="action-btn" id="exportCsvBtn">
                                    <span class="btn-icon">📋</span>
                                    <span>Als CSV</span>
                                </button>
                            </div>
                            <div class="analysis-section">
                                <h4>Analyse</h4>
                                <button class="action-btn" id="summaryBtn">
                                    <span class="btn-icon">📈</span>
                                    <span>Zusammenfassung</span>
                                </button>
                                <button class="action-btn" id="compareBtn">
                                    <span class="btn-icon">🔄</span>
                                    <span>Vergleichen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Report type selection
        document.querySelectorAll('.report-type').forEach(btn => {
            btn.addEventListener('click', () => this.selectReportType(btn));
        });

        // Load assets button (default)
        document.getElementById('loadAssetsBtn')?.addEventListener('click', () => this.loadAssetsGrid());

        // Load reports button
        document.getElementById('loadReportsBtn')?.addEventListener('click', () => this.loadReports());

        // Export buttons
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportReport('PDF'));
        document.getElementById('exportXlsxBtn')?.addEventListener('click', () => this.exportReport('XLSX'));
        document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportReport('CSV'));

        // Analysis buttons
        document.getElementById('summaryBtn')?.addEventListener('click', () => this.showSummary());
        document.getElementById('compareBtn')?.addEventListener('click', () => this.compareReports());
    }

    selectReportType(btn) {
        document.querySelectorAll('.report-type').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;

        // Update filter section based on type
        const filterSection = document.getElementById('reportFilterSection');

        if (type === 'assets') {
            filterSection.innerHTML = `
                <h3>Fertigungsmittel laden</h3>
                <p class="filter-hint">Lädt alle Werkzeuge des konfigurierten Lieferanten.</p>
                <button class="agent-btn primary" id="loadAssetsBtn">
                    <span>Fertigungsmittel laden</span>
                </button>
            `;
            document.getElementById('loadAssetsBtn')?.addEventListener('click', () => this.loadAssetsGrid());
        } else if (type === 'custom') {
            filterSection.innerHTML = `
                <h3>Eigene Auswertung</h3>
                <div class="filter-group">
                    <label>Datenquelle</label>
                    <select id="dataSourceFilter" class="agent-select">
                        <option value="inventory">Inventuren</option>
                        <option value="tools">Werkzeuge</option>
                        <option value="processes">Prozesse</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Gruppierung</label>
                    <select id="groupByFilter" class="agent-select">
                        <option value="status">Nach Status</option>
                        <option value="location">Nach Standort</option>
                        <option value="supplier">Nach Lieferant</option>
                        <option value="month">Nach Monat</option>
                    </select>
                </div>
                <button class="agent-btn primary" id="generateReportBtn">
                    <span>Auswertung erstellen</span>
                </button>
            `;
            document.getElementById('generateReportBtn')?.addEventListener('click', () => this.generateCustomReport());
        } else {
            filterSection.innerHTML = `
                <h3>Filter</h3>
                <div class="filter-group">
                    <label>Status</label>
                    <select id="statusFilter" class="agent-select">
                        <option value="all">Alle</option>
                        <option value="I3">Genehmigt (I3)</option>
                        <option value="I4">Abgeschlossen (I4)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Zeitraum</label>
                    <select id="periodFilter" class="agent-select">
                        <option value="all">Alle</option>
                        <option value="month">Letzter Monat</option>
                        <option value="quarter">Letztes Quartal</option>
                        <option value="year">Letztes Jahr</option>
                    </select>
                </div>
                <button class="agent-btn primary" id="loadReportsBtn">
                    <span>Reports laden</span>
                </button>
            `;
            document.getElementById('loadReportsBtn')?.addEventListener('click', () => this.loadReports());
        }

        // Hide report list when changing type
        document.getElementById('reportListSection').style.display = 'none';

        // Reset main content
        document.getElementById('reportPlaceholder').style.display = 'flex';
        document.getElementById('reportContent').style.display = 'none';
        document.getElementById('reportActions').style.display = 'none';
    }

    async loadAssetsGrid() {
        this.showLoading(true);

        try {
            // Get supplier number from config
            const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
            const supplierNumber = config.supplierNumber || config.supplierId || config.companyKey;

            if (!supplierNumber) {
                this.showError('Bitte konfigurieren Sie eine Lieferantennummer in den Einstellungen.');
                this.showLoading(false);
                return;
            }

            console.log('Loading assets grid for supplier:', supplierNumber);
            const data = await api.getAssetsGridReport(supplierNumber);

            this.reportData = data;
            this.renderAssetsGrid(data);

            // Show actions sidebar
            document.getElementById('reportActions').style.display = 'flex';

        } catch (error) {
            console.error('Error loading assets grid:', error);
            this.showError('Fehler beim Laden der Fertigungsmittel: ' + error.message);
        }

        this.showLoading(false);
    }

    renderAssetsGrid(data) {
        const container = document.getElementById('reportContent');
        const placeholder = document.getElementById('reportPlaceholder');

        placeholder.style.display = 'none';
        container.style.display = 'block';

        const gridData = data.gridData || data.content || data || [];
        const totalCount = gridData.length;

        // Detect column names from first item
        const firstItem = gridData[0] || {};
        const columns = Object.keys(firstItem);

        // Prioritize important columns
        const priorityCols = ['assetNumber', 'number', 'name', 'description', 'status', 'location', 'responsible'];
        const sortedColumns = [
            ...priorityCols.filter(c => columns.includes(c)),
            ...columns.filter(c => !priorityCols.includes(c))
        ].slice(0, 8); // Max 8 columns

        container.innerHTML = `
            <div class="report-header-bar">
                <h2>Fertigungsmittel</h2>
                <span class="report-date">${totalCount} Werkzeuge | Stand: ${new Date().toLocaleDateString('de-DE')}</span>
            </div>
            <div class="assets-grid-container">
                <table class="assets-grid-table">
                    <thead>
                        <tr>
                            ${sortedColumns.map(col => `<th>${this.formatColumnName(col)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${gridData.map(item => `
                            <tr>
                                ${sortedColumns.map(col => `<td>${this.formatCellValue(item[col], col)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Store for export
        this.assetsGridData = gridData;
    }

    formatColumnName(col) {
        const names = {
            assetNumber: 'Asset-Nr.',
            number: 'Nummer',
            name: 'Name',
            description: 'Beschreibung',
            status: 'Status',
            location: 'Standort',
            responsible: 'Verantwortlich',
            lastInventory: 'Letzte Inventur',
            supplier: 'Lieferant',
            type: 'Typ'
        };
        return names[col] || col;
    }

    formatCellValue(value, col) {
        if (value === null || value === undefined) return '-';

        if (col === 'status') {
            return `<span class="status-badge ${value}">${value}</span>`;
        }

        if (typeof value === 'object') {
            return value.name || value.title || JSON.stringify(value);
        }

        return String(value);
    }

    async loadReports() {
        const activeType = document.querySelector('.report-type.active')?.dataset.type || 'inventory';
        const status = document.getElementById('statusFilter')?.value || 'all';

        this.showLoading(true);

        try {
            let reports = [];

            if (activeType === 'inventory') {
                // Load inventories that have reports
                const statusFilter = status === 'all' ? 'I3,I4' : status;
                const response = await api.getInventoryList({ status: statusFilter, limit: 50 });
                const inventories = response?.data || response || [];

                reports = inventories.map(inv => ({
                    key: inv.key,
                    type: 'inventory',
                    title: `Inventur ${inv.number || inv.key}`,
                    subtitle: inv.supplier?.name || inv.supplierName || 'Unbekannt',
                    status: inv.status,
                    date: inv.dueDate || inv.modified,
                    positionCount: inv.positionCount || inv.positions?.length || 0
                }));
            } else if (activeType === 'scrapping') {
                // Load scrapping processes that have reports
                const response = await api.getVerschrottungList({ limit: 50 });
                const scrappings = response?.data || response || [];

                reports = scrappings.map(scr => ({
                    key: scr.key || scr.processKey,
                    type: 'scrapping',
                    title: `Verschrottung ${scr.number || scr.key}`,
                    subtitle: scr.toolName || scr.asset?.name || 'Werkzeug',
                    status: scr.status,
                    date: scr.dueDate || scr.modified
                }));
            }

            this.availableReports = reports;
            this.renderReportList(reports);

        } catch (error) {
            console.error('Error loading reports:', error);
            this.showError('Fehler beim Laden der Reports: ' + error.message);
        }

        this.showLoading(false);
    }

    renderReportList(reports) {
        const listSection = document.getElementById('reportListSection');
        const listContainer = document.getElementById('reportList');

        if (reports.length === 0) {
            listContainer.innerHTML = `
                <div class="no-reports">
                    <span class="no-reports-icon">📭</span>
                    <p>Keine Reports verfügbar</p>
                </div>
            `;
        } else {
            listContainer.innerHTML = reports.map(report => `
                <div class="report-item" data-key="${report.key}" data-type="${report.type}">
                    <div class="report-item-icon">${report.type === 'inventory' ? '📋' : '🗑️'}</div>
                    <div class="report-item-info">
                        <div class="report-item-title">${report.title}</div>
                        <div class="report-item-subtitle">${report.subtitle}</div>
                    </div>
                    <div class="report-item-meta">
                        <span class="status-badge ${report.status}">${this.getStatusLabel(report.status)}</span>
                    </div>
                </div>
            `).join('');

            // Add click handlers
            listContainer.querySelectorAll('.report-item').forEach(item => {
                item.addEventListener('click', () => {
                    const key = item.dataset.key;
                    const type = item.dataset.type;
                    this.loadReport(key, type);

                    // Mark as selected
                    listContainer.querySelectorAll('.report-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                });
            });
        }

        listSection.style.display = 'block';
    }

    getStatusLabel(status) {
        const labels = {
            'I0': 'Entwurf',
            'I1': 'Versendet',
            'I2': 'Gemeldet',
            'I3': 'Genehmigt',
            'I4': 'Abgeschlossen',
            'OPEN': 'Offen',
            'COMPLETED': 'Abgeschlossen',
            'DONE': 'Erledigt'
        };
        return labels[status] || status || 'Unbekannt';
    }

    async loadReport(key, type) {
        this.showLoading(true);
        this.selectedReport = { key, type };

        try {
            let reportData;

            if (type === 'inventory') {
                reportData = await api.getInventoryReport(key, 'HTML');
            } else if (type === 'scrapping') {
                reportData = await api.getScrappingReport(key, 'HTML');
            }

            this.reportData = reportData;
            this.renderReport(reportData);

            // Show actions sidebar
            document.getElementById('reportActions').style.display = 'flex';

        } catch (error) {
            console.error('Error loading report:', error);
            this.showError('Fehler beim Laden des Reports: ' + error.message);
        }

        this.showLoading(false);
    }

    renderReport(data) {
        const container = document.getElementById('reportContent');
        const placeholder = document.getElementById('reportPlaceholder');

        placeholder.style.display = 'none';
        container.style.display = 'block';

        // Check if we have HTML content or structured data
        if (data.content && typeof data.content === 'string') {
            // HTML content from API - render in iframe for isolation
            container.innerHTML = `
                <div class="report-header-bar">
                    <h2>${data.title || 'Report'}</h2>
                    <span class="report-date">Erstellt: ${new Date(data.generatedAt || Date.now()).toLocaleDateString('de-DE')}</span>
                </div>
                <div class="report-html-container">
                    <iframe id="reportFrame" srcdoc="${this.escapeHtml(data.content)}" frameborder="0"></iframe>
                </div>
            `;
        } else if (data.summary) {
            // Structured data - render as cards
            container.innerHTML = `
                <div class="report-header-bar">
                    <h2>${data.title || 'Report'}</h2>
                    <span class="report-date">Erstellt: ${new Date(data.generatedAt || Date.now()).toLocaleDateString('de-DE')}</span>
                </div>
                <div class="report-summary">
                    <div class="summary-cards">
                        ${this.renderSummaryCards(data.summary)}
                    </div>
                </div>
                ${data.positions ? `
                <div class="report-details">
                    <h3>Positionen</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Nummer</th>
                                <th>Status</th>
                                <th>Standort</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.positions.map(p => `
                                <tr>
                                    <td>${p.number || '-'}</td>
                                    <td><span class="status-badge ${p.status}">${this.getStatusLabel(p.status)}</span></td>
                                    <td>${p.location || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            `;
        } else {
            // Fallback
            container.innerHTML = `
                <div class="report-header-bar">
                    <h2>Report</h2>
                </div>
                <div class="report-raw">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
        }
    }

    renderSummaryCards(summary) {
        const cards = [];

        if (summary.totalPositions !== undefined) {
            cards.push({
                label: 'Gesamt',
                value: summary.totalPositions,
                icon: '📋'
            });
        }
        if (summary.completed !== undefined) {
            cards.push({
                label: 'Abgeschlossen',
                value: summary.completed,
                icon: '✅',
                color: 'green'
            });
        }
        if (summary.pending !== undefined) {
            cards.push({
                label: 'Offen',
                value: summary.pending,
                icon: '⏳',
                color: 'orange'
            });
        }
        if (summary.missing !== undefined) {
            cards.push({
                label: 'Fehlend',
                value: summary.missing,
                icon: '❌',
                color: 'red'
            });
        }
        if (summary.completionRate !== undefined) {
            cards.push({
                label: 'Quote',
                value: summary.completionRate + '%',
                icon: '📊',
                color: summary.completionRate >= 80 ? 'green' : summary.completionRate >= 50 ? 'orange' : 'red'
            });
        }

        return cards.map(card => `
            <div class="summary-card ${card.color || ''}">
                <span class="card-icon">${card.icon}</span>
                <span class="card-value">${card.value}</span>
                <span class="card-label">${card.label}</span>
            </div>
        `).join('');
    }

    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    async exportReport(format) {
        // Check if we have assets grid data to export
        if (this.assetsGridData && this.assetsGridData.length > 0) {
            this.exportAssetsGrid(format);
            return;
        }

        if (!this.selectedReport) {
            alert('Bitte wählen Sie zuerst einen Report aus.');
            return;
        }

        this.showLoading(true);

        try {
            let blob;
            const { key, type } = this.selectedReport;

            if (type === 'inventory') {
                blob = await api.getInventoryReport(key, format);
            } else if (type === 'scrapping') {
                blob = await api.getScrappingReport(key, format);
            }

            // Download the blob
            if (blob instanceof Blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report-${key}.${format.toLowerCase()}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // For HTML/text formats, create blob from content
                const content = blob.content || JSON.stringify(blob, null, 2);
                const textBlob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(textBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report-${key}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error('Error exporting report:', error);
            this.showError('Fehler beim Export: ' + error.message);
        }

        this.showLoading(false);
    }

    exportAssetsGrid(format) {
        const data = this.assetsGridData;
        const timestamp = new Date().toISOString().split('T')[0];

        if (format === 'CSV') {
            // Export as CSV
            const columns = Object.keys(data[0] || {});
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

        } else if (format === 'XLSX' && typeof XLSX !== 'undefined') {
            // Export as Excel using SheetJS
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Fertigungsmittel');
            XLSX.writeFile(wb, `fertigungsmittel-${timestamp}.xlsx`);

        } else {
            // Fallback: JSON export
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

    async generateCustomReport() {
        const dataSource = document.getElementById('dataSourceFilter')?.value || 'inventory';
        const groupBy = document.getElementById('groupByFilter')?.value || 'status';

        this.showLoading(true);

        try {
            // Load data based on source
            let data = [];
            if (dataSource === 'inventory') {
                const response = await api.getInventoryList({ status: 'I0,I1,I2,I3,I4', limit: 1000 });
                data = response?.data || response || [];
            } else if (dataSource === 'tools') {
                const response = await api.getAssetList({ limit: 1000 });
                data = response?.data || response || [];
            } else if (dataSource === 'processes') {
                const response = await api.getVerlagerungList({ limit: 1000 });
                data = response?.data || response || [];
            }

            // Group data
            const grouped = this.groupData(data, groupBy);

            // Render custom report
            this.renderCustomReport(grouped, dataSource, groupBy);

            // Show actions sidebar
            document.getElementById('reportActions').style.display = 'flex';

        } catch (error) {
            console.error('Error generating custom report:', error);
            this.showError('Fehler bei der Auswertung: ' + error.message);
        }

        this.showLoading(false);
    }

    groupData(data, groupBy) {
        const grouped = {};

        data.forEach(item => {
            let key;
            switch (groupBy) {
                case 'status':
                    key = item.status || 'Unbekannt';
                    break;
                case 'location':
                    key = item.location?.title || item.locationName || 'Unbekannt';
                    break;
                case 'supplier':
                    key = item.supplier?.name || item.supplierName || 'Unbekannt';
                    break;
                case 'month':
                    const date = new Date(item.dueDate || item.created || item.modified);
                    key = date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' });
                    break;
                default:
                    key = 'Alle';
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        return grouped;
    }

    renderCustomReport(grouped, dataSource, groupBy) {
        const container = document.getElementById('reportContent');
        const placeholder = document.getElementById('reportPlaceholder');

        placeholder.style.display = 'none';
        container.style.display = 'block';

        const groupLabels = {
            status: 'Status',
            location: 'Standort',
            supplier: 'Lieferant',
            month: 'Monat'
        };

        const sourceLabels = {
            inventory: 'Inventuren',
            tools: 'Werkzeuge',
            processes: 'Prozesse'
        };

        const total = Object.values(grouped).reduce((sum, items) => sum + items.length, 0);

        container.innerHTML = `
            <div class="report-header-bar">
                <h2>Eigene Auswertung: ${sourceLabels[dataSource]} nach ${groupLabels[groupBy]}</h2>
                <span class="report-date">Erstellt: ${new Date().toLocaleDateString('de-DE')}</span>
            </div>
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <span class="card-icon">📊</span>
                        <span class="card-value">${total}</span>
                        <span class="card-label">Gesamt</span>
                    </div>
                    <div class="summary-card">
                        <span class="card-icon">📁</span>
                        <span class="card-value">${Object.keys(grouped).length}</span>
                        <span class="card-label">Gruppen</span>
                    </div>
                </div>
            </div>
            <div class="report-groups">
                ${Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([key, items]) => `
                    <div class="report-group">
                        <div class="group-header">
                            <span class="group-name">${key}</span>
                            <span class="group-count">${items.length} (${Math.round(items.length / total * 100)}%)</span>
                        </div>
                        <div class="group-bar">
                            <div class="group-bar-fill" style="width: ${items.length / total * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showSummary() {
        if (!this.reportData) return;

        alert('Zusammenfassung:\n\n' + JSON.stringify(this.reportData.summary || this.reportData, null, 2));
    }

    compareReports() {
        alert('Vergleichsfunktion wird noch entwickelt.\n\nHier können Sie mehrere Reports vergleichen.');
    }

    showLoading(show) {
        this.isLoading = show;
        const loading = document.getElementById('reportLoading');
        const placeholder = document.getElementById('reportPlaceholder');
        const content = document.getElementById('reportContent');

        if (show) {
            loading.style.display = 'flex';
            placeholder.style.display = 'none';
            content.style.display = 'none';
        } else {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const container = document.getElementById('reportContent');
        const placeholder = document.getElementById('reportPlaceholder');

        placeholder.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = `
            <div class="report-error">
                <span class="error-icon">⚠️</span>
                <p>${message}</p>
                <button class="agent-btn secondary" onclick="document.getElementById('reportPlaceholder').style.display='flex'; document.getElementById('reportContent').style.display='none';">
                    Zurück
                </button>
            </div>
        `;
    }

    addStyles() {
        if (document.getElementById('agent-reporting-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-reporting-styles';
        styles.textContent = `
            .agent-reporting-page {
                height: calc(100vh - 140px);
                padding: 1rem;
            }

            .reporting-layout {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 1rem;
                height: 100%;
            }

            .reporting-layout.with-actions {
                grid-template-columns: 280px 1fr 200px;
            }

            /* Sidebar */
            .reporting-sidebar {
                background: white;
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                overflow-y: auto;
            }

            .sidebar-section h3,
            .sidebar-section h4 {
                font-size: 0.9rem;
                color: #374151;
                margin-bottom: 0.75rem;
            }

            .report-types {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .report-type {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: left;
            }

            .report-type:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .report-type.active {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .type-icon {
                font-size: 1.25rem;
            }

            .type-label {
                font-size: 0.875rem;
                color: #374151;
            }

            .filter-group {
                margin-bottom: 0.75rem;
            }

            .filter-group label {
                display: block;
                font-size: 0.75rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .agent-select {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
                background: white;
            }

            .agent-btn {
                width: 100%;
                padding: 0.75rem;
                border: none;
                border-radius: 8px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .agent-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .agent-btn.primary:hover {
                background: #2563eb;
            }

            .agent-btn.secondary {
                background: #f3f4f6;
                color: #374151;
            }

            .agent-btn.secondary:hover {
                background: #e5e7eb;
            }

            /* Report list */
            .report-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-height: 300px;
                overflow-y: auto;
            }

            .report-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: #f9fafb;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .report-item:hover {
                background: #eff6ff;
                border-color: #bfdbfe;
            }

            .report-item.selected {
                background: #dbeafe;
                border-color: #3b82f6;
            }

            .report-item-icon {
                font-size: 1.25rem;
            }

            .report-item-info {
                flex: 1;
                min-width: 0;
            }

            .report-item-title {
                font-size: 0.875rem;
                font-weight: 500;
                color: #1f2937;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .report-item-subtitle {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .status-badge {
                display: inline-block;
                padding: 0.125rem 0.5rem;
                border-radius: 9999px;
                font-size: 0.625rem;
                font-weight: 500;
                background: #e5e7eb;
                color: #374151;
            }

            .status-badge.I3, .status-badge.COMPLETED {
                background: #dcfce7;
                color: #166534;
            }

            .status-badge.I4, .status-badge.DONE {
                background: #dbeafe;
                color: #1e40af;
            }

            .no-reports {
                text-align: center;
                padding: 2rem 1rem;
                color: #6b7280;
            }

            .no-reports-icon {
                font-size: 2rem;
                display: block;
                margin-bottom: 0.5rem;
            }

            /* Main content */
            .reporting-main {
                background: white;
                border-radius: 12px;
                overflow: hidden;
            }

            .report-container {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .report-placeholder {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                text-align: center;
                color: #6b7280;
            }

            .placeholder-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .placeholder-features {
                display: flex;
                gap: 2rem;
                margin-top: 2rem;
            }

            .feature {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }

            .feature-icon {
                font-size: 1.5rem;
            }

            .report-loading {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .report-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .report-header-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 1rem;
            }

            .report-header-bar h2 {
                margin: 0;
                font-size: 1.25rem;
                color: #1f2937;
            }

            .report-date {
                font-size: 0.875rem;
                color: #6b7280;
            }

            .report-html-container {
                flex: 1;
                min-height: 400px;
            }

            .report-html-container iframe {
                width: 100%;
                height: 100%;
                min-height: 400px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }

            .report-summary {
                margin-bottom: 1.5rem;
            }

            .summary-cards {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .summary-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1rem 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
                min-width: 100px;
            }

            .summary-card.green {
                background: #dcfce7;
            }

            .summary-card.orange {
                background: #fef3c7;
            }

            .summary-card.red {
                background: #fee2e2;
            }

            .card-icon {
                font-size: 1.5rem;
                margin-bottom: 0.25rem;
            }

            .card-value {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1f2937;
            }

            .card-label {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .report-table {
                width: 100%;
                border-collapse: collapse;
            }

            .report-table th,
            .report-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }

            .report-table th {
                background: #f9fafb;
                font-weight: 500;
                font-size: 0.875rem;
                color: #374151;
            }

            .report-groups {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .report-group {
                background: #f9fafb;
                border-radius: 8px;
                padding: 1rem;
            }

            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .group-name {
                font-weight: 500;
                color: #1f2937;
            }

            .group-count {
                font-size: 0.875rem;
                color: #6b7280;
            }

            .group-bar {
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }

            .group-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #60a5fa);
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .report-error {
                text-align: center;
                padding: 3rem;
            }

            .error-icon {
                font-size: 3rem;
                display: block;
                margin-bottom: 1rem;
            }

            /* Actions sidebar */
            .reporting-actions {
                background: white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                padding: 1rem;
            }

            .actions-header {
                padding-bottom: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 1rem;
            }

            .actions-header h3 {
                margin: 0;
                font-size: 0.9rem;
                color: #374151;
            }

            .actions-content {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .export-section h4,
            .analysis-section h4 {
                font-size: 0.75rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
            }

            .action-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                width: 100%;
                padding: 0.625rem 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.875rem;
                color: #374151;
                margin-bottom: 0.5rem;
            }

            .action-btn:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }

            .btn-icon {
                font-size: 1rem;
            }

            /* Assets Grid Table */
            .assets-grid-container {
                overflow-x: auto;
                max-height: calc(100vh - 280px);
            }

            .assets-grid-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.875rem;
            }

            .assets-grid-table th {
                position: sticky;
                top: 0;
                background: #f3f4f6;
                padding: 0.75rem 1rem;
                text-align: left;
                font-weight: 600;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
                white-space: nowrap;
            }

            .assets-grid-table td {
                padding: 0.625rem 1rem;
                border-bottom: 1px solid #e5e7eb;
                color: #1f2937;
            }

            .assets-grid-table tbody tr:hover {
                background: #f9fafb;
            }

            .assets-grid-table tbody tr:nth-child(even) {
                background: #fafafa;
            }

            .assets-grid-table tbody tr:nth-child(even):hover {
                background: #f3f4f6;
            }

            /* Filter hint */
            .filter-hint {
                font-size: 0.8rem;
                color: #6b7280;
                margin-bottom: 1rem;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentReportingPage = new AgentReportingPage();
