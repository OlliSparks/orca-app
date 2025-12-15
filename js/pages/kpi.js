// ORCA 2.0 - KPI Dashboard
// Kennzahlen-Übersicht für alle Prozesse
class KPIPage {
    constructor() {
        this.kpiData = null;
        this.selectedPeriod = 'month'; // month, quarter, year
        this.loadingSteps = [
            { id: 'inventur', label: 'Inventur-Daten', done: false },
            { id: 'verlagerung', label: 'Verlagerungen', done: false },
            { id: 'vpw', label: 'Vertragspartnerwechsel', done: false },
            { id: 'abl', label: 'Abnahmebereitschaft', done: false },
            { id: 'verschrottung', label: 'Verschrottungen', done: false }
        ];
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'KPI Dashboard';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        const isLiveMode = typeof apiService !== 'undefined' && apiService.mode === 'live';

        // Show loading screen first if live mode
        if (isLiveMode) {
            this.showLoadingScreen(app);
            this.injectStyles();
            await this.loadDataWithProgress();
            await this.renderDashboard(app, isLiveMode);
        } else {
            await this.renderDashboard(app, isLiveMode);
            this.injectStyles();
        }

        // Attach event listeners
        this.attachEventListeners();
    }

    showLoadingScreen(app) {
        app.innerHTML = `
            <div class="container">
                <div class="kpi-loading-screen">
                    <div class="loading-icon">📊</div>
                    <h2>KPI-Dashboard wird geladen</h2>
                    <p class="loading-hint">Die Berechnung der Kennzahlen erfordert Abfragen an alle Prozess-Schnittstellen. Dies kann einen Moment dauern.</p>

                    <div class="loading-progress-container">
                        <div class="loading-progress-bar">
                            <div class="loading-progress-fill" id="loadingProgressFill" style="width: 0%;"></div>
                        </div>
                        <div class="loading-progress-text" id="loadingProgressText">0%</div>
                    </div>

                    <div class="loading-steps" id="loadingSteps">
                        ${this.loadingSteps.map(step => `
                            <div class="loading-step" id="step-${step.id}">
                                <span class="step-icon">○</span>
                                <span class="step-label">${step.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    updateLoadingProgress(stepId, percent) {
        // Update progress bar
        const progressFill = document.getElementById('loadingProgressFill');
        const progressText = document.getElementById('loadingProgressText');
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = Math.round(percent) + '%';

        // Update step indicator
        if (stepId) {
            const stepEl = document.getElementById('step-' + stepId);
            if (stepEl) {
                stepEl.classList.add('done');
                stepEl.querySelector('.step-icon').textContent = '✓';
            }
        }
    }

    async renderDashboard(app, isLiveMode) {
        app.innerHTML = `
            <div class="container">
                <!-- API Mode Indicator -->
                <div class="kpi-api-indicator ${isLiveMode ? 'live' : 'mock'}">
                    <span class="indicator-dot"></span>
                    <span>${isLiveMode ? 'Live-Daten aus API' : 'Demo-Modus (Mock-Daten)'}</span>
                </div>

                <!-- Header mit Titel und Zeitraum-Auswahl -->
                <div class="kpi-header">
                    <div class="kpi-title-section">
                        <h1 class="kpi-main-title">Kennzahlen-Dashboard</h1>
                        <p class="kpi-subtitle">Performance-Übersicht aller Prozesse</p>
                    </div>
                    <div class="kpi-period-selector">
                        <button class="period-btn active" data-period="month">Monat</button>
                        <button class="period-btn" data-period="quarter">Quartal</button>
                        <button class="period-btn" data-period="year">Jahr</button>
                    </div>
                </div>

                <!-- Haupt-KPI-Karten -->
                <div class="kpi-main-cards">
                    <div class="kpi-card highlight">
                        <div class="kpi-card-icon" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                            <span>✓</span>
                        </div>
                        <div class="kpi-card-content">
                            <div class="kpi-value" id="kpiInventurQuote">87%</div>
                            <div class="kpi-label">Inventur-Quote</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↑</span> +5% vs. Vormonat
                            </div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-icon" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                            <span>⏱</span>
                        </div>
                        <div class="kpi-card-content">
                            <div class="kpi-value" id="kpiBearbeitungszeit">4.2 <span class="kpi-unit">Tage</span></div>
                            <div class="kpi-label">Ø Bearbeitungszeit</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↓</span> -1.3 Tage vs. Vormonat
                            </div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                            <span>⚠</span>
                        </div>
                        <div class="kpi-card-content">
                            <div class="kpi-value" id="kpiÜberfällig">12</div>
                            <div class="kpi-label">Überfällige Inventuren</div>
                            <div class="kpi-trend negative">
                                <span class="trend-arrow">↑</span> +3 vs. Vormonat
                            </div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                            <span>🔧</span>
                        </div>
                        <div class="kpi-card-content">
                            <div class="kpi-value" id="kpiWerkzeuge">1.248</div>
                            <div class="kpi-label">Verwaltete Werkzeuge</div>
                            <div class="kpi-trend neutral">
                                <span class="trend-arrow">→</span> +24 neu
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Prozess-Übersicht -->
                <div class="kpi-section">
                    <h2 class="kpi-section-title">Prozess-Übersicht</h2>
                    <div class="kpi-process-grid">
                        <!-- Inventur -->
                        <div class="kpi-process-card">
                            <div class="process-header">
                                <span class="process-icon">📋</span>
                                <span class="process-name">Inventur</span>
                            </div>
                            <div class="process-stats">
                                <div class="process-stat">
                                    <div class="stat-value" id="invGesamt">156</div>
                                    <div class="stat-label">Gesamt</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value success" id="invAbgeschlossen">136</div>
                                    <div class="stat-label">Abgeschlossen</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value warning" id="invOffen">20</div>
                                    <div class="stat-label">Offen</div>
                                </div>
                            </div>
                            <div class="process-progress">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" id="invProgress" style="width: 87%;"></div>
                                </div>
                                <span class="progress-text">87% abgeschlossen</span>
                            </div>
                        </div>

                        <!-- Verlagerung -->
                        <div class="kpi-process-card">
                            <div class="process-header">
                                <span class="process-icon">🚚</span>
                                <span class="process-name">Verlagerung</span>
                            </div>
                            <div class="process-stats">
                                <div class="process-stat">
                                    <div class="stat-value" id="verlGesamt">45</div>
                                    <div class="stat-label">Gesamt</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value success" id="verlAbgeschlossen">38</div>
                                    <div class="stat-label">Abgeschlossen</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value warning" id="verlOffen">7</div>
                                    <div class="stat-label">Offen</div>
                                </div>
                            </div>
                            <div class="process-progress">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" id="verlProgress" style="width: 84%;"></div>
                                </div>
                                <span class="progress-text">84% abgeschlossen</span>
                            </div>
                        </div>

                        <!-- VPW -->
                        <div class="kpi-process-card">
                            <div class="process-header">
                                <span class="process-icon">🔄</span>
                                <span class="process-name">Vertragspartnerwechsel</span>
                            </div>
                            <div class="process-stats">
                                <div class="process-stat">
                                    <div class="stat-value" id="vpwGesamt">12</div>
                                    <div class="stat-label">Gesamt</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value success" id="vpwAbgeschlossen">9</div>
                                    <div class="stat-label">Abgeschlossen</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value warning" id="vpwOffen">3</div>
                                    <div class="stat-label">Offen</div>
                                </div>
                            </div>
                            <div class="process-progress">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" id="vpwProgress" style="width: 75%;"></div>
                                </div>
                                <span class="progress-text">75% abgeschlossen</span>
                            </div>
                        </div>

                        <!-- ABL -->
                        <div class="kpi-process-card">
                            <div class="process-header">
                                <span class="process-icon">✅</span>
                                <span class="process-name">Abnahmebereitschaft</span>
                            </div>
                            <div class="process-stats">
                                <div class="process-stat">
                                    <div class="stat-value" id="ablGesamt">28</div>
                                    <div class="stat-label">Gesamt</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value success" id="ablAbgeschlossen">22</div>
                                    <div class="stat-label">Akzeptiert</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value warning" id="ablOffen">6</div>
                                    <div class="stat-label">Offen</div>
                                </div>
                            </div>
                            <div class="process-progress">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" id="ablProgress" style="width: 79%;"></div>
                                </div>
                                <span class="progress-text">79% abgeschlossen</span>
                            </div>
                        </div>

                        <!-- Verschrottung -->
                        <div class="kpi-process-card">
                            <div class="process-header">
                                <span class="process-icon">🗑</span>
                                <span class="process-name">Verschrottung</span>
                            </div>
                            <div class="process-stats">
                                <div class="process-stat">
                                    <div class="stat-value" id="scrapGesamt">8</div>
                                    <div class="stat-label">Gesamt</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value success" id="scrapAbgeschlossen">6</div>
                                    <div class="stat-label">Abgeschlossen</div>
                                </div>
                                <div class="process-stat">
                                    <div class="stat-value warning" id="scrapOffen">2</div>
                                    <div class="stat-label">Offen</div>
                                </div>
                            </div>
                            <div class="process-progress">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" id="scrapProgress" style="width: 75%;"></div>
                                </div>
                                <span class="progress-text">75% abgeschlossen</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detail-KPIs in zwei Spalten -->
                <div class="kpi-details-section">
                    <!-- Linke Spalte: Qualitäts-KPIs -->
                    <div class="kpi-detail-card">
                        <h3 class="detail-card-title">Qualitäts-Kennzahlen</h3>
                        <div class="detail-kpi-list">
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Ersterfassungsquote</span>
                                    <span class="detail-kpi-desc">Werkzeuge beim ersten Versuch gefunden</span>
                                </div>
                                <div class="detail-kpi-value success">94.2%</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Fehlende Werkzeuge</span>
                                    <span class="detail-kpi-desc">Als nicht auffindbar gemeldet</span>
                                </div>
                                <div class="detail-kpi-value warning">2.8%</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Standort-Abweichungen</span>
                                    <span class="detail-kpi-desc">Werkzeuge an anderem Ort gefunden</span>
                                </div>
                                <div class="detail-kpi-value">8.5%</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Dokumentationsquote</span>
                                    <span class="detail-kpi-desc">Mit Foto dokumentiert</span>
                                </div>
                                <div class="detail-kpi-value success">89.3%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Rechte Spalte: Performance-KPIs -->
                    <div class="kpi-detail-card">
                        <h3 class="detail-card-title">Performance-Kennzahlen</h3>
                        <div class="detail-kpi-list">
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Durchlaufzeit Inventur</span>
                                    <span class="detail-kpi-desc">Von Zuweisung bis Abschluss</span>
                                </div>
                                <div class="detail-kpi-value">4.2 Tage</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Durchlaufzeit Verlagerung</span>
                                    <span class="detail-kpi-desc">Von Antrag bis Bestaetigung</span>
                                </div>
                                <div class="detail-kpi-value">6.8 Tage</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">Reaktionszeit</span>
                                    <span class="detail-kpi-desc">Ø Zeit bis erste Bearbeitung</span>
                                </div>
                                <div class="detail-kpi-value success">1.2 Tage</div>
                            </div>
                            <div class="detail-kpi-item">
                                <div class="detail-kpi-info">
                                    <span class="detail-kpi-name">SLA-Einhaltung</span>
                                    <span class="detail-kpi-desc">Innerhalb Faelligkeit abgeschlossen</span>
                                </div>
                                <div class="detail-kpi-value success">91.4%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monats-Trend -->
                <div class="kpi-section">
                    <h2 class="kpi-section-title">Monatlicher Trend</h2>
                    <div class="kpi-trend-card">
                        <div class="trend-chart" id="trendChart">
                            <!-- Einfaches Balkendiagramm -->
                            <div class="trend-bars">
                                <div class="trend-bar-group">
                                    <div class="trend-bar" style="height: 65%;" title="Jul: 65%"></div>
                                    <span class="trend-label">Jul</span>
                                </div>
                                <div class="trend-bar-group">
                                    <div class="trend-bar" style="height: 72%;" title="Aug: 72%"></div>
                                    <span class="trend-label">Aug</span>
                                </div>
                                <div class="trend-bar-group">
                                    <div class="trend-bar" style="height: 68%;" title="Sep: 68%"></div>
                                    <span class="trend-label">Sep</span>
                                </div>
                                <div class="trend-bar-group">
                                    <div class="trend-bar" style="height: 78%;" title="Okt: 78%"></div>
                                    <span class="trend-label">Okt</span>
                                </div>
                                <div class="trend-bar-group">
                                    <div class="trend-bar" style="height: 82%;" title="Nov: 82%"></div>
                                    <span class="trend-label">Nov</span>
                                </div>
                                <div class="trend-bar-group">
                                    <div class="trend-bar current" style="height: 87%;" title="Dez: 87%"></div>
                                    <span class="trend-label">Dez</span>
                                </div>
                            </div>
                            <div class="trend-legend">
                                <span class="legend-item"><span class="legend-color"></span> Inventur-Quote (%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top-Standorte -->
                <div class="kpi-section">
                    <h2 class="kpi-section-title">Standort-Ranking</h2>
                    <div class="kpi-ranking-card">
                        <table class="ranking-table">
                            <thead>
                                <tr>
                                    <th>Rang</th>
                                    <th>Standort</th>
                                    <th>Werkzeuge</th>
                                    <th>Inventur-Quote</th>
                                    <th>Ø Bearbeitungszeit</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="rank gold">1</span></td>
                                    <td>Bischofswiesen, DE</td>
                                    <td>245</td>
                                    <td><span class="value success">98.4%</span></td>
                                    <td>2.1 Tage</td>
                                    <td><span class="status-badge status-success">Exzellent</span></td>
                                </tr>
                                <tr>
                                    <td><span class="rank silver">2</span></td>
                                    <td>Neustadt a. Rbge., DE</td>
                                    <td>189</td>
                                    <td><span class="value success">95.2%</span></td>
                                    <td>3.4 Tage</td>
                                    <td><span class="status-badge status-success">Sehr gut</span></td>
                                </tr>
                                <tr>
                                    <td><span class="rank bronze">3</span></td>
                                    <td>Hunedoara, RO</td>
                                    <td>312</td>
                                    <td><span class="value success">91.8%</span></td>
                                    <td>4.2 Tage</td>
                                    <td><span class="status-badge status-success">Gut</span></td>
                                </tr>
                                <tr>
                                    <td><span class="rank">4</span></td>
                                    <td>Timisoara, RO</td>
                                    <td>178</td>
                                    <td><span class="value">85.3%</span></td>
                                    <td>5.1 Tage</td>
                                    <td><span class="status-badge status-info">Befriedigend</span></td>
                                </tr>
                                <tr>
                                    <td><span class="rank">5</span></td>
                                    <td>Satu Mare, RO</td>
                                    <td>156</td>
                                    <td><span class="value warning">72.4%</span></td>
                                    <td>7.8 Tage</td>
                                    <td><span class="status-badge status-warning">Verbesserung nötig</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Inject styles
        this.injectStyles();

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="kpiPage.exportReport()">Export Report</button>
            <button class="btn btn-primary" onclick="kpiPage.refreshData()">Aktualisieren</button>
        `;

        // Load data if not already loaded (for mock mode)
        if (!this.kpiData) {
            this.kpiData = this.getMockKPIData();
        }

        // Update display with loaded data
        this.updateDisplay();
    }

    injectStyles() {
        if (document.getElementById('kpi-page-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'kpi-page-styles';
        styles.textContent = `
            /* API Mode Indicator */
            .kpi-api-indicator {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 500;
                margin-bottom: 1rem;
            }

            .kpi-api-indicator.live {
                background: #dcfce7;
                color: #166534;
            }

            .kpi-api-indicator.mock {
                background: #fef3c7;
                color: #92400e;
            }

            .kpi-api-indicator .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* KPI Header */
            .kpi-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .kpi-main-title {
                font-size: 1.75rem;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
            }

            .kpi-subtitle {
                color: #6b7280;
                margin: 0.25rem 0 0 0;
                font-size: 0.95rem;
            }

            .kpi-period-selector {
                display: flex;
                gap: 0.5rem;
                background: white;
                padding: 0.25rem;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .period-btn {
                padding: 0.5rem 1rem;
                border: none;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Oswald', sans-serif;
                font-weight: 500;
                color: #6b7280;
                transition: all 0.2s;
            }

            .period-btn:hover {
                background: #f3f4f6;
            }

            .period-btn.active {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
            }

            /* Main KPI Cards */
            .kpi-main-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .kpi-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: all 0.2s;
                border-top: 3px solid transparent;
            }

            .kpi-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                border-top-color: #f97316;
            }

            .kpi-card.highlight {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-top-color: #22c55e;
            }

            .kpi-card-icon {
                width: 56px;
                height: 56px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                flex-shrink: 0;
            }

            .kpi-card-content {
                flex: 1;
            }

            .kpi-value {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                line-height: 1.1;
            }

            .kpi-unit {
                font-size: 1rem;
                font-weight: 500;
                color: #6b7280;
            }

            .kpi-label {
                color: #6b7280;
                font-size: 0.9rem;
                margin-top: 0.25rem;
            }

            .kpi-trend {
                font-size: 0.8rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .kpi-trend.positive { color: #22c55e; }
            .kpi-trend.negative { color: #ef4444; }
            .kpi-trend.neutral { color: #6b7280; }

            .trend-arrow {
                font-weight: 700;
            }

            /* Section Titles */
            .kpi-section {
                margin-bottom: 2rem;
            }

            .kpi-section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .kpi-section-title::before {
                content: '';
                width: 4px;
                height: 20px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border-radius: 2px;
            }

            /* Process Cards Grid */
            .kpi-process-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1rem;
            }

            .kpi-process-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: all 0.2s;
            }

            .kpi-process-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            }

            .process-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .process-icon {
                font-size: 1.5rem;
            }

            .process-name {
                font-weight: 600;
                color: #1f2937;
            }

            .process-stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
            }

            .process-stat {
                text-align: center;
            }

            .process-stat .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #1f2937;
            }

            .process-stat .stat-value.success { color: #22c55e; }
            .process-stat .stat-value.warning { color: #f59e0b; }
            .process-stat .stat-value.danger { color: #ef4444; }

            .process-stat .stat-label {
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.25rem;
            }

            .process-progress {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .progress-bar-bg {
                flex: 1;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .progress-text {
                font-size: 0.8rem;
                color: #6b7280;
                white-space: nowrap;
            }

            /* Detail Cards */
            .kpi-details-section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .kpi-detail-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .detail-card-title {
                font-size: 1rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .detail-kpi-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .detail-kpi-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
            }

            .detail-kpi-name {
                font-weight: 500;
                color: #1f2937;
            }

            .detail-kpi-desc {
                font-size: 0.8rem;
                color: #6b7280;
                display: block;
            }

            .detail-kpi-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #1f2937;
            }

            .detail-kpi-value.success { color: #22c55e; }
            .detail-kpi-value.warning { color: #f59e0b; }

            /* Trend Chart */
            .kpi-trend-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .trend-bars {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                height: 200px;
                padding: 1rem 0;
                border-bottom: 2px solid #e5e7eb;
            }

            .trend-bar-group {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }

            .trend-bar {
                width: 40px;
                background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
                border-radius: 4px 4px 0 0;
                transition: all 0.3s;
                cursor: pointer;
            }

            .trend-bar:hover {
                opacity: 0.8;
                transform: scaleY(1.02);
            }

            .trend-bar.current {
                background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
            }

            .trend-label {
                font-size: 0.8rem;
                color: #6b7280;
            }

            .trend-legend {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 1rem;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.85rem;
                color: #6b7280;
            }

            .legend-color {
                width: 12px;
                height: 12px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border-radius: 2px;
            }

            /* Ranking Table */
            .kpi-ranking-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                overflow-x: auto;
            }

            .ranking-table {
                width: 100%;
                border-collapse: collapse;
            }

            .ranking-table th {
                text-align: left;
                padding: 0.75rem;
                font-weight: 600;
                color: #6b7280;
                font-size: 0.85rem;
                border-bottom: 2px solid #e5e7eb;
            }

            .ranking-table td {
                padding: 0.75rem;
                border-bottom: 1px solid #f3f4f6;
            }

            .ranking-table tr:hover {
                background: #f9fafb;
            }

            .rank {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-weight: 700;
                font-size: 0.85rem;
                background: #f3f4f6;
                color: #6b7280;
            }

            .rank.gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; }
            .rank.silver { background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); color: white; }
            .rank.bronze { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; }

            .value.success { color: #22c55e; font-weight: 600; }
            .value.warning { color: #f59e0b; font-weight: 600; }

            .status-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .status-success {
                background: #dcfce7;
                color: #166534;
            }

            .status-info {
                background: #dbeafe;
                color: #1e40af;
            }

            .status-warning {
                background: #fef3c7;
                color: #92400e;
            }

            /* Not Available Badges */
            .kpi-na {
                font-size: 1.25rem;
                color: #9ca3af;
                font-weight: 500;
            }

            .kpi-na-badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                background: #f3f4f6;
                border: 1px dashed #d1d5db;
                border-radius: 4px;
                font-size: 0.75rem;
                color: #6b7280;
                font-weight: 500;
            }

            .kpi-na-small {
                color: #9ca3af;
                font-size: 0.85rem;
                font-style: italic;
            }

            /* Loading indicator */
            .kpi-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                color: #6b7280;
            }

            .kpi-loading::before {
                content: '';
                width: 24px;
                height: 24px;
                border: 3px solid #e5e7eb;
                border-top-color: #f97316;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.75rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Loading Screen */
            .kpi-loading-screen {
                background: white;
                border-radius: 16px;
                padding: 3rem 2rem;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 3rem auto;
            }

            .kpi-loading-screen .loading-icon {
                font-size: 4rem;
                margin-bottom: 1.5rem;
                animation: bounce 1s ease infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .kpi-loading-screen h2 {
                font-size: 1.5rem;
                color: #1f2937;
                margin-bottom: 0.75rem;
            }

            .kpi-loading-screen .loading-hint {
                color: #6b7280;
                font-size: 0.95rem;
                line-height: 1.5;
                margin-bottom: 2rem;
                padding: 0 1rem;
            }

            .loading-progress-container {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
                padding: 0 1rem;
            }

            .loading-progress-bar {
                flex: 1;
                height: 12px;
                background: #e5e7eb;
                border-radius: 6px;
                overflow: hidden;
            }

            .loading-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
                border-radius: 6px;
                transition: width 0.3s ease;
            }

            .loading-progress-text {
                font-weight: 700;
                color: #f97316;
                min-width: 45px;
                text-align: right;
            }

            .loading-steps {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                text-align: left;
                padding: 0 1rem;
            }

            .loading-step {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0.75rem;
                background: #f9fafb;
                border-radius: 6px;
                transition: all 0.3s;
            }

            .loading-step.done {
                background: #dcfce7;
            }

            .loading-step .step-icon {
                font-size: 1rem;
                color: #9ca3af;
                width: 20px;
                text-align: center;
            }

            .loading-step.done .step-icon {
                color: #22c55e;
            }

            .loading-step .step-label {
                color: #6b7280;
                font-size: 0.9rem;
            }

            .loading-step.done .step-label {
                color: #166534;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .kpi-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .kpi-details-section {
                    grid-template-columns: 1fr;
                }

                .kpi-main-cards {
                    grid-template-columns: 1fr;
                }

                .trend-bar {
                    width: 24px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedPeriod = btn.dataset.period;
                this.loadData();
            });
        });
    }

    async loadData() {
        // Check API mode
        const isLiveMode = typeof apiService !== 'undefined' && apiService.mode === 'live';

        if (isLiveMode) {
            // Load real data from APIs
            this.kpiData = await this.loadLiveKPIData();
        } else {
            // Use mock data
            this.kpiData = this.getMockKPIData();
        }

        this.updateDisplay();
    }

    async loadDataWithProgress() {
        // Sequential loading with progress updates
        const data = {
            inventurQuote: 0,
            bearbeitungszeit: null,
            ueberfaellig: 0,
            werkzeuge: 0,
            nichtGefunden: 0,
            standortAbweichung: 0,
            prozesse: {
                inventur: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                verlagerung: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                vpw: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                abl: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                verschrottung: { gesamt: 0, abgeschlossen: 0, offen: 0 }
            },
            standorte: []
        };

        try {
            // Step 1: Inventur (takes longest, 40%)
            this.updateLoadingProgress(null, 5);
            const inventurResult = await this.loadInventurKPIs();
            if (inventurResult) {
                data.prozesse.inventur = inventurResult.prozess;
                data.inventurQuote = inventurResult.quote;
                data.ueberfaellig = inventurResult.ueberfaellig;
                data.werkzeuge = inventurResult.werkzeuge;
                data.nichtGefunden = inventurResult.nichtGefunden;
                data.standortAbweichung = inventurResult.standortAbweichung;
                data.standorte = inventurResult.standorte || [];
            }
            this.updateLoadingProgress('inventur', 40);

            // Step 2: Verlagerung (20%)
            const verlagerungResult = await this.loadVerlagerungKPIs();
            if (verlagerungResult) {
                data.prozesse.verlagerung = verlagerungResult;
            }
            this.updateLoadingProgress('verlagerung', 55);

            // Step 3: VPW (15%)
            const vpwResult = await this.loadVPWKPIs();
            if (vpwResult) {
                data.prozesse.vpw = vpwResult;
            }
            this.updateLoadingProgress('vpw', 70);

            // Step 4: ABL (15%)
            const ablResult = await this.loadABLKPIs();
            if (ablResult) {
                data.prozesse.abl = ablResult;
            }
            this.updateLoadingProgress('abl', 85);

            // Step 5: Verschrottung (10%)
            const verschrottungResult = await this.loadVerschrottungKPIs();
            if (verschrottungResult) {
                data.prozesse.verschrottung = verschrottungResult;
            }
            this.updateLoadingProgress('verschrottung', 100);

        } catch (error) {
            console.error('Error loading KPI data with progress:', error);
        }

        this.kpiData = data;
    }

    async loadLiveKPIData() {
        const data = {
            inventurQuote: 0,
            bearbeitungszeit: null, // Nicht aus API berechenbar
            ueberfaellig: 0,
            werkzeuge: 0,
            nichtGefunden: 0,
            standortAbweichung: 0,
            prozesse: {
                inventur: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                verlagerung: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                vpw: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                abl: { gesamt: 0, abgeschlossen: 0, offen: 0 },
                verschrottung: { gesamt: 0, abgeschlossen: 0, offen: 0 }
            },
            standorte: []
        };

        try {
            // Parallel API calls for better performance
            const [
                inventurResult,
                verlagerungResult,
                vpwResult,
                ablResult,
                verschrottungResult
            ] = await Promise.allSettled([
                this.loadInventurKPIs(),
                this.loadVerlagerungKPIs(),
                this.loadVPWKPIs(),
                this.loadABLKPIs(),
                this.loadVerschrottungKPIs()
            ]);

            // Inventur KPIs
            if (inventurResult.status === 'fulfilled' && inventurResult.value) {
                const inv = inventurResult.value;
                data.prozesse.inventur = inv.prozess;
                data.inventurQuote = inv.quote;
                data.ueberfaellig = inv.ueberfaellig;
                data.werkzeuge = inv.werkzeuge;
                data.nichtGefunden = inv.nichtGefunden;
                data.standortAbweichung = inv.standortAbweichung;
                data.standorte = inv.standorte || [];
            }

            // Verlagerung KPIs
            if (verlagerungResult.status === 'fulfilled' && verlagerungResult.value) {
                data.prozesse.verlagerung = verlagerungResult.value;
            }

            // VPW KPIs
            if (vpwResult.status === 'fulfilled' && vpwResult.value) {
                data.prozesse.vpw = vpwResult.value;
            }

            // ABL KPIs
            if (ablResult.status === 'fulfilled' && ablResult.value) {
                data.prozesse.abl = ablResult.value;
            }

            // Verschrottung KPIs
            if (verschrottungResult.status === 'fulfilled' && verschrottungResult.value) {
                data.prozesse.verschrottung = verschrottungResult.value;
            }

        } catch (error) {
            console.error('Error loading KPI data:', error);
        }

        return data;
    }

    async loadInventurKPIs() {
        try {
            // First, load all inventories
            const inventories = await apiService.getInventoryList({ limit: 10000 });

            if (!inventories || !inventories.length) {
                return null;
            }

            // Collect all positions from all inventories
            let allPositions = [];
            const inventoryKeys = inventories.map(inv => inv.key || inv.inventoryKey).filter(k => k);

            // Load positions from up to 10 most recent inventories to avoid too many API calls
            const keysToLoad = inventoryKeys.slice(0, 10);

            for (const invKey of keysToLoad) {
                try {
                    const result = await apiService.getInventoryPositions(invKey, { limit: 10000 });
                    if (result && result.data) {
                        allPositions = allPositions.concat(result.data);
                    }
                } catch (e) {
                    console.warn('Could not load positions for inventory', invKey);
                }
            }

            // If no positions loaded, fallback to inventory-level stats
            if (allPositions.length === 0) {
                // Calculate from inventory level
                let invAbgeschlossen = 0;
                let invOffen = 0;

                inventories.forEach(inv => {
                    const status = inv.status || inv.inventoryStatus;
                    if (['I3', 'I4'].includes(status)) {
                        invAbgeschlossen++;
                    } else {
                        invOffen++;
                    }
                });

                const quote = inventories.length > 0 ? Math.round((invAbgeschlossen / inventories.length) * 100) : 0;

                return {
                    prozess: {
                        gesamt: inventories.length,
                        abgeschlossen: invAbgeschlossen,
                        offen: invOffen
                    },
                    quote,
                    ueberfaellig: 0,
                    werkzeuge: inventories.length,
                    nichtGefunden: 0,
                    standortAbweichung: 0,
                    standorte: []
                };
            }

            const total = allPositions.length;
            let confirmed = 0;
            let pending = 0;
            let overdue = 0;
            let nichtGefunden = 0;
            let standortAbweichung = 0;
            const now = new Date();
            const standortMap = {};

            allPositions.forEach(pos => {
                const status = pos.status || pos.positionStatus;

                // P2-P5 = bearbeitet/bestätigt, P0-P1 = offen
                if (['P2', 'P3', 'P4', 'P5'].includes(status)) {
                    confirmed++;
                } else if (['P0', 'P1'].includes(status)) {
                    pending++;
                }

                // P6 = nicht gefunden
                if (status === 'P6') {
                    nichtGefunden++;
                }

                // P4, P5 = anderer Standort
                if (['P4', 'P5'].includes(status)) {
                    standortAbweichung++;
                }

                // Check overdue
                const dueDate = pos.dueDate ? new Date(pos.dueDate) : null;
                if (dueDate && dueDate < now && ['P0', 'P1'].includes(status)) {
                    overdue++;
                }

                // Collect location stats
                const location = pos.location || pos.locationTitle || 'Unbekannt';
                if (location && location !== 'Unbekannt') {
                    if (!standortMap[location]) {
                        standortMap[location] = { total: 0, confirmed: 0 };
                    }
                    standortMap[location].total++;
                    if (['P2', 'P3', 'P4', 'P5'].includes(status)) {
                        standortMap[location].confirmed++;
                    }
                }
            });

            // Convert standortMap to sorted array
            const standorte = Object.entries(standortMap)
                .map(([name, stats]) => ({
                    name,
                    werkzeuge: stats.total,
                    quote: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0
                }))
                .sort((a, b) => b.quote - a.quote)
                .slice(0, 5);

            const quote = total > 0 ? Math.round((confirmed / total) * 100) : 0;

            return {
                prozess: {
                    gesamt: total,
                    abgeschlossen: confirmed,
                    offen: pending
                },
                quote,
                ueberfaellig: overdue,
                werkzeuge: total,
                nichtGefunden: total > 0 ? Math.round((nichtGefunden / total) * 100 * 10) / 10 : 0,
                standortAbweichung: total > 0 ? Math.round((standortAbweichung / total) * 100 * 10) / 10 : 0,
                standorte
            };
        } catch (error) {
            console.error('Error loading Inventur KPIs:', error);
            return null;
        }
    }

    async loadVerlagerungKPIs() {
        try {
            const data = await apiService.getVerlagerungList({ limit: 10000 });

            if (!data || !data.length) {
                return { gesamt: 0, abgeschlossen: 0, offen: 0 };
            }

            let abgeschlossen = 0;
            let offen = 0;

            data.forEach(item => {
                const status = item.status || item.processStatus;
                // Typical completed statuses
                if (['COMPLETED', 'DONE', 'CLOSED', 'R4', 'R5'].includes(status)) {
                    abgeschlossen++;
                } else {
                    offen++;
                }
            });

            return {
                gesamt: data.length,
                abgeschlossen,
                offen
            };
        } catch (error) {
            console.error('Error loading Verlagerung KPIs:', error);
            return { gesamt: 0, abgeschlossen: 0, offen: 0 };
        }
    }

    async loadVPWKPIs() {
        try {
            const data = await apiService.getPartnerwechselList({ limit: 10000 });

            if (!data || !data.length) {
                return { gesamt: 0, abgeschlossen: 0, offen: 0 };
            }

            let abgeschlossen = 0;
            let offen = 0;

            data.forEach(item => {
                const status = item.status || item.processStatus;
                if (['COMPLETED', 'DONE', 'CLOSED'].includes(status)) {
                    abgeschlossen++;
                } else {
                    offen++;
                }
            });

            return {
                gesamt: data.length,
                abgeschlossen,
                offen
            };
        } catch (error) {
            console.error('Error loading VPW KPIs:', error);
            return { gesamt: 0, abgeschlossen: 0, offen: 0 };
        }
    }

    async loadABLKPIs() {
        try {
            const data = await apiService.getABLList({ limit: 10000 });

            if (!data || !data.length) {
                return { gesamt: 0, abgeschlossen: 0, offen: 0 };
            }

            let abgeschlossen = 0;
            let offen = 0;

            data.forEach(item => {
                const status = item.status || item.inventoryStatus;
                // I3, I4 = completed
                if (['I3', 'I4', 'COMPLETED', 'DONE'].includes(status)) {
                    abgeschlossen++;
                } else {
                    offen++;
                }
            });

            return {
                gesamt: data.length,
                abgeschlossen,
                offen
            };
        } catch (error) {
            console.error('Error loading ABL KPIs:', error);
            return { gesamt: 0, abgeschlossen: 0, offen: 0 };
        }
    }

    async loadVerschrottungKPIs() {
        try {
            const data = await apiService.getVerschrottungList({ limit: 10000 });

            if (!data || !data.length) {
                return { gesamt: 0, abgeschlossen: 0, offen: 0 };
            }

            let abgeschlossen = 0;
            let offen = 0;

            data.forEach(item => {
                const status = item.status || item.processStatus;
                if (['COMPLETED', 'DONE', 'CLOSED', 'S4', 'S5'].includes(status)) {
                    abgeschlossen++;
                } else {
                    offen++;
                }
            });

            return {
                gesamt: data.length,
                abgeschlossen,
                offen
            };
        } catch (error) {
            console.error('Error loading Verschrottung KPIs:', error);
            return { gesamt: 0, abgeschlossen: 0, offen: 0 };
        }
    }

    getMockKPIData() {
        const periodMultipliers = {
            'month': 1,
            'quarter': 3,
            'year': 12
        };
        const mult = periodMultipliers[this.selectedPeriod];

        return {
            inventurQuote: 87,
            bearbeitungszeit: 4.2,
            ueberfaellig: 12 * (this.selectedPeriod === 'month' ? 1 : this.selectedPeriod === 'quarter' ? 2 : 5),
            werkzeuge: 1248,
            nichtGefunden: 2.8,
            standortAbweichung: 8.5,
            prozesse: {
                inventur: { gesamt: 156 * mult, abgeschlossen: 136 * mult, offen: 20 * mult },
                verlagerung: { gesamt: 45 * mult, abgeschlossen: 38 * mult, offen: 7 * mult },
                vpw: { gesamt: 12 * mult, abgeschlossen: 9 * mult, offen: 3 * mult },
                abl: { gesamt: 28 * mult, abgeschlossen: 22 * mult, offen: 6 * mult },
                verschrottung: { gesamt: 8 * mult, abgeschlossen: 6 * mult, offen: 2 * mult }
            },
            standorte: [
                { name: 'Bischofswiesen, DE', werkzeuge: 245, quote: 98 },
                { name: 'Neustadt a. Rbge., DE', werkzeuge: 189, quote: 95 },
                { name: 'Hunedoara, RO', werkzeuge: 312, quote: 92 },
                { name: 'Timisoara, RO', werkzeuge: 178, quote: 85 },
                { name: 'Satu Mare, RO', werkzeuge: 156, quote: 72 }
            ]
        };
    }

    updateDisplay() {
        const data = this.kpiData;
        const isLiveMode = typeof apiService !== 'undefined' && apiService.mode === 'live';

        // Update main KPIs
        document.getElementById('kpiInventurQuote').textContent = data.inventurQuote + '%';

        // Bearbeitungszeit - nur im Mock-Modus verfügbar
        const bearbeitungEl = document.getElementById('kpiBearbeitungszeit');
        if (data.bearbeitungszeit !== null) {
            bearbeitungEl.innerHTML = data.bearbeitungszeit + ' <span class="kpi-unit">Tage</span>';
        } else {
            bearbeitungEl.innerHTML = '<span class="kpi-na">n/a</span>';
        }

        document.getElementById('kpiUeberfaellig').textContent = data.ueberfaellig;
        document.getElementById('kpiWerkzeuge').textContent = data.werkzeuge.toLocaleString('de-DE');

        // Update process counts
        const proz = data.prozesse;

        // Inventur
        document.getElementById('invGesamt').textContent = proz.inventur.gesamt;
        document.getElementById('invAbgeschlossen').textContent = proz.inventur.abgeschlossen;
        document.getElementById('invOffen').textContent = proz.inventur.offen;
        const invPercent = proz.inventur.gesamt > 0 ? Math.round((proz.inventur.abgeschlossen / proz.inventur.gesamt) * 100) : 0;
        document.getElementById('invProgress').style.width = invPercent + '%';
        document.querySelector('#invProgress').parentElement.nextElementSibling.textContent = invPercent + '% abgeschlossen';

        // Verlagerung
        document.getElementById('verlGesamt').textContent = proz.verlagerung.gesamt;
        document.getElementById('verlAbgeschlossen').textContent = proz.verlagerung.abgeschlossen;
        document.getElementById('verlOffen').textContent = proz.verlagerung.offen;
        const verlPercent = proz.verlagerung.gesamt > 0 ? Math.round((proz.verlagerung.abgeschlossen / proz.verlagerung.gesamt) * 100) : 0;
        document.getElementById('verlProgress').style.width = verlPercent + '%';
        document.querySelector('#verlProgress').parentElement.nextElementSibling.textContent = verlPercent + '% abgeschlossen';

        // VPW
        document.getElementById('vpwGesamt').textContent = proz.vpw.gesamt;
        document.getElementById('vpwAbgeschlossen').textContent = proz.vpw.abgeschlossen;
        document.getElementById('vpwOffen').textContent = proz.vpw.offen;
        const vpwPercent = proz.vpw.gesamt > 0 ? Math.round((proz.vpw.abgeschlossen / proz.vpw.gesamt) * 100) : 0;
        document.getElementById('vpwProgress').style.width = vpwPercent + '%';
        document.querySelector('#vpwProgress').parentElement.nextElementSibling.textContent = vpwPercent + '% abgeschlossen';

        // ABL
        document.getElementById('ablGesamt').textContent = proz.abl.gesamt;
        document.getElementById('ablAbgeschlossen').textContent = proz.abl.abgeschlossen;
        document.getElementById('ablOffen').textContent = proz.abl.offen;
        const ablPercent = proz.abl.gesamt > 0 ? Math.round((proz.abl.abgeschlossen / proz.abl.gesamt) * 100) : 0;
        document.getElementById('ablProgress').style.width = ablPercent + '%';
        document.querySelector('#ablProgress').parentElement.nextElementSibling.textContent = ablPercent + '% abgeschlossen';

        // Verschrottung
        document.getElementById('scrapGesamt').textContent = proz.verschrottung.gesamt;
        document.getElementById('scrapAbgeschlossen').textContent = proz.verschrottung.abgeschlossen;
        document.getElementById('scrapOffen').textContent = proz.verschrottung.offen;
        const scrapPercent = proz.verschrottung.gesamt > 0 ? Math.round((proz.verschrottung.abgeschlossen / proz.verschrottung.gesamt) * 100) : 0;
        document.getElementById('scrapProgress').style.width = scrapPercent + '%';
        document.querySelector('#scrapProgress').parentElement.nextElementSibling.textContent = scrapPercent + '% abgeschlossen';

        // Update Quality KPIs
        this.updateQualityKPIs(data, isLiveMode);

        // Update Standort-Ranking
        this.updateStandortRanking(data.standorte, isLiveMode);
    }

    updateQualityKPIs(data, isLiveMode) {
        const qualityContainer = document.querySelector('.kpi-detail-card:first-child .detail-kpi-list');
        if (!qualityContainer) return;

        // Ersterfassungsquote - berechenbar aus Inventur (P2 beim ersten Versuch)
        // Vereinfacht: 100% - nichtGefunden% - standortAbweichung%
        const ersterfassung = isLiveMode
            ? Math.max(0, 100 - (data.nichtGefunden || 0) - (data.standortAbweichung || 0))
            : 94.2;

        qualityContainer.innerHTML = `
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Ersterfassungsquote</span>
                    <span class="detail-kpi-desc">Werkzeuge beim ersten Versuch gefunden</span>
                </div>
                <div class="detail-kpi-value ${ersterfassung >= 90 ? 'success' : ersterfassung >= 70 ? '' : 'warning'}">${ersterfassung.toFixed(1)}%</div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Fehlende Werkzeuge</span>
                    <span class="detail-kpi-desc">Als nicht auffindbar gemeldet (P6)</span>
                </div>
                <div class="detail-kpi-value ${(data.nichtGefunden || 0) <= 3 ? '' : 'warning'}">${(data.nichtGefunden || 2.8).toFixed(1)}%</div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Standort-Abweichungen</span>
                    <span class="detail-kpi-desc">Werkzeuge an anderem Ort gefunden (P4/P5)</span>
                </div>
                <div class="detail-kpi-value">${(data.standortAbweichung || 8.5).toFixed(1)}%</div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Dokumentationsquote</span>
                    <span class="detail-kpi-desc">Mit Foto dokumentiert</span>
                </div>
                <div class="detail-kpi-value ${isLiveMode ? '' : 'success'}">
                    ${isLiveMode ? '<span class="kpi-na-badge">Nicht verfügbar</span>' : '89.3%'}
                </div>
            </div>
        `;

        // Update Performance KPIs
        const perfContainer = document.querySelector('.kpi-detail-card:last-child .detail-kpi-list');
        if (!perfContainer) return;

        perfContainer.innerHTML = `
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Durchlaufzeit Inventur</span>
                    <span class="detail-kpi-desc">Von Zuweisung bis Abschluss</span>
                </div>
                <div class="detail-kpi-value">
                    ${isLiveMode ? '<span class="kpi-na-badge">Nicht verfügbar</span>' : '4.2 Tage'}
                </div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Durchlaufzeit Verlagerung</span>
                    <span class="detail-kpi-desc">Von Antrag bis Bestaetigung</span>
                </div>
                <div class="detail-kpi-value">
                    ${isLiveMode ? '<span class="kpi-na-badge">Nicht verfügbar</span>' : '6.8 Tage'}
                </div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">Reaktionszeit</span>
                    <span class="detail-kpi-desc">Durchschnittliche Zeit bis erste Bearbeitung</span>
                </div>
                <div class="detail-kpi-value">
                    ${isLiveMode ? '<span class="kpi-na-badge">Nicht verfügbar</span>' : '<span class="success">1.2 Tage</span>'}
                </div>
            </div>
            <div class="detail-kpi-item">
                <div class="detail-kpi-info">
                    <span class="detail-kpi-name">SLA-Einhaltung</span>
                    <span class="detail-kpi-desc">Innerhalb Faelligkeit abgeschlossen</span>
                </div>
                <div class="detail-kpi-value">
                    ${isLiveMode ? '<span class="kpi-na-badge">Nicht verfügbar</span>' : '<span class="success">91.4%</span>'}
                </div>
            </div>
        `;
    }

    updateStandortRanking(standorte, isLiveMode) {
        const tbody = document.querySelector('.ranking-table tbody');
        if (!tbody) return;

        if (!standorte || standorte.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #6b7280; padding: 2rem;">
                        ${isLiveMode ? 'Keine Standortdaten verfügbar' : 'Laden...'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = standorte.map((s, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const quoteClass = s.quote >= 90 ? 'success' : s.quote >= 70 ? '' : 'warning';
            const statusLabel = s.quote >= 95 ? 'Exzellent' : s.quote >= 90 ? 'Sehr gut' : s.quote >= 80 ? 'Gut' : s.quote >= 70 ? 'Befriedigend' : 'Verbesserung nötig';
            const statusClass = s.quote >= 90 ? 'status-success' : s.quote >= 70 ? 'status-info' : 'status-warning';

            return `
                <tr>
                    <td><span class="rank ${rankClass}">${i + 1}</span></td>
                    <td>${s.name}</td>
                    <td>${s.werkzeuge}</td>
                    <td><span class="value ${quoteClass}">${s.quote}%</span></td>
                    <td>${isLiveMode ? '<span class="kpi-na-small">n/a</span>' : (2 + i * 1.2).toFixed(1) + ' Tage'}</td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                </tr>
            `;
        }).join('');
    }

    exportReport() {
        // Generate CSV export of KPI data
        const data = this.kpiData;
        const rows = [
            ['KPI Report - ' + new Date().toLocaleDateString('de-DE')],
            [''],
            ['Kennzahl', 'Wert'],
            ['Inventur-Quote', data.inventurQuote + '%'],
            ['Bearbeitungszeit', data.bearbeitungszeit + ' Tage'],
            ['Überfällig', data.ueberfaellig],
            ['Verwaltete Werkzeuge', data.werkzeuge],
            [''],
            ['Prozess', 'Gesamt', 'Abgeschlossen', 'Offen'],
            ['Inventur', data.prozesse.inventur.gesamt, data.prozesse.inventur.abgeschlossen, data.prozesse.inventur.offen],
            ['Verlagerung', data.prozesse.verlagerung.gesamt, data.prozesse.verlagerung.abgeschlossen, data.prozesse.verlagerung.offen],
            ['VPW', data.prozesse.vpw.gesamt, data.prozesse.vpw.abgeschlossen, data.prozesse.vpw.offen],
            ['ABL', data.prozesse.abl.gesamt, data.prozesse.abl.abgeschlossen, data.prozesse.abl.offen],
            ['Verschrottung', data.prozesse.verschrottung.gesamt, data.prozesse.verschrottung.abgeschlossen, data.prozesse.verschrottung.offen]
        ];

        const csvContent = rows.map(row => row.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'KPI_Report_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    }

    refreshData() {
        this.loadData();
    }
}

// Create global instance
const kpiPage = new KPIPage();
