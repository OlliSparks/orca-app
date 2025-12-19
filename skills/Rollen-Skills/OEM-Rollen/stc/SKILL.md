# STC - Steuerliche Abwicklung (Commodity)

Rolle für die steuerliche Abwicklung mit Zugriff auf alle Buchungskreise beim OEM.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | STC |
| **Englisch** | Tax Settlement (Commodity) |
| **Typ** | Rolle |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |
| **Scope** | Alle Buchungskreise |
| **Keycloak-Pfad** | `/orca/F/StAb` oder `/orca/LB/StAb` |
| **Keycloak-Attribut** | `roles="orca_LG_StAb"` |

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

## Status

**Rolle unklar - Abklärung ausstehend**

## Hauptaufgaben

1. **Steuerliche Prüfung** - Prüfung steuerrelevanter Asset-Daten
2. **Genehmigung** - Freigabe aus steuerlicher Sicht

## Abgrenzung zu STL

| Aspekt | STC (Commodity) | STL (Local) |
|--------|-----------------|-------------|
| Buchungskreis-Scope | Alle | Nur eigener |
| Verantwortungsbereich | Konzernweit | Lokal |
| Launch Phase | LP1 | LP2 |

## Offene Fragen

- Was sind die genauen steuerlichen Aufgaben?
- Welche Genehmigungen erteilt diese Rolle?

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
