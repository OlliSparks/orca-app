# Orca API - Kurzreferenz

> Schnellzugriff auf die wichtigsten Endpunkte

**Base-URL:** `https://int.bmw.organizingcompanyassets.com/api/orca`

---

## Inventory

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/inventory-list` | Inventuren auflisten |
| GET | `/inventory/{key}` | Inventur-Details |
| POST | `/inventory` | Inventur erstellen |
| PATCH | `/inventory/{key}` | Inventur aktualisieren |
| GET | `/inventory/{key}/positions` | Positionen abrufen |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/report` | Position melden |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/accept` | Position akzeptieren |
| POST | `/inventory/{key}/actions/send` | Inventur versenden |
| POST | `/inventory/{key}/actions/report` | Inventur melden |
| POST | `/inventory/{key}/actions/approve` | Inventur genehmigen |
| POST | `/inventory/batch/accept` | Batch-Accept |
| POST | `/inventory/batch/approve` | Batch-Approve |

---

## Process (Allgemein)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/{processKey}` | Prozess-Details abrufen |
| POST | `/process` | Neuen Prozess erstellen |
| PATCH | `/process/{processKey}` | Prozess aktualisieren |
| DELETE | `/process/{processKey}` | Prozess loeschen |
| GET | `/process/{processKey}/positions` | Positionen eines Prozesses |
| POST | `/process/{processKey}/positions` | Position hinzufuegen |
| PATCH | `/process/{processKey}/positions/{positionKey}` | Position aktualisieren |

---

## Relocation (Verlagerung)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/relocation` | Verlagerungen auflisten |
| GET | `/process/relocation/{processId}` | Verlagerungs-Details |
| POST | `/process/relocation` | Neue Verlagerung erstellen |
| PATCH | `/process/relocation/{processId}` | Verlagerung aktualisieren |
| POST | `/process/relocation/{processId}/positions/batch` | Positionen im Batch hinzufuegen |
| PATCH | `/process/relocation/{processId}/assign` | Benutzer zuweisen |
| GET | `/process/relocation/{processId}/users/assignable` | Zuweisbare Benutzer abrufen |
| GET | `/process/relocation/{processId}/drafts/entry-certificate/{language}` | Eingangszertifikat-Entwurf (PDF) |
| POST | `/process/relocation/{processId}/actions/submit` | Verlagerung einreichen |
| POST | `/process/relocation/{processId}/actions/approve` | Verlagerung genehmigen |
| POST | `/process/relocation/{processId}/actions/reject` | Verlagerung ablehnen |
| POST | `/process/relocation/{processId}/actions/complete` | Verlagerung abschliessen |

### Relocation.C (Durchfuehrungsauftrag)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/relocation-c/{processId}` | Durchfuehrungsauftrag abrufen |
| POST | `/process/relocation-c/{processId}/actions/report` | Durchfuehrung melden |
| POST | `/process/relocation-c/{processId}/actions/accept` | Durchfuehrung akzeptieren |

---

## Scrapping (Verschrottung)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/scrapping` | Verschrottungen auflisten |
| GET | `/process/scrapping/{processId}` | Verschrottungs-Details |
| POST | `/process/scrapping` | Neue Verschrottung erstellen |
| POST | `/process/scrapping/{processId}/actions/approve` | Verschrottung genehmigen |
| POST | `/process/scrapping/{processId}/actions/reject` | Verschrottung ablehnen |
| POST | `/process/scrapping/{processId}/actions/complete` | Verschrottung abschliessen |

---

## Assets

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/asset-list` | Assets auflisten |
| GET | `/asset/{assetKey}` | Asset-Details |
| GET | `/asset/{assetKey}/process-history` | Prozess-Historie |
| GET | `/asset/{assetKey}/asset-history` | Asset-Historie |
| PATCH | `/asset/{assetKey}/info-text` | Info-Text hinzufuegen |
| POST | `/asset/{assetKey}/preparation` | Asset vorbereiten |

---

## Companies & Suppliers

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/companies` | Firmen suchen |
| GET | `/companies/{key}` | Firma abrufen |
| GET | `/companies/{key}/suppliers` | Lieferanten einer Firma |
| POST | `/companies/{key}/suppliers` | Lieferant erstellen |
| GET | `/companies/{key}/locations` | Standorte einer Firma |
| POST | `/companies/{key}/locations` | Standort erstellen |

---

## Users & Access

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/users` | Alle User |
| GET | `/profile` | Eigenes Profil |
| GET | `/access/companies/{key}/users` | User einer Firma |
| POST | `/access/companies/{key}/users` | User erstellen |
| PUT | `/access/companies/{key}/users/{userKey}/groups` | Gruppen aktualisieren |

---

## System Tasks

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/tasks/system` | System-Tasks auflisten |
| GET | `/tasks/system/{key}` | Task-Details |
| PATCH | `/tasks/system/{key}` | Task aktualisieren |

---

## Query-Parameter (haeufig verwendet)

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `status` | string | Filter nach Status (z.B. I1, P2) |
| `type` | string | Filter nach Typ (z.B. IA, RELOCATION) |
| `companyKey` | string | Filter nach Firma |
| `fromDate` | date | Ab Datum |
| `toDate` | date | Bis Datum |
| `page` | number | Seite (Pagination) |
| `size` | number | Eintraege pro Seite |
| `sort` | string | Sortierung (z.B. "createdAt,desc") |
