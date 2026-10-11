const { sendError } = require('../utils/response');

/**
 * Zod validation middleware for req.body or req.query
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return sendError(res, 422, 'Validation failed', formattedErrors);
    }
    req.body = result.data;
    next();
  };
};

module.exports = {
  validateBody
};
