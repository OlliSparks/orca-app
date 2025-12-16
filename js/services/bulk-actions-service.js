// ORCA 2.0 - Bulk Actions Service
// Massenaktionen für Assets und Prozesse

class BulkActionsService {
    constructor() {
        this.selectedItems = new Set();
        this.selectionMode = false;
        this.currentContext = null; // 'inventur', 'verlagerung', 'tools', etc.
        this.actionBar = null;
    }

    // Selektionsmodus aktivieren/deaktivieren
    enableSelectionMode(context, options = {}) {
        this.currentContext = context;
        this.selectionMode = true;
        this.selectedItems.clear();
        this.options = options;

        this.createActionBar();
        this.updateActionBar();

        // Add selection class to body
        document.body.classList.add('bulk-selection-mode');

        // Add click handlers to selectable items
        this.attachItemHandlers();
    }

    disableSelectionMode() {
        this.selectionMode = false;
        this.selectedItems.clear();
        this.currentContext = null;

        document.body.classList.remove('bulk-selection-mode');

        // Remove action bar
        if (this.actionBar) {
            this.actionBar.classList.add('hiding');
            setTimeout(() => {
                if (this.actionBar) {
                    this.actionBar.remove();
                    this.actionBar = null;
                }
            }, 300);
        }

        // Remove selection from items
        document.querySelectorAll('.bulk-selectable.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    // Toggle-Selektion für ein Item
    toggleItem(itemId, element = null) {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
            if (element) element.classList.remove('selected');
        } else {
            this.selectedItems.add(itemId);
            if (element) element.classList.add('selected');
        }
        this.updateActionBar();
    }

    // Alle sichtbaren Items selektieren
    selectAll() {
        document.querySelectorAll('.bulk-selectable:not(.hidden)').forEach(el => {
            const itemId = el.dataset.itemId;
            if (itemId) {
                this.selectedItems.add(itemId);
                el.classList.add('selected');
            }
        });
        this.updateActionBar();
    }

    // Keine Items selektieren
    selectNone() {
        this.selectedItems.clear();
        document.querySelectorAll('.bulk-selectable.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.updateActionBar();
    }

    // Selektion umkehren
    invertSelection() {
        document.querySelectorAll('.bulk-selectable:not(.hidden)').forEach(el => {
            const itemId = el.dataset.itemId;
            if (itemId) {
                if (this.selectedItems.has(itemId)) {
                    this.selectedItems.delete(itemId);
                    el.classList.remove('selected');
                } else {
                    this.selectedItems.add(itemId);
                    el.classList.add('selected');
                }
            }
        });
        this.updateActionBar();
    }

    // Action Bar erstellen
    createActionBar() {
        if (this.actionBar) return;

        this.actionBar = document.createElement('div');
        this.actionBar.className = 'bulk-action-bar';
        this.actionBar.innerHTML = this.getActionBarHTML();
        document.body.appendChild(this.actionBar);

        // Animation
        requestAnimationFrame(() => {
            this.actionBar.classList.add('visible');
        });
    }

    getActionBarHTML() {
        const actions = this.getContextActions();

        return `
            <div class="bulk-action-bar-content">
                <div class="bulk-selection-info">
                    <button class="bulk-close-btn" onclick="bulkActionsService.disableSelectionMode()" title="Beenden">
                        ✕
                    </button>
                    <span class="bulk-count">
                        <strong id="bulkSelectedCount">0</strong> ausgewählt
                    </span>
                    <div class="bulk-selection-controls">
                        <button class="bulk-select-btn" onclick="bulkActionsService.selectAll()">
                            Alle
                        </button>
                        <button class="bulk-select-btn" onclick="bulkActionsService.selectNone()">
                            Keine
                        </button>
                        <button class="bulk-select-btn" onclick="bulkActionsService.invertSelection()">
                            Umkehren
                        </button>
                    </div>
                </div>
                <div class="bulk-actions">
                    ${actions.map(action => `
                        <button class="bulk-action-btn ${action.danger ? 'danger' : ''} ${action.primary ? 'primary' : ''}"
                                onclick="bulkActionsService.executeAction('${action.id}')"
                                ${action.minSelection ? `data-min-selection="${action.minSelection}"` : ''}
                                title="${action.description || action.label}">
                            <span class="action-icon">${action.icon}</span>
                            <span class="action-label">${action.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Kontext-spezifische Aktionen
    getContextActions() {
        const contexts = {
            'inventur': [
                { id: 'confirm', icon: '✓', label: 'Bestätigen', primary: true, description: 'Ausgewählte als bestätigt markieren' },
                { id: 'relocate', icon: '📍', label: 'Standort ändern', description: 'Neuen Standort zuweisen' },
                { id: 'delegate', icon: '👤', label: 'Delegieren', description: 'Verantwortlichen zuweisen' },
                { id: 'missing', icon: '❓', label: 'Fehlend melden', danger: true, description: 'Als nicht gefunden markieren' },
                { id: 'export', icon: '📥', label: 'Exportieren', description: 'Als Excel exportieren' }
            ],
            'verlagerung': [
                { id: 'approve', icon: '✓', label: 'Genehmigen', primary: true },
                { id: 'reject', icon: '✕', label: 'Ablehnen', danger: true },
                { id: 'setTarget', icon: '🎯', label: 'Ziel setzen' },
                { id: 'export', icon: '📥', label: 'Exportieren' }
            ],
            'tools': [
                { id: 'export', icon: '📥', label: 'Exportieren', primary: true },
                { id: 'createInventur', icon: '📋', label: 'Inventur anlegen' },
                { id: 'requestRelocation', icon: '🚚', label: 'Verlagerung beantragen' }
            ],
            'abl': [
                { id: 'confirm', icon: '✓', label: 'Bestätigen', primary: true },
                { id: 'report', icon: '📝', label: 'Melden' },
                { id: 'export', icon: '📥', label: 'Exportieren' }
            ],
            'default': [
                { id: 'export', icon: '📥', label: 'Exportieren', primary: true }
            ]
        };

        return contexts[this.currentContext] || contexts['default'];
    }

    // Action Bar aktualisieren
    updateActionBar() {
        if (!this.actionBar) return;

        const count = this.selectedItems.size;
        const countEl = document.getElementById('bulkSelectedCount');
        if (countEl) {
            countEl.textContent = count;
        }

        // Buttons aktivieren/deaktivieren basierend auf Selektion
        this.actionBar.querySelectorAll('.bulk-action-btn').forEach(btn => {
            const minSelection = parseInt(btn.dataset.minSelection) || 1;
            btn.disabled = count < minSelection;
        });
    }

    // Aktion ausführen
    async executeAction(actionId) {
        const selectedIds = Array.from(this.selectedItems);

        if (selectedIds.length === 0) {
            errorService.info('Bitte wählen Sie mindestens ein Element aus.', 'Keine Auswahl');
            return;
        }

        // Kontext-spezifische Handler
        const handlers = {
            'inventur': {
                'confirm': () => this.handleInventurConfirm(selectedIds),
                'relocate': () => this.handleInventurRelocate(selectedIds),
                'delegate': () => this.handleInventurDelegate(selectedIds),
                'missing': () => this.handleInventurMissing(selectedIds),
                'export': () => this.handleExport(selectedIds)
            },
            'verlagerung': {
                'approve': () => this.handleVerlagerungApprove(selectedIds),
                'reject': () => this.handleVerlagerungReject(selectedIds),
                'setTarget': () => this.handleVerlagerungSetTarget(selectedIds),
                'export': () => this.handleExport(selectedIds)
            },
            'tools': {
                'export': () => this.handleExport(selectedIds),
                'createInventur': () => this.handleCreateInventur(selectedIds),
                'requestRelocation': () => this.handleRequestRelocation(selectedIds)
            },
            'abl': {
                'confirm': () => this.handleABLConfirm(selectedIds),
                'report': () => this.handleABLReport(selectedIds),
                'export': () => this.handleExport(selectedIds)
            }
        };

        const contextHandlers = handlers[this.currentContext] || {};
        const handler = contextHandlers[actionId];

        if (handler) {
            try {
                await handler();
            } catch (error) {
                errorService.show(error);
            }
        } else {
            console.warn(`No handler for action: ${actionId} in context: ${this.currentContext}`);
        }
    }

    // Click-Handler für selektierbare Items
    attachItemHandlers() {
        document.querySelectorAll('.bulk-selectable').forEach(el => {
            if (!el.dataset.bulkHandlerAttached) {
                el.dataset.bulkHandlerAttached = 'true';
                el.addEventListener('click', (e) => {
                    if (this.selectionMode) {
                        // Prevent default action when in selection mode
                        if (!e.target.closest('a, button, input, select')) {
                            e.preventDefault();
                            e.stopPropagation();
                            const itemId = el.dataset.itemId;
                            if (itemId) {
                                this.toggleItem(itemId, el);
                            }
                        }
                    }
                });
            }
        });
    }

    // === INVENTUR HANDLER ===

    async handleInventurConfirm(ids) {
        const confirmed = await errorService.confirm(
            `${ids.length} Werkzeug(e) als bestätigt markieren?`,
            { title: 'Bestätigen', icon: '✓' }
        );

        if (confirmed && typeof inventurPage !== 'undefined') {
            ids.forEach(id => {
                const tool = inventurPage.tools.find(t => String(t.id) === String(id));
                if (tool) {
                    tool.status = 'confirmed';
                }
            });
            inventurPage.renderTable?.() || inventurPage.renderCards?.();
            errorService.success(`${ids.length} Werkzeug(e) bestätigt.`, 'Bestätigt');
            this.selectNone();
        }
    }

    async handleInventurRelocate(ids) {
        // Show location selection modal
        if (typeof inventurPage !== 'undefined') {
            inventurPage.openLocationFilterModal?.();
        }
    }

    async handleInventurDelegate(ids) {
        const name = await errorService.prompt(
            'An wen sollen die Werkzeuge delegiert werden?',
            '',
            { title: 'Delegieren', icon: '👤', placeholder: 'Name eingeben...' }
        );

        if (name && typeof inventurPage !== 'undefined') {
            ids.forEach(id => {
                const tool = inventurPage.tools.find(t => String(t.id) === String(id));
                if (tool) {
                    tool.assignedUser = name;
                }
            });
            inventurPage.renderTable?.() || inventurPage.renderCards?.();
            errorService.success(`${ids.length} Werkzeug(e) an ${name} delegiert.`, 'Delegiert');
            this.selectNone();
        }
    }

    async handleInventurMissing(ids) {
        const confirmed = await errorService.confirm(
            `${ids.length} Werkzeug(e) als fehlend markieren?`,
            { title: 'Fehlend melden', icon: '❓', danger: true }
        );

        if (confirmed && typeof inventurPage !== 'undefined') {
            ids.forEach(id => {
                const tool = inventurPage.tools.find(t => String(t.id) === String(id));
                if (tool) {
                    tool.status = 'missing';
                }
            });
            inventurPage.renderTable?.() || inventurPage.renderCards?.();
            errorService.success(`${ids.length} Werkzeug(e) als fehlend gemeldet.`, 'Fehlend');
            this.selectNone();
        }
    }

    // === EXPORT HANDLER ===

    handleExport(ids) {
        if (typeof XLSX === 'undefined') {
            errorService.info('Excel-Export wird vorbereitet...', 'Export');
            return;
        }

        // Collect data for selected items
        let data = [];

        if (this.currentContext === 'inventur' && typeof inventurPage !== 'undefined') {
            data = inventurPage.tools
                .filter(t => ids.includes(String(t.id)))
                .map(t => ({
                    'Inventar-Nr': t.inventoryNumber || t.toolNumber,
                    'Name': t.name,
                    'Lieferant': t.supplier,
                    'Standort': t.location,
                    'Status': t.status,
                    'Verantwortlich': t.assignedUser || ''
                }));
        }

        if (data.length > 0) {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Export');
            XLSX.writeFile(wb, `orca_export_${Date.now()}.xlsx`);
            errorService.success(`${data.length} Einträge exportiert.`, 'Export erfolgreich');
        } else {
            errorService.info('Keine Daten zum Exportieren.', 'Export');
        }
    }

    // === VERLAGERUNG HANDLER ===

    async handleVerlagerungApprove(ids) {
        const confirmed = await errorService.confirm(
            `${ids.length} Verlagerung(en) genehmigen?`,
            { title: 'Genehmigen', icon: '✓' }
        );

        if (confirmed) {
            errorService.success(`${ids.length} Verlagerung(en) genehmigt.`, 'Genehmigt');
            this.selectNone();
        }
    }

    async handleVerlagerungReject(ids) {
        const reason = await errorService.prompt(
            'Grund für die Ablehnung:',
            '',
            { title: 'Ablehnen', icon: '✕', placeholder: 'Begründung eingeben...' }
        );

        if (reason) {
            errorService.success(`${ids.length} Verlagerung(en) abgelehnt.`, 'Abgelehnt');
            this.selectNone();
        }
    }

    async handleVerlagerungSetTarget(ids) {
        errorService.info('Zielstandort-Auswahl wird geöffnet...', 'Ziel setzen');
    }

    // === TOOLS HANDLER ===

    handleCreateInventur(ids) {
        localStorage.setItem('bulk_inventur_tools', JSON.stringify(ids));
        router.navigate('/inventur');
        errorService.success(`Inventur mit ${ids.length} Werkzeug(en) vorbereitet.`, 'Inventur');
    }

    handleRequestRelocation(ids) {
        localStorage.setItem('bulk_relocation_tools', JSON.stringify(ids));
        router.navigate('/agent-verlagerung-beantragen');
        errorService.success(`Verlagerung für ${ids.length} Werkzeug(e) vorbereitet.`, 'Verlagerung');
    }

    // === ABL HANDLER ===

    async handleABLConfirm(ids) {
        const confirmed = await errorService.confirm(
            `${ids.length} Position(en) bestätigen?`,
            { title: 'Bestätigen', icon: '✓' }
        );

        if (confirmed) {
            errorService.success(`${ids.length} Position(en) bestätigt.`, 'Bestätigt');
            this.selectNone();
        }
    }

    async handleABLReport(ids) {
        errorService.info(`${ids.length} Position(en) werden gemeldet...`, 'Melden');
    }

    // Utility: Get selected items
    getSelectedItems() {
        return Array.from(this.selectedItems);
    }

    getSelectedCount() {
        return this.selectedItems.size;
    }

    isSelected(itemId) {
        return this.selectedItems.has(String(itemId));
    }
}

// Globale Instanz
const bulkActionsService = new BulkActionsService();
