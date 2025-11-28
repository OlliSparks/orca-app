// ORCA 2.0 - FM-Akte Suche
class FMSearchPage {
    constructor() {
        this.searchResults = [];
        this.isSearching = false;
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'FM-Akte';

        // Update Dropdown
        const dropdown = document.getElementById('navDropdown');
        if (dropdown) {
            dropdown.value = '/fm-akte';
        }

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        app.innerHTML = `
            <div class="container">
                <div class="search-widget">
                    <h2>FM-Akte suchen</h2>
                    <p class="search-description">
                        Geben Sie eine Inventarnummer oder einen Suchbegriff ein, um eine FM-Akte zu finden.
                    </p>

                    <div class="search-form">
                        <div class="search-input-group">
                            <input type="text" id="fmSearchInput" class="search-input-large"
                                   placeholder="Inventarnummer (z.B. 0010014507) oder Suchbegriff..."
                                   autocomplete="off">
                            <button class="search-btn-large" id="searchBtn">
                                🔍 Suchen
                            </button>
                        </div>
                        <div class="search-hint">
                            Tipp: Bei Inventarnummern wird automatisch "A1-" vorangestellt
                        </div>
                    </div>
                </div>

                <div id="searchResults" class="search-results" style="display: none;">
                    <h3>Suchergebnisse</h3>
                    <div id="resultsContainer"></div>
                </div>

                <div id="searchLoading" class="search-loading" style="display: none;">
                    <div class="loading-spinner">⏳</div>
                    <p>Suche läuft...</p>
                </div>

                <div id="noResults" class="no-results" style="display: none;">
                    <div class="no-results-icon">🔍</div>
                    <p>Keine Ergebnisse gefunden</p>
                    <p class="no-results-hint">Versuchen Sie einen anderen Suchbegriff</p>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = '';

        this.attachEventListeners();
    }

    attachEventListeners() {
        const searchInput = document.getElementById('fmSearchInput');
        const searchBtn = document.getElementById('searchBtn');

        // Suche bei Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Suche bei Button-Klick
        searchBtn.addEventListener('click', () => this.performSearch());

        // Fokus auf Input setzen
        searchInput.focus();
    }

    async performSearch() {
        const searchInput = document.getElementById('fmSearchInput');
        const query = searchInput.value.trim();

        if (!query) {
            alert('Bitte geben Sie einen Suchbegriff ein.');
            return;
        }

        // UI aktualisieren
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('noResults').style.display = 'none';
        document.getElementById('searchLoading').style.display = 'block';

        try {
            // Prüfen ob es eine reine Nummer ist -> direkt FM-Akte laden
            if (/^\d+$/.test(query)) {
                // Inventarnummer - direkt zur Detail-Seite
                const assetKey = `A1-${query}`;
                const response = await api.getFMDetail(assetKey);

                document.getElementById('searchLoading').style.display = 'none';

                if (response.success && response.data) {
                    // Direkt zur Detail-Seite navigieren
                    router.navigate(`/detail/${assetKey}`);
                    return;
                } else {
                    // Nicht gefunden - Suche in Liste
                    await this.searchInList(query);
                }
            } else {
                // Textsuche in der Liste
                await this.searchInList(query);
            }
        } catch (error) {
            console.error('Search error:', error);
            document.getElementById('searchLoading').style.display = 'none';
            document.getElementById('noResults').style.display = 'block';
        }
    }

    async searchInList(query) {
        try {
            // Suche über asset-list mit query
            const response = await api.getFMList({ query: query });

            document.getElementById('searchLoading').style.display = 'none';

            if (response.success && response.data && response.data.length > 0) {
                this.searchResults = response.data;
                this.renderResults();
            } else {
                document.getElementById('noResults').style.display = 'block';
            }
        } catch (error) {
            console.error('List search error:', error);
            document.getElementById('searchLoading').style.display = 'none';
            document.getElementById('noResults').style.display = 'block';
        }
    }

    renderResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        const searchResults = document.getElementById('searchResults');

        resultsContainer.innerHTML = this.searchResults.map(tool => `
            <div class="result-card" onclick="router.navigate('/detail/${tool.id}')">
                <div class="result-header">
                    <span class="result-number">${tool.toolNumber || tool.number}</span>
                    <span class="result-status">${tool.status}</span>
                </div>
                <div class="result-name">${tool.name || 'Unbekannt'}</div>
                <div class="result-details">
                    <span>📍 ${tool.location}</span>
                    <span>🏢 ${tool.supplier}</span>
                </div>
            </div>
        `).join('');

        searchResults.style.display = 'block';
    }
}

// Create global instance
const fmSearchPage = new FMSearchPage();
