const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  // Multer error handling (file size limit, etc.)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File size exceeds maximum allowed limit of 2MB');
    }
    return sendError(res, 400, `File upload error: ${err.message}`);
  }

  // Custom status code from errors
  if (err.status) {
    return sendError(res, err.status, err.message, err.errors || null);
  }

  // Zod validation error fallback
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return sendError(res, 422, 'Validation failed', formattedErrors);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendError(res, 409, `A unique constraint failed on field${target}`);
  }

  if (err.code === 'P2025') {
    return sendError(res, 404, 'Record not found');
  }

  // Generic 500 fallback
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return sendError(res, 500, message);
};

module.exports = errorHandler;
