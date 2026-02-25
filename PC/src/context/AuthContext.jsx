import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import chatService from '../services/chatService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        console.log('Current user data:', currentUser);
        setUser(currentUser.user || currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (userData) => {
    try {
      const response = await authService.login(userData);
      setUser(response.user);
      
      // 登录成功后初始化WebSocket连接
      chatService.initWebSocket();
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // 注销时关闭WebSocket连接
    chatService.closeWebSocket();
    
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};