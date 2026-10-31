import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an instance of ApiError, convert standard or Mongoose errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    let message = error.message || 'Internal Server Error';
    let errors = error.errors || [];

    // Mongoose bad ObjectId / CastError
    if (error.name === 'CastError') {
      message = `Invalid format for resource ID: ${error.value}`;
      error = new ApiError(400, message);
    }
    // Mongoose duplicate key error (code 11000)
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `Duplicate value entered for ${field}. A record with this ${field} already exists.`;
      error = new ApiError(409, message);
    }
    // Mongoose validation error
    else if (error.name === 'ValidationError') {
      const extractedErrors = Object.values(error.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      message = 'Validation error on database operation';
      error = new ApiError(400, message, extractedErrors);
    } else {
      error = new ApiError(statusCode, message, errors, err.stack);
    }
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return res.status(error.statusCode || 500).json(response);
};

