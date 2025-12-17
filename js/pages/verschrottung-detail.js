// ORCA 2.0 - Verschrottung Detail
// Strukturiertes Ende. Vollständig dokumentiert.
class VerschrottungDetailPage {
    constructor() {
        this.processKey = null;
        this.scrapping = null;
        this.positions = [];
        this.isLoading = false;
    }

    async render(processKey) {
        this.processKey = processKey;
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Verschrottung Details';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial loading state
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">Lade Verschrottung...</div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/verschrottung')">Zurück zur Liste</button>
        `;

        // Load data
        await this.loadData();
    }

    async loadData() {
        this.isLoading = true;

        try {
            // Load scrapping details
            const detailResult = await api.getVerschrottungDetail(this.processKey);
            console.log('Verschrottung Detail:', detailResult);

            if (!detailResult.success) {
                this.showError('Verschrottung nicht gefunden');
                return;
            }

            // Extrahiere Daten aus Response
            const rawData = detailResult.data;
            const meta = rawData.meta || rawData;

            // Vertragspartner - SCRAPPING verwendet contractPartner.name und contractPartner.key
            const contractPartnerName = meta['contractPartner.name'] || meta.contractPartner || '';
            const contractPartnerKey = meta['contractPartner.key'] || '';
            const contractPartner = contractPartnerKey
                ? `${contractPartnerName} (${contractPartnerKey})`
                : contractPartnerName;

            // Betreiber - SCRAPPING verwendet operator.name und operator.key
            const operatorName = meta['operator.name'] || meta.operator || '';
            const operatorKey = meta['operator.key'] || '';
            const operator = operatorKey
                ? `${operatorName} (${operatorKey})`
                : operatorName;

            // Standort - SCRAPPING verwendet scrap.city, scrap.country, scrap.postcode
            let location = '';
            if (meta['scrap.city']) {
                const postcode = meta['scrap.postcode'] || '';
                location = postcode
                    ? `${meta['scrap.country'] || ''}-${meta['scrap.city']} (${postcode})`
                    : `${meta['scrap.city']} (${meta['scrap.country'] || ''})`;
            }

            this.scrapping = {
                processKey: this.processKey,
                // Bezeichnung
                title: meta.title || meta.description || 'Verschrottung',
                // Beteiligte
                contractPartner: contractPartner,
                operator: operator,
                // Werkzeug-Infos - SCRAPPING verwendet scrap.derivat und scrap.partNumber
                baureihe: meta['scrap.derivat'] || meta.baureihe || meta.series || '',
                partNumber: meta['scrap.partNumber'] || meta.partNumber || '',
                partText: meta['scrap.partText'] || '',
                // Personen - SCRAPPING verwendet creator.name und scrap.wvo.name
                creator: meta['creator.name'] || meta.creator || '',
                buyer: meta['scrap.wvo.name'] || meta.buyer || meta.facheinkaeufer || '',
                // Standort
                location: location,
                // Status - SCRAPPING verwendet p.status (I=Initial, Z=Closed)
                status: meta['p.status'] || meta.status || 'I',
                // Termine
                dueDate: meta.dueDate || null,
                createdAt: meta.created || meta.createdAt || null,
                // Genehmigungen
                approvalInfo: meta.approvalInfo || meta.approval || '',
                // Kommentar - SCRAPPING verwendet scrap.comment
                comment: meta['scrap.comment'] || meta.comment || '',
                // Original
                originalMeta: meta
            };

            // Load positions
            const positionsResult = await api.getVerschrottungPositions(this.processKey);
            console.log('Verschrottung Positionen:', positionsResult);

            if (positionsResult.success) {
                this.positions = positionsResult.data || [];
            }

            this.renderDetail();
        } catch (error) {
            console.error('Error loading Verschrottung:', error);
            this.showError('Fehler beim Laden: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    renderDetail() {
        const app = document.getElementById('app');
        const scrap = this.scrapping;

        // Status-Mapping (SCRAPPING verwendet I=Initial/Offen, Z=Closed/Abgeschlossen)
        const statusInfo = {
            'I': { class: 'status-offen', text: 'Offen' },
            'NEW': { class: 'status-offen', text: 'Offen' },
            'OPEN': { class: 'status-offen', text: 'Offen' },
            'P': { class: 'status-in-bearbeitung', text: 'In Bearbeitung' },
            'IN_PROGRESS': { class: 'status-in-bearbeitung', text: 'In Bearbeitung' },
            'PENDING': { class: 'status-in-bearbeitung', text: 'In Bearbeitung' },
            'A': { class: 'status-genehmigt', text: 'Genehmigt' },
            'APPROVED': { class: 'status-genehmigt', text: 'Genehmigt' },
            'Z': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
            'C': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
            'COMPLETED': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
            'DONE': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
            'CLOSED': { class: 'status-abgeschlossen', text: 'Abgeschlossen' }
        }[scrap.status] || { class: 'status-offen', text: scrap.status || 'Unbekannt' };

        app.innerHTML = `
            <div class="container">
                <!-- Back Navigation -->
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/verschrottung')" style="padding: 0.5rem 1rem;">
                        &larr; Zurück zur Liste
                    </button>
                </div>

                <!-- Header Card -->
                <div class="card" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${scrap.title}</h1>
                            <p style="color: #6b7280; margin-bottom: 0.75rem;">Baureihe: ${scrap.baureihe || '-'}</p>
                            <span class="status-badge ${statusInfo.class}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
                                ${statusInfo.text}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Two Column Layout: Betreiber + Vertragspartner -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <!-- Betreiber -->
                    <div class="card">
                        <h3 style="font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: #3b82f6;">&#9679;</span> Betreiber
                        </h3>
                        <div style="margin-bottom: 0.75rem;">
                            <p style="color: #6b7280; font-size: 0.85rem;">Unternehmen</p>
                            <p style="font-weight: 500;">${scrap.operator || '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Werkzeugstandort</p>
                            <p style="font-weight: 500;">${scrap.location || '-'}</p>
                        </div>
                    </div>

                    <!-- Vertragspartner -->
                    <div class="card">
                        <h3 style="font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: #3b82f6;">&#9632;</span> Vertragspartner
                        </h3>
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Unternehmen</p>
                            <p style="font-weight: 500;">${scrap.contractPartner || '-'}</p>
                        </div>
                    </div>
                </div>

                <!-- Genehmigungen -->
                ${scrap.approvalInfo ? `
                <div class="card" style="margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        &#9744; Genehmigungen
                    </h3>
                    <p style="color: #6b7280;">${scrap.approvalInfo}</p>
                </div>
                ` : ''}

                <!-- Fertigungsmittel (Positionen) -->
                <div class="card" style="margin-bottom: 1.5rem; ${this.positions.length === 0 ? 'border: 2px solid #ef4444;' : ''}">
                    <h3 style="font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        &#9881; Fertigungsmittel
                        ${this.positions.length === 0 ? '<span style="color: #ef4444; font-size: 0.85rem;">Position fehlt</span>' : ''}
                    </h3>

                    ${this.positions.length > 0 ? `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Inventarnummer</th>
                                    <th>Beschreibung</th>
                                    <th>Standort</th>
                                    <th>Status</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderPositionsRows()}
                            </tbody>
                        </table>
                    </div>
                    ` : `
                    <p style="color: #6b7280; text-align: center; padding: 2rem;">
                        Keine Fertigungsmittel zugeordnet
                    </p>
                    `}
                </div>

                <!-- Weitere Informationen (Sidebar-Stil) -->
                <div class="card" style="margin-bottom: 1.5rem; background: #f9fafb;">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem;">Weitere Informationen</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Antragsteller / Bearbeiter</p>
                            <p style="font-weight: 500;">${scrap.creator || '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Facheinkaeufer</p>
                            <p style="font-weight: 500;">${scrap.buyer || '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Teilenummer</p>
                            <p style="font-weight: 500;">${scrap.partNumber || '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; font-size: 0.85rem;">Prozess-Key</p>
                            <p style="font-family: monospace; font-size: 0.85rem;">${scrap.processKey}</p>
                        </div>
                    </div>
                </div>

                <!-- Kommentar-Bereich -->
                <div class="card">
                    <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Kommentar</h3>
                    <textarea
                        id="commentInput"
                        style="width: 100%; min-height: 100px; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; resize: vertical;"
                        placeholder="Kommentar eingeben..."
                    >${scrap.comment || ''}</textarea>
                    <p style="text-align: right; color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem;">0 / 400</p>
                </div>
            </div>
        `;

        // Update footer with actions
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/verschrottung')">Zurück</button>
        `;

        // Inject styles
        this.injectStyles();
    }

    renderPositionsRows() {
        return this.positions.map(pos => {
            return `
                <tr>
                    <td class="tool-number">${pos.inventoryNumber || pos.orderNumber || '-'}</td>
                    <td>${pos.description || '-'}</td>
                    <td>${pos.location || '-'}</td>
                    <td><span class="status-badge">${pos.status || '-'}</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="verschrottungDetailPage.viewAsset('${pos.assetKey}')">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    injectStyles() {
        if (document.getElementById('verschrottung-detail-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'verschrottung-detail-styles';
        styles.textContent = `
            .status-badge.status-offen {
                background: #fef3c7;
                color: #92400e;
            }
            .status-badge.status-in-bearbeitung {
                background: #dbeafe;
                color: #1e40af;
            }
            .status-badge.status-genehmigt {
                background: #d1fae5;
                color: #065f46;
            }
            .status-badge.status-abgeschlossen {
                background: #f3f4f6;
                color: #374151;
            }
        `;
        document.head.appendChild(styles);
    }

    viewAsset(assetKey) {
        if (assetKey) {
            router.navigate('/detail/' + assetKey);
        }
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/verschrottung')" style="padding: 0.5rem 1rem;">
                        &larr; Zurück zur Liste
                    </button>
                </div>
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">!</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="router.navigate('/verschrottung')">Zur Liste</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const verschrottungDetailPage = new VerschrottungDetailPage();
