import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL, API_PATHS } from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class ChatService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.unreadCountHandlers = [];
    this.connected = false;
  }

  // 初始化Socket.io连接
  initWebSocket() {
    if (this.socket && this.connected) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('未登录，无法建立WebSocket连接');
      return;
    }

    console.log('正在建立Socket.io连接...');
    
    try {
      // 使用Socket.io连接到后端
      this.socket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket.io连接已建立');
        this.connected = true;
        
        // 获取当前用户信息并加入房间
        const user = this.getUserInfo();
        console.log('当前用户信息:', user);
        
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          console.log('加入用户房间:', userId);
          this.socket.emit('join', userId);
        }
      });

      this.socket.on('newMessage', (message) => {
        console.log('收到新消息:', message);
        // 处理新消息
        this.messageHandlers.forEach(handler => handler(message));
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.io连接已关闭');
        this.connected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket.io错误:', error);
        this.connected = false;
      });
    } catch (error) {
      console.error('建立WebSocket连接失败:', error);
    }
  }

  // 获取用户信息
  getUserInfo() {
    try {
      const userStr = localStorage.getItem('user');
      console.log('从localStorage获取用户信息:', userStr);
      
      if (!userStr) {
        console.error('localStorage中没有用户信息');
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log('解析后的用户信息:', user);
      console.log('用户ID(_id):', user._id);
      console.log('用户ID(id):', user.id);
      
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 注册消息处理函数
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // 注册未读消息数量处理函数
  onUnreadCountUpdate(handler) {
    this.unreadCountHandlers.push(handler);
    return () => {
      this.unreadCountHandlers = this.unreadCountHandlers.filter(h => h !== handler);
    };
  }

  // 获取消息列表（首次加载使用HTTP）
  async getMessages() {
    try {
      console.log('获取消息列表...');
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.MESSAGES.LIST}`,
        getAuthHeaders()
      );
      console.log('消息列表获取成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取消息列表失败:', error);
      // 返回空数组，避免页面崩溃
      return { data: [] };
    }
  }

  // 发送消息
  async sendMessage(messageData) {
    try {
      console.log('开始发送消息...');
      
      // 1. 直接从localStorage获取用户信息，不依赖getUserInfo函数
      let senderId = 'default-user-id';
      let username = '默认用户';
      try {
        const userStr = localStorage.getItem('user');
        console.log('直接从localStorage获取user:', userStr);
        
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('直接解析的用户信息:', user);
          
          // 同时检查_id和id字段
          if (user && (user._id || user.id)) {
            senderId = user._id || user.id;
            console.log('使用从localStorage获取的用户ID:', senderId);
          } else {
            console.error('用户对象存在但没有ID字段:', user);
          }
          
          // 获取用户名
          if (user && user.username) {
            username = user.username;
            console.log('获取的用户名:', username);
          }
        } else {
          console.error('localStorage中没有user字段');
        }
      } catch (error) {
        console.error('直接获取用户信息失败:', error);
      }

      // 2. 检查senderId是否有效
      if (!senderId || senderId === 'default-user-id') {
        console.warn('使用默认用户ID:', senderId);
      }

      console.log('发送消息内容:', messageData);

      // 3. 添加默认的接收者ID
      const receiverId = messageData.receiverId || '60d5ecb3f1c8f8b3c8a8a8a8';
      
      const message = {
        ...messageData,
        receiverId,
        senderId,
        username // 添加用户名
      };

      console.log('完整消息数据:', message);

      // 4. 先尝试使用HTTP请求发送消息
      try {
        console.log('使用HTTP请求发送消息');
        const response = await axios.post(
          `${API_BASE_URL}${API_PATHS.MESSAGES.SEND}`,
          message,
          getAuthHeaders()
        );
        console.log('HTTP发送成功:', response.data);
        
        // 同时尝试通过Socket.io发送（用于实时通知）
        if (this.connected && this.socket) {
          console.log('同时通过Socket.io发送消息');
          this.socket.emit('sendMessage', message);
        }
        
        return response.data;
      } catch (httpError) {
        console.error('HTTP发送失败:', httpError);
        
        // HTTP失败后尝试使用Socket.io
        if (this.connected && this.socket) {
          console.log('尝试使用Socket.io发送消息');
          this.socket.emit('sendMessage', message);
          return { success: true };
        } else {
          throw httpError;
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 标记消息为已读
  async markAsRead(messageId) {
    try {
      console.log('标记消息已读:', messageId);
      
      // 先尝试HTTP请求
      try {
        const response = await axios.put(
          `${API_BASE_URL}${API_PATHS.MESSAGES.MARK_READ.replace(':messageId', messageId)}`,
          {},
          getAuthHeaders()
        );
        return response.data;
      } catch (httpError) {
        console.error('HTTP标记已读失败:', httpError);
        
        // HTTP失败后尝试使用Socket.io
        if (this.connected && this.socket) {
          this.socket.emit('markAsRead', { messageId });
          return { success: true };
        } else {
          throw httpError;
        }
      }
    } catch (error) {
      console.error('标记消息已读失败:', error);
      // 不抛出错误，避免影响用户体验
      return { success: false };
    }
  }

  // 获取未读消息数量（首次加载使用HTTP）
  async getUnreadCount() {
    try {
      console.log('获取未读消息数量...');
      const response = await axios.get(
        `${API_BASE_URL}${API_PATHS.MESSAGES.UNREAD_COUNT}`,
        getAuthHeaders()
      );
      console.log('未读消息数量:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      // 返回默认值，避免页面崩溃
      return { count: 0 };
    }
  }

  // 关闭Socket.io连接
  closeWebSocket() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (error) {
        console.error('关闭WebSocket连接失败:', error);
      }
      this.socket = null;
      this.connected = false;
    }
  }
}

// 导出单例实例
const chatService = new ChatService();
export default chatService;