import React from 'react';
import { Payment, PaymentStatus } from '../../types';
import { format } from 'date-fns';

interface PaymentCardProps {
  payment: Payment;
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-600' },
};

const methodLabels: Record<string, string> = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  bank_transfer: 'Bank Transfer',
};

export default function PaymentCard({ payment }: PaymentCardProps) {
  const { label, className } = statusConfig[payment.status] ?? statusConfig.pending;
  const date = payment.paidAt ?? payment.createdAt;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {payment.currency} {payment.amount.toFixed(2)}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {label}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {methodLabels[payment.method] ?? payment.method} &middot;{' '}
          {format(new Date(date), 'MMM d, yyyy')}
        </p>
        <p className="text-xs text-gray-400">Invoice: {payment.invoiceId}</p>
      </div>
    </div>
  );
}
