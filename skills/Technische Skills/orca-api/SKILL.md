---
name: orca-api
description: "API-Referenz für das bestehende Orca-System. Nutze diesen Skill wenn du Daten aus Orca lesen oder schreiben musst. Enthält alle Endpunkte für Assets, Inventuren, Companies, User und Prozesse. Trigger: API-Calls, Datenabruf, Integration, Backend-Kommunikation."
---

# Orca API Skill

Vollständige API-Referenz für das Orca Asset-Management-System.

**Base-URL**: `https://int.bmw.organizingcompanyassets.com/api/orca`
**Auth**: Bearer Token (JWT via Keycloak)
**Stand**: 2024-12-18 (87 GET-Endpoints dokumentiert)

## Schnellnavigation

| Bereich | Anzahl | Hauptzweck |
|---------|--------|------------|
| [Inventory](#inventory-12-endpoints) | 12 | Inventuren, Positionen, Partitionen |
| [Assets](#assets-15-endpoints) | 15 | Werkzeuge, Historie, Dokumente |
| [Process](#process-13-endpoints) | 13 | Verlagerung, VPW, ABL |
| [Companies](#companies-16-endpoints) | 16 | Firmen, Lieferanten, Standorte |
| [Access](#access-6-endpoints) | 6 | Zugriffsprüfung, User pro Firma |
| [Users](#users-8-endpoints) | 8 | User, Profile, Rechte, Gruppen |
| [Notifications](#notifications-4-endpoints) | 4 | Tasks, Benachrichtigungen |
| [System Tasks](#system-tasks-3-endpoints) | 3 | Hintergrund-Jobs |
| [Reports](#reports-3-endpoints) | 3 | PDF/Excel Exports |
| [Administration](#administration-6-endpoints) | 6 | Migrationen, Fehler-Assets |
| [Sonstige](#sonstige-endpoints) | 7 | Geo, Tracker, Dokumente |

## Referenzdokumente

- **[endpoints-quick.md](references/endpoints-quick.md)** – Kurzreferenz der wichtigsten Endpunkte
- **[openapi.json](references/openapi.json)** – Vollständige OpenAPI 3.0 Spezifikation

---

## Inventory (12 Endpoints)

### Listen & Abrufen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/inventory-list` | Inventuren auflisten (status required!) |
| GET | `/inventory-list/fields` | Filter-Werte für Inventurliste |
| GET | `/inventory/{key}` | Inventur-Details |
| GET | `/inventory/types` | Alle Inventurtypen (IA, IB, IC, ID) |
| GET | `/inventory/{key}/positions` | Positionen einer Inventur |
| GET | `/inventory/{key}/positions/{positionKey}` | Position-Details |
| GET | `/inventory/{key}/positions/fields` | Filter für Positionen |
| GET | `/inventory/{key}/position/report` | Status-Statistik der Positionen |
| GET | `/inventory/{key}/partitions` | Partitionen/Teilaufträge |
| GET | `/inventory/{key}/partitions/{partitionKey}` | Partition-Details |
| GET | `/inventory/batch/accept` | Batch-Accept Info |
| GET | `/inventory/batch/approve` | Batch-Approve Info |

### Inventur-Aktionen (POST/PATCH)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/inventory` | Inventur erstellen |
| PATCH | `/inventory/{key}` | Inventur aktualisieren |
| POST | `/inventory/{key}/actions/send` | Versenden (I0→I1) |
| POST | `/inventory/{key}/actions/accept` | Annehmen |
| POST | `/inventory/{key}/actions/report` | Melden (→I2) |
| POST | `/inventory/{key}/actions/approve` | Genehmigen (→I3) |
| POST | `/inventory/{key}/actions/decline` | Ablehnen |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/report` | Position melden |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/accept` | Position akzeptieren |

---

## Assets (15 Endpoints)

### Listen & Suchen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/asset-list` | Assets auflisten (mit vielen Filtern) |
| GET | `/asset-list/fields` | Filter-Werte für Asset-Liste |
| GET | `/asset-list/quick-search` | Schnellsuche (criteria + value) |
| GET | `/assets` | Alle Assets (alternative Route) |

### Asset-Details

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/asset/{assetKey}` | Asset-Details |
| GET | `/assets/{assetKey}` | Asset-Details (alternative Route) |
| GET | `/asset/{assetKey}/asset-history` | Änderungshistorie |
| GET | `/asset/{assetKey}/process-history` | Prozess-Historie (Verlagerungen etc.) |
| GET | `/asset/{assetKey}/process-history/{processKey}` | Spezifischer Prozess |
| GET | `/asset/{assetKey}/documents` | Dokumente |
| GET | `/asset/{assetKey}/images` | Bilder |
| GET | `/asset/{assetKey}/order-positions` | Bestellpositionen |
| GET | `/asset/{assetKey}/participants` | Beteiligte Personen |
| GET | `/asset/{assetKey}/partnumber-history` | Sachnummer-Historie |
| GET | `/assets/{assetKey}/tracker/current` | Aktueller Tracker-Status |

### Asset bearbeiten (PATCH/POST)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| PATCH | `/asset/{assetKey}/info-text` | Info-Text hinzufügen |
| POST | `/asset/{assetKey}/preparation` | Asset vorbereiten |

---

## Process (13 Endpoints)

### Listen & Details

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process` | Alle Prozesse (Verlagerung, VPW, ABL) |
| GET | `/process/{processKey}` | Prozess-Details |
| GET | `/process/{processKey}/details` | Vollständige Details inkl. Positionen |
| GET | `/process/{processKey}/positions` | Prozess-Positionen |
| GET | `/process/{processKey}/positions/{positionKey}` | Position-Details |
| GET | `/process/{processKey}/positions/{positionKey}/partitions` | Position-Partitionen |
| GET | `/process/{processKey}/positions/{positionKey}/reference` | Position-Referenz |
| GET | `/process/{processKey}/history` | Prozess-Historie |
| GET | `/process/{processKey}/partitions` | Prozess-Partitionen |
| GET | `/process/{processKey}/partitions/{partition}` | Partition-Details |
| GET | `/process/{processKey}/available-external-processes` | Verknüpfbare externe Prozesse |

### Spezielle Prozess-Typen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/scrapping` | Verschrottungsprozesse |
| GET | `/process/relocation/{processId}/drafts/entry-certificate/{language}` | Eintrittsbescheinigung (PDF) |
| GET | `/process/relocation/{processId}/users/assignable` | Zuweisbare User |

### Externe Prozesse

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/external-process` | Externe Prozesse auflisten |
| GET | `/external-process/{processKey}` | Externer Prozess Details |

---

## Companies (16 Endpoints)

### Firmen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/companies` | Firmen suchen (query required) |
| GET | `/companies/list` | Eigene Firmen nach Rolle |
| GET | `/companies/{companyKey}` | Firma-Details |
| GET | `/companies/{companyKey}/vatId/{vatIdKey}/logs` | USt-ID Prüfungs-Logs |

### Lieferanten

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/companies/{companyKey}/suppliers` | Lieferanten einer Firma |
| GET | `/companies/{companyKey}/suppliers/{supplierKey}` | Lieferant-Details |
| GET | `/companies/{companyKey}/suppliers/{supplierKey}/locations` | Lieferanten-Standorte |
| GET | `/companies/{companyKey}/sub-supplier-linked/{supplierKey}` | Sub-Supplier verknüpft? |

### Standorte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/companies/{companyKey}/locations` | Standorte einer Firma |
| GET | `/companies/{companyKey}/locations/{locationKey}` | Standort-Details |

### Firmen bearbeiten (POST/PATCH)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/companies` | Firma erstellen |
| PATCH | `/companies/{companyKey}` | Firma aktualisieren |
| POST | `/companies/{companyKey}/suppliers` | Lieferant erstellen |
| POST | `/companies/{companyKey}/locations` | Standort erstellen |

---

## Access (6 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/access/companies/access-check` | Zugriff prüfen (userKey + companyKey) |
| GET | `/access/companies/possibleUsers` | Mögliche User für Zuweisung |
| GET | `/access/companies/users` | User aller meiner Firmen |
| GET | `/access/companies/{key}/users` | User einer Firma |
| GET | `/access/companies/{key}/users/{userKey}` | User-Details in Firma |
| GET | `/access/companies/{key}/suppliers/{supplierKey}/users` | User eines Lieferanten |

---

## Users (8 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/users` | Alle User suchen |
| GET | `/users/cl` | Alle Freigeber (CL) |
| GET | `/users/{userKey}/groups` | Gruppen eines Users |
| GET | `/users/{userKey}/rights` | Globale Rechte eines Users |
| GET | `/profile` | Eigenes Profil |
| GET | `/users/by-keycloak-id/{keycloakId}/companies` | Firmen per Keycloak-ID |
| GET | `/users/by-keycloak-id/{keycloakId}/groups` | Gruppen per Keycloak-ID |

### User bearbeiten (POST/PUT)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/access/companies/{key}/users` | User erstellen |
| PATCH | `/access/companies/{key}/users/{userKey}` | User aktualisieren |
| PUT | `/access/companies/{key}/users/{userKey}/groups` | Gruppen setzen |

---

## Notifications (4 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/tasks` | Benachrichtigungen/Aufgaben |
| GET | `/tasks/analyze` | Anzahl gruppiert (groupBy) |
| GET | `/tasks/fields` | Filter-Optionen |
| GET | `/tasks/{id}` | Task-Details |

---

## System Tasks (3 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/tasks/system` | System-Tasks auflisten |
| GET | `/tasks/system/fields` | Filter-Optionen |
| GET | `/tasks/system/{key}` | System-Task Details |

---

## Reports (3 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/report/{key}` | Report laden (format=PDF\|XLSX\|CSV) |
| GET | `/report/inventories/result/{inventoryKey}` | Inventur-Ergebnis Report |
| GET | `/report/scrappings/result/{scrappingKey}` | Verschrottungs-Report |

---

## Administration (6 Endpoints)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/migrations` | Alle Migrationen |
| GET | `/migrations/available` | Verfügbare Migration-Namen |
| GET | `/administration/action-histories` | Action-Historie |
| GET | `/administration/assets/invalid-status/{status}` | Assets mit ungültigem Status |
| GET | `/administration/inventories/missing-tasks/{systemTaskType}` | Inventuren ohne Task |
| GET | `/administration/inventories/missing-tasks/{systemTaskType}/retry/status` | Retry-Status |

---

## Sonstige Endpoints

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/geoloc/{country}/{postcode}/cities` | Städte zu Land+PLZ |
| GET | `/search/fields` | Globale Filter-Optionen |
| GET | `/tracker/data` | Tracker-Daten |
| GET | `/documents/{documentKey}/content` | Dokument-Inhalt laden |
| GET | `/asset-planning/ruleset/executions` | Planungs-Regelwerk |
| GET | `/job/createInventoryV2` | Inventur-Job manuell starten |

---

## Status-Codes

### Inventur-Status

| Status | Bedeutung |
|--------|-----------|
| I0 | Neu/Entwurf |
| I1 | Versendet |
| I2 | Gemeldet |
| I3 | Genehmigt |
| I4 | Abgeschlossen |
| I5 | Teilweise akzeptiert |
| I6 | Vollständig akzeptiert |

### Position-Status

| Status | Bedeutung |
|--------|-----------|
| P0 | Ohne Inventur |
| P1 | Ohne Akzeptanz |
| P2 | Gefunden, keine Vorfälle |
| P3 | Gefunden, mit Vorfällen |
| P4 | Anderer Standort, keine Vorfälle |
| P5 | Anderer Standort, mit Vorfällen |
| P6 | Nicht gefunden |

### Prozess-Status (Verlagerung)

| Status | Bedeutung |
|--------|-----------|
| R0 | Neu/Entwurf |
| R2 | Beantragt |
| R4 | In Durchführung |
| R6 | Abgeschlossen |

### Inventur-Typen

| Typ | Beschreibung |
|-----|--------------|
| IA | Standard-Inventur |
| IB | Mit Foto-Nachweis |
| IC | Typ C |
| ID | Typ D |

---

## User-Rollen

| Rolle | Beschreibung |
|-------|--------------|
| IVL | Inventory Lead (Lieferanten-Seite) |
| WVL | Werkzeug-Verantwortlicher Lead |
| WVL-LOC | WVL mit Standort-Beschränkung |
| ITL | IT Lead |
| VVL | Verlagerungs-Verantwortlicher Lead |
| FEK | Facheinkäufer |
| CL | Clearing/Approver (Freigeber) |
| SUP | Support |
| ID | Inventory Delegate |

---

## API-Ketten (häufige Workflows)

### Werkzeug per Nummer finden

```
Eingabe: 10255187 (Werkzeugnummer)
1. GET /asset-list/quick-search?criteria=identifier&value=10255187
2. Ergebnis enthält context.key
3. GET /asset/{assetKey} für Details
4. GET /asset/{assetKey}/process-history für Historie
```

### Inventur-Positionen bearbeiten

```
Eingabe: BMW-2024-001 (Inventurnummer)
1. GET /inventory-list?status=I0,I1,I2&inventoryNumber=BMW-2024-001
2. Ergebnis enthält context.key (inventoryKey)
3. GET /inventory/{key}/positions
4. PATCH /inventory/{key}/{positionKey}/{revision}/report
```

### Firma mit allen Standorten

```
Eingabe: Bosch (Firmenname)
1. GET /companies?query=Bosch
2. Ergebnis enthält companyKey
3. GET /companies/{companyKey}/locations
4. GET /companies/{companyKey}/suppliers
```

---

## Code-Beispiele

### Quick-Search (empfohlen für Einzelsuche)

```javascript
const response = await fetch(
  'https://int.bmw.organizingcompanyassets.com/api/orca/asset-list/quick-search?criteria=identifier&value=10255187',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const assets = await response.json();
```

### Inventur-Positionen laden

```javascript
const response = await fetch(
  `https://int.bmw.organizingcompanyassets.com/api/orca/inventory/${inventoryKey}/positions?limit=100`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const positions = await response.json();
```

### Prozess mit allen Details (1 Call statt 2)

```javascript
// Statt /process/{key} + /process/{key}/positions
const response = await fetch(
  `https://int.bmw.organizingcompanyassets.com/api/orca/process/${processKey}/details`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const fullProcess = await response.json();
// Enthält: process, positions, history
```

---

## Update 18.12.2024

- Alle 87 GET-Endpoints dokumentiert (vorher ~40)
- API-Ketten für häufige Workflows hinzugefügt
- `/asset-list/quick-search` als empfohlene Einzelsuche
- `/process/{key}/details` als kombinierter Endpoint
- Kategorien mit Endpoint-Anzahl in Schnellnavigation
