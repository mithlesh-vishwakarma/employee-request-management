import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
      throw new ApiError(401, 'Invalid authentication token.');
    }

    // Verify user exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User account no longer exists.');
    }
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact your administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
