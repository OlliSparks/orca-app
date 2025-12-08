# Verlagerung - Integrationsplan

> **Uebergabedokument fuer die Implementierung**
> Stand: 2025-12-08

## Ausgangslage

### Vorhandener Code
- **`js/pages/verlagerung.js`**: Template mit Mock-Daten, falschen Endpunkten
- **`js/services/api.js`**: Mock-Methode `getVerlagerungList()` mit `/verlagerung-list` (falsch)

### Ziel
Vollstaendige API-Integration gemaess Skill-Definition mit echten Relocation-Endpunkten.

---

## Phase 1: API-Service erweitern

### Neue Methoden in `api.js` (ersetzen/ergaenzen)

```javascript
// === Verlagerung/Relocation Endpoints ===

// 1. Verlagerungen auflisten
async getRelocationList(filters = {}) {
    return this.callWithFallback(
        async () => {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.step) params.append('step', filters.step);
            params.append('limit', filters.limit || 100);
            params.append('skip', filters.skip || 0);

            const endpoint = `/process/relocation?${params.toString()}`;
            const response = await this.call(endpoint, 'GET');

            const items = Array.isArray(response) ? response : (response.data || []);
            return {
                success: true,
                data: items.map(item => this.transformRelocation(item)),
                total: items.length
            };
        },
        () => this.getMockVerlagerungData(filters)
    );
}

// 2. Verlagerungs-Details
async getRelocationDetail(processId) {
    const response = await this.call(`/process/relocation/${processId}`, 'GET');
    return {
        success: true,
        data: this.transformRelocation(response)
    };
}

// 3. Positionen einer Verlagerung
async getRelocationPositions(processId) {
    const response = await this.call(`/process/${processId}/positions`, 'GET');
    const positions = Array.isArray(response) ? response : (response.data || []);
    return {
        success: true,
        data: positions.map(pos => this.transformRelocationPosition(pos)),
        total: positions.length
    };
}

// 4. Durchfuehrungsauftraege (fuer Lieferant)
async getRelocationExecutions(filters = {}) {
    const params = new URLSearchParams();
    params.append('limit', filters.limit || 100);
    const endpoint = `/process/relocation-c?${params.toString()}`;
    const response = await this.call(endpoint, 'GET');

    const items = Array.isArray(response) ? response : (response.data || []);
    return {
        success: true,
        data: items.map(item => this.transformRelocationExecution(item)),
        total: items.length
    };
}

// 5. Durchfuehrung melden
async reportRelocationExecution(processId, data = {}) {
    const endpoint = `/process/relocation-c/${processId}/actions/report`;
    await this.call(endpoint, 'POST', {
        comment: data.comment || '',
        // Weitere Felder nach Bedarf
    });
    return { success: true };
}

// 6. Durchfuehrung akzeptieren
async acceptRelocationExecution(processId) {
    const endpoint = `/process/relocation-c/${processId}/actions/accept`;
    await this.call(endpoint, 'POST');
    return { success: true };
}

// 7. Eingangszertifikat herunterladen
async downloadEntryCertificate(processId, language = 'de') {
    const endpoint = `/process/relocation/${processId}/drafts/entry-certificate/${language}`;
    const response = await this.call(endpoint, 'GET');
    return {
        success: true,
        data: response // PDF-Blob oder URL
    };
}

// === Transformation Helper ===

transformRelocation(item) {
    return {
        id: item.context?.key || item.key || '',
        processId: item.context?.key || item.key || '',
        type: item.meta?.type || 'RELOCATION',
        status: item.meta?.status || 'I',
        step: item.meta?.step || 0,
        stepText: this.mapRelocationStep(item.meta?.step),

        // Standorte
        fromCompany: item.fromCompany?.meta?.name || '',
        fromLocation: item.fromLocation?.meta?.city || '',
        toCompany: item.toCompany?.meta?.name || '',
        toLocation: item.toLocation?.meta?.city || '',

        // Termine
        dueDate: item.meta?.dueDate || null,
        createdAt: item.meta?.createdAt || null,

        // Zaehler
        assetCount: item.meta?.assetCount || 0,
        completedCount: item.meta?.completedCount || 0,

        originalData: item
    };
}

transformRelocationPosition(pos) {
    return {
        id: pos.context?.key || '',
        positionKey: pos.context?.key || '',
        status: pos.meta?.status || 'P0',
        statusText: this.mapPositionStatus(pos.meta?.status),

        // Asset-Daten
        assetKey: pos.asset?.context?.key || '',
        inventoryNumber: pos.asset?.meta?.inventoryNumber || '',
        assetName: pos.asset?.meta?.description || '',

        // Kommentar
        comment: pos.meta?.comment || '',

        originalData: pos
    };
}

transformRelocationExecution(item) {
    return {
        id: item.context?.key || '',
        processId: item.context?.key || '',
        parentProcessId: item.parentProcess?.context?.key || '',
        status: item.meta?.status || 'I',
        step: item.meta?.step || 0,
        stepText: this.mapRelocationCStep(item.meta?.step),

        fromLocation: item.fromLocation?.meta?.city || '',
        toLocation: item.toLocation?.meta?.city || '',
        dueDate: item.meta?.dueDate || null,
        assetCount: item.meta?.assetCount || 0,

        originalData: item
    };
}

// === Status-Mapping ===

mapRelocationStep(step) {
    const stepMap = {
        0: 'Pruefung durch Eigentuemer',
        1: 'Steuervorpruefung',
        2: 'Steuerpruefung',
        3: 'Gesamtgenehmigung',
        4: 'Freischalten Benutzer',
        5: 'Durchfuehrung',
        8: 'Abgeschlossen'
    };
    return stepMap[step] || `Step ${step}`;
}

mapRelocationCStep(step) {
    const stepMap = {
        0: 'In Durchfuehrung',
        1: 'Rueckgemeldet',
        2: 'Akzeptiert'
    };
    return stepMap[step] || `Step ${step}`;
}

mapPositionStatus(status) {
    const statusMap = {
        'P0': 'Neu',
        'P1': 'In Durchfuehrung',
        'P2': 'Meldung vorhanden',
        'P3': 'Ergebnis vorhanden',
        'P4': 'Abgeschlossen',
        'P5': 'Akzeptiert',
        'P6': 'Abgelehnt'
    };
    return statusMap[status] || status;
}
```

---

## Phase 2: Seite `verlagerung.js` aktualisieren

### Filter anpassen

```javascript
// Alte Filter (Template):
// all, offen, feinplanung, in-inventur

// Neue Filter (Verlagerung-spezifisch):
const filters = [
    { id: 'all', label: 'Alle', count: 0 },
    { id: 'pending', label: 'Offen', count: 0, statusFilter: 'I' },
    { id: 'approval', label: 'In Pruefung', count: 0, stepFilter: [0, 2, 3] },
    { id: 'execution', label: 'Durchzufuehren', count: 0, stepFilter: [5] },
    { id: 'completed', label: 'Abgeschlossen', count: 0, statusFilter: 'Z' }
];
```

### Tabellen-Spalten anpassen

```javascript
// Alte Spalten:
// Werkzeugnummer, Werkzeug, Lieferant, Standort, Status, Letzte Verlagerung, Aktionen

// Neue Spalten (Verlagerung):
const columns = [
    { id: 'processId', label: 'Prozess-ID', sortable: true },
    { id: 'assetCount', label: 'Werkzeuge', sortable: true },
    { id: 'fromLocation', label: 'Von', sortable: true },
    { id: 'toLocation', label: 'Nach', sortable: true },
    { id: 'step', label: 'Status', sortable: true },
    { id: 'dueDate', label: 'Faellig', sortable: true },
    { id: 'actions', label: 'Aktionen', sortable: false }
];
```

### Status-Badge Mapping

```javascript
const stepBadges = {
    0: { class: 'status-warning', text: 'FEK-Pruefung', icon: '🔍' },
    2: { class: 'status-warning', text: 'Steuerpruefung', icon: '📋' },
    3: { class: 'status-info', text: 'Genehmigung', icon: '✅' },
    5: { class: 'status-active', text: 'Durchfuehrung', icon: '🚚' },
    8: { class: 'status-success', text: 'Abgeschlossen', icon: '✓' }
};

// Bei Status Z (beendet):
// { class: 'status-completed', text: 'Beendet', icon: '✓' }
```

### Aktionen pro Zeile

```javascript
renderActions(relocation) {
    const actions = [];

    // Immer: Details anzeigen
    actions.push(`
        <button class="btn btn-primary btn-sm" onclick="verlagerungPage.showDetail('${relocation.processId}')">
            👁️ Details
        </button>
    `);

    // Bei Step 5 (Durchfuehrung): Melden-Button
    if (relocation.step === 5) {
        actions.push(`
            <button class="btn btn-success btn-sm" onclick="verlagerungPage.reportExecution('${relocation.processId}')">
                ✓ Melden
            </button>
        `);
    }

    return actions.join(' ');
}
```

---

## Phase 3: Detailansicht implementieren

### Neue Methode `showDetail(processId)`

```javascript
async showDetail(processId) {
    // 1. Daten laden
    const [detailResponse, positionsResponse] = await Promise.all([
        api.getRelocationDetail(processId),
        api.getRelocationPositions(processId)
    ]);

    // 2. Modal oder Seite rendern
    this.renderDetailView(detailResponse.data, positionsResponse.data);
}

renderDetailView(relocation, positions) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <!-- Header mit Zurueck-Button -->
            <div class="detail-header">
                <button class="btn btn-secondary" onclick="verlagerungPage.render()">
                    ← Zurueck zur Liste
                </button>
                <h2>Verlagerung ${relocation.processId}</h2>
                <span class="status-badge">${relocation.stepText}</span>
            </div>

            <!-- Von/Nach Visualisierung -->
            <div class="relocation-flow card">
                <div class="from-location">
                    <h4>Von</h4>
                    <p>${relocation.fromCompany}</p>
                    <p>${relocation.fromLocation}</p>
                </div>
                <div class="flow-arrow">→</div>
                <div class="to-location">
                    <h4>Nach</h4>
                    <p>${relocation.toCompany}</p>
                    <p>${relocation.toLocation}</p>
                </div>
            </div>

            <!-- Werkzeug-Liste -->
            <div class="card">
                <h3>Werkzeuge (${positions.length})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Inventarnummer</th>
                            <th>Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${positions.map(pos => `
                            <tr>
                                <td>${pos.inventoryNumber}</td>
                                <td>${pos.assetName}</td>
                                <td>${pos.statusText}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Aktionen -->
            <div class="action-bar">
                ${relocation.step === 5 ? `
                    <button class="btn btn-success" onclick="verlagerungPage.showReportModal('${relocation.processId}')">
                        ✓ Durchfuehrung melden
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="verlagerungPage.downloadCertificate('${relocation.processId}')">
                    📄 Eingangszertifikat
                </button>
            </div>
        </div>
    `;
}
```

---

## Phase 4: Meldungs-Workflow

### Modal fuer Durchfuehrung melden

```javascript
showReportModal(processId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Durchfuehrung melden</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Bestaetigen Sie, dass die Werkzeuge am neuen Standort angekommen sind.</p>

                <div class="form-group">
                    <label>Kommentar (optional)</label>
                    <textarea id="reportComment" rows="3" placeholder="Optionaler Kommentar..."></textarea>
                </div>

                <div class="form-group">
                    <label>Foto des Werkzeugs (optional)</label>
                    <input type="file" id="reportPhoto" accept="image/*" capture="environment">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                <button class="btn btn-success" onclick="verlagerungPage.submitReport('${processId}')">
                    Durchfuehrung melden
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async submitReport(processId) {
    const comment = document.getElementById('reportComment')?.value || '';

    try {
        const result = await api.reportRelocationExecution(processId, { comment });
        if (result.success) {
            document.querySelector('.modal')?.remove();
            this.showSuccess('Durchfuehrung erfolgreich gemeldet');
            await this.loadData(); // Liste neu laden
        }
    } catch (error) {
        this.showError('Fehler beim Melden: ' + error.message);
    }
}
```

---

## Checkliste fuer Implementierung

### API-Service (`api.js`)
- [ ] `getRelocationList()` - mit `/process/relocation`
- [ ] `getRelocationDetail(processId)`
- [ ] `getRelocationPositions(processId)`
- [ ] `getRelocationExecutions()` - mit `/process/relocation-c`
- [ ] `reportRelocationExecution(processId, data)`
- [ ] `acceptRelocationExecution(processId)`
- [ ] `downloadEntryCertificate(processId, language)`
- [ ] `transformRelocation()` Helper
- [ ] `mapRelocationStep()` Helper
- [ ] Mock-Daten aktualisieren fuer Step-basierte Status

### Seite (`verlagerung.js`)
- [ ] Filter auf Step-basiert umstellen
- [ ] Tabellen-Spalten anpassen
- [ ] Status-Badges fuer Steps
- [ ] `loadData()` auf echte API umstellen
- [ ] `showDetail(processId)` implementieren
- [ ] `showReportModal(processId)` implementieren
- [ ] `submitReport(processId)` implementieren
- [ ] `downloadCertificate(processId)` implementieren
- [ ] Kartenansicht fuer Mobile

### Tests (aus Testing-Skill ableiten)
- [ ] Status-Tests: Step 0 → 2 → 3 → 5 → 8
- [ ] API-Tests: GET /process/relocation
- [ ] API-Tests: POST /actions/report
- [ ] UI-Tests: Filter, Modal, Aktionen

---

## Skill-Integration

### 1. Supplier-Persona Skill (`.claude/skills/supplier-persona/SKILL.md`)

**Quick-Checks vor Release:**
- [ ] Kann der Lieferant das nebenbei erledigen?
  → Meldung sollte in <30 Sekunden moeglich sein
- [ ] Unterstuetzt es alle 6 Automatisierungsstufen?
  → Stufe 4: Button, Stufe 5: Barcode, Stufe 6: GPS
- [ ] Kann er Teilaufgaben delegieren?
  → TODO: Delegation pro Werkzeug
- [ ] Funktioniert es ohne Foto, ohne Barcode?
  → Ja, einfache Bestaetigung reicht
- [ ] Was passiert bei Kommentar?
  → Kommentar fuehrt zu Rueckfrage
- [ ] Ist der Weg zum One-Click so kurz wie moeglich?
  → Liste → Zeile → Button "Melden" (3 Klicks)

### 2. Status Skill (`.claude/skills/status/SKILL.md`)

**Relevante Status-Codes:**

| Bereich | Codes | Verwendung |
|---------|-------|------------|
| Process Status | I, R, Z | Hauptprozess-Status |
| Relocation Steps | 0, 2, 3, 5, 8 | Antragsphase |
| Relocation.C Steps | 0, 1, 2 | Durchfuehrungsphase |
| Position Status | P0-P6 | Einzelwerkzeug-Status |
| Asset processStatus | A4, A5, A6 | Asset waehrend Verlagerung |

**Asset-Status Mapping:**
```
A6 (bestaetigt) → A4 (In Verlagerungspruefung) → A5 (In Verlagerung) → A6 (bestaetigt)
```

### 3. API Skill (`.claude/skills/orca-api/SKILL.md`)

**Verwendete Endpunkte:**

| Endpunkt | Verwendung im Code |
|----------|-------------------|
| `GET /process/relocation` | `getRelocationList()` |
| `GET /process/relocation/{id}` | `getRelocationDetail()` |
| `GET /process/{id}/positions` | `getRelocationPositions()` |
| `GET /process/relocation-c` | `getRelocationExecutions()` |
| `POST .../actions/report` | `reportRelocationExecution()` |
| `POST .../actions/accept` | `acceptRelocationExecution()` |
| `GET .../drafts/entry-certificate/{lang}` | `downloadEntryCertificate()` |

### 4. UX-Audit Skill (`.claude/skills/ux-audit/SKILL.md`)

**Checkliste: Prozess-Workflow**

```
ORIENTIERUNG
[ ] Aktueller Step klar (Badge zeigt Step 0/2/3/5/8)
[ ] Verbleibende Steps sichtbar (Fortschrittsbalken)
[ ] Zurueck zur Liste moeglich

AKTIONEN
[ ] Naechster Schritt offensichtlich ("Durchfuehrung melden")
[ ] Buttons beschreiben Aktion
[ ] Keine mehrdeutigen Optionen

ABSCHLUSS
[ ] Erfolg klar bestaetigt (Toast/Modal)
[ ] Zusammenfassung angezeigt
```

**Performance-Anforderungen:**
- [ ] Initiales Laden < 2s
- [ ] Filter-Wechsel < 500ms
- [ ] Modal oeffnet < 100ms

### 5. Testing Skill (`.claude/skills/testing/SKILL.md`)

**Abgeleitete Tests:**

```javascript
// Status-Maschine Tests
describe('Verlagerung Status-Maschine', () => {
  test('Step 0 → Step 2 (FEK genehmigt)', () => {});
  test('Step 0 → Z (FEK abgelehnt)', () => {});
  test('Step 2 → Step 3 (Steuer genehmigt)', () => {});
  test('Step 5 → Step 8 (Durchfuehrung abgeschlossen)', () => {});
});

// API-Integration Tests
describe('Verlagerung API-Integration', () => {
  test('GET /process/relocation Success', async () => {});
  test('GET /process/relocation/{id} Success', async () => {});
  test('GET /process/relocation/{id} 404', async () => {});
  test('POST /actions/report Success', async () => {});
  test('POST /actions/report Validation Error', async () => {});
});

// UI-Interaktion Tests
describe('Verlagerung UI-Aktionen', () => {
  test('Filter wechseln aktualisiert Liste', () => {});
  test('Melden-Button oeffnet Modal', () => {});
  test('Kommentar wird gespeichert', () => {});
  test('Zertifikat-Download startet', () => {});
});

// Edge Cases
describe('Verlagerung Edge Cases', () => {
  test('Leere Liste zeigt Platzhalter', () => {});
  test('Faelliges Item hervorgehoben', () => {});
  test('Offline-Verhalten graceful degradation', () => {});
});
```

---

## Referenzen

| Skill | Pfad | Relevanz |
|-------|------|----------|
| **Verlagerung (Prozess)** | `.claude/skills/processes/verlagerung/SKILL.md` | Vollstaendige Prozess-Definition |
| **Orca-API** | `.claude/skills/orca-api/SKILL.md` | Endpunkte und Datenfluss |
| **Status** | `.claude/skills/status/SKILL.md` | Status-Codes und Uebergaenge |
| **Supplier-Persona** | `.claude/skills/supplier-persona/SKILL.md` | User-zentrierte Checks |
| **UX-Audit** | `.claude/skills/ux-audit/SKILL.md` | Qualitaetspruefung |
| **Testing** | `.claude/skills/testing/SKILL.md` | Test-Ableitung |
| **Kurzreferenz** | `.claude/skills/orca-api/references/endpoints-quick.md` | Schnellzugriff API |
