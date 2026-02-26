// 测试修复后的时间筛选功能
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// 定义酒店模型
const HotelSchema = new mongoose.Schema({
  name: String,
  roomTypes: [{
    type: String,
    price: Number,
    occupied: {
      checkInDate: String,
      checkOutDate: String
    }
  }]
});

const Hotel = mongoose.model('Hotel', HotelSchema);

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

// 测试修复后的时间筛选逻辑
async function testFixedTimeFilter() {
  try {
    const hotel = await Hotel.findOne({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    
    if (!hotel) {
      console.log('未找到北邮科技大厦');
      return;
    }
    
    console.log('=== 测试修复后的时间筛选功能 ===');
    console.log('测试查询时间: 2026-02-24 至 2026-02-26');
    console.log('\n酒店原始房间列表:');
    hotel.roomTypes.forEach(room => {
      console.log(`- ${room.type}: ${room.price}元`);
      if (room.occupied) {
        console.log(`  占用时间: ${room.occupied.checkInDate} 至 ${room.occupied.checkOutDate}`);
      } else {
        console.log('  占用时间: 无');
      }
    });
    
    const queryCheckIn = new Date('2026-02-24');
    const queryCheckOut = new Date('2026-02-26');
    
    // 测试修复后的冲突检查逻辑
    console.log('\n=== 修复后的时间筛选逻辑测试 ===');
    console.log('使用新的冲突检查逻辑: !(checkOut <= occupiedCheckIn || checkIn >= occupiedCheckOut)');
    
    const availableRoomTypes = hotel.roomTypes.filter(roomType => {
      if (!roomType.occupied) {
        console.log(`\n房型: ${roomType.type} - 未被占用，可显示`);
        return true;
      }
      
      const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
      const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
      
      // 修复后的冲突检查逻辑
      const hasConflict = !(queryCheckOut <= occupiedCheckIn || queryCheckIn >= occupiedCheckOut);
      
      console.log(`\n房型: ${roomType.type}`);
      console.log(`查询时间: ${queryCheckIn.toISOString()} 至 ${queryCheckOut.toISOString()}`);
      console.log(`占用时间: ${occupiedCheckIn.toISOString()} 至 ${occupiedCheckOut.toISOString()}`);
      console.log(`冲突情况: ${hasConflict ? '有冲突，应被过滤' : '无冲突，可显示'}`);
      
      return !hasConflict;
    });
    
    console.log('\n=== 最终筛选结果 ===');
    console.log('可用房型数量:', availableRoomTypes.length);
    console.log('可用房型列表:');
    availableRoomTypes.forEach(room => {
      console.log(`- ${room.type} (${room.price}元)`);
    });
    
    // 特别检查标准双床房是否被正确过滤
    const standardTwinRoom = hotel.roomTypes.find(room => room.type === '标准双床房');
    if (standardTwinRoom) {
      console.log('\n=== 标准双床房检查 ===');
      const isAvailable = availableRoomTypes.some(room => room.type === '标准双床房');
      console.log(`标准双床房是否被正确过滤: ${!isAvailable ? '是 ✓' : '否 ✗'}`);
      console.log(`期望结果: 标准双床房在2026-02-24至2026-02-26期间被占用，应被过滤`);
      console.log(`实际结果: ${!isAvailable ? '已被正确过滤' : '仍然显示，存在问题'}`);
    }
    
  } catch (error) {
    console.error('测试错误:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// 执行测试
async function runTest() {
  const isConnected = await connectDB();
  if (isConnected) {
    await testFixedTimeFilter();
  }
}

runTest();