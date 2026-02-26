// 检查所有与酒店相关的数据库
import mongoose from 'mongoose';

// 定义Hotel模型
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  name_en: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5
  },
  roomTypes: [{
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String,
    occupied: {
      checkInDate: Date,
      checkOutDate: Date
    }
  }],
  price: {
    type: Number,
    required: true
  },
  openingTime: Date,
  description: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amenities: [String],
  images: [String]
}, {
  timestamps: true
});

// 连接数据库
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000
    });
    return true;
  } catch (error) {
    console.error(`连接到 ${uri} 失败:`, error);
    return false;
  }
};

// 检查数据库中的酒店数据
const checkHotelData = async () => {
  try {
    // 在当前连接的数据库中注册Hotel模型
    const Hotel = mongoose.model('Hotel', hotelSchema);
    
    // 查询所有酒店数据
    const hotels = await Hotel.find();
    console.log(`数据库中共有 ${hotels.length} 家酒店:`);
    hotels.forEach(hotel => {
      console.log(`\n${hotel.name}`);
      console.log(`地址: ${hotel.address}`);
      console.log(`房型数量: ${hotel.roomTypes.length}`);
    });
    
  } catch (error) {
    console.error('检查酒店数据失败:', error);
  }
};

// 执行脚本
const main = async () => {
  console.log('检查所有与酒店相关的数据库...');
  
  // 尝试连接到可能的数据库
  const possibleDBs = [
    'hotel-assistant',
    'hotel-booking',
    'hotels',
    'booking'
  ];
  
  for (const dbName of possibleDBs) {
    const uri = `mongodb://localhost:27017/${dbName}`;
    console.log(`\n=== 尝试连接数据库: ${dbName} ===`);
    
    if (await connectDB(uri)) {
      await checkHotelData();
      // 断开连接，准备连接下一个数据库
      await mongoose.disconnect();
    }
  }
  
  console.log('\n检查完成！');
};

main();