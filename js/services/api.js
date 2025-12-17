// ORCA 2.0 - API Service Layer
// Unterstützt Mock-Daten und Live-API mit automatischem Fallback

class APIService {
    constructor() {
        // Lade Konfiguration aus localStorage oder nutze Defaults
        this.loadConfigFromStorage();

        // CACHE für Mock-Daten - wird EINMAL beim Start generiert
        this.mockToolsCache = null;
        this.initializeMockData();

    }

    // Lade Konfiguration aus localStorage
    loadConfigFromStorage() {
        const saved = localStorage.getItem('orca_api_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.mode = config.mode || 'mock';
                this.baseURL = config.baseURL || 'https://int.bmw.organizingcompanyassets.com/api/orca';
                this.bearerToken = config.bearerToken || '';
                this.supplierNumber = config.supplierNumber || '9999999';
            } catch (e) {
                console.error('Error loading config:', e);
                this.setDefaults();
            }
        } else {
            this.setDefaults();
        }
        this.isConnected = false;
    }

    setDefaults() {
        this.mode = 'mock';
        this.baseURL = 'https://int.bmw.organizingcompanyassets.com/api/orca';
        this.bearerToken = '';
        this.supplierNumber = '133188';
    }

    // Update config from settings page
    updateConfig(config) {
        this.mode = config.mode || 'mock';
        this.baseURL = config.baseURL || this.baseURL;
        this.bearerToken = config.bearerToken || '';
        this.supplierNumber = config.supplierNumber || '9999999';
        this.isConnected = false;
    }

    // Initialisiere Mock-Daten EINMAL beim Start
    initializeMockData() {
        if (this.mockToolsCache === null) {
            // Sofort generierte Daten als Fallback setzen
            this.mockToolsCache = this.generateFixedTestData();
            this.mockDataInfo = null;

            // Async importierte Mock-Daten laden (überschreibt generierte wenn erfolgreich)
            this.loadImportedMockData();
        }
    }

    // Lade importierte Mock-Daten aus JSON-Datei
    async loadImportedMockData() {
        // Versuche verschiedene Pfade (für lokale Entwicklung und GitHub Pages)
        const paths = [
            'js/data/mock-assets.json',
            './js/data/mock-assets.json',
            '/js/data/mock-assets.json'
        ];

        for (const path of paths) {
            try {
                console.log(`📂 Versuche Mock-Daten zu laden von: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    if (data.assets && data.assets.length > 0) {
                        this.mockToolsCache = this.transformImportedAssets(data.assets);
                        this.mockDataInfo = data._mockDataInfo;
                        console.log(`✅ Mock-Daten geladen: ${this.mockToolsCache.length} Assets aus ${data._mockDataInfo.source}`);

                        // Aktualisiere API-Status im Footer falls bereits gerendert
                        if (typeof orcaApp !== 'undefined' && orcaApp.checkAPIStatus) {
                            orcaApp.checkAPIStatus();
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Pfad ${path} nicht erreichbar:`, e.message);
            }
        }
        console.warn('📦 Importierte Mock-Daten nicht verfügbar, nutze generierte Testdaten');
    }

    // Transformiere importierte Asset-Daten in internes Format
    transformImportedAssets(assets) {
        return assets.map((asset, idx) => {
            // Mapping von Excel-Format auf internes Format
            const id = asset.id || idx + 1;
            const inventoryNumber = String(asset.inventoryNumber || '');

            // Status-Mapping
            let status = 'offen';
            if (asset.processStatus) {
                const ps = asset.processStatus.toLowerCase();
                if (ps.includes('inventur') || ps.includes('in bearbeitung')) {
                    status = 'in-inventur';
                } else if (ps.includes('geplant') || ps.includes('planung')) {
                    status = 'feinplanung';
                }
            }

            return {
                id: id,
                number: `FM-${String(id).padStart(4, '0')}`,
                toolNumber: inventoryNumber,
                inventoryNumber: inventoryNumber,
                name: asset.toolName || `Werkzeug ${id}`,
                supplier: asset.supplierName || 'Unbekannt',
                supplierNumber: asset.supplierNumber,
                location: asset.city ? `${asset.city}, ${asset.country || 'DE'}` : 'Unbekannt',
                locationDetail: asset.street ? `${asset.street}, ${asset.postalCode} ${asset.city}` : '',
                status: status,
                lastInventory: null,
                dueDate: asset.dueDate || null,
                startDate: null,
                inventoryType: asset.planInventoryType || 'IA',
                assetNumber: inventoryNumber,
                supplierAssetNumber: asset.supplierInfo1 || '',
                lifecycleStatus: asset.lifecycleStatus || 'Aktiv',
                processStatus: asset.processStatus || 'Unbekannt',
                // Zusätzliche importierte Felder
                owner: asset.owner,
                department: asset.department,
                partNumber: asset.partNumber,
                partName: asset.partName,
                fek: asset.fek,
                commodity: asset.commodity,
                acquisitionValue: asset.acquisitionValue,
                operator: asset.operatorName || asset.operator,
                processId: asset.processId,
                processName: asset.processName,
                processType: asset.processType,
                processStatusText: asset.processStatusText,
                assignedUser: asset.assignedUser,
                locationResult: asset.locationResult,
                positionProcessStatus: asset.positionProcessStatus,
                // Flag für Mock-Daten
                _isMockData: true
            };
        });
    }

    // Generic API call method with authentication
    async call(endpoint, method = 'GET', data = null) {
        // In Mock-Modus: Fallback auf Mock-Daten
        if (this.mode === 'mock') {
            console.warn('API call in MOCK mode:', endpoint);
            throw new Error('Running in MOCK mode - use mock methods');
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Add Bearer Token if available
        if (this.bearerToken) {
            // Handle both "Bearer xxx" and just "xxx" formats
            const token = this.bearerToken.startsWith('Bearer ')
                ? this.bearerToken.substring(7)
                : this.bearerToken;
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Call failed:', endpoint, error);
            throw error;
        }
    }

    // Safe API call with automatic fallback to mock data
    async callWithFallback(liveApiCall, mockFallback) {
        if (this.mode === 'mock') {
            return mockFallback();
        }

        try {
            return await liveApiCall();
        } catch (error) {
            console.warn('Live API call failed, falling back to mock data:', error);
            return mockFallback();
        }
    }

    // === Profile & User Endpoints ===

    // Get current user profile
    async getProfile() {
        if (this.mode === 'mock') {
            return {
                success: true,
                data: {
                    firstName: 'Max',
                    lastName: 'Mustermann',
                    name: 'Max Mustermann (Mock)',
                    email: 'max.mustermann@example.com',
                    company: 'Test GmbH'
                }
            };
        }

        try {
            const response = await this.call('/profile', 'GET');

            // Extract user info from response - handle different API response formats
            const data = response.data || response;
            let firstName = data.firstName || data.meta?.firstName || '';
            let lastName = data.lastName || data.meta?.lastName || '';
            let name = data.name || data.meta?.name || '';

            // Falls firstName/lastName leer, aber name vorhanden: extrahiere aus name
            // Entferne bekannte Rollen-Suffixe (Support, Admin, IVL, ITL, WVL, etc.)
            if (!firstName && !lastName && name) {
                // Entferne Rollen am Ende des Namens
                const rolePattern = /\s+(Support|Admin|IVL|ITL|WVL|FEK|CL|SUP|ABL|STL)$/i;
                name = name.replace(rolePattern, '').trim();

                // Versuche Vor-/Nachname zu extrahieren (erste zwei Woerter)
                const nameParts = name.split(/\s+/);
                if (nameParts.length >= 2) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                }
            }

            const displayName = `${firstName} ${lastName}`.trim() || name;
            const email = data.email || data.meta?.mail || data.meta?.email || '';

            return {
                success: true,
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    name: displayName,
                    email: email,
                    company: data.company || data.meta?.company || ''
                }
            };
        } catch (error) {
            console.error('Profile API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // === Tasks/Notifications Endpoints ===

    // Get tasks for current user
    async getTasks(filters = {}) {
        if (this.mode === 'mock') {
            return {
                success: true,
                data: [],
                total: 0
            };
        }

        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            params.append('limit', filters.limit || 10000);
            params.append('offset', filters.offset || 0);

            const endpoint = `/tasks?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            return {
                success: true,
                data: response.data || response,
                total: response.total || (response.data ? response.data.length : 0)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // === Process Endpoints ===

    // Get processes (can be used to find inventories)
    async getProcesses(filters = {}) {
        if (this.mode === 'mock') {
            return {
                success: true,
                data: [],
                total: 0
            };
        }

        try {
            const params = new URLSearchParams();
            params.append('skip', filters.skip || 0);
            params.append('limit', filters.limit || 10000);
            if (filters.query) params.append('query', filters.query);

            const endpoint = `/process?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            return {
                success: true,
                data: response.data || response,
                total: response.total || (response.data ? response.data.length : 0)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // === Live Inventory Endpoints ===

    // Get inventory details
    async getInventoryDetails(inventoryKey) {
        if (this.mode === 'mock') {
            return { success: false, error: 'Mock mode' };
        }

        try {
            const response = await this.call(`/inventory/${inventoryKey}`, 'GET');
            return {
                success: true,
                data: response
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get inventory partitions (positions)
    async getInventoryPartitions(inventoryKey, filters = {}) {
        if (this.mode === 'mock') {
            return { success: false, error: 'Mock mode' };
        }

        try {
            const params = new URLSearchParams();
            params.append('limit', filters.limit || 10000);
            params.append('offset', filters.offset || 0);
            if (filters.supplier) params.append('supplier', filters.supplier);
            if (filters.status) params.append('status', filters.status);

            const endpoint = `/inventory/${inventoryKey}/partitions?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            return {
                success: true,
                data: response.data || response,
                total: response.total || (response.data ? response.data.length : 0)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Update position comment
    async updatePositionComment(inventoryKey, positionKey, revision, comment) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const params = new URLSearchParams();
            params.append('comment', comment);

            const endpoint = `/inventory/${inventoryKey}/${positionKey}/${revision}/comment?${params.toString()}`;
            await this.call(endpoint, 'PATCH');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update position location
    async updatePositionLocation(inventoryKey, positionKey, locationData) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const endpoint = `/inventory/${inventoryKey}/${positionKey}/location`;
            await this.call(endpoint, 'PATCH', locationData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Report inventory position
    async reportPosition(inventoryKey, positionKey, revision) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const endpoint = `/inventory/${inventoryKey}/${positionKey}/${revision}/report`;
            await this.call(endpoint, 'PATCH');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Accept inventory position
    async acceptPosition(inventoryKey, positionKey, revision) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const endpoint = `/inventory/${inventoryKey}/${positionKey}/${revision}/accept`;
            await this.call(endpoint, 'PATCH');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Report full inventory
    async reportInventory(inventoryKey) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const endpoint = `/inventory/${inventoryKey}/actions/report`;
            await this.call(endpoint, 'POST');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // === FM (Fertigungsmittel) Endpoints ===

    // Get all FM items
    async getFMList(filters = {}) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                // Lieferantennummer ist erforderlich
                params.append('supplier', this.supplierNumber);
                if (filters.status) params.append('status', filters.status);
                if (filters.location) params.append('location', filters.location);
                params.append('limit', filters.limit || 10000);
                params.append('skip', filters.skip || 0);

                const endpoint = `/asset-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                const items = Array.isArray(response) ? response : (response.data || []);
                const transformedData = items.map((item, index) => ({
                    id: item.context?.key || index,
                    number: item.meta?.inventoryNumber || item.context?.key || '',
                    toolNumber: item.meta?.inventoryNumber || '',
                    name: item.meta?.inventoryText || item.meta?.partNumberText || 'Unbekannt',
                    supplier: item.meta?.supplier || '',
                    location: `${item.meta?.assetCity || ''}, ${item.meta?.assetCountry || ''}`.replace(/^, |, $/g, '') || 'Unbekannt',
                    status: this.mapAssetStatus(item.meta?.status, item.meta?.processStatus),
                    lastInventory: item.meta?.['p.inv.plan.due'] || null,
                    // Zusätzliche Felder für Details
                    client: item.meta?.client || '',
                    lifecycleStatus: item.meta?.lifecycleStatus || '',
                    processStatus: item.meta?.processStatus || '',
                    project: item.meta?.project || '',
                    derivat: item.meta?.derivat || '',
                    category: item.meta?.category || '',
                    department: item.meta?.department || '',
                    factNumberAI: item.meta?.factNumberAI || '',
                    wvoName: item.meta?.WVO_Name || '',
                    wet: item.meta?.WET || '',
                    originalData: item
                }));

                return {
                    success: true,
                    data: transformedData,
                    total: transformedData.length
                };
            },
            // Mock fallback
            () => this.getMockFMData(filters)
        );
    }

    // Mappe API-Status zu internem Status
    mapAssetStatus(status, processStatus) {
        // Status-Mapping basierend auf API-Werten
        if (status === 'IDLE') return 'offen';
        if (status === 'LOCKED') {
            // Bei LOCKED schauen wir auf processStatus
            if (processStatus === 'A3' || processStatus === 'A4') return 'feinplanung';
            if (processStatus === 'A6') return 'in-inventur';
        }
        return 'offen';
    }

    // Get single asset by inventory number
    async getAssetByNumber(inventoryNumber) {
        return this.callWithFallback(
            async () => {
                // Suche Asset über asset-list mit Filter
                const params = new URLSearchParams();
                params.append('supplier', this.supplierNumber);
                params.append('inventoryNumber', inventoryNumber);
                params.append('limit', 1);

                const endpoint = `/asset-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                const items = Array.isArray(response) ? response : (response.data || []);

                if (items.length === 0) {
                    return { success: false, error: 'Asset not found' };
                }

                const item = items[0];
                return {
                    success: true,
                    data: {
                        key: item.context?.key || '',
                        inventoryNumber: item.meta?.inventoryNumber || inventoryNumber,
                        description: item.meta?.inventoryText || item.meta?.partNumberText || '',
                        name: item.meta?.inventoryText || '',
                        supplier: item.meta?.supplier || '',
                        location: `${item.meta?.assetCity || ''}, ${item.meta?.assetCountry || ''}`.replace(/^, |, $/g, ''),
                        city: item.meta?.assetCity || '',
                        country: item.meta?.assetCountry || '',
                        width: item.meta?.width || null,
                        length: item.meta?.length || null,
                        height: item.meta?.height || null,
                        weight: item.meta?.weight || null,
                        material: item.meta?.material || '',
                        status: item.meta?.status || '',
                        processStatus: item.meta?.processStatus || '',
                        project: item.meta?.project || '',
                        client: item.meta?.client || '',
                        originalData: item
                    }
                };
            },
            () => ({ success: false, error: 'Mock mode - no asset data' })
        );
    }

    // Get single FM item
    async getFMDetail(id) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const endpoint = `/asset/${id}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                const item = response.data || response;
                const transformedData = {
                    id: item.context?.key || id,
                    number: item.meta?.inventoryNumber || '',
                    toolNumber: item.meta?.inventoryNumber || '',
                    name: item.meta?.inventoryText || item.meta?.partNumberText || 'Werkzeug',
                    assetNumber: item.meta?.assetNr || '',
                    supplierAssetNumber: item.meta?.infoText || '',
                    lifecycleStatus: this.mapLifecycleStatus(item.meta?.lifecycleStatus),
                    processStatus: this.mapProcessStatus(item.meta?.processStatus),
                    client: {
                        company: item.meta?.client || ''
                    },
                    contractor: {
                        company: item.supplier?.meta?.supplierText || item.supplier?.meta?.name || ''
                    },
                    location: {
                        company: item.supplier?.meta?.supplierText || '',
                        address: item.meta?.assetStreet || '',
                        postalCode: item.meta?.assetPostcode || '',
                        city: item.meta?.assetCity || '',
                        country: item.meta?.assetCountry || ''
                    },
                    finance: {
                        customsTariffNumber: item.meta?.hsCode || '',
                        acquisitionCost: item.assetAccounting?.meta?.manufacturingCostEUR
                            ? `${item.assetAccounting.meta.manufacturingCostEUR.toLocaleString('de-DE')},00 EUR`
                            : 'N/A',
                        residualBookValue: item.assetAccounting?.meta?.amortizedCostEUR
                            ? `${item.assetAccounting.meta.amortizedCostEUR.toLocaleString('de-DE')},00 EUR`
                            : 'N/A',
                        lastInventory: item.assetAccounting?.meta?.lastInventory || null
                    },
                    // Zusätzliche Felder
                    project: item.meta?.project || '',
                    derivat: item.meta?.derivat || '',
                    department: item.meta?.department || '',
                    typeKey: item.meta?.typeKey || '',
                    partNumberText: item.meta?.partNumberText || '',
                    infoText: item.meta?.infoText || '',
                    infoText2: item.meta?.infoText2 || '',
                    // Maße
                    dimensions: {
                        length: item.meta?.length || 0,
                        width: item.meta?.width || 0,
                        height: item.meta?.height || 0,
                        weight: item.meta?.weight || 0
                    },
                    originalData: item
                };

                return {
                    success: true,
                    data: transformedData
                };
            },
            // Mock fallback
            () => this.getMockFMDetail(id)
        );
    }

    // Mappe Lifecycle-Status zu lesbarem Text
    mapLifecycleStatus(status) {
        const statusMap = {
            'AL0': 'Angelegt',
            'AL1': 'Aktiv',
            'AL2': 'Inaktiv',
            'AL3': 'Verschrottet'
        };
        return statusMap[status] || status || 'Unbekannt';
    }

    // Mappe Prozess-Status zu lesbarem Text
    mapProcessStatus(status) {
        const statusMap = {
            'A1': 'Unbestätigt',
            'A2': 'In Bearbeitung',
            'A3': 'Feinplanung',
            'A4': 'Bestätigt',
            'A6': 'In Inventur',
            'A8': 'Abgeschlossen',
            'A9': 'Archiviert'
        };
        return statusMap[status] || status || 'Unbekannt';
    }

    // Update FM item
    async updateFM(id, data) {
        // TODO: Replace with real API call
        // return await this.call(`/fm/fertigungsmittel/${id}`, 'PUT', data);

        return { success: true, message: 'FM aktualisiert (Mock)' };
    }

    // === Inventur Endpoints ===

    // Get inventory list
    async getInventoryList(filters = {}) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                // Status ist erforderlich - I1 = offene Inventuren
                const statuses = filters.status || ['I1'];
                statuses.forEach(s => params.append('status', s));

                // Lieferantennummer als query (Freitext-Suche)
                params.append('query', this.supplierNumber);

                // Pagination
                params.append('limit', filters.limit || 10000);
                params.append('skip', filters.skip || 0);

                // Optionale Filter
                if (filters.city) params.append('city', filters.city);
                if (filters.type) params.append('type', filters.type);

                // Partitionen anzeigen für Details
                params.append('showPartitions', 'true');

                const endpoint = `/inventory-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                const items = Array.isArray(response) ? response : (response.data || []);
                const transformedData = items.map((item, index) => ({
                    id: item.context?.key || index,
                    inventoryKey: item.context?.key || '',
                    number: item.meta?.partNumbers?.split(' ')[0] || item.context?.key || '',
                    name: item.meta?.description || 'Inventur',
                    location: item.meta?.assetCity ? `${item.meta.assetCity}, ${item.meta.assetCountry || ''}`.replace(/, $/, '') : (item.meta?.locationText || 'Standort nicht verfügbar'),
                    locationId: 'loc1',
                    dueDate: item.meta?.dueDate ? item.meta.dueDate.split('T')[0] : null,
                    responsible: item.meta?.assignedUsername || item.meta?.responsibleUser || 'N/A',
                    lastChange: null,
                    comment: '',
                    inventoryType: item.meta?.type || '',
                    status: item.meta?.status || 'I1',
                    assetCount: item.meta?.assetCount || 0,
                    assetsAccepted: item.meta?.acceptedAssets || 0,
                    partNumbers: item.meta?.partNumbers || '',
                    originalData: item
                }));

                // Extrahiere Lieferanten-Info aus erstem Item
                let supplierInfo = null;
                if (items.length > 0) {
                    // supplier kann "DAS DRAEXLMAIER (133188)" Format haben
                    const supplierRaw = items[0].meta?.supplier || '';
                    const match = supplierRaw.match(/^(.+?)\s*\((\d+)\)$/);
                    if (match) {
                        supplierInfo = {
                            name: match[1].trim(),
                            number: match[2]
                        };
                    } else if (supplierRaw) {
                        supplierInfo = {
                            name: supplierRaw,
                            number: this.supplierNumber
                        };
                    }
                }

                return {
                    success: true,
                    data: transformedData,
                    total: transformedData.length,
                    supplier: supplierInfo
                };
            },
            // Mock fallback
            () => this.getMockInventoryData(filters)
        );
    }


    // Get positions for a specific inventory
    async getInventoryPositions(inventoryKey, filters = {}) {
        const params = new URLSearchParams();

        // Optional status filter (P0-P6)
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            statuses.forEach(s => params.append('status', s));
        }

        // Pagination
        params.append('limit', filters.limit || 10000);
        params.append('offset', filters.offset || 0);

        const endpoint = `/inventory/${inventoryKey}/positions?${params.toString()}`;
        const response = await this.call(endpoint, 'GET');

        // Transform API response - each position becomes one entry
        const positions = Array.isArray(response) ? response : (response.data || []);

        const transformedData = positions.map((pos, index) => {
            // Try multiple paths for each field
            const inventoryNum = pos.asset?.meta?.inventoryNumber
                || pos.meta?.inventoryNumber
                || pos.inventoryNumber
                || pos.asset?.inventoryNumber
                || '';

            const assetName = pos.asset?.meta?.description
                || pos.asset?.meta?.assetName
                || pos.meta?.description
                || pos.description
                || pos.name
                || 'Unbekannt';

            const locationStr = pos.location?.meta?.city
                ? `${pos.location.meta.city}, ${pos.location.meta.country || ''}`.replace(/, $/, '')
                : (pos.location?.city
                    ? `${pos.location.city}, ${pos.location.country || ''}`.replace(/, $/, '')
                    : (pos.asset?.meta?.supplier || pos.locationText || ''));

            return {
                // Position identifiers
                id: pos.context?.key || pos.key || pos.id || index,
                positionKey: pos.context?.key || pos.key || '',
                revision: pos.revision || '',

                // Asset data - INVENTARNUMMER hier!
                inventoryNumber: inventoryNum,
                number: inventoryNum,  // Für Kompatibilitaet
                name: assetName,
                assetKey: pos.asset?.context?.key || pos.assetKey || '',

                // Location from position or asset
                location: locationStr,
                locationKey: pos.location?.context?.key || pos.locationKey || '',
                locationDetails: pos.location?.meta || pos.location || null,

                // Inventory context
                inventoryKey: pos.inventory?.context?.key || pos.inventoryKey || '',
                inventoryStatus: pos.inventory?.meta?.status || pos.inventoryStatus || '',
                inventoryType: pos.inventory?.meta?.type || pos.inventoryType || '',

                // Position status and metadata
                status: pos.meta?.status || pos.status || 'P0',
                comment: pos.meta?.comment || pos.comment || '',
                dueDate: pos.meta?.dueDate || pos.dueDate || pos.inventory?.meta?.dueDate || null,

                // Assignment
                responsible: pos.assignedUser?.meta
                    ? `${pos.assignedUser.meta.firstName || ''} ${pos.assignedUser.meta.lastName || ''}`.trim()
                    : (pos.responsible || pos.assignedUser || 'N/A'),

                // Additional asset info
                partNumber: pos.asset?.meta?.factNumberAI || pos.partNumber || '',
                project: pos.asset?.meta?.project || pos.project || '',
                supplier: pos.asset?.meta?.supplier || pos.supplier || '',

                // Original data for reference
                originalData: pos
            };
        });

        return {
            success: true,
            data: transformedData,
            total: transformedData.length
        };
    }

    // Update inventory item
    async updateInventoryItem(id, data) {
        // TODO: Replace with real API call
        // return await this.call(`/inventur/${id}`, 'PUT', data);

        return { success: true, message: 'Inventur aktualisiert (Mock)' };
    }

    // === Planning Endpoints ===

    // Get planning data
    async getPlanningData(filters = {}) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                if (this.supplierNumber) params.append('supplier', this.supplierNumber);
                if (filters.status) params.append('status', filters.status);
                if (filters.location) params.append('location', filters.location);
                params.append('limit', '100');

                const endpoint = `/asset-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');
                const rawData = Array.isArray(response) ? response : (response.data || []);

                // Transform API response - use same mapping as getFMData
                const items = rawData.map((item, index) => {
                    const city = item.meta?.assetCity || '';
                    const country = item.meta?.assetCountry || '';
                    const locationStr = city && country ? `${city}, ${country}` : (city || country || '-');

                    return {
                        id: item.context?.key || index + 1,
                        number: item.meta?.inventoryNumber || item.context?.key || '-',
                        name: item.meta?.inventoryText || item.meta?.partNumberText || 'Unbekanntes Werkzeug',
                        location: locationStr,
                        locationKey: item.meta?.locationKey || '',
                        dueDate: item.meta?.['p.inv.plan.due'] || this.calculateDueDate(index),
                        planDate: item.meta?.['p.inv.plan.start'] || '',
                        inventoryType: item.meta?.inventoryType || 'IA',
                        supplier: item.meta?.supplier || '',
                        status: item.meta?.status || '',
                        processStatus: item.meta?.processStatus || ''
                    };
                });

                return {
                    success: true,
                    data: items,
                    total: items.length
                };
            },
            // Mock fallback
            () => this.getMockPlanningData(filters)
        );
    }

    // Helper: Calculate due date for planning
    calculateDueDate(index) {
        const date = new Date();
        date.setMonth(date.getMonth() + (index % 6) + 1);
        return date.toISOString().split('T')[0];
    }

    // === Mock Data Methods (werden später entfernt) ===
    // ZENTRALE WERKZEUG-DATEN - FIXE Testdaten
    // - 240 Werkzeuge für FM-Liste und Detail
    // - Davon erste 50 für Inventur und Planung

    generateFixedTestData() {
        const toolTypes = [
            'Presswerkzeug', 'Tiefziehwerkzeug', 'Stanzwerkzeug', 
            'Biegewerkzeug', 'Schneidwerkzeug', 'Ziehwerkzeug', 
            'Umformwerkzeug', 'Folgewerkzeug', 'Prägewerkzeug', 'Bördelwerkzeug'
        ];
        
        const parts = [
            'A-Säule links', 'A-Säule rechts', 'B-Säule links', 'B-Säule rechts', 'C-Säule links',
            'Motorhaube', 'Türblech vorn links', 'Türblech vorn rechts', 'Türblech hinten links', 'Türblech hinten rechts',
            'Dachholm', 'Dachblech', 'Heckklappe', 'Kofferraumdeckel', 'Kotflügel vorn',
            'Seitenteil links', 'Seitenteil rechts', 'Seitenwand', 'Bodenblech', 'Radhaus hinten',
            'Querträger vorn', 'Querträger hinten', 'Längsträger', 'Schweller links', 'Schweller rechts',
            'Radlauf', 'Tankdeckel', 'Stoßfänger vorn', 'Stoßfänger hinten', 'Fensterrahmen',
            'VIN-Plakette', 'Typenschild', 'Kennzeichnung', 'Verkleidung', 'Abdeckung',
            'Verstrebung', 'Verstärkung', 'Winkel', 'Halterung', 'Befestigung',
            'Konsole', 'Lasche', 'Blende', 'Strebe', 'Aufnahme',
            'Profil', 'Einfassung', 'Grill', 'Platte', 'Träger'
        ];

        const locations = [
            'Halle A - Regal 1', 'Halle A - Regal 2', 'Halle A - Regal 3',
            'Halle B - Lager 1', 'Halle B - Lager 2',
            'Halle C - Werkstatt', 'Halle C - Montage',
            'Außenlager Nord', 'Außenlager Süd',
            'Montage Bereich 1'
        ];

        const locationIds = ['loc1', 'loc2', 'loc3', 'loc4', 'loc5'];
        const inventoryTypes = ['IA', 'IB', 'IC', 'ID'];
        
        // FIXES Startdatum für konsistente Datumsberechnung
        const baseDate = new Date('2025-11-17'); // Fixes Datum statt new Date()

        const tools = [];
        
        for (let i = 1; i <= 240; i++) {
            const toolType = toolTypes[(i - 1) % toolTypes.length];
            const part = parts[(i - 1) % parts.length];
            const paddedNum = String(i).padStart(4, '0');
            
            // Generiere Werkzeugnummer: z.B. "PRE-2023-0045"
            const year = 2021 + ((i - 1) % 4);
            const toolNumber = `${toolType.substring(0, 3).toUpperCase()}-${year}-${paddedNum}`;
            
            // Location abwechselnd
            const locationIdx = (i - 1) % locations.length;
            const locationIdIdx = (i - 1) % locationIds.length;
            
            // Status: verteilt über offen, feinplanung, in-inventur (gleichmäßig über 240)
            let status;
            if (i <= 80) status = 'offen';
            else if (i <= 160) status = 'feinplanung';
            else status = 'in-inventur';
            
            // Letzte Inventur: verteilt über 2024
            const lastInventoryMonth = ((i - 1) % 12);
            const lastInventoryDay = ((i - 1) % 28) + 1;
            const lastInventory = new Date(2024, lastInventoryMonth, lastInventoryDay);
            
            // Startdatum für Planung: verteilt über nächste 12 Monate
            const startDaysOffset = ((i - 1) * 7) - 30; // Startet 30 Tage in Vergangenheit, dann je 7 Tage versetzt
            const startDate = new Date(baseDate);
            startDate.setDate(baseDate.getDate() + startDaysOffset);
            
            // Fälligkeitsdatum: 14 Tage vor Startdatum
            const dueDate = new Date(startDate);
            dueDate.setDate(startDate.getDate() - 14);
            
            // Inventurtyp: rotierend
            const inventoryType = inventoryTypes[(i - 1) % inventoryTypes.length];
            
            // Asset-Nummern
            const assetNumber = `10${String(1000000 + i).substring(1)}`;
            const supplierAssetNumber = `BOSCH-${year}-${paddedNum}`;
            
            tools.push({
                id: i,
                number: `FM-${paddedNum}`,
                toolNumber: toolNumber,
                name: `${toolType} ${part}`,
                supplier: 'Bosch Rexroth AG',
                location: locations[locationIdx],
                locationId: locationIds[locationIdIdx],
                status: status,
                lastInventory: lastInventory.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                startDate: startDate.toISOString().split('T')[0],
                inventoryType: inventoryType,
                assetNumber: assetNumber,
                supplierAssetNumber: supplierAssetNumber,
                lifecycleStatus: 'Aktiv',
                processStatus: 'Bestätigt'
            });
        }
        
        return tools;
    }

    getMockFMData(filters = {}) {
        // Greife auf gecachte Daten zu
        const items = this.mockToolsCache.map(tool => ({
            id: tool.id,
            number: tool.number,
            toolNumber: tool.toolNumber,
            name: tool.name,
            supplier: tool.supplier,
            location: tool.location,
            status: tool.status,
            lastInventory: tool.lastInventory
        }));

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

    getMockFMDetail(id) {
        // Greife auf gecachte Daten zu
        const tool = this.mockToolsCache.find(t => t.id == id);

        if (!tool) {
            console.error('Tool not found for ID:', id);
            return Promise.resolve({
                success: false,
                error: 'Werkzeug nicht gefunden'
            });
        }

        return Promise.resolve({
            success: true,
            data: {
                id: tool.id,
                number: tool.number,
                toolNumber: tool.toolNumber,
                name: tool.name,
                assetNumber: tool.assetNumber,
                supplierAssetNumber: tool.supplierAssetNumber,
                lifecycleStatus: tool.lifecycleStatus,
                processStatus: tool.processStatus,
                client: {
                    company: 'BMW AG (A1)'
                },
                contractor: {
                    company: 'Bosch Rexroth AG (100542)'
                },
                location: {
                    company: 'Bosch Rexroth AG (100542)',
                    address: 'Bgm.-Dr.-Nebel-Str. 2',
                    postalCode: '97816',
                    city: 'Lohr am Main',
                    country: 'DE'
                },
                finance: {
                    customsTariffNumber: '8466200000',
                    acquisitionCost: `${(150000 + (tool.id * 10000)).toLocaleString('de-DE')},00 EUR`,
                    residualBookValue: `${(50000 + (tool.id * 3000)).toLocaleString('de-DE')},00 EUR`
                }
            }
        });
    }

    getMockInventoryData(filters = {}) {
        // Greife auf gecachte Daten zu - nur die ersten 50
        const responsiblePersons = [
            'Max Mustermann', 'Anna Schmidt', 'Peter Weber', 'Lisa Müller',
            'Thomas Becker', 'Sarah Klein', 'Michael Wagner', 'Julia Fischer'
        ];

        const items = this.mockToolsCache.slice(0, 50).map((tool, index) => ({
            id: tool.id,
            name: tool.name,
            number: tool.toolNumber,
            location: tool.location,
            dueDate: tool.dueDate,
            responsible: responsiblePersons[index % responsiblePersons.length],
            lastChange: tool.lastInventory,
            comment: ''
        }));

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length,
            supplier: {
                name: 'Bosch Rexroth AG',
                number: this.supplierNumber
            }
        });
    }

    getMockPlanningData(filters = {}) {
        // Greife auf gecachte Daten zu - nur die ersten 50
        const items = this.mockToolsCache.slice(0, 50).map(tool => ({
            id: tool.id,
            name: tool.name,
            number: tool.toolNumber,
            location: tool.locationId,
            dueDate: tool.dueDate,
            startDate: tool.startDate,
            inventoryType: tool.inventoryType,
            status: 'pending',
            selected: false
        }));

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

// === ABL (Abnahmebereitschaftserklaerung) Endpoints ===
    // ABL = Inventur mit Typ ID (Abnahmebereitschaft)
    // Nutzt /inventory-list mit type=ID Filter
    // Asset processStatus: A8 (geplant), A9 (in Durchführung)

    async getABLList(filters = {}) {
        return this.callWithFallback(
            // Live API call - nutze inventory-list mit type=ID
            async () => {
                const params = new URLSearchParams();

                // Inventur-Typ ID = Abnahmebereitschaft
                params.append('type', 'ID');

                // Status-Filter (I0=geplant, I1=laufend, I2=durchgefuehrt)
                const statuses = filters.status || ['I0', 'I1'];
                statuses.forEach(s => params.append('status', s));

                // Supplier-Filter via query
                if (this.supplierNumber) {
                    params.append('query', this.supplierNumber);
                }

                // Pagination
                params.append('limit', filters.limit || 10000);
                params.append('skip', filters.skip || 0);

                // Partitionen anzeigen
                params.append('showPartitions', 'true');

                const endpoint = `/inventory-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response
                const items = Array.isArray(response) ? response : (response.data || []);

                const transformedData = items.map((item, index) => {
                    const meta = item.meta || {};
                    const context = item.context || {};

                    // Identifier: meta.identifier ist oft ein JSON-String, nicht nutzbar
                    // Nutze orders (z.B. "4438914-177") oder context.key als ABL-Nr.
                    const keyShort = context.key ? context.key.substring(0, 8) : '';
                    let identifier = '';

                    // Priorität: orders > partNumbers (wenn String) > key-Anfang
                    if (meta.orders && typeof meta.orders === 'string') {
                        identifier = meta.orders;
                    } else if (meta.partNumbers && typeof meta.partNumbers === 'string') {
                        identifier = meta.partNumbers.split(' ')[0];
                    } else {
                        identifier = keyShort || String(index + 1);
                    }

                    const partNumberStr = (meta.partNumbers && typeof meta.partNumbers === 'string')
                        ? meta.partNumbers.split(' ')[0]
                        : '';

                    // Standort: Versuche verschiedene Felder
                    let locationStr = '';
                    if (meta.assetCity && meta.assetCountry) {
                        locationStr = `${meta.assetCity}, ${meta.assetCountry}`;
                    } else if (meta.assetCity) {
                        locationStr = meta.assetCity;
                    } else if (meta.assetCountry) {
                        locationStr = meta.assetCountry;
                    } else if (meta.locationText) {
                        locationStr = meta.locationText;
                    } else if (meta.location) {
                        locationStr = typeof meta.location === 'string' ? meta.location : '';
                    }

                    // Fortschritt berechnen
                    const assetCount = meta.assetCount || 0;
                    const acceptedAssets = meta.acceptedAssets || 0;
                    const progress = assetCount > 0 ? Math.round((acceptedAssets / assetCount) * 100) : 0;

                    // Titel/Description sicher extrahieren
                    let titleStr = '';
                    if (typeof meta.description === 'string') {
                        titleStr = meta.description;
                    } else if (typeof meta.title === 'string') {
                        titleStr = meta.title;
                    } else if (typeof meta.name === 'string') {
                        titleStr = meta.name;
                    }
                    if (!titleStr) titleStr = 'Abnahmebereitschaft';

                    // Supplier sicher extrahieren
                    let supplierStr = '';
                    if (typeof meta.supplier === 'string') {
                        supplierStr = meta.supplier;
                    } else if (meta.supplier && typeof meta.supplier === 'object' && meta.supplier.name) {
                        supplierStr = meta.supplier.name;
                    }

                    return {
                        // Keys für Navigation
                        id: context.key || index,
                        key: context.key || '',
                        inventoryKey: context.key || '',
                        // ABL-Nummer / Identifier (für Anzeige)
                        identifier: identifier,
                        inventoryNumber: partNumberStr,
                        partNumbers: partNumberStr,
                        // Titel / Bezeichnung
                        title: titleStr,
                        name: titleStr,
                        // Lieferant
                        supplier: supplierStr,
                        supplierName: supplierStr.replace(/\s*\(\d+\)$/, ''),
                        // Standort
                        location: locationStr,
                        assetCity: meta.assetCity || '',
                        assetCountry: meta.assetCountry || '',
                        // Status
                        inventoryStatus: meta.status || 'I0',
                        status: this.mapABLInventoryStatus(meta.status),
                        inventoryType: meta.type || 'ID',
                        // Termine
                        dueDate: meta.dueDate ? meta.dueDate.split('T')[0] : null,
                        createdAt: meta.created || null,
                        // Zaehler und Fortschritt
                        assetCount: assetCount,
                        acceptedAssets: acceptedAssets,
                        positionsTotal: assetCount,
                        positionsDone: acceptedAssets,
                        progress: progress,
                        // Verantwortlicher
                        responsible: meta.assignedUsername || meta.responsibleUser || '',
                        // Original-Daten
                        originalData: item
                    };
                });

                return {
                    success: true,
                    data: transformedData,
                    total: transformedData.length
                };
            },
            // Mock fallback
            () => this.getMockABLData(filters)
        );
    }

    // ABL Inventur-Status Mapping
    mapABLInventoryStatus(inventoryStatus) {
        const statusMap = {
            'I0': 'geplant',        // Geplant, noch nicht versandt
            'I1': 'laufend',        // An Lieferant versandt
            'I2': 'durchgefuehrt',  // Lieferant hat zurückgemeldet
            'I3': 'akzeptiert',     // Owner hat akzeptiert
            'I4': 'abgeschlossen'   // Abgeschlossen
        };
        return statusMap[inventoryStatus] || 'unbekannt';
    }

    // ABL Positionen abrufen (einzelne Assets)
    async getABLPositions(inventoryKey, filters = {}) {
        const params = new URLSearchParams();

        // Status-Filter
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            statuses.forEach(s => params.append('status', s));
        }

        // Pagination
        params.append('limit', filters.limit || 10000);
        params.append('offset', filters.offset || 0);

        const endpoint = `/inventory/${inventoryKey}/positions?${params.toString()}`;
        const response = await this.call(endpoint, 'GET');

        // Transform positions
        const positions = Array.isArray(response) ? response : (response.data || []);
        const transformedPositions = positions.map((pos, index) => {
            const meta = pos.meta || {};
            const assetMeta = meta.asset || {};

            return {
                id: pos.key || index,
                positionKey: pos.key || '',
                revision: pos.revision || 0,
                // Asset-Daten
                assetKey: meta.assetKey || '',
                inventoryNumber: meta['asset.inventoryNumber'] || assetMeta.inventoryNumber || '',
                toolNumber: meta['asset.orderNumber'] || assetMeta.orderNumber || '',
                name: meta['asset.inventoryText'] || assetMeta.inventoryText || '',
                // Standort
                location: meta['asset.assetCity'] && meta['asset.assetCountry']
                    ? `${meta['asset.assetStreet'] || ''}, ${meta['asset.assetPostcode'] || ''} ${meta['asset.assetCity']}, ${meta['asset.assetCountry']}`.trim().replace(/^,\s*/, '')
                    : '',
                assetCity: meta['asset.assetCity'] || '',
                assetCountry: meta['asset.assetCountry'] || '',
                // Geo-Daten (falls vorhanden)
                latitude: meta.latitude || meta['asset.latitude'] || null,
                longitude: meta.longitude || meta['asset.longitude'] || null,
                // Status
                positionStatus: meta.status || 'P0',
                status: this.mapABLPositionStatus(meta.status),
                locationState: meta.locationState || 'PS0',
                imageState: meta.imageState || 'PS0',
                documentsState: meta.documentsState || 'PS0',
                // Validierungszustand
                hasPhotos: meta.imageState === 'PS3',
                hasLocation: meta.locationState === 'PS3',
                hasDocuments: meta.documentsState === 'PS3',
                // Kommentare
                comment: meta.comment || '',
                resultComment: meta.resultComment || '',
                // Original
                originalData: pos
            };
        });

        return {
            success: true,
            data: transformedPositions,
            total: transformedPositions.length
        };
    }

    // ABL Position-Status Mapping
    mapABLPositionStatus(positionStatus) {
        const statusMap = {
            'P0': 'neu',
            'P1': 'laufend',
            'P2': 'gemeldet',
            'P3': 'ergebnis',
            'P4': 'abgeschlossen',
            'P5': 'akzeptiert',
            'P6': 'abgelehnt'
        };
        return statusMap[positionStatus] || 'unbekannt';
    }

    // ABL Position melden (Abnahme durchführen)
    async reportABLPosition(inventoryKey, positionKey, revision, data) {
        return this.callWithFallback(
            async () => {
                const endpoint = `/inventory/${inventoryKey}/${positionKey}/${revision}/report`;
                const response = await this.call(endpoint, 'PATCH', {
                    locationState: data.locationState || 'PS3',
                    imageState: data.imageState || 'PS3',
                    documentsState: data.documentsState || 'PS3',
                    comment: data.comment || '',
                    ...data
                });
                return {
                    success: true,
                    data: response.data || response
                };
            },
            () => ({ success: false, error: 'Meldung fehlgeschlagen' })
        );
    }

    // ABL Position akzeptieren
    async acceptABLPosition(inventoryKey, positionKey, revision) {
        return this.callWithFallback(
            async () => {
                const endpoint = `/inventory/${inventoryKey}/${positionKey}/${revision}/accept`;
                const response = await this.call(endpoint, 'PATCH');
                return {
                    success: true,
                    data: response.data || response
                };
            },
            () => ({ success: false, error: 'Akzeptierung fehlgeschlagen' })
        );
    }

    getMockABLData(filters = {}) {
        const cities = ['Muenchen', 'Stuttgart', 'Ingolstadt', 'Regensburg', 'Landshut'];
        const countries = ['DE', 'AT', 'CZ'];
        const projects = ['G70', 'G80', 'G90', 'U11', 'U12'];

        const today = new Date();
        const items = [];
        for (let i = 1; i <= 12; i++) {
            const city = cities[(i - 1) % cities.length];
            const country = countries[(i - 1) % countries.length];

            // Status-Verteilung: 5 geplant (I0), 4 laufend (I1), 3 durchgefuehrt (I2)
            let inventoryStatus = 'I0';
            if (i > 5 && i <= 9) inventoryStatus = 'I1';
            else if (i > 9) inventoryStatus = 'I2';

            // Fälligkeitsdatum
            const dueDate = new Date(today);
            if (i <= 3) {
                // Überfällig
                dueDate.setDate(today.getDate() - (5 * i));
            } else {
                dueDate.setDate(today.getDate() + (7 * (i - 3)));
            }

            items.push({
                id: i,
                inventoryKey: `abl-inv-${1000 + i}`,
                inventoryNumber: String(10056190 + i),
                partNumbers: `${10056190 + i} ${10056200 + i}`,
                name: `ABL ${city} - ${projects[(i - 1) % projects.length]}`,
                supplier: `Lieferant GmbH (${this.supplierNumber || '133188'})`,
                supplierName: 'Lieferant GmbH',
                location: `${city}, ${country}`,
                assetCity: city,
                assetCountry: country,
                inventoryStatus: inventoryStatus,
                status: this.mapABLInventoryStatus(inventoryStatus),
                inventoryType: 'ID',
                dueDate: dueDate.toISOString().split('T')[0],
                createdAt: new Date(today.getTime() - (i * 2 * 24 * 60 * 60 * 1000)).toISOString(),
                assetCount: 2 + (i % 5),
                acceptedAssets: inventoryStatus === 'I2' ? 2 + (i % 5) : (inventoryStatus === 'I1' ? Math.floor((2 + (i % 5)) / 2) : 0),
                responsible: i % 3 === 0 ? 'Max Mustermann' : (i % 3 === 1 ? 'Erika Musterfrau' : '')
            });
        }

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }


        // === Verlagerung (Relocation) Endpoints ===

    // Get list of relocation processes
    async getVerlagerungList(filters = {}) {
        if (this.mode === 'mock') {
            return this.getMockVerlagerungData(filters);
        }

        try {
            // OPTIMIERT v2: Server-seitiger Filter nach RELOCATION.C + contractPartner
            // Wie in Produktions-App: /process?md.p.type=RELOCATION.C&md.contractPartner=XXX
            // Vorher: Alle 906 Verlagerungen laden, dann client-seitig filtern
            // Jetzt: Nur die relevanten Verlagerungen für diesen Supplier laden
            const params = new URLSearchParams();
            params.append('limit', filters.limit || 10000);
            params.append('skip', filters.skip || 0);
            params.append('md.p.type', 'RELOCATION.C');  // Unterprozesse (haben Details)

            // Server-seitiger Supplier-Filter!
            const supplierNumber = this.supplierNumber;
            if (supplierNumber) {
                params.append('md.contractPartner', supplierNumber);
            }

            let endpoint = `/process?${params.toString()}`;
            const processList = await this.call(endpoint, 'GET');

            // Die API liefert bereits gefilterte Prozesse für diesen Supplier
            const filteredBySupplier = Array.isArray(processList) ? processList : (processList.data || []);

            // Parent-Prozesse laden um Standort-Daten zu bekommen
            // RELOCATION.C hat pp.pid der auf den RELOCATION Parent verweist
            const parentIds = [...new Set(filteredBySupplier
                .map(p => p.meta?.['pp.pid'])
                .filter(Boolean))];

            // Lade alle Parents parallel
            const parentMap = {};
            if (parentIds.length > 0) {
                const parentPromises = parentIds.map(pid =>
                    this.call(`/process/${pid}`, 'GET').catch(() => null)
                );
                const parentResults = await Promise.all(parentPromises);
                parentResults.forEach((result, idx) => {
                    if (result) {
                        const parent = result.data || result;
                        parentMap[parentIds[idx]] = parent.meta || {};
                    }
                });
            }

            const transformedData = filteredBySupplier.map((item, index) => {
                const meta = item.meta || {};
                const parentMeta = parentMap[meta['pp.pid']] || {};

                // Identifier aus Parent 'title' Feld (wie in Detail-Ansicht)
                // Format: "AT-Braunau ⇢ DE-Radolfzell-[Ownership]"
                const identifier = parentMeta.title ||
                                   meta.title ||
                                   parentMeta.description ||
                                   meta.description ||
                                   '';

                // Standorte: Parse aus 'title' (wie in Detail-Ansicht)
                // Die API liefert keine Adress-Felder direkt
                let sourceLocation = '';
                let targetLocation = '';

                const title = parentMeta.title || meta.title || '';
                if (title && title.includes('⇢')) {
                    // Unicode arrow ⇢ ist das Trennzeichen
                    const parts = title.split('⇢').map(p => p.trim());
                    if (parts.length >= 2) {
                        sourceLocation = parts[0]; // z.B. "AT-Braunau"
                        // Target: entferne [Ownership] suffix
                        targetLocation = parts[1].replace(/-\[.*\]$/, '').trim();
                    }
                }

                // Fallback: Versuche Company-Namen zu verwenden
                if (!sourceLocation) {
                    sourceLocation = parentMeta['relo.from.companyName'] || '';
                }
                if (!targetLocation) {
                    targetLocation = parentMeta['relo.to.companyName'] || meta['relo.to.companyName'] || '';
                }

                // Datum aus Child (hat aktuellere Werte)
                const arrivalDate = meta['relo.arrival'] ||
                                    parentMeta['relo.arrival'] ||
                                    meta.dueDate ||
                                    null;

                const departureDate = meta['relo.departure'] ||
                                      parentMeta['relo.departure'] ||
                                      null;

                return {
                    id: item.key || item.context?.key || index,
                    processKey: item.key || item.context?.key || '',
                    parentProcessKey: meta['pp.pid'] || '',
                    // Name/Beschreibung
                    number: meta.description?.split(' - ')[0] || meta.name || meta.number || `VRL-${String(index + 1).padStart(4, '0')}`,
                    name: parentMeta.description || meta.description || meta.name || 'Verlagerung',
                    // Identifier
                    identifier: identifier,
                    // Vertragspartner
                    supplier: meta.contractPartner || meta.supplier || '',
                    supplierName: meta.contractPartnerName || parentMeta.contractPartnerName || '',
                    // Standorte (aus Parent!)
                    sourceLocation: sourceLocation,
                    targetLocation: targetLocation,
                    sourceCompany: parentMeta['relo.from.companyName'] || parentMeta['relo.from.company'] || '',
                    targetCompany: parentMeta['relo.to.companyName'] || meta['relo.to.companyName'] || '',
                    // Termine
                    departureDate: departureDate,
                    arrivalDate: arrivalDate,
                    dueDate: arrivalDate,
                    // Bearbeiter
                    creator: meta['creator.key'] || meta['relo.creator'] || '',
                    creatorName: meta['creator.name'] || meta['relo.creatorName'] || '',
                    assignedUser: meta['relo.currentUser.key'] || meta.assignedUser || '',
                    assignedUserName: meta['relo.currentUser.name'] || '',
                    // Status
                    status: this.mapRelocationStatus(meta['p.status'] || meta.status),
                    // Erstellt am
                    createdAt: meta.created || meta.createdAt || null,
                    // Anzahl Positionen
                    assetCount: meta['p.size'] || meta.positionCount || 0,
                    // Typ des Prozesses
                    processType: meta['p.type'] || '',
                    // Original-Daten
                    originalData: item,
                    parentData: parentMap[meta['pp.pid']] || null
                };
            });

            // Debug: Zeige ersten Eintrag mit allen meta-Feldern
            if (filteredBySupplier.length > 0) {
                const sampleMeta = filteredBySupplier[0].meta || {};
            }

            // Debug: Zeige transformiertes Ergebnis
            if (transformedData.length > 0) {
                const sample = transformedData[0];
            }

            return {
                success: true,
                data: transformedData,
                total: transformedData.length,
                debug: { totalProcesses: filteredBySupplier.length }
            };
        } catch (error) {
            console.error('Error loading relocations:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Get relocation process details
    async getRelocationDetail(processKey) {
        if (this.mode === 'mock') {
            return this.getMockRelocationDetail(processKey);
        }

        try {
            const response = await this.call(`/process/${processKey}`, 'GET');

            const item = response.data || response;
            let meta = item.meta || {};

            // Lade Parent-Prozess für Standort-Daten
            let parentMeta = {};
            const parentKey = meta['pp.pid'];

            if (parentKey) {
                try {
                    const parentResponse = await this.call(`/process/${parentKey}`, 'GET');
                    const parentItem = parentResponse.data || parentResponse;
                    parentMeta = parentItem.meta || {};
                } catch (e) {
                    console.warn('Could not load parent process:', e);
                }
            }

            // Standorte: Die API liefert KEINE Adress-Felder!
            // Adressen müssen über Company/Location API geladen werden
            // Vorlaeufig: Parse aus 'title' (Format: "AT-Ort -> DE-Ort-[Ownership]")
            let sourceLocation = '';
            let targetLocation = '';

            const title = parentMeta.title || meta.title || '';
            if (title && title.includes('\u21e2')) {
                // Unicode arrow \u21e2 ist das Trennzeichen
                const parts = title.split('\u21e2').map(p => p.trim());
                if (parts.length >= 2) {
                    sourceLocation = parts[0]; // z.B. "AT-Braunau"
                    // Target: entferne [Ownership] suffix
                    targetLocation = parts[1].replace(/-\[.*\]$/, '').trim();
                }
            }

            // Fallback: Versuche Company-Namen zu verwenden
            if (!sourceLocation) {
                sourceLocation = parentMeta['relo.from.companyName'] || '';
            }
            if (!targetLocation) {
                targetLocation = parentMeta['relo.to.companyName'] || meta['relo.to.companyName'] || '';
            }

            // Identifier aus Parent 'title' Feld (z.B. "AT-Braunau -> DE-Radolfzell...")
            const identifier = parentMeta.title ||
                               meta.title ||
                               parentMeta.description ||
                               meta.description ||
                               '';

            return {
                success: true,
                data: {
                    id: item.key || processKey,
                    processKey: item.key || processKey,
                    parentProcessKey: parentKey || '',
                    number: meta.description?.split(' - ')[0] || meta.number || '',
                    name: parentMeta.description || meta.description || 'Verlagerung',
                    identifier: identifier,
                    status: this.mapRelocationStatus(meta['p.status'] || meta.status),
                    // Vertragspartner
                    supplier: meta.contractPartner || '',
                    supplierName: meta.contractPartnerName || parentMeta.contractPartnerName || '',
                    // Standorte (primaer aus Parent!)
                    sourceLocation: sourceLocation,
                    targetLocation: targetLocation,
                    sourceCompany: parentMeta['relo.from.companyName'] || '',
                    targetCompany: parentMeta['relo.to.companyName'] || meta['relo.to.companyName'] || '',
                    // Termine
                    departureDate: meta['relo.departure'] || parentMeta['relo.departure'] || null,
                    arrivalDate: meta['relo.arrival'] || parentMeta['relo.arrival'] || null,
                    dueDate: meta['relo.arrival'] || parentMeta['relo.arrival'] || null,
                    // Bearbeiter
                    creator: meta['creator.key'] || '',
                    creatorName: meta['creator.name'] || '',
                    assignedUser: meta['relo.currentUser.key'] || meta.assignedUser || '',
                    assignedUserName: meta['relo.currentUser.name'] || '',
                    // Erstellt am
                    createdAt: meta.created || null,
                    finishedAt: meta.finished || null,
                    // Anzahl Positionen
                    assetCount: meta['p.size'] || 0,
                    // Original-Daten
                    originalData: item,
                    parentData: parentMeta
                }
            };
        } catch (error) {
            console.error('Get relocation detail error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get positions/assets for a relocation process
    async getRelocationPositions(processKey, filters = {}) {
        if (this.mode === 'mock') {
            return this.getMockRelocationPositions(processKey);
        }

        try {
            const params = new URLSearchParams();
            params.append('limit', filters.limit || 10000);
            params.append('skip', filters.skip || 0);

            const endpoint = `/process/${processKey}/positions?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            const positions = Array.isArray(response) ? response : (response.data || []);

            const transformedData = positions.map((pos, index) => {
                // WICHTIG: Asset-Daten sind in pos.meta mit "asset." Prefix, NICHT in pos.asset!
                const posMeta = pos.meta || {};

                // Inventarnummer: pos.meta['asset.inventoryNumber']
                const invNr = posMeta['asset.inventoryNumber'] ||
                              posMeta['asset.number'] ||
                              posMeta['ref.key'] ||
                              '';

                // Beschreibung: pos.meta['asset.inventoryText']
                const description = posMeta['asset.inventoryText'] ||
                                    posMeta['asset.description'] ||
                                    posMeta['asset.name'] ||
                                    'Unbekannt';

                // Standort: aus actualDestination oder asset.*
                const destMeta = pos.actualDestination?.meta || pos.plannedDestination?.meta || {};
                const currentLoc = posMeta['asset.assetCity'] && posMeta['asset.assetCountry']
                    ? `${posMeta['asset.assetCity']}, ${posMeta['asset.assetCountry']}`
                    : '';
                const targetLoc = destMeta.city && destMeta.country
                    ? `${destMeta.street || ''} ${destMeta.postcode || ''} ${destMeta.city} ${destMeta.country}`.trim()
                    : '';

                return {
                    id: pos.key || index,
                    positionKey: pos.key || '',
                    assetKey: posMeta['ref.key'] || '',
                    inventoryNumber: invNr,
                    name: description,
                    // Kombiniere: "Beschreibung - Inventarnummer" wie in Prod-App
                    displayName: invNr ? `${description} - ${invNr}` : description,
                    currentLocation: currentLoc,
                    targetLocation: targetLoc,
                    status: posMeta['relo.status'] || 'PENDING',
                    comment: posMeta['relo.declaration.description'] || '',
                    // Zusätzliche Asset-Infos
                    partNumber: posMeta['asset.partNumberText'] || '',
                    additionalInfo: posMeta['asset.factNumberAI'] || '',
                    originalData: pos
                };
            });

            return {
                success: true,
                data: transformedData,
                total: transformedData.length
            };
        } catch (error) {
            console.error('Get relocation positions error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Create a new relocation process
    async createRelocation(data) {
        if (this.mode === 'mock') {
            return { success: true, data: { key: 'mock-relocation-' + Date.now() } };
        }

        try {
            const response = await this.call('/process/full', 'POST', {
                meta: {
                    type: 'RELOCATION',
                    description: data.description || 'Verlagerung',
                    sourceLocationKey: data.sourceLocationKey,
                    targetLocationKey: data.targetLocationKey,
                    dueDate: data.dueDate,
                    comment: data.comment || ''
                },
                assets: data.assetKeys || []
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Create relocation error:', error);
            return { success: false, error: error.message };
        }
    }

    // Add positions to relocation process (batch)
    async addRelocationPositions(processKey, assetKeys) {
        if (this.mode === 'mock') {
            return { success: true };
        }

        try {
            const positions = assetKeys.map(assetKey => ({
                asset: { context: { key: assetKey } }
            }));

            const endpoint = `/process/relocation/${processKey}/positions/batch`;
            const response = await this.call(endpoint, 'POST', positions);
            return { success: true, data: response };
        } catch (error) {
            console.error('Add relocation positions error:', error);
            return { success: false, error: error.message };
        }
    }

    // Audit check for relocation between countries
    async checkRelocationAudit(sourceCountry, targetCountry) {
        if (this.mode === 'mock') {
            // Mock: Always allowed within same country, otherwise check
            if (sourceCountry === targetCountry) {
                return { success: true, data: { result: 3, allowed: true, color: 'green' } };
            }
            // Mock some forbidden countries
            const forbiddenTargets = ['KP', 'IR', 'SY'];
            if (forbiddenTargets.includes(targetCountry)) {
                return { success: true, data: { result: 1, allowed: false, color: 'black' } };
            }
            return { success: true, data: { result: 3, allowed: true, color: 'green' } };
        }

        try {
            const response = await this.call('/utils/audit', 'POST', {
                sourceCountry: sourceCountry,
                targetCountry: targetCountry
            });

            // Response: 1 = black (forbidden), 2 = red (not allowed), 3 = green (allowed)
            const result = response.result || response.data?.result || 3;
            const colorMap = { 1: 'black', 2: 'red', 3: 'green' };

            return {
                success: true,
                data: {
                    result: result,
                    allowed: result === 3,
                    color: colorMap[result] || 'green',
                    message: response.message || ''
                }
            };
        } catch (error) {
            console.error('Audit check error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get system tasks for relocation completion
    async getRelocationTasks(filters = {}) {
        if (this.mode === 'mock') {
            return { success: true, data: [], total: 0 };
        }

        try {
            const params = new URLSearchParams();
            params.append('type', 'RELOCATION_COMPLETION');
            if (filters.status) params.append('status', filters.status);
            if (filters.supplier) params.append('supplier', filters.supplier);
            params.append('limit', filters.limit || 10000);
            params.append('offset', filters.offset || 0);

            const endpoint = `/tasks/system?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            const tasks = Array.isArray(response) ? response : (response.data || []);
            return {
                success: true,
                data: tasks,
                total: tasks.length
            };
        } catch (error) {
            console.error('Get relocation tasks error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Map API relocation status to internal status
    // p.status: I = Init, O = Open, P = In Progress, C = Completed, etc.
    mapRelocationStatus(status) {
        const statusMap = {
            // Kurz-Codes
            'I': 'offen',
            'O': 'offen',
            'N': 'offen',
            'A': 'feinplanung',
            'P': 'in-inventur',
            'C': 'abgeschlossen',
            'D': 'abgeschlossen',
            // Lang-Codes
            'INIT': 'offen',
            'NEW': 'offen',
            'OPEN': 'offen',
            'ACCEPTED': 'feinplanung',
            'IN_PROGRESS': 'in-inventur',
            'PENDING': 'feinplanung',
            'APPROVED': 'in-inventur',
            'COMPLETED': 'abgeschlossen',
            'CLOSED': 'abgeschlossen',
            'DONE': 'abgeschlossen'
        };
        return statusMap[status] || 'offen';
    }

    // Mock data for relocation detail
    getMockRelocationDetail(processKey) {
        const id = parseInt(processKey.replace(/\D/g, '')) || 1;
        return {
            success: true,
            data: {
                id: processKey,
                processKey: processKey,
                number: `VRL-${String(id).padStart(4, '0')}`,
                name: 'Verlagerung Presswerkzeug',
                status: 'offen',
                sourceLocation: {
                    key: 'loc-1',
                    name: 'Hauptwerk Vilsbiburg',
                    country: 'DE',
                    city: 'Vilsbiburg'
                },
                targetLocation: {
                    key: 'loc-2',
                    name: 'Werk Braunau',
                    country: 'AT',
                    city: 'Braunau'
                },
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                comment: '',
                assetCount: 3
            }
        };
    }

    // Mock data for relocation positions
    getMockRelocationPositions(processKey) {
        return {
            success: true,
            data: [
                { id: 1, positionKey: 'pos-1', assetKey: 'asset-1', inventoryNumber: 'PRE-2023-0001', name: 'Presswerkzeug A-Säule links', currentLocation: 'Halle A - Regal 1', targetLocation: 'Werk Braunau', status: 'PENDING', comment: '' },
                { id: 2, positionKey: 'pos-2', assetKey: 'asset-2', inventoryNumber: 'TIE-2023-0002', name: 'Tiefziehwerkzeug Motorhaube', currentLocation: 'Halle A - Regal 2', targetLocation: 'Werk Braunau', status: 'PENDING', comment: '' },
                { id: 3, positionKey: 'pos-3', assetKey: 'asset-3', inventoryNumber: 'STA-2023-0003', name: 'Stanzwerkzeug Türblech', currentLocation: 'Halle B - Lager 1', targetLocation: 'Werk Braunau', status: 'PENDING', comment: '' }
            ],
            total: 3
        };
    }

    getMockVerlagerungData(filters = {}) {
        const sourceLocations = ['Vilsbiburg, DE', 'Braunau, AT', 'Timisoara, RO'];
        const targetLocations = ['Braunau, AT', 'Timisoara, RO', 'Vilsbiburg, DE'];
        const descriptions = [
            'Verlagerung Presswerkzeuge',
            'Transport Tiefziehwerkzeuge',
            'Umzug Stanzwerkzeuge',
            'Verlagerung Biegewerkzeuge',
            'Transport Schneidwerkzeuge'
        ];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const items = [];
        for (let i = 1; i <= 10; i++) {
            const paddedNum = String(i + 2000).padStart(4, '0');

            // Berechne Fälligkeitsdatum - erste 3 sind überfällig
            const dueDate = new Date(today);
            if (i <= 3) {
                dueDate.setDate(today.getDate() - (7 * i));
            } else {
                dueDate.setDate(today.getDate() + (5 * (i - 3)));
            }

            items.push({
                id: 2000 + i,
                processKey: `rel-${paddedNum}`,
                number: `VRL-${paddedNum}`,
                name: descriptions[(i - 1) % descriptions.length],
                sourceLocation: sourceLocations[(i - 1) % sourceLocations.length],
                targetLocation: targetLocations[(i - 1) % targetLocations.length],
                status: i <= 3 ? 'offen' : (i <= 6 ? 'feinplanung' : (i <= 8 ? 'in-inventur' : 'abgeschlossen')),
                dueDate: dueDate.toISOString().split('T')[0],
                assetCount: 3 + (i % 5)
            });
        }

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

    // === Partnerwechsel Endpoints ===
    async getPartnerwechselList(filters = {}) {
        if (this.mode === 'mock') {
            return this.getMockPartnerwechselData(filters);
        }

        try {
            // VPW = Vertragspartnerwechsel
            // Versuche verschiedene Prozess-Typen die VPW sein könnten
            const params = new URLSearchParams();
            params.append('limit', filters.limit || 10000);
            params.append('skip', filters.skip || 0);

            // Server-seitiger Supplier-Filter
            const supplierNumber = this.supplierNumber;
            if (supplierNumber) {
                params.append('md.contractPartner', supplierNumber);
            }

            let items = [];

            // Mögliche VPW Prozess-Typen (wir wissen nicht den exakten Namen)
            const vpwTypes = [
                'CONTRACT_PARTNER.C',
                'CONTRACT_PARTNER_CHANGE.C',
                'OWNERSHIP_CHANGE.C',
                'VPW.C',
                'PARTNER_CHANGE.C'
            ];

            for (const vpwType of vpwTypes) {
                if (items.length > 0) break;

                try {
                    const endpoint = `/process?${params.toString()}&md.p.type=${vpwType}`;
                    console.log('VPW: Versuche', endpoint);
                    const response = await this.call(endpoint, 'GET');
                    const processList = Array.isArray(response) ? response : (response.data || []);

                    if (processList.length > 0) {
                        console.log(`VPW: Gefunden mit Typ ${vpwType}:`, processList.length);
                        items = processList;
                    }
                } catch (e) {
                    console.log(`VPW: Typ ${vpwType} nicht gefunden oder Fehler`);
                }
            }

            // Falls kein spezifischer VPW-Typ gefunden, versuche generische Suche
            if (items.length === 0) {
                console.log('VPW: Kein spezifischer Typ gefunden, versuche alternative Suche...');

                // Versuche alle Prozesse zu laden und nach relevanten zu filtern
                try {
                    const allProcessEndpoint = `/process?${params.toString()}`;
                    const allResponse = await this.call(allProcessEndpoint, 'GET');
                    const allProcesses = Array.isArray(allResponse) ? allResponse : (allResponse.data || []);

                    // Filtere nach Prozessen die VPW-relevant sein könnten
                    // (haben verschiedene contractPartner in from/to)
                    items = allProcesses.filter(p => {
                        const meta = p.meta || {};
                        const pType = (meta['p.type'] || '').toUpperCase();
                        return pType.includes('CONTRACT') ||
                               pType.includes('PARTNER') ||
                               pType.includes('OWNERSHIP') ||
                               pType.includes('VPW');
                    });

                    console.log('VPW: Nach Filterung gefunden:', items.length);
                } catch (e) {
                    console.log('VPW: Auch alternative Suche fehlgeschlagen');
                }
            }

            // Transformiere Daten ins Frontend-Format
            const transformedData = items.map((item, index) => {
                const meta = item.meta || {};

                // Status-Mapping von API zu Frontend
                let status = 'offen';
                const apiStatus = (meta.status || meta['p.status'] || '').toLowerCase();
                if (apiStatus.includes('completed') || apiStatus.includes('done') || apiStatus.includes('closed')) {
                    status = 'abgeschlossen';
                } else if (apiStatus.includes('accepted') || apiStatus.includes('confirmed')) {
                    status = 'übernahme-bestätigt';
                } else if (apiStatus.includes('reported') || apiStatus.includes('sent')) {
                    status = 'abgabe-bestätigt';
                }

                // Partner-Informationen extrahieren
                const fromPartner = meta['vpw.from.company'] ||
                                   meta['from.contractPartner'] ||
                                   meta['source.company'] ||
                                   meta.contractPartner ||
                                   'Unbekannt';

                const toPartner = meta['vpw.to.company'] ||
                                 meta['to.contractPartner'] ||
                                 meta['target.company'] ||
                                 meta['new.contractPartner'] ||
                                 'Unbekannt';

                // Werkzeug-Informationen
                const toolNumber = meta.assetNumber ||
                                  meta['asset.number'] ||
                                  meta.toolNumber ||
                                  item.key ||
                                  '';

                const toolName = meta.assetName ||
                                meta['asset.name'] ||
                                meta.description ||
                                meta.title ||
                                '';

                return {
                    id: item.key || item.context?.key || `vpw-${index}`,
                    processKey: item.key || item.context?.key || '',
                    toolNumber: toolNumber,
                    toolName: toolName,
                    name: toolName,
                    fromPartner: fromPartner,
                    toPartner: toPartner,
                    status: status,
                    dueDate: meta.dueDate || meta['due.date'] || null,
                    direction: 'incoming', // Default, kann später verfeinert werden
                    createdAt: item.createdAt || meta.createdAt || null,
                    rawMeta: meta // Für Debugging
                };
            });

            return {
                success: true,
                data: transformedData,
                total: transformedData.length,
                debug: {
                    totalProcesses: items.length,
                    mode: 'live'
                }
            };

        } catch (error) {
            console.error('VPW API Error:', error);
            // Fallback auf Mock-Daten bei Fehler
            console.log('VPW: Fallback auf Mock-Daten');
            return this.getMockPartnerwechselData(filters);
        }
    }

    getMockPartnerwechselData(filters = {}) {
        // VPW = Vertragspartnerwechsel
        // Der Vertragspartner wechselt - nicht nur der Standort (wie bei Verlagerung)
        const toolNames = [
            'Presswerkzeug Seitenteil',
            'Stanzwerkzeug B-Saeule',
            'Ziehwerkzeug Motorhaube',
            'Umformwerkzeug Dachblech',
            'Schneidwerkzeug Heckklappe'
        ];

        const fromPartners = [
            'Schuler AG',
            'Kuka Systems',
            'ThyssenKrupp Automotive',
            'Magna International'
        ];

        const toPartners = [
            'Gestamp Automocion',
            'Benteler Automotive',
            'Kirchhoff Automotive',
            'Martinrea International'
        ];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const items = [];

        // Generiere 15 VPW-Prozesse
        for (let i = 1; i <= 15; i++) {
            const paddedNum = String(i + 5000).padStart(5, '0');
            const year = new Date().getFullYear();
            const toolName = toolNames[(i - 1) % toolNames.length];

            // Fälligkeit: Mix aus überfällig und zukuenftig
            const dueDate = new Date(today);
            if (i <= 3) {
                dueDate.setDate(today.getDate() - (5 * i)); // Überfällig
            } else {
                dueDate.setDate(today.getDate() + (7 * (i - 3))); // Zukuenftig
            }

            // Status-Verteilung:
            // 1-4: offen (warte auf Abgabe)
            // 5-8: abgabe-bestätigt (warte auf Übernahme)
            // 9-11: übernahme-bestätigt (warte auf OEM)
            // 12-15: abgeschlossen
            let status;
            if (i <= 4) status = 'offen';
            else if (i <= 8) status = 'abgabe-bestätigt';
            else if (i <= 11) status = 'übernahme-bestätigt';
            else status = 'abgeschlossen';

            // Direction: eingehend oder ausgehend (aus Sicht des aktuellen Users)
            // Erste Haelfte = incoming (User ist übernehmender Partner)
            // Zweite Haelfte = outgoing (User ist abgebender Partner)
            const direction = i <= 8 ? 'incoming' : 'outgoing';

            items.push({
                id: `vpw-${paddedNum}`,
                processKey: `VPW-${year}-${paddedNum}`,
                toolNumber: `WZ-${year}-${paddedNum}`,
                toolName: toolName,
                name: `VPW ${toolName}`, // Fallback
                fromPartner: fromPartners[(i - 1) % fromPartners.length],
                toPartner: toPartners[(i - 1) % toPartners.length],
                status: status,
                dueDate: dueDate.toISOString().split('T')[0],
                direction: direction,
                createdAt: new Date(today.getTime() - (i * 86400000 * 3)).toISOString().split('T')[0]
            });
        }

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

    // === Verschrottung (Scrapping) Endpoints ===
    // Verschrottung nutzt /process mit md.p.type=SCRAPPING Filter

    async getVerschrottungList(filters = {}) {
        return this.callWithFallback(
            async () => {
                const params = new URLSearchParams();
                params.append('limit', filters.limit || 10000);
                params.append('skip', filters.skip || 0);

                // Server-seitiger Supplier-Filter
                const supplierNumber = this.supplierNumber;
                if (supplierNumber) {
                    params.append('md.contractPartner', supplierNumber);
                }

                let items = [];

                // Versuch 1: /process mit SCRAPPING Type-Filter (korrekter Ansatz laut OpenAPI)
                try {
                    console.log('Verschrottung: Lade /process mit md.p.type=SCRAPPING');
                    // Verschiedene mögliche Type-Werte für Scrapping
                    const scrappingTypes = ['SCRAPPING', 'SCRAPPING.C', 'SCRAPPING.A', 'SCRAP'];

                    for (const sType of scrappingTypes) {
                        if (items.length > 0) break;

                        let endpoint = `/process?${params.toString()}&md.p.type=${sType}`;
                        console.log('Versuche:', endpoint);
                        try {
                            let response = await this.call(endpoint, 'GET');
                            let foundItems = Array.isArray(response) ? response : (response.data || []);
                            if (foundItems.length > 0) {
                                console.log(`Gefunden mit md.p.type=${sType}:`, foundItems.length, 'Items');
                                items = foundItems;
                            }
                        } catch (e) {
                            console.log(`md.p.type=${sType} fehlgeschlagen:`, e.message);
                        }
                    }
                } catch (e) {
                    console.log('Process-Abfrage mit Type-Filter fehlgeschlagen:', e.message);
                }

                // Versuch 2: System-Tasks mit type=SCRAPPING_COMPLETION prüfen
                if (items.length === 0) {
                    try {
                        console.log('Verschrottung: Prüfe /tasks/system mit type=SCRAPPING_COMPLETION');
                        // Supplier-Filter auch für Tasks anwenden (falls API es unterstützt)
                        let taskParams = new URLSearchParams();
                        taskParams.append('type', 'SCRAPPING_COMPLETION');
                        taskParams.append('limit', '10000');
                        if (supplierNumber) {
                            taskParams.append('supplier', supplierNumber);
                        }

                        let endpoint = `/tasks/system?${taskParams.toString()}`;
                        let response = await this.call(endpoint, 'GET');
                        let tasks = Array.isArray(response) ? response : (response.data || []);
                        console.log('System-Tasks SCRAPPING_COMPLETION (vor Filter):', tasks.length);

                        // Client-seitige Filterung nach Supplier (falls Server-Filter nicht greift)
                        if (supplierNumber) {
                            tasks = tasks.filter(task => {
                                const scrappingData = task.payload?.scrappingCompletion || {};
                                const taskSupplier = scrappingData.supplier || '';
                                const firstAsset = scrappingData.assets?.[0] || {};
                                const assetSupplier = firstAsset.contractPartnerNo || '';

                                return taskSupplier === supplierNumber || assetSupplier === supplierNumber;
                            });
                            console.log('System-Tasks nach Supplier-Filter:', tasks.length, '(Supplier:', supplierNumber, ')');
                        }

                        if (tasks.length > 0) {
                            console.log('Erster Scrapping-Task:', JSON.stringify(tasks[0], null, 2));
                            // Konvertiere Tasks zu Prozess-Items mit korrektem Mapping
                            items = tasks.map(task => {
                                const scrappingData = task.payload?.scrappingCompletion || {};
                                const firstAsset = scrappingData.assets?.[0] || {};

                                return {
                                    context: { key: task.key },
                                    key: task.key,
                                    _fromTask: true,
                                    _taskData: task, // Original-Task für Detail-Ansicht
                                    meta: {
                                        title: task.title || task.description || 'Verschrottung',
                                        // Vertragspartner aus payload
                                        contractPartner: scrappingData.supplierName || firstAsset.contractPartnerName || '',
                                        contractPartnerNo: scrappingData.supplier || firstAsset.contractPartnerNo || '',
                                        // Betreiber
                                        operator: firstAsset.operatorName || '',
                                        operatorNo: firstAsset.operatorNo || '',
                                        // Standort aus erstem Asset
                                        location: firstAsset.city ? `${firstAsset.city} (${firstAsset.country || ''})` : '',
                                        assetCity: firstAsset.city || '',
                                        assetCountry: firstAsset.country || '',
                                        // Asset-Infos
                                        inventoryNumber: firstAsset.inventoryNumber || '',
                                        description: firstAsset.description || '',
                                        // Daten
                                        created: scrappingData.created || task.created,
                                        finished: scrappingData.finished || task.finished,
                                        // Status
                                        status: task.status || 'NEW',
                                        // Anzahl Assets
                                        assetCount: scrappingData.assets?.length || 0
                                    }
                                };
                            });
                        }
                    } catch (e) {
                        console.log('System-Tasks Abfrage fehlgeschlagen:', e.message);
                    }
                }

                // Versuch 3: SCRAPPING-Prozesse mit contractPartner.key Filter
                if (items.length === 0) {
                    try {
                        console.log('Verschrottung: Lade SCRAPPING mit contractPartner.key=' + supplierNumber);

                        // Versuche server-seitigen Filter mit contractPartner.key
                        let endpoint = `/process?limit=10000&skip=0&md.p.type=SCRAPPING&md.contractPartner.key=${supplierNumber}`;
                        console.log('Versuche:', endpoint);
                        let response = await this.call(endpoint, 'GET');
                        let filteredItems = Array.isArray(response) ? response : (response.data || []);
                        console.log('Server-Filter Ergebnis:', filteredItems.length);

                        if (filteredItems.length > 0) {
                            items = filteredItems;
                        } else {
                            // Fallback: Alle laden und client-seitig filtern
                            console.log('Server-Filter leer, lade alle und filtere client-seitig');
                            endpoint = `/process?limit=10000&skip=0`;
                            response = await this.call(endpoint, 'GET');
                            let allItems = Array.isArray(response) ? response : (response.data || []);

                            // Filtere nach p.type === 'SCRAPPING' UND contractPartner.key === supplierNumber
                            items = allItems.filter(p => {
                                const meta = p.meta || {};
                                const pType = (meta['p.type'] || '').toUpperCase();
                                const contractPartnerKey = meta['contractPartner.key'] || '';

                                const isScrap = pType === 'SCRAPPING';
                                const hasSupplier = !supplierNumber || contractPartnerKey === supplierNumber;

                                return isScrap && hasSupplier;
                            });
                            console.log('SCRAPPING mit contractPartner.key=' + supplierNumber + ':', items.length);
                        }

                    } catch (e) {
                        console.log('SCRAPPING-Abfrage fehlgeschlagen:', e.message);
                    }
                }

                // Debug-Log
                if (items.length > 0) {
                    console.log('Verschrottung - erstes Item:', JSON.stringify(items[0], null, 2));
                } else {
                    console.log('KEINE Verschrottungs-Prozesse gefunden!');
                    console.log('Hinweis: Prüfe ob der richtige Prozess-Typ in der API existiert.');
                }

                const transformedData = items.map((item, index) => {
                    const meta = item.meta || {};
                    const context = item.context || {};

                    // Key für Navigation
                    const processKey = context.key || item.key || '';

                    // Bezeichnung (Titel des Prozesses)
                    const title = meta.title || meta.description || 'Verschrottung';

                    // Vertragspartner - SCRAPPING verwendet contractPartner.name und contractPartner.key
                    const contractPartnerName = meta['contractPartner.name'] || meta.contractPartner || meta.supplier || '';
                    const contractPartnerKey = meta['contractPartner.key'] || '';
                    const contractPartner = contractPartnerKey
                        ? `${contractPartnerName} (${contractPartnerKey})`
                        : contractPartnerName;

                    // Betreiber - SCRAPPING verwendet operator.name und operator.key
                    const operatorName = meta['operator.name'] || meta.operator || meta['asset.owner'] || '';
                    const operatorKey = meta['operator.key'] || '';
                    const operator = operatorKey
                        ? `${operatorName} (${operatorKey})`
                        : operatorName;

                    // Baureihe - SCRAPPING verwendet scrap.derivat
                    const baureihe = meta['scrap.derivat'] || meta.baureihe || meta.series || meta.project || '';

                    // Teilenummer - SCRAPPING verwendet scrap.partNumber und scrap.partText
                    const partNumber = meta['scrap.partNumber'] || meta.partNumber || meta.partNumbers || '';
                    const partText = meta['scrap.partText'] || '';

                    // Ersteller - SCRAPPING verwendet creator.name
                    const creator = meta['creator.name'] || meta.creator || meta.createdBy || '';

                    // Facheinkaeufer/WVO - SCRAPPING verwendet scrap.wvo.name
                    const buyer = meta['scrap.wvo.name'] || meta.buyer || meta.facheinkaeufer || meta.purchaser || '';

                    // Standort - SCRAPPING verwendet scrap.city und scrap.country
                    let location = '';
                    if (meta['scrap.city']) {
                        const postcode = meta['scrap.postcode'] || '';
                        location = postcode
                            ? `${meta['scrap.country'] || ''}-${meta['scrap.city']} (${postcode})`
                            : `${meta['scrap.city']} (${meta['scrap.country'] || ''})`;
                    } else if (meta.assetCity && meta.assetCountry) {
                        location = `${meta.assetCity} (${meta.assetCountry})`;
                    } else if (meta.location) {
                        location = meta.location;
                    }

                    // Status - SCRAPPING verwendet p.status (I = Initial, Z = abgeschlossen/rejected)
                    let status = 'offen';
                    const processStatus = meta['p.status'] || meta.status || meta.state || '';
                    if (processStatus === 'C' || processStatus === 'Z' || processStatus === 'COMPLETED' || processStatus === 'DONE' || processStatus === 'CLOSED') {
                        status = 'abgeschlossen';
                    } else if (processStatus === 'P' || processStatus === 'IN_PROGRESS' || processStatus === 'PENDING') {
                        status = 'in-bearbeitung';
                    } else if (processStatus === 'A' || processStatus === 'APPROVED') {
                        status = 'genehmigt';
                    } else if (processStatus === 'I' || processStatus === 'NEW' || processStatus === 'OPEN') {
                        status = 'offen';
                    }

                    // Daten
                    const dueDate = meta.dueDate ? meta.dueDate.split('T')[0] : null;
                    const createdAt = meta.created || meta.createdAt || null;

                    return {
                        id: processKey || index,
                        key: processKey,
                        processKey: processKey,
                        // Bezeichnung
                        title: title,
                        name: title,
                        // Beteiligte
                        contractPartner: contractPartner,
                        operator: operator,
                        // Werkzeug-Infos
                        baureihe: baureihe,
                        partNumber: partNumber,
                        // Personen
                        creator: creator,
                        buyer: buyer,
                        // Standort
                        location: location,
                        // Status
                        status: status,
                        processStatus: processStatus,
                        // Termine
                        dueDate: dueDate,
                        createdAt: createdAt,
                        // Original
                        originalData: item
                    };
                });

                return {
                    success: true,
                    data: transformedData,
                    total: transformedData.length
                };
            },
            () => this.getMockVerschrottungData(filters)
        );
    }

    // Verschrottung Details laden
    // Unterstützt sowohl Process-basierte als auch Task-basierte Scrapping-Daten
    async getVerschrottungDetail(processKey) {
        return this.callWithFallback(
            async () => {
                // Versuch 1: Als System-Task laden (SCRAPPING_COMPLETION)
                try {
                    console.log('Verschrottung Detail: Versuche /tasks/system/' + processKey);
                    const taskResponse = await this.call(`/tasks/system/${processKey}`, 'GET');
                    const task = taskResponse.data || taskResponse;

                    if (task && task.type === 'SCRAPPING_COMPLETION') {
                        console.log('Verschrottung Detail (Task):', JSON.stringify(task, null, 2));
                        const scrappingData = task.payload?.scrappingCompletion || {};
                        const assets = scrappingData.assets || [];
                        const firstAsset = assets[0] || {};

                        return {
                            success: true,
                            data: {
                                _fromTask: true,
                                _taskData: task,
                                meta: {
                                    title: task.title || task.description || 'Verschrottung',
                                    contractPartner: scrappingData.supplierName || '',
                                    contractPartnerNo: scrappingData.supplier || '',
                                    operator: firstAsset.operatorName || '',
                                    operatorNo: firstAsset.operatorNo || '',
                                    status: task.status || 'NEW',
                                    created: scrappingData.created || task.created,
                                    finished: scrappingData.finished,
                                    assetCity: firstAsset.city || '',
                                    assetCountry: firstAsset.country || '',
                                    // Assets als Positionen
                                    assets: assets
                                }
                            },
                            positions: assets.map((asset, idx) => ({
                                id: asset.key || idx,
                                assetKey: asset.key,
                                inventoryNumber: asset.inventoryNumber || '',
                                description: asset.description || '',
                                location: asset.city ? `${asset.city} (${asset.country || ''})` : '',
                                status: asset.inventoryResult ? 'COMPLETED' : 'PENDING'
                            }))
                        };
                    }
                } catch (e) {
                    console.log('Task-Abfrage fehlgeschlagen, versuche Process:', e.message);
                }

                // Versuch 2: Als Process laden
                const response = await this.call(`/process/${processKey}`, 'GET');
                const data = response.data || response;
                console.log('Verschrottung Detail (Process):', JSON.stringify(data, null, 2));

                return {
                    success: true,
                    data: data
                };
            },
            () => ({ success: false, error: 'Mock nicht verfügbar' })
        );
    }

    // Verschrottung Positionen laden
    // Bei Task-basierten Scrapping-Daten sind die Positionen bereits im Detail enthalten
    async getVerschrottungPositions(processKey, filters = {}) {
        return this.callWithFallback(
            async () => {
                // Versuch 1: Prüfe ob es ein System-Task ist
                try {
                    const taskResponse = await this.call(`/tasks/system/${processKey}`, 'GET');
                    const task = taskResponse.data || taskResponse;

                    if (task && task.type === 'SCRAPPING_COMPLETION') {
                        const assets = task.payload?.scrappingCompletion?.assets || [];
                        console.log('Verschrottung Positionen aus Task:', assets.length, 'Assets');

                        const transformedPositions = assets.map((asset, idx) => ({
                            id: asset.key || idx,
                            positionKey: asset.key || '',
                            assetKey: asset.key,
                            inventoryNumber: asset.inventoryNumber || '',
                            orderNumber: asset.orderNumber || '',
                            description: asset.description || '',
                            status: asset.inventoryResult ? 'COMPLETED' : 'PENDING',
                            location: asset.city ? `${asset.city} (${asset.country || ''})` : '',
                            originalData: asset
                        }));

                        return {
                            success: true,
                            data: transformedPositions,
                            total: transformedPositions.length
                        };
                    }
                } catch (e) {
                    console.log('Task-Positionen nicht gefunden, versuche Process:', e.message);
                }

                // Versuch 2: Process-Positionen laden
                const params = new URLSearchParams();
                params.append('limit', filters.limit || 10000);
                params.append('skip', filters.skip || 0);

                const endpoint = `/process/${processKey}/positions?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                const items = Array.isArray(response) ? response : (response.data || []);

                // Debug erstes Item
                if (items.length > 0) {
                    console.log('Verschrottung Positionen (erstes Item):', JSON.stringify(items[0], null, 2));
                }

                const transformedPositions = items.map((pos, index) => {
                    const meta = pos.meta || {};
                    const context = pos.context || {};

                    return {
                        id: context.key || pos.key || index,
                        positionKey: context.key || pos.key || '',
                        revision: pos.revision || '',
                        // Asset-Daten
                        assetKey: meta.assetKey || meta['asset.key'] || '',
                        inventoryNumber: meta.inventoryNumber || meta['asset.inventoryNumber'] || '',
                        orderNumber: meta.orderNumber || meta['asset.orderNumber'] || '',
                        description: meta.description || meta['asset.inventoryText'] || '',
                        // Status
                        status: meta.status || 'PENDING',
                        // Standort
                        location: meta.location || meta['asset.city'] || '',
                        // Original
                        originalData: pos
                    };
                });

                return {
                    success: true,
                    data: transformedPositions,
                    total: transformedPositions.length
                };
            },
            () => ({ success: true, data: [], total: 0 })
        );
    }

    getMockVerschrottungData(filters = {}) {
        const items = [
            {
                id: 1,
                key: 'mock-scrap-001',
                processKey: 'mock-scrap-001',
                title: 'Testverschrottung KPORCATEST 484 Abmessungsdaten',
                name: 'Testverschrottung KPORCATEST 484 Abmessungsdaten',
                contractPartner: 'ZF FRIEDRICHSHAFEN AG (147631)',
                operator: 'ZF FRIEDRICHSHAFEN AG (147631)',
                baureihe: 'F18',
                partNumber: '7633770-1 (LU 8P75H HYBRIDGETRIEBE)',
                creator: 'Ido IVL147631',
                buyer: 'Daniel Hey',
                location: 'AT-Eggenburg (3730)',
                status: 'offen',
                processStatus: 'NEW',
                dueDate: '2024-12-31',
                createdAt: '2024-11-15'
            },
            {
                id: 2,
                key: 'mock-scrap-002',
                processKey: 'mock-scrap-002',
                title: 'Verschrottung Presswerkzeug G30',
                name: 'Verschrottung Presswerkzeug G30',
                contractPartner: 'MAHLE BEHR GMBH & CO. KG (116116)',
                operator: 'MAHLE BEHR GMBH & CO. KG (116116)',
                baureihe: 'G30',
                partNumber: '8401234-5',
                creator: 'Max Mustermann',
                buyer: 'Anna Schmidt',
                location: 'DE-Stuttgart (70173)',
                status: 'in-bearbeitung',
                processStatus: 'IN_PROGRESS',
                dueDate: '2025-01-15',
                createdAt: '2024-10-20'
            },
            {
                id: 3,
                key: 'mock-scrap-003',
                processKey: 'mock-scrap-003',
                title: 'Entsorgung Stanzwerkzeug',
                name: 'Entsorgung Stanzwerkzeug',
                contractPartner: 'Bosch Rexroth AG (123456)',
                operator: 'Bosch Rexroth AG (123456)',
                baureihe: 'X5',
                partNumber: '5501122-3',
                creator: 'Test User',
                buyer: 'Franz Mueller',
                location: 'DE-Muenchen (80331)',
                status: 'genehmigt',
                processStatus: 'APPROVED',
                dueDate: '2025-02-28',
                createdAt: '2024-09-10'
            }
        ];

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

    // === Company / Unternehmen Endpoints ===

    // Get company details by supplierNumber
    async getCompanyBySupplier() {
        return this.callWithFallback(
            async () => {
                // Nutze /companies/list um eigene Firmen zu laden
                const companiesList = await this.call('/companies/list', 'GET');

                // Erste Company aus der Liste nehmen (oder nach supplierNumber filtern)
                const companies = Array.isArray(companiesList) ? companiesList : (companiesList.data || []);

                if (companies.length === 0) {
                    throw new Error('No companies found');
                }

                // Finde die Company mit passender LNR/supplierNumber oder nimm die erste
                let company = companies.find(c =>
                    c.meta?.LNR === this.supplierNumber ||
                    c.meta?.supplierNumber === this.supplierNumber ||
                    c.key === this.supplierNumber
                ) || companies[0];

                // Key ist direkt auf dem Objekt, nicht unter context
                const companyKey = company.key || company.context?.key;

                if (!companyKey) {
                    throw new Error('No company key found');
                }

                return {
                    success: true,
                    data: {
                        key: companyKey,
                        name: company.meta?.name || 'Unbekannt',
                        number: company.meta?.LNR || company.meta?.supplierNumber || company.key || this.supplierNumber,
                        country: company.meta?.country || '',
                        city: company.meta?.city || '',
                        street: company.meta?.street || '',
                        postcode: company.meta?.postcode || '',
                        vatId: company.meta?.vatId || '',
                        email: company.meta?.email || '',
                        phone: company.meta?.phone || '',
                        originalData: company
                    },
                    companyKey: companyKey
                };
            },
            () => this.getMockCompanyData()
        );
    }

    // Get locations for a company
    async getCompanyLocations(companyKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/companies/${companyKey}/locations?limit=10000&showInactive=true`, 'GET');

                const locations = Array.isArray(response) ? response : (response.data || []);

                // Map und filtere Standorte - nur solche mit gültigem Namen anzeigen
                const mappedLocations = locations
                    .map(loc => ({
                        key: loc.context?.key || '',
                        name: loc.meta?.title || loc.meta?.name || '',
                        country: loc.meta?.country || '',
                        city: loc.meta?.city || '',
                        street: loc.meta?.street || '',
                        postcode: loc.meta?.postcode || '',
                        isDefault: loc.meta?.isDefault || false,
                        originalData: loc
                    }))
                    .filter(loc => loc.name && loc.name.trim() !== ''); // Filtere leere/unbenannte Standorte

                return {
                    success: true,
                    data: mappedLocations,
                    total: mappedLocations.length
                };
            },
            () => this.getMockLocationsData()
        );
    }

    // Get users for a company
    async getCompanyUsers(companyKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/access/companies/${companyKey}/users?limit=10000&showInactive=true`, 'GET');

                const users = Array.isArray(response) ? response : (response.data || []);
                return {
                    success: true,
                    data: users.map(user => ({
                        key: user.context?.key || user.userKey || '',
                        firstName: user.meta?.firstName || '',
                        lastName: user.meta?.lastName || '',
                        fullName: `${user.meta?.firstName || ''} ${user.meta?.lastName || ''}`.trim() || 'Unbekannt',
                        email: user.meta?.mail || user.meta?.email || '',
                        phone: user.meta?.phone || '',
                        groups: user.groups || [],
                        isActive: user.meta?.active !== false,
                        originalData: user
                    })),
                    total: users.length
                };
            },
            () => this.getMockUsersData()
        );
    }

    // Get suppliers (sub-suppliers) for a company
    async getCompanySuppliers(companyKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/companies/${companyKey}/suppliers?limit=10000`, 'GET');

                const suppliers = Array.isArray(response) ? response : (response.data || []);
                return {
                    success: true,
                    data: suppliers.map(sup => ({
                        key: sup.context?.key || '',
                        name: sup.meta?.name || 'Unbekannt',
                        number: sup.meta?.supplierNumber || sup.meta?.number || '',
                        country: sup.meta?.country || '',
                        city: sup.meta?.city || '',
                        street: sup.meta?.street || '',
                        postcode: sup.meta?.postcode || '',
                        isValid: sup.meta?.isValid !== false,
                        originalData: sup
                    })),
                    total: suppliers.length
                };
            },
            () => this.getMockSuppliersData()
        );
    }

    // === CRUD Operations for Locations ===
    async createLocation(companyKey, data) {
        try {
            const response = await this.call(`/companies/${companyKey}/locations?locationMode=MANUAL_CREATION`, 'POST', {
                meta: {
                    title: data.name,
                    name: data.name,
                    street: data.street,
                    postcode: data.postcode,
                    city: data.city,
                    country: data.country
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Create location error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateLocation(companyKey, locationKey, data) {
        try {
            // Erst aktuellen Stand laden für revision
            const current = await this.call(`/companies/${companyKey}/locations/${locationKey}`, 'GET');
            const revision = current._rev || current.revision;

            const response = await this.call(`/companies/${companyKey}/locations/${locationKey}?revision=${revision}`, 'PATCH', {
                meta: {
                    title: data.name,
                    name: data.name,
                    street: data.street,
                    postcode: data.postcode,
                    city: data.city,
                    country: data.country
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update location error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateLocationStatus(companyKey, locationKey, isActive) {
        try {
            const current = await this.call(`/companies/${companyKey}/locations/${locationKey}`, 'GET');
            const revision = current._rev || current.revision;

            const response = await this.call(`/companies/${companyKey}/locations/${locationKey}?revision=${revision}`, 'PATCH', {
                meta: {
                    active: isActive
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update location status error:', error);
            return { success: false, error: error.message };
        }
    }

    // === CRUD Operations for Users ===
    async createUser(companyKey, data) {
        try {
            const group = data.groups && data.groups.length > 0 ? data.groups[0] : 'IVL';
            const response = await this.call(`/access/companies/${companyKey}/users?group=${group}`, 'POST', {
                meta: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    mail: data.email,
                    phone: data.phone
                },
                groups: data.groups || ['IVL']
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUser(companyKey, userKey, data) {
        try {
            const response = await this.call(`/access/companies/${companyKey}/users/${userKey}`, 'PATCH', {
                meta: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    mail: data.email,
                    phone: data.phone
                },
                groups: data.groups
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserStatus(companyKey, userKey, isActive) {
        try {
            const response = await this.call(`/access/companies/${companyKey}/users/${userKey}`, 'PATCH', {
                meta: {
                    active: isActive
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update user status error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetUserPassword(companyKey, userKey) {
        try {
            const response = await this.call(`/access/companies/${companyKey}/users/${userKey}/reset-password`, 'POST');
            return { success: true, data: response };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    async resendUserRegistration(companyKey, userKey) {
        try {
            const response = await this.call(`/access/companies/${companyKey}/users/${userKey}/resend-registration`, 'POST');
            return { success: true, data: response };
        } catch (error) {
            console.error('Resend registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // === CRUD Operations for Suppliers ===
    async createSupplier(companyKey, data) {
        try {
            const response = await this.call(`/companies/${companyKey}/suppliers`, 'POST', {
                supplier: {
                    meta: {
                        name: data.name,
                        supplierNumber: data.number,
                        street: data.street,
                        postcode: data.postcode,
                        city: data.city,
                        country: data.country
                    }
                },
                roles: ['SUP']
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Create supplier error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateSupplier(companyKey, supplierKey, data) {
        try {
            const current = await this.call(`/companies/${companyKey}/suppliers/${supplierKey}`, 'GET');
            const revision = current._rev || current.revision;

            const response = await this.call(`/companies/${companyKey}/suppliers/${supplierKey}?revision=${revision}`, 'PATCH', {
                meta: {
                    name: data.name,
                    supplierNumber: data.number,
                    street: data.street,
                    postcode: data.postcode,
                    city: data.city,
                    country: data.country
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update supplier error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateSupplierStatus(companyKey, supplierKey, isValid) {
        try {
            const current = await this.call(`/companies/${companyKey}/suppliers/${supplierKey}`, 'GET');
            const revision = current._rev || current.revision;

            const response = await this.call(`/companies/${companyKey}/suppliers/${supplierKey}?revision=${revision}`, 'PATCH', {
                meta: {
                    isValid: isValid
                }
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Update supplier status error:', error);
            return { success: false, error: error.message };
        }
    }

    // Mock-Daten für Lieferanten
    getMockSuppliersData() {
        return {
            success: true,
            data: [
                { key: 'sup-1', name: 'Test Incident', number: '102273', country: 'DE', city: 'Ingolstadt', street: 'Muenchener Strasse 244', postcode: '85051', isValid: true },
                { key: 'sup-2', name: 'BAOSTEEL TAILORED BLANKS GMBH', number: '102273', country: 'N/A', city: '', street: '', postcode: '', isValid: false },
                { key: 'sup-3', name: 'Mein-neuer Sub', number: '', country: 'DE', city: 'Dornstetten', street: 'Alte Poststrasse 12', postcode: '72280', isValid: true }
            ],
            total: 3
        };
    }

    // Mock-Daten für Unternehmen
    getMockCompanyData() {
        return {
            success: true,
            data: {
                key: 'mock-company-123',
                name: 'DRAEXLMAIER Group',
                number: '133188',
                country: 'DE',
                city: 'Vilsbiburg',
                street: 'Landshuter Str. 100',
                postcode: '84137',
                vatId: 'DE123456789',
                email: 'info@draexlmaier.com',
                phone: '+49 8741 47-0'
            },
            companyKey: 'mock-company-123'
        };
    }

    getMockLocationsData() {
        return {
            success: true,
            data: [
                { key: 'loc-1', name: 'Hauptwerk Vilsbiburg', country: 'DE', city: 'Vilsbiburg', street: 'Landshuter Str. 100', postcode: '84137', isDefault: true },
                { key: 'loc-2', name: 'Werk Braunau', country: 'AT', city: 'Braunau', street: 'Industriestr. 50', postcode: '5280', isDefault: false },
                { key: 'loc-3', name: 'Werk Timisoara', country: 'RO', city: 'Timisoara', street: 'Calea Lugojului 1', postcode: '300112', isDefault: false }
            ],
            total: 3
        };
    }

    getMockUsersData() {
        return {
            success: true,
            data: [
                { key: 'user-1', firstName: 'Max', lastName: 'Mustermann', fullName: 'Max Mustermann', email: 'max.mustermann@example.com', phone: '+49 123 456789', groups: ['IVL', 'SUP'], isActive: true },
                { key: 'user-2', firstName: 'Anna', lastName: 'Schmidt', fullName: 'Anna Schmidt', email: 'anna.schmidt@example.com', phone: '+49 123 456790', groups: ['SUP'], isActive: true },
                { key: 'user-3', firstName: 'Peter', lastName: 'Mueller', fullName: 'Peter Mueller', email: 'peter.mueller@example.com', phone: '+49 123 456791', groups: ['SUP'], isActive: false }
            ],
            total: 3
        };
    }

    // === ABL Dropdown Data Endpoints ===

    /**
     * Get available field values for dropdowns (projects, commodities, owners etc.)
     * GET /asset-list/fields
     */
    async getAssetListFields() {
        return this.callWithFallback(
            async () => {
                const response = await this.call('/asset-list/fields', 'GET');
                return {
                    success: true,
                    data: {
                        projects: response.projects || response.project || [],
                        commodities: response.commodities || response.commodity || [],
                        owners: response.owners || response.owner || [],
                        suppliers: response.suppliers || response.supplier || [],
                        processStatus: response.processStatus || [],
                        lifecycleStatus: response.lifecycleStatus || []
                    }
                };
            },
            () => this.getMockAssetListFields()
        );
    }

    getMockAssetListFields() {
        return {
            success: true,
            data: {
                projects: ['G70', 'G80', 'U11', 'NA5', 'iX', 'i7', '7er Reihe', '5er Reihe', '3er Reihe'],
                commodities: ['Exterieur', 'Interieur', 'Antrieb', 'Fahrwerk', 'Elektrik', 'Karosserie', 'Sitze'],
                owners: ['BMW AG', 'MINI', 'Rolls-Royce Motor Cars'],
                suppliers: [],
                processStatus: ['A0', 'A1', 'A2', 'A3'],
                lifecycleStatus: ['Aktiv', 'Inaktiv', 'In Verschrottung']
            }
        };
    }

    /**
     * Search companies (for owner/OEM selection)
     * GET /companies?query=<search>
     */
    async searchCompanies(query = '') {
        return this.callWithFallback(
            async () => {
                const endpoint = query
                    ? `/companies?query=${encodeURIComponent(query)}&limit=20`
                    : '/companies?limit=50';
                const response = await this.call(endpoint, 'GET');

                const companies = Array.isArray(response) ? response : (response.data || []);
                return {
                    success: true,
                    data: companies.map(c => ({
                        key: c.context?.key || c.key || '',
                        name: c.meta?.name || c.name || 'Unbekannt',
                        number: c.meta?.companyNumber || c.meta?.number || '',
                        country: c.meta?.country || '',
                        city: c.meta?.city || ''
                    }))
                };
            },
            () => this.getMockCompaniesSearch(query)
        );
    }

    getMockCompaniesSearch(query = '') {
        const allCompanies = [
            { key: 'bmw-ag', name: 'BMW AG', number: '1', country: 'DE', city: 'München' },
            { key: 'mini', name: 'MINI', number: '2', country: 'DE', city: 'Oxford' },
            { key: 'rolls-royce', name: 'Rolls-Royce Motor Cars', number: '3', country: 'GB', city: 'Goodwood' },
            { key: 'vw-ag', name: 'Volkswagen AG', number: '4', country: 'DE', city: 'Wolfsburg' },
            { key: 'audi-ag', name: 'AUDI AG', number: '5', country: 'DE', city: 'Ingolstadt' },
            { key: 'porsche-ag', name: 'Porsche AG', number: '6', country: 'DE', city: 'Stuttgart' },
            { key: 'mercedes', name: 'Mercedes-Benz AG', number: '7', country: 'DE', city: 'Stuttgart' }
        ];

        const filtered = query
            ? allCompanies.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
            : allCompanies;

        return { success: true, data: filtered };
    }

    /**
     * Get FEK users (Facheinkäufer) for a company
     * GET /access/companies/{key}/users?group=FEK
     */
    async getFEKUsers(companyKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/access/companies/${companyKey}/users?group=FEK&showInactive=false`, 'GET');
                const users = Array.isArray(response) ? response : (response.data || []);
                return {
                    success: true,
                    data: users.map(user => ({
                        key: user.context?.key || user.userKey || '',
                        firstName: user.meta?.firstName || '',
                        lastName: user.meta?.lastName || '',
                        fullName: `${user.meta?.firstName || ''} ${user.meta?.lastName || ''}`.trim() || 'Unbekannt',
                        email: user.meta?.mail || user.meta?.email || ''
                    }))
                };
            },
            () => ({
                success: true,
                data: [
                    { key: 'fek-1', firstName: 'Thomas', lastName: 'Müller', fullName: 'Thomas Müller', email: 'thomas.mueller@bmw.de' },
                    { key: 'fek-2', firstName: 'Sandra', lastName: 'Weber', fullName: 'Sandra Weber', email: 'sandra.weber@bmw.de' }
                ]
            })
        );
    }

    // Check if API is connected
    async checkConnection() {
        try {
            // TODO: Replace with real health check endpoint
            // const response = await this.call('/health', 'GET');
            // this.isConnected = true;
            // return true;

            // Mock: API not connected yet
            this.isConnected = false;
            return false;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    // === Report Endpoints ===
    // GET /report/{key}?format=PDF|HTML|CSV|XLSX
    // GET /report/inventories/result/{inventoryKey}
    // GET /report/scrappings/result/{scrappingKey}

    /**
     * Generischer Report-Abruf
     * @param {string} reportKey - Report-Schlüssel
     * @param {string} format - Format: PDF, HTML, CSV, XLSX (default: HTML)
     * @returns {Promise<Blob|Object>} Report-Daten
     */
    async getReport(reportKey, format = 'HTML') {
        if (this.mode === 'mock') {
            return this.getMockReportData(reportKey, format);
        }

        try {
            const endpoint = `/report/${reportKey}?format=${format}`;

            // Für Binärformate (PDF, XLSX) brauchen wir Blob-Response
            if (format === 'PDF' || format === 'XLSX') {
                return await this.callBinary(endpoint);
            }

            return await this.call(endpoint);
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    }

    /**
     * Inventur-Ergebnis-Report abrufen
     * @param {string} inventoryKey - Inventur-Schlüssel
     * @param {string} format - Format: PDF, HTML, CSV, XLSX (default: HTML)
     * @returns {Promise<Blob|Object>} Report-Daten
     */
    async getInventoryReport(inventoryKey, format = 'HTML') {
        if (this.mode === 'mock') {
            return this.getMockInventoryReportData(inventoryKey, format);
        }

        try {
            const endpoint = `/report/inventories/result/${inventoryKey}?format=${format}`;

            // Für Binärformate (PDF, XLSX) brauchen wir Blob-Response
            if (format === 'PDF' || format === 'XLSX') {
                return await this.callBinary(endpoint);
            }

            return await this.call(endpoint);
        } catch (error) {
            console.error('Error fetching inventory report:', error);
            throw error;
        }
    }

    /**
     * Verschrottungs-Ergebnis-Report abrufen
     * @param {string} scrappingKey - Verschrottungs-Schlüssel
     * @param {string} format - Format: PDF, HTML, CSV, XLSX (default: HTML)
     * @returns {Promise<Blob|Object>} Report-Daten
     */
    async getScrappingReport(scrappingKey, format = 'HTML') {
        if (this.mode === 'mock') {
            return this.getMockScrappingReportData(scrappingKey, format);
        }

        try {
            const endpoint = `/report/scrappings/result/${scrappingKey}?format=${format}`;

            // Für Binärformate (PDF, XLSX) brauchen wir Blob-Response
            if (format === 'PDF' || format === 'XLSX') {
                return await this.callBinary(endpoint);
            }

            return await this.call(endpoint);
        } catch (error) {
            console.error('Error fetching scrapping report:', error);
            throw error;
        }
    }

    /**
     * Assets Grid Report abrufen (Fertigungsmittel-Tabelle)
     * GET /orca-service/report/grids/assets/restriction-based?fn=supplier&fv={supplierId}
     * Hinweis: Dieser Endpoint liegt unter /orca-service, nicht unter /api/orca
     * @param {string} supplierId - Supplier-ID für Filter
     * @returns {Promise<Object>} Grid-Daten mit assets
     */
    async getAssetsGridReport(supplierId) {
        if (this.mode === 'mock') {
            console.log('🔶 Mock-Modus: Verwende lokale Mock-Daten');
            return this.getMockAssetsGridData();
        }

        try {
            // Dieser Endpoint liegt unter /orca-service, nicht unter der normalen baseURL
            const baseHost = 'https://int.bmw.organizingcompanyassets.com';
            const endpoint = `${baseHost}/orca-service/report/grids/assets/restriction-based?fn=supplier&fv=${supplierId}`;
            const data = await this.call(endpoint);
            return data;
        } catch (error) {
            console.error('Error fetching assets grid report:', error);
            // Fallback auf Mock-Daten bei API-Fehler (z.B. CORS, Netzwerk)
            console.warn('⚠️ API-Fehler - Fallback auf Mock-Daten');
            return this.getMockAssetsGridData();
        }
    }

    /**
     * Binärer API-Call für PDF/XLSX Downloads
     */
    async callBinary(endpoint) {
        const options = {
            method: 'GET',
            headers: {}
        };

        if (this.bearerToken) {
            const token = this.bearerToken.startsWith('Bearer ')
                ? this.bearerToken.substring(7)
                : this.bearerToken;
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.blob();
    }

    // Mock-Daten für Reports
    getMockReportData(reportKey, format) {
        return {
            success: true,
            reportKey: reportKey,
            format: format,
            generatedAt: new Date().toISOString(),
            content: '<html><body><h1>Mock Report</h1><p>Dies ist ein Test-Report.</p></body></html>'
        };
    }

    getMockInventoryReportData(inventoryKey, format) {
        return {
            success: true,
            inventoryKey: inventoryKey,
            format: format,
            generatedAt: new Date().toISOString(),
            title: `Inventur-Report ${inventoryKey}`,
            summary: {
                totalPositions: 125,
                completed: 98,
                pending: 20,
                missing: 7,
                completionRate: 78.4
            },
            positions: [
                { number: 'WZ-2024-001', status: 'P2', location: 'Hunedoara, RO' },
                { number: 'WZ-2024-002', status: 'P3', location: 'Hunedoara, RO' },
                { number: 'WZ-2024-003', status: 'P6', location: 'Nicht gefunden' }
            ],
            content: format === 'HTML'
                ? `<html><body><h1>Inventur-Report ${inventoryKey}</h1><p>Abschlussquote: 78.4%</p></body></html>`
                : null
        };
    }

    getMockScrappingReportData(scrappingKey, format) {
        return {
            success: true,
            scrappingKey: scrappingKey,
            format: format,
            generatedAt: new Date().toISOString(),
            title: `Verschrottungs-Report ${scrappingKey}`,
            summary: {
                totalAssets: 12,
                approved: 10,
                pending: 2,
                totalValue: 245000
            },
            content: format === 'HTML'
                ? `<html><body><h1>Verschrottungs-Report ${scrappingKey}</h1><p>12 Assets zur Verschrottung</p></body></html>`
                : null
        };
    }

    getMockAssetsGridData() {
        // Nutze importierte Mock-Daten wenn vorhanden
        if (this.mockToolsCache && this.mockToolsCache.length > 0 && this.mockToolsCache[0]._isMockData) {
            const gridData = this.mockToolsCache.map(tool => ({
                // Fertigungsmittel
                'Eigentümer': tool.owner || '-',
                'Inventarnummer': tool.inventoryNumber || tool.toolNumber || '-',
                'Werkzeugbezeichnung': tool.name || '-',
                'Abteilung': tool.department || '-',
                'Teilenummer': tool.partNumber || '-',
                'Teilenummerbezeichnung': tool.partName || '-',
                'Lieferant': tool.supplierNumber || '-',
                'Lieferantenname': tool.supplier || '-',
                'Facheinkäufer': tool.fek || '-',
                'Commodity': tool.commodity || '-',
                'Fertigungsmittel-Lifecyclestatus': tool.lifecycleStatus || '-',
                'Fertigungsmittel-Prozessstatus': tool.processStatus || '-',
                'Anschaffungswert • EUR': tool.acquisitionValue || '-',
                'Betreiber Name': tool.operator || '-',
                'Land': tool.location?.split(', ')[1] || 'DE',
                'Stadt': tool.location?.split(', ')[0] || '-',
                'Straße': tool.locationDetail?.split(', ')[0] || '-',
                // Prozess
                'Prozess ID': tool.processId || '-',
                'Prozessname': tool.processName || '-',
                'Fälligkeitsdatum': tool.dueDate || '-',
                'Prozesstyp': tool.processType || '-',
                'Prozessstatus': tool.processStatusText || '-',
                'Zugewiesener Benutzer': tool.assignedUser || '-',
                // Prozessposition
                'Standortergebnis': tool.locationResult || '-',
                'Prozessstatus der Position': tool.positionProcessStatus || '-',
                // Meta
                '_isMockData': true
            }));

            return {
                gridData: gridData,
                totalCount: gridData.length,
                generatedAt: new Date().toISOString(),
                _mockDataInfo: this.mockDataInfo
            };
        }

        // Fallback auf alte Mock-Daten
        return {
            gridData: [
                {
                    assetNumber: 'WZ-2024-001',
                    description: 'Spritzgusswerkzeug A',
                    status: 'I1',
                    location: 'Hunedoara, RO',
                    responsible: 'Max Mustermann',
                    lastInventory: '2024-11-15'
                },
                {
                    assetNumber: 'WZ-2024-002',
                    description: 'Stanzwerkzeug B',
                    status: 'I2',
                    location: 'Timisoara, RO',
                    responsible: 'Hans Schmidt',
                    lastInventory: '2024-10-20'
                },
                {
                    assetNumber: 'WZ-2024-003',
                    description: 'Presswerkzeug C',
                    status: 'I0',
                    location: 'Sibiu, RO',
                    responsible: 'Peter Müller',
                    lastInventory: '2024-09-05'
                }
            ],
            totalCount: 3,
            generatedAt: new Date().toISOString()
        };
    }
}

// Create global API service instance
const api = new APIService();
