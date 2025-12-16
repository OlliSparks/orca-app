// ORCA 2.0 - Glossar Page
// Vollständiges Glossar aller Fachbegriffe

class GlossarPage {
    constructor() {
        this.activeCategory = 'all';
        this.searchTerm = '';
    }

    render() {
        const app = document.getElementById('app');

        // Header anpassen
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Glossar & Hilfe';
        document.getElementById('headerStats').style.display = 'none';

        // Footer Actions
        document.getElementById('footerActions').innerHTML = `
            <button class="action-btn" onclick="router.navigate('/dashboard')">
                <span class="action-icon">←</span>
                Zurück zum Dashboard
            </button>
            <button class="action-btn" onclick="onboardingService.startTour()">
                <span class="action-icon">🎯</span>
                Tour starten
            </button>
        `;

        const glossary = onboardingService.getAllGlossaryTerms();
        const categories = this.getCategories(glossary);

        app.innerHTML = `
            <div class="container glossar-container">
                <div class="glossar-header">
                    <h2 class="page-title">📖 Glossar & Begriffserklärungen</h2>
                    <p class="page-subtitle">Alle wichtigen Begriffe im ORCA-System erklärt</p>
                </div>

                <!-- Suche und Filter -->
                <div class="glossar-controls">
                    <div class="glossar-search">
                        <input type="text"
                               id="glossarSearch"
                               placeholder="Begriff suchen..."
                               oninput="glossarPage.filterGlossary()"
                        />
                        <span class="search-icon">🔍</span>
                    </div>
                    <div class="glossar-categories">
                        <button class="category-btn active" data-category="all" onclick="glossarPage.setCategory('all')">
                            Alle
                        </button>
                        ${categories.map(cat => `
                            <button class="category-btn" data-category="${cat}" onclick="glossarPage.setCategory('${cat}')">
                                ${this.getCategoryIcon(cat)} ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="glossar-quicklinks">
                    <h3>Schnellzugriff</h3>
                    <div class="quicklinks-grid">
                        <div class="quicklink-card" onclick="glossarPage.scrollToTerm('Inventur')">
                            <span class="quicklink-icon">📋</span>
                            <span>Inventur verstehen</span>
                        </div>
                        <div class="quicklink-card" onclick="glossarPage.scrollToTerm('Verlagerung')">
                            <span class="quicklink-icon">🚚</span>
                            <span>Verlagerung verstehen</span>
                        </div>
                        <div class="quicklink-card" onclick="glossarPage.scrollToTerm('I0')">
                            <span class="quicklink-icon">🔢</span>
                            <span>Status-Codes</span>
                        </div>
                        <div class="quicklink-card" onclick="glossarPage.scrollToTerm('IVL')">
                            <span class="quicklink-icon">👤</span>
                            <span>Rollen erklärt</span>
                        </div>
                    </div>
                </div>

                <!-- Glossar-Liste -->
                <div class="glossar-list" id="glossarList">
                    ${this.renderGlossaryList(glossary)}
                </div>

                <!-- Zusätzliche Hilfe -->
                <div class="glossar-extra-help">
                    <h3>Brauchen Sie mehr Hilfe?</h3>
                    <div class="help-options">
                        <div class="help-option" onclick="onboardingService.startTour()">
                            <span class="help-option-icon">🎯</span>
                            <div class="help-option-content">
                                <h4>Geführte Tour</h4>
                                <p>Lassen Sie sich durch die wichtigsten Funktionen führen</p>
                            </div>
                        </div>
                        <div class="help-option" onclick="onboardingService.resetOnboarding(); onboardingService.showFirstVisitModal();">
                            <span class="help-option-icon">👋</span>
                            <div class="help-option-content">
                                <h4>Einführung wiederholen</h4>
                                <p>Die Willkommens-Tour nochmal ansehen</p>
                            </div>
                        </div>
                        <div class="help-option" onclick="router.navigate('/agenten')">
                            <span class="help-option-icon">🤖</span>
                            <div class="help-option-content">
                                <h4>KI-Agenten</h4>
                                <p>Assistenten für komplexe Aufgaben</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.activeCategory = 'all';
        this.searchTerm = '';
    }

