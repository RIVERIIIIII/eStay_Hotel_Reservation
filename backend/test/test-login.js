import axios from 'axios';

async function testLogin() {
  try {
    console.log('测试登录功能...');
    
    // 测试用户信息
    const testUser = {
      account: 'mobileuser',
      password: 'password123'
    };
    
    console.log('发送登录请求:', testUser);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('登录成功！');
    console.log('服务器响应:', response.data);
    
  } catch (error) {
    console.error('登录失败:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应头:', error.response.headers);
    }
  }
}

testLogin();
