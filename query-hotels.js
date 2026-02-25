// 查询所有酒店及其房型信息
db.hotels.find({}, {name: 1, roomTypes: 1}).pretty();