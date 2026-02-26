import mongoose from 'mongoose';
import User from '../src/models/User.js';

// 连接数据库
mongoose.connect('mongodb://localhost:27017/hotel-assistant')
.then(() => {
  console.log('数据库连接成功');
  // 查询所有用户
  return User.find({}, { username: 1, email: 1, role: 1, _id: 1 });
})
.then(users => {
  console.log('现有用户列表：');
  users.forEach(user => {
    console.log(`- ID: ${user._id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
  });
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
