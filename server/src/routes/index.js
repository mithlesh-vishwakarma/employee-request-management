import express from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import managerRoutes from './manager.routes.js';
import requestRoutes from './request.routes.js';
import notificationRoutes from './notification.routes.js';
import activityLogRoutes from './activityLog.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import jobRoutes from './job.routes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Employee Request Management API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Resource Routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/managers', managerRoutes);
router.use('/requests', requestRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/jobs', jobRoutes);

export default router;

