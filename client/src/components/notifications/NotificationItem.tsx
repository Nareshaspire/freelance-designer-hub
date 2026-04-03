import React from 'react';
import { Notification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, string> = {
  new_message: '💬',
  mention: '@',
  project_update: '📋',
  bid_received: '📝',
  bid_accepted: '✅',
  payment_received: '💰',
  milestone_approved: '🏆',
  review_received: '⭐',
};

interface Props {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: Props) {
  return (
    <div
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
        if (notification.link) window.location.href = notification.link;
      }}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: notification.isRead ? 'transparent' : '#f0f4ff',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: '#ede9fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {iconMap[notification.type] || '🔔'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: notification.isRead ? 400 : 600, color: '#111827' }}>
          {notification.title}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{notification.body}</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </div>
      </div>
      {!notification.isRead && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1', flexShrink: 0, marginTop: 4 }} />
      )}
    </div>
  );
}
