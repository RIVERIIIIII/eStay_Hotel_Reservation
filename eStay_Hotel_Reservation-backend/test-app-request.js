import axios from 'axios';

// 模拟app端发送的请求
async function testAppRequest() {
  try {
    const requestBody = {
      city: '北京',
      // 添加日期筛选，测试完整功能
      checkInDate: '2026-03-01',
      checkOutDate: '2026-03-02',
      sortBy: 'distance', // 按距离排序
      page: 1,
      pageSize: 10,
      keyword: '',
      minPrice: '',
      maxPrice: '',
      starRating: '',
      amenities: []
    };

    const response = await axios.post('http://localhost:5000/api/public/hotels', requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('App Request Response Status:', response.status);
    console.log('Total Hotels:', response.data.hotels.length);
    console.log('Pagination:', response.data.pagination);
    
    if (response.data.hotels.length > 0) {
      console.log('\nFirst 3 Hotels:');
      response.data.hotels.slice(0, 3).forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name} - ${hotel.address}`);
        console.log(`   Price: ${hotel.price} - Distance: ${hotel.distance ? hotel.distance.toFixed(2) + ' km' : 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    }
  }
}

// 运行测试
testAppRequest().catch(console.error);
