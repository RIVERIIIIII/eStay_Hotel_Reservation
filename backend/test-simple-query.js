import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking')
.then(() => {
  console.log('MongoDB Connected');
  
  // 构建查询条件
  const query = {
    address: { $regex: '北京', $options: 'i' },
    status: { $in: ['published', 'approved'] }
  };

  console.log('Query Conditions:', JSON.stringify(query, null, 2));
  
  // 执行查询
  return Hotel.find(query)
    .select('name address status location')
    .lean();
})
.then(hotels => {
  console.log(`\nFound ${hotels.length} hotels in Beijing:`);
  
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
