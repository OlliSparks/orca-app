// ORCA 2.0 - Breadcrumb Service
// Navigation-Pfad für bessere Orientierung

class BreadcrumbService {
    constructor() {
        this.routes = this.defineRoutes();
        this.container = null;
    }

    // Route-Definitionen mit Parent-Beziehungen
    defineRoutes() {
        return {
            '/': { label: 'Dashboard', icon: '🏠', parent: null },
            '/dashboard': { label: 'Dashboard', icon: '🏠', parent: null },
            '/tools': { label: 'Werkzeugübersicht', icon: '🔧', parent: '/dashboard' },
            '/fm-akte': { label: 'FM-Akte', icon: '📂', parent: '/dashboard' },
            '/detail': { label: 'Werkzeugakte', icon: '📋', parent: '/tools', dynamic: true },
            '/inventur': { label: 'Inventur', icon: '🔍', parent: '/dashboard' },
            '/planung': { label: 'Planung', icon: '📅', parent: '/dashboard' },
            '/abl': { label: 'ABL', icon: '📦', parent: '/dashboard' },
            '/abl-detail': { label: 'ABL Details', icon: '📄', parent: '/abl', dynamic: true },
            '/verlagerung': { label: 'Verlagerung', icon: '🚚', parent: '/dashboard' },
            '/verlagerung-detail': { label: 'Verlagerungs-Details', icon: '📄', parent: '/verlagerung', dynamic: true },
            '/partnerwechsel': { label: 'Partnerwechsel', icon: '🔄', parent: '/dashboard' },
            '/partnerwechsel-detail': { label: 'Partnerwechsel-Details', icon: '📄', parent: '/partnerwechsel', dynamic: true },
            '/verschrottung': { label: 'Verschrottung', icon: '♻️', parent: '/dashboard' },
            '/verschrottung-detail': { label: 'Verschrottungs-Details', icon: '📄', parent: '/verschrottung', dynamic: true },
            '/unternehmen': { label: 'Unternehmen', icon: '🏢', parent: '/dashboard' },
            '/messages': { label: 'Nachrichten', icon: '📬', parent: '/dashboard' },
            '/kpi': { label: 'KPI Dashboard', icon: '📊', parent: '/dashboard' },
            '/agenten': { label: 'Agenten', icon: '🤖', parent: '/dashboard' },
            '/agent-inventur': { label: 'Inventur-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-abl': { label: 'ABL-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-reporting': { label: 'Reporting-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-verschrottung': { label: 'Verschrottungs-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-inventurplanung': { label: 'Planungs-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-verlagerung': { label: 'Verlagerungs-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-vpw': { label: 'VPW-Agent', icon: '🤖', parent: '/agenten' },
            '/agent-api-setup': { label: 'API-Setup', icon: '🔌', parent: '/agenten' },
            '/agent-api-monitor': { label: 'API-Monitor', icon: '📡', parent: '/agenten' },
            '/agent-verlagerung-beantragen': { label: 'Verlagerung beantragen', icon: '📝', parent: '/agent-verlagerung' },
            '/agent-verlagerung-durchführen': { label: 'Verlagerung durchführen', icon: '🚚', parent: '/agent-verlagerung' },
            '/settings': { label: 'Einstellungen', icon: '⚙️', parent: '/dashboard' },
            '/glossar': { label: 'Glossar & Hilfe', icon: '📖', parent: '/dashboard' }
        };
    }

    // Breadcrumb-Pfad für eine Route erstellen
    buildPath(currentPath, params = {}) {
        const path = [];
        let route = currentPath;

        // Handle dynamic routes (e.g., /detail/:id -> /detail)
        const baseRoute = this.getBaseRoute(route);

        // Build path from current to root
        while (route && this.routes[baseRoute]) {
            const routeInfo = this.routes[this.getBaseRoute(route)];
            if (!routeInfo) break;

            let label = routeInfo.label;

            // For dynamic routes, append ID if available
            if (routeInfo.dynamic && params.id) {
                label = `${routeInfo.label} #${params.id}`;
            }

            path.unshift({
                path: route,
                label: label,
                icon: routeInfo.icon,
                isActive: route === currentPath
            });

            route = routeInfo.parent;
        }

        return path;
    }

    // Get base route without dynamic parameters
    getBaseRoute(route) {
        // Match patterns like /detail/123 -> /detail
        const patterns = [
            { pattern: /^\/detail\/\d+$/, base: '/detail' },
            { pattern: /^\/abl-detail\/[\w-]+$/, base: '/abl-detail' },
            { pattern: /^\/verlagerung\/[\w-]+$/, base: '/verlagerung-detail' },
            { pattern: /^\/partnerwechsel\/[\w-]+$/, base: '/partnerwechsel-detail' },
            { pattern: /^\/verschrottung-detail\/[\w-]+$/, base: '/verschrottung-detail' }
        ];

        for (const { pattern, base } of patterns) {
            if (pattern.test(route)) {
                return base;
            }
        }

        return route;
    }

    // Render breadcrumbs to the page
    render(currentPath, params = {}) {
        const path = this.buildPath(currentPath, params);

        // Don't show breadcrumbs on dashboard
        if (currentPath === '/' || currentPath === '/dashboard') {
            this.hide();
            return;
        }

        // Create or get container
        this.ensureContainer();

        if (path.length <= 1) {
            this.hide();
            return;
        }

        const html = `
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <ol class="breadcrumb-list">
                    ${path.map((item, index) => `
                        <li class="breadcrumb-item ${item.isActive ? 'active' : ''}">
                            ${item.isActive ? `
                                <span class="breadcrumb-current">
                                    <span class="breadcrumb-icon">${item.icon}</span>
                                    ${item.label}
                                </span>
                            ` : `
                                <a href="#${item.path}" class="breadcrumb-link" onclick="router.navigate('${item.path}'); return false;">
                                    <span class="breadcrumb-icon">${item.icon}</span>
                                    ${item.label}
                                </a>
                            `}
                            ${index < path.length - 1 ? '<span class="breadcrumb-separator">›</span>' : ''}
                        </li>
                    `).join('')}
                </ol>
                <button class="breadcrumb-back" onclick="history.back()" title="Zurück">
                    ← Zurück
                </button>
            </nav>
        `;

        this.container.innerHTML = html;
        this.container.style.display = 'block';
    }

    // Ensure container exists
    ensureContainer() {
        if (!this.container) {
            this.container = document.getElementById('breadcrumb-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'breadcrumb-container';
                this.container.className = 'breadcrumb-container';

                // Insert after header
                const header = document.querySelector('.header');
                if (header && header.nextSibling) {
                    header.parentNode.insertBefore(this.container, header.nextSibling);
                } else {
                    document.body.insertBefore(this.container, document.getElementById('app'));
                }
            }
        }
    }

    // Hide breadcrumbs
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    // Update a single breadcrumb label (useful for dynamic content)
    updateLabel(path, newLabel) {
        if (this.container) {
            const link = this.container.querySelector(`[href="#${path}"], .breadcrumb-current`);
            if (link) {
                const icon = link.querySelector('.breadcrumb-icon');
                if (icon) {
                    link.innerHTML = icon.outerHTML + newLabel;
                }
            }
        }
    }

    // Set custom route info (for dynamic pages)
    setRoute(path, info) {
        this.routes[path] = info;
    }
}

// Globale Instanz
const breadcrumbService = new BreadcrumbService();
