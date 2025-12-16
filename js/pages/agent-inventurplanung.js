// ORCA 2.0 - Inventurplanungs-Agent
// Flow: 1. Daten laden → 2. Zeitraum wählen → 3. Standorte organisieren → 4. Absprung Inventur

class AgentInventurplanungPage {
    constructor() {
        this.messages = [];
        this.uploadedFiles = [];
        this.isProcessing = false;
        this.claudeApiKey = null;

        // Daten
        this.knownTools = [];           // Werkzeuge aus Import
        this.openInventories = [];      // Offene Inventuren aus API
        this.matchedTools = [];         // Gematchte Werkzeuge (bestätigbar)
        this.unmatchedTools = [];       // Nicht gematchte (vor Ort nötig)

        // Planung
        this.currentStep = 1;
        this.selectedDateRange = null;  // { start: Date, end: Date }
        this.locationAssignments = {};  // { standort: { responsible: userId, tools: [] } }
        this.availableUsers = [];       // Benutzer für Delegation
    }

    async render() {
        const app = document.getElementById('app');

        // Reset
        this.messages = [];
        this.uploadedFiles = [];
        this.currentStep = 1;
        this.knownTools = [];
        this.matchedTools = [];
        this.unmatchedTools = [];
        this.selectedDateRange = null;
        this.locationAssignments = {};

        // Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Inventurplanungs-Agent';
        document.getElementById('headerSubtitle').textContent = 'Inventuren effizient planen';
        document.getElementById('headerStats').style.display = 'none';

        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) navDropdown.value = '/agenten';

