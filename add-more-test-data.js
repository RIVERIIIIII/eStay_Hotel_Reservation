// 向数据库中添加更多的测试酒店数据
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

const Hotel = mongoose.model('Hotel', hotelSchema);

// 连接数据库
const connectDB = async () => {
  try {
    const mongodbUri = 'mongodb://localhost:27017/hotel-assistant';
    console.log('正在连接数据库:', mongodbUri);
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 30000 // 增加连接超时时间
    });
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 添加更多的测试酒店数据
const addMoreTestData = async () => {
  if (!(await connectDB())) {
    return;
  }
  
  try {
    // 生成一个测试用户ID
    const testUserId = new mongoose.Types.ObjectId();
    
    // 创建更多的测试酒店数据
    const moreHotels = [
      {
        name: '北京北邮科技大厦（蓟门桥地铁站店）',
        name_en: 'Beijing BUPT Science and Technology Building',
        address: '北京市海淀区西土城路10号',
        location: {
          type: 'Point',
          coordinates: [116.3474, 39.9630]
        },
        starRating: 4,
        roomTypes: [
          {
            type: '标准大床房',
            price: 409,
            description: '舒适的标准大床房，适合单人或双人入住'
          },
          {
            type: '商务大床房',
            price: 505,
            description: '商务大床房，提供工作桌和高速网络'
          },
          {
            type: '商务双床房',
            price: 505,
            description: '商务双床房，适合商务出行'
          },
          {
            type: '邮乐家庭房',
            price: 690,
            description: '家庭房，适合家庭入住'
          },
          {
            type: '豪华套房',
            price: 1012,
            description: '豪华套房，提供更舒适的住宿体验'
          },
          {
            type: '钟点房',
            price: 260,
            description: '钟点房，适合短暂休息'
          }
        ],
        price: 409,
        openingTime: '2018-01-01',
        description: '北京北邮科技大厦位于北京市海淀区西土城路10号，地理位置优越，交通便利。',
        status: 'published',
        createdBy: testUserId,
        amenities: ['免费WiFi', '停车场', '早餐', '健身房'],
        images: ['https://example.com/hotel3.jpg']
      },
      {
        name: '全季酒店（北京中关村学院南路店）',
        name_en: 'Ji Hotel (Zhongguancun Xueyuan South Road)',
        address: '北京市海淀区学院南路68号',
        location: {
          type: 'Point',
          coordinates: [116.3348, 39.9626]
        },
        starRating: 4,
        roomTypes: [
          {
            type: '大床房',
            price: 483,
            description: '舒适的大床房'
          },
          {
            type: '高级大床房',
            price: 529,
            description: '高级大床房，空间更大'
          },
          {
            type: '商务大床房',
            price: 557,
            description: '商务大床房，提供工作设施'
          },
          {
            type: '舒压高级大床房',
            price: 584,
            description: '舒压高级大床房，提供更舒适的床品'
          },
          {
            type: '双床房',
            price: 630,
            description: '双床房，适合两人入住'
          },
          {
            type: '舒压双床房',
            price: 657.99,
            description: '舒压双床房，提供更舒适的睡眠体验'
          },
          {
            type: '钟点房',
            price: 149.98,
            description: '钟点房，适合短暂休息'
          }
        ],
        price: 483,
        openingTime: '2019-06-01',
        description: '全季酒店（北京中关村学院南路店）位于北京市海淀区学院南路68号，周边高校众多，学术氛围浓厚。',
        status: 'published',
        createdBy: testUserId,
        amenities: ['免费WiFi', '停车场', '早餐', '健身房', '洗衣服务'],
        images: ['https://example.com/hotel4.jpg']
      },
      {
        name: '如家酒店（北京颐和园北宫门地铁站店）',
        name_en: 'Home Inn (Beijing Summer Palace North Gate Metro Station)',
        address: '北京市海淀区颐和园路11号',
        location: {
          type: 'Point',
          coordinates: [116.2754, 39.9994]
        },
        starRating: 3,
        roomTypes: [
          {
            type: '标准大床房',
            price: 329,
            description: '标准大床房'
          },
          {
            type: '商务大床房',
            price: 369,
            description: '商务大床房'
          },
          {
            type: '双床房',
            price: 399,
            description: '双床房'
          }
        ],
        price: 329,
        openingTime: '2017-03-01',
        description: '如家酒店（北京颐和园北宫门地铁站店）位于颐和园附近，交通便利，环境优美。',
        status: 'published',
        createdBy: testUserId,
        amenities: ['免费WiFi', '停车场', '早餐'],
        images: ['https://example.com/hotel5.jpg']
      }
    ];
    
    // 保存测试数据
    const savedHotels = await Hotel.insertMany(moreHotels);
    console.log(`\n已成功添加 ${savedHotels.length} 家测试酒店`);
    
    // 显示添加的酒店信息
    savedHotels.forEach(hotel => {
      console.log(`\n酒店：${hotel.name}`);
      console.log(`地址：${hotel.address}`);
      console.log(`房型数量：${hotel.roomTypes.length}`);
    });
    
    // 查询所有酒店，确认总数
    const allHotels = await Hotel.find();
    console.log(`\n数据库中共有 ${allHotels.length} 家酒店`);
    
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已断开');
    
  } catch (error) {
    console.error('添加测试数据失败:', error);
    process.exit(1);
  }
};

// 执行脚本
addMoreTestData();