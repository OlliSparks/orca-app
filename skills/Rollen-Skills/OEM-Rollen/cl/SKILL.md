# CL - Genehmiger (Approver)

Genehmiger-Rolle für Inventurergebnisse beim OEM.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | CL |
| **Englisch** | Approver |
| **Typ** | Rolle und Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |
| **Keycloak-Pfad** | `/orca/M/Gen` |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Approve** | Genehmigungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `read:inventory:result` | Menüeintrag für Inventurergebnisse wird angezeigt |

## Doppelte Definition

Die CL-Rolle existiert in zwei Ausprägungen:

### Als Rolle
- Berechtigung am Objekt "Inventurergebnis"
- Wird pro Inventurergebnis zugewiesen

### Als Gruppe
- Gruppe beim OEM
- Sammlung aller Benutzer mit Genehmigungsrechten

## Hauptaufgaben

1. **Inventurergebnis-Genehmigung** - Prüfung und Freigabe von Inventurergebnissen
2. **Qualitätskontrolle** - Sicherstellung korrekter Inventurdaten

## Workflow-Beteiligung

```
Inventurergebnis → CL prüft → Genehmigung/Ablehnung
```

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
