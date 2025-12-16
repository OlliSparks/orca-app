// ORCA 2.0 - Inventurplanungs-Agent
// Flow: 1. Was weißt du schon? → 2. Sofort erledigen → 3. Vor-Ort planen

class AgentInventurplanungPage {
    constructor() {
        this.messages = [];
        this.uploadedFiles = [];
        this.isProcessing = false;
        this.claudeApiKey = null;

        // Planungsdaten
        this.knownTools = [];           // Werkzeuge aus Import/Stammdaten
        this.openInventories = [];      // Offene Inventuren aus API
        this.matchedForDesk = [];       // Am Rechner erledigbar
        this.needsOnSite = [];          // Vor-Ort-Besuch nötig

        // Planungs-State
        this.currentStep = 1;           // 1=Import, 2=Desk, 3=OnSite
        this.availableTime = null;      // Verfügbare Stunden
        this.selectedLocations = [];    // Gewählte Standorte
        this.plannedTour = [];          // Geplante Tour
    }

    async render() {
        const app = document.getElementById('app');

        // Reset state
        this.messages = [];
        this.uploadedFiles = [];
        this.isProcessing = false;
        this.currentStep = 1;
        this.knownTools = [];
        this.matchedForDesk = [];
        this.needsOnSite = [];

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Inventurplanungs-Agent';
        document.getElementById('headerSubtitle').textContent = 'Inventuren effizient planen';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container agent-planung-page">
                <div class="agent-layout">
                    <!-- Sidebar: Steps & Upload -->
                    <div class="agent-sidebar">
                        <!-- Progress Steps -->
                        <div class="sidebar-section steps-section">
                            <div class="step-indicator">
                                <div class="step active" data-step="1">
                                    <div class="step-number">1</div>
                                    <div class="step-label">Daten laden</div>
                                </div>
                                <div class="step-line"></div>
                                <div class="step" data-step="2">
                                    <div class="step-number">2</div>
                                    <div class="step-label">Sofort erledigen</div>
                                </div>
                                <div class="step-line"></div>
                                <div class="step" data-step="3">
                                    <div class="step-number">3</div>
                                    <div class="step-label">Vor-Ort planen</div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 1: Data Source -->
                        <div class="sidebar-section step-content" id="step1Content">
                            <h3>Was weißt du bereits?</h3>
                            <p class="step-hint">Lade deine Werkzeugdaten - je mehr du weißt, desto weniger musst du vor Ort.</p>

                            <div class="upload-options">
                                <button class="upload-option active" data-type="file">
                                    <span class="option-icon">📊</span>
                                    <span class="option-label">Excel / CSV</span>
                                </button>
                                <button class="upload-option" data-type="stammdaten">
                                    <span class="option-icon">💾</span>
                                    <span class="option-label">Stammdaten</span>
                                </button>
                                <button class="upload-option" data-type="screenshot">
                                    <span class="option-icon">📷</span>
                                    <span class="option-label">Screenshot</span>
                                </button>
                                <button class="upload-option" data-type="manual">
                                    <span class="option-icon">✏️</span>
                                    <span class="option-label">Manuell</span>
                                </button>
                            </div>

                            <div class="upload-area" id="uploadArea">
                                <div class="upload-icon">📁</div>
                                <p id="uploadText">Datei hierher ziehen<br>oder <span class="upload-link">durchsuchen</span></p>
                                <input type="file" id="fileInput" accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg" multiple hidden>
                            </div>
                            <div class="uploaded-files" id="uploadedFiles"></div>
                        </div>

                        <!-- Step 2: Desk Work Summary (hidden initially) -->
                        <div class="sidebar-section step-content" id="step2Content" style="display: none;">
                            <h3>Am Rechner erledigen</h3>
                            <div class="desk-summary" id="deskSummary">
                                <!-- Dynamisch befüllt -->
                            </div>
                        </div>

                        <!-- Step 3: On-Site Planning (hidden initially) -->
                        <div class="sidebar-section step-content" id="step3Content" style="display: none;">
                            <h3>Vor-Ort Planung</h3>

                            <div class="time-input-section">
                                <label>Wann hast du Zeit?</label>
                                <div class="time-slots">
                                    <button class="time-slot" data-hours="1">1h</button>
                                    <button class="time-slot" data-hours="2">2h</button>
                                    <button class="time-slot" data-hours="4">4h</button>
                                    <button class="time-slot" data-hours="8">1 Tag</button>
                                </div>
                                <input type="number" id="customHours" placeholder="Andere (Stunden)" class="custom-hours-input">
                            </div>

                            <div class="location-input-section">
                                <label>Wo bist du sowieso?</label>
                                <div class="location-chips" id="locationChips">
                                    <!-- Dynamisch befüllt mit Standorten -->
                                </div>
                            </div>

                            <button class="plan-tour-btn" id="planTourBtn">
                                🗺️ Tour planen
                            </button>
                        </div>
                    </div>

                    <!-- Main Chat Area -->
                    <div class="agent-main">
                        <div class="chat-container" id="chatContainer">
                            <div class="chat-messages" id="chatMessages">
                            </div>
                        </div>

                        <div class="chat-input-area">
                            <div class="input-wrapper">
                                <textarea
                                    id="chatInput"
                                    placeholder="Frage stellen oder Antwort eingeben..."
                                    rows="1"
                                ></textarea>
                                <button class="send-btn" id="sendBtn">
                                    <span>Senden</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Results Panel -->
                    <div class="agent-results" id="agentResults">
                        <div class="results-header">
                            <h3>Dein Inventurplan</h3>
                        </div>
                        <div class="results-content" id="resultsContent">
                            <div class="empty-results">
                                <div class="empty-icon">📋</div>
                                <p>Lade Werkzeugdaten, um deinen<br>Inventurplan zu erstellen</p>
                            </div>
                        </div>
                        <div class="results-actions" id="resultsActions" style="display: none;">
                            <button class="agent-btn secondary" id="exportPlanBtn">📥 Exportieren</button>
                            <button class="agent-btn primary" id="applyPlanBtn">✓ Plan übernehmen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
        await this.loadOpenInventories();
        this.loadApiKey();
        this.showGreeting();
    }

