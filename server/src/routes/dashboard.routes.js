import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorizeRoles(ROLES.ADMIN), dashboardController.getAdminDashboard);
router.get('/manager', authorizeRoles(ROLES.MANAGER), dashboardController.getManagerDashboard);
router.get('/employee', authorizeRoles(ROLES.EMPLOYEE), dashboardController.getEmployeeDashboard);

export default router;
