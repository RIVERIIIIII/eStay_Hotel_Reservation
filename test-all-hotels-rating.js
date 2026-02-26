import axios from 'axios';
import mongoose from 'mongoose';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking')
.then(async () => {
  console.log('MongoDB Connected');
  
  // 定义临时的Hotel模型
  const HotelSchema = new mongoose.Schema({
    name: String,
    status: String,
    averageRating: Number,
    ratingCount: Number
  }, { collection: 'hotels' });
  
  const Hotel = mongoose.model('Hotel', HotelSchema);
  
  // 查找所有已发布或已批准的酒店
  const hotels = await Hotel.find({ status: { $in: ['approved', 'published'] } });
  
  console.log(`=== Testing Rating Capability for ${hotels.length} Hotels ===`);
  
  for (const hotel of hotels) {
    console.log(`\nHotel: ${hotel.name}`);
    console.log(`ID: ${hotel._id}`);
    console.log(`Status: ${hotel.status}`);
    console.log(`Current average rating: ${hotel.averageRating}`);
    console.log(`Current rating count: ${hotel.ratingCount}`);
    
    // 测试获取酒店评分API
    try {
      const ratingsResponse = await axios.get(`http://localhost:5000/api/ratings/hotel/${hotel._id}`);
      console.log(`Rating API status: ${ratingsResponse.status}`);
      console.log(`Number of ratings returned: ${ratingsResponse.data.ratings.length}`);
      console.log('✓ Can get hotel ratings');
    } catch (error) {
      console.log(`✗ Error getting hotel ratings: ${error.message}`);
    }
  }
  
  // 断开连接
  mongoose.disconnect();
  
  console.log('\n=== All Tests Completed ===');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  mongoose.disconnect();
});
