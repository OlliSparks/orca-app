# ID - Inventurdurchführer

Rolle für die tatsächliche Durchführung der Inventur beim Lieferanten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | ID |
| **Englisch** | Inventory Guide |
| **Typ** | Rolle und Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | Lieferant (1st tier) oder Sublieferant (n-tier) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:inventory:procedure` | Menüeintrag für Inventurdurchführung wird angezeigt |
| `create:inventory` | Erstellen/Bearbeiten von Arbeitspaketen |

## Doppelte Definition

### Als Rolle
- Der User, der am Arbeitspaket die Rolle des Inventurdurchführers ausübt
- Wird pro Arbeitspaket zugewiesen

### Als Gruppe
- Gruppe aller möglichen ID-User beim Lieferant (1st tier) oder Sublieferant (n-tier)
- Sammlung aller Benutzer, die als Inventurdurchführer tätig sein können

## Hauptaufgaben

1. **Physische Inventur** - Tatsächliche Erfassung der Werkzeuge vor Ort
2. **Datenerfassung** - Eingabe der Inventurdaten in das System
3. **Statusmeldung** - Bestätigung, Nicht-Gefunden, Klärfall melden
4. **Fotodokumentation** - Bei Bedarf Fotos der Werkzeuge

## Workflow-Beteiligung

```
Arbeitspaket wird zugewiesen
    │
    └── ID führt durch
            │
            ├── Position bestätigen (P0 → P2)
            │
            ├── Nicht gefunden (P0 → P3)
            │
            └── Klärfall melden (P0 → P4)
```

## Typischer Workflow

1. Erhält Arbeitspaket von IVL/WVL
2. Öffnet Inventur-App
3. Scannt/sucht Werkzeug
4. Prüft physisch vor Ort
5. Dokumentiert Status
6. Schließt Position ab

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| IVL | Erhält Arbeitspakete vom IVL |
| WVL | Erhält Arbeitspakete vom WVL |
| SUP | Unterstützt bei Problemen |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
