#!/bin/bash
# ============================================
#  Rechnungstool — Mac Setup (einmalig)
#  Installiert alles und startet die App
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Rechnungstool Setup für Mac   ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js fehlt!${NC}"
  echo ""
  echo "Bitte installieren:"
  echo "  1. https://nodejs.org öffnen"
  echo "  2. 'LTS' Version herunterladen"
  echo "  3. Installer ausführen"
  echo "  4. Dieses Skript nochmal starten"
  echo ""
  open "https://nodejs.org"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) gefunden${NC}"
echo ""

# Backend
echo -e "${YELLOW}📦 Backend wird installiert...${NC}"
cd "$DIR/backend"
npm install --production --silent
echo -e "${GREEN}✅ Backend bereit${NC}"

# Frontend
echo -e "${YELLOW}📦 Frontend wird installiert...${NC}"
cd "$DIR/frontend"
npm install --silent
echo -e "${GREEN}✅ Frontend installiert${NC}"

# Build
echo -e "${YELLOW}🔨 App wird gebaut (ca. 30 Sek.)...${NC}"
npm run build --silent
echo -e "${GREEN}✅ App gebaut${NC}"

# Electron (optional)
echo ""
echo -e "${BLUE}🖥  Desktop-App installieren?${NC}"
read -p "   Electron installieren? (Empfohlen, ~200MB) [j/N]: " install_electron

if [[ "$install_electron" =~ ^[jJyY]$ ]]; then
  echo -e "${YELLOW}📦 Electron wird installiert (~200MB)...${NC}"
  cd "$DIR/electron"
  npm install --silent
  echo -e "${GREEN}✅ Electron bereit${NC}"
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅  Setup abgeschlossen!         ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}App starten:${NC}"
  echo "  cd $(basename $DIR)/electron && npm start"
  echo ""
  read -p "Jetzt starten? [J/n]: " start_now
  if [[ ! "$start_now" =~ ^[nN]$ ]]; then
    npm start
  fi
else
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅  Setup abgeschlossen!         ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}App im Browser starten:${NC}"
  echo "  cd $(basename $DIR) && node backend/server.js"
  echo ""
  read -p "Jetzt im Browser starten? [J/n]: " start_now
  if [[ ! "$start_now" =~ ^[nN]$ ]]; then
    cd "$DIR"
    node backend/server.js
  fi
fi
