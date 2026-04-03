import React, { useState } from 'react';
import { Milestone, CreateMilestoneInput } from '@/services/projects';
import { createMilestone } from '@/services/projects';

interface Props {
  projectId: string;
  onSuccess?: (milestone: Milestone) => void;
  onCancel?: () => void;
}

const empty: CreateMilestoneInput = {
  title: '',
  description: '',
  amount: 0,
  dueDate: '',
  order: 1,
};

export default function MilestoneForm({ projectId, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<CreateMilestoneInput>({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CreateMilestoneInput>(key: K, value: CreateMilestoneInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const milestone = await createMilestone(projectId, form);
      setForm({ ...empty });
      onSuccess?.(milestone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save milestone');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>Add Milestone</h3>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 14, marginBottom: 14 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Title</span>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Amount ($)</span>
              <input
                type="number"
                required
                min={0}
                value={form.amount}
                onChange={e => set('amount', Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Order</span>
              <input
                type="number"
                required
                min={1}
                value={form.order}
                onChange={e => set('order', Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Due Date</span>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: 10, borderRadius: 6, border: 'none', background: saving ? '#9ca3af' : '#3b82f6', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}
            >
              {saving ? 'Saving…' : 'Save Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
