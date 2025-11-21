// ORCA 2.0 - Authentication Service (Keycloak Integration)
class AuthService {
    constructor() {
        this.keycloak = null;
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.userInfo = null;
    }

    // Initialize Keycloak
    async init() {
        if (API_CONFIG.mode === 'mock') {
            console.log('Auth: Running in MOCK mode - Skipping Keycloak initialization');
            this.isAuthenticated = true;
            this.userInfo = {
                username: 'test.user@orca.com',
                name: 'Test User',
                email: 'test.user@orca.com'
            };
            return true;
        }

        try {
            // Load Keycloak adapter if not already loaded
            if (typeof Keycloak === 'undefined') {
                await this.loadKeycloakAdapter();
            }

            // Initialize Keycloak instance
            this.keycloak = new Keycloak({
                url: API_CONFIG.keycloak.url,
                realm: API_CONFIG.keycloak.realm,
                clientId: API_CONFIG.keycloak.clientId
            });

            // Try to authenticate
            const authenticated = await this.keycloak.init({
                onLoad: 'login-required',
                checkLoginIframe: false,
                pkceMethod: 'S256'
            });

            if (authenticated) {
                this.isAuthenticated = true;
                this.token = this.keycloak.token;
                this.refreshToken = this.keycloak.refreshToken;

                // Load user info
                this.userInfo = await this.keycloak.loadUserInfo();

                // Setup token refresh
                this.setupTokenRefresh();

                console.log('Auth: Keycloak authentication successful');
                return true;
            } else {
                console.error('Auth: Keycloak authentication failed');
                return false;
            }
        } catch (error) {
            console.error('Auth: Error initializing Keycloak:', error);
            return false;
        }
    }

    // Load Keycloak adapter script dynamically
    loadKeycloakAdapter() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${API_CONFIG.keycloak.url}/js/keycloak.js`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Setup automatic token refresh
    setupTokenRefresh() {
        if (!this.keycloak) return;

        // Refresh token every 5 minutes
        setInterval(() => {
            this.keycloak.updateToken(70).then((refreshed) => {
                if (refreshed) {
                    this.token = this.keycloak.token;
                    console.log('Auth: Token refreshed');
                }
            }).catch(() => {
                console.error('Auth: Failed to refresh token');
                this.logout();
            });
        }, 5 * 60 * 1000);
    }

    // Get current auth token
    getToken() {
        if (API_CONFIG.mode === 'mock') {
            return 'mock-token';
        }
        return this.token;
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`
            };
        }
        return {};
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Get user info
    getUserInfo() {
        return this.userInfo;
    }

    // Logout
    logout() {
        if (API_CONFIG.mode === 'mock') {
            console.log('Auth: Logout in MOCK mode');
            this.isAuthenticated = false;
            this.userInfo = null;
            return;
        }

        if (this.keycloak) {
            this.keycloak.logout();
        }
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.userInfo = null;
    }

    // Login (for manual login trigger)
    login() {
        if (API_CONFIG.mode === 'mock') {
            console.log('Auth: Login in MOCK mode - Auto-authenticated');
            return Promise.resolve(true);
        }

        if (this.keycloak) {
            return this.keycloak.login();
        }
        return Promise.reject('Keycloak not initialized');
    }

    // Check if token needs refresh
    isTokenExpired() {
        if (API_CONFIG.mode === 'mock') {
            return false;
        }

        if (this.keycloak) {
            return this.keycloak.isTokenExpired(5); // Check if expires in 5 seconds
        }
        return true;
    }

    // Update token if needed
    async updateToken() {
        if (API_CONFIG.mode === 'mock') {
            return true;
        }

        if (this.keycloak && this.isTokenExpired()) {
            try {
                const refreshed = await this.keycloak.updateToken(30);
                if (refreshed) {
                    this.token = this.keycloak.token;
                }
                return true;
            } catch (error) {
                console.error('Auth: Failed to update token:', error);
                return false;
            }
        }
        return true;
    }
}

// Create global auth service instance
const authService = new AuthService();
