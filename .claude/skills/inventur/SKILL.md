---
name: inventur
description: Bei Inventur-Features, Werkzeug-Bestaetigung und Inventur-Workflows konsultieren. Enthaelt alle Informationen zum Inventur-Modul der orca-app.
---

# Inventur Skill

## Wann diesen Skill verwenden?

- Inventur-Features entwickeln oder erweitern
- Werkzeug-Bestaetigungslogik implementieren
- Inventur-Workflows verstehen
- Status-Handling fuer Inventur-Positionen

## Kernkonzept

Die Inventur ermoeglicht es Lieferanten, ihre Werkzeuge zu bestaetigen, als verschoben zu melden oder als fehlend zu kennzeichnen.

## Datenstruktur

### Inventur-Position (Tool)
```javascript
{
    id: string,              // Eindeutige ID
    number: string,          // Werkzeugnummer (z.B. "WZ-2024-001")
    name: string,            // Werkzeugname/Beschreibung
    location: string,        // Aktueller Standort
    locationKey: string,     // API-Key des Standorts (UUID)
    responsible: string,     // Verantwortlicher Mitarbeiter
    dueDate: string,         // Faelligkeitsdatum (ISO)
    lastChange: string,      // Letzte Aenderung (ISO)
    status: string,          // pending | confirmed | relocated | missing
    comment: string,         // Kommentar vom Lieferanten
    newLocation: string,     // Neuer Standort (bei relocated)
    newLocationKey: string,  // API-Key des neuen Standorts
    photo: string,           // Base64-encoded Foto
    missingReason: string,   // Grund bei fehlenden Werkzeugen
    parentInventory: {       // Referenz zur Eltern-Inventur
        key: string,
        type: string,
        status: string
    }
}
```

## Status-Workflow

```
┌─────────────────────────────────────────────────────┐
│                     PENDING                         │
│              (Offen - Noch zu bearbeiten)           │
└─────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌───────────┐  ┌──────────┐
    │CONFIRMED │  │ RELOCATED │  │ MISSING  │
    │(Bestaetigt)│  │(Verschoben)│  │ (Fehlt)  │
    └──────────┘  └───────────┘  └──────────┘
```

### Status-Bedeutung

| Status | Icon | Bedeutung | Aktion |
|--------|------|-----------|--------|
| pending | (leer) | Offen | Werkzeug muss bearbeitet werden |
| confirmed | check | Bestaetigt | Werkzeug ist am erwarteten Standort |
| relocated | pin | Verschoben | Werkzeug wurde an anderen Standort verlegt |
| missing | x | Fehlt | Werkzeug ist nicht auffindbar |

## Benutzer-Aktionen

### 1. Bestaetigen (confirm)
- Werkzeug ist am erwarteten Standort vorhanden
- Setzt Status auf "confirmed"
- Keine weiteren Eingaben erforderlich

### 2. Verschieben (relocate)
- Werkzeug ist an einem anderen Standort
- Oeffnet Modal zur Standort-Auswahl
- Speichert newLocation und newLocationKey
- Setzt Status auf "relocated"

### 3. Foto hinzufuegen (photo)
- Optional: Foto des Werkzeugs hochladen
- Base64-encoded gespeichert
- Aendert Status NICHT

### 4. Als fehlend melden (missing)
- Werkzeug ist nicht auffindbar
- Oeffnet Modal fuer Begruendung
- Speichert missingReason
- Setzt Status auf "missing"

### 5. Verantwortlichen aendern (delegate)
- Aufgabe an Kollegen delegieren
- Dropdown mit Benutzern aus Company-API
- Oder freie Texteingabe

### 6. Rueckgaengig (reset)
- Setzt Werkzeug zurueck auf "pending"
- Loescht newLocation und andere Aenderungen

## Bulk-Aktionen

### Alle gefilterten bestaetigen
```javascript
confirmAllFiltered() {
    const pending = filtered.filter(t => t.status === 'pending');
    pending.forEach(tool => { tool.status = 'confirmed'; });
}
```

### Filter nach Standort
- Zeigt nur Werkzeuge eines bestimmten Standorts
- Ermoeglicht standortweise Abarbeitung

### Filter nach Verantwortlichem
- Zeigt nur Werkzeuge eines Mitarbeiters
- Ermoeglicht personenbezogene Abarbeitung

## API-Integration

### Daten laden (2-Schritt)
```javascript
// 1. Inventur-Liste (Kopfdaten)
const inventories = await api.getInventoryList();

// 2. Fuer jede Inventur die Positionen
for (const inv of inventories) {
    const positions = await api.getInventoryPositions(inv.inventoryKey);
}
```

### Benutzerliste fuer Delegation
```javascript
const company = await api.getCompanyBySupplier();
const users = await api.getCompanyUsers(company.companyKey);
```

## UI-Komponenten

### Views
- **Tabellen-Ansicht**: Kompakt, sortierbar, mit Pagination
- **Karten-Ansicht**: Uebersichtlich, touch-freundlich

### Fortschritts-Tacho
- Zeigt prozentualen Bearbeitungsstand
- Berechnung: `(confirmed + relocated + missing) / total * 100`
- Erfolgsmeldung bei 100%

### Filter-Chips
- Alle / Offen / Bestaetigt / Verschoben / Ueberfaellig
- Mit Anzahl-Badges

## Faelligkeits-Logik

```javascript
isOverdue(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
}
```

## Einreichen

```javascript
submitInventory() {
    // Nur bearbeitete Werkzeuge werden eingereicht
    const toSubmit = tools.filter(t => t.status !== 'pending');

    // Nach Einreichung: Aus lokaler Liste entfernen
    this.tools = tools.filter(t => t.status === 'pending');
}
```

## Design-Prinzipien (Supplier-Persona)

- **Minimaler Aufwand**: Ein Klick zum Bestaetigen
- **Bulk-Operationen**: Alle auf einmal bestaetigen moeglich
- **Fehlertoleranz**: Foto optional, Kommentar optional
- **Delegation**: Aufgaben an Kollegen weitergeben
- **Fortschritts-Feedback**: Tacho zeigt verbleibende Arbeit
