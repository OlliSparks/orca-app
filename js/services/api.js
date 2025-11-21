// ORCA 2.0 - API Service Layer
// Unterstützt Mock-Daten und Live-API mit automatischem Fallback

class APIService {
    constructor() {
        // API Mode: wird aus API_CONFIG geladen
        this.mode = typeof API_CONFIG !== 'undefined' ? API_CONFIG.mode : 'mock';
        this.baseURL = typeof API_CONFIG !== 'undefined' ? API_CONFIG.baseURL : 'http://localhost:8000/api';
        this.isConnected = false;

        // CACHE für Mock-Daten - wird EINMAL beim Start generiert
        this.mockToolsCache = null;
        this.initializeMockData();

        console.log(`API Service initialized in ${this.mode.toUpperCase()} mode`);
    }

    // Initialisiere Mock-Daten EINMAL beim Start
    initializeMockData() {
        if (this.mockToolsCache === null) {
            this.mockToolsCache = this.generateFixedTestData();
            console.log('Mock-Daten initialisiert:', this.mockToolsCache.length, 'Werkzeuge');
        }
    }

    // Generic API call method with authentication
    async call(endpoint, method = 'GET', data = null, useAuth = true) {
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

        // Add authentication header if needed
        if (useAuth && typeof authService !== 'undefined') {
            const authHeader = authService.getAuthHeader();
            Object.assign(options.headers, authHeader);
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
            const response = await fetch(url, options);

            if (!response.ok) {
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

    // === FM (Fertigungsmittel) Endpoints ===

    // Get all FM items
    async getFMList(filters = {}) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.supplier) params.append('supplier', filters.supplier);
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
            () => this.getMockFMData(filters)
        );
    }

    // Get single FM item
    async getFMDetail(id) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const endpoint = `/assets/${id}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                return {
                    success: true,
                    data: response.data || response
                };
            },
            // Mock fallback
            () => this.getMockFMDetail(id)
        );
    }

    // Update FM item
    async updateFM(id, data) {
        // TODO: Replace with real API call
        // return await this.call(`/fm/fertigungsmittel/${id}`, 'PUT', data);

        console.log('Update FM:', id, data);
        return { success: true, message: 'FM aktualisiert (Mock)' };
    }

    // === Inventur Endpoints ===

    // Get inventory list
    async getInventoryList(filters = {}) {
        return this.callWithFallback(
            // Live API call
            async () => {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.location) params.append('location', filters.location);

                const endpoint = `/inventory-list?${params.toString()}`;
                const response = await this.call(endpoint, 'GET');

                // Transform API response to our format
                return {
                    success: true,
                    data: response.data || response,
                    total: response.total || (response.data ? response.data.length : 0)
                };
            },
            // Mock fallback
            () => this.getMockInventoryData(filters)
        );
    }

    // Update inventory item
    async updateInventoryItem(id, data) {
        // TODO: Replace with real API call
        // return await this.call(`/inventur/${id}`, 'PUT', data);

        console.log('Update Inventory:', id, data);
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
        console.log('getFMDetail called with ID:', id, 'Type:', typeof id);
        const tool = this.mockToolsCache.find(t => t.id == id);
        console.log('Found tool:', tool);

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
        const items = this.mockToolsCache.slice(0, 50).map(tool => ({
            id: tool.id,
            name: tool.name,
            number: tool.toolNumber,
            location: tool.locationId,
            dueDate: tool.dueDate
        }));

        return Promise.resolve({
            success: true,
            data: items,
            total: items.length
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
