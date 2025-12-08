---
name: prozess-[name]
description: "[Kurzbeschreibung]"
---

# Prozess: [Name]

## 1. Übersicht

**Was ist der Prozess?**
[Beschreibung]

**Wer löst ihn aus?**
- [ ] OEM (BMW)
- [ ] Lieferant

**Was ist das Ziel?**
[Ziel]

## 2. Status-Maschine

| Status | Code | Bedeutung | Nächste Status |
|--------|------|-----------|----------------|
| | | | |

### Status-Übergänge
```
[Status A] → [Aktion] → [Status B]
```

## 3. API-Integration

### Endpunkte
| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| | | |

### Request/Response Beispiel
```json
// Request
{}

// Response
{}
```

### Batch-Operationen
- [ ] Verfügbar: [Endpunkt]

## 4. UI-Anforderungen

### Listenansicht
**Spalten:**
- [ ] Werkzeugnummer
- [ ] Name
- [ ] ...

**Filter:**
- [ ] Status
- [ ] ...

**Sortierung:**
- [ ] Nach Spalte X

### Detailansicht
- [ ] [Was muss angezeigt werden?]

### Aktionen
- [ ] [Button/Workflow]

## 5. Supplier-Persona Check

```
[ ] Kann der Lieferant das nebenbei erledigen?
[ ] Unterstützt es alle 6 Automatisierungsstufen?
[ ] Kann er Teilaufgaben delegieren?
[ ] Funktioniert es ohne Foto, ohne Barcode?
[ ] Was passiert bei Kommentar? (-> Klärfall!)
[ ] Ist der Weg zum One-Click so kurz wie möglich?
```

## 6. Edge Cases & Klärfälle

| Situation | Verhalten |
|-----------|-----------|
| | |

## 7. Implementierungs-Status

- [ ] API-Integration
- [ ] Listenansicht
- [ ] Detailansicht
- [ ] Filter
- [ ] Aktionen
- [ ] Batch-Operationen
- [ ] Tests
