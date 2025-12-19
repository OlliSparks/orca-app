# ABL - Anlagenbuchhaltung (Local)

Rolle für die Anlagenbuchhaltung mit Zugriff auf den eigenen Buchungskreis beim OEM.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | ABL |
| **Englisch** | Asset Accounting (Local) |
| **Typ** | Gruppe |
| **Launch Phase** | LP2 |
| **Organisation** | OEM |
| **Scope** | Nur eigener Buchungskreis |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **View** | Lesezugriff auf relevante Daten |
| **Approve** | Genehmigungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte (eingeschränkt auf eigenen Buchungskreis) |

## Hauptaufgaben

1. **Lokale Anlagenüberwachung** - Übersicht über Anlagen im eigenen Buchungskreis
2. **Inventur-Genehmigung** - Freigabe von Inventurergebnissen im lokalen Bereich

## Abgrenzung zu ABC

| Aspekt | ABL (Local) | ABC (Commodity) |
|--------|-------------|-----------------|
| Buchungskreis-Scope | Nur eigener | Alle |
| Verantwortungsbereich | Lokal | Konzernweit |
| Launch Phase | LP2 | LP1 |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
