import React, { useState } from 'react';
import LineItemEditor from './LineItemEditor';
import { InvoiceItem } from '../../types';
import type { CreateInvoiceData } from '../../services/invoices';

interface InvoiceFormProps {
  initialData?: Partial<CreateInvoiceData>;
  onSubmit: (data: CreateInvoiceData) => Promise<void>;
  loading?: boolean;
}

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const defaultItems: InvoiceItem[] = [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }];

export default function InvoiceForm({ initialData, onSubmit, loading }: InvoiceFormProps) {
  const [projectId, setProjectId] = useState(initialData?.projectId ?? '');
  const [clientId, setClientId] = useState(initialData?.clientId ?? '');
  const [currency, setCurrency] = useState(initialData?.currency ?? 'USD');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [taxRate, setTaxRate] = useState(initialData?.taxRate ?? 0);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [items, setItems] = useState<InvoiceItem[]>(defaultItems);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const total = parseFloat((subtotal + taxAmount - discount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectId.trim()) return setError('Project ID is required');
    if (!clientId.trim()) return setError('Client ID is required');
    if (!dueDate) return setError('Due date is required');
    if (items.some((it) => !it.description.trim())) return setError('All items need a description');

    try {
      await onSubmit({
        projectId,
        clientId,
        currency,
        dueDate,
        taxRate,
        discount,
        notes,
        items: items.map(({ description, quantity, unitPrice }) => ({
          description,
          quantity,
          unitPrice,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Project ID</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="e.g. proj_123"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. client_456"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tax Rate (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Discount ({currency})</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {/* Line items */}
      <div>
        <p className={labelClass}>Line Items</p>
        <div className="border border-gray-200 rounded-lg p-4">
          <LineItemEditor items={items} onChange={setItems} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Payment terms, bank details, etc."
          className={inputClass}
        />
      </div>

      {/* Totals preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Summary</p>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({taxRate}%)</span>
            <span>
              {currency} {taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>
              -{currency} {discount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-1 mt-1">
            <span>Total</span>
            <span>
              {currency} {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : 'Save Invoice'}
      </button>
    </form>
  );
}
