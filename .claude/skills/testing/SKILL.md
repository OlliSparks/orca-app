---
name: testing
description: "Test-Standards und Automatisierung fuer alle Prozesse. Definiert was getestet wird, wie Tests strukturiert sind und wie sie aus Prozess-Skills abgeleitet werden. Trigger: Prozess-Implementierung abgeschlossen, vor Release, nach Aenderungen."
---

# Testing Skill

> **Ziel:** Jeder Prozess-Skill wird durch automatisierte Tests abgesichert. Tests werden direkt aus dem Skill abgeleitet.

## Test-Pyramide fuer orca

```
        ┌─────────┐
        │  E2E    │  ← Wenige, kritische User-Journeys
        ├─────────┤
        │ Integr. │  ← API-Calls, Datenfluss
        ├─────────┤
        │  Unit   │  ← Einzelne Funktionen, Status-Logik
        └─────────┘
```

## Was wird aus jedem Prozess-Skill getestet?

### 1. Status-Maschine Tests
Aus dem Abschnitt "Status-Maschine" im Prozess-Skill:

```javascript
// Fuer jeden definierten Status-Uebergang:
test('Status: pending -> confirmed', () => {
  // Arrange: Tool im Status "pending"
  // Act: confirmTool() aufrufen
  // Assert: Status ist "confirmed"
});

// Fuer jeden NICHT erlaubten Uebergang:
test('Status: confirmed -> pending nur via reset', () => {
  // Assert: Direkter Uebergang nicht moeglich
});
```

**Ableitung:**
| Skill-Definition | Test |
|------------------|------|
| Status A → Status B | Positiv-Test fuer Uebergang |
| Kein Uebergang definiert | Negativ-Test (sollte fehlschlagen) |

### 2. API-Integration Tests
Aus dem Abschnitt "API-Integration" im Prozess-Skill:

```javascript
// Fuer jeden Endpunkt:
test('API: GET /inventory-list', async () => {
  // Mock API Response
  // Aufruf der Funktion
  // Assert: Daten korrekt verarbeitet
});

test('API: Fehlerfall 401', async () => {
  // Mock 401 Response
  // Assert: Korrektes Error-Handling
});
```

**Ableitung:**
| Skill-Definition | Test |
|------------------|------|
| GET /endpoint | Success-Case testen |
| POST /endpoint | Request-Body validieren |
| Jeder Endpunkt | Error-Cases (401, 404, 500) |

### 3. UI-Interaktion Tests
Aus dem Abschnitt "UI-Anforderungen" im Prozess-Skill:

```javascript
// Fuer jede definierte Aktion:
test('UI: Bestaetigen-Button setzt Status', () => {
  // Click auf Button
  // Assert: Status geaendert, UI aktualisiert
});

// Fuer jeden Filter:
test('UI: Filter "Offen" zeigt nur pending', () => {
  // Filter aktivieren
  // Assert: Nur passende Items sichtbar
});
```

**Ableitung:**
| Skill-Definition | Test |
|------------------|------|
| Aktion: Bestaetigen | Button-Click Test |
| Filter: Status | Filter-Logik Test |
| Modal: Standort | Modal oeffnet/schliesst |

### 4. Edge Case Tests
Aus dem Abschnitt "Edge Cases" im Prozess-Skill:

```javascript
// Fuer jeden dokumentierten Edge Case:
test('Edge: Kommentar erzeugt Klaerfall', () => {
  // Tool mit Kommentar bestaetigen
  // Assert: Status P3 statt P2
});
```

---

## Test-Struktur

```
tests/
├── unit/
│   ├── inventur/
│   │   ├── status.test.js      # Status-Maschine
│   │   ├── filters.test.js     # Filter-Logik
│   │   └── actions.test.js     # Einzelaktionen
│   └── [prozess]/
│       └── ...
├── integration/
│   ├── inventur/
│   │   ├── api.test.js         # API-Calls
│   │   └── dataflow.test.js    # Datenfluss
│   └── [prozess]/
│       └── ...
├── e2e/
│   ├── inventur.spec.js        # User Journey
│   └── [prozess].spec.js
└── mocks/
    ├── api-responses/
    │   ├── inventory-list.json
    │   └── ...
    └── setup.js
```

---

## Test-Namenskonvention

```
[Kategorie]: [Was] [Erwartet]

Beispiele:
- "Status: pending -> confirmed setzt Status korrekt"
- "API: GET inventory-list laedt Positionen"
- "UI: Filter Offen zeigt nur pending Items"
- "Edge: Leere Liste zeigt Platzhalter"
```

