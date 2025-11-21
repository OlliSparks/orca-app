# ORCA 2.0 - Inventory Service

Eine moderne Single-Page-Application (SPA) für das Werkzeug-Inventur Management.

## 🚀 Features

- **FM-Akte Verwaltung**: Vollständige Übersicht und Detailansicht aller Fertigungsmittel
- **Inventur-Modul**: Inventurverwaltung mit Lieferantensicht
- **Planungs-Modul**: Inventur-Planung und -Steuerung
- **Responsives Design**: Optimiert für Desktop, Tablet und Mobile
- **API-Ready**: Vorbereitet für Anbindung an Backend-APIs

## 📁 Projektstruktur

```
orca-app/
├── index.html              # Haupt-HTML-Datei
├── css/
│   └── styles.css          # Globale Styles und Design-System
├── js/
│   ├── app.js             # Haupt-Applikation
│   ├── router.js          # Routing-System
│   ├── services/
│   │   └── api.js         # API-Service-Layer
│   └── pages/
│       ├── fm-list.js     # FM-Akte Liste
│       ├── fm-detail.js   # FM-Akte Details
│       ├── inventur.js    # Inventur-Seite
│       └── planung.js     # Planungs-Seite
└── assets/                # Bilder und andere Assets
```

## 🎯 Installation & Start

### Option 1: Lokaler Webserver (empfohlen)

```bash
# Mit Python 3
cd orca-app
python -m http.server 8000

# Mit Node.js (npx http-server)
npx http-server orca-app -p 8000
```

Öffnen Sie dann: http://localhost:8000

### Option 2: Direkt im Browser

Öffnen Sie einfach die `index.html` Datei in Ihrem Browser.

**Hinweis**: Einige Funktionen benötigen einen Webserver (z.B. für CORS).

## 🔧 Technologie-Stack

- **Vanilla JavaScript** - Keine Framework-Abhängigkeiten
- **Modern CSS** - Flexbox, Grid, Custom Properties
- **Hash-based Routing** - Für SPA-Navigation
- **Mock API** - Für Entwicklung ohne Backend

## 📋 Verfügbare Seiten

### 1. FM-Akte Übersicht (`/`)
- Liste aller Fertigungsmittel (240 Mock-Einträge)
- Filterung nach Status (Offen, Feinplanung, in Inventur)
- Sortierung nach Spalten
- Suchfunktion
- Pagination (50 Einträge pro Seite)

### 2. FM-Akte Details (`/detail/:id`)
- Vollständige Detailansicht eines Fertigungsmittels
- Accordion-Sections für:
  - Übersicht
  - Details
  - Finanz- und Standortinformationen
  - Prozesse
  - Verwendung
  - Dokumente
- Bearbeitbare Felder

### 3. Inventur (`/inventur`)
- Inventur-Übersicht
- Status-Filter
- Basis-Funktionalität (wird noch erweitert)

### 4. Planung (`/planung`)
- Planungs-Übersicht
- Status-Filter
- Basis-Funktionalität (wird noch erweitert)

## 🔌 API-Integration

### Aktueller Status: Mock-Daten

Die Applikation verwendet derzeit Mock-Daten. Der API-Service-Layer ist bereits vorbereitet:

```javascript
// In js/services/api.js
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api'; // Ihre API URL hier
    }
    // ...
}
```

### API-Anbindung aktivieren

1. Öffnen Sie `js/services/api.js`
2. Ändern Sie `baseURL` zu Ihrer API-URL
3. Ersetzen Sie Mock-Methoden mit echten API-Calls:

```javascript
// Vorher (Mock):
async getFMList(filters = {}) {
    return this.getMockFMData(filters);
}

// Nachher (Echt):
async getFMList(filters = {}) {
    return await this.call('/fm/fertigungsmittel', 'GET');
}
```

### Erwartete API-Endpunkte

```
GET  /api/fm/fertigungsmittel          # Liste aller FM
GET  /api/fm/fertigungsmittel/:id      # FM Details
PUT  /api/fm/fertigungsmittel/:id      # FM aktualisieren
GET  /api/inventur                     # Inventur-Liste
PUT  /api/inventur/:id                 # Inventur aktualisieren
GET  /api/planung                      # Planungs-Liste
```

## 🎨 Design-System

Das Design basiert auf:
- **Primärfarbe**: #2c4a8c (Blau)
- **Sekundärfarbe**: #f97316 (Orange)
- **Font**: Oswald (Google Fonts)
- **Komponenten**: Buttons, Cards, Tables, Modals, Accordions

## 📱 Navigation

Die App verwendet Hash-based Routing:

- `/` oder `#/` - FM-Akte Übersicht
- `#/detail/:id` - FM-Akte Details
- `#/inventur` - Inventur
- `#/planung` - Planung

## 🚧 Nächste Schritte

### Phase 1: Basis-Funktionen ✅
- [x] App-Struktur erstellen
- [x] Design-System extrahieren
- [x] Router implementieren
- [x] API-Service-Layer vorbereiten
- [x] 4 Haupt-Seiten erstellen

### Phase 2: API-Integration (Next)
- [ ] Backend-API anbinden
- [ ] Echte Daten laden
- [ ] CRUD-Operationen implementieren
- [ ] Fehlerbehandlung verbessern
- [ ] Loading States verfeinern

### Phase 3: Erweiterte Features
- [ ] Inventur-Modul vollständig ausbauen (basierend auf orca-inventur-enhanced_9.html)
- [ ] Planungs-Modul vollständig ausbauen (basierend auf orca-inventur-planung-v7-final.html)
- [ ] Dokument-Upload/-Download
- [ ] PDF-Export
- [ ] Benutzer-Authentifizierung
- [ ] Benachrichtigungen
- [ ] Offline-Modus

### Phase 4: Optimierung
- [ ] Performance-Optimierung
- [ ] Code-Splitting
- [ ] PWA-Features
- [ ] Unit Tests
- [ ] E2E Tests

## 🐛 Bekannte Einschränkungen

- Verwendet derzeit Mock-Daten
- Inventur- und Planungs-Module sind in Basis-Version
- Einige Buttons führen zu Alerts (Platzhalter)
- Keine Authentifizierung
- Keine persistente Datenspeicherung

## 📝 Entwickler-Notizen

### Neue Seite hinzufügen

1. Erstellen Sie eine neue Datei in `js/pages/`
2. Implementieren Sie eine Klasse mit `render()` Methode
3. Registrieren Sie die Route in `js/app.js`:

```javascript
router.addRoute('/neue-seite', () => {
    neueSeitePage.render();
});
```

4. Fügen Sie einen Navigation-Link in `index.html` hinzu

### Styling anpassen

Alle globalen Styles befinden sich in `css/styles.css`. Verwenden Sie die bestehenden CSS-Klassen für Konsistenz.

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklerteam.

## 📄 Lizenz

Internes ORCA-Projekt. Alle Rechte vorbehalten.

---

**Version**: 1.0.0
**Letzte Aktualisierung**: November 2025
**Status**: Development ⚠️
