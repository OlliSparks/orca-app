// ORCA 2.0 - Global Search Service
// Echte Suche über alle Module und geladene Daten

class SearchService {
    constructor() {
        this.isOpen = false;
        this.searchIndex = [];
        this.recentSearches = this.loadRecentSearches();
        this.selectedIndex = 0;
        this.debounceTimer = null;
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            if (!document.body) return;
            this.createSearchModal();

            // Global keyboard shortcut (Ctrl+K or /)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !this.isInputFocused())) {
                    e.preventDefault();
                    this.open();
                }
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        } catch (e) {
            console.warn('[Search] Init error:', e);
        }
    }

    isInputFocused() {
        const active = document.activeElement;
        if (!active) return false;
        return ['input', 'textarea', 'select'].includes(active.tagName.toLowerCase());
    }

    createSearchModal() {
        const modal = document.createElement('div');
        modal.id = 'globalSearchModal';
        modal.className = 'global-search-modal';
        modal.innerHTML = `
            <div class="search-modal-backdrop" onclick="searchService.close()"></div>
            <div class="search-modal-container">
                <div class="search-input-wrapper">
                    <span class="search-input-icon">&#128269;</span>
                    <input type="text"
                           id="globalSearchInput"
                           class="search-input"
                           placeholder="Suche nach Werkzeugen, Inventurnummern, Standorten..."
                           autocomplete="off"
                    />
                    <div class="search-loading" id="searchLoading" style="display: none;">
                        <div class="search-spinner"></div>
                    </div>
                    <kbd class="search-shortcut">ESC</kbd>
                </div>
                <div class="search-results" id="searchResults">
                    <div class="search-initial" id="searchInitial">
                        <div class="search-recent" id="searchRecent"></div>
                        <div class="search-quick-links">
                            <h4>Schnellzugriff</h4>
                            <div class="quick-links-grid">
                                <button class="quick-link" onclick="searchService.goTo('/inventur')">
                                    <span class="quick-link-icon">&#128269;</span>
                                    <span>Inventur</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/verlagerung')">
                                    <span class="quick-link-icon">&#128666;</span>
                                    <span>Verlagerung</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/abl')">
                                    <span class="quick-link-icon">&#128230;</span>
                                    <span>ABL</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/agenten')">
                                    <span class="quick-link-icon">&#129302;</span>
                                    <span>Agenten</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="search-footer">
                    <span><kbd>&#8593;</kbd><kbd>&#8595;</kbd> Navigieren</span>
                    <span><kbd>Enter</kbd> Oeffnen</span>
                    <span><kbd>ESC</kbd> Schliessen</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners after DOM append
        setTimeout(() => {
            const input = document.getElementById('globalSearchInput');
            if (input) {
                input.addEventListener('input', (e) => this.handleInput(e.target.value));
                input.addEventListener('keydown', (e) => this.handleKeydown(e));
            }
        }, 0);
    }

    open() {
        const modal = document.getElementById('globalSearchModal');
        if (!modal) return;

        this.isOpen = true;
        modal.classList.add('active');

        const input = document.getElementById('globalSearchInput');
        input.value = '';
        input.focus();

        // Build search index from loaded page data
        this.buildSearchIndex();
        this.showInitialView();

        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('globalSearchModal');
        if (!modal) return;

        this.isOpen = false;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Sammelt alle geladenen Daten aus den Page-Instanzen
    buildSearchIndex() {
        this.searchIndex = [];

        // 1. Seiten-Navigation
        const pages = [
            { type: 'page', title: 'Dashboard', path: '/dashboard', icon: '&#127968;', keywords: ['start', 'uebersicht', 'home'] },
            { type: 'page', title: 'Inventur', path: '/inventur', icon: '&#128269;', keywords: ['werkzeuge', 'zaehlung', 'bestand'] },
            { type: 'page', title: 'Verlagerung', path: '/verlagerung', icon: '&#128666;', keywords: ['umzug', 'transport'] },
            { type: 'page', title: 'Partnerwechsel', path: '/partnerwechsel', icon: '&#128260;', keywords: ['vpw', 'wechsel'] },
            { type: 'page', title: 'Verschrottung', path: '/verschrottung', icon: '&#9851;', keywords: ['entsorgung'] },
            { type: 'page', title: 'ABL', path: '/abl', icon: '&#128230;', keywords: ['abnahme', 'bereitschaft'] },
            { type: 'page', title: 'FM-Akte Suche', path: '/fm-akte', icon: '&#128194;', keywords: ['fertigungsmittel'] },
            { type: 'page', title: 'Unternehmen', path: '/unternehmen', icon: '&#127970;', keywords: ['firmen', 'standorte'] },
            { type: 'page', title: 'Nachrichten', path: '/messages', icon: '&#128236;', keywords: ['inbox', 'postfach'] },
            { type: 'page', title: 'KPI Dashboard', path: '/kpi', icon: '&#128202;', keywords: ['statistik'] },
            { type: 'page', title: 'Agenten', path: '/agenten', icon: '&#129302;', keywords: ['ki', 'assistent'] },
            { type: 'page', title: 'Einstellungen', path: '/settings', icon: '&#9881;', keywords: ['config', 'api'] },
            { type: 'page', title: 'Glossar', path: '/glossar', icon: '&#128214;', keywords: ['hilfe', 'begriffe'] }
        ];
        this.searchIndex.push(...pages);

        // 2. Inventur-Werkzeuge (aus inventurPage)
        if (typeof inventurPage !== 'undefined' && inventurPage.allTools) {
            const tools = inventurPage.allTools.map(tool => ({
                type: 'inventur',
                title: tool.name || tool.toolName || tool.identifier || 'Unbekanntes Werkzeug',
                subtitle: (tool.inventoryNumber || tool.identifier || '') + ' - ' + (tool.location || tool.currentLocation || 'Kein Standort'),
                path: '/inventur?tool=' + (tool.inventoryNumber || tool.identifier || tool.id),
                icon: '&#128295;',
                keywords: [
                    tool.inventoryNumber,
                    tool.identifier,
                    tool.toolNumber,
                    tool.name,
                    tool.toolName,
                    tool.location,
                    tool.currentLocation,
                    tool.responsible,
                    tool.supplier
                ].filter(Boolean),
                data: tool
            }));
            this.searchIndex.push(...tools);
        }

        // 3. Verlagerungen (aus verlagerungPage)
        if (typeof verlagerungPage !== 'undefined' && verlagerungPage.allTools) {
            const relocations = verlagerungPage.allTools.map(item => ({
                type: 'verlagerung',
                title: item.name || item.toolName || item.identifier || 'Verlagerung',
                subtitle: (item.sourceLocation || '?') + ' nach ' + (item.targetLocation || '?') + ' - ' + (item.status || ''),
                path: '/verlagerung-detail/' + (item.id || item.processKey),
                icon: '&#128666;',
                keywords: [
                    item.identifier,
                    item.toolNumber,
                    item.sourceLocation,
                    item.targetLocation,
                    item.status
                ].filter(Boolean),
                data: item
            }));
            this.searchIndex.push(...relocations);
        }

        // 4. ABL-Positionen (aus ablPage)
        if (typeof ablPage !== 'undefined' && ablPage.allABL) {
            const ablItems = ablPage.allABL.map(item => ({
                type: 'abl',
                title: item.name || item.bezeichnung || item.identifier || 'ABL Position',
                subtitle: (item.bestellPosition || '') + ' - ' + (item.status || ''),
                path: '/abl-detail/' + (item.id || item.key),
                icon: '&#128230;',
                keywords: [
                    item.identifier,
                    item.bestellPosition,
                    item.name,
                    item.bezeichnung
                ].filter(Boolean),
                data: item
            }));
            this.searchIndex.push(...ablItems);
        }

        // 5. Verschrottungen (aus verschrottungPage)
        if (typeof verschrottungPage !== 'undefined' && verschrottungPage.allItems) {
            const scrapItems = verschrottungPage.allItems.map(item => ({
                type: 'verschrottung',
                title: item.title || item.name || 'Verschrottung',
                subtitle: (item.partNumber || '') + ' - ' + (item.status || ''),
                path: '/verschrottung-detail/' + item.id,
                icon: '&#9851;',
                keywords: [
                    item.title,
                    item.name,
                    item.partNumber,
                    item.contractor
                ].filter(Boolean),
                data: item
            }));
            this.searchIndex.push(...scrapItems);
        }

        // 6. Partnerwechsel (aus partnerwechselPage)
        if (typeof partnerwechselPage !== 'undefined' && partnerwechselPage.allProcesses) {
            const vpwItems = partnerwechselPage.allProcesses.map(item => ({
                type: 'vpw',
                title: item.title || item.toolName || 'Partnerwechsel',
                subtitle: (item.fromPartner || '?') + ' zu ' + (item.toPartner || '?'),
                path: '/partnerwechsel-detail/' + (item.id || item.processKey),
                icon: '&#128260;',
                keywords: [
                    item.title,
                    item.toolName,
                    item.fromPartner,
                    item.toPartner
                ].filter(Boolean),
                data: item
            }));
            this.searchIndex.push(...vpwItems);
        }

        console.log('[Search] Index built with ' + this.searchIndex.length + ' items');
    }

    handleInput(query) {
        // Debounce
        clearTimeout(this.debounceTimer);

        if (!query || query.length < 2) {
            this.showInitialView();
            return;
        }

        // Show loading for API search
        const loadingEl = document.getElementById('searchLoading');
        if (loadingEl) loadingEl.style.display = 'block';

        this.debounceTimer = setTimeout(async () => {
            // First search local index
            let results = this.searchLocal(query);

            // If few results, try API search
            if (results.length < 5) {
                const apiResults = await this.searchAPI(query);
                // Merge without duplicates
                const existingPaths = new Set(results.map(r => r.path));
                apiResults.forEach(r => {
                    if (!existingPaths.has(r.path)) {
                        results.push(r);
                    }
                });
            }

            if (loadingEl) loadingEl.style.display = 'none';
            this.renderResults(results, query);
        }, 150);
    }

    searchLocal(query) {
        const q = query.toLowerCase().trim();
        const words = q.split(/\s+/);

        const scored = this.searchIndex.map(item => {
            let score = 0;
            const titleLower = (item.title || '').toLowerCase();
            const subtitleLower = (item.subtitle || '').toLowerCase();

            // Exakte Uebereinstimmung
            if (titleLower === q) score += 100;
            else if (titleLower.startsWith(q)) score += 60;
            else if (titleLower.includes(q)) score += 40;

            // Subtitle Match
            if (subtitleLower.includes(q)) score += 25;

            // Keyword Match
            if (item.keywords) {
                for (const kw of item.keywords) {
                    const kwLower = (kw || '').toLowerCase();
                    if (kwLower === q) score += 50;
                    else if (kwLower.includes(q)) score += 20;
                }
            }

            // Wort-fuer-Wort Match
            for (const word of words) {
                if (word.length < 2) continue;
                if (titleLower.includes(word)) score += 15;
                if (subtitleLower.includes(word)) score += 10;
                if (item.keywords && item.keywords.some(kw => (kw || '').toLowerCase().includes(word))) score += 8;
            }

            // Typ-Prioritaet
            const typePriority = { 'inventur': 10, 'verlagerung': 8, 'abl': 6, 'page': 5, 'verschrottung': 4, 'vpw': 4 };
            score += typePriority[item.type] || 0;

            return { ...item, score: score };
        });

        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
    }

    async searchAPI(query) {
        try {
            if (typeof api === 'undefined') return [];

            const results = [];

            // Versuche Inventory-Positionen zu durchsuchen
            if (api.getInventoryList) {
                const inventories = await api.getInventoryList();
                if (inventories && inventories.length > 0) {
                    for (const inv of inventories.slice(0, 3)) {
                        if (api.getInventoryPositions) {
                            const positions = await api.getInventoryPositions(inv.inventoryKey || inv.key);
                            if (positions && positions.length > 0) {
                                const q = query.toLowerCase();
                                const matches = positions.filter(p => {
                                    const searchStr = [
                                        p.identifier,
                                        p.toolName,
                                        p.name,
                                        p.location,
                                        p.inventoryNumber
                                    ].filter(Boolean).join(' ').toLowerCase();
                                    return searchStr.includes(q);
                                }).slice(0, 5);

                                matches.forEach(p => {
                                    results.push({
                                        type: 'api-inventur',
                                        title: p.toolName || p.name || p.identifier || 'Werkzeug',
                                        subtitle: (p.identifier || '') + ' - ' + (p.location || 'Unbekannt'),
                                        path: '/inventur?tool=' + p.identifier,
                                        icon: '&#128295;',
                                        keywords: []
                                    });
                                });
                            }
                        }
                    }
                }
            }

            return results;
        } catch (e) {
            console.warn('[Search] API search failed:', e);
            return [];
        }
    }

    showInitialView() {
        const results = document.getElementById('searchResults');
        const initial = document.getElementById('searchInitial');

        this.showRecentSearches();

        if (initial && results) {
            results.innerHTML = '';
            results.appendChild(initial.cloneNode(true));
        }
    }

    renderResults(results, query) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML =
                '<div class="search-no-results">' +
                    '<div class="no-results-icon">&#128269;</div>' +
                    '<p>Keine Ergebnisse fuer "<strong>' + this.escapeHtml(query) + '</strong>"</p>' +
                    '<span>Versuchen Sie andere Suchbegriffe oder oeffnen Sie eine Seite</span>' +
                '</div>';
            return;
        }

        // Nach Typ gruppieren
        const grouped = {};
        results.forEach(item => {
            const type = item.type;
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(item);
        });

        const typeLabels = {
            'page': 'Seiten',
            'inventur': 'Inventur-Werkzeuge',
            'verlagerung': 'Verlagerungen',
            'abl': 'ABL-Positionen',
            'verschrottung': 'Verschrottungen',
            'vpw': 'Partnerwechsel',
            'api-inventur': 'Weitere Werkzeuge (API)'
        };

        const typeOrder = ['inventur', 'verlagerung', 'abl', 'verschrottung', 'vpw', 'api-inventur', 'page'];

        let html = '<div class="search-results-list">';
        let itemIndex = 0;

        for (let i = 0; i < typeOrder.length; i++) {
            const type = typeOrder[i];
            if (!grouped[type]) continue;
            const items = grouped[type];

            html += '<div class="search-results-group">';
            html += '<h4 class="search-group-title">' + (typeLabels[type] || type) + '</h4>';

            for (let j = 0; j < items.length; j++) {
                const item = items[j];
                const idx = itemIndex++;
                html += '<button class="search-result-item' + (idx === 0 ? ' selected' : '') + '"' +
                        ' data-path="' + item.path + '"' +
                        ' data-index="' + idx + '"' +
                        ' data-title="' + this.escapeHtml(item.title) + '">' +
                    '<span class="result-icon">' + item.icon + '</span>' +
                    '<div class="result-content">' +
                        '<span class="result-title">' + this.highlight(item.title, query) + '</span>' +
                        (item.subtitle ? '<span class="result-subtitle">' + this.highlight(item.subtitle, query) + '</span>' : '') +
                    '</div>' +
                    '<span class="result-type-badge">' + ((typeLabels[type] || type).split(' ')[0]) + '</span>' +
                '</button>';
            }

            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;

        // Add click handlers
        const buttons = container.querySelectorAll('.search-result-item');
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            btn.addEventListener('click', () => {
                this.selectResult(btn.dataset.path, btn.dataset.title);
            });
        }

        this.selectedIndex = 0;
    }

    highlight(text, query) {
        if (!text || !query) return text || '';
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&#39;');
    }

    showRecentSearches() {
        const container = document.getElementById('searchRecent');
        if (!container) return;

        if (this.recentSearches.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '<h4>Zuletzt gesucht</h4><div class="recent-searches">';

        const items = this.recentSearches.slice(0, 5);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            html += '<button class="recent-search-item" data-path="' + item.path + '">' +
                '<span class="recent-icon">' + (item.icon || '&#128196;') + '</span>' +
                '<span>' + item.title + '</span>' +
            '</button>';
        }

        html += '</div>';
        container.innerHTML = html;

        // Add click handlers
        const buttons = container.querySelectorAll('.recent-search-item');
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            btn.addEventListener('click', () => {
                this.goTo(btn.dataset.path);
            });
        }
    }

    handleKeydown(event) {
        const results = document.querySelectorAll('.search-result-item');
        if (results.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
                this.updateSelection(results);
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection(results);
                break;

            case 'Enter':
                event.preventDefault();
                const selected = results[this.selectedIndex];
                if (selected) {
                    this.selectResult(selected.dataset.path, selected.dataset.title);
                }
                break;
        }
    }

    updateSelection(results) {
        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            if (i === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        }
    }

    selectResult(path, title) {
        // Save to recent
        let icon = '&#128196;';
        if (path.indexOf('inventur') >= 0) icon = '&#128295;';
        else if (path.indexOf('verlagerung') >= 0) icon = '&#128666;';
        else if (path.indexOf('abl') >= 0) icon = '&#128230;';

        this.addToRecent({ path: path, title: title, icon: icon });

        this.close();
        router.navigate(path);
    }

    goTo(path) {
        this.close();
        router.navigate(path);
    }

    addToRecent(item) {
        this.recentSearches = this.recentSearches.filter(r => r.path !== item.path);
        this.recentSearches.unshift(item);
        this.recentSearches = this.recentSearches.slice(0, 10);
        this.saveRecentSearches();
    }

    loadRecentSearches() {
        try {
            return JSON.parse(localStorage.getItem('orca_recent_searches') || '[]');
        } catch (e) {
            return [];
        }
    }

    saveRecentSearches() {
        localStorage.setItem('orca_recent_searches', JSON.stringify(this.recentSearches));
    }
}

// Globale Instanz
const searchService = new SearchService();
