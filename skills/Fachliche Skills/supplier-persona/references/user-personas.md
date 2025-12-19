# User-Personas: Supplier-Seite

## Gemeinsame Charakteristik

**Inventur ist für ALLE Supplier-User ein notwendiges Übel:**
- Kein Kerngeschäft
- Nichts womit man glänzen kann
- Muss sein, wird verstanden – aber bitte einfach und geräuschlos

## Persona 1: Key-Account-Manager

**Rolle**: Hauptansprechpartner für OEM-Kunden, verantwortlich für Kundenbeziehung

**Kontext**:
- Sitzt primär im Büro, arbeitet am PC
- Hat Überblick über Kundenanforderungen und Fristen
- Koordiniert intern, delegiert operative Aufgaben
- Unter Zeitdruck durch Kundentermine und Eskalationen

**Inventur-Bezug**:
- Bekommt Inventur-Anforderungen vom OEM
- Muss sicherstellen dass Fristen eingehalten werden
- Will Überblick über Status, nicht selbst zählen
- Braucht: Dashboard, Delegation, Erinnerungen

**Typische Aussage**: *"Ich muss dem Kunden bis Freitag bestätigen. Wer macht das bei uns?"*

---

## Persona 2: Produktionsleiter

**Rolle**: Verantwortlich für Fertigung, Werkzeuge sind sein Arbeitsmittel

**Kontext**:
- Zwischen Büro und Halle unterwegs
- Hat eigenes System/Excel für Werkzeugverwaltung
- Kennt seine Werkzeuge, weiß wo sie sind
- Wenig Zeit für Administration, Produktion hat Priorität

**Inventur-Bezug**:
- Will seine Daten mit OEM-Anforderung abgleichen
- Hat oft eigene Materialnummern, eigene Logik
- Braucht: Datenimport/-export, Abgleich-Funktion, eigene Felder

**Typische Aussage**: *"Bei mir heißt das Teil anders. Wo kann ich meine Nummer eintragen?"*

---

## Persona 3: Lagerarbeiter / Werkzeugverwalter

**Rolle**: Operative Ebene, physischer Kontakt mit Werkzeugen

**Kontext**:
- Arbeitet in Halle/Lager, oft mit Handschuhen
- Nutzt Mobilgerät oder ausgedruckte Listen
- Wenig IT-Affinität, will klare Anweisungen
- Wird oft kurzfristig für Inventur eingeteilt

**Inventur-Bezug**:
- Bekommt Liste, geht Werkzeuge durch
- Muss bestätigen: "Ist da" / "Ist nicht da" / "Woanders"
- Braucht: Große Buttons, einfache Sprache, offline-fähig

**Typische Aussage**: *"Einfach sagen was ich tun soll. Wo drück ich drauf?"*

---

## Persona 4: Externer Dienstleister (Werkzeug-Management)

**Rolle**: Outsourcing-Partner, verwaltet Werkzeuge für mehrere Kunden

**Kontext**:
- Professionelles Werkzeug-Management als Kerngeschäft
- Hat eigene Systeme und Prozesse
- Verwaltet Werkzeuge für mehrere Supplier/OEMs
- Höhere IT-Affinität, API-Integration gewünscht

**Inventur-Bezug**:
- Braucht Schnittstellen, Batch-Verarbeitung
- Automatisierung ist Kerninteresse
- Braucht: API, Bulk-Upload, automatische Rückmeldung

**Typische Aussage**: *"Können wir das automatisch aus unserem System befüllen?"*

---

## Skalierung: Vom Mini-Supplier zum Konzern

| Typ | Werkzeuge | Typische Situation |
|-----|-----------|-------------------|
| Mini-Supplier | ~10 | Ein Mensch, Werkzeuge im Schuppen hinter der Halle |
| Mittelstand | 100-500 | Eigene Werkzeugverwaltung, 1-2 Verantwortliche |
| Konzern | 1.000-10.000+ | Mehrere Standorte, evtl. ausgelagertes Management |

**Design-Implikation**: Lösung muss für alle Größen funktionieren – vom handgeschriebenen Zettel bis zur API-Integration.
