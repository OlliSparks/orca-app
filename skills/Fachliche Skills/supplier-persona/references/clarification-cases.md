# Klärfälle und Sondersituationen

## Grundprinzip

> **Jeder Kommentar = Klärfall beim OEM**

Sobald ein Lieferant einen Kommentar eingibt (Freitext), landet das als Klärfall beim Facheinkäufer des OEM. Die Inventur muss dann manuell bestätigt werden.

## Typische Klärfälle

### Werkzeug nicht am erwarteten Standort

**Situation**: Werkzeug ist da, aber woanders als im System hinterlegt.

**Lieferant tut**:
- Neuen Standort angeben
- Optional: Kommentar warum

**System tut**:
- Standort-Update verarbeiten
- Bei Kommentar → Klärfall

---

### Werkzeug nicht auffindbar

**Situation**: Werkzeug ist nicht da, Lieferant weiß nicht wo.

**Lieferant tut**:
- "Nicht gefunden" melden
- Pflicht-Kommentar: Was ist passiert?

**System tut**:
- Klärfall erzeugen
- OEM muss entscheiden (weitere Suche, Abschreibung, etc.)

---

### Werkzeug dauerhaft weg

**Situation**: Werkzeug existiert nicht mehr (verschrottet, verkauft, etc.)

**Lieferant tut**:
- "Werkzeug weg" melden
- Pflicht-Kommentar: Grund angeben (Freitext)

**System tut**:
- Klärfall erzeugen
- OEM prüft Akzeptanz

**Typische Gründe** (Freitext, nicht vordefiniert):
- Verschrottet
- Verkauft
- Gestohlen
- Nie erhalten
- Bei anderem Lieferanten
- etc.

---

### Daten stimmen nicht

**Situation**: Werkzeug ist da, aber Bezeichnung/Nummer passt nicht.

**Lieferant tut**:
- Korrektur vorschlagen
- Kommentar mit Details

**System tut**:
- Klärfall erzeugen
- OEM prüft und korrigiert ggf. Stammdaten

---

## Standort-Verwaltung

### Wer pflegt Standorte?

Der **Hauptverantwortliche** des Lieferanten pflegt alle Standorte.

### Was ist ein Standort?

Freitext oder strukturiert – je nach Lieferant:
- "Halle 3, Regal 12"
- "Außenlager Süd"
- "Beim Subunternehmer Müller GmbH"
- "Werkzeugschrank neben Maschine 7"

### Standort-Updates während Inventur

Lieferant kann während der Inventur Standorte aktualisieren:
- Werkzeug gefunden, aber woanders → Standort korrigieren
- Neuer Standort wird für zukünftige Inventuren übernommen

---

## Zeitrahmen

| Meilenstein | Typisch |
|-------------|---------|
| Inventur-Start | Tag 0 |
| Erste Erinnerung | ~2 Wochen |
| Zweite Erinnerung | ~3 Wochen |
| Frist | 4 Wochen |
| Eskalation | Nach Frist |

**Bei Fristüberschreitung**: Eskalationspfad (Details nicht relevant für Skill)
