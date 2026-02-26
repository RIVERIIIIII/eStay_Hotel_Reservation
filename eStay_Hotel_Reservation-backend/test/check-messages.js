import mongoose from 'mongoose';
import Message from '../src/models/Message.js';
import User from '../src/models/User.js';

async function checkMessages() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    console.log('数据库连接成功');
    
    // 查询所有消息
    const messages = await Message.find().populate('senderId', 'username email role').populate('receiverId', 'username email role');
    
    console.log('\n数据库中的消息记录：');
    
    if (messages.length === 0) {
      console.log('数据库中没有消息记录');
    } else {
      for (const message of messages) {
        console.log(`\n消息 ${message._id}`);
        console.log(`发送者: ${message.senderId.username} (${message.senderId.email}, 角色: ${message.senderId.role})`);
        console.log(`接收者: ${message.receiverId.username} (${message.receiverId.email}, 角色: ${message.receiverId.role})`);
        console.log(`消息内容: ${message.content}`);
        console.log(`已读状态: ${message.isRead}`);
        console.log(`创建时间: ${message.createdAt}`);
      }
    }
    
    // 统计消息数量
    const totalMessages = await Message.countDocuments();
    console.log(`\n消息总数: ${totalMessages}`);
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('错误：', error);
    await mongoose.disconnect();
  }
}

checkMessages();
