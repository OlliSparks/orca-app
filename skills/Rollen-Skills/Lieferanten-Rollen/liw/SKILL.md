# LIW - n-tier Lieferant im Werkzeugbesitz

Rolle für Sublieferanten (n-tier), die Werkzeuge im Besitz haben.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | LIW |
| **Englisch** | n-tier Supplier (Asset Owner) |
| **Typ** | Rolle |
| **Launch Phase** | LP1 |
| **Organisation** | Sublieferant (n-tier) |
| **Alternative Bezeichnung** | Operator / Betreiber |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Kontext

Ein LIW ist ein Sublieferant in der Lieferkette (n-tier), der Werkzeuge des OEM physisch besitzt und betreibt. Dies tritt auf, wenn Werkzeuge an Unterlieferanten weitergegeben wurden.

## Hauptaufgaben

1. **Werkzeugbetrieb** - Physischer Betrieb der Werkzeuge
2. **Inventurteilnahme** - Teilnahme an Inventuren für zugewiesene Werkzeuge
3. **Statusmeldung** - Meldung des Werkzeugzustands

## Lieferketten-Hierarchie

```
OEM (Eigentümer)
    │
    └── 1st tier Lieferant (WVL)
            │
            └── n-tier Lieferant (LIW) ◄── Werkzeug im Besitz
                    │
                    └── weitere n-tier möglich
```

## Besonderheit

- LIW ist der tatsächliche **Betreiber/Operator** des Werkzeugs
- Das Werkzeug gehört weiterhin dem OEM
- Der 1st tier Lieferant bleibt vertraglich verantwortlich

## Workflow-Beteiligung

- **Inventur**: Muss Werkzeuge vor Ort erfassen
- **Verlagerung**: Kann Quelle oder Ziel einer Verlagerung sein

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
