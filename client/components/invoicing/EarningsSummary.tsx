import React from 'react';
import { EarningsSummary as EarningsSummaryType } from '../../types';

interface EarningsSummaryProps {
  summary: EarningsSummaryType | null;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export default function EarningsSummary({ summary, loading }: EarningsSummaryProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const currency = summary.currency ?? 'USD';

  const cards = [
    {
      label: 'Total Earned',
      value: summary.totalEarned,
      colorClass: 'text-green-700',
      bgClass: 'bg-green-50 border-green-200',
      icon: '💵',
    },
    {
      label: 'Pending',
      value: summary.totalPending,
      colorClass: 'text-yellow-700',
      bgClass: 'bg-yellow-50 border-yellow-200',
      icon: '⏳',
    },
    {
      label: 'Overdue',
      value: summary.totalOverdue,
      colorClass: 'text-red-700',
      bgClass: 'bg-red-50 border-red-200',
      icon: '⚠️',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border shadow-sm p-5 ${card.bgClass}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{card.icon}</span>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
          </div>
          <p className={`text-2xl font-bold ${card.colorClass}`}>
            {currency}{' '}
            {card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  );
}
