import React from 'react';
import { Invoice, InvoiceStatus } from '../../types';
import { format } from 'date-fns';

interface InvoiceCardProps {
  invoice: Invoice;
  onView: (id: string) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', className: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
};

export default function InvoiceCard({ invoice, onView, onSend, onDelete }: InvoiceCardProps) {
  const { label, className } = statusConfig[invoice.status] ?? statusConfig.draft;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Invoice</p>
          <p className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          <span className="font-medium">Client:</span> {invoice.clientId}
        </p>
        <p>
          <span className="font-medium">Due:</span>{' '}
          {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">
          {invoice.currency} {invoice.totalAmount.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onView(invoice.id)}
          className="flex-1 text-sm px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
        >
          View
        </button>
        {(invoice.status === 'draft' || invoice.status === 'viewed') && (
          <button
            onClick={() => onSend(invoice.id)}
            className="flex-1 text-sm px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
          >
            Send
          </button>
        )}
        <button
          onClick={() => onDelete(invoice.id)}
          className="text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
