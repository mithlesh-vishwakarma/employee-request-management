import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, REQUEST_STATUS } from '../constants';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import {
  createRequestApi,
  getAllRequestsApi,
  getMyRequestsApi,
  getTeamRequestsApi,
  approveRequestApi,
  rejectRequestApi,
  addCommentApi,
} from '../services/requestApi';
import {
  getEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  toggleEmployeeStatusApi,
  assignManagerApi,
  getManagersApi,
  getManagerTeamApi,
} from '../services/employeeApi';
import { getActivityLogsApi, triggerReminderJobApi } from '../services/dashboardApi';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const { showToast, refreshNotifications } = useNotifications();
  const { currentUser, role, isAuthenticated } = useAuth();

  // Load live data from MongoDB Atlas
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      setRequests([]);
      setUsers([]);
      setActivityLogs([]);
      return;
    }

    setLoading(true);
    try {
      if (role === ROLES.ADMIN) {
        const [empRes, reqRes, actRes] = await Promise.allSettled([
          getEmployeesApi({ limit: 100 }),
          getAllRequestsApi({ limit: 100 }),
          getActivityLogsApi({ limit: 50 }),
        ]);

        if (empRes.status === 'fulfilled' && empRes.value?.data) {
          setUsers(
            empRes.value.data.map((u) => ({
              id: u._id,
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              employeeId: u.employeeId,
              department: u.department,
              managerId: u.managerId?._id || u.managerId,
              managerName: u.managerId?.name || null,
              isActive: u.isActive,
              avatar:
                u.role === ROLES.ADMIN
                  ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                  : u.role === ROLES.MANAGER
                  ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }))
          );
        }

        if (reqRes.status === 'fulfilled' && reqRes.value?.data) {
          setRequests(
            reqRes.value.data.map((r) => ({
              id: r._id,
              _id: r._id,
              title: r.title,
              description: r.description,
              category: r.category,
              priority: r.priority,
              employeeId: r.employeeId?._id || r.employeeId,
              employeeName: r.employeeId?.name || 'Employee',
              employeeEmail: r.employeeId?.email || '',
              employeeDepartment: r.employeeId?.department || 'Engineering',
              managerId: r.managerId?._id || r.managerId,
              managerName: r.managerId?.name || 'Manager',
              status: r.status,
              submittedAt: r.submittedAt,
              reviewedAt: r.reviewedAt,
              reviewedBy: r.reviewedBy?.name || null,
              reviewComment: r.reviewComment || '',
              startDate: r.startDate,
              endDate: r.endDate,
            }))
          );
        }

        if (actRes.status === 'fulfilled' && actRes.value?.data) {
          setActivityLogs(
            actRes.value.data.map((a) => ({
              id: a._id,
              actorName: a.actorId?.name || 'System Scheduler',
              actorRole: a.actorId?.role || 'system',
              action: a.action,
              entityType: a.entityType,
              entityId: a.entityId,
              description: a.description,
              createdAt: a.createdAt,
            }))
          );
        }
      } else if (role === ROLES.MANAGER) {
        const [reqRes, teamRes] = await Promise.allSettled([
          getTeamRequestsApi({ limit: 100 }),
          getManagerTeamApi(currentUser._id || currentUser.id),
        ]);

        if (reqRes.status === 'fulfilled' && reqRes.value?.data) {
          setRequests(
            reqRes.value.data.map((r) => ({
              id: r._id,
              _id: r._id,
              title: r.title,
              description: r.description,
              category: r.category,
              priority: r.priority,
              employeeId: r.employeeId?._id || r.employeeId,
              employeeName: r.employeeId?.name || 'Team Member',
              employeeEmail: r.employeeId?.email || '',
              employeeDepartment: r.employeeId?.department || 'Engineering',
              managerId: currentUser.id || currentUser._id,
              managerName: currentUser.name,
              status: r.status,
              submittedAt: r.submittedAt,
              reviewedAt: r.reviewedAt,
              reviewedBy: r.reviewedBy?.name || null,
              reviewComment: r.reviewComment || '',
              startDate: r.startDate,
              endDate: r.endDate,
            }))
          );
        }

        if (teamRes.status === 'fulfilled' && teamRes.value?.data) {
          setUsers(
            teamRes.value.data.map((u) => ({
              id: u._id,
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              employeeId: u.employeeId,
              department: u.department,
              managerId: currentUser.id || currentUser._id,
              managerName: currentUser.name,
              isActive: u.isActive,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }))
          );
        }
      } else if (role === ROLES.EMPLOYEE) {
        const reqRes = await getMyRequestsApi({ limit: 100 });
        if (reqRes?.data) {
          setRequests(
            reqRes.data.map((r) => ({
              id: r._id,
              _id: r._id,
              title: r.title,
              description: r.description,
              category: r.category,
              priority: r.priority,
              employeeId: currentUser.id || currentUser._id,
              employeeName: currentUser.name,
              managerId: r.managerId?._id || r.managerId,
              managerName: r.managerId?.name || 'Assigned Manager',
              status: r.status,
              submittedAt: r.submittedAt,
              reviewedAt: r.reviewedAt,
              reviewedBy: r.reviewedBy?.name || null,
              reviewComment: r.reviewComment || '',
              startDate: r.startDate,
              endDate: r.endDate,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[RequestContext] Failed to load data from Atlas:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 1. Submit Request via API
  const submitRequest = async (data) => {
    try {
      const res = await createRequestApi(data);
      if (res?.data) {
        showToast('Request submitted successfully!', 'success');
        await loadData();
        refreshNotifications();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
      throw err;
    }
  };

  // 2. Review Request via API (Approve/Reject)
  const reviewRequest = async (requestId, { status, comment }) => {
    const isApprove = status === REQUEST_STATUS.APPROVED;
    try {
      if (isApprove) {
        await approveRequestApi(requestId, comment);
      } else {
        await rejectRequestApi(requestId, comment);
      }
      showToast(`Request ${status} successfully!`, 'success');
      await loadData();
      refreshNotifications();
      return true;
    } catch (err) {
      showToast(err.message || `Failed to ${status} request`, 'error');
      return false;
    }
  };

  // 3. Add Comment via API
  const addComment = async (requestId, message) => {
    if (!message?.trim()) return;
    try {
      await addCommentApi(requestId, message);
      showToast('Comment posted', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    }
  };

  // 4. Employee Management (Admin) via API
  const addEmployee = async (userData) => {
    try {
      const res = await createEmployeeApi(userData);
      showToast('Account created successfully!', 'success');
      await loadData();
      return res?.data;
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
      throw err;
    }
  };

  const updateEmployee = async (id, updatedFields) => {
    try {
      await updateEmployeeApi(id, updatedFields);
      showToast('Employee profile updated', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const toggleEmployeeStatus = async (id) => {
    try {
      const res = await toggleEmployeeStatusApi(id);
      showToast(res?.message || 'Status updated', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const assignManager = async (employeeId, managerId) => {
    try {
      await assignManagerApi(employeeId, managerId);
      showToast('Manager assigned successfully!', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to assign manager', 'error');
    }
  };

  // 5. Trigger 24h Overdue Reminders via API
  const trigger24hReminder = async () => {
    try {
      const res = await triggerReminderJobApi();
      if (res?.data) {
        const { remindersSent, skippedAlreadySent, totalChecked } = res.data;
        showToast(
          `24h Scheduler ran: ${totalChecked} checked, ${remindersSent} reminders dispatched, ${skippedAlreadySent} duplicate(s) prevented.`,
          'info'
        );
        refreshNotifications();
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to run scheduler check', 'error');
    }
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        users,
        activityLogs,
        loading,
        loadData,
        submitRequest,
        reviewRequest,
        addComment,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        assignManager,
        trigger24hReminder,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
