export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const REQUEST_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const REQUEST_CATEGORIES = [
  'Leave',
  'Work From Home',
  'Equipment',
  'Expense Reimbursement',
  'General',
];

export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'new_request',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_REJECTED: 'request_rejected',
  REQUEST_REMINDER: 'request_reminder',
  GENERAL: 'general',
};

export const ACTIVITY_ACTIONS = {
  EMPLOYEE_CREATED: 'EMPLOYEE_CREATED',
  EMPLOYEE_UPDATED: 'EMPLOYEE_UPDATED',
  EMPLOYEE_ACTIVATED: 'EMPLOYEE_ACTIVATED',
  EMPLOYEE_DEACTIVATED: 'EMPLOYEE_DEACTIVATED',
  MANAGER_ASSIGNED: 'MANAGER_ASSIGNED',
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED',
  REQUEST_APPROVED: 'REQUEST_APPROVED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  REMINDER_SENT: 'REMINDER_SENT',
};
