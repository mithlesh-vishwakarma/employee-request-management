import { ApiError } from '../utils/apiError.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with sanitized/parsed values
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        }));
        return next(new ApiError(400, 'Input validation failed', errorMessages));
      }
      next(err);
    }
  };
};

