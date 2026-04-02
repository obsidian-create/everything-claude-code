const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function getNextCustomerNumber() {
  const rows = db.prepare("SELECT customer_number FROM customers WHERE customer_number LIKE 'KD-%' ORDER BY customer_number DESC").all();
  let max = 0;
  for (const r of rows) {
    const n = parseInt(r.customer_number.replace('KD-', ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `KD-${String(max + 1).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const { search } = req.query;
  let rows;
  if (search) {
    const q = `%${search}%`;
    rows = db.prepare(`SELECT * FROM customers WHERE company LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR customer_number LIKE ? ORDER BY created_at DESC`).all(q, q, q, q, q);
  } else {
    rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  }
  res.json(rows.map(r => ({ ...r, custom_fields: JSON.parse(r.custom_fields || '{}') })));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, custom_fields: JSON.parse(row.custom_fields || '{}') });
});

router.post('/', (req, res) => {
  const { company, first_name, last_name, email, phone, website, street, zip, city, country, vat_id, notes, custom_fields } = req.body;
  const id = uuidv4();
  const customer_number = getNextCustomerNumber();
  db.prepare(`INSERT INTO customers (id, customer_number, company, first_name, last_name, email, phone, website, street, zip, city, country, vat_id, notes, custom_fields)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, customer_number, company, first_name, last_name, email, phone, website, street, zip, city, country || 'Deutschland', vat_id, notes, JSON.stringify(custom_fields || {}));
  res.json(db.prepare('SELECT * FROM customers WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { company, first_name, last_name, email, phone, website, street, zip, city, country, vat_id, notes, custom_fields } = req.body;
  db.prepare(`UPDATE customers SET company=?, first_name=?, last_name=?, email=?, phone=?, website=?, street=?, zip=?, city=?, country=?, vat_id=?, notes=?, custom_fields=?, updated_at=datetime('now') WHERE id=?`)
    .run(company, first_name, last_name, email, phone, website, street, zip, city, country, vat_id, notes, JSON.stringify(custom_fields || {}), req.params.id);
  res.json(db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
