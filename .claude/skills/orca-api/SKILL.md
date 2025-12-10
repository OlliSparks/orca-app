---
name: orca-api
description: Bei API-Calls, Datenabruf und Backend-Integration konsultieren. Enthaelt alle Informationen zur Orca-API.
---

# Orca-API Skill

## Base-URL

```
https://int.bmw.organizingcompanyassets.com/api/orca
```

## Wann diesen Skill verwenden?

- API-Calls implementieren
- Datenabruf vom Backend
- Integration mit dem Orca-System
- Backend-Kommunikation

## Authentifizierung

Bearer Token Auth (JWT)

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

## Quick-Check fuer API-Integration

- [ ] Welcher Endpunkt ist der richtige?
- [ ] Welche Status-Codes sind relevant? (I0-I4, P0-P6)
- [ ] Welche Query-Parameter werden benoetigt?
- [ ] Ist Batch-Operation moeglich?

## Referenz-Dateien

- `references/endpoints-quick.md` - Kurzreferenz aller Endpunkte
- `references/openapi.json` - Vollstaendige OpenAPI-Spezifikation

## Status-Codes Uebersicht

### Inventory Status (I0-I4)
- **I0:** Initial
- **I1:** In Bearbeitung
- **I2:** Geprueft
- **I3:** Abgeschlossen
- **I4:** Archiviert

### Process Status (P0-P6)
- **P0:** Neu
- **P1:** In Vorbereitung
- **P2:** Bereit
- **P3:** In Durchfuehrung
- **P4:** Abgeschlossen
- **P5:** Storniert
- **P6:** Fehler

## Haeufige Endpunkte

Siehe `references/endpoints-quick.md` fuer die vollstaendige Liste.
