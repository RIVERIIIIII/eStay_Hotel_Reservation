import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// 测试管理员登录
async function testAdminLogin() {
  try {
    console.log('🔍 测试管理员登录...');
    
    // 测试1：使用正确的用户名和密码登录
    console.log('\n1. 测试：使用正确的用户名和密码登录');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      account: 'lyw',
      password: '123456' // 假设密码是123456
    });
    
    if (response.status === 200) {
      console.log('✅ 登录成功!');
      console.log('用户信息:', response.data.user);
      console.log('令牌:', response.data.token.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('❌ 登录失败:');
    if (error.response) {
      // 服务器返回了错误响应
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data.message);
      console.log('完整响应:', error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('没有收到响应:', error.request);
    } else {
      // 请求配置出错
      console.log('请求错误:', error.message);
    }
  }
}

testAdminLogin();