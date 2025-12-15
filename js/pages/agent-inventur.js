// ORCA 2.0 - Inventur Agent
class AgentInventurPage {
    constructor() {
        this.messages = [];
        this.uploadedFiles = [];
        this.recognizedTools = [];
        this.matchedInventories = [];
        this.isProcessing = false;
        this.claudeApiKey = null;
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Inventur-Agent';
        document.getElementById('headerSubtitle').textContent = 'KI-gestützter Datenimport';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container agent-inventur-page">
                <div class="agent-layout">
                    <!-- Sidebar with upload options -->
                    <div class="agent-sidebar">
                        <!-- KI Status - shows if AI is available -->
                        <div class="sidebar-section ai-status-section" id="aiStatusSection">
                            <div class="ai-status-display" id="aiStatusDisplay">
                                <span class="ai-icon">🤖</span>
                                <span class="ai-text" id="aiStatusText">KI-Analyse wird geladen...</span>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>Datenquelle wählen</h3>
                            <div class="upload-options">
                                <button class="upload-option active" data-type="file">
                                    <span class="option-icon">📄</span>
                                    <span class="option-label">Excel / CSV</span>
                                </button>
                                <button class="upload-option" data-type="screenshot">
                                    <span class="option-icon">📷</span>
                                    <span class="option-label">Screenshot</span>
                                </button>
                                <button class="upload-option" data-type="api">
                                    <span class="option-icon">🔗</span>
                                    <span class="option-label">API</span>
                                </button>
                                <button class="upload-option" data-type="manual">
                                    <span class="option-icon">✏️</span>
                                    <span class="option-label">Manuell</span>
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-section upload-area-section">
                            <div class="upload-area disabled" id="uploadArea">
                                <div class="upload-icon">🔒</div>
                                <p id="uploadText">Bitte erst API Key eingeben</p>
                                <input type="file" id="fileInput" accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg" multiple hidden>
                            </div>
                            <div class="uploaded-files" id="uploadedFiles"></div>
                        </div>

                        <div class="sidebar-section" id="apiConfigSection" style="display: none;">
                            <h4>API-Konfiguration</h4>
                            <input type="text" id="apiEndpoint" placeholder="API Endpoint URL" class="agent-input">
                            <input type="text" id="apiKey" placeholder="API Key (optional)" class="agent-input">
                            <button class="agent-btn secondary" id="testApiBtn">Verbindung testen</button>
                        </div>
                    </div>

                    <!-- Main chat area -->
                    <div class="agent-main">
                        <div class="chat-container" id="chatContainer">
                            <div class="chat-messages" id="chatMessages">
                                <!-- Initial greeting will be added here -->
                            </div>
                        </div>

                        <div class="chat-input-area">
                            <div class="input-wrapper">
                                <textarea
                                    id="chatInput"
                                    placeholder="Nachricht eingeben oder Datei hochladen..."
                                    rows="1"
                                ></textarea>
                                <button class="send-btn" id="sendBtn" disabled>
                                    <span>Senden</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Results sidebar -->
                    <div class="agent-results" id="agentResults" style="display: none;">
                        <div class="results-header">
                            <h3>Erkannte Daten</h3>
                            <button class="close-results" id="closeResults">×</button>
                        </div>
                        <div class="results-content" id="resultsContent">
                            <!-- Dynamic content -->
                        </div>
                        <div class="results-actions">
                            <button class="agent-btn secondary" id="resetBtn">Zurücksetzen</button>
                            <button class="agent-btn primary" id="applyBtn">Zu Inventuren übernehmen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
        this.showGreeting();
        this.loadApiKey();
    }

    loadApiKey() {
        // Load API key from global settings (configured by admin)
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        const savedKey = config.claudeApiKey || localStorage.getItem('claude_api_key');

        if (savedKey) {
            this.claudeApiKey = savedKey;
            this.updateAiStatus('ready');
        } else {
            this.claudeApiKey = null;
            // Enable mock mode - still allow uploads
            this.updateAiStatus('mock');
        }
    }

