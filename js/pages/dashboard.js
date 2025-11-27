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
            const overdueInventur = this.inventurData.filter(inv => {
                if (inv.dueDate) {
                    const dueDate = new Date(inv.dueDate);
                    return dueDate < today;
                }
                return false;
            }).length;

            // Alle Werkzeuge zählen als "offen" (inklusive überfällige)
            const openInventur = this.inventurData.length;

            // Platzhalter für weitere Prozesse (TODO: durch echte Daten ersetzen)
            const taskCounts = {
                inventur: { open: openInventur, overdue: overdueInventur },
                abl: { open: 0, overdue: 0 },
                verlagerung: { open: 0, overdue: 0 },
                partnerwechsel: { open: 0, overdue: 0 },
                verschrottung: { open: 0, overdue: 0 }
            };

            // Zeige Task-Karten
            this.renderTaskCards(tasksContainer, taskCounts);

        } catch (error) {
            console.error('Fehler beim Laden der Inventur-Daten:', error);
            // Bei Fehler: alle Zähler auf 0
            const taskCounts = {
                inventur: { open: 0, overdue: 0 },
                abl: { open: 0, overdue: 0 },
                verlagerung: { open: 0, overdue: 0 },
                partnerwechsel: { open: 0, overdue: 0 },
                verschrottung: { open: 0, overdue: 0 }
            };
            this.renderTaskCards(tasksContainer, taskCounts);
        }
    }

    renderTaskCards(container, taskCounts) {
        const processes = [
            {
                key: 'inventur',
                name: 'Inventuren',
                nameSingular: 'Inventur',
                icon: '📋',
                route: '/inventur',
                filter: 'pending'
            },
            {
                key: 'abl',
                name: 'ABL-Aufträge',
                nameSingular: 'ABL-Auftrag',
                icon: '📦',
                route: '/abl',
                filter: 'pending'
            },
            {
                key: 'verlagerung',
                name: 'Verlagerungen',
                nameSingular: 'Verlagerung',
                icon: '🚚',
                route: '/verlagerung',
                filter: 'pending'
            },
            {
                key: 'partnerwechsel',
                name: 'Vertragspartnerwechsel',
                nameSingular: 'Vertragspartnerwechsel',
                icon: '🔄',
                route: '/partnerwechsel',
                filter: 'pending'
            },
            {
                key: 'verschrottung',
                name: 'Verschrottungen',
                nameSingular: 'Verschrottung',
                icon: '♻️',
                route: '/verschrottung',
                filter: 'pending'
            }
        ];

        let html = '';
        let hasAnyTasks = false;

        processes.forEach(process => {
            const counts = taskCounts[process.key];
            const hasOverdue = counts.overdue > 0;
            const hasOpen = counts.open > 0;

            // Überfällige Aufgaben (falls vorhanden)
            if (hasOverdue) {
                hasAnyTasks = true;
                html += `
                    <div class="dashboard-card task-card urgent clickable"
                         onclick="dashboardPage.navigateToProcess('${process.route}', 'overdue')">
                        <div class="card-badge badge-danger">${counts.overdue}</div>
                        <div class="card-icon">⚠️</div>
                        <div class="card-content">
                            <h4>Überfällige ${process.name}</h4>
                            <p>${counts.overdue} ${counts.overdue === 1 ? process.nameSingular + ' ist' : process.name + ' sind'} überfällig</p>
                            <div class="card-footer">
                                <span class="task-label urgent">Dringend bearbeiten →</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Offene Aufgaben (falls vorhanden)
            if (hasOpen) {
                hasAnyTasks = true;
                html += `
                    <div class="dashboard-card task-card clickable"
                         onclick="dashboardPage.navigateToProcess('${process.route}', '${process.filter}')">
                        <div class="card-badge badge-info">${counts.open}</div>
                        <div class="card-icon">${process.icon}</div>
                        <div class="card-content">
                            <h4>Offene ${process.name}</h4>
                            <p>${counts.open} ${counts.open === 1 ? process.nameSingular : process.name} im Status "Offen"</p>
                            <div class="card-footer">
                                <span class="task-label">Bearbeiten →</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        // Wenn keine Aufgaben
        if (!hasAnyTasks) {
            html = `
                <div class="dashboard-card no-tasks">
                    <div class="card-icon">✅</div>
                    <div class="card-content">
                        <h4>Keine offenen Aufgaben</h4>
                        <p>Aktuell sind keine Aufgaben offen oder überfällig.</p>
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

    navigateToProcess(route, filter) {
        // Speichere den gewünschten Filter für den jeweiligen Prozess
        const processName = route.substring(1); // Entferne führenden Slash
        sessionStorage.setItem(`${processName}Filter`, filter);
        // Navigiere zur entsprechenden Seite
        router.navigate(route);
    }
}

// Globale Instanz
const dashboardPage = new Dashboard();
