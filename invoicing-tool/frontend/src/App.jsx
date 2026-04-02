import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import CustomerForm from './pages/CustomerForm.jsx';
import Articles from './pages/Articles.jsx';
import ArticleForm from './pages/ArticleForm.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceForm from './pages/InvoiceForm.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/new" element={<ArticleForm />} />
        <Route path="/articles/:id/edit" element={<ArticleForm />} />
        <Route path="/invoices" element={<Invoices type="invoice" />} />
        <Route path="/invoices/new" element={<InvoiceForm type="invoice" />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm type="invoice" />} />
        <Route path="/quotes" element={<Invoices type="quote" />} />
        <Route path="/quotes/new" element={<InvoiceForm type="quote" />} />
        <Route path="/quotes/:id" element={<InvoiceDetail />} />
        <Route path="/quotes/:id/edit" element={<InvoiceForm type="quote" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
