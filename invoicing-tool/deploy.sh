#!/bin/bash
# ============================================
#  Rechnungstool — Automatisches Deployment
#  Zu Railway.app (kostenlos, kein GitHub nötig)
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Rechnungstool → Railway Deployment  ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js nicht gefunden. Bitte installieren: https://nodejs.org"
  exit 1
fi

# Install Railway CLI if needed
if ! command -v railway &> /dev/null; then
  echo -e "${YELLOW}📦 Installiere Railway CLI...${NC}"
  npm install -g @railway/cli
fi

echo -e "${GREEN}✅ Railway CLI bereit${NC}"
echo ""

# Login
echo -e "${BLUE}🔐 Schritt 1: Railway Login${NC}"
echo "   Ein Browser-Fenster öffnet sich → einfach 'Authorize' klicken"
echo ""
railway login

echo ""
echo -e "${BLUE}🚀 Schritt 2: Projekt erstellen & deployen${NC}"
echo ""

# Init project (if not already)
if [ ! -f ".railway/config.json" ]; then
  railway init --name "Rechnungstool"
fi

# Deploy
echo -e "${YELLOW}⏳ Deployment läuft (~2-3 Minuten)...${NC}"
railway up --detach

echo ""
echo -e "${GREEN}✅ Deployment erfolgreich!${NC}"
echo ""
echo -e "${BLUE}📱 Ihre App-URL:${NC}"
railway domain

echo ""
echo -e "${YELLOW}Nächster Schritt für iPhone:${NC}"
echo "  1. URL im Safari öffnen"
echo "  2. Teilen-Symbol tippen"
echo "  3. 'Zum Home-Bildschirm' → Hinzufügen"
echo ""
