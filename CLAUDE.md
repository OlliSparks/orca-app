# ORCA 2.0 - Lieferanten-Applikation

## Projekt-Uebersicht

**ORCA 2.0** ist eine Progressive Web App (PWA) fuer das Asset-Management von BMW-Werkzeugen bei Lieferanten. Die App ermoeglicht Inventuren, Verlagerungen, Verschrottungen und Partnerwechsel (VPW).

- **Live-URL:** https://ollisparks.github.io/orca-app/
- **Repository:** https://github.com/OlliSparks/orca-app
- **API:** https://int.bmw.organizingcompanyassets.com/api/orca

---

## Architektur

```
orca-app-github/
├── index.html              # Single Page App Entry
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker (Offline/Cache)
├── css/
│   └── styles.css          # ~6500 Zeilen, alle Features
├── js/
│   ├── config/
│   │   └── api-config.js   # API-Konfiguration, Bearer Token
│   ├── services/           # 18 Service-Module
│   ├── pages/              # 38 Page-Module
│   ├── data/               # Datenkataloge
│   └── app.js              # Haupt-App, Router
├── skills/                 # Claude Code Skills (NEU)
│   ├── Fachliche Skills/
│   ├── Prozess-Skills/
│   ├── Rollen-Skills/
│   └── Technische Skills/
├── assets/                 # Bilder, Icons
└── testdaten/              # Mock-Daten fuer Entwicklung
```

---

## Services (js/services/) - 18 Module

| Service | Datei | Funktion |
|---------|-------|----------|
| API | api.js (~3600 Zeilen) | REST-Calls, Token-Handling, Mock-Fallback |
| Auth | auth.js | Keycloak-Integration, Token-Refresh |
| Permission | permission-service.js | Rollen-Matrix, Zugriffskontrolle |
| Error | error-service.js | Toast-Notifications, Dialoge |
| Loading | loading-service.js | Skeleton-Screens |
| Keyboard | keyboard-service.js | Shortcuts (g+d, g+i, Ctrl+K) |
| Breadcrumb | breadcrumb-service.js | Navigationspfad |
| Search | search-service.js | Globale Suche |
| Theme | theme-service.js | Dark Mode |
| Bulk Actions | bulk-actions-service.js | Multi-Select Operationen |
| Offline | offline-service.js | Service Worker Integration |
| Notification | notification-service.js | Push Notifications |
| Form | form-service.js | Validierung, Auto-Save |
| DragDrop | dragdrop-service.js | Datei-Upload |
| Animation | animation-service.js | Page Transitions |
| Accessibility | accessibility-service.js | ARIA, Screen Reader |
| Message | message-service.js | Nachrichten-Sync |
| Onboarding | onboarding.js | First-Visit, Glossar, Tour |

---

## Pages (js/pages/) - 38 Module

### Haupt-Sichten
- `dashboard.js` - Startseite mit Statistiken
- `inventur.js` - Inventurliste
- `inventur-detail.js` - Inventur-Details
- `verlagerung.js` - Verlagerungen (Tab-Navigation)
- `abl.js` - Abnahmebereitschaftserklaerungen
- `verschrottung.js` - Verschrottungsprozesse
- `partnerwechsel.js` - VPW-Prozesse
- `planung.js` - Inventurplanung
- `fm-akte.js` - FM-Akte (Werkzeug-Details)
- `unternehmen.js` - Firmen-/Standortverwaltung
- `messages.js` - Nachrichten
- `profil.js` - Benutzerprofil
- `glossar.js` - Begriffsglossar
- `einstellungen.js` - Einstellungen

### KI-Agenten (Lieferanten)
- `agent-inventur.js` - Inventur-Assistent
- `agent-inventurplanung.js` - Planungs-Assistent
- `agent-verlagerung.js` - Verlagerungs-Assistent
- `agent-verlagerung-beantragen.js` - Antrag stellen
- `agent-verlagerung-durchfuehren.js` - Durchfuehrung
- `agent-abl.js` - ABL-Assistent
- `agent-verschrottung.js` - Verschrottungs-Assistent
- `agent-vpw.js` - VPW-Assistent

### KI-Agenten (Intern - nur SUP-Rolle)
- `agent-api-monitor.js` - API-Monitoring
- `agent-berechtigungen.js` - Berechtigungs-Matrix
- `agent-bugs.js` - Bug-Reporting
- `agent-backlog.js` - Kanban-Board
- `agent-skills.js` - Skill-Editor
- `agent-allgemein.js` - ORCA-Wissensdatenbank
- `agent-lookup.js` - Universelle Suche (Entity Recognition)

### Daten-Module (js/data/)
- `api-catalog.js` - 87 GET-Endpoints dokumentiert
- `entity-patterns.js` - 29 Entity-Typen fuer Erkennung
- `skills-data.js` - Skill-Preload
- `mock-assets.json` - Test-Werkzeuge

---

## Skills (skills/)

