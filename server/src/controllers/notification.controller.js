import * as notificationService from '../services/notification.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user._id, req.query);
    return successResponse(
      res,
      200,
      'Notifications retrieved successfully',
      result.notifications,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    return successResponse(res, 200, 'Unread notification count', { unreadCount: count });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationRead(req.params.id, req.user._id);
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsRead(req.user._id);
    return successResponse(res, 200, 'All notifications marked as read', result);
  } catch (err) {
    next(err);
  }
};
