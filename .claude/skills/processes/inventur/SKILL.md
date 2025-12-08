---
name: prozess-inventur
description: "Inventur-Prozess für Werkzeuge. Der Kernprozess der Lieferanten-App. OEM sendet Inventuraufträge, Lieferant bestätigt/meldet Werkzeuge. Trigger: Inventur-Features, Positions-Bearbeitung, Rückmeldung an OEM."
---

# Prozess: Inventur

> **Referenz-Implementierung** - Dieser Skill dokumentiert den vollständig implementierten Inventur-Prozess als Vorlage für andere Prozesse.

## 1. Übersicht

**Was ist der Prozess?**
Der OEM (BMW) sendet Inventuraufträge an Lieferanten. Jeder Auftrag enthält Positionen (Werkzeuge), die der Lieferant prüfen und zurückmelden muss.

**Wer löst ihn aus?**
- [x] OEM (BMW) - Erstellt und versendet Inventur
- [ ] Lieferant - Reagiert nur

**Was ist das Ziel?**
Bestätigung des Werkzeugbestands beim Lieferanten. Der Lieferant meldet für jedes Werkzeug: vorhanden, verschoben, oder fehlend.

## 2. Status-Maschine

### Inventur-Status (Kopfdaten)
| Status | Code | Bedeutung |
|--------|------|-----------|
| Neu/Entwurf | I0 | Inventur erstellt, noch nicht versendet |
| Versendet | I1 | An Lieferant gesendet |
| Gemeldet | I2 | Lieferant hat zurückgemeldet |
| Genehmigt | I3 | OEM hat genehmigt |
| Abgeschlossen | I4 | Prozess beendet |

### Position-Status (Einzelwerkzeug)
| Status | Code | Bedeutung |
|--------|------|-----------|
| Ohne Inventur | P0 | Noch keiner Inventur zugeordnet |
| Ohne Akzeptanz | P1 | In Inventur, noch nicht bearbeitet |
| Gefunden, keine Vorfälle | P2 | Bestätigt, alles OK |
| Gefunden, mit Vorfällen | P3 | Bestätigt, aber mit Kommentar |
| Anderer Standort, keine Vorfälle | P4 | Verschoben, alles OK |
| Anderer Standort, mit Vorfällen | P5 | Verschoben, mit Kommentar |
| Nicht gefunden | P6 | Werkzeug fehlt |

### UI-Status (Frontend)
| Status | Bedeutung | Farbe |
|--------|-----------|-------|
| pending | Noch nicht bearbeitet | Grau |
| confirmed | Bestätigt (P2/P3) | Grün |
| relocated | Verschoben (P4/P5) | Blau |
| missing | Nicht gefunden (P6) | Rot |

### Status-Übergänge
```
pending → [Bestätigen] → confirmed (P2)
pending → [Bestätigen + Kommentar] → confirmed (P3)
pending → [Verschoben] → relocated (P4/P5)
pending → [Nicht vorhanden] → missing (P6)
confirmed/relocated/missing → [Rückgängig] → pending
```

## 3. API-Integration

### Endpunkte
| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/inventory-list` | Alle Inventuren des Lieferanten |
| GET | `/inventory/{key}` | Inventur-Details |
| GET | `/inventory/{key}/positions` | Positionen einer Inventur |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/report` | Position melden |
| PATCH | `/inventory/{key}/{positionKey}/{revision}/accept` | Position akzeptieren |
| POST | `/inventory/{key}/actions/report` | Inventur als gemeldet markieren |
| POST | `/inventory/batch/accept` | Batch-Accept |

### Datenfluss (implementiert)
```javascript
// 1. Inventur-Liste laden
const inventoryResponse = await api.getInventoryList();

// 2. Für jede Inventur: Positionen laden
for (const inventory of inventoryResponse.data) {
    const positions = await api.getInventoryPositions(inventory.inventoryKey);
    // Positionen mit Inventur-Kontext anreichern
}

// 3. Benutzerliste für Delegation laden
const companyUsers = await api.getCompanyUsers(companyKey);
```

### Batch-Operationen
- [x] Verfügbar: `POST /inventory/batch/accept`
- [x] UI: "Alle gefilterten Werkzeuge bestätigen"

## 4. UI-Anforderungen

### Fortschritts-Widget (Tacho)
- Prozent der bearbeiteten Werkzeuge
- Visueller Halbkreis-Fortschrittsbalken
- Erfolgsmeldung bei 100%

