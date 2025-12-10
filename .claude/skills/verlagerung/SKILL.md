---
name: verlagerung
description: Bei Verlagerungs-Features, Werkzeug-Transport und Standortwechsel-Workflows konsultieren. Enthaelt alle Informationen zum Verlagerung-Modul der orca-app.
---

# Verlagerung Skill

## Wann diesen Skill verwenden?

- Verlagerungs-Features entwickeln oder erweitern
- Standortwechsel-Workflows implementieren
- Transport-Logik verstehen
- Audit-Pruefungen bei Laenderwechsel

## Kernkonzept

Verlagerungen beschreiben den geplanten Transport von Werkzeugen von einem Standort zu einem anderen. Sie enthalten Metadaten zum Transport sowie eine Liste der zu verlagernden Werkzeuge (Positionen).

## Datenstruktur

### Verlagerung (Relocation)
```javascript
{
    id: string,              // Eindeutige ID
    processKey: string,      // Prozess-Key fuer API
    number: string,          // Verlagerungs-Nummer
    name: string,            // Beschreibung/Name
    identifier: string,      // Externer Identifier
    status: string,          // offen | feinplanung | in-inventur | abgeschlossen

    // Standorte
    sourceLocation: string,  // Ausgangsort (Name)
    targetLocation: string,  // Zielstandort (Name)
    sourceLocationKey: string, // API-Key Quelle
    targetLocationKey: string, // API-Key Ziel

    // Termine
    dueDate: string,         // Faelligkeitsdatum
    departureDate: string,   // Geplanter Verladetermin
    arrivalDate: string,     // Geplanter Ankunftstermin

    // Zustaendigkeit
    supplier: string,        // Lieferant
    supplierName: string,    // Lieferant (Name)
    assignedUser: string,    // Bearbeiter
    assignedUserName: string, // Bearbeiter (Name)

    // Meta
    comment: string,         // Kommentar
    createdAt: string,       // Erstellungsdatum
    completedAt: string      // Abschlussdatum
}
```

### Verlagerungs-Position
```javascript
{
    assetKey: string,        // Werkzeug-Key
    inventoryNumber: string, // Inventarnummer
    name: string,            // Werkzeugname
    currentLocation: string, // Aktueller Standort
    status: string           // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
}
```

## Status-Workflow

```
┌─────────────────────────────────────────────────────┐
│                     OFFEN                           │
│           (Neu erstellt, noch nicht geplant)        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  FEINPLANUNG                        │
│          (Termine und Details werden geplant)       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 IN-BEARBEITUNG                      │
│            (Transport laeuft, Inventur aktiv)       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 ABGESCHLOSSEN                       │
│          (Alle Werkzeuge am Zielstandort)           │
└─────────────────────────────────────────────────────┘
```

### Status-Bedeutung

| Status | CSS-Klasse | Bedeutung |
|--------|------------|-----------|
| offen | status-offen | Neu erstellt |
| feinplanung | status-feinplanung | In Planung |
| in-inventur | status-in-inventur | In Bearbeitung/Transport |
| abgeschlossen | status-abgeschlossen | Fertig |

## Benutzer-Aktionen

### Listen-Ansicht

1. **Filtern**: Nach Status (offen, feinplanung, in-inventur, abgeschlossen)
2. **Suchen**: Nach Verlagerungs-Nr., Name, Standort
3. **Sortieren**: Alle Spalten sortierbar
4. **Export**: CSV-Export der gefilterten Daten

### Detail-Ansicht

1. **Werkzeuge hinzufuegen**: Positionen zur Verlagerung hinzufuegen
2. **Details anzeigen**: Einzelnes Werkzeug oeffnen
3. **Positionen verwalten**: Status der einzelnen Werkzeuge

### Neue Verlagerung erstellen

```javascript
{
    description: string,      // Pflicht: Beschreibung
    sourceLocationKey: string, // Pflicht: Von-Standort
    targetLocationKey: string, // Pflicht: Nach-Standort
    dueDate: string,          // Pflicht: Faelligkeitsdatum
    comment: string           // Optional: Kommentar
}
```

## Audit-Pruefung (Laenderwechsel)

Bei Verlagerungen zwischen verschiedenen Laendern wird eine Audit-Pruefung durchgefuehrt:

```javascript
// Automatische Pruefung bei Standort-Auswahl
if (sourceCountry !== targetCountry) {
    const audit = await api.checkRelocationAudit(sourceCountry, targetCountry);
    // Ergebnis: allowed (gruen) | warning (rot) | blocked (schwarz)
}
```

### Audit-Ergebnisse

| Farbe | Bedeutung | Aktion |
|-------|-----------|--------|
| Gruen | Erlaubt | Keine Einschraenkung |
| Rot | Warnung | Genehmigung erforderlich |
| Schwarz | Blockiert | Nicht erlaubt |

## API-Integration

### Verlagerungsliste laden
```javascript
const response = await api.getVerlagerungList();
// Filtert auf Prozess-Typ RELOCATION
```

### Verlagerung Details
```javascript
const detail = await api.getRelocationDetail(processKey);
const positions = await api.getRelocationPositions(processKey);
```

### Neue Verlagerung erstellen
```javascript
const result = await api.createRelocation({
    description,
    sourceLocationKey,
    targetLocationKey,
    dueDate,
    comment
});
```

### Positionen hinzufuegen
```javascript
const result = await api.addRelocationPositions(processKey, assetKeys);
```

### Standorte laden (fuer Dropdowns)
```javascript
const company = await api.getCompanyBySupplier();
const locations = await api.getCompanyLocations(company.companyKey);
```

## UI-Komponenten

### Listen-Ansicht
- API-Mode-Indikator (Live/Mock)
- Filter-Chips mit Anzahl
- Sortierbare Tabelle
- Pagination
- CSV-Export

### Detail-Ansicht
- Header mit Status-Badge
- Info-Cards (Vertragspartner, Termine, Bearbeiter)
- Standort-Visualisierung (Quelle -> Ziel)
- Positions-Tabelle
- Meta-Informationen

### Modals
- Neue Verlagerung erstellen
- Werkzeuge hinzufuegen (mit Suche)

## Standort-Visualisierung

```
┌───────────────┐          ┌───────────────┐
│  Ausgangsort  │   --->   │  Zielstandort │
│  (sourceLocation)        │ (targetLocation)│
└───────────────┘          └───────────────┘
```

## Export-Funktion

```javascript
exportData() {
    const headers = ['Verlagerungs-Nr.', 'Beschreibung', 'Von', 'Nach', 'Status', 'Fällig'];
    const csv = filteredTools.map(tool => [
        tool.number,
        tool.name,
        tool.sourceLocation,
        tool.targetLocation,
        tool.status,
        tool.dueDate
    ]);
    // Download als CSV mit BOM fuer Excel-Kompatibilitaet
}
```

## Design-Prinzipien (Supplier-Persona)

- **Uebersichtlichkeit**: Standort-Wechsel visuell klar dargestellt
- **Audit-Transparenz**: Laenderwechsel-Regeln direkt sichtbar
- **Batch-Verarbeitung**: Mehrere Werkzeuge auf einmal hinzufuegen
- **Export**: Daten fuer interne Planung exportierbar
- **Status-Tracking**: Klarer Fortschritt durch Status-Workflow
