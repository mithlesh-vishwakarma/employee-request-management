import { z } from 'zod';
import { REQUEST_CATEGORIES, REQUEST_PRIORITY } from '../constants/index.js';

export const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150).trim(),
    description: z.string().min(10, 'Description must be at least 10 characters').trim(),
    category: z.enum(REQUEST_CATEGORIES, {
      errorMap: () => ({ message: `Category must be one of: ${REQUEST_CATEGORIES.join(', ')}` }),
    }),
    priority: z.enum([REQUEST_PRIORITY.LOW, REQUEST_PRIORITY.MEDIUM, REQUEST_PRIORITY.HIGH]).optional().default(REQUEST_PRIORITY.MEDIUM),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
  }),
});

export const approveRequestSchema = z.object({
  body: z.object({
    comment: z.string().trim().optional().default(''),
  }),
});

export const rejectRequestSchema = z.object({
  body: z.object({
    comment: z.string().min(3, 'Rejection reason is mandatory and must be at least 3 characters').trim(),
  }),
});

export const addCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment message cannot be empty').trim(),
  }),
});

