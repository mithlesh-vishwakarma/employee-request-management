import { ApiError } from '../utils/apiError.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: '${req.user.role}' role does not have permission to access this endpoint.`
        )
      );
    }

    next();
  };
};

