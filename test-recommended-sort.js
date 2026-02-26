import axios from 'axios';

// 测试推荐排序下的时间筛选功能
async function testRecommendedSort() {
  const url = 'http://localhost:5000/api/public/hotels';
  const params = {
    city: '北京',
    checkInDate: '2026-02-24',
    checkOutDate: '2026-02-26',
    sortBy: null // 使用推荐排序
  };
  
  console.log('调用API:', url);
  console.log('参数:', params);
  
  try {
    const response = await axios.get(url, { params });
    console.log('\nAPI响应状态:', response.status);
    console.log('返回酒店数量:', response.data.hotels.length);
    
    console.log('\n推荐排序酒店列表:');
    response.data.hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   平均评分: ${hotel.averageRating || '暂无评分'}`);
      console.log(`   星级: ${hotel.starRating}星`);
      console.log(`   距离: ${hotel.distance} km`);
      console.log(`   价格: ${hotel.price} 元`);
      console.log(`   可用房型:`);
      
      hotel.roomTypes.forEach(roomType => {
        const isStandardDouble = roomType.type.includes('标准') && roomType.type.includes('大床');
        if (isStandardDouble) {
          console.log(`   - ${roomType.type} (${roomType.price}元) **重点关注**`);
        } else {
          console.log(`   - ${roomType.type} (${roomType.price}元)`);
        }
      });
      console.log('');
    });
  } catch (error) {
    console.error('API调用失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testRecommendedSort();