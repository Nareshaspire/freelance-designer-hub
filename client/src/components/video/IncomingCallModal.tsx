import React from 'react';
import { IncomingCall } from '../../hooks/useVideoCall';

interface Props {
  call: IncomingCall | null;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({ call, onAccept, onReject }: Props) {
  if (!call) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 20,
        width: 280,
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 40 }}>{call.type === 'video' ? '📹' : '📞'}</div>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Incoming {call.type} call</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>From: {call.callerId.slice(0, 12)}...</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={onReject}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
            }}
          >
            📵
          </button>
          <button
            onClick={onAccept}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
            }}
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
