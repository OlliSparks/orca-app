// ORCA 2.0 - Verlagerung Liste (Redesign mit 2 Stufen)
class VerlagerungPage {
    constructor() {
        this.allTools = [];
        this.filteredTools = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentTab = 'beantragt';
        this.currentSort = { column: 'number', direction: 'asc' };
    }

    async render() {
        const app = document.getElementById('app');
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Verlagerung';
        const headerStats = document.getElementById('headerStats');
        if (headerStats) headerStats.style.display = 'none';

        app.innerHTML = `
            <div class="container verlagerung-page">
                <div class="info-widget-compact">
                    <h2>Verlagerungen <span class="help-icon" onclick="document.getElementById('helpTooltipVerlagerung').classList.toggle('visible')">?</span></h2>
                    <div class="help-tooltip" id="helpTooltipVerlagerung">
                        <strong>Verlagerungsprozess:</strong><br>
                        1. <strong>Beantragen:</strong> Neue Verlagerung beim OEM beantragen<br>
                        2. <strong>Durchfuehren:</strong> Genehmigte Verlagerung transportieren<br><br>
                        <strong>Hinweis:</strong> Der Vertragspartner bleibt gleich - nur der Standort wechselt.
                    </div>
                </div>

                <div class="agent-buttons-row">
                    <button class="agent-card" id="agentBeantragenBtn">
                        <div class="agent-card-icon">📋</div>
                        <div class="agent-card-content">
                            <strong>Verlagerung beantragen</strong>
                            <small>Neuen Antrag beim OEM stellen</small>
                        </div>
                        <span class="agent-card-arrow">→</span>
                    </button>
                    <button class="agent-card" id="agentDurchfuehrenBtn">
                        <div class="agent-card-icon">🚚</div>
                        <div class="agent-card-content">
                            <strong>Verlagerung durchfuehren</strong>
                            <small>Genehmigte Verlagerung abwickeln</small>
                        </div>
                        <span class="agent-card-arrow">→</span>
                    </button>
                </div>

                <div class="stats-row">
                    <div class="stat-card stat-beantragt">
                        <div class="stat-number" id="statBeantragt">0</div>
                        <div class="stat-label">Beantragt</div>
                        <div class="stat-sublabel">warten auf Genehmigung</div>
                    </div>
                    <div class="stat-card stat-genehmigt">
                        <div class="stat-number" id="statGenehmigt">0</div>
                        <div class="stat-label">Genehmigt</div>
                        <div class="stat-sublabel">bereit zur Durchfuehrung</div>
                    </div>
                    <div class="stat-card stat-transport">
                        <div class="stat-number" id="statTransport">0</div>
                        <div class="stat-label">Im Transport</div>
                        <div class="stat-sublabel">unterwegs zum Ziel</div>
                    </div>
                    <div class="stat-card stat-abgeschlossen">
                        <div class="stat-number" id="statAbgeschlossen">0</div>
                        <div class="stat-label">Abgeschlossen</div>
                        <div class="stat-sublabel">erfolgreich beendet</div>
                    </div>
                </div>

                <div class="tab-navigation">
                    <button class="tab-btn active" data-tab="beantragt">
                        <span class="tab-icon">📋</span> Beantragt
                        <span class="tab-count" id="tabCountBeantragt">0</span>
                    </button>
                    <button class="tab-btn" data-tab="durchfuehrung">
                        <span class="tab-icon">🚚</span> Zur Durchfuehrung
                        <span class="tab-count" id="tabCountDurchfuehrung">0</span>
                    </button>
                    <button class="tab-btn" data-tab="abgeschlossen">
                        <span class="tab-icon">✅</span> Abgeschlossen
                        <span class="tab-count" id="tabCountAbgeschlossen">0</span>
                    </button>
                </div>

                <div class="controls-row">
                    <input type="text" class="search-input" id="searchInput" placeholder="Suche nach Verlagerungs-Nr., Werkzeug, Standort...">
                    <button class="btn btn-neutral" onclick="verlagerungPage.exportData()">Export</button>
                </div>

                <div class="table-container">
                    <table>
                        <thead><tr id="tableHeader"></tr></thead>
                        <tbody id="tableBody"><tr><td colspan="7" style="text-align:center;padding:2rem;">Lade Daten...</td></tr></tbody>
                    </table>
                    <div class="pagination">
                        <div class="pagination-info" id="paginationInfo">Lade...</div>
                        <div class="pagination-controls">
                            <button class="page-btn" id="prevPage" onclick="verlagerungPage.prevPage()">Zurueck</button>
                            <button class="page-btn" id="nextPage" onclick="verlagerungPage.nextPage()">Weiter</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .verlagerung-page .agent-buttons-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1rem; margin-bottom:1.5rem; }
                .verlagerung-page .agent-card { display:flex; align-items:center; gap:1rem; padding:1.25rem 1.5rem; background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%); border:2px solid #bae6fd; border-radius:12px; cursor:pointer; transition:all .2s; text-align:left; }
                .verlagerung-page .agent-card:hover { border-color:#3b82f6; transform:translateY(-2px); box-shadow:0 4px 12px rgba(59,130,246,.15); }
                .verlagerung-page .agent-card-icon { font-size:2rem; flex-shrink:0; }
                .verlagerung-page .agent-card-content { flex:1; }
                .verlagerung-page .agent-card-content strong { display:block; font-size:1rem; color:#1e40af; margin-bottom:.25rem; }
                .verlagerung-page .agent-card-content small { color:#6b7280; font-size:.85rem; }
                .verlagerung-page .agent-card-arrow { font-size:1.25rem; color:#3b82f6; transition:transform .2s; }
                .verlagerung-page .agent-card:hover .agent-card-arrow { transform:translateX(4px); }
                .verlagerung-page .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin-bottom:1.5rem; }
                .verlagerung-page .stat-card { padding:1rem; border-radius:10px; text-align:center; background:#fff; border:1px solid #e5e7eb; }
                .verlagerung-page .stat-card .stat-number { font-size:2rem; font-weight:700; line-height:1; }
                .verlagerung-page .stat-card .stat-label { font-size:.9rem; font-weight:600; margin-top:.25rem; }
                .verlagerung-page .stat-card .stat-sublabel { font-size:.75rem; color:#9ca3af; margin-top:.25rem; }
                .verlagerung-page .stat-beantragt .stat-number { color:#f59e0b; }
                .verlagerung-page .stat-beantragt { border-left:4px solid #f59e0b; }
                .verlagerung-page .stat-genehmigt .stat-number { color:#3b82f6; }
                .verlagerung-page .stat-genehmigt { border-left:4px solid #3b82f6; }
                .verlagerung-page .stat-transport .stat-number { color:#8b5cf6; }
                .verlagerung-page .stat-transport { border-left:4px solid #8b5cf6; }
                .verlagerung-page .stat-abgeschlossen .stat-number { color:#22c55e; }
                .verlagerung-page .stat-abgeschlossen { border-left:4px solid #22c55e; }
                .verlagerung-page .tab-navigation { display:flex; gap:.5rem; margin-bottom:1rem; border-bottom:2px solid #e5e7eb; }
                .verlagerung-page .tab-btn { display:flex; align-items:center; gap:.5rem; padding:.75rem 1.25rem; background:none; border:none; border-bottom:3px solid transparent; margin-bottom:-2px; cursor:pointer; font-size:.95rem; color:#6b7280; transition:all .2s; }
                .verlagerung-page .tab-btn:hover { color:#374151; background:#f9fafb; }
                .verlagerung-page .tab-btn.active { color:#1e40af; border-bottom-color:#3b82f6; font-weight:600; }
                .verlagerung-page .tab-count { background:#e5e7eb; color:#374151; padding:.15rem .5rem; border-radius:10px; font-size:.8rem; font-weight:600; }
                .verlagerung-page .tab-btn.active .tab-count { background:#dbeafe; color:#1e40af; }
                .verlagerung-page .controls-row { display:flex; gap:1rem; margin-bottom:1rem; }
                .verlagerung-page .controls-row .search-input { flex:1; padding:.75rem 1rem; border:1px solid #d1d5db; border-radius:8px; }
                .verlagerung-page .action-btn-small { padding:.4rem .8rem; font-size:.8rem; border-radius:6px; cursor:pointer; border:none; }
                .verlagerung-page .action-btn-small.primary { background:#3b82f6; color:white; }
                .verlagerung-page .action-btn-small.primary:hover { background:#2563eb; }
                .verlagerung-page .action-btn-small.success { background:#22c55e; color:white; }
                .verlagerung-page .action-btn-small.success:hover { background:#16a34a; }
                [data-theme="dark"] .verlagerung-page .agent-card { background:linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%); border-color:#334155; }
                [data-theme="dark"] .verlagerung-page .agent-card-content strong { color:#93c5fd; }
                [data-theme="dark"] .verlagerung-page .stat-card { background:#1e293b; border-color:#334155; }
                [data-theme="dark"] .verlagerung-page .tab-navigation { border-bottom-color:#334155; }
                [data-theme="dark"] .verlagerung-page .tab-btn { color:#9ca3af; }
                [data-theme="dark"] .verlagerung-page .tab-btn.active { color:#93c5fd; }
                [data-theme="dark"] .verlagerung-page .tab-count { background:#334155; color:#e5e7eb; }
                [data-theme="dark"] .verlagerung-page .controls-row .search-input { background:#1e293b; border-color:#334155; color:#e5e7eb; }
            </style>
        `;
        document.getElementById('footerActions').innerHTML = '<button class="btn btn-neutral" onclick="router.navigate(\'/settings\')">Einstellungen</button>';
        await this.loadData();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const response = await api.getVerlagerungList();
            if (response.success) {
                this.allTools = response.data;
                this.applyTabFilter();
                this.updateStats();
                this.updateTableHeader();
                this.renderTable();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    attachEventListeners() {
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.currentPage = 1;
            this.applyTabFilter();
            this.renderTable();
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.dataset.tab;
                this.currentPage = 1;
                document.getElementById('searchInput').value = '';
                this.applyTabFilter();
                this.updateTableHeader();
                this.renderTable();
            });
        });

        document.getElementById('tableHeader')?.addEventListener('click', (e) => {
            const th = e.target.closest('th.sortable');
            if (th) this.sortTable(th.dataset.sort);
        });



        document.getElementById('agentBeantragenBtn')?.addEventListener('click', () => router.navigate('/agent-verlagerung-beantragen'));
        document.getElementById('agentDurchfuehrenBtn')?.addEventListener('click', () => router.navigate('/agent-verlagerung-durchfuehren'));
    }

    applyTabFilter() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        let tabFiltered;
        switch (this.currentTab) {
            case 'beantragt':
                tabFiltered = this.allTools.filter(t => t.status === 'offen' || t.status === 'beantragt' || t.status === 'feinplanung');
                break;
            case 'durchfuehrung':
                tabFiltered = this.allTools.filter(t => t.status === 'genehmigt' || t.status === 'in-inventur' || t.status === 'transport');
                break;
            case 'abgeschlossen':
                tabFiltered = this.allTools.filter(t => t.status === 'abgeschlossen');
                break;
            default:
                tabFiltered = this.allTools;
        }
        this.filteredTools = searchTerm ? tabFiltered.filter(t =>
            (t.number||'').toLowerCase().includes(searchTerm) ||
            (t.name||'').toLowerCase().includes(searchTerm) ||
            (t.sourceLocation||'').toLowerCase().includes(searchTerm) ||
            (t.targetLocation||'').toLowerCase().includes(searchTerm)
        ) : tabFiltered;
    }

    updateStats() {
        const beantragt = this.allTools.filter(t => t.status === 'offen' || t.status === 'beantragt' || t.status === 'feinplanung').length;
        const genehmigt = this.allTools.filter(t => t.status === 'genehmigt').length;
        const transport = this.allTools.filter(t => t.status === 'in-inventur' || t.status === 'transport').length;
        const abgeschlossen = this.allTools.filter(t => t.status === 'abgeschlossen').length;

        document.getElementById('statBeantragt').textContent = beantragt;
        document.getElementById('statGenehmigt').textContent = genehmigt;
        document.getElementById('statTransport').textContent = transport;
        document.getElementById('statAbgeschlossen').textContent = abgeschlossen;
        document.getElementById('tabCountBeantragt').textContent = beantragt;
        document.getElementById('tabCountDurchfuehrung').textContent = genehmigt + transport;
        document.getElementById('tabCountAbgeschlossen').textContent = abgeschlossen;
    }

    updateTableHeader() {
        const header = document.getElementById('tableHeader');
        if (this.currentTab === 'beantragt') {
            header.innerHTML = '<th class="sortable" data-sort="name">Bezeichnung</th><th class="sortable" data-sort="identifier">Werkzeug</th><th class="sortable" data-sort="sourceLocation">Von</th><th class="sortable" data-sort="targetLocation">Nach</th><th class="sortable" data-sort="createdAt">Beantragt am</th><th class="sortable" data-sort="status">Status</th><th>Aktionen</th>';
        } else if (this.currentTab === 'durchfuehrung') {
            header.innerHTML = '<th class="sortable" data-sort="name">Bezeichnung</th><th class="sortable" data-sort="identifier">Werkzeug</th><th class="sortable" data-sort="sourceLocation">Von</th><th class="sortable" data-sort="targetLocation">Nach</th><th class="sortable" data-sort="dueDate">Zieltermin</th><th class="sortable" data-sort="status">Status</th><th>Aktionen</th>';
        } else {
            header.innerHTML = '<th class="sortable" data-sort="name">Bezeichnung</th><th class="sortable" data-sort="identifier">Werkzeug</th><th class="sortable" data-sort="sourceLocation">Von</th><th class="sortable" data-sort="targetLocation">Nach</th><th class="sortable" data-sort="completedAt">Abgeschlossen</th><th>Dauer</th><th>Details</th>';
        }
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        this.filteredTools.sort((a, b) => {
            let aVal = a[column] || '', bVal = b[column] || '';
            if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
            return this.currentSort.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        this.renderTable();
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const totalPages = Math.ceil(this.filteredTools.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageTools = this.filteredTools.slice(startIdx, endIdx);

        if (pageTools.length === 0) {
            const msg = { beantragt: 'Keine beantragten Verlagerungen', durchfuehrung: 'Keine Verlagerungen zur Durchfuehrung', abgeschlossen: 'Keine abgeschlossenen Verlagerungen' }[this.currentTab];
            tableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">${this.currentTab === 'abgeschlossen' ? '✅' : '📦'}</div><div class="empty-state-text">${msg}</div>${this.currentTab === 'beantragt' ? '<button class="btn btn-primary" style="margin-top:1rem" onclick="router.navigate(\'/agent-verlagerung-beantragen\')">Verlagerung beantragen</button>' : ''}</div></td></tr>`;
        } else {
            tableBody.innerHTML = pageTools.map(t => this.renderRow(t)).join('');
        }
        document.getElementById('paginationInfo').textContent = pageTools.length > 0 ? `Zeige ${startIdx + 1}-${Math.min(endIdx, this.filteredTools.length)} von ${this.filteredTools.length}` : '0 Verlagerungen';
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    renderRow(tool) {
        const status = this.getStatusInfo(tool.status);
        const id = tool.id || tool.processKey;
        if (this.currentTab === 'beantragt') {
            return `<tr class="clickable-row" onclick="verlagerungPage.openDetail('${id}')"><td class="tool-name">${tool.name||'-'}</td><td style="font-size:.85rem">${tool.identifier||'-'}</td><td style="font-size:.85rem">${tool.sourceLocation||'-'}</td><td style="font-size:.85rem">${tool.targetLocation||'-'}</td><td style="color:#6b7280">${this.formatDate(tool.createdAt)}</td><td><span class="status-badge ${status.class}">${status.text}</span></td><td><button class="action-btn-small primary" onclick="event.stopPropagation();verlagerungPage.openDetail('${id}')">Details</button></td></tr>`;
        } else if (this.currentTab === 'durchfuehrung') {
            return `<tr class="clickable-row" onclick="verlagerungPage.openDetail('${id}')"><td class="tool-name">${tool.name||'-'}</td><td style="font-size:.85rem">${tool.identifier||'-'}</td><td style="font-size:.85rem">${tool.sourceLocation||'-'}</td><td style="font-size:.85rem">${tool.targetLocation||'-'}</td><td style="color:#6b7280">${this.formatDate(tool.dueDate)}</td><td><span class="status-badge ${status.class}">${status.text}</span></td><td><button class="action-btn-small success" onclick="event.stopPropagation();router.navigate('/agent-verlagerung-durchfuehren')">Durchfuehren</button></td></tr>`;
        } else {
            return `<tr class="clickable-row" onclick="verlagerungPage.openDetail('${id}')"><td class="tool-name">${tool.name||'-'}</td><td style="font-size:.85rem">${tool.identifier||'-'}</td><td style="font-size:.85rem">${tool.sourceLocation||'-'}</td><td style="font-size:.85rem">${tool.targetLocation||'-'}</td><td style="color:#6b7280">${this.formatDate(tool.completedAt||tool.dueDate)}</td><td style="color:#6b7280">${this.calcDuration(tool.createdAt,tool.completedAt)}</td><td><button class="action-btn-small primary" onclick="event.stopPropagation();verlagerungPage.openDetail('${id}')">Ansehen</button></td></tr>`;
        }
    }

    getStatusInfo(status) {
        const map = { offen:{class:'status-offen',text:'Offen'}, beantragt:{class:'status-feinplanung',text:'Beantragt'}, feinplanung:{class:'status-feinplanung',text:'In Pruefung'}, genehmigt:{class:'status-in-inventur',text:'Genehmigt'}, 'in-inventur':{class:'status-in-inventur',text:'Im Transport'}, transport:{class:'status-in-inventur',text:'Im Transport'}, abgeschlossen:{class:'status-abgeschlossen',text:'Abgeschlossen'} };
        return map[status] || { class:'status-offen', text:status };
    }

    calcDuration(start, end) {
        if (!start || !end) return '-';
        const days = Math.ceil((new Date(end) - new Date(start)) / 864e5);
        if (days === 1) return '1 Tag';
        if (days < 7) return days + ' Tage';
        return Math.floor(days / 7) + ' Wochen';
    }

    openDetail(id) { router.navigate('/verlagerung/' + id); }
    formatDate(d) { return d ? new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '-'; }
    prevPage() { if (this.currentPage > 1) { this.currentPage--; this.renderTable(); window.scrollTo(0,0); } }
    nextPage() { if (this.currentPage < Math.ceil(this.filteredTools.length / this.itemsPerPage)) { this.currentPage++; this.renderTable(); window.scrollTo(0,0); } }

    exportData() {
        if (!this.filteredTools.length) { alert('Keine Daten'); return; }
        const csv = [['Nr','Beschreibung','Werkzeug','Von','Nach','Status','Datum'].join(';'), ...this.filteredTools.map(t => [t.number||'',t.name||'',t.identifier||'',t.sourceLocation||'',t.targetLocation||'',t.status||'',t.dueDate||''].map(c => `"${c}"`).join(';'))].join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));
        link.download = `verlagerungen_${this.currentTab}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}

const verlagerungPage = new VerlagerungPage();
