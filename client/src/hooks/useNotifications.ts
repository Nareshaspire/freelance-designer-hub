import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications';
import { getChatSocket } from '../services/socket';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = getChatSocket(token);
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      socket.off('notification');
    };
  }, [token]);

  const loadNotifications = useCallback(
    async (params?: { isRead?: boolean; page?: number; limit?: number }) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await notificationsService.listNotifications(token, params);
        setNotifications(data.data || data);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const loadUnreadCount = useCallback(async () => {
    if (!token) return;
    const count = await notificationsService.getUnreadCount(token);
    setUnreadCount(typeof count === 'object' ? count.count : count);
  }, [token]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!token) return;
      await notificationsService.markAsRead(token, id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    await notificationsService.markAllAsRead(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}
