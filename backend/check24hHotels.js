import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

dotenv.config();

async function check24hHotels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const hotels = await Hotel.find({ amenities: '24小时前台' }).select('name address amenities');
    
    console.log('包含"24小时前台"标签的酒店:');
    hotels.forEach(hotel => {
      console.log(`\n  - ${hotel.name}`);
      console.log(`    地址: ${hotel.address}`);
      console.log(`    设施: ${hotel.amenities}`);
    });
    
    console.log(`\n总共 ${hotels.length} 家酒店包含该标签`);
    
    // 检查是否有重复的酒店
    const hotelNames = hotels.map(h => h.name);
    const uniqueHotelNames = [...new Set(hotelNames)];
    console.log(`\n其中有 ${uniqueHotelNames.length} 家不同名称的酒店`);
    
    if (uniqueHotelNames.length !== hotels.length) {
      console.log('\n重复的酒店名称:');
      const nameCounts = {};
      hotelNames.forEach(name => {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      });
      for (const [name, count] of Object.entries(nameCounts)) {
        if (count > 1) {
          console.log(`  ${name}: ${count} 次`);
        }
      }
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check24hHotels();
