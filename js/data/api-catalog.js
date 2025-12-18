// ORCA 2.0 - API-Katalog (VOLLSTAENDIG)
// Alle 88 GET-Endpoints dokumentiert
// Stand: 2024-12-18

const API_CATALOG = {
    version: '2.0.0',
    baseUrl: 'https://int.bmw.organizingcompanyassets.com/api/orca',

    // ============================================================
    // INVENTORY ENDPOINTS (12)
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
                { name: 'status', type: 'array', required: true, description: 'Status-Filter (I0-I6)' },
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'limit', type: 'integer', required: false, default: 50 },
                { name: 'skip', type: 'integer', required: false },
                { name: 'city', type: 'array', required: false },
                { name: 'country', type: 'array', required: false },
                { name: 'supplier', type: 'array', required: false, description: 'Lieferant-Key' },
                { name: 'creator', type: 'array', required: false },
                { name: 'assignedUser', type: 'array', required: false },
                { name: 'type', type: 'array', required: false, values: ['IA', 'IB', 'IC', 'ID'] },
                { name: 'showPartitions', type: 'boolean', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: {
            type: 'array',
            returns: 'InventoryEntry[]',
            fields: {
                'context.key': { type: 'UUID', description: 'Inventur-Key' },
                'meta.inventoryNumber': { type: 'string', description: 'Inventurnummer' },
                'meta.status': { type: 'string', description: 'Status (I0-I6)' },
                'meta.type': { type: 'string', description: 'Typ (IA-ID)' },
                'company.key': { type: 'UUID' },
                'company.value': { type: 'string' },
                'location.key': { type: 'UUID' },
                'assignedUser.value': { type: 'string' }
            }
        },
        exampleRequest: '/inventory-list?status=I0&status=I2&limit=20',
        prerequisites: [],
        followUps: ['inventoryDetail', 'inventoryPositions']
    },

    inventoryListFields: {
        path: '/inventory-list/fields',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Liefert verfuegbare Filter-Werte fuer Inventurliste',
        intents: ['inventur filter', 'filter optionen', 'verfuegbare filter'],
        entities: ['Filter'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'status', type: 'array', required: false },
                { name: 'type', type: 'array', required: false },
                { name: 'showPartitions', type: 'boolean', required: false },
                { name: 'fields', type: 'array', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'FilterProperties' },
        exampleRequest: '/inventory-list/fields?status=I0',
        prerequisites: [],
        followUps: ['inventoryList']
    },

    inventoryDetail: {
        path: '/inventory/{inventoryKey}',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details einer einzelnen Inventur',
        intents: ['inventur details', 'inventur anzeigen', 'inventur oeffnen'],
        entities: ['Inventur', 'inventoryKey'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: {
            type: 'object',
            fields: {
                'context.key': { type: 'UUID' },
                'meta.inventoryNumber': { type: 'string' },
                'meta.status': { type: 'string' },
                'meta.inventoryText': { type: 'string' }
            }
        },
        exampleRequest: '/inventory/{inventoryKey}',
        prerequisites: ['inventoryList'],
        followUps: ['inventoryPositions', 'inventoryPartitions']
    },

    inventoryTypes: {
        path: '/inventory/types',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Liefert alle Inventurtypen (IA, IB, IC, ID)',
        intents: ['inventurtypen', 'welche inventurarten', 'inventur arten'],
        entities: ['InventurTyp'],
        input: { pathParams: [], queryParams: [], headers: ['Authorization: Bearer {token}'] },
        output: { type: 'array', description: 'Liste der Inventurtypen' },
        exampleRequest: '/inventory/types',
        prerequisites: [],
        followUps: []
    },

    inventoryPositions: {
        path: '/inventory/{inventoryKey}/positions',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Laedt alle Positionen einer Inventur',
        intents: ['inventur positionen', 'werkzeuge in inventur', 'positionen laden'],
        entities: ['Inventur', 'Position', 'Werkzeug'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false },
                { name: 'status', type: 'array', required: false },
                { name: 'isUnassigned', type: 'boolean', required: false },
                { name: 'project', type: 'string', required: false },
                { name: 'assignedUser', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: {
            type: 'array',
            fields: {
                'context.key': { type: 'UUID', description: 'Position-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer' },
                'meta.status': { type: 'string', description: 'Status (P0-P6)' },
                'asset.key': { type: 'UUID' }
            }
        },
        exampleRequest: '/inventory/{inventoryKey}/positions?limit=100',
        prerequisites: ['inventoryDetail'],
        followUps: ['inventoryPositionDetail', 'assetDetail']
    },

    inventoryPositionDetail: {
        path: '/inventory/{inventoryKey}/positions/{positionKey}',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details einer einzelnen Inventur-Position',
        intents: ['position details', 'position anzeigen'],
        entities: ['Position', 'positionKey'],
        input: {
            pathParams: [
                { name: 'inventoryKey', type: 'UUID', required: true },
                { name: 'positionKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/inventory/{inventoryKey}/positions/{positionKey}',
        prerequisites: ['inventoryPositions'],
        followUps: ['assetDetail']
    },

    inventoryPositionFields: {
        path: '/inventory/{inventoryKey}/positions/fields',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Liefert Filter-Optionen fuer Inventur-Positionen',
        intents: ['positions filter', 'filter fuer positionen'],
        entities: ['Filter'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'FilterProperties' },
        exampleRequest: '/inventory/{inventoryKey}/positions/fields',
        prerequisites: ['inventoryDetail'],
        followUps: ['inventoryPositions']
    },

    inventoryPositionReport: {
        path: '/inventory/{inventoryKey}/position/report',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Status-Uebersicht aller Positionen einer Inventur',
        intents: ['inventur status', 'position statistik', 'wie viele positionen'],
        entities: ['Inventur', 'Report'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', description: 'Anzahl pro Status' },
        exampleRequest: '/inventory/{inventoryKey}/position/report',
        prerequisites: ['inventoryDetail'],
        followUps: []
    },

    inventoryPartitions: {
        path: '/inventory/{inventoryKey}/partitions',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Laedt Partitionen/Subprozesse einer Inventur',
        intents: ['inventur partitionen', 'subprozesse', 'teilinventuren'],
        entities: ['Inventur', 'Partition'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false },
                { name: 'status', type: 'array', required: false },
                { name: 'type', type: 'array', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array', returns: 'InventoryEntry[]' },
        exampleRequest: '/inventory/{inventoryKey}/partitions',
        prerequisites: ['inventoryDetail'],
        followUps: ['inventoryPartitionDetail']
    },

    inventoryPartitionDetail: {
        path: '/inventory/{inventoryKey}/partitions/{partitionKey}',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details einer Inventur-Partition',
        intents: ['partition details'],
        entities: ['Partition'],
        input: {
            pathParams: [
                { name: 'inventoryKey', type: 'UUID', required: true },
                { name: 'partitionKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/inventory/{inventoryKey}/partitions/{partitionKey}',
        prerequisites: ['inventoryPartitions'],
        followUps: []
    },

    inventoryBatchAccept: {
        path: '/inventory/batch/accept',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Batch-Accept Informationen fuer Inventuren',
        intents: ['batch accept', 'mehrere inventuren annehmen'],
        entities: ['Batch', 'User'],
        input: {
            pathParams: [],
            queryParams: [{ name: 'user', type: 'string', required: false }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/inventory/batch/accept',
        prerequisites: [],
        followUps: []
    },

    inventoryBatchApprove: {
        path: '/inventory/batch/approve',
        method: 'GET',
        category: 'Inventory',
        status: 'DOKUMENTIERT',
        description: 'Batch-Approve Informationen fuer Inventuren',
        intents: ['batch approve', 'mehrere inventuren freigeben'],
        entities: ['Batch', 'User'],
        input: {
            pathParams: [],
            queryParams: [{ name: 'user', type: 'string', required: false }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/inventory/batch/approve',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // ASSET ENDPOINTS (15)
    // ============================================================

    assetList: {
        path: '/asset-list',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Listet Werkzeuge mit umfangreichen Filteroptionen',
        intents: ['werkzeuge suchen', 'asset liste', 'alle werkzeuge', 'tools finden'],
        entities: ['Werkzeug', 'Asset', 'Lieferant', 'Projekt'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false, description: 'Suchbegriff' },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false },
                { name: 'client', type: 'array', required: false },
                { name: 'supplier', type: 'array', required: false },
                { name: 'project', type: 'array', required: false },
                { name: 'processStatus', type: 'array', required: false },
                { name: 'lifecycleStatus', type: 'array', required: false },
                { name: 'assetCity', type: 'array', required: false },
                { name: 'assetCountry', type: 'array', required: false },
                { name: 'assetPostcode', type: 'array', required: false },
                { name: 'onlyMine', type: 'boolean', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: {
            type: 'array',
            returns: 'ResponseObject[]',
            fields: {
                'context.key': { type: 'UUID', description: 'Asset-Key' },
                'meta.identifier': { type: 'string', description: 'Werkzeugnummer' },
                'meta.name': { type: 'string', description: 'Bezeichnung' },
                'supplier.value': { type: 'string' },
                'project.value': { type: 'string' }
            }
        },
        exampleRequest: '/asset-list?query=10255187&limit=20',
        prerequisites: [],
        followUps: ['assetDetail']
    },

    assetListFields: {
        path: '/asset-list/fields',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Liefert verfuegbare Filter-Werte fuer Asset-Liste',
        intents: ['asset filter', 'werkzeug filter optionen'],
        entities: ['Filter'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'supplier', type: 'array', required: false },
                { name: 'project', type: 'array', required: false },
                { name: 'client', type: 'array', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'FilterProperties' },
        exampleRequest: '/asset-list/fields',
        prerequisites: [],
        followUps: ['assetList']
    },

    assetQuickSearch: {
        path: '/asset-list/quick-search',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Schnellsuche nach Werkzeugen',
        intents: ['werkzeug schnellsuche', 'asset suchen', 'tool finden'],
        entities: ['Werkzeug', 'Werkzeugnummer'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'criteria', type: 'string', required: true, description: 'Suchkriterium' },
                { name: 'value', type: 'string', required: true, description: 'Suchwert' },
                { name: 'limit', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array', returns: 'Asset[]' },
        exampleRequest: '/asset-list/quick-search?criteria=identifier&value=10255187',
        prerequisites: [],
        followUps: ['assetDetail']
    },

    assetDetail: {
        path: '/asset/{assetKey}',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Laedt vollstaendige Details eines Werkzeugs',
        intents: ['werkzeug details', 'asset anzeigen', 'tool oeffnen', 'werkzeug info'],
        entities: ['Werkzeug', 'assetKey'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: {
            type: 'object',
            returns: 'AssetDTO',
            fields: {
                'context.key': { type: 'UUID' },
                'meta.identifier': { type: 'string' },
                'meta.name': { type: 'string' },
                'meta.status': { type: 'string' },
                'location.assetCity': { type: 'string' },
                'location.assetCountry': { type: 'string' },
                'dimensions.height': { type: 'number' },
                'dimensions.width': { type: 'number' },
                'dimensions.length': { type: 'number' },
                'dimensions.weight': { type: 'number' }
            }
        },
        exampleRequest: '/asset/{assetKey}',
        prerequisites: ['assetList'],
        followUps: ['assetHistory', 'assetDocuments', 'assetProcessHistory']
    },

    assetAlternate: {
        path: '/assets/{assetKey}',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Alternative Route fuer Asset-Details',
        intents: ['werkzeug details'],
        entities: ['Werkzeug', 'assetKey'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'AssetDTO' },
        exampleRequest: '/assets/{assetKey}',
        prerequisites: [],
        followUps: ['assetDetail']
    },

    assetHistory: {
        path: '/asset/{assetKey}/asset-history',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Aenderungshistorie eines Werkzeugs',
        intents: ['werkzeug historie', 'asset history', 'aenderungen anzeigen'],
        entities: ['Werkzeug', 'Historie'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/asset-history',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetDocuments: {
        path: '/asset/{assetKey}/documents',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Alle Dokumente eines Werkzeugs',
        intents: ['werkzeug dokumente', 'asset documents', 'dateien anzeigen'],
        entities: ['Werkzeug', 'Dokument'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/documents',
        prerequisites: ['assetDetail'],
        followUps: ['documentContent']
    },

    assetImages: {
        path: '/asset/{assetKey}/images',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Alle Bilder eines Werkzeugs',
        intents: ['werkzeug bilder', 'asset images', 'fotos anzeigen'],
        entities: ['Werkzeug', 'Bild'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/images',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetOrderPositions: {
        path: '/asset/{assetKey}/order-positions',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Bestellpositionen eines Werkzeugs',
        intents: ['bestellpositionen', 'order positions', 'bestellungen anzeigen'],
        entities: ['Werkzeug', 'Bestellposition'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/order-positions',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetParticipants: {
        path: '/asset/{assetKey}/participants',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Alle Beteiligten an einem Werkzeug',
        intents: ['werkzeug beteiligte', 'participants', 'wer ist beteiligt'],
        entities: ['Werkzeug', 'User', 'Beteiligte'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/participants',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetPartnumberHistory: {
        path: '/asset/{assetKey}/partnumber-history',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Sachnummer-Historie eines Werkzeugs',
        intents: ['sachnummer historie', 'partnumber history'],
        entities: ['Werkzeug', 'Sachnummer'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/partnumber-history',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetProcessHistory: {
        path: '/asset/{assetKey}/process-history',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Prozess-Historie eines Werkzeugs (Verlagerungen, ABL, etc.)',
        intents: ['prozess historie', 'process history', 'verlagerungen anzeigen'],
        entities: ['Werkzeug', 'Prozess', 'Historie'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset/{assetKey}/process-history',
        prerequisites: ['assetDetail'],
        followUps: ['processDetail']
    },

    assetProcessHistoryDetail: {
        path: '/asset/{assetKey}/process-history/{processKey}',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Details eines spezifischen Prozesses aus Asset-Historie',
        intents: ['prozess details aus historie'],
        entities: ['Werkzeug', 'Prozess'],
        input: {
            pathParams: [
                { name: 'assetKey', type: 'UUID', required: true },
                { name: 'processKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/asset/{assetKey}/process-history/{processKey}',
        prerequisites: ['assetProcessHistory'],
        followUps: []
    },

    assetTrackerCurrent: {
        path: '/assets/{assetKey}/tracker/current',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Aktueller Tracker-Status eines Werkzeugs',
        intents: ['tracker status', 'wo ist werkzeug', 'aktueller standort'],
        entities: ['Werkzeug', 'Tracker'],
        input: {
            pathParams: [{ name: 'assetKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/assets/{assetKey}/tracker/current',
        prerequisites: ['assetDetail'],
        followUps: []
    },

    assetsAll: {
        path: '/assets',
        method: 'GET',
        category: 'Asset',
        status: 'DOKUMENTIERT',
        description: 'Alle Assets laden (alternative Route)',
        intents: ['alle assets'],
        entities: ['Asset'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'skipLimit', type: 'object', required: false },
                { name: 'params', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/assets',
        prerequisites: [],
        followUps: ['assetDetail']
    },

    // ============================================================
    // PROCESS ENDPOINTS (13)
    // ============================================================

    processList: {
        path: '/process',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Listet alle Prozesse (Verlagerung, VPW, ABL)',
        intents: ['prozesse anzeigen', 'verlagerungen', 'alle prozesse', 'vpw liste'],
        entities: ['Prozess', 'Verlagerung', 'VPW', 'ABL'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'query', type: 'string', required: false },
                { name: 'queryParams', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process?limit=50',
        prerequisites: [],
        followUps: ['processDetail', 'processPositions']
    },

    processDetail: {
        path: '/process/{processKey}',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details eines Prozesses',
        intents: ['prozess details', 'verlagerung anzeigen', 'prozess oeffnen'],
        entities: ['Prozess', 'processKey'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/process/{processKey}',
        prerequisites: ['processList'],
        followUps: ['processPositions', 'processHistory', 'processFullDetails']
    },

    processFullDetails: {
        path: '/process/{processKey}/details',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Laedt alle Details eines Prozesses inkl. Positionen',
        intents: ['vollstaendige prozess details', 'alle prozess infos'],
        entities: ['Prozess'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/process/{processKey}/details',
        prerequisites: ['processDetail'],
        followUps: []
    },

    processPositions: {
        path: '/process/{processKey}/positions',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Laedt alle Positionen eines Prozesses',
        intents: ['prozess positionen', 'werkzeuge im prozess', 'verlagerung positionen'],
        entities: ['Prozess', 'Position', 'Werkzeug'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'query', type: 'string', required: false },
                { name: 'queryParams', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/{processKey}/positions?limit=100',
        prerequisites: ['processDetail'],
        followUps: ['processPositionDetail', 'assetDetail']
    },

    processPositionDetail: {
        path: '/process/{processKey}/positions/{positionKey}',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details einer Prozess-Position',
        intents: ['position details'],
        entities: ['Position'],
        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true },
                { name: 'positionKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/process/{processKey}/positions/{positionKey}',
        prerequisites: ['processPositions'],
        followUps: ['assetDetail']
    },

    processPositionPartitions: {
        path: '/process/{processKey}/positions/{positionKey}/partitions',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Partitionen einer Prozess-Position',
        intents: ['position partitionen'],
        entities: ['Position', 'Partition'],
        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true },
                { name: 'positionKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/{processKey}/positions/{positionKey}/partitions',
        prerequisites: ['processPositionDetail'],
        followUps: []
    },

    processPositionReference: {
        path: '/process/{processKey}/positions/{positionKey}/reference',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Referenz einer Prozess-Position',
        intents: ['position referenz'],
        entities: ['Position', 'Referenz'],
        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true },
                { name: 'positionKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/process/{processKey}/positions/{positionKey}/reference',
        prerequisites: ['processPositionDetail'],
        followUps: []
    },

    processHistory: {
        path: '/process/{processKey}/history',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Historie eines Prozesses',
        intents: ['prozess historie', 'verlauf anzeigen'],
        entities: ['Prozess', 'Historie'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/{processKey}/history',
        prerequisites: ['processDetail'],
        followUps: []
    },

    processPartitions: {
        path: '/process/{processKey}/partitions',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Partitionen/Subprozesse eines Prozesses',
        intents: ['prozess partitionen', 'subprozesse'],
        entities: ['Prozess', 'Partition'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'query', type: 'string', required: false },
                { name: 'queryParams', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/{processKey}/partitions',
        prerequisites: ['processDetail'],
        followUps: ['processPartitionDetail']
    },

    processPartitionDetail: {
        path: '/process/{processKey}/partitions/{partition}',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Details einer Prozess-Partition',
        intents: ['partition details'],
        entities: ['Partition'],
        input: {
            pathParams: [
                { name: 'processKey', type: 'UUID', required: true },
                { name: 'partition', type: 'string', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/process/{processKey}/partitions/{partition}',
        prerequisites: ['processPartitions'],
        followUps: []
    },

    processAvailableExternalProcesses: {
        path: '/process/{processKey}/available-external-processes',
        method: 'GET',
        category: 'Process',
        status: 'DOKUMENTIERT',
        description: 'Verfuegbare externe Prozesse fuer Verknuepfung',
        intents: ['externe prozesse', 'verknuepfbare prozesse'],
        entities: ['Prozess', 'ExternerProzess'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'statusFilter', type: 'string', required: false },
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/{processKey}/available-external-processes',
        prerequisites: ['processDetail'],
        followUps: []
    },

    // ============================================================
    // RELOCATION ENDPOINTS (2)
    // ============================================================

    relocationDraftEntryCertificate: {
        path: '/process/relocation/{processId}/drafts/entry-certificate/{language}',
        method: 'GET',
        category: 'Relocation',
        status: 'DOKUMENTIERT',
        description: 'Generiert Entwurf einer Eintrittsbescheinigung',
        intents: ['eintrittsbescheinigung', 'entry certificate', 'verlagerung dokument'],
        entities: ['Verlagerung', 'Dokument'],
        input: {
            pathParams: [
                { name: 'processId', type: 'UUID', required: true },
                { name: 'language', type: 'string', required: true, values: ['de', 'en'] }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'file', description: 'PDF Dokument' },
        exampleRequest: '/process/relocation/{processId}/drafts/entry-certificate/de',
        prerequisites: ['processDetail'],
        followUps: []
    },

    relocationAssignableUsers: {
        path: '/process/relocation/{processId}/users/assignable',
        method: 'GET',
        category: 'Relocation',
        status: 'DOKUMENTIERT',
        description: 'Zuweisbare User fuer Verlagerung',
        intents: ['zuweisbare user', 'wer kann zugewiesen werden'],
        entities: ['Verlagerung', 'User'],
        input: {
            pathParams: [{ name: 'processId', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/relocation/{processId}/users/assignable',
        prerequisites: ['processDetail'],
        followUps: []
    },

    // ============================================================
    // SCRAPPING ENDPOINTS (1)
    // ============================================================

    scrappingList: {
        path: '/process/scrapping',
        method: 'GET',
        category: 'Scrapping',
        status: 'DOKUMENTIERT',
        description: 'Sucht Verschrottungsprozesse',
        intents: ['verschrottungen', 'scrapping liste', 'verschrottung suchen'],
        entities: ['Verschrottung', 'Prozess'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'query', type: 'string', required: false },
                { name: 'queryParams', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/process/scrapping?limit=50',
        prerequisites: [],
        followUps: ['processDetail']
    },

    // ============================================================
    // EXTERNAL PROCESS ENDPOINTS (2)
    // ============================================================

    externalProcessList: {
        path: '/external-process',
        method: 'GET',
        category: 'ExternalProcess',
        status: 'DOKUMENTIERT',
        description: 'Listet externe Prozesse',
        intents: ['externe prozesse', 'external processes'],
        entities: ['ExternerProzess'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'type', type: 'string', required: false },
                { name: 'status', type: 'string', required: false },
                { name: 'supplier', type: 'string', required: false },
                { name: 'country', type: 'string', required: false },
                { name: 'externalIdQuery', type: 'string', required: false },
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/external-process?limit=50',
        prerequisites: [],
        followUps: ['externalProcessDetail']
    },

    externalProcessDetail: {
        path: '/external-process/{processKey}',
        method: 'GET',
        category: 'ExternalProcess',
        status: 'DOKUMENTIERT',
        description: 'Details eines externen Prozesses',
        intents: ['externer prozess details'],
        entities: ['ExternerProzess'],
        input: {
            pathParams: [{ name: 'processKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/external-process/{processKey}',
        prerequisites: ['externalProcessList'],
        followUps: []
    },

    // ============================================================
    // COMPANIES ENDPOINTS (16)
    // ============================================================

    companiesSearch: {
        path: '/companies',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Sucht nach Unternehmen',
        intents: ['firma suchen', 'unternehmen finden', 'company search'],
        entities: ['Firma', 'Unternehmen'],
        input: {
            pathParams: [],
            queryParams: [{ name: 'query', type: 'string', required: true }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies?query=BMW',
        prerequisites: [],
        followUps: ['companyDetail']
    },

    companiesList: {
        path: '/companies/list',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Listet Unternehmen nach Rolle',
        intents: ['firmenliste', 'alle firmen', 'companies by role'],
        entities: ['Firma'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies/list',
        prerequisites: [],
        followUps: ['companyDetail']
    },

    companyDetail: {
        path: '/companies/{companyKey}',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Laedt Details eines Unternehmens',
        intents: ['firma details', 'unternehmen anzeigen', 'company info'],
        entities: ['Firma', 'companyKey'],
        input: {
            pathParams: [{ name: 'companyKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/companies/{companyKey}',
        prerequisites: ['companiesSearch'],
        followUps: ['companyLocations', 'companySuppliers', 'companyUsers']
    },

    companyLocations: {
        path: '/companies/{companyKey}/locations',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Standorte eines Unternehmens',
        intents: ['firma standorte', 'locations', 'wo ist firma'],
        entities: ['Firma', 'Standort'],
        input: {
            pathParams: [{ name: 'companyKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'country', type: 'string', required: false },
                { name: 'city', type: 'string', required: false },
                { name: 'postCode', type: 'string', required: false },
                { name: 'showInactive', type: 'boolean', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies/{companyKey}/locations?city=Radolfzell',
        prerequisites: ['companyDetail'],
        followUps: ['locationDetail']
    },

    locationDetail: {
        path: '/companies/{companyKey}/locations/{locationKey}',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Details eines Standorts',
        intents: ['standort details', 'location info'],
        entities: ['Standort'],
        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true },
                { name: 'locationKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/companies/{companyKey}/locations/{locationKey}',
        prerequisites: ['companyLocations'],
        followUps: []
    },

    companySuppliers: {
        path: '/companies/{companyKey}/suppliers',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Lieferanten eines Unternehmens',
        intents: ['firma lieferanten', 'suppliers', 'zulieferer'],
        entities: ['Firma', 'Lieferant'],
        input: {
            pathParams: [{ name: 'companyKey', type: 'UUID', required: true }],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'sortByMds', type: 'string', required: false },
                { name: 'sortDir', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies/{companyKey}/suppliers',
        prerequisites: ['companyDetail'],
        followUps: ['supplierDetail']
    },

    supplierDetail: {
        path: '/companies/{companyKey}/suppliers/{supplierKey}',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Details eines Lieferanten',
        intents: ['lieferant details', 'supplier info'],
        entities: ['Lieferant'],
        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true },
                { name: 'supplierKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/companies/{companyKey}/suppliers/{supplierKey}',
        prerequisites: ['companySuppliers'],
        followUps: ['supplierLocations']
    },

    supplierLocations: {
        path: '/companies/{companyKey}/suppliers/{supplierKey}/locations',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Standorte eines Lieferanten',
        intents: ['lieferant standorte', 'supplier locations'],
        entities: ['Lieferant', 'Standort'],
        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true },
                { name: 'supplierKey', type: 'UUID', required: true }
            ],
            queryParams: [
                { name: 'showInactve', type: 'boolean', required: false },
                { name: 'sortByMds', type: 'string', required: false },
                { name: 'sortDir', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies/{companyKey}/suppliers/{supplierKey}/locations',
        prerequisites: ['supplierDetail'],
        followUps: []
    },

    subSupplierLinked: {
        path: '/companies/{companyKey}/sub-supplier-linked/{supplierKey}',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Prueft ob Sub-Supplier verknuepft ist',
        intents: ['sub-supplier verknuepfung', 'ist lieferant verknuepft'],
        entities: ['Lieferant'],
        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true },
                { name: 'supplierKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'boolean' },
        exampleRequest: '/companies/{companyKey}/sub-supplier-linked/{supplierKey}',
        prerequisites: ['companySuppliers'],
        followUps: []
    },

    companyVatIdLogs: {
        path: '/companies/{companyKey}/vatId/{vatIdKey}/logs',
        method: 'GET',
        category: 'Companies',
        status: 'DOKUMENTIERT',
        description: 'Log-Eintraege fuer USt-ID Pruefung',
        intents: ['ust-id logs', 'vatid pruefung'],
        entities: ['Firma', 'VatId'],
        input: {
            pathParams: [
                { name: 'companyKey', type: 'UUID', required: true },
                { name: 'vatIdKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/companies/{companyKey}/vatId/{vatIdKey}/logs',
        prerequisites: ['companyDetail'],
        followUps: []
    },

    // ============================================================
    // COMPANIES ACCESS ENDPOINTS (6)
    // ============================================================

    accessCheck: {
        path: '/access/companies/access-check',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'Prueft Zugriff eines Users auf eine Firma',
        intents: ['zugriff pruefen', 'access check', 'hat user zugriff'],
        entities: ['User', 'Firma', 'Zugriff'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'userKey', type: 'UUID', required: true },
                { name: 'companyKey', type: 'UUID', required: true }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'boolean' },
        exampleRequest: '/access/companies/access-check?userKey={userKey}&companyKey={companyKey}',
        prerequisites: [],
        followUps: []
    },

    possibleUsers: {
        path: '/access/companies/possibleUsers',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'Moegliche User fuer Zuweisung',
        intents: ['moegliche user', 'wer kann zugewiesen werden'],
        entities: ['User'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'companyKey', type: 'UUID', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/access/companies/possibleUsers?query=sparks',
        prerequisites: [],
        followUps: []
    },

    usersOfAllCompanies: {
        path: '/access/companies/users',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'User aller meiner Firmen',
        intents: ['alle user', 'users meiner firmen'],
        entities: ['User'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/access/companies/users',
        prerequisites: [],
        followUps: []
    },

    companyUsers: {
        path: '/access/companies/{key}/users',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'User einer Firma',
        intents: ['firma user', 'wer arbeitet bei firma', 'mitarbeiter'],
        entities: ['Firma', 'User'],
        input: {
            pathParams: [{ name: 'key', type: 'UUID', required: true }],
            queryParams: [
                { name: 'showInactive', type: 'boolean', required: false },
                { name: 'group', type: 'string', required: false },
                { name: 'query', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/access/companies/{key}/users',
        prerequisites: ['companyDetail'],
        followUps: ['companyUserDetail']
    },

    companyUserDetail: {
        path: '/access/companies/{key}/users/{userKey}',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'Details eines Users einer Firma',
        intents: ['user details in firma'],
        entities: ['User'],
        input: {
            pathParams: [
                { name: 'key', type: 'UUID', required: true },
                { name: 'userKey', type: 'UUID', required: true }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/access/companies/{key}/users/{userKey}',
        prerequisites: ['companyUsers'],
        followUps: []
    },

    supplierUsers: {
        path: '/access/companies/{key}/suppliers/{supplierKey}/users',
        method: 'GET',
        category: 'Access',
        status: 'DOKUMENTIERT',
        description: 'User eines Lieferanten',
        intents: ['lieferant user', 'supplier mitarbeiter'],
        entities: ['Lieferant', 'User'],
        input: {
            pathParams: [
                { name: 'key', type: 'UUID', required: true },
                { name: 'supplierKey', type: 'UUID', required: true }
            ],
            queryParams: [{ name: 'group', type: 'string', required: false }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/access/companies/{key}/suppliers/{supplierKey}/users',
        prerequisites: ['supplierDetail'],
        followUps: []
    },

    // ============================================================
    // USERS ENDPOINTS (8)
    // ============================================================

    usersList: {
        path: '/users',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Listet alle User',
        intents: ['alle user', 'user liste', 'benutzer suchen'],
        entities: ['User'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/users?query=sparks&limit=20',
        prerequisites: [],
        followUps: ['userGroups', 'userRights']
    },

    usersCL: {
        path: '/users/cl',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Alle Freigeber (CL) des Betreibers',
        intents: ['freigeber', 'approvers', 'cl user'],
        entities: ['User', 'CL'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/users/cl',
        prerequisites: [],
        followUps: []
    },

    userGroups: {
        path: '/users/{userKey}/groups',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Gruppen eines Users',
        intents: ['user gruppen', 'welche gruppen', 'rollen'],
        entities: ['User', 'Gruppe'],
        input: {
            pathParams: [{ name: 'userKey', type: 'UUID', required: true }],
            queryParams: [{ name: 'company', type: 'UUID', required: false }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/users/{userKey}/groups',
        prerequisites: ['usersList'],
        followUps: []
    },

    userRights: {
        path: '/users/{userKey}/rights',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Globale Rechte eines Users',
        intents: ['user rechte', 'berechtigungen', 'was darf user'],
        entities: ['User', 'Berechtigung'],
        input: {
            pathParams: [{ name: 'userKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/users/{userKey}/rights',
        prerequisites: ['usersList'],
        followUps: []
    },

    userProfile: {
        path: '/profile',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Eigenes User-Profil',
        intents: ['mein profil', 'wer bin ich', 'profile'],
        entities: ['User', 'Profil'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/profile',
        prerequisites: [],
        followUps: []
    },

    userCompaniesByKeycloak: {
        path: '/users/by-keycloak-id/{keycloakId}/companies',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Firmen eines Users per Keycloak-ID',
        intents: ['user firmen'],
        entities: ['User', 'Firma'],
        input: {
            pathParams: [{ name: 'keycloakId', type: 'string', required: true }],
            queryParams: [{ name: 'mode', type: 'string', required: false }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/users/by-keycloak-id/{keycloakId}/companies',
        prerequisites: [],
        followUps: []
    },

    userGroupsByKeycloak: {
        path: '/users/by-keycloak-id/{keycloakId}/groups',
        method: 'GET',
        category: 'Users',
        status: 'DOKUMENTIERT',
        description: 'Gruppen eines Users per Keycloak-ID',
        intents: ['user gruppen per keycloak'],
        entities: ['User', 'Gruppe'],
        input: {
            pathParams: [{ name: 'keycloakId', type: 'string', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/users/by-keycloak-id/{keycloakId}/groups',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // NOTIFICATIONS / TASKS ENDPOINTS (4)
    // ============================================================

    tasksList: {
        path: '/tasks',
        method: 'GET',
        category: 'Notifications',
        status: 'DOKUMENTIERT',
        description: 'Listet alle Benachrichtigungen/Aufgaben',
        intents: ['aufgaben', 'benachrichtigungen', 'tasks', 'notifications'],
        entities: ['Task', 'Notification'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'query', type: 'string', required: false },
                { name: 'title', type: 'string', required: false },
                { name: 'type', type: 'string', required: false },
                { name: 'status', type: 'string', required: false },
                { name: 'author', type: 'string', required: false },
                { name: 'assignee', type: 'string', required: false },
                { name: 'sortBy', type: 'string', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/tasks?status=open&limit=50',
        prerequisites: [],
        followUps: ['taskDetail']
    },

    tasksAnalyze: {
        path: '/tasks/analyze',
        method: 'GET',
        category: 'Notifications',
        status: 'DOKUMENTIERT',
        description: 'Anzahl Benachrichtigungen gruppiert',
        intents: ['task statistik', 'wie viele aufgaben', 'notification count'],
        entities: ['Task', 'Statistik'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'groupBy', type: 'string', required: false },
                { name: 'status', type: 'string', required: false },
                { name: 'type', type: 'string', required: false },
                { name: 'author', type: 'string', required: false },
                { name: 'assignee', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/tasks/analyze?groupBy=status',
        prerequisites: [],
        followUps: ['tasksList']
    },

    tasksFields: {
        path: '/tasks/fields',
        method: 'GET',
        category: 'Notifications',
        status: 'DOKUMENTIERT',
        description: 'Filter-Optionen fuer Tasks',
        intents: ['task filter'],
        entities: ['Filter'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'FilterProperties' },
        exampleRequest: '/tasks/fields',
        prerequisites: [],
        followUps: ['tasksList']
    },

    taskDetail: {
        path: '/tasks/{id}',
        method: 'GET',
        category: 'Notifications',
        status: 'DOKUMENTIERT',
        description: 'Details einer Benachrichtigung',
        intents: ['task details', 'aufgabe anzeigen'],
        entities: ['Task'],
        input: {
            pathParams: [{ name: 'id', type: 'string', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/tasks/{id}',
        prerequisites: ['tasksList'],
        followUps: []
    },

    // ============================================================
    // SYSTEM TASKS ENDPOINTS (3)
    // ============================================================

    systemTasks: {
        path: '/tasks/system',
        method: 'GET',
        category: 'SystemTasks',
        status: 'DOKUMENTIERT',
        description: 'Listet System-Tasks',
        intents: ['system tasks', 'hintergrund aufgaben', 'system jobs'],
        entities: ['SystemTask'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'owner', type: 'string', required: false },
                { name: 'creator', type: 'string', required: false },
                { name: 'supplier', type: 'string', required: false },
                { name: 'status', type: 'string', required: false },
                { name: 'action', type: 'string', required: false },
                { name: 'type', type: 'string', required: false },
                { name: 'objectType', type: 'string', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'offset', type: 'integer', required: false },
                { name: 'sortBy', type: 'string', required: false },
                { name: 'query', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/tasks/system?status=pending&limit=50',
        prerequisites: [],
        followUps: ['systemTaskDetail']
    },

    systemTaskFields: {
        path: '/tasks/system/fields',
        method: 'GET',
        category: 'SystemTasks',
        status: 'DOKUMENTIERT',
        description: 'Filter-Optionen fuer System-Tasks',
        intents: ['system task filter'],
        entities: ['Filter'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'FilterProperties' },
        exampleRequest: '/tasks/system/fields',
        prerequisites: [],
        followUps: ['systemTasks']
    },

    systemTaskDetail: {
        path: '/tasks/system/{key}',
        method: 'GET',
        category: 'SystemTasks',
        status: 'DOKUMENTIERT',
        description: 'Details eines System-Tasks',
        intents: ['system task details'],
        entities: ['SystemTask'],
        input: {
            pathParams: [{ name: 'key', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/tasks/system/{key}',
        prerequisites: ['systemTasks'],
        followUps: []
    },

    // ============================================================
    // REPORTS ENDPOINTS (3)
    // ============================================================

    reportGeneric: {
        path: '/report/{key}',
        method: 'GET',
        category: 'Reports',
        status: 'DOKUMENTIERT',
        description: 'Generischer Report-Download',
        intents: ['report', 'bericht', 'export'],
        entities: ['Report'],
        input: {
            pathParams: [{ name: 'key', type: 'UUID', required: true }],
            queryParams: [{ name: 'format', type: 'string', required: false, values: ['pdf', 'xlsx', 'csv'] }],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'file' },
        exampleRequest: '/report/{key}?format=pdf',
        prerequisites: [],
        followUps: []
    },

    reportInventoryResult: {
        path: '/report/inventories/result/{inventoryKey}',
        method: 'GET',
        category: 'Reports',
        status: 'DOKUMENTIERT',
        description: 'Inventur-Ergebnis Report',
        intents: ['inventur report', 'inventur ergebnis', 'inventur bericht'],
        entities: ['Inventur', 'Report'],
        input: {
            pathParams: [{ name: 'inventoryKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'file' },
        exampleRequest: '/report/inventories/result/{inventoryKey}',
        prerequisites: ['inventoryDetail'],
        followUps: []
    },

    reportScrappingResult: {
        path: '/report/scrappings/result/{scrappingKey}',
        method: 'GET',
        category: 'Reports',
        status: 'DOKUMENTIERT',
        description: 'Verschrottungs-Report',
        intents: ['verschrottung report', 'scrapping bericht'],
        entities: ['Verschrottung', 'Report'],
        input: {
            pathParams: [{ name: 'scrappingKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'file' },
        exampleRequest: '/report/scrappings/result/{scrappingKey}',
        prerequisites: ['scrappingList'],
        followUps: []
    },

    // ============================================================
    // DOCUMENTS ENDPOINTS (1)
    // ============================================================

    documentContent: {
        path: '/documents/{documentKey}/content',
        method: 'GET',
        category: 'Documents',
        status: 'DOKUMENTIERT',
        description: 'Inhalt eines Dokuments laden',
        intents: ['dokument laden', 'document content', 'datei herunterladen'],
        entities: ['Dokument'],
        input: {
            pathParams: [{ name: 'documentKey', type: 'UUID', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'file' },
        exampleRequest: '/documents/{documentKey}/content',
        prerequisites: ['assetDocuments'],
        followUps: []
    },

    // ============================================================
    // GEO LOCATION ENDPOINTS (1)
    // ============================================================

    geolocCities: {
        path: '/geoloc/{country}/{postcode}/cities',
        method: 'GET',
        category: 'GeoLocation',
        status: 'DOKUMENTIERT',
        description: 'Staedte zu Land und PLZ',
        intents: ['staedte finden', 'welche stadt', 'city lookup'],
        entities: ['Stadt', 'PLZ', 'Land'],
        input: {
            pathParams: [
                { name: 'country', type: 'string', required: true, description: 'Laendercode (DE, AT, etc.)' },
                { name: 'postcode', type: 'string', required: true, description: 'Postleitzahl' }
            ],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array', description: 'Liste von Staedtenamen' },
        exampleRequest: '/geoloc/DE/78315/cities',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // SEARCH / FILTER ENDPOINTS (1)
    // ============================================================

    searchFields: {
        path: '/search/fields',
        method: 'GET',
        category: 'Search',
        status: 'DOKUMENTIERT',
        description: 'Globale Filter-Optionen',
        intents: ['filter optionen', 'search fields', 'verfuegbare filter'],
        entities: ['Filter'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/search/fields',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // TRACKER ENDPOINTS (1)
    // ============================================================

    trackerData: {
        path: '/tracker/data',
        method: 'GET',
        category: 'Tracker',
        status: 'DOKUMENTIERT',
        description: 'Tracker-Daten laden',
        intents: ['tracker daten', 'gps daten', 'standort tracking'],
        entities: ['Tracker'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'filter', type: 'object', required: false },
                { name: 'skipLimit', type: 'object', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/tracker/data',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // MIGRATIONS ENDPOINTS (2)
    // ============================================================

    migrationsList: {
        path: '/migrations',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Listet alle Migrationen',
        intents: ['migrationen', 'migrations liste'],
        entities: ['Migration'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'sortBy', type: 'string', required: false },
                { name: 'sortDir', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/migrations',
        prerequisites: [],
        followUps: []
    },

    migrationsAvailable: {
        path: '/migrations/available',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Verfuegbare Migration-Namen',
        intents: ['verfuegbare migrationen'],
        entities: ['Migration'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/migrations/available',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // ADMINISTRATION ENDPOINTS (4)
    // ============================================================

    actionHistories: {
        path: '/administration/action-histories',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Action-Historie laden',
        intents: ['action historie', 'aktionen history'],
        entities: ['Historie'],
        input: {
            pathParams: [],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false },
                { name: 'sortBy', type: 'string', required: false },
                { name: 'sortDir', type: 'string', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/administration/action-histories?limit=100',
        prerequisites: [],
        followUps: []
    },

    assetsInvalidStatus: {
        path: '/administration/assets/invalid-status/{status}',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Assets mit ungueltigem Status',
        intents: ['ungueltige assets', 'invalid status'],
        entities: ['Asset', 'Status'],
        input: {
            pathParams: [{ name: 'status', type: 'string', required: true }],
            queryParams: [
                { name: 'skip', type: 'integer', required: false },
                { name: 'limit', type: 'integer', required: false }
            ],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/administration/assets/invalid-status/ERROR',
        prerequisites: [],
        followUps: []
    },

    inventoriesMissingTasks: {
        path: '/administration/inventories/missing-tasks/{systemTaskType}',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Inventuren ohne System-Task',
        intents: ['inventuren ohne task', 'missing system tasks'],
        entities: ['Inventur', 'SystemTask'],
        input: {
            pathParams: [{ name: 'systemTaskType', type: 'string', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/administration/inventories/missing-tasks/INVENTORY_CREATE',
        prerequisites: [],
        followUps: []
    },

    inventoriesMissingTasksRetryStatus: {
        path: '/administration/inventories/missing-tasks/{systemTaskType}/retry/status',
        method: 'GET',
        category: 'Administration',
        status: 'DOKUMENTIERT',
        description: 'Status der System-Task Erstellung',
        intents: ['retry status', 'task erstellung status'],
        entities: ['SystemTask'],
        input: {
            pathParams: [{ name: 'systemTaskType', type: 'string', required: true }],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object' },
        exampleRequest: '/administration/inventories/missing-tasks/INVENTORY_CREATE/retry/status',
        prerequisites: ['inventoriesMissingTasks'],
        followUps: []
    },

    // ============================================================
    // ASSET PLANNING ENDPOINTS (1)
    // ============================================================

    assetPlanningRulesetExecutions: {
        path: '/asset-planning/ruleset/executions',
        method: 'GET',
        category: 'AssetPlanning',
        status: 'DOKUMENTIERT',
        description: 'Regelwerk-Ausfuehrungen fuer Asset-Planung',
        intents: ['regelwerk', 'ruleset executions', 'planung ausfuehrungen'],
        entities: ['Planung', 'Regelwerk'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'array' },
        exampleRequest: '/asset-planning/ruleset/executions',
        prerequisites: [],
        followUps: []
    },

    // ============================================================
    // JOB ENDPOINTS (1)
    // ============================================================

    jobCreateInventoryV2: {
        path: '/job/createInventoryV2',
        method: 'GET',
        category: 'Jobs',
        status: 'DOKUMENTIERT',
        description: 'Startet CreateInventoryOrderV2 Job manuell',
        intents: ['job starten', 'inventur job', 'create inventory job'],
        entities: ['Job'],
        input: {
            pathParams: [],
            queryParams: [],
            headers: ['Authorization: Bearer {token}']
        },
        output: { type: 'object', returns: 'JobResponse' },
        exampleRequest: '/job/createInventoryV2',
        prerequisites: [],
        followUps: []
    }
};

// ============================================================
// STATISTIKEN
// ============================================================

const API_CATALOG_STATS = {
    total: Object.keys(API_CATALOG).filter(k => !['version', 'baseUrl'].includes(k)).length,
    byCategory: {},
    byStatus: { DOKUMENTIERT: 0 }
};

// Statistiken berechnen
for (const [key, endpoint] of Object.entries(API_CATALOG)) {
    if (key === 'version' || key === 'baseUrl') continue;
    const cat = endpoint.category || 'Other';
    API_CATALOG_STATS.byCategory[cat] = (API_CATALOG_STATS.byCategory[cat] || 0) + 1;
    API_CATALOG_STATS.byStatus.DOKUMENTIERT++;
}

// ============================================================
// HELPER-FUNKTIONEN
// ============================================================

const ApiCatalogHelper = {
    // Findet Endpoints anhand natuerlicher Sprache
    findByIntent(userInput) {
        const input = userInput.toLowerCase();
        const results = [];

        for (const [key, endpoint] of Object.entries(API_CATALOG)) {
            if (key === 'version' || key === 'baseUrl') continue;

            let score = 0;

            // Intent-Match
            for (const intent of endpoint.intents || []) {
                if (input.includes(intent.toLowerCase())) {
                    score += 10;
                } else {
                    const words = intent.toLowerCase().split(' ');
                    for (const word of words) {
                        if (word.length > 3 && input.includes(word)) score += 3;
                    }
                }
            }

            // Entity-Match
            for (const entity of endpoint.entities || []) {
                if (input.includes(entity.toLowerCase())) score += 5;
            }

            // Description-Match
            if (endpoint.description && input.includes(endpoint.description.toLowerCase().substring(0, 20))) {
                score += 2;
            }

            if (score > 0) {
                results.push({ key, endpoint, score });
            }
        }

        return results.sort((a, b) => b.score - a.score);
    },

    // Findet Endpoints anhand Entity-Name
    findByEntity(entityName) {
        const entity = entityName.toLowerCase();
        const results = [];

        for (const [key, endpoint] of Object.entries(API_CATALOG)) {
            if (key === 'version' || key === 'baseUrl') continue;

            if ((endpoint.entities || []).some(e => e.toLowerCase() === entity)) {
                results.push({ key, endpoint });
            }
        }

        return results;
    },

    // Findet Endpoints nach Kategorie
    findByCategory(category) {
        const results = [];
        for (const [key, endpoint] of Object.entries(API_CATALOG)) {
            if (key === 'version' || key === 'baseUrl') continue;
            if (endpoint.category === category) {
                results.push({ key, endpoint });
            }
        }
        return results;
    },

    // Baut API-Aufruf zusammen
    buildApiCall(endpointKey, params = {}) {
        const endpoint = API_CATALOG[endpointKey];
        if (!endpoint) return null;

        let url = API_CATALOG.baseUrl + endpoint.path;

        // Path-Parameter ersetzen
        for (const pathParam of endpoint.input?.pathParams || []) {
            if (params[pathParam.name]) {
                url = url.replace(`{${pathParam.name}}`, params[pathParam.name]);
            }
        }

        // Query-Parameter anfuegen
        const queryParams = [];
        for (const queryParam of endpoint.input?.queryParams || []) {
            if (params[queryParam.name] !== undefined) {
                if (Array.isArray(params[queryParam.name])) {
                    for (const val of params[queryParam.name]) {
                        queryParams.push(`${queryParam.name}=${encodeURIComponent(val)}`);
                    }
                } else {
                    queryParams.push(`${queryParam.name}=${encodeURIComponent(params[queryParam.name])}`);
                }
            }
        }

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }

        return url;
    },

    // Erklaert einen Endpoint
    explainEndpoint(endpointKey) {
        const endpoint = API_CATALOG[endpointKey];
        if (!endpoint) return 'Endpoint nicht gefunden';

        let explanation = `## ${endpointKey}\n\n`;
        explanation += `**Pfad:** \`${endpoint.method} ${endpoint.path}\`\n\n`;
        explanation += `**Beschreibung:** ${endpoint.description}\n\n`;
        explanation += `**Kategorie:** ${endpoint.category}\n\n`;

        if (endpoint.input?.pathParams?.length > 0) {
            explanation += '**Path-Parameter:**\n';
            for (const p of endpoint.input.pathParams) {
                explanation += `- \`${p.name}\` (${p.type}) - ${p.description || ''}\n`;
            }
            explanation += '\n';
        }

        if (endpoint.input?.queryParams?.length > 0) {
            explanation += '**Query-Parameter:**\n';
            for (const p of endpoint.input.queryParams) {
                const req = p.required ? '(required)' : '(optional)';
                explanation += `- \`${p.name}\` ${req} - ${p.description || p.type}\n`;
            }
            explanation += '\n';
        }

        if (endpoint.followUps?.length > 0) {
            explanation += `**Follow-Up Endpoints:** ${endpoint.followUps.join(', ')}\n`;
        }

        return explanation;
    },

    // Alle Kategorien
    getCategories() {
        return Object.keys(API_CATALOG_STATS.byCategory);
    },

    // Alle Endpoints einer Kategorie
    listCategory(category) {
        return this.findByCategory(category).map(r => ({
            key: r.key,
            path: r.endpoint.path,
            description: r.endpoint.description
        }));
    }
};

// Export fuer Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CATALOG, API_CATALOG_STATS, ApiCatalogHelper };
}
