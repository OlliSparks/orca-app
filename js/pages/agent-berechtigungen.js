// ORCA 2.0 - Berechtigungs-Agent (Intern)
class AgentBerechtigungenPage {
    constructor() {
        this.messages = [];
        this.currentAction = null;
        this.selectedRole = null;
        this.selectedView = null;
    }

    render() {
        const app = document.getElementById('app');

        // Nur für Support zugänglich
        if (permissionService.getCurrentRole() !== 'SUP') {
            app.innerHTML = `
                <div class="container" style="padding: 3rem; text-align: center;">
                    <h2>🔒 Zugriff verweigert</h2>
                    <p>Dieser Bereich ist nur für Support-Mitarbeiter zugänglich.</p>
                    <button class="btn btn-primary" onclick="router.navigate('/dashboard')">Zurück zum Dashboard</button>
                </div>
            `;
            return;
        }

        // Update header
        document.getElementById('headerTitle').textContent = 'Berechtigungs-Agent';
        document.getElementById('headerSubtitle').textContent = 'Rollen- und Rechteverwaltung';
        document.getElementById('headerStats').style.display = 'none';

        // Update navigation
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) navDropdown.value = '/agenten';

        app.innerHTML = `
            <div class="agent-berechtigungen-page">
                <div class="agent-container">
                    <div class="agent-sidebar">
                        <div class="sidebar-section">
                            <h4>Schnellaktionen</h4>
                            <button class="action-btn" onclick="agentBerechtigungenPage.showMatrix()">
                                📋 Matrix anzeigen
                            </button>
                            <button class="action-btn" onclick="agentBerechtigungenPage.showRoleEditor()">
                                ✏️ Rolle bearbeiten
                            </button>
                            <button class="action-btn" onclick="agentBerechtigungenPage.showRoleCheck()">
                                🔍 Rechte prüfen
                            </button>
                            <button class="action-btn" onclick="agentBerechtigungenPage.showViewAccess()">
                                👥 Zugriff auf Sicht
                            </button>
                        </div>
                        <div class="sidebar-section">
                            <h4>Verwaltung</h4>
                            <button class="action-btn secondary" onclick="agentBerechtigungenPage.exportMatrix()">
                                📤 Matrix exportieren
                            </button>
                            <button class="action-btn secondary" onclick="agentBerechtigungenPage.showImport()">
                                📥 Matrix importieren
                            </button>
                            <button class="action-btn danger" onclick="agentBerechtigungenPage.confirmReset()">
                                🔄 Auf Standard zurücksetzen
                            </button>
                        </div>
                        <div class="sidebar-section stats">
                            <h4>Statistik</h4>
                            <div id="permissionStats"></div>
                        </div>
                    </div>
                    <div class="agent-main">
                        <div class="agent-chat" id="agentChat">
                            <div class="chat-messages" id="chatMessages"></div>
                        </div>
                        <div class="agent-response" id="agentResponse">
                            <!-- Dynamischer Content -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.showWelcome();
        this.updateStats();
    }

    // Willkommensnachricht
    showWelcome() {
        const stats = permissionService.getStats();
        this.addMessage('agent', `
            Hallo! Ich bin der Berechtigungs-Agent. 🔐

            Ich verwalte **${stats.totalRoles} Rollen** und **${stats.totalViews} Sichten**.

