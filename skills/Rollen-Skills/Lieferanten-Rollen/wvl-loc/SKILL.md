# WVL-LOC - Werkzeugverantwortlicher Lieferant (Location)

Werkzeugverantwortlicher für eine spezifische Location beim Lieferanten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | WVL-LOC |
| **Englisch** | Tool-Responsible Supplier Location |
| **Typ** | Rolle |
| **Launch Phase** | LP2 |
| **Organisation** | Lieferant |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Status

**Rolle unklar - Abklärung ausstehend**

## Hauptaufgaben

1. **Location-Verwaltung** - Verwaltung der Werkzeuge an einer spezifischen Location
2. **Lokale Inventur** - Durchführung der Inventur an der zugewiesenen Location
3. **Reporting** - Berichterstattung an WVL

## Abgrenzung zu WVL

| Aspekt | WVL-LOC | WVL |
|--------|---------|-----|
| Scope | Eine Location | Alle Locations |
| Launch Phase | LP2 | LP1 |
| Verantwortung | Lokal | Gesamtverantwortung |

## Hierarchie

```
WVL (Werkzeugverantwortlicher Lieferant)
    │
    ├── WVL-LOC (Location A)
    │
    ├── WVL-LOC (Location B)
    │
    └── WVL-LOC (Location C)
```

## Offene Fragen

- Wie wird die Location-Zuordnung technisch umgesetzt?
- Welche spezifischen Einschränkungen hat diese Rolle?

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
