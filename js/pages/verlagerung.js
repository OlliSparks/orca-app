// ORCA 2.0 - Verlagerung Liste
class VerlagerungPage {
    constructor() {
        this.allTools = [];
        this.filteredTools = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentFilter = 'all';
        this.currentSort = { column: 'number', direction: 'asc' };
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'ORCA 2.0 - Verlagerungs Service';
        document.getElementById('headerSubtitle').textContent = 'Verlagerungs Management';

        // Show header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'flex';
        }

        // Initial HTML
        app.innerHTML = `
            <div class="container">
                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="🔍 Suche nach Verlagerungs-Nr., Name, Lieferant oder Standort..."
                        >
                        <button class="btn btn-secondary" onclick="verlagerungPage.loadFromAPI()">
                            🔄 API Laden
                        </button>
                        <button class="btn btn-neutral" onclick="verlagerungPage.exportData()">
                            📥 Export
                        </button>
                    </div>

                    <div class="filter-section">
                        <div class="filter-chip active" data-filter="all">
                            Alle <span class="count" id="countAll">0</span>
                        </div>
                        <div class="filter-chip" data-filter="offen">
                            Offen <span class="count" id="countOffen">0</span>
                        </div>
                        <div class="filter-chip" data-filter="feinplanung">
                            Feinplanung <span class="count" id="countFeinplanung">0</span>
                        </div>
                        <div class="filter-chip" data-filter="in-inventur">
                            in Bearbeitung <span class="count" id="countInInventur">0</span>
                        </div>
                    </div>
                </div>

                <!-- TABLE -->
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="number">Werkzeugnummer</th>
                                <th class="sortable" data-sort="name">Werkzeug</th>
                                <th class="sortable" data-sort="supplier">Lieferant</th>
                                <th class="sortable" data-sort="location">Standort</th>
                                <th class="sortable" data-sort="status">Status</th>
                                <th>Letzte Verlagerung</th>
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
                            <button class="page-btn" id="prevPage" onclick="verlagerungPage.prevPage()">◀ Zurück</button>
                            <button class="page-btn" id="nextPage" onclick="verlagerungPage.nextPage()">Weiter ▶</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="verlagerungPage.showSettings()">⚙️ Einstellungen</button>
            <button class="btn btn-primary" onclick="verlagerungPage.showAddModal()">➕ Neue Verlagerung</button>
        `;

        // Load data and setup
        await this.loadData();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const response = await api.getVerlagerungList();
            if (response.success) {
                this.allTools = response.data;
                this.filteredTools = [...this.allTools];
                this.updateStats();
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading Verlagerung data:', error);
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
                    this.filteredTools = this.allTools.filter(tool =>
                        tool.number.toLowerCase().includes(searchTerm) ||
                        tool.name.toLowerCase().includes(searchTerm) ||
                        tool.supplier.toLowerCase().includes(searchTerm) ||
                        tool.location.toLowerCase().includes(searchTerm)
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
    }

    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredTools = [...this.allTools];
        } else {
            this.filteredTools = this.allTools.filter(tool => tool.status === this.currentFilter);
        }
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredTools.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

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
        th.classList.add(this.currentSort.direction);

        this.renderTable();
    }

    updateStats() {
        const total = this.allTools.length;
        const offen = this.allTools.filter(t => t.status === 'offen').length;
        const feinplanung = this.allTools.filter(t => t.status === 'feinplanung').length;
        const inInventur = this.allTools.filter(t => t.status === 'in-inventur').length;
        const suppliers = new Set(this.allTools.map(t => t.supplier)).size;

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countOffen').textContent = offen;
        document.getElementById('countFeinplanung').textContent = feinplanung;
        document.getElementById('countInInventur').textContent = inInventur;

        // Update header stats
        const statTotal = document.getElementById('statTotal');
        const statActive = document.getElementById('statActive');
        const statSuppliers = document.getElementById('statSuppliers');

        if (statTotal) statTotal.textContent = total;
        if (statActive) statActive.textContent = inInventur;
        if (statSuppliers) statSuppliers.textContent = suppliers;
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const totalPages = Math.ceil(this.filteredTools.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageTools = this.filteredTools.slice(startIdx, endIdx);

        if (pageTools.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <div class="empty-state-text">Keine Verlagerungen gefunden</div>
                            <div class="empty-state-hint">Versuche einen anderen Suchbegriff oder Filter</div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageTools.map(tool => {
                const statusInfo = {
                    'offen': { class: 'status-offen', text: '⚪ Offen' },
                    'feinplanung': { class: 'status-feinplanung', text: '🔵 Feinplanung' },
                    'in-inventur': { class: 'status-in-inventur', text: '✅ in Bearbeitung' }
                }[tool.status];

                return `
                    <tr>
                        <td class="tool-number">${tool.toolNumber}</td>
                        <td class="tool-name">${tool.name}</td>
                        <td>${tool.supplier}</td>
                        <td>📌 ${tool.location}</td>
                        <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                        <td style="color: #6b7280;">${this.formatDate(tool.lastInventory)}</td>
                        <td>
                            <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; min-width: 80px; font-size: 0.8rem;" onclick="router.navigate('/detail/${tool.id}')">
                                👁️ Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination
        document.getElementById('paginationInfo').textContent =
            `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredTools.length)} von ${this.filteredTools.length} Verlagerungen`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTools.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    }

    showAddModal() {
        alert('➕ Verlagerung Hinzufügen - Diese Funktion wird später implementiert');
    }

    loadFromAPI() {
        alert('🔄 API-Anbindung wird geladen...\n\nEndpoint: /api/verlagerung\nStatus: Wird implementiert');
    }

    exportData() {
        alert(`📥 Export wird vorbereitet...\n\nFormat: CSV\nDatensätze: ${this.filteredTools.length}`);
    }

    showSettings() {
        alert('⚙️ Einstellungen\n\n- API-Konfiguration\n- Export-Optionen\n- Filter-Präferenzen\n- Ansichts-Einstellungen');
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">⚠️</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Neu laden</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const verlagerungPage = new VerlagerungPage();
