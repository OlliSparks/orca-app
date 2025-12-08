---
name: ux-audit
description: "UX-Audit und Usability-Pruefung fuer alle Prozesse und Features. Nutze diesen Skill bei jedem Feature-Review, vor Releases und bei UX-Entscheidungen. Ziel: Die App so einfach machen, dass Lieferanten sie als einzige Werkzeug-Management-Loesung nutzen wollen. Trigger: Feature-Review, UI-Pruefung, Release-Vorbereitung, UX-Entscheidungen."
---

# UX-Audit Skill

> **Ziel:** Die App so einfach und angenehm machen, dass Lieferanten sie als ihre einzige Werkzeug-Management-Loesung nutzen wollen.

## Das UX-Versprechen

```
"Auf dem Weg zur Kantine am Werkzeug vorbeigehen und fertig."
```

Jedes Feature muss diesem Anspruch genuegen. Wenn ein Lieferant nachdenken muss, haben wir verloren.

## Die 10 UX-Gebote fuer orca

### 1. Null Lernkurve
- Erste Nutzung muss ohne Anleitung klappen
- Buttons sagen, was sie tun
- Keine versteckten Funktionen

### 2. Minimale Klicks
- Jeder Klick ist ein Hindernis
- One-Click wo immer moeglich
- Bulk-Aktionen fuer Wiederholungen

### 3. Sofortiges Feedback
- Jede Aktion zeigt sofort Ergebnis
- Lade-Zustaende sind sichtbar
- Erfolg/Fehler klar erkennbar

### 4. Fehlerverzeihend
- Rueckgaengig immer moeglich
- Keine destruktiven Aktionen ohne Bestaetigung
- Hilfreiche Fehlermeldungen

### 5. Mobile First
- Touch-freundliche Buttons (min. 44px)
- Keine Hover-abhaengigen Features
- Funktioniert auch mit Handschuhen

### 6. Offline-faehig (mental)
- Kein permanentes Internet noetig
- Warteschlangen-Konzept fuer Aktionen
- Sync-Status sichtbar

### 7. Kontext-bewusst
- Zeige nur relevante Optionen
- Erinnere an letzte Auswahl
- Intelligente Defaults

### 8. Fortschritt sichtbar
- Wie viel ist erledigt?
- Wie viel fehlt noch?
- Motivation durch Visualisierung

### 9. Keine Sackgassen
- Von ueberall zurueck
- Keine modalen Blocker
- Immer ein Ausweg

### 10. Respektiere die Zeit
- Schnelle Ladezeiten (< 2s)
- Keine unnoetige Wartezeit
- Batch statt Einzelaktion

---

## Audit-Checklisten

### Checkliste: Neues Feature

```
GRUNDLAGEN
[ ] Funktioniert ohne Erklaerung
[ ] Maximal 3 Klicks zum Ziel
[ ] Rueckgaengig moeglich
[ ] Funktioniert auf Mobile

VISUELL
[ ] Konsistent mit bestehendem Design
[ ] Ausreichend Kontrast
[ ] Icons sind selbsterklaerend
[ ] Touch-Targets >= 44px

FEEDBACK
[ ] Lade-Zustand sichtbar
[ ] Erfolg bestaetigt
[ ] Fehler erklaert Loesung
[ ] Fortschritt sichtbar

EDGE CASES
[ ] Leerer Zustand behandelt
[ ] Fehlerfall behandelt
[ ] Timeout behandelt
[ ] Offline-Verhalten definiert
```

### Checkliste: Listenansicht

```
NAVIGATION
[ ] Filter sichtbar und verstaendlich
[ ] Aktiver Filter hervorgehoben
[ ] Anzahl der Ergebnisse sichtbar
[ ] Sortierung moeglich
[ ] Suche vorhanden

INTERAKTION
[ ] Zeilen klickbar (Detail)
[ ] Bulk-Auswahl moeglich
[ ] Aktionen pro Zeile sichtbar
[ ] Pagination oder Infinite Scroll

PERFORMANCE
[ ] Initiales Laden < 2s
[ ] Filter-Wechsel < 500ms
[ ] Keine Ruckler beim Scrollen
```

### Checkliste: Formular/Modal

