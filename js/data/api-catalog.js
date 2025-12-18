// ORCA 2.0 - API-Katalog
// Vollständige Dokumentation aller GET-Endpoints für intelligente Agenten
// Stand: 2024-12-19

const API_CATALOG = {
    version: '1.0.0',
    baseUrl: 'https://int.bmw.organizingcompanyassets.com/api/orca',

    // ============================================================
    // INVENTORY ENDPOINTS
    // ============================================================

    inventoryList: {
        path: '/inventory-list',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Inventuren mit Filteroptionen',
        intents: ['inventuren anzeigen', 'inventurliste', 'alle inventuren', 'offene inventuren', 'inventur suchen'],
        entities: ['Inventur', 'Status', 'Standort', 'Lieferant'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'status', type: 'array', required: true, description: 'Filter für Status', values: ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'] },
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse', default: 50 },
                { name: 'skip', type: 'integer', required: false, description: 'Überspringe erste n Ergebnisse' },
                { name: 'city', type: 'array', required: false, description: 'Filter für Stadt' },
                { name: 'country', type: 'array', required: false, description: 'Filter für Land' },
                { name: 'supplier', type: 'array', required: false, description: 'Filter für Lieferant (Key)' },
                { name: 'creator', type: 'array', required: false, description: 'Filter für Ersteller (Key)' },
                { name: 'assignedUser', type: 'array', required: false, description: 'Filter für zugewiesenen User' },
                { name: 'type', type: 'array', required: false, description: 'Inventurtyp', values: ['IA', 'IB', 'IC', 'ID'] },
                { name: 'showPartitions', type: 'boolean', required: false, description: 'Partitionen anzeigen' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'revision': { type: 'string', description: 'Revisionskennung' },
                'context.key': { type: 'UUID', description: 'Inventur-Key' },
                'meta.inventoryNumber': { type: 'string', description: 'Inventurnummer (z.B. BMW-2024-001)' },
                'meta.status': { type: 'string', description: 'Status (I0-I6)' },
                'meta.type': { type: 'string', description: 'Typ (IA, IB, IC, ID)' },
                'meta.inventoryText': { type: 'string', description: 'Bezeichnung' },
                'company.key': { type: 'UUID', description: 'Firmen-Key' },
                'company.value': { type: 'string', description: 'Firmenname' },
                'location.key': { type: 'UUID', description: 'Standort-Key' },
                'location.value': { type: 'string', description: 'Standortname' },
                'assignedUser.value': { type: 'string', description: 'Zugewiesener User' },
                'creator.value': { type: 'string', description: 'Ersteller' },
                'numberOfFailedPositions': { type: 'integer', description: 'Anzahl fehlgeschlagener Positionen' }
            }
        },

        exampleRequest: '/inventory-list?status=I0&status=I2&limit=20',
        prerequisites: [],
        followUps: ['inventoryDetail', 'inventoryPositions'],
        usedInApp: ['js/pages/inventur.js', 'js/services/api.js:getInventoryList']
    },

    inventoryDetail: {
        path: '/inventory/{inventoryKey}',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',

        description: 'Lädt Details einer einzelnen Inventur',
        intents: ['inventur details', 'inventur anzeigen', 'inventur öffnen'],
        entities: ['Inventur', 'inventoryKey'],

        input: {
            pathParams: [
                { name: 'inventoryKey', type: 'UUID', required: true, description: 'Inventur-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'revision': { type: 'string', description: 'Revisionskennung' },
                'context.key': { type: 'UUID', description: 'Inventur-Key' },
                'meta.inventoryNumber': { type: 'string', description: 'Inventurnummer' },
                'meta.status': { type: 'string', description: 'Status' },
                'meta.startDate': { type: 'date', description: 'Startdatum' },
                'meta.endDate': { type: 'date', description: 'Enddatum' }
            }
        },

        exampleRequest: '/inventory/6ac791ee-f94e-483f-89ab-1ac74b0f58b9',
        prerequisites: ['inventoryList'],
        followUps: ['inventoryPositions'],
        usedInApp: ['js/pages/inventur-detail.js']
    },

    inventoryPositions: {
        path: '/inventory/{inventoryKey}/positions',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',

        description: 'Lädt alle Positionen (Werkzeuge) einer Inventur',
        intents: ['positionen laden', 'werkzeuge in inventur', 'inventur werkzeuge', 'was ist in inventur'],
        entities: ['Inventur', 'Werkzeug', 'Position', 'inventoryKey'],

        input: {
            pathParams: [
                { name: 'inventoryKey', type: 'UUID', required: true, description: 'Inventur-Key' }
            ],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' },
                { name: 'offset', type: 'integer', required: false, description: 'Offset' },
                { name: 'status', type: 'array', required: false, description: 'Positionsstatus', values: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'] },
                { name: 'isUnassigned', type: 'array', required: false, description: 'Nur nicht-zugewiesene' },
                { name: 'project', type: 'array', required: false, description: 'Filter für Projekt' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Position-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer' },
                'meta.name': { type: 'string', description: 'Werkzeugname' },
                'meta.status': { type: 'string', description: 'Positionsstatus (P0-P6)' },
                'asset.key': { type: 'UUID', description: 'Asset-Key' },
                'location': { type: 'string', description: 'Standort' }
            }
        },

        exampleRequest: '/inventory/6ac791ee-f94e-483f-89ab-1ac74b0f58b9/positions?limit=100',
        prerequisites: ['inventoryList', 'inventoryDetail'],
        followUps: ['assetDetail'],
        usedInApp: ['js/services/api.js:getInventoryPositions']
    },

    // ============================================================
    // ASSET ENDPOINTS
    // ============================================================

    assetList: {
        path: '/asset-list',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Assets/Werkzeuge mit umfangreichen Filteroptionen',
        intents: ['werkzeuge anzeigen', 'asset suchen', 'alle werkzeuge', 'werkzeugliste'],
        entities: ['Werkzeug', 'Asset', 'Lieferant', 'Standort', 'Projekt'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff (Werkzeugnummer, Name)' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse', default: 50 },
                { name: 'offset', type: 'integer', required: false, description: 'Offset' },
                { name: 'client', type: 'array', required: false, description: 'Filter für Auftraggeber' },
                { name: 'supplier', type: 'array', required: false, description: 'Filter für Lieferantennummer' },
                { name: 'project', type: 'array', required: false, description: 'Filter für Projekt' },
                { name: 'owner', type: 'array', required: false, description: 'Filter für Eigentümer' },
                { name: 'processStatus', type: 'array', required: false, description: 'Filter für Prozessstatus' },
                { name: 'assetCity', type: 'array', required: false, description: 'Filter für Stadt' },
                { name: 'assetCountry', type: 'array', required: false, description: 'Filter für Land' },
                { name: 'lifecycleStatus', type: 'array', required: false, description: 'Lebenszyklus-Status' },
                { name: 'onlyMine', type: 'boolean', required: false, description: 'Nur eigene Assets' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'revision': { type: 'string', description: 'Revisionskennung' },
                'context.key': { type: 'UUID', description: 'Asset-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer (z.B. 10255187)' },
                'meta.name': { type: 'string', description: 'Werkzeugname' },
                'meta.status': { type: 'string', description: 'Status' },
                'meta.assetCity': { type: 'string', description: 'Stadt' },
                'meta.assetCountry': { type: 'string', description: 'Land' },
                'meta.supplier': { type: 'string', description: 'Lieferant' },
                'meta.project': { type: 'string', description: 'Projekt' }
            }
        },

        exampleRequest: '/asset-list?query=10255187&limit=10',
        prerequisites: [],
        followUps: ['assetDetail', 'assetProcessHistory'],
        usedInApp: ['js/pages/fm-akte.js', 'js/services/api.js:getAssetList']
    },

    assetQuickSearch: {
        path: '/asset-list/quick-search',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',

        description: 'Schnellsuche für Assets nach bestimmtem Kriterium',
        intents: ['werkzeug schnell suchen', 'asset finden', 'werkzeugnummer suchen'],
        entities: ['Werkzeug', 'Werkzeugnummer'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'criteria', type: 'string', required: true, description: 'Suchkriterium (z.B. identifier, name)' },
                { name: 'value', type: 'string', required: true, description: 'Suchwert' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Asset-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer' },
                'meta.name': { type: 'string', description: 'Name' }
            }
        },

        exampleRequest: '/asset-list/quick-search?criteria=identifier&value=10255187&limit=5',
        prerequisites: [],
        followUps: ['assetDetail'],
        usedInApp: []
    },

    assetDetail: {
        path: '/asset/{assetKey}',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',

        description: 'Lädt alle Details eines einzelnen Assets/Werkzeugs',
        intents: ['werkzeug details', 'asset anzeigen', 'werkzeug öffnen', 'werkzeug info'],
        entities: ['Werkzeug', 'Asset', 'assetKey'],

        input: {
            pathParams: [
                { name: 'assetKey', type: 'UUID', required: true, description: 'Asset-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'revision': { type: 'string', description: 'Revisionskennung' },
                'context.key': { type: 'UUID', description: 'Asset-Key' },
                'additionalComment': { type: 'string', description: 'Zusätzlicher Kommentar' },
                'area': { type: 'string', description: 'Bereich' },
                'FEK_Id': { type: 'string', description: 'Facheinkäufer-ID' },
                'assetCity': { type: 'string', description: 'Stadt' },
                'assetCountry': { type: 'string', description: 'Land' },
                'assetPostcode': { type: 'string', description: 'PLZ' },
                'assetStreet': { type: 'string', description: 'Straße' },
                'height': { type: 'decimal', description: 'Höhe' },
                'width': { type: 'decimal', description: 'Breite' },
                'length': { type: 'decimal', description: 'Länge' },
                'weight': { type: 'decimal', description: 'Gewicht' },
                'hsCode': { type: 'string', description: 'HS-Code' },
                'supplier': { type: 'string', description: 'Lieferant' },
                'project': { type: 'string', description: 'Projekt' },
                'lifecycleStatus': { type: 'string', description: 'Lebenszyklus-Status' }
            }
        },

        exampleRequest: '/asset/abc12345-def6-7890-ghij-klmnopqrstuv',
        prerequisites: ['assetList', 'assetQuickSearch'],
        followUps: ['assetProcessHistory'],
        usedInApp: ['js/pages/werkzeug-detail.js']
    },

    assetProcessHistory: {
        path: '/asset/{assetKey}/process-history',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',

        description: 'Lädt die Prozess-Historie eines Assets (Inventuren, Verlagerungen, etc.)',
        intents: ['prozess historie', 'werkzeug historie', 'was ist mit werkzeug passiert'],
        entities: ['Werkzeug', 'Prozess', 'Historie', 'assetKey'],

        input: {
            pathParams: [
                { name: 'assetKey', type: 'UUID', required: true, description: 'Asset-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'processKey': { type: 'UUID', description: 'Prozess-Key' },
                'processType': { type: 'string', description: 'Prozesstyp (RELOCATION, SCRAPPING, etc.)' },
                'status': { type: 'string', description: 'Status' },
                'createdAt': { type: 'date', description: 'Erstellt am' }
            }
        },

        exampleRequest: '/asset/abc12345-def6-7890-ghij-klmnopqrstuv/process-history',
        prerequisites: ['assetDetail'],
        followUps: ['processDetail'],
        usedInApp: []
    },

    // ============================================================
    // PROCESS ENDPOINTS (Relocation, VPW, Scrapping)
    // ============================================================

    processList: {
        path: '/process',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Prozesse (Verlagerungen, VPW, etc.)',
        intents: ['prozesse anzeigen', 'verlagerungen', 'alle prozesse', 'offene verlagerungen'],
        entities: ['Prozess', 'Verlagerung', 'VPW'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'skip', type: 'integer', required: false, description: 'Überspringe erste n' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' },
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'queryParams', type: 'object', required: true, description: 'Erweiterte Filterparameter' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Prozess-Key' },
                'meta.processNumber': { type: 'string', description: 'Prozessnummer' },
                'meta.type': { type: 'string', description: 'Typ (RELOCATION, VPW, SCRAPPING)' },
                'meta.status': { type: 'string', description: 'Status (R0-R6)' },
                'meta.sourceLocation': { type: 'string', description: 'Quellstandort' },
                'meta.targetLocation': { type: 'string', description: 'Zielstandort' }
            }
        },

        exampleRequest: '/process?limit=50&queryParams={"type":"RELOCATION"}',
        prerequisites: [],
        followUps: ['processDetail', 'processPositions'],
        usedInApp: ['js/pages/verlagerung.js', 'js/services/api.js:getProcessList']
    },

    processDetail: {
        path: '/process/{processKey}',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',

        description: 'Lädt Details eines einzelnen Prozesses',
        intents: ['prozess details', 'verlagerung anzeigen', 'prozess öffnen'],
        entities: ['Prozess', 'Verlagerung', 'processKey'],

        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true, description: 'Prozess-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'context.key': { type: 'UUID', description: 'Prozess-Key' },
                'meta.processNumber': { type: 'string', description: 'Prozessnummer' },
                'meta.type': { type: 'string', description: 'Prozesstyp' },
                'meta.status': { type: 'string', description: 'Status' },
                'meta.sourceLocation': { type: 'string', description: 'Quellstandort' },
                'meta.targetLocation': { type: 'string', description: 'Zielstandort' },
                'meta.createdAt': { type: 'date', description: 'Erstellt am' }
            }
        },

        exampleRequest: '/process/6ac791ee-f94e-483f-89ab-1ac74b0f58b9',
        prerequisites: ['processList'],
        followUps: ['processPositions', 'processDetails'],
        usedInApp: ['js/pages/verlagerung-detail.js']
    },

    processPositions: {
        path: '/process/{processKey}/positions',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',

        description: 'Lädt alle Positionen (Werkzeuge) eines Prozesses',
        intents: ['prozess positionen', 'werkzeuge in verlagerung', 'was wird verlagert'],
        entities: ['Prozess', 'Position', 'Werkzeug', 'processKey'],

        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true, description: 'Prozess-Key' }
            ],
            queryParams: [
                { name: 'skip', type: 'integer', required: false, description: 'Überspringe erste n' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' },
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Position-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer' },
                'meta.name': { type: 'string', description: 'Werkzeugname' },
                'meta.status': { type: 'string', description: 'Positionsstatus' },
                'asset.key': { type: 'UUID', description: 'Asset-Key' }
            }
        },

        exampleRequest: '/process/6ac791ee-f94e-483f-89ab-1ac74b0f58b9/positions?limit=100',
        prerequisites: ['processDetail'],
        followUps: ['assetDetail'],
        usedInApp: ['js/services/api.js:getProcessPositions']
    },

    processFullDetails: {
        path: '/process/{processKey}/details',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',

        description: 'Lädt vollständige Details eines Prozesses inkl. aller Metadaten',
        intents: ['vollständige prozess details', 'alle prozess infos'],
        entities: ['Prozess', 'processKey'],

        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true, description: 'Prozess-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'process': { type: 'object', description: 'Prozess-Objekt' },
                'positions': { type: 'array', description: 'Alle Positionen' },
                'history': { type: 'array', description: 'Aktionen-Historie' }
            }
        },

        exampleRequest: '/process/6ac791ee-f94e-483f-89ab-1ac74b0f58b9/details',
        prerequisites: ['processDetail'],
        followUps: [],
        usedInApp: []
    },

    scrappingList: {
        path: '/process/scrapping',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Verschrottungs-Prozesse',
        intents: ['verschrottungen anzeigen', 'scrap prozesse', 'was wird verschrottet'],
        entities: ['Verschrottung', 'Prozess'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'skip', type: 'integer', required: false, description: 'Überspringe erste n' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' },
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'queryParams', type: 'object', required: true, description: 'Erweiterte Filter' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Prozess-Key' },
                'meta.status': { type: 'string', description: 'Status' },
                'meta.positionCount': { type: 'integer', description: 'Anzahl Positionen' }
            }
        },

        exampleRequest: '/process/scrapping?limit=20',
        prerequisites: [],
        followUps: ['processDetail', 'processPositions'],
        usedInApp: ['js/pages/verschrottung.js']
    },

    // ============================================================
    // COMPANY ENDPOINTS
    // ============================================================

    companiesSearch: {
        path: '/companies',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',

        description: 'Sucht nach Firmen/Unternehmen',
        intents: ['firma suchen', 'unternehmen finden', 'lieferant suchen'],
        entities: ['Firma', 'Unternehmen', 'Lieferant'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff (Name, Nummer)' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Firmen-Key' },
                'meta.name': { type: 'string', description: 'Firmenname' },
                'meta.number': { type: 'string', description: 'Firmennummer' }
            }
        },

        exampleRequest: '/companies?query=BMW',
        prerequisites: [],
        followUps: ['companyDetail', 'companyLocations'],
        usedInApp: ['js/services/api.js:searchCompanies']
    },

    companiesList: {
        path: '/companies/list',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',

        description: 'Listet Firmen nach Rolle des Users',
        intents: ['meine firmen', 'firmen liste'],
        entities: ['Firma'],

        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Firmen-Key' },
                'meta.name': { type: 'string', description: 'Firmenname' }
            }
        },

        exampleRequest: '/companies/list',
        prerequisites: [],
        followUps: ['companyDetail'],
        usedInApp: []
    },

    companyDetail: {
        path: '/companies/{companyKey}',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',

        description: 'Lädt Details einer Firma',
        intents: ['firma details', 'unternehmen anzeigen'],
        entities: ['Firma', 'companyKey'],

        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true, description: 'Firmen-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'context.key': { type: 'UUID', description: 'Firmen-Key' },
                'meta.name': { type: 'string', description: 'Firmenname' },
                'meta.number': { type: 'string', description: 'Firmennummer' },
                'meta.address': { type: 'object', description: 'Adresse' }
            }
        },

        exampleRequest: '/companies/abc12345-def6-7890-ghij-klmnopqrstuv',
        prerequisites: ['companiesSearch', 'companiesList'],
        followUps: ['companyLocations', 'companySuppliers'],
        usedInApp: ['js/pages/unternehmen-detail.js']
    },

    companyLocations: {
        path: '/companies/{companyKey}/locations',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Standorte einer Firma',
        intents: ['standorte einer firma', 'firmenstandorte', 'locations'],
        entities: ['Firma', 'Standort', 'companyKey'],

        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true, description: 'Firmen-Key' }
            ],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'country', type: 'string', required: false, description: 'Land' },
                { name: 'city', type: 'string', required: false, description: 'Stadt' },
                { name: 'showInactive', type: 'boolean', required: false, description: 'Inaktive anzeigen' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl' },
                { name: 'offset', type: 'integer', required: false, description: 'Offset' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Standort-Key' },
                'meta.name': { type: 'string', description: 'Standortname' },
                'meta.city': { type: 'string', description: 'Stadt' },
                'meta.country': { type: 'string', description: 'Land' },
                'meta.street': { type: 'string', description: 'Straße' },
                'meta.postCode': { type: 'string', description: 'PLZ' }
            }
        },

        exampleRequest: '/companies/abc12345/locations?city=Radolfzell&limit=10',
        prerequisites: ['companyDetail'],
        followUps: [],
        usedInApp: ['js/services/api.js:getCompanyLocations']
    },

    companySuppliers: {
        path: '/companies/{companyKey}/suppliers',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Lieferanten einer Firma',
        intents: ['lieferanten einer firma', 'supplier liste'],
        entities: ['Firma', 'Lieferant', 'companyKey'],

        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true, description: 'Firmen-Key' }
            ],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Lieferanten-Key' },
                'meta.name': { type: 'string', description: 'Lieferantenname' },
                'meta.number': { type: 'string', description: 'Lieferantennummer' }
            }
        },

        exampleRequest: '/companies/abc12345/suppliers',
        prerequisites: ['companyDetail'],
        followUps: [],
        usedInApp: []
    },

    // ============================================================
    // USER ENDPOINTS
    // ============================================================

    usersList: {
        path: '/users',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Benutzer',
        intents: ['benutzer anzeigen', 'user liste', 'alle user'],
        entities: ['Benutzer', 'User'],

        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff (Name, Email)' },
                { name: 'skip', type: 'integer', required: false, description: 'Überspringe erste n' },
                { name: 'limit', type: 'integer', required: false, description: 'Anzahl Ergebnisse' }
            ],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'User-Key' },
                'meta.firstName': { type: 'string', description: 'Vorname' },
                'meta.lastName': { type: 'string', description: 'Nachname' },
                'meta.email': { type: 'string', description: 'E-Mail' },
                'meta.role': { type: 'string', description: 'Rolle' }
            }
        },

        exampleRequest: '/users?query=oliver&limit=10',
        prerequisites: [],
        followUps: [],
        usedInApp: ['js/services/api.js:getUsers']
    },

    userProfile: {
        path: '/profile',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',

        description: 'Lädt das Profil des eingeloggten Benutzers',
        intents: ['mein profil', 'wer bin ich', 'eigene daten'],
        entities: ['Benutzer', 'Profil'],

        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'object',
            fields: {
                'context.key': { type: 'UUID', description: 'User-Key' },
                'meta.firstName': { type: 'string', description: 'Vorname' },
                'meta.lastName': { type: 'string', description: 'Nachname' },
                'meta.email': { type: 'string', description: 'E-Mail' },
                'meta.companies': { type: 'array', description: 'Zugeordnete Firmen' },
                'meta.roles': { type: 'array', description: 'Rollen' }
            }
        },

        exampleRequest: '/profile',
        prerequisites: [],
        followUps: [],
        usedInApp: ['js/services/auth.js']
    },

    companyUsers: {
        path: '/access/companies/{key}/users',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',

        description: 'Listet alle Benutzer einer Firma',
        intents: ['benutzer einer firma', 'wer arbeitet bei', 'firmen user'],
        entities: ['Benutzer', 'Firma', 'companyKey'],

        input: {
            pathParams: [
                { name: 'key', type: 'UUID', required: true, description: 'Firmen-Key' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },

        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'User-Key' },
                'meta.firstName': { type: 'string', description: 'Vorname' },
                'meta.lastName': { type: 'string', description: 'Nachname' },
                'meta.email': { type: 'string', description: 'E-Mail' },
                'meta.groups': { type: 'array', description: 'Gruppen/Rollen' }
            }
        },

        exampleRequest: '/access/companies/abc12345/users',
        prerequisites: ['companyDetail'],
        followUps: [],
        usedInApp: []
    }
};

