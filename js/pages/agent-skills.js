// ORCA 2.0 - Skill-Agent (Intern)
// Erstellen und Bearbeiten von Claude Code Skills

class AgentSkillsPage {
    constructor() {
        this.skills = [];
        this.categories = JSON.parse(localStorage.getItem('orca_skill_categories') || '["Fachliche Skills", "Prozess-Skills", "Rollen-Skills", "Technische Skills"]');
        this.currentSkill = null;
        this.originalContent = '';
        this.skillsPath = 'C:\\Users\\orcao\\OneDrive - orca. organizing company assets GmbH\\Orca-Skills';
        this.viewMode = 'list'; // 'list' or 'read'


    }

    loadSkills() {
        const stored = localStorage.getItem('orca_skills');
        if (stored) {
            try {
                this.skills = JSON.parse(stored);
                if (this.skills.length > 0) return;
            } catch (e) { console.warn('Failed to parse stored skills:', e); }
        }
        if (typeof PRELOADED_SKILLS !== 'undefined' && PRELOADED_SKILLS.length > 0) {
            this.skills = PRELOADED_SKILLS;
            this.saveToStorage();
        }
    }

    render() {
        this.loadSkills();
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="agent-skills-page">
                <style>${this.getStyles()}</style>

                <div class="skills-header">
                    <h1>🎯 Skill-Agent</h1>
                    <p class="skills-subtitle">Claude Code Skills erstellen und bearbeiten</p>
                </div>

                <div class="skills-layout">
                    <!-- Sidebar -->
                    <div class="skills-sidebar">
                        <div class="sidebar-section">
                            <h3>📁 Kategorien</h3>
                            <div class="category-list">
                                ${this.categories.map(cat => `
                                    <div class="category-item ${this.currentCategory === cat ? 'active' : ''}"
                                         onclick="agentSkillsPage.filterByCategory('${cat}')">
                                        <span class="category-icon">${this.getCategoryIcon(cat)}</span>
                                        <span>${cat}</span>
                                        <span class="category-count">${this.skills.filter(s => s.category === cat).length}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn-add-category" onclick="agentSkillsPage.addCategory()">
                                ➕ Neue Kategorie
                            </button>
                        </div>

                        <div class="sidebar-section">
                            <h3>⚡ Aktionen</h3>
                            <button class="btn-action" onclick="agentSkillsPage.createNewSkill()">
                                ✨ Neuer Skill
                            </button>
                            <button class="btn-action" onclick="agentSkillsPage.importSkill()">
                                📥 Skill importieren
                            </button>
                            <button class="btn-action" onclick="agentSkillsPage.exportAllSkills()">
                                📤 Alle exportieren
                            </button>
                            <button class="btn-action reload" onclick="agentSkillsPage.reloadFromSource()">
                                🔄 Neu laden
                            </button>
                        </div>

                        <div class="sidebar-section">
                            <h3>📍 Skill-Pfad</h3>
                            <code class="skills-path">${this.skillsPath}</code>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="skills-main">
                        ${this.currentSkill
                            ? (this.viewMode === 'read' ? this.renderReadView() : this.renderEditor())
                            : this.renderSkillList()}
                    </div>
                </div>

                <input type="file" id="importInput" accept=".md" style="display:none" onchange="agentSkillsPage.handleImport(this)">
            </div>
        `;
    }

    renderSkillList() {
        const filteredSkills = this.currentCategory
            ? this.skills.filter(s => s.category === this.currentCategory)
            : this.skills;

        if (filteredSkills.length === 0) {
            return `
                <div class="skills-empty">
                    <span class="empty-icon">🎯</span>
                    <h3>Keine Skills vorhanden</h3>
                    <p>Erstelle deinen ersten Skill oder importiere vorhandene.</p>
                    <button class="btn-primary" onclick="agentSkillsPage.createNewSkill()">
                        ✨ Ersten Skill erstellen
                    </button>
                </div>
            `;
        }

        return `
            <div class="skills-grid">
                ${filteredSkills.map(skill => `
                    <div class="skill-card" onclick="agentSkillsPage.loadSkill('${skill.id}')">
                        <div class="skill-card-header">
                            <span class="skill-icon">${this.getCategoryIcon(skill.category)}</span>
                            <span class="skill-category">${skill.category}</span>
                        </div>
                        <h3 class="skill-name">${skill.name}</h3>
                        <p class="skill-description">${skill.description || 'Keine Beschreibung'}</p>
                        <div class="skill-meta">
                            <span>📅 ${this.formatDate(skill.updatedAt)}</span>
                            <span>📝 ${(skill.content || '').split('\n').length} Zeilen</span>
                        </div>
                        <div class="skill-actions">
                            <button class="btn-small" onclick="event.stopPropagation(); agentSkillsPage.exportSkill('${skill.id}')">
                                📤 Export
                            </button>
                            <button class="btn-small danger" onclick="event.stopPropagation(); agentSkillsPage.deleteSkill('${skill.id}')">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderReadView() {
        const skill = this.currentSkill;
        const renderedContent = this.renderMarkdown(skill.content);

        return `
            <div class="skill-read-view">
                <div class="read-header">
                    <button class="btn-back" onclick="agentSkillsPage.closeEditor()">
                        ← Zurück
                    </button>
                    <div class="read-meta">
                        <span class="skill-category-badge">${this.getCategoryIcon(skill.category)} ${skill.category}</span>
                        ${skill.folder ? `<span class="skill-folder">📁 ${skill.folder}</span>` : ''}
                    </div>
                    <div class="read-actions">
                        <button class="btn-secondary" onclick="agentSkillsPage.switchToEdit()">
                            ✏️ Bearbeiten
                        </button>
                        <button class="btn-secondary" onclick="agentSkillsPage.exportSkill('${skill.id}')">
                            📤 Export
                        </button>
                        <button class="btn-secondary" onclick="agentSkillsPage.copySkillContent()">
                            📋 Kopieren
                        </button>
                    </div>
                </div>

                <div class="read-content">
                    ${renderedContent}
                </div>

                ${skill.path ? `
                <div class="read-footer">
                    <span class="file-path">📍 ${skill.path}</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderMarkdown(content) {
        if (!content) return '<p>Kein Inhalt</p>';

        // Simple markdown rendering
        let html = this.escapeHtml(content);

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Code blocks
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold and italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Tables
        html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
            const cells = content.split('|').map(c => c.trim());
            if (cells.every(c => /^-+$/.test(c))) {
                return ''; // Skip separator row
            }
            const isHeader = cells.some(c => c.includes('**'));
            const tag = isHeader ? 'th' : 'td';
            return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
        });
        html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, '<table>$&</table>');

        // Lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>');

        // Paragraphs (lines not already wrapped)
        html = html.replace(/^(?!<[a-z])((?!<\/)[^\n]+)$/gm, '<p>$1</p>');

        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<[a-z])/g, '$1');
        html = html.replace(/(<\/[a-z]+>)<\/p>/g, '$1');

