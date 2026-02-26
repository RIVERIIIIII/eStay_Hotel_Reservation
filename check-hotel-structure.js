// 检查酒店文档的完整数据结构
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// 定义酒店模型
const HotelSchema = new mongoose.Schema({
  name: String
}, { strict: false });

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

// 检查酒店完整结构
async function checkHotelStructure() {
  try {
    // 查找北邮科技大厦
    const hotel = await Hotel.findOne({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    
    if (!hotel) {
      console.log('未找到北邮科技大厦');
      return;
    }
    
    console.log('=== 酒店完整数据结构 ===');
    console.log('酒店名称:', hotel.name);
    console.log('\n所有字段:');
    
    // 打印酒店文档的所有字段
    const hotelObj = hotel.toObject();
    Object.keys(hotelObj).forEach(key => {
      console.log(`- ${key}: ${typeof hotelObj[key]}`);
      
      // 如果是对象或数组，打印更详细的信息
      if (typeof hotelObj[key] === 'object' && hotelObj[key] !== null) {
        if (Array.isArray(hotelObj[key])) {
          console.log(`  数组长度: ${hotelObj[key].length}`);
          if (hotelObj[key].length > 0) {
            console.log(`  第一个元素结构:`, JSON.stringify(hotelObj[key][0], null, 2));
          }
        } else {
          console.log(`  对象内容:`, JSON.stringify(hotelObj[key], null, 2));
        }
      }
    });
    
    // 特别检查房间相关字段
    console.log('\n=== 房间信息检查 ===');
    if (hotelObj.roomTypes) {
      console.log('roomTypes 字段存在，类型:', typeof hotelObj.roomTypes);
      console.log('roomTypes 内容:', JSON.stringify(hotelObj.roomTypes, null, 2));
    } else if (hotelObj.rooms) {
      console.log('rooms 字段存在，类型:', typeof hotelObj.rooms);
      console.log('rooms 内容:', JSON.stringify(hotelObj.rooms, null, 2));
    } else {
      console.log('未找到房间相关字段');
    }
    
  } catch (error) {
    console.error('查询错误:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// 执行检查
async function runCheck() {
  const isConnected = await connectDB();
  if (isConnected) {
    await checkHotelStructure();
  }
}

runCheck();