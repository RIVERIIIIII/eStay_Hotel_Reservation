// 使用CommonJS语法，因为package.json中没有设置type: module
const axios = require('axios');
const mongoose = require('mongoose');

// 使用环境变量或直接指定数据库连接字符串
const MONGODB_URI = 'mongodb://localhost:27017/hotel-booking';

// 连接到MongoDB
mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  // 定义临时的模型
  const HotelSchema = new mongoose.Schema({
    name: String,
    status: String,
    averageRating: Number,
    ratingCount: Number
  }, { collection: 'hotels' });
  
  const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
  }, { collection: 'users' });
  
  const RatingSchema = new mongoose.Schema({
    hotelId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number
  }, { collection: 'ratings' });
  
  const Hotel = mongoose.model('Hotel', HotelSchema);
  const User = mongoose.model('User', UserSchema);
  const Rating = mongoose.model('Rating', RatingSchema);
  
  // 1. 获取测试用户
  let testUser = await User.findOne({ username: 'testuser' });
  if (!testUser) {
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('Created test user:', testUser._id);
  } else {
    console.log('Using existing test user:', testUser._id);
  }
  
  // 2. 获取已发布和已批准的酒店
  const hotels = await Hotel.find({ status: { $in: ['approved', 'published'] } });
  
  console.log(`\n=== Testing Rating Creation for ${hotels.length} Hotels ===`);
  
  // 3. 测试为每个酒店添加评分
  for (const hotel of hotels) {
    console.log(`\nTesting hotel: ${hotel.name}`);
    console.log(`ID: ${hotel._id}, Status: ${hotel.status}`);
    
    // 先删除该用户对该酒店的已有评分
    await Rating.deleteOne({ hotelId: hotel._id, userId: testUser._id });
    
    let createdRating = null;
    
    // 测试添加评分（注意：实际API需要认证，这里直接使用数据库操作）
    try {
      // 模拟API调用：创建评分
      const newRating = new Rating({
        hotelId: hotel._id,
        userId: testUser._id,
        rating: Math.random() * 2 + 3, // 3-5之间的随机评分
        comment: 'Test rating'
      });
      await newRating.save();
      createdRating = newRating;
      
      console.log('✓ Successfully added rating to database');
      
      // 验证酒店评分是否更新
      const updatedHotel = await Hotel.findById(hotel._id);
      console.log(`New average rating: ${updatedHotel.averageRating}`);
      console.log(`New rating count: ${updatedHotel.ratingCount}`);
      
    } catch (error) {
      console.log('✗ Failed to add rating:', error.message);
    }
    
    // 清理：删除刚添加的评分
    if (createdRating) {
      await Rating.deleteOne({ _id: createdRating._id });
      
      // 验证评分已删除
      const remainingRating = await Rating.findOne({ hotelId: hotel._id, userId: testUser._id });
      if (!remainingRating) {
        console.log('✓ Successfully cleaned up test rating');
      }
    }
  }
  
  // 断开连接
  mongoose.disconnect();
  
  console.log('\n=== All Rating Tests Completed ===');
})
.catch(err => {
  console.error('Error in test:', err);
  mongoose.disconnect();
});
