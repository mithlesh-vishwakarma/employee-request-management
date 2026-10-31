import api from './api';

export const getAdminDashboardApi = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

export const getManagerDashboardApi = async () => {
  const response = await api.get('/dashboard/manager');
  return response.data;
};

export const getEmployeeDashboardApi = async () => {
  const response = await api.get('/dashboard/employee');
  return response.data;
};

export const getActivityLogsApi = async (params = {}) => {
  const response = await api.get('/activity-logs', { params });
  return response.data;
};

export const triggerReminderJobApi = async () => {
  const response = await api.post('/jobs/trigger-reminders');
  return response.data;
};
