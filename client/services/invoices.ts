import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    if (userId) headers['x-user-id'] = userId;
  }
  return headers;
}

export interface InvoiceQuery {
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvoiceData {
  projectId: string;
  milestoneId?: string;
  clientId: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  currency?: string;
  dueDate: string;
  taxRate?: number;
  discount?: number;
  notes?: string;
}

export async function createInvoice(data: CreateInvoiceData) {
  const res = await axios.post(`${API_BASE}/invoices`, data, { headers: getHeaders() });
  return res.data;
}

export async function getInvoices(query?: InvoiceQuery) {
  const res = await axios.get(`${API_BASE}/invoices`, {
    headers: getHeaders(),
    params: query,
  });
  return res.data;
}

export async function getInvoice(id: string) {
  const res = await axios.get(`${API_BASE}/invoices/${id}`, { headers: getHeaders() });
  return res.data;
}

export async function updateInvoice(id: string, data: Partial<CreateInvoiceData>) {
  const res = await axios.patch(`${API_BASE}/invoices/${id}`, data, { headers: getHeaders() });
  return res.data;
}

export async function deleteInvoice(id: string) {
  const res = await axios.delete(`${API_BASE}/invoices/${id}`, { headers: getHeaders() });
  return res.data;
}

export async function sendInvoice(id: string) {
  const res = await axios.post(`${API_BASE}/invoices/${id}/send`, {}, { headers: getHeaders() });
  return res.data;
}

export async function payInvoice(id: string, method: string) {
  const res = await axios.post(`${API_BASE}/invoices/${id}/pay`, { invoiceId: id, paymentMethod: method }, { headers: getHeaders() });
  return res.data;
}

export async function generateInvoice(data: CreateInvoiceData) {
  const res = await axios.post(`${API_BASE}/invoices/generate`, data, { headers: getHeaders() });
  return res.data;
}

export async function getEarningsSummary() {
  const res = await axios.get(`${API_BASE}/invoices/report/summary`, { headers: getHeaders() });
  return res.data;
}

export async function getMonthlyEarnings() {
  const res = await axios.get(`${API_BASE}/invoices/report/monthly`, { headers: getHeaders() });
  return res.data;
}

export async function exportInvoices() {
  const res = await axios.get(`${API_BASE}/invoices/export`, { headers: getHeaders() });
  return res.data;
}
