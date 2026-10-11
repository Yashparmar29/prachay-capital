const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const voucherRoutes = require('./voucher.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
