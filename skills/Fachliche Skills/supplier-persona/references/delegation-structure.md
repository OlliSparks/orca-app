# Delegation und Verantwortlichkeiten

## Hierarchie

```
┌─────────────────────────────────────────────────────────────────┐
│  OEM (z.B. BMW)                                                 │
│  └─ Facheinkäufer                                               │
│     - Initiiert Inventur                                        │
│     - Prüft Klärfälle                                           │
│     - Akzeptiert/lehnt ab                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LIEFERANT                                                      │
│  └─ Hauptverantwortlicher (pro Lieferantennummer)               │
│     - Pflegt Standorte                                          │
│     - Verwaltet User                                            │
│     - Kann alles delegieren                                     │
│     │                                                           │
│     ├─ Interne User                                             │
│     │  - Produktionsleiter                                      │
│     │  - Lagerarbeiter                                          │
│     │  - etc.                                                   │
│     │                                                           │
│     └─ Externe User (Sub-Lieferanten)                           │
│        - Werkzeug-Management-Dienstleister                      │
│        - Personen beim Sub                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Der Hauptverantwortliche

Pro Lieferantennummer gibt es genau EINEN Hauptverantwortlichen.

**Er verwaltet:**
- Standorte des Lieferanten
- Alle User die Inventuren bearbeiten dürfen
- Auch externe Personen (Sub-Lieferanten)

**Er kann delegieren:**
- Einzelne Aufträge
- Gruppen von Aufträgen
- An interne oder externe User

## Delegation in der Praxis

### Typische Szenarien

**Szenario 1: Hauptverantwortlicher macht alles selbst**
- Kleine Lieferanten
- Wenige Werkzeuge
- Eine Person kennt alles

**Szenario 2: Delegation an Lager**
- Hauptverantwortlicher verteilt an Lager-Teams
- Jedes Lager prüft "seine" Werkzeuge
- Hauptverantwortlicher sammelt Ergebnisse

**Szenario 3: Externe Werkzeug-Verwaltung**
- Lieferant hat Werkzeug-Management ausgelagert
- Sub-Lieferant bekommt alle Aufträge
- Hauptverantwortlicher überwacht nur

### Design-Implikation

Das System muss:
- Einfaches Einladen von Usern ermöglichen (intern + extern)
- Aufträge zuweisen können (einzeln oder bulk)
- Status der delegierten Aufträge zeigen
- Keine Medienbrüche erzwingen
