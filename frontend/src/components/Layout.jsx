import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* 导航栏 */}
      <nav style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container">
          <div className="flex-between">
            <div className="flex" style={{ gap: '2rem' }}>
              <Link to="/" style={{ 
                textDecoration: 'none', 
                color: '#007bff', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                易宿酒店平台
              </Link>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* 根据用户角色显示不同的导航选项 */}
                {isAdmin ? (
                  <Link to="/admin" style={{ textDecoration: 'none', color: '#333' }}>
                    酒店审核
                  </Link>
                ) : (
                  <>
                    <Link to="/hotels" style={{ textDecoration: 'none', color: '#333' }}>
                      我的酒店
                    </Link>
                    <Link to="/hotels/add" style={{ textDecoration: 'none', color: '#333' }}>
                      添加酒店
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex" style={{ gap: '1rem', alignItems: 'center' }}>
              <span>欢迎, {user?.username} ({user?.role})</span>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;