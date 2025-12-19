# VW - Verwerter (Recycler)

Rolle für den Verwerter/Recycler von Werkzeugen.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | VW |
| **Englisch** | Recycler |
| **Typ** | Process |
| **Launch Phase** | LP1 |
| **Abbildung** | Über "ABO" (Abonnement) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Abbildung über ABO

Diese Rolle wird nicht als feste Gruppenmitgliedschaft abgebildet, sondern über das **Abonnement-System (ABO)**. Benutzer mit besonderem Interesse an bestimmten Assets/Prozessen können sich diese abonnieren.

## Kontext

Der Verwerter (Recycler) ist das ausführende Unternehmen für die physische Verwertung/Verschrottung von Werkzeugen.

## Hauptaufgaben

1. **Werkzeugabholung** - Abholung der zu verwertenden Werkzeuge
2. **Verwertungsdurchführung** - Physische Verschrottung/Recycling
3. **Dokumentation** - Nachweis der ordnungsgemäßen Verwertung
4. **Statusmeldung** - Rückmeldung über abgeschlossene Verwertung

## Workflow-Beteiligung

### Verschrottungsprozess

```
Verschrottungsauftrag (von VE genehmigt)
    │
    └── VW führt durch
            │
            ├── Werkzeug abholen
            │
            ├── Verwertung durchführen
            │
            └── Abschluss dokumentieren
```

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| VE | Verwertungseinkauf erteilt Aufträge |
| SUP | Support koordiniert bei Bedarf |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
