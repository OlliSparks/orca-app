---
name: orca-status
description: "Vollstaendige Status-Referenz fuer das orca-System. Enthaelt alle Status-Codes fuer Assets, Inventuren, Prozesse und Positionen. Nutze diesen Skill bei jeder Prozess-Definition und Implementierung. Trigger: Status-Logik, Prozess-Design, UI-Texte, Statusuebergaenge."
---

# Orca Status Skill

> **Referenz fuer alle Status-Codes im orca-System**

Die Texte (DE/EN) sind Oberflaechen-Texte und koennen sich aendern.

---

## Asset Status

### status (Sperrstatus)

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| IDLE | frei | Idle | Asset nicht in einem Prozess (z.B. Inventur geloescht) |
| LOCKED | gesperrt | Locked | Asset in einem Prozess (z.B. in Inventur) |

### processStatus (Prozess-Status)

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| A0 | unvollstaendig | incomplete | Werkzeugdaten unvollstaendig, nur fuer SUP sichtbar |
| A1 | unbestaetigt | unconfirmed | Daten vollstaendig, fuer alle sichtbar (ehemals "published") |
| A2 | Inventur geplant | Inventory planed | In geplantem, noch nicht versandtem Inventurauftrag |
| A3 | in Inventur | Inventory in process | In versandtem Inventurauftrag beim Lieferanten |
| A4 | In Verlagerungspruefung | Relocation in approval | In Verlagerung, bei FEK/ST in Pruefung |
| A5 | In Verlagerung | Relocation running | Verlagerung laeuft |
| A6 | bestaetigt | confirmed | Standardfall: Prozesse abgeschlossen, bereit fuer neue |
| A8 | Abnahmebereitschaft geplant | acceptance readyness planned | In geplanter, noch nicht versandter ABL |
| A9 | in Abnahmebereitschaft | acceptance readyness in process | In versandter ABL beim Lieferanten |
| A10 | In Verschrottung | In scrapping | Werkzeug in Verschrottung |
| A11 | Verschrottet | Scrapped | Werkzeug verschrottet |

### lifecycleStatus (Lebenszyklus)

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| AL0 | beauftragt | commissioned | Neues Werkzeug |
| AL1 | aktiv | active | Nach Lieferantenbestaetigung |
| AL2 | deaktiviert | deactivated | Nach Verschrottung oder Inventur mit LS2 (Not found) |
| AL3 | storniert | canceled | Nach Meldung "nicht gefunden" bei Lieferantenbestaetigung |

---

## Inventory Status

### Status (Inventur-Kopf)

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| I0 | geplant | planned | Inventurauftrag erstellt, noch nicht versandt |
| I1 | in Durchfuehrung | running | An Lieferant versandt |
| I2 | durchgefuehrt | performed | Zurueckgemeldet, Ersteller muss pruefen |
| I3 | akzeptiert | accepted | Ergebnisse akzeptiert, in Genehmigung |
| I4 | abgeschlossen | finished | Genehmigt und abgeschlossen |

### Typ (Inventur-Typ)

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| IA | Standard | standard | Normale Inventur |
| IB | Inventurvorbereitung Lieferant | Preperation by Supplier | Daten fuer erste Inventur pruefen/ergaenzen |
| IC | Ergaenzung Werkzeugdokumentation | Addition to Tool Documentation | Dokumentation ergaenzen |
| ID | Abnahmebereitschaft | acceptance readyness | Abnahmebereitschaftserklaerung |

### FollowUp Process (Folgeprozesse)

| Code | Bedeutung |
|------|-----------|
| FP0 | Verlagerung |
| FP1 | Standortkorrektur |
| FP2 | Verschrottung |
| FP3 | Rueckforderungspotenzial |
| FP4 | ID only Process change order |
| FP5 | ID only Process cancel order |

---

## InventoryPos Status (Positions-Status)

### Status

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| P0 | neu | new | Werkzeug als Position hinterlegt |
| P1 | in Durchfuehrung | running | Position an Empfaenger versandt |
| P2 | Meldung vorhanden | report available | Inventurdurchfuehrung abgeschlossen, Meldung liegt vor |
| P3 | Ergebnis vorhanden | result available | Lieferant hat Meldung als Ergebnis akzeptiert |
| P4 | abgeschlossen | finished | Owner hat abgeschlossen, Ergebnisse in Werkzeugakte |
| P5 | akzeptiert | accepted | Owner hat Ergebnisse akzeptiert, ggf. Folgeprozess |
| P6 | abgelehnt | rejected | Ergebnis von Lieferant oder Owner nicht akzeptiert |

