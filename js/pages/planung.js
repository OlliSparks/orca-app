// ORCA 2.0 - Inventur-Planung Page
class PlanungPage {
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

        // Update Header
        document.getElementById('headerTitle').textContent = 'Orca 2.0 - Inventory Service';
        document.getElementById('headerSubtitle').textContent = 'Werkzeug-Inventur Management';

        // Hide header stats (will use custom header stats for this page)
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        app.innerHTML = `
            <div class="container">
                <!-- Tacho Widget -->
                <div class="speedometer-widget">
                    <div class="speedometer-header">
                        <div class="speedometer-text">
                            <h2>Fortschritt: Fälligkeiten (6 Monate)</h2>
                            <p>Geplante Werkzeuge mit Startdatum in den nächsten 6 Monaten</p>
                        </div>
                        <div class="speedometer-container">
                            <div class="speedometer">
                                <svg viewBox="0 0 200 120" style="width: 100%; height: 100%;">
                                    <!-- Background Arc (hellgrau) -->
                                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" stroke-width="20" stroke-linecap="round"/>

                                    <!-- Status Segments -->
                                    <path id="segmentInInventur" d="M 20 100 A 80 80 0 0 1 180 100"
                                          fill="none" stroke="#86efac" stroke-width="20" stroke-linecap="round"
                                          stroke-dasharray="251.2" stroke-dashoffset="251.2"
                                          style="transition: stroke-dashoffset 0.5s ease;"/>

                                    <path id="segmentFeinplanung" d="M 20 100 A 80 80 0 0 1 180 100"
                                          fill="none" stroke="#93c5fd" stroke-width="20" stroke-linecap="round"
                                          stroke-dasharray="251.2" stroke-dashoffset="251.2"
                                          style="transition: stroke-dashoffset 0.5s ease;"/>

                                    <path id="segmentOffen" d="M 20 100 A 80 80 0 0 1 180 100"
                                          fill="none" stroke="#f3f4f6" stroke-width="20" stroke-linecap="round"
                                          stroke-dasharray="251.2" stroke-dashoffset="251.2"
                                          style="transition: stroke-dashoffset 0.5s ease;"/>
                                </svg>
                                <div class="speedometer-percentage" id="speedometerPercentage">0%</div>
                                <div class="speedometer-label">Geplant</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="view-controls">
                    <button class="bulk-btn api-load" id="apiLoadBtn">
                        📄 Lade lokale Werkzeuginformationen
                    </button>
                    <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                        <button class="bulk-btn primary" id="bulkConfirmBtn">✓ Ausgewählte bestätigen</button>
                        <button class="bulk-btn secondary" id="bulkLocationBtn">📌 Standortplanung</button>
                    </div>
                </div>

                <div class="toolbar">
                    <div class="toolbar-left">
                        <div class="filter-chip active" data-filter="all">
                            Alle <span class="count" id="count-all">0</span>
                        </div>
                        <div class="filter-chip" data-filter="offen">
                            Offen <span class="count" id="count-offen">0</span>
                        </div>
                        <div class="filter-chip" data-filter="feinplanung">
                            Feinplanung <span class="count" id="count-feinplanung">0</span>
                        </div>
                        <div class="filter-chip" data-filter="in-inventur">
                            in Inventur <span class="count" id="count-in-inventur">0</span>
                        </div>
                    </div>
                    <div id="locationFilterIndicator" style="display: none; color: #2c4a8c; font-weight: 600; font-size: 0.9rem; margin: 0 1rem;">
                        📌 <span id="locationFilterText"></span>
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
                                <th class="checkbox-col">
                                    <input type="checkbox" class="checkbox-custom" id="selectAll">
                                </th>
                                <th class="sortable" data-sort="number">Werkzeugnummer</th>
                                <th class="sortable" data-sort="name">Werkzeug</th>
                                <th class="sortable" data-sort="location">Standort</th>
                                <th class="sortable" data-sort="dueDate">Fälligkeitsdatum</th>
                                <th class="sortable" data-sort="startDate">Starttermin</th>
                                <th class="sortable" data-sort="inventoryType">Inventurtyp</th>
                                <th>Status</th>
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
                        <span id="submitInfo">Bereit zum Aktualisieren</span>
                    </div>
                    <button class="submit-btn" id="submitBtn">
                        🔄 Inventurplanung aktualisieren
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

            <!-- Bulk Location Modal -->
            <div class="modal" id="bulkLocationModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Standortplanung</h2>
                        <div class="modal-subtitle">Filtern Sie die Tabelle nach einem Standort</div>
                    </div>
                    <select class="location-select" id="bulkLocationSelect">
                        <option value="">Alle Standorte</option>
                    </select>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelBulkLocation">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmBulkLocation">Filtern</button>
                    </div>
                </div>
            </div>
        `;