### Listenansicht (Tabelle)
**Spalten:**
- [x] Werkzeugnummer (Link zu Detail)
- [x] Werkzeugname
- [x] Standort (mit Pfeil bei Verschiebung)
- [x] Verantwortlicher (klickbar für Delegation)
- [x] Fälligkeitsdatum (rot wenn überfällig)
- [x] Letzte Änderung
- [x] Status (Badge)
- [x] Kommentar (Eingabefeld)
- [x] Aktionen

**Filter:**
- [x] Status: Alle, Offen, Bestätigt, Verschoben, Überfällig
- [x] Standort (Modal)
- [x] Verantwortlicher (Modal)

**Sortierung:**
- [x] Alle Spalten sortierbar (asc/desc)

### Kartenansicht
- [x] Responsive Karten mit 3 Blöcken: Info, Status, Aktionen
- [x] Gleiche Informationen wie Tabelle
- [x] Touch-freundliche Buttons

### Aktionen pro Werkzeug
| Aktion | Button | Modal | Status danach |
|--------|--------|-------|---------------|
| Bestätigen | ✓ | Nein | confirmed |
| Verschoben | 📍 | Standort-Auswahl | relocated |
| Foto | 📷 | Upload | (kein Statuswechsel) |
| Nicht vorhanden | 🚫 | Grund eingeben | missing |
| Rückgängig | ↶ | Nein | pending |

### Delegation
- [x] Klick auf Verantwortlichen öffnet Modal
- [x] Dropdown mit Benutzern aus Company-API
- [x] Oder: Freitext-Eingabe für neuen Namen

### Submit-Workflow
- [x] Submit-Bar am unteren Bildschirmrand
- [x] Zeigt Anzahl bearbeiteter Werkzeuge
- [x] Button "Inventur einreichen"
- [x] Bestätigungs-Modal mit Zusammenfassung

## 5. Supplier-Persona Check

```
[x] Kann der Lieferant das nebenbei erledigen?
    → Ja: Card-View für schnelles Durchgehen, Bulk-Bestätigung
[x] Unterstützt es alle 6 Automatisierungsstufen?
    → Stufen 4-6 implementiert, Stufen 1-3 geplant
[x] Kann er Teilaufgaben delegieren?
    → Ja: Delegation an andere Benutzer möglich
[x] Funktioniert es ohne Foto, ohne Barcode?
    → Ja: Foto ist optional, Bestätigung ohne Foto möglich
[x] Was passiert bei Kommentar?
    → Kommentar führt zu P3/P5 statt P2/P4 (mit Vorfällen)
[x] Ist der Weg zum One-Click so kurz wie möglich?
    → "Alle bestätigen" Button prominent platziert
```

## 6. Edge Cases & Klärfälle

| Situation | Verhalten |
|-----------|-----------|
| Kommentar eingegeben | Status wird P3/P5 statt P2/P4 → Klärfall beim OEM |
| Werkzeug nicht am Standort | Modal für neuen Standort, Status "relocated" |
| Werkzeug komplett fehlt | Modal für Grund, Status "missing" |
| Fälligkeitsdatum überschritten | Rote Markierung, Filter "Überfällig" |
| Kein Verantwortlicher zugewiesen | Anzeige "Nicht zugewiesen", Delegation möglich |

## 7. Implementierungs-Status

- [x] API-Integration (GET inventory-list, positions)
- [x] Listenansicht (Tabelle)
- [x] Kartenansicht
- [x] Status-Filter
- [x] Standort-Filter
- [x] Verantwortlichen-Filter
- [x] Alle Einzelaktionen (confirm, relocate, missing, photo)
- [x] Bulk-Bestätigung
- [x] Delegation
- [x] Submit-Workflow
- [ ] API-Rückmeldung (PATCH report) - UI vorhanden, API-Call TODO
- [ ] Batch-API-Integration
- [ ] Foto-Upload an Backend

## 8. Code-Referenz

**Hauptdatei:** `js/pages/inventur.js`
**Klasse:** `InventurPage`
**Globale Instanz:** `inventurPage`

### Wichtige Methoden
| Methode | Zweck |
|---------|-------|
| `loadData()` | Lädt Inventuren und Positionen |
| `getFilteredTools()` | Wendet alle Filter an |
| `confirmTool(id)` | Einzelbestätigung |
| `confirmAllFiltered()` | Bulk-Bestätigung |
| `delegateTool(id)` | Öffnet Delegations-Modal |
| `submitInventory()` | Startet Submit-Workflow |
