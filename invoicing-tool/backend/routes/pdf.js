const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const db = require('../db');

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  rows.forEach(r => { s[r.key] = r.value; });
  return s;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [37, 99, 235];
}

function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildClassicPdf(doc, invoice, settings, s) {
  const primaryColor = hexToRgb(s.primary_color || '#2563eb');
  const pageWidth = doc.page.width;
  const margin = 50;

  // Header bar
  doc.rect(0, 0, pageWidth, 80).fill(`rgb(${primaryColor.join(',')})`);

  // Logo
  const logoPath = s.logo_url ? path.join(__dirname, '../..', s.logo_url) : null;
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, margin, 15, { height: 50, fit: [180, 50] });
  } else {
    doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text(s.company_name || 'Firma', margin, 28);
  }

  // Document type label
  const label = invoice.type === 'quote' ? 'ANGEBOT' : 'RECHNUNG';
  doc.fillColor('white').font('Helvetica-Bold').fontSize(22).text(label, 0, 28, { align: 'right', width: pageWidth - margin });

  doc.moveDown(3);

  // Sender address (small, above recipient)
  doc.fillColor('#888').font('Helvetica').fontSize(8)
    .text(`${s.company_name} · ${s.company_street} · ${s.company_zip} ${s.company_city}`, margin, 100);

  // Recipient address
  const snap = invoice.customer_snapshot || {};
  const recipientLines = [
    snap.company,
    `${snap.first_name || ''} ${snap.last_name || ''}`.trim(),
    snap.street,
    `${snap.zip || ''} ${snap.city || ''}`.trim(),
    snap.country !== 'Deutschland' ? snap.country : null
  ].filter(Boolean);
  doc.fillColor('#333').font('Helvetica').fontSize(11);
  recipientLines.forEach((line, i) => {
    doc.text(line, margin, 115 + i * 15);
  });

  // Invoice details box (right side)
  const detailsX = 370;
  const details = [
    { label: invoice.type === 'quote' ? 'Angebotsnummer' : 'Rechnungsnummer', value: invoice.invoice_number },
    { label: invoice.type === 'quote' ? 'Angebotsdatum' : 'Rechnungsdatum', value: formatDate(invoice.issue_date) },
    invoice.due_date ? { label: invoice.type === 'quote' ? 'Gültig bis' : 'Fälligkeitsdatum', value: formatDate(invoice.due_date) } : null,
    invoice.delivery_date ? { label: 'Lieferdatum', value: formatDate(invoice.delivery_date) } : null,
  ].filter(Boolean);

  let detailY = 105;
  details.forEach(d => {
    doc.fillColor('#888').font('Helvetica').fontSize(8).text(d.label, detailsX, detailY);
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(9).text(d.value, detailsX, detailY + 10);
    detailY += 28;
  });

  // Title and intro
  let y = 220;
  if (invoice.title) {
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(14).text(invoice.title, margin, y);
    y += 24;
  }
  if (invoice.intro_text) {
    doc.fillColor('#555').font('Helvetica').fontSize(10).text(`Sehr geehrte Damen und Herren,\n\n${invoice.intro_text}`, margin, y, { width: pageWidth - 2 * margin });
    y += doc.heightOfString(`Sehr geehrte Damen und Herren,\n\n${invoice.intro_text}`, { width: pageWidth - 2 * margin }) + 16;
  }

  // Items table header
  const colX = { pos: margin, desc: margin + 30, qty: 340, unit: 370, price: 400, total: 460 };
  doc.rect(margin, y, pageWidth - 2 * margin, 20).fill(`rgb(${primaryColor.join(',')})`);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
  doc.text('Pos.', colX.pos + 2, y + 5);
  doc.text('Beschreibung', colX.desc, y + 5);
  doc.text('Menge', colX.qty, y + 5);
  doc.text('Einheit', colX.unit, y + 5);
  doc.text('Preis', colX.price, y + 5);
  doc.text('Gesamt', colX.total, y + 5);
  y += 24;

  // Items
  const items = invoice.items || [];
  items.forEach((item, idx) => {
    const bg = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
    const rowHeight = item.description ? 32 : 20;
    doc.rect(margin, y, pageWidth - 2 * margin, rowHeight).fill(bg);
    doc.fillColor('#333').font('Helvetica').fontSize(9);
    doc.text(String(idx + 1), colX.pos + 2, y + 5);
    doc.font('Helvetica-Bold').text(item.name || '', colX.desc, y + 5, { width: 300 });
    if (item.description) {
      doc.font('Helvetica').fillColor('#666').fontSize(8).text(item.description, colX.desc, y + 16, { width: 300 });
    }
    doc.fillColor('#333').font('Helvetica').fontSize(9);
    doc.text(String(item.quantity || 0), colX.qty, y + 5);
    doc.text(item.unit || 'Stück', colX.unit, y + 5);
    doc.text(formatCurrency(item.unit_price, invoice.currency), colX.price, y + 5);
    doc.text(formatCurrency((item.quantity || 0) * (item.unit_price || 0), invoice.currency), colX.total, y + 5);
    y += rowHeight;
  });

  y += 10;

  // Totals
  const totalsX = 360;
  const totalsW = pageWidth - margin - totalsX;

  const taxGroups = {};
  items.forEach(item => {
    const rate = item.tax_rate || 0;
    if (!taxGroups[rate]) taxGroups[rate] = 0;
    taxGroups[rate] += (item.quantity || 0) * (item.unit_price || 0);
  });

  doc.fillColor('#555').font('Helvetica').fontSize(9);
  doc.text('Zwischensumme:', totalsX, y);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), totalsX + 120, y, { width: totalsW - 120, align: 'right' });
  y += 16;

  if (invoice.discount_type && invoice.discount_value) {
    doc.text(`Rabatt (${invoice.discount_type === 'percent' ? invoice.discount_value + '%' : 'fix'}):`, totalsX, y);
    doc.text(`- ${formatCurrency(invoice.subtotal * (invoice.discount_type === 'percent' ? invoice.discount_value / 100 : 0) || invoice.discount_value, invoice.currency)}`, totalsX + 120, y, { width: totalsW - 120, align: 'right' });
    y += 16;
  }

  Object.entries(taxGroups).forEach(([rate, base]) => {
    if (Number(rate) > 0) {
      doc.text(`MwSt. ${rate}%:`, totalsX, y);
      doc.text(formatCurrency(base * (Number(rate) / 100), invoice.currency), totalsX + 120, y, { width: totalsW - 120, align: 'right' });
      y += 16;
    }
  });

  doc.rect(totalsX, y, totalsW, 24).fill(`rgb(${primaryColor.join(',')})`);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11);
  doc.text('Gesamtbetrag:', totalsX + 4, y + 6);
  doc.text(formatCurrency(invoice.total, invoice.currency), totalsX + 120, y + 6, { width: totalsW - 120, align: 'right' });
  y += 32;

  // Outro & payment
  if (invoice.outro_text) {
    doc.fillColor('#555').font('Helvetica').fontSize(10).text(invoice.outro_text, margin, y, { width: pageWidth - 2 * margin });
    y += doc.heightOfString(invoice.outro_text, { width: pageWidth - 2 * margin }) + 16;
  }

  // Bank details / payment info
  if (s.company_iban) {
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(10).text('Bankverbindung:', margin, y);
    y += 14;
    doc.font('Helvetica').fontSize(9).fillColor('#555');
    if (s.company_bank_name) { doc.text(`Bank: ${s.company_bank_name}`, margin, y); y += 12; }
    doc.text(`IBAN: ${s.company_iban}`, margin, y); y += 12;
    if (s.company_bic) { doc.text(`BIC: ${s.company_bic}`, margin, y); y += 12; }
  }

  // Footer
  const footerY = doc.page.height - 60;
  doc.rect(0, footerY, pageWidth, 60).fill('#f3f4f6');
  doc.fillColor('#888').font('Helvetica').fontSize(8);
  const footerCols = [
    [s.company_name, s.company_street, `${s.company_zip} ${s.company_city}`].filter(Boolean),
    [s.company_email ? `E-Mail: ${s.company_email}` : null, s.company_phone ? `Tel: ${s.company_phone}` : null, s.company_website ? s.company_website : null].filter(Boolean),
    [s.company_vat_id ? `USt-IdNr.: ${s.company_vat_id}` : null, s.company_tax_number ? `Steuernr.: ${s.company_tax_number}` : null].filter(Boolean),
  ];
  const colWidth = (pageWidth - 2 * margin) / 3;
  footerCols.forEach((lines, i) => {
    lines.forEach((line, j) => {
      doc.text(line, margin + i * colWidth, footerY + 10 + j * 12, { width: colWidth });
    });
  });
}

