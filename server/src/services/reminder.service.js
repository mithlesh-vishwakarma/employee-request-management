import Request from '../models/Request.js';
import ReminderLog from '../models/ReminderLog.js';
import User from '../models/User.js';
import { REQUEST_STATUS, NOTIFICATION_TYPES, ACTIVITY_ACTIONS } from '../constants/index.js';
import { createNotification } from './notification.service.js';
import { logActivity } from './activityLog.service.js';

export const processPendingRequestReminders = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  console.log(`[Reminder Job] Checking for pending requests submitted prior to ${cutoff.toISOString()}...`);

  const overdueRequests = await Request.find({
    status: REQUEST_STATUS.PENDING,
    submittedAt: { $lte: cutoff },
  })
    .populate('employeeId', 'name email department')
    .populate('managerId', 'name email department isActive');

  const stats = {
    totalChecked: overdueRequests.length,
    remindersSent: 0,
    skippedAlreadySent: 0,
    skippedInvalidManager: 0,
    errors: 0,
  };

  for (const req of overdueRequests) {
    try {
      // Skip if manager is missing or inactive
      if (!req.managerId || !req.managerId.isActive) {
        stats.skippedInvalidManager++;
        continue;
      }

      // One reminder window per calendar day (UTC) or request-level window
      const reminderWindow = new Date().toISOString().split('T')[0];

      // Atomic insert protected by compound unique index:
      // { requestId: 1, reminderType: 1, reminderWindow: 1 }
      try {
        await ReminderLog.create({
          requestId: req._id,
          recipientId: req.managerId._id,
          reminderType: 'pending_24h',
          reminderWindow,
          sentAt: new Date(),
        });
      } catch (uniqueErr) {
        // If duplicate key error (code 11000), reminder was already dispatched
        if (uniqueErr.code === 11000) {
          stats.skippedAlreadySent++;
          continue;
        }
        throw uniqueErr;
      }

      // If we successfully claimed the lock/record, dispatch notification
      await createNotification({
        recipientId: req.managerId._id,
        requestId: req._id,
        title: 'Action Needed: Request Pending >24h',
        message: `Automated Reminder: Request "${req.title}" submitted by ${req.employeeId.name} has been pending your review for over 24 hours.`,
        type: NOTIFICATION_TYPES.REQUEST_REMINDER,
      });

      // Record Activity Log
      await logActivity({
        actorId: null,
        action: ACTIVITY_ACTIONS.REMINDER_SENT,
        entityType: 'Request',
        entityId: req._id,
        description: `Automated 24h overdue reminder dispatched to manager ${req.managerId.name} for request "${req.title}".`,
        metadata: {
          submittedAt: req.submittedAt,
          managerId: req.managerId._id,
          employeeId: req.employeeId._id,
        },
      });

      stats.remindersSent++;
    } catch (err) {
      console.error(`[Reminder Job] Error processing request #${req._id}:`, err.message);
      stats.errors++;
    }
  }

  console.log('[Reminder Job] Execution finished:', stats);
  return stats;
};
