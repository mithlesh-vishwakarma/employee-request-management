import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import User from '../src/models/User.js';
import Request from '../src/models/Request.js';
import ReminderLog from '../src/models/ReminderLog.js';
import { ROLES, REQUEST_STATUS } from '../src/constants/index.js';
import { seedDatabase } from '../src/utils/seed.js';
import { processPendingRequestReminders } from '../src/services/reminder.service.js';

let mongoServer;
let adminToken = '';
let managerToken = '';
let employeeToken = '';
let testRequestId = '';

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed sample data
  await seedDatabase();

  // Log in as Admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@enterprise.com', password: 'Password123!' });
  adminToken = adminRes.body.token;

  // Log in as Manager
  const mgrRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'manager@enterprise.com', password: 'Password123!' });
  managerToken = mgrRes.body.token;

  // Log in as Employee
  const empRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employee@enterprise.com', password: 'Password123!' });
  employeeToken = empRes.body.token;
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/v1/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('healthy');
  });
});

describe('2. Authentication & Authorization', () => {
  it('POST /api/v1/auth/login fails with invalid password (401)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@enterprise.com', password: 'WrongPassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/employees blocks unauthenticated access (401)', async () => {
    const res = await request(app).get('/api/v1/employees');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/employees blocks Employee from accessing Admin endpoints (403)', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/employees allows Admin access (200)', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('3. Employee Request Workflow', () => {
  it('POST /api/v1/requests creates request auto-assigned to employee manager', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'New Mechanical Keyboard',
        description: 'Need ergonomic keyboard for development workstation.',
        category: 'Equipment',
        priority: 'medium',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.managerId).toBeDefined();

    testRequestId = res.body.data._id;
  });

  it('PATCH /api/v1/requests/:id/reject fails if comment is empty (400)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${testRequestId}/reject`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ comment: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/requests/:id/approve allows manager to approve request', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${testRequestId}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ comment: 'Approved. Forwarded to IT department.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });

  it('PATCH /api/v1/requests/:id/approve prevents duplicate review on already-reviewed request (409)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${testRequestId}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ comment: 'Second review attempt' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('4. 24-Hour Reminder Background Scheduler', () => {
  it('processPendingRequestReminders sends reminder for >24h overdue requests and prevents duplicates', async () => {
    // Run reminder processor first time
    const statsFirstRun = await processPendingRequestReminders();
    expect(statsFirstRun.totalChecked).toBeGreaterThan(0);
    expect(statsFirstRun.remindersSent).toBeGreaterThan(0);

    // Run reminder processor second time immediately (should skip due to unique index)
    const statsSecondRun = await processPendingRequestReminders();
    expect(statsSecondRun.remindersSent).toBe(0);
    expect(statsSecondRun.skippedAlreadySent).toBeGreaterThan(0);
  });
});
