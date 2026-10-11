const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats(req.user);
      return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
