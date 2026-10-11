const prisma = require('../config/prisma');

class StatusHistoryRepository {
  async create(data, tx = prisma) {
    return tx.voucherStatusHistory.create({
      data
    });
  }

  async findByVoucherId(voucherId) {
    return prisma.voucherStatusHistory.findMany({
      where: { voucherId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}

module.exports = new StatusHistoryRepository();
