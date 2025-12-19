# IVL - Inventurverantwortlicher Lieferant

Gruppe für den Inventurverantwortlichen beim Lieferanten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | IVL |
| **Englisch** | Inventory Responsible Supplier |
| **Typ** | Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | Lieferant (1st tier) |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |
| **Approve** | Genehmigungsrechte |

## Zugewiesene Rechte

| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `read:inventory:procedure` | Menüeintrag für Inventurdurchführung wird angezeigt |
| `read:company` | Lesezugriff auf Companies |
| `read:location` | Lesezugriff auf Locations |
| `read:supplier` | Lesezugriff auf Supplier |
| `read:user` | Lesezugriff auf User |

## Besonderheit

Diese Gruppe ist **notwendig, falls kein WVL vorhanden** ist. In diesem Fall übernimmt der IVL die Koordination der Inventur beim Lieferanten.

## Hauptaufgaben

1. **Inventurkoordination** - Steuerung der Inventurdurchführung beim Lieferanten
2. **Delegation** - Zuweisung von Arbeitspaketen an Inventurdurchführer (ID)
3. **Qualitätskontrolle** - Prüfung der erfassten Inventurdaten
4. **Genehmigung** - Freigabe von Inventurergebnissen

## Workflow-Beteiligung

```
Inventur-Arbeitspaket
    │
    └── IVL koordiniert
            │
            ├── Delegiert an ID
            │
            └── Prüft und genehmigt Ergebnisse
```

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| WVL | Kann IVL-Aufgaben übernehmen wenn vorhanden |
| ID | Erhält Arbeitspakete vom IVL |
| SUP | Unterstützt bei Problemen |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
