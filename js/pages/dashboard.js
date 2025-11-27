// ORCA 2.0 - Dashboard / Startseite
class Dashboard {
    constructor() {
        this.inventurData = [];
    }

    async render() {
        const app = document.getElementById('app');

        // Header anpassen
        document.getElementById('headerTitle').textContent = 'ORCA 2.0 - Dashboard';
        document.getElementById('headerSubtitle').textContent = 'Ihre Übersicht';
        document.getElementById('headerStats').style.display = 'none';

        // Footer Actions leeren
        document.getElementById('footerActions').innerHTML = '';

        // Dashboard HTML
        app.innerHTML = `
            <div class="container dashboard-container">
                <h2 class="page-title">Willkommen bei ORCA 2.0</h2>

                <!-- Abschnitt 1: Aktuelle Aufgaben -->
                <section class="dashboard-section">
                    <h3 class="section-title">
                        <span class="section-icon">📋</span>
                        Ihre aktuellen Aufgaben
                    </h3>
                    <div class="dashboard-cards" id="currentTasksCards">
                        <div class="dashboard-card loading">
                            <div class="card-content">
                                <div class="loading-spinner">⏳</div>
                                <p>Lade Aufgaben...</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Abschnitt 2: Standardaufgaben -->
                <section class="dashboard-section">
                    <h3 class="section-title">
                        <span class="section-icon">🔧</span>
                        Ihre Standardaufgaben
                    </h3>
                    <div class="dashboard-cards">
                        <div class="dashboard-card clickable" onclick="router.navigate('/tools')">
                            <div class="card-icon">🔧</div>
                            <div class="card-content">
                                <h4>Werkzeugübersicht</h4>
                                <p>Alle Fertigungsmittel anzeigen und verwalten</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/inventur')">
                            <div class="card-icon">🔍</div>
                            <div class="card-content">
                                <h4>Inventur</h4>
                                <p>Inventuraufträge verwalten und durchführen</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/planung')">
                            <div class="card-icon">📅</div>
                            <div class="card-content">
                                <h4>Planung</h4>
                                <p>Zukünftige Inventuren planen</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>
                    </div>
                </section>
            </div>
        `;

        // Lade Inventurdaten
        await this.loadInventurTasks();
    }

    async loadInventurTasks() {
        const tasksContainer = document.getElementById('currentTasksCards');

        try {
            // Lade Inventurdaten
            const response = await api.getInventoryList();
            this.inventurData = response.data || [];

            // Heute als Referenz
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Zähle überfällige Werkzeuge (deadline < heute)
            const overdueCount = this.inventurData.filter(inv => {
                if (inv.dueDate) {
                    const dueDate = new Date(inv.dueDate);
                    return dueDate < today;
                }
                return false;
            }).length;

            // Zähle offene Werkzeuge (deadline >= heute)
            const openCount = this.inventurData.filter(inv => {
                if (inv.dueDate) {
                    const dueDate = new Date(inv.dueDate);
                    return dueDate >= today;
                }
                return false;
            }).length;

            // Zeige Task-Karten (überfällig zuerst, dann offen)
            this.renderTaskCards(tasksContainer, openCount, overdueCount);

        } catch (error) {
            console.error('Fehler beim Laden der Inventur-Daten:', error);
            // Bei Fehler: leere Karte anzeigen
            this.renderTaskCards(tasksContainer, 0, 0);
        }
    }

    renderTaskCards(container, openCount, overdueCount) {
        const hasOpenTasks = openCount > 0;
        const hasOverdueTasks = overdueCount > 0;

        let html = '';

        // Karte für überfällige Inventuren (zuerst anzeigen)
        if (hasOverdueTasks) {
            html += `
                <div class="dashboard-card task-card urgent clickable"
                     onclick="dashboardPage.navigateToInventur('overdue')">
                    <div class="card-badge badge-danger">${overdueCount}</div>
                    <div class="card-icon">⚠️</div>
                    <div class="card-content">
                        <h4>Überfällige Inventuren</h4>
                        <p>${overdueCount} ${overdueCount === 1 ? 'Inventur ist' : 'Inventuren sind'} überfällig</p>
                        <div class="card-footer">
                            <span class="task-label urgent">Dringend bearbeiten →</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Karte für offene Inventuren (danach anzeigen)
        if (hasOpenTasks) {
            html += `
                <div class="dashboard-card task-card clickable"
                     onclick="dashboardPage.navigateToInventur('pending')">
                    <div class="card-badge badge-info">${openCount}</div>
                    <div class="card-icon">📝</div>
                    <div class="card-content">
                        <h4>Offene Inventuren</h4>
                        <p>${openCount} ${openCount === 1 ? 'Inventur' : 'Inventuren'} im Status "Offen"</p>
                        <div class="card-footer">
                            <span class="task-label">Zur Inventur →</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Wenn keine Aufgaben
        if (!hasOpenTasks && !hasOverdueTasks) {
            html = `
                <div class="dashboard-card no-tasks">
                    <div class="card-icon">✅</div>
                    <div class="card-content">
                        <h4>Keine offenen Aufgaben</h4>
                        <p>Aktuell sind keine Inventuren offen oder überfällig.</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    navigateToInventur(filter) {
        // Speichere den gewünschten Filter
        sessionStorage.setItem('inventurFilter', filter);
        // Navigiere zur Inventur-Seite
        router.navigate('/inventur');
    }
}

// Globale Instanz
const dashboardPage = new Dashboard();
