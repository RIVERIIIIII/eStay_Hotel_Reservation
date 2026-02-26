const http = require('http');

// 测试酒店列表API的距离计算功能
function testHotelListWithDistance() {
  const city = encodeURIComponent('北京');
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/public/hotels?latitude=39.9042&longitude=116.4074&city=${city}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ 酒店列表API测试结果:');
        console.log(`返回的酒店数量: ${response.hotels.length}`);
        
        response.hotels.forEach((hotel, index) => {
          console.log(`\n${index + 1}. ${hotel.name}`);
          console.log(`   距离: ${hotel.distance ? `${hotel.distance.toFixed(2)} 公里` : '无距离数据'}`);
          console.log(`   评分: ${hotel.averageRating || 0}`);
          console.log(`   价格: ${hotel.price}`);
        });
      } catch (error) {
        console.error('❌ 解析JSON失败:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error);
  });

  req.end();
}

// 测试推荐酒店API的距离计算功能
function testFeaturedHotelsWithDistance() {
  const city = encodeURIComponent('北京');
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/public/hotels/featured?latitude=39.9042&longitude=116.4074&city=${city}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n\n✅ 推荐酒店API测试结果:');
        console.log(`返回的酒店数量: ${response.hotels.length}`);
        
        response.hotels.forEach((hotel, index) => {
          console.log(`\n${index + 1}. ${hotel.name}`);
          console.log(`   距离: ${hotel.distance ? `${hotel.distance.toFixed(2)} 公里` : '无距离数据'}`);
          console.log(`   评分: ${hotel.averageRating || 0}`);
        });
      } catch (error) {
        console.error('❌ 解析JSON失败:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error);
  });

  req.end();
}

// 测试酒店详情API的距离计算功能
function testHotelDetailWithDistance(hotelId) {
  const city = encodeURIComponent('北京');
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/public/hotels/${hotelId}?latitude=39.9042&longitude=116.4074&city=${city}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n\n✅ 酒店详情API测试结果:');
        console.log(`酒店名称: ${response.hotel.name}`);
        console.log(`距离: ${response.hotel.distance ? `${response.hotel.distance.toFixed(2)} 公里` : '无距离数据'}`);
        console.log(`评分: ${response.hotel.averageRating || 0}`);
      } catch (error) {
        console.error('❌ 解析JSON失败:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error);
  });

  req.end();
}

// 运行测试
console.log('开始测试后端API的距离计算功能...\n');
console.log('测试点: 北京天安门 (39.9042, 116.4074)');

testHotelListWithDistance();

// 延迟测试推荐酒店API，确保前一个请求完成
setTimeout(() => {
  testFeaturedHotelsWithDistance();
}, 1000);

// 延迟测试酒店详情API，确保前一个请求完成
setTimeout(() => {
  // 使用实际的酒店ID
  testHotelDetailWithDistance('69899c7f33e8287ab062287a');
}, 2000);
