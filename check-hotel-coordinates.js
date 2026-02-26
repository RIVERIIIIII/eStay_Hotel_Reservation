const { MongoClient } = require('mongodb');

async function checkHotelCoordinates() {
  try {
    const uri = 'mongodb://localhost:27017/Hotel-Assistant';
    const client = new MongoClient(uri);
    
    // 连接到数据库
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('Hotel-Assistant');
    const hotelsCollection = db.collection('hotels');

    // 查看所有酒店的坐标数据
    console.log('=== 酒店坐标数据检查 ===');
    const hotels = await hotelsCollection.find({}, { 
      projection: { name: 1, location: 1, _id: 0 } 
    }).toArray();

    let zeroCoordinateCount = 0;
    let validCoordinateCount = 0;

    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      
      if (hotel.location && hotel.location.coordinates) {
        const coords = hotel.location.coordinates;
        console.log(`   Coordinates: [${coords[0]}, ${coords[1]}]`);
        
        // 检查是否为(0,0)
        if (coords[0] === 0 && coords[1] === 0) {
          console.log(`   ❌ 坐标为(0,0)`);
          zeroCoordinateCount++;
        } else {
          console.log(`   ✅ 坐标有效`);
          validCoordinateCount++;
        }
      } else {
        console.log(`   ❌ 没有坐标数据`);
        zeroCoordinateCount++;
      }
      
      console.log('');
    });

    console.log('=== 统计信息 ===');
    console.log(`总酒店数: ${hotels.length}`);
    console.log(`有效坐标数: ${validCoordinateCount}`);
    console.log(`无效坐标数: ${zeroCoordinateCount}`);

    await client.close();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkHotelCoordinates();
