# Status Skill

Vollständige Dokumentation aller Status-Codes und Statusübergänge im Orca Asset-Management-System.

**Erstellt von:** Timo Mattes
**Zuletzt geändert von:** Yannik Nagel am Nov 11, 2025

> **Hinweis:** Die Spalten "Text DE" und "Text EN" stellen Oberflächentexte dar und unterliegen einem ständigen Wandel.
>
> Informationen zu internen Status sind hier zu finden: Datentransfer-Objekte

## Trigger
- Status-Mapping bei API-Integration
- Workflow-Implementierung
- UI-Anzeige von Status
- Status-Übergänge validieren

---

## Asset Status

### status (Sperrstatus)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| IDLE | Asset | status | frei | Idle | Asset befindet sich nicht in einem Prozess (z.B. Inventur gelöscht, Inventur + Unterauftrag gelöscht, Position aus Inventur in Planung entfernt) |
| LOCKED | Asset | status | gesperrt | Locked | Asset befindet sich in einem Prozess (z.B. In Inventur, Inventur vorhanden aber Unterauftrag gelöscht) |

### processStatus (Prozess-Status)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| A0 | Asset | processStatus | unvollständig | incomplete | Werkzeugdaten unvollständig, nur für SUP sichtbar → derzeit keine Werkzeuge mit diesem Zustand |
| A1 | Asset | processStatus | unbestätigt | unconfirmed | Daten sind vollständig, für alle User sichtbar, ehemals "published" Status |
| A2 | Asset | processStatus | Inventur geplant | Inventory planed | Werkzeug ist in einem geplanten und noch nicht versandten Inventurauftrag, für andere Prozesse gesperrt |
| A3 | Asset | processStatus | in Inventur | Inventory in process | Werkzeug ist in einem versandten Inventurauftrag beim Lieferanten, Status der Inventurauftragsposition wird gepflegt |
| A4 | Asset | processStatus | In Verlagerungsprüfung | Relocation in approval | Werkzeug ist in einer Verlagerung, welche beim FEK/ST in Prüfung ist |
| A5 | Asset | processStatus | In Verlagerung | Relocation running | Werkzeug ist in einer Verlagerung |
| A6 | Asset | processStatus | bestätigt | confirmed | Standardfall; Prozesse abgeschlossen, Werkzeug steht für neue Prozesse zur Verfügung |
| A8 | Asset | processStatus | Abnahmebereitschaft geplant | acceptance readyness planned | Werkzeug ist in geplanter, noch nicht versandter Abnahmebereitschaftserklärung, für andere Prozesse gesperrt |
| A9 | Asset | processStatus | in Abnahmebereitschaft | acceptance readyness in process | Werkzeug ist in versandter Abnahmebereitschaftserklärung beim Lieferanten |
| A10 | Asset | processStatus | In Verschrottung | In scrapping | Werkzeug ist in einer Verschrottung |
| A11 | Asset | processStatus | Verschrottet | Scrapped | Werkzeug ist verschrottet |

### lifecycleStatus (Lebenszyklus-Status)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| AL0 | Asset | lifecycleStatus | beauftragt | commissioned | Neues Werkzeug |
| AL1 | Asset | lifecycleStatus | aktiv | active | Nach der Lieferantenbestätigung |
| AL2 | Asset | lifecycleStatus | deaktiviert | deactivated | Nach Verschrottung oder nach bestätigter Inventur mit LocationStatus LS2 = "Not found" |
| AL3 | Asset | lifecycleStatus | storniert | canceled | Nach Meldung "nicht gefunden" während der Lieferantenbestätigung |

---

## Inventory Status

### Status (Inventur-Status)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| I0 | Inventory | Status | geplant | planned | Inventurauftrag mit Positionen erstellt, noch nicht versandt |
| I1 | Inventory | Status | in Durchführung | running | Inventurauftrag wurde an Lieferant versandt |
| I2 | Inventory | Status | durchgeführt | performed | Empfänger hat zurückgemeldet, Ersteller muss Ergebnisse prüfen |
| I3 | Inventory | Status | akzeptiert | accepted | Owner hat Ergebnisse akzeptiert und Folgeprozesse vermerkt, in Genehmigung |
| I4 | Inventory | Status | abgeschlossen | finished | Owner hat Ergebnisse und Folgeprozesse genehmigt, Inventurauftrag abgeschlossen |

