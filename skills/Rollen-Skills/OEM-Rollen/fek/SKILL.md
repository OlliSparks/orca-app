# FEK - Facheinkäufer

Werkzeugverantwortlicher beim OEM mit Zugriff auf alle Buchungskreise.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | FEK |
| **Englisch** | Specialist Buyer |
| **Typ** | Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |
| **Scope** | Alle Buchungskreise |
| **Keycloak-Pfad** | `/orca/M/FEK` |
| **Zugeordnete Rolle** | WVO (Werkzeugverantwortlicher Owner) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |
| **Approve** | Genehmigungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `read:inventory:planning` | Menüeintrag für Inventurplanung wird angezeigt |
| `read:inventory:result` | Menüeintrag für Inventurergebnisse wird angezeigt |
| `read:company` | Lesezugriff auf Companies |
| `read:location` | Lesezugriff auf Locations |
| `read:supplier` | Lesezugriff auf Supplier |
| `read:user` | Lesezugriff auf User |

## Hauptaufgaben

1. **Werkzeugverwaltung** - Verwaltung und Überwachung aller Werkzeuge
2. **Inventurplanung** - Planung und Steuerung von Inventuren
3. **Ergebnisauswertung** - Prüfung und Genehmigung von Inventurergebnissen
4. **Lieferantenkoordination** - Abstimmung mit Lieferanten

## Workflow-Beteiligung

- **Inventurplanung**: Erstellen und Planen von Inventuraufträgen
- **Inventurergebnis**: Prüfung und Genehmigung

## Hinweis

Rechtestatus ist identisch zu BMW SRM (BGR).

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
