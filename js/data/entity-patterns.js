// ORCA 2.0 - Entity Patterns
// Erkennungsmuster für alle ORCA-Datentypen
// Ermöglicht automatische Erkennung von Eingaben

const ENTITY_PATTERNS = {

    // ============================================================
    // WERKZEUG / ASSET
    // ============================================================

    toolNumber: {
        name: 'Werkzeugnummer',
        description: 'Eindeutige Nummer eines Werkzeugs/Assets',
        patterns: [
            /^\d{7,8}$/,                    // 10255187 (7-8 Ziffern)
            /^\d{10}$/                      // 1025518700 (10 Ziffern)
        ],
        examples: ['10255187', '10255188', '1025518700'],
        searchStrategy: {
            primary: {
                endpoint: 'assetQuickSearch',
                params: { criteria: 'identifier', value: '{input}' }
            },
            fallback: {
                endpoint: 'assetList',
                params: { query: '{input}' }
            }
        },
        relatedEntities: ['inventoryPosition', 'processPosition', 'orderPosition']
    },

    identifier: {
        name: 'Identifier',
        description: 'Vollständiger Werkzeug-Identifier mit Suffix',
        patterns: [
            /^[A-Z]\d-\d{10}-\d{3}$/,       // A1-0010010376-001
            /^[A-Z]\d-\d{7,12}-\d{1,3}$/    // Varianten mit Suffix
        ],
        examples: ['A1-0010010376-001', 'B2-0012345678-002'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { query: '{input}' }
            }
        },
        relatedEntities: ['toolNumber', 'orderPosition']
    },

    partNumber: {
        name: 'Teilenummer',
        description: 'Sachnummer/Teilenummer (factNumberAI)',
        patterns: [
            /^\d{4,8}[A-Z]{0,2}$/,          // 12345AB
            /^[A-Z]{2,4}\d{4,8}$/,          // ABC12345
            /^\d{2}\.\d{2}\.\d{3,4}$/,      // 12.34.567 (BMW Format)
            /^\d{7,10}[A-Z]?$/              // 1234567A
        ],
        examples: ['1234567', '12.34.567', 'ABC12345'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { factNumberAI: '{input}' }
            }
        },
        priority: 'medium'
    },

    derivat: {
        name: 'Derivat',
        description: 'Fahrzeug-Derivat/Baureihe',
        patterns: [
            /^[A-Z]\d{1,2}$/,               // G70, F40, E90
            /^[A-Z]{2}\d{1,2}$/,            // iX1, iX3
            /^(G\d{2}|F\d{2}|E\d{2}|U\d{2})$/  // BMW Baureihen
        ],
        examples: ['G70', 'F40', 'E90', 'U11'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { derivat: '{input}' }
            }
        },
        isFilter: true
    },

    project: {
        name: 'Projekt',
        description: 'Projektnummer oder -name',
        patterns: [
            /^PRJ-\d{4,10}$/,               // PRJ-2024001
            /^[A-Z]{2,4}-\d{4,8}$/,         // BMW-20240001
            /^P\d{6,10}$/                   // P123456
        ],
        examples: ['PRJ-2024001', 'BMW-12345678', 'P123456'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { project: '{input}' }
            }
        },
        isFilter: true
    },

    department: {
        name: 'Abteilung',
        description: 'Abteilungscode oder -name',
        patterns: [
            /^[A-Z]{2,4}-\d{2,4}$/,         // FT-12, PZ-001
            /^(FT|PZ|TE|QM|EK|IT|HR|FZ)\d{0,4}$/i  // Bekannte Kürzel
        ],
        examples: ['FT-12', 'PZ-001', 'TE', 'QM'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { department: '{input}' }
            }
        },
        isFilter: true
    },

    area: {
        name: 'Bereich',
        description: 'Unternehmensbereich',
        patterns: [
            /^(Produktion|Entwicklung|Logistik|Qualität|Einkauf|IT|Verwaltung)$/i,
            /^[A-Z]{2,5}\d{0,3}$/           // PRD, DEV, LOG
        ],
        examples: ['Produktion', 'Entwicklung', 'PRD', 'DEV'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { area: '{input}' }
            }
        },
        isFilter: true,
        priority: 'low'
    },

    owner: {
        name: 'Eigentümer',
        description: 'Asset-Eigentümer (OEM)',
        patterns: [
            /^(BMW|Audi|VW|Mercedes|Porsche|Daimler)$/i
        ],
        examples: ['BMW', 'Audi', 'VW'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { owner: '{input}' }
            }
        },
        isFilter: true
    },

    wvoName: {
        name: 'WVO-Name',
        description: 'Werkzeugverantwortlicher OEM',
        patterns: [
            /^[A-Za-zÄÖÜäöüß]+,\s?[A-Za-zÄÖÜäöüß]+$/,  // Mustermann, Max
            /^WVO:\s?.+$/i                              // WVO: Name
        ],
        examples: ['Mustermann, Max', 'WVO: Schmidt'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { WVO_Name: '{input}' }
            }
        },
        priority: 'low'
    },

    fekId: {
        name: 'FEK-ID',
        description: 'Facheinkäufer-Kennung',
        patterns: [
            /^FEK\d{3,8}$/,                 // FEK12345
            /^Q-\d{5,8}$/,                  // Q-12345 (Q-Nummer)
            /^\d{5,8}$/                     // Nur Nummer (niedrige Priorität)
        ],
        examples: ['FEK12345', 'Q-12345'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { query: '{input}' }
            }
        },
        priority: 'low'
    },

    lifecycleStatus: {
        name: 'Lifecycle-Status',
        description: 'Lebenszyklus-Status eines Werkzeugs',
        patterns: [
            /^(aktiv|inaktiv|verschrottet|verlagert|gesperrt)$/i,
            /^(ACTIVE|INACTIVE|SCRAPPED|RELOCATED|BLOCKED)$/i
        ],
        examples: ['aktiv', 'inaktiv', 'ACTIVE', 'INACTIVE'],
        values: {
            'aktiv': 'Werkzeug ist aktiv im Einsatz',
            'inaktiv': 'Werkzeug ist nicht mehr im Einsatz',
            'verschrottet': 'Werkzeug wurde verschrottet',
            'verlagert': 'Werkzeug wurde verlagert',
            'gesperrt': 'Werkzeug ist gesperrt'
        },
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { lifecycleStatus: '{input}' }
            }
        },
        isFilter: true
    },

    ownership: {
        name: 'Eigentumsverhältnis',
        description: 'Art des Eigentums am Werkzeug',
        patterns: [
            /^(Eigentum|Miete|Leasing|Leihe|Beistellung)$/i,
            /^(OWN|RENT|LEASE|LOAN|PROVIDED)$/i
        ],
        examples: ['Eigentum', 'Miete', 'OWN', 'RENT'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { ownership: '{input}' }
            }
        },
        isFilter: true
    },

    // ============================================================
    // BESTELLPOSITION
    // ============================================================

    orderPosition: {
        name: 'Bestellposition',
        description: 'Bestellnummer/Auftragsposition eines Werkzeugs',
        patterns: [
            /^[A-Z]\d-\d{10}$/,             // A1-0010010376
            /^[A-Z]\d-\d{7,12}$/            // Varianten
        ],
        examples: ['A1-0010010376', 'B2-0012345678'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { query: '{input}' }
            },
            // Nach Asset-Key gefunden:
            thenLoad: {
                endpoint: 'assetDetail',
                extractKey: 'context.key'
            }
        },
        relatedEntities: ['toolNumber', 'asset']
    },

    // ============================================================
    // INVENTUR
    // ============================================================

    inventoryNumber: {
        name: 'Inventurnummer',
        description: 'Kennung einer Inventur',
        patterns: [
            /^[A-Z]{2,4}-\d{4}-\d{3,6}$/,   // BMW-2024-003
            /^INV-\d{6,10}$/,                // INV-123456
            /^\d{4}-[A-Z]{2,4}-\d{3,6}$/    // 2024-BMW-003
        ],
        examples: ['BMW-2024-003', 'INV-123456', '2024-BMW-001'],
        searchStrategy: {
            primary: {
                endpoint: 'inventoryList',
                params: { query: '{input}', status: ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'] }
            }
        },
        relatedEntities: ['inventoryPosition', 'toolNumber', 'company', 'location']
    },

    inventoryStatus: {
        name: 'Inventur-Status',
        description: 'Status einer Inventur',
        patterns: [
            /^I[0-6]$/                       // I0, I1, I2, I3, I4, I5, I6
        ],
        examples: ['I0', 'I2', 'I6'],
        values: {
            'I0': 'Neu/Entwurf',
            'I1': 'Versendet',
            'I2': 'Gemeldet',
            'I3': 'Genehmigt',
            'I4': 'Abgeschlossen',
            'I5': 'Teilweise akzeptiert',
            'I6': 'Vollständig akzeptiert'
        },
        searchStrategy: {
            primary: {
                endpoint: 'inventoryList',
                params: { status: ['{input}'] }
            }
        },
        isFilter: true
    },

    positionStatus: {
        name: 'Positions-Status',
        description: 'Status einer Inventur-Position',
        patterns: [
            /^P[0-6]$/                       // P0, P1, P2, P3, P4, P5, P6
        ],
        examples: ['P0', 'P2', 'P6'],
        values: {
            'P0': 'Ohne Inventur',
            'P1': 'Ohne Akzeptanz',
            'P2': 'Gefunden, keine Vorfälle',
            'P3': 'Gefunden, mit Vorfällen',
            'P4': 'Anderer Standort, keine Vorfälle',
            'P5': 'Anderer Standort, mit Vorfälle',
            'P6': 'Nicht gefunden'
        },
        isFilter: true
    },

    // ============================================================
    // PROZESSE (Verlagerung, VPW, Verschrottung)
    // ============================================================

    processStatus: {
        name: 'Prozess-Status',
        description: 'Status einer Verlagerung/VPW',
        patterns: [
            /^R[0-9]$/                       // R0, R2, R4, R6, etc.
        ],
        examples: ['R0', 'R2', 'R4', 'R6'],
        values: {
            'R0': 'Beantragt',
            'R2': 'In Bearbeitung',
            'R4': 'Transport',
            'R6': 'Abgeschlossen'
        },
        searchStrategy: {
            primary: {
                endpoint: 'processList',
                params: { queryParams: { status: ['{input}'] } }
            }
        },
        isFilter: true
    },

    processNumber: {
        name: 'Prozessnummer',
        description: 'Kennung eines Prozesses (Verlagerung, VPW)',
        patterns: [
            /^REL-\d{6,10}$/,                // REL-123456
            /^VPW-\d{6,10}$/,                // VPW-123456
            /^SCR-\d{6,10}$/                 // SCR-123456 (Scrapping)
        ],
        examples: ['REL-123456', 'VPW-789012', 'SCR-345678'],
        searchStrategy: {
            primary: {
                endpoint: 'processList',
                params: { query: '{input}' }
            }
        },
        relatedEntities: ['processPosition', 'toolNumber', 'location']
    },

    // ============================================================
    // FIRMA / UNTERNEHMEN
    // ============================================================

    companyNumber: {
        name: 'Firmennummer',
        description: 'Lieferanten- oder Kundennummer',
        patterns: [
            /^\d{6,7}$/,                     // 123456, 1234567 (6-7 Ziffern, nicht 5!)
            /^[A-Z]{2}\d{5,7}$/              // DE12345
        ],
        examples: ['123456', '1234567', 'DE12345'],
        searchStrategy: {
            primary: {
                endpoint: 'companiesSearch',
                params: { query: '{input}' }
            }
        },
        relatedEntities: ['location', 'supplier', 'user']
    },

    companyName: {
        name: 'Firmenname',
        description: 'Name eines Unternehmens (mit Rechtsform)',
        patterns: [
            /^.*(GmbH|AG|KG|SE|Inc|Ltd|LLC|Co\.|& Co).*$/i,  // Muss Rechtsform enthalten
            /^(BMW|Audi|Mercedes|VW|Porsche|Bosch|Siemens|Continental|ZF|Schaeffler)$/i  // Bekannte OEMs
        ],
        examples: ['Bosch GmbH', 'Daimler AG', 'BMW'],
        searchStrategy: {
            primary: {
                endpoint: 'companiesSearch',
                params: { query: '{input}' }
            }
        },
        priority: 'low'
    },

    // ============================================================
    // STANDORT / LOCATION
    // ============================================================

    locationCity: {
        name: 'Stadt/Ort',
        description: 'Standort-Stadt',
        patterns: [
            /^(München|Berlin|Hamburg|Stuttgart|Frankfurt|Köln|Düsseldorf|Leipzig|Dresden|Nürnberg|Hannover|Bremen|Radolfzell|Ingolstadt|Wolfsburg|Sindelfingen|Regensburg|Landshut|Dingolfing)$/i  // Bekannte Städte
        ],
        examples: ['Radolfzell', 'München', 'Stuttgart', 'Ingolstadt'],
        searchStrategy: {
            forInventory: {
                endpoint: 'inventoryList',
                params: { city: ['{input}'] }
            },
            forAssets: {
                endpoint: 'assetList',
                params: { assetCity: ['{input}'] }
            }
        },
        isFilter: true,
        priority: 'medium'
    },

    postalCode: {
        name: 'Postleitzahl',
        description: 'PLZ eines Standorts',
        patterns: [
            /^\d{5}$/,                       // Deutsche PLZ: 78315
            /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/ // UK: SW1A 1AA
        ],
        examples: ['78315', '80331', 'SW1A 1AA'],
        searchStrategy: {
            primary: {
                endpoint: 'assetList',
                params: { assetPostcode: ['{input}'] }
            }
        },
        isFilter: true
    },

    country: {
        name: 'Land',
        description: 'Länderkürzel oder -name',
        patterns: [
            /^[A-Z]{2}$/,                    // DE, AT, CH
            /^(Deutschland|Germany|Österreich|Austria|Schweiz|Switzerland)$/i
        ],
        examples: ['DE', 'AT', 'Deutschland'],
        isFilter: true,
        priority: 'low'
    },

    // ============================================================
    // USER / BENUTZER
    // ============================================================

    email: {
        name: 'E-Mail',
        description: 'E-Mail-Adresse eines Benutzers',
        patterns: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        ],
        examples: ['oliver.sparks@orca-software.com', 'max.mustermann@bmw.de'],
        searchStrategy: {
            primary: {
                endpoint: 'usersList',
                params: { query: '{input}' }
            }
        },
        relatedEntities: ['user', 'company']
    },

    userName: {
        name: 'Benutzername',
        description: 'Vor- und/oder Nachname',
        patterns: [
            /^[A-Za-zÄÖÜäöüß]+\s[A-Za-zÄÖÜäöüß]+$/,  // Vorname Nachname
            /^[A-Za-zÄÖÜäöüß]+\.[A-Za-zÄÖÜäöüß]+$/   // vorname.nachname
        ],
        examples: ['Oliver Sparks', 'Max Mustermann', 'oliver.sparks'],
        searchStrategy: {
            primary: {
                endpoint: 'usersList',
                params: { query: '{input}' }
            }
        },
        priority: 'low'
    },

    // ============================================================
    // TECHNISCHE IDENTIFIER
    // ============================================================

    uuid: {
        name: 'UUID/Key',
        description: 'Technischer Schlüssel (UUID)',
        patterns: [
            /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
        ],
        examples: ['6ac791ee-f94e-483f-89ab-1ac74b0f58b9'],
        searchStrategy: {
            // UUID kann vieles sein - Kontext nötig
            tryInOrder: [
                { endpoint: 'inventoryDetail', params: { inventoryKey: '{input}' } },
                { endpoint: 'assetDetail', params: { assetKey: '{input}' } },
                { endpoint: 'processDetail', params: { processKey: '{input}' } },
                { endpoint: 'companyDetail', params: { companyKey: '{input}' } }
            ]
        },
        relatedEntities: ['inventory', 'asset', 'process', 'company']
    },

    // ============================================================
    // ROLLEN
    // ============================================================

    roleCode: {
        name: 'Rollencode',
        description: 'Kürzel einer Benutzerrolle',
        patterns: [
            /^(IVL|WVL|WVL-LOC|ID|ITL|VVL|FEK|CL|SUP)$/
        ],
        examples: ['IVL', 'WVL', 'SUP', 'FEK'],
        values: {
            'IVL': 'Inventurverantwortlicher Lieferant',
            'WVL': 'Werkzeugverantwortlicher Lieferant',
            'WVL-LOC': 'Werkzeugverantwortlicher pro Standort',
            'ID': 'Inventurdurchführer',
            'ITL': 'IT-Verantwortlicher Lieferant',
            'VVL': 'Versand-Verantwortlicher Lieferant',
            'FEK': 'Facheinkäufer (OEM)',
            'CL': 'Genehmiger/Approver',
            'SUP': 'Support/Inventurbüro'
        },
        isLookup: true
    },

    // ============================================================
    // INVENTUR-TYP
    // ============================================================

    inventoryType: {
        name: 'Inventur-Typ',
        description: 'Art der Inventur',
        patterns: [
            /^I[A-D]$/                       // IA, IB, IC, ID
        ],
        examples: ['IA', 'IB', 'IC', 'ID'],
        values: {
            'IA': 'Standard-Inventur',
            'IB': 'Mit Foto-Nachweis',
            'IC': 'Typ C',
            'ID': 'Typ D'
        },
        isFilter: true
    }
};

