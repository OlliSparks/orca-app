// ORCA 2.0 - Agent: Verlagerung durchführen
// Workflow für die Durchführung einer genehmigten Werkzeug-Verlagerung

class AgentVerlagerungDurchfuehrenPage {
    constructor() {
        this.messages = [];
        this.currentStep = 'greeting';
        this.selectedVerlagerung = null;
        this.durchfuehrungData = {
            versandDatum: null,
            spedition: null,
            trackingNummer: null,
            verpackungshinweise: null,
            zollrelevant: false,
            zollDokumente: [],
            ankunftsDatum: null,
            empfaenger: null,
            zustandBeiAnkunft: null,
            kommentar: null,
            abgeschlossenAm: null
        };
        this.pendingVerlagerungen = [];
    }

    // Step definitions
    steps = [
        { id: 'greeting', name: 'Begrüßung' },
        { id: 'select_verlagerung', name: 'Verlagerung auswählen' },
        { id: 'versand_datum', name: 'Versanddatum' },
        { id: 'spedition', name: 'Spedition/Transport' },
        { id: 'tracking', name: 'Tracking-Info' },
        { id: 'verpackung', name: 'Verpackung' },
        { id: 'zoll_check', name: 'Zollprüfung' },
        { id: 'zoll_dokumente', name: 'Zolldokumente' },
        { id: 'ankunft', name: 'Ankunft bestätigen' },
        { id: 'empfaenger', name: 'Empfänger' },
        { id: 'zustand', name: 'Zustandsprüfung' },
        { id: 'summary', name: 'Zusammenfassung' },
        { id: 'completed', name: 'Abgeschlossen' }
    ];

    async render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Verlagerung durchführen';
        document.getElementById('headerSubtitle').textContent = 'Schritt-für-Schritt Durchführung';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        // Reset state
        this.messages = [];
        this.currentStep = 'greeting';
        this.selectedVerlagerung = null;
        this.durchfuehrungData = {
            versandDatum: null,
            spedition: null,
            trackingNummer: null,
            verpackungshinweise: null,
            zollrelevant: false,
            zollDokumente: [],
            ankunftsDatum: null,
            empfaenger: null,
            zustandBeiAnkunft: null,
            kommentar: null,
            abgeschlossenAm: null
        };

