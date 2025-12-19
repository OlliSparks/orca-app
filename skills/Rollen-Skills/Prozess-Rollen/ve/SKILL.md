# VE - Verwertungseinkauf

Rolle für den Verwertungseinkauf.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | VE |
| **Englisch** | Recycling Purchasing |
| **Typ** | Process |
| **Launch Phase** | LP1 |
| **Abbildung** | Über "ABO" (Abonnement) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **View** | Lesezugriff |
| **Approve** | Genehmigungsrechte |

## Abbildung über ABO

Diese Rolle wird nicht als feste Gruppenmitgliedschaft abgebildet, sondern über das **Abonnement-System (ABO)**. Benutzer mit besonderem Interesse an bestimmten Assets/Prozessen können sich diese abonnieren.

## Kontext

Der Verwertungseinkauf ist zuständig für die Koordination der Verwertung (Recycling/Entsorgung) von Werkzeugen am Ende ihres Lebenszyklus.

## Hauptaufgaben

1. **Verwertungskoordination** - Organisation der Werkzeug-Verwertung
2. **Verwerter-Management** - Auswahl und Beauftragung von Verwertern
3. **Prozessgenehmigung** - Freigabe von Verwertungsaufträgen

## Workflow-Beteiligung

### Verschrottungsprozess

```
Verschrottungsantrag
    │
    ├── VE prüft und genehmigt
    │
    └── VW (Verwerter) führt durch
```

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| VW | Verwerter führt die eigentliche Verwertung durch |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
