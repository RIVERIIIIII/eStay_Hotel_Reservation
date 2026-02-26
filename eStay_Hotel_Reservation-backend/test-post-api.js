import axios from 'axios';

// 模拟app端发送的请求参数
async function testPostHotelsAPI() {
  try {
    const requestBody = {
      city: '北京',
      locationMode: false,
      roomCount: 1,
      adultCount: 2,
      childCount: 0,
      page: 1,
      pageSize: 10
    };

    const response = await axios.post('http://localhost:5000/api/public/hotels', requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('POST API Response Status:', response.status);
    console.log('Total Hotels:', response.data.hotels.length);
    console.log('Pagination:', response.data.pagination);
    
    if (response.data.hotels.length > 0) {
      console.log('First Hotel:', response.data.hotels[0]);
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
testPostHotelsAPI().catch(console.error);
