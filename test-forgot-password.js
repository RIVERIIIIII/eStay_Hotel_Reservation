import axios from 'axios';

async function testForgotPassword() {
  try {
    const email = 'test123@example.com'; // 使用数据库中存在的邮箱
    console.log('发送忘记密码请求到邮箱:', email);
    
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: email
    });
    
    console.log('请求成功，响应:', response.data);
    console.log('请查看后端终端获取验证码');
    
  } catch (error) {
    console.error('请求失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testForgotPassword();