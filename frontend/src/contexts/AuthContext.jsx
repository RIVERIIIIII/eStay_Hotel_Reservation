import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        try {
          // 验证token是否有效
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // token无效，清除本地存储
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('开始登录， credentials:', credentials);
      const response = await authAPI.login(credentials);
      console.log('登录响应:', response);
      const { token, user } = response.data;
      
      console.log('获取到token:', token);
      console.log('获取到user:', user);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      setUser(user);
      
      console.log('登录成功，已设置用户状态');
      return { success: true, user };
    } catch (error) {
      console.log('登录失败， error:', error);
      console.log('error.response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.message || '登录失败' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('开始注册， userData:', userData);
      const response = await authAPI.register(userData);
      console.log('注册响应:', response);
      const { token, user } = response.data;
      
      console.log('获取到token:', token);
      console.log('获取到user:', user);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      setUser(user);
      
      console.log('注册成功，已设置用户状态');
      return { success: true };
    } catch (error) {
      console.log('注册失败， error:', error);
      console.log('error.response:', error.response);
      
      // 处理验证错误
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join('; ');
        return { 
          success: false, 
          error: errorMessages 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || '注册失败' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isMerchant: user?.role === 'merchant'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};