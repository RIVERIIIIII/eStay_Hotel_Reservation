// 检查MongoDB中的用户信息
const mongoose = require('mongoose');

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking');

// 定义用户模型
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', UserSchema);

// 检查用户信息
async function checkUsers() {
  try {
    console.log('连接到MongoDB...');
    
    // 获取所有用户
    const users = await User.find({});
    
    console.log('找到的用户:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // 断开连接
    await mongoose.connection.close();
    console.log('已断开MongoDB连接');
    
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
    await mongoose.connection.close();
  }
}

// 运行检查
checkUsers();
