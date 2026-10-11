/**
 * Standardized JSON response helper
 * Format: { success: boolean, message: string, data: any, errors: any }
 */
const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors
  });
};

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, null);
};

const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendResponse(res, 201, true, message, data, null);
};

const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  return sendResponse(res, statusCode, false, message, null, errors);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError
};
