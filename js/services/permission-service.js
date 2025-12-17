// ORCA 2.0 - Permission Service (Rollen- und Berechtigungsverwaltung)
class PermissionService {
    constructor() {
        // Berechtigungsstufen
        this.levels = {
            NONE: 'keine',
            READ: 'lesen',
            WRITE: 'schreiben',
            ADMIN: 'admin'
        };

        // Alle Rollen aus dem Glossar
        this.roles = {
            // Lieferanten-Rollen
            'IVL': { name: 'Inventurverantwortlicher Lieferant', category: 'Lieferant', color: '#3b82f6' },
            'WVL': { name: 'Werkzeugverantwortlicher Lieferant', category: 'Lieferant', color: '#8b5cf6' },
            'WVL-LOC': { name: 'Werkzeugverantwortlicher pro Standort', category: 'Lieferant', color: '#6366f1' },
            'ID': { name: 'Inventurdurchführer', category: 'Lieferant', color: '#06b6d4' },
            'ITL': { name: 'IT-Verantwortlicher Lieferant', category: 'Lieferant', color: '#14b8a6' },
            'VVL': { name: 'Versand-Verantwortlicher Lieferant', category: 'Lieferant', color: '#10b981' },
            // OEM-Rollen
            'FEK': { name: 'Facheinkäufer (OEM)', category: 'OEM', color: '#f59e0b' },
            'CL': { name: 'Genehmiger/Approver', category: 'OEM', color: '#ef4444' },
            // Support
            'SUP': { name: 'Support/Inventurbüro', category: 'Intern', color: '#ec4899' }
        };

        // Alle Sichten/Views
        this.views = {
            'dashboard': { name: 'Dashboard', icon: '🏠', route: '/dashboard' },
            'inventur': { name: 'Inventur', icon: '📋', route: '/inventur' },
            'verlagerung': { name: 'Verlagerung', icon: '🚚', route: '/verlagerung' },
            'abl': { name: 'ABL', icon: '📦', route: '/abl' },
            'partnerwechsel': { name: 'Partnerwechsel', icon: '🔄', route: '/partnerwechsel' },
            'verschrottung': { name: 'Verschrottung', icon: '♻️', route: '/verschrottung' },
            'planung': { name: 'Planung', icon: '📅', route: '/planung' },
            'fm-akte': { name: 'FM-Akte Suche', icon: '📁', route: '/fm-akte' },
            'unternehmen': { name: 'Unternehmen', icon: '🏢', route: '/unternehmen' },
            'nachrichten': { name: 'Nachrichten', icon: '✉️', route: '/messages' },
            'kpi': { name: 'KPI', icon: '📊', route: '/kpi' },
            'glossar': { name: 'Glossar', icon: '📖', route: '/glossar' },
            'einstellungen': { name: 'Einstellungen', icon: '⚙️', route: '/einstellungen' },
            'agenten-lieferant': { name: 'Agenten (Lieferanten)', icon: '🤖', route: '/agenten' },
            'agenten-intern': { name: 'Agenten (Intern)', icon: '🔧', route: '/agenten-intern' }
        };

        // Standard-Matrix laden oder initialisieren
        this.loadMatrix();

        // Aktuelle Rolle (Default: SUP für Entwicklung)
        this.currentRole = localStorage.getItem('orca_current_role') || 'SUP';
    }

    // Matrix aus localStorage laden oder Default erstellen
    loadMatrix() {
        const saved = localStorage.getItem('orca_permission_matrix');
        if (saved) {
            try {
                this.matrix = JSON.parse(saved);
                return;
            } catch (e) {
                console.warn('[Permission] Fehler beim Laden der Matrix, verwende Default');
            }
        }

        // Default-Matrix erstellen
        this.matrix = this.createDefaultMatrix();
        this.saveMatrix();
    }

