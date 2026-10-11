const prisma = require('../config/prisma');

class VoucherRepository {
  async create(data, tx = prisma) {
    return tx.voucher.create({
      data,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true, department: true }
        }
      }
    });
  }

  async findById(id) {
    return prisma.voucher.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true, department: true }
        },
        director: {
          select: { id: true, name: true, email: true }
        },
        statusHistory: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async findMany({ where = {}, skip = 0, take = 10, orderBy = { createdAt: 'desc' } }) {
    const [total, vouchers] = await prisma.$transaction([
      prisma.voucher.count({ where }),
      prisma.voucher.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          employee: {
            select: { id: true, name: true, email: true, employeeCode: true, department: true }
          },
          director: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    return { total, vouchers };
  }

  async update(id, data, tx = prisma) {
    return tx.voucher.update({
      where: { id },
      data,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true, department: true }
        },
        director: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async delete(id, tx = prisma) {
    return tx.voucher.delete({
      where: { id }
    });
  }

  async count(where = {}) {
    return prisma.voucher.count({ where });
  }

  async aggregateSum(where = {}) {
    return prisma.voucher.aggregate({
      where,
      _sum: {
        amount: true
      }
    });
  }
}

module.exports = new VoucherRepository();
