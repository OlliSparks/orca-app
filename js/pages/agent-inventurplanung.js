// ORCA 2.0 - Inventurplanungs-Agent
// Vereinfachter Flow: Datum wählen → Alle Inventuren auf Datum setzen → Zur Planung

class AgentInventurplanungPage {
    constructor() {
        this.openInventories = [];
        this.selectedDate = null;
        this.isLoading = false;
    }

    async render() {
        const app = document.getElementById('app');

        // Reset
        this.selectedDate = null;
        this.isLoading = true;

        // Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Inventurplanung';
        document.getElementById('headerSubtitle').textContent = 'Wann hast du Zeit für Inventuren?';
        document.getElementById('headerStats').style.display = 'none';

        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) navDropdown.value = '/agenten';

        app.innerHTML = `
            <div class="container agent-inventurplanung-simple">
                <div class="planning-card">
                    <div class="planning-header">
                        <div class="planning-icon">📅</div>
                        <h2>Inventurplanung</h2>
                        <p class="planning-subtitle">Plane deine Inventuren, wenn es dir passt</p>
                    </div>

                    <div class="loading-state" id="loadingState">
                        <div class="spinner"></div>
                        <p>Lade offene Inventuren...</p>
                    </div>

                    <div class="planning-content" id="planningContent" style="display: none;">
                        <!-- Step 1: Übersicht -->
                        <div class="overview-section" id="overviewSection">
                            <div class="inventory-count">
                                <span class="count-number" id="inventoryCount">0</span>
                                <span class="count-label">offene Inventuren</span>
                            </div>

                            <div class="date-question">
                                <label for="targetDate">Bis wann kannst du diese erledigen?</label>
                                <input type="date" id="targetDate" class="date-picker">
                                <div class="quick-dates">
                                    <button class="quick-date-btn" data-days="7">In 1 Woche</button>
                                    <button class="quick-date-btn" data-days="14">In 2 Wochen</button>
                                    <button class="quick-date-btn" data-days="30">In 1 Monat</button>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Bestätigung -->
                        <div class="confirmation-section" id="confirmationSection" style="display: none;">
                            <div class="confirmation-box">
                                <div class="confirmation-icon">✓</div>
                                <div class="confirmation-text">
                                    <strong id="confirmCount">0</strong> Inventuren werden auf
                                    <strong id="confirmDate">-</strong> terminiert
                                </div>
                            </div>

                            <div class="confirmation-details">
                                <p>Der OEM wird informiert, dass du bis zu diesem Datum die Inventuren durchführst.</p>
                            </div>

                            <div class="action-buttons">
                                <button class="action-btn secondary" id="backBtn">← Zurück</button>
                                <button class="action-btn primary" id="confirmBtn">
                                    Übernehmen → zur Inventurplanung
                                </button>
                            </div>
                        </div>

                        <!-- No Inventories State -->
                        <div class="no-inventories" id="noInventories" style="display: none;">
                            <div class="no-inv-icon">✅</div>
                            <h3>Keine offenen Inventuren</h3>
                            <p>Aktuell hast du keine Inventuren zu erledigen.</p>
                            <button class="action-btn secondary" onclick="router.navigate('/planung')">
                                Zur Inventurplanung →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        await this.loadOpenInventories();
        this.attachEventListeners();
    }

    async loadOpenInventories() {
        try {
            const response = await api.getPlanningData();
            if (response.success && response.data) {
                // Nur offene Inventuren (noch nicht erledigt)
                this.openInventories = response.data.filter(inv =>
                    inv.status !== 'completed' && inv.status !== 'confirmed'
                );
            } else {
                this.openInventories = [];
            }
        } catch (e) {
            console.error('Fehler beim Laden der Inventuren:', e);
            this.openInventories = [];
        }

        this.isLoading = false;
        this.showContent();
    }

    showContent() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('planningContent').style.display = 'block';

        if (this.openInventories.length === 0) {
            document.getElementById('overviewSection').style.display = 'none';
            document.getElementById('noInventories').style.display = 'block';
        } else {
            document.getElementById('inventoryCount').textContent = this.openInventories.length;

            // Set default date to 2 weeks from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 14);
            document.getElementById('targetDate').value = this.formatDateISO(defaultDate);
            document.getElementById('targetDate').min = this.formatDateISO(new Date());
        }
    }

    attachEventListeners() {
        // Date picker change
        document.getElementById('targetDate')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectedDate = new Date(e.target.value);
                this.showConfirmation();
            }
        });

        // Quick date buttons
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const date = new Date();
                date.setDate(date.getDate() + days);
                document.getElementById('targetDate').value = this.formatDateISO(date);
                this.selectedDate = date;
                this.showConfirmation();
            });
        });

        // Back button
        document.getElementById('backBtn')?.addEventListener('click', () => {
            this.hideConfirmation();
        });

        // Confirm button
        document.getElementById('confirmBtn')?.addEventListener('click', () => {
            this.confirmAndNavigate();
        });
    }

    showConfirmation() {
        document.getElementById('overviewSection').style.display = 'none';
        document.getElementById('confirmationSection').style.display = 'block';

        document.getElementById('confirmCount').textContent = this.openInventories.length;
        document.getElementById('confirmDate').textContent = this.formatDateDE(this.selectedDate);
    }

    hideConfirmation() {
        document.getElementById('overviewSection').style.display = 'block';
        document.getElementById('confirmationSection').style.display = 'none';
    }

    confirmAndNavigate() {
        // Speichere die Planungsdaten für die Planung-Seite
        const planningData = {
            targetDate: this.formatDateISO(this.selectedDate),
            inventoryIds: this.openInventories.map(inv => inv.id || inv.number),
            count: this.openInventories.length,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('inventur_planning_date', JSON.stringify(planningData));

        // Navigiere zur Planung-Seite
        router.navigate('/planung');
    }

    formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }

    formatDateDE(date) {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    addStyles() {
        if (document.getElementById('agent-inventurplanung-simple-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agent-inventurplanung-simple-styles';
        styles.textContent = `
            .agent-inventurplanung-simple {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 2rem;
                min-height: calc(100vh - 180px);
            }

