import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const notificationsService = {
  listNotifications: async (token: string, params?: { isRead?: boolean; page?: number; limit?: number }) => {
    const res = await axios.get(`${API_URL}/notifications`, { headers: getHeaders(token), params });
    return res.data;
  },

  getUnreadCount: async (token: string) => {
    const res = await axios.get(`${API_URL}/notifications/unread-count`, { headers: getHeaders(token) });
    return res.data;
  },

  markAsRead: async (token: string, id: string) => {
    const res = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: getHeaders(token) });
    return res.data;
  },

  markAllAsRead: async (token: string) => {
    const res = await axios.post(`${API_URL}/notifications/read-all`, {}, { headers: getHeaders(token) });
    return res.data;
  },
};
