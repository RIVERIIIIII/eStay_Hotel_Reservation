import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 测试用户信息（使用数据库中已有的用户）
const mobileUser = {
  account: 'testuser123',  // 普通用户，密码：password123
  password: 'password123'
};

// 酒店商家用户信息
const hotelUser = {
  account: 'merchant1',  // 商家用户，密码：password123
  password: 'password123'
};

async function testMessageSend() {
  try {
    console.log('开始测试消息发送功能...');
    
    // 1. 酒店商家登录，获取其ID
    console.log('1. 酒店商家登录，获取其ID...');
    const hotelLoginResponse = await axios.post('http://localhost:5000/api/auth/login', hotelUser);
    const hotelToken = hotelLoginResponse.data.token;
    const hotelUserId = hotelLoginResponse.data.user.id;
    console.log('酒店商家登录成功');
    console.log('酒店商家ID：', hotelUserId);
    
    // 2. 登录移动端用户，获取token
    console.log('2. 登录移动端用户...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', mobileUser);
    const token = loginResponse.data.token;
    console.log('移动端用户登录成功，获取到token');
    
    // 3. 发送消息给酒店商家
    console.log('3. 发送消息给酒店商家...');
    const messageContent = {
      receiverId: hotelUserId,
      content: '您好，我想咨询一下贵酒店的预订政策。'
    };
    
    const messageResponse = await axios.post('http://localhost:5000/api/messages', messageContent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('消息发送成功！');
    console.log('发送的消息内容：', messageContent.content);
    console.log('接收者ID：', messageContent.receiverId);
    console.log('服务器返回的消息ID：', messageResponse.data.message._id);
    
    // 4. 酒店商家获取消息列表
    console.log('4. 酒店商家获取消息列表...');
    const messagesResponse = await axios.get('http://localhost:5000/api/messages', {
      headers: {
        'Authorization': `Bearer ${hotelToken}`
      }
    });
    
    console.log('酒店商家的消息列表：');
    messagesResponse.data.messages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.content} - 来自: ${msg.senderId.username} (${msg.createdAt})`);
    });
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试过程中发生错误：', error.response ? error.response.data : error.message);
    if (error.response) {
      console.log('响应状态：', error.response.status);
    }
  }
}

testMessageSend();
