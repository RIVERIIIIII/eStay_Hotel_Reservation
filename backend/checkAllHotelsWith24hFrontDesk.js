import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 检查所有包含"24小时前台"标签的酒店
async function checkAllHotelsWith24hFrontDesk() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 查询所有包含"24小时前台"标签的酒店
    const hotelsWith24h = await Hotel.find({
      amenities: '24小时前台',
      status: { $in: ['approved', 'published'] }
    }).select('name address amenities');
    
    console.log('=== 包含"24小时前台"标签的酒店 ===');
    if (hotelsWith24h.length > 0) {
      hotelsWith24h.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   地址: ${hotel.address}`);
        console.log(`   设施: ${hotel.amenities}`);
      });
    } else {
      console.log('没有找到包含"24小时前台"标签的酒店');
    }

    // 查询所有酒店，看看哪些不包含"24小时前台"标签
    console.log('\n=== 不包含"24小时前台"标签的酒店 ===');
    const hotelsWithout24h = await Hotel.find({
      amenities: { $ne: '24小时前台' },
      status: { $in: ['approved', 'published'] }
    }).select('name address amenities');
    
    if (hotelsWithout24h.length > 0) {
      hotelsWithout24h.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   地址: ${hotel.address}`);
        console.log(`   设施: ${hotel.amenities}`);
      });
    } else {
      console.log('所有酒店都包含"24小时前台"标签');
    }

    // 检查是否有重复的酒店
    console.log('\n=== 检查重复酒店 ===');
    const allHotels = await Hotel.find({
      status: { $in: ['approved', 'published'] }
    }).select('name address');
    
    const hotelNames = allHotels.map(h => h.name);
    const uniqueHotelNames = [...new Set(hotelNames)];
    
    console.log(`总共有 ${allHotels.length} 家酒店`);
    console.log(`其中有 ${uniqueHotelNames.length} 家不同名称的酒店`);
    
    // 找出重复的酒店名称
    const duplicates = {};
    hotelNames.forEach(name => {
      duplicates[name] = (duplicates[name] || 0) + 1;
    });
    
    console.log('重复的酒店名称:');
    for (const [name, count] of Object.entries(duplicates)) {
      if (count > 1) {
        console.log(`  ${name}: ${count} 次`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkAllHotelsWith24hFrontDesk();
