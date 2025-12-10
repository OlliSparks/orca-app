---
name: supplier-persona
description: Bei Feature-Design, UX-Entscheidungen und Workflow-Design konsultieren. Hilft dabei, Features aus der Perspektive des Lieferanten zu bewerten.
---

# Supplier-Persona Skill

## Kernprinzip

> "Der Lieferant ist der Schwachpunkt in der Prozesskette - alles muss ihm dienen."

## Wann diesen Skill verwenden?

- Feature-Design
- UX-Entscheidungen
- Workflow-Design
- Priorisierung von Anforderungen

## Lieferanten-Realitaet

### Typischer Arbeitskontext
- Arbeitet nebenbei (nicht Vollzeit am System)
- Hat viele andere Aufgaben
- Wenig Zeit fuer Schulungen
- Wechselndes Personal
- Unterschiedliche technische Ausstattung

### Die 6 Automatisierungsstufen
1. **Stufe 0:** Vollstaendig manuell
2. **Stufe 1:** Assistiert (System schlaegt vor)
3. **Stufe 2:** Teilautomatisiert (System fuehrt Teile aus)
4. **Stufe 3:** Bedingt automatisiert (System fuehrt aus, Mensch ueberwacht)
5. **Stufe 4:** Hochautomatisiert (System fuehrt aus, Mensch greift bei Bedarf ein)
6. **Stufe 5:** Vollautomatisiert (kein menschliches Eingreifen)

## Quick-Check fuer Features

Bei jedem neuen Feature diese Fragen stellen:

- [ ] Kann der Lieferant das nebenbei erledigen?
- [ ] Unterstuetzt es alle 6 Automatisierungsstufen?
- [ ] Kann er Teilaufgaben delegieren?
- [ ] Funktioniert es ohne Foto, ohne Barcode?
- [ ] Was passiert bei Kommentar? (-> Klaerfall!)
- [ ] Ist der Weg zum One-Click so kurz wie moeglich?

## Design-Prinzipien

### 1. Minimaler Aufwand
- Weniger Klicks = besser
- Keine unnoetigen Pflichtfelder
- Sinnvolle Defaults

### 2. Fehlertoleranz
- Graceful Degradation wenn Foto fehlt
- Graceful Degradation wenn Barcode nicht scannbar
- Klare Fehlermeldungen

### 3. Delegation ermoeglichen
- Teilaufgaben muessen delegierbar sein
- Keine Abhaengigkeit von einer Person

### 4. Klaerfall-Handling
- Kommentare = potenzielle Klaerfaelle
- Klare Eskalationswege
- Keine Blockaden im Workflow
