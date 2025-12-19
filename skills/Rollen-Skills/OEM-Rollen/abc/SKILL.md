# ABC - Anlagenbuchhaltung (Commodity)

Rolle für die Anlagenbuchhaltung mit Zugriff auf alle Buchungskreise beim OEM.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | ABC |
| **Englisch** | Asset Accounting (Commodity) |
| **Typ** | Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |
| **Scope** | Alle Buchungskreise |
| **Keycloak-Pfad** | `/orca/F/AnBu` |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **View** | Lesezugriff auf relevante Daten |
| **Approve** | Genehmigungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `read:company` | Lesezugriff auf Companies |
| `read:location` | Lesezugriff auf Locations |
| `read:supplier` | Lesezugriff auf Supplier |
| `read:user` | Lesezugriff auf User |

## Hauptaufgaben

1. **Anlagenüberwachung** - Übersicht über alle Anlagen in allen Buchungskreisen
2. **Inventur-Genehmigung** - Freigabe von Inventurergebnissen
3. **Berichtswesen** - Zugriff auf Reports und Dashboards

## Abgrenzung zu ABL

| Aspekt | ABC (Commodity) | ABL (Local) |
|--------|-----------------|-------------|
| Buchungskreis-Scope | Alle | Nur eigener |
| Verantwortungsbereich | Konzernweit | Lokal |

## Offene Fragen

- Was ist der genaue Unterschied zwischen "Commodity" und "Local" im Kontext der Anlagenbuchhaltung?
- Ist diese Rolle im aktuellen Scope enthalten?

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
