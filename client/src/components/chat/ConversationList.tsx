import React, { useState } from 'react';
import { Conversation } from '../../hooks/useChat';
import { ConversationItem } from './ConversationItem';

interface Props {
  conversations: Conversation[];
  activeConversationId?: string;
  currentUserId?: string;
  onSelectConversation: (conv: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationList({ conversations, activeConversationId, currentUserId, onSelectConversation, onNewConversation }: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const name = c.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #e5e7eb' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Messages</h2>
          <button
            onClick={onNewConversation}
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            + New
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>No conversations found</div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              currentUserId={currentUserId}
              onClick={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}
