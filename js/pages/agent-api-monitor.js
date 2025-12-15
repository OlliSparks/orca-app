// ORCA 2.0 - API Monitor Agent (Admin-Übersicht angebundener Lieferanten)
class AgentAPIMonitorPage {
    constructor() {
        this.connectedSuppliers = [];
        this.isLoading = false;
    }

    render() {
        const app = document.getElementById('app');

        // Update header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - API-Monitor';
        document.getElementById('headerSubtitle').textContent = 'Angebundene Lieferanten-Systeme';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation dropdown
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) {
            navDropdown.value = '/agenten';
        }

        app.innerHTML = `
            <div class="container api-monitor-page">
                <!-- Stats Cards -->
                <div class="monitor-stats">
                    <div class="stat-card">
                        <div class="stat-icon connected">🟢</div>
                        <div class="stat-content">
                            <div class="stat-value" id="connectedCount">3</div>
                            <div class="stat-label">Verbunden</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pending">🟡</div>
                        <div class="stat-content">
                            <div class="stat-value" id="pendingCount">1</div>
                            <div class="stat-label">In Einrichtung</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon error">🔴</div>
                        <div class="stat-content">
                            <div class="stat-value" id="errorCount">0</div>
                            <div class="stat-label">Fehler</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon requests">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="requestsToday">47</div>
                            <div class="stat-label">Anfragen heute</div>
                        </div>
                    </div>
                </div>

                <!-- Supplier List -->
                <div class="monitor-section">
                    <div class="section-header">
                        <h2>Angebundene Lieferanten</h2>
                        <div class="section-actions">
                            <button class="btn btn-neutral" id="refreshBtn">🔄 Aktualisieren</button>
                        </div>
                    </div>

                    <div class="supplier-list" id="supplierList">
                        ${this.renderSupplierList()}
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="monitor-section">
                    <div class="section-header">
                        <h2>Letzte Aktivitäten</h2>
                    </div>

                    <div class="activity-log" id="activityLog">
                        ${this.renderActivityLog()}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
    }

    renderSupplierList() {
        // Demo data
        const suppliers = [
            {
                id: 1,
                name: 'DAS DRAEXLMAIER',
                number: '133188',
                status: 'connected',
                mode: 'automatic',
                lastActivity: new Date(Date.now() - 5 * 60000),
                requestsToday: 23,
                responseRate: 100
            },
            {
                id: 2,
                name: 'Bosch Rexroth AG',
                number: '145892',
                status: 'connected',
                mode: 'review',
                lastActivity: new Date(Date.now() - 45 * 60000),
                requestsToday: 15,
                responseRate: 95
            },
            {
                id: 3,
                name: 'Continental AG',
                number: '167234',
                status: 'connected',
                mode: 'automatic',
                lastActivity: new Date(Date.now() - 2 * 60 * 60000),
                requestsToday: 9,
                responseRate: 100
            },
            {
                id: 4,
                name: 'ZF Friedrichshafen',
                number: '189456',
                status: 'pending',
                mode: null,
                lastActivity: null,
                requestsToday: 0,
                responseRate: null
            }
        ];

        return suppliers.map(supplier => `
            <div class="supplier-card ${supplier.status}">
                <div class="supplier-main">
                    <div class="supplier-status">
                        ${this.getStatusIcon(supplier.status)}
                    </div>
                    <div class="supplier-info">
                        <h3>${supplier.name}</h3>
                        <span class="supplier-number">LNR: ${supplier.number}</span>
                    </div>
                    <div class="supplier-mode">
                        ${supplier.mode === 'automatic' ? '<span class="mode-badge automatic">🤖 Vollautomatisch</span>' : ''}
                        ${supplier.mode === 'review' ? '<span class="mode-badge review">👁️ Prüfen & Freigeben</span>' : ''}
                        ${!supplier.mode ? '<span class="mode-badge pending">⏳ In Einrichtung</span>' : ''}
                    </div>
                </div>
                <div class="supplier-metrics">
                    <div class="metric">
                        <span class="metric-value">${supplier.requestsToday || '-'}</span>
                        <span class="metric-label">Heute</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${supplier.responseRate !== null ? supplier.responseRate + '%' : '-'}</span>
                        <span class="metric-label">Antwortrate</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${supplier.lastActivity ? this.formatRelativeTime(supplier.lastActivity) : '-'}</span>
                        <span class="metric-label">Letzte Aktivität</span>
                    </div>
                </div>
                <div class="supplier-actions">
                    <button class="action-btn" title="Details anzeigen">📋</button>
                    <button class="action-btn" title="Einstellungen">⚙️</button>
                    <button class="action-btn" title="Aktivitätslog">📊</button>
                </div>
            </div>
        `).join('');
    }

    renderActivityLog() {
        const activities = [
            { time: new Date(Date.now() - 5 * 60000), supplier: 'DAS DRAEXLMAIER', type: 'response', message: 'Inventurantwort für WZ-123456 gesendet' },
            { time: new Date(Date.now() - 12 * 60000), supplier: 'DAS DRAEXLMAIER', type: 'request', message: 'Inventuranfrage für WZ-789012 empfangen' },
            { time: new Date(Date.now() - 25 * 60000), supplier: 'Bosch Rexroth AG', type: 'response', message: 'Inventurantwort für WZ-345678 manuell freigegeben' },
            { time: new Date(Date.now() - 45 * 60000), supplier: 'Bosch Rexroth AG', type: 'request', message: 'Inventuranfrage für WZ-901234 empfangen' },
            { time: new Date(Date.now() - 2 * 60 * 60000), supplier: 'Continental AG', type: 'response', message: 'Inventurantwort für WZ-567890 gesendet' }
        ];

        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${this.formatTime(activity.time)}</div>
                <div class="activity-icon ${activity.type}">
                    ${activity.type === 'response' ? '↗️' : '↙️'}
                </div>
                <div class="activity-content">
                    <span class="activity-supplier">${activity.supplier}</span>
                    <span class="activity-message">${activity.message}</span>
                </div>
            </div>
        `).join('');
    }

    getStatusIcon(status) {
        switch (status) {
            case 'connected': return '🟢';
            case 'pending': return '🟡';
            case 'error': return '🔴';
            default: return '⚪';
        }
    }

    formatRelativeTime(date) {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'Gerade eben';
        if (minutes < 60) return `vor ${minutes} Min`;
        if (hours < 24) return `vor ${hours} Std`;
        return date.toLocaleDateString('de-DE');
    }

    formatTime(date) {
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    attachEventListeners() {
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.render();
        });
    }

    addStyles() {
        if (document.getElementById('api-monitor-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'api-monitor-styles';
        styles.textContent = `
            .api-monitor-page {
                padding: 1.5rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Stats Cards */
            .monitor-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .stat-icon {
                font-size: 2rem;
            }

            .stat-value {
                font-size: 1.75rem;
                font-weight: 700;
                color: #1f2937;
            }

            .stat-label {
                font-size: 0.85rem;
                color: #6b7280;
            }

            /* Section */
            .monitor-section {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 1.5rem;
                overflow: hidden;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .section-header h2 {
                margin: 0;
                font-size: 1.1rem;
            }

            /* Supplier List */
            .supplier-list {
                padding: 0.5rem;
            }

            .supplier-card {
                display: grid;
                grid-template-columns: 1fr auto auto;
                align-items: center;
                gap: 1.5rem;
                padding: 1rem 1.25rem;
                border-radius: 8px;
                margin: 0.5rem;
                transition: background 0.2s;
            }

            .supplier-card:hover {
                background: #f8fafc;
            }

            .supplier-card.pending {
                opacity: 0.7;
            }

            .supplier-main {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .supplier-status {
                font-size: 1.25rem;
            }

            .supplier-info h3 {
                margin: 0;
                font-size: 1rem;
            }

            .supplier-number {
                font-size: 0.8rem;
                color: #6b7280;
            }

            .supplier-mode {
                margin-left: auto;
            }

            .mode-badge {
                padding: 0.35rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 500;
            }

            .mode-badge.automatic {
                background: #dcfce7;
                color: #15803d;
            }

            .mode-badge.review {
                background: #fef3c7;
                color: #92400e;
            }

            .mode-badge.pending {
                background: #e5e7eb;
                color: #6b7280;
            }

            .supplier-metrics {
                display: flex;
                gap: 2rem;
            }

            .metric {
                text-align: center;
            }

            .metric-value {
                display: block;
                font-size: 1.1rem;
                font-weight: 600;
                color: #1f2937;
            }

            .metric-label {
                font-size: 0.7rem;
                color: #6b7280;
            }

            .supplier-actions {
                display: flex;
                gap: 0.5rem;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .action-btn:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            /* Activity Log */
            .activity-log {
                padding: 0.5rem 1rem;
            }

            .activity-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 0.5rem;
                border-bottom: 1px solid #f3f4f6;
            }

            .activity-item:last-child {
                border-bottom: none;
            }

            .activity-time {
                width: 50px;
                font-size: 0.8rem;
                color: #6b7280;
            }

            .activity-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
            }

            .activity-icon.response {
                background: #dcfce7;
            }

            .activity-icon.request {
                background: #dbeafe;
            }

            .activity-content {
                flex: 1;
            }

            .activity-supplier {
                font-weight: 500;
                margin-right: 0.5rem;
            }

            .activity-message {
                color: #6b7280;
                font-size: 0.9rem;
            }

            @media (max-width: 900px) {
                .monitor-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .supplier-card {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .supplier-metrics {
                    justify-content: space-around;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create global instance
const agentAPIMonitorPage = new AgentAPIMonitorPage();
