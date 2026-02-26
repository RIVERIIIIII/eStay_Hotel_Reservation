import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 检查数据库中所有酒店的设施标签
async function checkAllAmenities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 查询所有已发布或已批准的酒店
    const hotels = await Hotel.find({
      status: { $in: ['approved', 'published'] }
    }).select('name address amenities');
    
    console.log('=== 所有酒店的设施标签 ===');
    if (hotels.length > 0) {
      // 统计所有设施标签
      const allAmenities = {};
      hotels.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   地址: ${hotel.address}`);
        console.log(`   设施: ${hotel.amenities}`);
        
        // 统计每个标签的出现次数
        if (Array.isArray(hotel.amenities)) {
          hotel.amenities.forEach(amenity => {
            if (allAmenities[amenity]) {
              allAmenities[amenity]++;
            } else {
              allAmenities[amenity] = 1;
            }
          });
        }
      });
      
      // 打印所有标签及其出现次数
      console.log('\n=== 所有设施标签统计 ===');
      Object.entries(allAmenities).forEach(([amenity, count]) => {
        console.log(`- ${amenity}: ${count}次`);
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

checkAllAmenities();
