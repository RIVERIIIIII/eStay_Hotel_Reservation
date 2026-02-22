import { validationResult } from 'express-validator';
import Message from '../models/Message.js';

// 获取用户消息列表
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // 获取当前用户的所有消息（包括发送和接收的）
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    })
      .populate('senderId', 'username email')
      .populate('receiverId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 发送消息
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content } = req.body;

    // 创建新消息
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content
    });

    await message.save();

    // 填充用户信息并返回
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username email')
      .populate('receiverId', 'username email');

    res.status(201).json({
      message: 'Message sent successfully',
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 标记消息为已读
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    // 查找消息并标记为已读
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiverId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message marked as read',
      message
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取未读消息数量
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
