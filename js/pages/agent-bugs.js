// ORCA 2.0 - Bug-Agent (Intern)
// Mini-Frontend für Bug-Meldungen an Claude
class AgentBugsPage {
    constructor() {
        this.bugs = JSON.parse(localStorage.getItem('orca_bugs') || '[]');
        this.currentBug = null;
        this.views = [
            'Dashboard', 'Inventur', 'Verlagerung', 'ABL', 'Partnerwechsel',
            'Verschrottung', 'Planung', 'FM-Akte', 'Unternehmen', 'Nachrichten',
            'KPI', 'Glossar', 'Einstellungen', 'Agenten', 'Sonstige'
        ];
        this.priorities = [
            { id: 'critical', label: '🔴 Kritisch', desc: 'App unbenutzbar, sofort beheben' },
            { id: 'high', label: '🟠 Hoch', desc: 'Wichtige Funktion betroffen' },
            { id: 'medium', label: '🟡 Mittel', desc: 'Störend, aber Workaround möglich' },
            { id: 'low', label: '🟢 Niedrig', desc: 'Kosmetisch, kann warten' }
        ];
        this.statuses = {
            'open': { label: 'Offen', color: '#ef4444' },
            'in-progress': { label: 'In Bearbeitung', color: '#f59e0b' },
            'resolved': { label: 'Gelöst', color: '#22c55e' },
            'wont-fix': { label: 'Nicht beheben', color: '#6b7280' }
        };
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

        document.getElementById('headerTitle').textContent = 'Bug-Agent';
        document.getElementById('headerSubtitle').textContent = 'Fehler melden und verfolgen';
        document.getElementById('headerStats').style.display = 'none';

        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown) navDropdown.value = '/agenten';

        const openBugs = this.bugs.filter(b => b.status === 'open').length;
        const inProgressBugs = this.bugs.filter(b => b.status === 'in-progress').length;

        app.innerHTML = `
            <div class="agent-bugs-page">
                <div class="bugs-header">
                    <div class="bugs-stats">
                        <div class="stat-card red">
                            <span class="stat-number">${openBugs}</span>
                            <span class="stat-label">Offen</span>
                        </div>
                        <div class="stat-card orange">
                            <span class="stat-number">${inProgressBugs}</span>
                            <span class="stat-label">In Bearbeitung</span>
                        </div>
                        <div class="stat-card green">
                            <span class="stat-number">${this.bugs.filter(b => b.status === 'resolved').length}</span>
                            <span class="stat-label">Gelöst</span>
                        </div>
                        <div class="stat-card blue">
                            <span class="stat-number">${this.bugs.length}</span>
                            <span class="stat-label">Gesamt</span>
                        </div>
                    </div>
                    <button class="btn-new-bug" onclick="agentBugsPage.showNewBugForm()">
                        🐛 Neuen Bug melden
                    </button>
                </div>

                <div class="bugs-container">
                    <div class="bugs-list" id="bugsList">
                        ${this.renderBugsList()}
                    </div>
                    <div class="bug-detail" id="bugDetail">
                        <div class="empty-state">
                            <span class="empty-icon">🐛</span>
                            <p>Wählen Sie einen Bug aus der Liste oder melden Sie einen neuen.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    renderBugsList() {
        if (this.bugs.length === 0) {
            return `<div class="no-bugs">Keine Bugs gemeldet. 🎉</div>`;
        }

        // Sort by priority and date
        const sorted = [...this.bugs].sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return sorted.map(bug => `
            <div class="bug-item ${bug.status}" onclick="agentBugsPage.showBug('${bug.id}')">
                <div class="bug-priority priority-${bug.priority}"></div>
                <div class="bug-info">
                    <div class="bug-title">${this.escapeHtml(bug.title)}</div>
                    <div class="bug-meta">
                        <span class="bug-view">${bug.view}</span>
                        <span class="bug-date">${this.formatDate(bug.createdAt)}</span>
                    </div>
                </div>
                <div class="bug-status" style="background: ${this.statuses[bug.status].color}">
                    ${this.statuses[bug.status].label}
                </div>
            </div>
        `).join('');
    }

    showNewBugForm() {
        const detail = document.getElementById('bugDetail');
        detail.innerHTML = `
            <div class="bug-form">
                <h3>🐛 Neuen Bug melden</h3>

                <div class="form-group">
                    <label>Titel *</label>
                    <input type="text" id="bugTitle" placeholder="Kurze Beschreibung des Problems" maxlength="100">
                </div>

