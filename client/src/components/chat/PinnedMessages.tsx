import React from 'react';
import { Message } from '../../hooks/useChat';

interface Props {
  messages: Message[];
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessages({ messages, onUnpin }: Props) {
  if (messages.length === 0) return null;

  return (
    <div
      style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fffbeb',
        padding: '8px 16px',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>📌 Pinned Messages</div>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: 13, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {msg.content}
          </span>
          {onUnpin && (
            <button
              onClick={() => onUnpin(msg.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}
            >
              Unpin
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
