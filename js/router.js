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
        const hash = window.location.hash.slice(1) || '/';
        this.currentRoute = hash;

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

        // Scroll to top on route change
        window.scrollTo(0, 0);
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
