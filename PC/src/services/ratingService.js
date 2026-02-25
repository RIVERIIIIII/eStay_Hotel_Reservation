import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 评分服务，对应API文档中的/ratings路由
const ratingService = {
  // 提交评分
  submitRating: async (hotelId, ratingData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ratings/${hotelId}`,
        ratingData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取酒店评分
  getHotelRatings: async (hotelId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ratings/hotel/${hotelId}`);
      return response.data.ratings || [];
    } catch (error) {
      throw error;
    }
  }
};

export default ratingService;
