// ORCA 2.0 - Backlog-Agent (Intern)
// Offene Punkte, Feature-Requests und Verbesserungsideen sammeln
class AgentBacklogPage {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('orca_backlog') || '[]');
        this.categories = [
            { id: 'feature', label: '✨ Feature', color: '#8b5cf6' },
            { id: 'improvement', label: '📈 Verbesserung', color: '#3b82f6' },
            { id: 'refactor', label: '🔧 Refactoring', color: '#6b7280' },
            { id: 'docs', label: '📚 Dokumentation', color: '#14b8a6' },
            { id: 'research', label: '🔬 Research', color: '#f59e0b' },
            { id: 'tech-debt', label: '⚠️ Tech Debt', color: '#ef4444' }
        ];
        this.sizes = [
            { id: 'xs', label: 'XS', desc: '< 1 Stunde', points: 1 },
            { id: 's', label: 'S', desc: '1-4 Stunden', points: 2 },
            { id: 'm', label: 'M', desc: '1-2 Tage', points: 5 },
            { id: 'l', label: 'L', desc: '3-5 Tage', points: 8 },
            { id: 'xl', label: 'XL', desc: '> 1 Woche', points: 13 }
        ];
        this.statuses = [
            { id: 'backlog', label: 'Backlog', color: '#6b7280' },
            { id: 'planned', label: 'Geplant', color: '#3b82f6' },
            { id: 'in-progress', label: 'In Arbeit', color: '#f59e0b' },
            { id: 'done', label: 'Erledigt', color: '#22c55e' },
            { id: 'wont-do', label: 'Nicht umsetzen', color: '#9ca3af' }
        ];
        this.currentFilter = 'all';
    }

    render() {
        const app = document.getElementById('app');

        if (permissionService.getCurrentRole() !== 'SUP') {
            app.innerHTML = `
                <div class="container" style="padding: 3rem; text-align: center;">
                    <h2>🔒 Zugriff verweigert</h2>
                    <button class="btn btn-primary" onclick="router.navigate('/dashboard')">Zurück</button>
                </div>
            `;
            return;
        }

        document.getElementById('headerTitle').textContent = 'Backlog-Agent';
        document.getElementById('headerSubtitle').textContent = 'Offene Punkte & Feature-Requests';
        document.getElementById('headerStats').style.display = 'none';

        const stats = this.getStats();

        app.innerHTML = `
            <div class="agent-backlog-page">
                <div class="backlog-header">
                    <div class="backlog-stats">
                        <div class="stat">
                            <span class="stat-value">${stats.total}</span>
                            <span class="stat-label">Gesamt</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.backlog}</span>
                            <span class="stat-label">Backlog</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.planned}</span>
                            <span class="stat-label">Geplant</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.totalPoints}</span>
                            <span class="stat-label">Story Points</span>
                        </div>
                    </div>
                    <div class="backlog-actions">
                        <button class="btn-add" onclick="agentBacklogPage.showAddForm()">
                            ➕ Neuer Eintrag
                        </button>
                        <button class="btn-export" onclick="agentBacklogPage.exportBacklog()">
                            📤 Exportieren
                        </button>
                    </div>
                </div>

                <div class="backlog-filters">
                    <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="agentBacklogPage.setFilter('all')">Alle</button>
                    ${this.statuses.slice(0, -1).map(s => `
                        <button class="filter-btn ${this.currentFilter === s.id ? 'active' : ''}" onclick="agentBacklogPage.setFilter('${s.id}')">${s.label}</button>
                    `).join('')}
                </div>

                <div class="backlog-board">
                    ${this.renderKanban()}
                </div>

                <div class="backlog-modal" id="backlogModal" style="display: none;">
                    <div class="modal-content" id="modalContent"></div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    getStats() {
        const activeItems = this.items.filter(i => i.status !== 'done' && i.status !== 'wont-do');
        return {
            total: this.items.length,
            backlog: this.items.filter(i => i.status === 'backlog').length,
            planned: this.items.filter(i => i.status === 'planned').length,
            inProgress: this.items.filter(i => i.status === 'in-progress').length,
            done: this.items.filter(i => i.status === 'done').length,
            totalPoints: activeItems.reduce((sum, i) => sum + (this.sizes.find(s => s.id === i.size)?.points || 0), 0)
        };
    }

    renderKanban() {
        const columns = this.statuses.slice(0, -1); // Ohne "Nicht umsetzen"

        return `
            <div class="kanban-columns">
                ${columns.map(status => {
                    const items = this.items
                        .filter(i => i.status === status.id)
                        .filter(i => this.currentFilter === 'all' || i.status === this.currentFilter)
                        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

                    return `
                        <div class="kanban-column" data-status="${status.id}">
                            <div class="column-header" style="border-color: ${status.color}">
                                <span class="column-title">${status.label}</span>
                                <span class="column-count">${items.length}</span>
                            </div>
                            <div class="column-items">
                                ${items.map(item => this.renderCard(item)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderCard(item) {
        const category = this.categories.find(c => c.id === item.category);
        const size = this.sizes.find(s => s.id === item.size);

        return `
            <div class="backlog-card" onclick="agentBacklogPage.showItem('${item.id}')">
                <div class="card-header">
                    <span class="card-category" style="background: ${category?.color}20; color: ${category?.color}">${category?.label || item.category}</span>
                    <span class="card-size">${size?.label || '?'}</span>
                </div>
                <div class="card-title">${this.escapeHtml(item.title)}</div>
                ${item.tags?.length ? `
                    <div class="card-tags">
                        ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="card-footer">
                    <span class="card-date">${this.formatDate(item.createdAt)}</span>
                    ${item.priority ? `<span class="card-priority">⬆️ ${item.priority}</span>` : ''}
                </div>
            </div>
        `;
    }

    showAddForm() {
        const modal = document.getElementById('backlogModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <div class="modal-header">
                <h3>➕ Neuer Backlog-Eintrag</h3>
                <button class="modal-close" onclick="agentBacklogPage.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titel *</label>
                        <input type="text" id="itemTitle" placeholder="Kurze Beschreibung">
                    </div>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Kategorie</label>
                        <select id="itemCategory">
                            ${this.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Größe</label>
                        <select id="itemSize">
                            ${this.sizes.map(s => `<option value="${s.id}">${s.label} (${s.desc})</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea id="itemDescription" rows="4" placeholder="Was soll gemacht werden? Warum?"></textarea>
                </div>
                <div class="form-group">
                    <label>Akzeptanzkriterien</label>
                    <textarea id="itemCriteria" rows="3" placeholder="- [ ] Kriterium 1&#10;- [ ] Kriterium 2"></textarea>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Tags (kommagetrennt)</label>
                        <input type="text" id="itemTags" placeholder="UI, API, Performance">
                    </div>
                    <div class="form-group">
                        <label>Priorität (1-10)</label>
                        <input type="number" id="itemPriority" min="1" max="10" value="5">
                    </div>
                </div>
                <div class="form-group">
                    <label>Betroffene Sichten</label>
                    <input type="text" id="itemViews" placeholder="Inventur, Verlagerung">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="agentBacklogPage.closeModal()">Abbrechen</button>
                <button class="btn-submit" onclick="agentBacklogPage.saveItem()">Speichern</button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    saveItem(itemId = null) {
        const title = document.getElementById('itemTitle').value.trim();
        const category = document.getElementById('itemCategory').value;
        const size = document.getElementById('itemSize').value;
        const description = document.getElementById('itemDescription').value.trim();
        const criteria = document.getElementById('itemCriteria').value.trim();
        const tags = document.getElementById('itemTags').value.split(',').map(t => t.trim()).filter(t => t);
        const priority = parseInt(document.getElementById('itemPriority').value) || 5;
        const views = document.getElementById('itemViews').value.trim();

        if (!title) {
            alert('Bitte einen Titel eingeben.');
            return;
        }

        if (itemId) {
            // Update
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                Object.assign(item, { title, category, size, description, criteria, tags, priority, views, updatedAt: new Date().toISOString() });
            }
        } else {
            // Create
            const item = {
                id: 'BL-' + Date.now(),
                title, category, size, description, criteria, tags, priority, views,
                status: 'backlog',
                createdAt: new Date().toISOString(),
                createdBy: 'Support'
            };
            this.items.unshift(item);
        }

        this.saveItems();
        this.closeModal();
        this.render();
    }

    showItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const category = this.categories.find(c => c.id === item.category);
        const size = this.sizes.find(s => s.id === item.size);
        const status = this.statuses.find(s => s.id === item.status);

        const modal = document.getElementById('backlogModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <div class="modal-header">
                <div class="item-id">${item.id}</div>
                <button class="modal-close" onclick="agentBacklogPage.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <h3>${this.escapeHtml(item.title)}</h3>

                <div class="item-meta">
                    <span class="meta-badge" style="background: ${category?.color}20; color: ${category?.color}">${category?.label}</span>
                    <span class="meta-badge size">${size?.label} (${size?.points} SP)</span>
                    <select class="status-select" onchange="agentBacklogPage.updateStatus('${item.id}', this.value)">
                        ${this.statuses.map(s => `<option value="${s.id}" ${s.id === item.status ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </div>

                ${item.description ? `
                    <div class="item-section">
                        <h4>Beschreibung</h4>
                        <p>${this.escapeHtml(item.description).replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}

                ${item.criteria ? `
                    <div class="item-section">
                        <h4>Akzeptanzkriterien</h4>
                        <pre>${this.escapeHtml(item.criteria)}</pre>
                    </div>
                ` : ''}

                ${item.tags?.length ? `
                    <div class="item-section">
                        <h4>Tags</h4>
                        <div class="tag-list">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                    </div>
                ` : ''}

                ${item.views ? `
                    <div class="item-section">
                        <h4>Betroffene Sichten</h4>
                        <p>${item.views}</p>
                    </div>
                ` : ''}

                <div class="item-section">
                    <h4>Details</h4>
                    <div class="detail-grid">
                        <div><strong>Erstellt:</strong> ${this.formatDate(item.createdAt)}</div>
                        <div><strong>Von:</strong> ${item.createdBy}</div>
                        <div><strong>Priorität:</strong> ${item.priority || '-'}</div>
                        ${item.updatedAt ? `<div><strong>Aktualisiert:</strong> ${this.formatDate(item.updatedAt)}</div>` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-delete" onclick="agentBacklogPage.deleteItem('${item.id}')">🗑️ Löschen</button>
                <button class="btn-copy" onclick="agentBacklogPage.copyForClaude('${item.id}')">📋 Für Claude</button>
                <button class="btn-edit" onclick="agentBacklogPage.editItem('${item.id}')">✏️ Bearbeiten</button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    editItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        this.showAddForm();

        // Fill form
        setTimeout(() => {
            document.getElementById('itemTitle').value = item.title;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemSize').value = item.size;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemCriteria').value = item.criteria || '';
            document.getElementById('itemTags').value = item.tags?.join(', ') || '';
            document.getElementById('itemPriority').value = item.priority || 5;
            document.getElementById('itemViews').value = item.views || '';

            // Change save button to update
            const submitBtn = document.querySelector('.btn-submit');
            submitBtn.textContent = 'Aktualisieren';
            submitBtn.onclick = () => agentBacklogPage.saveItem(itemId);
        }, 50);
    }

    updateStatus(itemId, status) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.status = status;
            item.updatedAt = new Date().toISOString();
            this.saveItems();
            this.closeModal();
            this.render();
        }
    }

    deleteItem(itemId) {
        if (!confirm('Eintrag wirklich löschen?')) return;
        this.items = this.items.filter(i => i.id !== itemId);
        this.saveItems();
        this.closeModal();
        this.render();
    }

    copyForClaude(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const category = this.categories.find(c => c.id === item.category);
        const size = this.sizes.find(s => s.id === item.size);

        const text = `📋 Backlog-Item: ${item.title}

Kategorie: ${category?.label}
Größe: ${size?.label} (${size?.desc})
Priorität: ${item.priority}/10

${item.description ? `Beschreibung:
${item.description}

` : ''}${item.criteria ? `Akzeptanzkriterien:
${item.criteria}

` : ''}${item.views ? `Betroffene Sichten: ${item.views}` : ''}

Bitte setze diesen Punkt um.`;

        navigator.clipboard.writeText(text).then(() => {
            alert('In Zwischenablage kopiert!');
        });
    }

    exportBacklog() {
        const data = JSON.stringify(this.items, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orca-backlog-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    closeModal() {
        document.getElementById('backlogModal').style.display = 'none';
    }

    saveItems() {
        localStorage.setItem('orca_backlog', JSON.stringify(this.items));
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('de-DE');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addStyles() {
        if (document.getElementById('agent-backlog-styles')) return;
        const style = document.createElement('style');
        style.id = 'agent-backlog-styles';
        style.textContent = `
            .agent-backlog-page { padding: 1.5rem; max-width: 1600px; margin: 0 auto; }
            .backlog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
            .backlog-stats { display: flex; gap: 2rem; }
            .stat { text-align: center; }
            .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #3b82f6; }
            .stat-label { font-size: 0.85rem; color: #6b7280; }
            .backlog-actions { display: flex; gap: 0.5rem; }
            .btn-add { padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; }
            .btn-export { padding: 0.75rem 1.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
            .backlog-filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
            .filter-btn { padding: 0.5rem 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 20px; cursor: pointer; }
            .filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
            .kanban-columns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; min-height: 60vh; }
            .kanban-column { background: #f9fafb; border-radius: 12px; padding: 1rem; }
            .column-header { display: flex; justify-content: space-between; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 3px solid; }
            .column-title { font-weight: 600; }
            .column-count { background: #e5e7eb; padding: 0.125rem 0.5rem; border-radius: 10px; font-size: 0.85rem; }
            .column-items { display: flex; flex-direction: column; gap: 0.75rem; }
            .backlog-card { background: white; border-radius: 8px; padding: 1rem; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.2s; }
            .backlog-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
            .card-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
            .card-category { padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
            .card-size { background: #f3f4f6; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
            .card-title { font-weight: 500; margin-bottom: 0.5rem; }
            .card-tags { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
            .tag { background: #f3f4f6; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.7rem; }
            .card-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #6b7280; }
            .backlog-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .modal-content { background: white; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
            .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
            .modal-body { padding: 1.5rem; }
            .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1.5rem; border-top: 1px solid #e5e7eb; }
            .form-row { margin-bottom: 1rem; }
            .form-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
            .btn-cancel { padding: 0.75rem 1.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
            .btn-submit, .btn-edit { padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; }
            .btn-delete { padding: 0.75rem 1.5rem; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; }
            .btn-copy { padding: 0.75rem 1.5rem; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
            .item-id { font-family: monospace; color: #6b7280; }
            .item-meta { display: flex; gap: 0.5rem; align-items: center; margin: 1rem 0; flex-wrap: wrap; }
            .meta-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; }
            .status-select { padding: 0.5rem; border-radius: 6px; border: 1px solid #e5e7eb; }
            .item-section { margin: 1.5rem 0; }
            .item-section h4 { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.5rem; }
            .item-section pre { background: #f9fafb; padding: 1rem; border-radius: 8px; white-space: pre-wrap; }
            .tag-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
            .detail-grid { display: grid; gap: 0.5rem; }
            [data-theme="dark"] .kanban-column { background: #1f2937; }
            [data-theme="dark"] .backlog-card { background: #374151; border-color: #4b5563; color: #f3f4f6; }
            [data-theme="dark"] .modal-content { background: #1f2937; color: #f3f4f6; }
            @media (max-width: 1200px) { .kanban-columns { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 768px) { .kanban-columns { grid-template-columns: 1fr; } }
        `;
        document.head.appendChild(style);
    }
}

const agentBacklogPage = new AgentBacklogPage();
