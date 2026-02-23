import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../../services/chatService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState(''); // 存储当前用户名
  const [currentUserId, setCurrentUserId] = useState(''); // 存储当前用户ID
  const navigate = useNavigate();

  // 获取当前用户信息
  const getCurrentUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.username) {
          setUsername(user.username);
        }
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          setCurrentUserId(userId);
          return userId;
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
    return '';
  };

  // 初始化WebSocket连接
  useEffect(() => {
    // 获取当前用户信息
    getCurrentUserInfo();
    
    // 初始化WebSocket
    chatService.initWebSocket();

    // 注册消息处理函数
    const unsubscribeMessage = chatService.onMessage((newMessage) => {
      console.log('收到WebSocket消息:', newMessage);
      
      // 1. 处理数据库字段映射
      const processedMessage = processMessageFromDB(newMessage);
      
      // 2. 检查是否是自己发送的消息，避免重复
      if (processedMessage.sender_type === 'merchant') {
        console.log('忽略商户发送的WebSocket消息，避免重复');
        return;
      }
      
      // 3. 检查消息是否已存在，避免重复
      setMessages(prevMessages => {
        // 检查是否已存在相同内容的消息
        const isDuplicate = prevMessages.some(msg => 
          msg.content === processedMessage.content &&
          msg.timestamp === processedMessage.timestamp
        );
        
        if (isDuplicate) {
          console.log('忽略重复消息:', processedMessage);
          return prevMessages;
        }
        
        console.log('添加客服消息:', processedMessage);
        return [...prevMessages, processedMessage];
      });
    });

    // 注册未读消息数量更新处理函数
    const unsubscribeUnreadCount = chatService.onUnreadCountUpdate((count) => {
      setUnreadCount(count);
    });

    // 首次加载消息和未读数量
    fetchMessages();
    fetchUnreadCount();

    // 组件卸载时清理
    return () => {
      unsubscribeMessage();
      unsubscribeUnreadCount();
      // 注意：不要在这里关闭WebSocket，因为可能其他组件也需要使用
    };
  }, []);

  // 处理从数据库获取的消息
  const processMessageFromDB = (message) => {
    // 1. 处理发送者类型
    let senderType = 'received';
    if (message.senderId === currentUserId) {
      senderType = 'merchant';
    }
    
    // 2. 处理时间戳
    let timestamp = message.timestamp;
    if (message.createdAt) {
      timestamp = new Date(message.createdAt).toLocaleString('zh-CN');
    } else if (!timestamp) {
      timestamp = new Date().toLocaleString('zh-CN');
    }
    
    // 3. 处理消息状态
    let status = message.status || 'unread';
    if (message.isRead !== undefined) {
      status = message.isRead ? 'read' : 'unread';
    }
    
    return {
      ...message,
      id: message._id || message.id,
      sender_type: senderType,
      timestamp: timestamp,
      status: status
    };
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await chatService.getMessages();
      console.log('获取到的消息列表:', response.data);
      
      // 处理消息数据，适配数据库结构
      const processedMessages = (response.data || []).map(msg => processMessageFromDB(msg));
      
      console.log('处理后的消息列表:', processedMessages);
      setMessages(processedMessages);
    } catch (err) {
      setError('获取消息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error('获取未读消息数量失败:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      console.log('开始发送消息:', newMessage);
      
      // 发送消息
      await chatService.sendMessage({
        content: newMessage,
      });
      
      // 添加本地临时消息
      const tempMessage = {
        id: Date.now(),
        content: newMessage,
        sender_type: 'merchant',
        timestamp: new Date().toLocaleString('zh-CN'),
        is_temp: true,
        username: username
      };
      
      console.log('添加临时消息:', tempMessage);
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
    } catch (err) {
      setError('发送消息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    setNewMessage(question);
    sendMessage();
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await chatService.markAsRead(messageId);
      fetchUnreadCount();
    } catch (err) {
      console.error('标记消息已读失败:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>在线客服</h3>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount} 条未读消息</span>}
      </div>
      <div className="chat-main">
        <div className="chat-messages">
          {loading ? (
            <div>加载中...</div>
          ) : (
            <>
              {/* 智能客服欢迎消息 */}
              <div className="message sent">
                <div className="message-time">{new Date().toLocaleString('zh-CN')}</div>
                <div className="message-content">
                  <p>您好，欢迎使用易宿酒店预订平台！我是智能客服助手，请问有什么可以帮您？</p>
                </div>
                <div className="message-avatar merchant-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="message-username">{username}</div>
              </div>
              
              {/* 易宿酒店预订平台 - 常见问题 */}
              <div className="message sent">
                <div className="message-time">{new Date().toLocaleString('zh-CN')}</div>
                <div className="message-content">
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500' }}>易宿酒店预订平台 - 常见问题</h4>
                  <div className="question-categories">
                    {['预订相关', '入住须知', '会员服务', '退款政策', '其他问题'].map((category, index) => (
                      <span key={index} className={`category-tag ${index === 0 ? 'active' : ''}`}>
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="questions-list" style={{ marginTop: '12px' }}>
                    {
                      [
                        '如何预订酒店房间？',
                        '入住和退房时间是几点？',
                        '如何修改或取消订单？',
                        '酒店提供免费停车场吗？',
                        '是否包含早餐？',
                        '可以提前入住吗？',
                        '会员积分如何使用？',
                        '发票如何开具？'
                      ].map((question, index) => (
                        <div key={index} className="question-item" onClick={() => handleQuestionClick(question)}>
                          <span>{question}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </div>
                      ))
                    }
                  </div>
                  <div className="change-questions" style={{ marginTop: '12px' }}>
                    <span>换一批问题</span>
                  </div>
                </div>
                <div className="message-avatar merchant-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="message-username">{username}</div>
              </div>
              
              {/* 消息历史 */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender_type === 'merchant' ? 'sent' : 'received'}`}
                  onClick={() => message.sender_type === 'received' && handleMarkAsRead(message.id)}
                >
                  {message.sender_type === 'received' && (
                    <>
                      <div className="message-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      {/* 显示客服用户名或ID */}
                      <div className="message-username">
                        {message.username || message.senderId || '客户'}
                      </div>
                    </>
                  )}
                  <div className="message-time">{message.timestamp}</div>
                  <div className="message-content">
                    <p>{message.content}</p>
                  </div>
                  {message.sender_type === 'merchant' && (
                    <>
                      <div className="message-avatar merchant-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className="message-username">
                        {message.username || username}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        <div className="chat-input-area">
          <div className="input-actions">
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="我已经就位，放马问我吧！"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !newMessage.trim()} className="send-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;