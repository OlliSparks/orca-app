// ORCA 2.0 - API Configuration
const API_CONFIG = {
    // API Base URL
    baseURL: 'https://int.bmw.organizingcompanyassets.com',

    // API Mode: 'mock' or 'live'
    mode: 'mock', // Umschalten zwischen Mock-Daten und echten API-Calls

    // Keycloak Configuration
    keycloak: {
        url: 'https://int.bmw.organizingcompanyassets.com/auth', // Anpassen wenn nötig
        realm: 'orca', // Anpassen wenn nötig
        clientId: 'orca-inventory-app' // Anpassen wenn nötig
    },

    // Company & Supplier Keys (später aus Login übernehmen)
    context: {
        companyKey: null, // Wird nach Login gesetzt
        supplierKey: null, // Wird nach Login gesetzt
        userKey: null // Wird nach Login gesetzt
    },

    // API Endpoints Mapping
    endpoints: {
        // Assets / FM
        assetList: '/asset-list',
        assetListFields: '/asset-list/fields',
        assetQuickSearch: '/asset-list/quick-search',
        assetDetail: '/assets/{assetKey}',
        assetDetailAlt: '/asset/{assetKey}',
        assetProcessHistory: '/asset/{assetKey}/process-history',
        assetPartnumberHistory: '/asset/{assetKey}/partnumber-history',
        assetParticipants: '/asset/{assetKey}/participants',
        assetDocuments: '/asset/{assetKey}/documents',
        assetImages: '/asset/{assetKey}/images',
        assetTrackerCurrent: '/assets/{assetKey}/tracker/current',

        // Inventory
        inventoryList: '/inventory-list',
        inventoryListFields: '/inventory-list/fields',
        inventoryDetail: '/inventory/{inventoryKey}',
        inventoryPositions: '/inventory/{inventoryKey}/positions',
        inventoryPositionDetail: '/inventory/{inventoryKey}/positions/{positionKey}',
        inventoryPositionFields: '/inventory/{inventoryKey}/positions/fields',
        inventoryReportPosition: '/inventory/{inventoryKey}/{positionKey}/{revision}/report',
        inventoryUpdateLocation: '/inventory/{inventoryKey}/{positionKey}/location',
        inventoryAcceptPosition: '/inventory/{inventoryKey}/{positionKey}/{revision}/accept',
        inventorySend: '/inventory/{inventoryKey}/actions/send',
        inventoryAccept: '/inventory/{inventoryKey}/actions/accept',
        inventoryApprove: '/inventory/{inventoryKey}/actions/approve',

        // Planning
        assetInvPlan: '/asset/invplan',
        assetPlanningUpdates: '/asset-planning/planningUpdates',
        assetPlanningRulesetExecutions: '/asset-planning/ruleset/executions',

        // Dashboard / KPIs
        dashboardAssets: '/dashboards/assets',
        dashboardInventories: '/dashboards/inventories',
        dashboardInventoryPositions: '/dashboards/inventory-positions',
        kpiCoverRate: '/kpi/inventory/cover-rate',
        kpiAcceptedAssets: '/kpi/inventory/accepted-assets',

        // Companies & Locations
        companies: '/companies',
        companyDetail: '/companies/{companyKey}',
        companyLocations: '/companies/{companyKey}/locations',
        companySuppliers: '/companies/{companyKey}/suppliers',

        // Users
        users: '/users',
        userDetail: '/users/{userKey}',
        profile: '/profile'
    },

    // Request Defaults
    defaults: {
        timeout: 30000, // 30 Sekunden
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // Pagination Defaults
    pagination: {
        defaultPageSize: 50,
        maxPageSize: 100
    }
};

// Helper function to build endpoint URL with parameters
API_CONFIG.buildEndpoint = function(endpointKey, params = {}) {
    let endpoint = this.endpoints[endpointKey];

    if (!endpoint) {
        console.error('Unknown endpoint:', endpointKey);
        return null;
    }

    // Replace parameters in URL
    Object.keys(params).forEach(key => {
        endpoint = endpoint.replace(`{${key}}`, params[key]);
    });

    return this.baseURL + endpoint;
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
