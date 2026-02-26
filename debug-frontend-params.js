// 调试前端传递的日期参数
import axios from 'axios';
import express from 'express';

const app = express();
const PORT = 8080;

// 模拟前端发送的请求
async function simulateFrontendRequest(checkIn, checkOut) {
  try {
    console.log('\n=== 模拟前端请求 ===');
    console.log('原始日期参数:');
    console.log('  checkIn:', checkIn);
    console.log('  checkOut:', checkOut);
    
    // 模拟前端日期处理逻辑
    const formattedCheckIn = checkIn;
    const formattedCheckOut = checkOut;
    
    console.log('\n格式化后的日期参数:');
    console.log('  checkIn:', formattedCheckIn);
    console.log('  checkOut:', formattedCheckOut);
    
    // 发送请求到后端
    const response = await axios.get(`http://localhost:5000/api/public/hotels/698b0a90cfa6fad121500848`, {
      params: {
        checkInDate: formattedCheckIn,
        checkOutDate: formattedCheckOut
      }
    });
    
    console.log('\n后端响应:');
    console.log('  状态码:', response.status);
    console.log('  返回的房型数量:', response.data.hotel.roomTypes.length);
    console.log('  房型列表:', response.data.hotel.roomTypes.map(room => room.type));
    
    // 检查标准双床房是否存在
    const hasStandardTwinRoom = response.data.hotel.roomTypes.some(room => room.type === '标准双床房');
    console.log('\n标准双床房是否存在:', hasStandardTwinRoom ? '是 (错误)' : '否 (正确)');
    
  } catch (error) {
    console.error('测试错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 测试不同的日期格式
async function testDifferentFormats() {
  console.log('=== 测试不同的日期格式 ===');
  
  // 测试1: yyyy-MM-dd格式
  await simulateFrontendRequest('2026-02-24', '2026-02-26');
  
  // 测试2: yyyy-MM-ddTHH:mm:ss格式
  await simulateFrontendRequest('2026-02-24T00:00:00', '2026-02-26T00:00:00');
  
  // 测试3: yyyy-MM-ddTHH:mm:ss.SSSZ格式
  await simulateFrontendRequest('2026-02-24T00:00:00.000Z', '2026-02-26T00:00:00.000Z');
  
  // 测试4: 错误的日期格式
  await simulateFrontendRequest('2026/02/24', '2026/02/26');
}

// 执行测试
testDifferentFormats();