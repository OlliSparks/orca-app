// ORCA 2.0 - Vertragspartnerwechsel (VPW) Detail-Seite
class PartnerwechselDetailPage {
    constructor() {
        this.processId = null;
        this.processData = null;
        this.isLoading = false;
    }

    async render(id) {
        this.processId = id;
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Vertragspartnerwechsel Details';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial loading state
        app.innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: 4rem;">
                    <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid #e5e7eb; border-top-color: #2c4a8c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;"></div>
                    <div style="margin-top: 1rem; color: #6b7280;">Lade VPW-Details...</div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/partnerwechsel')">← Zurueck zur Uebersicht</button>
        `;

        // Load data
        await this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        try {
            // Fuer Mock-Daten: Hole alle VPW und finde den passenden
            const response = await api.getPartnerwechselList();
            if (response.success) {
                this.processData = response.data.find(p =>
                    (p.id === this.processId) || (p.processKey === this.processId)
                );

                if (this.processData) {
                    this.renderDetail();
                } else {
                    this.showError('Vertragspartnerwechsel nicht gefunden');
                }
            } else {
                this.showError('Fehler beim Laden: ' + (response.error || 'Unbekannt'));
            }
        } catch (error) {
            console.error('Error loading VPW detail:', error);
            this.showError('Fehler beim Laden der Daten: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    renderDetail() {
        const app = document.getElementById('app');
        const p = this.processData;
        const statusInfo = this.getStatusInfo(p.status);

        app.innerHTML = `
            <div class="container">
                <!-- Zurueck-Button -->
                <button class="btn btn-neutral" style="margin-bottom: 1rem;" onclick="router.navigate('/partnerwechsel')">
                    ← Zurueck zur Uebersicht
                </button>

                <!-- Header Card -->
                <div class="card" style="margin-bottom: 1rem; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-top: 4px solid #2c4a8c;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Vertragspartnerwechsel</div>
                            <h1 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">
                                ${p.toolNumber || p.processKey || '-'}
                            </h1>
                            <div style="font-size: 1.1rem; color: #4b5563;">${p.toolName || p.name || '-'}</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="status-badge ${statusInfo.class}" style="font-size: 1rem; padding: 0.5rem 1rem;">
                                ${statusInfo.text}
                            </span>
                            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.5rem;">
                                Frist: ${p.dueDate ? this.formatDate(p.dueDate) : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Partner-Info Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <!-- Abgebender Partner -->
                    <div class="card" style="border-left: 4px solid #ef4444;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                            <div style="font-size: 1.5rem;">📤</div>
                            <div>
                                <div style="font-size: 0.85rem; color: #6b7280;">Abgebender Vertragspartner</div>
                                <div style="font-weight: 600; color: #991b1b;">${p.fromPartner || 'Unbekannt'}</div>
                            </div>
                        </div>
                        <div style="background: #fef2f2; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: #6b7280;">Abgabe bestaetigt:</span>
                                <span style="font-weight: 600; color: ${this.isAbgabeConfirmed() ? '#166534' : '#92400e'};">
                                    ${this.isAbgabeConfirmed() ? '✓ Ja' : '⏳ Ausstehend'}
                                </span>
                            </div>
                            ${this.isAbgabeConfirmed() ? `
                                <div style="font-size: 0.8rem; color: #6b7280;">
                                    Bestaetigt am: ${this.formatDate(p.abgabeDate || new Date())}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Uebernehmender Partner -->
                    <div class="card" style="border-left: 4px solid #22c55e;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                            <div style="font-size: 1.5rem;">📥</div>
                            <div>
                                <div style="font-size: 0.85rem; color: #6b7280;">Uebernehmender Vertragspartner</div>
                                <div style="font-weight: 600; color: #166534;">${p.toPartner || 'Unbekannt'}</div>
                            </div>
                        </div>
                        <div style="background: #f0fdf4; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: #6b7280;">Uebernahme bestaetigt:</span>
                                <span style="font-weight: 600; color: ${this.isUebernahmeConfirmed() ? '#166534' : '#92400e'};">
                                    ${this.isUebernahmeConfirmed() ? '✓ Ja' : '⏳ Ausstehend'}
                                </span>
                            </div>
                            ${this.isUebernahmeConfirmed() ? `
                                <div style="font-size: 0.8rem; color: #6b7280;">
                                    Bestaetigt am: ${this.formatDate(p.uebernahmeDate || new Date())}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Prozess-Timeline -->
                <div class="card" style="margin-bottom: 1rem;">
                    <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">🔄 Prozess-Fortschritt</h2>
                    <div class="vpw-timeline">
                        ${this.renderTimeline()}
                    </div>
                </div>

                <!-- Aktionen -->
                <div class="card" style="margin-bottom: 1rem;">
                    <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">⚡ Aktionen</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                        ${this.renderActions()}
                    </div>
                </div>

                <!-- Werkzeug-Details -->
                <div class="card">
                    <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">🔧 Werkzeug-Details</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div>
                            <div style="font-size: 0.85rem; color: #6b7280;">Werkzeugnummer</div>
                            <div style="font-weight: 600;">${p.toolNumber || '-'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #6b7280;">Bezeichnung</div>
                            <div style="font-weight: 600;">${p.toolName || p.name || '-'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #6b7280;">Prozess-ID</div>
                            <div style="font-weight: 600;">${p.processKey || p.id || '-'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #6b7280;">Erstellt am</div>
                            <div style="font-weight: 600;">${p.createdAt ? this.formatDate(p.createdAt) : '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirm Modal -->
            <div class="modal" id="vpwConfirmModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="vpwModalTitle">Bestaetigung</h2>
                        <div class="modal-subtitle" id="vpwModalSubtitle">Moechten Sie diese Aktion bestaetigen?</div>
                    </div>
                    <div id="vpwModalBody" style="margin-bottom: 1rem;"></div>
                    <div class="form-group">
                        <label class="form-label">Kommentar (optional - erzeugt Klaerfall!)</label>
                        <textarea id="vpwConfirmComment" class="form-input" rows="2" placeholder="Nur bei Problemen..."></textarea>
                        <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 0.25rem;">⚠️ Ein Kommentar erzeugt automatisch einen Klaerfall beim OEM</div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" onclick="partnerwechselDetailPage.closeModal()">Abbrechen</button>
                        <button class="modal-btn primary" id="vpwConfirmBtn">Bestaetigen</button>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
    }

    addStyles() {
        if (document.getElementById('vpw-detail-styles')) return;

        const style = document.createElement('style');
        style.id = 'vpw-detail-styles';
        style.textContent = `
            .vpw-timeline {
                display: flex;
                justify-content: space-between;
                position: relative;
                padding: 1rem 0;
            }
            .vpw-timeline::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 4px;
                background: #e5e7eb;
                transform: translateY(-50%);
                z-index: 0;
            }
            .timeline-step {
                position: relative;
                z-index: 1;
                text-align: center;
                flex: 1;
            }
            .timeline-dot {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e5e7eb;
                margin: 0 auto 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .timeline-dot.completed {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
            }
            .timeline-dot.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                animation: pulse 2s infinite;
            }
            .timeline-dot.pending {
                background: #f3f4f6;
                color: #9ca3af;
            }
            .timeline-label {
                font-size: 0.8rem;
                color: #6b7280;
            }
            .timeline-label.active {
                color: #1d4ed8;
                font-weight: 600;
            }
            .timeline-label.completed {
                color: #166534;
            }
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            }
            .status-offen {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                color: #92400e;
            }
            .status-abgabe-bestaetigt {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                color: #1e40af;
            }
            .status-uebernahme-bestaetigt {
                background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
                color: #1e40af;
            }
            .status-abgeschlossen {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                color: #166534;
            }
            .loading-spinner {
                animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        // Modal backdrop click
        const modal = document.getElementById('vpwConfirmModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'vpwConfirmModal') this.closeModal();
            });
        }
    }

    renderTimeline() {
        const steps = [
            { id: 'created', label: 'Erstellt', icon: '📋' },
            { id: 'abgabe', label: 'Abgabe bestaetigt', icon: '📤' },
            { id: 'uebernahme', label: 'Uebernahme bestaetigt', icon: '📥' },
            { id: 'done', label: 'Abgeschlossen', icon: '✅' }
        ];

        const currentStep = this.getCurrentStep();

        return steps.map((step, index) => {
            let dotClass = 'pending';
            let labelClass = '';

            if (index < currentStep) {
                dotClass = 'completed';
                labelClass = 'completed';
            } else if (index === currentStep) {
                dotClass = 'active';
                labelClass = 'active';
            }

            return `
                <div class="timeline-step">
                    <div class="timeline-dot ${dotClass}">${step.icon}</div>
                    <div class="timeline-label ${labelClass}">${step.label}</div>
                </div>
            `;
        }).join('');
    }

    getCurrentStep() {
        const status = this.processData?.status;
        switch (status) {
            case 'offen': return 1;
            case 'abgabe-bestaetigt': return 2;
            case 'uebernahme-bestaetigt': return 3;
            case 'abgeschlossen': return 4;
            default: return 0;
        }
    }

    isAbgabeConfirmed() {
        const status = this.processData?.status;
        return ['abgabe-bestaetigt', 'uebernahme-bestaetigt', 'abgeschlossen'].includes(status);
    }

    isUebernahmeConfirmed() {
        const status = this.processData?.status;
        return ['uebernahme-bestaetigt', 'abgeschlossen'].includes(status);
    }

    renderActions() {
        const status = this.processData?.status;
        const direction = this.processData?.direction;
        const actions = [];

        // Abgabe bestaetigen (fuer abgebenden Partner)
        if (status === 'offen' && direction === 'outgoing') {
            actions.push(`
                <button class="btn btn-primary" onclick="partnerwechselDetailPage.showConfirmAbgabe()">
                    ✓ Abgabe bestaetigen
                </button>
            `);
        }

        // Uebernahme bestaetigen (fuer uebernehmenden Partner)
        if (status === 'abgabe-bestaetigt' && direction === 'incoming') {
            actions.push(`
                <button class="btn btn-primary" onclick="partnerwechselDetailPage.showConfirmUebernahme()">
                    ✓ Uebernahme bestaetigen
                </button>
            `);
        }

        // Werkzeugakte oeffnen
        actions.push(`
            <button class="btn btn-secondary" onclick="partnerwechselDetailPage.openToolDetail()">
                📄 Werkzeugakte oeffnen
            </button>
        `);

        // Kontakt aufnehmen
        actions.push(`
            <button class="btn btn-neutral" onclick="partnerwechselDetailPage.showContact()">
                📧 Kontakt aufnehmen
            </button>
        `);

        if (actions.length === 0) {
            return '<div style="color: #6b7280; font-style: italic;">Keine Aktionen verfuegbar</div>';
        }

        return actions.join('');
    }

    showConfirmAbgabe() {
        document.getElementById('vpwModalTitle').textContent = 'Abgabe bestaetigen';
        document.getElementById('vpwModalSubtitle').textContent =
            'Bestaetigen Sie, dass Sie das Werkzeug an den neuen Vertragspartner uebergeben haben.';
        document.getElementById('vpwModalBody').innerHTML = `
            <div style="background: #fef2f2; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 600; color: #991b1b;">Werkzeug wird abgegeben an:</div>
                <div style="font-size: 1.1rem; margin-top: 0.5rem;">${this.processData?.toPartner || 'Unbekannt'}</div>
            </div>
        `;
        document.getElementById('vpwConfirmBtn').onclick = () => this.confirmAbgabe();
        document.getElementById('vpwConfirmModal').classList.add('active');
    }

    showConfirmUebernahme() {
        document.getElementById('vpwModalTitle').textContent = 'Uebernahme bestaetigen';
        document.getElementById('vpwModalSubtitle').textContent =
            'Bestaetigen Sie, dass Sie das Werkzeug vom bisherigen Vertragspartner uebernommen haben.';
        document.getElementById('vpwModalBody').innerHTML = `
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 600; color: #166534;">Werkzeug wird uebernommen von:</div>
                <div style="font-size: 1.1rem; margin-top: 0.5rem;">${this.processData?.fromPartner || 'Unbekannt'}</div>
            </div>
        `;
        document.getElementById('vpwConfirmBtn').onclick = () => this.confirmUebernahme();
        document.getElementById('vpwConfirmModal').classList.add('active');
    }

    async confirmAbgabe() {
        const comment = document.getElementById('vpwConfirmComment').value.trim();
        console.log('Confirming Abgabe for:', this.processId, 'Comment:', comment);

        // Mock: Update status
        this.processData.status = 'abgabe-bestaetigt';
        this.processData.abgabeDate = new Date().toISOString();

        this.closeModal();
        this.renderDetail();

        alert(`✓ Abgabe erfolgreich bestaetigt!${comment ? '\n\n⚠️ Ihr Kommentar wurde als Klaerfall erfasst.' : ''}`);
    }

    async confirmUebernahme() {
        const comment = document.getElementById('vpwConfirmComment').value.trim();
        console.log('Confirming Uebernahme for:', this.processId, 'Comment:', comment);

        // Mock: Update status
        this.processData.status = 'uebernahme-bestaetigt';
        this.processData.uebernahmeDate = new Date().toISOString();

        this.closeModal();
        this.renderDetail();

        alert(`✓ Uebernahme erfolgreich bestaetigt!${comment ? '\n\n⚠️ Ihr Kommentar wurde als Klaerfall erfasst.' : ''}`);
    }

    closeModal() {
        document.getElementById('vpwConfirmModal').classList.remove('active');
        document.getElementById('vpwConfirmComment').value = '';
    }

    openToolDetail() {
        // Versuche zur Werkzeugakte zu navigieren
        const toolId = this.processData?.toolId || this.processData?.id || '1';
        router.navigate(`/detail/${toolId}`);
    }

    showContact() {
        alert('📧 Kontaktfunktion\n\nHier koennten Kontaktdaten der beteiligten Partner angezeigt werden.');
    }

    getStatusInfo(status) {
        const statusMap = {
            'offen': { class: 'status-offen', text: '⚪ Warte auf Abgabe' },
            'abgabe-bestaetigt': { class: 'status-abgabe-bestaetigt', text: '🔵 Abgabe bestaetigt' },
            'uebernahme-bestaetigt': { class: 'status-uebernahme-bestaetigt', text: '🔵 Uebernahme bestaetigt' },
            'abgeschlossen': { class: 'status-abgeschlossen', text: '✅ Abgeschlossen' }
        };
        return statusMap[status] || { class: 'status-offen', text: status };
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <button class="btn btn-neutral" style="margin-bottom: 1rem;" onclick="router.navigate('/partnerwechsel')">
                    ← Zurueck zur Uebersicht
                </button>
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">⚠️</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Neu laden</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const partnerwechselDetailPage = new PartnerwechselDetailPage();
