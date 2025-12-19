# Session Notes - ORCA 2.0

Letzte Aktualisierung: 2024-12-19

---

## Aktuelle Arbeit: Lookup-Agent

### Status
- Entity Recognition funktioniert (29 Typen)
- API-Calls funktionieren
- Related Objects werden angezeigt
- **Problem:** FM-Akte, Prozess-Historie, Inventuren zeigen "Keine"

### Debug-Logs aktiv
Console zeigt:
```
executeSearch - entityType: toolNumber value: 9010068028
loadProcessHistory - key: A1-0010101642
loadAssetDocuments - key: A1-0010101642
```

### Naechste Schritte
1. Console-Output analysieren
2. Mit Werkzeug testen das bekanntermaßen Prozess-Historie hat
3. API-Response-Struktur pruefen (`context.key` vs `key`)

---

## Commits (Dezember 2024)

### 19.12.2024
- `557c034` - Cache-Buster update
- `acf0741` - fix: entityType Bug in executeSearch + verbesserte Loader
- `3fa6b25` - feat: Entity-Patterns erweitert (+12 neue Typen)

### 18.12.2024
- `36ad204` - feat: Lookup-Agent verknuepfte Objekte als Karten
- `6417e6e` - refactor: Lookup-Agent nutzt api.js Methoden
- `bb42928` - feat: API-Katalog komplett (87 GET Endpoints)
- `35d7a93` - feat: Entity-Patterns (17 Typen initial)

---

## Bekannte Bugs

### Lookup-Agent Related Objects
- **Symptom:** Karten zeigen "Keine" obwohl Daten existieren sollten
- **Ursache:** Moeglicherweise falsche Key-Extraktion
- **Fix:** In Arbeit

### GitHub Pages Build
- Gelegentlich fehlgeschlagen ohne klaren Grund
- Loesung: Leerer Commit zum Rebuild triggern

---

## Feature-Wuensche (Backlog)

1. Know-How Sicht aus Skills ableiten
2. VPW-Bulk-Verlagerung (~300 Werkzeuge)
3. Dashboard-Anpassung
4. Export-Konsistenz (CSV/Excel/PDF)

---

## API-Hinweise

### Token-Handling
- Token in `js/config/api-config.js`
- Bei User-Wechsel: Full Page Reload (F5) noetig
- `api.bearerToken` cached den Token

### Mock-Daten
- Fallback wenn API nicht erreichbar
- `js/data/mock-assets.json`
- 296 Test-Werkzeuge

---

## Team-Zugang

Beide Entwickler brauchen:
1. Git-Zugang zum Repository
2. Eigenen Claude Pro Account
3. Lokalen Clone mit `git clone https://github.com/OlliSparks/orca-app.git`

Skills werden ueber `skills/` Ordner im Repo geteilt.
