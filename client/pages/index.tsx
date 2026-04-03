import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Freelance Designer Hub</h1>
        <p className="text-gray-500 mb-8">
          Manage invoices, track payments, and handle escrow — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/invoices"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            View Invoices
          </Link>
          <Link
            href="/payments"
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            View Payments
          </Link>
        </div>
      </div>
    </main>
  );
}
