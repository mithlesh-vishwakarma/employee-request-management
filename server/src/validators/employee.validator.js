import { z } from 'zod';
import { ROLES } from '../constants/index.js';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim(),
    email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Password123!'),
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE], {
      errorMap: () => ({ message: 'Role must be admin, manager, or employee' }),
    }),
    department: z.string().min(2, 'Department is required').trim(),
    employeeId: z.string().trim().optional(),
    managerId: z.string().trim().nullable().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    email: z.string().email().trim().toLowerCase().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]).optional(),
    department: z.string().min(2).trim().optional(),
    managerId: z.string().trim().nullable().optional(),
  }),
});

export const assignManagerSchema = z.object({
  body: z.object({
    managerId: z.string().min(1, 'Manager ID is required').trim(),
  }),
});

