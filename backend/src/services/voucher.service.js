const prisma = require('../config/prisma');
const voucherRepository = require('../repositories/voucher.repository');
const statusHistoryRepository = require('../repositories/statusHistory.repository');
const { generateVoucherNumber } = require('../utils/voucherNumber');
const { ROLES, VOUCHER_STATUS } = require('../config/constants');

class VoucherService {
  /**
   * Create a new voucher in DRAFT status
   */
  async createVoucher(user, voucherData) {
    if (user.role !== ROLES.EMPLOYEE) {
      const error = new Error('Only employees can create expense vouchers');
      error.status = 403;
      throw error;
    }

    // Default to user profile signature if none provided explicitly
    const signaturePath = voucherData.employeeSignaturePath || user.signaturePath || null;

    const voucher = await prisma.$transaction(async (tx) => {
      const voucherNumber = await generateVoucherNumber(tx);

      const created = await tx.voucher.create({
        data: {
          voucherNumber,
          voucherDate: new Date(),
          expenseDate: new Date(voucherData.expenseDate),
          department: voucherData.department,
          expenseTitle: voucherData.expenseTitle,
          expenseCategory: voucherData.expenseCategory,
          expenseDescription: voucherData.expenseDescription || '',
          amount: parseFloat(voucherData.amount),
          employeeId: user.id,
          employeeName: user.name,
          employeeCode: user.employeeCode || null,
          employeeSignaturePath: signaturePath,
          status: VOUCHER_STATUS.DRAFT
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true, employeeCode: true, department: true }
          }
        }
      });

      await tx.voucherStatusHistory.create({
        data: {
          voucherId: created.id,
          fromStatus: 'NONE',
          toStatus: VOUCHER_STATUS.DRAFT,
          changedBy: user.id,
          remarks: 'Voucher created as Draft'
        }
      });

      return created;
    });

    return voucher;
  }

  /**
   * List vouchers with role scoping, filtering, sorting, and pagination
   */
  async listVouchers(user, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const where = {};

    // Role-based visibility enforcement
    if (user.role === ROLES.EMPLOYEE) {
      where.employeeId = user.id; // Employees can ONLY see their own vouchers
    }

    // Filter by specific status
    if (query.status && Object.values(VOUCHER_STATUS).includes(query.status)) {
      where.status = query.status;
    }

    // Filter by department
    if (query.department) {
      where.department = { contains: query.department };
    }

    // Filter by expense category
    if (query.category) {
      where.expenseCategory = query.category;
    }

    // Filter by specific voucher number
    if (query.voucherNumber) {
      where.voucherNumber = { contains: query.voucherNumber };
    }

    // Filter by employee name (for Director / Accounts)
    if (query.employeeName && user.role !== ROLES.EMPLOYEE) {
      where.employeeName = { contains: query.employeeName };
    }

    // Combined search query (voucher number, expense title, employee name)
    if (query.search) {
      const searchTerms = [
        { voucherNumber: { contains: query.search } },
        { expenseTitle: { contains: query.search } }
      ];

      if (user.role !== ROLES.EMPLOYEE) {
        searchTerms.push({ employeeName: { contains: query.search } });
      }

      where.OR = searchTerms;
    }

    // Date range filter
    if (query.dateFrom || query.dateTo) {
      where.expenseDate = {};
      if (query.dateFrom) {
        where.expenseDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.expenseDate.lte = toDate;
      }
    }

    // Amount range filter
    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      where.amount = {};
      if (query.minAmount !== undefined && query.minAmount !== '') {
        where.amount.gte = parseFloat(query.minAmount);
      }
      if (query.maxAmount !== undefined && query.maxAmount !== '') {
        where.amount.lte = parseFloat(query.maxAmount);
      }
    }

    // Sorting
    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = ['createdAt', 'expenseDate', 'amount', 'voucherNumber', 'status'];
    const orderBy = allowedSortFields.includes(sortField)
      ? { [sortField]: sortOrder }
      : { createdAt: 'desc' };

    const { total, vouchers } = await voucherRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy
    });

    return {
      vouchers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Pending approvals queue (Director only)
   */
  async getPendingApprovals(user, query = {}) {
    if (user.role !== ROLES.DIRECTOR) {
      const error = new Error('Only the Director can view pending approvals');
      error.status = 403;
      throw error;
    }

    return this.listVouchers(user, { ...query, status: VOUCHER_STATUS.PENDING_APPROVAL });
  }

  /**
   * Get single voucher with access control check (prevent IDOR)
   */
  async getVoucherById(user, voucherId) {
    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    // Security: employees can only view vouchers created by themselves
    if (user.role === ROLES.EMPLOYEE && voucher.employeeId !== user.id) {
      const error = new Error('Access denied: You can only view your own vouchers');
      error.status = 403;
      throw error;
    }

    return voucher;
  }

  /**
   * Edit voucher (EMPLOYEE, draft only, owner only)
   */
  async updateVoucher(user, voucherId, updateData) {
    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.employeeId !== user.id) {
      const error = new Error('Access denied: You can only edit your own vouchers');
      error.status = 403;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.DRAFT) {
      const error = new Error(
        `Cannot edit voucher in '${voucher.status}' status. Only DRAFT vouchers can be modified.`
      );
      error.status = 400;
      throw error;
    }

    const updated = await voucherRepository.update(voucherId, {
      department: updateData.department,
      expenseTitle: updateData.expenseTitle,
      expenseDate: new Date(updateData.expenseDate),
      expenseCategory: updateData.expenseCategory,
      expenseDescription: updateData.expenseDescription || '',
      amount: parseFloat(updateData.amount),
      employeeSignaturePath: updateData.employeeSignaturePath || voucher.employeeSignaturePath
    });

    return updated;
  }

  /**
   * Delete voucher (EMPLOYEE, draft only, owner only)
   */
  async deleteVoucher(user, voucherId) {
    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.employeeId !== user.id) {
      const error = new Error('Access denied: You can only delete your own vouchers');
      error.status = 403;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.DRAFT) {
      const error = new Error(
        `Cannot delete voucher in '${voucher.status}' status. Only DRAFT vouchers can be deleted.`
      );
      error.status = 400;
      throw error;
    }

    await voucherRepository.delete(voucherId);
    return { success: true, message: 'Draft voucher deleted successfully' };
  }

  /**
   * Upload / attach signature to draft voucher (EMPLOYEE only)
   */
  async attachSignature(user, voucherId, signaturePath) {
    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.employeeId !== user.id) {
      const error = new Error('Access denied: You can only attach signatures to your own vouchers');
      error.status = 403;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.DRAFT) {
      const error = new Error('Cannot update signature for a voucher that is not in DRAFT status');
      error.status = 400;
      throw error;
    }

    const updated = await voucherRepository.update(voucherId, {
      employeeSignaturePath: signaturePath
    });

    return updated;
  }

  /**
   * Submit voucher for approval (EMPLOYEE only)
   * Workflow transition: DRAFT -> SUBMITTED -> PENDING_APPROVAL
   */
  async submitVoucher(user, voucherId) {
    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.employeeId !== user.id) {
      const error = new Error('Access denied: You can only submit your own vouchers');
      error.status = 403;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.DRAFT) {
      const error = new Error(`Only DRAFT vouchers can be submitted. Current status: ${voucher.status}`);
      error.status = 400;
      throw error;
    }

    // Employee signature is mandatory before submission
    const finalSignature = voucher.employeeSignaturePath || user.signaturePath;
    if (!finalSignature) {
      const error = new Error(
        'Employee signature is mandatory before submission. Please upload your signature.'
      );
      error.status = 400;
      throw error;
    }

    const submitted = await prisma.$transaction(async (tx) => {
      // 1. Record transition to SUBMITTED
      await tx.voucherStatusHistory.create({
        data: {
          voucherId,
          fromStatus: VOUCHER_STATUS.DRAFT,
          toStatus: VOUCHER_STATUS.SUBMITTED,
          changedBy: user.id,
          remarks: 'Voucher submitted by employee'
        }
      });

      // 2. Record transition to PENDING_APPROVAL
      await tx.voucherStatusHistory.create({
        data: {
          voucherId,
          fromStatus: VOUCHER_STATUS.SUBMITTED,
          toStatus: VOUCHER_STATUS.PENDING_APPROVAL,
          changedBy: user.id,
          remarks: 'Moved to Director review queue'
        }
      });

      // 3. Update voucher status to PENDING_APPROVAL
      const updated = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: VOUCHER_STATUS.PENDING_APPROVAL,
          employeeSignaturePath: finalSignature
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true, employeeCode: true, department: true }
          },
          statusHistory: {
            include: { user: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      return updated;
    });

    return submitted;
  }

  /**
   * Approve voucher (DIRECTOR only)
   * Workflow transition: PENDING_APPROVAL -> APPROVED
   */
  async approveVoucher(user, voucherId, directorSignaturePath) {
    if (user.role !== ROLES.DIRECTOR) {
      const error = new Error('Only the Director can approve vouchers');
      error.status = 403;
      throw error;
    }

    if (!directorSignaturePath) {
      const error = new Error('Director signature is mandatory before approval');
      error.status = 400;
      throw error;
    }

    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.PENDING_APPROVAL) {
      const error = new Error(
        `Only vouchers with status PENDING_APPROVAL can be approved. Current status: ${voucher.status}`
      );
      error.status = 400;
      throw error;
    }

    const approved = await prisma.$transaction(async (tx) => {
      await tx.voucherStatusHistory.create({
        data: {
          voucherId,
          fromStatus: VOUCHER_STATUS.PENDING_APPROVAL,
          toStatus: VOUCHER_STATUS.APPROVED,
          changedBy: user.id,
          remarks: 'Approved by Director'
        }
      });

      const updated = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: VOUCHER_STATUS.APPROVED,
          directorId: user.id,
          directorSignaturePath,
          approvalDate: new Date(),
          rejectionReason: null
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true, employeeCode: true, department: true }
          },
          director: {
            select: { id: true, name: true, email: true }
          },
          statusHistory: {
            include: { user: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      return updated;
    });

    return approved;
  }

  /**
   * Reject voucher (DIRECTOR only)
   * Workflow transition: PENDING_APPROVAL -> REJECTED
   */
  async rejectVoucher(user, voucherId, rejectionReason) {
    if (user.role !== ROLES.DIRECTOR) {
      const error = new Error('Only the Director can reject vouchers');
      error.status = 403;
      throw error;
    }

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      const error = new Error('Rejection reason is mandatory and must be at least 5 characters');
      error.status = 400;
      throw error;
    }

    const voucher = await voucherRepository.findById(voucherId);
    if (!voucher) {
      const error = new Error('Voucher not found');
      error.status = 404;
      throw error;
    }

    if (voucher.status !== VOUCHER_STATUS.PENDING_APPROVAL) {
      const error = new Error(
        `Only vouchers with status PENDING_APPROVAL can be rejected. Current status: ${voucher.status}`
      );
      error.status = 400;
      throw error;
    }

    const rejected = await prisma.$transaction(async (tx) => {
      await tx.voucherStatusHistory.create({
        data: {
          voucherId,
          fromStatus: VOUCHER_STATUS.PENDING_APPROVAL,
          toStatus: VOUCHER_STATUS.REJECTED,
          changedBy: user.id,
          remarks: `Rejected by Director: ${rejectionReason.trim()}`
        }
      });

      const updated = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: VOUCHER_STATUS.REJECTED,
          directorId: user.id,
          rejectionReason: rejectionReason.trim(),
          approvalDate: null
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true, employeeCode: true, department: true }
          },
          director: {
            select: { id: true, name: true, email: true }
          },
          statusHistory: {
            include: { user: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      return updated;
    });

    return rejected;
  }
}

module.exports = new VoucherService();
