// ORCA 2.0 - Integrations-Assistent (3 einfache Wege)
class AgentAPISetupPage {
    constructor() {
        this.selectedPath = null; // 'direct', 'stammdaten', 'auto'
        this.currentStep = 'selection'; // 'selection', 'setup', 'test', 'complete'
        this.config = {
            exportFormat: 'excel',
            syncMethod: null,
            lastUpload: null
        };
        // Stammdaten Upload-Daten
        this.uploadedStammdaten = null;
        this.detectedColumns = null;
        this.supplierLocations = [];
    }

    // Lade vorhandene Standorte des Lieferanten aus den Assets
    async loadSupplierLocations() {
        try {
            // Versuche echte Daten zu laden
            if (typeof api !== 'undefined' && api.mockToolsCache) {
                const uniqueLocations = new Set();
                api.mockToolsCache.forEach(asset => {
                    if (asset.location) uniqueLocations.add(asset.location);
                    if (asset.locationDetail) uniqueLocations.add(asset.locationDetail);
                });
                this.supplierLocations = Array.from(uniqueLocations).filter(l => l && l !== 'Unbekannt');
            }
        } catch (e) {
            console.warn('Konnte Standorte nicht laden:', e);
        }
        return this.supplierLocations;
    }

    // Hole User-Email für Erinnerungen
    getUserEmail() {
        if (typeof authService !== 'undefined' && authService.userInfo) {
            return authService.userInfo.email || 'test.user@orca.com';
        }
        return 'test.user@orca.com';
    }

    // Hole Lieferanten-Info
    getSupplierInfo() {
        const supplierNumber = (typeof api !== 'undefined' && api.supplierNumber) || '133188';
        return {
            number: supplierNumber,
            email: this.getUserEmail()
        };
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Integration';
        document.getElementById('headerSubtitle').textContent = 'Werkzeugdaten verbinden';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container integration-page">
                <div class="integration-header">
                    <button class="back-btn" id="backToAgentsBtn">← Zurück zu Agenten</button>
                </div>

                <div class="integration-content" id="integrationContent">
                    ${this.renderCurrentStep()}
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
    }

    renderCurrentStep() {
        switch (this.currentStep) {
            case 'selection':
                return this.renderPathSelection();
            case 'setup':
                return this.renderSetupStep();
            case 'test':
                return this.renderTestStep();
            case 'complete':
                return this.renderCompleteStep();
            default:
                return this.renderPathSelection();
        }
    }

