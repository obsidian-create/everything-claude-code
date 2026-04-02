import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api.js';
import { Save, ArrowLeft } from 'lucide-react';

const UNITS = ['Stück', 'Stunde', 'Tag', 'Monat', 'Pauschal', 'kg', 'm', 'm²', 'l', 'Seite'];

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: article } = useQuery({ queryKey: ['article', id], queryFn: () => api.getArticle(id), enabled: isEdit });
  const { data: taxRates = [] } = useQuery({ queryKey: ['tax-rates'], queryFn: api.getTaxRates });
  const { data: customFields = [] } = useQuery({ queryKey: ['custom-fields', 'articles'], queryFn: () => api.getCustomFields('articles') });

  const [form, setForm] = useState({
    name: '', description: '', unit: 'Stück', price: '', tax_rate_id: '', category: '', custom_fields: {}
  });

  useEffect(() => {
    if (article) setForm({ ...article, price: article.price || '' });
    else if (taxRates.length > 0) {
      const def = taxRates.find(t => t.is_default) || taxRates[0];
      setForm(f => ({ ...f, tax_rate_id: def?.id || '' }));
    }
  }, [article, taxRates]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.updateArticle(id, data) : api.createArticle(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['articles'] }); navigate('/articles'); },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setCustom = (key, val) => setForm(f => ({ ...f, custom_fields: { ...f.custom_fields, [key]: val } }));

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/articles')} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h1>
          {article?.article_number && <p className="text-sm text-gray-500">{article.article_number}</p>}
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate({ ...form, price: parseFloat(form.price) || 0 }); }} className="space-y-4">
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Bezeichnung *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Beschreibung</label>
            <textarea className="input" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategorie</label>
              <input className="input" value={form.category || ''} onChange={e => set('category', e.target.value)} placeholder="z.B. Dienstleistung" />
            </div>
            <div>
              <label className="label">Einheit</label>
              <select className="input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Preis (netto) *</label>
              <div className="relative">
                <input className="input pr-8" type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <label className="label">Steuersatz</label>
              <select className="input" value={form.tax_rate_id || ''} onChange={e => set('tax_rate_id', e.target.value)}>
                <option value="">Kein Steuersatz</option>
                {taxRates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
              </select>
            </div>
          </div>
        </div>

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

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/articles')} className="btn-secondary">Abbrechen</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            <Save size={16} /> {mutation.isPending ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
