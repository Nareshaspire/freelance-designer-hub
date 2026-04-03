import React from 'react';
import { Conversation } from '../../hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  currentUserId?: string;
  onClick: (conv: Conversation) => void;
}

export function ConversationItem({ conversation, isActive, currentUserId, onClick }: Props) {
  const otherParticipants = conversation.participantIds?.filter((id) => id !== currentUserId) || [];
  const displayName =
    conversation.name ||
    (conversation.type === 'direct' ? `User ${otherParticipants[0]?.slice(0, 8) || 'Unknown'}` : 'Group Chat');
  const lastMsgTime = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
    : '';

  return (
    <div
      onClick={() => onClick(conversation)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: isActive ? '#e8f0fe' : 'transparent',
        borderBottom: '1px solid #f0f0f0',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14, truncate: 'ellipsis' }}>{displayName}</span>
          <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{lastMsgTime}</span>
        </div>
        <div style={{ fontSize: 13, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {conversation.lastMessage?.content || 'No messages yet'}
        </div>
      </div>
      {conversation.unreadCount !== undefined && conversation.unreadCount > 0 && (
        <div
          style={{
            backgroundColor: '#6366f1',
            color: '#fff',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </div>
      )}
    </div>
  );
}
