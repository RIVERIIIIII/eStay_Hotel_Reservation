import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../../services/chatService';
import './Chat.css';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // 获取当前用户ID
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      }
      return null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  };
  
  const currentUserId = getCurrentUserId();

  // 移除不再需要的变量，直接在组件中定义问题

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // 从后端API获取所有消息
      const response = await chatService.getMessages();
      const allMessages = response.messages || [];
      
      // 按用户分组，生成会话列表
      const conversationMap = new Map();
      
      // 遍历所有消息
      allMessages.forEach(message => {
        // 确定对方用户ID和名称
        let otherUserId, otherUserName;
        
        if (message.senderId === currentUserId) {
          // 当前用户是发送者，对方是接收者
          otherUserId = message.receiverId?._id || message.receiverId;
          otherUserName = message.receiverId?.username || '用户';
        } else {
          // 当前用户是接收者，对方是发送者
          otherUserId = message.senderId?._id || message.senderId;
          otherUserName = message.senderId?.username || '用户';
        }
        
        // 确保用户ID和名称有效
        if (!otherUserId) return;
        
        // 如果还没有这个用户的会话记录，或者当前消息比已有的最后一条消息更新
        if (!conversationMap.has(otherUserId) || 
            new Date(message.createdAt) > new Date(conversationMap.get(otherUserId).lastMessageTime)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            customer_name: otherUserName || '用户',
            last_message: message.content,
            last_message_time: new Date(message.createdAt).toLocaleString('zh-CN'),
            lastMessageTime: message.createdAt,
            unread_count: 0
          });
        }
      });
      
      // 转换为数组并按最后消息时间排序
      const conversationArray = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      
      setConversations(conversationArray);
      if (conversationArray.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationArray[0]);
      }
    } catch (err) {
      setError('获取会话列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoading(true);
    try {
      // 从后端API获取所有消息
      const response = await chatService.getMessages();
      const allMessages = response.messages || [];
      
      // 过滤出与当前会话相关的消息
      const filteredMessages = allMessages.filter(message => {
        const senderId = message.senderId?._id || message.senderId;
        const receiverId = message.receiverId?._id || message.receiverId;
        return senderId === conversationId || receiverId === conversationId;
      });
      
      // 按时间排序
      filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(filteredMessages);
    } catch (err) {
      setError('获取消息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      // 构建消息数据
      const messageData = {
        content: newMessage,
        receiverId: selectedConversation.id
      };
      
      // 发送消息
      const response = await chatService.sendMessage(messageData);
      
      // 重新获取消息列表，确保消息显示
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
      
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

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-list-header">
          <h4>聊天列表</h4>
          <span className="chat-count">{conversations.length}</span>
        </div>
        {loading && <div className="loading-chats">加载中...</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="conversation-list">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="conversation-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{conversation.customer_name}</h4>
                    <p className="last-message-time">{conversation.last_message_time}</p>
                  </div>
                  <p className="last-message">{conversation.last_message}</p>
                </div>
                {conversation.unread_count > 0 && (
                  <span className="unread-badge">{conversation.unread_count}</span>
                )}
              </div>
            ))
          ) : (
            <div className="no-chats">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>暂无聊天记录</p>
            </div>
          )}
        </div>
      </div>
      <div className="chat-main">
        {selectedConversation ? (
          <div className="chat-content">
            {/* 移除聊天头部，直接显示聊天内容 */}
            <div className="chat-messages">
              {loading ? (
                <div>加载中...</div>
              ) : (
                <>
                  {/* 智能客服欢迎消息 */}
                  <div className="message sent">
                    <div className="message-content">
                      <div className="message-username">商户</div>
                      <p>您好，欢迎使用易宿酒店预订平台！我是智能客服助手，请问有什么可以帮您？</p>
                      <div className="message-time">
                        {new Date().toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="message-avatar merchant-avatar">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* 易宿酒店预订平台 - 常见问题 */}
                  <div className="message sent">
                    <div className="message-content">
                      <div className="message-username">商户</div>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500' }}>易宿酒店预订平台 - 常见问题</h4>
                      <div className="question-categories">
                        {['预订相关', '入住须知', '会员服务', '退款政策', '其他问题'].map((category, index) => (
                          <span key={index} className={`category-tag ${index === 0 ? 'active' : ''}`}>
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="questions-list">
                        {[
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
                        ))}
                      </div>
                      <div className="change-questions">
                        <span>换一批问题</span>
                      </div>
                      <div className="message-time">
                        {new Date().toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="message-avatar merchant-avatar">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* 消息历史 */}
                  {messages.map((message) => {
                    // 确定消息发送者ID和名称
                    const senderId = message.senderId?._id || message.senderId;
                    const senderName = message.senderId?.username || '用户';
                    const isSentMessage = senderId === currentUserId;
                    
                    return (
                      <div
                        key={message._id || message.id}
                        className={`message ${isSentMessage ? 'sent' : 'received'}`}
                      >
                        {isSentMessage ? (
                          // 商户消息（右侧）
                          <>
                            <div className="message-content">
                              <div className="message-username">商户</div>
                              <p>{message.content}</p>
                              <div className="message-time">
                                {message.createdAt ? new Date(message.createdAt).toLocaleString('zh-CN') : ''}
                              </div>
                            </div>
                            <div className="message-avatar merchant-avatar">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </div>
                          </>
                        ) : (
                          // 用户消息（左侧）
                          <>
                            <div className="message-avatar">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                            <div className="message-content">
                              <div className="message-username">{senderName} ({senderId})</div>
                              <p>{message.content}</p>
                              <div className="message-time">
                                {message.createdAt ? new Date(message.createdAt).toLocaleString('zh-CN') : ''}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
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
        ) : (
          <div className="no-chat-selected">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>请从左侧选择一个聊天开始对话</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
