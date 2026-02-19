import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果是管理员访问根路径，则重定向到管理员页面
  if (isAdmin && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;