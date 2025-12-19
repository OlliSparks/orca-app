# Orca-Skills Verzeichnis

Übersicht aller Skills für das Orca Asset-Management-System.

**Stand:** 10.12.2025

---

## Fachliche Skills

| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **supplier-persona** | Lieferanten-Perspektive für UX-Entscheidungen | ✅ Dokumentiert |
| **product-owner** | Product Owner - Gesamtsystem-Vision & Prozess-Ownership | ✅ Dokumentiert |
| **jurist** | Rechtliche Prüfung von Code und Inhalten | ✅ Dokumentiert |

---

## Prozess-Skills

| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **inventur** | Inventur-Prozess (Bestandsaufnahme) | 🔶 TODO - In Bearbeitung |
| **verlagerung** | Verlagerungs-Prozess (Asset-Transport) | 🔶 TODO - In Bearbeitung |
| **abl** | ABL (Außerbetriebnahme-Liste) | 🔶 TODO |
| **vpw** | VPW (Vertragspartnerwechsel) | 🔶 TODO |
| **verschrottung** | Verschrottungs-Prozess | 🔶 TODO |
| **inventurplanung** | Inventurplanung (Terminierung) | 🔶 TODO |

---

## Rollen-Skills

### OEM-Rollen
| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **abc** | Anlagenbuchhaltung (Commodity) - alle Buchungskreise | ✅ Dokumentiert |
| **abl** | Anlagenbuchhaltung (Local) - eigener Buchungskreis | ✅ Dokumentiert |
| **fek** | Facheinkäufer - Werkzeugverantwortlicher OEM | ✅ Dokumentiert |
| **fek-as** | Facheinkäufer Assistenz | ✅ Dokumentiert |
| **cl** | Genehmiger (Approver) | ✅ Dokumentiert |
| **stc** | Steuerliche Abwicklung (Commodity) | ✅ Dokumentiert |
| **stl** | Steuerliche Abwicklung (Local) | ✅ Dokumentiert |
| **wvo** | Werkzeugverantwortlicher Owner | ✅ Dokumentiert |
| **rm** | Risikomanagement | ✅ Dokumentiert |
| **rev** | Revision | ✅ Dokumentiert |

### Lieferanten-Rollen
| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **ivl** | Inventurverantwortlicher Lieferant | ✅ Dokumentiert |
| **wvl** | Werkzeugverantwortlicher Lieferant | ✅ Dokumentiert |
| **wvl-loc** | WVL einer Location | ✅ Dokumentiert |
| **id** | Inventurdurchführer | ✅ Dokumentiert |
| **itl** | IT-Verantwortlicher Lieferant | ✅ Dokumentiert |
| **liw** | n-tier Lieferant im Werkzeugbesitz | ✅ Dokumentiert |
| **vvl** | Versand-Verantwortlicher Lieferant | ✅ Dokumentiert |

### Prozess-Rollen (via ABO)
| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **vv** | Versorgungsverantwortliche | ✅ Dokumentiert |
| **pms** | Produktmanagement Sonderzubehör | ✅ Dokumentiert |
| **ve** | Verwertungseinkauf | ✅ Dokumentiert |
| **vw** | Verwerter (Recycler) | ✅ Dokumentiert |

### Support-Rollen
| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **sup** | Inventursupport (Inventurbüro) | ✅ Dokumentiert |

---

## Technische Skills

| Skill | Beschreibung | Status |
|-------|--------------|--------|
| **orca-api** | API-Referenz (OpenAPI, Endpunkte) | ✅ Dokumentiert |
| **architektur** | System-Architektur, Code-Review, Tech Debt | ✅ Dokumentiert |
| **deployment** | Deployment-Prozess, GitHub Pages | ✅ Dokumentiert |
| **authentifizierung** | JWT Auth, Token-Management, Sicherheit | ✅ Dokumentiert |
| **performance** | Performance-Messung und -Optimierung | ✅ Dokumentiert |
| **testautomatisierung** | Automatisierte Tests, Rollen-Tests, Test-Reports | ✅ Dokumentiert |
| **status** | Status-Codes, Statusübergänge, Workflow-States | ✅ Dokumentiert |

---

## Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Dokumentiert - Skill ist vollständig beschrieben |
| 🔶 | TODO - Skill ist angelegt, Inhalt wird noch ergänzt |
| ❌ | Fehlt - Skill wurde noch nicht erstellt |

---

## Verzeichnisstruktur