// ============================================================
// ERKENNUNGS-ENGINE
// ============================================================

const EntityRecognizer = {

    /**
     * Analysiert eine Eingabe und erkennt mögliche Entity-Typen
     * @param {string} input - Die Benutzereingabe
     * @returns {Array} - Liste möglicher Matches, sortiert nach Wahrscheinlichkeit
     */
    analyze(input) {
        if (!input || typeof input !== 'string') return [];

        const trimmed = input.trim();
        const matches = [];

        for (const [entityKey, entity] of Object.entries(ENTITY_PATTERNS)) {
            for (const pattern of entity.patterns || []) {
                if (pattern.test(trimmed)) {
                    matches.push({
                        entityType: entityKey,
                        name: entity.name,
                        description: entity.description,
                        confidence: entity.priority === 'low' ? 0.5 : 1.0,
                        searchStrategy: entity.searchStrategy,
                        value: entity.values?.[trimmed] || null,
                        isFilter: entity.isFilter || false,
                        isLookup: entity.isLookup || false
                    });
                    break; // Nur ein Match pro Entity-Typ
                }
            }
        }

        // Sortieren nach Confidence (höchste zuerst)
        matches.sort((a, b) => b.confidence - a.confidence);

        return matches;
    },

    /**
     * Gibt den wahrscheinlichsten Entity-Typ zurück
     */
    getBestMatch(input) {
        const matches = this.analyze(input);
        return matches.length > 0 ? matches[0] : null;
    },

    /**
     * Prüft ob Eingabe einem bestimmten Typ entspricht
     */
    isType(input, entityType) {
        const entity = ENTITY_PATTERNS[entityType];
        if (!entity) return false;

        const trimmed = input.trim();
        return entity.patterns?.some(p => p.test(trimmed)) || false;
    },

    /**
     * Erklärt was eine Eingabe sein könnte
     */
    explain(input) {
        const matches = this.analyze(input);

        if (matches.length === 0) {
            return `"${input}" konnte keinem bekannten ORCA-Datentyp zugeordnet werden.`;
        }

        let explanation = `"${input}" könnte sein:\n`;

        matches.forEach((match, i) => {
            explanation += `\n${i + 1}. **${match.name}**`;
            if (match.value) {
                explanation += ` = ${match.value}`;
            }
            explanation += `\n   ${match.description}`;
            if (match.confidence < 1) {
                explanation += ` (unsicher)`;
            }
        });

        return explanation;
    },

    /**
     * Generiert Such-Strategie für eine Eingabe
     */
    getSearchStrategy(input) {
        const match = this.getBestMatch(input);
        if (!match || !match.searchStrategy) {
            return null;
        }

        const strategy = { ...match.searchStrategy };

        // {input} Placeholder ersetzen
        const replaceInput = (obj) => {
            if (typeof obj === 'string') {
                return obj.replace('{input}', input);
            }
            if (Array.isArray(obj)) {
                return obj.map(replaceInput);
            }
            if (typeof obj === 'object' && obj !== null) {
                const result = {};
                for (const [k, v] of Object.entries(obj)) {
                    result[k] = replaceInput(v);
                }
                return result;
            }
            return obj;
        };

        return replaceInput(strategy);
    }
};

// ============================================================
// STATISTIK
// ============================================================

const ENTITY_STATS = {
    totalTypes: Object.keys(ENTITY_PATTERNS).length,
    withSearchStrategy: Object.values(ENTITY_PATTERNS).filter(e => e.searchStrategy).length,
    filterTypes: Object.values(ENTITY_PATTERNS).filter(e => e.isFilter).length,
    lookupTypes: Object.values(ENTITY_PATTERNS).filter(e => e.isLookup).length
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ENTITY_PATTERNS, EntityRecognizer, ENTITY_STATS };
}
