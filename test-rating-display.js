import axios from 'axios';

// 测试酒店详情页面的评分显示
async function testRatingDisplay() {
  try {
    // 1. 获取酒店列表，检查评分字段
    console.log('=== Testing Hotel List Rating Fields ===');
    const listResponse = await axios.get('http://localhost:5000/api/public/hotels?page=1&limit=10');
    
    console.log('List API Status:', listResponse.status);
    console.log('Number of hotels:', listResponse.data.hotels.length);
    
    if (listResponse.data.hotels.length > 0) {
      const firstHotel = listResponse.data.hotels[0];
      console.log('Hotel name:', firstHotel.name);
      console.log('Hotel ID:', firstHotel._id);
      console.log('Hotel ID type:', typeof firstHotel._id);
      console.log('Backend fields:');
      console.log('  averageRating:', firstHotel.averageRating);
      console.log('  ratingCount:', firstHotel.ratingCount);
      console.log('Frontend fields (mapped):');
      console.log('  rating:', firstHotel.rating);
      console.log('  reviewCount:', firstHotel.reviewCount);
      
      // 2. 获取酒店详情，检查评分字段
      console.log('\n=== Testing Hotel Detail Rating Fields ===');
      // 直接使用字符串ID
      const hotelId = firstHotel._id.toString();
      console.log('Using hotel ID:', hotelId);
      const detailResponse = await axios.get(`http://localhost:5000/api/public/hotels/${hotelId}`);
      
      console.log('Detail API Status:', detailResponse.status);
      const hotelDetail = detailResponse.data.hotel;
      console.log('Hotel name:', hotelDetail.name);
      console.log('Backend fields:');
      console.log('  averageRating:', hotelDetail.averageRating);
      console.log('  ratingCount:', hotelDetail.ratingCount);
      console.log('Frontend fields (mapped):');
      console.log('  rating:', hotelDetail.rating);
      console.log('  reviewCount:', hotelDetail.reviewCount);
      
      // 3. 验证映射是否正确
      console.log('\n=== Verifying Mapping ===');
      console.log('Average rating matches rating:', hotelDetail.averageRating === hotelDetail.rating);
      console.log('Rating count matches review count:', hotelDetail.ratingCount === hotelDetail.reviewCount);
    }
    
    console.log('\n=== All Tests Completed Successfully ===');
  } catch (error) {
    console.error('Error in test:', error.message);
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
  }
}

// 运行测试
testRatingDisplay();
