import * as dashboardService from '../services/dashboard.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();
    return successResponse(res, 200, 'Admin dashboard statistics', stats);
  } catch (err) {
    next(err);
  }
};

export const getManagerDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getManagerDashboardStats(req.user._id);
    return successResponse(res, 200, 'Manager dashboard statistics', stats);
  } catch (err) {
    next(err);
  }
};

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getEmployeeDashboardStats(req.user._id);
    return successResponse(res, 200, 'Employee dashboard statistics', stats);
  } catch (err) {
    next(err);
  }
};