    loadApiKey() {
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        this.claudeApiKey = config.claudeApiKey || localStorage.getItem('claude_api_key');
    }

    async loadOpenInventories() {
        try {
            // Lade Planungsdaten (Werkzeuge mit Fälligkeiten)
            const response = await api.getPlanningData();
            if (response.success) {
                this.openInventories = response.data;
            }
        } catch (e) {
            // Fallback zu Mock-Daten
            this.openInventories = this.getMockPlanningData();
        }
    }

    getMockPlanningData() {
        // Mock: Werkzeuge mit Fälligkeiten in den nächsten 6 Monaten
        return [
            { id: 1, number: '0010120920', name: 'Spritzgießwerkzeug A', location: 'Werk München - Halle A', dueDate: '2025-01-15', status: 'offen' },
            { id: 2, number: '0010052637', name: 'Spritzgießwerkzeug B', location: 'Werk München - Halle A', dueDate: '2025-01-20', status: 'offen' },
            { id: 3, number: '0010052648', name: 'Spritzgießwerkzeug C', location: 'Werk München - Halle B', dueDate: '2025-01-25', status: 'offen' },
            { id: 4, number: '10006841', name: 'Schäumform 1', location: 'Werk Stuttgart - Presswerk', dueDate: '2025-02-01', status: 'offen' },
            { id: 5, number: '10006842', name: 'Schäumform 2', location: 'Werk Stuttgart - Presswerk', dueDate: '2025-02-05', status: 'offen' },
            { id: 6, number: '10006843', name: 'Schäumform 3', location: 'Werk Leipzig - Montage', dueDate: '2025-02-10', status: 'offen' },
            { id: 7, number: '0010254378', name: 'Presswerkzeug X', location: 'Lager Augsburg', dueDate: '2025-02-15', status: 'offen' },
            { id: 8, number: '10447851', name: 'Stanzwerkzeug Y', location: 'Werk München - Halle A', dueDate: '2025-02-20', status: 'offen' },
            { id: 9, number: '10447852', name: 'Stanzwerkzeug Z', location: 'Werk München - Halle B', dueDate: '2025-03-01', status: 'offen' },
            { id: 10, number: '10447853', name: 'Vulkanisationswerkzeug', location: 'Werk Leipzig - Montage', dueDate: '2025-03-15', status: 'offen' }
        ];
    }

    showGreeting() {
        // Prüfe auf vorhandene Stammdaten
        const stammdaten = this.getStammdaten();
        const openCount = this.openInventories.length;

        let greeting;
        if (stammdaten && stammdaten.tools && stammdaten.tools.length > 0) {
            greeting = `Willkommen! 👋

Du hast **${openCount} Werkzeuge** mit anstehenden Inventuren.

Ich habe auch deine **Stammdaten** gefunden (${stammdaten.tools.length} Werkzeuge vom ${new Date(stammdaten.uploadDate).toLocaleDateString('de-DE')}).

**Meine Frage an dich:**
Was weißt du heute schon über deine Werkzeuge? Je mehr Infos du hast, desto mehr kannst du direkt am Rechner erledigen - ohne vor Ort zu gehen.

**Optionen:**
• Stammdaten verwenden (links "Stammdaten" wählen)
• Neue Excel/CSV hochladen
• Screenshot aus deinem System`;
        } else {
            greeting = `Willkommen beim Inventurplanungs-Agent! 👋

Du hast **${openCount} Werkzeuge** mit anstehenden Inventuren in den nächsten 6 Monaten.

**Meine erste Frage:**
Was weißt du heute schon über deine Werkzeuge?

Hast du eine **Excel-Liste**, einen **Screenshot** aus deinem System, oder andere Infos? Je mehr du weißt, desto mehr kannst du **direkt am Rechner** erledigen - ohne vor Ort zu gehen.

Lade links deine Daten hoch, oder sag mir einfach was du hast.`;
        }

        this.addAssistantMessage(greeting);
    }

    getStammdaten() {
        try {
            const saved = localStorage.getItem('orca_stammdaten');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    attachEventListeners() {
        // Upload options
        document.querySelectorAll('.upload-option').forEach(btn => {
            btn.addEventListener('click', () => this.selectUploadOption(btn));
        });

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Time slots
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.addEventListener('click', () => this.selectTimeSlot(btn));
        });

        // Plan tour button
        document.getElementById('planTourBtn')?.addEventListener('click', () => this.generateTourPlan());

        // Result actions
        document.getElementById('exportPlanBtn')?.addEventListener('click', () => this.exportPlan());
        document.getElementById('applyPlanBtn')?.addEventListener('click', () => this.applyPlan());
    }