    renderPathSelection() {
        return `
            <div class="selection-intro">
                <h1>Wie möchten Sie Ihre Werkzeugdaten mit ORCA verbinden?</h1>
                <p class="intro-text">
                    Wählen Sie den Weg, der am besten zu Ihrem Arbeitsalltag passt.
                    Alle Wege führen zum Ziel – manche sind nur schneller bei der Inventur.
                </p>
            </div>

            <div class="path-cards">
                <!-- Weg 1: Direkt-Upload -->
                <div class="path-card" data-path="direct">
                    <div class="path-header">
                        <span class="path-icon">📤</span>
                        <div class="path-title">
                            <h2>Direkt-Upload</h2>
                            <span class="path-subtitle">Bei jeder Inventur</span>
                        </div>
                    </div>

                    <div class="path-effort">
                        <div class="effort-item">
                            <span class="effort-label">Einrichtung:</span>
                            <span class="effort-value good">Keine</span>
                        </div>
                        <div class="effort-item">
                            <span class="effort-label">Pro Inventur:</span>
                            <span class="effort-value neutral">10-30 Min</span>
                        </div>
                    </div>

                    <p class="path-description">
                        Sie exportieren Ihre Werkzeugdaten bei Bedarf und laden sie im Inventur-Agenten hoch.
                        Der Agent ordnet die Daten automatisch zu.
                    </p>

                    <div class="path-flow">
                        <span>Inventur kommt</span>
                        <span class="arrow">→</span>
                        <span>Export aus Ihrem System</span>
                        <span class="arrow">→</span>
                        <span>Upload</span>
                        <span class="arrow">→</span>
                        <span>Fertig</span>
                    </div>

                    <div class="path-for">
                        <strong>Ideal für:</strong> Wenige Inventuren pro Jahr, kein IT-Aufwand gewünscht
                    </div>

                    <button class="path-btn" data-path="direct">Diesen Weg nutzen</button>
                </div>

                <!-- Weg 2: Stammdaten-Sync -->
                <div class="path-card recommended" data-path="stammdaten">
                    <div class="recommended-badge">Empfohlen</div>
                    <div class="path-header">
                        <span class="path-icon">📅</span>
                        <div class="path-title">
                            <h2>Stammdaten-Sync</h2>
                            <span class="path-subtitle">1-2× pro Jahr aktualisieren</span>
                        </div>
                    </div>

                    <div class="path-effort">
                        <div class="effort-item">
                            <span class="effort-label">Einrichtung:</span>
                            <span class="effort-value neutral">1-2 Std/Jahr</span>
                        </div>
                        <div class="effort-item">
                            <span class="effort-label">Pro Inventur:</span>
                            <span class="effort-value good">2-5 Min</span>
                        </div>
                    </div>

                    <p class="path-description">
                        Sie laden Ihre vollständige Werkzeugliste 1-2× pro Jahr hoch.
                        Bei Inventuren sind die Daten bereits vorausgefüllt – Sie bestätigen nur noch.
                    </p>

                    <div class="path-flow">
                        <span>Halbjährlich: Upload</span>
                        <span class="arrow">→</span>
                        <span>Inventur kommt</span>
                        <span class="arrow">→</span>
                        <span>Daten vorausgefüllt</span>
                        <span class="arrow">→</span>
                        <span>Bestätigen</span>
                    </div>

                    <div class="path-for">
                        <strong>Ideal für:</strong> Viele Werkzeuge, regelmäßige Inventuren
                    </div>

                    <button class="path-btn primary" data-path="stammdaten">Diesen Weg nutzen</button>
                </div>

                <!-- Weg 3: Auto-Export -->
                <div class="path-card" data-path="auto">
                    <div class="path-header">
                        <span class="path-icon">🔄</span>
                        <div class="path-title">
                            <h2>Auto-Export</h2>
                            <span class="path-subtitle">Einmal einrichten, dann automatisch</span>
                        </div>
                    </div>

                    <div class="path-effort">
                        <div class="effort-item">
                            <span class="effort-label">Einrichtung:</span>
                            <span class="effort-value neutral">2-4 Std einmalig</span>
                        </div>
                        <div class="effort-item">
                            <span class="effort-label">Pro Inventur:</span>
                            <span class="effort-value good">0 Min</span>
                        </div>
                    </div>

                    <p class="path-description">
                        Ihr System exportiert automatisch in einen Cloud-Ordner oder per E-Mail.
                        ORCA holt die Daten automatisch ab – Sie müssen nichts mehr tun.
                    </p>

                    <div class="path-flow">
                        <span>Ihr System</span>
                        <span class="arrow">→</span>
                        <span>Automatischer Export</span>
                        <span class="arrow">→</span>
                        <span>ORCA holt ab</span>
                        <span class="arrow">→</span>
                        <span>Immer aktuell</span>
                    </div>

                    <div class="path-for">
                        <strong>Ideal für:</strong> IT-Export möglich (SAP, eigene DB), viele Werkzeuge
                    </div>

                    <button class="path-btn" data-path="auto">Diesen Weg nutzen</button>
                </div>
            </div>

            <div class="comparison-section">
                <h3>Vergleich auf einen Blick</h3>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>📤 Direkt-Upload</th>
                            <th>📅 Stammdaten-Sync</th>
                            <th>🔄 Auto-Export</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Setup-Aufwand</td>
                            <td><span class="badge good">Keiner</span></td>
                            <td><span class="badge neutral">1-2 Std/Jahr</span></td>
                            <td><span class="badge neutral">2-4 Std einmalig</span></td>
                        </tr>
                        <tr>
                            <td>Aufwand pro Inventur</td>
                            <td><span class="badge neutral">10-30 Min</span></td>
                            <td><span class="badge good">2-5 Min</span></td>
                            <td><span class="badge good">0 Min</span></td>
                        </tr>
                        <tr>
                            <td>IT-Kenntnisse nötig?</td>
                            <td>Nein</td>
                            <td>Nein</td>
                            <td>Grundkenntnisse</td>
                        </tr>
                        <tr>
                            <td>Daten-Aktualität</td>
                            <td>Zum Zeitpunkt des Uploads</td>
                            <td>Stand letzter Upload</td>
                            <td>Immer aktuell</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="help-section">
                <div class="help-card">
                    <span class="help-icon">💡</span>
                    <div class="help-content">
                        <h4>Nicht sicher, welcher Weg?</h4>
                        <p>Starten Sie mit <strong>Direkt-Upload</strong> – das funktioniert sofort ohne Vorbereitung.
                           Wenn Sie merken, dass es zu aufwändig wird, können Sie jederzeit auf Stammdaten-Sync wechseln.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderSetupStep() {
        switch (this.selectedPath) {
            case 'direct':
                return this.renderDirectSetup();
            case 'stammdaten':
                return this.renderStammdatenSetup();
            case 'auto':
                return this.renderAutoSetup();
            default:
                return this.renderPathSelection();
        }
    }

    renderDirectSetup() {
        return `
            <div class="setup-card">
                <div class="setup-header">
                    <span class="setup-icon">📤</span>
                    <div>
                        <h2>Direkt-Upload einrichten</h2>
                        <p>Der einfachste Weg – keine Einrichtung nötig!</p>
                    </div>
                </div>

                <div class="setup-done">
                    <div class="done-icon">✅</div>
                    <h3>Sie sind bereits startklar!</h3>
                    <p>Der Direkt-Upload funktioniert sofort über den Inventur-Agenten.</p>
                </div>

                <div class="how-it-works">
                    <h4>So funktioniert's:</h4>
                    <ol class="steps-list">
                        <li>
                            <span class="step-num">1</span>
                            <div>
                                <strong>Inventur-Anfrage erhalten</strong>
                                <p>Sie bekommen eine Inventur-Anfrage von BMW</p>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">2</span>
                            <div>
                                <strong>Daten aus Ihrem System exportieren</strong>
                                <p>Excel, CSV oder Screenshot aus Ihrem Werkzeug-Management</p>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">3</span>
                            <div>
                                <strong>Im Inventur-Agent hochladen</strong>
                                <p>Der Agent erkennt die Daten und ordnet sie zu</p>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">4</span>
                            <div>
                                <strong>Prüfen und absenden</strong>
                                <p>Kurz kontrollieren und Inventur abschließen</p>
                            </div>
                        </li>
                    </ol>
                </div>

                <div class="supported-formats">
                    <h4>Unterstützte Formate:</h4>
                    <div class="format-tags">
                        <span class="format-tag">📊 Excel (.xlsx)</span>
                        <span class="format-tag">📄 CSV</span>
                        <span class="format-tag">📷 Screenshots</span>
                        <span class="format-tag">📋 Kopierte Tabellen</span>
                    </div>
                </div>

                <div class="setup-actions">
                    <button class="btn btn-neutral" id="backToSelectionBtn">← Andere Methode wählen</button>
                    <button class="btn btn-primary" id="goToInventurAgentBtn">Zum Inventur-Agent →</button>
                </div>
            </div>
        `;
    }

    renderStammdatenSetup() {
        const supplierInfo = this.getSupplierInfo();
        const existingStammdaten = this.getExistingStammdaten();

        return `
            <div class="setup-card">
                <div class="setup-header">
                    <span class="setup-icon">📅</span>
                    <div>
                        <h2>Stammdaten-Sync einrichten</h2>
                        <p>Einmal hochladen, bei Inventuren nur noch bestätigen</p>
                    </div>
                </div>

                ${existingStammdaten ? `
                <div class="existing-stammdaten-info">
                    <div class="info-icon">ℹ️</div>
                    <div class="info-content">
                        <strong>Sie haben bereits Stammdaten hinterlegt</strong>
                        <p>${existingStammdaten.toolCount} Werkzeuge, hochgeladen am ${new Date(existingStammdaten.uploadDate).toLocaleDateString('de-DE')}</p>
                        <button class="btn btn-sm btn-neutral" id="viewExistingBtn">Anzeigen</button>
                        <button class="btn btn-sm btn-neutral" id="deleteExistingBtn">Löschen & neu hochladen</button>
                    </div>
                </div>
                ` : ''}

                <div class="setup-steps">
                    <div class="setup-step active">
                        <div class="setup-step-header">
                            <span class="step-num">1</span>
                            <h4>Werkzeugliste vorbereiten</h4>
                        </div>
                        <div class="setup-step-body">
                            <p>Exportieren Sie Ihre <strong>vollständige Werkzeugliste</strong> aus Ihrem System.</p>

                            <div class="template-download">
                                <p>Nutzen Sie unsere Vorlage für optimale Erkennung:</p>
                                <button class="btn btn-secondary" id="downloadTemplateBtn">
                                    📥 Excel-Vorlage herunterladen
                                </button>
                                <span class="template-hint">Vorlage enthält Ihre Werkzeuge mit aktuellen Adressen</span>
                            </div>

                            <div class="required-fields">
                                <h5>Spalten in der Vorlage:</h5>
                                <table class="fields-table">
                                    <tr>
                                        <td><strong>Inventarnummer</strong></td>
                                        <td>BMW-Inventarnummer</td>
                                        <td class="required">Pflicht</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Standort (Adresse)</strong></td>
                                        <td>Adresse, an der sich das Werkzeug befindet</td>
                                        <td class="required">Pflicht</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Bezeichnung</strong></td>
                                        <td>Name des Werkzeugs</td>
                                        <td class="optional">Optional</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Zustand</strong></td>
                                        <td>OK, Beschädigt, In Reparatur</td>
                                        <td class="optional">Optional</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="alternative-option">
                                <h5>📧 Alternative: Per E-Mail senden</h5>
                                <p>Senden Sie Ihre Werkzeugliste direkt an:</p>
                                <div class="email-display">
                                    <code>inventurdaten@organizingcompanyassets.com</code>
                                    <button class="copy-btn" id="copyStammdatenEmailBtn" title="Kopieren">📋</button>
                                </div>
                                <p class="email-hint">Betreff: Stammdaten ${supplierInfo.number}</p>
                            </div>
                        </div>
                    </div>

                    <div class="setup-step">
                        <div class="setup-step-header">
                            <span class="step-num">2</span>
                            <h4>Stammdaten hochladen</h4>
                        </div>
                        <div class="setup-step-body">
                            <div class="upload-area" id="stammdatenUploadArea">
                                <div class="upload-icon">📁</div>
                                <p>Datei hierher ziehen oder klicken zum Auswählen</p>
                                <span class="upload-hint">Excel (.xlsx) oder CSV, max. 10 MB</span>
                                <input type="file" id="stammdatenFileInput" accept=".xlsx,.xls,.csv" hidden>
                            </div>

                            <div class="upload-status" id="uploadStatus" style="display: none;">
                                <div class="status-icon" id="uploadStatusIcon">⏳</div>
                                <div class="status-text">
                                    <strong id="uploadFileName">datei.xlsx</strong>
                                    <span id="uploadFileInfo">Wird analysiert...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setup-step" id="mappingStep" style="display: none;">
                        <div class="setup-step-header">
                            <span class="step-num">3</span>
                            <h4>Spalten-Zuordnung prüfen</h4>
                        </div>
                        <div class="setup-step-body">
                            <p>Wir haben folgende Spalten erkannt:</p>
                            <div class="mapping-preview" id="mappingPreview">
                                <!-- Wird dynamisch gefüllt -->
                            </div>
                            <div class="data-preview" id="dataPreview">
                                <!-- Vorschau der ersten Zeilen -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reminder-setup">
                    <h4>🔔 Erinnerung einrichten</h4>
                    <p>Wir erinnern Sie an <strong>${supplierInfo.email}</strong>, wenn es Zeit für ein Update ist:</p>
                    <div class="reminder-options">
                        <label class="reminder-option">
                            <input type="radio" name="reminder" value="6" checked>
                            <span>Alle 6 Monate</span>
                        </label>
                        <label class="reminder-option">
                            <input type="radio" name="reminder" value="12">
                            <span>Jährlich</span>
                        </label>
                        <label class="reminder-option">
                            <input type="radio" name="reminder" value="0">
                            <span>Keine Erinnerung</span>
                        </label>
                    </div>
                </div>

                <div class="setup-actions">
                    <button class="btn btn-neutral" id="backToSelectionBtn">← Andere Methode wählen</button>
                    <button class="btn btn-primary" id="saveStammdatenBtn" disabled>Stammdaten speichern</button>
                </div>
            </div>
        `;
    }

    // Prüfe ob bereits Stammdaten existieren
    getExistingStammdaten() {
        try {
            const saved = localStorage.getItem('orca_stammdaten');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Fehler beim Laden der Stammdaten:', e);
        }
        return null;
    }

    renderAutoSetup() {
        return `
            <div class="setup-card">
                <div class="setup-header">
                    <span class="setup-icon">🔄</span>
                    <div>
                        <h2>Auto-Export einrichten</h2>
                        <p>Ihr System liefert automatisch – ORCA holt ab</p>
                    </div>
                </div>

                <div class="auto-method-selection">
                    <h4>Wie kann Ihr System Daten exportieren?</h4>

                    <div class="method-cards">
                        <div class="method-card ${this.config.syncMethod === 'cloud' ? 'selected' : ''}" data-method="cloud">
                            <span class="method-icon">☁️</span>
                            <h5>Cloud-Ordner</h5>
                            <p>OneDrive, SharePoint, Google Drive, Dropbox</p>
                        </div>

                        <div class="method-card ${this.config.syncMethod === 'email' ? 'selected' : ''}" data-method="email">
                            <span class="method-icon">📧</span>
                            <h5>E-Mail</h5>
                            <p>Automatischer Versand an ORCA-Adresse</p>
                        </div>

                        <div class="method-card ${this.config.syncMethod === 'sftp' ? 'selected' : ''}" data-method="sftp">
                            <span class="method-icon">🖥️</span>
                            <h5>SFTP/FTP</h5>
                            <p>Klassischer Dateitransfer</p>
                        </div>
                    </div>
                </div>

                <div class="method-details" id="methodDetails">
                    ${this.renderMethodDetails()}
                </div>

                <div class="auto-schedule">
                    <h4>📆 Wie oft soll synchronisiert werden?</h4>
                    <div class="schedule-options">
                        <label class="schedule-option">
                            <input type="radio" name="schedule" value="daily">
                            <span>Täglich</span>
                        </label>
                        <label class="schedule-option">
                            <input type="radio" name="schedule" value="weekly" checked>
                            <span>Wöchentlich</span>
                        </label>
                        <label class="schedule-option">
                            <input type="radio" name="schedule" value="monthly">
                            <span>Monatlich</span>
                        </label>
                    </div>
                </div>

                <div class="setup-actions">
                    <button class="btn btn-neutral" id="backToSelectionBtn">← Andere Methode wählen</button>
                    <button class="btn btn-primary" id="testAutoConnectionBtn" ${!this.config.syncMethod ? 'disabled' : ''}>
                        Verbindung testen →
                    </button>
                </div>
            </div>
        `;
    }

    renderMethodDetails() {
        if (!this.config.syncMethod) {
            return '<p class="method-hint">Wählen Sie oben eine Methode aus.</p>';
        }

        switch (this.config.syncMethod) {
            case 'cloud':
                return `
                    <div class="method-config">
                        <h5>Cloud-Ordner einrichten</h5>
                        <ol>
                            <li>Erstellen Sie einen Ordner für ORCA-Exporte in Ihrem Cloud-Speicher</li>
                            <li>Teilen Sie den Ordner mit: <code>import@orca-software.com</code></li>
                            <li>Legen Sie Ihre Export-Datei dort ab (Excel oder CSV)</li>
                        </ol>
                        <div class="method-input">
                            <label>Link zum geteilten Ordner:</label>
                            <input type="url" placeholder="https://onedrive.com/share/..." id="cloudFolderUrl">
                        </div>
                    </div>
                `;
            case 'email':
                return `
                    <div class="method-config">
                        <h5>E-Mail-Export einrichten</h5>
                        <p>Konfigurieren Sie Ihr System so, dass es Exporte an diese Adresse sendet:</p>
                        <div class="email-address">
                            <code>stammdaten-${this.generateSupplierCode()}@import.orca-software.com</code>
                            <button class="copy-btn" id="copyEmailBtn">📋</button>
                        </div>
                        <p class="hint">Die Datei kann als Anhang oder im Body als CSV gesendet werden.</p>
                    </div>
                `;
            case 'sftp':
                return `
                    <div class="method-config">
                        <h5>SFTP-Verbindung einrichten</h5>
                        <div class="sftp-credentials">
                            <div class="credential-row">
                                <label>Server:</label>
                                <code>sftp.orca-software.com</code>
                            </div>
                            <div class="credential-row">
                                <label>Port:</label>
                                <code>22</code>
                            </div>
                            <div class="credential-row">
                                <label>Benutzer:</label>
                                <code>supplier_${this.generateSupplierCode()}</code>
                            </div>
                            <div class="credential-row">
                                <label>Verzeichnis:</label>
                                <code>/upload/</code>
                            </div>
                        </div>
                        <div class="method-input">
                            <label>Ihr öffentlicher SSH-Schlüssel (optional):</label>
                            <textarea placeholder="ssh-rsa AAAA..." id="sshKey" rows="3"></textarea>
                        </div>
                        <button class="btn btn-secondary" id="generatePasswordBtn">🔑 Passwort generieren</button>
                    </div>
                `;
            default:
                return '';
        }
    }

    renderTestStep() {
        return `
            <div class="setup-card">
                <div class="setup-header">
                    <span class="setup-icon">🧪</span>
                    <div>
                        <h2>Verbindung testen</h2>
                        <p>Wir prüfen, ob alles funktioniert</p>
                    </div>
                </div>

                <div class="test-progress">
                    <div class="test-item" id="testConnection">
                        <span class="test-status pending">○</span>
                        <span class="test-label">Verbindung prüfen</span>
                    </div>
                    <div class="test-item" id="testFile">
                        <span class="test-status pending">○</span>
                        <span class="test-label">Datei gefunden</span>
                    </div>
                    <div class="test-item" id="testFormat">
                        <span class="test-status pending">○</span>
                        <span class="test-label">Format erkannt</span>
                    </div>
                    <div class="test-item" id="testMapping">
                        <span class="test-status pending">○</span>
                        <span class="test-label">Daten zugeordnet</span>
                    </div>
                </div>

                <div class="test-result" id="testResult" style="display: none;">
                    <!-- Wird nach Test gefüllt -->
                </div>

                <div class="setup-actions">
                    <button class="btn btn-neutral" id="backToSetupBtn">← Zurück</button>
                    <button class="btn btn-primary" id="runTestBtn">Test starten</button>
                </div>
            </div>
        `;
    }

    renderCompleteStep() {
        const pathNames = {
            'direct': 'Direkt-Upload',
            'stammdaten': 'Stammdaten-Sync',
            'auto': 'Auto-Export'
        };
        const pathIcons = {
            'direct': '📤',
            'stammdaten': '📅',
            'auto': '🔄'
        };

        return `
            <div class="setup-card complete">
                <div class="complete-icon">✅</div>
                <h2>Einrichtung abgeschlossen!</h2>
                <p class="complete-text">
                    Sie nutzen jetzt <strong>${pathIcons[this.selectedPath]} ${pathNames[this.selectedPath]}</strong>
                </p>

                <div class="next-steps-card">
                    <h4>Nächste Schritte:</h4>
                    ${this.getNextStepsForPath()}
                </div>

                <div class="setup-actions">
                    <button class="btn btn-neutral" id="backToAgentsBtn2">Zur Agenten-Übersicht</button>
                    ${this.selectedPath === 'direct' ?
                        '<button class="btn btn-primary" id="goToInventurAgentBtn2">Zum Inventur-Agent →</button>' :
                        '<button class="btn btn-primary" id="viewStatusBtn">Status anzeigen →</button>'
                    }
                </div>
            </div>
        `;
    }

    getNextStepsForPath() {
        const stammdaten = this.getExistingStammdaten();
        const reminderDate = stammdaten?.nextReminder
            ? new Date(stammdaten.nextReminder).toLocaleDateString('de-DE')
            : 'in 6 Monaten';

        switch (this.selectedPath) {
            case 'direct':
                return `
                    <ol>
                        <li>Wenn eine Inventur-Anfrage kommt, öffnen Sie den <strong>Inventur-Agent</strong></li>
                        <li>Exportieren Sie Ihre Werkzeugdaten aus Ihrem System</li>
                        <li>Laden Sie die Datei hoch – der Agent erledigt den Rest</li>
                    </ol>
                `;
            case 'stammdaten':
                return `
                    <ol>
                        <li>Ihre Stammdaten wurden gespeichert (${stammdaten?.toolCount || 0} Werkzeuge)</li>
                        <li>Bei der nächsten Inventur sind die Daten <strong>vorausgefüllt</strong></li>
                        <li>Erinnerung: ${reminderDate}</li>
                    </ol>
                    <div class="reminder-actions">
                        <button class="btn btn-sm btn-secondary" id="testReminderBtn">
                            📧 Erinnerungs-Mail Vorschau
                        </button>
                    </div>
                `;
            case 'auto':
                return `
                    <ol>
                        <li>Die automatische Synchronisation ist aktiv</li>
                        <li>Ihre Daten werden ${this.config.schedule === 'daily' ? 'täglich' : this.config.schedule === 'weekly' ? 'wöchentlich' : 'monatlich'} abgeholt</li>
                        <li>Bei Inventuren sind die Daten immer aktuell</li>
                    </ol>
                `;
            default:
                return '';
        }
    }

    generateSupplierCode() {
        // In reality, this would be the actual supplier ID
        return 'DRX133188';
    }

    attachEventListeners() {
        // Back to agents
        document.getElementById('backToAgentsBtn')?.addEventListener('click', () => {
            router.navigate('/agenten');
        });
        document.getElementById('backToAgentsBtn2')?.addEventListener('click', () => {
            router.navigate('/agenten');
        });

        // Path selection
        document.querySelectorAll('.path-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedPath = btn.dataset.path;
                this.currentStep = 'setup';
                this.render();
            });
        });

        document.querySelectorAll('.path-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedPath = card.dataset.path;
                this.currentStep = 'setup';
                this.render();
            });
        });

        // Back to selection
        document.getElementById('backToSelectionBtn')?.addEventListener('click', () => {
            this.currentStep = 'selection';
            this.selectedPath = null;
            this.render();
        });

        // Direct path - go to inventur agent
        document.getElementById('goToInventurAgentBtn')?.addEventListener('click', () => {
            router.navigate('/agent-inventur');
        });
        document.getElementById('goToInventurAgentBtn2')?.addEventListener('click', () => {
            router.navigate('/agent-inventur');
        });

        // Stammdaten upload
        const uploadArea = document.getElementById('stammdatenUploadArea');
        const fileInput = document.getElementById('stammdatenFileInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    this.handleStammdatenFile(e.dataTransfer.files[0]);
                }
            });
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    this.handleStammdatenFile(fileInput.files[0]);
                }
            });
        }

        // Save stammdaten
        document.getElementById('saveStammdatenBtn')?.addEventListener('click', () => {
            if (this.saveStammdaten()) {
                this.currentStep = 'complete';
                this.render();
            }
        });

        // Copy Stammdaten email
        document.getElementById('copyStammdatenEmailBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText('inventurdaten@organizingcompanyassets.com');
            const btn = document.getElementById('copyStammdatenEmailBtn');
            btn.textContent = '✓';
            setTimeout(() => btn.textContent = '📋', 2000);
        });

        // View existing stammdaten
        document.getElementById('viewExistingBtn')?.addEventListener('click', () => {
            const stammdaten = this.getExistingStammdaten();
            if (stammdaten) {
                alert(`Gespeicherte Stammdaten:\n\n` +
                    `Anzahl Werkzeuge: ${stammdaten.toolCount}\n` +
                    `Hochgeladen: ${new Date(stammdaten.uploadDate).toLocaleDateString('de-DE')}\n` +
                    `Nächste Erinnerung: ${stammdaten.nextReminder ? new Date(stammdaten.nextReminder).toLocaleDateString('de-DE') : 'Keine'}\n\n` +
                    `Erste 5 Werkzeuge:\n` +
                    stammdaten.tools.slice(0, 5).map(t => `- ${t.toolNumber}: ${t.location}`).join('\n'));
            }
        });

        // Delete existing stammdaten
        document.getElementById('deleteExistingBtn')?.addEventListener('click', () => {
            if (confirm('Möchten Sie die gespeicherten Stammdaten wirklich löschen?')) {
                localStorage.removeItem('orca_stammdaten');
                this.render();
            }
        });

        // Auto method selection
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => {
                this.config.syncMethod = card.dataset.method;
                document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('methodDetails').innerHTML = this.renderMethodDetails();
                document.getElementById('testAutoConnectionBtn').disabled = false;
                this.attachMethodListeners();
            });
        });

        // Test connection
        document.getElementById('testAutoConnectionBtn')?.addEventListener('click', () => {
            this.currentStep = 'test';
            this.render();
        });

        document.getElementById('runTestBtn')?.addEventListener('click', () => {
            this.runConnectionTest();
        });

        document.getElementById('backToSetupBtn')?.addEventListener('click', () => {
            this.currentStep = 'setup';
            this.render();
        });

        // View status
        document.getElementById('viewStatusBtn')?.addEventListener('click', () => {
            router.navigate('/agent-api-monitor');
        });

        // Test reminder email
        document.getElementById('testReminderBtn')?.addEventListener('click', () => {
            const email = this.generateReminderEmail();
            if (email) {
                const preview = `An: ${email.to}\nBetreff: ${email.subject}\n\n${email.body}`;
                if (confirm(preview + '\n\n---\nMöchten Sie diese E-Mail jetzt öffnen?')) {
                    this.openReminderMailClient();
                }
            }
        });

        // Template download
        document.getElementById('downloadTemplateBtn')?.addEventListener('click', () => {
            this.downloadTemplate();
        });

        this.attachMethodListeners();
    }

    attachMethodListeners() {
        // Copy email button
        document.getElementById('copyEmailBtn')?.addEventListener('click', () => {
            const email = `stammdaten-${this.generateSupplierCode()}@import.orca-software.com`;
            navigator.clipboard.writeText(email);
            const btn = document.getElementById('copyEmailBtn');
            btn.textContent = '✓';
            setTimeout(() => btn.textContent = '📋', 2000);
        });

        // Generate password
        document.getElementById('generatePasswordBtn')?.addEventListener('click', () => {
            alert('Passwort wurde an Ihre E-Mail gesendet.');
        });
    }

    async handleStammdatenFile(file) {
        const statusEl = document.getElementById('uploadStatus');
        const statusIcon = document.getElementById('uploadStatusIcon');
        const saveBtn = document.getElementById('saveStammdatenBtn');
        const mappingStep = document.getElementById('mappingStep');

        document.getElementById('uploadFileName').textContent = file.name;
        document.getElementById('uploadFileInfo').textContent = 'Wird analysiert...';
        statusIcon.textContent = '⏳';
        statusEl.style.display = 'flex';

        try {
            // Excel-Datei parsen mit xlsx library
            const data = await this.parseExcelFile(file);

            if (data && data.length > 0) {
                // Spalten erkennen
                const headers = Object.keys(data[0]);
                this.detectedColumns = this.detectColumnMapping(headers);
                this.uploadedStammdaten = data;

                // Status aktualisieren
                statusIcon.textContent = '✅';
                document.getElementById('uploadFileInfo').textContent = `${data.length} Werkzeuge erkannt`;

                // Mapping-Vorschau anzeigen
                mappingStep.style.display = 'block';
                this.renderMappingPreview(headers, data);

                // Speichern aktivieren
                saveBtn.disabled = false;
            } else {
                throw new Error('Keine Daten gefunden');
            }
        } catch (error) {
            statusIcon.textContent = '❌';
            document.getElementById('uploadFileInfo').textContent = `Fehler: ${error.message}`;
            saveBtn.disabled = true;
        }
    }

    // Excel-Datei parsen
    parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        reject(new Error('Keine Daten in der Datei'));
                    } else {
                        resolve(jsonData);
                    }
                } catch (error) {
                    reject(new Error('Datei konnte nicht gelesen werden'));
                }
            };

            reader.onerror = () => reject(new Error('Datei konnte nicht geladen werden'));
            reader.readAsBinaryString(file);
        });
    }

    // Automatische Spalten-Erkennung
    detectColumnMapping(headers) {
        const mapping = {
            toolNumber: null,
            location: null,
            name: null,
            condition: null
        };

        const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

        // Werkzeugnummer erkennen
        const toolNumberPatterns = ['werkzeugnummer', 'inventarnummer', 'toolnumber', 'inventorynumber', 'nummer', 'id', 'asset', 'tool'];
        for (let i = 0; i < headers.length; i++) {
            if (toolNumberPatterns.some(p => normalizedHeaders[i].includes(p))) {
                mapping.toolNumber = headers[i];
                break;
            }
        }

        // Standort erkennen
        const locationPatterns = ['standort', 'location', 'ort', 'gebäude', 'halle', 'building', 'site', 'adresse'];
        for (let i = 0; i < headers.length; i++) {
            if (locationPatterns.some(p => normalizedHeaders[i].includes(p))) {
                mapping.location = headers[i];
                break;
            }
        }

        // Bezeichnung erkennen
        const namePatterns = ['bezeichnung', 'name', 'beschreibung', 'description', 'titel', 'title'];
        for (let i = 0; i < headers.length; i++) {
            if (namePatterns.some(p => normalizedHeaders[i].includes(p))) {
                mapping.name = headers[i];
                break;
            }
        }

        // Zustand erkennen
        const conditionPatterns = ['zustand', 'condition', 'status', 'state'];
        for (let i = 0; i < headers.length; i++) {
            if (conditionPatterns.some(p => normalizedHeaders[i].includes(p))) {
                mapping.condition = headers[i];
                break;
            }
        }

        return mapping;
    }

    // Mapping-Vorschau rendern
    renderMappingPreview(headers, data) {
        const mappingEl = document.getElementById('mappingPreview');
        const previewEl = document.getElementById('dataPreview');

        // Mapping-Tabelle
        mappingEl.innerHTML = `
            <table class="mapping-table">
                <tr>
                    <th>ORCA-Feld</th>
                    <th>Ihre Spalte</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>Werkzeugnummer</td>
                    <td>
                        <select id="mapToolNumber" class="mapping-select">
                            <option value="">-- Wählen --</option>
                            ${headers.map(h => `<option value="${h}" ${this.detectedColumns.toolNumber === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </td>
                    <td>${this.detectedColumns.toolNumber ? '✅ Erkannt' : '⚠️ Bitte wählen'}</td>
                </tr>
                <tr>
                    <td>Standort</td>
                    <td>
                        <select id="mapLocation" class="mapping-select">
                            <option value="">-- Wählen --</option>
                            ${headers.map(h => `<option value="${h}" ${this.detectedColumns.location === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </td>
                    <td>${this.detectedColumns.location ? '✅ Erkannt' : '⚠️ Bitte wählen'}</td>
                </tr>
                <tr>
                    <td>Bezeichnung</td>
                    <td>
                        <select id="mapName" class="mapping-select">
                            <option value="">-- Optional --</option>
                            ${headers.map(h => `<option value="${h}" ${this.detectedColumns.name === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </td>
                    <td>${this.detectedColumns.name ? '✅ Erkannt' : '➖ Optional'}</td>
                </tr>
                <tr>
                    <td>Zustand</td>
                    <td>
                        <select id="mapCondition" class="mapping-select">
                            <option value="">-- Optional --</option>
                            ${headers.map(h => `<option value="${h}" ${this.detectedColumns.condition === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </td>
                    <td>${this.detectedColumns.condition ? '✅ Erkannt' : '➖ Optional'}</td>
                </tr>
            </table>
        `;

        // Daten-Vorschau (erste 5 Zeilen)
        const previewData = data.slice(0, 5);
        previewEl.innerHTML = `
            <h5>Vorschau (erste ${previewData.length} Zeilen):</h5>
            <div class="preview-table-wrapper">
                <table class="preview-table">
                    <tr>
                        ${headers.slice(0, 5).map(h => `<th>${h}</th>`).join('')}
                        ${headers.length > 5 ? '<th>...</th>' : ''}
                    </tr>
                    ${previewData.map(row => `
                        <tr>
                            ${headers.slice(0, 5).map(h => `<td>${row[h] || '-'}</td>`).join('')}
                            ${headers.length > 5 ? '<td>...</td>' : ''}
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;

        // Event-Listener für Mapping-Änderungen
        ['mapToolNumber', 'mapLocation', 'mapName', 'mapCondition'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const field = id.replace('map', '').toLowerCase();
                if (field === 'toolnumber') this.detectedColumns.toolNumber = e.target.value;
                if (field === 'location') this.detectedColumns.location = e.target.value;
                if (field === 'name') this.detectedColumns.name = e.target.value;
                if (field === 'condition') this.detectedColumns.condition = e.target.value;
            });
        });
    }

    // Stammdaten speichern
    saveStammdaten() {
        if (!this.uploadedStammdaten || !this.detectedColumns.toolNumber) {
            alert('Bitte laden Sie eine Datei hoch und wählen Sie mindestens die Werkzeugnummer-Spalte.');
            return false;
        }

        const supplierInfo = this.getSupplierInfo();
        const reminderMonths = document.querySelector('input[name="reminder"]:checked')?.value || '6';

        // Daten normalisieren
        const normalizedData = this.uploadedStammdaten.map(row => ({
            toolNumber: String(row[this.detectedColumns.toolNumber] || '').trim(),
            location: this.detectedColumns.location ? String(row[this.detectedColumns.location] || '').trim() : '',
            name: this.detectedColumns.name ? String(row[this.detectedColumns.name] || '').trim() : '',
            condition: this.detectedColumns.condition ? String(row[this.detectedColumns.condition] || '').trim() : 'OK'
        })).filter(row => row.toolNumber); // Nur Zeilen mit Werkzeugnummer

        // In localStorage speichern
        const stammdatenPackage = {
            supplierNumber: supplierInfo.number,
            supplierEmail: supplierInfo.email,
            uploadDate: new Date().toISOString(),
            toolCount: normalizedData.length,
            reminderMonths: parseInt(reminderMonths),
            nextReminder: this.calculateNextReminder(parseInt(reminderMonths)),
            mapping: this.detectedColumns,
            tools: normalizedData
        };

        localStorage.setItem('orca_stammdaten', JSON.stringify(stammdatenPackage));
        console.log(`✅ Stammdaten gespeichert: ${normalizedData.length} Werkzeuge`);

        return true;
    }

    calculateNextReminder(months) {
        if (months === 0) return null;
        const next = new Date();
        next.setMonth(next.getMonth() + months);
        return next.toISOString();
    }

    // Erinnerungs-Mail generieren
    generateReminderEmail() {
        const supplierInfo = this.getSupplierInfo();
        const stammdaten = this.getExistingStammdaten();

        if (!stammdaten) return null;

        const uploadDate = new Date(stammdaten.uploadDate).toLocaleDateString('de-DE');
        const nextReminder = stammdaten.nextReminder
            ? new Date(stammdaten.nextReminder).toLocaleDateString('de-DE')
            : 'Nicht festgelegt';

        return {
            to: supplierInfo.email,
            subject: `ORCA Stammdaten-Update erforderlich - Lieferant ${supplierInfo.number}`,
            body: `Guten Tag,

Ihre ORCA Werkzeug-Stammdaten wurden zuletzt am ${uploadDate} aktualisiert.

Aktueller Stand:
- ${stammdaten.toolCount} Werkzeuge hinterlegt
- Letzte Aktualisierung: ${uploadDate}

Um bei anstehenden Inventuren schnell reagieren zu können, empfehlen wir eine regelmäßige Aktualisierung Ihrer Stammdaten.

So aktualisieren Sie Ihre Daten:
1. Öffnen Sie ORCA 2.0
2. Gehen Sie zu Agenten → Integrations-Assistent
3. Wählen Sie "Stammdaten-Sync"
4. Laden Sie Ihre aktuelle Werkzeugliste hoch

Bei Fragen wenden Sie sich an inventurdaten@organizingcompanyassets.com

Mit freundlichen Grüßen
Ihr ORCA-Team

---
Diese E-Mail wurde automatisch generiert.
Nächste geplante Erinnerung: ${nextReminder}
Lieferanten-Nr.: ${supplierInfo.number}`
        };
    }

    // E-Mail-Client öffnen für Erinnerung
    openReminderMailClient() {
        const email = this.generateReminderEmail();
        if (!email) return;

        const mailtoLink = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
        window.location.href = mailtoLink;
    }

    async runConnectionTest() {
        const steps = ['testConnection', 'testFile', 'testFormat', 'testMapping'];
        const resultEl = document.getElementById('testResult');

        for (const stepId of steps) {
            const stepEl = document.getElementById(stepId);
            const statusEl = stepEl.querySelector('.test-status');

            statusEl.textContent = '⏳';
            statusEl.classList.remove('pending');
            statusEl.classList.add('testing');

            await new Promise(resolve => setTimeout(resolve, 800));

            statusEl.textContent = '✅';
            statusEl.classList.remove('testing');
            statusEl.classList.add('success');
        }

        // Show result
        resultEl.innerHTML = `
            <div class="test-success">
                <h4>✅ Alle Tests erfolgreich!</h4>
                <p>Die Verbindung funktioniert. Ihre Daten werden automatisch synchronisiert.</p>
                <button class="btn btn-primary" id="finishSetupBtn">Einrichtung abschließen</button>
            </div>
        `;
        resultEl.style.display = 'block';

        document.getElementById('finishSetupBtn')?.addEventListener('click', () => {
            this.currentStep = 'complete';
            this.render();
        });
    }

    async downloadTemplate() {
        const supplierInfo = this.getSupplierInfo();

        // Lade echte Werkzeugdaten aus FM-Akte
        const assets = this.getSupplierAssets();

        // Excel-Daten mit Header
        const templateData = [
            ['Inventarnummer', 'Standort (Adresse)', 'Bezeichnung', 'Zustand']
        ];

        // Echte Werkzeugdaten hinzufügen (nur inventurrelevante Felder)
        if (assets && assets.length > 0) {
            assets.forEach(asset => {
                templateData.push([
                    asset.inventoryNumber || asset.toolNumber || '',
                    asset.locationDetail || asset.location || '', // Adresse
                    asset.name || '',
                    'OK' // Standard-Zustand, Lieferant kann ändern
                ]);
            });
        } else {
            // Fallback: Leere Zeilen wenn keine Daten
            for (let i = 0; i < 10; i++) {
                templateData.push(['', '', '', 'OK']);
            }
        }

        // Excel-Datei erstellen
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // Spaltenbreiten
        ws['!cols'] = [
            { wch: 18 }, // Inventarnummer
            { wch: 40 }, // Standort (Adresse)
            { wch: 30 }, // Bezeichnung
            { wch: 12 }  // Zustand
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Stammdaten');

        // Download
        const fileName = `ORCA_Stammdaten_${supplierInfo.number}_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        console.log(`📥 Excel mit ${assets?.length || 0} Werkzeugen heruntergeladen: ${fileName}`);
    }

    // Echte Werkzeugdaten des Lieferanten laden
    getSupplierAssets() {
        try {
            if (typeof api !== 'undefined' && api.mockToolsCache) {
                // Nur inventurrelevante Felder extrahieren
                return api.mockToolsCache.map(asset => ({
                    inventoryNumber: asset.inventoryNumber || asset.toolNumber,
                    location: asset.location,
                    locationDetail: asset.locationDetail,
                    name: asset.name
                }));
            }
        } catch (e) {
            console.warn('Konnte Werkzeugdaten nicht laden:', e);
        }
        return [];
    }

    addStyles() {
        if (document.getElementById('integration-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'integration-styles';
        styles.textContent = `
            .integration-page {
                padding: 1.5rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            .integration-header {
                margin-bottom: 1.5rem;
            }

            .back-btn {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 0.9rem;
                padding: 0.5rem 0;
            }

            .back-btn:hover {
                color: #374151;
            }

            /* Selection Intro */
            .selection-intro {
                text-align: center;
                margin-bottom: 2.5rem;
            }

            .selection-intro h1 {
                font-size: 1.75rem;
                color: #1f2937;
                margin-bottom: 0.75rem;
            }

            .intro-text {
                color: #6b7280;
                max-width: 600px;
                margin: 0 auto;
                line-height: 1.6;
            }

            /* Path Cards */
            .path-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1.5rem;
                margin-bottom: 2.5rem;
            }

            .path-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 1.75rem;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }

            .path-card:hover {
                border-color: #3b82f6;
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
                transform: translateY(-4px);
            }

            .path-card.recommended {
                border-color: #3b82f6;
            }

            .recommended-badge {
                position: absolute;
                top: -10px;
                right: 20px;
                background: #3b82f6;
                color: white;
                font-size: 0.75rem;
                font-weight: 600;
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
            }

            .path-header {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .path-icon {
                font-size: 2rem;
            }

            .path-title h2 {
                margin: 0;
                font-size: 1.25rem;
            }

            .path-subtitle {
                font-size: 0.85rem;
                color: #6b7280;
            }

            .path-effort {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: #f8fafc;
                border-radius: 8px;
            }

            .effort-item {
                flex: 1;
            }

            .effort-label {
                display: block;
                font-size: 0.75rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .effort-value {
                font-weight: 600;
                font-size: 0.9rem;
            }

            .effort-value.good {
                color: #15803d;
            }

            .effort-value.neutral {
                color: #92400e;
            }

            .path-description {
                color: #4b5563;
                font-size: 0.9rem;
                line-height: 1.5;
                margin-bottom: 1rem;
            }

            .path-flow {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
                font-size: 0.8rem;
                color: #6b7280;
                padding: 0.75rem;
                background: #f0f9ff;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .path-flow .arrow {
                color: #3b82f6;
            }

            .path-for {
                font-size: 0.85rem;
                color: #6b7280;
                margin-bottom: 1.25rem;
            }

            .path-btn {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .path-btn:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }

            .path-btn.primary {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }

            .path-btn.primary:hover {
                background: #2563eb;
            }

            /* Comparison Table */
            .comparison-section {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .comparison-section h3 {
                margin: 0 0 1rem 0;
                font-size: 1rem;
            }

            .comparison-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }

            .comparison-table th,
            .comparison-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }

            .comparison-table th {
                background: #f8fafc;
                font-weight: 600;
            }

            .badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .badge.good {
                background: #dcfce7;
                color: #15803d;
            }

            .badge.neutral {
                background: #fef3c7;
                color: #92400e;
            }

            /* Help Section */
            .help-section {
                margin-top: 2rem;
            }

            .help-card {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                padding: 1.25rem;
            }

            .help-icon {
                font-size: 1.5rem;
            }

            .help-content h4 {
                margin: 0 0 0.5rem 0;
                color: #1e40af;
            }

            .help-content p {
                margin: 0;
                color: #1e40af;
                font-size: 0.9rem;
            }

            /* Setup Card */
            .setup-card {
                background: white;
                border-radius: 16px;
                padding: 2rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            .setup-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .setup-icon {
                font-size: 2.5rem;
            }

            .setup-header h2 {
                margin: 0;
            }

            .setup-header p {
                margin: 0.25rem 0 0 0;
                color: #6b7280;
            }

            /* Direct Setup - Done State */
            .setup-done {
                text-align: center;
                padding: 2rem;
                background: #f0fdf4;
                border-radius: 12px;
                margin-bottom: 2rem;
            }

            .done-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .setup-done h3 {
                margin: 0 0 0.5rem 0;
                color: #15803d;
            }

            .setup-done p {
                margin: 0;
                color: #166534;
            }

            /* How it works */
            .how-it-works {
                margin-bottom: 2rem;
            }

            .how-it-works h4 {
                margin: 0 0 1rem 0;
            }

            .steps-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .steps-list li {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1rem;
                border-left: 2px solid #e5e7eb;
                margin-left: 14px;
            }

            .steps-list li:last-child {
                border-left-color: transparent;
            }

            .steps-list .step-num {
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
                margin-left: -15px;
            }

            .steps-list li strong {
                display: block;
                margin-bottom: 0.25rem;
            }

            .steps-list li p {
                margin: 0;
                color: #6b7280;
                font-size: 0.9rem;
            }

            /* Supported formats */
            .supported-formats {
                background: #f8fafc;
                padding: 1.25rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            }

            .supported-formats h4 {
                margin: 0 0 0.75rem 0;
                font-size: 0.9rem;
            }

            .format-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .format-tag {
                background: white;
                border: 1px solid #e5e7eb;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                font-size: 0.85rem;
            }

            /* Setup Steps (Stammdaten) */
            .setup-steps {
                margin-bottom: 2rem;
            }

            .setup-step {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin-bottom: 1rem;
                overflow: hidden;
            }

            .setup-step-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: #f8fafc;
            }

            .setup-step-header .step-num {
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
            }

            .setup-step-header h4 {
                margin: 0;
            }

            .setup-step-body {
                padding: 1.25rem;
            }

            /* Upload Area */
            .upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .upload-area:hover,
            .upload-area.dragover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .upload-icon {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }

            .upload-hint {
                font-size: 0.8rem;
                color: #9ca3af;
            }

            .upload-status {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-top: 1rem;
                padding: 1rem;
                background: #f0fdf4;
                border-radius: 8px;
            }

            .upload-status .status-icon {
                font-size: 1.5rem;
            }

            .upload-status .status-text strong {
                display: block;
            }

            .upload-status .status-text span {
                font-size: 0.85rem;
                color: #15803d;
            }

            /* Required fields */
            .required-fields {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 8px;
            }

            .required-fields h5 {
                margin: 0 0 0.75rem 0;
                font-size: 0.9rem;
            }

            .fields-table {
                width: 100%;
                font-size: 0.85rem;
            }

            .fields-table td {
                padding: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .fields-table .required {
                color: #dc2626;
                font-weight: 500;
                font-size: 0.75rem;
            }

            .fields-table .optional {
                color: #6b7280;
                font-size: 0.75rem;
            }

            /* Template download */
            .template-download {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #eff6ff;
                border-radius: 8px;
            }

            .template-download p {
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
            }

            .template-hint {
                display: block;
                margin-top: 0.5rem;
                font-size: 0.8rem;
                color: #6b7280;
            }

            /* Alternative option (email) */
            .alternative-option {
                margin-top: 1.5rem;
                padding: 1rem;
                background: #fef3c7;
                border-radius: 8px;
            }

            .alternative-option h5 {
                margin: 0 0 0.5rem 0;
            }

            .alternative-option p {
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }

            .email-display {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #1e293b;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
            }

            .email-display code {
                flex: 1;
                color: #22c55e;
                font-family: monospace;
                font-size: 0.85rem;
            }

            .email-hint {
                font-size: 0.8rem;
                color: #92400e;
                margin-top: 0.5rem;
            }

            /* Existing stammdaten info */
            .existing-stammdaten-info {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                background: #dbeafe;
                border: 1px solid #93c5fd;
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            }

            .existing-stammdaten-info .info-icon {
                font-size: 1.25rem;
            }

            .existing-stammdaten-info .info-content strong {
                display: block;
                margin-bottom: 0.25rem;
            }

            .existing-stammdaten-info .info-content p {
                margin: 0 0 0.75rem 0;
                font-size: 0.85rem;
                color: #1e40af;
            }

            .btn-sm {
                padding: 0.35rem 0.75rem;
                font-size: 0.8rem;
                margin-right: 0.5rem;
            }

            /* Mapping preview */
            .mapping-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }

            .mapping-table th,
            .mapping-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }

            .mapping-table th {
                background: #f8fafc;
                font-weight: 600;
            }

            .mapping-select {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.85rem;
            }

            /* Data preview */
            .data-preview {
                margin-top: 1rem;
            }

            .data-preview h5 {
                margin: 0 0 0.5rem 0;
                font-size: 0.85rem;
                color: #6b7280;
            }

            .preview-table-wrapper {
                overflow-x: auto;
            }

            .preview-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8rem;
            }

            .preview-table th,
            .preview-table td {
                padding: 0.5rem;
                text-align: left;
                border: 1px solid #e5e7eb;
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .preview-table th {
                background: #f8fafc;
                font-weight: 600;
            }

            .preview-table tr:nth-child(even) {
                background: #f9fafb;
            }

            /* Reminder setup */
            .reminder-setup {
                background: #f8fafc;
                padding: 1.25rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }

            .reminder-setup h4 {
                margin: 0 0 0.5rem 0;
            }

            .reminder-setup > p {
                margin: 0 0 1rem 0;
                font-size: 0.9rem;
                color: #6b7280;
            }

            .reminder-options {
                display: flex;
                gap: 1rem;
            }

            .reminder-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }

            /* Auto method selection */
            .auto-method-selection {
                margin-bottom: 2rem;
            }

            .auto-method-selection h4 {
                margin: 0 0 1rem 0;
            }

            .method-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }

            .method-card {
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 1.25rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .method-card:hover {
                border-color: #3b82f6;
            }

            .method-card.selected {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .method-icon {
                font-size: 2rem;
                display: block;
                margin-bottom: 0.5rem;
            }

            .method-card h5 {
                margin: 0 0 0.25rem 0;
            }

            .method-card p {
                margin: 0;
                font-size: 0.8rem;
                color: #6b7280;
            }

            /* Method details */
            .method-details {
                margin-bottom: 2rem;
            }

            .method-hint {
                color: #6b7280;
                font-style: italic;
                text-align: center;
                padding: 2rem;
            }

            .method-config {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 12px;
            }

            .method-config h5 {
                margin: 0 0 1rem 0;
            }

            .method-config ol {
                margin: 0 0 1rem 0;
                padding-left: 1.25rem;
            }

            .method-config li {
                margin: 0.5rem 0;
            }

            .method-input {
                margin-top: 1rem;
            }

            .method-input label {
                display: block;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }

            .method-input input,
            .method-input textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.9rem;
            }

            .email-address {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #1e293b;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                margin: 0.5rem 0;
            }

            .email-address code {
                flex: 1;
                color: #22c55e;
                font-family: monospace;
                font-size: 0.85rem;
            }

            .copy-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
            }

            .sftp-credentials {
                background: #1e293b;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .credential-row {
                display: flex;
                padding: 0.5rem 0;
                border-bottom: 1px solid #374151;
            }

            .credential-row:last-child {
                border-bottom: none;
            }

            .credential-row label {
                width: 100px;
                color: #9ca3af;
                font-size: 0.85rem;
            }

            .credential-row code {
                color: #22c55e;
                font-family: monospace;
                font-size: 0.85rem;
            }

            /* Auto schedule */
            .auto-schedule {
                background: #f8fafc;
                padding: 1.25rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }

            .auto-schedule h4 {
                margin: 0 0 0.75rem 0;
            }

            .schedule-options {
                display: flex;
                gap: 1.5rem;
            }

            .schedule-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }

            /* Test Step */
            .test-progress {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 1.5rem;
            }

            .test-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .test-item:last-child {
                border-bottom: none;
            }

            .test-status {
                width: 24px;
                text-align: center;
                font-size: 1rem;
            }

            .test-status.testing {
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .test-result {
                padding: 1.5rem;
                background: #f0fdf4;
                border-radius: 12px;
                text-align: center;
            }

            .test-success h4 {
                margin: 0 0 0.5rem 0;
                color: #15803d;
            }

            .test-success p {
                margin: 0 0 1rem 0;
                color: #166534;
            }

            /* Complete State */
            .setup-card.complete {
                text-align: center;
            }

            .complete-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .complete-text {
                font-size: 1.1rem;
                color: #6b7280;
                margin-bottom: 2rem;
            }

            .next-steps-card {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: left;
                max-width: 500px;
                margin: 0 auto 2rem;
            }

            .next-steps-card h4 {
                margin: 0 0 1rem 0;
            }

            .next-steps-card ol {
                margin: 0;
                padding-left: 1.25rem;
            }

            .next-steps-card li {
                margin: 0.5rem 0;
            }

            /* Setup Actions */
            .setup-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e5e7eb;
            }

            .btn {
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-neutral {
                background: white;
                border: 1px solid #d1d5db;
                color: #374151;
            }

            .btn-neutral:hover {
                background: #f3f4f6;
            }

            .btn-primary {
                background: #3b82f6;
                border: 1px solid #3b82f6;
                color: white;
            }

            .btn-primary:hover {
                background: #2563eb;
            }

            .btn-primary:disabled {
                background: #9ca3af;
                border-color: #9ca3af;
                cursor: not-allowed;
            }

            .btn-secondary {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                color: #374151;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            @media (max-width: 900px) {
                .path-cards {
                    grid-template-columns: 1fr;
                }

                .method-cards {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create global instance
const agentAPISetupPage = new AgentAPISetupPage();
