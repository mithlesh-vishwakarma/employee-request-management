import Request from '../models/Request.js';
import RequestComment from '../models/RequestComment.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { REQUEST_STATUS, ROLES, NOTIFICATION_TYPES, ACTIVITY_ACTIONS } from '../constants/index.js';
import { createNotification } from './notification.service.js';
import { logActivity } from './activityLog.service.js';

export const createRequest = async (data, employee) => {
  if (!employee.managerId) {
    throw new ApiError(
      400,
      'You cannot submit a request without an assigned manager. Please contact your administrator.'
    );
  }

  const manager = await User.findById(employee.managerId);
  if (!manager || !manager.isActive) {
    throw new ApiError(
      400,
      'Your assigned manager is currently inactive or not found. Please contact your administrator.'
    );
  }

  const newRequest = await Request.create({
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority || 'medium',
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    employeeId: employee._id,
    managerId: manager._id,
    status: REQUEST_STATUS.PENDING,
    submittedAt: new Date(),
  });

  // Notify assigned Manager
  await createNotification({
    recipientId: manager._id,
    requestId: newRequest._id,
    title: 'New Team Request Received',
    message: `${employee.name} submitted a new ${newRequest.category} request: "${newRequest.title}".`,
    type: NOTIFICATION_TYPES.NEW_REQUEST,
  });

  // Record Activity Log
  await logActivity({
    actorId: employee._id,
    action: ACTIVITY_ACTIONS.REQUEST_SUBMITTED,
    entityType: 'Request',
    entityId: newRequest._id,
    description: `Submitted ${newRequest.category} request "${newRequest.title}".`,
    metadata: {
      category: newRequest.category,
      priority: newRequest.priority,
      managerId: manager._id,
    },
  });

  return await Request.findById(newRequest._id)
    .populate('employeeId', 'name email employeeId department')
    .populate('managerId', 'name email department');
};

