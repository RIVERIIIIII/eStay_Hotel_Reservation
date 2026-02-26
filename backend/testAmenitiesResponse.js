import axios from 'axios';

// 测试API响应中的amenities字段
async function testAmenitiesResponse() {
  try {
    console.log('=== 测试API响应中的amenities字段 ===');

    // 测试公共API
    console.log('\n1. 测试公共API端点: /api/public/hotels');
    const publicResponse = await axios.get('http://localhost:5000/api/public/hotels', {
      params: {
        city: '北京',
        page: 1,
        pageSize: 10
      }
    });

    console.log('公共API响应状态:', publicResponse.status);
    console.log('公共API返回的酒店数量:', publicResponse.data.hotels.length);
    publicResponse.data.hotels.forEach((hotel, index) => {
      console.log(`\n  ${index + 1}. ${hotel.name}`);
      console.log(`     星级: ${hotel.starRating}星级酒店`);
      console.log(`     设施: ${hotel.amenities}`);
      console.log(`     设施类型: ${typeof hotel.amenities}`);
      if (Array.isArray(hotel.amenities)) {
        console.log(`     设施数量: ${hotel.amenities.length}`);
        hotel.amenities.forEach((amenity, i) => {
          console.log(`       ${i + 1}. ${amenity}`);
        });
      }
    });

    // 测试移动端API
    console.log('\n\n2. 测试移动端API端点: /api/mobile/hotels');
    const mobileResponse = await axios.get('http://localhost:5000/api/mobile/hotels', {
      params: {
        city: '北京',
        page: 1,
        pageSize: 10
      }
    });

    console.log('移动端API响应状态:', mobileResponse.status);
    console.log('移动端API返回的酒店数量:', mobileResponse.data.hotels.length);
    mobileResponse.data.hotels.forEach((hotel, index) => {
      console.log(`\n  ${index + 1}. ${hotel.name}`);
      console.log(`     星级: ${hotel.starRating}星级酒店`);
      console.log(`     设施: ${hotel.amenities}`);
      console.log(`     设施类型: ${typeof hotel.amenities}`);
      if (Array.isArray(hotel.amenities)) {
        console.log(`     设施数量: ${hotel.amenities.length}`);
        hotel.amenities.forEach((amenity, i) => {
          console.log(`       ${i + 1}. ${amenity}`);
        });
      }
    });

    // 测试推荐酒店API
    console.log('\n\n3. 测试推荐酒店API端点: /api/mobile/hotels/featured');
    const featuredResponse = await axios.get('http://localhost:5000/api/mobile/hotels/featured', {
      params: {
        city: '北京',
        limit: 5
      }
    });

    console.log('推荐酒店API响应状态:', featuredResponse.status);
    console.log('推荐酒店API返回的酒店数量:', featuredResponse.data.hotels.length);
    featuredResponse.data.hotels.forEach((hotel, index) => {
      console.log(`\n  ${index + 1}. ${hotel.name}`);
      console.log(`     星级: ${hotel.starRating}星级酒店`);
      console.log(`     设施: ${hotel.amenities}`);
      console.log(`     设施类型: ${typeof hotel.amenities}`);
      if (Array.isArray(hotel.amenities)) {
        console.log(`     设施数量: ${hotel.amenities.length}`);
        hotel.amenities.forEach((amenity, i) => {
          console.log(`       ${i + 1}. ${amenity}`);
        });
      }
    });

    console.log('\n\n=== 测试完成 ===');

  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAmenitiesResponse();
