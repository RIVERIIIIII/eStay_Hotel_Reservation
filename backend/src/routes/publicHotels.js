import express from 'express';
import { 
  getMobileHotels, 
  getMobileHotelById,
  getFeaturedHotels
} from '../controllers/mobileController.js';

const router = express.Router();

// 公开酒店查询接口（不需要认证）

// 获取推荐酒店（用于首页Banner）
router.get('/featured', getFeaturedHotels);

// 获取酒店列表（支持筛选）
router.get('/', getMobileHotels);

// 获取单个酒店详情
router.get('/:id', getMobileHotelById);

export default router;