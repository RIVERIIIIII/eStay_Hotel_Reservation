import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // 发送验证码
  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('请输入邮箱地址');
      setLoading(false);
      return;
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      setLoading(false);
      return;
    }

    try {
      // 调用后端API发送验证码
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setCodeSent(true);
      setSuccess('验证码已发送到您的邮箱');
      setCountdown(60);
      setLoading(false);

      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || '网络错误，请稍后重试');
      setLoading(false);
    }
  };

  // 处理密码重置
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !verificationCode || !newPassword || !confirmNewPassword) {
      setError('请填写所有字段');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    try {
      // 调用后端API重置密码
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        token: verificationCode,
        newPassword
      });

      setSuccess('密码重置成功，请使用新密码登录');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || '网络错误，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3', marginBottom: '20px', textAlign: 'center' }}>易宿酒店平台</div>
        <h2>找回密码</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={codeSent}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="verificationCode">验证码</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                style={{ flex: 3 }}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || countdown > 0 || codeSent}
                style={{ flex: 1, whiteSpace: 'nowrap' }}
              >
                {countdown > 0 ? `${countdown}s后重发` : loading ? '发送中...' : '发送验证码'}
              </button>
            </div>
          </div>
          
          {codeSent && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">新密码</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">确认新密码</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
          <button type="submit" disabled={loading || !codeSent}>
            {loading ? '处理中...' : '重置密码'}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/login">返回登录</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
