// 测试各种时间冲突的边界情况

// 测试函数
function testConflict(checkIn, checkOut, occupiedCheckIn, occupiedCheckOut, expectedConflict) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const occupiedCheckInDate = new Date(occupiedCheckIn);
  const occupiedCheckOutDate = new Date(occupiedCheckOut);
  
  // 当前的冲突判断条件
  const hasConflict = (
    (checkInDate >= occupiedCheckInDate && checkInDate < occupiedCheckOutDate) ||
    (checkOutDate > occupiedCheckInDate && checkOutDate <= occupiedCheckOutDate) ||
    (checkInDate <= occupiedCheckInDate && checkOutDate >= occupiedCheckOutDate)
  );
  
  // 修正后的冲突判断条件（考虑边界情况）
  const hasConflictFixed = (
    (checkInDate < occupiedCheckOutDate) && (checkOutDate > occupiedCheckInDate)
  );
  
  console.log(`\n测试: ${checkIn} - ${checkOut} vs ${occupiedCheckIn} - ${occupiedCheckOut}`);
  console.log(`预期冲突: ${expectedConflict}`);
  console.log(`当前逻辑: ${hasConflict} ${hasConflict === expectedConflict ? '✓' : '✗'}`);
  console.log(`修正逻辑: ${hasConflictFixed} ${hasConflictFixed === expectedConflict ? '✓' : '✗'}`);
}

// 测试用例
console.log('=== 时间冲突测试用例 ===');

// 1. 用户时间段在占用时间段内 - 应该冲突
testConflict('2026-02-24', '2026-02-25', '2026-02-23', '2026-02-26', true);

// 2. 占用时间段在用户时间段内 - 应该冲突
testConflict('2026-02-23', '2026-02-26', '2026-02-24', '2026-02-25', true);

// 3. 用户入住时间在占用时间段内 - 应该冲突
testConflict('2026-02-24', '2026-02-27', '2026-02-23', '2026-02-26', true);

// 4. 用户退房时间在占用时间段内 - 应该冲突
testConflict('2026-02-22', '2026-02-25', '2026-02-23', '2026-02-26', true);

// 5. 用户时间段在占用时间段之前 - 不应该冲突
testConflict('2026-02-21', '2026-02-22', '2026-02-23', '2026-02-26', false);

// 6. 用户时间段在占用时间段之后 - 不应该冲突
testConflict('2026-02-27', '2026-02-28', '2026-02-23', '2026-02-26', false);

// 7. 用户退房时间等于占用入住时间 - 不应该冲突
testConflict('2026-02-21', '2026-02-23', '2026-02-23', '2026-02-26', false);

// 8. 用户入住时间等于占用退房时间 - 不应该冲突
testConflict('2026-02-26', '2026-02-28', '2026-02-23', '2026-02-26', false);

// 9. 用户时间段与占用时间段完全相同 - 应该冲突
testConflict('2026-02-23', '2026-02-26', '2026-02-23', '2026-02-26', true);

// 10. 用户入住时间与占用入住时间相同，退房时间在占用时间段内 - 应该冲突
testConflict('2026-02-23', '2026-02-25', '2026-02-23', '2026-02-26', true);

// 11. 用户入住时间在占用时间段内，退房时间与占用退房时间相同 - 应该冲突
testConflict('2026-02-24', '2026-02-26', '2026-02-23', '2026-02-26', true);

console.log('\n=== 测试结束 ===');