### Fachliche Skills
| Skill | Pfad | Beschreibung |
|-------|------|--------------|
| supplier-persona | Fachliche Skills/supplier-persona/ | Lieferanten-Perspektive, UX-Prinzipien |
| ci-orca-app | Fachliche Skills/ci-orca-app/ | Corporate Design ORCA App |
| ci-website | Fachliche Skills/ci-website/ | Corporate Design Website |
| iam | Fachliche Skills/iam/ | Identity & Access Management |
| product-owner | Fachliche Skills/product-owner/ | PO-Entscheidungen |
| allgemein | Fachliche Skills/allgemein/ | Allgemein-Agent Kontext |
| jurist | Fachliche Skills/jurist/ | Rechtliche Aspekte |

### Prozess-Skills
| Skill | Pfad | Beschreibung |
|-------|------|--------------|
| inventur | Prozess-Skills/inventur/ | Inventur-Workflow |
| inventurplanung | Prozess-Skills/inventurplanung/ | Planungs-Workflow |
| verlagerung | Prozess-Skills/verlagerung/ | Verlagerungs-Workflow |
| abl | Prozess-Skills/abl/ | ABL-Workflow (16 Schritte) |
| verschrottung | Prozess-Skills/verschrottung/ | Verschrottungs-Workflow |
| vpw | Prozess-Skills/vpw/ | Partnerwechsel-Workflow |

### Rollen-Skills (Lieferanten)
`ivl`, `wvl`, `wvl-loc`, `id`, `itl`, `vvl`, `liw`

### Rollen-Skills (BMW)
`fek`, `cl`, `vec`, `sup`, `abc`, `stc`

### Technische Skills
| Skill | Pfad | Beschreibung |
|-------|------|--------------|
| orca-api | Technische Skills/orca-api/ | API-Dokumentation, OpenAPI-Spec |

---

## Berechtigungen & Rollen

### Lieferanten-Rollen
- **IVL** - Inventurverantwortlicher Lieferant
- **WVL** - Werkzeugverantwortlicher Lieferant
- **WVL-LOC** - WVL pro Standort
- **ID** - Inventurdurchfuehrer
- **ITL** - IT-Verantwortlicher Lieferant
- **VVL** - Versand-Verantwortlicher

### BMW-Rollen
- **FEK** - Facheinkaufer
- **CL** - Genehmiger/Approver
- **SUP** - Support/Inventurbuero (Admin)

### Berechtigungs-Matrix
Siehe `permission-service.js` - Matrix definiert Lese/Schreib/Admin-Rechte pro Rolle und View.

---

## API-Integration

### Basis-Konfiguration
```javascript
// js/config/api-config.js
const config = {
    apiBaseUrl: 'https://int.bmw.organizingcompanyassets.com/api/orca',
    bearerToken: 'Bearer eyJ...'  // JWT Token
};
```

### Wichtige Endpoints
| Zweck | Endpoint |
|-------|----------|
| Werkzeug suchen | `/asset-list?query=X` |
| Werkzeug-Details | `/asset/{key}` |
| Inventurliste | `/inventory-list?status=I0,I2...` |
| Positionen | `/inventory/{key}/positions` |
| Firma suchen | `/companies?query=X` |
| Prozesse | `/process?md.p.type=RELOCATION.C` |

### Entity-Patterns (Lookup-Agent)
29 Typen: `toolNumber`, `orderPosition`, `identifier`, `partNumber`, `derivat`, `project`, `department`, `companyNumber`, `companyName`, `inventoryNumber`, `uuid`, `email`, `roleCode`, etc.

---

## Aktuelle Issues / TODOs

### Lookup-Agent (Prioritaet: Hoch)
- [ ] Related Objects laden nicht korrekt (FM-Akte, Prozess-Historie zeigen "Keine")
- [ ] Console-Logs fuer Debugging aktiv
- [ ] Key-Extraktion aus API-Response pruefen

### Backlog
- [ ] Know-How Sicht aus Skills ableiten
- [ ] VPW-Bulk-Verlagerung (~300 Werkzeuge)

---

## Entwicklungs-Workflow

### Git
```bash
cd /c/Users/orcao/orca-app-github
git status
git add .
git commit -m "feat: Beschreibung"
git push
```

### Cache-Busting
Bei JS-Aenderungen Cache-Buster in index.html aktualisieren:
```html
<script src="js/pages/agent-lookup.js?v=20251218c" defer></script>
```

### Testen
1. Hard Refresh: `Ctrl+Shift+R`
2. Console oeffnen: `F12`
3. Live-URL: https://ollisparks.github.io/orca-app/

---

## Quick-Checks

### Bei Features (Supplier-Persona)
- [ ] Kann der Lieferant das nebenbei erledigen?
- [ ] Unterstuetzt es alle 6 Automatisierungsstufen?
- [ ] Kann er Teilaufgaben delegieren?
- [ ] Funktioniert es ohne Foto, ohne Barcode?
- [ ] Was passiert bei Kommentar? (-> Klaerfall!)

### Bei API-Integration
- [ ] Welcher Endpunkt ist der richtige? (siehe api-catalog.js)
- [ ] Welche Status-Codes sind relevant?
- [ ] Ist Mock-Fallback implementiert?

### Bei UI-Aenderungen
- [ ] Dark Mode kompatibel?
- [ ] Mobile responsive?
- [ ] Keyboard navigierbar?
- [ ] ARIA-Labels vorhanden?

---

## Kontakte

- **Projekt:** ORCA - Organizing Company Assets
- **Kunde:** BMW Group
- **Skills-Pflege:** OneDrive/Orca-Skills (sync mit skills/)
