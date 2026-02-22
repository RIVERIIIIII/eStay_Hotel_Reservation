import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Message from '../src/models/Message.js';

async function testMessageDirect() {
  try {
    console.log('直接测试消息功能...');
    
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    console.log('数据库连接成功');
    
    // 查找移动端用户和酒店商家
    const mobileUser = await User.findOne({ username: 'mobileuser' });
    const hotelUser = await User.findOne({ username: 'hotelmanager' });
    
    if (!mobileUser || !hotelUser) {
      console.log('未找到测试用户，创建新用户...');
      // 创建测试用户
      const newMobileUser = new User({
        username: 'mobileuser',
        email: 'mobile@example.com',
        password: 'password123',
        role: 'user'
      });
      
      const newHotelUser = new User({
        username: 'hotelmanager',
        email: 'hotel@example.com',
        password: 'password123',
        role: 'merchant'
      });
      
      await newMobileUser.save();
      await newHotelUser.save();
      
      console.log('测试用户创建成功');
      return mongoose.disconnect();
    }
    
    console.log('找到测试用户：');
    console.log('移动端用户:', mobileUser.username);
    console.log('酒店商家:', hotelUser.username);
    
    // 创建一条消息
    const messageContent = '您好，我想咨询一下贵酒店的预订政策。';
    
    const message = new Message({
      senderId: mobileUser._id,
      receiverId: hotelUser._id,
      content: messageContent
    });
    
    // 保存消息到数据库
    await message.save();
    console.log('\n消息保存成功！');
    console.log('消息内容:', messageContent);
    console.log('发送者:', mobileUser.username);
    console.log('接收者:', hotelUser.username);
    console.log('消息ID:', message._id);
    
    // 查询酒店商家的消息列表
    const hotelMessages = await Message.find({
      $or: [
        { senderId: hotelUser._id },
        { receiverId: hotelUser._id }
      ]
    }).populate('senderId', 'username');
    
    console.log('\n酒店商家的消息列表：');
    hotelMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.content} - 来自: ${msg.senderId.username}`);
    });
    
    // 验证移动端用户是否能收到回复
    console.log('\n发送回复消息...');
    const replyMessage = new Message({
      senderId: hotelUser._id,
      receiverId: mobileUser._id,
      content: '您好，我们的预订政策是...'
    });
    
    await replyMessage.save();
    console.log('回复消息保存成功！');
    
    // 查询移动端用户的消息列表
    const mobileMessages = await Message.find({
      $or: [
        { senderId: mobileUser._id },
        { receiverId: mobileUser._id }
      ]
    }).populate('senderId', 'username');
    
    console.log('\n移动端用户的消息列表：');
    mobileMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.content} - 来自: ${msg.senderId.username}`);
    });
    
    console.log('\n测试完成！用户可以发送消息，酒店可以接收并回复。');
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('测试过程中发生错误：', error);
    await mongoose.disconnect();
  }
}

testMessageDirect();
