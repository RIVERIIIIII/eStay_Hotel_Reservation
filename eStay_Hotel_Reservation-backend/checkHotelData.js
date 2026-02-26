import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 连接数据库
async function checkHotelData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 查询所有酒店，只返回name和amenities字段
    const hotels = await Hotel.find().select('name amenities').limit(5);
    
    console.log('=== 酒店数据结构 ===');
    hotels.forEach((hotel, index) => {
      console.log(`\n${index + 1}. ${hotel.name}`);
      console.log('设施:', hotel.amenities);
      console.log('设施类型:', typeof hotel.amenities);
      if (Array.isArray(hotel.amenities)) {
        console.log('设施元素类型:', hotel.amenities.map(amenity => typeof amenity));
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkHotelData();
