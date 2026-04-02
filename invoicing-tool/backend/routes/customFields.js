const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// GET fields for entity type (customers, articles, invoices, quotes)
router.get('/', (req, res) => {
  const { entity_type } = req.query;
  let query = 'SELECT * FROM custom_fields ORDER BY sort_order ASC, label ASC';
  let args = [];
  if (entity_type) {
    query = 'SELECT * FROM custom_fields WHERE entity_type = ? ORDER BY sort_order ASC, label ASC';
    args = [entity_type];
  }
  const rows = db.prepare(query).all(...args);
  res.json(rows.map(r => ({ ...r, options: r.options ? JSON.parse(r.options) : [] })));
});

router.post('/', (req, res) => {
  const { entity_type, label, field_type, options, required, sort_order } = req.body;
  if (!entity_type || !label) return res.status(400).json({ error: 'entity_type and label required' });
  const id = uuidv4();
  db.prepare('INSERT INTO custom_fields (id, entity_type, label, field_type, options, required, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, entity_type, label, field_type || 'text', options ? JSON.stringify(options) : null, required ? 1 : 0, sort_order || 0);
  const row = db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(id);
  res.json({ ...row, options: row.options ? JSON.parse(row.options) : [] });
});

router.put('/:id', (req, res) => {
  const { label, field_type, options, required, sort_order } = req.body;
  db.prepare('UPDATE custom_fields SET label = ?, field_type = ?, options = ?, required = ?, sort_order = ? WHERE id = ?')
    .run(label, field_type, options ? JSON.stringify(options) : null, required ? 1 : 0, sort_order || 0, req.params.id);
  const row = db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(req.params.id);
  res.json({ ...row, options: row.options ? JSON.parse(row.options) : [] });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM custom_fields WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
