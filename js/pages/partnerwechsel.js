// ORCA 2.0 - Vertragspartnerwechsel (VPW) Liste
// VPW ist die Erweiterung des Verlagerungsprozesses - der Vertragspartner wechselt
class PartnerwechselPage {
    constructor() {
        this.allProcesses = [];
        this.filteredProcesses = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentFilter = 'all';
        this.currentSort = { column: 'dueDate', direction: 'asc' };
        this.currentView = 'incoming'; // 'incoming' = zu uebernehmende, 'outgoing' = abzugebende
        this.isLoading = false;
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
                        <div style="color: #4b5563; font-size: 0.9rem;">Bestaetigen Sie die Abgabe oder Uebernahme von Werkzeugen beim Vertragspartnerwechsel. Alle Beteiligten muessen den Prozess bestaetigen.</div>
                    </div>
                </div>

                <!-- INFO-BOX: VPW erklaert -->
                <div style="background: white; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #f97316;">
                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                        <div style="font-size: 1.25rem;">💡</div>
                        <div>
                            <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">Vertragspartnerwechsel vs. Verlagerung</div>
                            <div style="font-size: 0.85rem; color: #6b7280;">
                                Bei einer <strong>Verlagerung</strong> bleibt der Vertragspartner gleich - nur der Standort wechselt.<br>
                                Beim <strong>Vertragspartnerwechsel (VPW)</strong> wechselt der Vertragspartner selbst. Rechte und Pflichten werden uebertragen.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FORTSCHRITTS-UEBERSICHT -->
                <div class="progress-overview" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 150px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #2c4a8c;" id="statTotalVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Gesamt</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;" id="statOffenVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Warte auf Abgabe</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;" id="statAbgabeVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Warte auf Uebernahme</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #22c55e;" id="statAbgeschlossenVPW">0</div>
                        <div style="font-size: 0.85rem; color: #6b7280;">Abgeschlossen</div>
                    </div>
                </div>

                <!-- API MODE INDICATOR -->
                <div class="api-mode-indicator" id="apiModeIndicator" style="margin-bottom: 1rem; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span id="apiModeIcon">●</span>
                    <span id="apiModeText">Modus wird geladen...</span>
                </div>

                <!-- VIEW TOGGLE: Eingehend / Ausgehend -->
                <div class="view-toggle-container" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <button class="view-toggle-btn active" data-view="incoming" id="viewIncoming">
                        📥 Zu uebernehmende Werkzeuge
                    </button>
                    <button class="view-toggle-btn" data-view="outgoing" id="viewOutgoing">
                        📤 Abzugebende Werkzeuge
                    </button>
                </div>

                <!-- CONTROLS -->
                <div class="controls">
                    <div class="search-bar">
                        <input
                            type="text"
                            class="search-input"
                            id="searchInput"
                            placeholder="🔍 Suche nach Werkzeugnummer, Name, Partner..."
                        >
                        <button class="btn btn-secondary" id="refreshBtn">
                            🔄 Aktualisieren
                        </button>
                        <button class="btn btn-success" id="confirmAllBtn" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                            ✓ Alle bestaetigen
                        </button>
                        <button class="btn btn-neutral" id="exportBtn">
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
                        <div class="filter-chip" data-filter="abgabe-bestaetigt">
                            Abgabe bestaetigt <span class="count" id="countAbgabe">0</span>
                        </div>
                        <div class="filter-chip" data-filter="uebernahme-bestaetigt">
                            Uebernahme bestaetigt <span class="count" id="countUebernahme">0</span>
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
                                <th style="width: 40px;">
                                    <input type="checkbox" id="selectAll" class="checkbox-custom">
                                </th>
                                <th class="sortable" data-sort="toolNumber">Werkzeugnummer</th>
                                <th class="sortable" data-sort="toolName">Werkzeug</th>
                                <th class="sortable" data-sort="fromPartner">Von (Abgebend)</th>
                                <th class="sortable" data-sort="toPartner">An (Uebernehmend)</th>
                                <th class="sortable" data-sort="status">Status</th>
                                <th class="sortable" data-sort="dueDate">Frist</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 2rem;">
                                    <div class="loading-spinner"></div>
                                    <div style="margin-top: 1rem; color: #6b7280;">Lade Vertragspartnerwechsel...</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="pagination">
                        <div class="pagination-info" id="paginationInfo">
                            Lade...
                        </div>
                        <div class="pagination-controls">
                            <button class="page-btn" id="prevPage">◀ Zurueck</button>
                            <button class="page-btn" id="nextPage">Weiter ▶</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirm Modal -->
            <div class="modal" id="confirmModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="confirmModalTitle">Bestaetigung</h2>
                        <div class="modal-subtitle" id="confirmModalSubtitle">Moechten Sie diese Aktion bestaetigen?</div>
                    </div>
                    <div id="confirmModalBody" style="margin-bottom: 1rem;">
                        <!-- Dynamischer Inhalt -->
                    </div>
                    <div class="form-group" id="commentGroup" style="display: none;">
                        <label class="form-label">Kommentar (optional - erzeugt Klaerfall!)</label>
                        <textarea id="confirmComment" class="form-input" rows="2" placeholder="Nur bei Problemen einen Kommentar eingeben..."></textarea>
                        <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 0.25rem;">⚠️ Ein Kommentar erzeugt automatisch einen Klaerfall beim OEM</div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelConfirm">Abbrechen</button>
                        <button class="modal-btn primary" id="submitConfirm">Bestaetigen</button>
                    </div>
                </div>
            </div>
        `;

        // Add custom styles for this page
        this.addStyles();

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/settings')">⚙️ Einstellungen</button>
        `;

        // Show API mode
        this.updateApiModeIndicator();

        // Load data and setup
        await this.loadData();
        this.attachEventListeners();
    }

