# Typische Inventur-Workflows

## Standard-Ablauf einer Werkzeug-Inventur

```
┌─────────────────────────────────────────────────────────────────┐
│  OEM sendet Inventur-Anforderung                                │
│  (Liste der zu prüfenden Werkzeuge mit Soll-Daten)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Systemischer Check (am PC)                            │
│  - Abgleich OEM-Daten mit eigenen Daten                         │
│  - Stimmt Standort? Stimmt Zustand?                             │
│  - Identifikation von Abweichungen                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Physische Prüfung                                     │
│  - Erzeugung von Prüflisten                                     │
│  - Verteilung an Verantwortliche (Lager, Produktion)            │
│  - Vor-Ort-Check: Ist das Werkzeug wirklich da?                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: Klärfälle bearbeiten                                  │
│  - Werkzeug nicht gefunden → Suche / Meldung                    │
│  - Werkzeug woanders → Standort-Update                          │
│  - Zustand abweichend → Dokumentation                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: Rückmeldung an OEM                                    │
│  - Bestätigung der geprüften Werkzeuge                          │
│  - Meldung von Abweichungen                                     │
│  - Fristgerechte Übermittlung                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Varianten je nach Kontext

### Variante A: Alles stimmt (Happy Path)
1. OEM-Daten kommen rein
2. Systemabgleich zeigt: Alles wie erwartet
3. Kurzer physischer Check zur Bestätigung
4. One-Click-Bestätigung zurück an OEM

**→ Ziel: Das sollte der Normalfall sein**

### Variante B: Datenabweichung erkannt
1. Eigene Materialnummer weicht ab
2. Eigener Standort weicht ab
3. → Klärung notwendig: Was stimmt?

**→ System muss Mapping ermöglichen**

### Variante C: Physisch nicht auffindbar
1. Werkzeug nicht am erwarteten Ort
2. Suche an anderen Standorten
3. Evtl. Meldung: Werkzeug verschollen

**→ System muss Suchprozess unterstützen**

### Variante D: Delegation erforderlich
1. Verantwortlicher hat keinen physischen Zugang
2. Aufgabe an Lager/Produktion delegieren
3. Rückmeldung einsammeln

**→ System muss Delegation + Tracking bieten**

## Geräte-Kontext

| Phase | Typisches Gerät | Anforderung |
|-------|-----------------|-------------|
| Systemischer Check | Desktop/Laptop | Volle Funktionalität, Datenabgleich |
| Listen erstellen | Desktop/Laptop | Export, Druck, Zuweisung |
| Physische Prüfung | Smartphone/Tablet | Einfache UI, große Buttons, offline |
| Rückmeldung | Desktop/Laptop | Zusammenfassung, Übermittlung |
