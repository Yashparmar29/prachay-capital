const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    // JWT is stateless; client removes token. Endpoint provides explicit confirmation.
    return sendSuccess(res, 'Logout successful');
  }
}

module.exports = new AuthController();