            .planning-card {
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                width: 100%;
                max-width: 500px;
                overflow: hidden;
            }

            .planning-header {
                text-align: center;
                padding: 2rem 2rem 1.5rem;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-bottom: 1px solid #e0f2fe;
            }

            .planning-icon {
                font-size: 3rem;
                margin-bottom: 0.5rem;
            }

            .planning-header h2 {
                margin: 0 0 0.5rem;
                color: #1f2937;
                font-size: 1.5rem;
            }

            .planning-subtitle {
                color: #6b7280;
                margin: 0;
                font-size: 0.95rem;
            }

            .planning-content {
                padding: 2rem;
            }

            /* Loading State */
            .loading-state {
                text-align: center;
                padding: 3rem 2rem;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                margin: 0 auto 1rem;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-state p {
                color: #6b7280;
                margin: 0;
            }

            /* Overview Section */
            .inventory-count {
                text-align: center;
                margin-bottom: 2rem;
            }

            .count-number {
                display: block;
                font-size: 4rem;
                font-weight: 700;
                color: #3b82f6;
                line-height: 1;
            }

            .count-label {
                display: block;
                color: #6b7280;
                font-size: 1rem;
                margin-top: 0.5rem;
            }

            .date-question {
                text-align: center;
            }

            .date-question label {
                display: block;
                font-size: 1.1rem;
                color: #374151;
                margin-bottom: 1rem;
                font-weight: 500;
            }

            .date-picker {
                width: 100%;
                padding: 1rem;
                font-size: 1.1rem;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .date-picker:hover {
                border-color: #3b82f6;
            }

            .date-picker:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }

            .quick-dates {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
                justify-content: center;
            }

            .quick-date-btn {
                padding: 0.5rem 1rem;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                color: #374151;
            }

            .quick-date-btn:hover {
                background: #e0f2fe;
                border-color: #3b82f6;
                color: #1e40af;
            }

            /* Confirmation Section */
            .confirmation-box {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
                background: #f0fdf4;
                border: 2px solid #86efac;
                border-radius: 12px;
                margin-bottom: 1.5rem;
            }

            .confirmation-icon {
                width: 50px;
                height: 50px;
                background: #22c55e;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .confirmation-text {
                font-size: 1.1rem;
                color: #166534;
            }

            .confirmation-text strong {
                color: #15803d;
            }

            .confirmation-details {
                text-align: center;
                margin-bottom: 2rem;
            }

            .confirmation-details p {
                color: #6b7280;
                font-size: 0.9rem;
                margin: 0;
            }

            .action-buttons {
                display: flex;
                gap: 1rem;
            }

            .action-btn {
                flex: 1;
                padding: 1rem;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .action-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .action-btn.primary:hover {
                background: #2563eb;
            }

            .action-btn.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
            }

            .action-btn.secondary:hover {
                background: #e5e7eb;
            }

            /* No Inventories */
            .no-inventories {
                text-align: center;
                padding: 1rem;
            }

            .no-inv-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .no-inventories h3 {
                color: #1f2937;
                margin: 0 0 0.5rem;
            }

            .no-inventories p {
                color: #6b7280;
                margin: 0 0 1.5rem;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Init
const agentInventurplanungPage = new AgentInventurplanungPage();
