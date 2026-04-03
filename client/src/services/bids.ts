import { Bid, CreateBidInput } from './projects';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
  return res.json();
}

export function getMyBids(): Promise<Bid[]> {
  return apiFetch('/api/bids/my');
}

export function updateBid(id: string, data: Partial<CreateBidInput>): Promise<Bid> {
  return apiFetch(`/api/bids/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function withdrawBid(id: string): Promise<void> {
  return apiFetch(`/api/bids/${id}`, { method: 'DELETE' });
}

export function acceptBid(id: string): Promise<Bid> {
  return apiFetch(`/api/bids/${id}/accept`, { method: 'POST' });
}

export function rejectBid(id: string): Promise<Bid> {
  return apiFetch(`/api/bids/${id}/reject`, { method: 'POST' });
}
