const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'prachay_jwt_secret_super_secure_key_2026';

    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeCode: true,
        department: true,
        signaturePath: true
      }
    });

    if (!user) {
      return sendError(res, 401, 'User account not found or has been removed');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired, please log in again');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

module.exports = authenticate;
