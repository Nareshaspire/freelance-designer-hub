import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import InvoiceForm from '../../components/invoicing/InvoiceForm';
import { useInvoices } from '../../hooks/useInvoices';
import type { CreateInvoiceData } from '../../services/invoices';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { createInvoice, loading, error } = useInvoices();

  const handleSubmit = async (data: CreateInvoiceData) => {
    const invoice = await createInvoice(data);
    router.push(`/invoices/${invoice.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/invoices" className="text-sm text-indigo-600 hover:underline">
            ← Back to Invoices
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Create Invoice</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <InvoiceForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </main>
    </div>
  );
}
