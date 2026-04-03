import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useInvoices } from '../../hooks/useInvoices';
import EarningsSummary from '../../components/invoicing/EarningsSummary';
import InvoiceFilters from '../../components/invoicing/InvoiceFilters';
import InvoiceCard from '../../components/invoicing/InvoiceCard';
import type { InvoiceQuery } from '../../services/invoices';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, loading, error, summary, fetchInvoices, sendInvoice, deleteInvoice } =
    useInvoices();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleFilter = (query: InvoiceQuery) => {
    fetchInvoices(query);
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice(id);
    } catch {
      // error shown via hook state
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
    } catch {
      // error shown via hook state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-700">
            Freelance Hub
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-gray-600">
            <Link href="/invoices" className="text-indigo-700 border-b-2 border-indigo-600 pb-0.5">
              Invoices
            </Link>
            <Link href="/payments" className="hover:text-indigo-600 transition-colors">
              Payments
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Summary */}
        <EarningsSummary summary={summary} loading={loading} />

        {/* Title + Create button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Link
            href="/invoices/create"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Create Invoice
          </Link>
        </div>

        {/* Filters */}
        <InvoiceFilters onFilter={handleFilter} />

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No invoices found.</p>
            <Link
              href="/invoices/create"
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={(id) => router.push(`/invoices/${id}`)}
                onSend={handleSend}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
