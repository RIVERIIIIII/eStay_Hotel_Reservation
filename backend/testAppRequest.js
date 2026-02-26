import axios from 'axios';
import fs from 'fs';

// 模拟APP端的实际请求
async function testAppRequest() {
  try {
    console.log('=== 模拟APP端的实际请求 ===');

    // 模拟APP端的请求参数
    const appRequestParams = {
      city: '北京',
      checkInDate: '2026-02-26',
      checkOutDate: '2026-02-27',
      roomCount: 1,
      adultCount: 1,
      childCount: 0,
      maxPrice: 1300,
      page: 1,
      pageSize: 10,
      amenities: ['免费WiFi', '免费停车'] // 注意：这里使用的是APP端可能使用的标签名称
    };

    console.log('APP端可能传递的标签:', appRequestParams.amenities);
    console.log('数据库中实际存在的标签:', ['免费房客WIFI', '会议厅', '洗衣房', '套房', '自助早餐', 'WIFI', '免费停车场', '智能客控', '免费健身房', '含早餐', '静音房', '近地铁', '免费洗衣服务', '机器人服务', '全屋地暖', '免费行李寄存', '接送机', '影音房']);

    // 测试1：使用APP端可能传递的标签名称
    console.log('\n1. 使用APP端可能传递的标签名称（免费WiFi, 免费停车）');
    let url1 = 'http://localhost:5000/api/public/hotels?city=北京&checkInDate=2026-02-26&checkOutDate=2026-02-27&roomCount=1&adultCount=1&childCount=0&maxPrice=1300&page=1&pageSize=10';
    appRequestParams.amenities.forEach(amenity => {
      url1 += `&amenities=${encodeURIComponent(amenity)}`;
    });
    console.log('请求URL:', url1);
    const response1 = await axios.get(url1);
    console.log('响应状态:', response1.status);
    console.log('找到的酒店数量:', response1.data.hotels.length);
    response1.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试2：使用数据库中实际存在的标签名称
    console.log('\n2. 使用数据库中实际存在的标签名称（免费房客WIFI, 免费停车场）');
    const correctAmenities = ['免费房客WIFI', '免费停车场'];
    let url2 = 'http://localhost:5000/api/public/hotels?city=北京&checkInDate=2026-02-26&checkOutDate=2026-02-27&roomCount=1&adultCount=1&childCount=0&maxPrice=1300&page=1&pageSize=10';
    correctAmenities.forEach(amenity => {
      url2 += `&amenities=${encodeURIComponent(amenity)}`;
    });
    console.log('请求URL:', url2);
    const response2 = await axios.get(url2);
    console.log('响应状态:', response2.status);
    console.log('找到的酒店数量:', response2.data.hotels.length);
    response2.data.hotels.forEach(hotel => {
      console.log(`  - ${hotel.name}: ${hotel.amenities}`);
    });

    // 测试3：检查APP端可能使用的设施列表
    console.log('\n3. 检查APP端可能使用的设施列表');
    console.log('APP端界面显示的设施:', ['健身房', '游泳池', '免费WiFi', '免费停车', '行李寄存', '24小时前台']);
    console.log('数据库中实际存在的设施:', ['免费房客WIFI', '会议厅', '洗衣房', '套房', '自助早餐', 'WIFI', '免费停车场', '智能客控', '免费健身房', '含早餐', '静音房', '近地铁', '免费洗衣服务', '机器人服务', '全屋地暖', '免费行李寄存', '接送机', '影音房']);

    // 生成映射表
    console.log('\n4. 建议的标签名称映射表:');
    const tagMapping = {
      '免费WiFi': ['免费房客WIFI', 'WIFI'],
      '免费停车': ['免费停车场'],
      '健身房': ['免费健身房'],
      '行李寄存': ['免费行李寄存'],
      '游泳池': [],
      '24小时前台': []
    };
    Object.entries(tagMapping).forEach(([appTag, dbTags]) => {
      console.log(`  APP界面标签: "${appTag}" → 数据库标签: ${dbTags.length > 0 ? dbTags.join(', ') : '无匹配'}`);
    });

  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAppRequest();
