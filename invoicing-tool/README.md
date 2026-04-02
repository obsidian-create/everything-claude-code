# Rechnungstool

Vollständiges Rechnungstool (ähnlich Lexoffice) — Rechnungen, Angebote, Kunden, Artikel, Branding, PDF-Export.

---

## Mac — Desktop App (Empfohlen)

### Schritt 1: Voraussetzungen
[Node.js](https://nodejs.org) installieren (LTS Version, kostenlos)

### Schritt 2: Einmalig bauen
```bash
# Terminal öffnen (Cmd+Leertaste → "Terminal")

cd /home/user/everything-claude-code/invoicing-tool

# Abhängigkeiten installieren
cd backend && npm install && cd ../frontend && npm install

# Frontend bauen
cd frontend && npm run build && cd ..

# Electron installieren
cd electron && npm install && cd ..
```

### Schritt 3: App starten
```bash
cd /home/user/everything-claude-code/invoicing-tool/electron
npm start
```
→ App öffnet sich als Fenster auf dem Desktop ✅

### Schritt 4 (optional): .dmg Installer bauen
```bash
cd /home/user/everything-claude-code/invoicing-tool/electron
npm run build:mac
```
→ Erstellt `electron/dist/Rechnungstool.dmg`
→ Doppelklick → in Programme ziehen → fertig, wie jede andere Mac-App

---

## iOS — App auf dem iPhone/iPad

iOS-Apps können **ohne App Store** als PWA installiert werden:

### Schritt 1: App online stellen (Railway — kostenlos)
1. Auf [railway.app](https://railway.app) registrieren (kostenlos)
2. "New Project" → "Deploy from GitHub Repo"
3. Dieses Repository auswählen → Ordner `invoicing-tool` als Root
4. Railway gibt eine URL aus, z.B. `https://rechnungstool-xyz.up.railway.app`

### Schritt 2: App auf iPhone installieren
1. iPhone → Safari öffnen
2. Die Railway-URL eingeben
3. Unten auf **Teilen** tippen (Quadrat mit Pfeil nach oben)
4. **"Zum Home-Bildschirm"** tippen
5. Name bestätigen → **Hinzufügen**

→ App-Icon erscheint auf dem Homescreen wie eine normale App ✅
→ Öffnet sich im Vollbild ohne Browser-Leiste

---

## Schnellstart (Browser, ohne Installation)
```bash
cd /home/user/everything-claude-code/invoicing-tool
./start.sh          # macOS/Linux — öffnet Browser automatisch
start.bat           # Windows — Doppelklick
```
→ Öffnet http://localhost:3000 im Browser

---

## Docker (Self-Hosting)
```bash
cd invoicing-tool
docker build -t rechnungstool .
docker run -p 3000:3000 -v $(pwd)/backend:/app/backend rechnungstool
```

---

## Features

| Bereich | Details |
|---------|---------|
| **Dashboard** | Umsatz, bezahlt, überfällig, letzte Rechnungen |
| **Kunden** | CRUD, automatische Kundennummer (KD-0001) |
| **Artikel** | Produktstamm mit Preisen und Steuersätzen |
| **Rechnungen** | 4 Layouts, Positionen, Rabatt, PDF-Export |
| **Angebote** | Identisch wie Rechnungen |
| **Einstellungen** | Logo, Farben, Firmendaten, Steuersätze, individuelle Felder |
| **PWA** | Installierbar auf iPhone/iPad/Android |