    addStyles() {
        // Check if styles already exist
        if (document.getElementById('vpw-styles')) return;

        const style = document.createElement('style');
        style.id = 'vpw-styles';
        style.textContent = `
            .view-toggle-btn {
                padding: 0.6rem 1.2rem;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-family: 'Oswald', sans-serif;
            }
            .view-toggle-btn:hover {
                border-color: #2c4a8c;
                background: #f8fafc;
            }
            .view-toggle-btn.active {
                background: linear-gradient(135deg, #2c4a8c 0%, #1e3a6d 100%);
                color: white;
                border-color: #2c4a8c;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e5e7eb;
                border-top-color: #2c4a8c;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .status-offen {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                color: #92400e;
            }
            .status-abgabe-bestaetigt {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                color: #1e40af;
            }
            .status-uebernahme-bestaetigt {
                background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
                color: #1e40af;
            }
            .status-abgeschlossen {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                color: #166534;
            }
            .partner-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            .partner-badge.from {
                background: #fee2e2;
                color: #991b1b;
            }
            .partner-badge.to {
                background: #dcfce7;
                color: #166534;
            }
            .action-btn-group {
                display: flex;
                gap: 0.25rem;
            }
            .action-btn {
                padding: 0.3rem 0.6rem;
                border: none;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .action-btn.confirm {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
            }
            .action-btn.confirm:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .action-btn.details {
                background: #f3f4f6;
                color: #374151;
            }
            .action-btn.details:hover {
                background: #e5e7eb;
            }
            .clickable-row {
                cursor: pointer;
            }
            .clickable-row:hover {
                background: #f8fafc;
            }
            .checkbox-custom {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
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
        this.isLoading = true;
        try {
            console.log('Loading VPW data...');
            const response = await api.getPartnerwechselList();
            console.log('VPW response:', response);

            if (response.success) {
                this.allProcesses = response.data;
                this.filteredProcesses = [...this.allProcesses];

                // Check for filter from sessionStorage (from dashboard navigation)
                const savedFilter = sessionStorage.getItem('partnerwechselFilter');
                if (savedFilter) {
                    this.currentFilter = savedFilter;
                    sessionStorage.removeItem('partnerwechselFilter');
                    this.applyFilter();
                }

                // Debug info
                if (response.debug) {
                    const debugInfo = document.getElementById('apiModeText');
                    if (debugInfo) {
                        debugInfo.textContent = `Live-API: ${response.debug.totalProcesses || this.allProcesses.length} VPW geladen`;
                    }
                }

                this.updateStats();
                this.renderTable();
            } else {
                console.error('API Error:', response.error);
                this.showError('API Fehler: ' + (response.error || 'Unbekannt'));
            }
        } catch (error) {
            console.error('Error loading VPW data:', error);
            this.showError('Fehler beim Laden der Daten: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    attachEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm) {
                    this.filteredProcesses = this.allProcesses.filter(p =>
                        (p.toolNumber || '').toLowerCase().includes(searchTerm) ||
                        (p.toolName || p.name || '').toLowerCase().includes(searchTerm) ||
                        (p.fromPartner || '').toLowerCase().includes(searchTerm) ||
                        (p.toPartner || '').toLowerCase().includes(searchTerm)
                    );
                } else {
                    this.applyFilter();
                }
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // View toggle (incoming/outgoing)
        document.getElementById('viewIncoming').addEventListener('click', () => this.setView('incoming'));
        document.getElementById('viewOutgoing').addEventListener('click', () => this.setView('outgoing'));

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

        // Sorting
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTable(column);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());

        // Confirm all button
        document.getElementById('confirmAllBtn').addEventListener('click', () => this.confirmAll());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());

        // Modal events
        document.getElementById('cancelConfirm').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('submitConfirm').addEventListener('click', () => this.submitConfirmation());
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') this.closeConfirmModal();
        });
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(view === 'incoming' ? 'viewIncoming' : 'viewOutgoing').classList.add('active');
        this.applyFilter();
        this.renderTable();
    }

    applyFilter() {
        let filtered = [...this.allProcesses];

        // Filter by view (incoming = zu uebernehmend, outgoing = abzugebend)
        // In Mock-Daten simulieren wir das ueber ein Flag
        if (this.currentView === 'incoming') {
            filtered = filtered.filter(p => p.direction === 'incoming' || !p.direction);
        } else {
            filtered = filtered.filter(p => p.direction === 'outgoing');
        }

        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(p => p.status === this.currentFilter);
        }

        this.filteredProcesses = filtered;
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredProcesses.sort((a, b) => {
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
        const total = this.allProcesses.length;
        const offen = this.allProcesses.filter(p => p.status === 'offen').length;
        const abgabe = this.allProcesses.filter(p => p.status === 'abgabe-bestaetigt').length;
        const uebernahme = this.allProcesses.filter(p => p.status === 'uebernahme-bestaetigt').length;
        const abgeschlossen = this.allProcesses.filter(p => p.status === 'abgeschlossen').length;

        // Update filter counts
        document.getElementById('countAll').textContent = total;
        document.getElementById('countOffen').textContent = offen;
        document.getElementById('countAbgabe').textContent = abgabe;
        document.getElementById('countUebernahme').textContent = uebernahme;
        document.getElementById('countAbgeschlossen').textContent = abgeschlossen;

        // Update progress overview stats
        const statTotal = document.getElementById('statTotalVPW');
        const statOffen = document.getElementById('statOffenVPW');
        const statAbgabe = document.getElementById('statAbgabeVPW');
        const statAbgeschlossen = document.getElementById('statAbgeschlossenVPW');

        if (statTotal) statTotal.textContent = total;
        if (statOffen) statOffen.textContent = offen;
        if (statAbgabe) statAbgabe.textContent = abgabe + uebernahme;
        if (statAbgeschlossen) statAbgeschlossen.textContent = abgeschlossen;
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const totalPages = Math.ceil(this.filteredProcesses.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageProcesses = this.filteredProcesses.slice(startIdx, endIdx);

        if (this.isLoading) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner"></div>
                        <div style="margin-top: 1rem; color: #6b7280;">Lade Vertragspartnerwechsel...</div>
                    </td>
                </tr>
            `;
            return;
        }

