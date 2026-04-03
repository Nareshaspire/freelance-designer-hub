import React, { useState } from 'react';
import { Milestone, MilestoneStatus } from '@/services/projects';
import { submitMilestone, approveMilestone, rejectMilestone } from '@/services/projects';

const STATUS_ICONS: Record<MilestoneStatus, string> = {
  [MilestoneStatus.PENDING]: '○',
  [MilestoneStatus.IN_PROGRESS]: '◷',
  [MilestoneStatus.SUBMITTED]: '↑',
  [MilestoneStatus.APPROVED]: '✓',
  [MilestoneStatus.REJECTED]: '✗',
};

const STATUS_COLORS: Record<MilestoneStatus, { bg: string; color: string }> = {
  [MilestoneStatus.PENDING]: { bg: '#f3f4f6', color: '#6b7280' },
  [MilestoneStatus.IN_PROGRESS]: { bg: '#dbeafe', color: '#1e40af' },
  [MilestoneStatus.SUBMITTED]: { bg: '#fef3c7', color: '#92400e' },
  [MilestoneStatus.APPROVED]: { bg: '#d1fae5', color: '#065f46' },
  [MilestoneStatus.REJECTED]: { bg: '#fee2e2', color: '#991b1b' },
};

interface Props {
  milestones: Milestone[];
  isClient?: boolean;
  isFreelancer?: boolean;
  projectId: string;
  onUpdate?: () => void;
}

export default function MilestoneList({ milestones, isClient, isFreelancer, onUpdate }: Props) {
  const [deliverableUrl, setDeliverableUrl] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  async function handleSubmit(id: string) {
    const url = deliverableUrl[id] ?? '';
    if (!url) return;
    setActing(id);
    try {
      await submitMilestone(id, url);
      onUpdate?.();
    } finally {
      setActing(null);
    }
  }

  async function handleApprove(id: string) {
    setActing(id);
    try {
      await approveMilestone(id);
      onUpdate?.();
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: string) {
    setActing(id);
    try {
      await rejectMilestone(id);
      onUpdate?.();
    } finally {
      setActing(null);
    }
  }

  if (sorted.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>No milestones yet.</p>;
  }

  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((m, idx) => {
        const statusStyle = STATUS_COLORS[m.status];
        const isLast = idx === sorted.length - 1;
        return (
          <li key={m.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: statusStyle.bg,
                color: statusStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {STATUS_ICONS[m.status]}
              </div>
              {!isLast && <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 24, marginTop: 2 }} />}
            </div>

            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 24, paddingTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{m.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{m.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#059669' }}>${m.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Due {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <span style={{
                display: 'inline-block',
                marginTop: 6,
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
                background: statusStyle.bg,
                color: statusStyle.color,
              }}>
                {m.status.replace('_', ' ')}
              </span>

              {m.deliverableUrl && (
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    View Deliverable
                  </a>
                </div>
              )}

              {/* Freelancer: submit deliverable */}
              {isFreelancer && m.status === MilestoneStatus.IN_PROGRESS && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    placeholder="Deliverable URL"
                    value={deliverableUrl[m.id] ?? ''}
                    onChange={e => setDeliverableUrl(prev => ({ ...prev, [m.id]: e.target.value }))}
                    style={{ flex: 1, minWidth: 200, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                  />
                  <button
                    onClick={() => handleSubmit(m.id)}
                    disabled={acting === m.id}
                    style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                  >
                    {acting === m.id ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              )}

              {/* Client: approve/reject */}
              {isClient && m.status === MilestoneStatus.SUBMITTED && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => handleApprove(m.id)}
                    disabled={acting === m.id}
                    style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    disabled={acting === m.id}
                    style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
