# Orca API - Endpunkte Kurzreferenz

## Base-URL
```
https://int.bmw.organizingcompanyassets.com/api/orca
```

## Endpunkte

> TODO: Diese Datei mit den tatsaechlichen Endpunkten befuellen

### Assets
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | /assets | Liste aller Assets |
| GET | /assets/{id} | Einzelnes Asset |
| POST | /assets | Asset erstellen |
| PUT | /assets/{id} | Asset aktualisieren |

### Prozesse
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | /processes | Liste aller Prozesse |
| GET | /processes/{id} | Einzelner Prozess |

### Verlagerungen
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | /relocations | Liste aller Verlagerungen |
| GET | /relocations/{id} | Einzelne Verlagerung |

## Query-Parameter

### Pagination
- `page` - Seitennummer (default: 0)
- `size` - Eintraege pro Seite (default: 20)

### Filter
- `status` - Nach Status filtern
- `supplierNumber` - Nach Lieferanten-Nummer filtern
