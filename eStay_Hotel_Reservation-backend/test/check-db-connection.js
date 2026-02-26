import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
const envResult = dotenv.config();
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
}

async function checkDbConnection() {
  try {
    console.log('环境变量中的数据库URI:', process.env.MONGODB_URI);
    
    // 连接到数据库
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('成功连接到数据库');
    console.log('数据库名称:', conn.connection.db.databaseName);
    console.log('主机:', conn.connection.host);
    console.log('端口:', conn.connection.port);
    
    // 关闭连接
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('数据库连接错误:', error);
  }
}

checkDbConnection();
