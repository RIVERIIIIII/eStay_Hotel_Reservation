import express from 'express';
import { 
  getMobileHotels, 
  getMobileHotelById,
  createBooking,
  getUserBookings 
} from '../controllers/mobileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 移动端酒店查询接口（不需要认证）

// 获取酒店列表（支持筛选）
router.get('/hotels', getMobileHotels);

// 获取单个酒店详情
router.get('/hotels/:id', getMobileHotelById);

// 预定相关接口（需要认证）

// 创建预定
router.post('/bookings', authenticateToken, createBooking);

// 获取用户预定列表
router.get('/bookings', authenticateToken, getUserBookings);

export default router;