### ResultReason (Ergebnis-Gruende)

| Code | Text DE | Verwendung |
|------|---------|------------|
| RR0 | Verlagerung: Das Fertigungsmittel wurde zwischenzeitlich dauerhaft verlagert | Bei Fall "Nein, sondern dort..." |
| RR1 | Datenkorrektur: Das Fertigungsmittel war nie an dem Standort | Bei Fall "Nein, sondern dort" |
| RR2 | Verschrottung: Das Fertigungsmittel wurde zwischenzeitlich verschrottet oder freigestellt | Bei Fall "Standort unbekannt" |
| RR3 | Verschwunden/nicht existent: Das Fertigungsmittel wurde trotz Nachforschung nicht gefunden | Bei Fall "Standort unbekannt" |
| RR4 | Abbruch: Das Fertigungsmittel wurde abgebrochen und verschrottet | Bei Fall "Standort unbekannt" |
| RR5 | Datenkorrektur: Adresse/Unternehmen des Zielstandortes haben sich geaendert | |
| RR6 | Fertigungsmittel wurde nicht verlagert (verbleibt am bisherigen Standort) | *Aktuell nicht verwendet* |
| RR7 | Verschrottet aus Antrag | Fertigungsmittel wurde verschrottet |

### locationState

| Code | Text DE | Text EN | Interner Wert |
|------|---------|---------|---------------|
| PS0 | Keine Location gepflegt | No location selected yet | TODO |
| PS1 | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | Location gepflegt auf nicht gefunden | Location set to not found | UNSUCCESSFUL |
| PS3 | Location am selben Ort | Location set to found | SUCCESSFUL |

### documentsState

| Code | Text DE | Text EN | Interner Wert |
|------|---------|---------|---------------|
| PS0 | Keine oder Teile der Werte gepflegt | No or only parts of the values where added | TODO |
| PS1 | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | - | - | UNSUCCESSFUL (*nicht verwendet*) |
| PS3 | Alle Werte gepflegt | All values added | SUCCESSFUL |

### imageState

| Code | Text DE | Text EN | Interner Wert |
|------|---------|---------|---------------|
| PS0 | Kein oder nur ein Bild hinzugefuegt | No or only one image added | TODO |
| PS1 | Nicht relevant | Not relevant | NOT_REQUIRED |
| PS2 | Fehler bei der Bilderueberpruefung | Error while checking pics | UNSUCCESSFUL |
| PS3 | Beide Bilder gepflegt | Both pictures added | SUCCESSFUL |

### locationResult

| Code | Text DE | Text EN | Interner Wert |
|------|---------|---------|---------------|
| LS0 | Aktuelle Location entspricht alter Location | Current location is the old location | FOUND |
| LS1 | Aktuelle Location entspricht nicht alter Location | Current location is not the old location | OTHER_LOCATION |
| LS2 | Aktuelle Location nicht gefunden | No current location | NOT_FOUND |

---

## Process Status (Allgemein)

Gilt fuer: Verlagerung, Vertragspartnerwechsel, Verschrottung

| Code | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| I | In Planung | Planning | Prozess noch nicht gestartet |
| R | Laeuft / Zu validieren | Running / To validate | Prozess laeuft |
| Z | Beendet | Ended | Prozess abgeschlossen |

---

## Relocation (Verlagerung)

### Relocation Step

| Step | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| 0 | Pruefung durch Eigentuemer | Validation by owner | Wird durch FEK geprueft |
| 1 | - | - | Steuervorpruefung (*interner Step*) |
| 2 | Steuerpruefung | Tax validation | Wird durch Steuer geprueft |
| 3 | Gesamtgenehmigung | Overall approval | Warten auf Portal M LiNuM-Genehmigung |
| 4 | - | - | Freischalten Benutzer (*interner Step*) |
| 5 | Durchfuehrung | Procedure | Durchfuehrung der Verlagerung |
| 8 | Abschluss | Completion | Verlagerung beendet |

### Relocation.C Step (Durchfuehrungsauftrag)

| Step | Text DE | Text EN | Bedeutung |
|------|---------|---------|-----------|
| 0 | In Durchfuehrung | In progress | Auftrag wird umgesetzt |
| 1 | Rueckgemeldet | Reported | Auftrag zurueckgemeldet |
| 2 | Akzeptiert | Accepted | Auftrag akzeptiert |

### ProcessPos Status (relo.status)

