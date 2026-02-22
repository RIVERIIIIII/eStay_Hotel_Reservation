import express from 'express';
import { 
  createBooking, 
  getUserBookings 
} from '../controllers/mobileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 预定相关接口（需要认证）

// 创建预定
router.post('/', authenticateToken, createBooking);

// 获取用户预定列表
router.get('/', authenticateToken, getUserBookings);

export default router;