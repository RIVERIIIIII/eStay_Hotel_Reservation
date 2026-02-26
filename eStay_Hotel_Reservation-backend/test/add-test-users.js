import mongoose from 'mongoose';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

// 连接数据库
mongoose.connect('mongodb://localhost:27017/hotel-assistant')
.then(async () => {
  console.log('数据库连接成功');
  
  // 检查是否已有用户
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('数据库中已有用户，跳过创建');
    return mongoose.disconnect();
  }
  
  // 创建移动端用户（User模型的pre-save中间件会自动哈希密码）
  const mobileUser = new User({
    username: 'mobileuser',
    email: 'mobile@example.com',
    password: 'password123',
    role: 'user'
  });
  
  // 创建酒店商家用户
  const hotelUser = new User({
    username: 'hotelmanager',
    email: 'hotel@example.com',
    password: 'password123',
    role: 'merchant'
  });
  
  // 保存用户
  const savedMobileUser = await mobileUser.save();
  const savedHotelUser = await hotelUser.save();
  
  console.log('创建的测试用户：');
  console.log('移动端用户：');
  console.log(`- ID: ${savedMobileUser._id}`);
  console.log(`- Username: ${savedMobileUser.username}`);
  console.log(`- Email: ${savedMobileUser.email}`);
  console.log(`- Role: ${savedMobileUser.role}`);
  console.log('');
  console.log('酒店商家用户：');
  console.log(`- ID: ${savedHotelUser._id}`);
  console.log(`- Username: ${savedHotelUser.username}`);
  console.log(`- Email: ${savedHotelUser.email}`);
  console.log(`- Role: ${savedHotelUser.role}`);
  
  // 关闭连接
  return mongoose.disconnect();
})
.then(() => {
  console.log('数据库连接已关闭');
})
.catch(error => {
  console.error('错误：', error);
  mongoose.disconnect();
});
