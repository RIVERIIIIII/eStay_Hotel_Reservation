// 检查hotel-booking数据库中的汉庭酒店数据
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

// 连接数据库并检查汉庭酒店数据
const checkHantingData = async () => {
  try {
    // 连接到hotel-booking数据库
    const uri = 'mongodb://localhost:27017/hotel-booking';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('连接到hotel-booking数据库成功');
    
    // 获取Hotel模型
    const Hotel = mongoose.model('Hotel', hotelSchema);
    
    // 查询汉庭酒店数据
    const hantingHotels = await Hotel.find({ name: '汉庭酒店' });
    console.log(`\n找到 ${hantingHotels.length} 家汉庭酒店:`);
    
    hantingHotels.forEach((hotel, index) => {
      console.log(`\n=== 汉庭酒店 #${index + 1} ===`);
      console.log(`名称: ${hotel.name}`);
      console.log(`地址: ${hotel.address}`);
      console.log(`房型数量: ${hotel.roomTypes.length}`);
      
      // 检查大床房的占用情况
      const bigBedRooms = hotel.roomTypes.filter(roomType => roomType.type === '大床房');
      bigBedRooms.forEach((roomType, roomIndex) => {
        console.log(`\n大床房 #${roomIndex + 1}:`);
        console.log(`价格: ${roomType.price} 元`);
        console.log(`占用信息: ${JSON.stringify(roomType.occupied, null, 2)}`);
        
        // 检查是否与查询时间段冲突
        if (roomType.occupied) {
          const queryCheckIn = new Date('2026-02-24');
          const queryCheckOut = new Date('2026-02-26');
          const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
          const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
          
          const hasConflict = (
            (queryCheckIn >= occupiedCheckIn && queryCheckIn < occupiedCheckOut) ||
            (queryCheckOut > occupiedCheckIn && queryCheckOut <= occupiedCheckOut) ||
            (queryCheckIn <= occupiedCheckIn && queryCheckOut >= occupiedCheckOut)
          );
          
          console.log(`与查询时间段 (2026-02-24 至 2026-02-26) 冲突: ${hasConflict}`);
        } else {
          console.log('未被占用');
        }
      });
    });
    
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已断开');
    
  } catch (error) {
    console.error('检查汉庭酒店数据失败:', error);
    process.exit(1);
  }
};

// 执行脚本
checkHantingData();