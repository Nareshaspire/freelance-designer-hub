import React, { useState } from 'react';
import { Message } from '../../hooks/useChat';
import { FileMessage } from './FileMessage';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReply?: (message: Message) => void;
}

export function MessageBubble({ message, isOwn, onEdit, onDelete, onPin, onReply }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  if (message.deletedAt) {
    return (
      <div style={{ textAlign: isOwn ? 'right' : 'left', padding: '4px 16px' }}>
        <span style={{ color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>This message was deleted</span>
      </div>
    );
  }

  const handleEditSave = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        padding: '4px 16px',
        gap: 8,
        alignItems: 'flex-end',
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {!isOwn && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {message.senderId.charAt(0).toUpperCase()}
        </div>
      )}

      <div style={{ maxWidth: '70%' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              style={{
                padding: '8px 12px',
                borderRadius: 16,
                border: '2px solid #6366f1',
                fontSize: 14,
                minWidth: 200,
              }}
            />
            <button onClick={handleEditSave} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
              Save
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: isOwn ? '#6366f1' : '#f3f4f6',
              color: isOwn ? '#fff' : '#111827',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '10px 14px',
              fontSize: 14,
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {(message.type === 'file' || message.type === 'image') ? (
              <FileMessage message={message} />
            ) : (
              message.content
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 2,
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
          }}
        >
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {message.isEdited && <span style={{ fontSize: 11, color: '#9ca3af' }}>(edited)</span>}
          {message.isPinned && <span style={{ fontSize: 11 }}>📌</span>}
          {isOwn && message.readBy.length > 1 && (
            <span style={{ fontSize: 11, color: '#6366f1' }}>✓✓</span>
          )}
        </div>
      </div>

      {showMenu && !isEditing && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {onReply && (
            <button onClick={() => onReply(message)} title="Reply" style={menuBtnStyle}>💬</button>
          )}
          {onPin && (
            <button onClick={() => onPin(message.id)} title={message.isPinned ? 'Unpin' : 'Pin'} style={menuBtnStyle}>📌</button>
          )}
          {isOwn && onEdit && (
            <button onClick={() => setIsEditing(true)} title="Edit" style={menuBtnStyle}>✏️</button>
          )}
          {isOwn && onDelete && (
            <button onClick={() => onDelete(message.id)} title="Delete" style={menuBtnStyle}>🗑️</button>
          )}
        </div>
      )}
    </div>
  );
}

const menuBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: 4,
  fontSize: 14,
};
