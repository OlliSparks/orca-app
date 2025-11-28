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

                <!-- Abschnitt 1: Was MUSS ich tun? (Überfällige Aufgaben) -->
                <section class="dashboard-section">
                    <h3 class="section-title must-do">
                        <span class="section-icon">⚠️</span>
                        Was MUSS ich tun?
                    </h3>
                    <div class="dashboard-cards" id="mustDoCards">
                        <div class="dashboard-card loading">
                            <div class="card-content">
                                <div class="loading-spinner">⏳</div>
                                <p>Lade überfällige Aufgaben...</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Abschnitt 2: Was SOLL ich tun? (Offene Aufgaben) -->
                <section class="dashboard-section">
                    <h3 class="section-title should-do">
                        <span class="section-icon">📋</span>
                        Was SOLL ich tun?
                    </h3>
                    <div class="dashboard-cards" id="canDoCards">
                        <div class="dashboard-card loading">
                            <div class="card-content">
                                <div class="loading-spinner">⏳</div>
                                <p>Lade offene Aufgaben...</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Abschnitt 3: Was KANN ich tun? (Standardaufgaben) -->
                <section class="dashboard-section">
                    <h3 class="section-title can-do">
                        <span class="section-icon">🎯</span>
                        Was KANN ich tun?
                    </h3>
                    <div class="dashboard-cards">
                        <div class="dashboard-card clickable" onclick="router.navigate('/tools')">
                            <div class="card-icon">🔧</div>
                            <div class="card-content">
                                <h4>Werkzeugübersicht</h4>
                                <p>Meine Fertigungsmittel anzeigen und verwalten</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/inventur')">
                            <div class="card-icon">🔍</div>
                            <div class="card-content">
                                <h4>Inventur</h4>
                                <p>Meine Inventuraufträge verwalten und durchführen</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/planung')">
                            <div class="card-icon">📅</div>
                            <div class="card-content">
                                <h4>Planung</h4>
                                <p>Meine zukünftigen Inventuren planen</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/abl')">
                            <div class="card-icon">📦</div>
                            <div class="card-content">
                                <h4>ABL</h4>
                                <p>Meine Abnahmebereitschaften verwalten</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/verlagerung')">
                            <div class="card-icon">🚚</div>
                            <div class="card-content">
                                <h4>Verlagerung</h4>
                                <p>Meine Verlagerungen verwalten und durchführen</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/partnerwechsel')">
                            <div class="card-icon">🔄</div>
                            <div class="card-content">
                                <h4>Vertragspartnerwechsel</h4>
                                <p>Meine Vertragspartnerwechsel verwalten</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>

                        <div class="dashboard-card clickable" onclick="router.navigate('/verschrottung')">
                            <div class="card-icon">♻️</div>
                            <div class="card-content">
                                <h4>Verschrottung</h4>
                                <p>Meine Verschrottungen verwalten und durchführen</p>
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
            // Lade Daten von allen Services parallel
            const [inventurResponse, ablResponse, verlagerungResponse, partnerwechselResponse, verschrottungResponse] = await Promise.all([
                api.getInventoryList(),
                api.getABLList(),
                api.getVerlagerungList(),
                api.getPartnerwechselList(),
                api.getVerschrottungList()
            ]);

            // Heute als Referenz
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Funktion zum Zählen von überfälligen und offenen Aufgaben
            const countTasks = (data) => {
                const items = data.data || [];
                const overdue = items.filter(item => {
                    if (item.dueDate) {
                        const dueDate = new Date(item.dueDate);
                        return dueDate < today;
                    }
                    return false;
                }).length;
                return { open: items.length, overdue };
            };

            // Zähle für alle Services
            const taskCounts = {
                inventur: countTasks(inventurResponse),
                abl: countTasks(ablResponse),
                verlagerung: countTasks(verlagerungResponse),
                partnerwechsel: countTasks(partnerwechselResponse),
                verschrottung: countTasks(verschrottungResponse)
            };

            // Zeige Task-Karten in den richtigen Abschnitten
            this.renderTaskCards(taskCounts);

        } catch (error) {
            console.error('Fehler beim Laden der Task-Daten:', error);
            // Bei Fehler: alle Zähler auf 0
            const taskCounts = {
                inventur: { open: 0, overdue: 0 },
                abl: { open: 0, overdue: 0 },
                verlagerung: { open: 0, overdue: 0 },
                partnerwechsel: { open: 0, overdue: 0 },
                verschrottung: { open: 0, overdue: 0 }
            };
            this.renderTaskCards(taskCounts);
        }
    }

    renderTaskCards(taskCounts) {
        const processes = [
            {
                key: 'inventur',
                name: 'Inventuren',
                nameSingular: 'Inventur',
                icon: '📋',
                route: '/inventur',
                filter: 'all'
            },
            {
                key: 'abl',
                name: 'ABL-Aufträge',
                nameSingular: 'ABL-Auftrag',
                icon: '📦',
                route: '/abl',
                filter: 'all'
            },
            {
                key: 'verlagerung',
                name: 'Verlagerungen',
                nameSingular: 'Verlagerung',
                icon: '🚚',
                route: '/verlagerung',
                filter: 'all'
            },
            {
                key: 'partnerwechsel',
                name: 'Vertragspartnerwechsel',
                nameSingular: 'Vertragspartnerwechsel',
                icon: '🔄',
                route: '/partnerwechsel',
                filter: 'all'
            },
            {
                key: 'verschrottung',
                name: 'Verschrottungen',
                nameSingular: 'Verschrottung',
                icon: '♻️',
                route: '/verschrottung',
                filter: 'all'
            }
        ];

        // Abschnitt 1: Was MUSS ich tun? (Überfällige)
        let mustDoHtml = '';
        let hasMustDo = false;

        processes.forEach(process => {
            const counts = taskCounts[process.key];
            if (counts.overdue > 0) {
                hasMustDo = true;
                mustDoHtml += `
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
        });

        if (!hasMustDo) {
            mustDoHtml = `
                <div class="dashboard-card no-tasks">
                    <div class="card-icon">✅</div>
                    <div class="card-content">
                        <h4>Keine überfälligen Aufgaben</h4>
                        <p>Aktuell sind keine Aufgaben überfällig. Gut gemacht!</p>
                    </div>
                </div>
            `;
        }

        // Abschnitt 2: Was KANN ich tun? (Offene)
        let canDoHtml = '';
        let hasCanDo = false;

        processes.forEach(process => {
            const counts = taskCounts[process.key];
            if (counts.open > 0) {
                hasCanDo = true;
                canDoHtml += `
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

        if (!hasCanDo) {
            canDoHtml = `
                <div class="dashboard-card no-tasks">
                    <div class="card-icon">📭</div>
                    <div class="card-content">
                        <h4>Keine offenen Aufgaben</h4>
                        <p>Aktuell sind keine Aufgaben offen.</p>
                    </div>
                </div>
            `;
        }

        // Rendern in die Container
        document.getElementById('mustDoCards').innerHTML = mustDoHtml;
        document.getElementById('canDoCards').innerHTML = canDoHtml;
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
