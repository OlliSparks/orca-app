// ORCA 2.0 - Agent: Verlagerung beantragen
// Workflow für die Beantragung einer Werkzeug-Verlagerung

class AgentVerlagerungBeantragenPage {
    constructor() {
        this.messages = [];
        this.currentStep = 'greeting';
        this.tools = []; // Werkzeuge für Verlagerung
        this.currentTool = null;
        this.verlagerungData = {
            bezeichnung: null,
            quellUnternehmen: null,
            quellUnternehmenKey: null,
            quellLand: null,
            quellStadt: null,
            quellStandort: null,
            quellStandortKey: null,
            zielUnternehmen: null,
            zielUnternehmenKey: null,
            zielStandort: null,
            zielStandortKey: null,
            abschlussDatum: null,
            kommentar: null,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };
        this.companyData = null;
        this.locations = [];
        this.targetCompanies = [];
        this.targetLocations = [];
        this.assets = [];
    }

    // Step definitions - Werkzeug zuerst, Standort wird automatisch übernommen
    steps = [
        { id: 'greeting', name: 'Begrüßung' },
        { id: 'tool_selection', name: 'Werkzeug auswählen' },
        { id: 'tool_dimensions', name: 'Maße erfassen' },
        { id: 'more_tools', name: 'Weitere Werkzeuge?' },
        { id: 'bezeichnung', name: 'Bezeichnung' },
        { id: 'target_company', name: 'Ziel-Unternehmen' },
        { id: 'target_location', name: 'Ziel-Standort' },
        { id: 'completion_date', name: 'Abschlussdatum' },
        { id: 'comment', name: 'Kommentar' },
        { id: 'summary', name: 'Zusammenfassung' },
        { id: 'submitted', name: 'Eingereicht' }
    ];

    async render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Verlagerung beantragen';
        document.getElementById('headerSubtitle').textContent = 'Schritt-für-Schritt Antragstellung';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        // Reset state
        this.messages = [];
        this.currentStep = 'greeting';
        this.tools = [];
        this.currentTool = null;
        this.verlagerungData = {
            bezeichnung: null,
            quellUnternehmen: null,
            quellUnternehmenKey: null,
            quellLand: null,
            quellStadt: null,
            quellStandort: null,
            quellStandortKey: null,
            zielUnternehmen: null,
            zielUnternehmenKey: null,
            zielStandort: null,
            zielStandortKey: null,
            abschlussDatum: null,
            kommentar: null,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };

        app.innerHTML = `
            <div class="agent-verlagerung-page">
                <div class="agent-sidebar">
                    <div class="sidebar-header">
                        <span class="sidebar-icon">🚚</span>
                        <h3>Verlagerung beantragen</h3>
                    </div>
                    <div class="progress-steps" id="progressSteps">
                        ${this.renderProgressSteps()}
                    </div>
                    <div class="sidebar-summary" id="sidebarSummary">
                        <h4>Übersicht</h4>
                        <div class="summary-content">
                            <p class="empty-hint">Noch keine Daten erfasst</p>
                        </div>
                    </div>
                </div>
                <div class="agent-main">
                    <div class="chat-container" id="chatContainer">
                        <div class="chat-messages" id="chatMessages"></div>
                    </div>
                    <div class="input-area" id="inputArea"></div>
                </div>
            </div>
        `;

        this.addStyles();

