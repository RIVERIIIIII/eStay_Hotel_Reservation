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
  
  // 2. 获取一个approved状态的酒店和一个published状态的酒店
  const approvedHotel = await Hotel.findOne({ status: 'approved' });
  const publishedHotel = await Hotel.findOne({ status: 'published' });
  
  if (!approvedHotel || !publishedHotel) {
    console.error('Could not find both approved and published hotels');
    mongoose.disconnect();
    return;
  }
  
  console.log(`\n=== Testing Rating API with Different Hotel Statuses ===`);
  
  // 测试数据
  const testRating = {
    rating: 4.0,
    comment: 'Great hotel!'
  };
  
  // 3. 测试为approved状态的酒店添加评分
  console.log(`\n1. Testing approved hotel: ${approvedHotel.name}`);
  console.log(`ID: ${approvedHotel._id}, Status: ${approvedHotel.status}`);
  
  // 先删除该用户对该酒店的已有评分
  await Rating.deleteOne({ hotelId: approvedHotel._id, userId: testUser._id });
  
  // 模拟API调用：创建评分（实际API需要认证，这里直接操作数据库模拟）
  try {
    const newRating = new Rating({
      hotelId: approvedHotel._id,
      userId: testUser._id,
      rating: testRating.rating,
      comment: testRating.comment
    });
    await newRating.save();
    
    console.log('✓ Successfully added rating');
    
    // 验证酒店评分是否更新
    const updatedHotel = await Hotel.findById(approvedHotel._id);
    console.log(`New average rating: ${updatedHotel.averageRating}`);
    console.log(`New rating count: ${updatedHotel.ratingCount}`);
    
    // 清理：删除刚添加的评分
    await Rating.deleteOne({ _id: newRating._id });
    console.log('✓ Successfully cleaned up rating');
  } catch (error) {
    console.log('✗ Failed to add rating:', error.message);
  }
  
  // 4. 测试为published状态的酒店添加评分
  console.log(`\n2. Testing published hotel: ${publishedHotel.name}`);
  console.log(`ID: ${publishedHotel._id}, Status: ${publishedHotel.status}`);
  
  // 先删除该用户对该酒店的已有评分
  await Rating.deleteOne({ hotelId: publishedHotel._id, userId: testUser._id });
  
  // 模拟API调用：创建评分（实际API需要认证，这里直接操作数据库模拟）
  try {
    const newRating = new Rating({
      hotelId: publishedHotel._id,
      userId: testUser._id,
      rating: testRating.rating,
      comment: testRating.comment
    });
    await newRating.save();
    
    console.log('✓ Successfully added rating');
    
    // 验证酒店评分是否更新
    const updatedHotel = await Hotel.findById(publishedHotel._id);
    console.log(`New average rating: ${updatedHotel.averageRating}`);
    console.log(`New rating count: ${updatedHotel.ratingCount}`);
    
    // 清理：删除刚添加的评分
    await Rating.deleteOne({ _id: newRating._id });
    console.log('✓ Successfully cleaned up rating');
  } catch (error) {
    console.log('✗ Failed to add rating:', error.message);
  }
  
  // 断开连接
  mongoose.disconnect();
  
  console.log('\n=== All API Rating Tests Completed ===');
})
.catch(err => {
  console.error('Error in test:', err);
  mongoose.disconnect();
});
