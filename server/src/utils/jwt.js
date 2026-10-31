import jwt from 'jsonwebtoken';

export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  const userSafe = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    managerId: user.managerId,
    isActive: user.isActive,
  };

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userSafe,
  });
};

