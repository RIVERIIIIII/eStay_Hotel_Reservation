import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import User from './backend/src/models/User.js';
import axios from 'axios';

async function testFullWebSocketFlow() {
  try {
    console.log('开始测试完整的WebSocket消息流程...');
    
    // 1. 连接数据库
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    console.log('✓ 数据库连接成功');
    
    // 2. 确保有两个测试用户
    let mobileUser = await User.findOne({ username: 'apptestuser' });
    let hotelUser = await User.findOne({ username: 'hotelmanager' });
    
    if (!mobileUser) {
      console.log('创建移动端测试用户...');
      mobileUser = new User({
        username: 'apptestuser',
        email: 'apptestuser@example.com',
        password: 'apptestpassword123',
        role: 'user'
      });
      await mobileUser.save();
      console.log('✓ 移动端用户创建成功');
    }
    
    if (!hotelUser) {
      console.log('创建酒店管理员测试用户...');
      hotelUser = new User({
        username: 'hotelmanager',
        email: 'hotelmanager@example.com',
        password: 'hotelpassword123',
        role: 'hotel'
      });
      await hotelUser.save();
      console.log('✓ 酒店管理员用户创建成功');
    }
    
    console.log('测试用户信息：');
    console.log('移动端用户:', mobileUser.username, 'ID:', mobileUser._id);
    console.log('酒店管理员:', hotelUser.username, 'ID:', hotelUser._id);
    
    // 3. 登录获取token
    console.log('\n登录移动端用户获取token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      account: mobileUser.email,
      password: 'apptestpassword123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ 登录成功，获取到token');
    
    // 4. 创建WebSocket连接
    console.log('\n创建WebSocket连接...');
    
    // 移动端WebSocket连接
    const mobileSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token }
    });
    
    // 酒店端WebSocket连接
    const hotelSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    // 5. 监听事件
    let mobileReceivedMessages = [];
    let hotelReceivedMessages = [];
    
    mobileSocket.on('connect', () => {
      console.log('✓ 移动端WebSocket连接成功，ID:', mobileSocket.id);
      mobileSocket.emit('join', mobileUser._id.toString());
    });
    
    hotelSocket.on('connect', () => {
      console.log('✓ 酒店端WebSocket连接成功，ID:', hotelSocket.id);
      hotelSocket.emit('join', hotelUser._id.toString());
    });
    
    mobileSocket.on('newMessage', (message) => {
      console.log('\n📱 移动端收到实时消息：');
      console.log('   内容:', message.content);
      console.log('   发送者:', message.senderId.username);
      console.log('   接收者:', message.receiverId.username);
      mobileReceivedMessages.push(message);
    });
    
    hotelSocket.on('newMessage', (message) => {
      console.log('\n🏨 酒店端收到实时消息：');
      console.log('   内容:', message.content);
      console.log('   发送者:', message.senderId.username);
      console.log('   接收者:', message.receiverId.username);
      hotelReceivedMessages.push(message);
    });
    
    // 监听错误
    mobileSocket.on('connect_error', (err) => {
      console.error('移动端连接错误:', err.message);
    });
    
    hotelSocket.on('connect_error', (err) => {
      console.error('酒店端连接错误:', err.message);
    });
    
    // 6. 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 7. 测试HTTP API消息发送
    console.log('\n通过HTTP API发送消息...');
    const messageContent = {
      receiverId: hotelUser._id.toString(),
      content: '您好，我想咨询一下贵酒店的预订政策。'
    };
    
    const messageResponse = await axios.post('http://localhost:5000/api/messages', messageContent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ HTTP API消息发送成功');
    console.log('   状态码:', messageResponse.status);
    
    // 8. 等待WebSocket消息
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 9. 验证结果
    console.log('\n验证结果：');
    console.log(`   移动端收到的消息数: ${mobileReceivedMessages.length}`);
    console.log(`   酒店端收到的消息数: ${hotelReceivedMessages.length}`);
    
    if (mobileReceivedMessages.length > 0 && hotelReceivedMessages.length > 0) {
      console.log('\n🎉 WebSocket功能测试成功！');
      console.log('   - HTTP API消息发送正常');
      console.log('   - WebSocket实时通知正常');
      console.log('   - 移动端和酒店端都能收到消息');
    } else {
      console.log('\n❌ WebSocket功能测试失败！');
      console.log('   - 可能的原因：WebSocket连接失败、事件监听错误或消息未正确转发');
    }
    
    // 10. 关闭连接
    mobileSocket.close();
    hotelSocket.close();
    await mongoose.disconnect();
    
    console.log('\n所有测试完成！');
    
  } catch (error) {
    console.error('测试过程中发生错误：', error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // 忽略断开连接错误
    }
  }
}

testFullWebSocketFlow();