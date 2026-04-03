import React, { useState } from 'react';
import { Bid, CreateBidInput } from '@/services/projects';
import { useBids } from '@/hooks/useBids';

interface Props {
  projectId: string;
  onSuccess?: (bid: Bid) => void;
}

const emptyForm: CreateBidInput & { portfolioSamples: string[] } = {
  proposedRate: 0,
  estimatedDuration: '',
  coverLetter: '',
  portfolioSamples: [],
};

export default function BidForm({ projectId, onSuccess }: Props) {
  const { submitBid } = useBids(projectId);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleInput, setSampleInput] = useState('');

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addSample() {
    const trimmed = sampleInput.trim();
    if (!trimmed) return;
    set('portfolioSamples', [...form.portfolioSamples, trimmed]);
    setSampleInput('');
  }

  function removeSample(idx: number) {
    set('portfolioSamples', form.portfolioSamples.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bid = await submitBid(form);
      setForm({ ...emptyForm });
      onSuccess?.(bid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Submit a Bid</h3>

      {error && (
        <div style={{ padding: 10, borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 14 }}>{error}</div>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>Proposed Rate ($)</span>
        <input
          type="number"
          required
          min={0}
          value={form.proposedRate}
          onChange={e => set('proposedRate', Number(e.target.value))}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>Estimated Duration</span>
        <input
          type="text"
          required
          placeholder="e.g. 2 weeks"
          value={form.estimatedDuration}
          onChange={e => set('estimatedDuration', e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>Cover Letter</span>
        <textarea
          required
          rows={5}
          placeholder="Describe your experience and approach..."
          value={form.coverLetter}
          onChange={e => set('coverLetter', e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' }}
        />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>Portfolio Samples</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="url"
            placeholder="https://..."
            value={sampleInput}
            onChange={e => setSampleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSample())}
            style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <button type="button" onClick={addSample} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#6b7280', color: '#fff', cursor: 'pointer' }}>
            Add
          </button>
        </div>
        {form.portfolioSamples.map((url, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ flex: 1, color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
            <button type="button" onClick={() => removeSample(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{ padding: '10px', borderRadius: 6, border: 'none', background: submitting ? '#9ca3af' : '#3b82f6', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 500 }}
      >
        {submitting ? 'Submitting…' : 'Submit Bid'}
      </button>
    </form>
  );
}
