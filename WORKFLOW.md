# Team-Workflow ORCA 2.0

## Taeglicher Workflow

### 1. Session starten
```bash
cd /c/Users/orcao/orca-app-github
git pull                    # Aenderungen vom Kollegen holen
```

### 2. Arbeiten
- Code aendern
- Mit Claude Code arbeiten
- Testen

### 3. Session beenden
```bash
git add .
git commit -m "feat/fix: Kurze Beschreibung"
git push
```

---

## Skills aktualisieren

Wenn Skills in OneDrive geaendert wurden:

**Option A: Script ausfuehren**
```bash
./sync-skills.bat           # Windows
```

**Option B: Manuell**
```bash
cp -r "OneDrive/.../Orca-Skills/*" skills/
git add skills/
git commit -m "chore: Skills sync"
git push
```

---

## Konflikte vermeiden

1. **Kommunikation:** Absprechen wer an welcher Datei arbeitet
2. **Kleine Commits:** Oft committen, nicht alles auf einmal
3. **Pull vor Push:** Immer erst `git pull` dann `git push`

### Bei Konflikt
```bash
git pull                    # Zeigt Konflikt an
# Datei oeffnen, Konflikte loesen (<<<< ==== >>>> entfernen)
git add .
git commit -m "fix: Merge conflict resolved"
git push
```

---

## Dokumentation aktuell halten

### CLAUDE.md
- Bei neuen Services/Pages aktualisieren
- Bei Architektur-Aenderungen aktualisieren

### docs/SESSION_NOTES.md
- Aktuelle Bugs notieren
- Wichtige Entscheidungen dokumentieren
- Offene TODOs tracken

### skills/
- Bei Prozess-Aenderungen Skills updaten
- Sync-Script ausfuehren

---

## Fuer Claude Code

Claude liest automatisch:
1. `CLAUDE.md` - Projekt-Kontext
2. `skills/` - Fachliches Wissen
3. `docs/` - Session-Infos

Bei neuer Session kann Claude gefragt werden:
> "Lies CLAUDE.md und docs/SESSION_NOTES.md - was ist der aktuelle Stand?"

---

## Kontakt bei Problemen

- Git-Konflikte: Gemeinsam loesen
- Claude-Fragen: Neue Session starten, Kontext laden
