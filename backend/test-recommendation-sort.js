import axios from 'axios';

// 测试推荐排序功能
async function testRecommendationSort() {
  try {
    const requestBody = {
      city: '北京',
      // 不指定排序方式，应该使用推荐排序
      // sortBy: 'distance',
      page: 1,
      pageSize: 10,
      keyword: '',
      minPrice: '',
      maxPrice: '',
      starRating: '',
      amenities: []
    };

    const response = await axios.post('http://localhost:5000/api/public/hotels', requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Recommendation Sort Response Status:', response.status);
    console.log('Total Hotels:', response.data.hotels.length);
    
    if (response.data.hotels.length > 0) {
      console.log('\nHotels sorted by recommendation (averageRating -1, starRating -1, createdAt -1):');
      response.data.hotels.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name}`);
        console.log(`   Rating: ${hotel.averageRating || 'N/A'} - Star: ${hotel.starRating} - Distance: ${hotel.distance ? hotel.distance.toFixed(2) + ' km' : 'N/A'}`);
      });
      
      // 验证排序是否正确
      let isSortedCorrectly = true;
      let previousRating = Infinity;
      let previousStar = Infinity;
      
      for (const hotel of response.data.hotels) {
        const currentRating = hotel.averageRating || -1;
        const currentStar = hotel.starRating || -1;
        
        if (currentRating < previousRating) {
          // 评分降低，排序正确
          previousRating = currentRating;
          previousStar = currentStar;
        } else if (currentRating === previousRating) {
          // 评分相同，检查星级
          if (currentStar > previousStar) {
            // 星级升高，排序错误
            isSortedCorrectly = false;
            break;
          } else if (currentStar === previousStar) {
            // 星级相同，检查创建时间
            // 这里简化处理，不实际检查创建时间
          }
        } else {
          // 评分升高，排序错误
          isSortedCorrectly = false;
          break;
        }
      }
      
      console.log('\n排序验证结果:', isSortedCorrectly ? '✓ 推荐排序正确' : '✗ 推荐排序错误');
    }
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    }
  }
}

// 运行测试
testRecommendationSort().catch(console.error);
