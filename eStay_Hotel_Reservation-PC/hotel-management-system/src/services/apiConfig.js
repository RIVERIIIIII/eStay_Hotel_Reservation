// API配置文件
// 后端API基础URL
export const API_BASE_URL = 'http://localhost:5000/api';

// API路径常量
export const API_PATHS = {
  // 认证相关
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  
  // 酒店相关
  HOTELS: {
    ADD: '/hotels',
    LIST: '/hotels',
    DETAIL: '/hotels/:id',
    UPDATE: '/hotels/:id',
    DELETE: '/hotels/:id',
    UPLOAD: '/hotels/upload',
  },
  
  // 管理员相关
  ADMIN: {
    HOTELS_PENDING: '/admin/hotels/pending',
    HOTELS: '/admin/hotels',
    APPROVE_HOTEL: '/admin/hotels/:id/approve',
    REJECT_HOTEL: '/admin/hotels/:id/reject',
    PUBLISH_HOTEL: '/admin/hotels/:id/publish',
    OFFLINE_HOTEL: '/admin/hotels/:id/offline',
  },
  
  // 消息相关
  MESSAGES: {
    LIST: '/messages',
    SEND: '/messages',
    MARK_READ: '/messages/:messageId/read',
    UNREAD_COUNT: '/messages/unread-count',
  },
};