# Testautomatisierung Skill

Erstellung automatisierter Tests für alle Prozesse und Rollen/Berechtigungen im Orca Asset-Management-System.

## Rolle

Der Testautomatisierung-Skill ist verantwortlich für:
- **Test-Erstellung** - Automatisierte Tests für alle Prozesse
- **Rollen-Tests** - Tests für Berechtigungen und Rollen
- **Test-Reports** - Automatisierte Erzeugung von Test-Reports
- **CI/CD-Integration** - Integration in Build-Pipeline

## Trigger
- Neue Features implementiert
- Bug-Fixes
- Refactoring
- Release-Vorbereitung
- Regressionstests

## Test-Strategie

### Test-Pyramide
```
         /\
        /  \        E2E Tests (wenige)
       /────\       - Komplette User Journeys
      /      \      - Browser-Automatisierung
     /────────\
    /          \    Integration Tests (mittel)
   /────────────\   - API-Tests
  /              \  - Komponenten-Zusammenspiel
 /────────────────\
/                  \ Unit Tests (viele)
                    - Einzelne Funktionen
                    - Isolierte Logik
```

### Test-Abdeckung Ziele
| Bereich | Ziel | Priorität |
|---------|------|-----------|
| API-Service | 80% | Hoch |
| Geschäftslogik | 90% | Hoch |
| UI-Komponenten | 60% | Mittel |
| E2E User Flows | Kritische Pfade | Hoch |

## Test-Framework Setup

### Empfohlene Tools
| Zweck | Tool | Alternative |
|-------|------|-------------|
| Unit Tests | Jest | Mocha + Chai |
| E2E Tests | Playwright | Cypress |
| API Tests | Jest + fetch-mock | Supertest |
| Coverage | Istanbul/nyc | Jest --coverage |
| Reports | jest-html-reporter | Allure |

### Projekt-Setup
```bash
# Package.json erstellen
npm init -y

# Test-Dependencies installieren
npm install --save-dev jest @jest/globals
npm install --save-dev playwright @playwright/test
npm install --save-dev jest-html-reporter

# Jest konfigurieren
npx jest --init
```

### Jest Konfiguration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Orca Test Report',
      outputPath: 'reports/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ]
};
```

## Test-Kategorien

### 1. Unit Tests

#### API-Service Tests
```javascript
// tests/unit/api.test.js
import { APIService } from '../../js/services/api.js';

