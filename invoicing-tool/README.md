# Rechnungstool

Vollständiges Rechnungstool (ähnlich Lexoffice) — Rechnungen, Angebote, Kunden, Artikel, Branding, PDF-Export, PWA für iPhone.

---

## 🖥 Mac — Setup (einmalig, 1 Befehl)

**Terminal öffnen** (`Cmd+Leertaste` → "Terminal") und eingeben:

```bash
cd /home/user/everything-claude-code/invoicing-tool
./setup-mac.sh
```

Das Skript macht alles automatisch:
- Prüft ob Node.js installiert ist (öffnet Download-Seite falls nötig)
- Installiert alle Abhängigkeiten
- Baut das Frontend
- Fragt ob Electron (Desktop-App) installiert werden soll
- Startet die App

---

## 📱 iPhone — App installieren (Online-Deployment)

### Option A: Railway (empfohlen, kostenlos)

```bash
cd /home/user/everything-claude-code/invoicing-tool
./deploy.sh
```

Das Skript:
1. Installiert Railway CLI
2. Öffnet Browser → einfach "Authorize" klicken
3. Deployt automatisch (~2-3 Min.)
4. Gibt die fertige URL aus

**Dann auf dem iPhone:**
1. Safari → URL öffnen
2. Teilen-Symbol (unten) → **"Zum Home-Bildschirm"**
3. → App-Icon auf dem Homescreen ✅

### Option B: Docker

```bash
docker build -t rechnungstool .
docker run -p 3000:3000 rechnungstool
```

---

## ⚡ Schnellstart (ohne Installation)

```bash
cd /home/user/everything-claude-code/invoicing-tool
node backend/server.js
# → http://localhost:3000 öffnet sich automatisch
```

> Voraussetzung: `./setup-mac.sh` wurde einmal ausgeführt

---

## Features

| | |
|---|---|
| **Dashboard** | Umsatz, bezahlt, überfällig, letzte Rechnungen |
| **Kunden** | CRUD, auto. Kundennummer (KD-0001) |
| **Artikel** | Produktstamm mit Preisen und Steuersätzen |
| **Rechnungen** | 4 Layouts, Positionen, Rabatt, PDF-Export |
| **Angebote** | Eigener Nummernkreis, gleiche Features |
| **Einstellungen** | Logo, Farben, Firma, Bankdaten, Steuersätze |
| **Individuelle Felder** | Für Kunden, Artikel, Rechnungen, Angebote |
| **PWA** | Installierbar auf iPhone/iPad wie eine native App |
| **Offline** | Service Worker für Offline-Nutzung |
