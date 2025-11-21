@echo off
echo ========================================
echo ORCA 2.0 - Inventory Service
echo ========================================
echo.
echo Starte lokalen Webserver...
echo.
echo Die App wird unter folgender Adresse verfuegbar sein:
echo http://localhost:8000
echo.
echo Druecken Sie Strg+C zum Beenden
echo ========================================
echo.

REM Try Python 3
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    echo Python nicht gefunden. Versuche alternative Methode...
    echo.
    echo Bitte oeffnen Sie index.html direkt im Browser:
    echo %CD%\index.html
    pause
)
