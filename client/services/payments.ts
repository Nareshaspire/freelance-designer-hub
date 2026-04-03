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

export interface FundEscrowData {
  projectId: string;
  milestoneId?: string;
  freelancerId: string;
  amount: number;
  currency?: string;
}

export async function getPayments() {
  const res = await axios.get(`${API_BASE}/payments`, { headers: getHeaders() });
  return res.data;
}

export async function getPayment(id: string) {
  const res = await axios.get(`${API_BASE}/payments/${id}`, { headers: getHeaders() });
  return res.data;
}

export async function fundEscrow(data: FundEscrowData) {
  const res = await axios.post(`${API_BASE}/escrow/fund`, data, { headers: getHeaders() });
  return res.data;
}

export async function releaseEscrow(id: string) {
  const res = await axios.post(`${API_BASE}/escrow/${id}/release`, {}, { headers: getHeaders() });
  return res.data;
}

export async function disputeEscrow(id: string) {
  const res = await axios.post(`${API_BASE}/escrow/${id}/dispute`, {}, { headers: getHeaders() });
  return res.data;
}

export async function getEscrowTransactions() {
  const res = await axios.get(`${API_BASE}/escrow`, { headers: getHeaders() });
  return res.data;
}
