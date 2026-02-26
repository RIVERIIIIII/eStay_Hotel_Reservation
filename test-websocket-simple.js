import { io } from 'socket.io-client';

async function testSimpleWebSocket() {
  try {
    console.log('开始测试简单的WebSocket功能...');
    
    // 创建两个WebSocket连接
    const socket1 = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    const socket2 = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    // 跟踪收到的消息
    const messages1 = [];
    const messages2 = [];
    
    // 连接事件
    socket1.on('connect', () => {
      console.log('✓ Socket1连接成功，ID:', socket1.id);
      // 加入房间
      socket1.emit('join', 'user1');
    });
    
    socket2.on('connect', () => {
      console.log('✓ Socket2连接成功，ID:', socket2.id);
      // 加入房间
      socket2.emit('join', 'user2');
    });
    
    // 新消息事件
    socket1.on('newMessage', (message) => {
      console.log('📩 Socket1收到消息:', message);
      messages1.push(message);
    });
    
    socket2.on('newMessage', (message) => {
      console.log('📩 Socket2收到消息:', message);
      messages2.push(message);
    });
    
    // 连接错误
    socket1.on('connect_error', (err) => {
      console.error('❌ Socket1连接错误:', err.message);
    });
    
    socket2.on('connect_error', (err) => {
      console.error('❌ Socket2连接错误:', err.message);
    });
    
    // 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试直接发送消息事件
    console.log('\n发送测试消息...');
    const testMessage = {
      senderId: 'user1',
      receiverId: 'user2',
      content: '这是一条测试消息'
    };
    
    console.log('发送消息:', testMessage);
    socket1.emit('sendMessage', testMessage);
    
    // 等待消息
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 验证结果
    console.log('\n验证结果：');
    console.log(`   Socket1收到的消息数: ${messages1.length}`);
    console.log(`   Socket2收到的消息数: ${messages2.length}`);
    
    if (messages1.length > 0 || messages2.length > 0) {
      console.log('\n🎉 WebSocket功能测试成功！');
      console.log('   - WebSocket连接正常');
      console.log('   - 消息事件监听正常');
    } else {
      console.log('\n⚠️  WebSocket功能测试不完整');
      console.log('   - 连接成功但未收到消息');
      console.log('   - 可能需要结合HTTP API测试完整流程');
    }
    
    // 关闭连接
    socket1.close();
    socket2.close();
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSimpleWebSocket();