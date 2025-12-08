---
name: prozess-verlagerung
description: "Verlagerungs-Prozess fuer Werkzeuge zwischen Standorten. Zweistufiger Prozess: Antrag stellen und Durchfuehrung. Umfasst Compliance-Pruefung, Steuerpruefung, Genehmigungen und Dokumentenerstellung. Trigger: Verlagerungs-Features, Standortwechsel, Umzug."
---

# Prozess: Verlagerung

> **Status: In Entwicklung** - Vollstaendige Skill-Definition, Implementierung ausstehend

## 1. Uebersicht

**Was ist der Prozess?**
Ein Werkzeug wird von einem Standort zu einem anderen verlagert. Der Prozess umfasst Genehmigungen, Compliance-Pruefungen und die physische Durchfuehrung.

**Wer loest ihn aus?**
- [x] OEM (BMW) - Initiiert Verlagerungsantrag
- [x] Lieferant - Kann ebenfalls Antrag stellen

**Was ist das Ziel?**
Dokumentierte, geprueft und genehmigte Standortaenderung von Werkzeugen mit allen erforderlichen Nachweisen.

## 2. Prozess-Ablauf

Der Verlagerungsprozess ist **zweistufig**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE A: ANTRAG (RELOCATION.A)                   │
├─────────────────────────────────────────────────────────────────────┤
│  Step 0: FEK-Pruefung → Step 2: Steuerpruefung → Step 3: Genehmigung│
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 PHASE B: DURCHFUEHRUNG (RELOCATION.C)               │
├─────────────────────────────────────────────────────────────────────┤
│  Step 5: Durchfuehrung → Step 8: Abschluss                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Status-Maschine

### Hauptprozess-Status

| Status | Code | Bedeutung |
|--------|------|-----------|
| In Planung | I | Prozess noch nicht gestartet |
| Laeuft / Zu validieren | R | Prozess laeuft, wird geprueft |
| Beendet | Z | Prozess abgeschlossen |

### Relocation Steps (Antragsphase)

| Step | Text DE | Text EN | Bedeutung | Pruefer |
|------|---------|---------|-----------|---------|
| 0 | Pruefung durch Eigentuemer | Validation by owner | Antrag eingereicht | FEK |
| 1 | - | - | Steuervorpruefung | (intern) |
| 2 | Steuerpruefung | Tax validation | Wird durch Steuer geprueft | STL |
| 3 | Gesamtgenehmigung | Overall approval | Warten auf LiNuM-Genehmigung | Portal M |
| 4 | - | - | Freischalten Benutzer | (intern) |
| 5 | Durchfuehrung | Procedure | Physische Verlagerung | Lieferant |
| 8 | Abschluss | Completion | Verlagerung beendet | - |

### Relocation.C Steps (Durchfuehrungsauftrag)

| Step | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| 0 | In Durchfuehrung | In progress | Auftrag wird umgesetzt |
| 1 | Rueckgemeldet | Reported | Lieferant hat gemeldet |
| 2 | Akzeptiert | Accepted | Auftrag akzeptiert |

### Position-Status (relo.status)

| Status | Code | Bedeutung |
|--------|------|-----------|
| Neu | P0 | Position angelegt |
| In Durchfuehrung | P1 | Verlagerung laeuft |
| Meldung vorhanden | P2 | Lieferant hat gemeldet |
| Ergebnis vorhanden | P3 | Ergebnis liegt vor |
| Abgeschlossen | P4 | Verarbeitung fertig |
| Akzeptiert | P5 | Ergebnis akzeptiert |
| Abgelehnt | P6 | Ergebnis abgelehnt |

### Asset-Status waehrend Verlagerung

| Phase | Asset processStatus | Asset lifecycleStatus |
|-------|--------------------|-----------------------|
| Planung | A6 (bestaetigt) | AL1 (aktiv) |
| In Pruefung | A4 (In Verlagerungspruefung) | AL1 |
| In Durchfuehrung | A5 (In Verlagerung) | AL1 |
| Abgeschlossen | A6 (bestaetigt) | AL1 |
| Deaktiviert | A3 | AL2 |
| Storniert | A3 | AL3 |

### Status-Uebergaenge

```
ANTRAGSPHASE:
Step 0 (FEK) → [Genehmigt] → Step 2 (Steuer)
Step 0 (FEK) → [Abgelehnt] → Status Z (Beendet)
Step 2 (Steuer) → [Genehmigt] → Step 3 (Portal)
Step 2 (Steuer) → [Abgelehnt] → Status Z (Beendet)
Step 3 (Portal) → [Genehmigt] → Step 5 (Durchfuehrung)
Step 3 (Portal) → [Abgelehnt] → Status Z (Beendet)

DURCHFUEHRUNGSPHASE:
Step 5 → [Melden] → Relocation.C Step 1
Relocation.C Step 1 → [Akzeptieren] → Relocation.C Step 2
Relocation.C Step 2 → [Abschliessen] → Step 8 (Beendet)
```

## 4. API-Integration

### Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/relocation` | Verlagerungen auflisten |
| GET | `/process/relocation/{processId}` | Verlagerungs-Details |
| POST | `/process/relocation` | Neue Verlagerung erstellen |
| PATCH | `/process/relocation/{processId}` | Verlagerung aktualisieren |
| POST | `/process/relocation/{processId}/positions/batch` | Positionen im Batch hinzufuegen |
| PATCH | `/process/relocation/{processId}/assign` | Benutzer zuweisen |
| GET | `/process/relocation/{processId}/users/assignable` | Zuweisbare Benutzer |
| GET | `/process/relocation/{processId}/drafts/entry-certificate/{language}` | Eingangszertifikat (PDF) |
| POST | `/process/relocation/{processId}/actions/submit` | Verlagerung einreichen |
| POST | `/process/relocation/{processId}/actions/approve` | Verlagerung genehmigen |
| POST | `/process/relocation/{processId}/actions/reject` | Verlagerung ablehnen |
| POST | `/process/relocation/{processId}/actions/complete` | Verlagerung abschliessen |

### Durchfuehrungsauftrag (Relocation.C)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/process/relocation-c/{processId}` | Durchfuehrungsauftrag abrufen |
| POST | `/process/relocation-c/{processId}/actions/report` | Durchfuehrung melden |
| POST | `/process/relocation-c/{processId}/actions/accept` | Durchfuehrung akzeptieren |

### Datenfluss

```javascript
// 1. Verlagerungen laden
const relocations = await api.get('/process/relocation');

// 2. Fuer Lieferant: Durchfuehrungsauftraege laden
const executions = await api.get('/process/relocation-c');

// 3. Details einer Verlagerung
const details = await api.get(`/process/relocation/${processId}`);

// 4. Positionen einer Verlagerung
const positions = await api.get(`/process/${processId}/positions`);

// 5. Durchfuehrung melden
await api.post(`/process/relocation-c/${processId}/actions/report`, {
  comment: 'Verlagerung durchgefuehrt'
});

// 6. Eingangszertifikat generieren
const pdf = await api.get(
  `/process/relocation/${processId}/drafts/entry-certificate/de`
);
```

## 5. UI-Anforderungen

### Lieferanten-Sicht (Hauptfokus)

#### Listenansicht

**Spalten:**
- [ ] Prozess-ID (Link zu Detail)
- [ ] Werkzeug(e) - Anzahl oder Liste
- [ ] Von-Standort
- [ ] Nach-Standort
- [ ] Aktueller Step (mit Badge)
- [ ] Faelligkeitsdatum
- [ ] Aktionen

**Filter:**
- [ ] Status: Alle, Offen, In Pruefung, Durchzufuehren, Abgeschlossen
- [ ] Zeitraum
- [ ] Standort

**Gruppen:**
- [ ] Nach Step gruppierbar
- [ ] Nach Monat gruppierbar

#### Detailansicht

**Header:**
- [ ] Prozess-ID und Status-Badge
- [ ] Von → Nach Standort (visuell)
- [ ] Aktueller Step mit Fortschrittsbalken

**Werkzeug-Liste:**
- [ ] Alle betroffenen Werkzeuge
- [ ] Status pro Werkzeug
- [ ] Ggf. Einzelaktionen

**Dokumente:**
- [ ] Eingangszertifikat (PDF-Download)
- [ ] Weitere Nachweise

**Aktionen:**
| Aktion | Verfuegbar bei | UI-Element |
|--------|----------------|------------|
| Melden | Step 5 (Durchfuehrung) | Primaer-Button |
| Kommentar | Immer | Textfeld |
| Dokument hochladen | Step 5 | Upload-Button |
| Abbrechen | Step 0-3 | Sekundaer-Button |

#### Durchfuehrungs-Workflow

```
┌─────────────────────────────────────────────────────┐
│  DURCHFUEHRUNG MELDEN                               │
├─────────────────────────────────────────────────────┤
│  ○ Werkzeug physisch am neuen Standort?             │
│    [Ja, bestaetige Standort]                        │
│                                                     │
│  ○ Kommentar (optional)                             │
│    [____________________________]                   │
│                                                     │
│  ○ Foto des Werkzeugs am neuen Standort             │
│    [📷 Foto aufnehmen]                              │
│                                                     │
│  [Abbrechen]              [Durchfuehrung melden]    │
└─────────────────────────────────────────────────────┘
```

### Kartenansicht (Mobile)

```
┌─────────────────────────────────────────────────────┐
│  VERLAGERUNG #12345                    [Step 5]     │
├─────────────────────────────────────────────────────┤
│  📍 Muenchen → Stuttgart                            │
│  🔧 3 Werkzeuge                                     │
│  📅 Faellig: 15.12.2024                             │
├─────────────────────────────────────────────────────┤
│  [Details]           [Durchfuehrung melden]         │
└─────────────────────────────────────────────────────┘
```

## 6. Supplier-Persona Check

```
[x] Kann der Lieferant das nebenbei erledigen?
    → Durchfuehrung ist physische Arbeit, aber Meldung sollte
      in <30 Sekunden moeglich sein (One-Click + optional Foto)

[x] Unterstuetzt es alle 6 Automatisierungsstufen?
    → Stufe 4: Button "Durchfuehrung melden"
    → Stufe 5: Barcode-Scan fuer Werkzeug-ID + Auto-Confirm
    → Stufe 6: GPS-basierte Auto-Erkennung am Zielstandort

[ ] Kann er Teilaufgaben delegieren?
    → TODO: Delegation fuer einzelne Werkzeuge einer Verlagerung

[x] Funktioniert es ohne Foto, ohne Barcode?
    → Ja: Einfache Bestaetigung reicht

[ ] Was passiert bei Kommentar?
    → Kommentar fuehrt zu Rueckfrage beim OEM

[x] Ist der Weg zum One-Click so kurz wie moglich?
    → Liste → Zeile → Button "Melden" (3 Klicks)
    → Ziel: Liste → Swipe → Bestaetigt (2 Aktionen)
```

## 7. Edge Cases & Klaerfaelle

| Situation | Verhalten |
|-----------|-----------|
| Werkzeug nicht am Zielstandort angekommen | Meldung mit Status "nicht gefunden", Rueckfrage |
| Verlagerung abgelehnt in Pruefung | Status Z, Werkzeug bleibt am alten Standort |
| Teilweise Verlagerung (nur einige Werkzeuge) | Jedes Werkzeug einzeln melden moeglich |
| Faelligkeitsdatum ueberschritten | Rote Markierung, Eskalation |
| Stornierung nach Genehmigung | Nur mit Begruendung, neuer Antrag noetig |
| Steuerlich relevant (Laendergrenze) | Step 2 erfordert Steuerpruefung |

## 8. Implementierungs-Status

### Phase 1: Basis
- [x] Listenansicht (Template)
- [x] Filter (Template)
- [ ] API-Integration GET
- [ ] Detailansicht

### Phase 2: Durchfuehrung
- [ ] Durchfuehrungs-Workflow UI
- [ ] Melden-Funktion
- [ ] Foto-Upload
- [ ] Kommentar

### Phase 3: Dokumente
- [ ] Eingangszertifikat Download
- [ ] Weitere Dokumente

### Phase 4: Optimierung
- [ ] Batch-Meldung mehrerer Werkzeuge
- [ ] Offline-Faehigkeit
- [ ] Barcode-Scan
- [ ] Tests

## 9. Code-Referenz

**Hauptdatei:** `js/pages/verlagerung.js`
**Klasse:** `VerlagerungPage`
**Globale Instanz:** `verlagerungPage`

### Wichtige Methoden (geplant)

| Methode | Zweck |
|---------|-------|
| `loadData()` | Laedt Verlagerungen und Durchfuehrungsauftraege |
| `getFilteredRelocations()` | Wendet Filter an |
| `showDetail(processId)` | Zeigt Detailansicht |
| `reportExecution(processId)` | Startet Meldungs-Workflow |
| `downloadCertificate(processId)` | Laedt Eingangszertifikat |

## 10. Test-Ableitungen

### Status-Tests
- [ ] Step 0 → Step 2 (FEK genehmigt)
- [ ] Step 0 → Z (FEK abgelehnt)
- [ ] Step 2 → Step 3 (Steuer genehmigt)
- [ ] Step 5 → Step 8 (Durchfuehrung abgeschlossen)

### API-Tests
- [ ] GET /process/relocation (Success)
- [ ] GET /process/relocation/{id} (Success, 404)
- [ ] POST /actions/report (Success, Validation Error)
- [ ] GET /drafts/entry-certificate (PDF Response)

### UI-Tests
- [ ] Filter wechseln aktualisiert Liste
- [ ] Melden-Button oeffnet Modal
- [ ] Kommentar wird gespeichert
- [ ] Zertifikat-Download startet

### Edge-Case-Tests
- [ ] Leere Liste zeigt Platzhalter
- [ ] Faelliges Item hervorgehoben
- [ ] Offline-Verhalten
