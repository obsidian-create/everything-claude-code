const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    return fetch(`${BASE}/settings/logo`, { method: 'POST', body: fd }).then(r => r.json());
  },
  deleteLogo: () => request('/settings/logo', { method: 'DELETE' }),

  // Tax Rates
  getTaxRates: () => request('/tax-rates'),
  createTaxRate: (data) => request('/tax-rates', { method: 'POST', body: JSON.stringify(data) }),
  updateTaxRate: (id, data) => request(`/tax-rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTaxRate: (id) => request(`/tax-rates/${id}`, { method: 'DELETE' }),

  // Custom Fields
  getCustomFields: (entity_type) => request(`/custom-fields${entity_type ? `?entity_type=${entity_type}` : ''}`),
  createCustomField: (data) => request('/custom-fields', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomField: (id, data) => request(`/custom-fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomField: (id) => request(`/custom-fields/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: (search) => request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Articles
  getArticles: (search) => request(`/articles${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (data) => request('/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id, data) => request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id) => request(`/articles/${id}`, { method: 'DELETE' }),

  // Invoices
  getInvoices: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/invoices${qs ? `?${qs}` : ''}`);
  },
  getInvoiceStats: () => request('/invoices/stats'),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateInvoiceStatus: (id, status) => request(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),

  // PDF
  getPdfUrl: (id) => `${BASE}/pdf/${id}`,
};

export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('de-DE');
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr || new Date());
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
