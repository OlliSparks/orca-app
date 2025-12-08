---
name: prozess-vpw
description: "Vertragspartnerwechsel (VPW) - Prozess zum Wechsel des zuständigen Lieferanten für ein Werkzeug. Trigger: VPW-Features, Lieferantenwechsel, Übergabe."
---

# Prozess: Vertragspartnerwechsel (VPW)

> **Status: Template** - Basis-UI vorhanden, API-Integration ausstehend

## 1. Übersicht

**Was ist der Prozess?**
Ein Werkzeug wird von einem Lieferanten zu einem anderen übertragen. Der abgebende Lieferant muss bestätigen, der aufnehmende Lieferant muss annehmen.

**Wer löst ihn aus?**
- [ ] OEM (BMW)
- [ ] Lieferant (abgebend)
- [ ] Lieferant (aufnehmend)

**Was ist das Ziel?**
Saubere Übergabe der Werkzeugverantwortung zwischen Lieferanten.

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
- [ ] Status-spezifische Aktionen
- [ ] Detail-Ansicht
- [ ] Übergabe-Workflow

## 5. Supplier-Persona Check

```
[ ] Kann der Lieferant das nebenbei erledigen?
[ ] Unterstützt es alle 6 Automatisierungsstufen?
[ ] Kann er Teilaufgaben delegieren?
[ ] Funktioniert es ohne Foto, ohne Barcode?
[ ] Was passiert bei Kommentar?
[ ] Ist der Weg zum One-Click so kurz wie möglich?
```

## 6. Edge Cases & Klärfälle

| Situation | Verhalten |
|-----------|-----------|
| Aufnehmender Lieferant lehnt ab | ? |
| Werkzeug ist in aktiver Inventur | ? |
| Timeout bei Annahme | ? |

## 7. Implementierungs-Status

- [ ] API-Integration
- [x] Listenansicht (Template)
- [ ] Detailansicht
- [x] Filter (Template)
- [ ] Aktionen
- [ ] Workflows
- [ ] Tests

## 8. Code-Referenz

**Hauptdatei:** `js/pages/partnerwechsel.js`
**Klasse:** `PartnerwechselPage`
**Globale Instanz:** `partnerwechselPage`

**TODO:** Datei in `vpw.js` umbenennen?
