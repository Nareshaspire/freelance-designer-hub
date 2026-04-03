import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePayments } from '../../hooks/usePayments';
import { useEscrow } from '../../hooks/useEscrow';
import PaymentCard from '../../components/invoicing/PaymentCard';
import EscrowStatusComponent from '../../components/invoicing/EscrowStatus';
import { PaymentStatus } from '../../types';

const ALL_STATUSES: PaymentStatus[] = ['pending', 'processing', 'completed', 'failed', 'refunded'];

export default function PaymentsPage() {
  const { payments, loading: payLoading, error: payError, fetchPayments } = usePayments();
  const {
    escrowTransactions,
    loading: escrowLoading,
    error: escrowError,
    fetchEscrowTransactions,
    releaseEscrow,
    disputeEscrow,
  } = useEscrow();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchEscrowTransactions();
  }, [fetchPayments, fetchEscrowTransactions]);

  const filtered = payments.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    const date = new Date(p.paidAt ?? p.createdAt);
    if (dateFrom && date < new Date(dateFrom)) return false;
    if (dateTo && date > new Date(dateTo)) return false;
    return true;
  });

  const handleRelease = async (id: string) => {
    if (!confirm('Release escrow funds?')) return;
    await releaseEscrow(id);
  };

  const handleDispute = async (id: string) => {
    if (!confirm('Open a dispute for this escrow?')) return;
    await disputeEscrow(id);
  };

  const inputClass =
    'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-700">
            Freelance Hub
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-gray-600">
            <Link href="/invoices" className="hover:text-indigo-600 transition-colors">
              Invoices
            </Link>
            <Link href="/payments" className="text-indigo-700 border-b-2 border-indigo-600 pb-0.5">
              Payments
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Payments section */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h1>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end shadow-sm mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option value="">All statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
            >
              Reset
            </button>
          </div>

          {payError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
              {payError}
            </div>
          )}

          {payLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No payments found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </section>

        {/* Escrow section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Escrow Transactions</h2>

          {escrowError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
              {escrowError}
            </div>
          )}

          {escrowLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : escrowTransactions.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No escrow transactions found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {escrowTransactions.map((tx) => (
                <EscrowStatusComponent
                  key={tx.id}
                  transaction={tx}
                  onRelease={tx.status === 'funded' ? handleRelease : undefined}
                  onDispute={tx.status === 'funded' ? handleDispute : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
