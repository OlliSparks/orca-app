# UX-Prinzipien für Supplier-Anwendungen

## Oberste Maxime

> **"Inventur muss so einfach sein, dass sie nebenbei passiert."**

Der Supplier hat keine Zeit und keine Lust auf Inventur. Jede Sekunde die wir ihm sparen, jede Frage die wir ihm ersparen, ist ein Gewinn.

## Kernanforderungen

### 1. Frühzeitige Information
- Supplier muss rechtzeitig wissen, dass Inventur ansteht
- Klare Fristen, keine Überraschungen
- Reminder-Funktion für nahende Deadlines

### 2. Klare Gliederung / Übersicht
- Auf einen Blick: Was muss ich tun? Wie viel?
- Fortschrittsanzeige: Was ist erledigt?
- Priorisierung: Was ist dringend?

### 3. Einfacher Datenabgleich
- Eigene Materialnummer anzeigen/eingeben können
- Letzter bekannter Standort vorausgefüllt
- Mapping zwischen OEM-Daten und eigenen Daten

### 4. Narrensichere Bedienung
- Keine Fragen bei der Bedienung
- Große, eindeutige Buttons
- Klare Sprache, keine Fachbegriffe wo vermeidbar
- Fehlertoleranz: Rückgängig-Option, keine Sackgassen

### 5. Intuitive Sonderfälle
- Was wenn nicht gefunden? → Klarer Weg
- Was wenn woanders? → Standort-Update einfach
- Was wenn beschädigt? → Dokumentation einfach

### 6. Delegation
- Aufgaben an andere zuweisen können
- Status der delegierten Aufgaben sehen
- Keine Medienbrüche (alles im System)

### 7. Maximale Automatisierung
- Je weniger manuelle Schritte, desto besser
- Vorausgefüllte Daten wo möglich
- Intelligente Defaults

## Die Zielhorizonte

### Kurzfristig: Minimaler Klick-Aufwand
- Jede Aktion mit möglichst wenig Klicks
- Bulk-Aktionen für "alle bestätigen"
- Schnellfilter für Klärfälle

### Mittelfristig: One-Click-Inventur
- System bereitet alles vor
- Datenabgleich automatisch
- User bestätigt nur noch Gesamtergebnis
- Nur Ausnahmen erfordern manuelle Aktion

### Langfristig: Zero-Click-Inventur
- Vollautomatischer Datenabgleich
- Automatische Rückmeldung bei Übereinstimmung
- User wird nur bei Abweichungen involviert

## Anti-Patterns (Was wir vermeiden)

❌ Komplexe Formulare mit vielen Pflichtfeldern
❌ Unklare Fehlermeldungen
❌ Versteckte Funktionen in Untermenüs
❌ Unterschiedliche Wege für gleiche Aktionen
❌ Daten eingeben die das System schon kennt
❌ Bestätigungsdialoge für Standardaktionen
❌ Fachsprache die nur OEM versteht
❌ Funktionen die nur am Desktop gehen
❌ **Foto als Pflicht** – In vielen Werken verboten!
❌ **Gebündelte Aufträge** – Nicht delegierbar
❌ **Nur Einzelansichten** – Zu langsam für Masse

## Design-Entscheidungshilfe

Bei jeder UI-Entscheidung fragen:

1. **Kann ich es weglassen?** → Weniger ist mehr
2. **Kann ich es vorausfüllen?** → Defaults sind Gold
3. **Kann ich es automatisieren?** → User soll bestätigen, nicht eingeben
4. **Funktioniert es auf dem Handy?** → Mobile first für physische Prüfung
5. **Versteht es meine Oma?** → Einfache Sprache, klare Aktionen
