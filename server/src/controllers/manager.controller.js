import * as employeeService from '../services/employee.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/index.js';

export const getManagers = async (req, res, next) => {
  try {
    const managers = await employeeService.getAllManagers();
    return successResponse(res, 200, 'Managers list retrieved successfully', managers);
  } catch (err) {
    next(err);
  }
};

export const getManagerTeam = async (req, res, next) => {
  try {
    const targetManagerId = req.params.id;

    // Permissions: admin or the manager themselves
    if (req.user.role !== ROLES.ADMIN && req.user._id.toString() !== targetManagerId) {
      throw new ApiError(403, 'You do not have permission to view this team');
    }

    const team = await employeeService.getManagerTeam(targetManagerId);
    return successResponse(res, 200, 'Team members retrieved successfully', team);
  } catch (err) {
    next(err);
  }
};

export const assignManager = async (req, res, next) => {
  try {
    const { id } = req.params; // employeeId
    const { managerId } = req.body;

    const employee = await employeeService.assignManager(id, managerId, req.user);
    return successResponse(res, 200, 'Manager assigned successfully', employee);
  } catch (err) {
    next(err);
  }
};
