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

const authService = {
  register: async (userData) => {
    try {
      // 将account字段映射到username字段，以匹配后端API
      const registerData = {
        username: userData.account,
        email: userData.email,
        password: userData.password,
        role: userData.role
      };
      
      const response = await axios.post(
        `${API_BASE_URL}${API_PATHS.AUTH.REGISTER}`,
        registerData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  login: async (userData) => {
    try {
      // 直接使用account字段，因为后端API期望的是account字段
      const loginData = {
        account: userData.account,
        password: userData.password
      };
      
      console.log('Login data:', loginData);
      
      const response = await axios.post(
        `${API_BASE_URL}${API_PATHS.AUTH.LOGIN}`,
        loginData
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.AUTH.ME}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;