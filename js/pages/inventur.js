// ORCA 2.0 - Inventur Page (v2)
class InventurPage {
    constructor() {
        this.locations = []; // Wird dynamisch aus den geladenen Inventur-Positionen befuellt

        this.tools = [];
        this.companyUsers = []; // Benutzerliste aus API fuer Delegate-Dropdown
        this.currentFilter = 'all';
        this.currentLocationFilter = null;
        this.currentResponsibleFilter = null;
        this.responsibles = []; // Wird dynamisch aus den geladenen Inventur-Positionen befuellt
        this.currentView = 'card';
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
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Inventur';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        app.innerHTML = `
            <div class="container">
                <!-- Info Box mit Hilfe-Icon -->
                <div class="info-widget-compact">
                    <h2>Ihre Inventuraufträge 
                        <span class="help-icon" id="helpIcon">?</span>
                    </h2>
                    <div class="help-tooltip" id="helpTooltip">
                        Hier finden Sie alle Ihre offenen Inventuraufträge, die von BMW bereitgestellt wurden. Bitte bearbeiten Sie die Informationen zu den Werkzeugen gemäß der angebotenen Rückmelde-Buttons auf der rechten Seite. Im Anschluss bestätigen Sie die Inventuren über "Inventur einreichen" an BMW.
                    </div>
                </div>

                <!-- Success Message (wird bei 100% angezeigt) -->
                <div id="successMessage" style="display: none;" class="success-message">
                    <h3>🎉 Herzlichen Glückwunsch!</h3>
                    <p>Alle fälligen Werkzeuge für die nächsten 3 Wochen sind bestätigt. Vielen Dank für Ihre hervorragende Arbeit!</p>
                </div>

                <!-- Ladebalken -->
                <div class="loading-bar-container" id="loadingBarContainer" style="display: none;">
                    <div class="loading-bar-text">Lade Inventurdaten...</div>
                    <div class="loading-bar">
                        <div class="loading-bar-progress" id="loadingBarProgress"></div>
                    </div>
                </div>

                <!-- Tacho Widget mit Agent-Button -->
                <div class="speedometer-widget">
                    <div class="speedometer-header">
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
                        <div class="speedometer-text">
                            <h2>Fortschritt: Inventur</h2>
                            <p>Bearbeitete Werkzeuge (bestätigt, verschoben oder als fehlend gemeldet)</p>
                        </div>
                        <button class="agent-btn-integrated" id="agentImportBtn">
                            <span class="agent-btn-icon">🤖</span>
                            <div class="agent-btn-content">
                                <strong>KI-Agent</strong>
                                <small>Daten importieren</small>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Aktions-Leiste: Filter + Bestätigen -->
                <div class="action-bar">
                    <div class="action-bar-left">
                        <button class="action-btn filter" id="filterLocationBtn">
                            <span>📌</span> Standort
                        </button>
                        <button class="action-btn filter" id="filterResponsibleBtn">
                            <span>👤</span> Verantwortlicher
                        </button>
                        <button class="action-btn reset" id="resetFiltersBtn" style="display: none;">
                            ✕ Filter zurücksetzen
                        </button>
                    </div>
                    <div class="action-bar-right">
                        <button class="action-btn primary" id="confirmAllBtn">
                            ✓ Alle bestätigen
                        </button>
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
                        <div class="export-dropdown">
                            <button class="export-btn" id="exportBtn">
                                📥 Export <span class="dropdown-arrow">▾</span>
                            </button>
                            <div class="export-menu" id="exportMenu">
                                <button class="export-option" data-format="xlsx">
                                    <span>📊</span> Excel (.xlsx)
                                </button>
                                <button class="export-option" data-format="csv">
                                    <span>📄</span> CSV (.csv)
                                </button>
                            </div>
                        </div>
                        <div class="view-toggle">
                            <button class="view-btn" data-view="table">📋 Tabelle</button>
                            <button class="view-btn active" data-view="card">🗂️ Karten</button>
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

                <div class="card-view-header" id="cardViewHeader" style="display: none;">
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

            <!-- Responsible Filter Modal -->
            <div class="modal" id="responsibleFilterModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Nach Verantwortlichem filtern</h2>
                        <div class="modal-subtitle">Nur Werkzeuge dieses Verantwortlichen anzeigen</div>
                    </div>
                    <select class="location-select" id="responsibleFilterSelect">
                        <option value="">-- Verantwortlichen wählen --</option>
                    </select>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelResponsibleFilter">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmResponsibleFilter">Filtern</button>
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

            <!-- Photo Upload Modal -->
            <div class="modal" id="photoModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📷 Foto hinzufügen</h2>
                        <div class="modal-subtitle">Werkzeugfoto hochladen</div>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong id="photoModalToolName"></strong><br>
                        <span id="photoModalToolNumber" style="color: #6b7280; font-size: 0.85rem;"></span>
                    </div>
                    <div class="photo-upload-area" id="photoUploadArea">
                        <input type="file" id="photoInput" accept="image/*" style="display: none;">
                        <div class="photo-preview" id="photoPreview" style="display: none;">
                            <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                        </div>
                        <div class="photo-placeholder" id="photoPlaceholder">
                            <span style="font-size: 3rem;">📷</span>
                            <p style="margin: 0.5rem 0 0; color: #6b7280;">Klicken oder Datei hierher ziehen</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelPhoto">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmPhoto" disabled>Foto speichern</button>
                    </div>
                </div>
            </div>

            <!-- Missing Tool Modal -->
            <div class="modal" id="missingModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>❌ Werkzeug nicht vorhanden</h2>
                        <div class="modal-subtitle">Werkzeug als fehlend melden</div>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong id="missingModalToolName"></strong><br>
                        <span id="missingModalToolNumber" style="color: #6b7280; font-size: 0.85rem;"></span>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Grund / Bemerkung:</label>
                        <textarea id="missingReason" class="comment-input" rows="3"
                                  style="width: 100%; resize: vertical; padding: 0.5rem;"
                                  placeholder="z.B. Nicht am Standort gefunden, möglicherweise verliehen..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelMissing">Abbrechen</button>
                        <button class="modal-btn primary missing-confirm" id="confirmMissing">Als fehlend melden</button>
                    </div>
                </div>
            </div>

            <!-- Delegate/Change Responsible Modal -->
            <div class="modal" id="delegateModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>👤 Verantwortlichen ändern</h2>
                        <div class="modal-subtitle">Aufgabe an Kollegen delegieren</div>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong id="delegateModalToolName"></strong><br>
                        <span id="delegateModalToolNumber" style="color: #6b7280; font-size: 0.85rem;"></span>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Aktuell zugewiesen:</label>
                        <span id="delegateCurrentResponsible" style="color: #6b7280;">-</span>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Neuer Verantwortlicher:</label>
                        <select class="location-select" id="delegateResponsibleSelect">
                            <option value="">-- Verantwortlichen wählen --</option>
                        </select>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Oder neuen Kollegen eingeben:</label>
                        <input type="text" id="delegateNewResponsible" class="comment-input"
                               style="width: 100%; padding: 0.5rem;"
                               placeholder="z.B. Max Mustermann">
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" id="cancelDelegate">Abbrechen</button>
                        <button class="modal-btn primary" id="confirmDelegate">Zuweisen</button>
                    </div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = '';

        // Load data
        await this.loadData();

        // Check for agent import data
        await this.applyAgentImport();

        // Attach event listeners
        this.attachEventListeners();

        // Initialize display
        this.updateCounts();
        this.updateSpeedometer();
        this.switchView(); // Start with card view
    }

