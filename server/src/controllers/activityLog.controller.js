import * as activityLogService from '../services/activityLog.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const result = await activityLogService.getActivityLogs(req.query);
    return successResponse(
      res,
      200,
      'Activity logs retrieved successfully',
      result.logs,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

