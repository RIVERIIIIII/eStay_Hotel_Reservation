import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking')
.then(() => {
  console.log('MongoDB Connected');
  
  // 查询所有酒店数据，包括状态和地址
  return Hotel.find({})
    .select('name address status location')
    .lean();
})
.then(hotels => {
  console.log(`Found ${hotels.length} hotels in total:`);
  
  hotels.forEach((hotel, index) => {
    console.log(`${index + 1}. ${hotel.name}`);
    console.log(`   Address: ${hotel.address}`);
    console.log(`   Status: ${hotel.status}`);
    console.log(`   Location: ${JSON.stringify(hotel.location)}`);
  });
  
  // 断开连接
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