export const getAllRequests = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }
  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority;
  }
  if (query.employeeId) {
    filter.employeeId = query.employeeId;
  }
  if (query.managerId) {
    filter.managerId = query.managerId;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('employeeId', 'name email employeeId department')
      .populate('managerId', 'name email department')
      .populate('reviewedBy', 'name email'),
    Request.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyRequests = async (employeeId, query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { employeeId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }
  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('managerId', 'name email department')
      .populate('reviewedBy', 'name email'),
    Request.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTeamRequests = async (managerId, query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { managerId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }
  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('employeeId', 'name email employeeId department')
      .populate('reviewedBy', 'name email'),
    Request.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRequestById = async (requestId, user) => {
  const request = await Request.findById(requestId)
    .populate('employeeId', 'name email employeeId department')
    .populate('managerId', 'name email department')
    .populate('reviewedBy', 'name email');

  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  // Authorization check (RBAC + Resource ownership)
  const isOwner = request.employeeId._id.toString() === user._id.toString();
  const isAssignedManager = request.managerId._id.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isOwner && !isAssignedManager && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to view this request');
  }

  // Fetch comments
  const comments = await RequestComment.find({ requestId: request._id })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name role email');

  return {
    ...request.toObject(),
    comments,
  };
};

export const approveRequest = async (requestId, manager, comment = '') => {
  const existing = await Request.findById(requestId);
  if (!existing) {
    throw new ApiError(404, 'Request not found');
  }

  // Enforce ownership: only the assigned manager can review
  if (existing.managerId.toString() !== manager._id.toString()) {
    throw new ApiError(403, 'You cannot review requests that are not assigned to your team');
  }

  // Prevent repeated reviews
  if (existing.status !== REQUEST_STATUS.PENDING) {
    throw new ApiError(409, `Request is already ${existing.status} and cannot be reviewed again`);
  }

  // Atomic update
  const updatedRequest = await Request.findOneAndUpdate(
    { _id: requestId, managerId: manager._id, status: REQUEST_STATUS.PENDING },
    {
      status: REQUEST_STATUS.APPROVED,
      reviewedAt: new Date(),
      reviewedBy: manager._id,
      reviewComment: comment ? comment.trim() : 'Approved by manager',
    },
    { new: true }
  )
    .populate('employeeId', 'name email')
    .populate('managerId', 'name email');

  if (!updatedRequest) {
    throw new ApiError(409, 'Concurrent modification detected or request already reviewed');
  }

  // Notify Employee
  await createNotification({
    recipientId: updatedRequest.employeeId._id,
    requestId: updatedRequest._id,
    title: 'Request Approved',
    message: `Your ${updatedRequest.category} request "${updatedRequest.title}" was approved by ${manager.name}.`,
    type: NOTIFICATION_TYPES.REQUEST_APPROVED,
  });

  // Log Activity
  await logActivity({
    actorId: manager._id,
    action: ACTIVITY_ACTIONS.REQUEST_APPROVED,
    entityType: 'Request',
    entityId: updatedRequest._id,
    description: `Approved request "${updatedRequest.title}" for employee ${updatedRequest.employeeId.name}.`,
    metadata: { reviewComment: updatedRequest.reviewComment },
  });

  return updatedRequest;
};

export const rejectRequest = async (requestId, manager, comment) => {
  if (!comment || comment.trim().length === 0) {
    throw new ApiError(400, 'A non-empty comment explaining the rejection is strictly required');
  }

  const existing = await Request.findById(requestId);
  if (!existing) {
    throw new ApiError(404, 'Request not found');
  }

  if (existing.managerId.toString() !== manager._id.toString()) {
    throw new ApiError(403, 'You cannot review requests that are not assigned to your team');
  }

  if (existing.status !== REQUEST_STATUS.PENDING) {
    throw new ApiError(409, `Request is already ${existing.status} and cannot be reviewed again`);
  }

  const updatedRequest = await Request.findOneAndUpdate(
    { _id: requestId, managerId: manager._id, status: REQUEST_STATUS.PENDING },
    {
      status: REQUEST_STATUS.REJECTED,
      reviewedAt: new Date(),
      reviewedBy: manager._id,
      reviewComment: comment.trim(),
    },
    { new: true }
  )
    .populate('employeeId', 'name email')
    .populate('managerId', 'name email');

  if (!updatedRequest) {
    throw new ApiError(409, 'Concurrent modification detected or request already reviewed');
  }

  // Notify Employee
  await createNotification({
    recipientId: updatedRequest.employeeId._id,
    requestId: updatedRequest._id,
    title: 'Request Rejected',
    message: `Your ${updatedRequest.category} request "${updatedRequest.title}" was rejected by ${manager.name}. Reason: ${comment.trim()}`,
    type: NOTIFICATION_TYPES.REQUEST_REJECTED,
  });

  // Log Activity
  await logActivity({
    actorId: manager._id,
    action: ACTIVITY_ACTIONS.REQUEST_REJECTED,
    entityType: 'Request',
    entityId: updatedRequest._id,
    description: `Rejected request "${updatedRequest.title}". Reason: ${comment.trim()}`,
    metadata: { reviewComment: comment.trim() },
  });

  return updatedRequest;
};

export const addRequestComment = async (requestId, user, message) => {
  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  // Access check
  const isOwner = request.employeeId.toString() === user._id.toString();
  const isAssignedManager = request.managerId.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isOwner && !isAssignedManager && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to comment on this request');
  }

  const comment = await RequestComment.create({
    requestId: request._id,
    authorId: user._id,
    message: message.trim(),
  });

  await logActivity({
    actorId: user._id,
    action: ACTIVITY_ACTIONS.COMMENT_ADDED,
    entityType: 'Request',
    entityId: request._id,
    description: `Added comment to request "${request.title}".`,
  });

  return await RequestComment.findById(comment._id).populate('authorId', 'name email role');
};

export const getRequestComments = async (requestId, user) => {
  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  return await RequestComment.find({ requestId: request._id })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name email role');
};
