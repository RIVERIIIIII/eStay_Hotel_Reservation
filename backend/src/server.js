import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import adminRoutes from './routes/admin.js';
import publicHotelRoutes from './routes/publicHotels.js';
import bookingRoutes from './routes/booking.js';
import messageRoutes from './routes/message.js';
import ratingRoutes from './routes/rating.js';
import mobileRoutes from './routes/mobile.js';

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/public/hotels', publicHotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/mobile', mobileRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ message: 'Hotel Booking API is running!' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 创建HTTP服务器
const server = http.createServer(app);

// 初始化Socket.io服务器
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 加入房间（用户ID）
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // 发送消息
  socket.on('sendMessage', (message) => {
    // 保存消息到数据库的逻辑将在messageController中处理
    // 这里只负责实时转发消息
    io.to(message.receiverId).emit('newMessage', message);
    io.to(message.senderId).emit('newMessage', message);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 启动服务器 - 监听所有网络接口
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is accessible at http://localhost:${PORT}`);
  console.log(`Server is accessible at http://0.0.0.0:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});