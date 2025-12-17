# ORCA 2.0 - Projekt-Dokumentation

## Projektübersicht

ORCA 2.0 ist ein modernes Frontend für Lieferanten im Asset-Management. Die App ermöglicht Lieferanten die Verwaltung ihrer Werkzeuge, Inventuren, Verlagerungen und weiterer Prozesse.

---

## Aktuelle Architektur

### Was wir haben

| Komponente | Status | Beschreibung |
|------------|--------|--------------|
| **Frontend** | ✅ In Entwicklung | Standalone SPA (Single Page Application) |
| **Backend** | ⏸️ Bestehendes System | Anbindung an bestehende ORCA-Umgebung via REST-API |
| **Datenbank** | ⏸️ Bestehendes System | Keine eigene DB, Daten kommen aus bestehendem Backend |

### Was wir bewusst NICHT haben

| Komponente | Grund |
|------------|-------|
| **Eigenes Backend** | Kommt später - erst Frontend fertigstellen |
| **Schreiboperationen** | Noch deaktiviert - wird aktiviert wenn Frontend fertig |
| **Rollensystem** | Noch nicht implementiert - kommt kurzfristig |
| **Authentifizierung** | Komplexes Thema - Anbindung an OEM-Fremdsystem nötig |

---

## Technische Entscheidungen

### Frontend-Only Ansatz (aktuell)

```
┌─────────────────────────────────────────────────────┐
│                    ORCA 2.0 Frontend                │
│  ┌─────────────────────────────────────────────┐    │
│  │  SPA (HTML/CSS/JavaScript)                  │    │
│  │  - Keine Frameworks (Vanilla JS)            │    │
│  │  - PWA-fähig (Service Worker)               │    │
│  │  - Offline-Unterstützung                    │    │
│  └─────────────────────────────────────────────┘    │
│                         │                           │
│                         ▼                           │
│  ┌─────────────────────────────────────────────┐    │
│  │  API-Service (js/services/api.js)           │    │
│  │  - REST-Calls zum bestehenden Backend       │    │
│  │  - Mock-Modus für Entwicklung               │    │
│  │  - Aktuell: NUR LESEN, kein Schreiben       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Bestehendes ORCA Backend               │
│  (Bleibt unverändert bis eigenes Backend kommt)     │
└─────────────────────────────────────────────────────┘
```

### Warum dieser Ansatz?

1. **Schnelle Iteration** - Frontend kann unabhängig entwickelt werden
2. **Kein Risiko** - Bestehendes System bleibt unberührt
3. **Klare Trennung** - Frontend-Logik von Backend-Logik getrennt
4. **Einfaches Testing** - Mock-Modus ermöglicht Entwicklung ohne Backend

---

## Roadmap

### Phase 1: Frontend fertigstellen (AKTUELL)
- [x] Grundlegende Seitenstruktur
- [x] Alle Prozess-Ansichten (Inventur, Verlagerung, ABL, VPW, Verschrottung)
- [x] KI-Agenten für alle Prozesse
- [x] UX-Verbesserungen (Dark Mode, Keyboard, Search, etc.)
- [ ] Rollensystem implementieren
- [ ] Authentifizierung (OEM-Anbindung) - **Herausforderung**
- [ ] Schreiboperationen aktivieren

### Phase 2: Produktiv-Rollout
- [ ] Pilotphase mit ausgewählten Lieferanten
- [ ] Feedback sammeln und einarbeiten
- [ ] Schrittweise Ausrollung

### Phase 3: Eigenes Backend (ZUKUNFT)
- [ ] Backend-Architektur planen
- [ ] Eigene Datenbank aufsetzen
- [ ] API-Schicht entwickeln
- [ ] Migration vom bestehenden System

### Phase 4: Unabhängige Lösung
- [ ] Vollständig eigenständiges System
- [ ] Prozesse vereinfachen und neu gestalten
- [ ] Unabhängigkeit vom bisherigen System

---

## Offene Herausforderungen

### 1. Authentifizierung (Priorität: Hoch)
**Problem:** Lieferanten müssen sich gegen ein Fremdsystem des OEM authentifizieren.

**Mögliche Ansätze:**
- OAuth2/OIDC mit OEM-Identity-Provider
- SAML-Integration
- Token-basierte Lösung mit Proxy

**Status:** Noch zu klären

### 2. Rollensystem (Priorität: Mittel)
**Anforderung:** Unterschiedliche Berechtigungen für verschiedene Nutzertypen.

**Geplante Rollen:**
- Lieferant (Standard)
- Lieferant-Admin (erweiterte Rechte)
- Support (Read-Only für Hilfestellung)

**Status:** Kurzfristig anzugehen

### 3. Schreiboperationen (Priorität: Mittel)
**Aktuell:** Alle Änderungen werden nur lokal/im Mock gespeichert.

**Geplant:** Aktivierung wenn:
- Frontend-Features stabil
- Authentifizierung gelöst
- Rollensystem implementiert

---

## Entwicklungs-Prinzipien

### Keep it Simple
- Prozesse so einfach wie möglich gestalten
- Keine Over-Engineering
- Step by Step vorgehen

### User First
- Lieferanten-Perspektive immer im Fokus
- Intuitive Bedienung ohne Schulung
- Mobile-friendly (PWA)

### Unabhängigkeit
- Langfristiges Ziel: Eigenständige Lösung
- Keine harten Abhängigkeiten zum bestehenden System
- Modulare Architektur für einfache Migration

---

## Technologie-Stack

### Frontend (aktuell)
- **HTML5** - Semantisches Markup
- **CSS3** - Custom Properties für Theming, kein Framework
- **Vanilla JavaScript** - Kein React/Vue/Angular, bewusste Entscheidung
- **PWA** - Service Worker, Manifest, Offline-Support

### Services (js/services/)
| Service | Zweck |
|---------|-------|
| `api.js` | REST-API Kommunikation |
| `auth.js` | Authentifizierung (vorbereitet) |
| `error-service.js` | Toast-Notifications |
| `theme-service.js` | Dark/Light Mode |
| `search-service.js` | Globale Suche |
| `onboarding.js` | Glossar, Tour, FAQ |
| ... | weitere Services |

### Backend (zukünftig - noch zu definieren)
- Technologie: TBD
- Datenbank: TBD
- Hosting: TBD

---

## Kontakt & Support

Bei Fragen zur Architektur oder Entwicklung:
- Repository: https://github.com/OlliSparks/orca-app
- Issues: https://github.com/OlliSparks/orca-app/issues

---

*Letzte Aktualisierung: Dezember 2024*
