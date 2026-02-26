const { MongoClient } = require('mongodb');

// 中国主要城市的酒店坐标数据
const hotelCoordinates = [
  {
    name: '汉庭酒店',
    coordinates: [116.397428, 39.90923]  // 北京天安门附近
  },
  {
    name: '全季酒店',
    coordinates: [116.310348, 39.984718]  // 北京中关村
  },
  {
    name: '全季酒店（北京中关村学院南路店）',
    coordinates: [116.302469, 39.978433]  // 北京中关村学院南路
  },
  {
    name: '7天连锁酒店',
    coordinates: [121.473701, 31.230416]  // 上海外滩
  },
  {
    name: '如家快捷酒店',
    coordinates: [113.264385, 23.12911]   // 广州天河
  },
  {
    name: '锦江之星',
    coordinates: [120.15507, 30.274085]   // 杭州西湖
  },
  {
    name: '维也纳酒店',
    coordinates: [114.057868, 22.543099]  // 深圳南山
  }
];

async function updateHotelCoordinates() {
  try {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    // 连接到MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB server');
    
    // 获取hotel-booking数据库
    const db = client.db('hotel-booking');
    const hotelsCollection = db.collection('hotels');
    
    console.log('\n=== 更新酒店坐标数据 ===');
    
    // 更新每个酒店的坐标
    for (const hotelData of hotelCoordinates) {
      try {
        const result = await hotelsCollection.updateOne(
          { name: { $regex: hotelData.name, $options: 'i' } },
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
    console.log('\n=== 更新后酒店坐标数据 ===');
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

updateHotelCoordinates();
