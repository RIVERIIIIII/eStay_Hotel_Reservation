// 测试后端API的脚本
const axios = require('axios');

// 测试健康检查接口
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('健康检查接口:', response.status, response.data);
    return true;
  } catch (error) {
    console.error('健康检查接口失败:', error.message);
    return false;
  }
}

// 测试消息接口（需要有效的token）
async function testMessages() {
  try {
    // 这里需要一个有效的token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTc4YzBjZDA5Mjk4M2Q2Mjg2YzFkOSIsImlhdCI6MTY4ODgyMjA3OCwiZXhwIjoxNjg4OTA4NDc4fQ.5f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f';
    
    const response = await axios.get('http://localhost:5000/api/messages', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('消息接口:', response.status, response.data);
    return true;
  } catch (error) {
    console.error('消息接口失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试后端API...');
  
  const healthCheckResult = await testHealthCheck();
  console.log('\n');
  await testMessages();
  
  console.log('\n测试完成！');
}

runTests();
