# WVL - Werkzeugverantwortlicher Lieferant

Werkzeugverantwortlicher beim Lieferanten (1st tier).

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | WVL |
| **Englisch** | Tool-Responsible Supplier |
| **Typ** | Rolle |
| **Launch Phase** | LP1 |
| **Organisation** | Lieferant (1st tier) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `read:inventory:procedure` | Menüeintrag für Inventurdurchführung wird angezeigt |
| `create:inventory` | Erstellen von Arbeitspaketen (falls berechtigt) |

## Hauptaufgaben

1. **Werkzeugverwaltung** - Verwaltung aller Werkzeuge beim Lieferanten
2. **Inventurkoordination** - Planung und Steuerung der Inventur
3. **Delegation** - Zuweisung von Aufgaben an ID und WVL-LOC
4. **OEM-Abstimmung** - Kommunikation mit WVO beim OEM

## Beziehung zu anderen Rollen

```
WVO (OEM)
    │
    └── WVL (Lieferant) ◄── Pendant beim Lieferanten
            │
            ├── WVL-LOC (Location-spezifisch)
            │
            ├── IVL (falls WVL nicht vorhanden)
            │
            └── ID (Inventurdurchführer)
```

### Pendant beim OEM
- **WVO** (Werkzeugverantwortlicher Owner) ist das Gegenstück beim OEM

### Untergeordnete Rollen
- **WVL-LOC** - Werkzeugverantwortlicher für eine spezifische Location
- **ID** - Inventurdurchführer

## Workflow-Beteiligung

- **Inventur**: Planung, Delegation, Überwachung
- **Verlagerung**: Koordination beim Lieferanten
- **Verschrottung**: Vorbereitung und Abstimmung

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
