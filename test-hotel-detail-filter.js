// 测试酒店详情页的时间筛选功能
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// 北邮科技大厦的酒店ID
const hotelId = '698b0a90cfa6fad121500848';

// 测试函数
async function testHotelDetailFilter() {
  try {
    console.log('=== 测试酒店详情页时间筛选功能 ===');
    
    // 测试1：不传递时间参数（应该返回所有房型）
    console.log('\n测试1：不传递时间参数');
    const response1 = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`);
    console.log('状态码:', response1.status);
    console.log('返回的房型数量:', response1.data.hotel.roomTypes.length);
    console.log('返回的房型:', response1.data.hotel.roomTypes.map(room => room.type));
    
    // 测试2：传递冲突的时间参数（应该过滤掉标准双床房）
    console.log('\n测试2：传递冲突的时间参数 (2026-02-24 至 2026-02-26)');
    const response2 = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`, {
      params: {
        checkInDate: '2026-02-24',
        checkOutDate: '2026-02-26'
      }
    });
    console.log('状态码:', response2.status);
    console.log('返回的房型数量:', response2.data.hotel.roomTypes.length);
    console.log('返回的房型:', response2.data.hotel.roomTypes.map(room => room.type));
    
    // 检查标准双床房是否被过滤
    const hasStandardTwinRoom = response2.data.hotel.roomTypes.some(room => room.type === '标准双床房');
    console.log('标准双床房是否被过滤:', !hasStandardTwinRoom ? '是 ✓' : '否 ✗');
    
    // 测试3：传递不冲突的时间参数（应该返回所有房型）
    console.log('\n测试3：传递不冲突的时间参数 (2026-02-27 至 2026-02-28)');
    const response3 = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`, {
      params: {
        checkInDate: '2026-02-27',
        checkOutDate: '2026-02-28'
      }
    });
    console.log('状态码:', response3.status);
    console.log('返回的房型数量:', response3.data.hotel.roomTypes.length);
    console.log('返回的房型:', response3.data.hotel.roomTypes.map(room => room.type));
    
  } catch (error) {
    console.error('测试错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 执行测试
testHotelDetailFilter();