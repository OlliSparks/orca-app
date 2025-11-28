// ORCA 2.0 - FM-Akte Detail
class FMDetailPage {
    constructor() {
        this.fmData = null;
        this.fmId = null;
    }

    async render(id) {
        this.fmId = id || 1;
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'FM-Akte';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Loading state
        app.innerHTML = `
            <div class="container" style="text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <p style="color: #6b7280;">Lade FM-Akte...</p>
            </div>
        `;

        // Load data
        await this.loadData();

        // Render detail view
        this.renderDetail();

        // Setup footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-ghost" onclick="window.print()">🖨️ Drucken</button>
            <button class="btn btn-secondary" onclick="fmDetailPage.edit()">✏️ Bearbeiten</button>
            <button class="btn btn-primary" onclick="fmDetailPage.exportPDF()">📥 Export PDF</button>
        `;
    }

    async loadData() {
        try {
            console.log('Loading FM detail for ID:', this.fmId);
            const response = await api.getFMDetail(this.fmId);
            if (response.success) {
                this.fmData = response.data;
                console.log('Loaded FM data:', this.fmData);
            }
        } catch (error) {
            console.error('Error loading FM detail:', error);
            this.showError('Fehler beim Laden der FM-Akte');
        }
    }

    renderDetail() {
        if (!this.fmData) return;

        const app = document.getElementById('app');
        const data = this.fmData;

        app.innerHTML = `
            <div class="container">
                <!-- Back Button -->
                <div style="margin-bottom: 1rem;">
                    <button class="back-btn" onclick="router.navigate('/')">← Zurück zur Übersicht</button>
                </div>

                <!-- Basis-Informationen -->
                <div class="base-info-card">
                    <div class="base-info-header">
                        <span class="base-info-icon">🔧</span>
                        <span class="base-info-title">Basis-Informationen</span>
                    </div>
                    <div class="base-info-grid">
                        <div class="base-info-row">
                            <div class="base-info-label">Fertigungsmittelbezeichnung</div>
                            <div class="base-info-value">${data.name}</div>
                        </div>
                        <div class="base-info-row">
                            <div class="base-info-label">Werkzeugnummer</div>
                            <div class="base-info-value">${data.toolNumber}</div>
                        </div>
                        <div class="base-info-row">
                            <div class="base-info-label">Anlagennummer</div>
                            <div class="base-info-value">${data.assetNumber}</div>
                        </div>
                        <div class="base-info-row">
                            <div class="base-info-label">Anlagennummer des Lieferanten</div>
                            <div class="base-info-value empty">${data.supplierAssetNumber || 'Keine Daten verfügbar'}</div>
                        </div>
                    </div>
                </div>

                <!-- Übersicht -->
                ${this.renderAccordion('overview', '📋', 'Übersicht', this.renderOverview(data), true)}

                <!-- Details -->
                ${this.renderAccordion('details', '📐', 'Details', this.renderDetails(data), false)}

                <!-- Finanz- und Standortinformationen -->
                ${this.renderAccordion('finance', '💶', 'Finanz- und Standortinformationen', this.renderFinance(data), false)}

                <!-- Prozesse -->
                ${this.renderAccordion('processes', '⚙️', 'Prozesse', this.renderProcesses(data), false)}

                <!-- Verwendung -->
                ${this.renderAccordion('usage', '🔧', 'Verwendung', this.renderUsage(), false)}

                <!-- Dokumente -->
                ${this.renderAccordion('documents', '📄', 'Dokumente', this.renderDocuments(), false)}
            </div>
        `;

        this.attachAccordionListeners();
    }

    renderAccordion(id, icon, title, content, isActive = false) {
        return `
            <div class="accordion-section">
                <div class="accordion-header ${isActive ? 'active' : ''}" data-section="${id}">
                    <div class="accordion-title">
                        <span class="accordion-icon">${icon}</span>
                        <span>${title}</span>
                    </div>
                    <span class="accordion-toggle">▼</span>
                </div>
                <div class="accordion-content ${isActive ? 'active' : ''}">
                    <div class="accordion-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    renderOverview(data) {
        return `
            <div class="subsection">
                <div class="subsection-title">
                    <span>🔄</span>
                    <span>Status</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Fertigungsmittel-Lifecyclestatus</div>
                        <div class="field-value">
                            <span class="status-badge status-lifecycle">⚠️ ${data.lifecycleStatus}</span>
                        </div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Fertigungsmittel-Prozessstatus</div>
                        <div class="field-value">
                            <span class="status-badge status-unconfirmed">🔓 ${data.processStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>👥</span>
                    <span>Beteiligte</span>
                </div>
                <div class="two-column-grid">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 0.5rem; color: #2c3e50;">🏢 Auftraggeber</div>
                        <div class="field-row">
                            <div class="field-label">Unternehmen</div>
                            <div class="field-value">${data.client.company}</div>
                        </div>
                    </div>
                    <div>
                        <div style="font-weight: 600; margin-bottom: 0.5rem; color: #2c3e50;">🏭 Vertragspartner</div>
                        <div class="field-row">
                            <div class="field-label">Unternehmen</div>
                            <div class="field-value">${data.contractor.company}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>📍</span>
                    <span>Standort</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Unternehmen</div>
                        <div class="field-value">${data.location.company}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Adresse</div>
                        <div class="field-value multiline">
                            ${data.location.address}<br>
                            ${data.location.postalCode} ${data.location.city}<br>
                            🇩🇪 ${data.location.country}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDetails(data) {
        return `
            <div class="two-column-grid">
                <div>
                    <div class="subsection">
                        <div class="subsection-title">
                            <span>📝</span>
                            <span>Interne Fertigungsmittelinformation</span>
                        </div>
                        <div class="field-grid">
                            <div class="field-row">
                                <div class="field-label">Lieferanten Information</div>
                                <div class="field-value">
                                    <input type="text" class="input-field" placeholder="Lieferanten Information">
                                </div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">Lieferanten Information 2</div>
                                <div class="field-value">
                                    <input type="text" class="input-field" placeholder="Lieferanten Information 2">
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-ghost" style="margin-top: 0.75rem;" onclick="fmDetailPage.saveDetails()">💾 Speichern</button>
                    </div>

                    <div class="subsection">
                        <div class="subsection-title">
                            <span>📡</span>
                            <span>Tracker Daten</span>
                        </div>
                        <div class="field-grid">
                            <div class="field-row">
                                <div class="field-label">Tracker ID</div>
                                <div class="field-value">
                                    <input type="text" class="input-field" placeholder="Tracker ID">
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-ghost" style="margin-top: 0.75rem;" onclick="fmDetailPage.saveDetails()">💾 Speichern</button>
                    </div>
                </div>

                <div>
                    <div class="subsection">
                        <div class="subsection-title">
                            <span>🔧</span>
                            <span>Materialzusammensetzung</span>
                        </div>
                        <div class="empty-state">Keine Daten verfügbar</div>
                    </div>

                    <div class="subsection">
                        <div class="subsection-title">
                            <span>📏</span>
                            <span>Größe und Gewicht</span>
                        </div>
                        <div class="empty-state">Keine Daten verfügbar</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFinance(data) {
        return `
            <div class="subsection">
                <div class="subsection-title">
                    <span>🌍</span>
                    <span>Zolltarifnummer</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Zolltarifnummer</div>
                        <div class="field-value">${data.finance.customsTariffNumber}</div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>💶</span>
                    <span>Anlagenbuchhaltung</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Asset-Nr</div>
                        <div class="field-value empty">Keine Daten verfügbar</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">AHK</div>
                        <div class="field-value">${data.finance.acquisitionCost}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">RBW</div>
                        <div class="field-value">${data.finance.residualBookValue}</div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>📍</span>
                    <span>Standort</span>
                </div>
                <div style="width: 100%; height: 200px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 0.9rem; border: 2px dashed #d1d5db; margin-bottom: 0.75rem;">
                    🗺️ Google Maps Karte würde hier angezeigt
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Unternehmen</div>
                        <div class="field-value">${data.location.company}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Adresse</div>
                        <div class="field-value multiline">
                            ${data.location.address}<br>
                            ${data.location.postalCode} ${data.location.city}<br>
                            🇩🇪 ${data.location.country}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderProcesses(data) {
        return `
            <div class="subsection">
                <div class="subsection-title">
                    <span>🔄</span>
                    <span>Status</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Fertigungsmittel-Lifecyclestatus</div>
                        <div class="field-value">
                            <span class="status-badge status-lifecycle">⚠️ ${data.lifecycleStatus}</span>
                        </div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Fertigungsmittel-Prozessstatus</div>
                        <div class="field-value">
                            <span class="status-badge status-unconfirmed">🔓 ${data.processStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>📊</span>
                    <span>Prozesshistorie</span>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-bottom: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; flex-wrap: wrap;">
                    <button class="filter-btn active" style="padding: 0.4rem 0.8rem; border: 1.5px solid #e5e7eb; background: #2c4a8c; color: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; font-family: 'Oswald', sans-serif;">⭕ Nicht gestartet</button>
                    <button class="filter-btn" style="padding: 0.4rem 0.8rem; border: 1.5px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; font-family: 'Oswald', sans-serif;">🔄 Laufend</button>
                    <button class="filter-btn" style="padding: 0.4rem 0.8rem; border: 1.5px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; font-family: 'Oswald', sans-serif;">✅ Abgeschlossen</button>
                    <button class="filter-btn" style="padding: 0.4rem 0.8rem; border: 1.5px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; font-family: 'Oswald', sans-serif;">ℹ️ Info</button>
                </div>
                <div class="empty-state">Keine Prozesse</div>
            </div>
        `;
    }

    renderUsage() {
        return `
            <div class="subsection">
                <div class="subsection-title">
                    <span>📦</span>
                    <span>Produkt</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Baureihe</div>
                        <div class="field-value empty">Keine Daten verfügbar</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Typschlüssel</div>
                        <div class="field-value empty">Keine Daten verfügbar</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Teilenummer</div>
                        <div class="field-value empty">Keine Daten verfügbar</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Projekt</div>
                        <div class="field-value empty">Keine Daten verfügbar</div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>📈</span>
                    <span>Teilenummerhistorie</span>
                </div>
                <div class="empty-state">Keine Daten verfügbar</div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>🛒</span>
                    <span>Bestellhistorie</span>
                </div>
                <div class="empty-state">Keine Historie verfügbar</div>
            </div>
        `;
    }

    renderDocuments() {
        const documents = [
            { icon: '📋', title: 'Bestellung', bg: '#dbeafe' },
            { icon: '✅', title: 'Abnahmedokument', bg: '#dcfce7' },
            { icon: '📐', title: 'Technische Zeichnungen', bg: '#fef3c7' },
            { icon: '🔧', title: 'Wartungsunterlagen', bg: '#fed7aa' },
            { icon: '📊', title: 'Prüfberichte', bg: '#e9d5ff' },
            { icon: '⚠️', title: 'Sicherheitsdatenblätter', bg: '#fecaca' },
            { icon: '📖', title: 'Betriebsanleitungen', bg: '#bfdbfe' },
            { icon: '🚚', title: 'Lieferscheine', bg: '#d1fae5' },
            { icon: '🛡️', title: 'Garantiedokumente', bg: '#fbcfe8' },
            { icon: '🏆', title: 'Zertifikate', bg: '#fde68a' },
            { icon: '💰', title: 'Rechnungen', bg: '#d1d5db' },
            { icon: '📷', title: 'Fotos', bg: '#c7d2fe' }
        ];

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${documents.map(doc => `
                    <div class="doc-card">
                        <div class="doc-icon" style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 0.75rem; background: ${doc.bg};">${doc.icon}</div>
                        <div class="doc-title">${doc.title}</div>
                        <div class="doc-status empty">Nicht verfügbar</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isActive = header.classList.contains('active');

                // Toggle current section
                if (isActive) {
                    header.classList.remove('active');
                    content.classList.remove('active');
                } else {
                    // Close all
                    document.querySelectorAll('.accordion-header').forEach(h => {
                        h.classList.remove('active');
                        h.nextElementSibling.classList.remove('active');
                    });

                    // Open current
                    header.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }

    edit() {
        alert('✏️ Bearbeitungsmodus - Diese Funktion wird später implementiert');
    }

    exportPDF() {
        alert('📥 PDF Export wird vorbereitet...');
    }

    saveDetails() {
        alert('💾 Änderungen gespeichert (Mock)');
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">⚠️</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="router.navigate('/')">Zurück zur Übersicht</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const fmDetailPage = new FMDetailPage();
