const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET || 'prachay_jwt_secret_super_secure_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      secret,
      { expiresIn }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeCode: user.employeeCode,
      department: user.department,
      signaturePath: user.signaturePath
    };

    return { token, user: safeUser };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeCode: user.employeeCode,
      department: user.department,
      signaturePath: user.signaturePath
    };
  }

  async updateSignature(userId, signaturePath) {
    const updated = await userRepository.updateSignature(userId, signaturePath);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      signaturePath: updated.signaturePath
    };
  }
}

module.exports = new AuthService();
