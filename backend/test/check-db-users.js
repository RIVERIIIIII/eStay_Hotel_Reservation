import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function checkUsers() {
  try {
    // 连接到与服务器相同的数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');
    
    // 查询所有用户
    const users = await User.find();
    console.log('数据库中的用户：');
    
    for (const user of users) {
      console.log('\n用户：');
      console.log(`- ID: ${user._id}`);
      console.log(`- 用户名: ${user.username}`);
      console.log(`- 邮箱: ${user.email}`);
      console.log(`- 角色: ${user.role}`);
      console.log(`- 密码: ${user.password}`); // 仅用于调试，实际应用中不应显示
      console.log(`- 创建时间: ${user.createdAt}`);
    }
    
    // 检查密码匹配
    if (users.length > 0) {
      const testPassword = 'password123';
      console.log(`\n测试密码：${testPassword}`);
      for (const user of users) {
        const isMatch = await user.comparePassword(testPassword);
        console.log(`用户 ${user.username} 的密码是否匹配：${isMatch}`);
      }
    }
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('错误：', error);
    await mongoose.disconnect();
  }
}

checkUsers();