```
Orca-Skills/
├── README.md                    # Diese Übersicht
│
├── Fachliche Skills/
│   ├── supplier-persona/        # Lieferanten-Perspektive
│   │   ├── SKILL.md
│   │   └── references/
│   ├── product-owner/           # Product Owner
│   │   ├── SKILL.md
│   │   └── references/
│   └── jurist/                  # Rechtliche Prüfung
│       ├── SKILL.md
│       └── references/
│
├── Prozess-Skills/
│   ├── inventur/                # Inventur
│   │   ├── SKILL.md
│   │   └── references/
│   ├── verlagerung/             # Verlagerung
│   │   ├── SKILL.md
│   │   └── references/
│   ├── abl/                     # Außerbetriebnahme
│   │   ├── SKILL.md
│   │   └── references/
│   ├── vpw/                     # Vertragspartnerwechsel
│   │   ├── SKILL.md
│   │   └── references/
│   ├── verschrottung/           # Verschrottung
│   │   ├── SKILL.md
│   │   └── references/
│   └── inventurplanung/         # Inventurplanung
│       ├── SKILL.md
│       └── references/
│
├── Rollen-Skills/
│   ├── OEM-Rollen/
│   │   ├── abc/                    # Anlagenbuchhaltung Commodity
│   │   ├── abl/                    # Anlagenbuchhaltung Local
│   │   ├── fek/                    # Facheinkäufer
│   │   ├── fek-as/                 # Facheinkäufer Assistenz
│   │   ├── cl/                     # Genehmiger
│   │   ├── stc/                    # Steuerliche Abwicklung Commodity
│   │   ├── stl/                    # Steuerliche Abwicklung Local
│   │   ├── wvo/                    # Werkzeugverantwortlicher Owner
│   │   ├── rm/                     # Risikomanagement
│   │   └── rev/                    # Revision
│   ├── Lieferanten-Rollen/
│   │   ├── ivl/                    # Inventurverantwortlicher Lieferant
│   │   ├── wvl/                    # Werkzeugverantwortlicher Lieferant
│   │   ├── wvl-loc/                # WVL Location
│   │   ├── id/                     # Inventurdurchführer
│   │   ├── itl/                    # IT-Verantwortlicher Lieferant
│   │   ├── liw/                    # n-tier Lieferant
│   │   └── vvl/                    # Versand-Verantwortlicher
│   ├── Prozess-Rollen/
│   │   ├── vv/                     # Versorgungsverantwortliche
│   │   ├── pms/                    # Produktmanagement Sonderzubehör
│   │   ├── ve/                     # Verwertungseinkauf
│   │   └── vw/                     # Verwerter
│   └── Support-Rollen/
│       └── sup/                    # Inventursupport
│
└── Technische Skills/
    ├── orca-api/                # API-Referenz
    │   ├── SKILL.md
    │   └── references/
    │       ├── endpoints-quick.md
    │       └── openapi.json
    ├── architektur/             # System-Architektur
    │   ├── SKILL.md
    │   └── references/
    ├── deployment/              # Deployment
    │   ├── SKILL.md
    │   └── references/
    ├── authentifizierung/       # Auth & Security
    │   ├── SKILL.md
    │   └── references/
    ├── performance/             # Performance
    │   ├── SKILL.md
    │   └── references/
    ├── testautomatisierung/     # Test-Automatisierung
    │   ├── SKILL.md
    │   └── references/
    └── status/                  # Status-Codes & Workflows
        ├── SKILL.md
        └── references/
```

---

## Verwendung

### In Claude Code
Skills können in Claude Code referenziert werden:
```
Skill: supplier-persona
Skill: orca-api
```

### Skill-Struktur
Jeder Skill enthält:
- `SKILL.md` - Hauptdokumentation mit Trigger, Checklisten, Referenzen
- `references/` - Zusätzliche Dokumentation, Vorlagen, Beispiele

---

## Statistik

| Kategorie | Gesamt | Dokumentiert | TODO |
|-----------|--------|--------------|------|
| Fachliche Skills | 3 | 3 | 0 |
| Prozess-Skills | 6 | 0 | 6 |
| Rollen-Skills | 22 | 22 | 0 |
| - OEM-Rollen | 10 | 10 | 0 |
| - Lieferanten-Rollen | 7 | 7 | 0 |
| - Prozess-Rollen | 4 | 4 | 0 |
| - Support-Rollen | 1 | 1 | 0 |
| Technische Skills | 7 | 7 | 0 |
| **Gesamt** | **38** | **32** | **6** |

---

*Zuletzt aktualisiert: 10.12.2025*
