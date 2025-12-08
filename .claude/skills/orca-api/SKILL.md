---
name: orca-api
description: "API-Referenz für das bestehende Orca-System. Nutze diesen Skill wenn du Daten aus Orca lesen oder schreiben musst. Enthält alle Endpunkte für Assets, Inventuren, Companies, User und Prozesse. Trigger: API-Calls, Datenabruf, Integration, Backend-Kommunikation."
---

# Orca API Skill

Vollständige API-Referenz für das Orca Asset-Management-System.

**Base-URL**: `https://int.bmw.organizingcompanyassets.com/api/orca`
**Auth**: Bearer Token (JWT)

## Schnellnavigation

| Bereich | Hauptzweck |
|---------|------------|
| [Inventory](#inventory) | Inventuren erstellen, bearbeiten, abschließen |
| [Assets](#assets) | Werkzeuge abrufen, suchen, bearbeiten |
| [Companies](#companies) | Firmen und Lieferanten verwalten |
| [Users](#users) | Benutzer und Rechte |
| [Process](#process) | Relocation, Scrapping |

## Referenzdokumente

- **[endpoints-quick.md](references/endpoints-quick.md)** – Kurzreferenz der wichtigsten Endpunkte
- **[openapi.json](references/openapi.json)** – Vollständige OpenAPI 3.0 Spezifikation

## Wichtigste Endpunkte

### Inventory

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/inventory-list` | Inventuren auflisten (mit Filtern) |
| GET | `/inventory/{key}` | Inventur-Details |
| POST | `/inventory` | Inventur erstellen |
| PATCH | `/inventory/{key}` | Inventur aktualisieren |
| GET | `/inventory/{key}/positions` | Positionen einer Inventur |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/report` | Position melden |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/accept` | Position akzeptieren |
| POST | `/inventory/{key}/actions/send` | Inventur versenden |
| POST | `/inventory/{key}/actions/accept` | Inventur annehmen |
| POST | `/inventory/{key}/actions/report` | Inventur melden |
| POST | `/inventory/{key}/actions/approve` | Inventur genehmigen |
| POST | `/inventory/batch/accept` | Batch-Accept |
| POST | `/inventory/batch/approve` | Batch-Approve |

### Assets

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/asset-list` | Assets auflisten (mit Filtern) |
| GET | `/asset/{assetKey}` | Asset-Details |
| GET | `/asset/{assetKey}/process-history` | Prozess-Historie |
| GET | `/asset/{assetKey}/asset-history` | Asset-Historie |
| PATCH | `/asset/{assetKey}/info-text` | Info-Text hinzufügen |
| POST | `/asset/{assetKey}/preparation` | Asset vorbereiten |

### Companies & Suppliers

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/companies` | Firmen suchen |
| GET | `/companies/{key}` | Firma abrufen |
| GET | `/companies/{key}/suppliers` | Lieferanten einer Firma |
| POST | `/companies/{key}/suppliers` | Lieferant erstellen |
| GET | `/companies/{key}/locations` | Standorte einer Firma |
| POST | `/companies/{key}/locations` | Standort erstellen |

### Users & Access

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/users` | Alle User |
| GET | `/profile` | Eigenes Profil |
| GET | `/access/companies/{key}/users` | User einer Firma |
| POST | `/access/companies/{key}/users` | User erstellen |
| PUT | `/access/companies/{key}/users/{userKey}/groups` | Gruppen aktualisieren |

### System Tasks

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/tasks/system` | System-Tasks auflisten |
| GET | `/tasks/system/{key}` | Task-Details |
| PATCH | `/tasks/system/{key}` | Task aktualisieren |

## Inventur-Status

| Status | Bedeutung |
|--------|-----------|
| I0 | Neu/Entwurf |
| I1 | Versendet |
| I2 | Gemeldet |
| I3 | Genehmigt |
| I4 | Abgeschlossen |

## Position-Status

| Status | Bedeutung |
|--------|-----------|
| P0 | Ohne Inventur |
| P1 | Ohne Akzeptanz |
| P2 | Gefunden, keine Vorfälle |
| P3 | Gefunden, mit Vorfällen |
| P4 | Anderer Standort, keine Vorfälle |
| P5 | Anderer Standort, mit Vorfällen |
| P6 | Nicht gefunden |

## Inventur-Typen

| Typ | Beschreibung |
|-----|--------------|
| IA | Standard-Inventur |
| IB | Mit Foto-Nachweis |
| IC | Typ C |
| ID | Typ D |

## User-Rollen

| Rolle | Beschreibung |
|-------|--------------|
| IVL | Inventory Lead (Lieferanten-Seite) |
| ITL | IT Lead |
| WVL | Werkzeug-Verantwortlicher Lead |
| FEK | Facheinkäufer |
| CL | Clearing/Approver |
| SUP | Supplier |
| ABL | ? |
| STL | ? |

## Code-Beispiel: Inventur abrufen

```typescript
const response = await fetch(
  'https://int.bmw.organizingcompanyassets.com/api/orca/inventory/{inventoryKey}',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const inventory = await response.json();
```
