# VVL - Versand-Verantwortlicher beim Lieferanten

Rolle für den Versand-Verantwortlichen beim Lieferanten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | VVL |
| **Englisch** | Shipping Responsible Supplier |
| **Typ** | Rolle |
| **Launch Phase** | LP1 |
| **Organisation** | Lieferant |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **View** | Lesezugriff |
| **Edit** | Bearbeitungsrechte |

## Hauptaufgaben

1. **Versandkoordination** - Organisation des Werkzeug-Versands
2. **Verlagerungsabwicklung** - Durchführung von Verlagerungen auf Lieferantenseite
3. **Dokumentation** - Erstellung von Versandpapieren
4. **Tracking** - Verfolgung von Sendungen

## Workflow-Beteiligung

### Verlagerungsprozess

```
Verlagerungsauftrag
    │
    └── VVL koordiniert Versand
            │
            ├── Werkzeug vorbereiten
            │
            ├── Versand durchführen
            │
            └── Ankunft bestätigen
```

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| WVL | Erhält Aufträge vom WVL |
| ID | Kann bei Inventur vor Versand unterstützen |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
