import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api.js';
import { Plus, Search, Pencil, Trash2, Mail, Phone, Building2, User } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const qc = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.getCustomers(search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunden</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} Kunden insgesamt</p>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <Plus size={16} /> Neuer Kunde
        </Link>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Suche nach Name, Firma, E-Mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Lädt...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <User size={40} className="mx-auto mb-2 opacity-30" />
            {search ? 'Keine Kunden gefunden.' : (
              <span>Noch keine Kunden. <Link to="/customers/new" className="text-blue-600 hover:underline">Ersten Kunden anlegen →</Link></span>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left font-medium">Kundennr.</th>
                <th className="px-4 py-3 text-left font-medium">Name / Firma</th>
                <th className="px-4 py-3 text-left font-medium">Kontakt</th>
                <th className="px-4 py-3 text-left font-medium">Ort</th>
                <th className="px-4 py-3 text-right font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{c.customer_number}</td>
                  <td className="px-4 py-3">
                    {c.company && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <Building2 size={13} className="text-gray-400" /> {c.company}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">{[c.first_name, c.last_name].filter(Boolean).join(' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.email && <div className="flex items-center gap-1 text-gray-600"><Mail size={12} />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1 text-gray-500 text-xs"><Phone size={12} />{c.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{[c.zip, c.city].filter(Boolean).join(' ')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/customers/${c.id}/edit`} className="btn-ghost btn-sm">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(c.id)} className="btn-ghost btn-sm text-red-500 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Kunde löschen"
        message="Möchten Sie diesen Kunden wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </div>
  );
}
