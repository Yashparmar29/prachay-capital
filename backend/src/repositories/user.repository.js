const prisma = require('../config/prisma');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async updateSignature(id, signaturePath) {
    return prisma.user.update({
      where: { id },
      data: { signaturePath }
    });
  }
}

module.exports = new UserRepository();
