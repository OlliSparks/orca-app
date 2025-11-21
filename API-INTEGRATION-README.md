# ORCA 2.0 - API Integration Anleitung

## Übersicht

Die ORCA 2.0 Inventory Service App unterstützt zwei Modi:
- **Mock-Modus**: Verwendet lokale Test-Daten (Standard)
- **Live-Modus**: Verbindet sich mit dem echten Backend-API

## Umschalten zwischen Mock und Live

### Datei: `js/config/api-config.js`

```javascript
const API_CONFIG = {
    // Modus ändern: 'mock' oder 'live'
    mode: 'mock',  // ← HIER ÄNDERN

    baseURL: 'https://int.bmw.organizingcompanyassets.com',
    // ...
}
```

## Konfiguration für Live-Modus

### 1. Keycloak-Konfiguration

Passen Sie in `js/config/api-config.js` die Keycloak-Einstellungen an:

```javascript
keycloak: {
    url: 'https://int.bmw.organizingcompanyassets.com/auth',
    realm: 'IHR_REALM_NAME',        // ← Anpassen
    clientId: 'IHR_CLIENT_ID'       // ← Anpassen
}
```

**Benötigte Informationen:**
- Keycloak URL
- Realm Name
- Client ID

### 2. Company & Supplier Keys

Nach dem Login werden diese automatisch gesetzt. Für Tests können Sie statische Werte eintragen:

```javascript
context: {
    companyKey: 'BMW_AG',           // ← Ihre Company Key
    supplierKey: 'BOSCH_REXROTH',   // ← Ihre Supplier Key
    userKey: null                    // Wird automatisch gesetzt
}
```

## API-Endpunkte

Die App nutzt folgende Backend-Endpoints:

### Werkzeugübersicht (FM-Liste)
- `GET /asset-list` - Alle Assets abrufen
- `GET /assets/{assetKey}` - Einzelnes Asset
- `GET /asset/{assetKey}/process-history` - Prozesshistorie
- `GET /asset/{assetKey}/documents` - Dokumente
- `GET /asset/{assetKey}/images` - Bilder

### Inventur
- `GET /inventory-list` - Inventuren abrufen
- `GET /inventory/{inventoryKey}/positions` - Positionen
- `PATCH /inventory/{inventoryKey}/{positionKey}/{revision}/report` - Position melden
- `PATCH /inventory/{inventoryKey}/{positionKey}/location` - Standort ändern
- `POST /inventory/{inventoryKey}/actions/send` - Inventur einreichen

### Planung
- `GET /asset-list` - Assets für Planung
- `POST /asset/invplan` - Inventurplanung starten
- `POST /asset-planning/planningUpdates` - Planung aktualisieren

## Automatischer Fallback

Die App fällt automatisch auf Mock-Daten zurück, wenn:
1. Der Modus auf 'mock' gesetzt ist
2. Die Live-API nicht erreichbar ist
3. Ein API-Call fehlschlägt

## Testen der Integration

### 1. Mock-Modus testen
```javascript
// api-config.js
mode: 'mock'
```
- Öffnen Sie die App im Browser
- Alle Daten sollten wie gewohnt funktionieren

### 2. Live-Modus testen
```javascript
// api-config.js
mode: 'live'
```
- Öffnen Sie die Browser-Konsole (F12)
- Sie sollten Keycloak-Login sehen
- Nach Login sollten echte Daten geladen werden

### 3. Fehlerbehandlung testen
- Im Live-Modus: Backend ausschalten
- App sollte auf Mock-Daten zurückfallen
- Warnung in Console: "Live API call failed, falling back to mock data"

## Authentifizierung

### Keycloak-Flow

1. **Initialization**: App lädt Keycloak-Adapter
2. **Login**: Automatische Weiterleitung zu Keycloak
3. **Token**: JWT-Token wird automatisch in API-Calls eingefügt
4. **Refresh**: Token wird alle 5 Minuten automatisch erneuert
5. **Logout**: `authService.logout()` ruft Keycloak-Logout auf

### Token im Header
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Daten-Mapping

Die API liefert möglicherweise andere Feldnamen als die App erwartet.

### Beispiel Asset-Mapping:

**API Response:**
```json
{
  "assetKey": "PRE-2021-0001",
  "description": "Presswerkzeug A-Säule links",
  "supplierName": "Bosch Rexroth AG",
  "companySite": {
    "name": "Halle A - Regal 1"
  }
}
```

**App-Format:**
```json
{
  "id": 1,
  "toolNumber": "PRE-2021-0001",
  "name": "Presswerkzeug A-Säule links",
  "supplier": "Bosch Rexroth AG",
  "location": "Halle A - Regal 1"
}
```

⚠️ **Wichtig**: Sie müssen die Transformation in `api.js` anpassen, sobald Sie die echte API-Response-Struktur kennen!

## Swagger/OpenAPI Dokumentation

Prüfen Sie die API-Dokumentation unter:
- `https://int.bmw.organizingcompanyassets.com/swagger-ui`
- `https://int.bmw.organizingcompanyassets.com/api-docs`

Dort finden Sie:
- Vollständige Endpoint-Liste
- Request/Response-Schemas
- Beispiel-Requests
- Authentifizierungs-Details

## Nächste Schritte

### Phase 1: Vorbereitung (Jetzt)
- ✅ API-Konfiguration erstellt
- ✅ Auth-Service implementiert
- ✅ Fallback-Mechanismus eingebaut
- ⏳ Swagger-Dokumentation prüfen
- ⏳ Keycloak-Credentials einholen

### Phase 2: Daten-Mapping
1. Swagger/OpenAPI prüfen
2. Echte Response-Struktur analysieren
3. Mapping-Funktionen in `api.js` anpassen
4. Feldnamen angleichen

### Phase 3: Testing
1. Mock-Modus testen ✅
2. Live-Modus mit echtem Backend testen
3. Fehlerbehandlung testen
4. Performance prüfen

### Phase 4: Production
1. Production-URL in Config eintragen
2. Mode auf 'live' umstellen
3. Deployment

## Troubleshooting

### Problem: Keycloak lädt nicht
**Lösung**: Prüfen Sie die Keycloak-URL und Erreichbarkeit
```javascript
console.log(API_CONFIG.keycloak.url);
```

### Problem: CORS-Fehler
**Lösung**: Backend muss CORS-Header setzen oder Proxy nutzen

### Problem: 401 Unauthorized
**Lösung**: Token abgelaufen oder ungültig
- Logout und erneut einloggen
- Prüfen Sie Token-Refresh-Mechanismus

### Problem: Daten werden nicht angezeigt
**Lösung**:
1. Browser-Console öffnen (F12)
2. Network-Tab prüfen
3. Response-Struktur mit erwartetem Format vergleichen
4. Mapping in `api.js` anpassen

## Support

Bei Fragen zur API-Integration:
1. Swagger-Dokumentation konsultieren
2. Backend-Team kontaktieren
3. Console-Logs prüfen (`console.log` in `api.js`)

---

**Erstellt**: 2025-11-17
**Version**: 1.0
**Status**: Ready for Integration Testing
