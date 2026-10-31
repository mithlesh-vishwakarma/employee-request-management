import mongoose from 'mongoose';
import { REQUEST_STATUS, REQUEST_PRIORITY, REQUEST_CATEGORIES } from '../constants/index.js';

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    category: {
      type: String,
      enum: {
        values: REQUEST_CATEGORIES,
        message: 'Invalid request category',
      },
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: Object.values(REQUEST_PRIORITY),
      default: REQUEST_PRIORITY.MEDIUM,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager ID is required'],
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewComment: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
requestSchema.index({ employeeId: 1, createdAt: -1 });
requestSchema.index({ managerId: 1, status: 1, submittedAt: -1 });
requestSchema.index({ status: 1, submittedAt: 1 });
requestSchema.index({ category: 1, status: 1 });

export const Request = mongoose.model('Request', requestSchema);
export default Request;