@echo off
REM Rechnungstool – Startskript (Windows)

cd /d "%~dp0"

IF NOT EXIST "backend\node_modules" (
  echo Installiere Backend-Abhaengigkeiten...
  cd backend && npm install && cd ..
)

IF NOT EXIST "frontend\node_modules" (
  echo Installiere Frontend-Abhaengigkeiten...
  cd frontend && npm install && cd ..
)

IF NOT EXIST "frontend\dist" (
  echo Baue Frontend...
  cd frontend && npm run build && cd ..
)

echo.
echo Starte Rechnungstool...
echo.
node backend\server.js
pause
