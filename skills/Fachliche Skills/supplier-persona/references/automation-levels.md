# Automatisierungsstufen für Lieferanten

## Philosophie

> **Jeder Lieferant muss ALLE Wege sehen und den für sich passenden wählen können.**

Vom Konzern mit SAP-Anbindung bis zum Kleinbetrieb mit Zettelwirtschaft – alle müssen bedient werden. Kein Weg ist "besser", jeder Weg muss einfach sein.

## Die 6 Stufen im Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTOMATISIERUNGSGRAD                                           │
│  ▲                                                              │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 1. VOLLAUTOMATISCH                                  │    │
│  │  │    API-Anbindung, Zero-Click                        │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 2. TEILAUTOMATISCH                                  │    │
│  │  │    Liste hochladen, Agent matched, User bestätigt   │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 3. ONE-CLICK                                        │    │
│  │  │    Alles bestätigen (Verantwortung beim Lieferant)  │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 4. LISTEN-ARBEIT                                    │    │
│  │  │    Tabellenansicht, Bulk-Aktionen                   │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 5. EINZELAUFTRÄGE                                   │    │
│  │  │    Werkzeug für Werkzeug durchgehen                 │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ 6. PAPIER-WORKFLOW                                  │    │
│  │  │    Ausdrucken, prüfen, eintippen                    │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  ▼                                                              │
│  MANUELLER AUFWAND                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stufe 1: Vollautomatisch (API)

**Status**: 🔮 Geplant (neue Orca-App)

**Wie es funktioniert**:
- Lieferant verbindet sein System (SAP, Eigenentwicklung, whatever) via API
- Orca sendet Inventur-Anforderung
- Lieferanten-System antwortet automatisch mit Bestandsdaten
- Abgleich erfolgt automatisch
- Nur Abweichungen erfordern menschliche Klärung

**Für wen geeignet**:
- Große Lieferanten mit eigenem Werkzeug-Management-System
- Externe Dienstleister die Werkzeuge für mehrere Kunden verwalten

**Vorteil**: Zero-Click für Standardfälle

---

## Stufe 2: Teilautomatisch (Agent)

**Status**: 🔮 Geplant (neue Orca-App)

**Wie es funktioniert**:
- Lieferant lädt seine Liste hoch (Excel, CSV, PDF – alles möglich)
- Agent liest Liste, matched mit Orca-Daten
- Bei Unklarheiten: Agent stellt gezielte Fragen
- Lieferant beantwortet nur die Klärfälle
- Agent meldet zurück

**Für wen geeignet**:
- Lieferanten mit eigener Werkzeug-Liste (Excel, ERP-Export)
- Wer keinen API-Aufwand treiben will aber Daten hat

**Vorteil**: Minimaler manueller Aufwand, Matching-Intelligenz

---

## Stufe 3: One-Click

**Status**: 🎨 MockUp vorhanden

**Wie es funktioniert**:
- Lieferant sieht Übersicht aller anstehenden Inventuren
- Ein Klick: "Alle X Werkzeuge bestätigen"
- Warnung: Lieferant trägt Verantwortung für Richtigkeit

**Für wen geeignet**:
- Wer seine Werkzeuge kennt und sicher ist
- Wer Zeit sparen will und Risiko akzeptiert

**Vorteil**: Schnellstmögliche Erledigung

**Achtung**: Keine OEM-Vorgaben bekannt die das einschränken – aber Verantwortung liegt beim Lieferant

---

## Stufe 4: Listen-Arbeit

**Status**: ✅ In Orca vorhanden

**Wie es funktioniert**:
- Tabellenansicht aller Werkzeuge
- Filter, Sortierung, Suche
- Bulk-Aktionen ("Alle gefilterten bestätigen")
- Schneller Überblick über viele Werkzeuge

**Für wen geeignet**:
- Systemischer Check am PC
- Wer viele Werkzeuge auf einmal durchgehen will

**Vorteil**: Effizienz bei Masse

---

## Stufe 5: Einzelaufträge

**Status**: ✅ In Orca vorhanden

**Wie es funktioniert**:
- Ein Werkzeug = Ein Auftrag
- Detailansicht pro Werkzeug
- Einzeln bestätigen oder kommentieren

**Für wen geeignet**:
- Physische Prüfung vor Ort
- Delegierte Aufgaben (Lagerarbeiter prüft einzeln)
- Klärfälle die Aufmerksamkeit brauchen

**Vorteil**: Fokus, Delegierbarkeit

---

## Stufe 6: Papier-Workflow

**Status**: ✅ In Orca vorhanden

**Wie es funktioniert**:
- Liste ausdrucken (Nummern, Bezeichnung, Standort)
- Manuell durchgehen, Notizen machen
- Ergebnisse ins System eintippen
- Handnotizen ins Kommentarfeld übertragen

**Für wen geeignet**:
- Lager ohne WLAN/Empfang
- Wer Papier bevorzugt
- Sehr kleine Lieferanten

**Vorteil**: Funktioniert immer, keine Technik-Abhängigkeit

**Wichtig**: Aus OEM-Sicht gibt es keine Handnotizen – alles muss ins System

---

## Mischformen erlaubt

Ein Lieferant kann verschiedene Stufen kombinieren:
- "Die 200 im Hauptlager mache ich per One-Click"
- "Die 10 beim Subunternehmer delegiere ich als Einzelaufträge"
- "Die 5 Klärfälle gehe ich einzeln durch"

Das System muss das unterstützen, nicht erzwingen.
