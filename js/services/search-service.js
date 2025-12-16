// ORCA 2.0 - Global Search Service
// Suche über alle Module hinweg

class SearchService {
    constructor() {
        this.isOpen = false;
        this.searchIndex = [];
        this.recentSearches = this.loadRecentSearches();
        this.init();
    }

    init() {
        // Create search modal structure
        this.createSearchModal();

        // Register global keyboard shortcut (Ctrl+K or /)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !this.isInputFocused())) {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    isInputFocused() {
        const active = document.activeElement;
        if (!active) return false;
        const tagName = active.tagName.toLowerCase();
        return ['input', 'textarea', 'select'].includes(tagName);
    }

    createSearchModal() {
        const modal = document.createElement('div');
        modal.id = 'globalSearchModal';
        modal.className = 'global-search-modal';
        modal.innerHTML = `
            <div class="search-modal-backdrop" onclick="searchService.close()"></div>
            <div class="search-modal-container">
                <div class="search-input-wrapper">
                    <span class="search-input-icon">🔍</span>
                    <input type="text"
                           id="globalSearchInput"
                           class="search-input"
                           placeholder="Suche nach Werkzeugen, Prozessen, Unternehmen..."
                           autocomplete="off"
                           oninput="searchService.handleInput(this.value)"
                           onkeydown="searchService.handleKeydown(event)"
                    />
                    <kbd class="search-shortcut">ESC</kbd>
                </div>
                <div class="search-results" id="searchResults">
                    <div class="search-initial">
                        <div class="search-recent" id="searchRecent"></div>
                        <div class="search-quick-links">
                            <h4>Schnellzugriff</h4>
                            <div class="quick-links-grid">
                                <button class="quick-link" onclick="searchService.goTo('/inventur')">
                                    <span class="quick-link-icon">🔍</span>
                                    <span>Inventur</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/verlagerung')">
                                    <span class="quick-link-icon">🚚</span>
                                    <span>Verlagerung</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/agenten')">
                                    <span class="quick-link-icon">🤖</span>
                                    <span>Agenten</span>
                                </button>
                                <button class="quick-link" onclick="searchService.goTo('/settings')">
                                    <span class="quick-link-icon">⚙️</span>
                                    <span>Einstellungen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="search-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> Navigieren</span>
                    <span><kbd>Enter</kbd> Öffnen</span>
                    <span><kbd>ESC</kbd> Schließen</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    open() {
        const modal = document.getElementById('globalSearchModal');
        if (!modal) return;

        this.isOpen = true;
        modal.classList.add('active');

        // Focus input
        const input = document.getElementById('globalSearchInput');
        input.value = '';
        input.focus();

        // Build search index
        this.buildSearchIndex();

        // Show recent searches
        this.showRecentSearches();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('globalSearchModal');
        if (!modal) return;

        this.isOpen = false;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async buildSearchIndex() {
        this.searchIndex = [];

        // Pages/Navigation
        const pages = [
            { type: 'page', title: 'Dashboard', path: '/dashboard', icon: '🏠', keywords: ['start', 'übersicht', 'home'] },
            { type: 'page', title: 'Inventur', path: '/inventur', icon: '🔍', keywords: ['werkzeuge', 'zählung', 'bestand'] },
            { type: 'page', title: 'Verlagerung', path: '/verlagerung', icon: '🚚', keywords: ['umzug', 'transport', 'standort'] },
            { type: 'page', title: 'Partnerwechsel (VPW)', path: '/partnerwechsel', icon: '🔄', keywords: ['vertragspartner', 'wechsel', 'übergabe'] },
            { type: 'page', title: 'Verschrottung', path: '/verschrottung', icon: '♻️', keywords: ['entsorgung', 'ausmusterung'] },
            { type: 'page', title: 'ABL (Abnahmebereitschaft)', path: '/abl', icon: '📦', keywords: ['abnahme', 'bereit', 'lieferung'] },
            { type: 'page', title: 'Werkzeugübersicht', path: '/tools', icon: '🔧', keywords: ['liste', 'alle', 'übersicht'] },
            { type: 'page', title: 'FM-Akte Suche', path: '/fm-akte', icon: '📂', keywords: ['fertigungsmittel', 'akte', 'suche'] },
            { type: 'page', title: 'Unternehmen', path: '/unternehmen', icon: '🏢', keywords: ['firmen', 'lieferanten', 'standorte'] },
            { type: 'page', title: 'Nachrichten', path: '/messages', icon: '📬', keywords: ['inbox', 'postfach', 'mitteilungen'] },
            { type: 'page', title: 'KPI Dashboard', path: '/kpi', icon: '📊', keywords: ['kennzahlen', 'statistik', 'auswertung'] },
            { type: 'page', title: 'Agenten', path: '/agenten', icon: '🤖', keywords: ['ki', 'assistent', 'automation'] },
            { type: 'page', title: 'Einstellungen', path: '/settings', icon: '⚙️', keywords: ['config', 'api', 'token'] },
            { type: 'page', title: 'Glossar & Hilfe', path: '/glossar', icon: '📖', keywords: ['begriffe', 'erklärung', 'faq'] }
        ];
        this.searchIndex.push(...pages);

        // Agents
        const agents = [
            { type: 'agent', title: 'Inventur-Agent', path: '/agent-inventur', icon: '🤖', keywords: ['inventur', 'automatisch'] },
            { type: 'agent', title: 'ABL-Agent', path: '/agent-abl', icon: '🤖', keywords: ['abnahme', 'bereitschaft'] },
            { type: 'agent', title: 'Reporting-Agent', path: '/agent-reporting', icon: '🤖', keywords: ['bericht', 'export', 'statistik'] },
            { type: 'agent', title: 'Verlagerung beantragen', path: '/agent-verlagerung-beantragen', icon: '📝', keywords: ['antrag', 'neu'] },
            { type: 'agent', title: 'Verlagerung durchführen', path: '/agent-verlagerung-durchfuehren', icon: '🚚', keywords: ['ausführen', 'durchführung'] }
        ];
        this.searchIndex.push(...agents);

        // Actions
        const actions = [
            { type: 'action', title: 'Neue Inventur starten', path: '/inventur', icon: '➕', keywords: ['anlegen', 'erstellen', 'neu'] },
            { type: 'action', title: 'Verlagerung beantragen', path: '/agent-verlagerung-beantragen', icon: '📝', keywords: ['antrag', 'verschieben'] },
            { type: 'action', title: 'Excel exportieren', path: '/agent-reporting', icon: '📥', keywords: ['download', 'export', 'xlsx'] },
            { type: 'action', title: 'API-Verbindung prüfen', path: '/settings', icon: '🔌', keywords: ['test', 'connection', 'status'] }
        ];
        this.searchIndex.push(...actions);

        // Try to add assets from API if available
        try {
            if (typeof api !== 'undefined' && api.getTools) {
                const tools = await api.getTools();
                const assetResults = tools.slice(0, 50).map(tool => ({
                    type: 'asset',
                    title: tool.name || tool.toolNumber || `FM-${tool.id}`,
                    subtitle: `${tool.inventoryNumber || tool.toolNumber || ''} • ${tool.supplier || 'Unbekannt'}`,
                    path: `/detail/${tool.id}`,
                    icon: '🔧',
                    keywords: [tool.inventoryNumber, tool.toolNumber, tool.name, tool.supplier].filter(Boolean)
                }));
                this.searchIndex.push(...assetResults);
            }
        } catch (e) {
            console.warn('Could not load assets for search:', e);
        }
    }

    handleInput(query) {
        if (!query || query.length < 2) {
            this.showRecentSearches();
            return;
        }

        const results = this.search(query);
        this.renderResults(results, query);
    }

    search(query) {
        const q = query.toLowerCase().trim();
        const words = q.split(/\s+/);

        const scored = this.searchIndex.map(item => {
            let score = 0;

            // Title match
            const titleLower = item.title.toLowerCase();
            if (titleLower === q) score += 100;
            else if (titleLower.startsWith(q)) score += 50;
            else if (titleLower.includes(q)) score += 30;

            // Subtitle match
            if (item.subtitle) {
                const subtitleLower = item.subtitle.toLowerCase();
                if (subtitleLower.includes(q)) score += 20;
            }

            // Keyword match
            if (item.keywords) {
                for (const kw of item.keywords) {
                    if (kw.toLowerCase().includes(q)) score += 15;
                }
            }

            // Word-by-word match
            for (const word of words) {
                if (titleLower.includes(word)) score += 10;
                if (item.keywords?.some(kw => kw.toLowerCase().includes(word))) score += 5;
            }

            // Type priority
            if (item.type === 'page') score += 5;
            if (item.type === 'action') score += 3;

            return { ...item, score };
        });

        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    renderResults(results, query) {
        const container = document.getElementById('searchResults');

        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>Keine Ergebnisse für "${query}"</p>
                    <span>Versuchen Sie andere Suchbegriffe</span>
                </div>
            `;
            return;
        }