// ============================================================
// KATALOG-STATISTIK
// ============================================================

const API_CATALOG_STATS = {
    total: Object.keys(API_CATALOG).filter(k => !['version', 'baseUrl'].includes(k)).length,
    byCategory: {},
    byStatus: { DOKUMENTIERT: 0, OFFEN: 0 }
};

// Statistik berechnen
Object.values(API_CATALOG).forEach(endpoint => {
    if (typeof endpoint === 'object' && endpoint.category) {
        API_CATALOG_STATS.byCategory[endpoint.category] =
            (API_CATALOG_STATS.byCategory[endpoint.category] || 0) + 1;
        API_CATALOG_STATS.byStatus[endpoint.status] =
            (API_CATALOG_STATS.byStatus[endpoint.status] || 0) + 1;
    }
});

// ============================================================
// HELPER FUNCTIONS FÜR AGENTEN
// ============================================================

const ApiCatalogHelper = {
    // Finde Endpoint anhand von Intent
    findByIntent(userInput) {
        const input = userInput.toLowerCase();
        const matches = [];

        Object.entries(API_CATALOG).forEach(([key, endpoint]) => {
            if (typeof endpoint !== 'object' || !endpoint.intents) return;

            for (const intent of endpoint.intents) {
                if (input.includes(intent) || intent.includes(input)) {
                    matches.push({ key, endpoint, matchedIntent: intent });
                    break;
                }
            }
        });

        return matches;
    },

    // Finde Endpoint anhand von Entity
    findByEntity(entityName) {
        const entity = entityName.toLowerCase();
        const matches = [];

        Object.entries(API_CATALOG).forEach(([key, endpoint]) => {
            if (typeof endpoint !== 'object' || !endpoint.entities) return;

            for (const e of endpoint.entities) {
                if (e.toLowerCase().includes(entity) || entity.includes(e.toLowerCase())) {
                    matches.push({ key, endpoint });
                    break;
                }
            }
        });

        return matches;
    },

    // Finde Endpoint anhand von Kategorie
    findByCategory(category) {
        return Object.entries(API_CATALOG)
            .filter(([key, endpoint]) =>
                typeof endpoint === 'object' &&
                endpoint.category?.toLowerCase() === category.toLowerCase()
            )
            .map(([key, endpoint]) => ({ key, endpoint }));
    },

    // Generiere API-Call aus Endpoint + Parametern
    buildApiCall(endpointKey, params = {}) {
        const endpoint = API_CATALOG[endpointKey];
        if (!endpoint) return null;

        let url = endpoint.path;

        // Path-Parameter ersetzen
        if (endpoint.input?.pathParams) {
            for (const p of endpoint.input.pathParams) {
                if (params[p.name]) {
                    url = url.replace(`{${p.name}}`, params[p.name]);
                }
            }
        }

        // Query-Parameter anhängen
        const queryParams = [];
        if (endpoint.input?.queryParams) {
            for (const p of endpoint.input.queryParams) {
                if (params[p.name] !== undefined) {
                    if (Array.isArray(params[p.name])) {
                        params[p.name].forEach(v => queryParams.push(`${p.name}=${encodeURIComponent(v)}`));
                    } else {
                        queryParams.push(`${p.name}=${encodeURIComponent(params[p.name])}`);
                    }
                }
            }
        }

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }

        return {
            method: endpoint.method,
            url: API_CATALOG.baseUrl + url,
            headers: endpoint.input?.headers || []
        };
    },

    // Erkläre Endpoint
    explainEndpoint(endpointKey) {
        const endpoint = API_CATALOG[endpointKey];
        if (!endpoint) return 'Endpoint nicht gefunden';

        let explanation = `**${endpoint.path}** (${endpoint.method})\n\n`;
        explanation += `${endpoint.description}\n\n`;

        if (endpoint.input?.pathParams?.length > 0) {
            explanation += '**Pfad-Parameter:**\n';
            endpoint.input.pathParams.forEach(p => {
                explanation += `- \`${p.name}\` (${p.type}): ${p.description}\n`;
            });
            explanation += '\n';
        }

        if (endpoint.input?.queryParams?.length > 0) {
            explanation += '**Query-Parameter:**\n';
            endpoint.input.queryParams.forEach(p => {
                const req = p.required ? '**REQUIRED**' : 'optional';
                explanation += `- \`${p.name}\` (${p.type}, ${req}): ${p.description}\n`;
            });
            explanation += '\n';
        }

        explanation += `**Beispiel:** \`${endpoint.exampleRequest}\`\n`;

        return explanation;
    }
};

// Export für Node.js / Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CATALOG, API_CATALOG_STATS, ApiCatalogHelper };
}
