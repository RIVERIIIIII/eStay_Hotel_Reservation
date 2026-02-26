import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import dotenv from 'dotenv';

// 连接数据库
const connectDB = async () => {
  try {
    // 直接指定MongoDB URI
    const mongodbUri = 'mongodb://localhost:27017/hotel-assistant';
    const conn = await mongoose.connect(mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// 创建测试数据
const createTestData = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 清除现有数据
    await Hotel.deleteMany({});
    console.log('已清除现有酒店数据');

    // 生成一个测试用户ID
    const testUserId = new mongoose.Types.ObjectId();

    // 创建测试酒店数据
    const testHotels = [
      {
        name: '汉庭酒店',
        name_en: 'Hanting Hotel',
        address: '北京市朝阳区望京街道',
        location: {
          type: 'Point',
          coordinates: [116.4862, 39.9907]
        },
        starRating: 3,
        roomTypes: [
          {
            type: '大床房',
            price: 391,
            description: '舒适的大床房，适合单人或双人入住',
            occupied: {
              checkInDate: '2026-02-20',
              checkOutDate: '2026-02-25'
            }
          },
          {
            type: '商务大床房',
            price: 410,
            description: '商务大床房，提供工作桌和高速网络'
          },
          {
            type: '家庭房',
            price: 548,
            description: '家庭房，适合家庭入住'
          },
          {
            type: '钟点房',
            price: 120,
            description: '钟点房，适合短暂休息'
          }
        ],
        price: 391,
        openingTime: '2020-01-01',
        description: '汉庭酒店是一家经济实惠的连锁酒店，提供舒适的住宿环境和优质的服务。',
        status: 'published',
        createdBy: testUserId,
        amenities: ['免费WiFi', '停车场', '早餐'],
        images: ['https://example.com/hotel1.jpg']
      },
      {
        name: '全季酒店',
        name_en: 'Ji Hotel',
        address: '北京市海淀区中关村大街',
        location: {
          type: 'Point',
          coordinates: [116.3264, 39.9838]
        },
        starRating: 4,
        roomTypes: [
          {
            type: '大床房',
            price: 483,
            description: '舒适的大床房，提供高品质的床品'
          },
          {
            type: '高级大床房',
            price: 529,
            description: '高级大床房，提供更宽敞的空间'
          },
          {
            type: '标准大床房',
            price: 450,
            description: '标准大床房，经济实惠'
          }
        ],
        price: 483,
        openingTime: '2019-01-01',
        description: '全季酒店是一家中端连锁酒店，提供舒适的住宿环境和优质的服务。',
        status: 'published',
        createdBy: testUserId,
        amenities: ['免费WiFi', '停车场', '健身房'],
        images: ['https://example.com/hotel2.jpg']
      }
    ];

    // 保存测试数据
    const savedHotels = await Hotel.insertMany(testHotels);
    console.log(`已成功添加 ${savedHotels.length} 家测试酒店`);

    // 显示添加的酒店信息
    savedHotels.forEach(hotel => {
      console.log(`\n酒店：${hotel.name}`);
      console.log(`地址：${hotel.address}`);
      console.log(`房型：`);
      hotel.roomTypes.forEach(roomType => {
        console.log(`  - ${roomType.type} (${roomType.price}元)`);
        if (roomType.occupied) {
          console.log(`    占用：${roomType.occupied.checkInDate} 至 ${roomType.occupied.checkOutDate}`);
        } else {
          console.log(`    占用：否`);
        }
      });
    });

    // 断开数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已断开');

  } catch (error) {
    console.error('添加测试数据失败:', error);
    process.exit(1);
  }
};

// 执行脚本
createTestData();