---

## Mindest-Testabdeckung pro Prozess

### Pflicht (vor Release)
- [ ] Alle Status-Uebergaenge (positiv)
- [ ] Alle Status-Uebergaenge (negativ/ungueltig)
- [ ] Alle API-Endpunkte (Success)
- [ ] API Error-Handling (401, 500)
- [ ] Alle UI-Aktionen
- [ ] Alle Filter
- [ ] Dokumentierte Edge Cases

### Optional (erweiternd)
- [ ] Performance-Tests (Ladezeit)
- [ ] Accessibility-Tests
- [ ] Mobile-spezifische Tests

---

## Test-Framework Setup

Da das Projekt aktuell ohne npm ist, Optionen:

### Option A: Playwright (empfohlen fuer E2E)
```bash
npm init -y
npm install -D @playwright/test
npx playwright install
```

### Option B: Jest (fuer Unit/Integration)
```bash
npm install -D jest jsdom
```

### Option C: Vitest (modern, schnell)
```bash
npm install -D vitest jsdom
```

---

## Workflow: Tests aus Skill erstellen

### Schritt 1: Skill analysieren
```markdown
Aus processes/inventur/SKILL.md extrahieren:
- Status: pending, confirmed, relocated, missing
- Uebergaenge: pending→confirmed, pending→relocated, etc.
- API: GET /inventory-list, GET /inventory/{key}/positions
- Aktionen: confirm, relocate, missing, reset
- Edge Cases: Kommentar=Klaerfall, Ueberfaellig
```

### Schritt 2: Test-Datei erstellen
```javascript
// tests/unit/inventur/status.test.js
describe('Inventur Status-Maschine', () => {
  // Ein Test pro Uebergang aus Skill
});
```

### Schritt 3: Tests implementieren
```javascript
test('Status: pending -> confirmed', () => {
  const tool = { id: '1', status: 'pending' };
  inventurPage.tools = [tool];

  inventurPage.confirmTool('1');

  expect(tool.status).toBe('confirmed');
});
```

### Schritt 4: Ausfuehren und validieren
```bash
npm test
# oder
npx playwright test
```

---

## Test-Template Generator

Fuer jeden Prozess-Skill kann folgendes Template generiert werden:

```javascript
// tests/unit/[prozess]/status.test.js
// Automatisch generiert aus: .claude/skills/processes/[prozess]/SKILL.md

describe('[Prozess] Status-Maschine', () => {
  // TODO: Tests fuer jeden Status-Uebergang
});

describe('[Prozess] API-Integration', () => {
  // TODO: Tests fuer jeden Endpunkt
});

describe('[Prozess] UI-Aktionen', () => {
  // TODO: Tests fuer jede Aktion
});

describe('[Prozess] Edge Cases', () => {
  // TODO: Tests fuer jeden Edge Case
});
```

---

## Checkliste: Prozess-Tests vollstaendig?

```
PROZESS: ________________

STATUS-MASCHINE
[ ] Alle Status definiert und getestet
[ ] Alle Uebergaenge (positiv) getestet
[ ] Ungueltige Uebergaenge getestet
[ ] Reset/Rueckgaengig getestet

API-INTEGRATION
[ ] Alle GET-Endpunkte getestet
[ ] Alle POST/PATCH-Endpunkte getestet
[ ] Error 401 (Auth) behandelt
[ ] Error 404 (Not Found) behandelt
[ ] Error 500 (Server) behandelt
[ ] Timeout behandelt

UI-AKTIONEN
[ ] Alle Buttons/Aktionen getestet
[ ] Alle Filter getestet
[ ] Alle Modals getestet
[ ] Pagination getestet
[ ] Sortierung getestet

EDGE CASES
[ ] Leerer Zustand getestet
[ ] Alle dokumentierten Edge Cases getestet

ERGEBNIS
[ ] Alle Tests gruen
[ ] Coverage >= 80%
```

---

## Integration mit anderen Skills

### Aus Prozess-Skill ableiten
- Status-Maschine → Status-Tests
- API-Integration → API-Tests
- UI-Anforderungen → UI-Tests
- Edge Cases → Edge-Case-Tests

### UX-Audit validieren
- Ladezeit < 2s → Performance-Test
- Touch-Targets → Accessibility-Test
- Feedback sichtbar → UI-State-Test
