import Notification from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';

export const createNotification = async ({
  recipientId,
  requestId = null,
  title,
  message,
  type = 'general',
}) => {
  try {
    return await Notification.create({
      recipientId,
      requestId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.error('[Notification Service] Failed to create notification:', err.message);
    return null;
  }
};

export const getUserNotifications = async (userId, query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 15, 1), 50);
  const skip = (page - 1) * limit;

  const filter = { recipientId: userId };
  if (query.unreadOnly === 'true') {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('requestId', 'title category status priority'),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientId: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipientId: userId, isRead: false });
};

export const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found or unauthorized');
  }

  return notification;
};

export const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { modifiedCount: result.modifiedCount };
};
