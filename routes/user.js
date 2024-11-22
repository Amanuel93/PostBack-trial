const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);
router.get('/verify-email/:token',authController.verifyEmail);
router.post('/forgot-password',authController.forgotPassword);
router.post('/reset-password/:token',authController.resetPassword);

module.exports = router;