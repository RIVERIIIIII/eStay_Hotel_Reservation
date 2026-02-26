import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// 更新所有酒店的图片URL
const updateImageUrls = async () => {
  try {
    await connectDB();
    
    // 查找所有有图片的酒店
    const hotels = await Hotel.find({ 
      $or: [
        { images: { $exists: true, $ne: [] } },
        { mainImage: { $exists: true, $ne: '' } }
      ] 
    });
    
    console.log(`Found ${hotels.length} hotels with images`);
    
    // 更新每个酒店的图片URL
    for (const hotel of hotels) {
      let updated = false;
      
      // 更新mainImage
      if (hotel.mainImage && hotel.mainImage.includes('localhost')) {
        hotel.mainImage = hotel.mainImage.replace('localhost', '10.0.2.2');
        updated = true;
      }
      
      // 更新images数组
      if (hotel.images && Array.isArray(hotel.images)) {
        for (let i = 0; i < hotel.images.length; i++) {
          if (hotel.images[i].includes('localhost')) {
            hotel.images[i] = hotel.images[i].replace('localhost', '10.0.2.2');
            updated = true;
          }
        }
      }
      
      // 如果有更新，保存酒店
      if (updated) {
        await hotel.save();
        console.log(`Updated hotel ${hotel.name}`);
      }
    }
    
    console.log('Image URL update completed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error updating image URLs:', error.message);
    process.exit(1);
  }
};

// 执行更新
updateImageUrls();
