import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_REQUESTS,
  DEMO_USERS,
  INITIAL_ACTIVITY_LOGS,
  REQUEST_STATUS,
  ROLES,
} from '../constants';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [users, setUsers] = useState(DEMO_USERS);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);

  const { addNotification, showToast } = useNotifications();
  const { currentUser } = useAuth();

  // 1. Submit Request
  const submitRequest = (data) => {
    const employee = currentUser;
    const assignedManager = users.find((u) => u.id === employee.managerId);

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      employeeDepartment: employee.department,
      managerId: employee.managerId || 'u-mgr-1',
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

    // Create Notification for Manager
    if (newRequest.managerId) {
      addNotification({
        recipientId: newRequest.managerId,
        requestId: newRequest.id,
        title: 'New Request Received',
        message: `${employee.name} submitted a new ${newRequest.category} request: "${newRequest.title}".`,
        type: 'new_request',
      });
    }

    // Record Activity
    logActivity({
      actorName: employee.name,
      actorRole: employee.role,
      action: 'REQUEST_SUBMITTED',
      entityType: 'Request',
      entityId: newRequest.id,
      description: `Submitted ${newRequest.category} request: ${newRequest.title}`,
    });

    showToast('Request submitted successfully!', 'success');
    return newRequest;
  };

  // 2. Review Request (Approve or Reject)
  const reviewRequest = (requestId, { status, comment }) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return false;

    const isApprove = status === REQUEST_STATUS.APPROVED;
    const reviewedTime = new Date().toISOString();

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewedAt: reviewedTime,
              reviewedBy: currentUser?.name || 'Manager',
              reviewComment: comment || (isApprove ? 'Approved' : 'Rejected'),
            }
          : r
      )
    );

    // Notify Employee
    addNotification({
      recipientId: target.employeeId,
      requestId: target.id,
      title: isApprove ? 'Request Approved' : 'Request Rejected',
      message: `Your ${target.category} request "${target.title}" was ${isApprove ? 'approved' : 'rejected'} by ${currentUser?.name || 'Manager'}.`,
      type: isApprove ? 'request_approved' : 'request_rejected',
    });

    // Record Activity
    logActivity({
      actorName: currentUser?.name || 'Manager',
      actorRole: currentUser?.role || 'manager',
      action: isApprove ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
      entityType: 'Request',
      entityId: target.id,
      description: `${isApprove ? 'Approved' : 'Rejected'} request "${target.title}". Comment: ${comment || 'None'}`,
    });

    showToast(`Request ${status} successfully!`, 'success');
    return true;
  };

  // 3. Add Comment to Request
  const addComment = (requestId, message) => {
    if (!message?.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser?.name || 'User',
      authorRole: currentUser?.role || 'user',
      message,
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
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
  const addEmployee = (userData) => {
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
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    setUsers((prev) => [newUser, ...prev]);

    logActivity({
      actorName: currentUser?.name || 'Admin',
      actorRole: 'admin',
      action: 'EMPLOYEE_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      description: `Created new account for ${newUser.name} (${newUser.role}) in ${newUser.department}.`,
    });

    showToast('Employee account created successfully!', 'success');
    return newUser;
  };

  const updateEmployee = (id, updatedFields) => {
    const assignedMgr = users.find((u) => u.id === updatedFields.managerId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              ...updatedFields,
              managerName: assignedMgr ? assignedMgr.name : u.managerName,
            }
          : u
      )
    );

    logActivity({
      actorName: currentUser?.name || 'Admin',
      actorRole: 'admin',
      action: 'EMPLOYEE_UPDATED',
      entityType: 'User',
      entityId: id,
      description: `Updated profile details for employee ID ${id}.`,
    });

    showToast('Employee details updated', 'success');
  };

  const toggleEmployeeStatus = (id) => {
    let newStatus = true;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          newStatus = !u.isActive;
          return { ...u, isActive: newStatus };
        }
        return u;
      })
    );

    logActivity({
      actorName: currentUser?.name || 'Admin',
      actorRole: 'admin',
      action: newStatus ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      description: `${newStatus ? 'Activated' : 'Deactivated'} account for employee ID ${id}.`,
    });

    showToast(`Account ${newStatus ? 'activated' : 'deactivated'}`, 'info');
  };

  // 5. Manager Assignment
  const assignManager = (employeeId, managerId) => {
    const targetMgr = users.find((u) => u.id === managerId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === employeeId
          ? {
              ...u,
              managerId,
              managerName: targetMgr ? targetMgr.name : null,
            }
          : u
      )
    );

    // Update pending requests for that employee to point to the new manager
    setRequests((prev) =>
      prev.map((r) =>
        r.employeeId === employeeId && r.status === REQUEST_STATUS.PENDING
          ? {
              ...r,
              managerId,
              managerName: targetMgr ? targetMgr.name : r.managerName,
            }
          : r
      )
    );

    const targetEmp = users.find((u) => u.id === employeeId);
    logActivity({
      actorName: currentUser?.name || 'Admin',
      actorRole: 'admin',
      action: 'MANAGER_ASSIGNED',
      entityType: 'User',
      entityId: employeeId,
      description: `Assigned manager ${targetMgr?.name || managerId} to ${targetEmp?.name || employeeId}.`,
    });

    showToast('Manager assigned successfully!', 'success');
  };

  // Helper for Activity Log
  const logActivity = (activity) => {
    const newLog = {
      id: `act-${Date.now()}`,
      ...activity,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Trigger Overdue Reminders (Demonstrates the 24h cron bonus requirement)
  const trigger24hReminder = () => {
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

      logActivity({
        actorName: 'System Scheduler (Cron)',
        actorRole: 'system',
        action: 'REMINDER_SENT',
        entityType: 'Request',
        entityId: req.id,
        description: `Automated 24h overdue reminder dispatched to ${req.managerName} for ${req.id}.`,
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

