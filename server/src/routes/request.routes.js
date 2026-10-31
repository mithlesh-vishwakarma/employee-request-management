import express from 'express';
import * as requestController from '../controllers/request.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/role.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
} from '../validators/request.validator.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

// Submit Request (Employee)
router.post(
  '/',
  authorizeRoles(ROLES.EMPLOYEE),
  validateRequest(createRequestSchema),
  requestController.createRequest
);

// All Requests (Admin)
router.get('/', authorizeRoles(ROLES.ADMIN), requestController.getAllRequests);

// My Requests (Employee)
router.get('/my-requests', authorizeRoles(ROLES.EMPLOYEE), requestController.getMyRequests);

// Team Requests (Manager)
router.get('/team-requests', authorizeRoles(ROLES.MANAGER), requestController.getTeamRequests);

// Single Request Details
router.get('/:id', requestController.getRequestById);

// Review Workflows (Assigned Manager)
router.patch(
  '/:id/approve',
  authorizeRoles(ROLES.MANAGER),
  validateRequest(approveRequestSchema),
  requestController.approveRequest
);

router.patch(
  '/:id/reject',
  authorizeRoles(ROLES.MANAGER),
  validateRequest(rejectRequestSchema),
  requestController.rejectRequest
);

// Comments
router.post(
  '/:id/comments',
  validateRequest(addCommentSchema),
  requestController.addComment
);
router.get('/:id/comments', requestController.getComments);

export default router;
