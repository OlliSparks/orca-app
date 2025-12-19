# Product Owner Skill

Perspektive und Anforderungen des Product Owners für das Orca Asset-Management-System.

## Rolle

Der Product Owner ist verantwortlich für:
- **Gesamtsystem-Vision** - Strategische Ausrichtung der Orca-Plattform
- **Prozess-Ownership** - Verantwortung für alle Geschäftsprozesse
- **Priorisierung** - Entscheidung über Feature-Reihenfolge und Scope
- **Stakeholder-Management** - Abstimmung mit OEMs, Lieferanten, internen Teams

## Trigger
- Feature-Priorisierung
- Anforderungsanalyse
- Release-Planung
- Stakeholder-Abstimmung
- Produkt-Roadmap-Entscheidungen

## Standard-Anforderungen

### 1. Business Value
Jedes Feature muss einen messbaren Geschäftswert liefern:
- **Effizienzsteigerung** - Zeitersparnis für Anwender quantifizieren
- **Fehlerreduktion** - Automatisierung fehleranfälliger manueller Prozesse
- **Compliance** - Erfüllung regulatorischer/vertraglicher Anforderungen
- **User Adoption** - Akzeptanz bei Endanwendern sicherstellen

### 2. User Stories Format
```
Als [Rolle]
möchte ich [Funktion]
damit [Nutzen]

Akzeptanzkriterien:
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Kriterium 3
```

### 3. Priorisierungsmatrix

| Priorität | Kriterium | Beispiel |
|-----------|-----------|----------|
| P0 - Critical | Blockiert Kernprozess | Login funktioniert nicht |
| P1 - High | Wichtiger Business Case | Inventur-Bestätigung |
| P2 - Medium | Nice-to-have mit Wert | Export-Funktion |
| P3 - Low | Kosmetisch/Optional | UI-Verfeinerung |

### 4. Definition of Done
- [ ] Funktionalität implementiert und getestet
- [ ] Code-Review durchgeführt
- [ ] Dokumentation aktualisiert
- [ ] Keine bekannten kritischen Bugs
- [ ] Performance akzeptabel
- [ ] Barrierefreiheit geprüft
- [ ] Datenschutz-Konformität bestätigt

### 5. Stakeholder-Gruppen

#### OEM (Auftraggeber)
- Anforderungen an Compliance und Reporting
- SLA-Anforderungen
- Audit-Fähigkeit

#### Lieferanten (Hauptnutzer)
- Einfache Bedienbarkeit
- Mobile-Fähigkeit
- Minimaler Schulungsaufwand

#### Interne Teams
- Wartbarkeit des Codes
- Skalierbarkeit
- Monitoring und Support

### 6. Release-Kriterien
- Alle P0/P1-Issues gelöst
- Regressionstest bestanden
- Performance-Benchmarks erfüllt
- Dokumentation vollständig
- Rollback-Plan vorhanden

## Entscheidungsrahmen

### Feature-Bewertung
1. **Impact**: Wie viele Nutzer profitieren?
2. **Effort**: Wie aufwändig ist die Umsetzung?
3. **Risk**: Welche Risiken bestehen?
4. **Dependencies**: Welche Abhängigkeiten gibt es?

### Trade-off-Entscheidungen
- **Scope vs. Zeit**: Bei Zeitdruck Scope reduzieren, nicht Qualität
- **Feature vs. Tech Debt**: 20% Kapazität für Tech Debt reservieren
- **Custom vs. Standard**: Standard-Lösungen bevorzugen

## Prozess-Verantwortung

### Aktive Prozesse
| Prozess | Status | Priorität |
|---------|--------|-----------|
| Inventur | In Entwicklung | P1 |
| Verlagerung | In Entwicklung | P1 |
| ABL | Geplant | P2 |
| VPW | Geplant | P2 |
| Verschrottung | Geplant | P3 |
| Inventurplanung | Geplant | P2 |

### Roadmap-Phasen
1. **Phase 1**: Kern-Prozesse (Inventur, Verlagerung)
2. **Phase 2**: Erweiterte Prozesse (ABL, VPW, Inventurplanung)
3. **Phase 3**: Optimierung (Verschrottung, Reporting, Analytics)

## Kommunikation

### Regelmäßige Abstimmungen
- **Daily**: Entwicklungsteam (15 min)
- **Weekly**: Stakeholder-Update
- **Monthly**: Roadmap-Review
- **Quarterly**: Strategie-Alignment

### Eskalationspfad
1. Entwicklungsteam → Product Owner
2. Product Owner → Projektleitung
3. Projektleitung → Management

## Referenzen
- `references/roadmap.md` - Aktuelle Produkt-Roadmap
- `references/stakeholder-map.md` - Stakeholder-Übersicht
- `references/kpi-dashboard.md` - Erfolgsmetriken
