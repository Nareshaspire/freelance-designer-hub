import React from 'react';
import { CallState } from '../../hooks/useVideoCall';

interface Props {
  callState: CallState;
  duration: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const stateMessages: Record<CallState, string> = {
  idle: '',
  ringing: '🔔 Ringing...',
  connecting: '⚡ Connecting...',
  active: '',
  ended: 'Call ended',
};

export function CallStatus({ callState, duration }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 16px' }}>
      {callState === 'active' ? (
        <span style={{ fontSize: 18, fontWeight: 600, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
          {formatDuration(duration)}
        </span>
      ) : (
        <span style={{ fontSize: 15, color: '#6b7280' }}>{stateMessages[callState]}</span>
      )}
    </div>
  );
}
