// ORCA 2.0 - ABL Agent (Abnahmebereitschaftserklärung) - Erweitert
class AgentABLPage {
    constructor() {
        this.messages = [];
        this.currentStep = 'start';
        this.tools = []; // Mehrere Werkzeuge pro ABL
        this.currentTool = null;
        this.ablData = {
            // Bestellbezug
            supplier: null,
            owner: null,
            purchaseOrder: null,
            wet: null,
            project: null,
            commodity: null,
            department: null,
            recipient: null,
            location: null,
            // Weitere Angaben
            vatId: null,
            comment: null,
            // Meta
            createdAt: null,
            status: 'draft'
        };

        // Schritt-Definitionen mit Skip-Option
        this.steps = [
            { id: 'supplier', label: 'Lieferant', required: true },
            { id: 'owner', label: 'Auftraggeber', required: false },
            { id: 'purchaseOrder', label: 'Bestellnummer', required: false },
            { id: 'wet', label: 'WET-Datum', required: false },
            { id: 'project', label: 'Projekt', required: false },
            { id: 'location', label: 'Standort', required: false },
            { id: 'recipient', label: 'Empfänger', required: false },
            { id: 'tool_number', label: 'Werkzeugnummer', required: true },
            { id: 'inventory_photo', label: 'Inventarschild', required: false },
            { id: 'tool_photo', label: 'Werkzeugfoto', required: false },
            { id: 'dimensions', label: 'Maße', required: false },
            { id: 'vat_comment', label: 'USt-ID & Kommentar', required: false },
            { id: 'more_tools', label: 'Weitere Werkzeuge', required: false },
            { id: 'summary', label: 'Zusammenfassung', required: true }
        ];
        this.currentStepIndex = 0;
    }

