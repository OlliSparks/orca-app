# Testdaten DRAEXLMAIER (133188)

Realistische Testdaten basierend auf echten Inventurdaten.

## Dateien

| Datei | Beschreibung | Werkzeuge | Schwierigkeit |
|-------|--------------|-----------|---------------|
| draexlmaier_01_perfekt.xlsx | Ideal strukturiert | 30 | Einfach |
| draexlmaier_02_interne_liste.xlsx | Typische interne Excel | 18 | Mittel |
| draexlmaier_03_hunedoara.xlsx | Nur ein Standort | 15 | Einfach |
| draexlmaier_04_legacy_export.csv | Altsystem mit Codes | 12 | Mittel |
| draexlmaier_05_handnotizen.txt | Freitext-Notizen | ~20 | Schwer |
| draexlmaier_06_teilmatch.xlsx | Nur ~8 von 13 matchen | 13 | Schwer |
| draexlmaier_07_screenshot.html | UI-Screenshot (PNG) | 8 | Mittel |
| draexlmaier_08_chaotisch.xlsx | Worst Case | ~8 | Sehr schwer |

## Standorte in den Daten

- Hunedoara, RO (Rumaenien) - viele SGW und Schaeumformen
- Zrenjanin, RS (Serbien) - hauptsaechlich Schaeumformen
- Sousse, TN (Tunesien) - Spritzgiesswerkzeuge
- Gyoer/Gyal, HU (Ungarn) - Spritzgiesswerkzeuge
- Bad Salzuflen, Stahringen, Neustadt (DE)
- Hornstein, Braunau (AT)

## Test-Szenarien

1. **Happy Path**: draexlmaier_01_perfekt.xlsx
2. **Realistisch**: draexlmaier_02_interne_liste.xlsx
3. **Standort-Filter**: draexlmaier_03_hunedoara.xlsx
4. **Altsystem-Import**: draexlmaier_04_legacy_export.csv
5. **Vision-Test**: draexlmaier_07_screenshot.html als PNG
6. **Teilweise unbekannt**: draexlmaier_06_teilmatch.xlsx
7. **Stress-Test**: draexlmaier_08_chaotisch.xlsx
