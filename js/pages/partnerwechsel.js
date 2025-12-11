// ORCA 2.0 - Vertragspartnerwechsel Liste
class PartnerwechselPage {
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
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Vertragspartnerwechsel';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial HTML
        app.innerHTML = `
            <div class="container">
                <!-- HANDLUNGSHINWEIS -->
                <div class="action-hint" style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-left: 4px solid #2c4a8c; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 1.5rem;">🔄</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1e3a6d; margin-bottom: 0.25rem;">Was ist zu tun?</div>
                        <div style="color: #4b5563; font-size: 0.9rem;">Pruefen Sie anstehende Vertragspartnerwechsel. Bestaetigen Sie die Uebernahme oder Abgabe von Werkzeugen.</div>
                    </div>
                </div>

                <!-- FORTSCHRITTS-UEBERSICHT -->
                <div class="progress-overview" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #2c4a8c;" id="statTotalVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Gesamt</div>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;" id="statOffenVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Offen</div>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;" id="statInBearbeitungVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">In Bearbeitung</div>
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="🔍 Suche nach VPW-Nr., Name, Lieferant oder Standort..."
                        >
                        <button class="btn btn-secondary" onclick="partnerwechselPage.loadFromAPI()">
                            🔄 API Laden
                        </button>
                        <button class="btn btn-neutral" onclick="partnerwechselPage.exportData()">
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
                                <th>Letzter VPW</th>
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
                            <button class="page-btn" id="prevPage" onclick="partnerwechselPage.prevPage()">◀ Zurück</button>
                            <button class="page-btn" id="nextPage" onclick="partnerwechselPage.nextPage()">Weiter ▶</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="partnerwechselPage.showSettings()">⚙️ Einstellungen</button>
            <button class="btn btn-primary" onclick="partnerwechselPage.showAddModal()">➕ Neuer VPW</button>
        `;

        // Load data and setup
        await this.loadData();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const response = await api.getPartnerwechselList();
            if (response.success) {
                this.allTools = response.data;
                this.filteredTools = [...this.allTools];

                // Check for filter from sessionStorage (from dashboard navigation)
                const savedFilter = sessionStorage.getItem('partnerwechselFilter');
                if (savedFilter) {
                    this.currentFilter = savedFilter;
                    sessionStorage.removeItem('partnerwechselFilter');
                    this.applyFilter();
                }

                this.updateStats();
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading Partnerwechsel data:', error);
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
        } else if (this.currentFilter === 'overdue') {
            // Filter für überfällige Aufgaben
            const today = new Date(); today.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            this.filteredTools = this.allTools.filter(tool => {
                if (tool.dueDate) {
                    const dueDate = new Date(tool.dueDate);
                    return dueDate < today;
                }
                return false;
            });
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

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countOffen').textContent = offen;
        document.getElementById('countFeinplanung').textContent = feinplanung;
        document.getElementById('countInInventur').textContent = inInventur;

        // Update progress overview stats
        const statTotal = document.getElementById('statTotalVPW');
        const statOffen = document.getElementById('statOffenVPW');
        const statInBearbeitung = document.getElementById('statInBearbeitungVPW');

        if (statTotal) statTotal.textContent = total;
        if (statOffen) statOffen.textContent = offen + feinplanung;
        if (statInBearbeitung) statInBearbeitung.textContent = inInventur;
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
                            <div class="empty-state-text">Keine Vertragspartnerwechsel gefunden</div>
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
            `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredTools.length)} von ${this.filteredTools.length} Vertragspartnerwechsel`;
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
        alert('➕ VPW Hinzufügen - Diese Funktion wird später implementiert');
    }

    loadFromAPI() {
        alert('🔄 API-Anbindung wird geladen...\n\nEndpoint: /api/partnerwechsel\nStatus: Wird implementiert');
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
const partnerwechselPage = new PartnerwechselPage();