        // Group by type
        const grouped = {};
        results.forEach(item => {
            if (!grouped[item.type]) grouped[item.type] = [];
            grouped[item.type].push(item);
        });

        const typeLabels = {
            'page': 'Seiten',
            'agent': 'Agenten',
            'action': 'Aktionen',
            'asset': 'Werkzeuge'
        };

        let html = '<div class="search-results-list">';

        for (const [type, items] of Object.entries(grouped)) {
            html += `
                <div class="search-results-group">
                    <h4 class="search-group-title">${typeLabels[type] || type}</h4>
                    ${items.map((item, idx) => `
                        <button class="search-result-item"
                                data-path="${item.path}"
                                onclick="searchService.selectResult('${item.path}', '${item.title.replace(/'/g, "\\'")}')">
                            <span class="result-icon">${item.icon}</span>
                            <div class="result-content">
                                <span class="result-title">${this.highlight(item.title, query)}</span>
                                ${item.subtitle ? `<span class="result-subtitle">${this.highlight(item.subtitle, query)}</span>` : ''}
                            </div>
                            <kbd class="result-type">${typeLabels[type]?.slice(0, -1) || type}</kbd>
                        </button>
                    `).join('')}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // Select first result
        this.selectedIndex = 0;
        this.updateSelection();
    }

    highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    showRecentSearches() {
        const container = document.getElementById('searchRecent');
        if (!container) return;

        if (this.recentSearches.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <h4>Zuletzt gesucht</h4>
            <div class="recent-searches">
                ${this.recentSearches.slice(0, 5).map(item => `
                    <button class="recent-search-item" onclick="searchService.goTo('${item.path}')">
                        <span class="recent-icon">${item.icon}</span>
                        <span>${item.title}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Reset to initial view
        document.getElementById('searchResults').innerHTML = document.querySelector('.search-initial').outerHTML;
    }

    handleKeydown(event) {
        const results = document.querySelectorAll('.search-result-item');

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min((this.selectedIndex || 0) + 1, results.length - 1);
                this.updateSelection();
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max((this.selectedIndex || 0) - 1, 0);
                this.updateSelection();
                break;

            case 'Enter':
                event.preventDefault();
                const selected = results[this.selectedIndex || 0];
                if (selected) {
                    const path = selected.dataset.path;
                    const title = selected.querySelector('.result-title')?.textContent;
                    this.selectResult(path, title);
                }
                break;
        }
    }

    updateSelection() {
        const results = document.querySelectorAll('.search-result-item');
        results.forEach((item, idx) => {
            item.classList.toggle('selected', idx === this.selectedIndex);
            if (idx === this.selectedIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    selectResult(path, title) {
        // Save to recent
        this.addToRecent({ path, title, icon: '📄' });

        // Navigate
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
        } catch {
            return [];
        }
    }

    saveRecentSearches() {
        localStorage.setItem('orca_recent_searches', JSON.stringify(this.recentSearches));
    }
}

// Globale Instanz
const searchService = new SearchService();
