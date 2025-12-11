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
            this.mockToolsCache = this.generateFixedTestData();
        }
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
            params.append('limit', filters.limit || 100);
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
            params.append('limit', filters.limit || 50);
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
            params.append('limit', filters.limit || 100);
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
                params.append('limit', filters.limit || 100);
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
                params.append('limit', filters.limit || 100);
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
        params.append('limit', filters.limit || 100);
        params.append('offset', filters.offset || 0);

        const endpoint = `/inventory/${inventoryKey}/positions?${params.toString()}`;
        const response = await this.call(endpoint, 'GET');

        // Transform API response - each position becomes one entry
        const positions = Array.isArray(response) ? response : (response.data || []);
        const transformedData = positions.map((pos, index) => ({
            // Position identifiers
            id: pos.context?.key || index,
            positionKey: pos.context?.key || '',
            revision: pos.revision || '',

            // Asset data - INVENTARNUMMER hier!
            inventoryNumber: pos.asset?.meta?.inventoryNumber || '',
            number: pos.asset?.meta?.inventoryNumber || '',  // Fuer Kompatibilitaet
            name: pos.asset?.meta?.description || pos.asset?.meta?.assetName || 'Unbekannt',
            assetKey: pos.asset?.context?.key || '',

            // Location from position or asset
            location: pos.location?.meta ?
                `${pos.location.meta.city || ''}, ${pos.location.meta.country || ''}`.replace(/^, |, $/g, '') :
                pos.asset?.meta?.supplier || '',
            locationKey: pos.location?.context?.key || '',  // Fuer API-Rueckmeldung benoetigt
            locationDetails: pos.location?.meta || null,

            // Inventory context
            inventoryKey: pos.inventory?.context?.key || '',
            inventoryStatus: pos.inventory?.meta?.status || '',
            inventoryType: pos.inventory?.meta?.type || '',

            // Position status and metadata
            status: pos.meta?.status || 'P0',
            comment: pos.meta?.comment || '',
            dueDate: pos.meta?.dueDate || pos.inventory?.meta?.dueDate || null,

            // Assignment
            responsible: pos.assignedUser?.meta ?
                `${pos.assignedUser.meta.firstName || ''} ${pos.assignedUser.meta.lastName || ''}`.trim() :
                'N/A',

            // Additional asset info
            partNumber: pos.asset?.meta?.factNumberAI || '',
            project: pos.asset?.meta?.project || '',
            supplier: pos.asset?.meta?.supplier || '',

            // Original data for reference
            originalData: pos
        }));

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
                // For planning, we use the asset-list with planning-specific filters
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.location) params.append('location', filters.location);

                const endpoint = `/asset-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                return {
                    success: true,
                    data: response.data || response,
                    total: response.total || (response.data ? response.data.length : 0)
                };
            },
            // Mock fallback
            () => this.getMockPlanningData(filters)
        );
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
    // Asset processStatus: A8 (geplant), A9 (in Durchfuehrung)

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
                params.append('limit', filters.limit || 100);
                params.append('skip', filters.skip || 0);

                // Partitionen anzeigen
                params.append('showPartitions', 'true');

                const endpoint = `/inventory-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response
                const items = Array.isArray(response) ? response : (response.data || []);

                // Debug: Zeige erste Response zum Mapping
                if (items.length > 0) {
                    console.log('ABL API Response (erstes Item):', JSON.stringify(items[0], null, 2));
                }

                const transformedData = items.map((item, index) => {
                    const meta = item.meta || {};
                    const context = item.context || {};

                    // Identifier: meta.identifier ist oft ein JSON-String, nicht nutzbar
                    // Nutze orders (z.B. "4438914-177") oder context.key als ABL-Nr.
                    const keyShort = context.key ? context.key.substring(0, 8) : '';
                    let identifier = '';

                    // Prioritaet: orders > partNumbers (wenn String) > key-Anfang
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
                        // Keys fuer Navigation
                        id: context.key || index,
                        key: context.key || '',
                        inventoryKey: context.key || '',
                        // ABL-Nummer / Identifier (fuer Anzeige)
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
            'I2': 'durchgefuehrt',  // Lieferant hat zurueckgemeldet
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
        params.append('limit', filters.limit || 100);
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

    // ABL Position melden (Abnahme durchfuehren)
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

            // Faelligkeitsdatum
            const dueDate = new Date(today);
            if (i <= 3) {
                // Ueberfaellig
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
            // Jetzt: Nur die relevanten Verlagerungen fuer diesen Supplier laden
            const params = new URLSearchParams();
            params.append('limit', filters.limit || 100);
            params.append('skip', filters.skip || 0);
            params.append('md.p.type', 'RELOCATION.C');  // Unterprozesse (haben Details)

            // Server-seitiger Supplier-Filter!
            const supplierNumber = this.supplierNumber;
            if (supplierNumber) {
                params.append('md.contractPartner', supplierNumber);
            }

            let endpoint = `/process?${params.toString()}`;
            const processList = await this.call(endpoint, 'GET');

            // Die API liefert bereits gefilterte Prozesse fuer diesen Supplier
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

            // Lade Parent-Prozess fuer Standort-Daten
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
            // Adressen muessen ueber Company/Location API geladen werden
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
            params.append('limit', filters.limit || 100);
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
                    // Zusaetzliche Asset-Infos
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
            params.append('limit', filters.limit || 100);
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
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);

                const endpoint = `/partnerwechsel-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                return {
                    success: true,
                    data: response.data || response,
                    total: response.total || (response.data ? response.data.length : 0)
                };
            },
            // Mock fallback
            () => this.getMockPartnerwechselData(filters)
        );
    }

    getMockPartnerwechselData(filters = {}) {
        const toolTypes = ['VPW-Werkzeug', 'Partner-Tool', 'Wechsel-Tool'];
        const parts = ['B-Säule rechts', 'C-Säule links', 'Dachblech', 'Heckklappe', 'Stoßfänger vorn'];
        const locations = ['Halle A - Regal 3', 'Halle B - Lager 2', 'Montage Bereich 1'];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const items = [];
        for (let i = 1; i <= 10; i++) {
            const toolType = toolTypes[(i - 1) % toolTypes.length];
            const part = parts[(i - 1) % parts.length];
            const paddedNum = String(i + 3000).padStart(4, '0');
            const year = new Date().getFullYear();

            // Berechne Fälligkeitsdatum - erste 5 sind überfällig
            const dueDate = new Date(today);
            if (i <= 5) {
                // Überfällig: 3-15 Tage in der Vergangenheit
                dueDate.setDate(today.getDate() - (3 * i));
            } else {
                // Zukünftig: 7-35 Tage in der Zukunft
                dueDate.setDate(today.getDate() + (7 * (i - 5)));
            }

            // Letzte Inventur: zufällig in den letzten 30 Tagen
            const lastInv = new Date(today);
            lastInv.setDate(today.getDate() - ((i - 1) % 28 + 1));

            items.push({
                id: 3000 + i,
                number: `VPW-${paddedNum}`,
                toolNumber: `${toolType.substring(0, 3).toUpperCase()}-${year}-${paddedNum}`,
                name: `${toolType} ${part}`,
                supplier: 'Bosch Rexroth AG',
                location: locations[(i - 1) % locations.length],
                status: i <= 5 ? 'offen' : (i <= 7 ? 'feinplanung' : 'in-inventur'),
                lastInventory: lastInv.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0]
            });
        }

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
        });
    }

    // === Verschrottung (Scrapping) Endpoints ===
    // Verschrottung nutzt /process mit type=SCRAPPING

    async getVerschrottungList(filters = {}) {
        return this.callWithFallback(
            async () => {
                const params = new URLSearchParams();
                params.append('limit', filters.limit || 100);
                params.append('skip', filters.skip || 0);

                // Server-seitiger Supplier-Filter
                const supplierNumber = this.supplierNumber;
                if (supplierNumber) {
                    params.append('md.contractPartner', supplierNumber);
                }

                // Versuche zuerst SCRAPPING Prozesse zu laden
                // Falls keine gefunden, lade alle und filtere nach type
                let endpoint = `/process?${params.toString()}&md.p.type=SCRAPPING`;
                let response = await this.call(endpoint, 'GET');
                let items = Array.isArray(response) ? response : (response.data || []);

                // Falls keine SCRAPPING gefunden, versuche SCRAPPING.C (wie RELOCATION.C)
                if (items.length === 0) {
                    console.log('Keine SCRAPPING Prozesse, versuche SCRAPPING.C...');
                    endpoint = `/process?${params.toString()}&md.p.type=SCRAPPING.C`;
                    response = await this.call(endpoint, 'GET');
                    items = Array.isArray(response) ? response : (response.data || []);
                }

                // Falls immer noch keine, lade alle und suche nach scrapping im type
                if (items.length === 0) {
                    console.log('Keine SCRAPPING.C, lade alle Prozesse und filtere...');
                    endpoint = `/process?${params.toString()}`;
                    response = await this.call(endpoint, 'GET');
                    const allItems = Array.isArray(response) ? response : (response.data || []);

                    // Debug: Zeige alle Process-Typen
                    const types = [...new Set(allItems.map(p => p.meta?.['p.type'] || p.meta?.type || 'unknown'))];
                    console.log('Gefundene Process-Typen:', types);

                    // Filtere nach scrapping-aehnlichen Typen
                    items = allItems.filter(p => {
                        const pType = (p.meta?.['p.type'] || p.meta?.type || '').toUpperCase();
                        return pType.includes('SCRAPPING') || pType.includes('SCRAP');
                    });

                    console.log('Gefilterte Scrapping-Prozesse:', items.length);
                }

                // Debug-Log
                if (items.length > 0) {
                    console.log('Verschrottung API Response (erstes Item):', JSON.stringify(items[0], null, 2));
                }

                const transformedData = items.map((item, index) => {
                    const meta = item.meta || {};
                    const context = item.context || {};

                    // Key fuer Navigation
                    const processKey = context.key || item.key || '';

                    // Bezeichnung (Titel des Prozesses)
                    const title = meta.title || meta.description || 'Verschrottung';

                    // Vertragspartner
                    const contractPartner = meta.contractPartner || meta.supplier || '';

                    // Betreiber
                    const operator = meta.operator || meta['asset.owner'] || '';

                    // Baureihe
                    const baureihe = meta.baureihe || meta.series || meta.project || '';

                    // Teilenummer
                    const partNumber = meta.partNumber || meta.partNumbers || meta.inventoryNumber || '';

                    // Ersteller
                    const creator = meta.creator || meta.createdBy || '';

                    // Facheinkaeufer
                    const buyer = meta.buyer || meta.facheinkaeufer || meta.purchaser || '';

                    // Standort
                    let location = '';
                    if (meta.assetCity && meta.assetCountry) {
                        location = `${meta.assetCity} (${meta.assetCountry})`;
                    } else if (meta.location) {
                        location = meta.location;
                    } else if (meta['asset.city']) {
                        location = `${meta['asset.city']} (${meta['asset.country'] || ''})`;
                    }

                    // Status - Mapping aus Process-Status
                    let status = 'offen';
                    const processStatus = meta.status || meta.state || '';
                    if (processStatus === 'COMPLETED' || processStatus === 'DONE' || processStatus === 'CLOSED') {
                        status = 'abgeschlossen';
                    } else if (processStatus === 'IN_PROGRESS' || processStatus === 'PENDING') {
                        status = 'in-bearbeitung';
                    } else if (processStatus === 'APPROVED') {
                        status = 'genehmigt';
                    } else if (processStatus === 'NEW' || processStatus === 'OPEN') {
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
    async getVerschrottungDetail(processKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/process/${processKey}`, 'GET');
                const data = response.data || response;
                console.log('Verschrottung Detail Response:', JSON.stringify(data, null, 2));

                return {
                    success: true,
                    data: data
                };
            },
            () => ({ success: false, error: 'Mock nicht verfuegbar' })
        );
    }

    // Verschrottung Positionen laden
    async getVerschrottungPositions(processKey, filters = {}) {
        return this.callWithFallback(
            async () => {
                const params = new URLSearchParams();
                params.append('limit', filters.limit || 100);
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
                const response = await this.call(`/companies/${companyKey}/locations?limit=100&showInactive=true`, 'GET');

                const locations = Array.isArray(response) ? response : (response.data || []);
                return {
                    success: true,
                    data: locations.map(loc => ({
                        key: loc.context?.key || '',
                        name: loc.meta?.title || loc.meta?.name || 'Unbenannt',
                        country: loc.meta?.country || '',
                        city: loc.meta?.city || '',
                        street: loc.meta?.street || '',
                        postcode: loc.meta?.postcode || '',
                        isDefault: loc.meta?.isDefault || false,
                        originalData: loc
                    })),
                    total: locations.length
                };
            },
            () => this.getMockLocationsData()
        );
    }

    // Get users for a company
    async getCompanyUsers(companyKey) {
        return this.callWithFallback(
            async () => {
                const response = await this.call(`/access/companies/${companyKey}/users?limit=100&showInactive=true`, 'GET');

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
                const response = await this.call(`/companies/${companyKey}/suppliers?limit=100`, 'GET');

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
            // Erst aktuellen Stand laden fuer revision
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

    // Mock-Daten fuer Lieferanten
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

    // Mock-Daten fuer Unternehmen
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
}

// Create global API service instance
const api = new APIService();