        app.innerHTML = `
            <div class="agent-verlagerung-page">
                <div class="agent-sidebar">
                    <div class="sidebar-header">
                        <span class="sidebar-icon">📦</span>
                        <h3>Verlagerung durchführen</h3>
                    </div>
                    <div class="progress-steps" id="progressSteps">
                        ${this.renderProgressSteps()}
                    </div>
                    <div class="sidebar-summary" id="sidebarSummary">
                        <h4>Übersicht</h4>
                        <div class="summary-content">
                            <p class="empty-hint">Noch keine Verlagerung ausgewählt</p>
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
        await this.loadPendingVerlagerungen();
    }

    renderProgressSteps() {
        const currentIndex = this.steps.findIndex(s => s.id === this.currentStep);
        return this.steps.map((step, index) => {
            let status = 'pending';
            if (index < currentIndex) status = 'completed';
            if (index === currentIndex) status = 'active';

            // Skip zoll_dokumente if not relevant
            if (step.id === 'zoll_dokumente' && !this.durchfuehrungData.zollrelevant && this.currentStep !== 'zoll_dokumente') {
                return '';
            }

            return `
                <div class="progress-step ${status}">
                    <div class="step-indicator">${status === 'completed' ? '✓' : index + 1}</div>
                    <span class="step-name">${step.name}</span>
                </div>
            `;
        }).join('');
    }

    async loadPendingVerlagerungen() {
        try {
            // Load from API
            const result = await api.getVerlagerungList({
                status: ['P1', 'P2', 'Genehmigt', 'approved', 'Beantragt'],
                limit: 100
            });

            if (result.success && result.data) {
                this.pendingVerlagerungen = result.data.filter(v =>
                    v.status === 'P1' || v.status === 'P2' ||
                    v.status === 'Genehmigt' || v.status === 'approved' ||
                    v.status === 'Beantragt'
                );
            }

            // Also load from localStorage (locally created ones)
            const localVerlagerungen = JSON.parse(localStorage.getItem('pending_verlagerungen') || '[]');
            const pendingLocal = localVerlagerungen.filter(v =>
                v.status === 'submitted' || v.status === 'approved' || v.status === 'draft'
            );

            // Merge both sources
            this.pendingVerlagerungen = [...this.pendingVerlagerungen, ...pendingLocal];
        } catch (error) {
            console.error('Fehler beim Laden der Verlagerungen:', error);

            // Fallback to localStorage only
            const localVerlagerungen = JSON.parse(localStorage.getItem('pending_verlagerungen') || '[]');
            this.pendingVerlagerungen = localVerlagerungen.filter(v =>
                v.status !== 'completed' && v.status !== 'cancelled'
            );
        }

        this.showGreeting();
    }

    showGreeting() {
        const count = this.pendingVerlagerungen.length;

        this.addMessage('agent', `Willkommen zum Verlagerungs-Durchführungs-Assistenten! 📦

Ich helfe Ihnen, eine genehmigte Verlagerung durchzuführen und zu dokumentieren.

${count > 0 ? `**${count} Verlagerung(en)** warten auf Durchführung.` : '⚠️ Keine offenen Verlagerungen gefunden.'}

Der Prozess umfasst:
1. Verlagerung auswählen
2. Versand dokumentieren (Datum, Spedition, Tracking)
3. Zollrelevanz prüfen
4. Ankunft bestätigen
5. Zustandsprüfung durchführen`);

        if (count > 0) {
            this.currentStep = 'select_verlagerung';
            this.updateProgress();
            this.showVerlagerungSelection();
        } else {
            this.showNoVerlagerungen();
        }
    }

    showNoVerlagerungen() {
        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="no-data-actions">
                <p class="hint-text">Erstellen Sie zuerst einen Verlagerungsantrag.</p>
                <button class="agent-btn primary" onclick="router.navigate('/agent-verlagerung-beantragen')">
                    🚚 Verlagerung beantragen
                </button>
                <button class="agent-btn secondary" onclick="router.navigate('/verlagerung')">
                    📋 Zur Verlagerungsübersicht
                </button>
            </div>
        `;
    }

    showVerlagerungSelection() {
        this.addMessage('agent', `Welche Verlagerung möchten Sie durchführen?`);

        const inputArea = document.getElementById('inputArea');

        const verlagerungCards = this.pendingVerlagerungen.map((v, index) => {
            const toolCount = v.tools?.length || v.toolCount || 1;
            const date = v.createdAt ? new Date(v.createdAt).toLocaleDateString('de-DE') : 'N/A';
            const status = this.getStatusLabel(v.status);

            return `
                <div class="verlagerung-card" onclick="agentVerlagerungDurchfuehrenPage.selectVerlagerung(${index})">
                    <div class="card-header">
                        <span class="card-title">${v.bezeichnung || v.name || v.identifier || 'Verlagerung'}</span>
                        <span class="card-status ${v.status}">${status}</span>
                    </div>
                    <div class="card-details">
                        <div class="detail-row">
                            <span class="label">Von:</span>
                            <span>${v.quellStandort || v.sourceLocation || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Nach:</span>
                            <span>${v.zielStandort || v.targetLocation || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Werkzeuge:</span>
                            <span>${toolCount}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Erstellt:</span>
                            <span>${date}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        inputArea.innerHTML = `
            <div class="verlagerung-selection">
                <div class="verlagerung-cards">
                    ${verlagerungCards}
                </div>
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'P1': 'Beantragt',
            'P2': 'Genehmigt',
            'Genehmigt': 'Genehmigt',
            'approved': 'Genehmigt',
            'Beantragt': 'Beantragt',
            'submitted': 'Eingereicht',
            'draft': 'Entwurf'
        };
        return labels[status] || status;
    }

    selectVerlagerung(index) {
        this.selectedVerlagerung = this.pendingVerlagerungen[index];

        const v = this.selectedVerlagerung;
        this.addMessage('user', v.bezeichnung || v.name || 'Verlagerung ausgewählt');

        // Check if international (different countries)
        this.durchfuehrungData.zollrelevant = this.checkZollRelevanz(v);

        this.addMessage('agent', `✓ Verlagerung ausgewählt: **${v.bezeichnung || v.name || 'Verlagerung'}**

**Details:**
- Von: ${v.quellStandort || v.sourceLocation || 'N/A'}
- Nach: ${v.zielStandort || v.targetLocation || 'N/A'}
- Werkzeuge: ${v.tools?.length || v.toolCount || 1}
${this.durchfuehrungData.zollrelevant ? '\n⚠️ **Internationale Verlagerung** - Zolldokumente erforderlich!' : ''}`);

        this.currentStep = 'versand_datum';
        this.updateProgress();
        this.updateSidebar();
        this.showVersandDatumInput();
    }

    checkZollRelevanz(verlagerung) {
        // Check if source and target are in different countries
        const sourceCountry = verlagerung.quellLand || verlagerung.sourceCountry || '';
        const targetCountry = verlagerung.zielLand || verlagerung.targetCountry || '';

        if (sourceCountry && targetCountry && sourceCountry !== targetCountry) {
            return true;
        }

        // Check location names for country indicators
        const source = (verlagerung.quellStandort || verlagerung.sourceLocation || '').toLowerCase();
        const target = (verlagerung.zielStandort || verlagerung.targetLocation || '').toLowerCase();

        const countries = ['deutschland', 'germany', 'österreich', 'austria', 'schweiz', 'switzerland',
                          'frankreich', 'france', 'italien', 'italy', 'spanien', 'spain', 'polen', 'poland',
                          'tschechien', 'czech', 'ungarn', 'hungary', 'china', 'usa', 'mexiko', 'mexico'];

        let sourceCountryFound = '';
        let targetCountryFound = '';

        for (const country of countries) {
            if (source.includes(country)) sourceCountryFound = country;
            if (target.includes(country)) targetCountryFound = country;
        }

        return sourceCountryFound && targetCountryFound && sourceCountryFound !== targetCountryFound;
    }

    showVersandDatumInput() {
        const today = new Date().toISOString().split('T')[0];

        this.addMessage('agent', `Wann wurde/wird das Werkzeug **versendet**?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="date-input-container">
                <input type="date" id="versandDatumInput" class="agent-input date-input"
                       value="${today}"
                       onkeypress="if(event.key==='Enter') agentVerlagerungDurchfuehrenPage.processVersandDatum()">
                <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processVersandDatum()">
                    Bestätigen
                </button>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('versandDatumInput')?.focus();
        }, 100);
    }

    processVersandDatum() {
        const input = document.getElementById('versandDatumInput');
        const value = input?.value;

        if (!value) {
            this.addMessage('system', 'Bitte wählen Sie ein Datum.');
            return;
        }

        this.durchfuehrungData.versandDatum = value;
        const formattedDate = new Date(value).toLocaleDateString('de-DE');

        this.addMessage('user', formattedDate);
        this.addMessage('agent', `✓ Versanddatum: **${formattedDate}**`);

        this.currentStep = 'spedition';
        this.updateProgress();
        this.updateSidebar();
        this.showSpeditionInput();
    }

    showSpeditionInput() {
        this.addMessage('agent', `Welche **Spedition/Transportunternehmen** führt den Transport durch?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="spedition-input-container">
                <div class="quick-options">
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.setSpedition('DHL Freight')">DHL Freight</button>
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.setSpedition('DB Schenker')">DB Schenker</button>
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.setSpedition('Kühne + Nagel')">Kühne + Nagel</button>
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.setSpedition('Eigentransport')">Eigentransport</button>
                </div>
                <div class="custom-input">
                    <input type="text" id="speditionInput" class="agent-input"
                           placeholder="Andere Spedition eingeben..."
                           onkeypress="if(event.key==='Enter') agentVerlagerungDurchfuehrenPage.processSpedition()">
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processSpedition()">
                        Bestätigen
                    </button>
                </div>
            </div>
        `;
    }

    setSpedition(spedition) {
        document.getElementById('speditionInput').value = spedition;
        this.processSpedition();
    }

    processSpedition() {
        const input = document.getElementById('speditionInput');
        const value = input?.value?.trim();

        if (!value) {
            this.addMessage('system', 'Bitte geben Sie eine Spedition ein.');
            return;
        }

        this.durchfuehrungData.spedition = value;
        this.addMessage('user', value);
        this.addMessage('agent', `✓ Spedition: **${value}**`);

        this.currentStep = 'tracking';
        this.updateProgress();
        this.updateSidebar();
        this.showTrackingInput();
    }

    showTrackingInput() {
        this.addMessage('agent', `Haben Sie eine **Tracking-/Sendungsnummer**?

(Optional - hilft bei der Nachverfolgung)`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="tracking-input-container">
                <input type="text" id="trackingInput" class="agent-input"
                       placeholder="Tracking-Nummer (optional)..."
                       onkeypress="if(event.key==='Enter') agentVerlagerungDurchfuehrenPage.processTracking()">
                <div class="button-row">
                    <button class="agent-btn secondary" onclick="agentVerlagerungDurchfuehrenPage.skipTracking()">
                        Überspringen
                    </button>
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processTracking()">
                        Bestätigen
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('trackingInput')?.focus();
        }, 100);
    }

    skipTracking() {
        this.addMessage('user', '(keine Tracking-Nummer)');
        this.goToVerpackung();
    }

    processTracking() {
        const input = document.getElementById('trackingInput');
        const value = input?.value?.trim();

        if (value) {
            this.durchfuehrungData.trackingNummer = value;
            this.addMessage('user', value);
            this.addMessage('agent', `✓ Tracking-Nummer: **${value}**`);
        } else {
            this.addMessage('user', '(keine Tracking-Nummer)');
        }

        this.goToVerpackung();
    }

    goToVerpackung() {
        this.currentStep = 'verpackung';
        this.updateProgress();
        this.showVerpackungInput();
    }

    showVerpackungInput() {
        this.addMessage('agent', `Gibt es besondere **Verpackungs- oder Transporthinweise**?

(z.B. "Zerbrechlich", "Nicht kippen", "Temperaturempfindlich")`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="verpackung-input-container">
                <div class="quick-options">
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.addVerpackungshinweis('Zerbrechlich')">Zerbrechlich</button>
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.addVerpackungshinweis('Nicht kippen')">Nicht kippen</button>
                    <button class="option-btn" onclick="agentVerlagerungDurchfuehrenPage.addVerpackungshinweis('Schwerlast')">Schwerlast</button>
                </div>
                <textarea id="verpackungInput" class="agent-textarea"
                          placeholder="Weitere Hinweise (optional)..." rows="2"></textarea>
                <div class="button-row">
                    <button class="agent-btn secondary" onclick="agentVerlagerungDurchfuehrenPage.skipVerpackung()">
                        Überspringen
                    </button>
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processVerpackung()">
                        Weiter
                    </button>
                </div>
            </div>
        `;
    }

    addVerpackungshinweis(hinweis) {
        const textarea = document.getElementById('verpackungInput');
        if (textarea) {
            const current = textarea.value.trim();
            textarea.value = current ? `${current}, ${hinweis}` : hinweis;
        }
    }

    skipVerpackung() {
        this.addMessage('user', '(keine besonderen Hinweise)');
        this.goToZollCheck();
    }

    processVerpackung() {
        const input = document.getElementById('verpackungInput');
        const value = input?.value?.trim();

        if (value) {
            this.durchfuehrungData.verpackungshinweise = value;
            this.addMessage('user', value);
            this.addMessage('agent', `✓ Verpackungshinweise: **${value}**`);
        } else {
            this.addMessage('user', '(keine besonderen Hinweise)');
        }

        this.goToZollCheck();
    }

    goToZollCheck() {
        this.currentStep = 'zoll_check';
        this.updateProgress();
        this.showZollCheck();
    }

    showZollCheck() {
        if (this.durchfuehrungData.zollrelevant) {
            this.addMessage('agent', `⚠️ **Internationale Verlagerung erkannt!**

Für grenzüberschreitende Transporte sind Zolldokumente erforderlich.

Bitte bestätigen Sie die Zollrelevanz:`);

            const inputArea = document.getElementById('inputArea');
            inputArea.innerHTML = `
                <div class="choice-buttons">
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.confirmZollRelevant(true)">
                        📋 Ja, Zolldokumente erforderlich
                    </button>
                    <button class="agent-btn secondary" onclick="agentVerlagerungDurchfuehrenPage.confirmZollRelevant(false)">
                        Nein, kein Zoll nötig
                    </button>
                </div>
            `;
        } else {
            this.addMessage('agent', `Ist diese Verlagerung **zollrelevant**?

(Bei internationalem Transport außerhalb der EU)`);

            const inputArea = document.getElementById('inputArea');
            inputArea.innerHTML = `
                <div class="choice-buttons">
                    <button class="agent-btn secondary" onclick="agentVerlagerungDurchfuehrenPage.confirmZollRelevant(true)">
                        📋 Ja, Zolldokumente nötig
                    </button>
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.confirmZollRelevant(false)">
                        Nein, innerhalb EU
                    </button>
                </div>
            `;
        }
    }

    confirmZollRelevant(isRelevant) {
        this.durchfuehrungData.zollrelevant = isRelevant;

        if (isRelevant) {
            this.addMessage('user', 'Zolldokumente erforderlich');
            this.currentStep = 'zoll_dokumente';
            this.updateProgress();
            this.showZollDokumente();
        } else {
            this.addMessage('user', 'Kein Zoll erforderlich');
            this.addMessage('agent', '✓ Keine Zolldokumente erforderlich.');
            this.currentStep = 'ankunft';
            this.updateProgress();
            this.showAnkunftInput();
        }
    }

    showZollDokumente() {
        this.addMessage('agent', `Welche **Zolldokumente** liegen vor?

Bitte geben Sie die Dokumentennummern ein:`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="zoll-form">
                <div class="form-group">
                    <label>Ausfuhrbegleitdokument (ABD) Nr.</label>
                    <input type="text" id="abdInput" class="agent-input" placeholder="z.B. DE/123456/2024">
                </div>
                <div class="form-group">
                    <label>Carnet ATA Nr. (optional)</label>
                    <input type="text" id="carnetInput" class="agent-input" placeholder="z.B. DE-12345678">
                </div>
                <div class="form-group">
                    <label>Weitere Zollreferenz (optional)</label>
                    <input type="text" id="zollRefInput" class="agent-input" placeholder="z.B. MRN-Nummer">
                </div>
                <div class="form-actions">
                    <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processZollDokumente()">
                        Dokumente bestätigen
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('abdInput')?.focus();
        }, 100);
    }

    processZollDokumente() {
        const abd = document.getElementById('abdInput')?.value?.trim();
        const carnet = document.getElementById('carnetInput')?.value?.trim();
        const zollRef = document.getElementById('zollRefInput')?.value?.trim();

        if (!abd && !carnet && !zollRef) {
            this.addMessage('system', 'Bitte geben Sie mindestens eine Dokumentennummer ein.');
            return;
        }

        const docs = [];
        if (abd) docs.push({ type: 'ABD', nummer: abd });
        if (carnet) docs.push({ type: 'Carnet ATA', nummer: carnet });
        if (zollRef) docs.push({ type: 'Zollreferenz', nummer: zollRef });

        this.durchfuehrungData.zollDokumente = docs;

        const docSummary = docs.map(d => `${d.type}: ${d.nummer}`).join(', ');
        this.addMessage('user', docSummary);
        this.addMessage('agent', `✓ Zolldokumente erfasst:
${docs.map(d => `- **${d.type}:** ${d.nummer}`).join('\n')}`);

        this.currentStep = 'ankunft';
        this.updateProgress();
        this.updateSidebar();
        this.showAnkunftInput();
    }

    showAnkunftInput() {
        const today = new Date().toISOString().split('T')[0];

        this.addMessage('agent', `Wann ist das Werkzeug **angekommen** bzw. wann wird es erwartet?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="date-input-container">
                <input type="date" id="ankunftDatumInput" class="agent-input date-input"
                       value="${today}"
                       onkeypress="if(event.key==='Enter') agentVerlagerungDurchfuehrenPage.processAnkunft()">
                <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processAnkunft()">
                    Bestätigen
                </button>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('ankunftDatumInput')?.focus();
        }, 100);
    }

    processAnkunft() {
        const input = document.getElementById('ankunftDatumInput');
        const value = input?.value;

        if (!value) {
            this.addMessage('system', 'Bitte wählen Sie ein Datum.');
            return;
        }

        this.durchfuehrungData.ankunftsDatum = value;
        const formattedDate = new Date(value).toLocaleDateString('de-DE');

        this.addMessage('user', formattedDate);
        this.addMessage('agent', `✓ Ankunftsdatum: **${formattedDate}**`);

        this.currentStep = 'empfaenger';
        this.updateProgress();
        this.updateSidebar();
        this.showEmpfaengerInput();
    }

    showEmpfaengerInput() {
        this.addMessage('agent', `Wer hat das Werkzeug **empfangen**?

(Name der Person, die den Empfang bestätigt hat)`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="simple-input-container">
                <input type="text" id="empfaengerInput" class="agent-input"
                       placeholder="Name des Empfängers..."
                       onkeypress="if(event.key==='Enter') agentVerlagerungDurchfuehrenPage.processEmpfaenger()">
                <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.processEmpfaenger()">
                    Bestätigen
                </button>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('empfaengerInput')?.focus();
        }, 100);
    }

    processEmpfaenger() {
        const input = document.getElementById('empfaengerInput');
        const value = input?.value?.trim();

        if (!value) {
            this.addMessage('system', 'Bitte geben Sie einen Empfänger ein.');
            return;
        }

        this.durchfuehrungData.empfaenger = value;
        this.addMessage('user', value);
        this.addMessage('agent', `✓ Empfänger: **${value}**`);

        this.currentStep = 'zustand';
        this.updateProgress();
        this.updateSidebar();
        this.showZustandInput();
    }

    showZustandInput() {
        this.addMessage('agent', `In welchem **Zustand** ist das Werkzeug angekommen?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="zustand-selection">
                <div class="zustand-options">
                    <button class="zustand-btn good" onclick="agentVerlagerungDurchfuehrenPage.processZustand('Einwandfrei')">
                        <span class="icon">✅</span>
                        <span class="label">Einwandfrei</span>
                        <span class="desc">Keine Schäden, wie erwartet</span>
                    </button>
                    <button class="zustand-btn warning" onclick="agentVerlagerungDurchfuehrenPage.processZustand('Leichte Mängel')">
                        <span class="icon">⚠️</span>
                        <span class="label">Leichte Mängel</span>
                        <span class="desc">Kleinere Beschädigungen</span>
                    </button>
                    <button class="zustand-btn bad" onclick="agentVerlagerungDurchfuehrenPage.processZustand('Beschädigt')">
                        <span class="icon">❌</span>
                        <span class="label">Beschädigt</span>
                        <span class="desc">Erhebliche Schäden</span>
                    </button>
                </div>
            </div>
        `;
    }

    processZustand(zustand) {
        this.durchfuehrungData.zustandBeiAnkunft = zustand;
        this.addMessage('user', zustand);

        if (zustand === 'Einwandfrei') {
            this.addMessage('agent', `✅ Zustand: **${zustand}** - Sehr gut!`);
        } else if (zustand === 'Leichte Mängel') {
            this.addMessage('agent', `⚠️ Zustand: **${zustand}**

Bitte dokumentieren Sie die Mängel für mögliche Versicherungsansprüche.`);
        } else {
            this.addMessage('agent', `❌ Zustand: **${zustand}**

⚠️ **Wichtig:** Dokumentieren Sie die Schäden umgehend und melden Sie diese der Spedition!`);
        }

        this.currentStep = 'summary';
        this.updateProgress();
        this.updateSidebar();
        this.showSummary();
    }

    showSummary() {
        const v = this.selectedVerlagerung;
        const d = this.durchfuehrungData;

        const versandDate = new Date(d.versandDatum).toLocaleDateString('de-DE');
        const ankunftDate = new Date(d.ankunftsDatum).toLocaleDateString('de-DE');

        let zollInfo = '';
        if (d.zollrelevant && d.zollDokumente.length > 0) {
            zollInfo = `\n**Zolldokumente:**\n${d.zollDokumente.map(doc => `- ${doc.type}: ${doc.nummer}`).join('\n')}`;
        }

        this.addMessage('agent', `📋 **Zusammenfassung der Verlagerung:**

**Verlagerung:** ${v.bezeichnung || v.name || 'N/A'}
**Von:** ${v.quellStandort || v.sourceLocation || 'N/A'}
**Nach:** ${v.zielStandort || v.targetLocation || 'N/A'}

**Transport:**
- Versanddatum: ${versandDate}
- Spedition: ${d.spedition}
${d.trackingNummer ? `- Tracking: ${d.trackingNummer}` : ''}
${d.verpackungshinweise ? `- Hinweise: ${d.verpackungshinweise}` : ''}
${zollInfo}

**Empfang:**
- Ankunftsdatum: ${ankunftDate}
- Empfänger: ${d.empfaenger}
- Zustand: ${d.zustandBeiAnkunft}

---
Ist alles korrekt?`);

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="summary-actions">
                <button class="agent-btn secondary" onclick="agentVerlagerungDurchfuehrenPage.restartProcess()">
                    ✏️ Daten korrigieren
                </button>
                <button class="agent-btn primary large" onclick="agentVerlagerungDurchfuehrenPage.completeVerlagerung()">
                    ✅ Verlagerung abschließen
                </button>
            </div>
        `;
    }

    restartProcess() {
        this.addMessage('user', 'Daten korrigieren');
        this.currentStep = 'versand_datum';
        this.updateProgress();
        this.showVersandDatumInput();
    }

    async completeVerlagerung() {
        this.addMessage('user', 'Verlagerung abschließen');

        const inputArea = document.getElementById('inputArea');
        inputArea.innerHTML = `
            <div class="submitting-indicator">
                <div class="spinner"></div>
                <span>Verlagerung wird abgeschlossen...</span>
            </div>
        `;

        this.durchfuehrungData.abgeschlossenAm = new Date().toISOString();

        // Try to update via API
        try {
            if (this.selectedVerlagerung.apiKey || this.selectedVerlagerung.key) {
                const result = await api.updateRelocationStatus(
                    this.selectedVerlagerung.apiKey || this.selectedVerlagerung.key,
                    'P3', // Completed
                    this.durchfuehrungData
                );

                if (result.success) {
                    console.log('Verlagerung via API aktualisiert');
                }
            }
        } catch (error) {
            console.error('API Update error:', error);
        }

        // Update localStorage
        this.updateLocalStorage();

        // Create message
        if (typeof messageService !== 'undefined') {
            messageService.createOutgoingMessage(
                'verlagerung',
                'Verlagerung abgeschlossen',
                `Verlagerung "${this.selectedVerlagerung.bezeichnung || this.selectedVerlagerung.name}" erfolgreich durchgeführt`,
                [],
                {
                    processId: this.selectedVerlagerung.id || this.selectedVerlagerung.key,
                    empfaenger: this.durchfuehrungData.empfaenger,
                    zustand: this.durchfuehrungData.zustandBeiAnkunft
                }
            );
        }

        this.currentStep = 'completed';
        this.updateProgress();

        const zustandIcon = this.durchfuehrungData.zustandBeiAnkunft === 'Einwandfrei' ? '✅' :
                           this.durchfuehrungData.zustandBeiAnkunft === 'Leichte Mängel' ? '⚠️' : '❌';

        this.addMessage('agent', `🎉 **Verlagerung erfolgreich abgeschlossen!**

${zustandIcon} Das Werkzeug ist am Zielort angekommen.

**Nächste Schritte:**
1. Werkzeug-Standort im System ist aktualisiert
2. ${this.durchfuehrungData.zustandBeiAnkunft === 'Beschädigt' ? '⚠️ **Schadensmeldung an Spedition senden!**' : 'Werkzeug kann in Betrieb genommen werden'}

Sie erhalten eine Bestätigung in den **Nachrichten**.`);

        inputArea.innerHTML = `
            <div class="completion-actions">
                <button class="agent-btn secondary" onclick="router.navigate('/messages')">
                    📬 Zu den Nachrichten
                </button>
                <button class="agent-btn secondary" onclick="router.navigate('/verlagerung')">
                    📋 Zur Übersicht
                </button>
                <button class="agent-btn primary" onclick="agentVerlagerungDurchfuehrenPage.render()">
                    📦 Weitere Verlagerung
                </button>
            </div>
        `;
    }

    updateLocalStorage() {
        // Update local verlagerungen
        const localVerlagerungen = JSON.parse(localStorage.getItem('pending_verlagerungen') || '[]');
        const index = localVerlagerungen.findIndex(v =>
            v.id === this.selectedVerlagerung.id ||
            v.bezeichnung === this.selectedVerlagerung.bezeichnung
        );

        if (index !== -1) {
            localVerlagerungen[index] = {
                ...localVerlagerungen[index],
                status: 'completed',
                durchfuehrung: this.durchfuehrungData
            };
            localStorage.setItem('pending_verlagerungen', JSON.stringify(localVerlagerungen));
        }

        // Also save to completed verlagerungen
        const completed = JSON.parse(localStorage.getItem('completed_verlagerungen') || '[]');
        completed.push({
            ...this.selectedVerlagerung,
            durchfuehrung: this.durchfuehrungData,
            completedAt: new Date().toISOString()
        });
        localStorage.setItem('completed_verlagerungen', JSON.stringify(completed));
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
        const v = this.selectedVerlagerung;
        const d = this.durchfuehrungData;

        if (v) {
            items.push(`<div class="summary-item"><span class="label">Verlagerung:</span> ${v.bezeichnung || v.name || 'N/A'}</div>`);
        }
        if (d.versandDatum) {
            items.push(`<div class="summary-item"><span class="label">Versand:</span> ${new Date(d.versandDatum).toLocaleDateString('de-DE')}</div>`);
        }
        if (d.spedition) {
            items.push(`<div class="summary-item"><span class="label">Spedition:</span> ${d.spedition}</div>`);
        }
        if (d.ankunftsDatum) {
            items.push(`<div class="summary-item"><span class="label">Ankunft:</span> ${new Date(d.ankunftsDatum).toLocaleDateString('de-DE')}</div>`);
        }
        if (d.empfaenger) {
            items.push(`<div class="summary-item"><span class="label">Empfänger:</span> ${d.empfaenger}</div>`);
        }
        if (d.zustandBeiAnkunft) {
            items.push(`<div class="summary-item"><span class="label">Zustand:</span> ${d.zustandBeiAnkunft}</div>`);
        }

        summaryEl.innerHTML = `
            <h4>Übersicht</h4>
            <div class="summary-content">
                ${items.length > 0 ? items.join('') : '<p class="empty-hint">Noch keine Verlagerung ausgewählt</p>'}
            </div>
        `;
    }

    addStyles() {
        if (document.getElementById('agent-verlagerung-durchfuehren-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-verlagerung-durchfuehren-styles';
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

            .empty-hint, .hint-text {
                font-size: 0.8rem;
                color: #9ca3af;
                margin: 0 0 1rem 0;
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
            .date-input-container,
            .tracking-input-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .button-row {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }

            .agent-input,
            .agent-select,
            .agent-textarea {
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
                min-height: 60px;
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
                flex-wrap: wrap;
            }

            .no-data-actions {
                text-align: center;
                padding: 1rem;
            }

            .no-data-actions .agent-btn {
                margin: 0.5rem;
            }

            /* Verlagerung Cards */
            .verlagerung-selection {
                max-height: 400px;
                overflow-y: auto;
            }

            .verlagerung-cards {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .verlagerung-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .verlagerung-card:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
            }

            .card-title {
                font-weight: 600;
                color: #1f2937;
            }

            .card-status {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                background: #dbeafe;
                color: #1d4ed8;
            }

            .card-details {
                font-size: 0.85rem;
            }

            .detail-row {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.25rem;
            }

            .detail-row .label {
                color: #6b7280;
                min-width: 70px;
            }

            /* Quick Options */
            .quick-options {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
            }

            .option-btn {
                padding: 0.5rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .option-btn:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .spedition-input-container,
            .verpackung-input-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .custom-input {
                display: flex;
                gap: 0.75rem;
            }

            .custom-input .agent-input {
                flex: 1;
            }

            /* Zoll Form */
            .zoll-form {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 12px;
            }

            .form-group {
                margin-bottom: 1rem;
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

            /* Zustand Selection */
            .zustand-selection {
                padding: 0.5rem;
            }

            .zustand-options {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }

            .zustand-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1.5rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 140px;
            }

            .zustand-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .zustand-btn .icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }

            .zustand-btn .label {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .zustand-btn .desc {
                font-size: 0.75rem;
                color: #6b7280;
                text-align: center;
            }

            .zustand-btn.good:hover {
                border-color: #22c55e;
                background: #f0fdf4;
            }

            .zustand-btn.warning:hover {
                border-color: #f59e0b;
                background: #fffbeb;
            }

            .zustand-btn.bad:hover {
                border-color: #ef4444;
                background: #fef2f2;
            }

            /* Summary and Completion */
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

                .choice-buttons,
                .zustand-options {
                    flex-direction: column;
                }

                .zustand-btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize
const agentVerlagerungDurchfuehrenPage = new AgentVerlagerungDurchfuehrenPage();
