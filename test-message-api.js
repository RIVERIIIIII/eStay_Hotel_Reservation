// 测试消息API的脚本
const axios = require('axios');

// 测试发送消息
async function testSendMessage() {
  try {
    // 使用有效的token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTk2ZTFkMGY0ZDQzZWE4N2FhMWNmMjgiLCJpYXQiOjE3NzE5NDE5NTAsImV4cCI6MTc3MjU0Njc1MH0.zccJNWdJjlA3vuol8DhovUsSEQE0V-knxwUTiKoSmzI';
    
    const messageData = {
      receiverId: '698997f133e8287ab062284d', // 使用有效的merchant1用户ID
      content: '测试消息' // 消息内容
    };
    
    console.log('发送消息测试...');
    console.log('Token:', token);
    console.log('消息数据:', messageData);
    
    const response = await axios.post('http://localhost:5000/api/messages', messageData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    console.log('消息发送成功！');
    return true;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else if (error.request) {
      console.error('请求已发送但未收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试消息API...');
  console.log('=' * 50);
  
  await testSendMessage();
  
  console.log('=' * 50);
  console.log('测试完成！');
}

runTests();
