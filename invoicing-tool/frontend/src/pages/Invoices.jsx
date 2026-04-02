import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatCurrency, formatDate } from '../utils/api.js';
import { Plus, Search, Pencil, Trash2, Eye, FileText, FileCheck, Download } from 'lucide-react';
import { StatusBadge } from './Dashboard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const STATUS_OPTIONS = {
  invoice: [
    { value: '', label: 'Alle Status' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'sent', label: 'Versendet' },
    { value: 'paid', label: 'Bezahlt' },
    { value: 'overdue', label: 'Überfällig' },
    { value: 'cancelled', label: 'Storniert' },
  ],
  quote: [
    { value: '', label: 'Alle Status' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'sent', label: 'Versendet' },
    { value: 'accepted', label: 'Angenommen' },
    { value: 'rejected', label: 'Abgelehnt' },
    { value: 'cancelled', label: 'Storniert' },
  ],
};

export default function Invoices({ type = 'invoice' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const qc = useQueryClient();
  const isInvoice = type === 'invoice';
  const basePath = isInvoice ? '/invoices' : '/quotes';

  const { data: items = [], isLoading } = useQuery({
    queryKey: [type + 's', { type, status, search }],
    queryFn: () => api.getInvoices({ type, ...(status && { status }), ...(search && { search }) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [type + 's'] }),
  });

  const totalAmount = items.reduce((s, i) => s + (i.total || 0), 0);
  const EmptyIcon = isInvoice ? FileText : FileCheck;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isInvoice ? 'Rechnungen' : 'Angebote'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} {isInvoice ? 'Rechnungen' : 'Angebote'} · Gesamt: {formatCurrency(totalAmount)}
          </p>
        </div>
        <Link to={`${basePath}/new`} className="btn-primary">
          <Plus size={16} /> {isInvoice ? 'Neue Rechnung' : 'Neues Angebot'}
        </Link>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder={`Suche nach ${isInvoice ? 'Rechnungs' : 'Angebots'}nummer, Kunde...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-44" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS[type].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Lädt...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <EmptyIcon size={40} className="mx-auto mb-2 opacity-30" />
            {search || status ? 'Keine Ergebnisse.' : (
              <span>Noch keine {isInvoice ? 'Rechnungen' : 'Angebote'}. <Link to={`${basePath}/new`} className="text-blue-600 hover:underline">{isInvoice ? 'Erste Rechnung' : 'Erstes Angebot'} erstellen →</Link></span>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left font-medium">Nummer</th>
                <th className="px-4 py-3 text-left font-medium">Kunde</th>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-left font-medium">{isInvoice ? 'Fällig' : 'Gültig bis'}</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Betrag</th>
                <th className="px-4 py-3 text-right font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="table-row">
                  <td className="px-4 py-3">
                    <Link to={`${basePath}/${item.id}`} className="font-mono text-sm text-blue-600 hover:text-blue-700 font-medium">
                      {item.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.company || `${item.first_name || ''} ${item.last_name || ''}`.trim() || <span className="text-gray-400">Kein Kunde</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.issue_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.due_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`${basePath}/${item.id}`} className="btn-ghost btn-sm" title="Ansehen"><Eye size={14} /></Link>
                      <Link to={`${basePath}/${item.id}/edit`} className="btn-ghost btn-sm" title="Bearbeiten"><Pencil size={14} /></Link>
                      <a href={api.getPdfUrl(item.id)} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm" title="PDF"><Download size={14} /></a>
                      <button onClick={() => setDeleteId(item.id)} className="btn-ghost btn-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
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
        title={isInvoice ? 'Rechnung löschen' : 'Angebot löschen'}
        message="Möchten Sie dieses Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </div>
  );
}
