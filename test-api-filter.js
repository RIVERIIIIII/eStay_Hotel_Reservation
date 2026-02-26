// 直接测试后端API的时间筛选功能
import axios from 'axios';

async function testApiFilter() {
  try {
    console.log('=== 直接测试后端API时间筛选功能 ===');
    
    // 北邮科技大厦的酒店ID
    const hotelId = '698b0a90cfa6fad121500848';
    
    // 测试冲突时间：2026-02-24 至 2026-02-26
    const response = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`, {
      params: {
        checkInDate: '2026-02-24',
        checkOutDate: '2026-02-26'
      }
    });
    
    console.log('API响应状态:', response.status);
    console.log('\n返回的房型列表:');
    response.data.hotel.roomTypes.forEach(room => {
      console.log(`- ${room.type}: ${room.price}元`);
    });
    
    // 检查标准双床房是否被过滤
    const hasStandardTwinRoom = response.data.hotel.roomTypes.some(room => room.type === '标准双床房');
    console.log('\n标准双床房是否存在:', hasStandardTwinRoom ? '是 (错误)' : '否 (正确)');
    console.log('期望结果:', '标准双床房应该被过滤掉');
    
  } catch (error) {
    console.error('测试错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testApiFilter();