import api from './api';

export const createRequestApi = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const getAllRequestsApi = async (params = {}) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const getMyRequestsApi = async (params = {}) => {
  const response = await api.get('/requests/my-requests', { params });
  return response.data;
};

export const getTeamRequestsApi = async (params = {}) => {
  const response = await api.get('/requests/team-requests', { params });
  return response.data;
};

export const getRequestByIdApi = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const approveRequestApi = async (id, comment = '') => {
  const response = await api.patch(`/requests/${id}/approve`, { comment });
  return response.data;
};

export const rejectRequestApi = async (id, comment) => {
  const response = await api.patch(`/requests/${id}/reject`, { comment });
  return response.data;
};

export const addCommentApi = async (id, message) => {
  const response = await api.post(`/requests/${id}/comments`, { message });
  return response.data;
};

export const getCommentsApi = async (id) => {
  const response = await api.get(`/requests/${id}/comments`);
  return response.data;
};
