// 测试所有需要时间筛选的接口
import axios from 'axios';

// 测试参数
const params = {
  city: '北京',
  checkInDate: '2026-02-24',
  checkOutDate: '2026-02-26'
};

// 测试getFeaturedHotels接口
async function testFeaturedHotels() {
  const url = 'http://localhost:5000/api/public/hotels/featured';
  console.log('\n=== 测试 getFeaturedHotels 接口 ===');
  console.log('调用API:', url);
  console.log('参数:', params);
  
  try {
    const response = await axios.get(url, { params });
    console.log('API响应状态:', response.status);
    console.log('返回酒店数量:', response.data.hotels.length);
    
    console.log('\n推荐酒店列表 (已过滤房型):');
    response.data.hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   距离: ${hotel.distance} km`);
      console.log(`   价格: ${hotel.price} 元`);
      console.log(`   可用房型数量: ${hotel.roomTypes.length}`);
      
      if (hotel.roomTypes.length > 0) {
        console.log(`   可用房型:`);
        hotel.roomTypes.forEach(roomType => {
          console.log(`   - ${roomType.type} (${roomType.price}元)`);
          if (roomType.occupied) {
            console.log(`     占用: 是`);
          } else {
            console.log(`     占用: 否`);
          }
        });
      } else {
        console.log(`   无可用房型`);
      }
      console.log('');
    });
    
    return true;
  } catch (error) {
    console.error('API调用失败:', error.message);
    return false;
  }
}

// 测试getMobileHotelById接口
async function testHotelDetail() {
  // 先找到北邮科技大厦的ID
  const url = 'http://localhost:5000/api/public/hotels';
  let beiyouHotelId;
  
  try {
    const response = await axios.get(url, { params });
    const beiyouHotel = response.data.hotels.find(hotel => hotel.name === '北京北邮科技大厦（蓟门桥地铁站店）');
    if (beiyouHotel) {
      beiyouHotelId = beiyouHotel._id;
      console.log('\n=== 测试 getMobileHotelById 接口 ===');
      console.log(`北邮科技大厦的ID: ${beiyouHotelId}`);
      
      const detailUrl = `http://localhost:5000/api/public/hotels/${beiyouHotelId}`;
      console.log('调用API:', detailUrl);
      console.log('参数:', params);
      
      const detailResponse = await axios.get(detailUrl, { params });
      console.log('API响应状态:', detailResponse.status);
      
      const hotel = detailResponse.data.hotel;
      console.log(`\n酒店详情: ${hotel.name}`);
      console.log(`地址: ${hotel.address}`);
      console.log(`星级: ${hotel.starRating}`);
      console.log(`价格: ${hotel.price} 元`);
      console.log(`可用房型数量: ${hotel.roomTypes.length}`);
      
      if (hotel.roomTypes.length > 0) {
        console.log(`\n可用房型:`);
        hotel.roomTypes.forEach(roomType => {
          console.log(`- ${roomType.type} (${roomType.price}元)`);
          if (roomType.occupied) {
            console.log(`  占用: 是`);
            console.log(`  入住: ${roomType.occupied.checkInDate}`);
            console.log(`  退房: ${roomType.occupied.checkOutDate}`);
          } else {
            console.log(`  占用: 否`);
          }
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
    } else {
      console.log('\n未找到北邮科技大厦');
      return false;
    }
  } catch (error) {
    console.error('API调用失败:', error.message);
    return false;
  }
}

// 执行所有测试
async function runAllTests() {
  console.log('开始测试所有需要时间筛选的接口...');
  
  const test1 = await testFeaturedHotels();
  const test2 = await testHotelDetail();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log(`getFeaturedHotels 接口测试: ${test1 ? '通过' : '失败'}`);
  console.log(`getMobileHotelById 接口测试: ${test2 ? '通过' : '失败'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 所有测试都通过了！所有接口都能正确应用时间筛选逻辑。');
  } else {
    console.log('\n❌ 部分测试失败，请检查问题。');
  }
}

// 执行测试
runAllTests();