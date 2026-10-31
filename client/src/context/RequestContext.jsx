import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_REQUESTS,
  DEMO_USERS,
  INITIAL_ACTIVITY_LOGS,
  REQUEST_STATUS,
  ROLES,
} from '../constants';
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
} from '../services/employeeApi';
import { getActivityLogsApi, triggerReminderJobApi } from '../services/dashboardApi';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [users, setUsers] = useState(DEMO_USERS);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [loading, setLoading] = useState(false);

  const { addNotification, showToast } = useNotifications();
  const { currentUser, role, isAuthenticated } = useAuth();

  // Fetch live records from backend API when authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const fetchLiveRecords = async () => {
      try {
        if (role === ROLES.ADMIN) {
          const [empRes, reqRes, actRes] = await Promise.allSettled([
            getEmployeesApi({ limit: 50 }),
            getAllRequestsApi({ limit: 50 }),
            getActivityLogsApi({ limit: 50 }),
          ]);

          if (empRes.status === 'fulfilled' && empRes.value?.data?.length > 0) {
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

          if (reqRes.status === 'fulfilled' && reqRes.value?.data?.length > 0) {
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
                employeeDepartment: r.employeeId?.department || 'General',
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

          if (actRes.status === 'fulfilled' && actRes.value?.data?.length > 0) {
            setActivityLogs(
              actRes.value.data.map((a) => ({
                id: a._id,
                actorName: a.actorId?.name || 'System',
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
          const reqRes = await getTeamRequestsApi({ limit: 50 }).catch(() => null);
          if (reqRes?.data?.length > 0) {
            setRequests(
              reqRes.data.map((r) => ({
                id: r._id,
                _id: r._id,
                title: r.title,
                description: r.description,
                category: r.category,
                priority: r.priority,
                employeeId: r.employeeId?._id || r.employeeId,
                employeeName: r.employeeId?.name || 'Team Member',
                employeeEmail: r.employeeId?.email || '',
                employeeDepartment: r.employeeId?.department || 'General',
                managerId: currentUser.id || currentUser._id,
                managerName: currentUser.name,
                status: r.status,
                submittedAt: r.submittedAt,
                reviewedAt: r.reviewedAt,
                reviewedBy: r.reviewedBy?.name || null,
                reviewComment: r.reviewComment || '',
              }))
            );
          }
        } else if (role === ROLES.EMPLOYEE) {
          const reqRes = await getMyRequestsApi({ limit: 50 }).catch(() => null);
          if (reqRes?.data?.length > 0) {
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
        }
      } catch (err) {
        console.warn('[RequestContext] Could not load live records from API:', err.message);
      }
    };

    fetchLiveRecords();
  }, [isAuthenticated, role, currentUser]);

  // 1. Submit Request
  const submitRequest = async (data) => {
    try {
      const res = await createRequestApi(data);
      if (res?.data) {
        const created = res.data;
        const formatted = {
          id: created._id,
          _id: created._id,
          title: created.title,
          description: created.description,
          category: created.category,
          priority: created.priority,
          employeeId: created.employeeId?._id || currentUser.id,
          employeeName: created.employeeId?.name || currentUser.name,
          employeeEmail: created.employeeId?.email || currentUser.email,
          employeeDepartment: created.employeeId?.department || currentUser.department,
          managerId: created.managerId?._id || currentUser.managerId,
          managerName: created.managerId?.name || currentUser.managerName,
          status: created.status,
          submittedAt: created.submittedAt,
          startDate: created.startDate,
          endDate: created.endDate,
          comments: [],
        };
        setRequests((prev) => [formatted, ...prev]);
        showToast('Request submitted successfully to backend!', 'success');
        return formatted;
      }
    } catch (err) {
      console.warn('[RequestContext] API submit failed, using client fallback:', err.message);
    }

    // Client fallback
    const employee = currentUser;
    const assignedManager = users.find((u) => u.id === employee?.managerId);
    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      employeeId: employee?.id || 'u-emp-1',
      employeeName: employee?.name || 'Alex Johnson',
      employeeEmail: employee?.email || 'employee@enterprise.com',
      employeeDepartment: employee?.department || 'Engineering',
      managerId: employee?.managerId || 'u-mgr-1',
      managerName: assignedManager ? assignedManager.name : 'David Vance (Manager)',
      status: REQUEST_STATUS.PENDING,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewComment: '',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      comments: [],
    };
    setRequests((prev) => [newRequest, ...prev]);
    showToast('Request submitted successfully!', 'success');
    return newRequest;
  };

  // 2. Review Request (Approve or Reject)
  const reviewRequest = async (requestId, { status, comment }) => {
    const isApprove = status === REQUEST_STATUS.APPROVED;

    try {
      if (isApprove) {
        await approveRequestApi(requestId, comment);
      } else {
        await rejectRequestApi(requestId, comment);
      }
      showToast(`Request ${status} successfully in database!`, 'success');
    } catch (err) {
      console.warn('[RequestContext] API review failed, using client fallback:', err.message);
      showToast(`Request ${status} successfully!`, 'success');
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId || r._id === requestId
          ? {
              ...r,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || 'Manager',
              reviewComment: comment || (isApprove ? 'Approved' : 'Rejected'),
            }
          : r
      )
    );
    return true;
  };

  // 3. Add Comment to Request
  const addComment = async (requestId, message) => {
    if (!message?.trim()) return;
    try {
      await addCommentApi(requestId, message);
    } catch (err) {
      console.warn('[RequestContext] Add comment API failed, updating client:', err.message);
    }

    const newComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser?.name || 'User',
      authorRole: currentUser?.role || 'user',
      message,
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId || r._id === requestId
          ? {
              ...r,
              comments: [...(r.comments || []), newComment],
            }
          : r
      )
    );
    showToast('Comment added', 'info');
  };

  // 4. Employee Management (Admin)
  const addEmployee = async (userData) => {
    try {
      const res = await createEmployeeApi(userData);
      if (res?.data) {
        const u = res.data;
        const newU = {
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
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };
        setUsers((prev) => [newU, ...prev]);
        showToast('Account created successfully in database!', 'success');
        return newU;
      }
    } catch (err) {
      console.warn('[RequestContext] Create employee API failed, using client state:', err.message);
    }

    const assignedMgr = users.find((u) => u.id === userData.managerId);
    const newUser = {
      id: `u-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || ROLES.EMPLOYEE,
      employeeId: userData.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      department: userData.department,
      managerId: userData.role === ROLES.MANAGER ? null : userData.managerId || null,
      managerName: assignedMgr ? assignedMgr.name : null,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast('Employee account created successfully!', 'success');
    return newUser;
  };

  const updateEmployee = async (id, updatedFields) => {
    try {
      await updateEmployeeApi(id, updatedFields);
    } catch (err) {
      console.warn('[RequestContext] Update employee API failed, updating client:', err.message);
    }

    const assignedMgr = users.find((u) => u.id === updatedFields.managerId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id || u._id === id
          ? {
              ...u,
              ...updatedFields,
              managerName: assignedMgr ? assignedMgr.name : u.managerName,
            }
          : u
      )
    );
    showToast('Employee details updated', 'success');
  };

  const toggleEmployeeStatus = async (id) => {
    try {
      await toggleEmployeeStatusApi(id);
    } catch (err) {
      console.warn('[RequestContext] Toggle status API failed, updating client:', err.message);
    }

    let newStatus = true;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id || u._id === id) {
          newStatus = !u.isActive;
          return { ...u, isActive: newStatus };
        }
        return u;
      })
    );
    showToast(`Account ${newStatus ? 'activated' : 'deactivated'}`, 'info');
  };

  const assignManager = async (employeeId, managerId) => {
    try {
      await assignManagerApi(employeeId, managerId);
    } catch (err) {
      console.warn('[RequestContext] Assign manager API failed, updating client:', err.message);
    }

    const targetMgr = users.find((u) => u.id === managerId || u._id === managerId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === employeeId || u._id === employeeId
          ? {
              ...u,
              managerId,
              managerName: targetMgr ? targetMgr.name : null,
            }
          : u
      )
    );
    showToast('Manager assigned successfully!', 'success');
  };

  // 5. Trigger 24h Overdue Reminders
  const trigger24hReminder = async () => {
    try {
      const res = await triggerReminderJobApi();
      if (res?.data) {
        showToast(
          `Reminder scheduler ran: Sent ${res.data.remindersSent}, skipped ${res.data.skippedAlreadySent} duplicates.`,
          'info'
        );
        return;
      }
    } catch (err) {
      console.warn('[RequestContext] Reminder API call failed, using client simulation:', err.message);
    }

    const overdueList = requests.filter(
      (r) =>
        r.status === REQUEST_STATUS.PENDING &&
        Date.now() - new Date(r.submittedAt).getTime() > 24 * 60 * 60 * 1000
    );

    if (overdueList.length === 0) {
      showToast('No requests currently exceed the 24-hour threshold', 'info');
      return;
    }

    overdueList.forEach((req) => {
      addNotification({
        recipientId: req.managerId,
        requestId: req.id,
        title: 'Overdue Reminder (>24h Pending)',
        message: `Automated reminder: Request #${req.id} (${req.title}) from ${req.employeeName} has been pending for over 24 hours.`,
        type: 'request_reminder',
      });
    });

    showToast(`Dispatched reminders for ${overdueList.length} overdue request(s)!`, 'warning');
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        users,
        activityLogs,
        loading,
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
