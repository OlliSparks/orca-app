---
name: prozess-abl
description: "ABL (Abnahmebereitschaft) - Prozess zur Meldung der Abnahmebereitschaft für Werkzeuge. Trigger: ABL-Features, Abnahme, Bereitschaftsmeldung."
---

# Prozess: ABL (Abnahmebereitschaft)

> **Status: Template** - Basis-UI vorhanden, API-Integration ausstehend

## 1. Übersicht

**Was ist der Prozess?**
Der Lieferant meldet, dass ein Werkzeug zur Abnahme bereit ist.

**Wer löst ihn aus?**
- [ ] OEM (BMW)
- [x] Lieferant

**Was ist das Ziel?**
Signalisierung an OEM, dass ein Werkzeug abgenommen werden kann.

## 2. Status-Maschine

| Status | Code | Bedeutung | Nächste Status |
|--------|------|-----------|----------------|
| ? | ? | ? | ? |

**TODO:** Status-Codes aus API-Spec ermitteln

## 3. API-Integration

### Endpunkte
| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| ? | ? | ? |

**TODO:** Endpunkte aus OpenAPI-Spec identifizieren

## 4. UI-Anforderungen

### Aktuell implementiert (Template)
- [x] Listenansicht mit Tabelle
- [x] Filter: Alle, Offen, Feinplanung, in Bearbeitung
- [x] Suche
- [x] Export-Button
- [ ] Echte API-Daten
- [ ] Aktionen

### Noch zu implementieren
- [ ] ABL-Meldung
- [ ] Status-Tracking
- [ ] Bestätigung durch OEM

## 5. Supplier-Persona Check

```
[ ] Kann der Lieferant das nebenbei erledigen?
[ ] Unterstützt es alle 6 Automatisierungsstufen?
[ ] Kann er Teilaufgaben delegieren?
[ ] Funktioniert es ohne Foto, ohne Barcode?
[ ] Was passiert bei Kommentar?
[ ] Ist der Weg zum One-Click so kurz wie möglich?
```

## 6. Implementierungs-Status

- [ ] API-Integration
- [x] Listenansicht (Template)
- [ ] Detailansicht
- [x] Filter (Template)
- [ ] Aktionen
- [ ] Workflows
- [ ] Tests

## 7. Code-Referenz

**Hauptdatei:** `js/pages/abl.js`
**Klasse:** `ABLPage`
**Globale Instanz:** `ablPage`
