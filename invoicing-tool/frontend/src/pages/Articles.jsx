import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatCurrency } from '../utils/api.js';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Articles() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const qc = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', search],
    queryFn: () => api.getArticles(search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
          <p className="text-sm text-gray-500 mt-1">{articles.length} Artikel insgesamt</p>
        </div>
        <Link to="/articles/new" className="btn-primary">
          <Plus size={16} /> Neuer Artikel
        </Link>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Suche nach Artikel, Beschreibung..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Lädt...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            {search ? 'Keine Artikel gefunden.' : (
              <span>Noch keine Artikel. <Link to="/articles/new" className="text-blue-600 hover:underline">Ersten Artikel anlegen →</Link></span>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left font-medium">Artikelnr.</th>
                <th className="px-4 py-3 text-left font-medium">Bezeichnung</th>
                <th className="px-4 py-3 text-left font-medium">Kategorie</th>
                <th className="px-4 py-3 text-left font-medium">Einheit</th>
                <th className="px-4 py-3 text-right font-medium">Preis</th>
                <th className="px-4 py-3 text-left font-medium">MwSt.</th>
                <th className="px-4 py-3 text-right font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{a.article_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{a.name}</div>
                    {a.description && <div className="text-xs text-gray-400 line-clamp-1">{a.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.unit}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 tabular-nums">{formatCurrency(a.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.tax_rate != null ? `${a.tax_rate}%` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/articles/${a.id}/edit`} className="btn-ghost btn-sm"><Pencil size={14} /></Link>
                      <button onClick={() => setDeleteId(a.id)} className="btn-ghost btn-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
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
        title="Artikel löschen"
        message="Möchten Sie diesen Artikel wirklich löschen?"
      />
    </div>
  );
}
