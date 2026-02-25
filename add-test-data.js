// 在MongoDB shell中执行此文件来添加测试数据

// 更新一家酒店的房型，添加占用信息
db.hotels.updateOne(
  { name: "汉庭酒店" },
  { $set: { "roomTypes.0.occupied": { checkInDate: "2026-02-20", checkOutDate: "2026-02-25" } } }
);

// 验证更新结果
var updatedHotel = db.hotels.findOne({ name: "汉庭酒店" });
printjson(updatedHotel.roomTypes[0]);

print("测试数据添加完成！");