```
EINGABE
[ ] Labels ueber/neben Feldern
[ ] Pflichtfelder markiert
[ ] Tastatur-Typ passend (numerisch, email, etc.)
[ ] Autofocus auf erstes Feld

VALIDIERUNG
[ ] Validierung waehrend Eingabe
[ ] Fehler direkt am Feld
[ ] Positives Feedback bei Korrektur
[ ] Submit nur bei validen Daten

ABSCHLUSS
[ ] Primaer-Aktion hervorgehoben
[ ] Abbrechen immer moeglich
[ ] ESC schliesst Modal
[ ] Klick ausserhalb schliesst Modal
```

### Checkliste: Prozess-Workflow

```
ORIENTIERUNG
[ ] Aktueller Schritt klar
[ ] Verbleibende Schritte sichtbar
[ ] Fortschrittsbalken vorhanden
[ ] Zurueck moeglich

AKTIONEN
[ ] Naechster Schritt offensichtlich
[ ] Buttons beschreiben Aktion
[ ] Keine mehrdeutigen Optionen
[ ] Bulk-Option fuer Wiederholungen

ABSCHLUSS
[ ] Erfolg klar bestaetigt
[ ] Zusammenfassung angezeigt
[ ] Naechste Schritte empfohlen
```

---

## UX-Scoring

### Bewertungsmatrix

| Kriterium | Gewicht | Score 1-5 |
|-----------|---------|-----------|
| Lernkurve | 20% | |
| Effizienz (Klicks) | 20% | |
| Fehlertoleranz | 15% | |
| Mobile Nutzung | 15% | |
| Feedback/Fortschritt | 15% | |
| Konsistenz | 15% | |
| **Gesamt** | 100% | |

### Score-Bedeutung

| Score | Bedeutung | Aktion |
|-------|-----------|--------|
| 4.5-5.0 | Exzellent | Release-ready |
| 4.0-4.4 | Gut | Minor Improvements |
| 3.0-3.9 | Akzeptabel | Verbesserungen vor Release |
| 2.0-2.9 | Problematisch | Rework erforderlich |
| < 2.0 | Kritisch | Nicht releasen |

---

## Schnell-Audit: 5-Sekunden-Test

Zeige einem Nicht-Nutzer die Seite fuer 5 Sekunden, dann frage:

1. Was ist das Hauptziel dieser Seite?
2. Was wuerdest du als erstes klicken?
3. Wie viele Werkzeuge sind noch offen?

**Bestanden:** Alle 3 Fragen richtig beantwortet.

---

## Anti-Patterns (Was wir NICHT wollen)

| Anti-Pattern | Problem | Loesung |
|--------------|---------|---------|
| Hidden Actions | User findet Funktion nicht | Sichtbare Buttons |
| Confirmation Fatigue | Zu viele "Sind Sie sicher?" | Rueckgaengig statt Bestaetigung |
| Modal Hell | Modal oeffnet Modal | Flache Navigation |
| Mystery Icons | Unklare Symbole | Text + Icon |
| Infinite Loading | Keine Rueckmeldung | Skeleton + Timeout |
| Form Dump | Alle Felder auf einmal | Progressive Disclosure |
| Dead Ends | Kein Weg zurueck | Immer Navigation zeigen |

---

## Integration mit anderen Skills

### Mit Supplier-Persona
- Jede UX-Entscheidung gegen Persona-Checks pruefen
- "Kann das der Lieferant nebenbei erledigen?"

### Mit Prozess-Skills
- Jeder Prozess durchlaeuft UX-Audit vor Release
- Audit-Ergebnisse in Prozess-Skill dokumentieren

---

## Audit-Protokoll Template

```markdown
## UX-Audit: [Feature/Prozess]

**Datum:** YYYY-MM-DD
**Auditor:** [Name]

### Geprueft
- [ ] Checkliste: Neues Feature
- [ ] Checkliste: [relevante weitere]

### Score
| Kriterium | Score |
|-----------|-------|
| Lernkurve | /5 |
| Effizienz | /5 |
| Fehlertoleranz | /5 |
| Mobile | /5 |
| Feedback | /5 |
| Konsistenz | /5 |
| **Gesamt** | /5 |

### Findings
1. [Beschreibung] - Prioritaet: Hoch/Mittel/Niedrig

### Empfehlung
[ ] Release-ready
[ ] Minor Fixes, dann Release
[ ] Rework erforderlich
```
