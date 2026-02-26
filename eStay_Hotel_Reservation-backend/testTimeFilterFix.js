// 测试修复后的时间筛选逻辑

// 模拟酒店房间的占用情况
const hotel = {
  roomTypes: [
    {
      type: "标准双床房",
      occupied: {
        checkInDate: "2026-02-24T00:00:00.000Z",
        checkOutDate: "2026-02-26T00:00:00.000Z"
      }
    },
    {
      type: "标准大床房",
      occupied: null
    }
  ]
};

// 模拟用户查询的时间
const checkInDate = "2026-02-26";
const checkOutDate = "2026-02-27";

const checkIn = new Date(checkInDate);
const checkOut = new Date(checkOutDate);

console.log('=== 测试时间筛选修复 ===');
console.log('查询 checkIn:', checkIn);
console.log('查询 checkOut:', checkOut);

// 模拟修复后的时间冲突检测逻辑
const availableRoomTypes = hotel.roomTypes.filter(roomType => {
  if (!roomType.occupied) {
    return true;
  }
  
  const occupiedCheckIn = new Date(roomType.occupied.checkInDate);
  const occupiedCheckOut = new Date(roomType.occupied.checkOutDate);
  
  // 修复后的冲突检测逻辑
  const hasConflict = !(checkOut < occupiedCheckIn || checkIn > occupiedCheckOut);
  
  console.log(`\n房型: ${roomType.type}`);
  console.log(`占用 checkIn: ${occupiedCheckIn}`);
  console.log(`占用 checkOut: ${occupiedCheckOut}`);
  console.log(`是否冲突: ${hasConflict}`);
  console.log(`是否可用: ${!hasConflict}`);
  
  return !hasConflict;
});

console.log('\n=== 测试结果 ===');
console.log('可用房型:', availableRoomTypes.map(rt => rt.type));
console.log('可用房型数量:', availableRoomTypes.length);
