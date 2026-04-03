import React, { useState, useRef, useCallback } from 'react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { Socket } from 'socket.io-client';

interface Props {
  socket: Socket | null;
  conversationId: string | null;
  onSend: (content: string) => void;
  onFileUpload?: (file: File) => void;
  replyTo?: { id: string; content: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageInput({ socket, conversationId, onSend, onFileUpload, replyTo, onCancelReply, disabled }: Props) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startTyping, stopTyping } = useTypingIndicator(socket, conversationId);

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    stopTyping();
  }, [text, onSend, stopTyping, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    startTyping();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
      {replyTo && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f3f4f6',
            borderLeft: '3px solid #6366f1',
            padding: '6px 10px',
            borderRadius: 4,
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          <span style={{ color: '#6b7280' }}>Replying to: {replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? '...' : ''}</span>
          <button onClick={onCancelReply} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach file"
          style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 20,
            color: '#6b7280',
            padding: 4,
          }}
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Select a conversation...' : 'Type a message... (Enter to send)'}
          rows={1}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: 20,
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            maxHeight: 120,
            overflowY: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          style={{
            background: text.trim() && !disabled ? '#6366f1' : '#d1d5db',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
