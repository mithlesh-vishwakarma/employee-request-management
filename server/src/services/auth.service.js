import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from './activityLog.service.js';

export const loginUser = async (email, password) => {
  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact your system administrator.');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Populate manager name if employee
  let populatedUser = user;
  if (user.managerId) {
    populatedUser = await User.findById(user._id).populate('managerId', 'name email department');
  }

  return populatedUser;
};

export const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId).populate('managerId', 'name email department employeeId');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }
  return user;
};