    async loadData() {
        // Ladebalken anzeigen
        this.showLoadingBar(true, 'Lade Inventurliste...');

        // Schritt 1: Inventur-Liste holen (Kopfdaten)
        const inventoryResponse = await api.getInventoryList();
        if (!inventoryResponse.success) {
            console.error('Failed to load inventory list');
            this.showLoadingBar(false);
            return;
        }

        // Speichere Lieferanteninformationen (aus urspruenglicher Funktion beibehalten)
        if (inventoryResponse.supplier) {
            this.supplier = inventoryResponse.supplier;
            this.updateSupplierHeader();
        }

        // Schritt 2: Fuer jede Inventur die Positionen laden
        const allPositions = [];
        const totalInventories = inventoryResponse.data.length;

        for (let i = 0; i < inventoryResponse.data.length; i++) {
            const inventory = inventoryResponse.data[i];
            const inventoryKey = inventory.inventoryKey || inventory.id;

            // Ladebalken aktualisieren
            const progress = Math.round(((i + 1) / totalInventories) * 100);
            this.showLoadingBar(true, `Lade Positionen (${i + 1}/${totalInventories})...`, progress);

            try {
                const positionsResponse = await api.getInventoryPositions(inventoryKey);
                if (positionsResponse.success && positionsResponse.data.length > 0) {
                    // Jede Position mit Inventur-Kontext anreichern
                    const enrichedPositions = positionsResponse.data.map(pos => ({
                        ...pos,
                        // Falls dueDate nicht in Position, aus Inventur uebernehmen
                        dueDate: pos.dueDate || inventory.dueDate,
                        // Inventur-Referenz behalten
                        parentInventory: {
                            key: inventoryKey,
                            type: inventory.inventoryType,
                            status: inventory.status
                        }
                    }));
                    allPositions.push(...enrichedPositions);
                }
            } catch (error) {
                console.error(`Error loading positions for ${inventoryKey}:`, error);
            }
        }

        // Schritt 3: Positionen als tools speichern
        this.tools = allPositions.map(tool => ({
            ...tool,
            status: 'pending',
            selected: false,
            newLocation: null
        }));

        // Schritt 4: Standorte aus den geladenen Positionen extrahieren
        this.extractLocationsFromTools();

        // Schritt 5: Benutzerliste aus API laden (fuer Delegate-Dropdown)
        this.showLoadingBar(true, 'Lade Benutzerliste...', 100);
        await this.loadCompanyUsers();

        // Ladebalken ausblenden
        this.showLoadingBar(false);
    }

