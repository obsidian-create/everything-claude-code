const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// GET all settings
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// PUT update settings (bulk)
router.put('/', (req, res) => {
  const updates = req.body;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const transaction = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      upsert.run(key, String(value ?? ''));
    }
  });
  transaction(updates);
  res.json({ success: true });
});

// POST upload logo
router.post('/logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const logoUrl = `/uploads/${req.file.filename}`;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('logo_url', logoUrl);
  res.json({ logo_url: logoUrl });
});

// DELETE logo
router.delete('/logo', (req, res) => {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('logo_url', '');
  const uploadDir = path.join(__dirname, '../uploads');
  ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.gif', 'logo.svg', 'logo.webp'].forEach(f => {
    const fp = path.join(uploadDir, f);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
  res.json({ success: true });
});

module.exports = router;
