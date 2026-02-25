// 检查hotel-booking数据库中北邮科技大厦的房型占用情况
import mongoose from 'mongoose';

// 定义Hotel模型
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  roomTypes: [{
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    occupied: {
      checkInDate: Date,
      checkOutDate: Date
    }
  }]
});

// 连接数据库并检查北邮科技大厦数据
const checkBeiyouData = async () => {
  try {
    // 连接到hotel-booking数据库
    const uri = 'mongodb://localhost:27017/hotel-booking';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('连接到hotel-booking数据库成功');
    
    // 获取Hotel模型
    const Hotel = mongoose.model('Hotel', hotelSchema);
    
    // 查询北邮科技大厦数据
    const beiyouHotels = await Hotel.find({ name: '北京北邮科技大厦（蓟门桥地铁站店）' });
    console.log(`\n找到 ${beiyouHotels.length} 家北京北邮科技大厦:`);
    
    beiyouHotels.forEach((hotel, index) => {
      console.log(`\n=== 北京北邮科技大厦 #${index + 1} ===`);
      console.log(`名称: ${hotel.name}`);
      console.log(`地址: ${hotel.address}`);
      console.log(`房型数量: ${hotel.roomTypes.length}`);
      
      // 检查所有房型的占用情况
      console.log('\n所有房型的占用情况:');
      hotel.roomTypes.forEach((roomType, roomIndex) => {
        console.log(`\n房型 #${roomIndex + 1}:`);
        console.log(`类型: ${roomType.type}`);
        console.log(`价格: ${roomType.price} 元`);
        console.log(`占用信息: ${JSON.stringify(roomType.occupied, null, 2)}`);
        
        // 检查是否与查询时间段冲突
        if (roomType.occupied) {
          const queryCheckIn = new Date('2026-02-24');
          const queryCheckOut = new Date('2026-02-26');
          const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
          const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
          
          console.log(`查询时间段: 2026-02-24 至 2026-02-26`);
          console.log(`占用时间段: ${occupiedCheckIn.toISOString().split('T')[0]} 至 ${occupiedCheckOut.toISOString().split('T')[0]}`);
          
          const hasConflict = (
            (queryCheckIn >= occupiedCheckIn && queryCheckIn < occupiedCheckOut) ||
            (queryCheckOut > occupiedCheckIn && queryCheckOut <= occupiedCheckOut) ||
            (queryCheckIn <= occupiedCheckIn && queryCheckOut >= occupiedCheckOut)
          );
          
          console.log(`时间冲突: ${hasConflict}`);
        } else {
          console.log('未被占用');
        }
      });
    });
    
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已断开');
    
  } catch (error) {
    console.error('检查北邮科技大厦数据失败:', error);
    process.exit(1);
  }
};

// 执行脚本
checkBeiyouData();