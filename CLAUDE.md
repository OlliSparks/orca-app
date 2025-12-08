# orca 1.1 - Lieferanten-API

## Projekt-Beschreibung
orca 1.1 - Lieferanten-Applikation mit API-Integration fuer das Asset-Management-System.

## Aktive Skills

### 1. Supplier-Persona Skill
Bei Feature-Design, UX-Entscheidungen und Workflow-Design konsultieren.

**Skill-Pfad:** `.claude/skills/supplier-persona/SKILL.md`

**Trigger:** Feature-Design, UX-Entscheidungen, Workflow-Design, Priorisierung

**Kernprinzip:**
> "Der Lieferant ist der Schwachpunkt in der Prozesskette - alles muss ihm dienen."

---

### 2. Orca-API Skill
Bei API-Calls, Datenabruf und Backend-Integration konsultieren.

**Skill-Pfad:** `.claude/skills/orca-api/SKILL.md`

**Trigger:** API-Calls, Datenabruf, Integration, Backend-Kommunikation

**Base-URL:** `https://int.bmw.organizingcompanyassets.com/api/orca`

**Wichtige Referenzen:**
- `.claude/skills/orca-api/references/endpoints-quick.md` - Kurzreferenz
- `.claude/skills/orca-api/references/openapi.json` - Vollstaendige OpenAPI-Spec

---

### 3. Prozess-Skills
Fuer jeden Geschaeftsprozess existiert ein eigener Skill mit Status-Maschine, API-Mapping und UI-Anforderungen.

**Skill-Pfad:** `.claude/skills/processes/[prozess]/SKILL.md`

| Prozess | Status | Skill-Pfad |
|---------|--------|------------|
| Inventur | Referenz (vollstaendig) | `processes/inventur/SKILL.md` |
| VPW (Vertragspartnerwechsel) | Template | `processes/vpw/SKILL.md` |
| Verschrottung | Template | `processes/verschrottung/SKILL.md` |
| Verlagerung | Template | `processes/verlagerung/SKILL.md` |
| ABL (Abnahmebereitschaft) | Template | `processes/abl/SKILL.md` |
| Planung | Teilweise | `processes/planung/SKILL.md` |

**Template:** `.claude/skills/processes/_template.md`

---

### 4. UX-Audit Skill
Bei Feature-Reviews, vor Releases und bei UX-Entscheidungen konsultieren.

**Skill-Pfad:** `.claude/skills/ux-audit/SKILL.md`

**Trigger:** Feature-Review, UI-Pruefung, Release-Vorbereitung, UX-Entscheidungen

**Ziel:**
> "Die App so einfach machen, dass Lieferanten sie als einzige Werkzeug-Management-Loesung nutzen wollen."

**Enthaelt:**
- 10 UX-Gebote fuer orca
- Checklisten (Feature, Liste, Formular, Workflow)
- Scoring-Matrix und Bewertungssystem
- Anti-Patterns
- Audit-Protokoll Template

---

### 5. Testing Skill
Nach jeder Prozess-Implementierung Tests erstellen und durchlaufen lassen.

**Skill-Pfad:** `.claude/skills/testing/SKILL.md`

**Trigger:** Prozess-Implementierung abgeschlossen, vor Release, nach Aenderungen

**Workflow:**
```
Prozess-Skill → Implementierung → Tests erstellen → Tests gruen → Fertig
```

**Tests werden abgeleitet aus:**
- Status-Maschine → Status-Uebergangs-Tests
- API-Integration → API-Tests (Success + Error)
- UI-Anforderungen → UI-Interaktions-Tests
- Edge Cases → Edge-Case-Tests

---

### 6. Status Skill
Vollstaendige Referenz aller Status-Codes im orca-System.

**Skill-Pfad:** `.claude/skills/status/SKILL.md`

**Trigger:** Status-Logik, Prozess-Design, UI-Texte, Statusuebergaenge

**Enthaelt:**
- Asset Status (IDLE, LOCKED, A0-A11, AL0-AL3)
- Inventory Status (I0-I4, IA-ID, FP0-FP5)
- InventoryPos Status (P0-P6, RR0-RR7, LS0-LS2)
- Process Status (I, R, Z)
- Relocation Steps (0-8)
- Scrapping Steps (0-1)
- Statusuebergaenge und Abhaengigkeiten

---

## Quick-Checks

### Bei Features (Supplier-Persona):
- [ ] Kann der Lieferant das nebenbei erledigen?
- [ ] Unterstuetzt es alle 6 Automatisierungsstufen?
- [ ] Kann er Teilaufgaben delegieren?
- [ ] Funktioniert es ohne Foto, ohne Barcode?
- [ ] Was passiert bei Kommentar? (-> Klaerfall!)
- [ ] Ist der Weg zum One-Click so kurz wie moeglich?

### Bei API-Integration:
- [ ] Welcher Endpunkt ist der richtige?
- [ ] Welche Status-Codes sind relevant? (I0-I4, P0-P6)
- [ ] Welche Query-Parameter werden benoetigt?
- [ ] Ist Batch-Operation moeglich?

## Technologie-Stack
- HTML/CSS/JavaScript
- REST API Integration
- Bearer Token Auth (JWT)
