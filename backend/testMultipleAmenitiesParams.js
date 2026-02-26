import axios from 'axios';

// 测试多个amenities查询参数的情况（模拟移动端应用）
async function testMultipleAmenitiesParams() {
  try {
    console.log('=== 测试多个amenities查询参数的情况（模拟移动端应用） ===');

    // 测试1：单个标签（免费房客WIFI）
    console.log('\n1. 测试单个标签：免费房客WIFI');
    const response1 = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=免费房客WIFI&page=1&pageSize=10');
    console.log('响应状态:', response1.status);
    console.log('找到的酒店数量:', response1.data.hotels.length);
    response1.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试2：多个标签（使用多个amenities参数）
    console.log('\n2. 测试多个标签（免费房客WIFI 和 会议厅）');
    const response2 = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=免费房客WIFI&amenities=会议厅&page=1&pageSize=10');
    console.log('响应状态:', response2.status);
    console.log('找到的酒店数量:', response2.data.hotels.length);
    response2.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试3：多个标签（免费停车场 和 智能客控）
    console.log('\n3. 测试多个标签（免费停车场 和 智能客控）');
    const response3 = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=免费停车场&amenities=智能客控&page=1&pageSize=10');
    console.log('响应状态:', response3.status);
    console.log('找到的酒店数量:', response3.data.hotels.length);
    response3.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试4：多个标签（含早餐 和 接送机）
    console.log('\n4. 测试多个标签（含早餐 和 接送机）');
    const response4 = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=含早餐&amenities=接送机&page=1&pageSize=10');
    console.log('响应状态:', response4.status);
    console.log('找到的酒店数量:', response4.data.hotels.length);
    response4.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testMultipleAmenitiesParams();
