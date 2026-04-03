import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const chatService = {
  createConversation: async (token: string, data: any) => {
    const res = await axios.post(`${API_URL}/conversations`, data, { headers: getHeaders(token) });
    return res.data;
  },

  listConversations: async (token: string) => {
    const res = await axios.get(`${API_URL}/conversations`, { headers: getHeaders(token) });
    return res.data;
  },

  getConversation: async (token: string, id: string) => {
    const res = await axios.get(`${API_URL}/conversations/${id}`, { headers: getHeaders(token) });
    return res.data;
  },

  leaveConversation: async (token: string, id: string) => {
    const res = await axios.delete(`${API_URL}/conversations/${id}`, { headers: getHeaders(token) });
    return res.data;
  },

  getMessages: async (token: string, conversationId: string, cursor?: string, limit = 50) => {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    const res = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: getHeaders(token),
      params,
    });
    return res.data;
  },

  sendMessage: async (token: string, conversationId: string, data: any) => {
    const res = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, data, {
      headers: getHeaders(token),
    });
    return res.data;
  },

  searchMessages: async (token: string, q: string, conversationId?: string) => {
    const params: any = { q };
    if (conversationId) params.conversationId = conversationId;
    const res = await axios.get(`${API_URL}/messages/search`, { headers: getHeaders(token), params });
    return res.data;
  },

  pinMessage: async (token: string, conversationId: string, messageId: string) => {
    const res = await axios.post(
      `${API_URL}/conversations/${conversationId}/messages/${messageId}/pin`,
      {},
      { headers: getHeaders(token) }
    );
    return res.data;
  },

  getPinnedMessages: async (token: string, conversationId: string) => {
    const res = await axios.get(`${API_URL}/conversations/${conversationId}/pinned`, { headers: getHeaders(token) });
    return res.data;
  },

  uploadFile: async (token: string, conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_URL}/conversations/${conversationId}/upload`, formData, {
      headers: { ...getHeaders(token), 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
