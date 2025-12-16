// ORCA 2.0 - Verlagerung Liste
class VerlagerungPage {
    constructor() {
        this.allTools = [];
        this.filteredTools = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentFilter = 'all';
        this.currentSort = { column: 'number', direction: 'asc' };
        this.isLoading = false;
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Verlagerung';

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
                    <h2>Verlagerungen
                        <span class="help-icon" id="helpIconVerlagerung">?</span>
                    </h2>
                    <div class="help-tooltip" id="helpTooltipVerlagerung">
                        <strong>Was ist zu tun?</strong><br>
                        Bestaetigen Sie die Durchfuehrung genehmigter Verlagerungen. Tragen Sie Verlade- und Ankunftstermine ein.<br><br>
                        <strong>Hinweis:</strong> Der Vertragspartner bleibt bei einer Verlagerung gleich - nur der Standort wechselt.
                    </div>
                </div>

                <!-- FORTSCHRITTS-UEBERSICHT -->
                <div class="progress-overview" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #f97316;" id="statTotalVerlagerung">0</div>
                        <div class="stat-label">Gesamt</div>
                    </div>
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #f59e0b;" id="statOffenVerlagerung">0</div>
                        <div class="stat-label">Offen</div>
                    </div>
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #3b82f6;" id="statInBearbeitungVerlagerung">0</div>
                        <div class="stat-label">In Bearbeitung</div>
                    </div>
                    <div class="progress-stat-card">
                        <div class="stat-number" style="color: #22c55e;" id="statAbgeschlossenVerlagerung">0</div>
                        <div class="stat-label">Abgeschlossen</div>
                    </div>
                </div>

                
                <!-- KI-Agent Button -->
                <div class="agent-link-wrapper" style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                    <button class="agent-btn-integrated" id="agentVerlagerungBtn">
                        <span class="agent-btn-icon">🤖</span>
                        <div class="agent-btn-content">
                            <strong>KI-Agent</strong>
                            <small>Verlagerung</small>
                        </div>
                    </button>
                </div>

                <!-- API MODE INDICATOR -->
                <div class="api-mode-indicator" id="apiModeIndicator" style="margin-bottom: 1rem; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span id="apiModeIcon">●</span>
                    <span id="apiModeText">Modus wird geladen...</span>
                </div>

                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="Suche nach Verlagerungs-Nr., Name, Standort..."
                        >
                        <button class="btn btn-neutral" onclick="verlagerungPage.exportData()">
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
                        <div class="filter-chip" data-filter="feinplanung">
                            Feinplanung <span class="count" id="countFeinplanung">0</span>
                        </div>
                        <div class="filter-chip" data-filter="in-inventur">
                            in Bearbeitung <span class="count" id="countInInventur">0</span>
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
                                <th class="sortable" data-sort="number">Verlagerungsauftrag</th>
                                <th class="sortable" data-sort="identifier">Identifier</th>
                                <th class="sortable" data-sort="sourceLocation">Ausgangsort</th>
                                <th class="sortable" data-sort="targetLocation">Zielstandort</th>
                                <th class="sortable" data-sort="status">Status</th>
                                <th class="sortable" data-sort="dueDate">Ankunft</th>
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
                            <button class="page-btn" id="prevPage" onclick="verlagerungPage.prevPage()">Zurück</button>
                            <button class="page-btn" id="nextPage" onclick="verlagerungPage.nextPage()">Weiter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/settings')">Einstellungen</button>
        `;

        // Show API mode
        this.updateApiModeIndicator();

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

    async loadData() {
        try {
            console.log('Loading Verlagerung data...');
            const response = await api.getVerlagerungList();
            console.log('Verlagerung response:', response);

            // Debug-Info anzeigen
            if (response.debug) {
                const debugInfo = document.getElementById('apiModeText');
                if (debugInfo) {
                    debugInfo.textContent = `Live-API: ${response.debug.totalProcesses} Prozesse geladen`;
                }
            }

            if (response.success) {
                this.allTools = response.data;
                this.filteredTools = [...this.allTools];

                // Check for filter from sessionStorage (from dashboard navigation)
                const savedFilter = sessionStorage.getItem('verlagerungFilter');
                if (savedFilter) {
                    this.currentFilter = savedFilter;
                    sessionStorage.removeItem('verlagerungFilter');
                    this.applyFilter();
                }

                this.updateStats();
                this.renderTable();
            } else {
                console.error('API Error:', response.error);
                this.showError('API Fehler: ' + (response.error || 'Unbekannt'));
            }
        } catch (error) {
            console.error('Error loading Verlagerung data:', error);
            this.showError('Fehler beim Laden der Daten: ' + error.message);
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

        // Help icon toggle
        const helpIcon = document.getElementById('helpIconVerlagerung');
        if (helpIcon) {
            helpIcon.addEventListener('click', () => {
                document.getElementById('helpTooltipVerlagerung').classList.toggle('visible');
            });

        // Agent Button Event Listener
        const agentBtn = document.getElementById('agentVerlagerungBtn');
        if (agentBtn) {
            agentBtn.addEventListener('click', () => router.navigate('/agent-verlagerung'));
        }
        }
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
        const abgeschlossen = this.allTools.filter(t => t.status === 'abgeschlossen').length;

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countOffen').textContent = offen;
        document.getElementById('countFeinplanung').textContent = feinplanung;
        document.getElementById('countInInventur').textContent = inInventur;
        document.getElementById('countAbgeschlossen').textContent = abgeschlossen;

        // Update progress overview stats
        const statTotal = document.getElementById('statTotalVerlagerung');
        const statOffen = document.getElementById('statOffenVerlagerung');
        const statInBearbeitung = document.getElementById('statInBearbeitungVerlagerung');
        const statAbgeschlossen = document.getElementById('statAbgeschlossenVerlagerung');

        if (statTotal) statTotal.textContent = total;
        if (statOffen) statOffen.textContent = offen + feinplanung;
        if (statInBearbeitung) statInBearbeitung.textContent = inInventur;
        if (statAbgeschlossen) statAbgeschlossen.textContent = abgeschlossen;
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
                            <div class="empty-state-icon">📦</div>
                            <div class="empty-state-text">Keine Verlagerungen gefunden</div>
                            <div class="empty-state-hint">Versuche einen anderen Suchbegriff oder Filter</div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageTools.map(tool => {
                const statusInfo = {
                    'offen': { class: 'status-offen', text: 'Offen' },
                    'feinplanung': { class: 'status-feinplanung', text: 'Feinplanung' },
                    'in-inventur': { class: 'status-in-inventur', text: 'In Bearbeitung' },
                    'abgeschlossen': { class: 'status-abgeschlossen', text: 'Abgeschlossen' }
                }[tool.status] || { class: 'status-offen', text: tool.status };

                // Verlagerungsauftrag = number + name
                const auftrag = tool.name || tool.number || '-';
                // Identifier
                const identifier = tool.identifier || '-';
                // Ausgangsort und Zielstandort
                const sourceLocation = tool.sourceLocation || '-';
                const targetLocation = tool.targetLocation || '-';

                return `
                    <tr class="clickable-row" onclick="verlagerungPage.openDetail('${tool.id || tool.processKey}')">
                        <td class="tool-name" style="max-width: 250px;">${auftrag}</td>
                        <td style="max-width: 200px; font-size: 0.8rem;">${identifier}</td>
                        <td style="max-width: 180px; font-size: 0.85rem;">${sourceLocation}</td>
                        <td style="max-width: 180px; font-size: 0.85rem;">${targetLocation}</td>
                        <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                        <td style="color: #6b7280;">${tool.dueDate ? this.formatDate(tool.dueDate) : '-'}</td>
                        <td>
                            <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; min-width: 80px; font-size: 0.8rem;" onclick="event.stopPropagation(); verlagerungPage.openDetail('${tool.id || tool.processKey}')">
                                Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination
        const showing = pageTools.length > 0 ? `${startIdx + 1}-${Math.min(endIdx, this.filteredTools.length)}` : '0';
        document.getElementById('paginationInfo').textContent =
            `Zeige ${showing} von ${this.filteredTools.length} Verlagerungen`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    // Open detail view for a relocation
    openDetail(id) {
        router.navigate(`/verlagerung/${id}`);
    }

    // Refresh data from API
    async refreshData() {
        const btn = document.getElementById('refreshBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Laden...';
        }

        await this.loadData();

        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Aktualisieren';
        }
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

    // Show modal for creating a new relocation
    showCreateModal() {
        const modalHtml = `
            <div class="modal-overlay" id="createModal" onclick="if(event.target === this) verlagerungPage.closeModal()">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Neue Verlagerung erstellen</h2>
                        <button class="modal-close" onclick="verlagerungPage.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="createRelocationForm">
                            <div class="form-group">
                                <label for="description">Beschreibung</label>
                                <input type="text" id="description" class="form-control" placeholder="z.B. Verlagerung Presswerkzeuge" required>
                            </div>
                            <div class="form-group">
                                <label for="sourceLocation">Von (Quellstandort)</label>
                                <select id="sourceLocation" class="form-control" required>
                                    <option value="">Standort auswählen...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="targetLocation">Nach (Zielstandort)</label>
                                <select id="targetLocation" class="form-control" required>
                                    <option value="">Standort auswählen...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="dueDate">Fälligkeitsdatum</label>
                                <input type="date" id="dueDate" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="comment">Kommentar (optional)</label>
                                <textarea id="comment" class="form-control" rows="3" placeholder="Zusätzliche Informationen..."></textarea>
                            </div>
                            <div id="auditResult" style="display: none; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-neutral" onclick="verlagerungPage.closeModal()">Abbrechen</button>
                        <button class="btn btn-primary" onclick="verlagerungPage.submitCreateForm()">Erstellen</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.loadLocationsForModal();

        // Set default due date to 14 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

        // Add change listeners for audit check
        document.getElementById('sourceLocation').addEventListener('change', () => this.checkAudit());
        document.getElementById('targetLocation').addEventListener('change', () => this.checkAudit());
    }

    async loadLocationsForModal() {
        try {
            const companyResult = await api.getCompanyBySupplier();
            if (companyResult.success && companyResult.companyKey) {
                const locationsResult = await api.getCompanyLocations(companyResult.companyKey);
                if (locationsResult.success) {
                    const sourceSelect = document.getElementById('sourceLocation');
                    const targetSelect = document.getElementById('targetLocation');

                    locationsResult.data.forEach(loc => {
                        const option = `<option value="${loc.key}" data-country="${loc.country}">${loc.name} (${loc.city}, ${loc.country})</option>`;
                        sourceSelect.insertAdjacentHTML('beforeend', option);
                        targetSelect.insertAdjacentHTML('beforeend', option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    }

    async checkAudit() {
        const sourceSelect = document.getElementById('sourceLocation');
        const targetSelect = document.getElementById('targetLocation');
        const auditResult = document.getElementById('auditResult');

        if (!sourceSelect.value || !targetSelect.value) {
            auditResult.style.display = 'none';
            return;
        }

        const sourceCountry = sourceSelect.selectedOptions[0]?.dataset.country;
        const targetCountry = targetSelect.selectedOptions[0]?.dataset.country;

        if (sourceCountry && targetCountry && sourceCountry !== targetCountry) {
            const result = await api.checkRelocationAudit(sourceCountry, targetCountry);
            if (result.success) {
                auditResult.style.display = 'block';
                if (result.data.allowed) {
                    auditResult.style.background = '#d1fae5';
                    auditResult.style.color = '#065f46';
                    auditResult.textContent = `Verlagerung von ${sourceCountry} nach ${targetCountry} ist erlaubt.`;
                } else if (result.data.color === 'red') {
                    auditResult.style.background = '#fee2e2';
                    auditResult.style.color = '#991b1b';
                    auditResult.textContent = `Warnung: Verlagerung von ${sourceCountry} nach ${targetCountry} erfordert Genehmigung.`;
                } else {
                    auditResult.style.background = '#1f2937';
                    auditResult.style.color = '#fff';
                    auditResult.textContent = `Verlagerung von ${sourceCountry} nach ${targetCountry} ist nicht erlaubt.`;
                }
            }
        } else {
            auditResult.style.display = 'none';
        }
    }

    async submitCreateForm() {
        const description = document.getElementById('description').value;
        const sourceLocationKey = document.getElementById('sourceLocation').value;
        const targetLocationKey = document.getElementById('targetLocation').value;
        const dueDate = document.getElementById('dueDate').value;
        const comment = document.getElementById('comment').value;

        if (!description || !sourceLocationKey || !targetLocationKey || !dueDate) {
            alert('Bitte alle Pflichtfelder ausfüllen.');
            return;
        }

        const result = await api.createRelocation({
            description,
            sourceLocationKey,
            targetLocationKey,
            dueDate,
            comment
        });

        if (result.success) {
            // Create message for the relocation
            if (typeof messageService !== 'undefined') {
                const sourceName = document.getElementById('sourceLocation').selectedOptions[0]?.text || sourceLocationKey;
                const targetName = document.getElementById('targetLocation').selectedOptions[0]?.text || targetLocationKey;

                messageService.createOutgoingMessage(
                    'verlagerung',
                    'Verlagerung erstellt',
                    `Verlagerung von ${sourceName} nach ${targetName} erstellt`,
                    [],
                    {
                        processId: result.data?.key || result.data?.context?.key || `rel-${Date.now()}`,
                        description: description,
                        sourceLocation: sourceName,
                        targetLocation: targetName,
                        dueDate: dueDate
                    }
                );
            }

            this.closeModal();
            await this.refreshData();
            // Navigate to the new relocation detail
            if (result.data?.key || result.data?.context?.key) {
                router.navigate(`/verlagerung/${result.data.key || result.data.context.key}`);
            }
        } else {
            alert('Fehler beim Erstellen: ' + (result.error || 'Unbekannter Fehler'));
        }
    }

    closeModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.remove();
        }
    }

    exportData() {
        if (this.filteredTools.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }

        // Create CSV content
        const headers = ['Verlagerungs-Nr.', 'Beschreibung', 'Von', 'Nach', 'Status', 'Fällig'];
        const rows = this.filteredTools.map(tool => [
            tool.number || tool.toolNumber || '',
            tool.name,
            tool.sourceLocation || tool.location || '',
            tool.targetLocation || '',
            tool.status,
            tool.dueDate || ''
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `verlagerungen_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">!</div>
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
