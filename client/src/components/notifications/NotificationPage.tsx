import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface Props {
  token: string | null;
}

export function NotificationPage({ token }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, loading, loadNotifications, markAsRead, markAllAsRead } = useNotifications(token);

  useEffect(() => {
    if (token) {
      loadNotifications(filter === 'unread' ? { isRead: false } : undefined);
    }
  }, [token, filter, loadNotifications]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Notifications</h1>
        <button
          onClick={markAllAsRead}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          Mark all as read
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: filter === f ? '#6366f1' : '#d1d5db',
              backgroundColor: filter === f ? '#6366f1' : '#fff',
              color: filter === f ? '#fff' : '#374151',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No notifications</div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
