# Rechnungstool

Ein vollständiges Rechnungstool ähnlich wie Lexoffice — mit individuell gestaltbarem Branding, Kundenverwaltung, Artikelverwaltung, Steuersätzen und mehreren Layouts.

## Features

- **Rechnungen & Angebote** — Erstellen, bearbeiten, PDF-Export
- **4 Layouts** — Klassisch, Modern, Minimal, Elegant
- **Kundenverwaltung** — CRUD mit automatischer Kundennummer
- **Artikelverwaltung** — Produktstamm mit Einheiten, Preisen, Steuern
- **Steuersätze** — Konfigurierbar (Standard: 19%, 7%, 0%)
- **Individuelle Felder** — Für Kunden, Artikel, Rechnungen und Angebote
- **Branding** — Logo-Upload, Primär-/Sekundär-/Akzentfarbe
- **Dashboard** — Umsatzübersicht, offene Posten, Statistiken
- **PDF-Generator** — Automatische PDF-Erstellung mit Firmenlogo

## Tech Stack

- **Backend**: Node.js + Express + SQLite (`better-sqlite3`)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **PDF**: PDFKit (serverseitig)

## Schnellstart

```bash
# 1. Abhängigkeiten installieren
cd backend && npm install
cd ../frontend && npm install

# 2. Backend starten (Port 3001)
cd backend && npm run dev

# 3. Frontend starten (Port 3000) — in neuem Terminal
cd frontend && npm run dev

# 4. Öffnen: http://localhost:3000
```

## Verzeichnisstruktur

```
invoicing-tool/
├── backend/
│   ├── server.js          # Express-Server
│   ├── db.js              # SQLite-Datenbankschema & Seeds
│   ├── routes/
│   │   ├── settings.js    # Firmeneinstellungen, Logo-Upload
│   │   ├── taxRates.js    # Steuersätze
│   │   ├── customFields.js# Individuelle Felder
│   │   ├── customers.js   # Kundenverwaltung
│   │   ├── articles.js    # Artikelverwaltung
│   │   ├── invoices.js    # Rechnungen & Angebote
│   │   └── pdf.js         # PDF-Generierung
│   └── uploads/           # Logo-Dateien
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Customers.jsx / CustomerForm.jsx
│       │   ├── Articles.jsx / ArticleForm.jsx
│       │   ├── Invoices.jsx
│       │   ├── InvoiceForm.jsx  # Rechnungs- & Angebotserstellung
│       │   ├── InvoiceDetail.jsx
│       │   └── Settings.jsx     # Alle Einstellungen
│       └── components/
│           ├── Layout.jsx
│           ├── Modal.jsx
│           └── ConfirmDialog.jsx
└── README.md
```

## PDF-Layouts

| Layout | Beschreibung |
|--------|-------------|
| **Klassisch** | Farbiger Header-Balken, Absenderzeile, strukturierte Tabelle |
| **Modern** | Farbige Seitenleiste links, minimalistisches Hauptfeld |
| **Minimal** | Schlicht, nur Tabelle und Totals |
| **Elegant** | Akzentfarbe, hochwertige Typografie |

## Individuelle Felder

Unter **Einstellungen → Individuelle Felder** können beliebige Felder für folgende Entitäten definiert werden:

- Kunden
- Artikel  
- Rechnungen
- Angebote

Feldtypen: Text, Zahl, Datum, Mehrzeiliger Text, Auswahlliste, Checkbox, E-Mail, URL
