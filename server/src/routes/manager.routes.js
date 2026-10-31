import express from 'express';
import * as managerController from '../controllers/manager.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { validateRequest } from '../middlewares/validate.js';
import { assignManagerSchema } from '../validators/employee.validator.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorizeRoles(ROLES.ADMIN), managerController.getManagers);
router.get('/:id/team', managerController.getManagerTeam);
router.patch(
  '/:id/manager',
  authorizeRoles(ROLES.ADMIN),
  validateRequest(assignManagerSchema),
  managerController.assignManager
);

export default router;

