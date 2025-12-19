# Deployment Skill

Voraussetzungen, Prozessbeschreibung und Durchführung aller Deployment-relevanten Tätigkeiten für das Orca Asset-Management-System.

## Rolle

Der Deployment-Skill ist verantwortlich für:
- **Voraussetzungen prüfen** - Sicherstellen aller Deployment-Bedingungen
- **Prozessbeschreibung** - Dokumentation des Deployment-Prozesses
- **Durchführung** - Ausführung aller Deployment-Tätigkeiten
- **Rollback** - Wiederherstellung bei Problemen

## Trigger
- Neue Version bereit für Release
- Hotfix erforderlich
- Konfigurationsänderung
- Infrastruktur-Update

## Aktuelle Deployment-Umgebung

### GitHub Pages (Produktion)
| Eigenschaft | Wert |
|-------------|------|
| Repository | `OlliSparks/orca-app` |
| Branch | `main` |
| URL | `https://ollisparks.github.io/orca-app/` |
| Auto-Deploy | Ja (bei Push auf main) |
| SSL | Automatisch (Let's Encrypt) |

### Lokale Entwicklung
| Eigenschaft | Wert |
|-------------|------|
| Pfad | `C:\Users\orcao\orca-app-github` |
| Server | Live Server / Python HTTP |
| Port | 5500 (Live Server) / 8000 (Python) |

## Voraussetzungen

### Vor jedem Deployment
- [ ] Alle Tests bestanden
- [ ] Code-Review abgeschlossen
- [ ] Keine offenen P0/P1-Bugs
- [ ] Dokumentation aktualisiert
- [ ] Changelog gepflegt
- [ ] Version hochgezählt (wenn applicable)

### Technische Voraussetzungen
- [ ] Git installiert und konfiguriert
- [ ] GitHub-Zugang mit Push-Rechten
- [ ] Lokale Kopie aktuell (`git pull`)
- [ ] Keine uncommitteten Änderungen

### Umgebungs-Check
```bash
# Git Status prüfen
git status

# Auf aktuellem Stand?
git fetch origin
git status

# Keine Merge-Konflikte?
git pull origin main
```

## Deployment-Prozess

### Standard-Deployment (GitHub Pages)

#### 1. Änderungen committen
```bash
# Status prüfen
git status

# Änderungen stagen
git add -A

# Commit erstellen
git commit -m "feat/fix/chore: Beschreibung der Änderung

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 2. Push zu GitHub
```bash
# Push auf main Branch
git push origin main
```

#### 3. Deployment verifizieren
- GitHub Actions prüfen (falls konfiguriert)
- Live-URL aufrufen: https://ollisparks.github.io/orca-app/
- Cache leeren (Ctrl+Shift+R)
- Grundfunktionen testen

### Hotfix-Deployment

#### Bei kritischen Bugs
```bash
# 1. Schnellen Fix erstellen
git add [betroffene Dateien]
git commit -m "hotfix: Kritischen Bug beheben - [Beschreibung]"

# 2. Sofort pushen
git push origin main

# 3. Verifizieren
# - Live-Site prüfen
# - Bug-Fix bestätigen
# - Keine Regression
```

### Rollback-Prozess

#### Bei Problemen nach Deployment
```bash
# 1. Letzten funktionierenden Commit finden
git log --oneline -10

# 2. Zurücksetzen (VORSICHT!)
git revert HEAD
git push origin main

# ODER bei mehreren Commits:
git revert HEAD~3..HEAD
git push origin main
```

## Deployment-Checkliste

### Pre-Deployment
- [ ] Lokale Version funktioniert
- [ ] API-Verbindung getestet
- [ ] Alle Seiten laden korrekt
- [ ] Keine Console-Errors
- [ ] Mobile-Ansicht geprüft

### Deployment
- [ ] Git Status sauber
- [ ] Commit-Message aussagekräftig
- [ ] Push erfolgreich
- [ ] GitHub Pages Build erfolgreich

### Post-Deployment
- [ ] Live-Site erreichbar
- [ ] Login funktioniert
- [ ] Hauptfunktionen testen
- [ ] Performance akzeptabel
- [ ] Keine neuen Errors in Console

## Umgebungen

### Entwicklung (lokal)
```
URL: http://localhost:5500
API: https://int.bmw.organizingcompanyassets.com/api/orca
Mode: Live oder Mock
```

### Produktion (GitHub Pages)
```
URL: https://ollisparks.github.io/orca-app/
API: https://int.bmw.organizingcompanyassets.com/api/orca
Mode: Live
```

## Cache-Invalidierung

### Browser-Cache leeren
- **Chrome**: Ctrl+Shift+R (Hard Reload)
- **Firefox**: Ctrl+F5
- **Safari**: Cmd+Option+R

### Cache-Busting im Code
```html
<!-- In index.html am Ende -->
<!-- Cache bust: [Datum/Zeit] -->
```

```javascript
// Oder mit Version-Parameter
const API_VERSION = '1.0.1';
fetch(`/api/data?v=${API_VERSION}`)
```

## Monitoring nach Deployment

### Zu prüfende Metriken
1. **Verfügbarkeit** - Seite erreichbar?
2. **Ladezeit** - Performance akzeptabel?
3. **Fehlerrate** - Console-Errors?
4. **API-Calls** - Backend erreichbar?

### Schnell-Test-Skript
```javascript
// In Browser-Console ausführen
console.log('=== Deployment-Check ===');
console.log('API Mode:', api.mode);
console.log('Base URL:', api.baseURL);
console.log('Connected:', api.isConnected);

// API-Test
api.getProfile().then(r => console.log('Profile:', r.success));
```

## Troubleshooting

### Problem: Seite lädt nicht
1. GitHub Pages Status prüfen: https://www.githubstatus.com/
2. Repository Settings → Pages prüfen
3. Branch korrekt (`main`)?
4. index.html vorhanden?

### Problem: Alte Version wird angezeigt
1. Browser-Cache leeren
2. GitHub Actions Status prüfen
3. Deployment-Zeit prüfen (kann 1-2 Min dauern)

### Problem: API-Fehler nach Deployment
1. CORS-Einstellungen prüfen
2. API-URL korrekt?
3. Bearer Token noch gültig?
4. Network-Tab in DevTools prüfen

## Automatisierung (Zukunft)

### GitHub Actions Workflow (Beispiel)
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Referenzen
- `references/deployment-history.md` - Deployment-Historie
- `references/rollback-procedures.md` - Detaillierte Rollback-Anleitung
- `references/environment-config.md` - Umgebungs-Konfigurationen
