// ORCA 2.0 - Inventur Page
class InventurPage {
    constructor() {
        this.locations = [
            { id: 'loc1', name: 'Werk München - Halle A' },
            { id: 'loc2', name: 'Werk München - Halle B' },
            { id: 'loc3', name: 'Werk Stuttgart - Presswerk' },
            { id: 'loc4', name: 'Werk Leipzig - Montage' },
            { id: 'loc5', name: 'Lager Augsburg' }
        ];

        this.tools = [];
        this.currentFilter = 'all';
        this.currentLocationFilter = null;
        this.currentView = 'table';
        this.currentTool = null;
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }

    async render() {
        const app = document.getElementById('app');

        // Check for filter from dashboard
        const filterFromDashboard = sessionStorage.getItem('inventurFilter');
        if (filterFromDashboard) {
            this.currentFilter = filterFromDashboard;
            // Clear the filter from sessionStorage
            sessionStorage.removeItem('inventurFilter');
        }

        // Update Header
        document.getElementById('headerTitle').textContent = 'Orca 2.0 - Inventory Service';
        document.getElementById('headerSubtitle').textContent = 'Werkzeug-Inventur Management';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        app.innerHTML = `
            <div class="container">
                <!-- Success Message (wird bei 100% angezeigt) -->
                <div id="successMessage" style="display: none;" class="success-message">
                    <h3>🎉 Herzlichen Glückwunsch!</h3>
                    <p>Alle fälligen Werkzeuge für die nächsten 3 Wochen sind bestätigt. Vielen Dank für Ihre hervorragende Arbeit!</p>
                </div>

                <!-- Tacho Widget -->
                <div class="speedometer-widget">
                    <div class="speedometer-header">
                        <div class="speedometer-text">
                            <h2>Fortschritt: Fälligkeiten (3 Wochen)</h2>
                            <p>Bestätigte Werkzeuge mit Fälligkeit in den nächsten 3 Wochen</p>
                        </div>
                        <div class="speedometer-container">
                            <div class="speedometer">
                                <svg viewBox="0 0 200 120" style="width: 100%; height: 100%;">
                                    <!-- Background Arc (grau) -->
                                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" stroke-width="20" stroke-linecap="round"/>
                                    <!-- Progress Arc (orange) -->
                                    <path id="speedometerArc" d="M 20 100 A 80 80 0 0 1 180 100"
                                          fill="none" stroke="#f97316" stroke-width="20" stroke-linecap="round"
                                          stroke-dasharray="251.2" stroke-dashoffset="251.2"
                                          style="transition: stroke-dashoffset 0.5s ease;"/>
                                </svg>
                                <div class="speedometer-percentage" id="speedometerPercentage">0%</div>
                                <div class="speedometer-label">Abgeschlossen</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="view-controls">
                    <button class="bulk-btn api-load" id="apiLoadBtn">
                        📄 Lade lokale Werkzeuginformationen
                    </button>
                    <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                        <button class="bulk-btn secondary" id="filterLocationBtn">📌 Nach Standort filtern</button>
                    </div>
                </div>

                <div class="toolbar">
                    <div class="toolbar-left">
                        <div class="filter-chip ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                            Alle <span class="count" id="count-all">0</span>
                        </div>
                        <div class="filter-chip ${this.currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">
                            Offen <span class="count" id="count-pending">0</span>
                        </div>
                        <div class="filter-chip ${this.currentFilter === 'confirmed' ? 'active' : ''}" data-filter="confirmed">
                            Bestätigt <span class="count" id="count-confirmed">0</span>
                        </div>
                        <div class="filter-chip ${this.currentFilter === 'relocated' ? 'active' : ''}" data-filter="relocated">
                            Verschoben <span class="count" id="count-relocated">0</span>
                        </div>
                        <div class="filter-chip ${this.currentFilter === 'overdue' ? 'active' : ''}" data-filter="overdue">
                            Überfällig <span class="count" id="count-overdue">0</span>
                        </div>
                    </div>
                    <div class="toolbar-right">
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="table">📋 Tabelle</button>
                            <button class="view-btn" data-view="card">🗂️ Karten</button>
                        </div>
                    </div>
                </div>

                <div class="table-container" id="tableView">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="number">Werkzeugnummer</th>
                                <th class="sortable" data-sort="name">Werkzeug</th>
                                <th class="sortable" data-sort="location">Standort</th>
                                <th class="sortable" data-sort="responsible">Verantwortlicher</th>
                                <th class="sortable" data-sort="dueDate">Fälligkeitsdatum</th>
                                <th class="sortable" data-sort="lastChange">Letzte Änderung</th>
                                <th>Status</th>
                                <th>Kommentar</th>
                                <th>
                                    Aktionen
                                    <input type="checkbox" class="checkbox-custom" id="confirmAllCheckbox"
                                           style="margin-left: 0.5rem; vertical-align: middle;"
                                           title="Alle gefilterten Werkzeuge bestätigen">
                                </th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                        </tbody>
                    </table>
                    <div class="pagination" id="pagination">
                        <button class="pagination-btn" id="prevPage">◀ Zurück</button>
                        <div class="pagination-info" id="paginationInfo"></div>
                        <button class="pagination-btn" id="nextPage">Weiter ▶</button>
                    </div>
                </div>

                <div class="card-view" id="cardView">
                </div>

                <div class="pagination" id="paginationCards" style="display: none; background: transparent; margin-top: 1rem;">
                    <button class="pagination-btn" id="prevPageCards">◀ Zurück</button>
                    <div class="pagination-info" id="paginationInfoCards"></div>
                    <button class="pagination-btn" id="nextPageCards">Weiter ▶</button>
                </div>
            </div>

            <div class="submit-bar">
                <div class="submit-content">
                    <div class="submit-info">
                        <span id="submitInfo">Bitte mindestens ein Werkzeug bearbeiten</span>
                    </div>
                    <button class="submit-btn" id="submitBtn" disabled>
                        📤 Inventur einreichen
                    </button>
                </div>
            </div>

            <!-- Relocation Modal -->
            <div class="modal" id="relocationModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Werkzeug verschoben</h2>
                        <div class="modal-subtitle">Neuen Standort auswählen</div>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong id="modalToolName"></strong><br>
                        <span id="modalToolNumber" style="color: #6b7280; font-size: 0.85rem;"></span>
                    </div>
                    <select class="location-select" id="newLocationSelect">
                        <option value="">-- Standort wählen --</option>
                    </select>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelRelocation">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmRelocation">Bestätigen</button>
                    </div>
                </div>
            </div>

            <!-- Location Filter Modal -->
            <div class="modal" id="bulkLocationModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Nach Standort filtern</h2>
                        <div class="modal-subtitle">Nur Werkzeuge an diesem Standort anzeigen</div>
                    </div>
                    <select class="location-select" id="bulkLocationSelect">
                        <option value="">-- Standort wählen --</option>
                    </select>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelBulkLocation">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmBulkLocation">Filtern</button>
                    </div>
                </div>
            </div>

            <!-- Submit Confirmation Modal -->
            <div class="modal" id="submitModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📤 Inventur einreichen</h2>
                        <div class="modal-subtitle">Bearbeitete Werkzeuge werden an die API gesendet</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <p id="submitModalSummary" style="font-size: 1rem; margin-bottom: 1rem;"></p>
                        <p style="color: #6b7280; font-size: 0.9rem;">
                            Die gemeldeten Werkzeuge werden aus der Liste entfernt und an das Backend gesendet.
                        </p>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelSubmit">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmSubmit">Jetzt einreichen</button>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = '';

        // Load data
        await this.loadData();

        // Attach event listeners
        this.attachEventListeners();

        // Initialize display
        this.updateCounts();
        this.updateSpeedometer();
        this.renderTable();
    }

    async loadData() {
        const response = await api.getInventoryList();
        if (response.success) {
            this.tools = response.data.map(tool => ({
                ...tool,
                status: 'pending',
                selected: false,
                newLocation: null
            }));
        }
    }

    attachEventListeners() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.filter;
                this.currentPage = 1;
                this.renderTable();
            });
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.switchView();
            });
        });

        // Confirm all checkbox
        document.getElementById('confirmAllCheckbox').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.confirmAllFiltered();
                e.target.checked = false; // Reset checkbox
            }
        });

        // Bulk actions
        document.getElementById('filterLocationBtn').addEventListener('click', () => this.openLocationFilterModal());
        document.getElementById('apiLoadBtn').addEventListener('click', () => this.loadFromAPI());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitInventory());

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        document.getElementById('prevPageCards').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPageCards').addEventListener('click', () => this.nextPage());

        // Sorting
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTable(column);
            });
        });

        // Modal events
        document.getElementById('cancelRelocation').addEventListener('click', () => this.closeRelocationModal());
        document.getElementById('confirmRelocation').addEventListener('click', () => this.confirmRelocation());
        document.getElementById('cancelBulkLocation').addEventListener('click', () => this.closeLocationFilterModal());
        document.getElementById('confirmBulkLocation').addEventListener('click', () => this.confirmLocationFilter());
        document.getElementById('cancelSubmit').addEventListener('click', () => this.closeSubmitModal());
        document.getElementById('confirmSubmit').addEventListener('click', () => this.confirmSubmit());

        // Populate location selects
        this.populateLocationSelects();
    }

    populateLocationSelects() {
        const newLocationSelect = document.getElementById('newLocationSelect');
        const bulkLocationSelect = document.getElementById('bulkLocationSelect');

        this.locations.forEach(loc => {
            const option1 = document.createElement('option');
            option1.value = loc.id;
            option1.textContent = loc.name;
            newLocationSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = loc.id;
            option2.textContent = loc.name;
            bulkLocationSelect.appendChild(option2);
        });
    }

    getFilteredTools() {
        let filtered = this.tools.filter(tool => {
            // Standort-Filter
            if (this.currentLocationFilter && tool.location !== this.currentLocationFilter) {
                return false;
            }

            // Status-Filter
            if (this.currentFilter === 'all') return true;
            if (this.currentFilter === 'overdue') return this.isOverdue(tool.dueDate);
            return tool.status === this.currentFilter;
        });

        // Apply sorting
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                if (this.sortColumn === 'name') {
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                } else if (this.sortColumn === 'number') {
                    aVal = a.number.toLowerCase();
                    bVal = b.number.toLowerCase();
                } else if (this.sortColumn === 'location') {
                    aVal = this.getLocationName(a.location).toLowerCase();
                    bVal = this.getLocationName(b.location).toLowerCase();
                } else if (this.sortColumn === 'responsible') {
                    aVal = (a.responsible || '').toLowerCase();
                    bVal = (b.responsible || '').toLowerCase();
                } else if (this.sortColumn === 'dueDate') {
                    aVal = new Date(a.dueDate);
                    bVal = new Date(b.dueDate);
                } else if (this.sortColumn === 'lastChange') {
                    aVal = a.lastChange ? new Date(a.lastChange) : new Date(0);
                    bVal = b.lastChange ? new Date(b.lastChange) : new Date(0);
                }

                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }

    getPaginatedTools(filtered) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return filtered.slice(start, end);
    }

    renderTable() {
        const filtered = this.getFilteredTools();
        const paginated = this.getPaginatedTools(filtered);
        const tbody = document.getElementById('tableBody');

        if (paginated.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 3rem; color: #6b7280;">
                        📦 Keine Werkzeuge mit diesem Filter gefunden
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = paginated.map(tool => {
                const statusInfo = this.getStatusInfo(tool.status);
                const locationText = tool.newLocation
                    ? `➜ ${this.getLocationName(tool.newLocation)}`
                    : this.getLocationName(tool.location);
                const dueDateClass = this.isOverdue(tool.dueDate) ? 'overdue' : '';
                const rowClass = tool.status !== 'pending' ? tool.status : '';

                let actionsHtml = '';
                if (tool.status === 'pending') {
                    actionsHtml = `
                        <button class="action-btn-small confirm" onclick="inventurPage.confirmTool(${tool.id})">✓</button>
                        <button class="action-btn-small relocate" onclick="inventurPage.relocateTool(${tool.id})">📌</button>
                    `;
                } else {
                    actionsHtml = `
                        <button class="action-btn-small undo" onclick="inventurPage.resetTool(${tool.id})">↶</button>
                    `;
                }

                return `
                    <tr class="${rowClass}">
                        <td class="tool-number"><a href="#/detail/${tool.id}" style="color: #2c4a8c; text-decoration: none; font-weight: 600;">${tool.number}</a></td>
                        <td class="tool-name">${tool.name}</td>
                        <td>${locationText}</td>
                        <td>${tool.responsible || 'N/A'}</td>
                        <td><span class="due-date ${dueDateClass}">${this.formatDate(tool.dueDate)}</span></td>
                        <td>${tool.lastChange ? this.formatDate(tool.lastChange) : 'N/A'}</td>
                        <td><span class="status-badge ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span></td>
                        <td><input type="text" class="comment-input" value="${tool.comment || ''}"
                                   onchange="inventurPage.updateComment(${tool.id}, this.value)"
                                   placeholder="Kommentar hinzufügen..."></td>
                        <td><div class="action-cell">${actionsHtml}</div></td>
                    </tr>
                `;
            }).join('');
        }

        this.updatePagination(filtered.length);
        this.updateCounts();
        this.updateSpeedometer();
    }

    renderCards() {
        const filtered = this.getFilteredTools();
        const paginated = this.getPaginatedTools(filtered);
        const cardView = document.getElementById('cardView');

        if (paginated.length === 0) {
            cardView.innerHTML = '<div style="text-align: center; padding: 3rem; color: #6b7280;">📦 Keine Werkzeuge gefunden</div>';
        } else {
            cardView.innerHTML = paginated.map(tool => {
                const statusInfo = this.getStatusInfo(tool.status);
                const locationText = tool.newLocation
                    ? `➜ ${this.getLocationName(tool.newLocation)}`
                    : this.getLocationName(tool.location);
                const dueDateClass = this.isOverdue(tool.dueDate) ? 'overdue' : '';
                const cardClass = tool.status !== 'pending' ? tool.status : '';

                let actionsHtml = '';
                if (tool.status === 'pending') {
                    actionsHtml = `
                        <button class="action-btn-small confirm" onclick="inventurPage.confirmTool(${tool.id})">✓ Bestätigen</button>
                        <button class="action-btn-small relocate" onclick="inventurPage.relocateTool(${tool.id})">📌 Verschoben</button>
                    `;
                } else {
                    actionsHtml = `
                        <button class="action-btn-small undo" onclick="inventurPage.resetTool(${tool.id})">↶ Rückgängig</button>
                    `;
                }

                return `
                    <div class="tool-card-compact ${cardClass}">
                        <div class="card-header">
                            <div>
                                <div class="card-title">${tool.name}</div>
                                <div class="tool-number"><a href="#/detail/${tool.id}" style="color: #2c4a8c; text-decoration: none; font-weight: 600;">${tool.number}</a></div>
                            </div>
                            <span class="status-badge ${statusInfo.class}">${statusInfo.icon}</span>
                        </div>
                        <div class="card-location">📌 ${locationText}</div>
                        <div style="margin-bottom: 0.75rem;">
                            <span style="color: #6b7280; font-size: 0.85rem;">Fällig: </span>
                            <span class="due-date ${dueDateClass}">${this.formatDate(tool.dueDate)}</span>
                        </div>
                        <div class="action-cell">${actionsHtml}</div>
                    </div>
                `;
            }).join('');
        }

        this.updatePagination(filtered.length);
        this.updateCounts();
        this.updateSpeedometer();
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }

        const paginationInfo = document.getElementById('paginationInfo');
        const paginationInfoCards = document.getElementById('paginationInfoCards');

        const infoText = totalItems > 0 ? `Seite ${this.currentPage} von ${totalPages} (${totalItems} Werkzeuge)` : 'Keine Einträge';

        if (paginationInfo) paginationInfo.textContent = infoText;
        if (paginationInfoCards) paginationInfoCards.textContent = infoText;

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
        document.getElementById('prevPageCards').disabled = this.currentPage <= 1;
        document.getElementById('nextPageCards').disabled = this.currentPage >= totalPages;
    }

    updateCounts() {
        const total = this.tools.length;
        const pending = this.tools.filter(t => t.status === 'pending').length;
        const confirmed = this.tools.filter(t => t.status === 'confirmed').length;
        const relocated = this.tools.filter(t => t.status === 'relocated').length;
        const overdue = this.tools.filter(t => this.isOverdue(t.dueDate)).length;

        document.getElementById('count-all').textContent = total;
        document.getElementById('count-pending').textContent = pending;
        document.getElementById('count-confirmed').textContent = confirmed;
        document.getElementById('count-relocated').textContent = relocated;
        document.getElementById('count-overdue').textContent = overdue;

        // Update submit button
        const totalConfirmed = confirmed + relocated;
        const submitBtn = document.getElementById('submitBtn');
        const submitInfo = document.getElementById('submitInfo');

        if (totalConfirmed > 0) {
            submitBtn.disabled = false;
            if (totalConfirmed === total) {
                submitInfo.textContent = '✓ Alle Werkzeuge bestätigt - Bereit zum Einreichen';
            } else {
                submitInfo.textContent = `${totalConfirmed} Werkzeug(e) bearbeitet - ${pending} noch offen`;
            }
        } else {
            submitBtn.disabled = true;
            submitInfo.textContent = 'Bitte mindestens ein Werkzeug bearbeiten';
        }
    }

    updateSpeedometer() {
        const toolsDueInNext3Weeks = this.tools.filter(t => this.isDueInNext3Weeks(t.dueDate));
        const confirmedDueInNext3Weeks = toolsDueInNext3Weeks.filter(t => t.status !== 'pending');

        const total = toolsDueInNext3Weeks.length;
        const confirmed = confirmedDueInNext3Weeks.length;
        const percentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

        document.getElementById('speedometerPercentage').textContent = percentage + '%';

        const arcLength = 251.2;
        const offset = arcLength - (arcLength * percentage / 100);
        document.getElementById('speedometerArc').style.strokeDashoffset = offset;

        // Show success message if 100%
        const successMessage = document.getElementById('successMessage');
        if (percentage === 100 && total > 0) {
            successMessage.style.display = 'block';
        } else {
            successMessage.style.display = 'none';
        }
    }

    toggleSelection(id) {
        const tool = this.tools.find(t => t.id === id);
        if (tool && tool.status === 'pending') {
            tool.selected = !tool.selected;
            this.renderTable();
        }
    }

    updateComment(id, comment) {
        const tool = this.tools.find(t => t.id === id);
        if (tool) {
            tool.comment = comment;
        }
    }

    confirmTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (tool) {
            tool.status = 'confirmed';
            tool.selected = false;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
        }
    }

    relocateTool(toolId) {
        this.currentTool = this.tools.find(t => t.id === toolId);
        if (this.currentTool) {
            document.getElementById('modalToolName').textContent = this.currentTool.name;
            document.getElementById('modalToolNumber').textContent = this.currentTool.number;
            document.getElementById('newLocationSelect').value = '';
            document.getElementById('relocationModal').classList.add('active');
        }
    }

    resetTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (tool) {
            tool.status = 'pending';
            tool.newLocation = null;
            tool.selected = false;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
        }
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        document.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('asc', 'desc');
        });
        const th = document.querySelector(`th[data-sort="${column}"]`);
        if (th) {
            th.classList.add(this.sortDirection);
        }

        this.renderTable();
    }

    switchView() {
        if (this.currentView === 'table') {
            document.getElementById('tableView').style.display = 'block';
            document.getElementById('cardView').style.display = 'none';
            document.getElementById('pagination').style.display = 'flex';
            document.getElementById('paginationCards').style.display = 'none';
        } else {
            document.getElementById('tableView').style.display = 'none';
            document.getElementById('cardView').classList.add('active');
            document.getElementById('pagination').style.display = 'none';
            document.getElementById('paginationCards').style.display = 'flex';
            this.renderCards();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
            window.scrollTo(0, 0);
        }
    }

    nextPage() {
        const filtered = this.getFilteredTools();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
            window.scrollTo(0, 0);
        }
    }

    confirmAllFiltered() {
        const filtered = this.getFilteredTools();
        const pending = filtered.filter(t => t.status === 'pending');

        if (pending.length === 0) {
            alert('Keine offenen Werkzeuge zum Bestätigen gefunden.');
            return;
        }

        const confirmed = confirm(`Möchten Sie wirklich alle ${pending.length} gefilterten Werkzeuge bestätigen?`);
        if (!confirmed) return;

        pending.forEach(tool => {
            tool.status = 'confirmed';
        });

        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    openLocationFilterModal() {
        document.getElementById('bulkLocationModal').classList.add('active');
    }

    closeLocationFilterModal() {
        document.getElementById('bulkLocationModal').classList.remove('active');
    }

    confirmLocationFilter() {
        const select = document.getElementById('bulkLocationSelect');
        const locationId = select.value;

        if (!locationId) {
            alert('Bitte wählen Sie einen Standort aus.');
            return;
        }

        this.currentLocationFilter = locationId;
        this.currentPage = 1; // Reset to first page

        this.closeLocationFilterModal();
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    closeRelocationModal() {
        document.getElementById('relocationModal').classList.remove('active');
        this.currentTool = null;
    }

    confirmRelocation() {
        const select = document.getElementById('newLocationSelect');
        const newLocationId = select.value;

        if (!newLocationId) {
            alert('Bitte wählen Sie einen Standort aus.');
            return;
        }

        if (this.currentTool) {
            this.currentTool.status = 'relocated';
            this.currentTool.newLocation = newLocationId;
            this.currentTool.selected = false;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
        }

        this.closeRelocationModal();
    }

    loadFromAPI() {
        const btn = document.getElementById('apiLoadBtn');
        btn.disabled = true;
        btn.innerHTML = '⏳ Lade Daten...';

        setTimeout(() => {
            btn.innerHTML = '✓ Daten geladen';
            btn.style.background = '#10b981';

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '📄 Lade lokale Werkzeuginformationen';
                btn.style.background = '#f97316';
            }, 2000);
        }, 1500);
    }

    submitInventory() {
        const confirmed = this.tools.filter(t => t.status === 'confirmed').length;
        const relocated = this.tools.filter(t => t.status === 'relocated').length;
        const total = confirmed + relocated;

        if (total === 0) {
            alert('Keine Werkzeuge zum Einreichen vorhanden.\nBitte bearbeiten Sie mindestens ein Werkzeug.');
            return;
        }

        // Show confirmation modal
        const summary = `${total} Werkzeug(e) werden eingereicht:\n• ${confirmed} bestätigt\n• ${relocated} verschoben`;
        document.getElementById('submitModalSummary').textContent = summary;
        document.getElementById('submitModal').classList.add('active');
    }

    closeSubmitModal() {
        document.getElementById('submitModal').classList.remove('active');
    }

    confirmSubmit() {
        const confirmed = this.tools.filter(t => t.status === 'confirmed').length;
        const relocated = this.tools.filter(t => t.status === 'relocated').length;
        const total = confirmed + relocated;

        // Remove submitted tools from the list
        this.tools = this.tools.filter(t => t.status === 'pending');

        // Close modal
        this.closeSubmitModal();

        // Show success message
        alert(`✅ Erfolgreich eingereicht!\n\n${total} Werkzeug(e) wurden an die API gesendet:\n• ${confirmed} bestätigt\n• ${relocated} verschoben\n\nDie Werkzeuge wurden aus der Liste entfernt.`);

        // Reset to first page and re-render
        this.currentPage = 1;
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    getLocationName(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        return location ? location.name : locationId;
    }

    getStatusInfo(status) {
        const statusMap = {
            'pending': { class: 'status-pending', icon: '⏳', text: 'Offen' },
            'confirmed': { class: 'status-confirmed', icon: '✓', text: 'Bestätigt' },
            'relocated': { class: 'status-relocated', icon: '📌', text: 'Verschoben' }
        };
        return statusMap[status] || statusMap['pending'];
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    isOverdue(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        return dueDate < today;
    }

    isDueInNext3Weeks(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeWeeksFromNow = new Date(today);
        threeWeeksFromNow.setDate(today.getDate() + 21);
        const dueDate = new Date(dateString);
        return dueDate >= today && dueDate <= threeWeeksFromNow;
    }
}

// Create global instance
const inventurPage = new InventurPage();
