# Anleitung: Orca-Skills bearbeiten

Diese Anleitung erklärt, wie du Skills im Orca-Skills Verzeichnis bearbeiten oder neue erstellen kannst.

---

## Wichtig: Bearbeitung nur mit Claude!

**Skills dürfen ausschließlich mit Claude (Claude.ai oder Claude Code) bearbeitet werden.**

### Warum?

1. **Konsistenz** - Claude kennt die Struktur und hält das Format ein
2. **Qualität** - Änderungen werden korrekt und vollständig dokumentiert
3. **Spracheingabe** - Du kannst Änderungen einfach beschreiben, Claude setzt sie um
4. **Automatische Updates** - README.md und Statistiken werden automatisch aktualisiert
5. **Fehlerminimierung** - Keine Tippfehler oder Formatierungsprobleme

### So gehst du vor:

1. Öffne **Claude.ai** (https://claude.ai) oder **Claude Code**
2. Beschreibe deine Änderung in natürlicher Sprache
3. Claude setzt die Änderung um und aktualisiert alle betroffenen Dateien

---

## Voraussetzungen

- Zugriff auf den OneDrive-Ordner `Orca-Skills`
- Zugang zu **Claude.ai** oder **Claude Code**

### Claude Code einrichten (empfohlen)

Claude Code ist die beste Option für die Skill-Bearbeitung:

1. **Installation**: Claude Code über Anthropic installieren
2. **Arbeitsverzeichnis**: Den OneDrive-Ordner `Orca-Skills` als Arbeitsverzeichnis setzen
3. **Loslegen**: Änderungen per Sprache oder Text beschreiben

---

## Skills bearbeiten

### Beispiele für Änderungsanfragen an Claude:

**Skill aktualisieren:**
> "Bitte aktualisiere den Inventur-Skill und ergänze im Abschnitt 'Hauptaufgaben' den Punkt 'Fotodokumentation der Assets'"

**Neuen Abschnitt hinzufügen:**
> "Füge dem WVL-Skill einen neuen Abschnitt 'Eskalationspfad' hinzu mit den Stufen: 1. IVL, 2. SUP, 3. FEK"

**Status ändern:**
> "Markiere den ABL-Prozess-Skill als dokumentiert, ich habe alle Informationen geliefert"

**Fehler korrigieren:**
> "Im Status-Skill ist ein Fehler: P2 sollte 'Bestätigt' heißen, nicht 'Confirmed'"

### Claude erledigt automatisch:

- ✅ Änderung in der SKILL.md Datei
- ✅ Aktualisierung der README.md (falls nötig)
- ✅ Anpassung der Statistik
- ✅ Korrekte Markdown-Formatierung
- ✅ Konsistente Struktur

---

## Neuen Skill erstellen

### So beschreibst du einen neuen Skill:

**Beispiel-Anfrage:**
> "Erstelle einen neuen Prozess-Skill 'Wartung' mit folgenden Informationen:
> - Beschreibung: Regelmäßige Wartung und Inspektion von Assets
> - Hauptaufgaben: Wartungsplanung, Durchführung, Dokumentation
> - Trigger: Wartungsintervall erreicht, Schadensmeldung, Audit
> - Beteiligte Rollen: WVL, ID, SUP"

### Claude erstellt automatisch:

1. Den Ordner `Prozess-Skills/wartung/`
2. Die Datei `SKILL.md` mit allen Inhalten
3. Den `references/` Unterordner
4. Aktualisiert die `README.md` mit dem neuen Skill
5. Passt die Statistik an

---

## Skill-Struktur (zur Information)

Skills sind in Kategorien organisiert:

```
Orca-Skills/
├── README.md              ← Gesamtübersicht (wird automatisch aktualisiert)
├── ANLEITUNG.md           ← Diese Datei
│
├── Fachliche Skills/
│   ├── supplier-persona/
│   ├── product-owner/
│   └── jurist/
│
├── Prozess-Skills/
│   ├── inventur/
│   ├── verlagerung/
│   └── ...
│
├── Rollen-Skills/
│   ├── OEM-Rollen/
│   ├── Lieferanten-Rollen/
│   ├── Prozess-Rollen/
│   └── Support-Rollen/
│
└── Technische Skills/
    ├── orca-api/
    ├── status/
    └── ...
```

Jeder Skill enthält:
- `SKILL.md` - Hauptdokumentation
- `references/` - Zusätzliche Dokumente, Vorlagen, Beispiele

---

## Status-Kennzeichnung

| Symbol | Bedeutung | Beschreibung |
|--------|-----------|--------------|
| ✅ | Dokumentiert | Skill ist vollständig beschrieben |
| 🔶 | TODO | Skill angelegt, Inhalt wird noch ergänzt |
| ❌ | Fehlt | Skill existiert noch nicht |

**Beispiel-Anfrage zum Status ändern:**
> "Der Verlagerung-Skill ist jetzt fertig, bitte Status auf 'Dokumentiert' setzen"

---

## Häufige Anfragen

### Übersicht anzeigen
> "Zeige mir eine Übersicht aller Skills"
> "Welche Skills sind noch TODO?"
> "Was steht im WVL-Skill?"

### Inhalte ergänzen
> "Ergänze im FEK-Skill die Keycloak-Berechtigungen"
> "Füge dem Inventur-Skill einen Workflow-Abschnitt hinzu"

### Struktur anpassen
> "Verschiebe den Skill X in eine andere Kategorie"
> "Benenne den Skill um von X zu Y"

### Referenzen hinzufügen
> "Füge dem Status-Skill eine Referenz auf das Confluence-Dokument hinzu"

---

## Best Practices

1. **Klare Beschreibung** - Je genauer du beschreibst, desto besser das Ergebnis
2. **Kontext liefern** - Erkläre warum die Änderung nötig ist
3. **Prüfen** - Lass dir das Ergebnis zeigen und bestätige es
4. **Iterieren** - Korrekturen sind jederzeit möglich

---

## Nicht empfohlen ⚠️

Folgendes solltest du **vermeiden**:

- ❌ SKILL.md Dateien manuell mit einem Texteditor bearbeiten
- ❌ Neue Ordner/Dateien manuell anlegen
- ❌ README.md manuell aktualisieren
- ❌ Copy & Paste aus anderen Dokumenten ohne Claude-Prüfung

**Grund:** Manuelle Änderungen führen oft zu Inkonsistenzen, Formatierungsfehlern und veralteten Statistiken.

---

## Hilfe & Kontakt

Bei Fragen zur Skill-Bearbeitung:
- **Technische Fragen**: Claude direkt fragen
- **Inhaltliche Fragen**: [Ansprechpartner eintragen]
- **Zugriffsprobleme**: [IT-Kontakt eintragen]

---

*Stand: 10.12.2025*