        app.innerHTML = `
            <div class="container agent-planung-page">
                <div class="agent-layout">
                    <!-- Sidebar -->
                    <div class="agent-sidebar">
                        <!-- Steps -->
                        <div class="sidebar-section steps-section">
                            <div class="step-indicator">
                                <div class="step active" data-step="1">
                                    <div class="step-number">1</div>
                                    <div class="step-label">Daten laden</div>
                                </div>
                                <div class="step-line"></div>
                                <div class="step" data-step="2">
                                    <div class="step-number">2</div>
                                    <div class="step-label">Zeitraum</div>
                                </div>
                                <div class="step-line"></div>
                                <div class="step" data-step="3">
                                    <div class="step-number">3</div>
                                    <div class="step-label">Organisieren</div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 1: Daten laden -->
                        <div class="sidebar-section step-content" id="step1Content">
                            <h3>Hast du Werkzeugdaten?</h3>

                            <div class="upload-options-small">
                                <button class="upload-option-sm active" data-type="file">
                                    <span class="option-icon">📊</span>
                                    <span>Excel</span>
                                </button>
                                <button class="upload-option-sm" data-type="screenshot">
                                    <span class="option-icon">📷</span>
                                    <span>Screenshot</span>
                                </button>
                                <button class="upload-option-sm" data-type="stammdaten">
                                    <span class="option-icon">💾</span>
                                    <span>Stammdaten</span>
                                </button>
                            </div>

                            <div class="upload-area" id="uploadArea">
                                <div class="upload-icon">📁</div>
                                <p>Datei hierher ziehen<br>oder <span class="upload-link">durchsuchen</span></p>
                                <input type="file" id="fileInput" accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg" multiple hidden>
                            </div>
                            <div class="uploaded-files" id="uploadedFiles"></div>

                            <div class="skip-section">
                                <div class="skip-divider"><span>oder</span></div>
                                <button class="skip-btn" data-type="skip">
                                    Keine Daten → Direkt zum Zeitraum
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Zeitraum wählen -->
                        <div class="sidebar-section step-content" id="step2Content" style="display: none;">
                            <h3>Zeitraum wählen</h3>
                            <p class="step-hint">Wann willst du dich um Inventuren kümmern?</p>

                            <div class="calendar-container" id="calendarContainer">
                                <div class="calendar-header">
                                    <button class="cal-nav" id="prevMonth">◀</button>
                                    <span class="cal-month" id="calMonth"></span>
                                    <button class="cal-nav" id="nextMonth">▶</button>
                                </div>
                                <div class="calendar-grid" id="calendarGrid">
                                    <!-- Kalender wird dynamisch generiert -->
                                </div>
                            </div>

                            <div class="selected-range" id="selectedRange" style="display: none;">
                                <strong>Gewählter Zeitraum:</strong>
                                <span id="rangeText"></span>
                            </div>

                            <div class="quick-select">
                                <button class="quick-btn" data-range="thisWeek">Diese Woche</button>
                                <button class="quick-btn" data-range="nextWeek">Nächste Woche</button>
                                <button class="quick-btn" data-range="thisMonth">Dieser Monat</button>
                            </div>

                            <button class="continue-btn" id="continueToStep3" disabled>
                                Weiter zu Standorten →
                            </button>
                        </div>

                        <!-- Step 3: Standorte organisieren -->
                        <div class="sidebar-section step-content" id="step3Content" style="display: none;">
                            <h3>Standorte organisieren</h3>
                            <p class="step-hint">Wer kümmert sich um welchen Standort?</p>

                            <div class="location-assignments" id="locationAssignments">
                                <!-- Dynamisch befüllt -->
                            </div>
                        </div>
                    </div>

                    <!-- Main Chat Area -->
                    <div class="agent-main">
                        <div class="chat-container" id="chatContainer">
                            <div class="chat-messages" id="chatMessages"></div>
                        </div>

                        <div class="chat-input-area">
                            <div class="input-wrapper">
                                <textarea id="chatInput" placeholder="Frage stellen..." rows="1"></textarea>
                                <button class="send-btn" id="sendBtn">Senden</button>
                            </div>
                        </div>
                    </div>

                    <!-- Results Panel -->
                    <div class="agent-results" id="agentResults">
                        <div class="results-header">
                            <h3>Übersicht</h3>
                        </div>
                        <div class="results-content" id="resultsContent">
                            <div class="empty-results">
                                <div class="empty-icon">📋</div>
                                <p>Lade Daten oder wähle<br>einen Zeitraum</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
        await this.loadOpenInventories();
        await this.loadAvailableUsers();
        this.loadApiKey();
        this.initCalendar();
        this.showGreeting();
    }

    loadApiKey() {
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        this.claudeApiKey = config.claudeApiKey || localStorage.getItem('claude_api_key');
    }

    async loadOpenInventories() {
        try {
            const response = await api.getPlanningData();
            if (response.success) {
                this.openInventories = response.data;
            }
        } catch (e) {
            this.openInventories = this.getMockPlanningData();
        }
    }

    async loadAvailableUsers() {
        try {
            // Versuche Benutzer aus API zu laden
            const companyKey = localStorage.getItem('orca_company_key');
            if (companyKey) {
                const users = await api.getCompanyUsers(companyKey);
                this.availableUsers = users || [];
            }
        } catch (e) {
            // Mock-Benutzer
            this.availableUsers = [
                { id: 'user1', name: 'Max Müller', email: 'max.mueller@example.com' },
                { id: 'user2', name: 'Anna Schmidt', email: 'anna.schmidt@example.com' },
                { id: 'user3', name: 'Peter Weber', email: 'peter.weber@example.com' }
            ];
        }
    }

    getMockPlanningData() {
        return [
            { id: 1, number: '0010120920', name: 'Spritzgießwerkzeug A', location: 'Werk München - Halle A', dueDate: '2025-01-15', status: 'offen' },
            { id: 2, number: '0010052637', name: 'Spritzgießwerkzeug B', location: 'Werk München - Halle A', dueDate: '2025-01-20', status: 'offen' },
            { id: 3, number: '0010052648', name: 'Spritzgießwerkzeug C', location: 'Werk München - Halle B', dueDate: '2025-01-25', status: 'offen' },
            { id: 4, number: '10006841', name: 'Schäumform 1', location: 'Werk Stuttgart', dueDate: '2025-02-01', status: 'offen' },
            { id: 5, number: '10006842', name: 'Schäumform 2', location: 'Werk Stuttgart', dueDate: '2025-02-05', status: 'offen' },
            { id: 6, number: '10006843', name: 'Schäumform 3', location: 'Werk Leipzig', dueDate: '2025-02-10', status: 'offen' },
            { id: 7, number: '0010254378', name: 'Presswerkzeug X', location: 'Lager Augsburg', dueDate: '2025-02-15', status: 'offen' },
            { id: 8, number: '10447851', name: 'Stanzwerkzeug Y', location: 'Werk München - Halle A', dueDate: '2025-02-20', status: 'offen' }
        ];
    }

    showGreeting() {
        const openCount = this.openInventories.length;
        const locations = [...new Set(this.openInventories.map(t => t.location))];

        this.addAssistantMessage(`**${openCount} offene Inventuren** an **${locations.length} Standorten**.

**Hast du eine Werkzeugliste?** (Excel, CSV, Screenshot)
→ Dann lade sie hoch - ich zeige dir, welche du direkt bestätigen kannst.

**Keine Daten zur Hand?**
→ Kein Problem! Klicke auf **"Überspringen"** und wähle direkt deinen Zeitraum.`);
    }

    // ==================== KALENDER ====================

    initCalendar() {
        this.calendarDate = new Date();
        this.calendarSelectionStart = null;
        this.calendarSelectionEnd = null;
        this.renderCalendar();
    }

    renderCalendar() {
        const container = document.getElementById('calendarGrid');
        const monthLabel = document.getElementById('calMonth');
        if (!container || !monthLabel) return;

        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();

        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        monthLabel.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = (firstDay.getDay() + 6) % 7; // Montag = 0

        let html = '<div class="cal-weekdays"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>';
        html += '<div class="cal-days">';

        // Leere Tage am Anfang
        for (let i = 0; i < startWeekday; i++) {
            html += '<span class="cal-day empty"></span>';
        }

        // Tage des Monats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDateISO(date);

            let classes = ['cal-day'];
            if (date < today) classes.push('past');
            if (this.isDateInRange(date)) classes.push('selected');
            if (this.isDateRangeStart(date)) classes.push('range-start');
            if (this.isDateRangeEnd(date)) classes.push('range-end');

            // Markiere Tage mit fälligen Inventuren
            const dueOnDay = this.openInventories.filter(inv =>
                inv.dueDate && inv.dueDate.startsWith(dateStr)
            ).length;
            if (dueOnDay > 0) classes.push('has-due');

            html += `<span class="${classes.join(' ')}" data-date="${dateStr}">${day}${dueOnDay > 0 ? `<span class="due-dot">${dueOnDay}</span>` : ''}</span>`;
        }

        html += '</div>';
        container.innerHTML = html;

        // Event Listener für Tage
        container.querySelectorAll('.cal-day:not(.empty):not(.past)').forEach(day => {
            day.addEventListener('click', () => this.selectDate(day.dataset.date));
        });
    }

    selectDate(dateStr) {
        const date = new Date(dateStr);

        if (!this.calendarSelectionStart || (this.calendarSelectionStart && this.calendarSelectionEnd)) {
            // Neue Auswahl starten
            this.calendarSelectionStart = date;
            this.calendarSelectionEnd = null;
        } else {
            // Auswahl abschließen
            if (date < this.calendarSelectionStart) {
                this.calendarSelectionEnd = this.calendarSelectionStart;
                this.calendarSelectionStart = date;
            } else {
                this.calendarSelectionEnd = date;
            }
        }

        this.renderCalendar();
        this.updateSelectedRangeDisplay();
    }

    selectQuickRange(range) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (range) {
            case 'thisWeek':
                const thisMonday = new Date(today);
                thisMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
                const thisSunday = new Date(thisMonday);
                thisSunday.setDate(thisMonday.getDate() + 6);
                this.calendarSelectionStart = thisMonday;
                this.calendarSelectionEnd = thisSunday;
                break;
            case 'nextWeek':
                const nextMonday = new Date(today);
                nextMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7);
                const nextSunday = new Date(nextMonday);
                nextSunday.setDate(nextMonday.getDate() + 6);
                this.calendarSelectionStart = nextMonday;
                this.calendarSelectionEnd = nextSunday;
                break;
            case 'thisMonth':
                const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                this.calendarSelectionStart = today > firstOfMonth ? today : firstOfMonth;
                this.calendarSelectionEnd = lastOfMonth;
                break;
        }

        this.renderCalendar();
        this.updateSelectedRangeDisplay();
    }

    isDateInRange(date) {
        if (!this.calendarSelectionStart) return false;
        if (!this.calendarSelectionEnd) {
            return date.getTime() === this.calendarSelectionStart.getTime();
        }
        return date >= this.calendarSelectionStart && date <= this.calendarSelectionEnd;
    }

    isDateRangeStart(date) {
        return this.calendarSelectionStart && date.getTime() === this.calendarSelectionStart.getTime();
    }

    isDateRangeEnd(date) {
        return this.calendarSelectionEnd && date.getTime() === this.calendarSelectionEnd.getTime();
    }

    formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }

    formatDateDE(date) {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    updateSelectedRangeDisplay() {
        const rangeDiv = document.getElementById('selectedRange');
        const rangeText = document.getElementById('rangeText');
        const continueBtn = document.getElementById('continueToStep3');

        if (this.calendarSelectionStart) {
            rangeDiv.style.display = 'block';

            if (this.calendarSelectionEnd) {
                rangeText.textContent = `${this.formatDateDE(this.calendarSelectionStart)} - ${this.formatDateDE(this.calendarSelectionEnd)}`;
                this.selectedDateRange = {
                    start: this.calendarSelectionStart,
                    end: this.calendarSelectionEnd
                };
                continueBtn.disabled = false;
            } else {
                rangeText.textContent = `${this.formatDateDE(this.calendarSelectionStart)} (klicke auf Enddatum)`;
                continueBtn.disabled = true;
            }
        } else {
            rangeDiv.style.display = 'none';
            continueBtn.disabled = true;
        }
    }

    // ==================== STANDORTE ORGANISIEREN ====================

    renderLocationAssignments() {
        const container = document.getElementById('locationAssignments');

        // Gruppiere Inventuren nach Standort
        const byLocation = new Map();
        for (const inv of this.openInventories) {
            if (!byLocation.has(inv.location)) {
                byLocation.set(inv.location, []);
            }
            byLocation.get(inv.location).push(inv);
        }

        // Filtere nach Zeitraum wenn gewählt
        let filteredLocations = byLocation;
        if (this.selectedDateRange) {
            filteredLocations = new Map();
            for (const [loc, tools] of byLocation) {
                const inRange = tools.filter(t => {
                    const due = new Date(t.dueDate);
                    return due >= this.selectedDateRange.start && due <= this.selectedDateRange.end;
                });
                if (inRange.length > 0) {
                    filteredLocations.set(loc, inRange);
                }
            }
        }

        if (filteredLocations.size === 0) {
            container.innerHTML = `
                <div class="no-locations">
                    <p>Keine Inventuren im gewählten Zeitraum.</p>
                    <button class="back-btn" onclick="agentInventurplanungPage.goToStep(2)">← Zeitraum ändern</button>
                </div>
            `;
            return;
        }

        container.innerHTML = Array.from(filteredLocations.entries()).map(([location, tools]) => {
            const matched = tools.filter(t => this.matchedTools.some(m => m.number === t.number));
            const unmatched = tools.filter(t => !this.matchedTools.some(m => m.number === t.number));

            return `
                <div class="location-card">
                    <div class="location-card-header">
                        <span class="location-name">📌 ${location}</span>
                        <span class="location-count">${tools.length} Werkzeuge</span>
                    </div>

