const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM tax_rates ORDER BY rate DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, rate, is_default } = req.body;
  if (!name || rate === undefined) return res.status(400).json({ error: 'name and rate required' });
  const id = uuidv4();
  if (is_default) {
    db.prepare('UPDATE tax_rates SET is_default = 0').run();
  }
  db.prepare('INSERT INTO tax_rates (id, name, rate, is_default) VALUES (?, ?, ?, ?)').run(id, name, rate, is_default ? 1 : 0);
  res.json(db.prepare('SELECT * FROM tax_rates WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, rate, is_default } = req.body;
  if (is_default) db.prepare('UPDATE tax_rates SET is_default = 0').run();
  db.prepare('UPDATE tax_rates SET name = ?, rate = ?, is_default = ? WHERE id = ?').run(name, rate, is_default ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM tax_rates WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tax_rates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
