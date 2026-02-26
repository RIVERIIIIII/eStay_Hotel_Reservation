import express from 'express';
import { body } from 'express-validator';
import { 
  createHotel, 
  getHotels, 
  getHotelById, 
  updateHotel, 
  deleteHotel,
  uploadImages
} from '../controllers/hotelController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../config/upload.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 创建酒店
router.post('/', [
  body('name').notEmpty().withMessage('Hotel name is required'),
  body('name_en').notEmpty().withMessage('English hotel name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('starRating').isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('openingTime').isISO8601().withMessage('Valid opening time is required'),
  body('roomTypes').isArray({ min: 1 }).withMessage('At least one room type is required'),
  body('roomTypes.*.type').notEmpty().withMessage('Room type name is required'),
  body('roomTypes.*.price').isFloat({ min: 0 }).withMessage('Room price must be a positive number')
], createHotel);

// 获取酒店列表
router.get('/', getHotels);

// 获取单个酒店详情
router.get('/:id', getHotelById);

// 更新酒店信息
router.put('/:id', [
  body('name').notEmpty().withMessage('Hotel name is required'),
  body('name_en').notEmpty().withMessage('English hotel name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('starRating').isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('openingTime').isISO8601().withMessage('Valid opening time is required'),
  body('roomTypes').isArray({ min: 1 }).withMessage('At least one room type is required'),
  body('roomTypes.*.type').notEmpty().withMessage('Room type name is required'),
  body('roomTypes.*.price').isFloat({ min: 0 }).withMessage('Room price must be a positive number')
], updateHotel);

// 删除酒店
router.delete('/:id', deleteHotel);

// 上传酒店图片
router.post('/upload', upload.array('images'), uploadImages);

export default router;