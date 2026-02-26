import express from 'express';
import { 
  createOrUpdateRating, 
  getHotelRatings, 
  getUserHotelRating, 
  deleteRating 
} from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 创建或更新评分 - 需要认证
router.post('/:hotelId', authenticateToken, createOrUpdateRating);

// 获取酒店的所有评分 - 公开
router.get('/hotel/:hotelId', getHotelRatings);

// 获取用户对某个酒店的评分 - 需要认证
router.get('/user/:hotelId', authenticateToken, getUserHotelRating);

// 删除评分 - 需要认证
router.delete('/:ratingId', authenticateToken, deleteRating);

export default router;
