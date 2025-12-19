# SUP - Inventursupport

Zentrale Support-Rolle für das Inventurbüro mit umfassenden Rechten.

## Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Kürzel** | SUP |
| **Englisch** | Inventory Support |
| **Typ** | Gruppe |
| **Launch Phase** | LP1 |
| **Organisation** | Inventurbüro |
| **Keycloak-Pfad** | `/orca/W/InvB` |

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| **Edit** | Bearbeitungsrechte |

## Zugewiesene Rechte

### Asset-Rechte
| Recht | Beschreibung |
|-------|--------------|
| `read:assets` | Zugriff auf Werkzeugliste und Werkzeugakte |
| `prepare:assets` | In der Werkzeugakte wird der Tab zur Vorbereitung angezeigt |

### Inventur-Rechte
| Recht | Beschreibung |
|-------|--------------|
| `read:inventory:planning` | Menüeintrag für Inventurplanung wird angezeigt |
| `read:inventory:procedure` | Menüeintrag für Inventurdurchführung wird angezeigt |
| `read:inventory:result` | Menüeintrag für Inventurergebnisse wird angezeigt |
| `create:inventory` | Button zum Erstellen eines Inventurauftrags wird angezeigt |

### Prozess-Rechte
| Recht | Beschreibung |
|-------|--------------|
| `read:relocation` | Menüeintrag für Verlagerungen wird angezeigt |
| `read:disposal` | Menüeintrag für Verschrottungen wird angezeigt |

### Stammdaten-Rechte
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

### User-Rechte
| Recht | Beschreibung |
|-------|--------------|
| `read:user` | Lesezugriff auf User |
| `create:user` | Erstellen eines Users |
| `update:user` | Updaten eines Users |
| `delete:user` | Löschen eines Users |

## Hinweis: Support-Admin-Zugänge

Aufgrund der Entscheidung aus Ticket **KPBMW-674** ist nicht gewünscht, dass externe Mitarbeiter Zugang zu Kubernetes etc. bekommen. Die Funktionalitäten müssen über das **Front-End** oder **Fischer Mitarbeiter** gelöst werden.

## Hauptaufgaben

1. **Inventurplanung** - Erstellung und Verwaltung von Inventuraufträgen
2. **Inventursupport** - Unterstützung bei der Inventurdurchführung
3. **Ergebnismanagement** - Verwaltung und Auswertung von Inventurergebnissen
4. **Stammdatenpflege** - Verwaltung von Companies, Locations, Suppliers
5. **Benutzerverwaltung** - Anlegen und Verwalten von Benutzern
6. **Prozessüberwachung** - Monitoring von Verlagerungen und Verschrottungen

## Workflow-Beteiligung

Der SUP ist an allen zentralen Prozessen beteiligt:

```
┌─────────────────────────────────────────────────────────────┐
│                      SUP (Inventurbüro)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Inventur   │  │ Verlagerung │  │Verschrottung│         │
│  │  Planung    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                 │
│         v                v                v                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Inventur   │  │  Stamm-     │  │  Benutzer-  │         │
│  │ Durchführung│  │  daten      │  │  verwaltung │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Beziehung zu anderen Rollen

| Rolle | Beziehung |
|-------|-----------|
| FEK | SUP unterstützt bei Inventurplanung |
| IVL | SUP unterstützt Inventurverantwortliche |
| WVL | SUP koordiniert mit Werkzeugverantwortlichen |
| ID | SUP hilft bei Problemen während Inventur |
| ITL | Beide haben administrative Rechte |

## Referenzen

- Quelle: Prozessmodul_1a_-_Inventur_v1.0_kommentiert.pdf (S. 6-8)
- Ticket: KPBMW-674 (Support-Admin-Zugänge)
- Erstellt von: Timo Mattes
- Zuletzt geändert von: Frank Leverenz am Jul 23, 2024
