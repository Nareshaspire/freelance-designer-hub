import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getInvoice } from '../../services/invoices';
import { getPayments } from '../../services/payments';
import InvoicePreview from '../../components/invoicing/InvoicePreview';
import PaymentButton from '../../components/invoicing/PaymentButton';
import PaymentCard from '../../components/invoicing/PaymentCard';
import { Invoice, Payment, PaymentMethod } from '../../types';
import { useInvoices } from '../../hooks/useInvoices';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const { payInvoice } = useInvoices();

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    setLoadingInvoice(true);
    Promise.all([getInvoice(id), getPayments()])
      .then(([invoiceData, paymentsData]) => {
        setInvoice(invoiceData);
        const all: Payment[] = paymentsData.payments ?? paymentsData;
        setPayments(all.filter((p) => p.invoiceId === id));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load invoice'))
      .finally(() => setLoadingInvoice(false));
  }, [id]);

  const handlePay = async (method: PaymentMethod) => {
    if (!invoice) return;
    const result = await payInvoice(invoice.id, method);
    if (result?.clientSecret) {
      // Stripe redirect or further handling could go here
    }
    setShowPayment(false);
    // Refresh invoice
    const updated = await getInvoice(invoice.id);
    setInvoice(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/invoices" className="text-sm text-indigo-600 hover:underline">
            ← Back to Invoices
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Invoice Detail</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingInvoice ? (
          <div className="bg-white rounded-xl shadow p-8 animate-pulse h-96" />
        ) : invoice ? (
          <>
            <InvoicePreview
              invoice={invoice}
              onPay={invoice.status !== 'paid' ? () => setShowPayment(true) : undefined}
            />

            {showPayment && (
              <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Invoice</h2>
                <PaymentButton onInitiatePayment={handlePay} />
                <button
                  onClick={() => setShowPayment(false)}
                  className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {payments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h2>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
