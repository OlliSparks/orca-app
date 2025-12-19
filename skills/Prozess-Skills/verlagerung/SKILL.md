# Verlagerung Prozess-Skill

Kontextwissen für die Implementierung des Verlagerungs-Prozesses im Orca Asset-Management-System.

## Trigger

- Verlagerung-Feature-Entwicklung
- Verlagerung-Workflow-Design
- Verlagerung-API-Integration
- Verlagerung-Agent-Entwicklung

## Prozess-Übersicht

Die **Verlagerung** ist ein Prozess zum Transport von Fertigungsmitteln zwischen Standorten (auch länderübergreifend). Der Prozess gliedert sich in zwei Phasen:

1. **Beantragen** - Verlagerungsantrag erstellen
2. **Durchführen** - Genehmigte Verlagerung dokumentieren

### Prozess-Typen

- `RELOCATION` - Hauptprozess Verlagerung
- `RELOCATION.C` - Unterprozess (Child) mit Detail-Daten
- `RELOCATION.A` - Unterprozess (Alternative)

### Wichtig: Datenstruktur

- **Hauptprozess (RELOCATION)**: Enthält Basis-Daten (description, contractPartner, status)
- **Unterprozess (RELOCATION.C)**: Enthält Detail-Felder (`relo.*`)
- Die `relo.*` Felder sind NUR in Unterprozessen verfügbar!

## Phase 1: Verlagerung beantragen

### Workflow-Schritte

| Schritt | Name | Beschreibung |
|---------|------|--------------|
| 1 | Begrüßung | Einführung in den Prozess |
| 2 | Werkzeug auswählen | Asset aus Liste wählen oder suchen |
| 3 | Maße erfassen | Breite, Höhe, Länge, Gewicht, Zolltarifnr. |
| 4 | Weitere Werkzeuge? | Mehrere Assets pro Verlagerung möglich |
| 5 | Bezeichnung | Beschreibender Name für die Verlagerung |
| 6 | Ziel-Unternehmen | Empfangendes Unternehmen wählen |
| 7 | Ziel-Standort | Standort beim Ziel-Unternehmen |
| 8 | Abschlussdatum | Geplantes Datum der Verlagerung |
| 9 | Kommentar | Optionaler Kommentar |
| 10 | Zusammenfassung | Übersicht und Absenden |

### Datenstruktur (Beantragen)

```javascript
verlagerungData = {
    // Bezeichnung
    bezeichnung: string,

    // Quelle (automatisch aus Werkzeug)
    quellUnternehmen: string,
    quellUnternehmenKey: string,
    quellLand: string,
    quellStadt: string,
    quellStandort: string,
    quellStandortKey: string,

    // Ziel
    zielUnternehmen: string,
    zielUnternehmenKey: string,
    zielStandort: string,
    zielStandortKey: string,

    // Termin
    abschlussDatum: string,    // ISO-Datum
    kommentar: string,

    // Meta
    createdAt: string,
    status: 'draft' | 'submitted'
}
```

### Werkzeug-Daten

```javascript
tool = {
    assetKey: string,        // Asset-UUID
    identifier: string,      // Inventarnummer
    name: string,            // Werkzeugname
    location: string,        // Aktueller Standort
    locationKey: string,
    
    // Maße (für Zoll/Transport)
    width: number,           // Breite in mm
    height: number,          // Höhe in mm
    length: number,          // Länge in mm
    weight: number,          // Gewicht in kg
    zollnummer: string       // Zolltarifnummer
}
```

## Phase 2: Verlagerung durchführen

### Workflow-Schritte

