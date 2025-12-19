@echo off
echo === ORCA Skills Sync ===
echo.
echo Kopiere Skills von OneDrive ins Repository...

xcopy /E /Y /I "C:\Users\orcao\OneDrive - orca. organizing company assets GmbH\Orca-Skills\*" "C:\Users\orcao\orca-app-github\skills\"

echo.
echo Skills synchronisiert!
echo.
echo Jetzt committen mit:
echo   git add skills/
echo   git commit -m "chore: Skills sync"
echo   git push
pause
