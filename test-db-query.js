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
    ratingCount: Number
  }, { collection: 'hotels' });
  
  const Hotel = mongoose.model('Hotel', HotelSchema);
  
  // 1. 查找所有酒店，包括状态
  console.log('=== All Hotels in Database ===');
  const allHotels = await Hotel.find({});
  
  allHotels.forEach(hotel => {
    console.log('Hotel name:', hotel.name);
    console.log('Hotel ID:', hotel._id);
    console.log('Hotel status:', hotel.status);
    console.log('Average rating:', hotel.averageRating);
    console.log('Rating count:', hotel.ratingCount);
    console.log('---');
  });
  
  // 2. 查找已发布的酒店
  console.log('\n=== Published Hotels ===');
  const publishedHotels = await Hotel.find({ status: 'published' });
  
  publishedHotels.forEach(hotel => {
    console.log('Hotel name:', hotel.name);
    console.log('Hotel ID:', hotel._id);
    console.log('Average rating:', hotel.averageRating);
    console.log('Rating count:', hotel.ratingCount);
    console.log('---');
  });
  
  // 3. 尝试按ID查找酒店
  console.log('\n=== Testing ID Query ===');
  const testHotelId = '69899c7f33e8287ab062287a';
  const testHotel = await Hotel.findById(testHotelId);
  
  if (testHotel) {
    console.log('Found hotel by ID:');
    console.log('Hotel name:', testHotel.name);
    console.log('Hotel status:', testHotel.status);
    console.log('Average rating:', testHotel.averageRating);
    console.log('Rating count:', testHotel.ratingCount);
  } else {
    console.log('Hotel not found by ID:', testHotelId);
  }
  
  // 断开连接
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  mongoose.disconnect();
});
