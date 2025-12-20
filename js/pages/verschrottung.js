// ORCA 2.0 - Verschrottung Liste
// Strukturiertes Ende. Vollständig dokumentiert.
class VerschrottungPage {
    constructor() {
        this.allItems = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentFilter = 'all';
        this.currentSort = { column: 'title', direction: 'asc' };
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Verschrottung';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial HTML
        app.innerHTML = `
            <div class="container">
                <!-- Info Box mit Hilfe-Icon (wie Inventur) -->
                <div class="info-widget-compact">
                    <h2>Verschrottung
                        <span class="help-icon" id="helpIconScrap">?</span>
                    </h2>
                    <div class="help-tooltip" id="helpTooltipScrap">
                        <strong>Was ist zu tun?</strong><br>
                        Prüfen Sie genehmigte Verschrottungen und bestätigen Sie die Durchführung. Dokumentieren Sie den Abschluss.
                    </div>
                </div>

                <!-- FORTSCHRITTS-UEBERSICHT -->
                <div class="progress-overview" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #f97316;" id="statTotalScrap">0</div>
                        <div class="stat-label">Gesamt</div>
                    </div>
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #f59e0b;" id="statOffenScrap">0</div>
                        <div class="stat-label">Offen</div>
                    </div>
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #22c55e;" id="statAbgeschlossenScrap">0</div>
                        <div class="stat-label">Abgeschlossen</div>
                    </div>
                </div>

                
                <!-- KI-Agent Button -->
                <div class="agent-link-wrapper" style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                    <button class="agent-btn-integrated" id="agentVerschrottungBtn">
                        <span class="agent-btn-icon">🤖</span>
                        <div class="agent-btn-content">
                            <strong>KI-Agent</strong>
                            <small>Verschrottung</small>
                        </div>
                    </button>
                </div>

                <!-- API MODE INDICATOR -->
                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="Suche nach Bezeichnung, Vertragspartner, Teilenummer..."
                        >
                        <button class="btn btn-neutral" onclick="verschrottungPage.exportData()">
                            Export
                        </button>
                    </div>

                    <div class="filter-section">
                        <div class="filter-chip active" data-filter="all">
                            Alle <span class="count" id="countAll">0</span>
                        </div>
                        <div class="filter-chip" data-filter="offen">
                            Offen <span class="count" id="countOffen">0</span>
                        </div>
                        <div class="filter-chip" data-filter="in-bearbeitung">
                            In Bearbeitung <span class="count" id="countInBearbeitung">0</span>
                        </div>
                        <div class="filter-chip" data-filter="genehmigt">
                            Genehmigt <span class="count" id="countGenehmigt">0</span>
                        </div>
                        <div class="filter-chip" data-filter="abgeschlossen">
                            Abgeschlossen <span class="count" id="countAbgeschlossen">0</span>
                        </div>
                    </div>
                </div>

                <!-- TABLE -->
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="title">Bezeichnung</th>
                                <th class="sortable" data-sort="contractPartner">Vertragspartner</th>
                                <th class="sortable" data-sort="baureihe">Baureihe</th>
                                <th class="sortable" data-sort="partNumber">Teilenummer</th>
                                <th class="sortable" data-sort="location">Standort</th>
                                <th class="sortable" data-sort="status">Status</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 2rem;">
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
                            <button class="page-btn" id="prevPage" onclick="verschrottungPage.prevPage()">Zurück</button>
                            <button class="page-btn" id="nextPage" onclick="verschrottungPage.nextPage()">Weiter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/settings')">Einstellungen</button>
        `;

        // Inject styles
        this.injectStyles();

        // Show API mode
        // API indicator removed

        // Load data and setup
        await this.loadData();
        this.attachEventListeners();
    }

    updateApiModeIndicator() {
        const indicator = document.getElementById('apiModeIndicator');
        const icon = document.getElementById('apiModeIcon');
        const text = document.getElementById('apiModeText');

        if (api.mode === 'live') {
            indicator.style.background = '#d1fae5';
            indicator.style.color = '#065f46';
            icon.style.color = '#22c55e';
            text.textContent = 'Live-API verbunden';
        } else {
            indicator.style.background = '#fef3c7';
            indicator.style.color = '#92400e';
            icon.style.color = '#f59e0b';
            text.textContent = 'Mock-Modus (Testdaten)';
        }
    }

