import React, { useEffect, useRef, useState } from 'react';
import { Message, Conversation } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { PinnedMessages } from './PinnedMessages';
import { Socket } from 'socket.io-client';

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId?: string;
  socket: Socket | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  pinnedMessages?: Message[];
}

export function MessageThread({ conversation, messages, currentUserId, socket, hasMore, onLoadMore, onEdit, onDelete, onPin, pinnedMessages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('user_typing', ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) {
        setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      }
    });
    socket.on('user_stopped_typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== userId));
    });
    return () => {
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && hasMore) {
      onLoadMore();
    }
  };

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 15 }}>
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {pinnedMessages && pinnedMessages.length > 0 && (
        <PinnedMessages messages={pinnedMessages} onUnpin={onPin} />
      )}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}
      >
        {hasMore && (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <button
              onClick={onLoadMore}
              style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '4px 16px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
            >
              Load more
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
            onReply={setReplyTo}
          />
        ))}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
