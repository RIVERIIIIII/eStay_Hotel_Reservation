// MongoDB 数据库初始化脚本
// 运行此脚本前请确保MongoDB服务已启动

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    // 连接到MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');
    console.log('Connected to MongoDB successfully');

    // 清空现有数据
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared');

    // 用户模型
    const UserSchema = new mongoose.Schema({
      username: { type: String, unique: true },
      password: String,
      role: String,
      createdAt: { type: Date, default: Date.now }
    });

    // 酒店模型
    const HotelSchema = new mongoose.Schema({
      name: String,
      name_en: String,
      address: String,
      starRating: Number,
      roomTypes: [{
        type: String,
        price: Number,
        description: String
      }],
      price: Number,
      openingTime: Date,
      description: String,
      status: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      amenities: [String],
      rejectReason: String
    }, { timestamps: true });

    const User = mongoose.model('User', UserSchema);
    const Hotel = mongoose.model('Hotel', HotelSchema);

    // 创建示例用户
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    const merchantUser = new User({
      username: 'merchant1',
      password: hashedPassword,
      role: 'merchant'
    });
    await merchantUser.save();

    // 创建示例酒店
    const sampleHotel = new Hotel({
      name: '测试酒店',
      name_en: 'Test Hotel',
      address: '北京市朝阳区测试路123号',
      starRating: 4,
      price: 300,
      openingTime: new Date('2023-01-01'),
      description: '这是一个测试酒店的描述信息',
      status: 'approved',
      createdBy: merchantUser._id,
      roomTypes: [
        {
          type: '标准大床房',
          price: 300,
          description: '舒适大床房，配备齐全'
        },
        {
          type: '豪华套房',
          price: 600,
          description: '豪华套房，享受至尊体验'
        }
      ],
      amenities: ['免费停车场', '无线网络', '健身房', '游泳池']
    });
    await sampleHotel.save();

    console.log('数据库初始化完成');
    console.log('默认管理员账号: admin / admin123');
    console.log('默认商家账号: merchant1 / admin123');
    console.log(`已创建示例酒店: ${sampleHotel.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();