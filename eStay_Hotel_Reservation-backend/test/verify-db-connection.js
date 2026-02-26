import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 连接数据库
async function verifyDbConnection() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB连接成功!');
    console.log(`数据库地址: ${conn.connection.host}`);
    console.log(`数据库名称: ${conn.connection.name}`);
    
    // 检查数据库状态
    const db = conn.connection.db;
    const stats = await db.stats();
    console.log('\n📊 数据库统计信息:');
    console.log(`- 集合数量: ${stats.collections}`);
    console.log(`- 文档总数: ${stats.objects}`);
    console.log(`- 数据大小: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error.message);
  }
}

verifyDbConnection();