import express from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { validateRequest } from '../middlewares/validate.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

// Profile
router.get('/me', (req, res) => {
  res.redirect('/api/v1/auth/me');
});

// Admin-only endpoints
router.get('/', authorizeRoles(ROLES.ADMIN), employeeController.getEmployees);
router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validateRequest(createEmployeeSchema),
  employeeController.createEmployee
);
router.get('/:id', employeeController.getEmployee);
router.patch(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validateRequest(updateEmployeeSchema),
  employeeController.updateEmployee
);
router.patch('/:id/status', authorizeRoles(ROLES.ADMIN), employeeController.toggleStatus);

export default router;

