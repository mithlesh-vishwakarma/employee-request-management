import api from './api';

export const getNotificationsApi = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCountApi = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
