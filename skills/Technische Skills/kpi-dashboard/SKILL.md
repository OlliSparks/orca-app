# KPI-Dashboard Skill

Dokumentation der KPI-Berechnung und Datenquellen für das ORCA 2.0 Kennzahlen-Dashboard.

## Übersicht

Das KPI-Dashboard aggregiert Daten aus allen Prozess-APIs und berechnet Kennzahlen für:
- Inventur
- Verlagerung
- Vertragspartnerwechsel (VPW)
- Abnahmebereitschaft (ABL)
- Verschrottung

## Verfügbare KPIs

### Haupt-KPIs

| KPI | Berechnung | Datenquelle | Status |
|-----|------------|-------------|--------|
| **Inventur-Quote** | (P2+P3+P4+P5) / Gesamt × 100 | Inventur-Positionen | ✅ Verfügbar |
| **Überfällige Inventuren** | Positionen mit dueDate < heute und Status P0/P1 | Inventur-Positionen | ✅ Verfügbar |
| **Verwaltete Werkzeuge** | Anzahl aller Inventur-Positionen | Inventur-Positionen | ✅ Verfügbar |
| **Ø Bearbeitungszeit** | - | Keine Timestamps verfügbar | ❌ Nicht möglich |

### Prozess-Übersicht

| Prozess | Datenquelle | Abgeschlossen-Status |
|---------|-------------|---------------------|
| **Inventur** | `/inventory-list` + `/inventory/{key}/positions` | P2, P3, P4, P5 |
| **Verlagerung** | `/process?md.p.type=RELOCATION` | COMPLETED, DONE, CLOSED, R4, R5 |
| **VPW** | `/process?md.p.type=CONTRACT_PARTNER_CHANGE.C` | COMPLETED, DONE, CLOSED |
| **ABL** | `/inventory-list?type=IB` | I3, I4 |
| **Verschrottung** | `/process?md.p.type=SCRAPPING` | COMPLETED, DONE, CLOSED, S4, S5 |

### Qualitäts-Kennzahlen

| KPI | Berechnung | Status |
|-----|------------|--------|
| **Ersterfassungsquote** | 100% - Fehlende% - Abweichungen% | ✅ Verfügbar (berechnet) |
| **Fehlende Werkzeuge** | Status P6 / Gesamt × 100 | ✅ Verfügbar |
| **Standort-Abweichungen** | (P4 + P5) / Gesamt × 100 | ✅ Verfügbar |
| **Dokumentationsquote** | - | ❌ Keine Foto-Info in API |

### Performance-Kennzahlen

| KPI | Benötigte Daten | Status |
|-----|-----------------|--------|
| **Durchlaufzeit Inventur** | Start- und End-Timestamp | ❌ Nicht in API |
| **Durchlaufzeit Verlagerung** | Start- und End-Timestamp | ❌ Nicht in API |
| **Reaktionszeit** | Zuweisungs- und Bearbeitungs-Timestamp | ❌ Nicht in API |
| **SLA-Einhaltung** | dueDate und completedDate | ❌ completedDate fehlt |

### Standort-Ranking

| Feld | Berechnung | Status |
|------|------------|--------|
| **Standort** | Gruppierung nach `location` aus Positionen | ✅ Verfügbar |
| **Werkzeuge** | Anzahl Positionen pro Standort | ✅ Verfügbar |
| **Quote** | Abgeschlossene / Gesamt pro Standort | ✅ Verfügbar |
| **Ø Zeit** | - | ❌ Keine Timestamps |

## Grenzen der Auswertbarkeit

### Fehlende API-Daten

Die aktuelle Orca-API liefert **keine zeitlichen Verlaufsdaten**:

1. **Keine Prozess-Timestamps**
   - `created` und `modified` sind vorhanden
   - Aber keine spezifischen Zeitpunkte für Statusübergänge
   - Fehlt: "Bearbeitung gestartet", "Abgeschlossen am"

2. **Kein Audit-Log**
   - Keine Historie der Statusänderungen
   - Keine Info wer wann was geändert hat

3. **Keine Foto-Metadaten**
   - API zeigt nicht ob Fotos zu Positionen existieren
   - Dokumentationsquote nicht berechenbar

4. **Kein completedDate**
   - Nur `dueDate` (Fälligkeit) vorhanden
   - Kein Abschlussdatum für SLA-Berechnung

### VPW-Prozesstyp

Der korrekte API-Typ für Vertragspartnerwechsel (VPW) ist noch nicht identifiziert. Getestete Varianten ohne Ergebnis:
- `CONTRACT_PARTNER.C`
- `CONTRACT_PARTNER_CHANGE.C`
- `OWNERSHIP_CHANGE.C`
- `VPW.C`
- `PARTNER_CHANGE.C`

**TODO:** Beim Backend-Team den korrekten Prozesstyp erfragen.

## Technische Implementation

### API-Aufrufe

```javascript
// Inventur
api.getInventoryList({ limit: 10000 })
api.getInventoryPositions(inventoryKey, { limit: 10000 })

// Prozesse
api.getVerlagerungList({ limit: 10000 })
api.getPartnerwechselList({ limit: 10000 })
api.getABLList({ limit: 10000 })
api.getVerschrottungList({ limit: 10000 })
```

### Response-Format

Alle APIs liefern:
```json
{
  "success": true,
  "data": [...],
  "total": 123
}
```

### Positions-Status (Inventur)

| Status | Bedeutung | Zählt als |
|--------|-----------|-----------|
| P0 | Ohne Inventur | Offen |
| P1 | Ohne Akzeptanz | Offen |
| P2 | Gefunden, keine Vorfälle | Abgeschlossen |
| P3 | Gefunden, mit Vorfällen | Abgeschlossen |
| P4 | Anderer Standort, keine Vorfälle | Abgeschlossen |
| P5 | Anderer Standort, mit Vorfällen | Abgeschlossen |
| P6 | Nicht gefunden | Fehlend |

## Mögliche Erweiterungen

### Bei API-Erweiterung

Falls die API erweitert wird, könnten folgende KPIs ergänzt werden:

1. **Mit Timestamps:**
   - Durchlaufzeiten (Start → Ende)
   - Reaktionszeiten (Zuweisung → erste Aktion)
   - SLA-Einhaltung (dueDate vs completedDate)

2. **Mit Audit-Log:**
   - Bearbeitungsverläufe
   - Eskalations-Tracking

3. **Mit Foto-Metadaten:**
   - Dokumentationsquote
   - Foto-Qualitäts-Metriken

### Lokale Berechnung

Alternativ könnte die Frontend-Anwendung:
- Lokalen Timestamp beim Statuswechsel speichern
- Eigenes Audit-Log in localStorage führen
- Limitation: Daten nur für aktuellen Browser/User

## Dateien

- **Frontend:** `js/pages/kpi.js`
- **API-Service:** `js/services/api.js`
- **Route:** `/kpi` → `kpiPage.render()`

---

*Erstellt: 15.12.2025*
*Letztes Update: 15.12.2025*
