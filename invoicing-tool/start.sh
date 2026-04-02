#!/bin/bash
# Rechnungstool – Startskript (macOS / Linux)

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installiere Backend-Abhängigkeiten..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installiere Frontend-Abhängigkeiten..."
  cd frontend && npm install && cd ..
fi

# Build frontend if not built yet
if [ ! -d "frontend/dist" ]; then
  echo "🔨 Baue Frontend..."
  cd frontend && npm run build && cd ..
fi

echo ""
echo "🚀 Starte Rechnungstool..."
echo ""
node backend/server.js