            Was möchten Sie tun?
            - **Matrix anzeigen** - Übersicht aller Berechtigungen
            - **Rolle bearbeiten** - Rechte einer Rolle ändern
            - **Rechte prüfen** - Was darf eine bestimmte Rolle?
            - **Zugriff auf Sicht** - Wer hat Zugriff auf eine Sicht?
        `);
    }

    // Chat-Nachricht hinzufügen
    addMessage(sender, content) {
        const chat = document.getElementById('chatMessages');
        if (!chat) return;

        const msg = document.createElement('div');
        msg.className = `chat-message ${sender}`;
        msg.innerHTML = `
            <div class="message-avatar">${sender === 'agent' ? '🤖' : '👤'}</div>
            <div class="message-content">${this.formatMarkdown(content)}</div>
        `;
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    }

    // Einfaches Markdown
    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Statistiken aktualisieren
    updateStats() {
        const container = document.getElementById('permissionStats');
        if (!container) return;

        const stats = permissionService.getStats();
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${stats.totalRoles}</span>
                <span class="stat-label">Rollen</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.totalViews}</span>
                <span class="stat-label">Sichten</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.permissionCounts['admin'] || 0}</span>
                <span class="stat-label">Admin-Rechte</span>
            </div>
        `;
    }

    // Matrix anzeigen
    showMatrix() {
        this.addMessage('user', 'Zeige die Berechtigungsmatrix');

        const matrix = permissionService.getMatrix();
        const roles = permissionService.roles;
        const views = permissionService.views;

        let html = `
            <div class="matrix-container">
                <h3>📋 Berechtigungsmatrix</h3>
                <div class="matrix-scroll">
                    <table class="matrix-table">
                        <thead>
                            <tr>
                                <th class="sticky-col">Rolle</th>
                                ${Object.entries(views).map(([key, view]) =>
                                    `<th title="${view.name}">${view.icon}</th>`
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(roles).map(([roleKey, role]) => `
                                <tr>
                                    <td class="sticky-col role-cell" style="border-left: 4px solid ${role.color}">
                                        <strong>${roleKey}</strong>
                                        <small>${role.name}</small>
                                    </td>
                                    ${Object.keys(views).map(viewKey => {
                                        const level = matrix[roleKey]?.[viewKey] || 'keine';
                                        return `<td class="level-cell level-${level}"
                                                    onclick="agentBerechtigungenPage.editCell('${roleKey}', '${viewKey}')"
                                                    title="${role.name} → ${views[viewKey].name}: ${level}">
                                            ${this.getLevelIcon(level)}
                                        </td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="matrix-legend">
                    <span class="legend-item"><span class="level-icon level-keine">⊘</span> keine</span>
                    <span class="legend-item"><span class="level-icon level-lesen">👁</span> lesen</span>
                    <span class="legend-item"><span class="level-icon level-schreiben">✏️</span> schreiben</span>
                    <span class="legend-item"><span class="level-icon level-admin">👑</span> admin</span>
                </div>
                <p class="hint">Klicken Sie auf eine Zelle, um die Berechtigung zu ändern.</p>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Hier ist die vollständige Berechtigungsmatrix. Klicken Sie auf eine Zelle, um die Berechtigung zu ändern.');
    }

    // Level-Icon
    getLevelIcon(level) {
        const icons = {
            'keine': '⊘',
            'lesen': '👁',
            'schreiben': '✏️',
            'admin': '👑'
        };
        return icons[level] || '?';
    }

    // Zelle bearbeiten
    editCell(roleKey, viewKey) {
        const role = permissionService.roles[roleKey];
        const view = permissionService.views[viewKey];
        const currentLevel = permissionService.getMatrix()[roleKey]?.[viewKey] || 'keine';

        const html = `
            <div class="edit-dialog">
                <h4>Berechtigung ändern</h4>
                <p><strong>${role.name}</strong> (${roleKey})</p>
                <p>→ ${view.icon} ${view.name}</p>
                <div class="level-buttons">
                    ${['keine', 'lesen', 'schreiben', 'admin'].map(level => `
                        <button class="level-btn ${level === currentLevel ? 'active' : ''}"
                                onclick="agentBerechtigungenPage.setPermission('${roleKey}', '${viewKey}', '${level}')">
                            ${this.getLevelIcon(level)} ${level}
                        </button>
                    `).join('')}
                </div>
                <button class="btn-cancel" onclick="agentBerechtigungenPage.showMatrix()">Abbrechen</button>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
    }

    // Berechtigung setzen
    setPermission(roleKey, viewKey, level) {
        const result = permissionService.setPermission(roleKey, viewKey, level);

        if (result.success) {
            this.addMessage('agent', `✅ Berechtigung geändert: **${result.message}**`);
            this.showMatrix();
            this.updateStats();
        } else {
            this.addMessage('agent', `❌ Fehler: ${result.error}`);
        }
    }

    // Rollen-Editor
    showRoleEditor() {
        this.addMessage('user', 'Rolle bearbeiten');

        const roles = permissionService.roles;
        const html = `
            <div class="role-selector">
                <h4>Rolle auswählen</h4>
                <div class="role-grid">
                    ${Object.entries(roles).map(([key, role]) => `
                        <button class="role-card" style="border-color: ${role.color}"
                                onclick="agentBerechtigungenPage.editRole('${key}')">
                            <span class="role-key" style="background: ${role.color}">${key}</span>
                            <span class="role-name">${role.name}</span>
                            <span class="role-category">${role.category}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Wählen Sie eine Rolle aus, deren Berechtigungen Sie bearbeiten möchten.');
    }

    // Einzelne Rolle bearbeiten
    editRole(roleKey) {
        const role = permissionService.roles[roleKey];
        const permissions = permissionService.getRolePermissions(roleKey);
        const views = permissionService.views;

        this.addMessage('user', `Bearbeite Rolle: ${roleKey}`);

        const html = `
            <div class="role-editor">
                <div class="role-header" style="border-color: ${role.color}">
                    <span class="role-key" style="background: ${role.color}">${roleKey}</span>
                    <div>
                        <h4>${role.name}</h4>
                        <span class="role-category">${role.category}</span>
                    </div>
                </div>
                <div class="permissions-list">
                    ${Object.entries(views).map(([viewKey, view]) => {
                        const level = permissions[viewKey] || 'keine';
                        return `
                            <div class="permission-row">
                                <span class="view-info">
                                    ${view.icon} ${view.name}
                                </span>
                                <select class="level-select" onchange="agentBerechtigungenPage.setPermission('${roleKey}', '${viewKey}', this.value)">
                                    ${['keine', 'lesen', 'schreiben', 'admin'].map(l =>
                                        `<option value="${l}" ${l === level ? 'selected' : ''}>${this.getLevelIcon(l)} ${l}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="btn-back" onclick="agentBerechtigungenPage.showRoleEditor()">← Zurück zur Rollenauswahl</button>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', `Hier sind alle Berechtigungen für **${role.name}**. Ändern Sie die Stufen nach Bedarf.`);
    }

    // Rechte einer Rolle prüfen
    showRoleCheck() {
        this.addMessage('user', 'Rechte einer Rolle prüfen');

        const roles = permissionService.roles;
        const html = `
            <div class="role-check">
                <h4>🔍 Welche Rolle möchten Sie prüfen?</h4>
                <select id="roleCheckSelect" class="role-select" onchange="agentBerechtigungenPage.checkRole(this.value)">
                    <option value="">-- Rolle wählen --</option>
                    ${Object.entries(roles).map(([key, role]) =>
                        `<option value="${key}">${key} - ${role.name}</option>`
                    ).join('')}
                </select>
                <div id="roleCheckResult"></div>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Wählen Sie eine Rolle, um deren Berechtigungen zu sehen.');
    }

    // Rolle prüfen
    checkRole(roleKey) {
        if (!roleKey) return;

        const role = permissionService.roles[roleKey];
        const permissions = permissionService.getRolePermissions(roleKey);
        const views = permissionService.views;

        // Gruppieren nach Level
        const grouped = { admin: [], schreiben: [], lesen: [], keine: [] };
        for (const [viewKey, level] of Object.entries(permissions)) {
            grouped[level]?.push(views[viewKey]);
        }

        const resultHtml = `
            <div class="check-result">
                <div class="result-header" style="border-color: ${role.color}">
                    <span class="role-key" style="background: ${role.color}">${roleKey}</span>
                    <strong>${role.name}</strong>
                </div>
                ${grouped.admin.length > 0 ? `
                    <div class="result-group admin">
                        <h5>👑 Admin-Rechte (${grouped.admin.length})</h5>
                        <div class="view-tags">${grouped.admin.map(v => `<span>${v.icon} ${v.name}</span>`).join('')}</div>
                    </div>
                ` : ''}
                ${grouped.schreiben.length > 0 ? `
                    <div class="result-group schreiben">
                        <h5>✏️ Schreiben (${grouped.schreiben.length})</h5>
                        <div class="view-tags">${grouped.schreiben.map(v => `<span>${v.icon} ${v.name}</span>`).join('')}</div>
                    </div>
                ` : ''}
                ${grouped.lesen.length > 0 ? `
                    <div class="result-group lesen">
                        <h5>👁 Lesen (${grouped.lesen.length})</h5>
                        <div class="view-tags">${grouped.lesen.map(v => `<span>${v.icon} ${v.name}</span>`).join('')}</div>
                    </div>
                ` : ''}
                ${grouped.keine.length > 0 ? `
                    <div class="result-group keine">
                        <h5>⊘ Kein Zugriff (${grouped.keine.length})</h5>
                        <div class="view-tags">${grouped.keine.map(v => `<span>${v.icon} ${v.name}</span>`).join('')}</div>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('roleCheckResult').innerHTML = resultHtml;
        this.addMessage('agent', `**${role.name}** hat ${grouped.admin.length} Admin-, ${grouped.schreiben.length} Schreib-, ${grouped.lesen.length} Lese-Rechte und ${grouped.keine.length}x keinen Zugriff.`);
    }

    // Zugriff auf Sicht
    showViewAccess() {
        this.addMessage('user', 'Wer hat Zugriff auf eine Sicht?');

        const views = permissionService.views;
        const html = `
            <div class="view-access">
                <h4>👥 Welche Sicht möchten Sie prüfen?</h4>
                <select id="viewAccessSelect" class="view-select" onchange="agentBerechtigungenPage.checkViewAccess(this.value)">
                    <option value="">-- Sicht wählen --</option>
                    ${Object.entries(views).map(([key, view]) =>
                        `<option value="${key}">${view.icon} ${view.name}</option>`
                    ).join('')}
                </select>
                <div id="viewAccessResult"></div>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Wählen Sie eine Sicht, um zu sehen, welche Rollen darauf zugreifen können.');
    }

    // Sicht-Zugriff prüfen
    checkViewAccess(viewKey) {
        if (!viewKey) return;

        const view = permissionService.views[viewKey];
        const roles = permissionService.roles;
        const matrix = permissionService.getMatrix();

        // Rollen nach Level gruppieren
        const grouped = { admin: [], schreiben: [], lesen: [], keine: [] };
        for (const [roleKey, permissions] of Object.entries(matrix)) {
            const level = permissions[viewKey] || 'keine';
            grouped[level]?.push({ key: roleKey, ...roles[roleKey] });
        }

        const resultHtml = `
            <div class="access-result">
                <div class="result-header">
                    <span class="view-icon">${view.icon}</span>
                    <strong>${view.name}</strong>
                </div>
                ${['admin', 'schreiben', 'lesen', 'keine'].map(level => {
                    if (grouped[level].length === 0) return '';
                    return `
                        <div class="result-group ${level}">
                            <h5>${this.getLevelIcon(level)} ${level} (${grouped[level].length})</h5>
                            <div class="role-tags">
                                ${grouped[level].map(r => `
                                    <span class="role-tag" style="background: ${r.color}20; border-color: ${r.color}">
                                        ${r.key}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        document.getElementById('viewAccessResult').innerHTML = resultHtml;

        const accessCount = grouped.admin.length + grouped.schreiben.length + grouped.lesen.length;
        this.addMessage('agent', `**${view.name}**: ${accessCount} Rollen haben Zugriff (${grouped.admin.length} Admin, ${grouped.schreiben.length} Schreiben, ${grouped.lesen.length} Lesen).`);
    }

    // Matrix exportieren
    exportMatrix() {
        this.addMessage('user', 'Matrix exportieren');

        const json = permissionService.exportMatrix();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orca-permission-matrix-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.addMessage('agent', '✅ Matrix wurde als JSON-Datei heruntergeladen.');
    }

    // Import-Dialog
    showImport() {
        this.addMessage('user', 'Matrix importieren');

        const html = `
            <div class="import-dialog">
                <h4>📥 Matrix importieren</h4>
                <p>Laden Sie eine zuvor exportierte JSON-Datei hoch:</p>
                <input type="file" id="importFile" accept=".json" onchange="agentBerechtigungenPage.importFile(this)">
                <p class="warning">⚠️ Die aktuelle Matrix wird überschrieben!</p>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Wählen Sie eine JSON-Datei zum Importieren.');
    }

    // Datei importieren
    importFile(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = permissionService.importMatrix(e.target.result);
            if (result.success) {
                this.addMessage('agent', `✅ ${result.message}`);
                this.showMatrix();
                this.updateStats();
            } else {
                this.addMessage('agent', `❌ Fehler: ${result.error}`);
            }
        };
        reader.readAsText(file);
    }

    // Reset bestätigen
    confirmReset() {
        this.addMessage('user', 'Matrix zurücksetzen');

        const html = `
            <div class="confirm-dialog">
                <h4>🔄 Auf Standard zurücksetzen?</h4>
                <p>Alle Berechtigungen werden auf die Standardwerte zurückgesetzt.</p>
                <p class="warning">⚠️ Diese Aktion kann nicht rückgängig gemacht werden!</p>
                <div class="confirm-buttons">
                    <button class="btn-danger" onclick="agentBerechtigungenPage.resetMatrix()">Ja, zurücksetzen</button>
                    <button class="btn-cancel" onclick="agentBerechtigungenPage.showMatrix()">Abbrechen</button>
                </div>
            </div>
        `;

        document.getElementById('agentResponse').innerHTML = html;
        this.addMessage('agent', 'Möchten Sie wirklich alle Berechtigungen auf die Standardwerte zurücksetzen?');
    }

    // Matrix zurücksetzen
    resetMatrix() {
        const result = permissionService.resetMatrix();
        if (result.success) {
            this.addMessage('agent', `✅ ${result.message}`);
            this.showMatrix();
            this.updateStats();
        } else {
            this.addMessage('agent', `❌ Fehler: ${result.error}`);
        }
    }

    // Styles
    addStyles() {
        if (document.getElementById('agent-berechtigungen-styles')) return;

        const style = document.createElement('style');
        style.id = 'agent-berechtigungen-styles';
        style.textContent = `
            .agent-berechtigungen-page {
                height: calc(100vh - 140px);
                padding: 1rem;
            }

            .agent-container {
                display: flex;
                gap: 1rem;
                height: 100%;
                max-width: 1400px;
                margin: 0 auto;
            }

            .agent-sidebar {
                width: 250px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .sidebar-section {
                background: white;
                border-radius: 12px;
                padding: 1rem;
                border: 1px solid #e5e7eb;
            }

            .sidebar-section h4 {
                font-size: 0.85rem;
                color: #6b7280;
                margin-bottom: 0.75rem;
                text-transform: uppercase;
            }

            .action-btn {
                display: block;
                width: 100%;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f9fafb;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            }

            .action-btn:hover {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .action-btn.secondary {
                background: white;
            }

            .action-btn.danger {
                color: #dc2626;
                border-color: #fecaca;
            }

            .action-btn.danger:hover {
                background: #dc2626;
                color: white;
            }

            .sidebar-section.stats {
                margin-top: auto;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #f3f4f6;
            }

            .stat-value {
                font-weight: 600;
                color: #3b82f6;
            }

            .agent-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                min-width: 0;
            }

            .agent-chat {
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                height: 200px;
                overflow: hidden;
            }

            .chat-messages {
                height: 100%;
                overflow-y: auto;
                padding: 1rem;
            }

            .chat-message {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .message-content {
                background: #f3f4f6;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                max-width: 80%;
                line-height: 1.5;
            }

            .chat-message.user .message-content {
                background: #3b82f6;
                color: white;
            }

            .agent-response {
                flex: 1;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                padding: 1.5rem;
                overflow-y: auto;
            }

            /* Matrix Styles */
            .matrix-container h3 {
                margin-bottom: 1rem;
            }

            .matrix-scroll {
                overflow-x: auto;
                margin-bottom: 1rem;
            }

            .matrix-table {
                border-collapse: collapse;
                font-size: 0.85rem;
                width: 100%;
            }

            .matrix-table th,
            .matrix-table td {
                border: 1px solid #e5e7eb;
                padding: 0.5rem;
                text-align: center;
                white-space: nowrap;
            }

            .matrix-table th {
                background: #f9fafb;
                font-weight: 500;
            }

            .sticky-col {
                position: sticky;
                left: 0;
                background: white;
                z-index: 1;
            }

            .role-cell {
                text-align: left !important;
                min-width: 180px;
            }

            .role-cell small {
                display: block;
                color: #6b7280;
                font-size: 0.75rem;
            }

            .level-cell {
                cursor: pointer;
                transition: all 0.2s;
                width: 40px;
            }

            .level-cell:hover {
                transform: scale(1.1);
            }

            .level-keine { background: #fef2f2; color: #dc2626; }
            .level-lesen { background: #fefce8; color: #ca8a04; }
            .level-schreiben { background: #f0fdf4; color: #16a34a; }
            .level-admin { background: #eff6ff; color: #2563eb; }

            .matrix-legend {
                display: flex;
                gap: 1.5rem;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
                margin-bottom: 0.5rem;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.85rem;
            }

            .hint {
                color: #6b7280;
                font-size: 0.85rem;
                font-style: italic;
            }

            /* Edit Dialog */
            .edit-dialog {
                text-align: center;
                padding: 2rem;
            }

            .level-buttons {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                margin: 1.5rem 0;
            }

            .level-btn {
                padding: 0.75rem 1.5rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }

            .level-btn:hover {
                border-color: #3b82f6;
            }

            .level-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-cancel {
                padding: 0.5rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
            }

            /* Role Selector */
            .role-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .role-card {
                padding: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                background: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            }

            .role-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .role-key {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                color: white;
                font-weight: 600;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }

            .role-name {
                display: block;
                font-weight: 500;
                margin-bottom: 0.25rem;
            }

            .role-category {
                font-size: 0.8rem;
                color: #6b7280;
            }

            /* Role Editor */
            .role-editor {
                max-width: 600px;
            }

            .role-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border-left: 4px solid;
                background: #f9fafb;
                border-radius: 8px;
                margin-bottom: 1.5rem;
            }

            .permissions-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .permission-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 6px;
            }

            .view-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .level-select {
                padding: 0.5rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
            }

            .btn-back {
                margin-top: 1.5rem;
                padding: 0.75rem 1.5rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
            }

            /* Check Result */
            .role-select, .view-select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                margin-bottom: 1rem;
            }

            .check-result, .access-result {
                margin-top: 1rem;
            }

            .result-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
                margin-bottom: 1rem;
                border-left: 4px solid #3b82f6;
            }

            .result-group {
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }

            .result-group.admin { background: #eff6ff; }
            .result-group.schreiben { background: #f0fdf4; }
            .result-group.lesen { background: #fefce8; }
            .result-group.keine { background: #fef2f2; }

            .result-group h5 {
                margin-bottom: 0.5rem;
            }

            .view-tags, .role-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .view-tags span, .role-tag {
                padding: 0.25rem 0.75rem;
                background: white;
                border-radius: 20px;
                font-size: 0.85rem;
                border: 1px solid #e5e7eb;
            }

            /* Import/Confirm Dialog */
            .import-dialog, .confirm-dialog {
                text-align: center;
                padding: 2rem;
            }

            .warning {
                color: #dc2626;
                font-weight: 500;
                margin: 1rem 0;
            }

            .confirm-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 1.5rem;
            }

            .btn-danger {
                padding: 0.75rem 1.5rem;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }

            /* Dark Mode */
            [data-theme="dark"] .sidebar-section,
            [data-theme="dark"] .agent-chat,
            [data-theme="dark"] .agent-response {
                background: #1f2937;
                border-color: #374151;
            }

            [data-theme="dark"] .action-btn {
                background: #374151;
                border-color: #4b5563;
                color: #f3f4f6;
            }

            [data-theme="dark"] .message-content {
                background: #374151;
                color: #f3f4f6;
            }

            [data-theme="dark"] .matrix-table th {
                background: #374151;
                color: #f3f4f6;
            }

            [data-theme="dark"] .matrix-table td {
                border-color: #4b5563;
            }

            [data-theme="dark"] .sticky-col {
                background: #1f2937;
            }

            [data-theme="dark"] .role-card {
                background: #1f2937;
                border-color: #374151;
                color: #f3f4f6;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
const agentBerechtigungenPage = new AgentBerechtigungenPage();
