const prisma = require('../config/prisma');
const { ROLES, VOUCHER_STATUS } = require('../config/constants');

class DashboardService {
  async getDashboardStats(user) {
    if (user.role === ROLES.EMPLOYEE) {
      return this.getEmployeeStats(user);
    } else if (user.role === ROLES.DIRECTOR) {
      return this.getDirectorStats(user);
    } else if (user.role === ROLES.ACCOUNTS) {
      return this.getAccountsStats(user);
    }

    throw new Error('Invalid user role');
  }

  async getEmployeeStats(user) {
    const [total, draft, pending, approved, rejected, amountAgg, recent] = await Promise.all([
      prisma.voucher.count({ where: { employeeId: user.id } }),
      prisma.voucher.count({ where: { employeeId: user.id, status: VOUCHER_STATUS.DRAFT } }),
      prisma.voucher.count({ where: { employeeId: user.id, status: VOUCHER_STATUS.PENDING_APPROVAL } }),
      prisma.voucher.count({ where: { employeeId: user.id, status: VOUCHER_STATUS.APPROVED } }),
      prisma.voucher.count({ where: { employeeId: user.id, status: VOUCHER_STATUS.REJECTED } }),
      prisma.voucher.aggregate({
        where: { employeeId: user.id },
        _sum: { amount: true }
      }),
      prisma.voucher.findMany({
        where: { employeeId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      role: ROLES.EMPLOYEE,
      stats: {
        totalVouchers: total,
        draftVouchers: draft,
        pendingApproval: pending,
        approvedVouchers: approved,
        rejectedVouchers: rejected,
        totalAmountClaimed: amountAgg._sum.amount || 0
      },
      recentVouchers: recent
    };
  }

  async getDirectorStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pendingCount, approvedToday, rejectedToday, pendingAmountAgg, totalVouchers, recent] =
      await Promise.all([
        prisma.voucher.count({ where: { status: VOUCHER_STATUS.PENDING_APPROVAL } }),
        prisma.voucher.count({
          where: {
            status: VOUCHER_STATUS.APPROVED,
            approvalDate: { gte: todayStart }
          }
        }),
        prisma.voucher.count({
          where: {
            status: VOUCHER_STATUS.REJECTED,
            updatedAt: { gte: todayStart }
          }
        }),
        prisma.voucher.aggregate({
          where: { status: VOUCHER_STATUS.PENDING_APPROVAL },
          _sum: { amount: true }
        }),
        prisma.voucher.count(),
        prisma.voucher.findMany({
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            employee: { select: { id: true, name: true, department: true } }
          }
        })
      ]);

    return {
      role: ROLES.DIRECTOR,
      stats: {
        pendingApprovalCount: pendingCount,
        approvedToday,
        rejectedToday,
        totalPendingAmount: pendingAmountAgg._sum.amount || 0,
        totalVouchers
      },
      recentActivity: recent
    };
  }

  async getAccountsStats() {
    const [total, pending, approved, rejected, approvedAmountAgg, recentApproved] =
      await Promise.all([
        prisma.voucher.count(),
        prisma.voucher.count({ where: { status: VOUCHER_STATUS.PENDING_APPROVAL } }),
        prisma.voucher.count({ where: { status: VOUCHER_STATUS.APPROVED } }),
        prisma.voucher.count({ where: { status: VOUCHER_STATUS.REJECTED } }),
        prisma.voucher.aggregate({
          where: { status: VOUCHER_STATUS.APPROVED },
          _sum: { amount: true }
        }),
        prisma.voucher.findMany({
          where: { status: VOUCHER_STATUS.APPROVED },
          take: 5,
          orderBy: { approvalDate: 'desc' },
          include: {
            employee: { select: { id: true, name: true, department: true } }
          }
        })
      ]);

    return {
      role: ROLES.ACCOUNTS,
      stats: {
        totalVouchers: total,
        pendingApproval: pending,
        approvedVouchers: approved,
        rejectedVouchers: rejected,
        totalApprovedAmount: approvedAmountAgg._sum.amount || 0
      },
      recentApprovedVouchers: recentApproved
    };
  }
}

module.exports = new DashboardService();
