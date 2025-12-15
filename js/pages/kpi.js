// ORCA 2.0 - KPI Dashboard
// Kennzahlen-Uebersicht fuer alle Prozesse
class KPIPage {
    constructor() {
        this.kpiData = null;
        this.selectedPeriod = 'month'; // month, quarter, year
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

        app.innerHTML = `
            <div class="container">
                <!-- Header mit Titel und Zeitraum-Auswahl -->
                <div class="kpi-header">
                    <div class="kpi-title-section">
                        <h1 class="kpi-main-title">Kennzahlen-Dashboard</h1>
                        <p class="kpi-subtitle">Performance-Uebersicht aller Prozesse</p>
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
                            <div class="kpi-value" id="kpiUeberfaellig">12</div>
                            <div class="kpi-label">Ueberfaellige Inventuren</div>
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

                <!-- Prozess-Uebersicht -->
                <div class="kpi-section">
                    <h2 class="kpi-section-title">Prozess-Uebersicht</h2>
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
                    <!-- Linke Spalte: Qualitaets-KPIs -->
                    <div class="kpi-detail-card">
                        <h3 class="detail-card-title">Qualitaets-Kennzahlen</h3>
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
                                    <td><span class="status-badge status-warning">Verbesserung noetig</span></td>
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

        // Attach event listeners
        this.attachEventListeners();

        // Load data (Mock for now)
        await this.loadData();
    }

    injectStyles() {
        if (document.getElementById('kpi-page-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'kpi-page-styles';
        styles.textContent = `
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
        // Mock data for now - will be replaced with API calls later
        this.kpiData = this.getMockKPIData();
        this.updateDisplay();
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
            prozesse: {
                inventur: { gesamt: 156 * mult, abgeschlossen: 136 * mult, offen: 20 * mult },
                verlagerung: { gesamt: 45 * mult, abgeschlossen: 38 * mult, offen: 7 * mult },
                vpw: { gesamt: 12 * mult, abgeschlossen: 9 * mult, offen: 3 * mult },
                abl: { gesamt: 28 * mult, abgeschlossen: 22 * mult, offen: 6 * mult },
                verschrottung: { gesamt: 8 * mult, abgeschlossen: 6 * mult, offen: 2 * mult }
            }
        };
    }

    updateDisplay() {
        // Update main KPIs based on selected period
        const data = this.kpiData;

        // Update process counts
        const proz = data.prozesse;

        // Inventur
        document.getElementById('invGesamt').textContent = proz.inventur.gesamt;
        document.getElementById('invAbgeschlossen').textContent = proz.inventur.abgeschlossen;
        document.getElementById('invOffen').textContent = proz.inventur.offen;
        const invPercent = Math.round((proz.inventur.abgeschlossen / proz.inventur.gesamt) * 100);
        document.getElementById('invProgress').style.width = invPercent + '%';

        // Verlagerung
        document.getElementById('verlGesamt').textContent = proz.verlagerung.gesamt;
        document.getElementById('verlAbgeschlossen').textContent = proz.verlagerung.abgeschlossen;
        document.getElementById('verlOffen').textContent = proz.verlagerung.offen;
        const verlPercent = Math.round((proz.verlagerung.abgeschlossen / proz.verlagerung.gesamt) * 100);
        document.getElementById('verlProgress').style.width = verlPercent + '%';

        // VPW
        document.getElementById('vpwGesamt').textContent = proz.vpw.gesamt;
        document.getElementById('vpwAbgeschlossen').textContent = proz.vpw.abgeschlossen;
        document.getElementById('vpwOffen').textContent = proz.vpw.offen;
        const vpwPercent = Math.round((proz.vpw.abgeschlossen / proz.vpw.gesamt) * 100);
        document.getElementById('vpwProgress').style.width = vpwPercent + '%';

        // ABL
        document.getElementById('ablGesamt').textContent = proz.abl.gesamt;
        document.getElementById('ablAbgeschlossen').textContent = proz.abl.abgeschlossen;
        document.getElementById('ablOffen').textContent = proz.abl.offen;
        const ablPercent = Math.round((proz.abl.abgeschlossen / proz.abl.gesamt) * 100);
        document.getElementById('ablProgress').style.width = ablPercent + '%';

        // Verschrottung
        document.getElementById('scrapGesamt').textContent = proz.verschrottung.gesamt;
        document.getElementById('scrapAbgeschlossen').textContent = proz.verschrottung.abgeschlossen;
        document.getElementById('scrapOffen').textContent = proz.verschrottung.offen;
        const scrapPercent = Math.round((proz.verschrottung.abgeschlossen / proz.verschrottung.gesamt) * 100);
        document.getElementById('scrapProgress').style.width = scrapPercent + '%';

        // Update Ueberfaellige
        document.getElementById('kpiUeberfaellig').textContent = data.ueberfaellig;
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
            ['Ueberfaellig', data.ueberfaellig],
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
