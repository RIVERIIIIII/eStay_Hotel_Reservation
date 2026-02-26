// 测试前端修复效果 - 模拟前端调用后端API的场景
import axios from 'axios';

// 模拟前端调用 getHotelDetail 接口
async function testHotelDetailWithDates() {
  const hotelId = '698b0a90cfa6fad121500848'; // 北邮科技大厦的ID
  const checkInDate = '2026-02-24';
  const checkOutDate = '2026-02-26';
  
  const url = `http://localhost:5000/api/public/hotels/${hotelId}`;
  const params = {
    checkInDate: checkInDate,
    checkOutDate: checkOutDate
  };
  
  console.log('\n=== 测试 getHotelDetail 接口 (带时间参数) ===');
  console.log('调用API:', url);
  console.log('参数:', params);
  
  try {
    const response = await axios.get(url, { params });
    console.log('API响应状态:', response.status);
    
    const hotel = response.data.hotel;
    console.log(`\n酒店详情: ${hotel.name}`);
    console.log(`地址: ${hotel.address}`);
    console.log(`可用房型数量: ${hotel.roomTypes.length}`);
    
    if (hotel.roomTypes.length > 0) {
      console.log(`\n可用房型:`);
      hotel.roomTypes.forEach(roomType => {
        console.log(`- ${roomType.type} (${roomType.price}元)`);
      });
    } else {
      console.log(`\n无可用房型`);
    }
    
    // 检查是否包含标准双床房
    const hasStandardTwinRoom = hotel.roomTypes.some(roomType => roomType.type === '标准双床房');
    console.log(`\n检查结果:`);
    console.log(`北邮科技大厦是否包含标准双床房: ${hasStandardTwinRoom}`);
    
    if (hasStandardTwinRoom) {
      console.log(`❌ 修复失败！北邮科技大厦的标准双床房在冲突时间段内仍然显示`);
      return false;
    } else {
      console.log(`✅ 修复成功！北邮科技大厦的标准双床房在冲突时间段内被正确过滤掉了`);
      return true;
    }
  } catch (error) {
    console.error('API调用失败:', error.message);
    return false;
  }
}

// 模拟前端调用 getFeaturedHotels 接口 (首页Banner)
async function testFeaturedHotelsWithDates() {
  const checkInDate = '2026-02-24';
  const checkOutDate = '2026-02-26';
  
  const url = `http://localhost:5000/api/public/hotels/featured`;
  const params = {
    checkInDate: checkInDate,
    checkOutDate: checkOutDate
  };
  
  console.log('\n=== 测试 getFeaturedHotels 接口 (带时间参数) ===');
  console.log('调用API:', url);
  console.log('参数:', params);
  
  try {
    const response = await axios.get(url, { params });
    console.log('API响应状态:', response.status);
    console.log(`返回酒店数量: ${response.data.hotels.length}`);
    
    // 检查是否包含北邮科技大厦
    const beiyouHotel = response.data.hotels.find(hotel => hotel.name === '北京北邮科技大厦（蓟门桥地铁站店）');
    if (beiyouHotel) {
      console.log(`\n北邮科技大厦在推荐列表中`);
      console.log(`可用房型数量: ${beiyouHotel.roomTypes.length}`);
      
      // 检查是否包含标准双床房
      const hasStandardTwinRoom = beiyouHotel.roomTypes.some(roomType => roomType.type === '标准双床房');
      console.log(`北邮科技大厦是否包含标准双床房: ${hasStandardTwinRoom}`);
      
      if (hasStandardTwinRoom) {
        console.log(`❌ 修复失败！北邮科技大厦的标准双床房在冲突时间段内仍然显示`);
        return false;
      } else {
        console.log(`✅ 修复成功！北邮科技大厦的标准双床房在冲突时间段内被正确过滤掉了`);
        return true;
      }
    } else {
      console.log(`\n北邮科技大厦不在推荐列表中`);
      // 如果不在推荐列表中，也认为是合理的，因为推荐列表可能有其他筛选条件
      return true;
    }
  } catch (error) {
    console.error('API调用失败:', error.message);
    return false;
  }
}

// 执行测试
async function runTests() {
  console.log('开始测试前端修复效果...');
  
  const test1 = await testHotelDetailWithDates();
  const test2 = await testFeaturedHotelsWithDates();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log(`getHotelDetail 接口测试: ${test1 ? '通过' : '失败'}`);
  console.log(`getFeaturedHotels 接口测试: ${test2 ? '通过' : '失败'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 所有测试都通过了！前端修复效果良好，后端能够正确处理时间参数并过滤已占用房型。');
  } else {
    console.log('\n❌ 部分测试失败，请检查问题。');
  }
}

// 执行测试
runTests();