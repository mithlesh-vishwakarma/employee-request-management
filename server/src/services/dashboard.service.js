import User from '../models/User.js';
import Request from '../models/Request.js';
import ActivityLog from '../models/ActivityLog.js';
import { REQUEST_STATUS, ROLES } from '../constants/index.js';

export const getAdminDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalManagers,
    totalEmployees,
    requestCounts,
    categoryCounts,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: ROLES.MANAGER, isActive: true }),
    User.countDocuments({ role: ROLES.EMPLOYEE, isActive: true }),
    Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Request.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]),
    ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('actorId', 'name email role'),
  ]);

  const requestsByStatus = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  requestCounts.forEach((item) => {
    requestsByStatus[item._id] = item.count;
    requestsByStatus.total += item.count;
  });

  const categories = {};
  categoryCounts.forEach((item) => {
    categories[item._id] = item.count;
  });

  const reviewedTotal = requestsByStatus.approved + requestsByStatus.rejected;
  const approvalRate = reviewedTotal > 0 ? Math.round((requestsByStatus.approved / reviewedTotal) * 100) : 100;

  return {
    personnel: {
      total: totalUsers,
      active: activeUsers,
      managers: totalManagers,
      employees: totalEmployees,
    },
    requests: {
      ...requestsByStatus,
      approvalRate,
    },
    categories,
    recentActivities,
  };
};

export const getManagerDashboardStats = async (managerId) => {
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    teamMembersCount,
    requestCounts,
    overdueCount,
    pendingQueue,
  ] = await Promise.all([
    User.countDocuments({ managerId, isActive: true }),
    Request.aggregate([
      { $match: { managerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Request.countDocuments({
      managerId,
      status: REQUEST_STATUS.PENDING,
      submittedAt: { $lte: cutoff24h },
    }),
    Request.find({ managerId, status: REQUEST_STATUS.PENDING })
      .sort({ submittedAt: 1 })
      .limit(5)
      .populate('employeeId', 'name email department employeeId'),
  ]);

  const requestsByStatus = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  requestCounts.forEach((item) => {
    requestsByStatus[item._id] = item.count;
    requestsByStatus.total += item.count;
  });

  return {
    teamSize: teamMembersCount,
    requests: requestsByStatus,
    overdueCount,
    pendingQueue,
  };
};

export const getEmployeeDashboardStats = async (employeeId) => {
  const [employee, requestCounts, recentRequests] = await Promise.all([
    User.findById(employeeId).populate('managerId', 'name email department'),
    Request.aggregate([
      { $match: { employeeId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Request.find({ employeeId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('managerId', 'name email department'),
  ]);

  const requestsByStatus = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  requestCounts.forEach((item) => {
    requestsByStatus[item._id] = item.count;
    requestsByStatus.total += item.count;
  });

  return {
    assignedManager: employee?.managerId || null,
    requests: requestsByStatus,
    recentRequests,
  };
};

