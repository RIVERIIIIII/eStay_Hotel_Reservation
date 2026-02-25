// 删除我添加的mock酒店数据
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

// 注册Hotel模型
const Hotel = mongoose.model('Hotel', hotelSchema);

// 连接数据库
const connectDB = async () => {
  try {
    const mongodbUri = 'mongodb://localhost:27017/hotel-assistant';
    console.log('正在连接数据库:', mongodbUri);
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 删除mock酒店数据
const removeMockData = async () => {
  if (!(await connectDB())) {
    return;
  }
  
  try {
    // 获取MongoDB集合
    const Hotel = mongoose.model('Hotel');
    
    // 删除我添加的mock酒店
    const mockHotels = [
      '北京北邮科技大厦（蓟门桥地铁站店）',
      '全季酒店（北京中关村学院南路店）',
      '如家酒店（北京颐和园北宫门地铁站店）'
    ];
    
    console.log('正在删除mock酒店数据...');
    const result = await Hotel.deleteMany({ name: { $in: mockHotels } });
    console.log(`已删除 ${result.deletedCount} 家mock酒店`);
    
    // 查询剩余的酒店数据
    const remainingHotels = await Hotel.find();
    console.log(`\n数据库中剩余 ${remainingHotels.length} 家酒店:`);
    remainingHotels.forEach(hotel => {
      console.log(`\n${hotel.name}`);
      console.log(`地址: ${hotel.address}`);
      console.log(`房型数量: ${hotel.roomTypes.length}`);
    });
    
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已断开');
    
  } catch (error) {
    console.error('删除mock数据失败:', error);
    process.exit(1);
  }
};

// 执行脚本
removeMockData();