import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgetPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 注册路由
router.post('/register', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], register);

// 登录路由
router.post('/login', [
  body('account').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// 获取当前用户信息
router.get('/me', authenticateToken, getMe);

// 忘记密码
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
], forgetPassword);

// 重置密码
router.post('/reset-password', [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required')
], resetPassword);

export default router;