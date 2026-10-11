const voucherService = require('../services/voucher.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

class VoucherController {
  async createVoucher(req, res, next) {
    try {
      const voucher = await voucherService.createVoucher(req.user, req.body);
      return sendCreated(res, 'Voucher created as draft successfully', voucher);
    } catch (error) {
      next(error);
    }
  }

  async listVouchers(req, res, next) {
    try {
      const result = await voucherService.listVouchers(req.user, req.query);
      return sendSuccess(res, 'Vouchers retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req, res, next) {
    try {
      const result = await voucherService.getPendingApprovals(req.user, req.query);
      return sendSuccess(res, 'Pending approval vouchers retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getVoucherById(req, res, next) {
    try {
      const voucher = await voucherService.getVoucherById(req.user, req.params.id);
      return sendSuccess(res, 'Voucher details retrieved successfully', voucher);
    } catch (error) {
      next(error);
    }
  }

  async updateVoucher(req, res, next) {
    try {
      const updated = await voucherService.updateVoucher(req.user, req.params.id, req.body);
      return sendSuccess(res, 'Voucher updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteVoucher(req, res, next) {
    try {
      const result = await voucherService.deleteVoucher(req.user, req.params.id);
      return sendSuccess(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }

  async uploadVoucherSignature(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'Signature image file is required');
      }

      const signaturePath = `/uploads/${req.file.filename}`;
      const updated = await voucherService.attachSignature(req.user, req.params.id, signaturePath);

      return sendSuccess(res, 'Signature attached to voucher successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async submitVoucher(req, res, next) {
    try {
      const submitted = await voucherService.submitVoucher(req.user, req.params.id);
      return sendSuccess(res, 'Voucher submitted for approval successfully', submitted);
    } catch (error) {
      next(error);
    }
  }

  async approveVoucher(req, res, next) {
    try {
      let signaturePath = null;
      if (req.file) {
        signaturePath = `/uploads/${req.file.filename}`;
      } else if (req.body.directorSignaturePath) {
        signaturePath = req.body.directorSignaturePath;
      }

      if (!signaturePath) {
        return sendError(
          res,
          400,
          'Director signature image is mandatory for approving a voucher'
        );
      }

      const approved = await voucherService.approveVoucher(req.user, req.params.id, signaturePath);
      return sendSuccess(res, 'Voucher approved successfully', approved);
    } catch (error) {
      next(error);
    }
  }

  async rejectVoucher(req, res, next) {
    try {
      const { rejectionReason } = req.body;
      const rejected = await voucherService.rejectVoucher(req.user, req.params.id, rejectionReason);
      return sendSuccess(res, 'Voucher rejected successfully', rejected);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VoucherController();
