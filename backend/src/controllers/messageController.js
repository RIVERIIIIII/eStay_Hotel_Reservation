import { validationResult } from 'express-validator';
import Message from '../models/Message.js';
import { io } from '../server.js';

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

    // 转换消息格式，确保每个消息都有字符串形式的用户ID
    const formattedMessages = messages.map(message => {
      const messageObj = message.toObject();
      return {
        ...messageObj,
        // 将senderId和receiverId同时作为对象和字符串提供
        senderId: {
          _id: messageObj.senderId._id,
          username: messageObj.senderId.username,
          email: messageObj.senderId.email
        },
        receiverId: {
          _id: messageObj.receiverId._id,
          username: messageObj.receiverId.username,
          email: messageObj.receiverId.email
        },
        // 添加字符串形式的ID，方便前端比较
        senderIdStr: messageObj.senderId._id.toString(),
        receiverIdStr: messageObj.receiverId._id.toString()
      };
    });

    res.json({
      messages: formattedMessages,
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

    // 转换消息格式，确保包含字符串形式的用户ID
    const messageObj = populatedMessage.toObject();
    const formattedMessage = {
      ...messageObj,
      // 将senderId和receiverId同时作为对象和字符串提供
      senderId: {
        _id: messageObj.senderId._id,
        username: messageObj.senderId.username,
        email: messageObj.senderId.email
      },
      receiverId: {
        _id: messageObj.receiverId._id,
        username: messageObj.receiverId.username,
        email: messageObj.receiverId.email
      },
      // 添加字符串形式的ID，方便前端比较
      senderIdStr: messageObj.senderId._id.toString(),
      receiverIdStr: messageObj.receiverId._id.toString()
    };

    // 通过WebSocket发送实时消息通知
    const receiverIdStr = receiverId.toString();
    const senderIdStr = req.user._id.toString();
    
    console.log('发送WebSocket消息:', {
      receiverIdStr,
      senderIdStr,
      messageId: formattedMessage._id,
      messageContent: formattedMessage.content
    });
    
    // 获取所有连接的客户端ID
    const connectedClients = Array.from(io.sockets.adapter.sids.keys());
    console.log('所有连接的客户端:', connectedClients);
    
    // 获取接收者房间的客户端
    const receiverClients = Array.from(io.sockets.adapter.rooms.get(receiverIdStr) || []);
    console.log('接收者房间的客户端:', receiverClients);
    
    // 获取发送者房间的客户端
    const senderClients = Array.from(io.sockets.adapter.rooms.get(senderIdStr) || []);
    console.log('发送者房间的客户端:', senderClients);
    
    // 发送给接收者
    const receiverResult = io.to(receiverIdStr).emit('newMessage', formattedMessage);
    console.log('发送给接收者的结果:', receiverResult);
    
    // 发送给发送者
    const senderResult = io.to(senderIdStr).emit('newMessage', formattedMessage);
    console.log('发送给发送者的结果:', senderResult);
    
    // 为了确保消息能够被接收，也尝试向所有连接的客户端发送消息
    const allResult = io.emit('newMessage', formattedMessage);
    console.log('发送给所有客户端的结果:', allResult);

    res.status(201).json({
      message: 'Message sent successfully',
      data: formattedMessage
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
