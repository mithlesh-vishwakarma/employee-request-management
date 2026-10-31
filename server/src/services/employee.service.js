import User from '../models/User.js';
import Request from '../models/Request.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES, ACTIVITY_ACTIONS } from '../constants/index.js';
import { logActivity } from './activityLog.service.js';

export const getAllEmployees = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.role && query.role !== 'all') {
    filter.role = query.role;
  }
  if (query.department && query.department !== 'all') {
    filter.department = query.department;
  }
  if (query.status && query.status !== 'all') {
    filter.isActive = query.status === 'active';
  }
  if (query.managerId) {
    filter.managerId = query.managerId;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
    ];
  }

  const [employees, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('managerId', 'name email department employeeId'),
    User.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEmployeeById = async (id) => {
  const employee = await User.findById(id).populate('managerId', 'name email department employeeId');
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  return employee;
};

export const createEmployee = async (data, actor) => {
  // If email already in use
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email address already exists');
  }

  // Validate manager if assigned
  if (data.managerId) {
    const manager = await User.findById(data.managerId);
    if (!manager) {
      throw new ApiError(400, 'Assigned manager not found');
    }
    if (manager.role !== ROLES.MANAGER) {
      throw new ApiError(400, 'Only users with the Manager role can be assigned as direct managers');
    }
  }

  const employee = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password || 'Password123!',
    role: data.role || ROLES.EMPLOYEE,
    department: data.department,
    employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
    managerId: data.role === ROLES.MANAGER ? null : data.managerId || null,
    isActive: true,
  });

  await logActivity({
    actorId: actor?._id,
    action: ACTIVITY_ACTIONS.EMPLOYEE_CREATED,
    entityType: 'User',
    entityId: employee._id,
    description: `Created account for ${employee.name} (${employee.role}) in ${employee.department}.`,
  });

  return await getEmployeeById(employee._id);
};

export const updateEmployee = async (id, data, actor) => {
  const employee = await User.findById(id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  // Email uniqueness check if email changed
  if (data.email && data.email.toLowerCase() !== employee.email) {
    const emailExists = await User.findOne({ email: data.email.toLowerCase() });
    if (emailExists) {
      throw new ApiError(409, 'Email address is already in use by another user');
    }
    employee.email = data.email.toLowerCase();
  }

  if (data.name) employee.name = data.name;
  if (data.department) employee.department = data.department;
  if (data.role) employee.role = data.role;
  if (data.password && data.password.trim()) {
    employee.password = data.password.trim();
  }

  // Manager update check
  if (data.managerId !== undefined) {
    if (data.managerId) {
      if (data.managerId === id.toString()) {
        throw new ApiError(400, 'An employee cannot be assigned as their own manager');
      }
      const mgr = await User.findById(data.managerId);
      if (!mgr || mgr.role !== ROLES.MANAGER) {
        throw new ApiError(400, 'Target user is not a valid active manager');
      }
      employee.managerId = data.managerId;
    } else {
      employee.managerId = null;
    }
  }

  await employee.save();

  await logActivity({
    actorId: actor?._id,
    action: ACTIVITY_ACTIONS.EMPLOYEE_UPDATED,
    entityType: 'User',
    entityId: employee._id,
    description: `Updated profile details for ${employee.name}.`,
  });

  return await getEmployeeById(employee._id);
};

export const toggleEmployeeStatus = async (id, actor) => {
  const employee = await User.findById(id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  employee.isActive = !employee.isActive;
  await employee.save();

  await logActivity({
    actorId: actor?._id,
    action: employee.isActive ? ACTIVITY_ACTIONS.EMPLOYEE_ACTIVATED : ACTIVITY_ACTIONS.EMPLOYEE_DEACTIVATED,
    entityType: 'User',
    entityId: employee._id,
    description: `${employee.isActive ? 'Activated' : 'Deactivated'} account for ${employee.name}.`,
  });

  return employee;
};

export const assignManager = async (employeeId, managerId, actor) => {
  if (employeeId.toString() === managerId.toString()) {
    throw new ApiError(400, 'An employee cannot be assigned as their own manager');
  }

  const [employee, manager] = await Promise.all([
    User.findById(employeeId),
    User.findById(managerId),
  ]);

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  if (!manager) {
    throw new ApiError(404, 'Manager not found');
  }
  if (manager.role !== ROLES.MANAGER) {
    throw new ApiError(400, 'Assigned user must have the manager role');
  }

  employee.managerId = manager._id;
  await employee.save();

  // Also update pending requests submitted by this employee to route to the new manager
  await Request.updateMany(
    { employeeId: employee._id, status: 'pending' },
    { managerId: manager._id }
  );

  await logActivity({
    actorId: actor?._id,
    action: ACTIVITY_ACTIONS.MANAGER_ASSIGNED,
    entityType: 'User',
    entityId: employee._id,
    description: `Assigned manager ${manager.name} to ${employee.name}.`,
  });

  return await getEmployeeById(employee._id);
};

export const getAllManagers = async () => {
  return await User.find({ role: ROLES.MANAGER, isActive: true })
    .select('name email department employeeId')
    .sort({ name: 1 });
};

export const getManagerTeam = async (managerId) => {
  return await User.find({ managerId, isActive: true })
    .select('name email department employeeId role createdAt')
    .sort({ name: 1 });
};

