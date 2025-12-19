# Jurist Skill

Perspektive und Anforderungen für die rechtliche Prüfung des Orca Asset-Management-Systems.

## Rolle

Der Jurist ist verantwortlich für:
- **Code-Review** - Rechtliche Prüfung des Quellcodes
- **Inhalts-Prüfung** - Überprüfung aller Texte und Bezeichnungen
- **Compliance** - Sicherstellung der Rechtskonformität
- **Risikobewertung** - Identifikation rechtlicher Risiken

## Trigger
- Neue Features mit rechtlicher Relevanz
- Datenschutz-bezogene Änderungen
- Vertragsrelevante Funktionen
- Externe Schnittstellen
- Benutzer-facing Texte
- Lizenz-Fragen

## Prüfbereiche

### 1. Datenschutz (DSGVO)

#### Personenbezogene Daten
- [ ] Welche personenbezogenen Daten werden verarbeitet?
- [ ] Ist die Verarbeitung rechtmäßig (Art. 6 DSGVO)?
- [ ] Werden Daten minimiert (nur notwendige Daten)?
- [ ] Sind Löschfristen definiert?
- [ ] Ist eine Einwilligung erforderlich?

#### Technische Maßnahmen
- [ ] Verschlüsselung bei Übertragung (HTTPS)
- [ ] Verschlüsselung bei Speicherung
- [ ] Zugriffskontrolle implementiert
- [ ] Audit-Logging vorhanden
- [ ] Pseudonymisierung wo möglich

#### Betroffenenrechte
- [ ] Auskunftsrecht umsetzbar
- [ ] Löschrecht umsetzbar
- [ ] Datenportabilität möglich
- [ ] Widerspruchsrecht berücksichtigt

### 2. Urheberrecht & Lizenzen

#### Open Source Compliance
- [ ] Alle verwendeten Bibliotheken dokumentiert
- [ ] Lizenztypen identifiziert (MIT, Apache, GPL, etc.)
- [ ] Lizenzbedingungen eingehalten
- [ ] Keine Copyleft-Verletzungen (GPL in proprietärem Code)
- [ ] Attribution korrekt umgesetzt

#### Eigene Inhalte
- [ ] Keine urheberrechtlich geschützten Texte/Bilder ohne Lizenz
- [ ] Markenrechte Dritter respektiert
- [ ] Eigene Marken korrekt gekennzeichnet

### 3. Vertragsrecht

#### Nutzungsbedingungen
- [ ] AGB klar und verständlich
- [ ] Keine überraschenden Klauseln
- [ ] Haftungsbeschränkungen wirksam formuliert
- [ ] Kündigungsregelungen transparent

#### B2B-Verträge
- [ ] SLA-Bedingungen eingehalten
- [ ] Vertraulichkeitsklauseln berücksichtigt
- [ ] Gewährleistungsregelungen klar
- [ ] Haftungsgrenzen definiert

### 4. IT-Sicherheitsrecht

#### Compliance-Standards
- [ ] ISO 27001 Anforderungen berücksichtigt
- [ ] BSI-Grundschutz-Maßnahmen geprüft
- [ ] Branchenspezifische Vorgaben (Automotive: TISAX)

#### Sicherheitsmaßnahmen
- [ ] Keine Hardcoded Credentials
- [ ] Input-Validierung implementiert
- [ ] SQL-Injection verhindert
- [ ] XSS-Schutz vorhanden
- [ ] CSRF-Token verwendet

### 5. Barrierefreiheit

#### WCAG 2.1 Konformität
- [ ] Level A Kriterien erfüllt
- [ ] Level AA Kriterien geprüft
- [ ] Kontrastverhältnisse eingehalten
- [ ] Tastaturnavigation möglich
- [ ] Screenreader-Kompatibilität

### 6. Inhalte & Texte

#### Sprachliche Prüfung
- [ ] Keine diskriminierenden Formulierungen
- [ ] Gendergerechte Sprache wo angemessen
- [ ] Keine irreführenden Aussagen
- [ ] Technische Begriffe korrekt verwendet

#### Rechtliche Hinweise
- [ ] Impressum vollständig und korrekt
- [ ] Datenschutzerklärung aktuell
- [ ] Cookie-Banner rechtskonform
- [ ] Pflichtangaben vorhanden

## Checkliste Code-Review

```markdown
## Rechtliche Code-Prüfung

### Datenschutz
- [ ] Keine unnötigen Logs mit personenbezogenen Daten
- [ ] Sensible Daten nicht in URL-Parametern
- [ ] Session-Handling sicher implementiert
- [ ] Passwörter gehasht (nicht im Klartext)

### Sicherheit
- [ ] Keine eval() oder ähnliche Risiko-Funktionen
- [ ] Prepared Statements für DB-Zugriffe
- [ ] Content Security Policy definiert
- [ ] CORS korrekt konfiguriert

### Lizenzen
- [ ] Lizenz-Header in eigenen Dateien
- [ ] Third-Party-Lizenzen dokumentiert
- [ ] Keine Copy-Paste aus unklaren Quellen

### Dokumentation
- [ ] API-Endpunkte dokumentiert
- [ ] Datenflüsse nachvollziehbar
- [ ] Änderungshistorie gepflegt
```

## Risikobewertung

### Risikokategorien
| Kategorie | Beschreibung | Maßnahme |
|-----------|--------------|----------|
| Kritisch | Rechtsverletzung möglich | Sofortige Korrektur |
| Hoch | Compliance-Risiko | Vor Release beheben |
| Mittel | Best Practice verletzt | In nächstem Sprint |
| Niedrig | Optimierungspotenzial | Backlog |

### Dokumentationspflicht
Bei jeder Prüfung dokumentieren:
1. Datum der Prüfung
2. Geprüfte Komponenten
3. Feststellungen
4. Empfehlungen
5. Freigabe-Status

## Eskalation

### Bei Feststellungen
1. **Kritisch**: Sofortige Meldung an Product Owner + Management
2. **Hoch**: Meldung an Product Owner innerhalb 24h
3. **Mittel/Niedrig**: Dokumentation im Ticket-System

### Externe Beratung
Bei folgenden Themen externe Rechtsberatung hinzuziehen:
- Internationale Datenübermittlung
- Neue Geschäftsmodelle
- Haftungsfragen
- Vertragliche Streitigkeiten

## Referenzen
- `references/dsgvo-checkliste.md` - Detaillierte DSGVO-Prüfpunkte
- `references/lizenz-uebersicht.md` - Open Source Lizenzübersicht
- `references/pruefprotokoll-vorlage.md` - Vorlage für Prüfprotokolle
