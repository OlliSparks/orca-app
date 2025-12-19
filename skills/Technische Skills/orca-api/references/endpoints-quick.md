# Orca API - Endpunkt-Kurzreferenz

## Inventory (Kernbereich)

### Listen & Abrufen
```
GET /inventory-list
  ?status=I0,I1,I2,I3,I4 (required)
  ?supplier=<key>
  ?limit=10&skip=0
  
GET /inventory/{inventoryKey}

GET /inventory/{inventoryKey}/positions
  ?status=P0,P1,P2,P3,P4,P5,P6
  ?limit=10&offset=0

GET /inventory/{inventoryKey}/positions/{positionKey}
```

### Inventur erstellen
```
POST /inventory
Body: {
  "assets": ["asset-key-1", "asset-key-2"],
  "type": "IA|IB|IC|ID",
  "supplier": "supplier-key",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "status": "I0"
}
```

### Inventur-Workflow
```
POST /inventory/{key}/actions/send      → Status I0 → I1 (Versenden)
POST /inventory/{key}/actions/accept    → Annehmen
POST /inventory/{key}/actions/report    → Status → I2 (Melden)
POST /inventory/{key}/actions/approve   → Status → I3 (Genehmigen)
POST /inventory/{key}/actions/decline   → Ablehnen
```

### Position bearbeiten
```
PATCH /inventory/{key}/{positionKey}/{revision}/report   → Position melden
PATCH /inventory/{key}/{positionKey}/{revision}/accept   → Position akzeptieren
PATCH /inventory/{key}/{positionKey}/{revision}/comment  → Kommentar hinzufügen
PATCH /inventory/{key}/{positionKey}/location            → Standort ändern
  Body: { "state": "LS0|LS1|LS2", "revision": "...", "locationKey": "..." }
```

### Batch-Operationen
```
GET  /inventory/batch/accept   → Info wie viele akzeptierbar
POST /inventory/batch/accept   → Alle akzeptieren

GET  /inventory/batch/approve  → Info wie viele genehmigbar  
POST /inventory/batch/approve  → Alle genehmigen
```

### Partitionen (Teilaufträge)
```
GET  /inventory/{key}/partitions
POST /inventory/{key}/partitions
  Body: { "description": "...", "assignedUser": "user-key", "company": "company-key" }

POST /inventory/{key}/partitions/{partitionKey}/positions
  Body: { "positions": ["position-key-1", ...] }
```

---

## Assets

### Listen & Suchen
```
GET /asset-list
  ?query=<search>
  ?supplier=<key>
  ?project=<name>
  ?processStatus=A0,A1,...
  ?limit=10&offset=0

GET /asset-list/quick-search
  ?criteria=inventoryNumber|orderNumber
  ?value=<search>

GET /asset-list/fields  → Filter-Werte
```

### Asset-Details
```
GET /asset/{assetKey}
GET /asset/{assetKey}/process-history
GET /asset/{assetKey}/asset-history
GET /asset/{assetKey}/participants
GET /asset/{assetKey}/documents
GET /asset/{assetKey}/images
```

### Asset bearbeiten
```
PATCH /asset/{assetKey}/info-text
  Body: { "infoText": "...", "infoText2": "..." }

POST /asset/{assetKey}/preparation
  Body: { "supplierKey": "...", "locationKey": "...", "partNumberKey": "..." }
```

---

## Companies & Suppliers

### Firmen
```
GET /companies?query=<search>
GET /companies/{companyKey}
GET /companies/list  → Eigene Firmen

POST /companies
  Body: { "name": "...", "country": "DE", "city": "...", "postcode": "...", "street": "..." }

PATCH /companies/{companyKey}?revision=<rev>
  Body: { "name": "Neuer Name" }
```

### Lieferanten
```
GET /companies/{companyKey}/suppliers?query=<search>
GET /companies/{companyKey}/suppliers/{supplierKey}

POST /companies/{companyKey}/suppliers
  Body: { "supplier": { ... company data ... }, "roles": ["SUP"] }
```

### Standorte
```
GET /companies/{companyKey}/locations
  ?country=DE&city=München
  
GET /companies/{companyKey}/locations/{locationKey}

POST /companies/{companyKey}/locations?locationMode=MANUAL_CREATION
  Body: { "title": "...", "country": "DE", "city": "...", "postcode": "...", "street": "..." }
```

---

## Users & Access

### User abrufen
```
GET /users?query=<search>&limit=20
GET /profile  → Eigenes Profil
GET /users/{userKey}/groups?company=<key>
GET /users/{userKey}/rights
```

### User in Firma
```
GET /access/companies/{companyKey}/users
  ?group=IVL,FEK,...
  ?showInactive=false

GET /access/companies/{companyKey}/users/{userKey}

POST /access/companies/{companyKey}/users?group=IVL
  Body: { "firstName": "...", "lastName": "...", "mail": "..." }

PATCH /access/companies/{companyKey}/users/{userKey}
  Body: { "firstName": "Neu", ... }

PUT /access/companies/{companyKey}/users/{userKey}/groups
  Body: { "groups": ["IVL", "SUP"] }
```

---

## System Tasks

```
GET /tasks/system
  ?status=NEW,OPEN,IN_PROGRESS,...
  ?type=INVENTORY_COMPLETION,SEND_INVENTORY,...
  ?supplier=<key>
  ?limit=10&offset=0

GET /tasks/system/{key}

PATCH /tasks/system/{key}
  Body: { "status": "COMPLETED", "comment": "..." }
```

---

## Notifications (User Tasks)

```
GET /tasks
  ?status=NEW,IN_PROGRESS,DONE
  ?assignee=<userKey>
  ?limit=10&offset=0

GET /tasks/{id}

PATCH /tasks/{id}
  Body: { "status": "DONE", "resultMessage": "..." }

PUT /tasks/users/{userKey}/complete  → Alle abschließen
```

---

## Reports

```
GET /report/{key}?format=PDF|HTML|CSV|XLSX
GET /report/inventories/result/{inventoryKey}
GET /report/scrappings/result/{scrappingKey}
```

---

## Filter-Felder abrufen

```
GET /inventory-list/fields?status=I1
GET /asset-list/fields
GET /tasks/system/fields
GET /search/fields
```
