import mongoose from 'mongoose';

const reminderLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: [true, 'Request ID is required'],
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    reminderType: {
      type: String,
      required: [true, 'Reminder type is required'],
      default: 'pending_24h',
      trim: true,
    },
    reminderWindow: {
      type: String,
      required: [true, 'Reminder window is required'],
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound Unique Index: strictly prevents duplicate reminders
reminderLogSchema.index(
  { requestId: 1, reminderType: 1, reminderWindow: 1 },
  { unique: true }
);

export const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);
export default ReminderLog;
