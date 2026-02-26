import axios from 'axios';
import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';
import Rating from './src/models/Rating.js';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking')
.then(() => {
  console.log('MongoDB Connected');
  
  // 测试评分功能
  return testRatingFunctionality();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  mongoose.disconnect();
});

// 测试评分功能
async function testRatingFunctionality() {
  try {
    // 1. 查找一个已发布的酒店
    const hotel = await Hotel.findOne({ status: 'published' });
    if (!hotel) {
      console.error('No published hotel found');
      return;
    }
    
    console.log('Testing with hotel:', hotel.name);
    console.log('Current average rating:', hotel.averageRating);
    console.log('Current rating count:', hotel.ratingCount);
    
    // 2. 测试添加评分
    console.log('\n=== Testing Add Rating ===');
    const testRating = {
      hotelId: hotel._id,
      rating: 4.5,
      comment: 'Great hotel!'
    };
    
    // 注意：这里需要认证，所以直接使用MongoDB模型测试
    const newRating = new Rating({
      ...testRating,
      userId: new mongoose.Types.ObjectId() // 模拟用户ID
    });
    await newRating.save();
    
    console.log('Rating added successfully');
    
    // 3. 重新加载酒店，检查评分是否更新
    const updatedHotel = await Hotel.findById(hotel._id);
    console.log('\nUpdated hotel:');
    console.log('New average rating:', updatedHotel.averageRating);
    console.log('New rating count:', updatedHotel.ratingCount);
    
    // 4. 测试获取酒店评分API
    console.log('\n=== Testing Get Hotel Ratings API ===');
    const ratingsResponse = await axios.get(`http://localhost:5000/api/ratings/hotel/${hotel._id}`);
    console.log('API response status:', ratingsResponse.status);
    console.log('Number of ratings returned:', ratingsResponse.data.ratings.length);
    console.log('Pagination info:', ratingsResponse.data.pagination);
    
    // 5. 测试删除评分
    console.log('\n=== Testing Delete Rating ===');
    const deleteResult = await Rating.deleteOne({ _id: newRating._id });
    console.log('Delete result:', deleteResult);
    
    // 验证评分是否真的被删除
    const remainingRating = await Rating.findById(newRating._id);
    console.log('Rating still exists:', remainingRating !== null);
    
    // 6. 手动调用updateHotelAverageRating函数进行测试
    console.log('\n=== Testing Manual Rating Update ===');
    const RatingModel = mongoose.model('Rating');
    const HotelModel = mongoose.model('Hotel');
    
    // 计算平均评分
    const result = await RatingModel.aggregate([
      { $match: { hotelId: hotel._id } },
      { $group: { 
        _id: '$hotelId',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      } }
    ]);
    
    console.log('Aggregation result:', result);
    
    // 手动更新酒店信息
    if (result.length > 0) {
      await HotelModel.findByIdAndUpdate(hotel._id, {
        averageRating: result[0].averageRating,
        ratingCount: result[0].ratingCount
      });
    } else {
      // 如果没有评分，设置为null和0
      await HotelModel.findByIdAndUpdate(hotel._id, {
        averageRating: null,
        ratingCount: 0
      });
    }
    
    // 重新加载酒店，检查评分是否更新
    const finalHotel = await Hotel.findById(hotel._id);
    console.log('\nFinal hotel state:');
    console.log('Final average rating:', finalHotel.averageRating);
    console.log('Final rating count:', finalHotel.ratingCount);
    
    console.log('\n=== All Tests Completed ===');
    
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
