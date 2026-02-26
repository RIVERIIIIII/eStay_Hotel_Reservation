import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function deleteTestUsers() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    console.log('数据库连接成功');
    
    // 删除所有测试用户
    const result = await User.deleteMany({
      $or: [
        { username: 'mobileuser' },
        { username: 'hotelmanager' }
      ]
    });
    
    console.log(`删除了 ${result.deletedCount} 个测试用户`);
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('错误：', error);
    await mongoose.disconnect();
  }
}

deleteTestUsers();
