# Lessons Learned: Was wir aus der Praxis gelernt haben

## Ursprüngliche Annahmen vs. Realität

### ❌ Annahme: Foto-basierte Inventur mit Smartphone
**Geplant**: Mit dem Smartphone durch die Lagerhalle, Werkzeug fotografieren, Typenschild fotografieren, automatische Erkennung und Abgleich.

**Realität**:
- In den meisten Werken herrscht **strenges Foto-Verbot**
- Werkzeuge sind oft so weit verteilt, dass die Prüfung **mehrere Tage und mehrere Lager** erfordert
- Die "schnell mal durchgehen"-Idee funktioniert nicht bei räumlicher Verteilung

**→ Konsequenz**: Kein Foto-Workflow als Hauptpfad. Alternative Bestätigungsmechanismen notwendig.

---

### ❌ Annahme: Mehrere Werkzeuge pro Inventurauftrag
**Geplant**: Aufträge bündeln für Effizienz.

**Realität**:
- Gebündelte Aufträge sind **schwer zu delegieren**
- Verschiedene Werkzeuge liegen an verschiedenen Orten
- Verschiedene Personen sind zuständig

**→ Konsequenz**: **Ein Werkzeug = Ein Auftrag**. Atomare Einheiten ermöglichen flexible Verteilung.

---

### ❌ Annahme: Einzelauftrag-Ansicht reicht
**Geplant**: Jeder Auftrag als eigene Detailansicht.

**Realität**:
- User wollen **schnell über viele Werkzeuge schauen**
- Einzelansichten sind zu langsam für Massenprüfung
- Systemischer Check braucht Tabellenübersicht

**→ Konsequenz**: **Tabellen-Ansicht als Standard** für Überblick und Bulk-Aktionen.

---

## Die zentrale Erkenntnis

> **Das System ist nicht das Problem. Der menschliche Faktor ist es.**

Beobachtung:
- Systemseitige Abarbeitung KANN schnell sein
- Trotzdem brauchen Lieferanten sehr lange
- Melden oft erst auf Druck

**Interpretation**:
- Inventur hat keine Priorität im Alltag
- Jede Hürde führt zum Aufschieben
- "Später" wird zu "auf den letzten Drücker" wird zu "nur unter Druck"

---

## Das Ziel-Szenario

> **"Auf dem Weg zur Kantine am Werkzeug vorbeigehen und fertig."**

Das bedeutet:
- Keine Vorbereitung nötig
- Keine Einarbeitung nötig
- Kein dedizierter Zeitblock nötig
- Beiläufig erledigbar
- Oder: komplett automatisiert

---

## Design-Prinzip daraus

### Der Lieferant ist der Schwachpunkt in der Prozesskette

Nicht weil er unfähig ist, sondern weil:
- Er unter enormem Druck steht
- Inventur nicht sein Kerngeschäft ist
- Jede Reibung zum Aufschieben führt

**→ Alles muss dem Lieferanten dienen.**

Jede Feature-Entscheidung durch diese Brille:
- Macht es das Leben des Lieferanten einfacher?
- Reduziert es Reibung?
- Kann er es nebenbei erledigen?
- Braucht er dafür Hilfe oder schafft er es allein?

---

## Konkrete Design-Regeln

1. **Kein Foto-Zwang** – Foto optional, nie Pflicht
2. **Atomare Aufträge** – Ein Werkzeug pro Auftrag, immer delegierbar
3. **Tabelle first** – Überblick vor Details
4. **Offline-fähig** – Lager hat oft kein WLAN
5. **Keine Schulung nötig** – Erste Nutzung muss sofort klappen
6. **Bulk-Aktionen** – "Alle 47 bestätigen" mit einem Klick
7. **Push statt Pull** – System erinnert, User reagiert nur
