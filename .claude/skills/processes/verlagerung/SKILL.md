---
name: prozess-verlagerung
description: "Verlagerungs-Prozess für Werkzeuge zwischen Standorten. Trigger: Verlagerungs-Features, Standortwechsel, Umzug."
---

# Prozess: Verlagerung

> **Status: Template** - Basis-UI vorhanden, API-Integration ausstehend

## 1. Übersicht

**Was ist der Prozess?**
Ein Werkzeug wird von einem Standort zu einem anderen verlagert. Der Lieferant dokumentiert den physischen Umzug.

**Wer löst ihn aus?**
- [ ] OEM (BMW)
- [ ] Lieferant

**Was ist das Ziel?**
Dokumentierte Standortänderung von Werkzeugen.

## 2. Status-Maschine

| Status | Code | Bedeutung | Nächste Status |
|--------|------|-----------|----------------|
| ? | ? | ? | ? |

**TODO:** Status-Codes aus API-Spec ermitteln

## 3. API-Integration

### Endpunkte
| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| ? | `/relocation/*` ? | ? |

**TODO:** Endpunkte aus OpenAPI-Spec identifizieren (Relocation-Bereich)

## 4. UI-Anforderungen

### Aktuell implementiert (Template)
- [x] Listenansicht mit Tabelle
- [x] Filter: Alle, Offen, Feinplanung, in Bearbeitung
- [x] Suche
- [x] Export-Button
- [ ] Echte API-Daten
- [ ] Aktionen

### Noch zu implementieren
- [ ] Standort-Auswahl
- [ ] Verlagerungs-Workflow
- [ ] Bestätigung

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

**Hauptdatei:** `js/pages/verlagerung.js`
**Klasse:** `VerlagerungPage`
**Globale Instanz:** `verlagerungPage`
