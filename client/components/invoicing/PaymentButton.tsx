import React, { useState } from 'react';
import { PaymentMethod } from '../../types';

interface PaymentButtonProps {
  onInitiatePayment: (method: PaymentMethod) => Promise<void>;
  disabled?: boolean;
}

const methods: { value: PaymentMethod; label: string }[] = [
  { value: 'stripe', label: 'Credit / Debit Card (Stripe)' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

export default function PaymentButton({ onInitiatePayment, disabled }: PaymentButtonProps) {
  const [selected, setSelected] = useState<PaymentMethod>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      await onInitiatePayment(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Select payment method</p>
      <div className="space-y-2">
        {methods.map((m) => (
          <label
            key={m.value}
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={m.value}
              checked={selected === m.value}
              onChange={() => setSelected(m.value)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-800">{m.label}</span>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={loading || disabled}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </div>
  );
}
