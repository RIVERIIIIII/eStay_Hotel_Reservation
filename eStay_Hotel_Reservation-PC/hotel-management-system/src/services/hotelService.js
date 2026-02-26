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

const hotelService = {
  createHotel: async (hotelData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_PATHS.HOTELS.ADD}`,
        hotelData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getHotels: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.HOTELS.LIST}`,
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
  
  getHotelById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.HOTELS.DETAIL.replace(':id', id)}`,
        getAuthHeaders()
      );
      return response.data.hotel || response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateHotel: async (id, hotelData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}${API_PATHS.HOTELS.UPDATE.replace(':id', id)}`,
        hotelData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteHotel: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}${API_PATHS.HOTELS.DELETE.replace(':id', id)}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  uploadImages: async (images) => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image, `image-${index}.jpg`);
      });
      
      const response = await axios.post(
        `${API_BASE_URL}${API_PATHS.HOTELS.UPLOAD}`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default hotelService;