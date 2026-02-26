import axios from 'axios';

// 测试标签筛选功能
async function testAmenitiesFilter() {
  try {
    console.log('=== 测试标签筛选功能 ===');

    // 测试1：单个标签筛选（免费房客WIFI）
    console.log('\n1. 测试单个标签筛选：免费房客WIFI');
    const response1 = await axios.get('http://localhost:5000/api/public/hotels', {
      params: {
        city: '北京',
        amenities: ['免费房客WIFI'],
        page: 1,
        pageSize: 10
      }
    });

    console.log('响应状态:', response1.status);
    console.log('找到的酒店数量:', response1.data.hotels.length);
    response1.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试2：多个标签筛选（会议厅 和 免费房客WIFI）
    console.log('\n2. 测试多个标签筛选：会议厅, 免费房客WIFI');
    const response2 = await axios.get('http://localhost:5000/api/public/hotels', {
      params: {
        city: '北京',
        amenities: ['会议厅', '免费房客WIFI'],
        page: 1,
        pageSize: 10
      }
    });

    console.log('响应状态:', response2.status);
    console.log('找到的酒店数量:', response2.data.hotels.length);
    response2.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试3：单个标签筛选（免费停车场）
    console.log('\n3. 测试单个标签筛选：免费停车场');
    const response3 = await axios.get('http://localhost:5000/api/public/hotels', {
      params: {
        city: '北京',
        amenities: ['免费停车场'],
        page: 1,
        pageSize: 10
      }
    });

    console.log('响应状态:', response3.status);
    console.log('找到的酒店数量:', response3.data.hotels.length);
    response3.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试4：不存在的标签
    console.log('\n4. 测试不存在的标签：不存在的设施');
    const response4 = await axios.get('http://localhost:5000/api/public/hotels', {
      params: {
        city: '北京',
        amenities: ['不存在的设施'],
        page: 1,
        pageSize: 10
      }
    });

    console.log('响应状态:', response4.status);
    console.log('找到的酒店数量:', response4.data.hotels.length);

    console.log('\n=== 标签筛选功能测试完成 ===');

  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAmenitiesFilter();
