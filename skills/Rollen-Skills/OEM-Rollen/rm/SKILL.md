# RM - Risikomanagement

Rolle für das Risikomanagement mit reinem Lesezugriff beim OEM.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | RM |
| **Englisch** | Risk Management |
| **Typ** | Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |
| **Authentifizierung** | BMW LDAP |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **View** | Nur Lesezugriff |

## Zugriff

- **Dashboard** - Zugriff auf Dashboards
- **Reports** - Zugriff auf Reports

## Hauptaufgaben

1. **Risikoüberwachung** - Monitoring von Risiken im Asset-Bestand
2. **Reporting** - Auswertung von Reports und Dashboards
3. **Compliance** - Überwachung der Einhaltung von Vorgaben

## Authentifizierung

Die RM-Gruppe wird über BMW LDAP bereitgestellt - keine manuelle Benutzerverwaltung in Orca erforderlich.

## Einschränkungen

- Kein Schreibzugriff
- Keine Genehmigungsrechte
- Nur Dashboard und Reports

## Ähnliche Rollen

| Rolle | Unterschied |
|-------|-------------|
| REV (Revision) | Ähnlicher Lesezugriff, aber andere Zielgruppe |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