    // Default-Matrix mit sinnvollen Standardwerten
    createDefaultMatrix() {
        const matrix = {};

        // Für jede Rolle
        Object.keys(this.roles).forEach(roleKey => {
            matrix[roleKey] = {};

            // Für jede Sicht
            Object.keys(this.views).forEach(viewKey => {
                // Support hat überall Admin-Rechte
                if (roleKey === 'SUP') {
                    matrix[roleKey][viewKey] = this.levels.ADMIN;
                }
                // Interne Agenten nur für Support
                else if (viewKey === 'agenten-intern') {
                    matrix[roleKey][viewKey] = this.levels.NONE;
                }
                // OEM-Rollen: eingeschränkter Zugriff
                else if (this.roles[roleKey].category === 'OEM') {
                    if (['dashboard', 'kpi', 'glossar'].includes(viewKey)) {
                        matrix[roleKey][viewKey] = this.levels.READ;
                    } else if (['inventur', 'verlagerung', 'partnerwechsel', 'verschrottung'].includes(viewKey)) {
                        matrix[roleKey][viewKey] = this.levels.WRITE;
                    } else {
                        matrix[roleKey][viewKey] = this.levels.NONE;
                    }
                }
                // Lieferanten-Rollen: Standard-Zugriff
                else {
                    // IVL - Inventurverantwortlicher
                    if (roleKey === 'IVL') {
                        if (['dashboard', 'inventur', 'planung', 'glossar', 'nachrichten', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.WRITE;
                        } else if (['verlagerung', 'abl', 'kpi', 'unternehmen'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.NONE;
                        }
                    }
                    // WVL - Werkzeugverantwortlicher (erweiterte Rechte)
                    else if (roleKey === 'WVL') {
                        if (['dashboard', 'inventur', 'verlagerung', 'planung', 'unternehmen', 'nachrichten', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.ADMIN;
                        } else if (['abl', 'partnerwechsel', 'verschrottung', 'kpi', 'fm-akte', 'glossar'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.WRITE;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        }
                    }
                    // WVL-LOC - Standort-Verantwortlicher
                    else if (roleKey === 'WVL-LOC') {
                        if (['dashboard', 'inventur', 'planung', 'nachrichten', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.WRITE;
                        } else if (['verlagerung', 'abl', 'kpi', 'glossar'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.NONE;
                        }
                    }
                    // ID - Inventurdurchführer (eingeschränkt)
                    else if (roleKey === 'ID') {
                        if (['dashboard', 'inventur', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.WRITE;
                        } else if (['glossar', 'nachrichten'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.NONE;
                        }
                    }
                    // ITL - IT-Verantwortlicher
                    else if (roleKey === 'ITL') {
                        if (['dashboard', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.ADMIN;
                        } else if (['glossar', 'nachrichten', 'kpi'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.NONE;
                        }
                    }
                    // VVL - Versand-Verantwortlicher
                    else if (roleKey === 'VVL') {
                        if (['dashboard', 'verlagerung', 'agenten-lieferant'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.WRITE;
                        } else if (['inventur', 'glossar', 'nachrichten'].includes(viewKey)) {
                            matrix[roleKey][viewKey] = this.levels.READ;
                        } else {
                            matrix[roleKey][viewKey] = this.levels.NONE;
                        }
                    }
                    // Fallback
                    else {
                        matrix[roleKey][viewKey] = this.levels.READ;
                    }
                }
            });
        });

        return matrix;
    }

    // Matrix speichern
    saveMatrix() {
        localStorage.setItem('orca_permission_matrix', JSON.stringify(this.matrix));
    }

    // Aktuelle Rolle setzen
    setCurrentRole(roleKey) {
        if (this.roles[roleKey]) {
            this.currentRole = roleKey;
            localStorage.setItem('orca_current_role', roleKey);
            // Event für UI-Updates auslösen
            window.dispatchEvent(new CustomEvent('roleChanged', { detail: { role: roleKey } }));
            return true;
        }
        return false;
    }

    // Aktuelle Rolle abrufen
    getCurrentRole() {
        return this.currentRole;
    }

    // Rollen-Info abrufen
    getRoleInfo(roleKey) {
        return this.roles[roleKey] || null;
    }

    // Berechtigung für eine Sicht prüfen
    hasPermission(viewKey, requiredLevel = 'lesen') {
        const rolePermission = this.matrix[this.currentRole]?.[viewKey];
        if (!rolePermission) return false;

        const levelOrder = [this.levels.NONE, this.levels.READ, this.levels.WRITE, this.levels.ADMIN];
        const currentIndex = levelOrder.indexOf(rolePermission);
        const requiredIndex = levelOrder.indexOf(requiredLevel);

        return currentIndex >= requiredIndex;
    }

    // Kann lesen?
    canRead(viewKey) {
        return this.hasPermission(viewKey, this.levels.READ);
    }

    // Kann schreiben?
    canWrite(viewKey) {
        return this.hasPermission(viewKey, this.levels.WRITE);
    }

    // Ist Admin?
    isAdmin(viewKey) {
        return this.hasPermission(viewKey, this.levels.ADMIN);
    }

    // Berechtigung für Route prüfen
    canAccessRoute(route) {
        // Route zu View-Key mappen
        const viewKey = this.getViewKeyFromRoute(route);
        if (!viewKey) return true; // Unbekannte Route erlauben

        return this.canRead(viewKey);
    }

    // Route zu View-Key
    getViewKeyFromRoute(route) {
        // Direkte Matches
        for (const [key, view] of Object.entries(this.views)) {
            if (view.route === route) return key;
        }

        // Partial Matches für Sub-Routen
        if (route.startsWith('/inventur')) return 'inventur';
        if (route.startsWith('/verlagerung')) return 'verlagerung';
        if (route.startsWith('/abl')) return 'abl';
        if (route.startsWith('/partnerwechsel')) return 'partnerwechsel';
        if (route.startsWith('/verschrottung')) return 'verschrottung';
        if (route.startsWith('/agent-')) {
            // Interne Agenten
            if (route.includes('api-monitor') || route.includes('berechtigungen') ||
                route.includes('bugs') || route.includes('backlog') ||
                route.includes('skills') || route.includes('allgemein')) {
                return 'agenten-intern';
            }
            return 'agenten-lieferant';
        }
        if (route === '/einstellungen') return 'einstellungen';
        if (route === '/glossar') return 'glossar';
        if (route === '/messages') return 'nachrichten';
        if (route === '/kpi') return 'kpi';
        if (route === '/planung') return 'planung';
        if (route === '/fm-akte') return 'fm-akte';
        if (route === '/unternehmen') return 'unternehmen';

        return null;
    }

    // Berechtigung setzen (nur für Admin/Support)
    setPermission(roleKey, viewKey, level) {
        if (!this.roles[roleKey] || !this.views[viewKey]) {
            return { success: false, error: 'Ungültige Rolle oder Sicht' };
        }

        if (!Object.values(this.levels).includes(level)) {
            return { success: false, error: 'Ungültige Berechtigungsstufe' };
        }

        // Nur Support darf Berechtigungen ändern
        if (this.currentRole !== 'SUP') {
            return { success: false, error: 'Keine Berechtigung zum Ändern' };
        }

        this.matrix[roleKey][viewKey] = level;
        this.saveMatrix();

        return { success: true, message: `${roleKey} → ${viewKey}: ${level}` };
    }

    // Ganze Matrix abrufen
    getMatrix() {
        return this.matrix;
    }

    // Matrix für eine Rolle abrufen
    getRolePermissions(roleKey) {
        return this.matrix[roleKey] || {};
    }

    // Alle Rollen mit Zugriff auf eine Sicht
    getRolesWithAccess(viewKey, minLevel = 'lesen') {
        const result = [];
        const levelOrder = [this.levels.NONE, this.levels.READ, this.levels.WRITE, this.levels.ADMIN];
        const minIndex = levelOrder.indexOf(minLevel);

        for (const [roleKey, permissions] of Object.entries(this.matrix)) {
            const level = permissions[viewKey];
            if (level && levelOrder.indexOf(level) >= minIndex) {
                result.push({
                    role: roleKey,
                    roleName: this.roles[roleKey]?.name,
                    level: level
                });
            }
        }

        return result;
    }

    // Matrix auf Default zurücksetzen
    resetMatrix() {
        if (this.currentRole !== 'SUP') {
            return { success: false, error: 'Keine Berechtigung' };
        }

        this.matrix = this.createDefaultMatrix();
        this.saveMatrix();
        return { success: true, message: 'Matrix wurde zurückgesetzt' };
    }

    // Export als JSON
    exportMatrix() {
        return JSON.stringify(this.matrix, null, 2);
    }

    // Import von JSON
    importMatrix(jsonString) {
        if (this.currentRole !== 'SUP') {
            return { success: false, error: 'Keine Berechtigung' };
        }

        try {
            const imported = JSON.parse(jsonString);
            // Validierung
            for (const roleKey of Object.keys(imported)) {
                if (!this.roles[roleKey]) {
                    return { success: false, error: `Unbekannte Rolle: ${roleKey}` };
                }
            }
            this.matrix = imported;
            this.saveMatrix();
            return { success: true, message: 'Matrix wurde importiert' };
        } catch (e) {
            return { success: false, error: 'Ungültiges JSON-Format' };
        }
    }

    // Rolle aus JWT-Token extrahieren (für zukünftige Auth-Integration)
    getRoleFromToken(token) {
        if (!token || token === 'mock-token') {
            return 'SUP'; // Default für Entwicklung
        }

        try {
            // JWT dekodieren (ohne Verifizierung - nur für Anzeige)
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));

            // Rollen aus realm_access oder resource_access
            const realmRoles = decoded.realm_access?.roles || [];
            const clientRoles = decoded.resource_access?.orca?.roles || [];
            const allRoles = [...realmRoles, ...clientRoles];

            // Mapping von Keycloak-Rollen zu ORCA-Rollen
            const roleMapping = {
                'support': 'SUP',
                'supplier_admin': 'WVL',
                'supplier': 'IVL',
                'inventory_executor': 'ID',
                'it_admin': 'ITL',
                'shipping': 'VVL',
                'oem_buyer': 'FEK',
                'oem_approver': 'CL'
            };

            for (const kcRole of allRoles) {
                if (roleMapping[kcRole.toLowerCase()]) {
                    return roleMapping[kcRole.toLowerCase()];
                }
            }

            // Fallback
            return 'ID'; // Niedrigste Berechtigung
        } catch (e) {
            console.warn('[Permission] Fehler beim Parsen des Tokens:', e);
            return 'SUP'; // Fallback für Entwicklung
        }
    }

    // Statistiken für Dashboard
    getStats() {
        const stats = {
            totalRoles: Object.keys(this.roles).length,
            totalViews: Object.keys(this.views).length,
            rolesByCategory: {},
            permissionCounts: {}
        };

        // Rollen nach Kategorie
        for (const [key, role] of Object.entries(this.roles)) {
            stats.rolesByCategory[role.category] = (stats.rolesByCategory[role.category] || 0) + 1;
        }

        // Berechtigungen zählen
        for (const level of Object.values(this.levels)) {
            stats.permissionCounts[level] = 0;
        }

        for (const rolePerms of Object.values(this.matrix)) {
            for (const level of Object.values(rolePerms)) {
                stats.permissionCounts[level]++;
            }
        }

        return stats;
    }
}

// Globale Instanz
const permissionService = new PermissionService();
