import React from 'react';
import { EscrowTransaction, EscrowStatus as EscrowStatusType } from '../../types';
import { format } from 'date-fns';

interface EscrowStatusProps {
  transaction: EscrowTransaction;
  onRelease?: (id: string) => void;
  onDispute?: (id: string) => void;
}

const statusConfig: Record<
  EscrowStatusType,
  { label: string; icon: string; className: string; bg: string }
> = {
  funded: {
    label: 'Funded',
    icon: '💰',
    className: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  released: {
    label: 'Released',
    icon: '✅',
    className: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  refunded: {
    label: 'Refunded',
    icon: '↩️',
    className: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
  },
  disputed: {
    label: 'Disputed',
    icon: '⚠️',
    className: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
};

export default function EscrowStatus({ transaction, onRelease, onDispute }: EscrowStatusProps) {
  const config = statusConfig[transaction.status] ?? statusConfig.funded;

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <p className={`font-semibold ${config.className}`}>
              Escrow {config.label}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {transaction.currency} {transaction.amount.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right">
          <p>Funded: {format(new Date(transaction.fundedAt), 'MMM d, yyyy')}</p>
          {transaction.releasedAt && (
            <p>Released: {format(new Date(transaction.releasedAt), 'MMM d, yyyy')}</p>
          )}
        </div>
      </div>

      <div className="mt-1 text-xs text-gray-500 space-y-0.5">
        <p>Project: {transaction.projectId}</p>
        {transaction.milestoneId && <p>Milestone: {transaction.milestoneId}</p>}
      </div>

      {transaction.status === 'funded' && (
        <div className="flex gap-2 mt-3">
          {onRelease && (
            <button
              onClick={() => onRelease(transaction.id)}
              className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
            >
              Release Funds
            </button>
          )}
          {onDispute && (
            <button
              onClick={() => onDispute(transaction.id)}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
            >
              Dispute
            </button>
          )}
        </div>
      )}
    </div>
  );
}
