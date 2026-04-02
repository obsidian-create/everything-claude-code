import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatCurrency, formatDate } from '../utils/api.js';
import { StatusBadge } from './Dashboard.jsx';
import { ArrowLeft, Pencil, Download, ChevronDown, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'cancelled'];
const STATUS_LABELS = { draft: 'Entwurf', sent: 'Versendet', paid: 'Bezahlt', overdue: 'Überfällig', cancelled: 'Storniert', accepted: 'Angenommen', rejected: 'Abgelehnt' };

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({ queryKey: ['invoice', id], queryFn: () => api.getInvoice(id) });

  const statusMutation = useMutation({
    mutationFn: (status) => api.updateInvoiceStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoice', id] }); qc.invalidateQueries({ queryKey: ['invoices'] }); qc.invalidateQueries({ queryKey: ['quotes'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteInvoice(id),
    onSuccess: () => navigate(invoice?.type === 'quote' ? '/quotes' : '/invoices'),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Lädt...</div>;
  if (!invoice) return <div className="p-8 text-center text-gray-400">Nicht gefunden</div>;

  const isInvoice = invoice.type === 'invoice';
  const basePath = isInvoice ? '/invoices' : '/quotes';
  const statuses = isInvoice ? INVOICE_STATUSES : QUOTE_STATUSES;
  const snap = invoice.customer_snapshot || {};

  const taxGroups = {};
  (invoice.items || []).forEach(item => {
    const rate = item.tax_rate || 0;
    if (!taxGroups[rate]) taxGroups[rate] = 0;
    taxGroups[rate] += (item.quantity || 0) * (item.unit_price || 0);
  });

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(basePath)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
          <p className="text-sm text-gray-500">{isInvoice ? 'Rechnung' : 'Angebot'}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className="btn-secondary gap-2"
            >
              <StatusBadge status={invoice.status} />
              <ChevronDown size={14} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-40">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => { statusMutation.mutate(s); setShowStatusMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <StatusBadge status={s} /> {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a href={api.getPdfUrl(id)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <Download size={16} /> PDF
          </a>
          <Link to={`${basePath}/${id}/edit`} className="btn-primary">
            <Pencil size={16} /> Bearbeiten
          </Link>
          <button onClick={() => setDeleteOpen(true)} className="btn-danger btn-sm"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main invoice view */}
        <div className="col-span-2 card p-6 space-y-6">
          {/* Customer & dates */}
          <div className="flex gap-8">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Empfänger</p>
              {snap.company && <p className="font-semibold text-gray-900">{snap.company}</p>}
              <p className="text-gray-700">{[snap.first_name, snap.last_name].filter(Boolean).join(' ')}</p>
              <p className="text-gray-500 text-sm">{snap.street}</p>
              <p className="text-gray-500 text-sm">{[snap.zip, snap.city].filter(Boolean).join(' ')}</p>
              {snap.vat_id && <p className="text-gray-400 text-xs mt-1">USt-IdNr.: {snap.vat_id}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Details</p>
              <table className="text-sm">
                <tbody>
                  <tr><td className="text-gray-500 pr-4 py-0.5">{isInvoice ? 'Rechnungsdatum' : 'Angebotsdatum'}</td><td className="font-medium">{formatDate(invoice.issue_date)}</td></tr>
                  {invoice.due_date && <tr><td className="text-gray-500 pr-4 py-0.5">{isInvoice ? 'Fälligkeitsdatum' : 'Gültig bis'}</td><td className="font-medium">{formatDate(invoice.due_date)}</td></tr>}
                  {invoice.delivery_date && <tr><td className="text-gray-500 pr-4 py-0.5">Lieferdatum</td><td className="font-medium">{formatDate(invoice.delivery_date)}</td></tr>}
                  <tr><td className="text-gray-500 pr-4 py-0.5">Layout</td><td className="capitalize text-gray-600">{invoice.layout}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {invoice.intro_text && <p className="text-gray-600 text-sm border-t pt-4">{invoice.intro_text}</p>}

          {/* Items table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left pb-2 font-medium">Pos.</th>
                  <th className="text-left pb-2 font-medium">Bezeichnung</th>
                  <th className="text-right pb-2 font-medium">Menge</th>
                  <th className="text-right pb-2 font-medium">Einheit</th>
                  <th className="text-right pb-2 font-medium">EP</th>
                  <th className="text-right pb-2 font-medium">MwSt.</th>
                  <th className="text-right pb-2 font-medium">Gesamt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(invoice.items || []).map((item, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && <p className="text-gray-400 text-xs">{item.description}</p>}
                    </td>
                    <td className="py-2 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-500">{item.unit}</td>
                    <td className="py-2 text-right text-gray-700 tabular-nums">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 text-right text-gray-500">{item.tax_rate ? `${item.tax_rate}%` : '-'}</td>
                    <td className="py-2 text-right font-semibold text-gray-900 tabular-nums">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 border-t pt-4 space-y-1 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Zwischensumme</span>
                <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_type && invoice.discount_value > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Rabatt ({invoice.discount_type === 'percent' ? `${invoice.discount_value}%` : 'fix'})</span>
                  <span className="tabular-nums">-{formatCurrency(invoice.discount_type === 'percent' ? invoice.subtotal * invoice.discount_value / 100 : invoice.discount_value)}</span>
                </div>
              )}
              {Object.entries(taxGroups).map(([rate, base]) => Number(rate) > 0 && (
                <div key={rate} className="flex justify-between text-sm text-gray-600">
                  <span>MwSt. {rate}%</span>
                  <span className="tabular-nums">{formatCurrency(base * Number(rate) / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2 mt-2">
                <span>Gesamtbetrag</span>
                <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.outro_text && <p className="text-gray-600 text-sm border-t pt-4">{invoice.outro_text}</p>}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Status</p>
            <StatusBadge status={invoice.status} />
          </div>
          {invoice.payment_terms && (
            <div className="card p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Zahlungsbedingungen</p>
              <p className="text-sm text-gray-700">{invoice.payment_terms}</p>
            </div>
          )}
          {invoice.notes && (
            <div className="card p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Notizen (intern)</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
          {Object.keys(invoice.custom_fields || {}).length > 0 && (
            <div className="card p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Individuelle Felder</p>
              {Object.entries(invoice.custom_fields).map(([k, v]) => (
                <div key={k} className="text-sm text-gray-700 mt-1"><span className="text-gray-400">{k}:</span> {String(v)}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={isInvoice ? 'Rechnung löschen' : 'Angebot löschen'}
        message="Möchten Sie dieses Dokument wirklich löschen?"
      />
    </div>
  );
}
