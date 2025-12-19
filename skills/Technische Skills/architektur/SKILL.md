# Architektur Skill

Beratung und Prüfung der technischen Architektur des Orca Asset-Management-Systems.

## Rolle

Der Architektur-Skill ist verantwortlich für:
- **Architektur-Beratung** - Empfehlung der bestmöglichen technischen Architektur
- **Verbesserungsvorschläge** - Identifikation von Optimierungspotenzial
- **Implementierungsprüfung** - Kontrolle der korrekten Umsetzung
- **Technische Schulden** - Erkennung und Priorisierung von Tech Debt

## Trigger
- Neue Feature-Entwicklung
- Performance-Probleme
- Skalierbarkeits-Anforderungen
- Code-Reviews
- Technologie-Entscheidungen
- Refactoring-Planung

## Aktuelle Architektur

### Orca App (Frontend)
```
orca-app/
├── index.html              # Single Page Application Entry
├── css/
│   └── styles.css          # Globale Styles
├── js/
│   ├── config/
│   │   └── api-config.js   # API-Konfiguration
│   ├── services/
│   │   ├── api.js          # API-Service Layer
│   │   └── auth.js         # Authentifizierung
│   ├── pages/
│   │   ├── dashboard.js    # Dashboard
│   │   ├── inventur.js     # Inventur-Seite
│   │   ├── verlagerung.js  # Verlagerung-Liste
│   │   └── ...             # Weitere Seiten
│   ├── router.js           # Client-Side Routing
│   └── app.js              # App-Initialisierung
└── assets/
    └── orca-logo.svg       # Logo und Assets
```

### Technologie-Stack
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Frontend | Vanilla JavaScript | ES6+ |
| Styling | CSS3 | - |
| API | REST | - |
| Auth | JWT Bearer Token | - |
| Hosting | GitHub Pages | - |
| Backend | Orca API (extern) | - |

## Architektur-Prinzipien

### 1. Separation of Concerns
```
┌─────────────────────────────────────────────────┐
│                    UI Layer                      │
│  (index.html, pages/*.js, css/styles.css)       │
├─────────────────────────────────────────────────┤
│                 Service Layer                    │
│  (api.js, auth.js)                              │
├─────────────────────────────────────────────────┤
│                 Config Layer                     │
│  (api-config.js, localStorage)                  │
├─────────────────────────────────────────────────┤
│              External API (Orca)                 │
└─────────────────────────────────────────────────┘
```

### 2. Single Responsibility
- Jede Page-Klasse verwaltet eine Seite
- API-Service kapselt alle Backend-Kommunikation
- Router verwaltet Navigation
- Auth-Service verwaltet Authentifizierung

### 3. DRY (Don't Repeat Yourself)
- Gemeinsame Styles in `styles.css`
- Wiederverwendbare API-Methoden
- Einheitliche Fehlerbehandlung

## Architektur-Checkliste

### Code-Struktur
- [ ] Klare Trennung von UI und Logik
- [ ] Konsistente Namenskonventionen
- [ ] Keine zirkulären Abhängigkeiten
- [ ] Modularisierung vorhanden

### Performance
- [ ] Lazy Loading wo sinnvoll
- [ ] Caching-Strategie definiert
- [ ] Minimale Bundle-Größe
- [ ] Effiziente DOM-Manipulation

### Wartbarkeit
- [ ] Code ist selbstdokumentierend
- [ ] Komplexe Logik kommentiert
- [ ] Einheitliche Formatierung
- [ ] Error Handling konsistent

### Skalierbarkeit
- [ ] Neue Seiten einfach hinzufügbar
- [ ] API-Endpunkte erweiterbar
- [ ] Konfiguration externalisiert
- [ ] State Management skaliert

## Verbesserungsvorschläge

### Kurzfristig (Quick Wins)
1. **Konstanten extrahieren** - Magic Numbers/Strings in Config
2. **Error Handling vereinheitlichen** - Zentrale Fehlerbehandlung
3. **Loading States** - Konsistente Lade-Anzeigen
4. **Console.log entfernen** - Debug-Ausgaben für Produktion entfernen

### Mittelfristig
1. **TypeScript Migration** - Typsicherheit erhöhen
2. **Unit Tests** - Kritische Funktionen testen
3. **Build Process** - Minification, Bundling
4. **Component Library** - Wiederverwendbare UI-Komponenten

### Langfristig
1. **Framework-Evaluation** - Vue.js/React für komplexere UIs
2. **State Management** - Zentrales State Management
3. **Offline-Fähigkeit** - Service Worker, IndexedDB
4. **Micro-Frontend** - Modulare Frontend-Architektur

## Code-Review Kriterien

### Must Have
- [ ] Keine Sicherheitslücken
- [ ] Keine Memory Leaks
- [ ] Error Handling vorhanden
- [ ] Responsive Design

### Should Have
- [ ] Performant implementiert
- [ ] Gut lesbar
- [ ] Testbar strukturiert
- [ ] Dokumentiert

### Nice to Have
- [ ] Elegante Lösung
- [ ] Wiederverwendbar
- [ ] Zukunftssicher

## Technologie-Entscheidungen

### Entscheidungs-Template
```markdown
## Entscheidung: [Titel]

### Kontext
[Warum ist eine Entscheidung nötig?]

### Optionen
1. Option A: [Beschreibung]
   - Pro: ...
   - Contra: ...

2. Option B: [Beschreibung]
   - Pro: ...
   - Contra: ...

### Entscheidung
[Gewählte Option und Begründung]

### Konsequenzen
[Auswirkungen der Entscheidung]
```

## Anti-Patterns vermeiden

### JavaScript
- ❌ Globale Variablen
- ❌ Callback Hell
- ❌ eval() verwenden
- ❌ innerHTML für User Input
- ✅ Klassen/Module verwenden
- ✅ async/await
- ✅ Template Literals mit Escaping

### CSS
- ❌ !important übermäßig
- ❌ Inline Styles
- ❌ ID-Selektoren für Styling
- ✅ BEM oder ähnliche Methodologie
- ✅ CSS Custom Properties
- ✅ Mobile-First Approach

### API
- ❌ Sensitive Daten in URL
- ❌ Fehlende Fehlerbehandlung
- ❌ Keine Timeout-Handling
- ✅ Zentrale API-Abstraktion
- ✅ Retry-Logik
- ✅ Request-Cancellation

## Referenzen
- `references/architecture-decisions.md` - Architektur-Entscheidungen (ADRs)
- `references/tech-debt-register.md` - Technische Schulden
- `references/performance-benchmarks.md` - Performance-Messungen