    updateAiStatus(status) {
        const statusDisplay = document.getElementById('aiStatusDisplay');
        const statusText = document.getElementById('aiStatusText');
        const uploadArea = document.getElementById('uploadArea');
        const uploadText = document.getElementById('uploadText');

        switch (status) {
            case 'ready':
                statusDisplay.className = 'ai-status-display ready';
                statusText.textContent = 'KI-Analyse bereit';
                uploadArea.classList.remove('disabled');
                uploadText.innerHTML = 'Datei hierher ziehen<br>oder <span class="upload-link">durchsuchen</span>';
                document.querySelector('.upload-icon').textContent = '📁';
                break;

            case 'mock':
                statusDisplay.className = 'ai-status-display mock';
                statusText.innerHTML = 'Muster-Erkennung aktiv<br><small>Excel/CSV werden analysiert</small>';
                uploadArea.classList.remove('disabled');
                uploadText.innerHTML = 'Datei hierher ziehen<br>oder <span class="upload-link">durchsuchen</span>';
                document.querySelector('.upload-icon').textContent = '📁';
                break;

            case 'no-key':
                statusDisplay.className = 'ai-status-display warning';
                statusText.innerHTML = 'KI nicht konfiguriert<br><small>Bitte Admin kontaktieren</small>';
                uploadArea.classList.add('disabled');
                uploadText.innerHTML = 'KI-Analyse nicht verfügbar';
                document.querySelector('.upload-icon').textContent = '⚠️';
                break;

            case 'error':
                statusDisplay.className = 'ai-status-display error';
                statusText.textContent = 'KI-Fehler aufgetreten';
                break;

            default:
                statusDisplay.className = 'ai-status-display';
                statusText.textContent = 'KI-Analyse wird geladen...';
        }
    }

    showGreeting() {
        const greeting = {
            role: 'assistant',
            content: `Willkommen beim Inventur-Agenten! 👋

Ich helfe Ihnen, Ihre Werkzeugdaten mit den anstehenden Inventuren zu verknüpfen.

**So funktioniert's:**
1. Wählen Sie links eine Datenquelle (Excel, Screenshot, API)
2. Laden Sie Ihre Daten hoch
3. Ich analysiere und ordne sie Ihren offenen Inventuren zu
4. Sie prüfen das Ergebnis und übernehmen es

**Welche Daten haben Sie?**`,
            timestamp: new Date()
        };

        this.messages.push(greeting);
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
        container.scrollTop = container.scrollHeight;
    }

