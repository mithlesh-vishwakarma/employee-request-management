import * as authService from '../services/auth.service.js';
import { sendTokenResponse } from '../utils/jwt.js';
import { successResponse } from '../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    return sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    });

    return successResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUserProfile(req.user._id);
    return successResponse(res, 200, 'Profile retrieved successfully', user);
  } catch (err) {
    next(err);
  }
};