    selectUploadOption(btn) {
        document.querySelectorAll('.upload-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (type === 'stammdaten') {
            this.useStammdaten();
            return;
        }

        if (type === 'manual') {
            this.addAssistantMessage(`Kein Problem! Erzähl mir einfach, was du über deine Werkzeuge weißt.

Zum Beispiel:
• "Alle Werkzeuge in Halle A sind am aktuellen Standort"
• "Die Werkzeuge 10006841 und 10006842 wurden nach Leipzig verlagert"
• "Ich war letzte Woche in Stuttgart, dort ist alles in Ordnung"`);
            return;
        }

        // Update file input accept
        if (type === 'screenshot') {
            fileInput.accept = '.png,.jpg,.jpeg';
        } else {
            fileInput.accept = '.xlsx,.xls,.csv';
        }
    }

    useStammdaten() {
        const stammdaten = this.getStammdaten();
        if (!stammdaten || !stammdaten.tools || stammdaten.tools.length === 0) {
            this.addAssistantMessage(`Leider habe ich keine Stammdaten gefunden.

Lade eine Excel/CSV-Datei hoch oder mach einen Screenshot von deinem System.`);
            return;
        }

        this.addUserMessage(`Stammdaten verwenden (${stammdaten.tools.length} Werkzeuge)`);
        this.knownTools = stammdaten.tools;
        this.processKnownTools();
    }

    async handleFiles(files) {
        const fileList = Array.from(files);

        for (const file of fileList) {
            this.uploadedFiles.push({
                name: file.name,
                type: file.type,
                file: file
            });
        }

        this.renderUploadedFiles();

        const fileNames = fileList.map(f => f.name).join(', ');
        this.addUserMessage(`Datei hochgeladen: ${fileNames}`);

        await this.processUploadedFiles();
    }

