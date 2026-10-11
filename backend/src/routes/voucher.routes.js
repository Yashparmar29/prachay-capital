const express = require('express');
const voucherController = require('../controllers/voucher.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
  createVoucherSchema,
  updateVoucherSchema,
  rejectVoucherSchema
} = require('../validations/voucher.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All voucher endpoints require valid JWT authentication
router.use(authenticate);

// Create draft voucher (EMPLOYEE only)
router.post(
  '/',
  authorize(ROLES.EMPLOYEE),
  validateBody(createVoucherSchema),
  voucherController.createVoucher
);

// List vouchers (Role-scoped list with query filters)
router.get('/', voucherController.listVouchers);

// Get pending approvals queue (DIRECTOR only)
router.get('/pending', authorize(ROLES.DIRECTOR), voucherController.getPendingApprovals);

// Get single voucher details by ID (Role-scoped access)
router.get('/:id', voucherController.getVoucherById);

// Update draft voucher (EMPLOYEE only, draft only, owner only)
router.put(
  '/:id',
  authorize(ROLES.EMPLOYEE),
  validateBody(updateVoucherSchema),
  voucherController.updateVoucher
);

// Delete draft voucher (EMPLOYEE only, draft only, owner only)
router.delete('/:id', authorize(ROLES.EMPLOYEE), voucherController.deleteVoucher);

// Upload/attach signature to draft voucher (EMPLOYEE only)
router.post(
  '/:id/signature',
  authorize(ROLES.EMPLOYEE),
  upload.single('signature'),
  voucherController.uploadVoucherSignature
);

// Submit voucher for approval (EMPLOYEE only)
router.post('/:id/submit', authorize(ROLES.EMPLOYEE), voucherController.submitVoucher);

// Approve voucher with Director signature (DIRECTOR only)
router.post(
  '/:id/approve',
  authorize(ROLES.DIRECTOR),
  upload.single('signature'),
  voucherController.approveVoucher
);

// Reject voucher with rejection reason (DIRECTOR only)
router.post(
  '/:id/reject',
  authorize(ROLES.DIRECTOR),
  validateBody(rejectVoucherSchema),
  voucherController.rejectVoucher
);

module.exports = router;
