import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token失效，清除本地存储并跳转到登录页
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// 酒店管理API
export const hotelAPI = {
  create: (hotelData) => api.post('/hotels', hotelData),
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  update: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),
  delete: (id) => api.delete(`/hotels/${id}`),
};

// 管理员API
export const adminAPI = {
  getPendingHotels: (params) => api.get('/admin/hotels/pending', { params }),
  getAllHotels: (params) => api.get('/admin/hotels', { params }),
  approveHotel: (id) => api.put(`/admin/hotels/${id}/approve`),
  rejectHotel: (id, reason) => api.put(`/admin/hotels/${id}/reject`, { reason }),
  publishHotel: (id) => api.put(`/admin/hotels/${id}/publish`),
  unpublishHotel: (id) => api.put(`/admin/hotels/${id}/unpublish`),
};

export default api;