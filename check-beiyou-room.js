// 检查北邮科技大厦标准双床房的占用情况
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

// 检查北邮科技大厦标准双床房的占用情况
async function checkBeiyouStandardTwinRoom() {
  try {
    const hotel = await Hotel.findOne({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    
    if (!hotel) {
      console.log('未找到北邮科技大厦');
      return;
    }
    
    console.log('=== 北邮科技大厦房间信息 ===');
    console.log('酒店名称:', hotel.name);
    console.log('总房型数量:', hotel.roomTypes.length);
    
    // 查找标准双床房
    const standardTwinRoom = hotel.roomTypes.find(room => room.type === '标准双床房');
    
    if (standardTwinRoom) {
      console.log('\n标准双床房信息:');
      console.log('房型:', standardTwinRoom.type);
      console.log('价格:', standardTwinRoom.price);
      console.log('是否被占用:', standardTwinRoom.occupied ? '是' : '否');
      
      if (standardTwinRoom.occupied) {
        console.log('占用开始时间:', standardTwinRoom.occupied.checkInDate);
        console.log('占用结束时间:', standardTwinRoom.occupied.checkOutDate);
        
        // 检查是否与查询时间段冲突
        const queryCheckIn = new Date('2026-02-24');
        const queryCheckOut = new Date('2026-02-26');
        const occupiedCheckIn = new Date(standardTwinRoom.occupied.checkInDate);
        const occupiedCheckOut = new Date(standardTwinRoom.occupied.checkOutDate);
        
        const hasConflict = (queryCheckIn < occupiedCheckOut && queryCheckOut > occupiedCheckIn);
        console.log('\n与查询时间段(2026-02-24 至 2026-02-26)的冲突情况:', hasConflict ? '有冲突' : '无冲突');
      }
    } else {
      console.log('未找到标准双床房');
    }
    
  } catch (error) {
    console.error('查询错误:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// 验证时间筛选功能
async function testTimeFilter() {
  try {
    const hotels = await Hotel.find({
      name: '北京北邮科技大厦（蓟门桥地铁站店）'
    });
    
    if (hotels.length === 0) {
      console.log('\n未找到北邮科技大厦');
      return;
    }
    
    const hotel = hotels[0];
    console.log('\n=== 时间筛选功能验证 ===');
    console.log('测试查询时间: 2026-02-24 至 2026-02-26');
    
    const queryCheckIn = new Date('2026-02-24');
    const queryCheckOut = new Date('2026-02-26');
    
    // 模拟后端的时间筛选逻辑
    const availableRoomTypes = hotel.roomTypes.filter(roomType => {
      if (!roomType.occupied) {
        return true;
      }
      
      const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
      const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
      
      const hasConflict = (queryCheckIn < occupiedCheckOut && queryCheckOut > occupiedCheckIn);
      
      console.log(`\n房型: ${roomType.type}`);
      console.log(`占用时间: ${roomType.occupied.checkInDate} 至 ${roomType.occupied.checkOutDate}`);
      console.log(`冲突情况: ${hasConflict ? '有冲突，应被过滤' : '无冲突，可显示'}`);
      
      return !hasConflict;
    });
    
    console.log('\n=== 筛选结果 ===');
    console.log('可用房型数量:', availableRoomTypes.length);
    console.log('可用房型列表:');
    availableRoomTypes.forEach(room => {
      console.log(`- ${room.type} (${room.price}元)`);
    });
    
  } catch (error) {
    console.error('测试错误:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// 执行检查
async function runChecks() {
  const isConnected = await connectDB();
  if (isConnected) {
    await checkBeiyouStandardTwinRoom();
    await testTimeFilter();
  }
}

runChecks();