    renderUploadedFiles() {
        const container = document.getElementById('uploadedFiles');
        if (this.uploadedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="files-list">
                ${this.uploadedFiles.map((f, i) => `
                    <div class="file-item">
                        <span class="file-icon">${this.getFileIcon(f.name)}</span>
                        <span class="file-name">${f.name}</span>
                        <button class="remove-file" data-index="${i}">×</button>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', () => {
                this.uploadedFiles.splice(parseInt(btn.dataset.index), 1);
                this.renderUploadedFiles();
            });
        });
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return { xlsx: '📊', xls: '📊', csv: '📋', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' }[ext] || '📄';
    }

    async processUploadedFiles() {
        this.isProcessing = true;
        this.showTypingIndicator();

        try {
            const extractedTools = [];

            for (const fileObj of this.uploadedFiles) {
                const content = await this.readFileContent(fileObj.file);

                if (content.type === 'text') {
                    const tools = this.extractToolsFromText(content.data);
                    extractedTools.push(...tools);
                } else if (content.type === 'image' && this.claudeApiKey) {
                    // Claude Vision für Screenshots
                    const tools = await this.analyzeImageWithClaude(content.data, fileObj.type);
                    extractedTools.push(...tools);
                } else if (content.type === 'image') {
                    // Ohne API Key: Hinweis geben
                    this.hideTypingIndicator();
                    this.addAssistantMessage(`Für die Screenshot-Analyse benötige ich die KI-Funktion.

Alternativ kannst du:
• Eine Excel/CSV-Datei hochladen
• Mir die Werkzeugnummern manuell nennen`);
                    return;
                }
            }

            this.hideTypingIndicator();

            if (extractedTools.length === 0) {
                this.addAssistantMessage(`Ich konnte leider keine Werkzeugdaten erkennen.

Bitte prüfe:
• Enthält die Datei Werkzeugnummern?
• Ist das Format korrekt (Excel, CSV)?

Oder erzähl mir einfach, was du weißt.`);
                return;
            }

            this.knownTools = extractedTools;
            this.processKnownTools();

        } catch (error) {
            this.hideTypingIndicator();
            this.addAssistantMessage(`Fehler beim Verarbeiten: ${error.message}`);
        }

        this.uploadedFiles = [];
        this.renderUploadedFiles();
        this.isProcessing = false;
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const fileName = file.name.toLowerCase();

            if (file.type.startsWith('image/')) {
                reader.onload = () => resolve({
                    type: 'image',
                    data: reader.result.split(',')[1]
                });
                reader.readAsDataURL(file);
                return;
            }

            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        let textContent = '';
                        for (const sheetName of workbook.SheetNames) {
                            const sheet = workbook.Sheets[sheetName];
                            textContent += XLSX.utils.sheet_to_csv(sheet, { FS: '\t' }) + '\n';
                        }
                        resolve({ type: 'text', data: textContent });
                    } catch (err) {
                        reject(new Error('Excel konnte nicht gelesen werden'));
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            reader.onload = () => resolve({ type: 'text', data: reader.result });
            reader.readAsText(file);
        });
    }

    extractToolsFromText(text) {
        const tools = [];
        const lines = text.split(/[\n\r]+/);
        const seenNumbers = new Set();

        // Werkzeugnummer-Patterns
        const patterns = [
            /\b(0{0,3}10\d{6})\b/g,
            /\b(90100\d{5})\b/g,
            /\b(1\d{7,8})\b/g
        ];

        // Standort-Keywords
        const locationMap = {
            'münchen': 'Werk München',
            'halle a': 'Werk München - Halle A',
            'halle b': 'Werk München - Halle B',
            'stuttgart': 'Werk Stuttgart - Presswerk',
            'leipzig': 'Werk Leipzig - Montage',
            'augsburg': 'Lager Augsburg'
        };

        for (const line of lines) {
            const lineLower = line.toLowerCase();

            for (const pattern of patterns) {
                const matches = line.matchAll(pattern);
                for (const match of matches) {
                    let number = match[1];
                    if (seenNumbers.has(number) || number.length < 7) continue;
                    if (/^(2024|2025|0000)/.test(number)) continue;

                    seenNumbers.add(number);

                    // Standort erkennen
                    let location = null;
                    for (const [key, value] of Object.entries(locationMap)) {
                        if (lineLower.includes(key)) {
                            location = value;
                            break;
                        }
                    }

                    tools.push({
                        number: number,
                        location: location,
                        source: 'import',
                        confirmed: location !== null
                    });
                }
            }
        }

        return tools;
    }

    async analyzeImageWithClaude(imageData, mediaType) {
        // Claude Vision API für Screenshot-Analyse
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.claudeApiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2048,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analysiere dieses Bild und extrahiere alle Werkzeuginformationen.
Für jedes Werkzeug extrahiere: Werkzeugnummer, Standort (falls sichtbar).
Antworte NUR mit JSON: {"tools": [{"number": "...", "location": "..." oder null}]}`
                            },
                            {
                                type: 'image',
                                source: { type: 'base64', media_type: mediaType, data: imageData }
                            }
                        ]
                    }]
                })
            });

            const data = await response.json();
            const text = data.content[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.tools || [];
            }
        } catch (e) {
            console.error('Claude API error:', e);
        }
        return [];
    }

    processKnownTools() {
        // Matche bekannte Werkzeuge mit offenen Inventuren
        this.matchedForDesk = [];
        this.needsOnSite = [];

        const knownByNumber = new Map();
        for (const tool of this.knownTools) {
            knownByNumber.set(this.normalizeToolNumber(tool.number), tool);
        }

        for (const inv of this.openInventories) {
            const normalizedNumber = this.normalizeToolNumber(inv.number);
            const known = knownByNumber.get(normalizedNumber);

            if (known && known.location) {
                // Werkzeug bekannt UND Standort bekannt → am Rechner erledigbar
                this.matchedForDesk.push({
                    ...inv,
                    knownLocation: known.location,
                    canConfirm: true
                });
            } else {
                // Werkzeug unbekannt oder ohne Standort → Vor-Ort nötig
                this.needsOnSite.push({
                    ...inv,
                    reason: known ? 'Standort unbekannt' : 'Keine Daten'
                });
            }
        }

        // Update UI
        this.goToStep(2);
        this.showDeskWorkSummary();
    }

    normalizeToolNumber(num) {
        if (!num) return '';
        return num.toString().replace(/^0+/, '');
    }

    showDeskWorkSummary() {
        const deskCount = this.matchedForDesk.length;
        const onsiteCount = this.needsOnSite.length;
        const totalOpen = this.openInventories.length;

        let message;
        if (deskCount > 0 && onsiteCount > 0) {
            message = `Sehr gut! Ich habe deine Daten analysiert. 📊

**Ergebnis:**
✅ **${deskCount} Werkzeuge** kannst du **jetzt direkt am Rechner** bestätigen
📍 **${onsiteCount} Werkzeuge** erfordern einen **Vor-Ort-Besuch**

**Empfehlung:**
1. Erledige zuerst die ${deskCount} Werkzeuge am Rechner
2. Dann plane ich dir eine effiziente Tour für den Rest

Klicke rechts auf "Am Rechner erledigen" um zu starten, oder sag mir wenn du direkt zur Vor-Ort-Planung willst.`;
        } else if (deskCount > 0) {
            message = `Perfekt! 🎉

**Alle ${deskCount} Werkzeuge** kannst du **direkt am Rechner** bestätigen!
Du musst für keine Inventur vor Ort gehen.

Klicke rechts auf "Alle bestätigen" um fortzufahren.`;
        } else {
            message = `Ich konnte leider keine deiner Daten den offenen Inventuren zuordnen.

**${onsiteCount} Werkzeuge** erfordern einen Vor-Ort-Besuch.

Lass uns eine effiziente Tour planen. Wann hast du Zeit?`;
            this.goToStep(3);
        }

        this.addAssistantMessage(message);
        this.updateResultsPanel();
    }

    updateResultsPanel() {
        const content = document.getElementById('resultsContent');
        const actions = document.getElementById('resultsActions');

        if (this.matchedForDesk.length === 0 && this.needsOnSite.length === 0) {
            content.innerHTML = `
                <div class="empty-results">
                    <div class="empty-icon">📋</div>
                    <p>Lade Werkzeugdaten, um deinen<br>Inventurplan zu erstellen</p>
                </div>
            `;
            actions.style.display = 'none';
            return;
        }

        // Gruppiere nach Standort
        const byLocation = new Map();

        for (const tool of this.matchedForDesk) {
            const loc = tool.knownLocation || tool.location;
            if (!byLocation.has(loc)) {
                byLocation.set(loc, { desk: [], onsite: [] });
            }
            byLocation.get(loc).desk.push(tool);
        }

        for (const tool of this.needsOnSite) {
            const loc = tool.location;
            if (!byLocation.has(loc)) {
                byLocation.set(loc, { desk: [], onsite: [] });
            }
            byLocation.get(loc).onsite.push(tool);
        }

        content.innerHTML = `
            <div class="plan-summary">
                <div class="summary-row desk">
                    <span class="summary-icon">💻</span>
                    <span class="summary-label">Am Rechner</span>
                    <span class="summary-count">${this.matchedForDesk.length}</span>
                </div>
                <div class="summary-row onsite">
                    <span class="summary-icon">📍</span>
                    <span class="summary-label">Vor Ort</span>
                    <span class="summary-count">${this.needsOnSite.length}</span>
                </div>
            </div>

            <div class="location-groups">
                ${Array.from(byLocation.entries()).map(([loc, tools]) => `
                    <div class="location-group">
                        <div class="location-header">
                            <span class="location-name">📌 ${loc}</span>
                            <span class="location-count">${tools.desk.length + tools.onsite.length} Werkzeuge</span>
                        </div>
                        ${tools.desk.length > 0 ? `
                            <div class="tool-subgroup desk">
                                <div class="subgroup-label">💻 Am Rechner (${tools.desk.length})</div>
                                ${tools.desk.slice(0, 3).map(t => `
                                    <div class="tool-row">
                                        <span class="tool-num">${t.number}</span>
                                        <span class="tool-status ready">✓</span>
                                    </div>
                                `).join('')}
                                ${tools.desk.length > 3 ? `<div class="more-tools">+${tools.desk.length - 3} weitere</div>` : ''}
                            </div>
                        ` : ''}
                        ${tools.onsite.length > 0 ? `
                            <div class="tool-subgroup onsite">
                                <div class="subgroup-label">📍 Vor Ort (${tools.onsite.length})</div>
                                ${tools.onsite.slice(0, 3).map(t => `
                                    <div class="tool-row">
                                        <span class="tool-num">${t.number}</span>
                                        <span class="tool-status pending">○</span>
                                    </div>
                                `).join('')}
                                ${tools.onsite.length > 3 ? `<div class="more-tools">+${tools.onsite.length - 3} weitere</div>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            ${this.matchedForDesk.length > 0 ? `
                <button class="confirm-desk-btn" id="confirmDeskBtn">
                    💻 ${this.matchedForDesk.length} Werkzeuge am Rechner bestätigen
                </button>
            ` : ''}
        `;

        // Event listener für Desk-Bestätigung
        document.getElementById('confirmDeskBtn')?.addEventListener('click', () => this.confirmDeskTools());

        actions.style.display = this.needsOnSite.length > 0 ? 'flex' : 'none';

        // Zeige Step 3 Content wenn vor-Ort Werkzeuge existieren
        if (this.needsOnSite.length > 0) {
            this.populateLocationChips();
        }
    }

    populateLocationChips() {
        const container = document.getElementById('locationChips');
        const locations = [...new Set(this.needsOnSite.map(t => t.location))];

        container.innerHTML = locations.map(loc => `
            <button class="location-chip" data-location="${loc}">
                ${loc}
            </button>
        `).join('');

        container.querySelectorAll('.location-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
                this.updateSelectedLocations();
            });
        });
    }

    updateSelectedLocations() {
        this.selectedLocations = Array.from(document.querySelectorAll('.location-chip.selected'))
            .map(chip => chip.dataset.location);
    }

    selectTimeSlot(btn) {
        document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.availableTime = parseInt(btn.dataset.hours);
        document.getElementById('customHours').value = '';
    }

    goToStep(stepNum) {
        this.currentStep = stepNum;

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, idx) => {
            const num = idx + 1;
            step.classList.remove('active', 'completed');
            if (num < stepNum) step.classList.add('completed');
            if (num === stepNum) step.classList.add('active');
        });

        // Show/hide step content
        document.getElementById('step1Content').style.display = stepNum === 1 ? 'block' : 'none';
        document.getElementById('step2Content').style.display = stepNum === 2 ? 'block' : 'none';
        document.getElementById('step3Content').style.display = stepNum >= 3 ? 'block' : 'none';

        // Update step 2 summary
        if (stepNum === 2) {
            const summary = document.getElementById('deskSummary');
            summary.innerHTML = `
                <div class="desk-stat">
                    <span class="stat-number">${this.matchedForDesk.length}</span>
                    <span class="stat-label">Werkzeuge direkt bestätigbar</span>
                </div>
            `;
        }
    }

    async confirmDeskTools() {
        if (this.matchedForDesk.length === 0) return;

        this.addAssistantMessage(`Perfekt! Ich bestätige jetzt **${this.matchedForDesk.length} Werkzeuge** für dich...`);
        this.showTypingIndicator();

        // Simuliere API-Calls
        await new Promise(r => setTimeout(r, 1500));

        this.hideTypingIndicator();

        // Speichere für Inventur-Seite
        const importData = {
            timestamp: new Date().toISOString(),
            tools: this.matchedForDesk.map(t => ({
                number: t.number,
                location: t.knownLocation || t.location,
                status: 'confirmed',
                source: 'planungsagent'
            })),
            autoConfirmed: true
        };
        localStorage.setItem('agent_import_data', JSON.stringify(importData));

        if (this.needsOnSite.length > 0) {
            this.addAssistantMessage(`✅ **${this.matchedForDesk.length} Werkzeuge** wurden bestätigt!

Jetzt bleiben noch **${this.needsOnSite.length} Werkzeuge**, für die du vor Ort sein musst.

**Lass uns planen:**
1. Wann hast du Zeit? (Wähle links ein Zeitfenster)
2. Wo bist du sowieso? (Wähle die Standorte)
3. Ich erstelle dir eine optimierte Tour`);
            this.goToStep(3);
        } else {
            this.addAssistantMessage(`🎉 **Alle ${this.matchedForDesk.length} Werkzeuge** wurden bestätigt!

Du bist fertig - keine Vor-Ort-Besuche nötig.

Die Bestätigungen wurden an die Inventur-Seite übertragen.`);
        }

        this.matchedForDesk = [];
        this.updateResultsPanel();
    }

    generateTourPlan() {
        const customHours = document.getElementById('customHours').value;
        this.availableTime = this.availableTime || parseInt(customHours) || 2;

        if (this.selectedLocations.length === 0) {
            // Alle Standorte wenn keine ausgewählt
            this.selectedLocations = [...new Set(this.needsOnSite.map(t => t.location))];
        }

        // Filtere Werkzeuge nach ausgewählten Standorten
        const relevantTools = this.needsOnSite.filter(t =>
            this.selectedLocations.includes(t.location)
        );

        // Schätze Zeit pro Werkzeug (ca. 15 min)
        const toolsPerHour = 4;
        const maxTools = this.availableTime * toolsPerHour;

        // Priorisiere nach Fälligkeit
        const sorted = relevantTools.sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        );

        this.plannedTour = sorted.slice(0, maxTools);

        // Gruppiere nach Standort für Tour-Reihenfolge
        const tourByLocation = new Map();
        for (const tool of this.plannedTour) {
            if (!tourByLocation.has(tool.location)) {
                tourByLocation.set(tool.location, []);
            }
            tourByLocation.get(tool.location).push(tool);
        }

        const tourStops = Array.from(tourByLocation.entries());
        const notIncluded = relevantTools.length - this.plannedTour.length;

        let message = `🗺️ **Dein Tourenplan für ${this.availableTime} Stunde(n):**

`;
        tourStops.forEach(([loc, tools], idx) => {
            message += `**Stopp ${idx + 1}: ${loc}**
${tools.map(t => `• ${t.number} - ${t.name} (fällig: ${new Date(t.dueDate).toLocaleDateString('de-DE')})`).join('\n')}

`;
        });

        message += `**Zusammenfassung:**
• ${this.plannedTour.length} Werkzeuge in ${tourStops.length} Stopps
• Geschätzte Zeit: ${Math.ceil(this.plannedTour.length / toolsPerHour)} Stunden`;

        if (notIncluded > 0) {
            message += `\n• ${notIncluded} weitere Werkzeuge für einen späteren Termin`;
        }

        this.addAssistantMessage(message);
        this.showTourInResults(tourStops);
    }

    showTourInResults(tourStops) {
        const content = document.getElementById('resultsContent');

        content.innerHTML = `
            <div class="tour-plan">
                <div class="tour-header">
                    <span class="tour-icon">🗺️</span>
                    <span class="tour-title">Geplante Tour</span>
                </div>

                ${tourStops.map(([loc, tools], idx) => `
                    <div class="tour-stop">
                        <div class="stop-marker">${idx + 1}</div>
                        <div class="stop-content">
                            <div class="stop-location">${loc}</div>
                            <div class="stop-tools">${tools.length} Werkzeuge</div>
                            <div class="stop-time">~${Math.ceil(tools.length * 15)} min</div>
                        </div>
                    </div>
                    ${idx < tourStops.length - 1 ? '<div class="tour-connector"></div>' : ''}
                `).join('')}

                <div class="tour-total">
                    <strong>Gesamt:</strong> ${this.plannedTour.length} Werkzeuge
                </div>
            </div>
        `;

        document.getElementById('resultsActions').style.display = 'flex';
    }

    exportPlan() {
        // Erstelle CSV Export
        let csv = 'Stopp;Standort;Werkzeugnummer;Werkzeug;Faelligkeit\n';

        let stopNum = 1;
        let currentLoc = '';

        for (const tool of this.plannedTour) {
            if (tool.location !== currentLoc) {
                currentLoc = tool.location;
                stopNum++;
            }
            csv += `${stopNum};${tool.location};${tool.number};${tool.name};${tool.dueDate}\n`;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventurtour_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.addAssistantMessage(`📥 Tour wurde als CSV exportiert!`);
    }

    applyPlan() {
        // Speichere geplante Tour für Planung-Seite
        const planData = {
            timestamp: new Date().toISOString(),
            tour: this.plannedTour,
            availableTime: this.availableTime
        };
        localStorage.setItem('planned_tour', JSON.stringify(planData));

        this.addAssistantMessage(`✅ **Tour wurde gespeichert!**

Du kannst sie jetzt in der Planungsübersicht sehen.
Viel Erfolg bei der Inventur!`);

        setTimeout(() => {
            router.navigate('/planung');
        }, 2000);
    }

    // Chat functionality
    addUserMessage(content) {
        this.messages.push({
            role: 'user',
            content: content,
            timestamp: new Date()
        });
        this.renderMessages();
    }

    addAssistantMessage(content) {
        this.messages.push({
            role: 'assistant',
            content: content,
            timestamp: new Date()
        });
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = this.messages.map(msg => {
            const isUser = msg.role === 'user';
            const time = msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            let content = msg.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

            return `
                <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                    <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
                    <div class="message-content">
                        <div class="message-text">${content}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        input.style.height = 'auto';

        this.addUserMessage(message);
        this.showTypingIndicator();

        await new Promise(r => setTimeout(r, 800));
        this.hideTypingIndicator();

        // Einfache Antwortlogik
        const lower = message.toLowerCase();

        if (lower.includes('stunde') || lower.includes('zeit') || lower.match(/\d+\s*h/)) {
            const hours = message.match(/(\d+)/);
            if (hours) {
                this.availableTime = parseInt(hours[1]);
                this.addAssistantMessage(`Verstanden, du hast **${this.availableTime} Stunden** Zeit.

Wähle jetzt links die Standorte aus, an denen du sowieso bist, und klicke auf "Tour planen".`);
            }
        } else if (lower.includes('alles') && lower.includes('bestätig')) {
            this.confirmDeskTools();
        } else if (lower.includes('vor ort') || lower.includes('tour')) {
            this.goToStep(3);
            this.addAssistantMessage(`Gut, lass uns die Vor-Ort-Tour planen!

Sag mir:
1. Wie viel Zeit hast du? (z.B. "2 Stunden")
2. Wo bist du sowieso? (Wähle links die Standorte)`);
        } else {
            this.addAssistantMessage(`Ich verstehe.

Aktuell bin ich in **Schritt ${this.currentStep}**. Was möchtest du tun?
• "Alles bestätigen" - Werkzeuge am Rechner abschließen
• "Tour planen" - Vor-Ort-Besuche organisieren
• "2 Stunden" - Zeitfenster angeben`);
        }
    }

    showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        const indicator = document.createElement('div');
        indicator.className = 'chat-message assistant typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator')?.remove();
    }

    addStyles() {
        if (document.getElementById('agent-planung-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-planung-styles';
        styles.textContent = `
            .agent-planung-page {
                height: calc(100vh - 140px);
                padding: 1rem;
            }

            .agent-layout {
                display: grid;
                grid-template-columns: 300px 1fr 320px;
                gap: 1rem;
                height: 100%;
            }

            /* Sidebar */
            .agent-sidebar {
                background: white;
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                overflow-y: auto;
            }

            .sidebar-section h3 {
                font-size: 0.95rem;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .step-hint {
                font-size: 0.8rem;
                color: #6b7280;
                margin-bottom: 1rem;
            }

            /* Step Indicator */
            .step-indicator {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.5rem 0;
            }

            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
            }

            .step-number {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #e5e7eb;
                color: #6b7280;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.3s;
            }

            .step.active .step-number {
                background: #3b82f6;
                color: white;
            }

            .step.completed .step-number {
                background: #22c55e;
                color: white;
            }

            .step.completed .step-number::after {
                content: '✓';
            }

            .step-label {
                font-size: 0.7rem;
                color: #6b7280;
                text-align: center;
            }

            .step.active .step-label {
                color: #3b82f6;
                font-weight: 500;
            }

            .step-line {
                flex: 1;
                height: 2px;
                background: #e5e7eb;
                margin: 0 0.25rem;
                margin-bottom: 1rem;
            }

            /* Upload Options */
            .upload-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .upload-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
                padding: 0.75rem;
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .upload-option:hover,
            .upload-option.active {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .option-icon { font-size: 1.25rem; }
            .option-label { font-size: 0.75rem; color: #4b5563; }

            /* Upload Area */
            .upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 1.5rem 1rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .upload-area:hover,
            .upload-area.drag-over {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
            .upload-area p { font-size: 0.85rem; color: #6b7280; margin: 0; }
            .upload-link { color: #3b82f6; text-decoration: underline; }

            /* Files List */
            .files-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
            .file-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: #f3f4f6;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            .file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .remove-file { background: none; border: none; color: #9ca3af; cursor: pointer; }
            .remove-file:hover { color: #ef4444; }

            /* Step 2 & 3 Content */
            .desk-summary { padding: 1rem; background: #f0fdf4; border-radius: 8px; text-align: center; }
            .desk-stat { display: flex; flex-direction: column; }
            .stat-number { font-size: 2rem; font-weight: 700; color: #22c55e; }
            .stat-label { font-size: 0.85rem; color: #6b7280; }

            /* Time Input */
            .time-input-section { margin-bottom: 1rem; }
            .time-input-section label { display: block; font-size: 0.85rem; color: #374151; margin-bottom: 0.5rem; }
            .time-slots { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
            .time-slot {
                flex: 1;
                padding: 0.5rem;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
            }
            .time-slot:hover, .time-slot.selected {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            .custom-hours-input {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.85rem;
            }

            /* Location Chips */
            .location-input-section { margin-bottom: 1rem; }
            .location-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
            .location-chip {
                padding: 0.4rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                background: white;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .location-chip:hover { border-color: #3b82f6; }
            .location-chip.selected {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .plan-tour-btn {
                width: 100%;
                padding: 0.75rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .plan-tour-btn:hover { background: #2563eb; }

            /* Main Chat Area */
            .agent-main {
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 12px;
                overflow: hidden;
            }

            .chat-container { flex: 1; overflow-y: auto; }
            .chat-messages { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }

            .chat-message { display: flex; gap: 0.75rem; max-width: 85%; }
            .chat-message.user { align-self: flex-end; flex-direction: row-reverse; }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            .chat-message.user .message-avatar { background: #dbeafe; }

            .message-content {
                background: #f9fafb;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                border-top-left-radius: 4px;
            }
            .chat-message.user .message-content {
                background: #3b82f6;
                color: white;
                border-top-left-radius: 12px;
                border-top-right-radius: 4px;
            }

            .message-text { font-size: 0.9rem; line-height: 1.5; }
            .message-time { font-size: 0.7rem; color: #9ca3af; margin-top: 0.5rem; }
            .chat-message.user .message-time { color: rgba(255,255,255,0.7); }

            /* Typing Indicator */
            .typing-dots { display: flex; gap: 4px; }
            .typing-dots span {
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            /* Chat Input */
            .chat-input-area { padding: 1rem; border-top: 1px solid #e5e7eb; }
            .input-wrapper { display: flex; gap: 0.5rem; align-items: flex-end; }
            .input-wrapper textarea {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.9rem;
                resize: none;
                min-height: 42px;
                max-height: 150px;
                font-family: inherit;
            }
            .input-wrapper textarea:focus { outline: none; border-color: #3b82f6; }
            .send-btn {
                padding: 0.75rem 1.25rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
            }
            .send-btn:hover { background: #2563eb; }

            /* Results Panel */
            .agent-results {
                background: white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .results-header {
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .results-header h3 { margin: 0; font-size: 1rem; }

            .results-content { flex: 1; overflow-y: auto; padding: 1rem; }

            .empty-results {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
            .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
            .empty-results p { font-size: 0.9rem; line-height: 1.5; }

            /* Plan Summary */
            .plan-summary {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            .summary-row {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.75rem;
                border-radius: 8px;
            }
            .summary-row.desk { background: #f0fdf4; }
            .summary-row.onsite { background: #fef3c7; }
            .summary-icon { font-size: 1.25rem; }
            .summary-label { font-size: 0.75rem; color: #6b7280; }
            .summary-count { font-size: 1.5rem; font-weight: 700; }
            .summary-row.desk .summary-count { color: #22c55e; }
            .summary-row.onsite .summary-count { color: #f59e0b; }

            /* Location Groups */
            .location-groups { display: flex; flex-direction: column; gap: 0.75rem; }
            .location-group {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            .location-header {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0.75rem;
                background: #f9fafb;
                font-size: 0.85rem;
            }
            .location-name { font-weight: 500; }
            .location-count { color: #6b7280; }

            .tool-subgroup { padding: 0.5rem 0.75rem; }
            .tool-subgroup.desk { background: #f0fdf4; }
            .tool-subgroup.onsite { background: #fffbeb; }
            .subgroup-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
            .tool-row {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                padding: 0.25rem 0;
            }
            .tool-num { font-family: monospace; color: #3b82f6; }
            .tool-status.ready { color: #22c55e; }
            .tool-status.pending { color: #9ca3af; }
            .more-tools { font-size: 0.75rem; color: #6b7280; font-style: italic; }

            .confirm-desk-btn {
                width: 100%;
                padding: 0.75rem;
                margin-top: 1rem;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                font-weight: 500;
            }
            .confirm-desk-btn:hover { background: #16a34a; }

            /* Tour Plan */
            .tour-plan { padding: 0.5rem; }
            .tour-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }
            .tour-icon { font-size: 1.25rem; }

            .tour-stop {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                padding: 0.5rem;
            }
            .stop-marker {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.85rem;
                flex-shrink: 0;
            }
            .stop-content { flex: 1; }
            .stop-location { font-weight: 500; font-size: 0.9rem; }
            .stop-tools { font-size: 0.8rem; color: #6b7280; }
            .stop-time { font-size: 0.75rem; color: #9ca3af; }

            .tour-connector {
                width: 2px;
                height: 20px;
                background: #d1d5db;
                margin-left: 13px;
            }

            .tour-total {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
                font-size: 0.9rem;
            }

            /* Results Actions */
            .results-actions {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 0.5rem;
            }
            .agent-btn {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 8px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .agent-btn.primary { background: #3b82f6; color: white; }
            .agent-btn.primary:hover { background: #2563eb; }
            .agent-btn.secondary { background: #f3f4f6; color: #4b5563; }
            .agent-btn.secondary:hover { background: #e5e7eb; }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentInventurplanungPage = new AgentInventurplanungPage();
