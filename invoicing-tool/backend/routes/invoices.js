const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function generateNumber(type) {
  const counter = db.prepare('SELECT * FROM invoice_counter WHERE type = ?').get(type);
  if (!counter) return `${type.toUpperCase()}-0001`;
  const num = String(counter.next_number).padStart(counter.padding, '0');
  const result = `${counter.prefix}-${num}`;
  db.prepare('UPDATE invoice_counter SET next_number = next_number + 1 WHERE type = ?').run(type);
  return result;
}

function calcTotals(items, discountType, discountValue) {
  let subtotal = 0;
  const taxMap = {};
  for (const item of items) {
    const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
    subtotal += lineTotal;
    const rate = item.tax_rate || 0;
    if (!taxMap[rate]) taxMap[rate] = 0;
    taxMap[rate] += lineTotal * (rate / 100);
  }
  let discountAmount = 0;
  if (discountType === 'percent') discountAmount = subtotal * ((discountValue || 0) / 100);
  else if (discountType === 'fixed') discountAmount = discountValue || 0;
  const discountedSubtotal = subtotal - discountAmount;
  let tax_total = 0;
  for (const rate of Object.keys(taxMap)) {
    const factor = discountType ? (discountedSubtotal / subtotal) : 1;
    tax_total += taxMap[rate] * factor;
  }
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount_amount: Math.round(discountAmount * 100) / 100,
    tax_total: Math.round(tax_total * 100) / 100,
    total: Math.round((discountedSubtotal + tax_total) * 100) / 100
  };
}

router.get('/', (req, res) => {
  const { type, status, search } = req.query;
  let query = `SELECT i.*, c.company, c.first_name, c.last_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE 1=1`;
  const args = [];
  if (type) { query += ' AND i.type = ?'; args.push(type); }
  if (status) { query += ' AND i.status = ?'; args.push(status); }
  if (search) {
    query += ' AND (i.invoice_number LIKE ? OR c.company LIKE ? OR c.last_name LIKE ?)';
    const q = `%${search}%`;
    args.push(q, q, q);
  }
  query += ' ORDER BY i.created_at DESC';
  const rows = db.prepare(query).all(...args);
  res.json(rows.map(r => ({
    ...r,
    items: JSON.parse(r.items || '[]'),
    customer_snapshot: r.customer_snapshot ? JSON.parse(r.customer_snapshot) : null,
    custom_fields: JSON.parse(r.custom_fields || '{}')
  })));
});

router.get('/stats', (req, res) => {
  const totalInvoices = db.prepare("SELECT COUNT(*) as cnt, SUM(total) as sum FROM invoices WHERE type='invoice'").get();
  const paidInvoices = db.prepare("SELECT COUNT(*) as cnt, SUM(total) as sum FROM invoices WHERE type='invoice' AND status='paid'").get();
  const draftInvoices = db.prepare("SELECT COUNT(*) as cnt FROM invoices WHERE type='invoice' AND status='draft'").get();
  const overdueInvoices = db.prepare("SELECT COUNT(*) as cnt, SUM(total) as sum FROM invoices WHERE type='invoice' AND status='sent' AND due_date < date('now')").get();
  const totalQuotes = db.prepare("SELECT COUNT(*) as cnt FROM invoices WHERE type='quote'").get();
  const totalCustomers = db.prepare("SELECT COUNT(*) as cnt FROM customers").get();
  const totalArticles = db.prepare("SELECT COUNT(*) as cnt FROM articles").get();
  res.json({ totalInvoices, paidInvoices, draftInvoices, overdueInvoices, totalQuotes, totalCustomers, totalArticles });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...row,
    items: JSON.parse(row.items || '[]'),
    customer_snapshot: row.customer_snapshot ? JSON.parse(row.customer_snapshot) : null,
    custom_fields: JSON.parse(row.custom_fields || '{}')
  });
});

router.post('/', (req, res) => {
  const { type, customer_id, issue_date, due_date, delivery_date, layout, title, intro_text, outro_text, items, discount_type, discount_value, currency, payment_terms, bank_details, custom_fields, notes, status } = req.body;
  const id = uuidv4();
  const invoice_number = generateNumber(type || 'invoice');
  const totals = calcTotals(items || [], discount_type, discount_value);

  let customer_snapshot = null;
  if (customer_id) {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
    if (customer) customer_snapshot = JSON.stringify(customer);
  }

  db.prepare(`INSERT INTO invoices (id, invoice_number, type, status, customer_id, customer_snapshot, issue_date, due_date, delivery_date, layout, title, intro_text, outro_text, items, subtotal, tax_total, total, discount_type, discount_value, currency, payment_terms, bank_details, custom_fields, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, invoice_number, type || 'invoice', status || 'draft', customer_id, customer_snapshot,
    issue_date, due_date, delivery_date, layout || 'classic', title, intro_text, outro_text,
    JSON.stringify(items || []), totals.subtotal, totals.tax_total, totals.total,
    discount_type, discount_value || 0, currency || 'EUR', payment_terms, bank_details,
    JSON.stringify(custom_fields || {}), notes
  );
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  res.json({ ...row, items: JSON.parse(row.items || '[]'), customer_snapshot: row.customer_snapshot ? JSON.parse(row.customer_snapshot) : null, custom_fields: JSON.parse(row.custom_fields || '{}') });
});

router.put('/:id', (req, res) => {
  const { status, customer_id, issue_date, due_date, delivery_date, layout, title, intro_text, outro_text, items, discount_type, discount_value, currency, payment_terms, bank_details, custom_fields, notes } = req.body;
  const totals = calcTotals(items || [], discount_type, discount_value);

  let customer_snapshot = null;
  if (customer_id) {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
    if (customer) customer_snapshot = JSON.stringify(customer);
  }

  db.prepare(`UPDATE invoices SET status=?, customer_id=?, customer_snapshot=?, issue_date=?, due_date=?, delivery_date=?, layout=?, title=?, intro_text=?, outro_text=?, items=?, subtotal=?, tax_total=?, total=?, discount_type=?, discount_value=?, currency=?, payment_terms=?, bank_details=?, custom_fields=?, notes=?, updated_at=datetime('now') WHERE id=?`)
    .run(status, customer_id, customer_snapshot, issue_date, due_date, delivery_date, layout, title, intro_text, outro_text, JSON.stringify(items || []), totals.subtotal, totals.tax_total, totals.total, discount_type, discount_value || 0, currency, payment_terms, bank_details, JSON.stringify(custom_fields || {}), notes, req.params.id);
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  res.json({ ...row, items: JSON.parse(row.items || '[]'), customer_snapshot: row.customer_snapshot ? JSON.parse(row.customer_snapshot) : null, custom_fields: JSON.parse(row.custom_fields || '{}') });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE invoices SET status=?, updated_at=datetime('now') WHERE id=?").run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
