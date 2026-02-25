// 测试日期格式和时区问题
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

// 测试日期格式和时区
async function testDateFormats() {
  try {
    // 查找北邮科技大厦
    const hotel = await Hotel.findOne({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    
    if (!hotel) {
      console.log('未找到北邮科技大厦');
      return;
    }
    
    console.log('=== 日期格式和时区测试 ===');
    
    // 获取标准双床房
    const standardTwinRoom = hotel.roomTypes.find(room => room.type === '标准双床房');
    if (!standardTwinRoom || !standardTwinRoom.occupied) {
      console.log('未找到标准双床房或房间未被占用');
      return;
    }
    
    console.log('\n数据库中的占用时间:');
    console.log('checkInDate:', standardTwinRoom.occupied.checkInDate);
    console.log('checkOutDate:', standardTwinRoom.occupied.checkOutDate);
    
    // 测试不同格式的日期参数
    const testCases = [
      { name: '前端传递的日期格式 (yyyy-MM-dd)', checkIn: '2026-02-24', checkOut: '2026-02-26' },
      { name: '数据库存储的日期格式 (带时区)', checkIn: '2026-02-24T00:00:00.000Z', checkOut: '2026-02-26T00:00:00.000Z' },
      { name: '带时分秒的日期', checkIn: '2026-02-24T14:00:00', checkOut: '2026-02-26T12:00:00' }
    ];
    
    const dbCheckIn = new Date(standardTwinRoom.occupied.checkInDate);
    const dbCheckOut = new Date(standardTwinRoom.occupied.checkOutDate);
    
    console.log('\n数据库解析后的日期:');
    console.log('checkIn:', dbCheckIn);
    console.log('checkOut:', dbCheckOut);
    console.log('时区:', dbCheckIn.getTimezoneOffset() / -60, '小时');
    
    // 测试修复后的冲突检查逻辑
    testCases.forEach(testCase => {
      console.log(`\n=== 测试用例: ${testCase.name} ===`);
      console.log('查询时间:', testCase.checkIn, '至', testCase.checkOut);
      
      const queryCheckIn = new Date(testCase.checkIn);
      const queryCheckOut = new Date(testCase.checkOut);
      
      console.log('解析后的查询时间:');
      console.log('checkIn:', queryCheckIn);
      console.log('checkOut:', queryCheckOut);
      
      // 使用修复后的冲突检查逻辑
      const hasConflict = !(queryCheckOut <= dbCheckIn || queryCheckIn >= dbCheckOut);
      
      console.log('冲突检查结果:');
      console.log('queryCheckOut <= dbCheckIn:', queryCheckOut <= dbCheckIn);
      console.log('queryCheckIn >= dbCheckOut:', queryCheckIn >= dbCheckOut);
      console.log('!(...) (是否有冲突):', hasConflict);
      console.log('预期结果: 有冲突，应被过滤');
      console.log('实际结果:', hasConflict ? '正确 (有冲突)' : '错误 (无冲突)');
    });
    
  } catch (error) {
    console.error('测试错误:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    mongoose.disconnect();
  }
}

// 执行测试
async function runTest() {
  const isConnected = await connectDB();
  if (isConnected) {
    await testDateFormats();
  }
}

runTest();