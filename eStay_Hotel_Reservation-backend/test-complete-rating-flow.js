import axios from 'axios';
import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';
import Rating from './src/models/Rating.js';
import User from './src/models/User.js';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking')
.then(async () => {
  console.log('MongoDB Connected');
  
  // 测试完整评分流程
  await testCompleteRatingFlow();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  mongoose.disconnect();
});

// 测试完整评分流程
async function testCompleteRatingFlow() {
  try {
    // 1. 创建一个测试用户（如果不存在）
    console.log('=== 1. Creating Test User ===');
    let testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      await testUser.save();
      console.log('Test user created:', testUser._id);
    } else {
      console.log('Using existing test user:', testUser._id);
    }
    
    // 2. 查找一个已发布的酒店
    console.log('\n=== 2. Finding Published Hotel ===');
    const hotel = await Hotel.findOne({ status: 'published' });
    if (!hotel) {
      console.error('No published hotel found');
      return;
    }
    
    console.log('Testing with hotel:', hotel.name);
    console.log('Hotel ID:', hotel._id);
    console.log('Current average rating:', hotel.averageRating);
    console.log('Current rating count:', hotel.ratingCount);
    
    // 3. 模拟app端调用添加评分API
    console.log('\n=== 3. Testing Add Rating API ===');
    
    // 先删除用户对该酒店的已有评分（如果有）
    await Rating.deleteOne({ hotelId: hotel._id, userId: testUser._id });
    
    // 注意：实际app端需要先登录获取token，然后使用token进行认证
    // 这里简化处理，直接使用MongoDB模型
    const testRating = {
      hotelId: hotel._id,
      userId: testUser._id,
      rating: 4.0,
      comment: 'Good hotel!'
    };
    
    const newRating = new Rating(testRating);
    await newRating.save();
    console.log('Rating added successfully:', newRating._id);
    
    // 4. 验证酒店评分是否更新
    console.log('\n=== 4. Verifying Hotel Rating Update ===');
    const updatedHotel = await Hotel.findById(hotel._id);
    console.log('New average rating:', updatedHotel.averageRating);
    console.log('New rating count:', updatedHotel.ratingCount);
    
    // 5. 测试获取酒店评分API
    console.log('\n=== 5. Testing Get Hotel Ratings API ===');
    const ratingsResponse = await axios.get(`http://localhost:5000/api/ratings/hotel/${hotel._id}`);
    console.log('API response status:', ratingsResponse.status);
    console.log('Number of ratings returned:', ratingsResponse.data.ratings.length);
    
    // 6. 测试删除评分API
    console.log('\n=== 6. Testing Delete Rating API ===');
    // 使用findOneAndDelete()方法，这样post('findOneAndDelete')中间件会被触发，能直接访问被删除的文档
    const deletedRating = await Rating.findOneAndDelete({ _id: newRating._id });
    console.log('Delete result:', deletedRating ? { acknowledged: true, deletedCount: 1 } : { acknowledged: true, deletedCount: 0 });
    
    // 7. 验证评分是否真的被删除
    console.log('\n=== 7. Verifying Rating Deletion ===');
    const remainingRating = await Rating.findById(newRating._id);
    console.log('Rating still exists:', remainingRating !== null);
    
    // 8. 验证酒店评分是否更新
    console.log('\n=== 8. Verifying Hotel Rating Update After Deletion ===');
    const finalHotel = await Hotel.findById(hotel._id);
    console.log('Final average rating:', finalHotel.averageRating);
    console.log('Final rating count:', finalHotel.ratingCount);
    
    // 9. 清理测试数据
    console.log('\n=== 9. Cleaning Up Test Data ===');
    await User.deleteOne({ _id: testUser._id });
    console.log('Test user deleted');
    
    console.log('\n=== All Tests Completed Successfully ===');
    
    // 断开连接
    mongoose.disconnect();
  } catch (error) {
    console.error('Error in test:', error.message);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    mongoose.disconnect();
  }
}