    // Ladebalken anzeigen/ausblenden
    showLoadingBar(show, text = '', progress = 0) {
        const container = document.getElementById('loadingBarContainer');
        const progressBar = document.getElementById('loadingBarProgress');
        const textEl = container?.querySelector('.loading-bar-text');

        if (!container) return;

        if (show) {
            container.style.display = 'block';
            if (textEl) textEl.textContent = text;
            if (progressBar) {
                progressBar.style.width = progress > 0 ? `${progress}%` : '30%';
                if (progress === 0) {
                    progressBar.classList.add('indeterminate');
                } else {
                    progressBar.classList.remove('indeterminate');
                }
            }
        } else {
            container.style.display = 'none';
        }
    }

    // Laedt die Benutzerliste aus der Company-API
    async loadCompanyUsers() {
        try {
            // Hole zuerst die Company-Daten
            const companyResponse = await api.getCompanyBySupplier();
            if (companyResponse.success && companyResponse.companyKey) {
                const usersResponse = await api.getCompanyUsers(companyResponse.companyKey);
                if (usersResponse.success) {
                    this.companyUsers = usersResponse.data || [];
                }
            }
        } catch (error) {
            console.error('Error loading company users:', error);
            this.companyUsers = [];
        }
    }

    // Prüft auf importierte Daten vom Inventur-Agenten und markiert diese als bestätigt
    async applyAgentImport() {
        const importDataStr = localStorage.getItem('agent_import_data');
        if (!importDataStr) return;

        try {
            const importData = JSON.parse(importDataStr);

            // Prüfe ob die Daten noch aktuell sind (max 1 Stunde alt)
            const importTime = new Date(importData.timestamp);
            const now = new Date();
            const hoursDiff = (now - importTime) / (1000 * 60 * 60);
            if (hoursDiff > 1) {
                localStorage.removeItem('agent_import_data');
                return;
            }

            // Erstelle Set der importierten Werkzeugnummern (normalisiert)
            const importedNumbers = new Set();
            for (const tool of importData.tools) {
                if (tool.number) {
                    // Normalisiere: entferne führende Nullen für Vergleich
                    const normalized = tool.number.replace(/^0+/, '');
                    importedNumbers.add(normalized);
                    importedNumbers.add(tool.number); // Auch original behalten
                }
            }

            // Markiere übereinstimmende Werkzeuge als bestätigt
            let confirmedCount = 0;
            for (const tool of this.tools) {
                const toolNumber = tool.toolNumber || tool.number || tool.id || '';
                const normalizedToolNumber = toolNumber.toString().replace(/^0+/, '');

                if (importedNumbers.has(toolNumber.toString()) || importedNumbers.has(normalizedToolNumber)) {
                    if (tool.status !== 'confirmed') {
                        tool.status = 'confirmed';
                        confirmedCount++;
                    }
                }
            }

            // Lösche importierte Daten
            localStorage.removeItem('agent_import_data');

            // Zeige Erfolgs-Banner wenn Werkzeuge bestätigt wurden
            if (confirmedCount > 0) {
                this.showAgentImportBanner(confirmedCount, importData.tools.length);
            }

        } catch (error) {
            console.error('Error applying agent import:', error);
            localStorage.removeItem('agent_import_data');
        }
    }

