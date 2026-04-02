import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatCurrency, today, addDays } from '../utils/api.js';
import { Save, ArrowLeft, Plus, Trash2, Search, ChevronDown, GripVertical } from 'lucide-react';

const LAYOUTS = [
  { id: 'classic', label: 'Klassisch', desc: 'Professionelles Layout mit farbigem Header', preview: 'bg-gradient-to-r from-blue-600 to-blue-700' },
  { id: 'modern', label: 'Modern', desc: 'Minimalistisch mit Seitenleiste', preview: 'bg-gradient-to-b from-blue-600 to-indigo-700' },
  { id: 'minimal', label: 'Minimal', desc: 'Schlicht und übersichtlich', preview: 'bg-gray-800' },
  { id: 'elegant', label: 'Elegant', desc: 'Hochwertig mit Akzentfarben', preview: 'bg-gradient-to-r from-amber-500 to-orange-600' },
];

const CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'];

const emptyItem = () => ({ name: '', description: '', quantity: 1, unit: 'Stück', unit_price: 0, tax_rate: 19 });

export default function InvoiceForm({ type = 'invoice' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const isInvoice = type === 'invoice';
  const basePath = isInvoice ? '/invoices' : '/quotes';

  const { data: invoice } = useQuery({ queryKey: ['invoice', id], queryFn: () => api.getInvoice(id), enabled: isEdit });
  const { data: customers = [] } = useQuery({ queryKey: ['customers', ''], queryFn: () => api.getCustomers() });
  const { data: articles = [] } = useQuery({ queryKey: ['articles', ''], queryFn: () => api.getArticles() });
  const { data: taxRates = [] } = useQuery({ queryKey: ['tax-rates'], queryFn: api.getTaxRates });
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const { data: customFields = [] } = useQuery({ queryKey: ['custom-fields', type + 's'], queryFn: () => api.getCustomFields(type + 's') });

  const defaultTax = taxRates.find(t => t.is_default)?.rate ?? 19;
  const todayStr = today();

  const [form, setForm] = useState({
    type,
    customer_id: '',
    issue_date: todayStr,
    due_date: addDays(todayStr, 14),
    delivery_date: '',
    layout: 'classic',
    title: '',
    intro_text: '',
    outro_text: '',
    items: [emptyItem()],
    discount_type: '',
    discount_value: 0,
    currency: 'EUR',
    payment_terms: '',
    notes: '',
    custom_fields: {},
    status: 'draft',
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [articleSearch, setArticleSearch] = useState({});

  useEffect(() => {
    if (invoice) {
      setForm({ ...invoice, items: invoice.items?.length ? invoice.items : [emptyItem()] });
    } else {
      setForm(f => ({
        ...f,
        intro_text: settings[`default_intro_${type}`] || '',
        outro_text: settings[`default_outro_${type}`] || '',
        payment_terms: settings.default_payment_terms || '',
        currency: settings.default_currency || 'EUR',
      }));
    }
  }, [invoice, settings]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setCustom = (key, val) => setForm(f => ({ ...f, custom_fields: { ...f.custom_fields, [key]: val } }));

  // Items management
  const setItem = (idx, key, val) => setForm(f => {
    const items = [...f.items];
    items[idx] = { ...items[idx], [key]: val };
    return { ...f, items };
  });
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...emptyItem(), tax_rate: defaultTax }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const addArticleToItem = (idx, article) => {
    const taxRate = taxRates.find(t => t.id === article.tax_rate_id);
    setItem(idx, 'name', article.name);
    setItem(idx, 'description', article.description || '');
    setItem(idx, 'unit_price', article.price || 0);
    setItem(idx, 'unit', article.unit || 'Stück');
    setItem(idx, 'tax_rate', taxRate?.rate ?? defaultTax);
    setArticleSearch(s => ({ ...s, [idx]: '' }));
  };

  // Totals calculation
  const subtotal = form.items.reduce((s, item) => s + (item.quantity || 0) * (item.unit_price || 0), 0);
  let discountAmount = 0;
  if (form.discount_type === 'percent') discountAmount = subtotal * ((form.discount_value || 0) / 100);
  else if (form.discount_type === 'fixed') discountAmount = form.discount_value || 0;
  const discountedSubtotal = subtotal - discountAmount;
  const taxGroups = {};
  form.items.forEach(item => {
    const rate = item.tax_rate || 0;
    if (!taxGroups[rate]) taxGroups[rate] = 0;
    taxGroups[rate] += (item.quantity || 0) * (item.unit_price || 0);
  });
  const taxTotal = Object.entries(taxGroups).reduce((s, [rate, base]) => {
    const factor = form.discount_type ? discountedSubtotal / subtotal || 1 : 1;
    return s + base * (Number(rate) / 100) * factor;
  }, 0);
  const total = discountedSubtotal + taxTotal;

  const filteredCustomers = customers.filter(c =>
    !customerSearch || [c.company, c.first_name, c.last_name, c.customer_number].join(' ').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === form.customer_id);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.updateInvoice(id, data) : api.createInvoice(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
      navigate(`${basePath}/${data.id}`);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(basePath)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? (isInvoice ? 'Rechnung bearbeiten' : 'Angebot bearbeiten') : (isInvoice ? 'Neue Rechnung' : 'Neues Angebot')}
          </h1>
          {invoice?.invoice_number && <p className="text-sm text-gray-500">{invoice.invoice_number}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Layout Selection */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Layout wählen</h2>
          <div className="grid grid-cols-4 gap-3">
            {LAYOUTS.map(layout => (
              <button
                key={layout.id}
                type="button"
                onClick={() => set('layout', layout.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${form.layout === layout.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`h-12 rounded-lg mb-2 ${layout.preview}`} />
                <p className="font-semibold text-sm text-gray-900">{layout.label}</p>
                <p className="text-xs text-gray-500">{layout.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left column: Customer + dates */}
          <div className="col-span-2 space-y-4">
            {/* Customer */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Kunde</h2>
              {selectedCustomer ? (
                <div className="flex items-start justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    {selectedCustomer.company && <p className="font-semibold text-gray-900">{selectedCustomer.company}</p>}
                    <p className="text-sm text-gray-700">{[selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(' ')}</p>
                    <p className="text-sm text-gray-500">{[selectedCustomer.street, selectedCustomer.zip, selectedCustomer.city].filter(Boolean).join(', ')}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedCustomer.customer_number}</p>
                  </div>
                  <button type="button" onClick={() => { set('customer_id', ''); setCustomerSearch(''); }} className="text-gray-400 hover:text-gray-600 text-sm">Ändern</button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input pl-9"
                    placeholder="Kunden suchen..."
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCustomers.slice(0, 8).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => { set('customer_id', c.id); setCustomerSearch(''); setShowCustomerDropdown(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        >
                          <span className="font-medium">{c.company || [c.first_name, c.last_name].filter(Boolean).join(' ')}</span>
                          <span className="text-gray-400 ml-2 text-xs">{c.customer_number}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title & texts */}
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Texte</h2>
              <div>
                <label className="label">Betreff / Titel</label>
                <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder={isInvoice ? 'z.B. Rechnung für Webentwicklung' : 'z.B. Angebot für Webentwicklung'} />
              </div>
              <div>
                <label className="label">Einleitungstext</label>
                <textarea className="input" rows={2} value={form.intro_text || ''} onChange={e => set('intro_text', e.target.value)} />
              </div>
              <div>
                <label className="label">Schlusstext</label>
                <textarea className="input" rows={2} value={form.outro_text || ''} onChange={e => set('outro_text', e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Positionen</h2>
              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-400 w-6">{idx + 1}.</span>
                      <div className="flex-1 relative">
                        <input
                          className="input pr-8"
                          placeholder="Artikel / Leistung *"
                          value={articleSearch[idx] !== undefined ? articleSearch[idx] : item.name}
                          onChange={e => {
                            setArticleSearch(s => ({ ...s, [idx]: e.target.value }));
                            setItem(idx, 'name', e.target.value);
                          }}
                          onFocus={() => setArticleSearch(s => ({ ...s, [idx]: item.name }))}
                          onBlur={() => setTimeout(() => setArticleSearch(s => ({ ...s, [idx]: undefined })), 200)}
                          required
                        />
                        {articleSearch[idx] !== undefined && articles.filter(a => a.name.toLowerCase().includes(articleSearch[idx].toLowerCase())).length > 0 && (
                          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {articles.filter(a => a.name.toLowerCase().includes((articleSearch[idx] || '').toLowerCase())).slice(0, 6).map(a => (
                              <button
                                key={a.id}
                                type="button"
                                onMouseDown={() => addArticleToItem(idx, a)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center justify-between"
                              >
                                <span>{a.name}</span>
                                <span className="text-gray-400 text-xs">{formatCurrency(a.price)} / {a.unit}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1" disabled={form.items.length === 1}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="ml-8">
                      <textarea
                        className="input text-xs"
                        rows={1}
                        placeholder="Beschreibung (optional)"
                        value={item.description || ''}
                        onChange={e => setItem(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="ml-8 grid grid-cols-5 gap-2">
                      <div className="col-span-1">
                        <label className="text-xs text-gray-500 mb-0.5 block">Menge</label>
                        <input className="input text-sm" type="number" step="0.01" min="0" value={item.quantity} onChange={e => setItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs text-gray-500 mb-0.5 block">Einheit</label>
                        <input className="input text-sm" value={item.unit || ''} onChange={e => setItem(idx, 'unit', e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs text-gray-500 mb-0.5 block">EP (netto)</label>
                        <input className="input text-sm" type="number" step="0.01" min="0" value={item.unit_price} onChange={e => setItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs text-gray-500 mb-0.5 block">MwSt. %</label>
                        <select className="input text-sm" value={item.tax_rate ?? defaultTax} onChange={e => setItem(idx, 'tax_rate', parseFloat(e.target.value))}>
                          {taxRates.map(t => <option key={t.id} value={t.rate}>{t.rate}%</option>)}
                          <option value="0">0%</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs text-gray-500 mb-0.5 block">Gesamt</label>
                        <div className="input text-sm bg-gray-100 font-semibold tabular-nums text-right">
                          {formatCurrency((item.quantity || 0) * (item.unit_price || 0), form.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className="btn-secondary mt-3 w-full">
                <Plus size={14} /> Position hinzufügen
              </button>

              {/* Discount */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <select className="input w-40" value={form.discount_type || ''} onChange={e => set('discount_type', e.target.value)}>
                    <option value="">Kein Rabatt</option>
                    <option value="percent">Rabatt in %</option>
                    <option value="fixed">Rabatt fix (€)</option>
                  </select>
                  {form.discount_type && (
                    <input className="input w-32" type="number" step="0.01" min="0" value={form.discount_value || ''} onChange={e => set('discount_value', parseFloat(e.target.value) || 0)} placeholder={form.discount_type === 'percent' ? '%' : '€'} />
                  )}
                </div>
              </div>

              {/* Totals summary */}
              <div className="mt-4 pt-4 border-t space-y-1 max-w-xs ml-auto">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Zwischensumme</span><span className="tabular-nums">{formatCurrency(subtotal, form.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Rabatt</span><span className="tabular-nums">-{formatCurrency(discountAmount, form.currency)}</span>
                  </div>
                )}
                {Object.entries(taxGroups).map(([rate, base]) => Number(rate) > 0 && (
                  <div key={rate} className="flex justify-between text-sm text-gray-600">
                    <span>MwSt. {rate}%</span><span className="tabular-nums">{formatCurrency(base * Number(rate) / 100, form.currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                  <span>Gesamtbetrag</span><span className="tabular-nums">{formatCurrency(total, form.currency)}</span>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Individuelle Felder</h2>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map(cf => (
                    <div key={cf.id} className={cf.field_type === 'textarea' ? 'col-span-2' : ''}>
                      <label className="label">{cf.label}{cf.required && <span className="text-red-500 ml-1">*</span>}</label>
                      {cf.field_type === 'textarea' ? (
                        <textarea className="input" rows={3} value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)} />
                      ) : cf.field_type === 'select' ? (
                        <select className="input" value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)}>
                          <option value="">Bitte wählen...</option>
                          {(cf.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="input" type={cf.field_type} value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: dates, currency, notes */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Dokumentdaten</h2>
              <div>
                <label className="label">{isInvoice ? 'Rechnungsdatum' : 'Angebotsdatum'}</label>
                <input className="input" type="date" value={form.issue_date || ''} onChange={e => set('issue_date', e.target.value)} />
              </div>
              <div>
                <label className="label">{isInvoice ? 'Fälligkeitsdatum' : 'Gültig bis'}</label>
                <input className="input" type="date" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} />
              </div>
              {isInvoice && (
                <div>
                  <label className="label">Lieferdatum</label>
                  <input className="input" type="date" value={form.delivery_date || ''} onChange={e => set('delivery_date', e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">Währung</label>
                <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="draft">Entwurf</option>
                  <option value="sent">Versendet</option>
                  {isInvoice ? (
                    <>
                      <option value="paid">Bezahlt</option>
                      <option value="overdue">Überfällig</option>
                    </>
                  ) : (
                    <>
                      <option value="accepted">Angenommen</option>
                      <option value="rejected">Abgelehnt</option>
                    </>
                  )}
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Zahlungsbedingungen</h2>
              <div>
                <label className="label">Zahlungsziel</label>
                <input className="input" value={form.payment_terms || ''} onChange={e => set('payment_terms', e.target.value)} placeholder="z.B. 14 Tage netto" />
              </div>
              <div>
                <label className="label">Interne Notizen</label>
                <textarea className="input" rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Wird nicht auf dem Dokument angezeigt" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate(basePath)} className="btn-secondary">Abbrechen</button>
          <button type="submit" name="status" value="draft" className="btn-secondary" disabled={mutation.isPending}
            onClick={() => set('status', 'draft')}>
            Als Entwurf speichern
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            <Save size={16} /> {mutation.isPending ? 'Speichert...' : isInvoice ? 'Rechnung speichern' : 'Angebot speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
