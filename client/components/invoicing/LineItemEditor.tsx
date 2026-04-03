import React from 'react';
import { InvoiceItem } from '../../types';

interface LineItemEditorProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

function calcAmount(qty: number, unitPrice: number): number {
  return parseFloat((qty * unitPrice).toFixed(2));
}

export default function LineItemEditor({ items, onChange }: LineItemEditorProps) {
  const addRow = () => {
    onChange([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeRow = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item, [field]: value };
      next.amount = calcAmount(
        field === 'quantity' ? Number(value) : next.quantity,
        field === 'unitPrice' ? Number(value) : next.unitPrice
      );
      return next;
    });
    onChange(updated);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-2 font-semibold text-gray-600 w-1/2">Description</th>
              <th className="pb-2 font-semibold text-gray-600 w-20 text-right">Qty</th>
              <th className="pb-2 font-semibold text-gray-600 w-28 text-right">Unit Price</th>
              <th className="pb-2 font-semibold text-gray-600 w-24 text-right">Amount</th>
              <th className="pb-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 pr-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateField(idx, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateField(idx, 'quantity', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) => updateField(idx, 'unitPrice', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="py-2 pr-2 text-right font-medium text-gray-800">
                  {item.amount.toFixed(2)}
                </td>
                <td className="py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={items.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                    aria-label="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        <span className="text-lg leading-none">+</span> Add item
      </button>
    </div>
  );
}