function buildModernPdf(doc, invoice, settings, s) {
  const primaryColor = hexToRgb(s.primary_color || '#2563eb');
  const accentColor = hexToRgb(s.accent_color || '#f59e0b');
  const pageWidth = doc.page.width;
  const margin = 50;

  // Left sidebar
  doc.rect(0, 0, 180, doc.page.height).fill(`rgb(${primaryColor.join(',')})`);

  // Logo / company name in sidebar
  const logoPath = s.logo_url ? path.join(__dirname, '../..', s.logo_url) : null;
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 15, 20, { width: 150, fit: [150, 60] });
  } else {
    doc.fillColor('white').font('Helvetica-Bold').fontSize(16).text(s.company_name || 'Firma', 15, 30, { width: 150 });
  }

  // Company contact in sidebar
  doc.fillColor('rgba(255,255,255,0.8)').font('Helvetica').fontSize(8);
  let sideY = 100;
  [s.company_street, `${s.company_zip} ${s.company_city}`, s.company_email, s.company_phone].filter(Boolean).forEach(line => {
    doc.text(line, 15, sideY, { width: 150 });
    sideY += 13;
  });

  // Document type in sidebar
  const label = invoice.type === 'quote' ? 'ANGEBOT' : 'RECHNUNG';
  sideY += 20;
  doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text(label, 15, sideY, { width: 150 });

  // Invoice number
  sideY += 35;
  doc.fillColor('rgba(255,255,255,0.7)').font('Helvetica').fontSize(8).text('NUMMER', 15, sideY);
  sideY += 13;
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11).text(invoice.invoice_number, 15, sideY, { width: 150 });

  // Dates
  sideY += 25;
  const datePairs = [
    { label: 'DATUM', value: formatDate(invoice.issue_date) },
    invoice.due_date ? { label: invoice.type === 'quote' ? 'GÜLTIG BIS' : 'FÄLLIG AM', value: formatDate(invoice.due_date) } : null,
  ].filter(Boolean);
  datePairs.forEach(d => {
    doc.fillColor('rgba(255,255,255,0.7)').font('Helvetica').fontSize(8).text(d.label, 15, sideY);
    sideY += 12;
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9).text(d.value, 15, sideY, { width: 150 });
    sideY += 20;
  });

  // Main content area
  const contentX = 200;
  const contentW = pageWidth - contentX - margin;
  let y = 40;

  // Recipient
  const snap = invoice.customer_snapshot || {};
  doc.fillColor('#888').font('Helvetica').fontSize(8).text(`${s.company_name} · ${s.company_street} · ${s.company_zip} ${s.company_city}`, contentX, y);
  y += 14;
  const recipientLines = [snap.company, `${snap.first_name || ''} ${snap.last_name || ''}`.trim(), snap.street, `${snap.zip || ''} ${snap.city || ''}`.trim()].filter(Boolean);
  doc.fillColor('#333').font('Helvetica').fontSize(11);
  recipientLines.forEach(line => { doc.text(line, contentX, y); y += 14; });

  y += 20;
  if (invoice.title) {
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(14).text(invoice.title, contentX, y);
    y += 20;
  }
  if (invoice.intro_text) {
    doc.fillColor('#555').font('Helvetica').fontSize(9).text(invoice.intro_text, contentX, y, { width: contentW });
    y += doc.heightOfString(invoice.intro_text, { width: contentW }) + 12;
  }

  // Table
  const colX2 = { desc: contentX, qty: contentX + 210, unit: contentX + 250, price: contentX + 300, total: contentX + 360 };
  doc.rect(contentX, y, contentW, 18).fill(`rgb(${accentColor.join(',')})`);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(8);
  doc.text('Beschreibung', colX2.desc + 2, y + 4);
  doc.text('Menge', colX2.qty, y + 4);
  doc.text('EP', colX2.price, y + 4);
  doc.text('Gesamt', colX2.total, y + 4);
  y += 22;

  (invoice.items || []).forEach((item, idx) => {
    const bg = idx % 2 === 0 ? '#f9fafb' : '#fff';
    const rowH = item.description ? 30 : 18;
    doc.rect(contentX, y, contentW, rowH).fill(bg);
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(8).text(item.name || '', colX2.desc + 2, y + 4, { width: 205 });
    if (item.description) doc.font('Helvetica').fillColor('#777').fontSize(7).text(item.description, colX2.desc + 2, y + 14, { width: 205 });
    doc.fillColor('#333').font('Helvetica').fontSize(8);
    doc.text(String(item.quantity || 0), colX2.qty, y + 4);
    doc.text(formatCurrency(item.unit_price, invoice.currency), colX2.price, y + 4);
    doc.text(formatCurrency((item.quantity || 0) * (item.unit_price || 0), invoice.currency), colX2.total, y + 4);
    y += rowH;
  });

  y += 12;
  doc.fillColor('#555').font('Helvetica').fontSize(8);
  doc.text('Zwischensumme:', contentX + 250, y);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), contentX + 340, y, { width: contentW - 140, align: 'right' });
  y += 14;
  doc.text(`MwSt.:`, contentX + 250, y);
  doc.text(formatCurrency(invoice.tax_total, invoice.currency), contentX + 340, y, { width: contentW - 140, align: 'right' });
  y += 14;
  doc.rect(contentX + 240, y, contentW - 40, 22).fill(`rgb(${primaryColor.join(',')})`);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11);
  doc.text('GESAMT:', contentX + 246, y + 5);
  doc.text(formatCurrency(invoice.total, invoice.currency), contentX + 340, y + 5, { width: contentW - 140, align: 'right' });
  y += 32;

  if (invoice.outro_text) {
    doc.fillColor('#555').font('Helvetica').fontSize(9).text(invoice.outro_text, contentX, y, { width: contentW });
  }
}

router.get('/:id', (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  const parsedInvoice = {
    ...invoice,
    items: JSON.parse(invoice.items || '[]'),
    customer_snapshot: invoice.customer_snapshot ? JSON.parse(invoice.customer_snapshot) : {},
    custom_fields: JSON.parse(invoice.custom_fields || '{}')
  };
  const s = getSettings();

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoice_number}.pdf"`);
  doc.pipe(res);

  const layout = invoice.layout || 'classic';
  if (layout === 'modern') {
    buildModernPdf(doc, parsedInvoice, null, s);
  } else {
    buildClassicPdf(doc, parsedInvoice, null, s);
  }

  doc.end();
});

module.exports = router;