### Typ (Inventur-Typ)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| IA | Inventory | Typ | Standard | standard | Normale Inventur |
| IB | Inventory | Typ | Inventurvorbereitung Lieferant | Preperation by Supplier | Daten für erste Inventur prüfen/ergänzen |
| IC | Inventory | Typ | Ergänzung Werkzeugdokumentation | Addition to Tool Documentation | Ergänzung Werkzeugdokumentation |
| ID | Inventory | Typ | Abnahmebereitschaft | acceptance readyness | Abnahmebereitschaftserklärung |

### FollowUp Process (Folgeprozesse)

| Code | Entität | Feld | Beschreibung |
|------|---------|------|--------------|
| FP0 | Inventory | FollowUp Process | Verlagerung |
| FP1 | Inventory | FollowUp Process | Standortkorrektur |
| FP2 | Inventory | FollowUp Process | Verschrottung |
| FP3 | Inventory | FollowUp Process | Rückforderungspotenzial |
| FP4 | Inventory | FollowUp Process | ID only Process change order |
| FP5 | Inventory | FollowUp Process | ID only Process cancel order |

---

## InventoryPos Status (Inventur-Positions-Status)

### Status

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| P0 | InventoryPos | Status | neu | new | Werkzeug als Inventurauftragsposition hinterlegt |
| P1 | InventoryPos | Status | in Durchführung | running | Position wurde im Inventurauftrag an Empfänger versandt |
| P2 | InventoryPos | Status | Meldung vorhanden | report available | Inventurdurchführungsschritte abgeschlossen, Meldung liegt vor |
| P3 | InventoryPos | Status | Ergebnis vorhanden | result available | Lieferant hat Inventurmeldung als Ergebnis akzeptiert |
| P4 | InventoryPos | Status | abgeschlossen | finished | Owner hat Inventurauftrag abgeschlossen, Ergebnisse in Werkzeugakte übertragen |
| P5 | InventoryPos | Status | akzeptiert | accepted | Owner hat Ergebnisse akzeptiert und ggf. Folgeprozess hinterlegt |
| P6 | InventoryPos | Status | abgelehnt | rejected | Inventurergebnis wurde vom Lieferanten oder Owner nicht akzeptiert |