    render() {
        const app = document.getElementById('app');

        // Reset state bei jedem neuen Besuch
        this.messages = [];
        this.currentStep = 'start';
        this.currentStepIndex = 0;
        this.tools = [];
        this.currentTool = this.createEmptyTool();
        this.ablData = {
            supplier: null,
            owner: null,
            purchaseOrder: null,
            wet: null,
            project: null,
            commodity: null,
            department: null,
            recipient: null,
            location: null,
            vatId: null,
            comment: null,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - ABL-Agent';
        document.getElementById('headerSubtitle').textContent = 'Abnahmebereitschaftserklärung erstellen';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container agent-abl-page">
                <div class="agent-layout-simple">
                    <div class="agent-chat-full">
                        <div class="chat-header">
                            <div class="chat-title">
                                <span class="chat-icon">📦</span>
                                <div>
                                    <h3>ABL-Assistent</h3>
                                    <span class="chat-subtitle">Schritt für Schritt zur Abnahmebereitschaft</span>
                                </div>
                            </div>
                            <div class="abl-tools-count" id="toolsCount">
                                <span class="tools-badge">0 Werkzeuge</span>
                            </div>
                        </div>
                        <div class="abl-progress-bar" id="ablProgressBar">
                            <div class="progress-fill" style="width: 0%"></div>
                            <span class="progress-text">Schritt 1 von ${this.steps.length}</span>
                        </div>
                        <div class="chat-messages" id="chatMessages">
                            <!-- Messages will be rendered here -->
                        </div>
                        <div class="chat-input-area" id="chatInputArea">
                            <!-- Dynamic input area -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
        this.showGreeting();
    }

    createEmptyTool() {
        return {
            number: null,
            name: null,
            inventoryPhoto: null,
            toolPhoto: null,
            width: null,
            length: null,
            height: null,
            weight: null,
            material: null
        };
    }

    showGreeting() {
        this.addAssistantMessage(
            `Willkommen beim ABL-Assistenten! 📦

Ich helfe Ihnen, eine **Abnahmebereitschaftserklärung** zu erstellen.

**Der Prozess umfasst:**
1. Bestellbezug (Lieferant, Auftraggeber, PO)
2. Werkzeugdaten (Nummer, Fotos, Maße)
3. Weitere Angaben

💡 **Tipp:** Sie können jeden optionalen Schritt überspringen.

**Beginnen wir mit dem Lieferanten:**`,
            { inputType: 'supplier' }
        );
        this.currentStep = 'supplier';
        this.currentStepIndex = 0;
        this.updateProgress();
        this.updateInputArea();
    }

    addAssistantMessage(content, options = null) {
        this.messages.push({
            role: 'assistant',
            content: content,
            timestamp: new Date(),
            options: options
        });
        this.renderMessages();
    }

    addUserMessage(content, attachment = null) {
        this.messages.push({
            role: 'user',
            content: content,
            timestamp: new Date(),
            attachment: attachment
        });
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

        let attachmentHtml = '';
        if (msg.attachment) {
            if (msg.attachment.type === 'image') {
                attachmentHtml = `
                    <div class="message-attachment">
                        <img src="${msg.attachment.data}" alt="Foto" style="max-width: 200px; border-radius: 8px;">
                    </div>
                `;
            }
        }

        let contentHtml = msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        return `
            <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                <div class="message-avatar">
                    ${isUser ? '👤' : '📦'}
                </div>
                <div class="message-content">
                    <div class="message-text">${contentHtml}</div>
                    ${attachmentHtml}
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    }

    updateProgress() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const toolsCount = document.getElementById('toolsCount');

        if (progressBar && progressText) {
            const percent = ((this.currentStepIndex + 1) / this.steps.length) * 100;
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `Schritt ${this.currentStepIndex + 1} von ${this.steps.length}`;
        }

        if (toolsCount) {
            const count = this.tools.length;
            toolsCount.innerHTML = `<span class="tools-badge">${count} Werkzeug${count !== 1 ? 'e' : ''}</span>`;
        }
    }

    updateInputArea() {
        const inputArea = document.getElementById('chatInputArea');
        if (!inputArea) return;

        const step = this.steps[this.currentStepIndex];
        const canSkip = step && !step.required;

        switch (this.currentStep) {
            case 'supplier':
                inputArea.innerHTML = this.getSupplierInputHtml();
                break;
            case 'owner':
                inputArea.innerHTML = this.getTextInputWithSkip('Auftraggeber eingeben...', 'z.B. BMW AG', canSkip);
                break;
            case 'purchaseOrder':
                inputArea.innerHTML = this.getTextInputWithSkip('Bestellnummer eingeben...', 'z.B. PO-2025-001234', canSkip);
                break;
            case 'wet':
                inputArea.innerHTML = this.getDateInputHtml('WET-Datum', canSkip);
                break;
            case 'project':
                inputArea.innerHTML = this.getTextInputWithSkip('Projekt eingeben...', 'z.B. G70, U11', canSkip);
                break;
            case 'location':
                inputArea.innerHTML = this.getLocationInputHtml(canSkip);
                break;
            case 'recipient':
                inputArea.innerHTML = this.getTextInputWithSkip('Empfänger beim Lieferanten...', 'Name oder E-Mail', canSkip);
                break;
            case 'tool_number':
                inputArea.innerHTML = this.getTextInputWithSkip('Inventarnummer eingeben...', 'z.B. 0010120920', false);
                break;
            case 'inventory_photo':
            case 'tool_photo':
                inputArea.innerHTML = this.getPhotoInputHtml(
                    this.currentStep === 'inventory_photo' ? 'Inventarschild fotografieren' : 'Werkzeug fotografieren',
                    this.currentStep,
                    canSkip
                );
                break;
            case 'dimensions':
                inputArea.innerHTML = this.getDimensionsInputHtml(canSkip);
                break;
            case 'vat_comment':
                inputArea.innerHTML = this.getVatCommentInputHtml(canSkip);
                break;
            case 'more_tools':
                inputArea.innerHTML = this.getMoreToolsInputHtml();
                break;
            case 'summary':
                inputArea.innerHTML = this.getSummaryActionsHtml();
                break;
            case 'complete':
                inputArea.innerHTML = '<div class="input-complete">✓ ABL im Vorrat gespeichert</div>';
                break;
        }

        this.reattachInputListeners();
    }

    getSupplierInputHtml() {
        // Mock supplier list - in real app from API
        const suppliers = [
            'FAURECIA', 'BENTELER', 'GESTAMP', 'KIRCHHOFF', 'MAGNA',
            'PLASTIC OMNIUM', 'VALEO', 'CONTINENTAL', 'BOSCH'
        ];

        return `
            <div class="supplier-input">
                <select id="supplierSelect" class="abl-select">
                    <option value="">-- Lieferant auswählen --</option>
                    ${suppliers.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <div class="input-or">oder</div>
                <div class="input-container">
                    <input type="text" id="chatInput" placeholder="Anderen Lieferanten eingeben..." autocomplete="off">
                    <button class="send-btn" id="sendBtn">Weiter →</button>
                </div>
            </div>
        `;
    }

    getTextInputWithSkip(placeholder, hint, canSkip) {
        return `
            <div class="input-with-skip">
                <div class="input-container">
                    <input type="text" id="chatInput" placeholder="${placeholder}" autocomplete="off">
                    <button class="send-btn" id="sendBtn">Weiter →</button>
                </div>
                <div class="input-hint">${hint}</div>
                ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen →</button>' : ''}
            </div>
        `;
    }

    getDateInputHtml(label, canSkip) {
        return `
            <div class="date-input">
                <div class="input-container">
                    <input type="date" id="dateInput" class="abl-date-input">
                    <button class="send-btn" id="sendDateBtn">Weiter →</button>
                </div>
                <div class="input-hint">${label}</div>
                ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen →</button>' : ''}
            </div>
        `;
    }

    getLocationInputHtml(canSkip) {
        const locations = [
            'Hunedoara (RO)', 'Zrenjanin (RS)', 'Györ (HU)', 'Gyál (HU)',
            'Hornstein (AT)', 'Braunau (AT)', 'Bad Salzuflen (DE)',
            'Stahringen (DE)', 'Dornstetten (DE)', 'Coburg (DE)',
            'Sousse (TN)', 'Balti (MD)', 'Chemor/Ipoh (MY)'
        ];

        return `
            <div class="location-input">
                <select id="locationSelect" class="abl-select">
                    <option value="">-- Standort auswählen --</option>
                    ${locations.map(l => `<option value="${l}">${l}</option>`).join('')}
                </select>
                <div class="input-or">oder</div>
                <div class="input-container">
                    <input type="text" id="chatInput" placeholder="Anderen Standort eingeben..." autocomplete="off">
                    <button class="send-btn" id="sendBtn">Weiter →</button>
                </div>
                ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen →</button>' : ''}
            </div>
        `;
    }

    getPhotoInputHtml(label, fieldName, canSkip) {
        return `
            <div class="photo-upload-container">
                <input type="file" id="photoInput" accept="image/*" capture="environment" style="display: none;" data-field="${fieldName}">
                <div class="photo-upload-box" id="photoUploadBox">
                    <div class="upload-icon">📷</div>
                    <div class="upload-label">${label}</div>
                    <div class="upload-hint">Klicken oder Datei hierher ziehen</div>
                </div>
                ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen →</button>' : ''}
            </div>
        `;
    }

    getDimensionsInputHtml(canSkip) {
        return `
            <div class="dimensions-input">
                <div class="dimensions-grid">
                    <div class="dim-field">
                        <label>Breite</label>
                        <input type="number" id="dimWidth" placeholder="mm">
                    </div>
                    <div class="dim-field">
                        <label>Länge</label>
                        <input type="number" id="dimLength" placeholder="mm">
                    </div>
                    <div class="dim-field">
                        <label>Höhe</label>
                        <input type="number" id="dimHeight" placeholder="mm">
                    </div>
                    <div class="dim-field">
                        <label>Gewicht</label>
                        <input type="number" id="dimWeight" placeholder="kg">
                    </div>
                    <div class="dim-field wide">
                        <label>Material</label>
                        <input type="text" id="dimMaterial" placeholder="z.B. Stahl, Aluminium">
                    </div>
                </div>
                <div class="dim-actions">
                    <button class="send-btn" id="sendDimensionsBtn">Weiter →</button>
                    ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen</button>' : ''}
                </div>
            </div>
        `;
    }

    getVatCommentInputHtml(canSkip) {
        return `
            <div class="vat-comment-input">
                <div class="form-field">
                    <label>Umsatzsteuer-ID (optional)</label>
                    <input type="text" id="vatInput" placeholder="z.B. DE123456789">
                </div>
                <div class="form-field">
                    <label>Kommentar (optional)</label>
                    <textarea id="commentInput" rows="3" placeholder="Zusätzliche Anmerkungen..."></textarea>
                </div>
                <div class="form-actions">
                    <button class="send-btn" id="sendVatCommentBtn">Weiter →</button>
                    ${canSkip ? '<button class="skip-btn" id="skipBtn">Überspringen</button>' : ''}
                </div>
            </div>
        `;
    }

    getMoreToolsInputHtml() {
        return `
            <div class="more-tools-input">
                <p class="more-tools-info">Sie haben <strong>${this.tools.length} Werkzeug${this.tools.length !== 1 ? 'e' : ''}</strong> erfasst.</p>
                <div class="more-tools-actions">
                    <button class="add-tool-btn" id="addToolBtn">
                        ➕ Weiteres Werkzeug hinzufügen
                    </button>
                    <button class="finish-btn" id="finishToolsBtn">
                        ✓ Fertig - zur Zusammenfassung
                    </button>
                </div>
            </div>
        `;
    }

    getSummaryActionsHtml() {
        const isComplete = this.checkCompleteness();
        return `
            <div class="summary-actions">
                ${isComplete ? `
                    <button class="send-abl-btn" id="sendAblBtn">
                        📤 ABL an OEM senden
                    </button>
                ` : `
                    <div class="incomplete-warning">
                        ⚠️ ABL unvollständig - kann nicht gesendet werden
                    </div>
                `}
                <button class="save-draft-btn" id="saveDraftBtn">
                    💾 Im Vorrat speichern
                </button>
                <button class="edit-btn" id="editAblBtn">
                    ✏️ Bearbeiten
                </button>
            </div>
        `;
    }

    checkCompleteness() {
        // Für Versand müssen alle Daten gefüllt sein
        if (!this.ablData.supplier) return false;
        if (!this.ablData.owner) return false;
        if (!this.ablData.purchaseOrder) return false;
        if (!this.ablData.location) return false;
        if (this.tools.length === 0) return false;

        for (const tool of this.tools) {
            if (!tool.number) return false;
            if (!tool.inventoryPhoto) return false;
            if (!tool.toolPhoto) return false;
        }

        return true;
    }

    reattachInputListeners() {
        // Text input + Send button
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        if (input && sendBtn) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleUserInput();
            });
            sendBtn.addEventListener('click', () => this.handleUserInput());
        }

        // Supplier select
        const supplierSelect = document.getElementById('supplierSelect');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.processSupplier(e.target.value);
                }
            });
        }

        // Location select
        const locationSelect = document.getElementById('locationSelect');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.processLocation(e.target.value);
                }
            });
        }

        // Date input
        const dateInput = document.getElementById('dateInput');
        const sendDateBtn = document.getElementById('sendDateBtn');
        if (dateInput && sendDateBtn) {
            sendDateBtn.addEventListener('click', () => {
                if (dateInput.value) {
                    this.processDate(dateInput.value);
                }
            });
        }

        // Skip button
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipStep());
        }

        // Photo input
        const photoInput = document.getElementById('photoInput');
        const photoBox = document.getElementById('photoUploadBox');
        if (photoInput && photoBox) {
            photoBox.addEventListener('click', () => photoInput.click());
            photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));

            photoBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoBox.classList.add('dragover');
            });
            photoBox.addEventListener('dragleave', () => {
                photoBox.classList.remove('dragover');
            });
            photoBox.addEventListener('drop', (e) => {
                e.preventDefault();
                photoBox.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handlePhotoFile(e.dataTransfer.files[0], photoInput.dataset.field);
                }
            });
        }

        // Dimensions
        const sendDimensionsBtn = document.getElementById('sendDimensionsBtn');
        if (sendDimensionsBtn) {
            sendDimensionsBtn.addEventListener('click', () => this.processDimensions());
        }

        // VAT & Comment
        const sendVatCommentBtn = document.getElementById('sendVatCommentBtn');
        if (sendVatCommentBtn) {
            sendVatCommentBtn.addEventListener('click', () => this.processVatComment());
        }

        // More tools
        const addToolBtn = document.getElementById('addToolBtn');
        const finishToolsBtn = document.getElementById('finishToolsBtn');
        if (addToolBtn) {
            addToolBtn.addEventListener('click', () => this.addAnotherTool());
        }
        if (finishToolsBtn) {
            finishToolsBtn.addEventListener('click', () => this.showSummary());
        }

        // Summary actions
        const sendAblBtn = document.getElementById('sendAblBtn');
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const editAblBtn = document.getElementById('editAblBtn');

        if (sendAblBtn) {
            sendAblBtn.addEventListener('click', () => this.sendABL());
        }
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveAsDraft());
        }
        if (editAblBtn) {
            editAblBtn.addEventListener('click', () => this.render());
        }
    }

    handleUserInput() {
        const input = document.getElementById('chatInput');
        const value = input?.value?.trim();
        if (!value) return;

        this.addUserMessage(value);
        input.value = '';

        this.processCurrentStep(value);
    }

    processCurrentStep(value) {
        switch (this.currentStep) {
            case 'supplier':
                this.processSupplier(value);
                break;
            case 'owner':
                this.processOwner(value);
                break;
            case 'purchaseOrder':
                this.processPurchaseOrder(value);
                break;
            case 'project':
                this.processProject(value);
                break;
            case 'location':
                this.processLocation(value);
                break;
            case 'recipient':
                this.processRecipient(value);
                break;
            case 'tool_number':
                this.processToolNumber(value);
                break;
        }
    }

    skipStep() {
        this.addUserMessage('Übersprungen');
        this.nextStep();
    }

    nextStep() {
        this.currentStepIndex++;
        if (this.currentStepIndex >= this.steps.length) {
            this.showSummary();
            return;
        }

        const nextStepDef = this.steps[this.currentStepIndex];
        this.currentStep = nextStepDef.id;
        this.updateProgress();
        this.showStepPrompt();
    }

    showStepPrompt() {
        const prompts = {
            supplier: 'Bitte wählen Sie den **Lieferanten** aus:',
            owner: 'Wer ist der **Auftraggeber** (OEM)?',
            purchaseOrder: 'Wie lautet die **Bestellnummer** (Purchase Order)?',
            wet: 'Wann ist das **WET-Datum** (Werkzeugerstmustertermin)?',
            project: 'Zu welchem **Projekt** gehört das Werkzeug?',
            location: 'An welchem **Standort** befindet sich das Werkzeug?',
            recipient: 'Wer ist der **Empfänger** der ABL beim Lieferanten?',
            tool_number: `Werkzeug ${this.tools.length + 1}: Bitte geben Sie die **Inventarnummer** ein:`,
            inventory_photo: 'Bitte laden Sie ein **Foto des Inventarschilds** hoch:',
            tool_photo: 'Bitte laden Sie ein **Foto des Gesamtwerkzeugs** hoch:',
            dimensions: 'Geben Sie die **Maße und das Gewicht** des Werkzeugs ein:',
            vat_comment: 'Möchten Sie eine **USt-ID** oder einen **Kommentar** hinzufügen?',
            more_tools: 'Möchten Sie **weitere Werkzeuge** zur ABL hinzufügen?',
            summary: 'Zusammenfassung'
        };

        const prompt = prompts[this.currentStep] || 'Weiter zum nächsten Schritt:';
        this.addAssistantMessage(prompt);
        this.updateInputArea();
    }

    // Processing functions for each step
    processSupplier(value) {
        this.ablData.supplier = value;
        this.addAssistantMessage(`✓ Lieferant: **${value}**`);
        this.nextStep();
    }

    processOwner(value) {
        this.ablData.owner = value;
        this.addAssistantMessage(`✓ Auftraggeber: **${value}**`);
        this.nextStep();
    }

    processPurchaseOrder(value) {
        this.ablData.purchaseOrder = value;
        this.addAssistantMessage(`✓ Bestellnummer: **${value}**`);
        this.nextStep();
    }

    processDate(value) {
        this.ablData.wet = value;
        const formatted = new Date(value).toLocaleDateString('de-DE');
        this.addUserMessage(formatted);
        this.addAssistantMessage(`✓ WET-Datum: **${formatted}**`);
        this.nextStep();
    }

    processProject(value) {
        this.ablData.project = value;
        this.addAssistantMessage(`✓ Projekt: **${value}**`);
        this.nextStep();
    }

    processLocation(value) {
        this.ablData.location = value;
        this.addAssistantMessage(`✓ Standort: **${value}**`);
        this.nextStep();
    }

    processRecipient(value) {
        this.ablData.recipient = value;
        this.addAssistantMessage(`✓ Empfänger: **${value}**`);
        this.nextStep();
    }

    processToolNumber(value) {
        const cleanNumber = value.replace(/\s/g, '');

        if (!/^\d{7,10}$/.test(cleanNumber)) {
            this.addAssistantMessage(
                `Die Nummer **${value}** scheint nicht korrekt zu sein.
Bitte geben Sie eine gültige Inventarnummer ein (7-10 Ziffern).`
            );
            return;
        }

        let normalized = cleanNumber;
        if (cleanNumber.length < 10) {
            normalized = cleanNumber.padStart(10, '0');
        }

        this.currentTool.number = normalized;
        this.currentTool.name = this.mockGetToolName(normalized);

        this.addAssistantMessage(
            `✓ Werkzeug erkannt:
**Inventarnummer:** ${normalized}
**Bezeichnung:** ${this.currentTool.name}`
        );
        this.nextStep();
    }

    mockGetToolName(number) {
        if (number.startsWith('001')) return 'Spritzgießwerkzeug';
        if (number.startsWith('901')) return 'Schäumform';
        if (number.startsWith('100')) return 'Presswerkzeug';
        return 'Fertigungsmittel';
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        const fieldName = event.target.dataset.field;
        if (file) {
            this.handlePhotoFile(file, fieldName);
        }
    }

    handlePhotoFile(file, fieldName) {
        if (!file.type.startsWith('image/')) {
            this.addAssistantMessage('Bitte laden Sie eine Bilddatei hoch (JPG, PNG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;

            if (fieldName === 'inventory_photo') {
                this.currentTool.inventoryPhoto = imageData;
                this.addUserMessage('Inventarschild hochgeladen', { type: 'image', data: imageData });
                this.addAssistantMessage('✓ Inventarschild-Foto erhalten');
            } else if (fieldName === 'tool_photo') {
                this.currentTool.toolPhoto = imageData;
                this.addUserMessage('Werkzeugfoto hochgeladen', { type: 'image', data: imageData });
                this.addAssistantMessage('✓ Werkzeug-Foto erhalten');
            }

            this.nextStep();
        };
        reader.readAsDataURL(file);
    }

    processDimensions() {
        const width = document.getElementById('dimWidth')?.value;
        const length = document.getElementById('dimLength')?.value;
        const height = document.getElementById('dimHeight')?.value;
        const weight = document.getElementById('dimWeight')?.value;
        const material = document.getElementById('dimMaterial')?.value;

        if (width) this.currentTool.width = parseInt(width);
        if (length) this.currentTool.length = parseInt(length);
        if (height) this.currentTool.height = parseInt(height);
        if (weight) this.currentTool.weight = parseInt(weight);
        if (material) this.currentTool.material = material;

        let summary = '✓ Maße erfasst:';
        if (width || length || height) {
            summary += `\n• Abmessungen: ${width || '-'} × ${length || '-'} × ${height || '-'} mm`;
        }
        if (weight) summary += `\n• Gewicht: ${weight} kg`;
        if (material) summary += `\n• Material: ${material}`;

        this.addUserMessage(`${width || '-'} × ${length || '-'} × ${height || '-'} mm, ${weight || '-'} kg`);
        this.addAssistantMessage(summary);
        this.nextStep();
    }

    processVatComment() {
        const vatId = document.getElementById('vatInput')?.value?.trim();
        const comment = document.getElementById('commentInput')?.value?.trim();

        if (vatId) this.ablData.vatId = vatId;
        if (comment) this.ablData.comment = comment;

        let summary = '✓ Weitere Angaben:';
        if (vatId) summary += `\n• USt-ID: ${vatId}`;
        if (comment) summary += `\n• Kommentar: ${comment}`;

        if (!vatId && !comment) {
            this.addUserMessage('Keine Angaben');
            summary = '✓ Keine weiteren Angaben';
        } else {
            this.addUserMessage(vatId || comment || '');
        }

        this.addAssistantMessage(summary);

        // Tool fertig - in Liste aufnehmen
        this.tools.push({ ...this.currentTool });
        this.updateProgress();
        this.nextStep();
    }

    addAnotherTool() {
        this.currentTool = this.createEmptyTool();
        // Zurück zum Werkzeug-Nummer Schritt
        this.currentStepIndex = this.steps.findIndex(s => s.id === 'tool_number');
        this.currentStep = 'tool_number';
        this.updateProgress();
        this.showStepPrompt();
    }

    showSummary() {
        this.currentStep = 'summary';
        this.currentStepIndex = this.steps.length - 1;
        this.updateProgress();

        const isComplete = this.checkCompleteness();

        let summary = `📋 **Zusammenfassung der ABL**

**Bestellbezug:**
• Lieferant: ${this.ablData.supplier || '—'}
• Auftraggeber: ${this.ablData.owner || '—'}
• Bestellnummer: ${this.ablData.purchaseOrder || '—'}
• WET: ${this.ablData.wet ? new Date(this.ablData.wet).toLocaleDateString('de-DE') : '—'}
• Projekt: ${this.ablData.project || '—'}
• Standort: ${this.ablData.location || '—'}
• Empfänger: ${this.ablData.recipient || '—'}

**Werkzeuge (${this.tools.length}):**`;

        this.tools.forEach((tool, i) => {
            summary += `
${i + 1}. **${tool.number}** - ${tool.name}
   • Inventarschild: ${tool.inventoryPhoto ? '✓' : '—'}
   • Werkzeugfoto: ${tool.toolPhoto ? '✓' : '—'}
   • Maße: ${tool.width || '-'} × ${tool.length || '-'} × ${tool.height || '-'} mm
   • Gewicht: ${tool.weight ? tool.weight + ' kg' : '—'}
   • Material: ${tool.material || '—'}`;
        });

        if (this.ablData.vatId || this.ablData.comment) {
            summary += `

**Weitere Angaben:**`;
            if (this.ablData.vatId) summary += `\n• USt-ID: ${this.ablData.vatId}`;
            if (this.ablData.comment) summary += `\n• Kommentar: ${this.ablData.comment}`;
        }

        summary += `

**Status:** ${isComplete ? '✅ Vollständig - kann gesendet werden' : '⚠️ Unvollständig'}`;

        this.addAssistantMessage(summary);
        this.updateInputArea();
    }

    sendABL() {
        this.ablData.status = 'sent';
        this.ablData.sentAt = new Date().toISOString();
        this.saveToStorage();

        this.addAssistantMessage(
            `📤 **ABL erfolgreich gesendet!**

Die Abnahmebereitschaftserklärung wurde an den OEM übermittelt.
Status: **Versendet**

Sie werden zur ABL-Übersicht weitergeleitet...`
        );

        this.currentStep = 'complete';
        this.updateInputArea();

        setTimeout(() => {
            router.navigate('/abl');
        }, 2500);
    }

    saveAsDraft() {
        this.ablData.status = 'draft';
        this.saveToStorage();

        this.addAssistantMessage(
            `💾 **ABL im Vorrat gespeichert!**

Die ABL wurde als Entwurf gespeichert und kann später vervollständigt werden.
Status: **Im Vorrat**

Sie werden zur ABL-Übersicht weitergeleitet...`
        );

        this.currentStep = 'complete';
        this.updateInputArea();

        setTimeout(() => {
            router.navigate('/abl');
        }, 2500);
    }

    saveToStorage() {
        const ablRecord = {
            id: `ABL-${Date.now()}`,
            ...this.ablData,
            tools: this.tools,
            toolCount: this.tools.length,
            primaryToolNumber: this.tools[0]?.number || null,
            createdAt: this.ablData.createdAt || new Date().toISOString()
        };

        const existingABLs = JSON.parse(localStorage.getItem('pending_abls') || '[]');
        existingABLs.push(ablRecord);
        localStorage.setItem('pending_abls', JSON.stringify(existingABLs));
    }

    attachEventListeners() {
        this.reattachInputListeners();
    }

    addStyles() {
        if (document.getElementById('agent-abl-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-abl-styles';
        styles.textContent = `
            .agent-abl-page {
                height: calc(100vh - 140px);
                padding: 1rem;
            }

            .agent-layout-simple {
                height: 100%;
                max-width: 800px;
                margin: 0 auto;
            }

            .agent-chat-full {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, #2c4a8c 0%, #1e3a6d 100%);
                color: white;
            }

            .chat-title {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .chat-icon { font-size: 1.5rem; }
            .chat-title h3 { margin: 0; font-size: 1.1rem; }
            .chat-subtitle { font-size: 0.8rem; opacity: 0.85; }

            .tools-badge {
                background: rgba(255,255,255,0.2);
                padding: 0.35rem 0.75rem;
                border-radius: 12px;
                font-size: 0.8rem;
            }

            .abl-progress-bar {
                background: #e5e7eb;
                height: 6px;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #f97316, #22c55e);
                transition: width 0.3s ease;
            }

            .progress-text {
                position: absolute;
                right: 10px;
                top: 8px;
                font-size: 0.7rem;
                color: #6b7280;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
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
                flex-direction: row-reverse;
                align-self: flex-end;
            }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                flex-shrink: 0;
            }

            .chat-message.user .message-avatar { background: #dbeafe; }

            .message-content {
                background: #f8fafc;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                border-top-left-radius: 4px;
            }

            .chat-message.user .message-content {
                background: #2c4a8c;
                color: white;
                border-top-left-radius: 12px;
                border-top-right-radius: 4px;
            }

            .message-text { font-size: 0.9rem; line-height: 1.5; }
            .message-attachment { margin-top: 0.5rem; }
            .message-time { font-size: 0.7rem; color: #9ca3af; margin-top: 0.25rem; }
            .chat-message.user .message-time { color: rgba(255,255,255,0.7); }

            .chat-input-area {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
            }

            .input-container {
                display: flex;
                gap: 0.5rem;
            }

            .input-container input,
            .abl-select,
            .abl-date-input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.9rem;
            }

            .input-container input:focus,
            .abl-select:focus {
                outline: none;
                border-color: #2c4a8c;
            }

            .input-or {
                text-align: center;
                color: #9ca3af;
                font-size: 0.85rem;
                margin: 0.5rem 0;
            }

            .send-btn {
                padding: 0.75rem 1.25rem;
                background: linear-gradient(135deg, #2c4a8c 0%, #1e3a6d 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .send-btn:hover { transform: translateY(-1px); }

            .skip-btn {
                display: block;
                width: 100%;
                margin-top: 0.75rem;
                padding: 0.6rem;
                background: transparent;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                color: #6b7280;
                cursor: pointer;
                font-size: 0.85rem;
            }

            .skip-btn:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
            }

            .input-hint {
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.5rem;
            }

            .photo-upload-container { text-align: center; }

            .photo-upload-box {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 2rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .photo-upload-box:hover,
            .photo-upload-box.dragover {
                border-color: #f97316;
                background: #fff7ed;
            }

            .upload-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .upload-label { font-weight: 500; color: #374151; }
            .upload-hint { font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem; }

            .dimensions-input { }

            .dimensions-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .dim-field { display: flex; flex-direction: column; gap: 0.25rem; }
            .dim-field.wide { grid-column: span 2; }
            .dim-field label { font-size: 0.8rem; color: #6b7280; }
            .dim-field input {
                padding: 0.6rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.9rem;
            }

            .dim-actions {
                display: flex;
                gap: 0.5rem;
            }

            .dim-actions .skip-btn {
                margin-top: 0;
                flex: 1;
            }

            .vat-comment-input { }
            .form-field { margin-bottom: 1rem; }
            .form-field label { display: block; font-size: 0.85rem; color: #374151; margin-bottom: 0.35rem; }
            .form-field input,
            .form-field textarea {
                width: 100%;
                padding: 0.6rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.9rem;
                font-family: inherit;
            }

            .form-actions { display: flex; gap: 0.5rem; }
            .form-actions .skip-btn { margin-top: 0; flex: 1; }

            .more-tools-input { text-align: center; }
            .more-tools-info { margin-bottom: 1rem; color: #374151; }

            .more-tools-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .add-tool-btn {
                padding: 0.9rem;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                font-size: 0.95rem;
            }

            .finish-btn {
                padding: 0.9rem;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                font-size: 0.95rem;
            }

            .summary-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .send-abl-btn {
                padding: 1rem;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
            }

            .save-draft-btn {
                padding: 0.85rem;
                background: linear-gradient(135deg, #2c4a8c 0%, #1e3a6d 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
            }

            .edit-btn {
                padding: 0.75rem;
                background: #f3f4f6;
                color: #374151;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }

            .edit-btn:hover { background: #e5e7eb; }

            .incomplete-warning {
                padding: 0.75rem;
                background: #fef3c7;
                color: #92400e;
                border-radius: 8px;
                text-align: center;
                font-size: 0.9rem;
            }

            .input-complete {
                text-align: center;
                padding: 1rem;
                background: #dcfce7;
                border-radius: 8px;
                color: #166534;
                font-weight: 500;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create global instance
const agentABLPage = new AgentABLPage();