    injectStyles() {
        if (document.getElementById('verschrottung-page-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'verschrottung-page-styles';
        styles.textContent = `
            .status-badge.status-offen {
                background: #fef3c7;
                color: #92400e;
            }
            .status-badge.status-in-bearbeitung {
                background: #dbeafe;
                color: #1e40af;
            }
            .status-badge.status-genehmigt {
                background: #d1fae5;
                color: #065f46;
            }
            .status-badge.status-abgeschlossen {
                background: #f3f4f6;
                color: #374151;
            }
        `;
        document.head.appendChild(styles);
    }

    async loadData() {
        try {
            const response = await api.getVerschrottungList();
            if (response.success) {
                this.allItems = response.data;
                this.filteredItems = [...this.allItems];

                // Check for filter from sessionStorage
                const savedFilter = sessionStorage.getItem('verschrottungFilter');
                if (savedFilter) {
                    this.currentFilter = savedFilter;
                    sessionStorage.removeItem('verschrottungFilter');
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
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading Verschrottung data:', error);
            this.showError('Fehler beim Laden der Daten');
        }
    }

    attachEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm) {
                    this.filteredItems = this.allItems.filter(item =>
                        (item.title || '').toLowerCase().includes(searchTerm) ||
                        (item.contractPartner || '').toLowerCase().includes(searchTerm) ||
                        (item.partNumber || '').toLowerCase().includes(searchTerm) ||
                        (item.baureihe || '').toLowerCase().includes(searchTerm) ||
                        (item.location || '').toLowerCase().includes(searchTerm)
                    );
                } else {
                    this.applyFilter();
                }
                this.currentPage = 1;
                this.renderTable();
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
                this.renderTable();
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
        const helpIcon = document.getElementById('helpIconScrap');
        if (helpIcon) {
            helpIcon.addEventListener('click', () => {
                document.getElementById('helpTooltipScrap').classList.toggle('visible');
            });

        // Agent Button Event Listener
        const agentBtn = document.getElementById('agentVerschrottungBtn');
        if (agentBtn) {
            agentBtn.addEventListener('click', () => router.navigate('/agent-verschrottung'));
        }
        }
    }

    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredItems = [...this.allItems];
        } else {
            this.filteredItems = this.allItems.filter(item => item.status === this.currentFilter);
        }
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredItems.sort((a, b) => {
            let aVal = a[column] || '';
            let bVal = b[column] || '';

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
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
        if (th) th.classList.add(this.currentSort.direction);

        this.renderTable();
    }

    updateStats() {
        const total = this.allItems.length;
        const offen = this.allItems.filter(t => t.status === 'offen').length;
        const inBearbeitung = this.allItems.filter(t => t.status === 'in-bearbeitung').length;
        const genehmigt = this.allItems.filter(t => t.status === 'genehmigt').length;
        const abgeschlossen = this.allItems.filter(t => t.status === 'abgeschlossen').length;

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countOffen').textContent = offen;
        document.getElementById('countInBearbeitung').textContent = inBearbeitung;
        document.getElementById('countGenehmigt').textContent = genehmigt;
        document.getElementById('countAbgeschlossen').textContent = abgeschlossen;

        // Update progress overview stats
        const statTotal = document.getElementById('statTotalScrap');
        const statOffen = document.getElementById('statOffenScrap');
        const statAbgeschlossen = document.getElementById('statAbgeschlossenScrap');

        if (statTotal) statTotal.textContent = total;
        if (statOffen) statOffen.textContent = offen + inBearbeitung + genehmigt;
        if (statAbgeschlossen) statAbgeschlossen.textContent = abgeschlossen;
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageItems = this.filteredItems.slice(startIdx, endIdx);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">&#128269;</div>
                            <div class="empty-state-text">Keine Verschrottungen gefunden</div>
                            <div class="empty-state-hint">Versuche einen anderen Suchbegriff oder Filter</div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageItems.map(item => {
                const statusClass = 'status-' + item.status;
                const statusLabel = this.getStatusLabel(item.status);

                return `
                    <tr onclick="verschrottungPage.openDetail('${item.key}')" style="cursor: pointer;">
                        <td class="tool-name">${item.title || '-'}</td>
                        <td>${item.contractPartner || '-'}</td>
                        <td>${item.baureihe || '-'}</td>
                        <td class="tool-number">${item.partNumber || '-'}</td>
                        <td>${item.location || '-'}</td>
                        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                        <td>
                            <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="event.stopPropagation(); verschrottungPage.openDetail('${item.key}')">
                                Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination
        document.getElementById('paginationInfo').textContent =
            `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredItems.length)} von ${this.filteredItems.length} Verschrottungen`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    getStatusLabel(status) {
        const labels = {
            'offen': 'Offen',
            'in-bearbeitung': 'In Bearbeitung',
            'genehmigt': 'Genehmigt',
            'abgeschlossen': 'Abgeschlossen'
        };
        return labels[status] || status || 'Unbekannt';
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    }

    openDetail(key) {
        router.navigate('/verschrottung-detail/' + key);
    }

    exportData() {
        // CSV Export
        const headers = ['Bezeichnung', 'Vertragspartner', 'Baureihe', 'Teilenummer', 'Standort', 'Status'];
        const rows = this.filteredItems.map(item => [
            item.title || '',
            item.contractPartner || '',
            item.baureihe || '',
            item.partNumber || '',
            item.location || '',
            this.getStatusLabel(item.status)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(';'))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Verschrottung_Export_' + new Date().toISOString().split('T')[0] + '.csv';
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
const verschrottungPage = new VerschrottungPage();
