import mongoose from 'mongoose';
import Hotel from './backend/src/models/Hotel.js';

// 连接到MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotel-assistant');
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

// 检查在指定时间段内是否有占用的房间
async function checkOccupiedRooms() {
  await connectDB();
  
  const checkInDate = new Date('2026-02-24');
  const checkOutDate = new Date('2026-02-26');
  
  console.log('检查时间段: 2026-02-24 至 2026-02-26');
  
  try {
    // 查询所有酒店
    const hotels = await Hotel.find();
    console.log(`\n找到 ${hotels.length} 家酒店`);
    
    let foundConflict = false;
    
    // 遍历所有酒店，检查房间占用情况
    hotels.forEach((hotel) => {
      console.log(`\n酒店: ${hotel.name}`);
      
      // 检查每个房型
      hotel.roomTypes.forEach((roomType) => {
        if (roomType.occupied) {
          const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
          const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
          
          // 检查时间冲突
          const hasConflict = (
            (checkInDate >= occupiedCheckIn && checkInDate < occupiedCheckOut) ||
            (checkOutDate > occupiedCheckIn && checkOutDate <= occupiedCheckOut) ||
            (checkInDate <= occupiedCheckIn && checkOutDate >= occupiedCheckOut)
          );
          
          if (hasConflict) {
            foundConflict = true;
            console.log(`  冲突房型: ${roomType.type}`);
            console.log(`    房间价格: ${roomType.price}元`);
            console.log(`    占用时间段: ${roomType.occupied.checkInDate} 至 ${roomType.occupied.checkOutDate}`);
            console.log(`    与查询时间段有冲突`);
          } else {
            console.log(`  可用房型: ${roomType.type}`);
            console.log(`    房间价格: ${roomType.price}元`);
            console.log(`    占用时间段: ${roomType.occupied.checkInDate} 至 ${roomType.occupied.checkOutDate}`);
            console.log(`    与查询时间段无冲突`);
          }
        } else {
          console.log(`  可用房型: ${roomType.type} (${roomType.price}元)`);
        }
      });
    });
    
    if (!foundConflict) {
      console.log('\n⚠️  没有发现与查询时间段冲突的房间，无法测试筛选功能');
      console.log('建议添加一条在2026-02-24至2026-02-26期间被占用的房间数据');
      
      // 添加一条测试数据
      console.log('\n正在添加测试数据...');
      await addTestData();
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 添加测试数据
async function addTestData() {
  try {
    // 查找一家酒店
    const hotel = await Hotel.findOne();
    
    if (hotel) {
      // 在第一个房型添加占用信息
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        hotel.roomTypes[0].occupied = {
          checkInDate: '2026-02-20',
          checkOutDate: '2026-02-25'
        };
        
        await hotel.save();
        console.log(`✅ 已在酒店 ${hotel.name} 的 ${hotel.roomTypes[0].type} 房型添加测试占用数据`);
        console.log(`   占用时间段: 2026-02-20 至 2026-02-25`);
      }
    }
  } catch (error) {
    console.error('添加测试数据失败:', error);
  }
}

// 执行检查
checkOccupiedRooms();