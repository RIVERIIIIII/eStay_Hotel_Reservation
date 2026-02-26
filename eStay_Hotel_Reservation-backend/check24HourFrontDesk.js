import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 检查数据库中包含"24小时前台"标签的酒店
async function check24HourFrontDesk() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 查询包含"24小时前台"标签的酒店
    const hotels = await Hotel.find({
      amenities: '24小时前台',
      status: { $in: ['approved', 'published'] }
    }).select('name address amenities');
    
    console.log('=== 包含"24小时前台"标签的酒店 ===');
    if (hotels.length > 0) {
      hotels.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   地址: ${hotel.address}`);
        console.log(`   设施: ${hotel.amenities}`);
      });
    } else {
      console.log('没有找到包含"24小时前台"标签的酒店');
      
      // 检查所有酒店的设施标签
      console.log('\n=== 所有酒店的设施标签 ===');
      const allHotels = await Hotel.find({
        status: { $in: ['approved', 'published'] }
      }).select('name amenities');
      
      allHotels.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   设施: ${hotel.amenities}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

check24HourFrontDesk();