    // Zeigt ein Banner mit der Import-Zusammenfassung
    showAgentImportBanner(confirmedCount, totalImported) {
        const existingBanner = document.getElementById('agentImportBanner');
        if (existingBanner) existingBanner.remove();

        const banner = document.createElement('div');
        banner.id = 'agentImportBanner';
        banner.className = 'agent-import-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <span class="banner-icon">🤖</span>
                <div class="banner-text">
                    <strong>${confirmedCount} Werkzeuge</strong> wurden vom Inventur-Agenten als bestätigt übernommen.
                    ${confirmedCount < totalImported
                        ? `<br><small>${totalImported - confirmedCount} Werkzeuge konnten nicht zugeordnet werden.</small>`
                        : ''
                    }
                </div>
                <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Füge Banner nach dem Header ein
        const container = document.querySelector('.inventur-page') || document.querySelector('.container');
        if (container) {
            container.insertBefore(banner, container.firstChild);
        }

        // Füge Styles hinzu wenn nicht vorhanden
        if (!document.getElementById('agent-import-banner-styles')) {
            const styles = document.createElement('style');
            styles.id = 'agent-import-banner-styles';
            styles.textContent = `
                .agent-import-banner {
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    border: 1px solid #86efac;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .agent-import-banner .banner-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .agent-import-banner .banner-icon {
                    font-size: 2rem;
                }
                .agent-import-banner .banner-text {
                    flex: 1;
                    color: #166534;
                }
                .agent-import-banner .banner-text small {
                    color: #15803d;
                }
                .agent-import-banner .banner-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #16a34a;
                    cursor: pointer;
                    padding: 0 0.5rem;
                }
                .agent-import-banner .banner-close:hover {
                    color: #166534;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Extrahiert einzigartige Standorte aus den geladenen Tools
    extractLocationsFromTools() {
        const locationSet = new Map();

        this.tools.forEach(tool => {
            if (tool.location && tool.location.trim()) {
                const locationName = tool.location.trim();
                // Verwende locationKey falls vorhanden, sonst den Namen als Fallback
                const apiKey = tool.locationKey || locationName;

                if (!locationSet.has(locationName)) {
                    locationSet.set(locationName, {
                        id: locationName,           // Fuer internen Filter (Name)
                        key: apiKey,                // Fuer API-Rueckmeldung (UUID)
                        name: locationName
                    });
                }
            }
        });

        // Konvertiere Map zu Array und sortiere alphabetisch
        this.locations = Array.from(locationSet.values())
            .sort((a, b) => a.name.localeCompare(b.name));


        // Aktualisiere die Standort-Dropdowns
        this.populateLocationSelects();

        // Extrahiere auch Verantwortliche
        this.extractResponsiblesFromTools();
    }

    // Extrahiert einzigartige Verantwortliche aus den geladenen Tools
    extractResponsiblesFromTools() {
        const responsibleSet = new Map();

        this.tools.forEach(tool => {
            if (tool.responsible && tool.responsible.trim() && tool.responsible !== 'N/A') {
                const responsibleKey = tool.responsible.trim();
                if (!responsibleSet.has(responsibleKey)) {
                    responsibleSet.set(responsibleKey, {
                        id: responsibleKey,
                        name: responsibleKey
                    });
                }
            }
        });

        // Konvertiere Map zu Array und sortiere alphabetisch
        this.responsibles = Array.from(responsibleSet.values())
            .sort((a, b) => a.name.localeCompare(b.name));


        // Aktualisiere die Verantwortlichen-Dropdown
        this.populateResponsibleSelect();
    }

    // Befuellt die Verantwortlichen-Dropdown
    populateResponsibleSelect() {
        const select = document.getElementById('responsibleFilterSelect');
        if (!select) return;

        // Vorherige Optionen loeschen (ausser der ersten)
        while (select.options.length > 1) {
            select.remove(1);
        }

        this.responsibles.forEach(resp => {
            const option = document.createElement('option');
            option.value = resp.id;
            option.textContent = resp.name;
            select.appendChild(option);
        });
    }

    updateSupplierHeader() {
        const headerElement = document.querySelector('.info-widget-compact h2');
        if (headerElement && this.supplier) {
            headerElement.innerHTML = `Ihre Inventuraufträge von ${this.supplier.name} (${this.supplier.number})
                <span class="help-icon">?</span>`;
            // Event listener is handled via event delegation in attachEventListeners()
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
                if (this.currentView === 'table') {
                    this.renderTable();
                } else {
                    this.renderCards();
                }
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

        // Export dropdown
        const exportBtn = document.getElementById('exportBtn');
        const exportMenu = document.getElementById('exportMenu');
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        });
        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const format = btn.dataset.format;
                this.exportData(format);
                exportMenu.classList.remove('active');
            });
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            exportMenu.classList.remove('active');
        });

        // Confirm all checkbox (table view)
        document.getElementById('confirmAllCheckbox').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.confirmAllFiltered();
                e.target.checked = false; // Reset checkbox
            }
        });



        // Bulk actions
        document.getElementById('filterLocationBtn').addEventListener('click', () => this.openLocationFilterModal());
        document.getElementById('filterResponsibleBtn').addEventListener('click', () => this.openResponsibleFilterModal());
        document.getElementById('resetFiltersBtn').addEventListener('click', () => this.resetAllFilters());
        document.getElementById('agentImportBtn').addEventListener('click', () => router.navigate('/agent-inventur'));
        document.getElementById('confirmAllBtn').addEventListener('click', () => this.confirmAllFiltered());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitInventory());

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        document.getElementById('prevPageCards').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPageCards').addEventListener('click', () => this.nextPage());

        // Event delegation for action buttons (handles dynamic content)
        document.getElementById('app').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (btn) {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                switch (action) {
                    case 'confirm': this.confirmTool(id); break;
                    case 'relocate': this.relocateTool(id); break;
                    case 'photo': this.addPhoto(id); break;
                    case 'missing': this.markMissing(id); break;
                    case 'delegate': this.delegateTool(id); break;
                    case 'reset': this.resetTool(id); break;
                }
            }
        });

        // Event delegation for comment inputs
        document.getElementById('app').addEventListener('change', (e) => {
            if (e.target.classList.contains('comment-input') || e.target.classList.contains('comment-input-card')) {
                const id = e.target.dataset.id;
                const value = e.target.value;
                if (id) {
                    this.updateComment(id, value);
                }
            }
        });

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
        document.getElementById('cancelResponsibleFilter').addEventListener('click', () => this.closeResponsibleFilterModal());
        document.getElementById('confirmResponsibleFilter').addEventListener('click', () => this.confirmResponsibleFilter());
        document.getElementById('cancelSubmit').addEventListener('click', () => this.closeSubmitModal());
        document.getElementById('confirmSubmit').addEventListener('click', () => this.confirmSubmit());

        // Photo modal events
        document.getElementById('cancelPhoto').addEventListener('click', () => this.closePhotoModal());
        document.getElementById('confirmPhoto').addEventListener('click', () => this.confirmPhoto());
        document.getElementById('photoUploadArea').addEventListener('click', () => document.getElementById('photoInput').click());
        document.getElementById('photoInput').addEventListener('change', (e) => this.handlePhotoSelect(e));

        // Photo Drag & Drop
        const photoUploadArea = document.getElementById('photoUploadArea');
        photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadArea.classList.add('dragover');
        });
        photoUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            photoUploadArea.classList.remove('dragover');
        });
        photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            photoUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('photoInput').files = files;
                this.handlePhotoSelect({ target: { files: files } });
            }
        });

        // Missing tool modal events
        document.getElementById('cancelMissing').addEventListener('click', () => this.closeMissingModal());
        document.getElementById('confirmMissing').addEventListener('click', () => this.confirmMissing());

        // Delegate modal events
        document.getElementById('cancelDelegate').addEventListener('click', () => this.closeDelegateModal());
        document.getElementById('confirmDelegate').addEventListener('click', () => this.confirmDelegate());

        // Close modals on backdrop click
        document.getElementById('bulkLocationModal').addEventListener('click', (e) => {
            if (e.target.id === 'bulkLocationModal') this.closeLocationFilterModal();
        });
        document.getElementById('relocationModal').addEventListener('click', (e) => {
            if (e.target.id === 'relocationModal') this.closeRelocationModal();
        });
        document.getElementById('responsibleFilterModal').addEventListener('click', (e) => {
            if (e.target.id === 'responsibleFilterModal') this.closeResponsibleFilterModal();
        });
        document.getElementById('submitModal').addEventListener('click', (e) => {
            if (e.target.id === 'submitModal') this.closeSubmitModal();
        });
        document.getElementById('photoModal').addEventListener('click', (e) => {
            if (e.target.id === 'photoModal') this.closePhotoModal();
        });
        document.getElementById('missingModal').addEventListener('click', (e) => {
            if (e.target.id === 'missingModal') this.closeMissingModal();
        });
        document.getElementById('delegateModal').addEventListener('click', (e) => {
            if (e.target.id === 'delegateModal') this.closeDelegateModal();
        });

        // Help icon toggle - use event delegation to handle dynamically created elements
        document.querySelector('.info-widget-compact').addEventListener('click', (e) => {
            if (e.target.classList.contains('help-icon')) {
                const tooltip = document.getElementById('helpTooltip');
                tooltip.classList.toggle('visible');
            }
        });

        // Populate location selects
        this.populateLocationSelects();
    }

    populateLocationSelects() {
        const newLocationSelect = document.getElementById('newLocationSelect');
        const bulkLocationSelect = document.getElementById('bulkLocationSelect');

        // Safety check - elements may not exist yet
        if (!newLocationSelect || !bulkLocationSelect) return;

        // Vorherige Optionen loeschen (ausser der ersten "-- Standort waehlen --" Option)
        while (newLocationSelect.options.length > 1) {
            newLocationSelect.remove(1);
        }
        while (bulkLocationSelect.options.length > 1) {
            bulkLocationSelect.remove(1);
        }

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

            // Verantwortlichen-Filter
            if (this.currentResponsibleFilter && tool.responsible !== this.currentResponsibleFilter) {
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
                const safeId = tool.id.replace(/'/g, "\\'");
                if (tool.status === 'pending') {
                    actionsHtml = `
                        <button class="action-btn-small confirm" data-action="confirm" data-id="${tool.id}">✓</button>
                        <button class="action-btn-small relocate" data-action="relocate" data-id="${tool.id}">📍</button>
                        <button class="action-btn-small photo" data-action="photo" data-id="${tool.id}">📷</button>
                        <button class="action-btn-small missing" data-action="missing" data-id="${tool.id}">🚫</button>
                    `;
                } else {
                    actionsHtml = `
                        <button class="action-btn-small undo" data-action="reset" data-id="${tool.id}">↶</button>
                    `;
                }

                return `
                    <tr class="${rowClass}">
                        <td class="tool-number"><a href="#/detail/${tool.id}" style="color: #2c4a8c; text-decoration: none; font-weight: 600;">${tool.number}</a></td>
                        <td class="tool-name">${tool.name}</td>
                        <td>${locationText}</td>
                        <td><span class="clickable-responsible" data-action="delegate" data-id="${tool.id}" title="Klicken zum Ändern">${tool.responsible || 'Nicht zugewiesen'}</span></td>
                        <td><span class="due-date ${dueDateClass}">${this.formatDate(tool.dueDate)}</span></td>
                        <td>${tool.lastChange ? this.formatDate(tool.lastChange) : 'N/A'}</td>
                        <td><span class="status-badge ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span></td>
                        <td><input type="text" class="comment-input" data-id="${tool.id}"
                                   placeholder="Kommentar hinzufügen..." value="${tool.comment || ''}"></td>
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
                        <button class="action-btn-card confirm" data-action="confirm" data-id="${tool.id}">✓ Bestätigen</button>
                        <button class="action-btn-card relocate" data-action="relocate" data-id="${tool.id}">📍 Verschoben</button>
                        <button class="action-btn-card photo" data-action="photo" data-id="${tool.id}">📷 Foto hinzufügen</button>
                        <button class="action-btn-card missing" data-action="missing" data-id="${tool.id}">🚫 Nicht vorhanden</button>
                    `;
                } else {
                    actionsHtml = `
                        <button class="action-btn-card undo" data-action="reset" data-id="${tool.id}">↶ Rückgängig</button>
                    `;
                }

                return `
                    <div class="tool-card-row ${cardClass}">
                        <div class="card-block block-info">
                            <div class="card-tool-name">${tool.name}</div>
                            <div class="card-tool-number"><a href="#/detail/${tool.id}">${tool.number}</a></div>
                            <div class="card-detail"><span class="label">📌</span> ${locationText}</div>
                            <div class="card-detail">
                                <span class="label">Fällig:</span> <span class="due-date ${dueDateClass}">${this.formatDate(tool.dueDate)}</span>
                                ${tool.lastChange ? `<span class="separator">|</span> <span class="label">Änderung:</span> ${this.formatDate(tool.lastChange)}` : ''}
                            </div>
                        </div>
                        <div class="card-block block-status">
                            <div class="card-detail"><span class="label">Verantwortlich:</span> <span class="clickable-responsible" data-action="delegate" data-id="${tool.id}" title="Klicken zum Ändern">${tool.responsible || 'Nicht zugewiesen'}</span></div>
                            <div class="card-detail"><span class="status-badge ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span></div>
                            <input type="text" class="comment-input-card" data-id="${tool.id}"
                                   placeholder="Kommentar..." value="${tool.comment || ''}">
                        </div>
                        <div class="card-block block-actions">
                            ${actionsHtml}
                        </div>
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
        const missing = this.tools.filter(t => t.status === 'missing').length;
        const overdue = this.tools.filter(t => this.isOverdue(t.dueDate)).length;

        document.getElementById('count-all').textContent = total;
        document.getElementById('count-pending').textContent = pending;
        document.getElementById('count-confirmed').textContent = confirmed;
        document.getElementById('count-relocated').textContent = relocated;
        document.getElementById('count-overdue').textContent = overdue;

        // Update submit button
        const totalProcessed = confirmed + relocated + missing;
        const submitBtn = document.getElementById('submitBtn');
        const submitInfo = document.getElementById('submitInfo');

        if (totalProcessed > 0) {
            submitBtn.disabled = false;
            if (totalProcessed === total) {
                submitInfo.textContent = '✓ Alle Werkzeuge bearbeitet - Bereit zum Einreichen';
            } else {
                submitInfo.textContent = `${totalProcessed} Werkzeug(e) bearbeitet - ${pending} noch offen`;
            }
        } else {
            submitBtn.disabled = true;
            submitInfo.textContent = 'Bitte mindestens ein Werkzeug bearbeiten';
        }
    }

    updateSpeedometer() {
        const total = this.tools.length;
        const processed = this.tools.filter(t => t.status !== 'pending').length;
        const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

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

        // Disable/enable confirm all button based on pending count
        const confirmAllBtn = document.getElementById('confirmAllBtn');
        const pendingCount = this.tools.filter(t => t.status === 'pending').length;
        if (confirmAllBtn) {
            confirmAllBtn.disabled = pendingCount === 0;
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
            document.getElementById('cardViewHeader').style.display = 'none';
            document.getElementById('cardView').classList.remove('active');
            document.getElementById('pagination').style.display = 'flex';
            document.getElementById('paginationCards').style.display = 'none';
            this.renderTable();
        } else {
            document.getElementById('tableView').style.display = 'none';
            document.getElementById('cardViewHeader').style.display = 'flex';
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
        this.updateResetButtonVisibility();
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    // === Verantwortlichen-Filter Funktionen ===
    openResponsibleFilterModal() {
        document.getElementById('responsibleFilterModal').classList.add('active');
    }

    closeResponsibleFilterModal() {
        document.getElementById('responsibleFilterModal').classList.remove('active');
    }

    confirmResponsibleFilter() {
        const select = document.getElementById('responsibleFilterSelect');
        const responsibleId = select.value;

        if (!responsibleId) {
            alert('Bitte wählen Sie einen Verantwortlichen aus.');
            return;
        }

        this.currentResponsibleFilter = responsibleId;
        this.currentPage = 1; // Reset to first page

        this.closeResponsibleFilterModal();
        this.updateResetButtonVisibility();
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    // Zeigt/versteckt den Reset-Button je nach aktiven Filtern
    updateResetButtonVisibility() {
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (this.currentLocationFilter || this.currentResponsibleFilter) {
            resetBtn.style.display = 'inline-flex';
            // Zeige aktive Filter im Button-Text
            const activeFilters = [];
            if (this.currentLocationFilter) activeFilters.push('Standort');
            if (this.currentResponsibleFilter) activeFilters.push('Verantwortlicher');
            resetBtn.textContent = '✕ Filter zurücksetzen (' + activeFilters.join(', ') + ')';
        } else {
            resetBtn.style.display = 'none';
        }
    }

    // Setzt alle Filter zurueck
    resetAllFilters() {
        this.currentLocationFilter = null;
        this.currentResponsibleFilter = null;
        this.currentPage = 1;

        // Dropdowns zuruecksetzen
        document.getElementById('bulkLocationSelect').value = '';
        document.getElementById('responsibleFilterSelect').value = '';

        this.updateResetButtonVisibility();
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
            // Speichere auch den locationKey fuer die API-Rueckmeldung
            const selectedLocation = this.locations.find(loc => loc.id === newLocationId);
            this.currentTool.newLocationKey = selectedLocation?.key || newLocationId;
            this.currentTool.selected = false;
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
        }

        this.closeRelocationModal();
    }

    async loadFromAPI() {
        const btn = document.getElementById('apiLoadBtn');
        btn.disabled = true;
        btn.innerHTML = '⏳ Lade Daten...';

        try {
            await this.loadData();

            btn.innerHTML = '✓ Daten geladen';
            btn.style.background = '#22c55e';

            // Update display
            this.updateCounts();
            this.updateSpeedometer();
            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '📥 Daten aus Lieferantensystem importieren';
                btn.style.background = '#f97316';
            }, 2000);
        } catch (error) {
            btn.innerHTML = '❌ Fehler beim Laden';
            btn.style.background = '#ef4444';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '📥 Daten aus Lieferantensystem importieren';
                btn.style.background = '#f97316';
            }, 2000);
        }
    }

    submitInventory() {
        const confirmed = this.tools.filter(t => t.status === 'confirmed').length;
        const relocated = this.tools.filter(t => t.status === 'relocated').length;
        const missing = this.tools.filter(t => t.status === 'missing').length;
        const total = confirmed + relocated + missing;

        if (total === 0) {
            alert('Keine Werkzeuge zum Einreichen vorhanden.\nBitte bearbeiten Sie mindestens ein Werkzeug.');
            return;
        }

        // Show confirmation modal
        let summary = `${total} Werkzeug(e) werden eingereicht:\n• ${confirmed} bestätigt\n• ${relocated} verschoben`;
        if (missing > 0) {
            summary += `\n• ${missing} als fehlend gemeldet`;
        }
        document.getElementById('submitModalSummary').textContent = summary;
        document.getElementById('submitModal').classList.add('active');
    }

    closeSubmitModal() {
        document.getElementById('submitModal').classList.remove('active');
    }

    confirmSubmit() {
        const confirmed = this.tools.filter(t => t.status === 'confirmed').length;
        const relocated = this.tools.filter(t => t.status === 'relocated').length;
        const missing = this.tools.filter(t => t.status === 'missing').length;
        const total = confirmed + relocated + missing;

        // Remove submitted tools from the list
        this.tools = this.tools.filter(t => t.status === 'pending');

        // Close modal
        this.closeSubmitModal();

        // Show success message
        let successMsg = `✅ Erfolgreich eingereicht!\n\n${total} Werkzeug(e) wurden an die API gesendet:\n• ${confirmed} bestätigt\n• ${relocated} verschoben`;
        if (missing > 0) {
            successMsg += `\n• ${missing} als fehlend gemeldet`;
        }
        successMsg += '\n\nDie Werkzeuge wurden aus der Liste entfernt.';
        alert(successMsg);

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
            'relocated': { class: 'status-relocated', icon: '📌', text: 'Verschoben' },
            'missing': { class: 'status-missing', icon: '❌', text: 'Fehlt' }
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

    // Photo upload methods
    addPhoto(toolId) {
        // Suche mit == statt === fuer flexibleren Vergleich (String vs Number)
        this.currentTool = this.tools.find(t => t.id == toolId || t.positionKey == toolId);
        if (this.currentTool) {
            document.getElementById('photoModalToolName').textContent = this.currentTool.name || this.currentTool.assetName || 'Unbekannt';
            document.getElementById('photoModalToolNumber').textContent = this.currentTool.number || this.currentTool.inventoryNumber || this.currentTool.toolNumber || '';
            document.getElementById('photoPreview').style.display = 'none';
            document.getElementById('photoPlaceholder').style.display = 'block';
            document.getElementById('photoInput').value = '';
            document.getElementById('confirmPhoto').disabled = true;
            document.getElementById('photoModal').classList.add('active');
        } else {
            console.error('Tool nicht gefunden:', toolId, 'Verfuegbare IDs:', this.tools.map(t => t.id));
        }
    }

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('previewImage').src = e.target.result;
                document.getElementById('photoPreview').style.display = 'block';
                document.getElementById('photoPlaceholder').style.display = 'none';
                document.getElementById('confirmPhoto').disabled = false;
                this.selectedPhoto = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    closePhotoModal() {
        document.getElementById('photoModal').classList.remove('active');
        this.currentTool = null;
        this.selectedPhoto = null;
    }

    confirmPhoto() {
        if (this.currentTool && this.selectedPhoto) {
            this.currentTool.photo = this.selectedPhoto;
            alert(`✅ Foto wurde für "${this.currentTool.name}" gespeichert.`);
        }
        this.closePhotoModal();
    }

    // Missing tool methods
    markMissing(toolId) {
        this.currentTool = this.tools.find(t => t.id === toolId);
        if (this.currentTool) {
            document.getElementById('missingModalToolName').textContent = this.currentTool.name;
            document.getElementById('missingModalToolNumber').textContent = this.currentTool.number;
            document.getElementById('missingReason').value = '';
            document.getElementById('missingModal').classList.add('active');
        }
    }

    closeMissingModal() {
        document.getElementById('missingModal').classList.remove('active');
        this.currentTool = null;
    }

    confirmMissing() {
        if (this.currentTool) {
            const reason = document.getElementById('missingReason').value;
            this.currentTool.status = 'missing';
            this.currentTool.missingReason = reason;
            this.currentTool.comment = reason; // Übertrage Grund ins Kommentarfeld
            this.currentTool.selected = false;

            this.closeMissingModal();

            if (this.currentView === 'table') {
                this.renderTable();
            } else {
                this.renderCards();
            }
        }
    }

    // Delegate/Change Responsible methods
    delegateTool(toolId) {
        this.currentTool = this.tools.find(t => t.id === toolId);
        if (this.currentTool) {
            document.getElementById('delegateModalToolName').textContent = this.currentTool.name;
            document.getElementById('delegateModalToolNumber').textContent = this.currentTool.number;
            document.getElementById('delegateCurrentResponsible').textContent = this.currentTool.responsible || 'Nicht zugewiesen';

            // Dropdown mit Benutzern aus der Company-API fuellen
            const select = document.getElementById('delegateResponsibleSelect');
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Nutze companyUsers aus API (falls geladen), sonst fallback auf responsibles
            const userList = this.companyUsers.length > 0 ? this.companyUsers : this.responsibles;

            userList.forEach(user => {
                const option = document.createElement('option');
                // companyUsers haben fullName, responsibles haben name
                const displayName = user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                if (displayName && displayName !== 'Unbekannt') {
                    option.value = displayName;
                    option.textContent = displayName;
                    select.appendChild(option);
                }
            });

            // Felder zuruecksetzen
            select.value = '';
            document.getElementById('delegateNewResponsible').value = '';

            document.getElementById('delegateModal').classList.add('active');
        }
    }

    closeDelegateModal() {
        document.getElementById('delegateModal').classList.remove('active');
        this.currentTool = null;
    }

    confirmDelegate() {
        if (!this.currentTool) return;

        const selectValue = document.getElementById('delegateResponsibleSelect').value;
        const inputValue = document.getElementById('delegateNewResponsible').value.trim();

        // Prioritaet: Eingabefeld > Dropdown
        const newResponsible = inputValue || selectValue;

        if (!newResponsible) {
            alert('Bitte wählen Sie einen Verantwortlichen aus oder geben Sie einen neuen Namen ein.');
            return;
        }

        // Finde das Tool im Array und aktualisiere es direkt
        const toolIndex = this.tools.findIndex(t => t.id === this.currentTool.id);
        if (toolIndex === -1) {
            alert('Fehler: Werkzeug nicht gefunden.');
            return;
        }

        const oldResponsible = this.tools[toolIndex].responsible;
        const toolName = this.tools[toolIndex].name;

        // Direkt im Array aktualisieren
        this.tools[toolIndex].responsible = newResponsible;

        // Falls neuer Verantwortlicher noch nicht in der Liste ist, hinzufuegen
        if (inputValue && !this.responsibles.find(r => r.id === inputValue)) {
            this.responsibles.push({ id: inputValue, name: inputValue });
            this.responsibles.sort((a, b) => a.name.localeCompare(b.name));
            this.populateResponsibleSelect();
        }

        // Modal schliessen (setzt this.currentTool auf null)
        document.getElementById('delegateModal').classList.remove('active');
        this.currentTool = null;

        // Erfolgsmeldung
        alert(`Verantwortlicher geaendert!\n\nWerkzeug: ${toolName}\nVon: ${oldResponsible || 'Nicht zugewiesen'}\nAn: ${newResponsible}`);

        // Ansicht neu rendern
        if (this.currentView === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    // Export-Funktionen
    exportData(format) {
        const filteredTools = this.getFilteredTools();

        if (filteredTools.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }

        // Daten für Export aufbereiten
        const exportData = filteredTools.map(tool => ({
            'Werkzeugnummer': tool.number || tool.inventoryNumber || '',
            'Bezeichnung': tool.name || '',
            'Standort': tool.location || '',
            'Verantwortlicher': tool.responsible || '',
            'Fälligkeitsdatum': this.formatDate(tool.dueDate) || '',
            'Status': this.getStatusText(tool.status),
            'Kommentar': tool.comment || ''
        }));

        if (format === 'xlsx') {
            this.exportToExcel(exportData);
        } else if (format === 'csv') {
            this.exportToCSV(exportData);
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Offen',
            'confirmed': 'Bestätigt',
            'relocated': 'Verschoben',
            'missing': 'Fehlend'
        };
        return statusMap[status] || status || 'Offen';
    }

    exportToExcel(data) {
        // Nutze SheetJS (bereits eingebunden)
        if (typeof XLSX === 'undefined') {
            alert('Excel-Export nicht verfügbar. Bitte nutzen Sie CSV.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventur');

        // Spaltenbreiten anpassen
        ws['!cols'] = [
            { wch: 15 }, // Werkzeugnummer
            { wch: 30 }, // Bezeichnung
            { wch: 20 }, // Standort
            { wch: 20 }, // Verantwortlicher
            { wch: 15 }, // Fälligkeitsdatum
            { wch: 12 }, // Status
            { wch: 30 }  // Kommentar
        ];

        // Dateiname mit Datum
        const date = new Date().toISOString().split('T')[0];
        const filename = `Inventur_Export_${date}.xlsx`;

        XLSX.writeFile(wb, filename);
    }

    exportToCSV(data) {
        if (data.length === 0) return;

        // Header
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(';')];

        // Daten
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape für CSV (Semikolon, Anführungszeichen, Zeilenumbrüche)
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(';'));
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Dateiname mit Datum
        const date = new Date().toISOString().split('T')[0];
        const filename = `Inventur_Export_${date}.csv`;

        // Download triggern
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Create global instance
const inventurPage = new InventurPage();
