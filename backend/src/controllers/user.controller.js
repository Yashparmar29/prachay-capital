const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async uploadSignature(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'Signature image file is required');
      }

      // Store relative path to served uploads directory
      const signaturePath = `/uploads/${req.file.filename}`;
      const updated = await authService.updateSignature(req.user.id, signaturePath);

      return sendSuccess(res, 'Signature uploaded successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
