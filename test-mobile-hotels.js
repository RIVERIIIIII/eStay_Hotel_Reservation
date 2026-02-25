import axios from 'axios';

async function testMobileHotels() {
  try {
    console.log('测试移动端酒店搜索接口:');
    
    // 测试酒店列表接口
    console.log('\n1. 测试酒店列表接口:');
    const response = await axios.get('http://localhost:5000/api/public/hotels');
    
    console.log('请求成功！');
    console.log('返回酒店数量:', response.data.hotels.length);
    console.log('分页信息:', response.data.pagination);
    
    // 测试推荐酒店接口
    console.log('\n2. 测试推荐酒店接口:');
    const featuredResponse = await axios.get('http://localhost:5000/api/public/hotels/featured');
    console.log('请求成功！');
    console.log('推荐酒店数量:', featuredResponse.data.hotels.length);
    
    // 如果有酒店，测试单个酒店详情接口
    if (response.data.hotels.length > 0) {
      const hotelId = response.data.hotels[0]._id;
      console.log('\n3. 测试单个酒店详情接口:');
      console.log('酒店ID:', hotelId);
      const hotelResponse = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`);
      console.log('请求成功！');
      console.log('酒店名称:', hotelResponse.data.hotel.name);
      console.log('酒店地址:', hotelResponse.data.hotel.address);
    } else {
      console.log('\n提示: 当前没有符合条件的酒店，请确保数据库中有已审核通过或已发布的酒店。');
    }
    
  } catch (error) {
    console.error('\n请求失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求发出但没有收到响应');
    } else {
      console.error('请求配置错误:', error.config);
    }
  }
}

testMobileHotels();