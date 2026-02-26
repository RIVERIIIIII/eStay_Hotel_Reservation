import axios from 'axios';

// 测试前端API请求
async function testHotelListAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/mobile/hotels', {
      params: {
        city: '北京',
        checkInDate: '2026-02-26',
        checkOutDate: '2026-02-27',
        roomCount: 1,
        adultCount: 1,
        childCount: 0,
        maxPrice: 1300,
        page: 1,
        pageSize: 10
      }
    });

    console.log('API响应状态:', response.status);
    console.log('API响应数据:', response.data);

    // 检查响应中是否包含北邮科技大厦
    const beiyouHotel = response.data.hotels.find(hotel => 
      hotel.name.includes('北邮科技大厦')
    );

    if (beiyouHotel) {
      console.log('\n=== 北邮科技大厦信息 ===');
      console.log('酒店名称:', beiyouHotel.name);
      console.log('可用房型:', beiyouHotel.roomTypes.map(rt => rt.type));
      console.log('可用房型数量:', beiyouHotel.roomTypes.length);
    } else {
      console.log('\n=== 未找到北邮科技大厦 ===');
      console.log('所有酒店:', response.data.hotels.map(hotel => hotel.name));
    }

  } catch (error) {
    console.error('API请求失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但没有收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
  }
}

testHotelListAPI();
