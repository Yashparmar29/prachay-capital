const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.post(
  '/me/signature',
  authorize(ROLES.EMPLOYEE),
  upload.single('signature'),
  userController.uploadSignature
);

module.exports = router;
