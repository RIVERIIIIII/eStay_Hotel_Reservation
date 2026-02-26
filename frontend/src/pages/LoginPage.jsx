import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    account: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.account || !formData.password) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      // 根据用户角色跳转到不同页面
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#007bff', marginBottom: '0.5rem' }}>易宿酒店平台</h1>
          <p style={{ color: '#6c757d' }}>商家登录</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="account" className="form-label">用户名/邮箱</label>
            <input
              type="text"
              id="account"
              name="account"
              className="form-input"
              value={formData.account}
              onChange={handleChange}
              placeholder="请输入用户名或邮箱"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#6c757d' }}>还没有账号？</span>
          <Link 
            to="/register" 
            style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              marginLeft: '0.5rem'
            }}
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;