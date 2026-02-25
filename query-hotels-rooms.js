import mongoose from 'mongoose';
import Hotel from './backend/src/models/Hotel.js';

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/hotel-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected');
  
  // 执行查询，获取酒店名称和房型信息
  return Hotel.find({
    status: { $in: ['published', 'approved'] }
  }, {
    name: 1,
    roomTypes: 1
  }).lean();
})
.then(hotels => {
  console.log(`\nFound ${hotels.length} hotels:`);
  
  hotels.forEach((hotel, index) => {
    console.log(`${index + 1}. ${hotel.name}`);
    console.log(`   Room Types:`);
    
    hotel.roomTypes.forEach(roomType => {
      // 重点关注标准大床房
      const isStandardDouble = roomType.type.includes('标准') && roomType.type.includes('大床');
      if (isStandardDouble) {
        console.log(`   - ${roomType.type} (${roomType.price}元) **重点关注**`);
      } else {
        console.log(`   - ${roomType.type} (${roomType.price}元)`);
      }
      console.log(`     Description: ${roomType.description}`);
      
      if (roomType.occupied) {
        console.log(`     Occupied: YES`);
        console.log(`       Check-in: ${roomType.occupied.checkInDate}`);
        console.log(`       Check-out: ${roomType.occupied.checkOutDate}`);
        
        // 检查是否与查询时间段冲突
        const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
        const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
        const queryCheckIn = new Date('2026-02-24');
        const queryCheckOut = new Date('2026-02-26');
        
        const hasConflict = (
          (queryCheckIn >= occupiedCheckIn && queryCheckIn < occupiedCheckOut) ||
          (queryCheckOut > occupiedCheckIn && queryCheckOut <= occupiedCheckOut) ||
          (queryCheckIn <= occupiedCheckIn && queryCheckOut >= occupiedCheckOut)
        );
        
        console.log(`       Conflict with 2026-02-24 to 2026-02-26: ${hasConflict ? 'YES' : 'NO'}`);
      } else {
        console.log(`     Occupied: NO`);
      }
    });
    console.log('');
  });
  
  // 断开连接
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});