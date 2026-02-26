import express from 'express';
import { body } from 'express-validator';
import { 
  getPendingHotels, 
  approveHotel, 
  rejectHotel, 
  getAllHotels,
  publishHotel,
  offlineHotel
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要管理员权限
router.use(authenticateToken);
router.use(requireRole('admin'));

// 获取待审核酒店列表
router.get('/hotels/pending', getPendingHotels);

// 获取所有酒店列表
router.get('/hotels', getAllHotels);

// 审核通过酒店
router.put('/hotels/:id/approve', approveHotel);

// 审核拒绝酒店
router.put('/hotels/:id/reject', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], rejectHotel);

// 发布酒店
router.put('/hotels/:id/publish', publishHotel);

// 下线酒店
router.put('/hotels/:id/offline', offlineHotel);

export default router;