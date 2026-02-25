const { MongoClient } = require('mongodb');

async function getHotelIds() {
  try {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    // 连接到MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB server');
    
    // 获取hotel-booking数据库
    const db = client.db('hotel-booking');
    const hotelsCollection = db.collection('hotels');
    
    // 查询所有酒店的ID和名称
    const hotels = await hotelsCollection.find({}, { projection: { _id: 1, name: 1 } }).toArray();
    
    console.log('\n=== 酒店ID列表 ===');
    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name} - ID: ${hotel._id}`);
    });
    
    // 关闭连接
    await client.close();
    console.log('\n✅ Disconnected from MongoDB server');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

getHotelIds();
