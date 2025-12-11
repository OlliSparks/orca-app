// ORCA 2.0 - ABL (Abnahmebereitschaft) Liste
// Analog zur Inventur-Seite mit Uebersicht + Karten-Ansicht
class ABLPage {
    constructor() {
        this.allABL = [];
        this.filteredABL = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentFilter = 'all';
        this.currentView = 'table'; // 'table' oder 'cards'
        this.currentSort = { column: 'identifier', direction: 'asc' };
        this.locationFilter = null;
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Abnahmebereitschaft (ABL)';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial HTML mit Speedometer und Filter-Chips
        app.innerHTML = `
            <div class="container">
                <!-- Info Box mit Hilfe-Icon (wie Inventur) -->
                <div class="info-widget-compact">
                    <h2>Abnahmebereitschaft (ABL)
                        <span class="help-icon" id="helpIconABL">?</span>
                    </h2>
                    <div class="help-tooltip" id="helpTooltipABL">
                        <strong>Was ist zu tun?</strong><br>
                        Pruefen Sie die Abnahmebereitschaft Ihrer Werkzeuge und bestaetigen Sie die Positionen. Bei Abweichungen: Kommentar hinterlassen.
                    </div>
                </div>

                <!-- FORTSCHRITTS-UEBERSICHT (Speedometer) -->
                <div class="progress-overview" id="progressOverview">
                    <div class="speedometer-card">
                        <div class="speedometer-container">
                            <svg class="speedometer" viewBox="0 0 200 120">
                                <path class="speedometer-bg" d="M 20 100 A 80 80 0 0 1 180 100" />
                                <path class="speedometer-progress" id="speedometerProgress" d="M 20 100 A 80 80 0 0 1 180 100" />
                            </svg>
                            <div class="speedometer-value" id="speedometerValue">0%</div>
                            <div class="speedometer-label">Gesamtfortschritt</div>
                        </div>
                        <div class="speedometer-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="statTotal">0</span>
                                <span class="stat-label">Gesamt</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="statDone">0</span>
                                <span class="stat-label">Abgeschlossen</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="statOpen">0</span>
                                <span class="stat-label">Offen</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="Suche nach Bezeichnung oder Bestell-Position..."
                        >
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="table" onclick="ablPage.setView('table')">
                                Tabelle
                            </button>
                            <button class="view-btn" data-view="cards" onclick="ablPage.setView('cards')">
                                Karten
                            </button>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-chip active" data-filter="all">
                            Alle <span class="count" id="countAll">0</span>
                        </div>
                        <div class="filter-chip" data-filter="geplant">
                            Geplant <span class="count" id="countGeplant">0</span>
                        </div>
                        <div class="filter-chip" data-filter="laufend">
                            Laufend <span class="count" id="countLaufend">0</span>
                        </div>
                        <div class="filter-chip" data-filter="durchgefuehrt">
                            Durchgefuehrt <span class="count" id="countDurchgefuehrt">0</span>
                        </div>
                        <div class="filter-chip warning" data-filter="overdue">
                            Ueberfaellig <span class="count" id="countOverdue">0</span>
                        </div>
                    </div>
                </div>

                <!-- TABLE VIEW -->
                <div class="table-container" id="tableView">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="title">Bezeichnung</th>
                                <th class="sortable" data-sort="identifier">Bestell-Position</th>
                                <th class="sortable" data-sort="status">Status</th>
                                <th class="sortable" data-sort="progress">Fortschritt</th>
                                <th class="sortable" data-sort="dueDate">Faellig</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 2rem;">
                                    Lade Daten...
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="pagination">
                        <div class="pagination-info" id="paginationInfo">
                            Lade...
                        </div>
                        <div class="pagination-controls">
                            <button class="page-btn" id="prevPage" onclick="ablPage.prevPage()">Zurueck</button>
                            <button class="page-btn" id="nextPage" onclick="ablPage.nextPage()">Weiter</button>
                        </div>
                    </div>
                </div>

                <!-- CARDS VIEW -->
                <div class="cards-container" id="cardsView" style="display: none;">
                    <div class="cards-grid" id="cardsGrid">
                        <!-- Karten werden hier eingefuegt -->
                    </div>
                    <div class="pagination">
                        <div class="pagination-info" id="cardsPaginationInfo">
                            Lade...
                        </div>
                        <div class="pagination-controls">
                            <button class="page-btn" id="cardsPrevPage" onclick="ablPage.prevPage()">Zurueck</button>
                            <button class="page-btn" id="cardsNextPage" onclick="ablPage.nextPage()">Weiter</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Location Filter Modal -->
            <div class="modal" id="locationModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Standort filtern</h3>
                        <button class="modal-close" onclick="ablPage.closeLocationFilter()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="location-list" id="locationList">
                            <!-- Standorte werden hier geladen -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ablPage.clearLocationFilter()">Filter loeschen</button>
                        <button class="btn btn-primary" onclick="ablPage.closeLocationFilter()">Schliessen</button>
                    </div>
                </div>
            </div>
        `;

        // Speedometer CSS einfuegen
        this.injectStyles();

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="ablPage.exportData()">Export</button>
            <button class="btn btn-primary" onclick="ablPage.loadFromAPI()">Aktualisieren</button>
        `;

        // Load data and setup
        await this.loadData();
        this.attachEventListeners();
    }

    injectStyles() {
        // Pruefe ob Styles bereits existieren
        if (document.getElementById('abl-page-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'abl-page-styles';
        styles.textContent = `
            /* Speedometer Styles */
            .progress-overview {
                margin-bottom: 1.5rem;
            }
            .speedometer-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 2rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .speedometer-container {
                position: relative;
                width: 200px;
                text-align: center;
            }
            .speedometer {
                width: 200px;
                height: 120px;
            }
            .speedometer-bg {
                fill: none;
                stroke: #e5e7eb;
                stroke-width: 12;
                stroke-linecap: round;
            }
            .speedometer-progress {
                fill: none;
                stroke: #22c55e;
                stroke-width: 12;
                stroke-linecap: round;
                stroke-dasharray: 251.2;
                stroke-dashoffset: 251.2;
                transition: stroke-dashoffset 1s ease-out;
            }
            .speedometer-value {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
            }
            .speedometer-label {
                font-size: 0.875rem;
                color: #6b7280;
                margin-top: 0.5rem;
            }
            .speedometer-stats {
                display: flex;
                gap: 2rem;
            }
            .stat-item {
                text-align: center;
            }
            .stat-value {
                display: block;
                font-size: 1.75rem;
                font-weight: 700;
                color: #1f2937;
            }
            .stat-label {
                font-size: 0.875rem;
                color: #6b7280;
            }

            /* View Toggle */
            .view-toggle {
                display: flex;
                background: #f3f4f6;
                border-radius: 8px;
                padding: 4px;
            }
            .view-btn {
                padding: 0.5rem 1rem;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 6px;
                font-size: 0.875rem;
                color: #6b7280;
                transition: all 0.2s;
            }
            .view-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            /* Cards Grid */
            .cards-container {
                margin-top: 1rem;
            }
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 1rem;
            }
            .abl-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
                cursor: pointer;
            }
            .abl-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .abl-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.75rem;
            }
            .abl-card-id {
                font-weight: 600;
                color: #1f2937;
            }
            .abl-card-title {
                font-size: 1rem;
                color: #374151;
                margin-bottom: 0.5rem;
                line-height: 1.4;
            }
            .abl-card-location {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 1rem;
            }
            .abl-card-progress {
                margin-bottom: 0.75rem;
            }
            .progress-bar-container {
                background: #e5e7eb;
                border-radius: 4px;
                height: 8px;
                overflow: hidden;
            }
            .progress-bar-fill {
                height: 100%;
                background: #22c55e;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.25rem;
            }
            .abl-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 0.75rem;
                border-top: 1px solid #f3f4f6;
            }
            .abl-card-due {
                font-size: 0.875rem;
                color: #6b7280;
            }
            .abl-card-due.overdue {
                color: #ef4444;
                font-weight: 500;
            }

            /* Warning Filter Chip */
            .filter-chip.warning {
                border-color: #fbbf24;
            }
            .filter-chip.warning.active {
                background: #fef3c7;
                border-color: #f59e0b;
                color: #92400e;
            }

            /* Status Badge erweiterungen */
            .status-badge.status-geplant {
                background: #e0f2fe;
                color: #0369a1;
            }
            .status-badge.status-laufend {
                background: #fef3c7;
                color: #92400e;
            }
            .status-badge.status-durchgefuehrt {
                background: #d1fae5;
                color: #065f46;
            }
            .status-badge.status-akzeptiert {
                background: #dbeafe;
                color: #1e40af;
            }
            .status-badge.status-abgeschlossen {
                background: #f3f4f6;
                color: #374151;
            }

            /* Modal Styles */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .modal-header h3 {
                margin: 0;
                font-size: 1.125rem;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
            }
            .modal-body {
                padding: 1.5rem;
                overflow-y: auto;
                flex: 1;
            }
            .modal-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
            }
            .location-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .location-item {
                padding: 0.75rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .location-item:hover {
                background: #f9fafb;
            }
            .location-item.selected {
                background: #eff6ff;
                border-color: #3b82f6;
            }
        `;
        document.head.appendChild(styles);
    }

    async loadData() {
        try {
            // Lade ABL-Daten ueber API (nutzt inventory-list mit type=ID)
            const response = await api.getABLList();
            if (response.success) {
                this.allABL = response.data;
                this.filteredABL = [...this.allABL];

                // Check for filter from sessionStorage (from dashboard navigation)
                const savedFilter = sessionStorage.getItem('ablFilter');
                if (savedFilter) {
                    this.currentFilter = savedFilter;
                    sessionStorage.removeItem('ablFilter');
                    // Aktiviere den entsprechenden Filter-Chip
                    document.querySelectorAll('.filter-chip').forEach(chip => {
                        chip.classList.remove('active');
                        if (chip.dataset.filter === savedFilter) {
                            chip.classList.add('active');
                        }
                    });
                    this.applyFilter();
                }

                this.updateStats();
                this.updateSpeedometer();
                this.renderCurrentView();
            }
        } catch (error) {
            console.error('Error loading ABL data:', error);
            this.showError('Fehler beim Laden der ABL-Daten');
        }
    }

    attachEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm) {
                    this.filteredABL = this.allABL.filter(abl =>
                        (abl.identifier || '').toLowerCase().includes(searchTerm) ||
                        (abl.title || '').toLowerCase().includes(searchTerm)
                    );
                } else {
                    this.applyFilter();
                }
                this.currentPage = 1;
                this.renderCurrentView();
            });
        }

        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.filter;
                document.getElementById('searchInput').value = '';
                this.applyFilter();
                this.currentPage = 1;
                this.renderCurrentView();
            });
        });

        // Sortierung
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTable(column);
            });
        });

        // Help icon toggle
        const helpIcon = document.getElementById('helpIconABL');
        if (helpIcon) {
            helpIcon.addEventListener('click', () => {
                document.getElementById('helpTooltipABL').classList.toggle('visible');
            });
        }
    }

    applyFilter() {
        let filtered = [...this.allABL];

        // Status-Filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'overdue') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                filtered = filtered.filter(abl => {
                    if (abl.dueDate) {
                        const dueDate = new Date(abl.dueDate);
                        return dueDate < today && abl.status !== 'abgeschlossen';
                    }
                    return false;
                });
            } else {
                filtered = filtered.filter(abl => abl.status === this.currentFilter);
            }
        }

        // Standort-Filter
        if (this.locationFilter) {
            filtered = filtered.filter(abl => abl.location === this.locationFilter);
        }

        this.filteredABL = filtered;
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredABL.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Spezialfall fuer progress (numerisch)
            if (column === 'progress') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (typeof aVal === 'string') {
                aVal = (aVal || '').toLowerCase();
                bVal = (bVal || '').toLowerCase();
            }

            if (this.currentSort.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        // Update sort icons
        document.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('asc', 'desc');
        });
        const th = document.querySelector(`th[data-sort="${column}"]`);
        if (th) {
            th.classList.add(this.currentSort.direction);
        }

        this.renderCurrentView();
    }

    updateStats() {
        const total = this.allABL.length;
        const geplant = this.allABL.filter(a => a.status === 'geplant').length;
        const laufend = this.allABL.filter(a => a.status === 'laufend').length;
        const durchgefuehrt = this.allABL.filter(a => a.status === 'durchgefuehrt').length;

        // Ueberfaellige berechnen
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = this.allABL.filter(abl => {
            if (abl.dueDate && abl.status !== 'abgeschlossen') {
                const dueDate = new Date(abl.dueDate);
                return dueDate < today;
            }
            return false;
        }).length;

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countGeplant').textContent = geplant;
        document.getElementById('countLaufend').textContent = laufend;
        document.getElementById('countDurchgefuehrt').textContent = durchgefuehrt;
        document.getElementById('countOverdue').textContent = overdue;

        // Stats fuer Speedometer
        const abgeschlossen = this.allABL.filter(a =>
            a.status === 'abgeschlossen' || a.status === 'akzeptiert' || a.status === 'durchgefuehrt'
        ).length;
        const offen = total - abgeschlossen;

        console.log('ABL Stats:', { total, abgeschlossen, offen, geplant, laufend, durchgefuehrt });

        const statTotalEl = document.getElementById('statTotal');
        const statDoneEl = document.getElementById('statDone');
        const statOpenEl = document.getElementById('statOpen');

        if (statTotalEl) statTotalEl.textContent = total;
        if (statDoneEl) statDoneEl.textContent = abgeschlossen;
        if (statOpenEl) statOpenEl.textContent = offen;
    }

    updateSpeedometer() {
        const total = this.allABL.length;
        if (total === 0) return;

        // Berechne Gesamtfortschritt basierend auf Status
        let totalProgress = 0;
        this.allABL.forEach(abl => {
            if (abl.status === 'abgeschlossen') totalProgress += 100;
            else if (abl.status === 'akzeptiert') totalProgress += 90;
            else if (abl.status === 'durchgefuehrt') totalProgress += 75;
            else if (abl.status === 'laufend') totalProgress += parseFloat(abl.progress) || 25;
            else if (abl.status === 'geplant') totalProgress += 5;
        });

        const avgProgress = Math.round(totalProgress / total);

        // Update Speedometer
        const progressEl = document.getElementById('speedometerProgress');
        const valueEl = document.getElementById('speedometerValue');

        if (progressEl && valueEl) {
            // Arc length ist 251.2 (Halbkreis)
            const offset = 251.2 - (251.2 * avgProgress / 100);
            progressEl.style.strokeDashoffset = offset;
            valueEl.textContent = avgProgress + '%';
        }
    }

    setView(view) {
        this.currentView = view;

        // Update toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide views
        document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
        document.getElementById('cardsView').style.display = view === 'cards' ? 'block' : 'none';

        this.renderCurrentView();
    }

    renderCurrentView() {
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const totalPages = Math.ceil(this.filteredABL.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageItems = this.filteredABL.slice(startIdx, endIdx);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon">&#128269;</div>
                            <div class="empty-state-text">Keine ABL-Auftraege gefunden</div>
                            <div class="empty-state-hint">Versuche einen anderen Suchbegriff oder Filter</div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageItems.map(abl => {
                const statusClass = 'status-' + abl.status;
                const statusLabel = this.getStatusLabel(abl.status);
                const isOverdue = this.isOverdue(abl);
                const progress = parseFloat(abl.progress) || 0;

                return `
                    <tr onclick="ablPage.openDetail('${abl.key}')" style="cursor: pointer;">
                        <td class="tool-name">${abl.title || '-'}</td>
                        <td class="tool-number">${abl.identifier || '-'}</td>
                        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                        <td>
                            <div class="progress-bar-container" style="width: 100px;">
                                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                            </div>
                            <span style="font-size: 0.75rem; color: #6b7280;">${progress}%</span>
                        </td>
                        <td class="${isOverdue ? 'overdue' : ''}" style="${isOverdue ? 'color: #ef4444; font-weight: 500;' : 'color: #6b7280;'}">
                            ${this.formatDate(abl.dueDate)}
                        </td>
                        <td>
                            <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="event.stopPropagation(); ablPage.openDetail('${abl.key}')">
                                Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination
        document.getElementById('paginationInfo').textContent =
            `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredABL.length)} von ${this.filteredABL.length} ABL-Auftraegen`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    renderCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        const totalPages = Math.ceil(this.filteredABL.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageItems = this.filteredABL.slice(startIdx, endIdx);

        if (pageItems.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">&#128269;</div>
                    <div class="empty-state-text">Keine ABL-Auftraege gefunden</div>
                    <div class="empty-state-hint">Versuche einen anderen Suchbegriff oder Filter</div>
                </div>
            `;
        } else {
            cardsGrid.innerHTML = pageItems.map(abl => {
                const statusClass = 'status-' + abl.status;
                const statusLabel = this.getStatusLabel(abl.status);
                const isOverdue = this.isOverdue(abl);
                const progress = parseFloat(abl.progress) || 0;

                return `
                    <div class="abl-card" onclick="ablPage.openDetail('${abl.key}')">
                        <div class="abl-card-header">
                            <span class="abl-card-title">${abl.title || '-'}</span>
                            <span class="status-badge ${statusClass}">${statusLabel}</span>
                        </div>
                        <div class="abl-card-id">Bestell-Position: ${abl.identifier || '-'}</div>
                        <div class="abl-card-progress">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                            </div>
                            <div class="progress-text">
                                <span>${progress}% abgeschlossen</span>
                                <span>${abl.positionsDone || 0}/${abl.positionsTotal || 0} Positionen</span>
                            </div>
                        </div>
                        <div class="abl-card-footer">
                            <span class="abl-card-due ${isOverdue ? 'overdue' : ''}">
                                Faellig: ${this.formatDate(abl.dueDate)}
                            </span>
                            <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="event.stopPropagation(); ablPage.openDetail('${abl.key}')">
                                Details
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Pagination
        document.getElementById('cardsPaginationInfo').textContent =
            `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredABL.length)} von ${this.filteredABL.length} ABL-Auftraegen`;
        document.getElementById('cardsPrevPage').disabled = this.currentPage <= 1;
        document.getElementById('cardsNextPage').disabled = this.currentPage >= totalPages;
    }

    getStatusLabel(status) {
        const labels = {
            'geplant': 'Geplant',
            'laufend': 'Laufend',
            'durchgefuehrt': 'Durchgefuehrt',
            'akzeptiert': 'Akzeptiert',
            'abgeschlossen': 'Abgeschlossen'
        };
        return labels[status] || status || 'Unbekannt';
    }

    isOverdue(abl) {
        if (!abl.dueDate || abl.status === 'abgeschlossen') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(abl.dueDate);
        return dueDate < today;
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCurrentView();
            window.scrollTo(0, 0);
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredABL.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCurrentView();
            window.scrollTo(0, 0);
        }
    }

    openDetail(key) {
        // Navigation zur Detail-Seite
        router.navigate('/abl-detail/' + key);
    }

    // Location Filter
    showLocationFilter() {
        const locations = [...new Set(this.allABL.map(a => a.location).filter(Boolean))].sort();
        const locationList = document.getElementById('locationList');

        locationList.innerHTML = locations.map(loc => `
            <div class="location-item ${this.locationFilter === loc ? 'selected' : ''}"
                 onclick="ablPage.selectLocation('${loc}')">
                ${loc}
            </div>
        `).join('');

        document.getElementById('locationModal').style.display = 'flex';
    }

    selectLocation(location) {
        this.locationFilter = location;
        document.querySelectorAll('.location-item').forEach(item => {
            item.classList.toggle('selected', item.textContent.trim() === location);
        });
        document.getElementById('locationFilterBtn').textContent = location;
        document.getElementById('locationFilterBtn').classList.add('active');
        this.applyFilter();
        this.renderCurrentView();
    }

    clearLocationFilter() {
        this.locationFilter = null;
        document.getElementById('locationFilterBtn').textContent = 'Standort';
        document.getElementById('locationFilterBtn').classList.remove('active');
        document.querySelectorAll('.location-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.applyFilter();
        this.renderCurrentView();
    }

    closeLocationFilter() {
        document.getElementById('locationModal').style.display = 'none';
    }

    loadFromAPI() {
        this.loadData();
    }

    exportData() {
        // CSV Export
        const headers = ['ABL-Nr.', 'Bezeichnung', 'Standort', 'Status', 'Fortschritt', 'Faellig'];
        const rows = this.filteredABL.map(abl => [
            abl.identifier || '',
            abl.title || '',
            abl.location || '',
            this.getStatusLabel(abl.status),
            (abl.progress || 0) + '%',
            this.formatDate(abl.dueDate)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(';'))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ABL_Export_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">&#9888;</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Neu laden</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const ablPage = new ABLPage();