        // Load company data and show greeting
        await this.loadCompanyData();
    }

    renderProgressSteps() {
        const currentIndex = this.steps.findIndex(s => s.id === this.currentStep);
        return this.steps.map((step, index) => {
            let status = 'pending';
            if (index < currentIndex) status = 'completed';
            if (index === currentIndex) status = 'active';
            return `
                <div class="progress-step ${status}">
                    <div class="step-indicator">${status === 'completed' ? '✓' : index + 1}</div>
                    <span class="step-name">${step.name}</span>
                </div>
            `;
        }).join('');
    }

    async loadCompanyData() {
        try {
            // Load company info
            const companyResult = await api.getCompanyBySupplier();
            if (companyResult.success && companyResult.data) {
                this.companyData = companyResult.data;
                this.verlagerungData.quellUnternehmen = companyResult.data.name;
                this.verlagerungData.quellUnternehmenKey = companyResult.companyKey;

                // Load locations
                if (companyResult.companyKey) {
                    const locationsResult = await api.getCompanyLocations(companyResult.companyKey);
                    if (locationsResult.success && locationsResult.data) {
                        this.locations = locationsResult.data;
                    }
                }
            }

            // Load assets
            const assetsResult = await api.getAssets({ limit: 10000 });
            if (assetsResult.success && assetsResult.data) {
                this.assets = assetsResult.data;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }

        this.showGreeting();
    }

    showGreeting() {
        const companyName = this.companyData?.name || 'Ihrem Unternehmen';
        this.addMessage('agent', `Willkommen zum Verlagerungs-Assistenten! 🚚

Ich helfe Ihnen, einen Verlagerungsantrag für Werkzeuge zu erstellen.

**Ihr Unternehmen:** ${companyName}

Der Antrag durchläuft folgende Schritte:
1. Werkzeug(e) für Verlagerung auswählen
2. Maße und Zolltarifnummer prüfen/erfassen
3. Ziel-Standort festlegen
4. Abschlussdatum und Details

Bereit? Dann starten wir mit der Auswahl des Werkzeugs.`);

        this.currentStep = 'tool_selection';
        this.updateProgress();
        this.showToolSelection();
    }

    showSourceLocationSelection() {
        if (this.locations.length === 0) {
            this.addMessage('agent', `Es wurden keine Standorte für Ihr Unternehmen gefunden. Bitte geben Sie den Quell-Standort manuell ein:`);
            this.updateInputArea('text', 'Quell-Standort eingeben...', 'source_location_manual');
            return;
        }

        const locationOptions = this.locations.map(loc => {
            const address = [loc.street, loc.postalCode, loc.city, loc.country].filter(Boolean).join(', ');
            return `<option value="${loc.key}">${loc.title || loc.name} - ${address}</option>`;
        }).join('');

        this.addMessage('agent', `Von welchem Standort soll das Werkzeug verlagert werden?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="select-input-container">
                <select id="locationSelect" class="agent-select">
                    <option value="">Standort auswählen...</option>
                    ${locationOptions}
                </select>
                <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processSourceLocation()">
                    Bestätigen
                </button>
            </div>
        `;

        setTimeout(() => {
            const select = document.getElementById('locationSelect');
            if (select) select.focus();
        }, 100);
    }

    processSourceLocation() {
        const select = document.getElementById('locationSelect');
        const selectedKey = select?.value;

        if (!selectedKey) {
            this.addMessage('system', 'Bitte wählen Sie einen Standort aus.');
            return;
        }

        const location = this.locations.find(l => l.key === selectedKey);
        if (location) {
            this.verlagerungData.quellStandort = location.title || location.name;
            this.verlagerungData.quellStandortKey = location.key;
            this.verlagerungData.quellStadt = location.city;
            this.verlagerungData.quellLand = location.country;

            const address = [location.street, location.postalCode, location.city].filter(Boolean).join(', ');
            this.addMessage('user', `${location.title || location.name} - ${address}`);
            this.addMessage('agent', `✓ Quell-Standort: **${location.title || location.name}**`);

            this.currentStep = 'tool_selection';
            this.updateProgress();
            this.updateSidebar();
            this.showToolSelection();
        }
    }

    showToolSelection() {
        // Show all assets - location will be determined from selection
        let availableAssets = this.assets;

        this.addMessage('agent', `Welches Werkzeug soll verlagert werden?

${availableAssets.length > 0 ? `**${availableAssets.length} Werkzeuge** verfügbar.` : ''}

Geben Sie die **Inventarnummer** ein oder wählen Sie aus der Liste:`);

        const inputArea = document.getElementById('inputArea');

        if (availableAssets.length > 0 && availableAssets.length <= 100) {
            const assetOptions = availableAssets.slice(0, 50).map(asset =>
                `<option value="${asset.inventoryNumber || asset.toolNumber}">${asset.inventoryNumber || asset.toolNumber} - ${asset.name || 'Werkzeug'}</option>`
            ).join('');

            inputArea.innerHTML = `
                <div class="tool-selection-container">
                    <div class="input-with-select">
                        <input type="text" id="toolNumberInput" class="agent-input"
                               placeholder="Inventarnummer eingeben..."
                               onkeypress="if(event.key==='Enter') agentVerlagerungBeantragenPage.processToolNumber()">
                        <span class="input-divider">oder</span>
                        <select id="toolSelect" class="agent-select" onchange="agentVerlagerungBeantragenPage.selectToolFromList()">
                            <option value="">Aus Liste wählen...</option>
                            ${assetOptions}
                        </select>
                    </div>
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processToolNumber()">
                        Werkzeug hinzufügen
                    </button>
                </div>
            `;
        } else {
            inputArea.innerHTML = `
                <div class="simple-input-container">
                    <input type="text" id="toolNumberInput" class="agent-input"
                           placeholder="Inventarnummer eingeben..."
                           onkeypress="if(event.key==='Enter') agentVerlagerungBeantragenPage.processToolNumber()">
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processToolNumber()">
                        Werkzeug hinzufügen
                    </button>
                </div>
            `;
        }

        setTimeout(() => {
            const input = document.getElementById('toolNumberInput');
            if (input) input.focus();
        }, 100);
    }

    selectToolFromList() {
        const select = document.getElementById('toolSelect');
        const input = document.getElementById('toolNumberInput');
        if (select && input && select.value) {
            input.value = select.value;
        }
    }

    async processToolNumber() {
        const input = document.getElementById('toolNumberInput');
        const value = input?.value?.trim();

        if (!value) {
            this.addMessage('system', 'Bitte geben Sie eine Inventarnummer ein.');
            return;
        }

        this.addMessage('user', value);

        // Check if tool exists in assets
        const asset = this.assets.find(a =>
            a.inventoryNumber === value ||
            a.toolNumber === value ||
            a.inventoryNumber?.includes(value)
        );

        // Create tool entry with pre-filled data from asset
        this.currentTool = {
            number: value,
            name: asset?.name || 'Werkzeug',
            assetKey: asset?.key || null,
            gewicht: asset?.weight || asset?.gewicht || null,
            hoehe: asset?.height || asset?.hoehe || null,
            breite: asset?.width || asset?.breite || null,
            laenge: asset?.length || asset?.laenge || null,
            zolltarifnummer: asset?.customsTariffNumber || asset?.zolltarifnummer || null
        };

        if (asset) {
            // Auto-set source location from first tool (if not already set)
            if (!this.verlagerungData.quellStandort && this.tools.length === 0) {
                // Try to get location from asset
                const assetLocation = asset.location || asset.standort;
                const assetLocationKey = asset.locationKey || asset.standortKey;

                if (assetLocation || assetLocationKey) {
                    this.verlagerungData.quellStandort = assetLocation;
                    this.verlagerungData.quellStandortKey = assetLocationKey;

                    // Try to find matching location for more details
                    const loc = this.locations.find(l =>
                        l.key === assetLocationKey ||
                        l.title === assetLocation ||
                        l.name === assetLocation
                    );
                    if (loc) {
                        this.verlagerungData.quellStadt = loc.city;
                        this.verlagerungData.quellLand = loc.country;
                    }
                }
            }

            // Check what data is pre-filled
            const hasData = this.currentTool.gewicht || this.currentTool.hoehe ||
                           this.currentTool.breite || this.currentTool.laenge;

            let locationInfo = '';
            if (asset.location || asset.standort) {
                locationInfo = `\n**Standort:** ${asset.location || asset.standort}`;
            }

            this.addMessage('agent', `✓ Werkzeug gefunden: **${asset.name || value}**${locationInfo}

${hasData ? 'Die vorhandenen Maße wurden übernommen. Bitte prüfen und bestätigen.' : 'Bitte geben Sie die Maße ein.'}`);
        } else {
            this.addMessage('agent', `Werkzeug **${value}** wird hinzugefügt.

Bitte geben Sie die verlagerungsrelevanten Daten ein.`);
        }

        this.currentStep = 'tool_dimensions';
        this.updateProgress();
        this.updateSidebar();
        this.showDimensionsInput();
    }

    showDimensionsInput() {
        const hasPrefilledData = this.currentTool.gewicht || this.currentTool.hoehe ||
                                  this.currentTool.breite || this.currentTool.laenge ||
                                  this.currentTool.zolltarifnummer;

        if (hasPrefilledData) {
            this.addMessage('agent', `Bitte **prüfen und ergänzen** Sie die Maße:

Die vorhandenen Daten wurden übernommen.`);
        } else {
            this.addMessage('agent', `Bitte geben Sie die **Maße und das Gewicht** des Werkzeugs ein:

Diese Daten werden für die Zoll- und Steuerprüfung benötigt.`);
        }

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="dimensions-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Gewicht (kg) *</label>
                        <input type="number" id="gewichtInput" class="agent-input"
                               placeholder="z.B. 1500" step="0.1"
                               value="${this.currentTool.gewicht || ''}"
                               onkeypress="if(event.key==='Enter') document.getElementById('hoeheInput').focus()">
                    </div>
                    <div class="form-group">
                        <label>Höhe (cm) *</label>
                        <input type="number" id="hoeheInput" class="agent-input"
                               placeholder="z.B. 200" step="0.1"
                               value="${this.currentTool.hoehe || ''}"
                               onkeypress="if(event.key==='Enter') document.getElementById('breiteInput').focus()">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Breite (cm) *</label>
                        <input type="number" id="breiteInput" class="agent-input"
                               placeholder="z.B. 150" step="0.1"
                               value="${this.currentTool.breite || ''}"
                               onkeypress="if(event.key==='Enter') document.getElementById('laengeInput').focus()">
                    </div>
                    <div class="form-group">
                        <label>Länge (cm) *</label>
                        <input type="number" id="laengeInput" class="agent-input"
                               placeholder="z.B. 300" step="0.1"
                               value="${this.currentTool.laenge || ''}"
                               onkeypress="if(event.key==='Enter') document.getElementById('zollInput').focus()">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Zolltarifnummer (8-stellig) *</label>
                        <input type="text" id="zollInput" class="agent-input"
                               placeholder="z.B. 84672100" maxlength="8"
                               value="${this.currentTool.zolltarifnummer || ''}"
                               onkeypress="if(event.key==='Enter') agentVerlagerungBeantragenPage.processDimensions()">
                    </div>
                </div>
                <div class="form-actions">
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processDimensions()">
                        Daten bestätigen
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const input = document.getElementById('gewichtInput');
            if (input) input.focus();
        }, 100);
    }

    processDimensions() {
        const gewicht = document.getElementById('gewichtInput')?.value?.trim();
        const hoehe = document.getElementById('hoeheInput')?.value?.trim();
        const breite = document.getElementById('breiteInput')?.value?.trim();
        const laenge = document.getElementById('laengeInput')?.value?.trim();
        const zoll = document.getElementById('zollInput')?.value?.trim();

        // Validation
        if (!gewicht || !hoehe || !breite || !laenge || !zoll) {
            this.addMessage('system', 'Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        if (zoll.length !== 8 || !/^\d+$/.test(zoll)) {
            this.addMessage('system', 'Die Zolltarifnummer muss 8 Ziffern haben.');
            return;
        }

        this.currentTool.gewicht = parseFloat(gewicht);
        this.currentTool.hoehe = parseFloat(hoehe);
        this.currentTool.breite = parseFloat(breite);
        this.currentTool.laenge = parseFloat(laenge);
        this.currentTool.zolltarifnummer = zoll;

        this.addMessage('user', `Gewicht: ${gewicht} kg, Maße: ${laenge}×${breite}×${hoehe} cm, Zoll: ${zoll}`);

        // Add tool to list
        this.tools.push({ ...this.currentTool });

        this.addMessage('agent', `✓ Werkzeug **${this.currentTool.number}** mit allen Daten erfasst.

**Zusammenfassung:**
- Gewicht: ${gewicht} kg
- Maße (L×B×H): ${laenge} × ${breite} × ${hoehe} cm
- Zolltarifnummer: ${zoll}`);

        this.currentTool = null;
        this.currentStep = 'more_tools';
        this.updateProgress();
        this.updateSidebar();
        this.showMoreToolsQuestion();
    }

    showMoreToolsQuestion() {
        const locationInfo = this.verlagerungData.quellStandort
            ? `\n**Quell-Standort:** ${this.verlagerungData.quellStandort}`
            : '';

        this.addMessage('agent', `Möchten Sie **weitere Werkzeuge** zu dieser Verlagerung hinzufügen?

Aktuell: **${this.tools.length} Werkzeug(e)** erfasst.${locationInfo}`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="choice-buttons">
                <button class="agent-btn secondary" onclick="agentVerlagerungBeantragenPage.addMoreTools()">
                    + Weiteres Werkzeug hinzufügen
                </button>
                <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.continueToBezeichnung()">
                    Weiter zur Bezeichnung →
                </button>
            </div>
        `;
    }

    addMoreTools() {
        this.addMessage('user', 'Weiteres Werkzeug hinzufügen');
        this.currentStep = 'tool_selection';
        this.updateProgress();
        this.showToolSelection();
    }

    continueToBezeichnung() {
        this.addMessage('user', 'Weiter zur Bezeichnung');
        this.currentStep = 'bezeichnung';
        this.updateProgress();
        this.showBezeichnungInput();
    }

    showBezeichnungInput() {
        const toolNumbers = this.tools.map(t => t.number).join(', ');
        const sourceLocation = this.verlagerungData.quellStandort || 'noch nicht festgelegt';

        this.addMessage('agent', `Bitte geben Sie eine **aussagekräftige Bezeichnung** für diese Verlagerung ein.

Diese wird für alle Beteiligten sichtbar sein.

**Von:** ${sourceLocation}
**Werkzeuge:** ${toolNumbers}

**Beispiel:** "Verlagerung Presswerkzeug von München nach Regensburg"`);

        this.updateInputArea('text', 'Bezeichnung eingeben...', 'bezeichnung');
    }

    async processBezeichnung(value) {
        if (!value || value.length < 5) {
            this.addMessage('system', 'Bitte geben Sie eine aussagekräftige Bezeichnung ein (mind. 5 Zeichen).');
            return;
        }

        this.verlagerungData.bezeichnung = value;
        this.addMessage('user', value);
        this.addMessage('agent', `✓ Bezeichnung: **${value}**

Jetzt benötige ich das **Ziel** der Verlagerung.`);

        this.currentStep = 'target_company';
        this.updateProgress();
        this.updateSidebar();
        await this.showTargetCompanySelection();
    }

    async showTargetCompanySelection() {
        // For now, use same company (internal relocation) or load other companies
        this.addMessage('agent', `Wohin soll das Werkzeug verlagert werden?

Handelt es sich um eine **interne Verlagerung** (innerhalb Ihres Unternehmens) oder zu einem **anderen Unternehmen**?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="choice-buttons">
                <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.selectInternalRelocation()">
                    🏢 Intern (gleiches Unternehmen)
                </button>
                <button class="agent-btn secondary" onclick="agentVerlagerungBeantragenPage.selectExternalRelocation()">
                    🏭 Extern (anderes Unternehmen)
                </button>
            </div>
        `;
    }

    selectInternalRelocation() {
        this.addMessage('user', 'Interne Verlagerung');
        this.verlagerungData.zielUnternehmen = this.verlagerungData.quellUnternehmen;
        this.verlagerungData.zielUnternehmenKey = this.verlagerungData.quellUnternehmenKey;

        this.addMessage('agent', `✓ Ziel-Unternehmen: **${this.verlagerungData.zielUnternehmen}** (intern)`);

        this.currentStep = 'target_location';
        this.updateProgress();
        this.showTargetLocationSelection();
    }

    async selectExternalRelocation() {
        this.addMessage('user', 'Externe Verlagerung');
        this.addMessage('agent', `Bitte geben Sie den Namen des **Ziel-Unternehmens** ein:`);

        this.updateInputArea('text', 'Ziel-Unternehmen eingeben...', 'target_company_name');
    }

    processTargetCompanyName(value) {
        if (!value) {
            this.addMessage('system', 'Bitte geben Sie ein Ziel-Unternehmen ein.');
            return;
        }

        this.verlagerungData.zielUnternehmen = value;
        this.addMessage('user', value);
        this.addMessage('agent', `✓ Ziel-Unternehmen: **${value}**`);

        this.currentStep = 'target_location';
        this.updateProgress();
        this.updateSidebar();
        this.showTargetLocationSelection();
    }

    showTargetLocationSelection() {
        // If internal, show available locations (excluding source)
        const availableLocations = this.locations.filter(l => l.key !== this.verlagerungData.quellStandortKey);

        if (availableLocations.length > 0 && this.verlagerungData.zielUnternehmenKey === this.verlagerungData.quellUnternehmenKey) {
            const locationOptions = availableLocations.map(loc => {
                const address = [loc.street, loc.postalCode, loc.city, loc.country].filter(Boolean).join(', ');
                return `<option value="${loc.key}">${loc.title || loc.name} - ${address}</option>`;
            }).join('');

            this.addMessage('agent', `Welcher **Ziel-Standort** soll es sein?`);

            const inputArea = document.getElementById('inputArea');
            inputArea.innerHTML = `
                <div class="select-input-container">
                    <select id="targetLocationSelect" class="agent-select">
                        <option value="">Ziel-Standort auswählen...</option>
                        ${locationOptions}
                    </select>
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processTargetLocation()">
                        Bestätigen
                    </button>
                </div>
            `;
        } else {
            this.addMessage('agent', `Bitte geben Sie die **Adresse des Ziel-Standorts** ein:`);
            this.updateInputArea('text', 'Ziel-Adresse eingeben...', 'target_location_manual');
        }
    }

    processTargetLocation() {
        const select = document.getElementById('targetLocationSelect');
        const selectedKey = select?.value;

        if (!selectedKey) {
            this.addMessage('system', 'Bitte wählen Sie einen Ziel-Standort aus.');
            return;
        }

        const location = this.locations.find(l => l.key === selectedKey);
        if (location) {
            this.verlagerungData.zielStandort = location.title || location.name;
            this.verlagerungData.zielStandortKey = location.key;

            const address = [location.street, location.postalCode, location.city].filter(Boolean).join(', ');
            this.addMessage('user', `${location.title || location.name} - ${address}`);
            this.addMessage('agent', `✓ Ziel-Standort: **${location.title || location.name}**`);

            this.currentStep = 'completion_date';
            this.updateProgress();
            this.updateSidebar();
            this.showCompletionDateInput();
        }
    }

    processTargetLocationManual(value) {
        if (!value) {
            this.addMessage('system', 'Bitte geben Sie eine Ziel-Adresse ein.');
            return;
        }

        this.verlagerungData.zielStandort = value;
        this.addMessage('user', value);
        this.addMessage('agent', `✓ Ziel-Standort: **${value}**`);

        this.currentStep = 'completion_date';
        this.updateProgress();
        this.updateSidebar();
        this.showCompletionDateInput();
    }

    showCompletionDateInput() {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        const defaultDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];

        this.addMessage('agent', `Bis wann soll die Verlagerung **abgeschlossen** sein?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="date-input-container">
                <input type="date" id="dateInput" class="agent-input date-input"
                       min="${minDate}" value="${defaultDate}"
                       onkeypress="if(event.key==='Enter') agentVerlagerungBeantragenPage.processCompletionDate()">
                <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processCompletionDate()">
                    Bestätigen
                </button>
            </div>
        `;

        setTimeout(() => {
            const input = document.getElementById('dateInput');
            if (input) input.focus();
        }, 100);
    }

    processCompletionDate() {
        const input = document.getElementById('dateInput');
        const value = input?.value;

        if (!value) {
            this.addMessage('system', 'Bitte wählen Sie ein Datum.');
            return;
        }

        this.verlagerungData.abschlussDatum = value;
        const formattedDate = new Date(value).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        this.addMessage('user', formattedDate);
        this.addMessage('agent', `✓ Abschlussdatum: **${formattedDate}**`);

        this.currentStep = 'comment';
        this.updateProgress();
        this.updateSidebar();
        this.showCommentInput();
    }

    showCommentInput() {
        this.addMessage('agent', `Möchten Sie einen **Kommentar** hinzufügen?

(Optional - z.B. besondere Hinweise zur Verlagerung)`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="comment-input-container">
                <textarea id="commentInput" class="agent-textarea"
                          placeholder="Optionaler Kommentar..." rows="3"></textarea>
                <div class="comment-actions">
                    <button class="agent-btn secondary" onclick="agentVerlagerungBeantragenPage.skipComment()">
                        Überspringen
                    </button>
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processComment()">
                        Weiter zur Zusammenfassung
                    </button>
                </div>
            </div>
        `;
    }

    skipComment() {
        this.addMessage('user', '(kein Kommentar)');
        this.showSummary();
    }

    processComment() {
        const input = document.getElementById('commentInput');
        const value = input?.value?.trim();

        if (value) {
            this.verlagerungData.kommentar = value;
            this.addMessage('user', value);
        } else {
            this.addMessage('user', '(kein Kommentar)');
        }

        this.showSummary();
    }

    showSummary() {
        this.currentStep = 'summary';
        this.updateProgress();

        const toolsList = this.tools.map(t =>
            `- **${t.number}** (${t.name}): ${t.laenge}×${t.breite}×${t.hoehe} cm, ${t.gewicht} kg, Zoll: ${t.zolltarifnummer}`
        ).join('\n');

        const formattedDate = new Date(this.verlagerungData.abschlussDatum).toLocaleDateString('de-DE');

        this.addMessage('agent', `📋 **Zusammenfassung Ihres Verlagerungsantrags:**

**Bezeichnung:** ${this.verlagerungData.bezeichnung}

**Von:** ${this.verlagerungData.quellStandort} (${this.verlagerungData.quellUnternehmen})
**Nach:** ${this.verlagerungData.zielStandort} (${this.verlagerungData.zielUnternehmen})
**Abschlussdatum:** ${formattedDate}

**Werkzeuge (${this.tools.length}):**
${toolsList}

${this.verlagerungData.kommentar ? `**Kommentar:** ${this.verlagerungData.kommentar}` : ''}

---
⚠️ Nach dem Einreichen wird der Antrag automatisch auf **steuerliche Zulässigkeit** geprüft.`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="summary-actions">
                <button class="agent-btn secondary" onclick="agentVerlagerungBeantragenPage.editData()">
                    ✏️ Daten bearbeiten
                </button>
                <button class="agent-btn primary large" onclick="agentVerlagerungBeantragenPage.submitApplication()">
                    🚀 Antrag einreichen
                </button>
            </div>
        `;
    }

    editData() {
        this.addMessage('user', 'Daten bearbeiten');
        this.addMessage('agent', 'Sie können zurück zum Anfang gehen und die Daten erneut eingeben.');

        // Reset and start over
        this.currentStep = 'source_location';
        this.updateProgress();
        this.showSourceLocationSelection();
    }

    async submitApplication() {
        this.addMessage('user', 'Antrag einreichen');

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="submitting-indicator">
                <div class="spinner"></div>
                <span>Antrag wird eingereicht...</span>
            </div>
        `;

        // Simulate API call
        try {
            // Try to create relocation via API
            const result = await api.createRelocation({
                description: this.verlagerungData.bezeichnung,
                sourceLocationKey: this.verlagerungData.quellStandortKey,
                targetLocationKey: this.verlagerungData.zielStandortKey,
                dueDate: this.verlagerungData.abschlussDatum,
                comment: this.verlagerungData.kommentar
            });

            if (result.success) {
                this.verlagerungData.status = 'submitted';
                this.verlagerungData.apiKey = result.data?.key;
            }
        } catch (error) {
            console.error('API error:', error);
        }

        // Save to localStorage
        this.saveToStorage();

        // Create message
        if (typeof messageService !== 'undefined') {
            const toolNumbers = this.tools.map(t => t.number);
            messageService.createOutgoingMessage(
                'verlagerung',
                'Verlagerungsantrag eingereicht',
                `Verlagerung "${this.verlagerungData.bezeichnung}" mit ${this.tools.length} Werkzeug(en) beantragt`,
                toolNumbers,
                {
                    processId: this.verlagerungData.apiKey || `VL-${Date.now()}`,
                    sourceLocation: this.verlagerungData.quellStandort,
                    targetLocation: this.verlagerungData.zielStandort
                }
            );
        }

        this.currentStep = 'submitted';
        this.updateProgress();

        this.addMessage('agent', `✅ **Verlagerungsantrag erfolgreich eingereicht!**

Ihr Antrag wird nun geprüft:
1. 📋 **Dokumentationsprüfung** - Alle Daten vollständig
2. 🔍 **Steuerprüfung** - Automatische Zulässigkeitsbewertung
3. ✅ **Genehmigung** - Bei positivem Ergebnis

Sie werden über den Status in den **Nachrichten** informiert.

Nach Genehmigung können Sie die Verlagerung mit dem **Agent "Verlagerung durchführen"** abschließen.`);

        inputArea.innerHTML = `
            <div class="completion-actions">
                <button class="agent-btn secondary" onclick="router.navigate('/messages')">
                    📬 Zu den Nachrichten
                </button>
                <button class="agent-btn secondary" onclick="router.navigate('/verlagerung')">
                    📋 Zur Verlagerungsübersicht
                </button>
                <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.render()">
                    🚚 Neuen Antrag stellen
                </button>
            </div>
        `;
    }

    saveToStorage() {
        const existingRequests = JSON.parse(localStorage.getItem('pending_verlagerungen') || '[]');

        const requestRecord = {
            id: `VL-${Date.now()}`,
            ...this.verlagerungData,
            tools: this.tools,
            toolCount: this.tools.length
        };

        existingRequests.push(requestRecord);
        localStorage.setItem('pending_verlagerungen', JSON.stringify(existingRequests));
    }

    // Helper methods
    addMessage(type, content) {
        this.messages.push({ type, content, timestamp: new Date() });
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.type}">
                <div class="message-content">${this.formatMessage(msg.content)}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    updateInputArea(type, placeholder, action) {
        const inputArea = document.getElementById('inputArea');

        if (type === 'text') {
            inputArea.innerHTML = `
                <div class="simple-input-container">
                    <input type="text" id="chatInput" class="agent-input"
                           placeholder="${placeholder}"
                           onkeypress="if(event.key==='Enter') agentVerlagerungBeantragenPage.processInput('${action}')">
                    <button class="agent-btn primary" onclick="agentVerlagerungBeantragenPage.processInput('${action}')">
                        Bestätigen
                    </button>
                </div>
            `;
        }

        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    }

    processInput(action) {
        const input = document.getElementById('chatInput');
        const value = input?.value?.trim();

        switch (action) {
            case 'bezeichnung':
                this.processBezeichnung(value);
                break;
            case 'target_company_name':
                this.processTargetCompanyName(value);
                break;
            case 'target_location_manual':
                this.processTargetLocationManual(value);
                break;
            case 'source_location_manual':
                this.verlagerungData.quellStandort = value;
                this.addMessage('user', value);
                this.currentStep = 'tool_selection';
                this.updateProgress();
                this.showToolSelection();
                break;
        }
    }

    updateProgress() {
        const progressEl = document.getElementById('progressSteps');
        if (progressEl) {
            progressEl.innerHTML = this.renderProgressSteps();
        }
    }

    updateSidebar() {
        const summaryEl = document.getElementById('sidebarSummary');
        if (!summaryEl) return;

        const items = [];

        if (this.verlagerungData.quellStandort) {
            items.push(`<div class="summary-item"><span class="label">Von:</span> ${this.verlagerungData.quellStandort}</div>`);
        }
        if (this.verlagerungData.zielStandort) {
            items.push(`<div class="summary-item"><span class="label">Nach:</span> ${this.verlagerungData.zielStandort}</div>`);
        }
        if (this.tools.length > 0) {
            items.push(`<div class="summary-item"><span class="label">Werkzeuge:</span> ${this.tools.length}</div>`);
        }
        if (this.verlagerungData.bezeichnung) {
            items.push(`<div class="summary-item"><span class="label">Bezeichnung:</span> ${this.verlagerungData.bezeichnung}</div>`);
        }
        if (this.verlagerungData.abschlussDatum) {
            const date = new Date(this.verlagerungData.abschlussDatum).toLocaleDateString('de-DE');
            items.push(`<div class="summary-item"><span class="label">Bis:</span> ${date}</div>`);
        }

        summaryEl.innerHTML = `
            <h4>Übersicht</h4>
            <div class="summary-content">
                ${items.length > 0 ? items.join('') : '<p class="empty-hint">Noch keine Daten erfasst</p>'}
            </div>
        `;
    }

    addStyles() {
        if (document.getElementById('agent-verlagerung-beantragen-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-verlagerung-beantragen-styles';
        styles.textContent = `
            .agent-verlagerung-page {
                display: flex;
                height: calc(100vh - 140px);
                background: #f3f4f6;
            }

            .agent-sidebar {
                width: 280px;
                background: white;
                border-right: 1px solid #e5e7eb;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
            }

            .sidebar-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .sidebar-icon {
                font-size: 1.5rem;
            }

            .sidebar-header h3 {
                margin: 0;
                font-size: 1rem;
                color: #1f2937;
            }

            .progress-steps {
                padding: 1rem;
                flex: 1;
                overflow-y: auto;
            }

            .progress-step {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                margin-bottom: 0.25rem;
                border-radius: 6px;
                font-size: 0.875rem;
            }

            .progress-step.active {
                background: #eff6ff;
            }

            .step-indicator {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                font-weight: 600;
                background: #e5e7eb;
                color: #6b7280;
                flex-shrink: 0;
            }

            .progress-step.completed .step-indicator {
                background: #22c55e;
                color: white;
            }

            .progress-step.active .step-indicator {
                background: #3b82f6;
                color: white;
            }

            .step-name {
                color: #6b7280;
            }

            .progress-step.active .step-name {
                color: #1f2937;
                font-weight: 500;
            }

            .progress-step.completed .step-name {
                color: #374151;
            }

            .sidebar-summary {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
            }

            .sidebar-summary h4 {
                margin: 0 0 0.75rem 0;
                font-size: 0.875rem;
                color: #374151;
            }

            .summary-item {
                font-size: 0.8rem;
                margin-bottom: 0.5rem;
                color: #4b5563;
            }

            .summary-item .label {
                color: #6b7280;
            }

            .empty-hint {
                font-size: 0.8rem;
                color: #9ca3af;
                margin: 0;
            }

            .agent-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .chat-container {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }

            .chat-message {
                max-width: 80%;
                margin-bottom: 1rem;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .chat-message.agent {
                margin-right: auto;
            }

            .chat-message.user {
                margin-left: auto;
            }

            .chat-message.system {
                margin: 0 auto;
                max-width: 90%;
            }

            .message-content {
                padding: 1rem 1.25rem;
                border-radius: 12px;
                line-height: 1.5;
            }

            .chat-message.agent .message-content {
                background: white;
                border: 1px solid #e5e7eb;
            }

            .chat-message.user .message-content {
                background: #3b82f6;
                color: white;
            }

            .chat-message.system .message-content {
                background: #fef3c7;
                color: #92400e;
                font-size: 0.875rem;
                text-align: center;
            }

            .input-area {
                padding: 1rem 1.5rem;
                background: white;
                border-top: 1px solid #e5e7eb;
            }

            .simple-input-container,
            .select-input-container,
            .date-input-container {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .agent-input,
            .agent-select,
            .agent-textarea {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.2s;
            }

            .agent-input:focus,
            .agent-select:focus,
            .agent-textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .agent-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .agent-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
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
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .agent-btn.secondary:hover {
                background: #e5e7eb;
            }

            .agent-btn.large {
                padding: 1rem 2rem;
                font-size: 1rem;
            }

            .choice-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .dimensions-form {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 12px;
            }

            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .form-group {
                flex: 1;
            }

            .form-group.full-width {
                flex: 1;
            }

            .form-group label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
            }

            .form-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 1rem;
            }

            .tool-selection-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .input-with-select {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .input-divider {
                color: #9ca3af;
                font-size: 0.875rem;
            }

            .comment-input-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .comment-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }

            .summary-actions,
            .completion-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .submitting-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                padding: 1rem;
                color: #6b7280;
            }

            .spinner {
                width: 24px;
                height: 24px;
                border: 3px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .agent-verlagerung-page {
                    flex-direction: column;
                }

                .agent-sidebar {
                    width: 100%;
                    max-height: 200px;
                }

                .progress-steps {
                    display: flex;
                    overflow-x: auto;
                    padding: 0.5rem;
                }

                .progress-step {
                    flex-shrink: 0;
                }

                .step-name {
                    display: none;
                }

                .choice-buttons {
                    flex-direction: column;
                }

                .form-row {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentVerlagerungBeantragenPage = new AgentVerlagerungBeantragenPage();
