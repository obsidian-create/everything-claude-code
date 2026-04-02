const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function getNextArticleNumber() {
  const rows = db.prepare("SELECT article_number FROM articles WHERE article_number LIKE 'ART-%' ORDER BY article_number DESC").all();
  let max = 0;
  for (const r of rows) {
    const n = parseInt(r.article_number.replace('ART-', ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `ART-${String(max + 1).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const { search } = req.query;
  let rows;
  if (search) {
    const q = `%${search}%`;
    rows = db.prepare(`SELECT a.*, t.name as tax_name, t.rate as tax_rate FROM articles a LEFT JOIN tax_rates t ON a.tax_rate_id = t.id WHERE a.name LIKE ? OR a.article_number LIKE ? OR a.description LIKE ? ORDER BY a.created_at DESC`).all(q, q, q);
  } else {
    rows = db.prepare('SELECT a.*, t.name as tax_name, t.rate as tax_rate FROM articles a LEFT JOIN tax_rates t ON a.tax_rate_id = t.id ORDER BY a.created_at DESC').all();
  }
  res.json(rows.map(r => ({ ...r, custom_fields: JSON.parse(r.custom_fields || '{}') })));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT a.*, t.name as tax_name, t.rate as tax_rate FROM articles a LEFT JOIN tax_rates t ON a.tax_rate_id = t.id WHERE a.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, custom_fields: JSON.parse(row.custom_fields || '{}') });
});

router.post('/', (req, res) => {
  const { name, description, unit, price, tax_rate_id, category, custom_fields } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  const article_number = getNextArticleNumber();
  db.prepare(`INSERT INTO articles (id, article_number, name, description, unit, price, tax_rate_id, category, custom_fields)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, article_number, name, description, unit || 'Stück', price || 0, tax_rate_id, category, JSON.stringify(custom_fields || {}));
  res.json(db.prepare('SELECT a.*, t.name as tax_name, t.rate as tax_rate FROM articles a LEFT JOIN tax_rates t ON a.tax_rate_id = t.id WHERE a.id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, description, unit, price, tax_rate_id, category, custom_fields } = req.body;
  db.prepare(`UPDATE articles SET name=?, description=?, unit=?, price=?, tax_rate_id=?, category=?, custom_fields=?, updated_at=datetime('now') WHERE id=?`)
    .run(name, description, unit, price, tax_rate_id, category, JSON.stringify(custom_fields || {}), req.params.id);
  res.json(db.prepare('SELECT a.*, t.name as tax_name, t.rate as tax_rate FROM articles a LEFT JOIN tax_rates t ON a.tax_rate_id = t.id WHERE a.id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
