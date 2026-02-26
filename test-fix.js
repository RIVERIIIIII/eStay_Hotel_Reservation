import axios from 'axios';

// 测试修复后的房型筛选功能
async function testFixedFilter() {
  const url = 'http://localhost:5000/api/public/hotels';
  const params = {
    city: '北京',
    checkInDate: '2026-02-24',
    checkOutDate: '2026-02-26'
  };
  
  console.log('调用API:', url);
  console.log('参数:', params);
  
  try {
    const response = await axios.get(url, { params });
    console.log('\nAPI响应状态:', response.status);
    console.log('返回酒店数量:', response.data.hotels.length);
    
    console.log('\n酒店列表 (已过滤房型):');
    response.data.hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   距离: ${hotel.distance} km`);
      console.log(`   价格: ${hotel.price} 元`);
      console.log(`   可用房型数量: ${hotel.roomTypes.length}`);
      console.log(`   可用房型:`);
      
      hotel.roomTypes.forEach(roomType => {
        console.log(`   - ${roomType.type} (${roomType.price}元)`);
        if (roomType.occupied) {
          console.log(`     占用: 是`);
          console.log(`       入住: ${roomType.occupied.checkInDate}`);
          console.log(`       退房: ${roomType.occupied.checkOutDate}`);
        } else {
          console.log(`     占用: 否`);
        }
      });
      console.log('');
    });
  } catch (error) {
    console.error('API调用失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testFixedFilter();