| Schritt | Name | Beschreibung |
|---------|------|--------------|
| 1 | Begrüßung | Anzeige der Verlagerungsdaten |
| 2 | Versanddatum | Tatsächliches Versanddatum |
| 3 | Spedition | Name der Spedition |
| 4 | Tracking-Nr. | Sendungsverfolgungsnummer |
| 5 | Zolldokumente | Upload von Zoll-PDFs (bei Länderüberschreitung) |
| 6 | Ankunftsdatum | Tatsächliches Ankunftsdatum |
| 7 | Empfänger | Name des Empfängers |
| 8 | Empfangsfoto | Foto als Nachweis |
| 9 | Zusammenfassung | Übersicht und Abschließen |

### Datenstruktur (Durchführen)

```javascript
durchfuehrungData = {
    // Transport
    versandDatum: string,    // ISO-Datum
    spedition: string,       // Speditionsname
    trackingNr: string,      // Tracking-Nummer

    // Zoll (bei länderübergreifend)
    zollDokumente: [{
        name: string,
        data: string         // Base64-PDF
    }],

    // Empfang
    ankunftDatum: string,    // ISO-Datum
    empfaenger: string,      // Name
    empfangsFoto: string     // Base64-Bild
}
```

## API-Endpunkte

### Prozess-Liste

```
GET /process?limit=1000&skip=0
```

### Prozess-Details

```
GET /process/{key}
```

### Prozess-Positionen

```
GET /process/{key}/positions?limit=100&skip=0
```

### Audit-Check (Länderübergreifend)

```
POST /utils/audit
Body: { fromCountry: "AT", toCountry: "DE" }
```

### Assets laden

```
GET /asset?filter=contractPartner:eq:{supplierId}&limit=500
```

### Unternehmen & Standorte

```
GET /company?limit=1000
GET /company/{key}/location
```

## Status-Codes

| Code | Bedeutung | Phase |
|------|-----------|-------|
| `I` | Initialisiert/Entwurf | Beantragen |
| `O` | Offen/Beantragt | Beantragen |
| `P` | In Bearbeitung | Durchführen |
| `C` | Completed/Transport | Durchführen |
| `D` | Done/Abgeschlossen | Abgeschlossen |

## Feld-Mapping (API → UI)

| UI-Feld | API-Feld (Unterprozess) |
|---------|-------------------------|
| Identifier | `relo.identifier` |
| Ausgangsort | `relo.from.address` |
| Zielstandort | `relo.to.address` |
| Verladetermin | `relo.departure` |
| Ankunftstermin | `relo.arrival` |
| Vertragspartner | `contractPartnerName` |
| Ersteller | `relo.creatorName` |

## UI-Komponenten

### Verlagerungs-Seite (3 Tabs)

1. **Beantragt** - Neue Anträge, warten auf Genehmigung
2. **Durchführung** - Genehmigte, in Bearbeitung
3. **Abgeschlossen** - Fertige Verlagerungen

### Agent-Cards

- 🚚 **Verlagerung beantragen** → `/agent-verlagerung-beantragen`
- 📦 **Verlagerung durchführen** → `/agent-verlagerung-durchfuehren`

## Besonderheiten

### Zollprüfung

Bei länderübergreifenden Verlagerungen:
1. Audit-Endpoint aufrufen
2. Falls Zoll erforderlich: Dokument-Upload-Schritt
3. Unterstützte Formate: PDF

### Quellstandort-Übernahme

- Quellstandort wird automatisch aus dem ersten Werkzeug übernommen
- Alle Werkzeuge müssen vom gleichen Standort kommen

### Mehrere Werkzeuge

- Pro Verlagerung können mehrere Werkzeuge hinzugefügt werden
- Alle Werkzeuge werden als Positionen zum Prozess hinzugefügt

## Referenzen

- `js/pages/agent-verlagerung-beantragen.js` - Beantragen-Agent (~1300 Zeilen)
- `js/pages/agent-verlagerung-durchfuehren.js` - Durchführen-Agent (~900 Zeilen)
- `js/pages/verlagerung.js` - Übersichtsseite mit Tabs
- `js/pages/verlagerung-detail.js` - Detail-Ansicht