| Code | Text DE | Text EN |
|------|---------|---------|
| P0 | neu | new |
| P1 | in Durchfuehrung | running |
| P2 | Meldung vorhanden | report available |
| P3 | Ergebnis vorhanden | result available |
| P4 | abgeschlossen | finished |
| P5 | akzeptiert | accepted |
| P6 | abgelehnt | rejected |

---

## Scrapping (Verschrottung)

### Scrapping Step

| Step | Text DE | Bedeutung |
|------|---------|-----------|
| 0 | - | Pruefung durch VV |
| 1 | - | Durchfuehrung der Verschrottung |

---

## Statusuebergaenge

### Prozess-Erstellung und Abschluss

| Prozess | Prozess-Erstellung | Prozess-Abschluss |
|---------|-------------------|-------------------|
| Inventur/ABL | Prozess-Erstellung | Prozess-Abschluss |
| Verlagerung | Start "B"-Prozess (Assets "schneiden") | Abschluss "B"-Prozess |
| Verschrottung | Nach letzter Genehmigung | Prozess-Abschluss |

### Vorkommnis-Erkennung (Inventur/ABL)

Ein Vorkommnis liegt vor wenn:
- locationState = PS2 oder PS0
- imageState = PS2 oder PS0
- documentsState = PS2 oder PS0
- comment != null
- resultComment != null
- Dateien mit Typ "comment" oder "resultComment" verknuepft

---

## Abhaengigkeiten: lifecycleStatus ↔ processStatus

### Inventur (Typ IB)

| Phase | I-Status | locationResult | lifecycleStatus | processStatus |
|-------|----------|----------------|-----------------|---------------|
| geplant | I0 | - | AL0/AL1 | A2 |
| in Durchfuehrung | I1 | - | AL0/AL1 | A3 |
| durchgefuehrt | I2 | LS0/LS1 (found) | AL0/AL1 | A3 |
| durchgefuehrt | I2 | LS2 (not found) | AL1 | A3 |
| in Genehmigung | I3 | LS0/LS1 | AL1 | A3 |
| abgeschlossen | I4 | LS0/LS1 (found) | AL1 | A6 |
| abgeschlossen | I4 | LS2 (not found) | AL2 | A6 |

### ABL (Typ ID)

| Phase | I-Status | locationResult | lifecycleStatus | processStatus |
|-------|----------|----------------|-----------------|---------------|
| geplant | I0 | - | AL0/AL1 | A8 |
| in Durchfuehrung | I1 | - | AL0/AL1 | A9 |
| abgeschlossen | I4 | LS0/LS1 (found) | AL1 | A6 |
| abgeschlossen | I4 | LS2 (not found) | AL3 | A6 |

### Verlagerung

| Phase | p.status | p.type | lifecycleStatus | processStatus |
|-------|----------|--------|-----------------|---------------|
| Planung | I | RELOCATION.A | AL1 | A6 |
| Pruefung | R | RELOCATION | AL1 | A4 |
| Durchfuehrungssteuerung | R | RELOCATION | AL1 | A5 |
| Durchfuehrung | I | RELOCATION.C | AL1 | A5 |
| Durchfuehrung | R | RELOCATION.C | AL1 | A5 |
| Uebersicht | Z | RELOCATION.C | AL1 | A5 |
| Uebersicht | Z | RELOCATION | AL1 | A6 |
| Abgeschlossen (deaktiviert) | Z | RELOCATION | AL2 | A3 |
| Abgeschlossen (canceled) | Z | RELOCATION | AL3 | A3 |

### Verschrottung

| Phase | p.status | p.type | lifecycleStatus | processStatus |
|-------|----------|--------|-----------------|---------------|
| Auftraege | I | SCRAPPING | AL1 | A6 |
| Auftraege | R | SCRAPPING | AL1 | A6 |
| Abgeschlossen (genehmigt) | Z | SCRAPPING | AL2 | A6 |
| Abgeschlossen (abgelehnt) | Z | SCRAPPING | AL1 | A6 |

---

## Quick-Reference: Haeufigste Status

### Lieferanten-Sicht (Inventur)

```
P0 (neu) → P1 (versandt) → P2 (gemeldet) → P3 (akzeptiert) → P4 (abgeschlossen)
```

### Lieferanten-Sicht (Verlagerung)

```
Step 0 (Pruefung) → Step 2 (Steuer) → Step 3 (Genehmigung) → Step 5 (Durchfuehrung) → Step 8 (Abschluss)
```

### Asset durch Prozesse

```
A6 (bestaetigt) → A2/A4/A8 (geplant) → A3/A5/A9 (in Prozess) → A6 (bestaetigt)
```
