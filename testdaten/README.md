# Testdaten für den Inventur-Agenten

Diese Dateien dienen zum Testen des Inventur-Agenten mit verschiedenen Datenqualitäten.

## Dateien

| Datei | Beschreibung | Erwartetes Ergebnis |
|-------|--------------|---------------------|
| 01_perfekte_daten.xlsx | Gut strukturiert, alle Felder | 10 Werkzeuge, 100% Match |
| 02_unvollstaendige_daten.xlsx | Fehlende Felder | 8 Werkzeuge, Warnungen |
| 03_chaotische_daten.xlsx | Unterschiedliche Formate | 8 Werkzeuge, Anreicherung nötig |
| 04_system_export.csv | CSV mit Semikolon | 6 Werkzeuge, Code-Mapping |
| 05_fremdsystem_export.xlsx | Anderes Schema | 7 Werkzeuge, Schema-Transformation |
| 06_handnotizen.txt | Freitext-Notizen | ~7 Werkzeuge, unsicher |
| 07_screenshot_simulation.html | UI-Screenshot (als PNG speichern) | 6 Werkzeuge via Vision |
| 08_gemischte_qualitaet.xlsx | Realistischer Mix | 10 Werkzeuge, gemischte Qualität |

## Werkwerk-Zuordnung (für Matching-Test)

Die Werkzeugnummern folgen diesem Schema:
- FM-1xxxxx → Werk München
- FM-2xxxxx → Werk Berlin
- FM-3xxxxx → Werk Hamburg

## Tipps zum Testen

1. **Starte einfach**: 01_perfekte_daten.xlsx sollte 100% funktionieren
2. **Teste Grenzen**: 06_handnotizen.txt ist absichtlich schwierig
3. **Screenshot**: 07_screenshot_simulation.html im Browser öffnen, Screenshot machen, hochladen
4. **Realistisch**: 08_gemischte_qualitaet.xlsx ist der typische Fall

## Screenshot erstellen

1. Öffne `07_screenshot_simulation.html` im Browser
2. Mache einen Screenshot (Windows: Win+Shift+S)
3. Speichere als PNG
4. Lade im Agent hoch
