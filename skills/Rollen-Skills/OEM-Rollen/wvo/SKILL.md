# WVO - Werkzeugverantwortlicher Owner

OEM-Verantwortlicher für Werkzeuge.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | WVO |
| **Englisch** | Tool Responsible Owner |
| **Typ** | Rolle |
| **Launch Phase** | LP1 |
| **Organisation** | OEM |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |

## Hauptaufgaben

1. **Werkzeugverantwortung** - Hauptverantwortung für zugewiesene Werkzeuge beim OEM
2. **Koordination** - Abstimmung mit Lieferanten (WVL)
3. **Überwachung** - Kontrolle des Werkzeugbestands

## Beziehung zu anderen Rollen

```
WVO (OEM)
    │
    ├── FEK (zugeordnete Rolle)
    │
    └── WVL (Lieferant-Pendant)
```

### Pendant beim Lieferanten
- **WVL** (Werkzeugverantwortlicher Lieferant) ist das Gegenstück beim Lieferanten

### Zuordnung zu FEK
- WVO ist die zugeordnete Rolle für FEK (Facheinkäufer)

## Workflow-Beteiligung

- **Inventur**: Überwachung und Koordination
- **Verlagerung**: Genehmigung und Steuerung
- **Verschrottung**: Freigabe

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
