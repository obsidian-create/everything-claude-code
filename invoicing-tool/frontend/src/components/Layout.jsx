import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api.js';
import {
  LayoutDashboard, Users, Package, FileText, FileCheck, Settings, Menu, X,
  ChevronRight, Receipt
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Kunden' },
  { to: '/articles', icon: Package, label: 'Artikel' },
  { to: '/invoices', icon: FileText, label: 'Rechnungen' },
  { to: '/quotes', icon: FileCheck, label: 'Angebote' },
  { to: '/settings', icon: Settings, label: 'Einstellungen' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const primaryColor = settings.primary_color || '#2563eb';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 shadow-lg ${sidebarOpen ? 'w-60' : 'w-16'}`}
        style={{ background: primaryColor }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-white" />
            </div>
          )}
          {sidebarOpen && (
            <span className="text-white font-semibold text-sm leading-tight line-clamp-1">
              {settings.company_name || 'Rechnungstool'}
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="ml-auto text-white/70 hover:text-white p-1 rounded transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-white/40 text-xs">Rechnungstool v1.0</p>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center">
          <Breadcrumb />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const labelMap = {
    dashboard: 'Dashboard', customers: 'Kunden', articles: 'Artikel',
    invoices: 'Rechnungen', quotes: 'Angebote', settings: 'Einstellungen',
    new: 'Neu', edit: 'Bearbeiten',
  };
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const label = labelMap[part] || part;
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
            <span className={isLast ? 'text-gray-900 font-medium' : 'hover:text-gray-700'}>
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
