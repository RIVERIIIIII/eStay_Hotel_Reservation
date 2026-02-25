const { MongoClient } = require('mongodb');

async function testDbConnection() {
  try {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    // 连接到MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB server');
    
    // 列出所有数据库
    const dbs = await client.db().admin().listDatabases();
    console.log('\n=== 所有数据库 ===');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // 检查hotel-booking数据库
    const db = client.db('hotel-booking');
    console.log('\n=== hotel-booking数据库 ===');
    
    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log('\n集合列表:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // 检查hotels集合
    const hotelsCollection = db.collection('hotels');
    const hotelCount = await hotelsCollection.countDocuments();
    console.log(`\nhotels集合中的文档数量: ${hotelCount}`);
    
    // 如果有酒店，查看前3个文档
    if (hotelCount > 0) {
      console.log('\n前3个酒店文档:');
      const hotels = await hotelsCollection.find().limit(3).toArray();
      hotels.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.name}`);
        console.log(`   评分: ${hotel.averageRating}`);
        console.log(`   位置: ${JSON.stringify(hotel.location || {})}`);
      });
    }
    
    // 关闭连接
    await client.close();
    console.log('\n✅ Disconnected from MongoDB server');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

testDbConnection();
