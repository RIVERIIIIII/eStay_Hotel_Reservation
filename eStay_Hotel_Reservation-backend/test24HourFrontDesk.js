import axios from 'axios';

// 测试"24小时前台"标签筛选功能
async function test24HourFrontDesk() {
  try {
    console.log('=== 测试"24小时前台"标签筛选功能 ===');

    // 测试1：使用"24小时前台"标签筛选
    console.log('\n1. 使用"24小时前台"标签筛选');
    const response1 = await axios.get('http://localhost:5000/api/public/hotels?city=北京&amenities=24小时前台');
    console.log('响应状态:', response1.status);
    console.log('找到的酒店数量:', response1.data.hotels.length);
    response1.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试2：查看APP端筛选请求的实际情况
    console.log('\n2. 模拟APP端的实际请求（选择24小时前台标签）');
    const appRequestUrl = 'http://localhost:5000/api/public/hotels?city=北京&checkInDate=2026-02-26&checkOutDate=2026-02-27&roomCount=1&adultCount=1&childCount=0&maxPrice=1300&amenities=24小时前台&page=1&pageSize=10';
    console.log('请求URL:', appRequestUrl);
    const response2 = await axios.get(appRequestUrl);
    console.log('响应状态:', response2.status);
    console.log('找到的酒店数量:', response2.data.hotels.length);
    
    // 测试3：检查APP端界面上显示的所有设施标签是否都有对应的数据库标签
    console.log('\n3. 检查APP端界面设施标签与数据库标签的对应关系');
    const appTags = ['健身房', '游泳池', '免费WiFi', '免费停车', '行李寄存', '24小时前台'];
    const databaseTags = ['健身房', '游泳池', '免费房客WIFI', 'WIFI', '??WiFi', '免费停车场', '免费停车', '行李寄存', '免费行李寄存'];
    
    appTags.forEach(tag => {
      const hasMatch = databaseTags.some(dbTag => tag.includes(dbTag) || dbTag.includes(tag));
      console.log(`  APP标签: ${tag} - 是否有数据库匹配: ${hasMatch}`);
    });

  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

test24HourFrontDesk();