describe('APIService', () => {
  let api;

  beforeEach(() => {
    api = new APIService();
    api.mode = 'mock';
  });

  describe('getProfile', () => {
    test('should return profile in mock mode', async () => {
      const result = await api.getProfile();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('name');
    });
  });

  describe('mapRelocationStatus', () => {
    test('should map I to offen', () => {
      expect(api.mapRelocationStatus('I')).toBe('offen');
    });

    test('should map C to abgeschlossen', () => {
      expect(api.mapRelocationStatus('C')).toBe('abgeschlossen');
    });

    test('should handle unknown status', () => {
      expect(api.mapRelocationStatus('X')).toBe('offen');
    });
  });
});
```

#### Utility Functions Tests
```javascript
// tests/unit/utils.test.js
describe('Date Formatting', () => {
  test('formatDate should format ISO date to German format', () => {
    const result = formatDate('2025-06-28');
    expect(result).toBe('28.06.2025');
  });

  test('formatDate should handle null', () => {
    const result = formatDate(null);
    expect(result).toBe('-');
  });
});
```

### 2. Prozess-Tests

#### Inventur-Prozess
```javascript
// tests/processes/inventur.test.js
describe('Inventur Process', () => {
  describe('Status Workflow', () => {
    test('P0 -> P2: Position bestätigen', async () => {
      const position = { status: 'P0' };
      const result = await updatePosition(position.id, { status: 'P2' });
      expect(result.status).toBe('P2');
    });

    test('P0 -> P3: Position nicht gefunden', async () => {
      const position = { status: 'P0' };
      const result = await updatePosition(position.id, { status: 'P3' });
      expect(result.status).toBe('P3');
    });

    test('P0 -> P4: Klärfall mit Kommentar', async () => {
      const position = { status: 'P0' };
      const result = await updatePosition(position.id, {
        status: 'P4',
        comment: 'Beschädigung festgestellt'
      });
      expect(result.status).toBe('P4');
      expect(result.comment).toBeTruthy();
    });
  });

  describe('Delegation', () => {
    test('Position an Benutzer zuweisen', async () => {
      const result = await assignPosition(positionId, userId);
      expect(result.assignedUser).toBe(userId);
    });
  });
});
```

#### Verlagerung-Prozess
```javascript
// tests/processes/verlagerung.test.js
describe('Verlagerung Process', () => {
  describe('Data Loading', () => {
    test('should load relocation list', async () => {
      const result = await api.getVerlagerungList();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('should filter by supplier', async () => {
      api.supplierNumber = '133188';
      const result = await api.getVerlagerungList();
      result.data.forEach(item => {
        expect(item.supplier).toContain('133188');
      });
    });
  });

  describe('Field Mapping', () => {
    test('should map relo.from.address to sourceLocation', async () => {
      const detail = await api.getRelocationDetail(processKey);
      expect(detail.data.sourceLocation).toBeDefined();
    });
  });
});
```

### 3. Rollen- und Berechtigungs-Tests

```javascript
// tests/authorization/roles.test.js
describe('Role-Based Access Control', () => {
  describe('Supplier Role (SUP)', () => {
    beforeEach(() => {
      setUserRole('SUP');
    });

    test('can view own inventory', async () => {
      const result = await api.getInventoryList();
      expect(result.success).toBe(true);
    });

    test('can confirm positions', async () => {
      const result = await api.updatePosition(positionId, { status: 'P2' });
      expect(result.success).toBe(true);
    });

    test('cannot access admin functions', async () => {
      await expect(api.deleteUser(userId)).rejects.toThrow('Forbidden');
    });
  });

  describe('Inventory Lead Role (IVL)', () => {
    beforeEach(() => {
      setUserRole('IVL');
    });

    test('can delegate positions', async () => {
      const result = await api.assignPosition(positionId, userId);
      expect(result.success).toBe(true);
    });

    test('can view all positions in inventory', async () => {
      const result = await api.getInventoryPositions(inventoryKey);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      setUserRole('Admin');
    });

    test('can access all functions', async () => {
      const functions = [
        () => api.getInventoryList(),
        () => api.getVerlagerungList(),
        () => api.getCompanyDetails(),
        () => api.getUserList()
      ];

      for (const fn of functions) {
        const result = await fn();
        expect(result.success).toBe(true);
      }
    });
  });
});
```

### 4. E2E Tests

```javascript
// tests/e2e/inventur-workflow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Inventur Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://ollisparks.github.io/orca-app/');
    // Login/Setup
  });

  test('Complete inventory confirmation flow', async ({ page }) => {
    // 1. Navigate to Inventur
    await page.click('select#navDropdown');
    await page.selectOption('select#navDropdown', '/inventur');

    // 2. Wait for list to load
    await page.waitForSelector('table tbody tr');

    // 3. Click on first position
    await page.click('table tbody tr:first-child');

    // 4. Confirm position
    await page.click('button:has-text("Bestätigen")');

    // 5. Verify status changed
    await expect(page.locator('.status-badge')).toContainText('Bestätigt');
  });

  test('Delegate position to user', async ({ page }) => {
    await page.goto('/inventur');

    // Select position
    await page.click('table tbody tr:first-child input[type="checkbox"]');

    // Open delegate dropdown
    await page.click('select#delegateUser');
    await page.selectOption('select#delegateUser', 'user-123');

    // Confirm delegation
    await page.click('button:has-text("Zuweisen")');

    // Verify
    await expect(page.locator('.toast')).toContainText('erfolgreich');
  });
});
```

## Test-Report Generierung

### Automatischer HTML-Report
```javascript
// scripts/generate-report.js
const { execSync } = require('child_process');
const fs = require('fs');

// Tests ausführen und Report generieren
execSync('npm test -- --json --outputFile=reports/test-results.json');

