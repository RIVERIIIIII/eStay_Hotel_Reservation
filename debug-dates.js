// 调试日期格式和过滤逻辑
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');
    console.log('MongoDB Connected');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    return false;
  }
}

// 调试主函数
async function debug() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) return;
    
    // 直接查询数据库
    const hotelsCollection = mongoose.connection.db.collection('hotels');
    const hotel = await hotelsCollection.findOne({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    
    if (!hotel) {
      console.log('未找到酒店');
      return;
    }
    
    console.log('=== 酒店基本信息 ===');
    console.log('酒店名称:', hotel.name);
    console.log('房间数量:', hotel.roomTypes ? hotel.roomTypes.length : 0);
    
    if (hotel.roomTypes && Array.isArray(hotel.roomTypes)) {
      console.log('\n=== 所有房间信息 ===');
      hotel.roomTypes.forEach((room, index) => {
        console.log(`\n房间 ${index + 1}:`);
        console.log('  类型:', room.type);
        console.log('  价格:', room.price);
        console.log('  是否被占用:', room.occupied ? '是' : '否');
        if (room.occupied) {
          console.log('  占用开始:', room.occupied.checkInDate);
          console.log('  占用结束:', room.occupied.checkOutDate);
        }
      });
      
      // 测试特定房间的过滤逻辑
      const standardTwinRoom = hotel.roomTypes.find(room => room.type === '标准双床房');
      if (standardTwinRoom) {
        console.log('\n=== 标准双床房详细信息 ===');
        console.log('房间类型:', standardTwinRoom.type);
        console.log('占用状态:', standardTwinRoom.occupied ? '已占用' : '未占用');
        
        if (standardTwinRoom.occupied) {
          console.log('\n占用信息:');
          console.log('  开始日期:', standardTwinRoom.occupied.checkInDate);
          console.log('  结束日期:', standardTwinRoom.occupied.checkOutDate);
          
          // 解析日期
          const dbCheckIn = new Date(standardTwinRoom.occupied.checkInDate);
          const dbCheckOut = new Date(standardTwinRoom.occupied.checkOutDate);
          
          console.log('\n解析后的日期:');
          console.log('  开始日期:', dbCheckIn);
          console.log('  结束日期:', dbCheckOut);
          console.log('  时区偏移:', dbCheckIn.getTimezoneOffset(), '分钟');
          
          // 测试用户查询的日期
          const userCheckIn = new Date('2026-02-24');
          const userCheckOut = new Date('2026-02-26');
          
          console.log('\n用户查询的日期:');
          console.log('  入住日期:', userCheckIn);
          console.log('  离店日期:', userCheckOut);
          
          // 测试修复后的冲突检查逻辑
          console.log('\n=== 冲突检查测试 ===');
          
          // 修复前的逻辑
          const oldHasConflict = (userCheckIn < dbCheckOut && userCheckOut > dbCheckIn);
          
          // 修复后的逻辑
          const newHasConflict = !(userCheckOut <= dbCheckIn || userCheckIn >= dbCheckOut);
          
          console.log('修复前的冲突检查结果:', oldHasConflict ? '有冲突' : '无冲突');
          console.log('修复后的冲突检查结果:', newHasConflict ? '有冲突' : '无冲突');
          
          console.log('\n详细比较:');
          console.log('  userCheckIn < dbCheckOut:', userCheckIn < dbCheckOut);
          console.log('  userCheckOut > dbCheckIn:', userCheckOut > dbCheckIn);
          console.log('  userCheckOut <= dbCheckIn:', userCheckOut <= dbCheckIn);
          console.log('  userCheckIn >= dbCheckOut:', userCheckIn >= dbCheckOut);
          
          // 输出原始时间戳用于精确比较
          console.log('\n时间戳比较:');
          console.log('  用户入住:', userCheckIn.getTime());
          console.log('  用户离店:', userCheckOut.getTime());
          console.log('  占用开始:', dbCheckIn.getTime());
          console.log('  占用结束:', dbCheckOut.getTime());
        }
      }
    }
    
  } catch (error) {
    console.error('调试错误:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    mongoose.disconnect();
  }
}

debug();