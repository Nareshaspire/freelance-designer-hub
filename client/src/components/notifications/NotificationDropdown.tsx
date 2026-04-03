import React from 'react';
import { Notification } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface Props {
  notifications: Notification[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({ notifications, onRead, onMarkAllRead, onClose }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: 360,
        maxHeight: 480,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
        <button
          onClick={onMarkAllRead}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13 }}
        >
          Mark all read
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No notifications</div>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} />
          ))
        )}
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px 16px' }}>
        <a href="/notifications" style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none' }}>View all notifications →</a>
      </div>
    </div>
  );
}