                    <div class="location-stats">
                        ${matched.length > 0 ? `<span class="stat bestaetigbar">✓ ${matched.length} bestätigbar</span>` : ''}
                        ${unmatched.length > 0 ? `<span class="stat vor-ort">📍 ${unmatched.length} vor Ort</span>` : ''}
                    </div>

                    <div class="responsible-select">
                        <label>Verantwortlicher:</label>
                        <select class="user-select" data-location="${location}">
                            <option value="">-- Wählen --</option>
                            <option value="self">Ich selbst</option>
                            ${this.availableUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                        </select>
                    </div>

                    <button class="jump-to-inventur-btn" data-location="${location}">
                        → Zur Inventur (${location})
                    </button>
                </div>
            `;
        }).join('');

        // Event Listener
        container.querySelectorAll('.user-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const location = e.target.dataset.location;
                this.locationAssignments[location] = e.target.value;
                this.updateResultsPanel();
            });
        });

        container.querySelectorAll('.jump-to-inventur-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const location = btn.dataset.location;
                this.jumpToInventur(location);
            });
        });

        this.updateResultsPanel();
    }

    jumpToInventur(location) {
        // Speichere Filter für Inventur-Seite
        const filterData = {
            location: location,
            dateRange: this.selectedDateRange,
            responsible: this.locationAssignments[location],
            matchedTools: this.matchedTools.filter(t => t.location === location),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('inventur_filter', JSON.stringify(filterData));

        // Wenn Daten geladen wurden, auch die Import-Daten speichern
        if (this.matchedTools.length > 0) {
            const importData = {
                timestamp: new Date().toISOString(),
                tools: this.matchedTools,
                source: 'planungsagent'
            };
            localStorage.setItem('agent_import_data', JSON.stringify(importData));
        }

        this.addAssistantMessage(`🚀 **Springe zur Inventur für ${location}**

${this.matchedTools.length > 0 ? `Die ${this.matchedTools.filter(t => t.location === location).length} bestätigbaren Werkzeuge wurden übernommen.` : ''}

Viel Erfolg!`);

        setTimeout(() => {
            router.navigate('/inventur');
        }, 1500);
    }

    updateResultsPanel() {
        const content = document.getElementById('resultsContent');

        // Gruppiere nach Standort
        const byLocation = new Map();
        for (const inv of this.openInventories) {
            if (!byLocation.has(inv.location)) {
                byLocation.set(inv.location, { total: 0, matched: 0, assigned: false });
            }
            byLocation.get(inv.location).total++;

            if (this.matchedTools.some(m => m.number === inv.number)) {
                byLocation.get(inv.location).matched++;
            }

            if (this.locationAssignments[inv.location]) {
                byLocation.get(inv.location).assigned = true;
            }
        }

        const totalTools = this.openInventories.length;
        const totalMatched = this.matchedTools.length;
        const assignedLocations = Object.keys(this.locationAssignments).filter(k => this.locationAssignments[k]).length;

        content.innerHTML = `
            <div class="results-summary">
                <div class="summary-stat">
                    <span class="stat-value">${totalTools}</span>
                    <span class="stat-label">Werkzeuge gesamt</span>
                </div>
                <div class="summary-stat highlight">
                    <span class="stat-value">${totalMatched}</span>
                    <span class="stat-label">Bestätigbar</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${byLocation.size}</span>
                    <span class="stat-label">Standorte</span>
                </div>
            </div>

            ${this.selectedDateRange ? `
                <div class="results-daterange">
                    📅 ${this.formatDateDE(this.selectedDateRange.start)} - ${this.formatDateDE(this.selectedDateRange.end)}
                </div>
            ` : ''}

            <div class="results-locations">
                ${Array.from(byLocation.entries()).map(([loc, data]) => `
                    <div class="result-location ${data.assigned ? 'assigned' : ''}">
                        <div class="result-loc-name">${loc}</div>
                        <div class="result-loc-stats">
                            <span>${data.total} Werkzeuge</span>
                            ${data.matched > 0 ? `<span class="matched">✓ ${data.matched}</span>` : ''}
                            ${data.assigned ? '<span class="check">👤</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${assignedLocations > 0 ? `
                <button class="save-assignments-btn" id="saveAssignmentsBtn">
                    💾 Zuweisungen speichern
                </button>
            ` : ''}
        `;

        document.getElementById('saveAssignmentsBtn')?.addEventListener('click', () => this.saveAssignments());
    }

    saveAssignments() {
        // Speichere Zuweisungen
        localStorage.setItem('inventur_assignments', JSON.stringify({
            assignments: this.locationAssignments,
            dateRange: this.selectedDateRange,
            timestamp: new Date().toISOString()
        }));

        this.addAssistantMessage(`✅ **Zuweisungen gespeichert!**

${Object.entries(this.locationAssignments).filter(([k, v]) => v).map(([loc, userId]) => {
    const user = userId === 'self' ? 'Du' : this.availableUsers.find(u => u.id === userId)?.name || userId;
    return `• ${loc} → ${user}`;
}).join('\n')}

Du kannst jetzt für jeden Standort zur Inventur springen.`);
    }

    // ==================== NAVIGATION ====================

    goToStep(stepNum) {
        this.currentStep = stepNum;

        // Update indicators
        document.querySelectorAll('.step').forEach((step, idx) => {
            const num = idx + 1;
            step.classList.remove('active', 'completed');
            if (num < stepNum) step.classList.add('completed');
            if (num === stepNum) step.classList.add('active');
        });

        // Show/hide content
        document.getElementById('step1Content').style.display = stepNum === 1 ? 'block' : 'none';
        document.getElementById('step2Content').style.display = stepNum === 2 ? 'block' : 'none';
        document.getElementById('step3Content').style.display = stepNum === 3 ? 'block' : 'none';

        if (stepNum === 3) {
            this.renderLocationAssignments();
        }
    }

    // ==================== DATEN IMPORT ====================

    attachEventListeners() {
        // Upload options (small buttons)
        document.querySelectorAll('.upload-option-sm').forEach(btn => {
            btn.addEventListener('click', () => this.selectUploadOption(btn));
        });

        // Skip button
        document.querySelector('.skip-btn')?.addEventListener('click', (e) => {
            this.selectUploadOption(e.target);
        });

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea?.addEventListener('click', () => fileInput?.click());
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Chat
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        sendBtn?.addEventListener('click', () => this.sendMessage());

        // Kalender
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Quick select
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectQuickRange(btn.dataset.range));
        });

