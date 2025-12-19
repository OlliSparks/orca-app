# Inventur Prozess-Skill

Kontextwissen für die Implementierung des Inventur-Prozesses im Orca Asset-Management-System.

## Status
**TODO** - Dieser Skill ist in Bearbeitung und wird noch ergänzt.

## Trigger
- Inventur-Feature-Entwicklung
- Inventur-Workflow-Design
- Inventur-API-Integration

## Prozess-Übersicht

Die Inventur ist ein zentraler Prozess zur Bestandsaufnahme von Fertigungsmitteln (Werkzeugen) bei Lieferanten.

### Prozess-Typen
- `INVENTORY` - Hauptprozess Inventur
- `INVENTORY.C` - Unterprozess (Child) für einzelne Positionen

### Status-Codes (Position)
- `P0` - Offen/Neu
- `P1` - In Bearbeitung
- `P2` - Bestätigt
- `P3` - Nicht gefunden
- `P4` - Kommentar/Klärfall
- `P5` - Abgeschlossen
- `P6` - Abgebrochen

### Status-Codes (Inventur)
- `I0` - Initialisiert
- `I1` - Offen
- `I2` - In Bearbeitung
- `I3` - Abgeschlossen
- `I4` - Abgebrochen

## API-Endpunkte

### Inventur-Liste
```
GET /inventory-list?limit=100&skip=0
```

### Inventur-Positionen
```
GET /inventory/{key}/positions?limit=100&skip=0
```

### Position aktualisieren
```
PATCH /position/{key}
Body: { status: "P2", comment: "..." }
```

### Position zuweisen (Delegation)
```
PATCH /position/{key}
Body: { assignedUser: "user-key" }
```

## Datenstruktur

### Inventur-Objekt
```javascript
{
  key: "inventory-uuid",
  meta: {
    "i.type": "STANDARD",
    "i.status": "I1",
    dueDate: "2025-01-15",
    description: "Jahresinventur 2025",
    contractPartner: "133188"
  }
}
```

### Position-Objekt
```javascript
{
  context: { key: "position-uuid" },
  asset: {
    context: { key: "asset-uuid" },
    meta: {
      inventoryNumber: "10056190",
      description: "Spritzgießwerkzeug",
      supplier: "DAS DRAEXLMAIER"
    }
  },
  location: {
    context: { key: "location-uuid" },
    meta: {
      city: "Braunau",
      country: "AT"
    }
  },
  assignedUser: {
    meta: {
      firstName: "Max",
      lastName: "Mustermann"
    }
  },
  meta: {
    status: "P0",
    comment: "",
    dueDate: "2025-01-15"
  }
}
```

## Workflow

1. **Inventur erstellen** (OEM) → Status I0
2. **Inventur aktivieren** → Status I1
3. **Positionen zuweisen** (Lieferant) → Delegation an Mitarbeiter
4. **Positionen bearbeiten** (Mitarbeiter) → P0 → P2/P3/P4
5. **Kläffälle bearbeiten** → P4 → P2/P3
6. **Inventur abschließen** → Status I3

## UI-Komponenten

### Inventur-Liste
- Filter: Status, Fälligkeit, Standort, Verantwortlicher
- Tabelle: Inventarnummer, Beschreibung, Standort, Status, Verantwortlicher
- Fortschrittsanzeige

### Inventur-Detail
- Header mit Fälligkeit und Fortschritt
- Positions-Tabelle
- Aktionen: Bestätigen, Nicht gefunden, Kommentar
- Delegation an Mitarbeiter

## Referenzen

- `references/api-mapping.md` - Feld-Mapping zur API
- `references/status-workflow.md` - Status-Übergänge
