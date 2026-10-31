import express from 'express';
import * as activityLogController from '../controllers/activityLog.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  activityLogController.getActivityLogs
);

export default router;
