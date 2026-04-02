# Rechnungstool

Vollständiges Rechnungstool (ähnlich Lexoffice) — mit Branding, Kunden, Artikeln, Rechnungen, Angeboten und PDF-Export.

---

## Schnellstart

### macOS — Doppelklick
1. Finder öffnen → Ordner `invoicing-tool`
2. Doppelklick auf **`Rechnungstool.command`**
3. Browser öffnet sich automatisch auf `http://localhost:3000`

> Beim ersten Start: ~1-2 Min. für Installation + Build (einmalig)

---

### Windows — Doppelklick
1. Explorer öffnen → Ordner `invoicing-tool`
2. Doppelklick auf **`start.bat`**
3. Browser öffnet sich automatisch auf `http://localhost:3000`

---

### Linux / Terminal
```bash
cd invoicing-tool
./start.sh
```

---

### Als Desktop-App (Electron) bauen
```bash
cd invoicing-tool/electron
npm install
npm start                  # Direkt starten
npm run build:mac          # .dmg für macOS
npm run build:win          # .exe Installer für Windows
npm run build:linux        # .AppImage für Linux
```

---

### Web-Deployment (Railway / Render)

**Railway (1-Klick):**
1. Repo auf GitHub pushen
2. railway.app → "New Project" → "Deploy from GitHub"
3. Repo auswählen → fertig

**Docker:**
```bash
cd invoicing-tool
docker build -t rechnungstool .
docker run -p 3000:3000 -v $(pwd)/data:/app/backend rechnungstool
```

---

## Features

| Bereich | Details |
|---------|---------|
| **Dashboard** | Umsatz, bezahlt, überfällig, letzte Rechnungen |
| **Kunden** | CRUD, auto. Kundennummer, Suche |
| **Artikel** | CRUD, auto. Artikelnummer, Steuersatz-Zuweisung |
| **Rechnungen** | 4 Layouts, Positionen, Rabatt, Steuern, PDF |
| **Angebote** | Identisch wie Rechnungen |
| **Einstellungen** | Logo, Farben, Firma, Bankdaten, Steuersätze, individuelle Felder |

## Tech Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React 18 + Vite + Tailwind CSS
- **PDF**: PDFKit
- **Desktop**: Electron
