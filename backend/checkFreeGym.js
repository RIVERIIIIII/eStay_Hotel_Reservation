import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 检查数据库中包含"免费健身房"标签的酒店
async function checkFreeGymHotels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 查询包含"免费健身房"标签且城市是"北京"的酒店
    const hotels = await Hotel.find({
      amenities: '免费健身房',
      address: { $regex: '北京', $options: 'i' },
      status: { $in: ['approved', 'published'] }
    }).select('name address amenities');
    
    console.log('=== 包含"免费健身房"标签的北京酒店 ===');
    if (hotels.length > 0) {
      hotels.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   地址: ${hotel.address}`);
        console.log(`   设施: ${hotel.amenities}`);
      });
    } else {
      console.log('没有找到符合条件的酒店');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkFreeGymHotels();
