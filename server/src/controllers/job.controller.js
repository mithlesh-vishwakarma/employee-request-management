import { processPendingRequestReminders } from '../services/reminder.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const triggerReminders = async (req, res, next) => {
  try {
    const stats = await processPendingRequestReminders();
    return successResponse(res, 200, 'Reminder job executed successfully', stats);
  } catch (err) {
    next(err);
  }
};

