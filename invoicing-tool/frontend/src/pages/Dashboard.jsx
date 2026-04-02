import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, formatCurrency } from '../utils/api.js';
import { FileText, Users, Package, TrendingUp, Clock, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color, to }) {
  const card = (
    <div className={`card p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: api.getInvoiceStats });
  const { data: recentInvoices = [] } = useQuery({ queryKey: ['invoices', { type: 'invoice' }], queryFn: () => api.getInvoices({ type: 'invoice' }) });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Lädt...</div></div>;

  const s = stats || {};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Übersicht Ihrer Geschäftsdaten</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Umsatz gesamt"
          value={formatCurrency(s.totalInvoices?.sum || 0)}
          sub={`${s.totalInvoices?.cnt || 0} Rechnungen`}
          icon={TrendingUp}
          color="bg-blue-500"
          to="/invoices"
        />
        <StatCard
          label="Bezahlt"
          value={formatCurrency(s.paidInvoices?.sum || 0)}
          sub={`${s.paidInvoices?.cnt || 0} Rechnungen`}
          icon={CheckCircle}
          color="bg-green-500"
          to="/invoices?status=paid"
        />
        <StatCard
          label="Überfällig"
          value={formatCurrency(s.overdueInvoices?.sum || 0)}
          sub={`${s.overdueInvoices?.cnt || 0} offen`}
          icon={AlertCircle}
          color="bg-red-500"
          to="/invoices"
        />
        <StatCard
          label="Entwürfe"
          value={s.draftInvoices?.cnt || 0}
          sub="Nicht versendet"
          icon={Clock}
          color="bg-orange-500"
          to="/invoices"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Kunden" value={s.totalCustomers?.cnt || 0} icon={Users} color="bg-purple-500" to="/customers" />
        <StatCard label="Artikel" value={s.totalArticles?.cnt || 0} icon={Package} color="bg-indigo-500" to="/articles" />
        <StatCard label="Angebote" value={s.totalQuotes?.cnt || 0} icon={FileCheck} color="bg-teal-500" to="/quotes" />
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Letzte Rechnungen</h2>
          <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Alle anzeigen →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentInvoices.slice(0, 8).map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-900">{inv.invoice_number}</span>
                <span className="ml-2 text-gray-400 text-xs">
                  {inv.company || `${inv.first_name || ''} ${inv.last_name || ''}`.trim() || 'Kein Kunde'}
                </span>
              </div>
              <StatusBadge status={inv.status} />
              <span className="ml-4 text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(inv.total)}</span>
            </Link>
          ))}
          {recentInvoices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              Noch keine Rechnungen vorhanden. <Link to="/invoices/new" className="text-blue-600 hover:underline">Erste Rechnung erstellen →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    draft: { label: 'Entwurf', cls: 'badge-draft' },
    sent: { label: 'Versendet', cls: 'badge-sent' },
    paid: { label: 'Bezahlt', cls: 'badge-paid' },
    overdue: { label: 'Überfällig', cls: 'badge-overdue' },
    cancelled: { label: 'Storniert', cls: 'badge-cancelled' },
    accepted: { label: 'Angenommen', cls: 'badge-accepted' },
    rejected: { label: 'Abgelehnt', cls: 'badge-rejected' },
  };
  const s = map[status] || { label: status, cls: 'badge-draft' };
  return <span className={s.cls}>{s.label}</span>;
}
