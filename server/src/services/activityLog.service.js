import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({
  actorId = null,
  action,
  entityType,
  entityId = null,
  description,
  metadata = {},
}) => {
  try {
    return await ActivityLog.create({
      actorId,
      action,
      entityType,
      entityId,
      description,
      metadata,
    });
  } catch (err) {
    console.error('[ActivityLog Service] Failed to record activity:', err.message);
    return null;
  }
};

export const getActivityLogs = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.action && query.action !== 'all') {
    filter.action = query.action;
  }
  if (query.actorId) {
    filter.actorId = query.actorId;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { description: searchRegex },
      { action: searchRegex },
    ];
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actorId', 'name email role employeeId'),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

