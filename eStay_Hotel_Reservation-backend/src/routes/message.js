import express from 'express';
import { body } from 'express-validator';
import { getMessages, sendMessage, markMessageAsRead, getUnreadCount } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取用户消息列表
router.get('/', authenticateToken, getMessages);

// 发送消息
router.post('/', authenticateToken, [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content').notEmpty().withMessage('Message content is required')
], sendMessage);

// 标记消息为已读
router.put('/:messageId/read', authenticateToken, markMessageAsRead);

// 获取未读消息数量
router.get('/unread-count', authenticateToken, getUnreadCount);

export default router;
