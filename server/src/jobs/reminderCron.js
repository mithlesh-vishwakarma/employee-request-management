import cron from 'node-cron';
import { processPendingRequestReminders } from '../services/reminder.service.js';

let cronTask = null;

export const startReminderJob = () => {
  const cronExpression = process.env.REMINDER_CRON || '*/15 * * * *';

  console.log(`[Cron Scheduler] Initializing 24h reminder job with schedule: "${cronExpression}"`);

  cronTask = cron.schedule(cronExpression, async () => {
    try {
      console.log(`[Cron Scheduler] Firing scheduled 24-hour reminder check at ${new Date().toISOString()}...`);
      await processPendingRequestReminders();
    } catch (err) {
      console.error('[Cron Scheduler] Error executing reminder job:', err.message);
    }
  });

  return cronTask;
};

export const stopReminderJob = () => {
  if (cronTask) {
    cronTask.stop();
    console.log('[Cron Scheduler] Reminder job stopped');
  }
};

