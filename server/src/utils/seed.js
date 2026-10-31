import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore
}

import User from '../models/User.js';
import Request from '../models/Request.js';
import RequestComment from '../models/RequestComment.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import ReminderLog from '../models/ReminderLog.js';
import { ROLES, REQUEST_STATUS, REQUEST_PRIORITY, NOTIFICATION_TYPES, ACTIVITY_ACTIONS } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Request.deleteMany({}),
    RequestComment.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    ReminderLog.deleteMany({}),
  ]);

  // 1. Create Admin
  const admin = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'admin@enterprise.com',
    password: 'Password123!',
    role: ROLES.ADMIN,
    employeeId: 'ADM-001',
    department: 'Human Resources',
    isActive: true,
  });

  // 2. Create Managers
  const manager1 = await User.create({
    name: 'David Vance (Manager)',
    email: 'manager@enterprise.com',
    password: 'Password123!',
    role: ROLES.MANAGER,
    employeeId: 'MGR-101',
    department: 'Engineering',
    isActive: true,
  });

  const manager2 = await User.create({
    name: 'Elena Rostova (Manager)',
    email: 'elena.mgr@enterprise.com',
    password: 'Password123!',
    role: ROLES.MANAGER,
    employeeId: 'MGR-102',
    department: 'Product Design',
    isActive: true,
  });

  // 3. Create Employees
  const employee1 = await User.create({
    name: 'Alex Johnson (Employee)',
    email: 'employee@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-501',
    department: 'Engineering',
    managerId: manager1._id,
    isActive: true,
  });

  const employee2 = await User.create({
    name: 'Marcus Chen',
    email: 'marcus@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-502',
    department: 'Engineering',
    managerId: manager1._id,
    isActive: true,
  });

  const employee3 = await User.create({
    name: 'Chloe Bennett',
    email: 'chloe@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-503',
    department: 'Product Design',
    managerId: manager2._id,
    isActive: true,
  });

  const employee4 = await User.create({
    name: 'Daniel Kim',
    email: 'daniel@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-504',
    department: 'Engineering',
    managerId: manager1._id,
    isActive: true,
  });

  const employee5 = await User.create({
    name: 'Sophia Patel',
    email: 'sophia@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-505',
    department: 'Product Design',
    managerId: manager2._id,
    isActive: true,
  });

  const employee6 = await User.create({
    name: 'Liam Garcia',
    email: 'liam@enterprise.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP-506',
    department: 'Marketing',
    managerId: manager2._id,
    isActive: true,
  });

  console.log('[Seed] Created 1 Admin, 2 Managers, and 6 Employees.');

  // 4. Create Requests
  // 4.1 Pending request submitted 36 hours ago (>24h overdue for reminder demonstration!)
  const overdueSubmittedAt = new Date(Date.now() - 36 * 60 * 60 * 1000);
  const req1 = await Request.create({
    title: 'Annual Family Vacation Leave',
    description: 'Requesting 5 days paid time off for annual family trip. Handover doc shared with Marcus.',
    category: 'Leave',
    priority: REQUEST_PRIORITY.HIGH,
    employeeId: employee1._id,
    managerId: manager1._id,
    status: REQUEST_STATUS.PENDING,
    submittedAt: overdueSubmittedAt,
    startDate: new Date('2026-11-10'),
    endDate: new Date('2026-11-15'),
  });

  // 4.2 Recent pending request (6 hours ago)
  const req2 = await Request.create({
    title: 'Ergonomic Standing Desk Setup',
    description: 'Motorized standing desk and lumbar support chair for home workspace.',
    category: 'Equipment',
    priority: REQUEST_PRIORITY.MEDIUM,
    employeeId: employee2._id,
    managerId: manager1._id,
    status: REQUEST_STATUS.PENDING,
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  });

  // 4.3 Approved Request
  const req3 = await Request.create({
    title: 'AWS Certified Solutions Architect Exam Fee',
    description: 'Reimbursement for certification examination successfully passed last week ($150 USD).',
    category: 'Expense Reimbursement',
    priority: REQUEST_PRIORITY.LOW,
    employeeId: employee1._id,
    managerId: manager1._id,
    status: REQUEST_STATUS.APPROVED,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    reviewedBy: manager1._id,
    reviewComment: 'Approved. Great initiative pursuing professional cloud certifications!',
  });

  // 4.4 Rejected Request
  const req4 = await Request.create({
    title: 'MacBook Pro M3 Max Upgrade',
    description: 'Requesting device upgrade to 64GB RAM for UI 3D rendering workloads.',
    category: 'Equipment',
    priority: REQUEST_PRIORITY.HIGH,
    employeeId: employee3._id,
    managerId: manager2._id,
    status: REQUEST_STATUS.REJECTED,
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reviewedBy: manager2._id,
    reviewComment: 'Current device is within the 2-year refresh window. Please request cloud rendering credits instead.',
  });

  // 4.5 Approved WFH request
  const req5 = await Request.create({
    title: 'Work From Home - Hybrid Sprint',
    description: 'Two days remote work per week (Tuesdays & Thursdays) to focus on architecture sprint.',
    category: 'Work From Home',
    priority: REQUEST_PRIORITY.LOW,
    employeeId: employee1._id,
    managerId: manager1._id,
    status: REQUEST_STATUS.APPROVED,
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    reviewedBy: manager1._id,
    reviewComment: 'Approved as per team policy.',
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-12-31'),
  });

  console.log('[Seed] Created sample requests across all statuses.');

  // 5. Create Comments
  await RequestComment.create({
    requestId: req1._id,
    authorId: employee1._id,
    message: 'Marcus will be primary on-call while I am on leave.',
  });

  // 6. Create Notifications
  await Notification.create([
    {
      recipientId: manager1._id,
      requestId: req1._id,
      title: 'Action Needed: Request Pending >24h',
      message: `Automated Reminder: Request "${req1.title}" submitted by Alex Johnson has been awaiting review for over 24 hours.`,
      type: NOTIFICATION_TYPES.REQUEST_REMINDER,
      isRead: false,
    },
    {
      recipientId: manager1._id,
      requestId: req2._id,
      title: 'New Request Received',
      message: `Marcus Chen submitted an Equipment request: "${req2.title}".`,
      type: NOTIFICATION_TYPES.NEW_REQUEST,
      isRead: false,
    },
    {
      recipientId: employee1._id,
      requestId: req3._id,
      title: 'Request Approved',
      message: `Your Expense Reimbursement request was approved by David Vance.`,
      type: NOTIFICATION_TYPES.REQUEST_APPROVED,
      isRead: true,
      readAt: new Date(),
    },
  ]);

  // 7. Create Activity Logs
  await ActivityLog.create([
    {
      actorId: admin._id,
      action: ACTIVITY_ACTIONS.EMPLOYEE_CREATED,
      entityType: 'User',
      entityId: employee1._id,
      description: 'Admin created initial employee profile for Alex Johnson.',
    },
    {
      actorId: admin._id,
      action: ACTIVITY_ACTIONS.MANAGER_ASSIGNED,
      entityType: 'User',
      entityId: employee1._id,
      description: 'Assigned David Vance as direct manager to Alex Johnson.',
    },
    {
      actorId: employee1._id,
      action: ACTIVITY_ACTIONS.REQUEST_SUBMITTED,
      entityType: 'Request',
      entityId: req1._id,
      description: 'Submitted 5-day annual family vacation leave request.',
    },
    {
      actorId: manager1._id,
      action: ACTIVITY_ACTIONS.REQUEST_APPROVED,
      entityType: 'Request',
      entityId: req3._id,
      description: 'Approved certification expense reimbursement for Alex Johnson ($150).',
    },
    {
      actorId: manager2._id,
      action: ACTIVITY_ACTIONS.REQUEST_REJECTED,
      entityType: 'Request',
      entityId: req4._id,
      description: 'Rejected hardware refresh request for Chloe Bennett with comment.',
    },
  ]);

  console.log('[Seed] Database successfully seeded with demo records.');
};

// Standalone runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_request_management';
  mongoose
    .connect(uri)
    .then(async () => {
      await seedDatabase();
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Standalone execution error:', err);
      process.exit(1);
    });
}

