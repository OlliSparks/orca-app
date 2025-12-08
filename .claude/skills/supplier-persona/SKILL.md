---
name: supplier-persona
description: "Kontext und Perspektive der Supplier-User (Lieferanten) im Orca Asset-Management-System. Nutze diesen Skill bei jeder Feature-Entwicklung, UI-Entscheidung oder Architektur-Diskussion für Orca 2.0, um sicherzustellen, dass die Lösung aus Sicht der Endanwender funktioniert. Trigger: Feature-Design, UX-Entscheidungen, Workflow-Design, Anforderungsanalyse, Priorisierung."
---

# Supplier-Persona Skill

## Das oberste Prinzip

> **Der Lieferant ist der Schwachpunkt in der Prozesskette – alles muss ihm dienen.**

Nicht weil er unfähig ist, sondern weil:
- Er unter enormem Druck steht (Preis, Qualität, Liefertreue)
- Inventur nicht sein Kerngeschäft ist
- Jede Reibung zum Aufschieben führt

**Das Ziel**: "Auf dem Weg zur Kantine am Werkzeug vorbeigehen und fertig."

## Die 6 Automatisierungsstufen

Jeder Lieferant muss ALLE Wege sehen und wählen können:

| Stufe | Beschreibung | Status |
|-------|--------------|--------|
| 1. Vollautomatisch | API-Anbindung, Zero-Click | Geplant |
| 2. Teilautomatisch | Liste hochladen, Agent matched | Geplant |
| 3. One-Click | Alles bestätigen (Verantwortung Lieferant) | MockUp |
| 4. Listen-Arbeit | Tabellenansicht, Bulk-Aktionen | Vorhanden |
| 5. Einzelaufträge | Werkzeug für Werkzeug | Vorhanden |
| 6. Papier-Workflow | Ausdrucken, prüfen, eintippen | Vorhanden |

**Mischformen erlaubt!** Ein Lieferant kann kombinieren.

## Harte Design-Regeln

1. **Kein Foto-Zwang** – In vielen Werken verboten
2. **Atomare Aufträge** – Ein Werkzeug = Ein Auftrag
3. **Tabelle first** – Überblick vor Details
4. **Alle Wege anbieten** – Vom API bis zum Zettel
5. **Keine Schulung nötig** – Erste Nutzung muss klappen

## Quick-Check für Features

```
[ ] Kann der Lieferant das nebenbei erledigen?
[ ] Unterstützt es alle 6 Automatisierungsstufen?
[ ] Kann er Teilaufgaben delegieren?
[ ] Funktioniert es ohne Foto, ohne Barcode?
[ ] Was passiert bei Kommentar? (-> Klärfall!)
[ ] Ist der Weg zum One-Click so kurz wie möglich?
```

## Referenzdokumente

| Dokument | Inhalt |
|----------|--------|
| [automation-levels.md](references/automation-levels.md) | Die 6 Stufen im Detail |
| [delegation-structure.md](references/delegation-structure.md) | Hauptverantwortlicher, User, Sub-Lieferanten |
| [clarification-cases.md](references/clarification-cases.md) | Klärfälle, Standorte, Zeitrahmen |
| [lessons-learned.md](references/lessons-learned.md) | Was wir aus der Praxis gelernt haben |
| [user-personas.md](references/user-personas.md) | Die verschiedenen User-Typen |
| [workflows.md](references/workflows.md) | Typische Inventur-Abläufe |
| [ux-principles.md](references/ux-principles.md) | UX-Kernanforderungen |
| [industry-context.md](references/industry-context.md) | Makro-Kontext Automobilindustrie |

## Schlüssel-Erkenntnisse

- **Kommentar = Klärfall**: Jeder Freitext-Kommentar erzeugt Klärfall beim OEM
- **Hauptverantwortlicher**: Einer pro Lieferantennummer, verwaltet alles
- **Sub-Lieferanten möglich**: Auch externe Personen können eingeladen werden
- **4 Wochen Frist**: Mit Erinnerungen und Eskalation
- **Standorte beim Lieferanten**: Hauptverantwortlicher pflegt sie selbst