### ResultReason (Ergebnis-Begründung)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| RR0 | InventoryPos | ResultReason | Verlagerung | Relocation | Das Fertigungsmittel wurde zwischenzeitlich dauerhaft verlagert (bei Fall „Nein, sondern dort…") |
| RR1 | InventoryPos | ResultReason | Datenkorrektur | Data correction | Das Fertigungsmittel war nie an dem Standort (bei Fall „Nein, sondern dort") |
| RR2 | InventoryPos | ResultReason | Verschrottung | Scrapped | Das Fertigungsmittel wurde zwischenzeitlich verschrottet oder freigestellt (bei Fall „Standort unbekannt") |
| RR3 | InventoryPos | ResultReason | Verschwunden/nicht existent | Disappeared/non-existent | Das Fertigungsmittel wurde trotz Nachforschung nicht gefunden oder hat nie existiert (bei Fall „Standort unbekannt") |
| RR4 | InventoryPos | ResultReason | Abbruch | Termination | Das Fertigungsmittel wurde abgebrochen und verschrottet (bei Fall "Standort unbekannt") |
| RR5 | InventoryPos | ResultReason | Datenkorrektur | Data adjustment | Adresse/Unternehmen des Zielstandortes haben sich geändert |
| RR6 | InventoryPos | ResultReason | Nicht verlagert | Not relocated | Fertigungsmittel wurde nicht verlagert (verbleibt am bisherigen Standort) - *Hinweis: wird aktuell nicht von ORCA verwendet* |
| RR7 | InventoryPos | ResultReason | Verschrottet aus Antrag | Scrapped from Request | Fertigungsmittel wurde verschrottet |

### locationState

| Code | Entität | Feld | Text DE | Text EN | Interner Wert |
|------|---------|------|---------|---------|---------------|
| PS0 | InventoryPos | locationState | Keine Location gepflegt | No location selected yet | TODO |
| PS1 | InventoryPos | locationState | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | InventoryPos | locationState | Location gepflegt auf anderem Ort / nicht gefunden | Location set to found somewhere else / not found | UNSUCCESSFUL |
| PS3 | InventoryPos | locationState | Location am selben Ort | Location set to found | SUCCESSFUL |

### documentsState

| Code | Entität | Feld | Text DE | Text EN | Interner Wert |
|------|---------|------|---------|---------|---------------|
| PS0 | InventoryPos | documentsState | Keine oder Teile der Werte gepflegt | No or only parts of the values where added | TODO |
| PS1 | InventoryPos | documentsState | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | InventoryPos | documentsState | - | - | UNSUCCESSFUL (*wird aktuell nicht verwendet*) |
| PS3 | InventoryPos | documentsState | Alle Werte gepflegt | All values added | SUCCESSFUL |

### imageState

| Code | Entität | Feld | Text DE | Text EN | Interner Wert |
|------|---------|------|---------|---------|---------------|
| PS0 | InventoryPos | imageState | Kein oder nur ein Bild hinzugefügt | No or only one image added | TODO |
| PS1 | InventoryPos | imageState | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | InventoryPos | imageState | Fehler bei der Bilderüberprüfung | Error while checking pics | UNSUCCESSFUL |
| PS3 | InventoryPos | imageState | Beide Bilder gepflegt | Both pictures added | SUCCESSFUL |

### locationResult

| Code | Entität | Feld | Text DE | Text EN | Interner Wert |
|------|---------|------|---------|---------|---------------|
| LS0 | InventoryPos | locationResult | Aktuelle Location entspricht alter Location | Current location is the old location | FOUND |
| LS1 | InventoryPos | locationResult | Aktuelle Location entspricht nicht alter Location | Current location is not the old location | OTHER_LOCATION |
| LS2 | InventoryPos | locationResult | Aktuelle Location nicht gefunden | No current location | NOT_FOUND |

---

## Process Status

### ProcessStatus (p.status)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| I | Process | p.status | In Planung | Planning | Prozess ist noch nicht gestartet - Gilt für Verlagerung, VPW und Verschrottung |
| R | Process | p.status | Läuft / Zu validieren | Running / To validate | Prozess läuft - Gilt für Verlagerung, VPW und Verschrottung. **Besonderheit:** Bei Verlagerungsplanung steht R für "Zu validieren" |
| Z | Process | p.status | Beendet | Ended | Prozess ist abgeschlossen - Gilt für Verlagerung, VPW und Verschrottung |

---

## Relocation Status (Verlagerung)

### Relocation Step (relo.step) - Hauptprozess

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| 0 | Relocation | relo.step | Prüfung durch Eigentümer | Validation by owner | Verlagerung wird durch den FEK geprüft |
| 1 | Relocation | relo.step | - | - | Steuervorprüfung (*Interner Step, sollte nie sichtbar sein*) |
| 2 | Relocation | relo.step | Steuerprüfung | Tax validation | Verlagerung wird durch die Steuer geprüft |
| 3 | Relocation | relo.step | Gesamtgenehmigung | Overall approval | Warten auf Portal M LiNuM-Genehmigung |
| 4 | Relocation | relo.step | - | - | Freischalten der berechtigten Benutzer (*Interner Step, sollte nie sichtbar sein*) |
| 5 | Relocation | relo.step | Durchführung | Procedure | Durchführung der Verlagerung |
| 8 | Relocation | relo.step | Abschluss | Completion | Verlagerung beendet |

### Relocation.C Step (relo.step) - Unterprozess

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| 0 | Relocation.C | relo.step | In Durchführung | In progress | Verlagerungsauftrag wird umgesetzt |
| 1 | Relocation.C | relo.step | Rückgemeldet | Reported | Verlagerungsauftrag wurde zurückgemeldet |
| 2 | Relocation.C | relo.step | Akzeptiert | Accepted | Verlagerungsauftrag wurde akzeptiert |

---

## Scrapping Status (Verschrottung)

### Scrapping Step (scrap.step)

| Code | Entität | Feld | Text DE | Text EN | Beschreibung |
|------|---------|------|---------|---------|--------------|
| 0 | Scrapping | scrap.step | - | - | Prüfung durch VV |
| 1 | Scrapping | scrap.step | - | - | Durchführung der Verschrottung |

---

## ProcessPos Status (Prozess-Positions-Status)

### relo.status

| Code | Entität | Feld | Text DE | Text EN |
|------|---------|------|---------|---------|
| P0 | ProcessPos | relo.status | neu | new |
| P1 | ProcessPos | relo.status | in Durchführung | running |
| P2 | ProcessPos | relo.status | Meldung vorhanden | report available |
| P3 | ProcessPos | relo.status | Ergebnis vorhanden | result available |
| P4 | ProcessPos | relo.status | abgeschlossen | finished |
| P5 | ProcessPos | relo.status | akzeptiert | accepted |
| P6 | ProcessPos | relo.status | abgelehnt | rejected |

---

## Statusübergänge

### Prozess-Lifecycle

| Prozess | Prozess-Erstellung | Prozess-Abschluss |
|---------|-------------------|-------------------|
| Inventur / ABL | Prozess-Erstellung | Prozess-Abschluss |
| Verlagerung | Start "B"-Prozess (Assets "schneiden") | Abschluss "B"-Prozess |
| Verschrottung | Nach letzter Genehmigung | Prozess-Abschluss |

---

## Vorkommnis-Erkennung (Inventur/ABL)

Ein Vorkommnis liegt vor wenn:
- `locationState = PS2 oder PS0`
- `imageState = PS2 oder PS0`
- `documentsState = PS2 oder PS0`
- `comment = Not null`
- `resultComment = Not null`
- Dateien mit Typ "comment" oder "resultComment" verknüpft

---

## Status-Abhängigkeiten

### Asset lifecycleStatus und processStatus nach Prozess

#### Kein Prozess
| Szenario | lifecycleStatus | processStatus |
|----------|-----------------|---------------|
| Standard | AL0/AL1 (von BMW in ST gesetzt) | A1 |
| Deaktiviert | AL2 | A1, A3 wenn storniert |
| Canceled | AL3 | A1, A3 wenn storniert |

#### ABL (Abnahmebereitschaft)
| Phase | Inventory Status | Inventory Typ | locationResult | lifecycleStatus | processStatus |
|-------|-----------------|---------------|----------------|-----------------|---------------|
| planned | I0 | ID | - | AL0/AL1 | A8 |
| Durchführung | I0 | ID | - | AL0/AL1 | A9 |
| in process | I1 | ID | - | AL0/AL1 | A9 |
| in Prüfung | I2 | ID | - | AL0/AL1 | A9 |
| finished | I4 | ID | LS0/LS1 (found) | AL1 | A6 |
| finished | I4 | ID | LS2 (Not found) | AL3 | A6 |
| finished | I4 | ID | - | AL2 wenn deaktiviert | A3 wenn storniert |

#### Inventory
| Phase | Inventory Status | Inventory Typ | locationResult | lifecycleStatus | processStatus |
|-------|-----------------|---------------|----------------|-----------------|---------------|
| Inventory planed | I0 | IB | - | AL0/AL1 | A2 |
| Inventory in process | I1 | IB | - | AL0/AL1 | A3 |
| finished | I2 | IB | LS2 (Not found) | AL1 | A3 |
| finished | I2 | IB | LS0/LS1 (found) | AL0/AL1 | A3 |
| in Genehmigung | I3 | IB | LS0/LS1 (found) | AL1 | A3 |
| in Genehmigung | I3 | IB | LS2 (Not found) | AL1 | A3 |
| abgeschlossen | I4 | IB | LS0/LS1 (found) | AL1 | A6 |
| abgeschlossen | I4 | IB | LS2 (Not found) | AL2 | A6 |
| abgeschlossen | I4 | IB | - | AL3 wenn canceled | A3 wenn storniert |

#### Relocation (Verlagerung)
| Phase | p.status | p.type | lifecycleStatus | processStatus |
|-------|----------|--------|-----------------|---------------|
| Planung | I | RELOCATION.A | AL1 | A6 |
| Prüfung | R | RELOCATION | AL1 | A4 |
| Durchführungssteuerung | R | RELOCATION | AL1 | A5 |
| Durchführung | I | RELOCATION.C | AL1 | A5 |
| Durchführung | R | RELOCATION.C | AL1 | A5 |
| Übersicht | Z | RELOCATION.C | AL1 | A5 |
| Übersicht | Z | RELOCATION | AL1 | A6 |
| Übersicht (Ende) | Z | RELOCATION | AL2 wenn deaktiviert, AL3 wenn canceled | A3 wenn storniert |

#### Verschrottung
| Phase | p.status | p.type | lifecycleStatus | processStatus |
|-------|----------|--------|-----------------|---------------|
| Aufträge | I | SCRAPPING | AL1 | A6 |
| Aufträge | R | SCRAPPING | AL1 | A6 |
| Aufträge (Ende) | Z | SCRAPPING | AL2 wenn genehmigt, AL1 wenn abgelehnt | A6 |

---

## Referenzen
- `references/status-mapping.md` - Mapping für UI-Anzeige
- `references/workflow-diagrams.md` - Visuelle Workflow-Darstellungen
- `references/dto-reference.md` - Datentransfer-Objekte
