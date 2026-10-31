import express from 'express';
import * as jobController from '../controllers/job.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

// Testing and manual invocation endpoint for background reminders
router.post(
  '/trigger-reminders',
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  jobController.triggerReminders
);

export default router;

