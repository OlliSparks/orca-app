# ITL - IT-Verantwortlicher beim Lieferanten

IT-Verantwortlicher für technische Administration beim Lieferanten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | ITL |
| **Englisch** | IT Responsible Supplier |
| **Typ** | Gruppe |
| **Launch Phase** | LPT (Technisch) |
| **Organisation** | Lieferant |
| **Authentifizierung** | B2B LDAP Transfer |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:company` | Lesezugriff auf Companies |
| `update:company` | Bearbeitung von Companies |
| `create:company` | Erstellung von Companies |
| `delete:company` | Löschen von Companies |
| `read:location` | Lesezugriff auf Locations |
| `create:location` | Erstellung von Locations |
| `update:location` | Bearbeitung von Locations |
| `delete:location` | Löschen von Locations |
| `read:supplier` | Lesezugriff auf Supplier |
| `create:supplier` | Erstellung von Supplier |
| `delete:supplier` | Löschen von Supplier |
| `create:user` | Erstellen eines Users |
| `update:user` | Updaten eines Users |
| `delete:user` | Löschen eines Users |
| `read:user` | Lesezugriff auf User |

## Authentifizierung

Die ITL-Gruppe wird über **B2B LDAP Transfer** bereitgestellt.

## Hauptaufgaben

1. **Benutzerverwaltung** - Anlegen, Bearbeiten, Löschen von Benutzern
2. **Stammdatenpflege** - Verwaltung von Companies, Locations, Suppliers
3. **Technische Administration** - IT-seitige Konfiguration

## Besonderheit

Der ITL hat umfangreiche administrative Rechte für die Stammdatenverwaltung beim Lieferanten. Diese Rolle ist primär technisch/administrativ und nicht fachlich.

## Abgrenzung

| Aspekt | ITL | SUP |
|--------|-----|-----|
| Fokus | Technische Administration | Fachlicher Support |
| Stammdaten | Vollzugriff | Vollzugriff |
| Prozesse | Kein direkter Zugriff | Zugriff auf alle Prozesse |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
