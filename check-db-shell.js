// 在MongoDB shell中执行此文件来检查数据库内容

// 连接到正确的数据库
const hotelDB = db.getSiblingDB('hotel-assistant');

// 查询所有酒店
const hotels = hotelDB.hotels.find().toArray();

print(`\n数据库中共有 ${hotels.length} 家酒店:`);

hotels.forEach((hotel, index) => {
  print(`\n${index + 1}. ${hotel.name}`);
  print(`   地址: ${hotel.address}`);
  print(`   房型数量: ${hotel.roomTypes.length}`);
  print(`   房型:`);
  
  hotel.roomTypes.forEach(roomType => {
    print(`   - ${roomType.type} (${roomType.price}元)`);
    if (roomType.occupied) {
      print(`     占用: ${roomType.occupied.checkInDate} 至 ${roomType.occupied.checkOutDate}`);
    } else {
      print(`     占用: 否`);
    }
  });
});

print("\n查询完成！");