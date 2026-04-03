import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { chatService } from '../services/chat';
import { getChatSocket } from '../services/socket';

export interface Conversation {
  id: string;
  type: 'direct' | 'project_group';
  name?: string;
  participantIds: string[];
  lastMessageAt?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  isPinned: boolean;
  mentions: string[];
  readBy: { userId: string; readAt: string }[];
  isEdited: boolean;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
}

export function useChat(token: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = getChatSocket(token);

    const socket = socketRef.current;

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c,
        ),
      );
    });

    socket.on('message_updated', (message: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
    });

    socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    socket.on('message_pinned', (message: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
    });

    return () => {
      socket.off('new_message');
      socket.off('message_updated');
      socket.off('message_deleted');
      socket.off('message_pinned');
    };
  }, [token]);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await chatService.listConversations(token);
      setConversations(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const openConversation = useCallback(
    async (conversation: Conversation) => {
      if (!token) return;
      setActiveConversation(conversation);
      setMessages([]);
      setHasMore(true);
      socketRef.current?.emit('join_conversation', { conversationId: conversation.id });
      const data = await chatService.getMessages(token, conversation.id);
      setMessages(data);
      if (data.length < 50) setHasMore(false);
    },
    [token],
  );

  const loadMoreMessages = useCallback(async () => {
    if (!token || !activeConversation || !hasMore || messages.length === 0) return;
    const oldest = messages[0];
    const data = await chatService.getMessages(token, activeConversation.id, oldest.createdAt);
    if (data.length === 0) {
      setHasMore(false);
      return;
    }
    setMessages((prev) => [...data, ...prev]);
    if (data.length < 50) setHasMore(false);
  }, [token, activeConversation, hasMore, messages]);

  const sendMessage = useCallback(
    async (content: string, opts?: { fileUrl?: string; fileName?: string; fileSize?: number; replyToId?: string; mentions?: string[] }) => {
      if (!token || !activeConversation) return;
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        conversationId: activeConversation.id,
        senderId: 'me',
        content,
        type: 'text',
        isPinned: false,
        mentions: opts?.mentions || [],
        readBy: [],
        isEdited: false,
        createdAt: new Date().toISOString(),
        ...opts,
      };
      setMessages((prev) => [...prev, tempMessage]);

      socketRef.current?.emit('send_message', {
        conversationId: activeConversation.id,
        content,
        ...opts,
      });
    },
    [token, activeConversation],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!activeConversation) return;
      socketRef.current?.emit('edit_message', {
        messageId,
        content,
        conversationId: activeConversation.id,
      });
    },
    [activeConversation],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!activeConversation) return;
      socketRef.current?.emit('delete_message', {
        messageId,
        conversationId: activeConversation.id,
      });
    },
    [activeConversation],
  );

  const pinMessage = useCallback(
    (messageId: string) => {
      if (!activeConversation) return;
      socketRef.current?.emit('pin_message', {
        messageId,
        conversationId: activeConversation.id,
      });
    },
    [activeConversation],
  );

  const createConversation = useCallback(
    async (data: any) => {
      if (!token) return;
      const conv = await chatService.createConversation(token, data);
      setConversations((prev) => [conv, ...prev]);
      return conv;
    },
    [token],
  );

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    hasMore,
    loadConversations,
    openConversation,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    createConversation,
  };
}
