const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/settings', require('./routes/settings'));
app.use('/api/tax-rates', require('./routes/taxRates'));
app.use('/api/custom-fields', require('./routes/customFields'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/pdf', require('./routes/pdf'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Invoicing Tool Backend running on http://localhost:${PORT}`);
});
