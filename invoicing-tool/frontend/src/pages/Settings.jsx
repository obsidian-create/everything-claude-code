import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api.js';
import { Save, Upload, Trash2, Plus, Pencil, X, Check, Building2, Palette, Receipt, Tag, LayoutTemplate, Settings2 } from 'lucide-react';

const TABS = [
  { id: 'company', label: 'Firma', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'invoice', label: 'Rechnungen', icon: Receipt },
  { id: 'tax', label: 'Steuersätze', icon: Tag },
  { id: 'custom-fields', label: 'Individuelle Felder', icon: Settings2 },
  { id: 'counter', label: 'Nummernkreise', icon: LayoutTemplate },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Textfeld' },
  { value: 'number', label: 'Zahl' },
  { value: 'date', label: 'Datum' },
  { value: 'textarea', label: 'Mehrzeiliger Text' },
  { value: 'select', label: 'Auswahlliste' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'email', label: 'E-Mail' },
  { value: 'url', label: 'URL' },
];

const ENTITY_TYPES = [
  { value: 'customers', label: 'Kunden' },
  { value: 'articles', label: 'Artikel' },
  { value: 'invoices', label: 'Rechnungen' },
  { value: 'quotes', label: 'Angebote' },
];

const FONT_OPTIONS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Arial', 'Helvetica'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const qc = useQueryClient();

  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const { data: taxRates = [] } = useQuery({ queryKey: ['tax-rates'], queryFn: api.getTaxRates });
  const { data: customFields = [] } = useQuery({ queryKey: ['custom-fields'], queryFn: () => api.getCustomFields() });

  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => api.updateSettings(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-sm text-gray-500 mt-1">Konfiguration und Branding</p>
        </div>
        <button onClick={() => saveMutation.mutate()} className={`btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
          {saved ? <><Check size={16} /> Gespeichert!</> : <><Save size={16} /> Einstellungen speichern</>}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="card py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'company' && <CompanySettings form={form} set={set} settings={settings} qc={qc} />}
          {activeTab === 'branding' && <BrandingSettings form={form} set={set} settings={settings} qc={qc} />}
          {activeTab === 'invoice' && <InvoiceSettings form={form} set={set} />}
          {activeTab === 'tax' && <TaxRatesSettings taxRates={taxRates} qc={qc} />}
          {activeTab === 'custom-fields' && <CustomFieldsSettings customFields={customFields} qc={qc} />}
          {activeTab === 'counter' && <CounterSettings />}
        </div>
      </div>
    </div>
  );
}

function CompanySettings({ form, set }) {
  return (
    <div className="card p-6 space-y-6">
      <h2 className="font-semibold text-gray-900">Firmendaten</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'company_name', label: 'Firmenname', col: 2 },
          { key: 'company_street', label: 'Straße & Hausnummer', col: 2 },
          { key: 'company_zip', label: 'PLZ' },
          { key: 'company_city', label: 'Stadt' },
          { key: 'company_country', label: 'Land', col: 2 },
          { key: 'company_email', label: 'E-Mail', type: 'email' },
          { key: 'company_phone', label: 'Telefon' },
          { key: 'company_website', label: 'Website', col: 2 },
          { key: 'company_vat_id', label: 'USt-IdNr.' },
          { key: 'company_tax_number', label: 'Steuernummer' },
        ].map(({ key, label, type = 'text', col }) => (
          <div key={key} className={col === 2 ? 'col-span-2' : ''}>
            <label className="label">{label}</label>
            <input className="input" type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Bankverbindung</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'company_bank_name', label: 'Bank', col: 2 },
            { key: 'company_iban', label: 'IBAN', col: 2 },
            { key: 'company_bic', label: 'BIC' },
          ].map(({ key, label, col }) => (
            <div key={key} className={col === 2 ? 'col-span-2' : ''}>
              <label className="label">{label}</label>
              <input className="input font-mono" value={form[key] || ''} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandingSettings({ form, set, settings, qc }) {
  const fileInputRef = useRef();

  const uploadMutation = useMutation({
    mutationFn: (file) => api.uploadLogo(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteLogo(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo</h2>
        <div className="flex items-start gap-6">
          <div className="w-40 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="max-h-20 max-w-36 object-contain" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload size={24} className="mx-auto mb-1" />
                <p className="text-xs">Kein Logo</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">PNG, JPG, SVG oder WebP · max. 2 MB<br />Empfohlen: Querformat, transparenter Hintergrund</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                <Upload size={14} /> Logo hochladen
              </button>
              {settings.logo_url && (
                <button type="button" onClick={() => deleteMutation.mutate()} className="btn-danger btn-sm">
                  <Trash2 size={14} /> Löschen
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])} />
            {uploadMutation.isPending && <p className="text-xs text-blue-600">Wird hochgeladen...</p>}
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Farben</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { key: 'primary_color', label: 'Primärfarbe', desc: 'Navigation, Header, Buttons' },
            { key: 'secondary_color', label: 'Sekundärfarbe', desc: 'Hover-Zustände, Akzente' },
            { key: 'accent_color', label: 'Akzentfarbe', desc: 'Highlights, moderne Layouts' },
          ].map(({ key, label, desc }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <p className="text-xs text-gray-400 mb-2">{desc}</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form[key] || '#2563eb'}
                  onChange={e => set(key, e.target.value)}
                  className="h-10 w-14 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  className="input font-mono text-sm"
                  value={form[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder="#2563eb"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 pt-6 border-t">
          <p className="label mb-3">Vorschau</p>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="h-12 flex items-center px-4 gap-3" style={{ background: form.primary_color || '#2563eb' }}>
              <div className="w-6 h-6 bg-white/20 rounded" />
              <span className="text-white font-medium text-sm">{form.company_name || 'Meine Firma'}</span>
              <div className="ml-auto flex gap-2">
                {['Dashboard', 'Rechnungen', 'Kunden'].map(l => (
                  <span key={l} className="text-white/70 text-xs">{l}</span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3">
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: form.primary_color || '#2563eb' }}>Primär</button>
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: form.secondary_color || '#1e40af' }}>Sekundär</button>
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: form.accent_color || '#f59e0b' }}>Akzent</button>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Typografie</h2>
        <div className="max-w-xs">
          <label className="label">Schriftart</label>
          <select className="input" value={form.font_family || 'Inter'} onChange={e => set('font_family', e.target.value)}>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function InvoiceSettings({ form, set }) {
  return (
    <div className="card p-6 space-y-6">
      <h2 className="font-semibold text-gray-900">Rechnungseinstellungen</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Standardwährung</label>
          <select className="input" value={form.default_currency || 'EUR'} onChange={e => set('default_currency', e.target.value)}>
            {['EUR', 'USD', 'CHF', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Standard-Zahlungsziel</label>
          <input className="input" value={form.default_payment_terms || ''} onChange={e => set('default_payment_terms', e.target.value)} placeholder="z.B. 14 Tage netto" />
        </div>
      </div>
      <div>
        <label className="label">Standard-Einleitungstext (Rechnung)</label>
        <textarea className="input" rows={3} value={form.default_intro_invoice || ''} onChange={e => set('default_intro_invoice', e.target.value)} />
      </div>
      <div>
        <label className="label">Standard-Schlusstext (Rechnung)</label>
        <textarea className="input" rows={3} value={form.default_outro_invoice || ''} onChange={e => set('default_outro_invoice', e.target.value)} />
      </div>
      <div>
        <label className="label">Standard-Einleitungstext (Angebot)</label>
        <textarea className="input" rows={3} value={form.default_intro_quote || ''} onChange={e => set('default_intro_quote', e.target.value)} />
      </div>
      <div>
        <label className="label">Standard-Schlusstext (Angebot)</label>
        <textarea className="input" rows={3} value={form.default_outro_quote || ''} onChange={e => set('default_outro_quote', e.target.value)} />
      </div>
    </div>
  );
}

function TaxRatesSettings({ taxRates, qc }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newForm, setNewForm] = useState({ name: '', rate: '', is_default: false });

  const createMutation = useMutation({
    mutationFn: () => api.createTaxRate(newForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-rates'] }); setNewForm({ name: '', rate: '', is_default: false }); },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.updateTaxRate(editId, editForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-rates'] }); setEditId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteTaxRate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tax-rates'] }),
  });

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Steuersätze</h2>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left py-2 font-medium">Bezeichnung</th>
            <th className="text-left py-2 font-medium">Steuersatz</th>
            <th className="text-left py-2 font-medium">Standard</th>
            <th className="text-right py-2 font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {taxRates.map(t => (
            <tr key={t.id} className="py-2">
              {editId === t.id ? (
                <>
                  <td className="py-2 pr-2"><input className="input text-sm" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1">
                      <input className="input text-sm w-20" type="number" step="0.01" value={editForm.rate} onChange={e => setEditForm(f => ({ ...f, rate: e.target.value }))} />
                      <span className="text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="py-2"><input type="checkbox" checked={!!editForm.is_default} onChange={e => setEditForm(f => ({ ...f, is_default: e.target.checked }))} /></td>
                  <td className="py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => updateMutation.mutate()} className="btn-primary btn-sm"><Check size={12} /></button>
                      <button onClick={() => setEditId(null)} className="btn-secondary btn-sm"><X size={12} /></button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 text-sm text-gray-900">{t.name}</td>
                  <td className="py-2 text-sm font-mono text-gray-700">{t.rate}%</td>
                  <td className="py-2">{t.is_default ? <span className="badge-paid text-xs">Standard</span> : null}</td>
                  <td className="py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, rate: t.rate, is_default: !!t.is_default }); }} className="btn-ghost btn-sm"><Pencil size={12} /></button>
                      <button onClick={() => deleteMutation.mutate(t.id)} className="btn-ghost btn-sm text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add new */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Neuen Steuersatz hinzufügen</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="label">Bezeichnung</label>
            <input className="input" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Sondersatz" />
          </div>
          <div className="w-28">
            <label className="label">Steuersatz</label>
            <div className="relative">
              <input className="input pr-6" type="number" step="0.01" min="0" max="100" value={newForm.rate} onChange={e => setNewForm(f => ({ ...f, rate: e.target.value }))} placeholder="0" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="new-default" checked={!!newForm.is_default} onChange={e => setNewForm(f => ({ ...f, is_default: e.target.checked }))} />
            <label htmlFor="new-default" className="text-sm text-gray-600">Standard</label>
          </div>
          <button onClick={() => createMutation.mutate()} className="btn-primary pb-2" disabled={!newForm.name || newForm.rate === ''}>
            <Plus size={14} /> Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomFieldsSettings({ customFields, qc }) {
  const [filterEntity, setFilterEntity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ entity_type: 'customers', label: '', field_type: 'text', options: '', required: false, sort_order: 0 });

  const createMutation = useMutation({
    mutationFn: () => api.createCustomField({ ...form, options: form.options ? form.options.split('\n').map(s => s.trim()).filter(Boolean) : [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom-fields'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.updateCustomField(editId, { ...form, options: form.options ? form.options.split('\n').map(s => s.trim()).filter(Boolean) : [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom-fields'] }); setEditId(null); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteCustomField(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields'] }),
  });

  const resetForm = () => setForm({ entity_type: 'customers', label: '', field_type: 'text', options: '', required: false, sort_order: 0 });

  const filtered = filterEntity ? customFields.filter(f => f.entity_type === filterEntity) : customFields;

  function startEdit(cf) {
    setEditId(cf.id);
    setForm({ entity_type: cf.entity_type, label: cf.label, field_type: cf.field_type, options: (cf.options || []).join('\n'), required: !!cf.required, sort_order: cf.sort_order || 0 });
    setShowForm(true);
  }

  const entityLabel = (v) => ENTITY_TYPES.find(e => e.value === v)?.label || v;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Individuelle Felder</h2>
          <div className="flex gap-2">
            <select className="input w-40 text-sm" value={filterEntity} onChange={e => setFilterEntity(e.target.value)}>
              <option value="">Alle Entitäten</option>
              {ENTITY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <button onClick={() => { setEditId(null); resetForm(); setShowForm(true); }} className="btn-primary btn-sm">
              <Plus size={14} /> Neues Feld
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Noch keine individuellen Felder definiert.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-2 font-medium">Entität</th>
                <th className="text-left py-2 font-medium">Feldname</th>
                <th className="text-left py-2 font-medium">Typ</th>
                <th className="text-left py-2 font-medium">Pflicht</th>
                <th className="text-right py-2 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cf => (
                <tr key={cf.id}>
                  <td className="py-2 text-sm text-gray-500">{entityLabel(cf.entity_type)}</td>
                  <td className="py-2 text-sm font-medium text-gray-900">{cf.label}</td>
                  <td className="py-2 text-sm text-gray-600">{FIELD_TYPES.find(t => t.value === cf.field_type)?.label || cf.field_type}</td>
                  <td className="py-2 text-sm">{cf.required ? <span className="badge-overdue text-xs">Pflicht</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(cf)} className="btn-ghost btn-sm"><Pencil size={12} /></button>
                      <button onClick={() => deleteMutation.mutate(cf.id)} className="btn-ghost btn-sm text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Field form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editId ? 'Feld bearbeiten' : 'Neues Feld erstellen'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Entität</label>
              <select className="input" value={form.entity_type} onChange={e => setForm(f => ({ ...f, entity_type: e.target.value }))} disabled={!!editId}>
                {ENTITY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Feldname</label>
              <input className="input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="z.B. Kundennummer" required />
            </div>
            <div>
              <label className="label">Feldtyp</label>
              <select className="input" value={form.field_type} onChange={e => setForm(f => ({ ...f, field_type: e.target.value }))}>
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Reihenfolge</label>
              <input className="input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
            {form.field_type === 'select' && (
              <div className="col-span-2">
                <label className="label">Optionen (eine pro Zeile)</label>
                <textarea className="input" rows={4} value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Option 1&#10;Option 2&#10;Option 3" />
              </div>
            )}
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Pflichtfeld</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Abbrechen</button>
            <button
              onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()}
              className="btn-primary"
              disabled={!form.label}
            >
              <Save size={14} /> {editId ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CounterSettings() {
  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Nummernkreise</h2>
      <p className="text-sm text-gray-500 mb-4">Die Nummernkreise werden automatisch bei der Erstellung neuer Dokumente hochgezählt. Die Startwerte wurden beim ersten Start gesetzt.</p>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between"><span>Rechnungen</span><span className="font-mono">RE-0001, RE-0002, ...</span></div>
        <div className="flex justify-between"><span>Angebote</span><span className="font-mono">AN-0001, AN-0002, ...</span></div>
        <div className="flex justify-between"><span>Kunden</span><span className="font-mono">KD-0001, KD-0002, ...</span></div>
        <div className="flex justify-between"><span>Artikel</span><span className="font-mono">ART-0001, ART-0002, ...</span></div>
      </div>
    </div>
  );
}