        // Update footer (hide for this page as we have submit bar)
        document.getElementById('footerActions').innerHTML = '';

        // Load mock data
        await this.loadData();

        // Attach event listeners
        this.attachEventListeners();

        // Initialize display
        this.updateCounts();
        this.updateSpeedometer();
        this.renderTable();
    }

    async loadData() {
        // Generate mock data
        const response = await api.getPlanningData();
        if (response.success) {
            this.tools = response.data.map(tool => ({
                ...tool,
                status: this.calculateInventoryStatus(tool.startDate),
                selected: false
            }));
        }
    }

    calculateInventoryStatus(startDateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(startDateString);
        startDate.setHours(0, 0, 0, 0);

        const diffTime = startDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return 'in-inventur';
        } else if (diffDays > 180) {
            return 'offen';
        } else {
            return 'feinplanung';
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

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const filtered = this.getFilteredTools();
            const paginatedTools = this.getPaginatedTools(filtered);
            paginatedTools.forEach(tool => tool.selected = e.target.checked);
            this.renderTable();
        });

        // Bulk actions
        document.getElementById('bulkConfirmBtn').addEventListener('click', () => this.bulkConfirm());
        document.getElementById('bulkLocationBtn').addEventListener('click', () => this.openBulkLocationModal());
        document.getElementById('apiLoadBtn').addEventListener('click', () => this.loadFromAPI());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitInventoryPlan());

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
        document.getElementById('cancelBulkLocation').addEventListener('click', () => this.closeBulkLocationModal());
        document.getElementById('confirmBulkLocation').addEventListener('click', () => this.confirmBulkLocation());

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
        let filtered = this.tools;

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(tool => tool.status === this.currentFilter);
        }

        // Apply location filter
        if (this.currentLocationFilter) {
            filtered = filtered.filter(tool => tool.location === this.currentLocationFilter);
        }

        // Apply sorting
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                let aVal = a[this.sortColumn];
                let bVal = b[this.sortColumn];

                if (this.sortColumn === 'location') {
                    aVal = this.getLocationName(aVal);
                    bVal = this.getLocationName(bVal);
                }

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (this.sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
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
                    <td colspan="8" style="text-align: center; padding: 3rem; color: #6b7280;">
                        Keine Werkzeuge gefunden
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = paginated.map(tool => {
                const locationName = this.getLocationName(tool.location);
                const statusInfo = this.getStatusInfo(tool.status);
                const isOverdue = this.isOverdue(tool.dueDate);
                const dueDateClass = isOverdue ? 'due-date overdue' : 'due-date';

                return `
                    <tr class="${tool.status === 'confirmed' ? 'confirmed' : tool.status === 'relocated' ? 'relocated' : ''}">
                        <td>
                            <input type="checkbox" class="checkbox-custom" ${tool.selected ? 'checked' : ''}
                                   onchange="planungPage.toggleSelection(${tool.id})">
                        </td>
                        <td class="tool-number"><a href="#/detail/${tool.id}" style="color: #2c4a8c; text-decoration: none; font-weight: 600;">${tool.number}</a></td>
                        <td class="tool-name">${tool.name}</td>
                        <td class="location-cell">📌 ${locationName}</td>
                        <td class="${dueDateClass}">${this.formatDate(tool.dueDate)}</td>
                        <td>
                            <input type="date"
                                   class="date-input"
                                   value="${tool.startDate}"
                                   data-tool-id="${tool.id}"
                                   onchange="planungPage.updateStartDate(${tool.id}, this.value)">
                        </td>
                        <td>${tool.inventoryType}</td>
                        <td>
                            <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update pagination
        this.updatePagination(filtered.length);
        this.updateCounts();
        this.updateSubmitInfo();
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        const paginationInfo = document.getElementById('paginationInfo');
        const paginationInfoCards = document.getElementById('paginationInfoCards');

        const infoText = totalItems > 0 ? `Zeige ${start}-${end} von ${totalItems}` : 'Keine Einträge';

        if (paginationInfo) paginationInfo.textContent = infoText;
        if (paginationInfoCards) paginationInfoCards.textContent = infoText;

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
        document.getElementById('prevPageCards').disabled = this.currentPage <= 1;
        document.getElementById('nextPageCards').disabled = this.currentPage >= totalPages;
    }

    updateCounts() {
        const total = this.tools.length;
        const offen = this.tools.filter(t => t.status === 'offen').length;
        const feinplanung = this.tools.filter(t => t.status === 'feinplanung').length;
        const inInventur = this.tools.filter(t => t.status === 'in-inventur').length;

        document.getElementById('count-all').textContent = total;
        document.getElementById('count-offen').textContent = offen;
        document.getElementById('count-feinplanung').textContent = feinplanung;
        document.getElementById('count-in-inventur').textContent = inInventur;
    }

    updateSpeedometer() {
        const offen = this.tools.filter(t => t.status === 'offen').length;
        const feinplanung = this.tools.filter(t => t.status === 'feinplanung').length;
        const inInventur = this.tools.filter(t => t.status === 'in-inventur').length;
        const total = offen + feinplanung + inInventur;

        if (total === 0) {
            document.getElementById('speedometerPercentage').textContent = '0%';
            return;
        }

        const percentOffen = (offen / total) * 100;
        const percentFeinplanung = (feinplanung / total) * 100;
        const percentInInventur = (inInventur / total) * 100;

        const totalPercent = Math.round(percentFeinplanung + percentInInventur);
        document.getElementById('speedometerPercentage').textContent = `${totalPercent}%`;

        // Update SVG arcs (251.2 is the total arc length)
        const arcLength = 251.2;

        // in Inventur (full arc from start)
        const offsetInInventur = arcLength - (arcLength * percentInInventur / 100);
        document.getElementById('segmentInInventur').style.strokeDashoffset = offsetInInventur;

        // Feinplanung (arc from start to feinplanung + inInventur)
        const offsetFeinplanung = arcLength - (arcLength * (percentFeinplanung + percentInInventur) / 100);
        document.getElementById('segmentFeinplanung').style.strokeDashoffset = offsetFeinplanung;

        // Offen (full arc)
        const offsetOffen = arcLength - arcLength;
        document.getElementById('segmentOffen').style.strokeDashoffset = offsetOffen;
    }

    updateSubmitInfo() {
        const selected = this.tools.filter(t => t.selected).length;
        const submitInfo = document.getElementById('submitInfo');
        const submitBtn = document.getElementById('submitBtn');

        if (selected > 0) {
            submitInfo.textContent = `${selected} Werkzeug(e) ausgewählt`;
            submitBtn.disabled = false;
        } else {
            submitInfo.textContent = 'Bereit zum Aktualisieren';
            submitBtn.disabled = false;
        }
    }

    toggleSelection(id) {
        const tool = this.tools.find(t => t.id === id);
        if (tool) {
            tool.selected = !tool.selected;
            this.renderTable();
        }
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        // Update sort indicators
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

    renderCards() {
        const filtered = this.getFilteredTools();
        const paginated = this.getPaginatedTools(filtered);
        const cardView = document.getElementById('cardView');

        if (paginated.length === 0) {
            cardView.innerHTML = '<div style="text-align: center; padding: 3rem; color: #6b7280;">Keine Werkzeuge gefunden</div>';
        } else {
            cardView.innerHTML = paginated.map(tool => {
                const locationName = this.getLocationName(tool.location);
                const statusInfo = this.getStatusInfo(tool.status);

                return `
                    <div class="tool-card-compact ${tool.status === 'confirmed' ? 'confirmed' : tool.status === 'relocated' ? 'relocated' : ''}">
                        <div class="card-header">
                            <div>
                                <div class="card-title">${tool.name}</div>
                                <div class="tool-number"><a href="#/detail/${tool.id}" style="color: #2c4a8c; text-decoration: none; font-weight: 600;">${tool.number}</a></div>
                            </div>
                            <input type="checkbox" class="checkbox-custom" ${tool.selected ? 'checked' : ''}
                                   onchange="planungPage.toggleSelection(${tool.id})">
                        </div>
                        <div class="card-location">📌 ${locationName}</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.85rem;">
                            <div>
                                <div style="color: #6b7280;">Fälligkeitsdatum</div>
                                <div>${this.formatDate(tool.dueDate)}</div>
                            </div>
                            <div>
                                <div style="color: #6b7280;">Starttermin</div>
                                <div>${this.formatDate(tool.startDate)}</div>
                            </div>
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.updatePagination(filtered.length);
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
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
        }
    }

    bulkConfirm() {
        const selected = this.tools.filter(t => t.selected);
        if (selected.length === 0) {
            alert('Bitte wählen Sie mindestens ein Werkzeug aus.');
            return;
        }
        alert(`✓ ${selected.length} Werkzeug(e) wurden bestätigt.\n\nDiese Funktion wird mit der API-Integration vollständig implementiert.`);
    }

    openBulkLocationModal() {
        document.getElementById('bulkLocationModal').classList.add('active');
    }

    closeBulkLocationModal() {
        document.getElementById('bulkLocationModal').classList.remove('active');
    }

    confirmBulkLocation() {
        const select = document.getElementById('bulkLocationSelect');
        const locationId = select.value;

        if (locationId) {
            this.currentLocationFilter = locationId;
            const locationName = this.getLocationName(locationId);
            document.getElementById('locationFilterIndicator').style.display = 'block';
            document.getElementById('locationFilterText').textContent = locationName;
        } else {
            this.currentLocationFilter = null;
            document.getElementById('locationFilterIndicator').style.display = 'none';
        }

        this.currentPage = 1;
        this.renderTable();
        this.closeBulkLocationModal();
    }

    openRelocationModal(tool) {
        this.currentTool = tool;
        document.getElementById('modalToolName').textContent = tool.name;
        document.getElementById('modalToolNumber').textContent = tool.number;
        document.getElementById('relocationModal').classList.add('active');
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
            this.currentTool.location = newLocationId;
            this.renderTable();
        }

        this.closeRelocationModal();
    }

    loadFromAPI() {
        alert('📄 Lade lokale Werkzeuginformationen...\n\nDiese Funktion lädt Werkzeugdaten aus einer lokalen Datei oder API und aktualisiert die Planung.');
    }

    submitInventoryPlan() {
        const selected = this.tools.filter(t => t.selected);
        const message = selected.length > 0
            ? `🔄 Inventurplanung wird aktualisiert...\n\n${selected.length} Werkzeug(e) werden an die API gesendet.`
            : `🔄 Inventurplanung wird aktualisiert...\n\nAlle Änderungen werden gespeichert.`;

        alert(message + '\n\nDiese Funktion wird mit der API-Integration vollständig implementiert.');
    }

    updateStartDate(toolId, newDate) {
        const tool = this.tools.find(t => t.id === toolId);
        if (tool && newDate) {
            tool.startDate = newDate;
            // Status wird automatisch neu berechnet beim nächsten Render
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
            console.log(`Startdatum für Tool ${toolId} geändert auf ${newDate}`);
        }
    }

    getLocationName(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        return location ? location.name : locationId;
    }

    getStatusInfo(status) {
        const statusMap = {
            'offen': { class: 'status-offen', text: '⚪ Offen' },
            'feinplanung': { class: 'status-feinplanung', text: '🔵 Feinplanung' },
            'in-inventur': { class: 'status-in-inventur', text: '✅ in Inventur' },
            'confirmed': { class: 'status-confirmed', text: '✓ Bestätigt' },
            'relocated': { class: 'status-relocated', text: '📌 Verschoben' }
        };
        return statusMap[status] || statusMap['offen'];
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
}

// Create global instance
const planungPage = new PlanungPage();
