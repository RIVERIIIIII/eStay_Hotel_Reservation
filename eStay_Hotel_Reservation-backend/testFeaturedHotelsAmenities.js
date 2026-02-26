import axios from 'axios';

// 测试推荐酒店API的标签筛选功能
async function testFeaturedHotelsAmenities() {
  try {
    console.log('=== 测试推荐酒店API的标签筛选功能 ===');

    // 测试1：无标签筛选（默认推荐酒店）
    console.log('\n1. 无标签筛选（默认推荐酒店）');
    const response1 = await axios.get('http://localhost:5000/api/mobile/hotels/featured');
    console.log('响应状态:', response1.status);
    console.log('找到的酒店数量:', response1.data.hotels.length);
    response1.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试2：单个标签筛选（会议厅）
    console.log('\n2. 单个标签筛选：会议厅');
    const response2 = await axios.get('http://localhost:5000/api/mobile/hotels/featured?amenities=会议厅');
    console.log('响应状态:', response2.status);
    console.log('找到的酒店数量:', response2.data.hotels.length);
    response2.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试3：多个标签筛选（免费停车场 和 智能客控）
    console.log('\n3. 多个标签筛选：免费停车场 和 智能客控');
    const response3 = await axios.get('http://localhost:5000/api/mobile/hotels/featured?amenities=免费停车场&amenities=智能客控');
    console.log('响应状态:', response3.status);
    console.log('找到的酒店数量:', response3.data.hotels.length);
    response3.data.hotels.forEach(hotel => {
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

testFeaturedHotelsAmenities();
