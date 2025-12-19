# ABL Prozess-Skill

Kontextwissen für die Implementierung des ABL-Prozesses (Abnahmebereitschaftserklärung) im Orca Asset-Management-System.

## Trigger

- ABL-Feature-Entwicklung
- ABL-Workflow-Design
- ABL-API-Integration
- ABL-Agent-Entwicklung

## Prozess-Übersicht

Die **ABL (Abnahmebereitschaftserklärung)** ist ein Prozess zur Dokumentation und Meldung neuer Fertigungsmittel beim OEM. Der Lieferant erklärt, dass ein Werkzeug bereit zur Abnahme ist.

### Zweck

- Formale Meldung eines neuen Werkzeugs an den OEM
- Dokumentation aller relevanten Werkzeugdaten
- Einleitung des Abnahmeprozesses
- Erfassung von Fotos, Maßen und Stammdaten

## Workflow-Schritte

Der ABL-Agent führt den Benutzer durch folgende Schritte:

### 1. Bestellbezug (Header-Daten)

| Schritt | Feld | Required | Beschreibung |
|---------|------|----------|--------------|
| 1 | Lieferant | ✓ | Automatisch aus Login |
| 2 | Auftraggeber (Owner) | - | OEM/Kunde auswählen |
| 3 | Bestellnummer | - | PO-Nummer |
| 4 | WET-Datum | - | Werkzeug-Ersttermin |
| 5 | Projekt | - | Zugehöriges Projekt |
| 6 | Standort | - | Standort des Werkzeugs |
| 7 | Commodity | - | Warengruppe |
| 8 | FEK | - | Fertigungsmittel-Einkäufer |

### 2. Werkzeug-Erfassung (pro Werkzeug)

| Schritt | Feld | Required | Beschreibung |
|---------|------|----------|--------------|
| 9 | Werkzeugnummer | ✓ | 7-10 stellige Inventarnummer |
| 10 | Inventarschild-Foto | - | Foto des Typenschilds |
| 11 | Werkzeug-Foto | - | Foto des gesamten Werkzeugs |
| 12 | Maße & Gewicht | - | Breite, Länge, Höhe (mm), Gewicht (kg) |
| 13 | Material | - | Werkstoff des Werkzeugs |

### 3. Abschluss

| Schritt | Feld | Required | Beschreibung |
|---------|------|----------|--------------|
| 14 | USt-ID & Kommentar | - | Zusätzliche Angaben |
| 15 | Weitere Werkzeuge? | - | Mehrere Werkzeuge pro ABL möglich |
| 16 | Zusammenfassung | ✓ | Übersicht und Absenden |

## Datenstruktur

### ABL Header (ablData)

```javascript
{
    // Bestellbezug
    supplier: string,        // Lieferanten-Name
    supplierKey: string,     // Lieferanten-Key
    owner: string,           // OEM/Auftraggeber
    purchaseOrder: string,   // Bestellnummer
    wet: string,             // WET-Datum (ISO)
    project: string,         // Projekt-Key
    commodity: string,       // Warengruppe
    fek: string,             // FEK-User
    location: string,        // Standort-Name
    locationKey: string,     // Standort-Key

    // Weitere Angaben
    vatId: string,           // USt-ID
    comment: string,         // Kommentar

    // Meta
    createdAt: string,       // Erstellungsdatum (ISO)
    status: string           // 'draft' | 'submitted' | 'approved' | 'rejected'
}
```

### Werkzeug (Tool)

```javascript
{
    number: string,          // Inventarnummer (10-stellig, mit führenden Nullen)
    name: string,            // Werkzeugname (aus API oder manuell)
    inventoryPhoto: string,  // Base64 Foto Inventarschild
    toolPhoto: string,       // Base64 Foto Werkzeug
    width: number,           // Breite in mm
    length: number,          // Länge in mm
    height: number,          // Höhe in mm
    weight: number,          // Gewicht in kg
    material: string         // Material/Werkstoff
}
```

## API-Endpunkte

### Dropdown-Daten laden

```javascript
// OEMs/Auftraggeber
GET /owner?filter=...

// Projekte
GET /project?filter=...

// Warengruppen
GET /commodity?filter=...

// FEK-Benutzer
GET /user?role=FEK

// Alle Benutzer (Empfänger)
GET /user?limit=1000
```

### Company & Standorte

```javascript
// Eigene Company
GET /company/{supplierNumber}

// Standorte der Company
GET /company/{companyKey}/location
```

### Werkzeug validieren

```javascript
// Asset-Suche nach Inventarnummer
GET /asset?filter=identifier:contains:{number}

// Gibt Werkzeugname und weitere Daten zurück
```

## Validierungsregeln

### Werkzeugnummer

```javascript
// Muss 7-10 Ziffern sein
/^\d{7,10}$/

// Wird auf 10 Stellen normalisiert
"1234567" → "0001234567"
```

### Maße

- Breite, Länge, Höhe: positive Ganzzahlen in mm
- Gewicht: positive Zahl in kg
- Alle optional, aber empfohlen

### Fotos

- Format: Base64-String (data:image/...)
- Quelle: Kamera-Aufnahme oder Datei-Upload
- Empfohlen: Inventarschild + Werkzeugfoto

## UI-Komponenten

### Chat-Interface

Der ABL-Agent nutzt ein Chat-Interface mit:
- Assistent-Nachrichten (links, blau)
- Benutzer-Nachrichten (rechts, grau)
- Dynamische Input-Felder je nach Schritt
- Skip-Buttons für optionale Felder

### Progress-Bar

```html
<div class="abl-progress-bar">
    <div class="progress-fill" style="width: ${percent}%"></div>
    <span class="progress-text">Schritt ${current} von ${total}</span>
</div>
```

### Werkzeug-Zähler

```html
<div class="abl-tools-count">
    <span class="tools-badge">${count} Werkzeuge</span>
</div>
```

### Zusammenfassung

- Alle Header-Daten aufgelistet
- Werkzeug-Tabelle mit Fotos
- Bearbeiten-Buttons pro Sektion
- Absenden-Button (nur bei vollständigen Pflichtfeldern)

## Besonderheiten

### Mehrere Werkzeuge pro ABL

- Nach jedem Werkzeug: "Weiteres Werkzeug hinzufügen?"
- Alle Werkzeuge teilen die Header-Daten
- Werkzeug-Zähler zeigt aktuelle Anzahl

### Edit-Modus

- ABL kann nachträglich bearbeitet werden
- Query-Parameter: `?edit={ablId}`
- Lädt existierende Daten und ermöglicht Änderungen

### Lokale Speicherung

- Entwürfe werden im localStorage gespeichert
- Key: `orca_abl_draft_{id}`
- Ermöglicht Weiterarbeit bei Unterbrechung

## Status-Codes

| Status | Bedeutung |
|--------|-----------|
| `draft` | Entwurf, noch nicht eingereicht |
| `submitted` | Eingereicht, wartet auf Prüfung |
| `approved` | Vom OEM genehmigt |
| `rejected` | Vom OEM abgelehnt |

## Referenzen

- `js/pages/agent-abl.js` - Agent-Implementierung (~1200 Zeilen)
- `js/pages/abl.js` - ABL-Übersichtsseite
- `js/pages/abl-detail.js` - ABL-Detailseite
