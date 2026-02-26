const { MongoClient } = require('mongodb');

// 剩余酒店的坐标数据
const remainingHotels = [
  {
    name: '????',
    coordinates: [121.43518, 31.22348]  // 上海陆家嘴
  },
  {
    name: '北京北邮科技大厦（蓟门桥地铁站店）',
    coordinates: [116.35482, 39.9633]   // 北京北邮附近
  }
];

async function updateRemainingCoordinates() {
  try {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    // 连接到MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB server');
    
    // 获取hotel-booking数据库
    const db = client.db('hotel-booking');
    const hotelsCollection = db.collection('hotels');
    
    console.log('\n=== 更新剩余酒店坐标数据 ===');
    
    // 更新每个酒店的坐标
    for (const hotelData of remainingHotels) {
      try {
        const result = await hotelsCollection.updateOne(
          { name: hotelData.name },
          { $set: { 
              "location.coordinates": hotelData.coordinates,
              "location.type": "Point"
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ 更新成功: ${hotelData.name} [${hotelData.coordinates}]`);
        } else {
          console.log(`⚠️  未找到酒店: ${hotelData.name}`);
        }
      } catch (error) {
        console.error(`❌ 更新失败: ${hotelData.name} - ${error.message}`);
      }
    }
    
    // 查看更新后的结果
    console.log('\n=== 所有酒店坐标数据 ===');
    const hotels = await hotelsCollection.find().toArray();
    
    hotels.forEach((hotel, index) => {
      console.log(`\n${index + 1}. ${hotel.name}`);
      if (hotel.location && hotel.location.coordinates) {
        console.log(`   坐标: [${hotel.location.coordinates[0]}, ${hotel.location.coordinates[1]}]`);
        if (hotel.location.coordinates[0] !== 0 && hotel.location.coordinates[1] !== 0) {
          console.log(`   ✅ 坐标有效`);
        } else {
          console.log(`   ❌ 坐标为(0,0)`);
        }
      } else {
        console.log(`   ❌ 没有坐标数据`);
      }
    });
    
    // 关闭连接
    await client.close();
    console.log('\n✅ Disconnected from MongoDB server');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

updateRemainingCoordinates();
