import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'merchant') {
      return [
        { path: '/merchant/hotels', label: '管理酒店' },
        { path: '/merchant/chat', label: '聊天', isIcon: true },
      ];
    }

    if (user.role === 'admin') {
      return [
        { path: '/admin/hotels', label: '审核酒店' },
        { path: '/admin/hotels/manage', label: '管理酒店' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>易宿酒店平台 - {user.role === 'merchant' ? '商户平台' : '管理员平台'}</h2>
        </div>
        <div className="navbar-user">
          <span className="user-info">
            欢迎，{user.username} ({user.role === 'merchant' ? '商户' : '管理员'})
          </span>
        </div>
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.isIcon ? (
                <div className="chat-icon" title="消费者聊天">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>
        <div className="navbar-actions">
          <button onClick={handleLogout} className="logout-btn">
            退出登录
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;