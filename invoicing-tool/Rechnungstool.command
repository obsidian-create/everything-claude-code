#!/bin/bash
# macOS Launcher – Doppelklick in Finder zum Starten

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=============================="
echo "  Rechnungstool wird gestartet"
echo "=============================="

# Install + build if needed
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installiere Backend..."
  cd backend && npm install --production && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installiere Frontend..."
  cd frontend && npm install && cd ..
fi

if [ ! -d "frontend/dist" ]; then
  echo "🔨 Baue Frontend (einmalig, ~30 Sek.)..."
  cd frontend && npm run build && cd ..
fi

echo ""
echo "✅ Rechnungstool läuft auf http://localhost:3000"
echo "   Fenster mit Ctrl+C schließen"
echo ""

# Start server (browser öffnet automatisch)
node backend/server.js
