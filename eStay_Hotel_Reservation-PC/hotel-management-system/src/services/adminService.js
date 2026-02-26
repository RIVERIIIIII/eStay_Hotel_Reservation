import axios from 'axios';
import { API_BASE_URL, API_PATHS } from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const adminService = {
  getPendingHotels: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.ADMIN.HOTELS_PENDING}`,
        {
          params,
          ...getAuthHeaders(),
        }
      );
      return response.data.hotels || [];
    } catch (error) {
      throw error;
    }
  },
  
  getHotels: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.ADMIN.HOTELS}`,
        {
          params,
          ...getAuthHeaders(),
        }
      );
      return response.data.hotels || [];
    } catch (error) {
      throw error;
    }
  },
  
  approveHotel: async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}${API_PATHS.ADMIN.APPROVE_HOTEL.replace(':id', id)}`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  rejectHotel: async (id, reason) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}${API_PATHS.ADMIN.REJECT_HOTEL.replace(':id', id)}`,
        { reason },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  publishHotel: async (id) => {
    try {
      console.log('Publishing hotel with ID:', id);
      console.log('API Path:', `${API_BASE_URL}${API_PATHS.ADMIN.PUBLISH_HOTEL.replace(':id', id)}`);
      const response = await axios.put(
        `${API_BASE_URL}${API_PATHS.ADMIN.PUBLISH_HOTEL.replace(':id', id)}`,
        {},
        getAuthHeaders()
      );
      console.log('Publish response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error publishing hotel:', error);
      // 如果发布API不存在，尝试使用更新API直接设置状态
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative update API');
          const response = await axios.put(
            `${API_BASE_URL}/admin/hotels/${id}`,
            { status: 'published' },
            getAuthHeaders()
          );
          console.log('Alternative update response:', response.data);
          return response.data;
        } catch (updateError) {
          console.error('Error with alternative update API:', updateError);
          throw updateError;
        }
      }
      throw error;
    }
  },
  
  offlineHotel: async (id) => {
    try {
      console.log('Offline hotel with ID:', id);
      console.log('API Path:', `${API_BASE_URL}${API_PATHS.ADMIN.OFFLINE_HOTEL.replace(':id', id)}`);
      const response = await axios.put(
        `${API_BASE_URL}${API_PATHS.ADMIN.OFFLINE_HOTEL.replace(':id', id)}`,
        {},
        getAuthHeaders()
      );
      console.log('Offline response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error offline hotel:', error);
      // 如果下线API不存在，尝试使用更新API直接设置状态
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative update API for offline');
          const response = await axios.put(
            `${API_BASE_URL}/admin/hotels/${id}`,
            { status: 'offline' },
            getAuthHeaders()
          );
          console.log('Alternative update response for offline:', response.data);
          return response.data;
        } catch (updateError) {
          console.error('Error with alternative update API for offline:', updateError);
          throw updateError;
        }
      }
      throw error;
    }
  },
};

export default adminService;