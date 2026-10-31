import api from './api';

export const getEmployeesApi = async (params = {}) => {
  const response = await api.get('/employees', { params });
  return response.data;
};

export const createEmployeeApi = async (data) => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployeeApi = async (id, data) => {
  const response = await api.patch(`/employees/${id}`, data);
  return response.data;
};

export const toggleEmployeeStatusApi = async (id) => {
  const response = await api.patch(`/employees/${id}/status`);
  return response.data;
};

export const getManagersApi = async () => {
  const response = await api.get('/managers');
  return response.data;
};

export const getManagerTeamApi = async (managerId) => {
  const response = await api.get(`/managers/${managerId}/team`);
  return response.data;
};

export const assignManagerApi = async (employeeId, managerId) => {
  const response = await api.patch(`/managers/${employeeId}/manager`, { managerId });
  return response.data;
};