    renderMessage(msg) {
        const isUser = msg.role === 'user';
        const time = msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        let contentHtml = msg.content;
        // Simple markdown rendering
        contentHtml = contentHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        contentHtml = contentHtml.replace(/\n/g, '<br>');

        // If message has file attachments
        let attachmentsHtml = '';
        if (msg.files && msg.files.length > 0) {
            attachmentsHtml = `
                <div class="message-attachments">
                    ${msg.files.map(f => `
                        <div class="attachment">
                            <span class="attachment-icon">${this.getFileIcon(f.name)}</span>
                            <span class="attachment-name">${f.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // If message has a results preview
        let resultsHtml = '';
        if (msg.results) {
            resultsHtml = `
                <div class="message-results">
                    <div class="results-summary">
                        <div class="result-item">
                            <span class="result-number">${msg.results.toolCount}</span>
                            <span class="result-label">Werkzeuge zugeordnet</span>
                        </div>
                        <div class="result-item">
                            <span class="result-number">${msg.results.inventoryCount}</span>
                            <span class="result-label">${msg.results.inventoryCount === 1 ? 'Inventur' : 'Inventuren'}</span>
                        </div>
                    </div>
                    <button class="view-details-btn" id="viewDetailsBtn">Details anzeigen →</button>
                </div>
            `;
        }

        return `
            <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                <div class="message-avatar">
                    ${isUser ? '👤' : '🤖'}
                </div>
                <div class="message-content">
                    <div class="message-text">${contentHtml}</div>
                    ${attachmentsHtml}
                    ${resultsHtml}
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'xlsx': '📊',
            'xls': '📊',
            'csv': '📋',
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️'
        };
        return icons[ext] || '📄';
    }

    attachEventListeners() {
        // Upload option selection
        document.querySelectorAll('.upload-option').forEach(btn => {
            btn.addEventListener('click', () => this.selectUploadOption(btn));
        });

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => {
            // Allow uploads in mock mode and with API key
            if (uploadArea.classList.contains('disabled')) {
                const statusSection = document.getElementById('aiStatusSection');
                statusSection.classList.add('shake');
                setTimeout(() => statusSection.classList.remove('shake'), 500);
                return;
            }
            fileInput.click();
        });
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (uploadArea.classList.contains('disabled')) return;
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (uploadArea.classList.contains('disabled')) return;
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        chatInput.addEventListener('input', () => {
            sendBtn.disabled = chatInput.value.trim() === '' && this.uploadedFiles.length === 0;
            // Auto-resize
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

        // Results panel
        document.getElementById('closeResults')?.addEventListener('click', () => {
            document.getElementById('agentResults').style.display = 'none';
        });

        document.getElementById('applyBtn')?.addEventListener('click', () => this.applyToInventories());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
    }

    selectUploadOption(btn) {
        document.querySelectorAll('.upload-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        const uploadSection = document.querySelector('.upload-area-section');
        const apiSection = document.getElementById('apiConfigSection');

        if (type === 'api') {
            uploadSection.style.display = 'none';
            apiSection.style.display = 'block';
        } else {
            uploadSection.style.display = 'block';
            apiSection.style.display = 'none';

            // Update file input accept types
            const fileInput = document.getElementById('fileInput');
            if (type === 'file') {
                fileInput.accept = '.xlsx,.xls,.csv';
            } else if (type === 'screenshot') {
                fileInput.accept = '.png,.jpg,.jpeg';
            }
        }
    }

    async handleFiles(files) {
        const fileList = Array.from(files);

        for (const file of fileList) {
            this.uploadedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                file: file
            });
        }

        this.renderUploadedFiles();
        document.getElementById('sendBtn').disabled = false;

        // Add user message about upload
        const fileNames = fileList.map(f => f.name).join(', ');
        this.addUserMessage(`Datei hochgeladen: ${fileNames}`, fileList);
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
                const index = parseInt(btn.dataset.index);
                this.uploadedFiles.splice(index, 1);
                this.renderUploadedFiles();
            });
        });
    }

    addUserMessage(content, files = null) {
        const msg = {
            role: 'user',
            content: content,
            files: files ? Array.from(files).map(f => ({ name: f.name })) : null,
            timestamp: new Date()
        };

        this.messages.push(msg);
        this.renderMessages();
    }

    addAssistantMessage(content, results = null) {
        const msg = {
            role: 'assistant',
            content: content,
            results: results,
            timestamp: new Date()
        };

        this.messages.push(msg);
        this.renderMessages();

        // Attach event listener for view details button if results exist
        if (results) {
            setTimeout(() => {
                const btn = document.getElementById('viewDetailsBtn');
                if (btn) {
                    btn.addEventListener('click', () => this.showResultsPanel());
                }
            }, 100);
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message && this.uploadedFiles.length === 0) return;

        // Clear input
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('sendBtn').disabled = true;

        // Process uploaded files
        if (this.uploadedFiles.length > 0) {
            await this.processUploadedFiles();
        } else if (message) {
            this.addUserMessage(message);
            await this.processUserMessage(message);
        }
    }

    async processUploadedFiles() {
        this.isProcessing = true;
        this.showTypingIndicator();

        try {
            const results = await this.analyzeFiles();

            this.hideTypingIndicator();

            if (results.success) {
                this.recognizedTools = results.tools;
                this.matchedInventories = results.inventories;

                const matchedCount = results.tools.length - results.unmatchedCount;
                const inventurText = results.inventories.length === 1 ? 'Inventur' : 'Inventuren';

                this.addAssistantMessage(
                    `Ich habe Ihre Daten analysiert und folgendes gefunden:

**${results.tools.length} Werkzeuge** wurden erkannt.
${matchedCount > 0 ? `✓ **${matchedCount} Werkzeuge** wurden **${results.inventories.length} ${inventurText}** zugeordnet.` : ''}
${results.unmatchedCount > 0 ? `⚠️ **${results.unmatchedCount} Werkzeuge** konnten keiner Inventur zugeordnet werden.` : '✅ Alle Werkzeuge wurden erfolgreich zugeordnet.'}

Klicken Sie auf "Details anzeigen" um die Zuordnung zu prüfen, oder auf "Zu Inventuren übernehmen" um fortzufahren.`,
                    {
                        toolCount: matchedCount,
                        inventoryCount: results.inventories.length
                    }
                );
            } else {
                this.addAssistantMessage(
                    `Es gab ein Problem bei der Analyse: ${results.error}

Bitte stellen Sie sicher, dass:
- Die Datei das richtige Format hat (Excel, CSV, oder Bild)
- Die Daten Werkzeuginformationen enthalten
- Der Claude API Key korrekt eingegeben ist`
                );
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addAssistantMessage(`Fehler bei der Verarbeitung: ${error.message}`);
        }

        this.uploadedFiles = [];
        this.renderUploadedFiles();
        this.isProcessing = false;
    }

    async analyzeFiles() {
        // Read file contents
        const fileContents = [];
        for (const fileObj of this.uploadedFiles) {
            const content = await this.readFileContent(fileObj.file);
            fileContents.push({
                name: fileObj.name,
                type: fileObj.type,
                content: content
            });
        }

        // If no API key, use mock analysis
        if (!this.claudeApiKey) {
            return await this.mockAnalyzeFiles(fileContents);
        }

        // Call Claude API for analysis
        try {
            const analysisResult = await this.callClaudeAPI(fileContents);
            return analysisResult;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const fileName = file.name.toLowerCase();

            // Handle images
            if (file.type.startsWith('image/')) {
                reader.onload = () => resolve({
                    type: 'image',
                    data: reader.result.split(',')[1] // Base64 without prefix
                });
                reader.readAsDataURL(file);
                return;
            }

            // Handle Excel files with SheetJS
            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Convert all sheets to text
                        let textContent = '';
                        for (const sheetName of workbook.SheetNames) {
                            const sheet = workbook.Sheets[sheetName];
                            // Convert to CSV format for easy parsing
                            const csv = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
                            textContent += `=== Sheet: ${sheetName} ===\n${csv}\n\n`;
                        }

                        resolve({
                            type: 'text',
                            data: textContent
                        });
                    } catch (err) {
                        reject(new Error('Excel-Datei konnte nicht gelesen werden: ' + err.message));
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            // Handle CSV and text files
            reader.onload = () => resolve({
                type: 'text',
                data: reader.result
            });
            reader.readAsText(file);

            reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
        });
    }

    async callClaudeAPI(fileContents) {
        // Build the message content
        const messageContent = [];

        // Add instructions
        messageContent.push({
            type: 'text',
            text: `Du bist ein Inventur-Assistent. Analysiere die folgenden Daten und extrahiere alle Werkzeuginformationen.

Für jedes gefundene Werkzeug extrahiere:
- Werkzeugnummer (z.B. FM-123456)
- Werkzeugname/Bezeichnung
- Standort (falls vorhanden)
- Zustand (falls vorhanden)
- Seriennummer (falls vorhanden)

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "success": true,
  "tools": [
    {
      "number": "FM-123456",
      "name": "Werkzeugname",
      "location": "Standort oder null",
      "condition": "Zustand oder null",
      "serialNumber": "Seriennummer oder null"
    }
  ],
  "summary": "Kurze Zusammenfassung was gefunden wurde"
}

Falls keine Werkzeuge gefunden werden können:
{
  "success": false,
  "error": "Beschreibung des Problems"
}`
        });

        // Add file contents
        for (const file of fileContents) {
            if (file.content.type === 'image') {
                messageContent.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: file.type,
                        data: file.content.data
                    }
                });
            } else {
                messageContent.push({
                    type: 'text',
                    text: `Dateiinhalt von ${file.name}:\n\n${file.content.data}`
                });
            }
        }

        // Call Claude API
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
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: messageContent
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API-Fehler: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content[0].text;

        // Parse JSON from response
        try {
            // Extract JSON from response (might be wrapped in markdown code blocks)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Keine JSON-Antwort erhalten');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            if (parsed.success && parsed.tools) {
                // Match tools with open inventories
                const matchResult = await this.matchWithInventories(parsed.tools);
                return {
                    success: true,
                    tools: matchResult.tools,
                    inventories: matchResult.inventories,
                    unmatchedCount: matchResult.unmatchedCount
                };
            } else {
                return {
                    success: false,
                    error: parsed.error || 'Unbekannter Fehler'
                };
            }
        } catch (e) {
            throw new Error(`Antwort konnte nicht verarbeitet werden: ${e.message}`);
        }
    }

    // ========================================
    // MOCK ANALYSIS (when no API key available)
    // ========================================
    async mockAnalyzeFiles(fileContents) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const extractedTools = [];

        for (const file of fileContents) {
            if (file.content.type === 'image') {
                // For images, we can't analyze without AI - return helpful message
                return {
                    success: false,
                    error: 'Screenshot-Analyse benötigt KI-Funktion. Bitte laden Sie eine Excel/CSV-Datei hoch oder kontaktieren Sie den Administrator für KI-Aktivierung.'
                };
            }

            // Extract tool numbers from text content
            const text = file.content.data;
            const tools = this.extractToolsFromText(text, file.name);
            extractedTools.push(...tools);
        }

        if (extractedTools.length === 0) {
            return {
                success: false,
                error: 'Keine Werkzeugnummern gefunden. Bitte stellen Sie sicher, dass die Datei Werkzeugdaten enthält.'
            };
        }

        // Match with inventories
        const matchResult = await this.matchWithInventories(extractedTools);

        return {
            success: true,
            tools: matchResult.tools,
            inventories: matchResult.inventories,
            unmatchedCount: matchResult.unmatchedCount
        };
    }

    extractToolsFromText(text, filename) {
        const tools = [];
        const lines = text.split(/[\n\r]+/);

        // Patterns for tool numbers (DRAEXLMAIER format)
        const toolPatterns = [
            /\b(0{0,3}10\d{6})\b/g,       // 0010120920, 10120920, etc.
            /\b(90100\d{5})\b/g,           // 9010067965, etc.
            /\b(1\d{8})\b/g,               // 100281121, 152350370, etc.
            /\b(\d{7,10})\b/g              // Generic 7-10 digit numbers
        ];

        // Known tool types
        const toolTypes = {
            'spritzgie': 'Spritzgießwerkzeug',
            'sgw': 'Spritzgießwerkzeug',
            'schäum': 'Schäumform',
            'schaum': 'Schäumform',
            'sf': 'Schäumform',
            'sfm': 'Schäumform',
            'hinterschäum': 'Hinterschäumwerkzeuge / -form',
            'vulkan': 'Vulkanisationswerkzeug',
            'stanz': 'Stanzwerkzeug',
            'press': 'Presswerkzeug'
        };

        // Known locations (DRAEXLMAIER)
        const locationPatterns = {
            'hunedoara': 'Hunedoara, RO',
            'hu-ro': 'Hunedoara, RO',
            'hu': 'Hunedoara, RO',
            'zrenjanin': 'Zrenjanin, RS',
            'zr': 'Zrenjanin, RS',
            'sousse': 'Sousse, TN',
            'tn': 'Sousse, TN',
            'györ': 'Györ, HU',
            'gyor': 'Györ, HU',
            'gyál': 'Gyál, HU',
            'gyal': 'Gyál, HU',
            'hornstein': 'Hornstein, AT',
            'braunau': 'Braunau, AT',
            'bad salzuflen': 'Bad Salzuflen, DE',
            'stahringen': 'Stahringen, DE',
            'neustadt': 'Neustadt a. Rbge., DE',
            'dornstetten': 'Dornstetten, DE',
            'coburg': 'Coburg, DE',
            'radolfzell': 'Radolfzell am Bodensee, DE',
            'bostanj': 'Bostanj, SL',
            'balti': 'Balti, MD',
            'chemor': 'Chemor (Ipoh), MY',
            'taipeh': 'Taipeh, TW',
            'taiwan': 'Taipeh, TW'
        };

        const seenNumbers = new Set();

        for (const line of lines) {
            const lineLower = line.toLowerCase();

            // Try each pattern
            for (const pattern of toolPatterns) {
                const matches = line.matchAll(pattern);
                for (const match of matches) {
                    let number = match[1];

                    // Skip if already seen or too short
                    if (seenNumbers.has(number) || number.length < 7) continue;

                    // Skip common non-tool numbers
                    if (/^(2024|2025|1970|0000)/.test(number)) continue;

                    seenNumbers.add(number);

                    // Normalize number (ensure leading zeros for 10-digit format)
                    if (number.length === 8 && number.startsWith('10')) {
                        number = '00' + number;
                    }

                    // Detect tool type
                    let toolType = 'Werkzeug';
                    for (const [key, value] of Object.entries(toolTypes)) {
                        if (lineLower.includes(key)) {
                            toolType = value;
                            break;
                        }
                    }

                    // Detect location
                    let location = null;
                    for (const [key, value] of Object.entries(locationPatterns)) {
                        if (lineLower.includes(key)) {
                            location = value;
                            break;
                        }
                    }

                    tools.push({
                        number: number,
                        name: toolType,
                        location: location,
                        condition: null,
                        serialNumber: null,
                        sourceLine: line.trim().substring(0, 100)
                    });
                }
            }
        }

        return tools;
    }

    async matchWithInventories(tools) {
        // Load open inventories from API
        let openInventories = [];
        try {
            openInventories = await apiService.getOpenInventories();
        } catch (e) {
            // Use mock data if API fails
            openInventories = this.getMockInventories();
        }

        const matchedTools = [];
        const inventoryMap = new Map();
        let unmatchedCount = 0;

        for (const tool of tools) {
            // Try to match tool to an inventory by tool number
            let matched = false;

            for (const inv of openInventories) {
                // Check if this tool belongs to this inventory
                // (In reality, this would check against the inventory's tool list)
                if (this.toolBelongsToInventory(tool, inv)) {
                    matchedTools.push({
                        ...tool,
                        inventoryId: inv.id,
                        inventoryName: inv.name
                    });

                    if (!inventoryMap.has(inv.id)) {
                        inventoryMap.set(inv.id, {
                            ...inv,
                            matchedTools: []
                        });
                    }
                    inventoryMap.get(inv.id).matchedTools.push(tool);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                matchedTools.push({
                    ...tool,
                    inventoryId: null,
                    inventoryName: 'Keine Zuordnung'
                });
                unmatchedCount++;
            }
        }

        return {
            tools: matchedTools,
            inventories: Array.from(inventoryMap.values()),
            unmatchedCount
        };
    }

    toolBelongsToInventory(tool, inventory) {
        // Match by location if available
        if (tool.location && inventory.locationKeywords) {
            const locationLower = tool.location.toLowerCase();
            for (const keyword of inventory.locationKeywords) {
                if (locationLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }

        // Legacy: Check if tool number format matches inventory's expected tools
        if (tool.number && inventory.toolPattern) {
            return tool.number.match(new RegExp(inventory.toolPattern));
        }

        // No location info - don't auto-assign
        return false;
    }

    getMockInventories() {
        // Realistic DRAEXLMAIER inventories by location
        return [
            {
                id: 'inv-hunedoara',
                name: 'Inventur Q4/2024 - Hunedoara (RO)',
                locationKeywords: ['hunedoara', 'hu-ro', 'ro'],
                dueDate: '2024-12-31'
            },
            {
                id: 'inv-zrenjanin',
                name: 'Inventur Q4/2024 - Zrenjanin (RS)',
                locationKeywords: ['zrenjanin', 'zr', 'rs'],
                dueDate: '2024-12-31'
            },
            {
                id: 'inv-sousse',
                name: 'Inventur Q4/2024 - Sousse (TN)',
                locationKeywords: ['sousse', 'tn'],
                dueDate: '2024-12-31'
            },
            {
                id: 'inv-ungarn',
                name: 'Inventur Q4/2024 - Ungarn (HU)',
                locationKeywords: ['györ', 'gyor', 'gyál', 'gyal', 'hu'],
                dueDate: '2024-12-31'
            },
            {
                id: 'inv-deutschland',
                name: 'Inventur Q4/2024 - Deutschland',
                locationKeywords: ['bad salzuflen', 'stahringen', 'neustadt', 'dornstetten', 'coburg', 'radolfzell', 'de'],
                dueDate: '2024-12-31'
            },
            {
                id: 'inv-oesterreich',
                name: 'Inventur Q4/2024 - Österreich',
                locationKeywords: ['hornstein', 'braunau', 'at'],
                dueDate: '2024-12-31'
            }
        ];
    }

    showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        const indicator = document.createElement('div');
        indicator.className = 'chat-message assistant typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    async processUserMessage(message) {
        // Simple response logic for now
        this.showTypingIndicator();

        await new Promise(resolve => setTimeout(resolve, 1000));

        this.hideTypingIndicator();
        this.addAssistantMessage(
            `Ich verstehe. Um Ihre Daten zu analysieren, laden Sie bitte eine Datei hoch:

- **Excel/CSV**: Tabellen mit Werkzeugdaten
- **Screenshot**: Bilder von Listen oder Systemen
- **API**: Direkte Verbindung zu Ihrem System

Wählen Sie links eine Option und laden Sie Ihre Daten hoch.`
        );
    }

    showResultsPanel() {
        const panel = document.getElementById('agentResults');
        const content = document.getElementById('resultsContent');

        // Group tools by inventory
        const grouped = {};
        for (const tool of this.recognizedTools) {
            const invId = tool.inventoryId || 'unmatched';
            if (!grouped[invId]) {
                grouped[invId] = {
                    name: tool.inventoryName || 'Keine Zuordnung',
                    tools: []
                };
            }
            grouped[invId].tools.push(tool);
        }

        content.innerHTML = `
            <div class="results-groups">
                ${Object.entries(grouped).map(([id, group]) => `
                    <div class="result-group ${id === 'unmatched' ? 'unmatched' : ''}">
                        <div class="group-header">
                            <span class="group-name">${group.name}</span>
                            <span class="group-count">${group.tools.length} Werkzeuge</span>
                        </div>
                        <div class="group-tools">
                            ${group.tools.map(t => `
                                <div class="tool-item">
                                    <span class="tool-number">${t.number || '-'}</span>
                                    <span class="tool-name">${t.name || '-'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        panel.style.display = 'flex';
    }

    async applyToInventories() {
        if (this.recognizedTools.length === 0) {
            alert('Keine Werkzeuge zum Übernehmen vorhanden.');
            return;
        }

        // Store results for the inventory page
        const importData = {
            timestamp: new Date().toISOString(),
            tools: this.recognizedTools,
            inventories: this.matchedInventories
        };

        localStorage.setItem('agent_import_data', JSON.stringify(importData));

        // Show confirmation
        this.addAssistantMessage(
            `Die Zuordnung wurde gespeichert. Sie werden jetzt zur Inventursicht weitergeleitet, wo Sie die importierten Daten überprüfen und bestätigen können.

**Hinweis:** Die Werkzeuge sind Ihren Inventuren zugeordnet, aber noch nicht bestätigt. Bitte prüfen Sie jeden Eintrag.`
        );

        // Navigate to inventory page after short delay
        setTimeout(() => {
            router.navigate('/inventur');
        }, 2000);
    }

    reset() {
        this.messages = [];
        this.uploadedFiles = [];
        this.recognizedTools = [];
        this.matchedInventories = [];
        document.getElementById('agentResults').style.display = 'none';
        this.showGreeting();
        this.renderUploadedFiles();
    }

    addStyles() {
        if (document.getElementById('agent-inventur-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-inventur-styles';
        styles.textContent = `
            .agent-inventur-page {
                height: calc(100vh - 140px);
                padding: 1rem;
            }

            .agent-layout {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 1rem;
                height: 100%;
            }

            .agent-layout.with-results {
                grid-template-columns: 280px 1fr 320px;
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

            .sidebar-section h3,
            .sidebar-section h4 {
                font-size: 0.9rem;
                color: #374151;
                margin-bottom: 0.75rem;
            }

            /* AI Status Section */
            .ai-status-section {
                padding: 0 !important;
            }

            .ai-status-display {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                background: #f3f4f6;
                border: 2px solid #e5e7eb;
            }

            .ai-status-display.ready {
                background: #dcfce7;
                border-color: #86efac;
            }

            .ai-status-display.ready .ai-icon {
                color: #16a34a;
            }

            .ai-status-display.mock {
                background: #dbeafe;
                border-color: #93c5fd;
            }

            .ai-status-display.mock .ai-icon {
                color: #2563eb;
            }

            .ai-status-display.warning {
                background: #fef3c7;
                border-color: #fcd34d;
            }

            .ai-status-display.warning .ai-icon {
                color: #d97706;
            }

            .ai-status-display.error {
                background: #fee2e2;
                border-color: #fca5a5;
            }

            .ai-icon {
                font-size: 1.5rem;
            }

            .ai-text {
                font-size: 0.85rem;
                color: #374151;
                line-height: 1.3;
            }

            .ai-text small {
                display: block;
                color: #6b7280;
                font-size: 0.75rem;
            }

            .shake {
                animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .upload-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
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

            .upload-option:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .upload-option.active {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .option-icon {
                font-size: 1.25rem;
            }

            .option-label {
                font-size: 0.75rem;
                color: #4b5563;
            }

            .upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 2rem 1rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .upload-area:hover,
            .upload-area.drag-over {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .upload-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }

            .upload-area p {
                font-size: 0.85rem;
                color: #6b7280;
                margin: 0;
            }

            .upload-link {
                color: #3b82f6;
                text-decoration: underline;
            }

            .uploaded-files {
                margin-top: 0.5rem;
            }

            .files-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .file-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: #f3f4f6;
                border-radius: 6px;
                font-size: 0.85rem;
            }

            .file-name {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .remove-file {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 0 0.25rem;
            }

            .remove-file:hover {
                color: #ef4444;
            }

            .agent-input {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }

            .hint {
                font-size: 0.75rem;
                color: #9ca3af;
                margin: 0;
            }

            /* Main chat area */
            .agent-main {
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 12px;
                overflow: hidden;
            }

            .chat-container {
                flex: 1;
                overflow-y: auto;
            }

            .chat-messages {
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .chat-message {
                display: flex;
                gap: 0.75rem;
                max-width: 85%;
            }

            .chat-message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

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

            .chat-message.user .message-avatar {
                background: #dbeafe;
            }

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

            .message-text {
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .message-time {
                font-size: 0.7rem;
                color: #9ca3af;
                margin-top: 0.5rem;
            }

            .chat-message.user .message-time {
                color: rgba(255,255,255,0.7);
            }

            .message-attachments {
                margin-top: 0.5rem;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .attachment {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
                font-size: 0.8rem;
            }

            .message-results {
                margin-top: 1rem;
                padding: 1rem;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .results-summary {
                display: flex;
                gap: 1.5rem;
                margin-bottom: 1rem;
            }

            .result-item {
                display: flex;
                flex-direction: column;
            }

            .result-number {
                font-size: 1.5rem;
                font-weight: 600;
                color: #3b82f6;
            }

            .result-label {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .view-details-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
            }

            .view-details-btn:hover {
                background: #2563eb;
            }

            /* Typing indicator */
            .typing-dots {
                display: flex;
                gap: 4px;
            }

            .typing-dots span {
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            /* Chat input */
            .chat-input-area {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
            }

            .input-wrapper {
                display: flex;
                gap: 0.5rem;
                align-items: flex-end;
            }

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

            .input-wrapper textarea:focus {
                outline: none;
                border-color: #3b82f6;
            }

            .send-btn {
                padding: 0.75rem 1.25rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .send-btn:hover:not(:disabled) {
                background: #2563eb;
            }

            .send-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            /* Results panel */
            .agent-results {
                background: white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                position: fixed;
                right: 1rem;
                top: 80px;
                bottom: 80px;
                width: 350px;
                box-shadow: -4px 0 12px rgba(0,0,0,0.1);
                z-index: 100;
            }

            .results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .results-header h3 {
                margin: 0;
                font-size: 1rem;
            }

            .close-results {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #9ca3af;
                cursor: pointer;
            }

            .results-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .result-group {
                margin-bottom: 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }

            .result-group.unmatched {
                border-color: #fbbf24;
                background: #fffbeb;
            }

            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
            }

            .result-group.unmatched .group-header {
                background: #fef3c7;
            }

            .group-name {
                font-weight: 500;
                font-size: 0.85rem;
            }

            .group-count {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .group-tools {
                padding: 0.5rem;
            }

            .tool-item {
                display: flex;
                gap: 0.5rem;
                padding: 0.5rem;
                font-size: 0.8rem;
                border-bottom: 1px solid #f3f4f6;
            }

            .tool-item:last-child {
                border-bottom: none;
            }

            .tool-number {
                color: #3b82f6;
                font-family: monospace;
                min-width: 80px;
            }

            .tool-name {
                color: #4b5563;
            }

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

            .agent-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .agent-btn.primary:hover {
                background: #2563eb;
            }

            .agent-btn.secondary {
                background: #f3f4f6;
                color: #4b5563;
            }

            .agent-btn.secondary:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentInventurPage = new AgentInventurPage();
