import axios from 'axios';

// 测试APP端界面上显示的所有设施标签
async function testAllAppTags() {
  try {
    console.log('=== 测试APP端界面上显示的所有设施标签 ===');

    // APP端界面上显示的设施标签
    const appTags = ['健身房', '游泳池', '免费WiFi', '免费停车', '行李寄存', '24小时前台'];

    // 测试每个标签
    for (const tag of appTags) {
      console.log(`\n测试标签: ${tag}`);
      const response = await axios.get(`http://localhost:5000/api/public/hotels?city=北京&amenities=${encodeURIComponent(tag)}`);
      console.log('响应状态:', response.status);
      console.log('找到的酒店数量:', response.data.hotels.length);
      response.data.hotels.forEach(hotel => {
        console.log(`  - ${hotel.name}: ${hotel.amenities}`);
      });
    }

    // 测试多个标签组合
    console.log('\n=== 测试多个标签组合 ===');
    console.log('测试标签: 免费WiFi, 健身房');
    const responseMultiple = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=免费WiFi&amenities=健身房');
    console.log('响应状态:', responseMultiple.status);
    console.log('找到的酒店数量:', responseMultiple.data.hotels.length);
    responseMultiple.data.hotels.forEach(hotel => {
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

testAllAppTags();