    getCategories(glossary) {
        const cats = new Set();
        Object.values(glossary).forEach(entry => cats.add(entry.category));
        return Array.from(cats).sort();
    }

    getCategoryIcon(category) {
        const icons = {
            'Prozess': '⚙️',
            'Rolle': '👤',
            'Status': '🔢',
            'Begriff': '📝'
        };
        return icons[category] || '📌';
    }

    renderGlossaryList(glossary) {
        const filteredTerms = Object.entries(glossary)
            .filter(([term, data]) => {
                // Category filter
                if (this.activeCategory !== 'all' && data.category !== this.activeCategory) {
                    return false;
                }
                // Search filter
                if (this.searchTerm) {
                    const search = this.searchTerm.toLowerCase();
                    return term.toLowerCase().includes(search) ||
                           data.short.toLowerCase().includes(search) ||
                           data.long.toLowerCase().includes(search);
                }
                return true;
            })
            .sort((a, b) => a[0].localeCompare(b[0]));

        if (filteredTerms.length === 0) {
            return `
                <div class="glossar-empty">
                    <span class="empty-icon">🔍</span>
                    <p>Keine Begriffe gefunden</p>
                    <button class="btn-reset-filter" onclick="glossarPage.resetFilters()">Filter zurücksetzen</button>
                </div>
            `;
        }

        // Group by category
        const grouped = {};
        filteredTerms.forEach(([term, data]) => {
            if (!grouped[data.category]) {
                grouped[data.category] = [];
            }
            grouped[data.category].push([term, data]);
        });

        let html = '';
        Object.entries(grouped).forEach(([category, terms]) => {
            html += `
                <div class="glossar-category-section">
                    <h3 class="category-header">
                        ${this.getCategoryIcon(category)} ${category}
                        <span class="category-count">${terms.length} Begriffe</span>
                    </h3>
                    <div class="glossar-terms">
                        ${terms.map(([term, data]) => this.renderTerm(term, data)).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    renderTerm(term, data) {
        return `
            <div class="glossar-term" id="term-${term.replace(/\s+/g, '-')}">
                <div class="term-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <div class="term-title">
                        <span class="term-name">${term}</span>
                        <span class="term-short">${data.short}</span>
                    </div>
                    <span class="term-expand">▼</span>
                </div>
                <div class="term-content">
                    <p class="term-long">${data.long}</p>
                    <div class="term-actions">
                        <button class="btn-term-copy" onclick="glossarPage.copyTerm('${term}', '${data.short.replace(/'/g, "\\'")}')">
                            📋 Kopieren
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    filterGlossary() {
        const searchInput = document.getElementById('glossarSearch');
        this.searchTerm = searchInput.value;
        this.updateGlossaryList();
    }

    setCategory(category) {
        this.activeCategory = category;

        // Update button states
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        this.updateGlossaryList();
    }

    updateGlossaryList() {
        const glossary = onboardingService.getAllGlossaryTerms();
        document.getElementById('glossarList').innerHTML = this.renderGlossaryList(glossary);
    }

    resetFilters() {
        this.activeCategory = 'all';
        this.searchTerm = '';
        document.getElementById('glossarSearch').value = '';
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        this.updateGlossaryList();
    }

    scrollToTerm(term) {
        const element = document.getElementById(`term-${term.replace(/\s+/g, '-')}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('expanded', 'highlighted');
            setTimeout(() => element.classList.remove('highlighted'), 2000);
        }
    }

    copyTerm(term, short) {
        const text = `${term}: ${short}`;
        navigator.clipboard.writeText(text).then(() => {
            // Show brief confirmation
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Kopiert!';
            setTimeout(() => btn.innerHTML = originalText, 1500);
        });
    }
}

// Globale Instanz
const glossarPage = new GlossarPage();
