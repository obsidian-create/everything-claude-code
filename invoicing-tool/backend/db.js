const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'invoicing.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS tax_rates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rate REAL NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_fields (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      label TEXT NOT NULL,
      field_type TEXT NOT NULL DEFAULT 'text',
      options TEXT,
      required INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_number TEXT UNIQUE,
      company TEXT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      street TEXT,
      zip TEXT,
      city TEXT,
      country TEXT DEFAULT 'Deutschland',
      vat_id TEXT,
      notes TEXT,
      custom_fields TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      article_number TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT DEFAULT 'Stück',
      price REAL NOT NULL DEFAULT 0,
      tax_rate_id TEXT,
      category TEXT,
      custom_fields TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tax_rate_id) REFERENCES tax_rates(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE,
      type TEXT NOT NULL DEFAULT 'invoice',
      status TEXT NOT NULL DEFAULT 'draft',
      customer_id TEXT,
      customer_snapshot TEXT,
      issue_date TEXT,
      due_date TEXT,
      delivery_date TEXT,
      layout TEXT DEFAULT 'classic',
      title TEXT,
      intro_text TEXT,
      outro_text TEXT,
      items TEXT DEFAULT '[]',
      subtotal REAL DEFAULT 0,
      tax_total REAL DEFAULT 0,
      total REAL DEFAULT 0,
      discount_type TEXT,
      discount_value REAL DEFAULT 0,
      currency TEXT DEFAULT 'EUR',
      payment_terms TEXT,
      bank_details TEXT,
      custom_fields TEXT DEFAULT '{}',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS invoice_counter (
      type TEXT PRIMARY KEY,
      prefix TEXT,
      next_number INTEGER DEFAULT 1,
      padding INTEGER DEFAULT 4
    );
  `);

  // Seed default tax rates
  const existingTax = db.prepare('SELECT COUNT(*) as cnt FROM tax_rates').get();
  if (existingTax.cnt === 0) {
    const insert = db.prepare('INSERT INTO tax_rates (id, name, rate, is_default) VALUES (?, ?, ?, ?)');
    insert.run('tax-19', 'Regelsteuersatz 19%', 19, 1);
    insert.run('tax-7', 'Ermäßigt 7%', 7, 0);
    insert.run('tax-0', 'Steuerfrei 0%', 0, 0);
  }

  // Seed invoice counters
  const existingCounter = db.prepare('SELECT COUNT(*) as cnt FROM invoice_counter').get();
  if (existingCounter.cnt === 0) {
    const insertCounter = db.prepare('INSERT INTO invoice_counter (type, prefix, next_number, padding) VALUES (?, ?, ?, ?)');
    insertCounter.run('invoice', 'RE', 1, 4);
    insertCounter.run('quote', 'AN', 1, 4);
  }

  // Seed default settings
  const settingsToSeed = [
    ['company_name', 'Meine Firma GmbH'],
    ['company_street', 'Musterstraße 1'],
    ['company_zip', '12345'],
    ['company_city', 'Musterstadt'],
    ['company_country', 'Deutschland'],
    ['company_email', 'info@meinefirma.de'],
    ['company_phone', '+49 123 456789'],
    ['company_vat_id', 'DE123456789'],
    ['company_tax_number', '123/456/78900'],
    ['company_bank_name', 'Musterbank'],
    ['company_iban', 'DE89 3704 0044 0532 0130 00'],
    ['company_bic', 'COBADEFFXXX'],
    ['primary_color', '#2563eb'],
    ['secondary_color', '#1e40af'],
    ['accent_color', '#f59e0b'],
    ['font_family', 'Inter'],
    ['default_currency', 'EUR'],
    ['default_payment_terms', '14 Tage netto'],
    ['default_intro_invoice', 'vielen Dank für Ihren Auftrag. Wir stellen Ihnen folgende Leistungen in Rechnung:'],
    ['default_outro_invoice', 'Bitte überweisen Sie den Rechnungsbetrag bis zum Zahlungsziel auf das unten angegebene Konto.'],
    ['default_intro_quote', 'vielen Dank für Ihre Anfrage. Wir unterbreiten Ihnen folgendes Angebot:'],
    ['default_outro_quote', 'Dieses Angebot ist 30 Tage gültig. Wir freuen uns auf Ihre Auftragsbestätigung.'],
    ['logo_url', ''],
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of settingsToSeed) {
    insertSetting.run(key, value);
  }
}

initDb();

module.exports = db;