        if (pageProcesses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon">🔄</div>
                            <div class="empty-state-text">Keine Vertragspartnerwechsel gefunden</div>
                            <div class="empty-state-hint">
                                ${this.currentView === 'incoming'
                                    ? 'Aktuell keine Werkzeuge zur Uebernahme vorhanden'
                                    : 'Aktuell keine Werkzeuge zur Abgabe vorhanden'}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageProcesses.map(p => {
                const statusInfo = this.getStatusInfo(p.status);
                const canConfirm = this.canUserConfirm(p);

                return `
                    <tr class="clickable-row" data-id="${p.id || p.processKey}">
                        <td onclick="event.stopPropagation();">
                            <input type="checkbox" class="checkbox-custom row-checkbox" data-id="${p.id || p.processKey}" ${!canConfirm ? 'disabled' : ''}>
                        </td>
                        <td class="tool-number" style="font-weight: 600; color: #2c4a8c;">${p.toolNumber || '-'}</td>
                        <td class="tool-name">${p.toolName || p.name || '-'}</td>
                        <td>
                            <span class="partner-badge from">${p.fromPartner || 'Unbekannt'}</span>
                        </td>
                        <td>
                            <span class="partner-badge to">${p.toPartner || 'Unbekannt'}</span>
                        </td>
                        <td>
                            <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                        </td>
                        <td style="color: #6b7280;">${p.dueDate ? this.formatDate(p.dueDate) : '-'}</td>
                        <td onclick="event.stopPropagation();">
                            <div class="action-btn-group">
                                ${canConfirm ? `
                                    <button class="action-btn confirm" onclick="partnerwechselPage.showConfirmModal('${p.id || p.processKey}')">
                                        ✓ Bestaetigen
                                    </button>
                                ` : ''}
                                <button class="action-btn details" onclick="partnerwechselPage.openDetail('${p.id || p.processKey}')">
                                    Details
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Add row click listeners for navigation
            document.querySelectorAll('.clickable-row').forEach(row => {
                row.addEventListener('click', () => {
                    const id = row.dataset.id;
                    this.openDetail(id);
                });
            });
        }

        // Pagination
        const showing = pageProcesses.length > 0 ? `${startIdx + 1}-${Math.min(endIdx, this.filteredProcesses.length)}` : '0';
        document.getElementById('paginationInfo').textContent =
            `Zeige ${showing} von ${this.filteredProcesses.length} Vertragspartnerwechsel`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    getStatusInfo(status) {
        const statusMap = {
            'offen': { class: 'status-offen', text: '⚪ Warte auf Abgabe' },
            'abgabe-bestaetigt': { class: 'status-abgabe-bestaetigt', text: '🔵 Abgabe bestaetigt' },
            'uebernahme-bestaetigt': { class: 'status-uebernahme-bestaetigt', text: '🔵 Uebernahme bestaetigt' },
            'abgeschlossen': { class: 'status-abgeschlossen', text: '✅ Abgeschlossen' },
            // Fallback fuer alte Status
            'feinplanung': { class: 'status-abgabe-bestaetigt', text: '🔵 In Bearbeitung' },
            'in-inventur': { class: 'status-uebernahme-bestaetigt', text: '🔵 In Bearbeitung' }
        };
        return statusMap[status] || { class: 'status-offen', text: status };
    }

    canUserConfirm(process) {
        // Logik: User kann bestaetigen wenn...
        // - Bei 'incoming' view und status ist 'abgabe-bestaetigt' -> Uebernahme bestaetigen
        // - Bei 'outgoing' view und status ist 'offen' -> Abgabe bestaetigen
        if (this.currentView === 'incoming') {
            return process.status === 'abgabe-bestaetigt';
        } else {
            return process.status === 'offen';
        }
    }

    // Modal fuer Bestaetigung
    currentConfirmProcess = null;

    showConfirmModal(processId) {
        const process = this.allProcesses.find(p => (p.id || p.processKey) === processId);
        if (!process) return;

        this.currentConfirmProcess = process;

        const isAbgabe = this.currentView === 'outgoing';
        const title = isAbgabe ? 'Abgabe bestaetigen' : 'Uebernahme bestaetigen';
        const subtitle = isAbgabe
            ? 'Bestaetigen Sie, dass Sie das Werkzeug an den neuen Vertragspartner abgegeben haben.'
            : 'Bestaetigen Sie, dass Sie das Werkzeug vom bisherigen Vertragspartner uebernommen haben.';

        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalSubtitle').textContent = subtitle;
        document.getElementById('confirmModalBody').innerHTML = `
            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">${process.toolNumber || '-'}</div>
                <div style="color: #6b7280; font-size: 0.9rem;">${process.toolName || process.name || '-'}</div>
                <div style="margin-top: 0.75rem; display: flex; gap: 1rem; font-size: 0.85rem;">
                    <div>Von: <span class="partner-badge from">${process.fromPartner || 'Unbekannt'}</span></div>
                    <div>An: <span class="partner-badge to">${process.toPartner || 'Unbekannt'}</span></div>
                </div>
            </div>
        `;
        document.getElementById('commentGroup').style.display = 'block';
        document.getElementById('confirmComment').value = '';

        document.getElementById('confirmModal').classList.add('active');
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
        this.currentConfirmProcess = null;
    }

    async submitConfirmation() {
        if (!this.currentConfirmProcess) return;

        const comment = document.getElementById('confirmComment').value.trim();
        const processId = this.currentConfirmProcess.id || this.currentConfirmProcess.processKey;

        // TODO: API Call
        console.log('Confirming VPW:', processId, 'Comment:', comment);

        // Mock: Update status locally
        const process = this.allProcesses.find(p => (p.id || p.processKey) === processId);
        if (process) {
            if (this.currentView === 'outgoing') {
                process.status = 'abgabe-bestaetigt';
            } else {
                process.status = 'uebernahme-bestaetigt';
            }
        }

        this.closeConfirmModal();
        this.updateStats();
        this.renderTable();

        // Show success message
        alert(`✓ ${this.currentView === 'outgoing' ? 'Abgabe' : 'Uebernahme'} erfolgreich bestaetigt!${comment ? '\n\n⚠️ Ihr Kommentar wurde als Klaerfall erfasst.' : ''}`);
    }

    confirmAll() {
        const selected = document.querySelectorAll('.row-checkbox:checked');
        if (selected.length === 0) {
            alert('Bitte waehlen Sie mindestens einen Vertragspartnerwechsel aus.');
            return;
        }

        const action = this.currentView === 'outgoing' ? 'Abgabe' : 'Uebernahme';
        if (confirm(`Moechten Sie ${selected.length} ${action}(n) bestaetigen?`)) {
            // TODO: Batch API Call
            selected.forEach(cb => {
                const processId = cb.dataset.id;
                const process = this.allProcesses.find(p => (p.id || p.processKey) === processId);
                if (process) {
                    if (this.currentView === 'outgoing') {
                        process.status = 'abgabe-bestaetigt';
                    } else {
                        process.status = 'uebernahme-bestaetigt';
                    }
                }
            });

            this.updateStats();
            this.renderTable();
            alert(`✓ ${selected.length} ${action}(n) erfolgreich bestaetigt!`);
        }
    }

    openDetail(id) {
        router.navigate(`/partnerwechsel/${id}`);
    }

    async refreshData() {
        const btn = document.getElementById('refreshBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Laden...';
        }

        await this.loadData();

        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Aktualisieren';
        }
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
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
        const totalPages = Math.ceil(this.filteredProcesses.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    }

    exportData() {
        if (this.filteredProcesses.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }

        // Create CSV content
        const headers = ['Werkzeugnummer', 'Werkzeug', 'Von (Abgebend)', 'An (Uebernehmend)', 'Status', 'Frist'];
        const rows = this.filteredProcesses.map(p => [
            p.toolNumber || '',
            p.toolName || p.name || '',
            p.fromPartner || '',
            p.toPartner || '',
            p.status || '',
            p.dueDate || ''
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vertragspartnerwechsel_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
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
