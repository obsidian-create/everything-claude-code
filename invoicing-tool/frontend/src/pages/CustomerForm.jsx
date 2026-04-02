import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api.js';
import { Save, ArrowLeft } from 'lucide-react';

const FIELDS = [
  { section: 'Kontaktdaten', fields: [
    { key: 'company', label: 'Firma', col: 2 },
    { key: 'first_name', label: 'Vorname' },
    { key: 'last_name', label: 'Nachname' },
    { key: 'email', label: 'E-Mail', type: 'email' },
    { key: 'phone', label: 'Telefon' },
    { key: 'website', label: 'Website' },
  ]},
  { section: 'Adresse', fields: [
    { key: 'street', label: 'Straße & Hausnummer', col: 2 },
    { key: 'zip', label: 'PLZ' },
    { key: 'city', label: 'Stadt' },
    { key: 'country', label: 'Land', col: 2 },
  ]},
  { section: 'Steuer & Notizen', fields: [
    { key: 'vat_id', label: 'USt-IdNr.' },
    { key: 'notes', label: 'Notizen', type: 'textarea', col: 2 },
  ]},
];

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: customer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomer(id),
    enabled: isEdit,
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ['custom-fields', 'customers'],
    queryFn: () => api.getCustomFields('customers'),
  });

  const [form, setForm] = useState({
    company: '', first_name: '', last_name: '', email: '', phone: '', website: '',
    street: '', zip: '', city: '', country: 'Deutschland', vat_id: '', notes: '', custom_fields: {}
  });

  useEffect(() => {
    if (customer) setForm({ ...customer });
  }, [customer]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.updateCustomer(id, data) : api.createCustomer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setCustom = (key, val) => setForm(f => ({ ...f, custom_fields: { ...f.custom_fields, [key]: val } }));

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="btn-ghost">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}</h1>
          {customer?.customer_number && <p className="text-sm text-gray-500">{customer.customer_number}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ section, fields }) => (
          <div key={section} className="card p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">{section}</h2>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, type = 'text', col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="label">{label}</label>
                  {type === 'textarea' ? (
                    <textarea className="input" rows={3} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
                  ) : (
                    <input className="input" type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Individuelle Felder</h2>
            <div className="grid grid-cols-2 gap-4">
              {customFields.map(cf => (
                <div key={cf.id} className={cf.field_type === 'textarea' ? 'col-span-2' : ''}>
                  <label className="label">{cf.label}{cf.required && <span className="text-red-500 ml-1">*</span>}</label>
                  {cf.field_type === 'textarea' ? (
                    <textarea className="input" rows={3} value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)} required={!!cf.required} />
                  ) : cf.field_type === 'select' ? (
                    <select className="input" value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)} required={!!cf.required}>
                      <option value="">Bitte wählen...</option>
                      {(cf.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : cf.field_type === 'checkbox' ? (
                    <label className="flex items-center gap-2 mt-1">
                      <input type="checkbox" checked={!!form.custom_fields?.[cf.id]} onChange={e => setCustom(cf.id, e.target.checked)} className="rounded" />
                      <span className="text-sm text-gray-700">{cf.label}</span>
                    </label>
                  ) : (
                    <input className="input" type={cf.field_type} value={form.custom_fields?.[cf.id] || ''} onChange={e => setCustom(cf.id, e.target.value)} required={!!cf.required} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/customers')} className="btn-secondary">Abbrechen</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            <Save size={16} /> {mutation.isPending ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
