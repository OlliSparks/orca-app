---
name: prozess-planung
description: "Planungs-Prozess für anstehende Inventuren. Übersicht über Fälligkeiten und Terminplanung. Trigger: Planung-Features, Terminübersicht, Vorausschau."
---

# Prozess: Planung

> **Status: Teilweise** - Fortschritts-Widget vorhanden, weitere Features ausstehend

## 1. Übersicht

**Was ist der Prozess?**
Übersicht über alle anstehenden Inventuren mit Fälligkeitsdaten. Ermöglicht dem Lieferanten, vorausschauend zu planen.

**Wer löst ihn aus?**
- [ ] OEM (automatisch basierend auf Fälligkeiten)
- [x] Lieferant (aktive Nutzung)

**Was ist das Ziel?**
Proaktive Planung der Inventur-Arbeiten, keine Überraschungen.

## 2. Besonderheiten

Im Gegensatz zu anderen Prozessen ist Planung kein transaktionaler Workflow, sondern eine **Übersichts- und Planungsfunktion**.

### Kernfunktionen
- Vorausschau auf kommende Fälligkeiten (6 Monate)
- Fortschritts-Visualisierung
- Gruppierung nach Zeiträumen

## 3. UI-Anforderungen

### Aktuell implementiert
- [x] Fortschritts-Widget (Tacho) für 6-Monats-Vorschau
- [x] Status-Segmente (in Inventur, Feinplanung, Offen)
- [x] Basis-Tabellenstruktur

### Noch zu implementieren
- [ ] Kalender-Ansicht
- [ ] Grupierung nach Woche/Monat
- [ ] Erinnerungs-Funktion
- [ ] Export für Planung

## 4. Supplier-Persona Check

```
[ ] Kann der Lieferant das nebenbei erledigen?
    → Planung sollte schnellen Überblick geben
[ ] Unterstützt es alle 6 Automatisierungsstufen?
    → N/A für Planungsansicht
[ ] Kann er Teilaufgaben delegieren?
    → Aus Planung heraus Delegation starten?
[ ] Funktioniert es ohne Foto, ohne Barcode?
    → Ja, reine Übersicht
[ ] Was passiert bei Kommentar?
    → N/A
[ ] Ist der Weg zum One-Click so kurz wie möglich?
    → Schneller Sprung in Inventur-Liste möglich?
```

## 5. Implementierungs-Status

- [ ] Vollständige API-Integration
- [x] Fortschritts-Widget
- [ ] Kalender-Ansicht
- [ ] Gruppierung
- [ ] Filter nach Zeitraum
- [ ] Direkt-Links zu Inventur

## 6. Code-Referenz

**Hauptdatei:** `js/pages/planung.js`
**Klasse:** `PlanungPage`
**Globale Instanz:** `planungPage`
