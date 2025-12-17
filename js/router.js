// ORCA 2.0 - Simple Router
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Listen to hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    // Register a route
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // Handle route changes
    handleRouteChange() {
        const fullHash = window.location.hash.slice(1) || '/';

        // Split hash into path and query string
        const [hash, queryString] = fullHash.split('?');
        this.currentRoute = hash;
        this.queryParams = this.parseQueryString(queryString);

        // Permission check
        if (typeof permissionService !== 'undefined' && !permissionService.canAccessRoute(hash)) {
            this.showAccessDenied(hash);
            return;
        }

        // Update active nav links
        this.updateActiveNavLinks();

        // Check for exact match first
        if (this.routes[hash]) {
            this.routes[hash]();
        } else {
            // Check for dynamic routes (e.g., /detail/123)
            const matchedRoute = this.matchDynamicRoute(hash);
            if (matchedRoute) {
                matchedRoute.handler(matchedRoute.params);
            } else if (hash === '/' && this.routes['/']) {
                this.routes['/']();
            } else {
                this.show404();
            }
        }

        // Update breadcrumbs
        if (typeof breadcrumbService !== 'undefined') {
            const matchedRoute = this.matchDynamicRoute(hash);
            const params = matchedRoute ? matchedRoute.params : {};
            breadcrumbService.render(hash, params);
        }

        // Scroll to top on route change
        window.scrollTo(0, 0);
    }

    // Parse query string into object
    parseQueryString(queryString) {
        if (!queryString) return {};
        const params = {};
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    }

    // Get query parameter
    getQueryParam(key) {
        return this.queryParams ? this.queryParams[key] : null;
    }

    // Match dynamic routes
    matchDynamicRoute(currentPath) {
        const currentParts = currentPath.split('/').filter(p => p);

        for (const [routePath, handler] of Object.entries(this.routes)) {
            const routeParts = routePath.split('/').filter(p => p);

            // Check if the number of parts match
            if (routeParts.length !== currentParts.length) {
                continue;
            }

            // Check if pattern matches
            const params = {};
            let isMatch = true;

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    // This is a parameter
                    const paramName = routeParts[i].slice(1);
                    params[paramName] = currentParts[i];
                } else if (routeParts[i] !== currentParts[i]) {
                    // Static part doesn't match
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return { handler, params };
            }
        }

        return null;
    }

    // Navigate to a route
    navigate(path) {
        window.location.hash = path;
    }

    // Update active state of navigation links
    updateActiveNavLinks() {
        // Update dropdown selection
        const dropdown = document.getElementById('navDropdown');
        if (dropdown) {
            // Map root route to /dashboard
            let dropdownValue = this.currentRoute;
            if (dropdownValue === '/') {
                dropdownValue = '/dashboard';
            }
            dropdown.value = dropdownValue;
        }

        // Keep old nav-link logic for backwards compatibility
        const links = document.querySelectorAll('.nav-link');
        const currentBasePath = this.currentRoute.split('/')[1] || '/';

        links.forEach(link => {
            const href = link.getAttribute('data-route');
            const linkBasePath = href.split('/')[1] || '/';

            // Exact match for homepage
            if (href === '/' && this.currentRoute === '/') {
                link.classList.add('active');
            }
            // Check if we're on a detail page - don't highlight any nav
            else if (this.currentRoute.startsWith('/detail/')) {
                link.classList.remove('active');
            }
            // Check if link matches current base path
            else if (href === this.currentRoute) {
                link.classList.add('active');
            }
            else {
                link.classList.remove('active');
            }
        });
    }

    // Show 404 page
    showAccessDenied(route) {
        const app = document.getElementById('app');
        const viewKey = typeof permissionService !== 'undefined' ?
            permissionService.getViewKeyFromRoute(route) : 'unbekannt';
        const currentRole = typeof permissionService !== 'undefined' ?
            permissionService.getCurrentRole() : '?';
        const roleInfo = typeof permissionService !== 'undefined' ?
            permissionService.getRoleInfo(currentRole) : null;

        app.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem">
                <div style="font-size:4rem;margin-bottom:1rem">🔒</div>
                <h1 style="font-size:1.5rem;color:#1e3a5f;margin-bottom:0.5rem">Zugriff verweigert</h1>
                <p style="color:#6b7280;margin-bottom:1.5rem">
                    Ihre Rolle <strong>${roleInfo ? roleInfo.name : currentRole}</strong> hat keinen Zugriff auf <strong>${viewKey}</strong>.
                </p>
                <div style="display:flex;gap:1rem">
                    <a href="#/dashboard" style="padding:0.75rem 1.5rem;background:#2c4a8c;color:white;border-radius:8px;text-decoration:none">
                        Zum Dashboard
                    </a>
                    <a href="#/glossar" style="padding:0.75rem 1.5rem;border:1px solid #d1d5db;border-radius:8px;text-decoration:none;color:#374151">
                        Glossar
                    </a>
                </div>
            </div>
        `;

        // Header aktualisieren
        document.getElementById('headerTitle').textContent = 'Zugriff verweigert';
        document.getElementById('headerSubtitle').textContent = '';
        document.getElementById('headerStats').style.display = 'none';
    }

    show404() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Seite nicht gefunden</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Die angeforderte Seite existiert nicht.</p>
                    <button class="btn btn-primary" onclick="router.navigate('/')">Zurück zur Startseite</button>
                </div>
            </div>
        `;
    }

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Get route parameters (for dynamic routes like /detail/:id)
    getRouteParams() {
        const parts = this.currentRoute.split('/');
        return parts;
    }
}

// Create global router instance
const router = new Router();
