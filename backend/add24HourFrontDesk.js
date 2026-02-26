import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

// 加载环境变量
dotenv.config();

// 为酒店添加"24小时前台"标签
async function add24HourFrontDesk() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 更新汉庭酒店，添加"24小时前台"标签
    const updatedHotel = await Hotel.findOneAndUpdate(
      { name: '汉庭酒店', address: '北京海淀区学院南路32号' },
      { $addToSet: { amenities: '24小时前台' } },
      { new: true, runValidators: true }
    );

    if (updatedHotel) {
      console.log('成功为酒店添加"24小时前台"标签：');
      console.log(`酒店名称: ${updatedHotel.name}`);
      console.log(`地址: ${updatedHotel.address}`);
      console.log(`设施: ${updatedHotel.amenities}`);
    } else {
      console.log('没有找到匹配的酒店');
    }

    // 再为其他几个酒店添加"24小时前台"标签
    const updatedHotel2 = await Hotel.findOneAndUpdate(
      { name: '北京北邮科技大厦（蓟门桥地铁站店）' },
      { $addToSet: { amenities: '24小时前台' } },
      { new: true, runValidators: true }
    );

    const updatedHotel3 = await Hotel.findOneAndUpdate(
      { name: '全季酒店（北京中关村学院南路店）' },
      { $addToSet: { amenities: '24小时前台' } },
      { new: true, runValidators: true }
    );

    console.log('\n=== 更新完成 ===');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

add24HourFrontDesk();
