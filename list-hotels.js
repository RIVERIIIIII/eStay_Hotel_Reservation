// 在MongoDB shell中执行此文件来列出所有酒店名称

// 切换到正确的数据库
var hotelDB = db.getSiblingDB('hotel-assistant');

// 显示当前数据库
print("当前数据库:", hotelDB.getName());

// 列出所有集合
print("\n所有集合:");
hotelDB.getCollectionNames().forEach(function(collection) {
  print(collection);
});

// 显示酒店集合中的文档数量
var hotelCount = hotelDB.hotels.count();
print("\n酒店数量:", hotelCount);

// 列出前5个酒店的名称
print("\n前5个酒店:");
hotelDB.hotels.find({}, { name: 1 }).limit(5).forEach(function(hotel) {
  print(hotel.name);
});