        // Continue button
        document.getElementById('continueToStep3')?.addEventListener('click', () => {
            this.goToStep(3);
            this.addAssistantMessage(`Zeitraum gewählt: **${this.formatDateDE(this.selectedDateRange.start)} - ${this.formatDateDE(this.selectedDateRange.end)}**

Jetzt kannst du für jeden Standort einen Verantwortlichen festlegen.

Klicke dann auf "Zur Inventur" um direkt loszulegen.`);
        });
    }

    selectUploadOption(btn) {
        document.querySelectorAll('.upload-option-sm').forEach(b => b.classList.remove('active'));
        if (btn.classList.contains('upload-option-sm')) {
            btn.classList.add('active');
        }

        const type = btn.dataset.type;

        if (type === 'skip') {
            this.addAssistantMessage(`Okay! Dann wähle jetzt deinen **Zeitraum** im Kalender.`);
            this.goToStep(2);
            return;
        }

        if (type === 'stammdaten') {
            this.useStammdaten();
            return;
        }

        const fileInput = document.getElementById('fileInput');
        if (type === 'screenshot') {
            fileInput.accept = '.png,.jpg,.jpeg';
        } else {
            fileInput.accept = '.xlsx,.xls,.csv';
        }
    }

    useStammdaten() {
        const stammdaten = this.getStammdaten();
        if (!stammdaten?.tools?.length) {
            this.addAssistantMessage(`Keine Stammdaten gefunden. Lade eine Excel/CSV hoch oder überspringe diesen Schritt.`);
            return;
        }

        this.addUserMessage(`Stammdaten verwenden (${stammdaten.tools.length} Werkzeuge)`);
        this.knownTools = stammdaten.tools;
        this.processKnownTools();
    }

    getStammdaten() {
        try {
            return JSON.parse(localStorage.getItem('orca_stammdaten'));
        } catch { return null; }
    }

    async handleFiles(files) {
        const fileList = Array.from(files);
        for (const file of fileList) {
            this.uploadedFiles.push({ name: file.name, type: file.type, file });
        }
        this.renderUploadedFiles();
        this.addUserMessage(`Datei: ${fileList.map(f => f.name).join(', ')}`);
        await this.processUploadedFiles();
    }

    renderUploadedFiles() {
        const container = document.getElementById('uploadedFiles');
        if (!container || !this.uploadedFiles.length) {
            if (container) container.innerHTML = '';
            return;
        }

        container.innerHTML = `<div class="files-list">${this.uploadedFiles.map((f, i) => `
            <div class="file-item">
                <span class="file-icon">${this.getFileIcon(f.name)}</span>
                <span class="file-name">${f.name}</span>
                <button class="remove-file" data-index="${i}">×</button>
            </div>
        `).join('')}</div>`;

        container.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', () => {
                this.uploadedFiles.splice(parseInt(btn.dataset.index), 1);
                this.renderUploadedFiles();
            });
        });
    }

    getFileIcon(name) {
        const ext = name.split('.').pop().toLowerCase();
        return { xlsx: '📊', xls: '📊', csv: '📋', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' }[ext] || '📄';
    }

    async processUploadedFiles() {
        this.showTypingIndicator();

        try {
            const extractedTools = [];
            for (const fileObj of this.uploadedFiles) {
                const content = await this.readFileContent(fileObj.file);
                if (content.type === 'text') {
                    extractedTools.push(...this.extractToolsFromText(content.data));
                }
            }

            this.hideTypingIndicator();

            if (!extractedTools.length) {
                this.addAssistantMessage(`Keine Werkzeugdaten erkannt. Überprüfe das Format oder überspringe diesen Schritt.`);
                return;
            }

            this.knownTools = extractedTools;
            this.processKnownTools();
        } catch (error) {
            this.hideTypingIndicator();
            this.addAssistantMessage(`Fehler: ${error.message}`);
        }

        this.uploadedFiles = [];
        this.renderUploadedFiles();
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const name = file.name.toLowerCase();

            if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        let text = '';
                        for (const sheet of workbook.SheetNames) {
                            text += XLSX.utils.sheet_to_csv(workbook.Sheets[sheet], { FS: '\t' }) + '\n';
                        }
                        resolve({ type: 'text', data: text });
                    } catch (err) { reject(err); }
                };
                reader.readAsArrayBuffer(file);
            } else {
                reader.onload = () => resolve({ type: 'text', data: reader.result });
                reader.readAsText(file);
            }
        });
    }

    extractToolsFromText(text) {
        const tools = [];
        const seen = new Set();
        const patterns = [/\b(0{0,3}10\d{6})\b/g, /\b(1\d{7,8})\b/g];
        const locMap = {
            'münchen': 'Werk München', 'halle a': 'Werk München - Halle A',
            'halle b': 'Werk München - Halle B', 'stuttgart': 'Werk Stuttgart',
            'leipzig': 'Werk Leipzig', 'augsburg': 'Lager Augsburg'
        };

        for (const line of text.split(/[\n\r]+/)) {
            const lower = line.toLowerCase();
            for (const pattern of patterns) {
                for (const match of line.matchAll(pattern)) {
                    const num = match[1];
                    if (seen.has(num) || num.length < 7 || /^(2024|2025)/.test(num)) continue;
                    seen.add(num);

                    let loc = null;
                    for (const [k, v] of Object.entries(locMap)) {
                        if (lower.includes(k)) { loc = v; break; }
                    }
                    tools.push({ number: num, location: loc, source: 'import' });
                }
            }
        }
        return tools;
    }

    processKnownTools() {
        this.matchedTools = [];
        this.unmatchedTools = [];

        const known = new Map(this.knownTools.map(t => [this.normalize(t.number), t]));

        for (const inv of this.openInventories) {
            const k = known.get(this.normalize(inv.number));
            if (k?.location) {
                this.matchedTools.push({ ...inv, knownLocation: k.location });
            } else {
                this.unmatchedTools.push(inv);
            }
        }

        const matchCount = this.matchedTools.length;
        const unmatchCount = this.unmatchedTools.length;

        this.addAssistantMessage(`Daten analysiert! 📊

**Ergebnis:**
✅ **${matchCount} Werkzeuge** sind direkt bestätigbar (Daten vorhanden)
📍 **${unmatchCount} Werkzeuge** erfordern Vor-Ort-Prüfung

Wähle jetzt links den **Zeitraum**, in dem du dich darum kümmern willst.`);

        this.goToStep(2);
        this.updateResultsPanel();
    }

    normalize(num) {
        return num?.toString().replace(/^0+/, '') || '';
    }

    // ==================== CHAT ====================

    addUserMessage(content) {
        this.messages.push({ role: 'user', content, timestamp: new Date() });
        this.renderMessages();
    }

    addAssistantMessage(content) {
        this.messages.push({ role: 'assistant', content, timestamp: new Date() });
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => {
            const isUser = msg.role === 'user';
            const time = msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const content = msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

            return `<div class="chat-message ${isUser ? 'user' : 'assistant'}">
                <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>`;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const msg = input?.value.trim();
        if (!msg) return;

        input.value = '';
        this.addUserMessage(msg);
        this.showTypingIndicator();
        await new Promise(r => setTimeout(r, 500));
        this.hideTypingIndicator();

        const lower = msg.toLowerCase();

        // Keine Daten / Überspringen
        if (lower.includes('keine') || lower.includes('kein') || lower.includes('nix') ||
            lower.includes('nichts') || lower.includes('nur system') || lower.includes('überspringen')) {
            this.addAssistantMessage(`Alles klar, dann überspringen wir den Daten-Import.

Ich bringe dich direkt zur **Zeitraum-Auswahl**.`);
            setTimeout(() => this.goToStep(2), 800);
            return;
        }

        // Hilfe / Was soll ich tun
        if (lower.includes('hilf') || lower.includes('help') || lower.includes('was soll') || lower.includes('wie geht')) {
            this.addAssistantMessage(`**Kurz erklärt:**

1. **Hast du Daten?** (Excel-Liste, Screenshot)
   → Lade sie hoch, dann siehst du was du direkt bestätigen kannst

2. **Keine Daten?**
   → Klick auf "Überspringen" oder schreib "keine Daten"

3. **Dann wählst du einen Zeitraum** im Kalender

4. **Und springst zur Inventur** für jeden Standort`);
            return;
        }

        // Zeitraum / Kalender
        if (lower.includes('zeitraum') || lower.includes('kalender') || lower.includes('wann')) {
            if (this.currentStep === 1) {
                this.addAssistantMessage(`Um zum Kalender zu kommen, erst "Überspringen" wählen oder Daten hochladen.`);
            } else {
                this.addAssistantMessage(`Wähle im Kalender links Start- und Enddatum aus. Oder nutze die Schnellauswahl darunter.`);
            }
            return;
        }

        // Fallback
        this.addAssistantMessage(`Ich verstehe.

**Was möchtest du tun?**
• "Keine Daten" → Direkt zum Zeitraum
• "Hilfe" → Erklärung wie's geht`);
    }

    showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        const ind = document.createElement('div');
        ind.className = 'chat-message assistant';
        ind.id = 'typingIndicator';
        ind.innerHTML = `<div class="message-avatar">🤖</div><div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
        container.appendChild(ind);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator')?.remove();
    }

    // ==================== STYLES ====================

    addStyles() {
        if (document.getElementById('agent-planung-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-planung-styles';
        styles.textContent = `
            .agent-planung-page { height: calc(100vh - 140px); padding: 1rem; }
            .agent-layout { display: grid; grid-template-columns: 320px 1fr 280px; gap: 1rem; height: 100%; }

            .agent-sidebar { background: white; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; }
            .sidebar-section h3 { font-size: 0.95rem; color: #1f2937; margin-bottom: 0.5rem; }
            .step-hint { font-size: 0.8rem; color: #6b7280; margin-bottom: 1rem; }

            /* Steps */
            .step-indicator { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; }
            .step { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
            .step-number { width: 28px; height: 28px; border-radius: 50%; background: #e5e7eb; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; }
            .step.active .step-number { background: #3b82f6; color: white; }
            .step.completed .step-number { background: #22c55e; color: white; }
            .step-label { font-size: 0.7rem; color: #6b7280; text-align: center; }
            .step.active .step-label { color: #3b82f6; font-weight: 500; }
            .step-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 0.25rem; margin-bottom: 1rem; }

            /* Upload - Small buttons */
            .upload-options-small { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
            .upload-option-sm { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.75rem; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; }
            .upload-option-sm:hover, .upload-option-sm.active { border-color: #3b82f6; background: #eff6ff; }
            .upload-option-sm .option-icon { font-size: 1rem; }

            .upload-area { border: 2px dashed #d1d5db; border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer; }
            .upload-area:hover, .upload-area.drag-over { border-color: #3b82f6; background: #eff6ff; }
            .upload-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
            .upload-area p { font-size: 0.8rem; color: #6b7280; margin: 0; }
            .upload-link { color: #3b82f6; text-decoration: underline; }

            /* Skip Section */
            .skip-section { margin-top: 1rem; }
            .skip-divider { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
            .skip-divider::before, .skip-divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
            .skip-divider span { font-size: 0.75rem; color: #9ca3af; }
            .skip-btn { width: 100%; padding: 0.75rem; background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: #374151; transition: all 0.2s; }
            .skip-btn:hover { background: #e5e7eb; border-color: #d1d5db; }

            .files-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
            .file-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f3f4f6; border-radius: 6px; font-size: 0.8rem; }
            .file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .remove-file { background: none; border: none; color: #9ca3af; cursor: pointer; }

            /* Kalender */
            .calendar-container { background: #f9fafb; border-radius: 8px; padding: 0.75rem; }
            .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
            .cal-month { font-weight: 600; font-size: 0.9rem; }
            .cal-nav { background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.9rem; }
            .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.7rem; color: #6b7280; margin-bottom: 0.25rem; }
            .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
            .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; border-radius: 4px; cursor: pointer; position: relative; }
            .cal-day:hover { background: #e5e7eb; }
            .cal-day.empty { cursor: default; }
            .cal-day.past { color: #d1d5db; cursor: not-allowed; }
            .cal-day.selected { background: #dbeafe; color: #1e40af; }
            .cal-day.range-start, .cal-day.range-end { background: #3b82f6; color: white; }
            .cal-day.has-due { font-weight: 600; }
            .due-dot { position: absolute; bottom: 2px; right: 2px; font-size: 0.55rem; background: #f97316; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }

            .selected-range { margin-top: 0.75rem; padding: 0.5rem; background: #dbeafe; border-radius: 6px; font-size: 0.8rem; }
            .quick-select { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
            .quick-btn { flex: 1; padding: 0.4rem; font-size: 0.75rem; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
            .quick-btn:hover { border-color: #3b82f6; background: #eff6ff; }

            .continue-btn { width: 100%; padding: 0.75rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.9rem; cursor: pointer; }
            .continue-btn:disabled { background: #9ca3af; cursor: not-allowed; }
            .continue-btn:not(:disabled):hover { background: #2563eb; }

            /* Standorte */
            .location-assignments { display: flex; flex-direction: column; gap: 0.75rem; }
            .location-card { background: #f9fafb; border-radius: 8px; padding: 0.75rem; border: 1px solid #e5e7eb; }
            .location-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
            .location-name { font-weight: 500; font-size: 0.85rem; }
            .location-count { font-size: 0.75rem; color: #6b7280; }
            .location-stats { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
            .location-stats .stat { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
            .stat.bestaetigbar { background: #dcfce7; color: #166534; }
            .stat.vor-ort { background: #fef3c7; color: #92400e; }

            .responsible-select { margin-bottom: 0.5rem; }
            .responsible-select label { display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
            .user-select { width: 100%; padding: 0.4rem; font-size: 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; }

            .jump-to-inventur-btn { width: 100%; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
            .jump-to-inventur-btn:hover { background: #2563eb; }

            .no-locations { text-align: center; padding: 1rem; color: #6b7280; }
            .back-btn { margin-top: 0.5rem; padding: 0.5rem 1rem; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }

            /* Chat */
            .agent-main { display: flex; flex-direction: column; background: white; border-radius: 12px; overflow: hidden; }
            .chat-container { flex: 1; overflow-y: auto; }
            .chat-messages { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
            .chat-message { display: flex; gap: 0.75rem; max-width: 85%; }
            .chat-message.user { align-self: flex-end; flex-direction: row-reverse; }
            .message-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
            .chat-message.user .message-avatar { background: #dbeafe; }
            .message-content { background: #f9fafb; padding: 0.6rem 0.9rem; border-radius: 12px; border-top-left-radius: 4px; }
            .chat-message.user .message-content { background: #3b82f6; color: white; border-top-left-radius: 12px; border-top-right-radius: 4px; }
            .message-text { font-size: 0.85rem; line-height: 1.5; }
            .message-time { font-size: 0.65rem; color: #9ca3af; margin-top: 0.4rem; }
            .chat-message.user .message-time { color: rgba(255,255,255,0.7); }

            .typing-dots { display: flex; gap: 4px; }
            .typing-dots span { width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite; }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }

            .chat-input-area { padding: 0.75rem; border-top: 1px solid #e5e7eb; }
            .input-wrapper { display: flex; gap: 0.5rem; }
            .input-wrapper textarea { flex: 1; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.85rem; resize: none; font-family: inherit; }
            .send-btn { padding: 0.6rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; }

            /* Results */
            .agent-results { background: white; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
            .results-header { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
            .results-header h3 { margin: 0; font-size: 0.95rem; }
            .results-content { flex: 1; overflow-y: auto; padding: 0.75rem; }

            .empty-results { text-align: center; padding: 2rem 1rem; color: #6b7280; }
            .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; }
            .empty-results p { font-size: 0.85rem; }

            .results-summary { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
            .summary-stat { flex: 1; text-align: center; padding: 0.5rem; background: #f9fafb; border-radius: 6px; }
            .summary-stat.highlight { background: #dcfce7; }
            .stat-value { display: block; font-size: 1.25rem; font-weight: 700; color: #1f2937; }
            .summary-stat.highlight .stat-value { color: #166534; }
            .stat-label { font-size: 0.65rem; color: #6b7280; }

            .results-daterange { padding: 0.5rem; background: #dbeafe; border-radius: 6px; font-size: 0.8rem; text-align: center; margin-bottom: 0.75rem; }

            .results-locations { display: flex; flex-direction: column; gap: 0.5rem; }
            .result-location { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f9fafb; border-radius: 6px; font-size: 0.8rem; }
            .result-location.assigned { background: #f0fdf4; border-left: 3px solid #22c55e; }
            .result-loc-name { font-weight: 500; flex: 1; }
            .result-loc-stats { display: flex; gap: 0.5rem; font-size: 0.7rem; color: #6b7280; }
            .result-loc-stats .matched { color: #166534; }
            .result-loc-stats .check { font-size: 0.8rem; }

            .save-assignments-btn { width: 100%; padding: 0.6rem; margin-top: 0.75rem; background: #22c55e; color: white; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
            .save-assignments-btn:hover { background: #16a34a; }
        `;
        document.head.appendChild(styles);
    }
}

// Init
const agentInventurplanungPage = new AgentInventurplanungPage();
