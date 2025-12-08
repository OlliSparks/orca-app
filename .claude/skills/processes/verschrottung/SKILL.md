---
name: prozess-verschrottung
description: "Verschrottungs-Prozess für ausgemusterte Werkzeuge. Trigger: Verschrottungs-Features, Werkzeug-Ausmusterung, Entsorgung."
---

# Prozess: Verschrottung

> **Status: Template** - Basis-UI vorhanden, API-Integration ausstehend

## 1. Übersicht

**Was ist der Prozess?**
Ein Werkzeug wird aus dem aktiven Bestand entfernt und zur Verschrottung freigegeben.

**Wer löst ihn aus?**
- [ ] OEM (BMW)
- [ ] Lieferant

**Was ist das Ziel?**
Dokumentierte Ausmusterung von Werkzeugen aus dem Asset-Management.

## 2. Status-Maschine

| Status | Code | Bedeutung | Nächste Status |
|--------|------|-----------|----------------|
| ? | ? | ? | ? |

**TODO:** Status-Codes aus API-Spec ermitteln

## 3. API-Integration

### Endpunkte
| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| ? | `/scrapping/*` ? | ? |

**TODO:** Endpunkte aus OpenAPI-Spec identifizieren (Scrapping-Bereich)

## 4. UI-Anforderungen

### Aktuell implementiert (Template)
- [x] Listenansicht mit Tabelle
- [x] Filter: Alle, Offen, Feinplanung, in Bearbeitung
- [x] Suche
- [x] Export-Button
- [ ] Echte API-Daten
- [ ] Aktionen

### Noch zu implementieren
- [ ] Verschrottungs-Workflow
- [ ] Nachweis/Dokumentation
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

**Hauptdatei:** `js/pages/verschrottung.js`
**Klasse:** `VerschrottungPage`
**Globale Instanz:** `verschrottungPage`
