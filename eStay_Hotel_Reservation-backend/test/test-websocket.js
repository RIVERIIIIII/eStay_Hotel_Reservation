import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function testWebSocket() {
  try {
    console.log('开始测试WebSocket实时消息功能...');
    
    // 连接数据库获取用户信息
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    
    // 查找移动端用户和酒店商家
    const mobileUser = await User.findOne({ username: 'mobileuser' });
    const hotelUser = await User.findOne({ username: 'hotelmanager' });
    
    if (!mobileUser || !hotelUser) {
      console.error('未找到测试用户');
      return mongoose.disconnect();
    }
    
    console.log('测试用户信息：');
    console.log('移动端用户:', mobileUser.username, 'ID:', mobileUser._id);
    console.log('酒店商家:', hotelUser.username, 'ID:', hotelUser._id);
    
    await mongoose.disconnect();
    
    // 创建移动端WebSocket连接
    const mobileSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    // 创建酒店端WebSocket连接
    const hotelSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    // 移动端加入自己的房间
    mobileSocket.on('connect', () => {
      console.log('\n移动端连接成功，ID:', mobileSocket.id);
      mobileSocket.emit('join', mobileUser._id.toString());
    });
    
    // 酒店端加入自己的房间
    hotelSocket.on('connect', () => {
      console.log('酒店端连接成功，ID:', hotelSocket.id);
      hotelSocket.emit('join', hotelUser._id.toString());
    });
    
    // 酒店端监听新消息
    hotelSocket.on('newMessage', (message) => {
      console.log('\n酒店端收到实时消息：');
      console.log('消息内容:', message.content);
      console.log('发送者:', message.senderId);
      console.log('接收者:', message.receiverId);
      
      // 测试完成，关闭连接
      setTimeout(() => {
        mobileSocket.close();
        hotelSocket.close();
        console.log('\nWebSocket测试完成！');
        console.log('结论：酒店端可以实时收到移动端发送的消息。');
      }, 1000);
    });
    
    // 移动端发送消息（直接发送，不依赖join事件）
    setTimeout(() => {
      const testMessage = {
        senderId: mobileUser._id.toString(),
        receiverId: hotelUser._id.toString(),
        content: '您好，我想咨询一下贵酒店的预订政策。'
      };
      
      console.log('\n移动端发送实时消息：', testMessage.content);
      console.log('发送的事件：sendMessage');
      console.log('发送的消息对象：', testMessage);
      mobileSocket.emit('sendMessage', testMessage);
    }, 3000);
    
    // 监听连接状态
    mobileSocket.on('connect_error', (err) => {
      console.error('移动端连接错误:', err.message);
    });
    
    hotelSocket.on('connect_error', (err) => {
      console.error('酒店端连接错误:', err.message);
    });
    
    // 监听所有事件
    mobileSocket.onAny((event, ...args) => {
      console.log(`移动端接收到事件: ${event}`, args);
    });
    
    hotelSocket.onAny((event, ...args) => {
      console.log(`酒店端接收到事件: ${event}`, args);
    });
    
    // 处理连接错误
    mobileSocket.on('connect_error', (err) => {
      console.error('移动端连接错误:', err);
    });
    
    hotelSocket.on('connect_error', (err) => {
      console.error('酒店端连接错误:', err);
    });
    
    // 超时处理
    setTimeout(() => {
      mobileSocket.close();
      hotelSocket.close();
      console.log('\n测试超时，WebSocket连接已关闭。');
    }, 10000);
    
  } catch (error) {
    console.error('测试过程中发生错误：', error);
    await mongoose.disconnect();
  }
}

testWebSocket();