                <div class="form-group">
                    <label>Betroffene Sicht *</label>
                    <select id="bugView">
                        ${this.views.map(v => `<option value="${v}">${v}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Priorität *</label>
                    <div class="priority-options">
                        ${this.priorities.map(p => `
                            <label class="priority-option">
                                <input type="radio" name="bugPriority" value="${p.id}" ${p.id === 'medium' ? 'checked' : ''}>
                                <span class="priority-label">${p.label}</span>
                                <span class="priority-desc">${p.desc}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label>Beschreibung *</label>
                    <textarea id="bugDescription" rows="4" placeholder="Was ist passiert? Was wurde erwartet?"></textarea>
                </div>

                <div class="form-group">
                    <label>Schritte zum Reproduzieren</label>
                    <textarea id="bugSteps" rows="3" placeholder="1. Gehe zu...&#10;2. Klicke auf...&#10;3. Fehler erscheint"></textarea>
                </div>

                <div class="form-group">
                    <label>Screenshot (optional)</label>
                    <div class="screenshot-upload" id="screenshotUpload">
                        <input type="file" id="bugScreenshot" accept="image/*" onchange="agentBugsPage.handleScreenshot(this)">
                        <div class="upload-placeholder">
                            📷 Klicken oder Bild hierher ziehen
                        </div>
                        <div class="screenshot-preview" id="screenshotPreview"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="bugUrgent">
                        ⚡ Sofort umsetzen (stoppt aktuelle Arbeit)
                    </label>
                </div>

                <div class="form-group">
                    <label>Browser / Gerät</label>
                    <input type="text" id="bugBrowser" value="${navigator.userAgent.split(' ').slice(-2).join(' ')}" readonly>
                </div>

                <div class="form-actions">
                    <button class="btn-cancel" onclick="agentBugsPage.render()">Abbrechen</button>
                    <button class="btn-submit" onclick="agentBugsPage.submitBug()">Bug melden</button>
                </div>
            </div>
        `;
    }

    handleScreenshot(input) {
        const file = input.files[0];
        if (!file) return;

        const preview = document.getElementById('screenshotPreview');
        const reader = new FileReader();

        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Screenshot">`;
            preview.style.display = 'block';
            this.currentScreenshot = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    submitBug() {
        const title = document.getElementById('bugTitle').value.trim();
        const view = document.getElementById('bugView').value;
        const priority = document.querySelector('input[name="bugPriority"]:checked')?.value;
        const description = document.getElementById('bugDescription').value.trim();
        const steps = document.getElementById('bugSteps').value.trim();
        const urgent = document.getElementById('bugUrgent').checked;
        const browser = document.getElementById('bugBrowser').value;

        if (!title || !description) {
            alert('Bitte Titel und Beschreibung ausfüllen.');
            return;
        }

        const bug = {
            id: 'BUG-' + Date.now(),
            title,
            view,
            priority,
            description,
            steps,
            urgent,
            browser,
            screenshot: this.currentScreenshot || null,
            status: 'open',
            createdAt: new Date().toISOString(),
            createdBy: 'Support',
            comments: []
        };

        this.bugs.unshift(bug);
        this.saveBugs();
        this.currentScreenshot = null;

        this.render();
        this.showBug(bug.id);

        // Generate Claude-ready output
        this.generateClaudePrompt(bug);
    }

    generateClaudePrompt(bug) {
        const prompt = `
🐛 **Bug-Report: ${bug.title}**

**Sicht:** ${bug.view}
**Priorität:** ${this.priorities.find(p => p.id === bug.priority)?.label}
**Sofort umsetzen:** ${bug.urgent ? 'JA ⚡' : 'Nein'}

**Beschreibung:**
${bug.description}

${bug.steps ? `**Reproduktionsschritte:**
${bug.steps}` : ''}

**Browser:** ${bug.browser}
**Erstellt:** ${this.formatDate(bug.createdAt)}

${bug.screenshot ? '📷 Screenshot vorhanden (siehe Bug-Detail)' : ''}

---
Bitte analysiere diesen Bug und schlage eine Lösung vor.
        `.trim();

        console.log('=== CLAUDE PROMPT ===');
        console.log(prompt);
        console.log('====================');
    }

    showBug(bugId) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) return;

        this.currentBug = bug;
        const detail = document.getElementById('bugDetail');

        detail.innerHTML = `
            <div class="bug-detail-content">
                <div class="bug-detail-header">
                    <div class="bug-id">${bug.id}</div>
                    <select class="status-select" onchange="agentBugsPage.updateStatus('${bug.id}', this.value)">
                        ${Object.entries(this.statuses).map(([key, val]) =>
                            `<option value="${key}" ${bug.status === key ? 'selected' : ''}>${val.label}</option>`
                        ).join('')}
                    </select>
                </div>

                <h3>${this.escapeHtml(bug.title)}</h3>

                <div class="bug-badges">
                    <span class="badge priority-${bug.priority}">${this.priorities.find(p => p.id === bug.priority)?.label}</span>
                    <span class="badge view">${bug.view}</span>
                    ${bug.urgent ? '<span class="badge urgent">⚡ Sofort</span>' : ''}
                </div>

                <div class="bug-section">
                    <h4>Beschreibung</h4>
                    <p>${this.escapeHtml(bug.description).replace(/\n/g, '<br>')}</p>
                </div>

                ${bug.steps ? `
                <div class="bug-section">
                    <h4>Reproduktionsschritte</h4>
                    <p>${this.escapeHtml(bug.steps).replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}

                ${bug.screenshot ? `
                <div class="bug-section">
                    <h4>Screenshot</h4>
                    <img src="${bug.screenshot}" alt="Screenshot" class="bug-screenshot">
                </div>
                ` : ''}

                <div class="bug-section">
                    <h4>Details</h4>
                    <div class="bug-meta-detail">
                        <div><strong>Browser:</strong> ${bug.browser}</div>
                        <div><strong>Erstellt:</strong> ${this.formatDate(bug.createdAt)}</div>
                        <div><strong>Von:</strong> ${bug.createdBy}</div>
                    </div>
                </div>

                <div class="bug-section">
                    <h4>Kommentare (${bug.comments.length})</h4>
                    <div class="comments-list">
                        ${bug.comments.map(c => `
                            <div class="comment">
                                <div class="comment-header">
                                    <strong>${c.author}</strong>
                                    <span>${this.formatDate(c.date)}</span>
                                </div>
                                <p>${this.escapeHtml(c.text)}</p>
                            </div>
                        `).join('') || '<p class="no-comments">Keine Kommentare</p>'}
                    </div>
                    <div class="add-comment">
                        <textarea id="newComment" placeholder="Kommentar hinzufügen..."></textarea>
                        <button onclick="agentBugsPage.addComment('${bug.id}')">Kommentar</button>
                    </div>
                </div>

                <div class="bug-actions">
                    <button class="btn-copy" onclick="agentBugsPage.copyForClaude('${bug.id}')">
                        📋 Für Claude kopieren
                    </button>
                    <button class="btn-delete" onclick="agentBugsPage.deleteBug('${bug.id}')">
                        🗑️ Löschen
                    </button>
                </div>
            </div>
        `;
    }

    updateStatus(bugId, status) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (bug) {
            bug.status = status;
            bug.updatedAt = new Date().toISOString();
            this.saveBugs();
            document.getElementById('bugsList').innerHTML = this.renderBugsList();
        }
    }

    addComment(bugId) {
        const bug = this.bugs.find(b => b.id === bugId);
        const text = document.getElementById('newComment').value.trim();
        if (!bug || !text) return;

        bug.comments.push({
            author: 'Support',
            text,
            date: new Date().toISOString()
        });
        this.saveBugs();
        this.showBug(bugId);
    }

    copyForClaude(bugId) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) return;

        const text = `🐛 Bug-Report: ${bug.title}

Sicht: ${bug.view}
Priorität: ${this.priorities.find(p => p.id === bug.priority)?.label}
Sofort umsetzen: ${bug.urgent ? 'JA' : 'Nein'}

Beschreibung:
${bug.description}

${bug.steps ? `Reproduktionsschritte:
${bug.steps}` : ''}

Bitte analysiere und behebe diesen Bug.`;

        navigator.clipboard.writeText(text).then(() => {
            alert('Bug-Report wurde in die Zwischenablage kopiert!');
        });
    }

    deleteBug(bugId) {
        if (!confirm('Bug wirklich löschen?')) return;
        this.bugs = this.bugs.filter(b => b.id !== bugId);
        this.saveBugs();
        this.render();
    }

    saveBugs() {
        localStorage.setItem('orca_bugs', JSON.stringify(this.bugs));
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addStyles() {
        if (document.getElementById('agent-bugs-styles')) return;
        const style = document.createElement('style');
        style.id = 'agent-bugs-styles';
        style.textContent = `
            .agent-bugs-page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
            .bugs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
            .bugs-stats { display: flex; gap: 1rem; }
            .stat-card { background: white; padding: 1rem 1.5rem; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb; }
            .stat-card.red { border-left: 4px solid #ef4444; }
            .stat-card.orange { border-left: 4px solid #f59e0b; }
            .stat-card.green { border-left: 4px solid #22c55e; }
            .stat-card.blue { border-left: 4px solid #3b82f6; }
            .stat-number { display: block; font-size: 1.5rem; font-weight: 700; }
            .stat-label { font-size: 0.85rem; color: #6b7280; }
            .btn-new-bug { padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
            .btn-new-bug:hover { background: #dc2626; }
            .bugs-container { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; }
            .bugs-list { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; max-height: 70vh; overflow-y: auto; }
            .bug-item { display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; gap: 0.75rem; }
            .bug-item:hover { background: #f9fafb; }
            .bug-item.resolved { opacity: 0.6; }
            .bug-priority { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
            .bug-priority.priority-critical { background: #ef4444; }
            .bug-priority.priority-high { background: #f59e0b; }
            .bug-priority.priority-medium { background: #eab308; }
            .bug-priority.priority-low { background: #22c55e; }
            .bug-info { flex: 1; min-width: 0; }
            .bug-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .bug-meta { font-size: 0.8rem; color: #6b7280; display: flex; gap: 0.5rem; }
            .bug-status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: white; flex-shrink: 0; }
            .bug-detail { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 1.5rem; min-height: 400px; }
            .empty-state { text-align: center; padding: 3rem; color: #6b7280; }
            .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
            .bug-form h3 { margin-bottom: 1.5rem; }
            .form-group { margin-bottom: 1.25rem; }
            .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
            .form-group input[type="text"], .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; }
            .priority-options { display: flex; flex-direction: column; gap: 0.5rem; }
            .priority-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
            .priority-option:hover { background: #f9fafb; }
            .priority-option input { margin: 0; }
            .priority-label { font-weight: 500; }
            .priority-desc { font-size: 0.85rem; color: #6b7280; }
            .screenshot-upload { border: 2px dashed #e5e7eb; border-radius: 8px; padding: 2rem; text-align: center; position: relative; }
            .screenshot-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
            .screenshot-preview { margin-top: 1rem; }
            .screenshot-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; }
            .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
            .btn-cancel { padding: 0.75rem 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; }
            .btn-submit { padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; }
            .bug-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
            .bug-id { font-family: monospace; color: #6b7280; }
            .status-select { padding: 0.5rem; border-radius: 6px; border: 1px solid #e5e7eb; }
            .bug-badges { display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; }
            .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; }
            .badge.priority-critical { background: #fef2f2; color: #dc2626; }
            .badge.priority-high { background: #fff7ed; color: #ea580c; }
            .badge.priority-medium { background: #fefce8; color: #ca8a04; }
            .badge.priority-low { background: #f0fdf4; color: #16a34a; }
            .badge.view { background: #eff6ff; color: #2563eb; }
            .badge.urgent { background: #fef3c7; color: #d97706; }
            .bug-section { margin: 1.5rem 0; }
            .bug-section h4 { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.5rem; }
            .bug-screenshot { max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; }
            .bug-meta-detail { display: grid; gap: 0.5rem; font-size: 0.9rem; }
            .comments-list { max-height: 200px; overflow-y: auto; }
            .comment { background: #f9fafb; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; }
            .comment-header { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem; }
            .add-comment { display: flex; gap: 0.5rem; margin-top: 1rem; }
            .add-comment textarea { flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; resize: none; }
            .add-comment button { padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
            .bug-actions { display: flex; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
            .btn-copy { padding: 0.5rem 1rem; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; }
            .btn-delete { padding: 0.5rem 1rem; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; }
            .no-bugs { padding: 2rem; text-align: center; color: #6b7280; }
            [data-theme="dark"] .stat-card, [data-theme="dark"] .bugs-list, [data-theme="dark"] .bug-detail { background: #1f2937; border-color: #374151; }
            [data-theme="dark"] .bug-item:hover { background: #374151; }
            [data-theme="dark"] .form-group input, [data-theme="dark"] .form-group textarea, [data-theme="dark"] .form-group select { background: #374151; border-color: #4b5563; color: #f3f4f6; }
            @media (max-width: 900px) { .bugs-container { grid-template-columns: 1fr; } }
        `;
        document.head.appendChild(style);
    }
}

const agentBugsPage = new AgentBugsPage();
