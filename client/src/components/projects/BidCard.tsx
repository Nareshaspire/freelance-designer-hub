import React from 'react';
import { Bid, BidStatus } from '@/services/projects';

const STATUS_STYLES: Record<BidStatus, { bg: string; color: string }> = {
  [BidStatus.PENDING]: { bg: '#fef3c7', color: '#92400e' },
  [BidStatus.ACCEPTED]: { bg: '#d1fae5', color: '#065f46' },
  [BidStatus.REJECTED]: { bg: '#fee2e2', color: '#991b1b' },
  [BidStatus.WITHDRAWN]: { bg: '#f3f4f6', color: '#6b7280' },
};

interface Props {
  bid: Bid;
  isOwner?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function BidCard({ bid, isOwner, onAccept, onReject }: Props) {
  const statusStyle = STATUS_STYLES[bid.status];
  const truncatedLetter = bid.coverLetter?.length > 200
    ? bid.coverLetter.slice(0, 200) + '…'
    : bid.coverLetter ?? '';

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 16,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Freelancer: </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{bid.freelancerId}</span>
        </div>
        <span style={{
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 500,
          background: statusStyle.bg,
          color: statusStyle.color,
        }}>
          {bid.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
        <div>
          <span style={{ color: '#6b7280' }}>Rate: </span>
          <strong style={{ color: '#059669' }}>
            ${bid.proposedRate.toLocaleString()}
          </strong>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Duration: </span>
          <span>{bid.estimatedDuration}</span>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.5 }}>{truncatedLetter}</p>

      {bid.portfolioSamples?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {bid.portfolioSamples.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3b82f6' }}>
              Sample {i + 1}
            </a>
          ))}
        </div>
      )}

      {isOwner && bid.status === BidStatus.PENDING && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => onAccept?.(bid.id)}
            style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            Accept
          </button>
          <button
            onClick={() => onReject?.(bid.id)}
            style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