// Report-Zusammenfassung erstellen
const results = JSON.parse(fs.readFileSync('reports/test-results.json'));

const summary = {
  timestamp: new Date().toISOString(),
  total: results.numTotalTests,
  passed: results.numPassedTests,
  failed: results.numFailedTests,
  skipped: results.numPendingTests,
  duration: results.testResults.reduce((a, b) => a + b.perfStats.runtime, 0),
  coverage: results.coverageMap ? calculateCoverage(results.coverageMap) : null
};

console.log('=== Test Report Summary ===');
console.log(`Total: ${summary.total}`);
console.log(`Passed: ${summary.passed} ✅`);
console.log(`Failed: ${summary.failed} ❌`);
console.log(`Skipped: ${summary.skipped} ⏭️`);
console.log(`Duration: ${summary.duration}ms`);
```

### Report-Template
```html
<!-- reports/template.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Orca Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .card { padding: 1rem; border-radius: 8px; text-align: center; }
    .passed { background: #d4edda; }
    .failed { background: #f8d7da; }
    .total { background: #e2e3e5; }
    table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
    th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
    .status-pass { color: green; }
    .status-fail { color: red; }
  </style>
</head>
<body>
  <h1>Orca Test Report</h1>
  <p>Generated: {{timestamp}}</p>

  <div class="summary">
    <div class="card total"><h2>{{total}}</h2>Total</div>
    <div class="card passed"><h2>{{passed}}</h2>Passed</div>
    <div class="card failed"><h2>{{failed}}</h2>Failed</div>
    <div class="card"><h2>{{coverage}}%</h2>Coverage</div>
  </div>

  <h2>Test Results</h2>
  <table>
    <thead>
      <tr>
        <th>Test Suite</th>
        <th>Test</th>
        <th>Status</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {{#tests}}
      <tr>
        <td>{{suite}}</td>
        <td>{{name}}</td>
        <td class="status-{{status}}">{{status}}</td>
        <td>{{duration}}ms</td>
      </tr>
      {{/tests}}
    </tbody>
  </table>
</body>
</html>
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Upload test report
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: reports/
```

## Test-Checklisten

### Vor jedem Release
- [ ] Alle Unit Tests bestanden
- [ ] Alle Integration Tests bestanden
- [ ] Kritische E2E Tests bestanden
- [ ] Coverage >= 80%
- [ ] Keine neuen Regressions
- [ ] Test-Report generiert und geprüft

### Bei neuen Features
- [ ] Unit Tests für neue Funktionen
- [ ] Integration Tests für API-Calls
- [ ] E2E Test für User Flow (wenn kritisch)
- [ ] Rollen-Tests wenn Berechtigungen betroffen

### Bei Bug-Fixes
- [ ] Reproduzierenden Test schreiben
- [ ] Bug fixen
- [ ] Test muss nun grün sein
- [ ] Keine anderen Tests brechen

## Test-Daten Management

### Mock-Daten
```javascript
// tests/fixtures/mockData.js
export const mockInventory = {
  key: 'inv-123',
  meta: {
    description: 'Test Inventur',
    dueDate: '2025-01-15',
    'i.status': 'I1'
  }
};

export const mockPosition = {
  context: { key: 'pos-456' },
  asset: {
    meta: {
      inventoryNumber: '10056190',
      description: 'Testwerkzeug'
    }
  },
  meta: { status: 'P0' }
};

export const mockUsers = [
  { key: 'user-1', meta: { firstName: 'Max', lastName: 'Mustermann' } },
  { key: 'user-2', meta: { firstName: 'Erika', lastName: 'Musterfrau' } }
];
```

### Test-Isolation
```javascript
// Vor jedem Test: Sauberer Zustand
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.mode = 'mock';
});

// Nach Tests: Aufräumen
afterAll(() => {
  // Cleanup
});
```

## Referenzen
- `references/test-cases.md` - Vollständige Test-Case-Sammlung
- `references/coverage-history.md` - Coverage-Entwicklung
- `references/e2e-scenarios.md` - E2E Test-Szenarien
