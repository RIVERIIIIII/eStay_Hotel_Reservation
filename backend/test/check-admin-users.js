import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

// 连接数据库
async function checkAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB连接成功!');
    
    // 查询所有用户
    console.log('\n📊 所有用户:');
    const allUsers = await User.find().select('username email role createdAt');
    
    if (allUsers.length === 0) {
      console.log('❌ 数据库中没有用户');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}.`);
        console.log(`   用户名: ${user.username}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   创建时间: ${new Date(user.createdAt).toLocaleString()}`);
      });
    }
    
    // 查询管理员用户
    console.log('\n🔍 管理员用户:');
    const adminUsers = await User.find({ role: 'admin' }).select('username email role');
    
    if (adminUsers.length === 0) {
      console.log('❌ 数据库中没有管理员用户');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`\n${index + 1}. 管理员`);
        console.log(`   用户名: ${admin.username}`);
        console.log(`   邮箱: ${admin.email}`);
      });
    }
    
    // 查询商家用户
    console.log('\n🔍 商家用户:');
    const merchantUsers = await User.find({ role: 'merchant' }).select('username email role');
    
    if (merchantUsers.length === 0) {
      console.log('❌ 数据库中没有商家用户');
    } else {
      merchantUsers.forEach((merchant, index) => {
        console.log(`\n${index + 1}. 商家`);
        console.log(`   用户名: ${merchant.username}`);
        console.log(`   邮箱: ${merchant.email}`);
      });
    }
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error.message);
  }
}

checkAdminUsers();