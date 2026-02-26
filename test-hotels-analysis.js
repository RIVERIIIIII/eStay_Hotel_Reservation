// 使用CommonJS语法，因为package.json中没有设置type: module
const mongoose = require('mongoose');

// 使用环境变量或直接指定数据库连接字符串
const MONGODB_URI = 'mongodb://localhost:27017/hotel-booking';

// 连接到MongoDB
mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  // 定义临时的Hotel模型
  const HotelSchema = new mongoose.Schema({
    name: String,
    status: String,
    averageRating: Number,
    ratingCount: Number,
    location: Object
  }, { collection: 'hotels' });
  
  const Hotel = mongoose.model('Hotel', HotelSchema);
  
  // 定义临时的Rating模型
  const RatingSchema = new mongoose.Schema({
    hotelId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String
  }, { collection: 'ratings' });
  
  const Rating = mongoose.model('Rating', RatingSchema);
  
  // 1. 查找所有汉庭酒店
  console.log('=== All 汉庭 Hotels ===');
  const hantingHotels = await Hotel.find({ name: { $regex: '汉庭', $options: 'i' } });
  
  for (const hotel of hantingHotels) {
    console.log('Hotel name:', hotel.name);
    console.log('Hotel ID:', hotel._id);
    console.log('Hotel status:', hotel.status);
    console.log('Average rating:', hotel.averageRating);
    console.log('Rating count:', hotel.ratingCount);
    console.log('Has location:', hotel.location ? 'Yes' : 'No');
    if (hotel.location) {
      console.log('Location coordinates:', hotel.location.coordinates);
    }
    
    // 2. 查看该酒店的评分
    const ratings = await Rating.find({ hotelId: hotel._id });
    console.log('Number of ratings:', ratings.length);
    ratings.forEach((rating, index) => {
      console.log(`  Rating ${index + 1}:`, rating.rating, '-', rating.comment);
    });
    
    console.log('---');
  }
  
  // 3. 查找所有已发布或已批准的酒店
  console.log('\n=== All Approved/Published Hotels ===');
  const allHotels = await Hotel.find({ status: { $in: ['approved', 'published'] } });
  
  console.log(`Total hotels: ${allHotels.length}`);
  allHotels.forEach(hotel => {
    console.log(`${hotel.name} (${hotel.status}) - Rating: ${hotel.averageRating}, Count: ${hotel.ratingCount}`);
  });
  
  // 断开连接
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  mongoose.disconnect();
});
