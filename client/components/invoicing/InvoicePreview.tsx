import React from 'react';
import { Invoice, InvoiceStatus, PaymentMethod } from '../../types';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  onPay?: (method: PaymentMethod) => void;
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', className: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
};

function fmt(date?: string) {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMMM d, yyyy');
}

export default function InvoicePreview({ invoice, onPay }: InvoicePreviewProps) {
  const { label, className } = statusConfig[invoice.status] ?? statusConfig.draft;

  return (
    <div className="invoice-print-container bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
          <p className="text-gray-500 mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
            {label}
          </span>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-medium">Created:</span> {fmt(invoice.createdAt)}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Due:</span> {fmt(invoice.dueDate)}
          </p>
          {invoice.paidAt && (
            <p className="text-sm text-green-600">
              <span className="font-medium">Paid:</span> {fmt(invoice.paidAt)}
            </p>
          )}
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">From</p>
          <p className="font-semibold text-gray-800">Freelancer</p>
          <p className="text-sm text-gray-600">{invoice.freelancerId}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">To</p>
          <p className="font-semibold text-gray-800">Client</p>
          <p className="text-sm text-gray-600">{invoice.clientId}</p>
        </div>
      </div>

      {/* Line items */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 text-gray-600 font-semibold w-1/2">Description</th>
            <th className="text-right py-2 text-gray-600 font-semibold">Qty</th>
            <th className="text-right py-2 text-gray-600 font-semibold">Unit Price</th>
            <th className="text-right py-2 text-gray-600 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-3 text-gray-800">{item.description}</td>
              <td className="py-3 text-right text-gray-600">{item.quantity}</td>
              <td className="py-3 text-right text-gray-600">
                {invoice.currency} {item.unitPrice.toFixed(2)}
              </td>
              <td className="py-3 text-right font-medium text-gray-800">
                {invoice.currency} {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>
              {invoice.currency} {invoice.subtotal.toFixed(2)}
            </span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({invoice.taxRate}%)</span>
              <span>
                {invoice.currency} {invoice.taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>
                -{invoice.currency} {invoice.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>
              {invoice.currency} {invoice.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{invoice.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
        >
          Print / Save PDF
        </button>
        {onPay && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
          <button
            onClick={() => onPay('stripe')}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors"
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
}
