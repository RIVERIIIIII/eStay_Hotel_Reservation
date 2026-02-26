import axios from 'axios';

async function testLogin() {
  try {
    console.log('测试登录功能...');
    
    // 测试使用username字段登录
    console.log('\n1. 使用username字段登录');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 登录成功!');
    console.log('用户信息:', response.data.user);
    console.log('令牌:', response.data.token.substring(0, 20) + '...');
    
    // 测试使用account字段登录
    console.log('\n2. 使用account字段登录');
    const response2 = await axios.post('http://localhost:5000/api/auth/login', {
      account: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 登录成功!');
    console.log('用户信息:', response2.data.user);
    console.log('令牌:', response2.data.token.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ 登录失败:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data.message);
      console.log('完整响应:', error.response.data);
    } else if (error.request) {
      console.log('没有收到响应:', error.request);
    } else {
      console.log('请求错误:', error.message);
    }
  }
}

testLogin();