        return html;
    }

    switchToEdit() {
        this.viewMode = 'edit';
        this.render();
    }

    copySkillContent() {
        navigator.clipboard.writeText(this.currentSkill.content).then(() => {
            alert('Skill-Inhalt kopiert!');
        });
    }

    renderEditor() {
        const skill = this.currentSkill;
        const hasChanges = skill.content !== this.originalContent;

        return `
            <div class="skill-editor">
                <div class="editor-header">
                    <button class="btn-back" onclick="agentSkillsPage.closeEditor()">
                        ← Zurück
                    </button>
                    <div class="editor-title">
                        <input type="text" id="skillName" value="${skill.name}"
                               placeholder="Skill-Name" class="input-title">
                        <select id="skillCategory" class="select-category">
                            ${this.categories.map(cat => `
                                <option value="${cat}" ${skill.category === cat ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="editor-actions">
                        ${hasChanges ? '<span class="unsaved-badge">● Ungespeichert</span>' : ''}
                        <button class="btn-secondary" onclick="agentSkillsPage.showPreview()">
                            👁️ Vorschau
                        </button>
                        <button class="btn-primary" onclick="agentSkillsPage.saveSkill()">
                            💾 Speichern
                        </button>
                    </div>
                </div>

                <div class="editor-body">
                    <div class="editor-input-section">
                        <h4>💬 Input (Text, Notizen, Änderungen)</h4>
                        <textarea id="skillInput" placeholder="Beschreibe was du hinzufügen oder ändern möchtest...
Beispiele:
- Füge eine neue Sektion für API-Endpunkte hinzu
- Ändere die Farbpalette zu dunkleren Tönen
- Ergänze Best Practices für Performance"></textarea>
                        <button class="btn-integrate" onclick="agentSkillsPage.integrateInput()">
                            🔄 In Skill integrieren
                        </button>
                    </div>

                    <div class="editor-content-section">
                        <h4>📝 Skill-Inhalt (Markdown)</h4>
                        <textarea id="skillContent" oninput="agentSkillsPage.markChanged()">${skill.content || this.getSkillTemplate(skill.name)}</textarea>
                    </div>
                </div>

                <div class="editor-description">
                    <label>Kurzbeschreibung (für Übersicht)</label>
                    <input type="text" id="skillDescription" value="${skill.description || ''}"
                           placeholder="Kurze Beschreibung des Skills...">
                </div>
            </div>
        `;
    }

    createNewSkill() {
        const id = 'skill_' + Date.now();
        this.currentSkill = {
            id,
            name: 'Neuer Skill',
            category: this.currentCategory || this.categories[0],
            description: '',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.originalContent = '';
        this.render();
    }

    loadSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (skill) {
            this.currentSkill = { ...skill };
            this.originalContent = skill.content;
            this.viewMode = 'read'; // Open in read mode first
            this.render();
        }
    }

    closeEditor() {
        const hasChanges = this.currentSkill && this.currentSkill.content !== this.originalContent;
        if (hasChanges && !confirm('Ungespeicherte Änderungen verwerfen?')) {
            return;
        }
        this.currentSkill = null;
        this.originalContent = '';
        this.render();
    }

    markChanged() {
        const content = document.getElementById('skillContent').value;
        this.currentSkill.content = content;

        const badge = document.querySelector('.unsaved-badge');
        if (!badge && content !== this.originalContent) {
            const actions = document.querySelector('.editor-actions');
            if (actions) {
                actions.insertAdjacentHTML('afterbegin', '<span class="unsaved-badge">● Ungespeichert</span>');
            }
        }
    }

    integrateInput() {
        const input = document.getElementById('skillInput').value.trim();
        const content = document.getElementById('skillContent');

        if (!input) {
            alert('Bitte gib erst einen Input ein.');
            return;
        }

        // Einfache Integration: Input als neuen Abschnitt hinzufügen
        const integration = `

## Update ${new Date().toLocaleDateString('de-DE')}

${input}
`;
        content.value += integration;
        this.currentSkill.content = content.value;
        document.getElementById('skillInput').value = '';
        this.markChanged();

        alert('Input wurde als neuer Abschnitt hinzugefügt. Bearbeite den Skill-Inhalt nach Bedarf.');
    }

    saveSkill() {
        const name = document.getElementById('skillName').value.trim();
        const category = document.getElementById('skillCategory').value;
        const description = document.getElementById('skillDescription').value.trim();
        const content = document.getElementById('skillContent').value;

        if (!name) {
            alert('Bitte gib einen Skill-Namen ein.');
            return;
        }

        this.currentSkill.name = name;
        this.currentSkill.category = category;
        this.currentSkill.description = description;
        this.currentSkill.content = content;
        this.currentSkill.updatedAt = new Date().toISOString();

        const existingIndex = this.skills.findIndex(s => s.id === this.currentSkill.id);
        if (existingIndex >= 0) {
            this.skills[existingIndex] = this.currentSkill;
        } else {
            this.skills.push(this.currentSkill);
        }

        this.saveToStorage();
        this.originalContent = content;
        alert('Skill gespeichert! Vergiss nicht, die .md Datei zu exportieren.');
        this.render();
    }

    showPreview() {
        const content = document.getElementById('skillContent').value;
        const hasChanges = content !== this.originalContent;

        const modal = document.createElement('div');
        modal.className = 'preview-modal-overlay';
        modal.innerHTML = `
            <div class="preview-modal">
                <div class="preview-header">
                    <h2>👁️ Skill-Vorschau</h2>
                    <div class="preview-tabs">
                        <button class="tab-btn active" onclick="agentSkillsPage.showFullPreview()">📄 Vollständig</button>
                        ${hasChanges ? `<button class="tab-btn" onclick="agentSkillsPage.showDiffPreview()">🔄 Änderungen</button>` : ''}
                    </div>
                    <button class="btn-close" onclick="this.closest('.preview-modal-overlay').remove()">×</button>
                </div>
                <div class="preview-content" id="previewContent">
                    <pre>${this.escapeHtml(content)}</pre>
                </div>
                <div class="preview-actions">
                    <button class="btn-secondary" onclick="this.closest('.preview-modal-overlay').remove()">Schließen</button>
                    <button class="btn-primary" onclick="agentSkillsPage.copyToClipboard()">📋 Kopieren</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showFullPreview() {
        const content = document.getElementById('skillContent').value;
        document.getElementById('previewContent').innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.tab-btn').classList.add('active');
    }

    showDiffPreview() {
        const newContent = document.getElementById('skillContent').value;
        const diff = this.generateDiff(this.originalContent, newContent);
        document.getElementById('previewContent').innerHTML = `<div class="diff-view">${diff}</div>`;
        document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === 1));
    }

    generateDiff(oldText, newText) {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        let html = '';

        const maxLines = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';

            if (oldLine === newLine) {
                html += `<div class="diff-line unchanged">${this.escapeHtml(newLine) || '&nbsp;'}</div>`;
            } else if (!oldLines[i]) {
                html += `<div class="diff-line added">+ ${this.escapeHtml(newLine)}</div>`;
            } else if (!newLines[i]) {
                html += `<div class="diff-line removed">- ${this.escapeHtml(oldLine)}</div>`;
            } else {
                html += `<div class="diff-line removed">- ${this.escapeHtml(oldLine)}</div>`;
                html += `<div class="diff-line added">+ ${this.escapeHtml(newLine)}</div>`;
            }
        }
        return html;
    }

    copyToClipboard() {
        const content = document.getElementById('skillContent').value;
        navigator.clipboard.writeText(content).then(() => {
            alert('Skill-Inhalt wurde kopiert!');
        });
    }

    exportSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (!skill) return;

        const blob = new Blob([skill.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skill.name.toLowerCase().replace(/\s+/g, '-')}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAllSkills() {
        const data = JSON.stringify({ skills: this.skills, categories: this.categories }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orca-skills-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importSkill() {
        document.getElementById('importInput').click();
    }

    handleImport(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;

            // Check if JSON (full backup) or MD (single skill)
            if (file.name.endsWith('.json')) {
                try {
                    const data = JSON.parse(content);
                    if (data.skills) {
                        this.skills = data.skills;
                        this.categories = data.categories || this.categories;
                        this.saveToStorage();
                        alert(`${data.skills.length} Skills importiert!`);
                        this.render();
                    }
                } catch (e) {
                    alert('Fehler beim Import: Ungültiges JSON');
                }
            } else {
                // Single MD file
                const name = file.name.replace('.md', '').replace(/-/g, ' ');
                const id = 'skill_' + Date.now();
                this.skills.push({
                    id,
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    category: this.currentCategory || this.categories[0],
                    description: '',
                    content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                this.saveToStorage();
                alert('Skill importiert!');
                this.render();
            }
        };
        reader.readAsText(file);
        input.value = '';
    }

    deleteSkill(id) {
        if (!confirm('Skill wirklich löschen?')) return;
        this.skills = this.skills.filter(s => s.id !== id);
        this.saveToStorage();
        this.render();
    }

    addCategory() {
        const name = prompt('Name der neuen Kategorie:');
        if (name && !this.categories.includes(name)) {
            this.categories.push(name);
            localStorage.setItem('orca_skill_categories', JSON.stringify(this.categories));
            this.render();
        }
    }

    filterByCategory(category) {
        this.currentCategory = this.currentCategory === category ? null : category;
        this.render();
    }

    saveToStorage() {
        localStorage.setItem('orca_skills', JSON.stringify(this.skills));
        localStorage.setItem('orca_skill_categories', JSON.stringify(this.categories));
    }

    reloadFromSource() {
        if (typeof PRELOADED_SKILLS === 'undefined') {
            alert('Keine Quelldaten verfügbar.');
            return;
        }

        if (!confirm(PRELOADED_SKILLS.length + ' Skills aus Quelldatei laden?

Achtung: Lokale Änderungen werden überschrieben!')) {
            return;
        }

        this.skills = PRELOADED_SKILLS;
        this.saveToStorage();
        this.currentSkill = null;
        this.render();
        alert(this.skills.length + ' Skills erfolgreich geladen!');
    }

    getCategoryIcon(category) {
        const icons = {
            'Fachliche Skills': '💼',
            'Prozess-Skills': '⚙️',
            'Rollen-Skills': '👤',
            'Technische Skills': '🔧'
        };
        return icons[category] || '📁';
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSkillTemplate(name) {
        return `# ${name}

Kurze Beschreibung des Skills.

## Anwendungsbereich

Dieser Skill wird verwendet für:
- ...
- ...

## Inhalte

### Abschnitt 1

Details...

### Abschnitt 2

Details...

## Beispiele

\`\`\`
Beispielcode oder -text
\`\`\`

## Referenzen

- Link 1
- Link 2
`;
    }

    getStyles() {
        return `
            .agent-skills-page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
            .skills-header { margin-bottom: 1.5rem; }
            .skills-header h1 { margin: 0; color: #2c4a8c; }
            .skills-subtitle { color: #6b7280; margin: 0.25rem 0 0 0; }

            .skills-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; }

            .skills-sidebar { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: fit-content; }
            .sidebar-section { margin-bottom: 1.5rem; }
            .sidebar-section h3 { font-size: 0.9rem; color: #6b7280; margin: 0 0 0.75rem 0; }

            .category-list { display: flex; flex-direction: column; gap: 0.25rem; }
            .category-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
            .category-item:hover { background: #f3f4f6; }
            .category-item.active { background: #2c4a8c; color: white; }
            .category-icon { font-size: 1.1rem; }
            .category-count { margin-left: auto; font-size: 0.8rem; background: #e5e7eb; padding: 0.1rem 0.4rem; border-radius: 10px; }
            .category-item.active .category-count { background: rgba(255,255,255,0.2); }

            .btn-add-category { width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; background: transparent; border-radius: 6px; cursor: pointer; color: #6b7280; margin-top: 0.5rem; }
            .btn-add-category:hover { border-color: #2c4a8c; color: #2c4a8c; }

            .btn-action { width: 100%; padding: 0.6rem; border: none; background: #f3f4f6; border-radius: 6px; cursor: pointer; text-align: left; margin-bottom: 0.5rem; }
            .btn-action:hover { background: #e5e7eb; }

            .skills-path { display: block; font-size: 0.7rem; background: #f9fafb; padding: 0.5rem; border-radius: 4px; word-break: break-all; color: #6b7280; }

            .skills-main { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 500px; }

            .skills-empty { text-align: center; padding: 3rem; }
            .skills-empty .empty-icon { font-size: 3rem; }
            .skills-empty h3 { margin: 1rem 0 0.5rem 0; }
            .skills-empty p { color: #6b7280; margin-bottom: 1.5rem; }

            .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
            .skill-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.2s; }
            .skill-card:hover { border-color: #2c4a8c; box-shadow: 0 4px 12px rgba(44,74,140,0.1); }
            .skill-card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
            .skill-icon { font-size: 1.2rem; }
            .skill-category { font-size: 0.75rem; color: #6b7280; background: #f3f4f6; padding: 0.15rem 0.5rem; border-radius: 4px; }
            .skill-name { margin: 0.5rem 0; font-size: 1.1rem; color: #2c3e50; }
            .skill-description { font-size: 0.85rem; color: #6b7280; margin: 0; line-height: 1.4; }
            .skill-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #9ca3af; margin-top: 0.75rem; }
            .skill-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
            .btn-small { padding: 0.3rem 0.6rem; font-size: 0.8rem; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; }
            .btn-small:hover { background: #f3f4f6; }
            .btn-small.danger:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

            .skill-editor { display: flex; flex-direction: column; height: 100%; }
            .editor-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
            .btn-back { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; }
            .editor-title { display: flex; gap: 0.5rem; flex: 1; }
            .input-title { flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 1.1rem; font-weight: 500; }
            .select-category { padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }
            .editor-actions { display: flex; gap: 0.5rem; align-items: center; }
            .unsaved-badge { color: #f59e0b; font-size: 0.85rem; }

            .editor-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
            .editor-input-section, .editor-content-section { display: flex; flex-direction: column; }
            .editor-input-section h4, .editor-content-section h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #6b7280; }
            .editor-input-section textarea { height: 150px; }
            .editor-content-section textarea { flex: 1; min-height: 300px; }
            .editor-body textarea { padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; font-family: monospace; font-size: 0.9rem; resize: none; }
            .btn-integrate { margin-top: 0.5rem; padding: 0.5rem 1rem; background: #2c4a8c; color: white; border: none; border-radius: 6px; cursor: pointer; }
            .btn-integrate:hover { background: #1e3a6d; }

            .editor-description { margin-top: 1rem; }
            .editor-description label { font-size: 0.85rem; color: #6b7280; display: block; margin-bottom: 0.25rem; }
            .editor-description input { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }

            .btn-primary { padding: 0.5rem 1rem; background: #2c4a8c; color: white; border: none; border-radius: 6px; cursor: pointer; }
            .btn-primary:hover { background: #1e3a6d; }
            .btn-secondary { padding: 0.5rem 1rem; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
            .btn-secondary:hover { background: #e5e7eb; }

            .preview-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .preview-modal { background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 80vh; display: flex; flex-direction: column; }
            .preview-header { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
            .preview-header h2 { margin: 0; flex: 1; }
            .preview-tabs { display: flex; gap: 0.5rem; }
            .tab-btn { padding: 0.4rem 0.8rem; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; }
            .tab-btn.active { background: #2c4a8c; color: white; border-color: #2c4a8c; }
            .btn-close { width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
            .preview-content { flex: 1; overflow: auto; padding: 1rem; background: #f9fafb; }
            .preview-content pre { margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; }
            .preview-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem; border-top: 1px solid #e5e7eb; }

            .diff-view { font-family: monospace; font-size: 0.85rem; }
            .diff-line { padding: 0.2rem 0.5rem; }
            .diff-line.added { background: #dcfce7; color: #166534; }
            .diff-line.removed { background: #fef2f2; color: #dc2626; text-decoration: line-through; }
            .diff-line.unchanged { color: #6b7280; }

            /* Dark mode */
            [data-theme="dark"] .skills-sidebar,
            [data-theme="dark"] .skills-main { background: #1e293b; }
            [data-theme="dark"] .skill-card { border-color: #334155; }
            [data-theme="dark"] .skill-card:hover { border-color: #60a5fa; }
            [data-theme="dark"] .category-item:hover { background: #334155; }
            [data-theme="dark"] .category-count { background: #334155; }
            [data-theme="dark"] .btn-action { background: #334155; color: #e2e8f0; }
            [data-theme="dark"] .skills-path { background: #0f172a; }
            [data-theme="dark"] .editor-body textarea,
            [data-theme="dark"] .input-title,
            [data-theme="dark"] .select-category,
            [data-theme="dark"] .editor-description input { background: #0f172a; border-color: #334155; color: #e2e8f0; }
            [data-theme="dark"] .preview-modal { background: #1e293b; }
            [data-theme="dark"] .preview-content { background: #0f172a; }
            [data-theme="dark"] .btn-small { background: #334155; border-color: #475569; color: #e2e8f0; }

            /* Read View Styles */
            .skill-read-view { display: flex; flex-direction: column; height: 100%; }
            .read-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
            .read-meta { display: flex; gap: 0.75rem; flex: 1; }
            .skill-category-badge { background: #f3f4f6; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.85rem; }
            .skill-folder { color: #6b7280; font-size: 0.85rem; }
            .read-actions { display: flex; gap: 0.5rem; }

            .read-content { flex: 1; overflow: auto; padding: 1rem; background: #fafbfc; border-radius: 8px; line-height: 1.7; }
            .read-content h1 { font-size: 1.75rem; color: #2c4a8c; margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #2c4a8c; }
            .read-content h2 { font-size: 1.35rem; color: #2c3e50; margin: 1.5rem 0 0.75rem 0; padding-bottom: 0.25rem; border-bottom: 1px solid #e5e7eb; }
            .read-content h3 { font-size: 1.1rem; color: #374151; margin: 1.25rem 0 0.5rem 0; }
            .read-content p { margin: 0.5rem 0; }
            .read-content ul { margin: 0.5rem 0; padding-left: 1.5rem; }
            .read-content li { margin: 0.25rem 0; }
            .read-content code { background: #e5e7eb; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
            .read-content pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
            .read-content pre code { background: transparent; padding: 0; color: inherit; }
            .read-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            .read-content th, .read-content td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
            .read-content th { background: #f9fafb; font-weight: 600; }
            .read-content strong { color: #2c3e50; }

            .read-footer { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
            .file-path { font-size: 0.8rem; color: #9ca3af; font-family: monospace; }

            /* Dark mode read view */
            [data-theme="dark"] .read-content { background: #0f172a; }
            [data-theme="dark"] .read-content h1 { color: #60a5fa; border-color: #60a5fa; }
            [data-theme="dark"] .read-content h2 { color: #e2e8f0; border-color: #334155; }
            [data-theme="dark"] .read-content h3 { color: #cbd5e1; }
            [data-theme="dark"] .read-content code { background: #334155; }
            [data-theme="dark"] .read-content th { background: #1e293b; }
            [data-theme="dark"] .read-content th, [data-theme="dark"] .read-content td { border-color: #334155; }
            [data-theme="dark"] .skill-category-badge { background: #334155; }
            [data-theme="dark"] .read-header { border-color: #334155; }
            [data-theme="dark"] .read-footer { border-color: #334155; }

            @media (max-width: 900px) {
                .skills-layout { grid-template-columns: 1fr; }
                .editor-body { grid-template-columns: 1fr; }
            }
        `;
    }
}

const agentSkillsPage = new AgentSkillsPage();
