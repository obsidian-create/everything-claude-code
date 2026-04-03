const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/settings', require('./routes/settings'));
app.use('/api/tax-rates', require('./routes/taxRates'));
app.use('/api/custom-fields', require('./routes/customFields'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/pdf', require('./routes/pdf'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Serve built frontend
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else if (!IS_PRODUCTION) {
  app.get('/', (req, res) => res.send('<h2>Frontend not built. Run: cd frontend && npm run build</h2>'));
}

app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n✅  Rechnungstool läuft auf ${url}\n`);

  // Auto-open browser only locally
  if (!IS_PRODUCTION) {
    const { exec } = require('child_process');
    const cmd = process.platform === 'win32' ? `start ${url}`
      : process.platform === 'darwin' ? `open ${url}`
      : `xdg-open ${url}`;
    exec(cmd);
  }
});
