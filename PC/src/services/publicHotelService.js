import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// 公共酒店服务，对应API文档中的/public/hotels路由
const publicHotelService = {
  // 获取推荐酒店（用于首页Banner）
  getFeaturedHotels: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/hotels/featured`);
      return response.data.hotels || [];
    } catch (error) {
      throw error;
    }
  },
  
  // 获取酒店列表（支持筛选）
  getHotels: async (params = {}, method = 'GET') => {
    try {
      let response;
      if (method === 'POST') {
        response = await axios.post(`${API_BASE_URL}/public/hotels`, params);
      } else {
        response = await axios.get(`${API_BASE_URL}/public/hotels`, { params });
      }
      return response.data.hotels || [];
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个酒店详情
  getHotelById: async (id, params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/hotels/${id}`, { params });
      return response.data.hotel || response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default publicHotelService;
