package com.example.firsttry.remote.socket;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class WebSocketManager {

    private static final String TAG = "WebSocketManager";
    // WebSocket服务器地址 - 模拟器专用地址
    private static final String SOCKET_SERVER_URL = "http://10.0.2.2:5000";
    private static volatile WebSocketManager instance;
    private Socket mSocket;
    private boolean isConnected = false;
    private final List<WebSocketListener> listeners = new ArrayList<>();
    private Handler handler = new Handler(Looper.getMainLooper());
    private String currentUserId;
    // 添加连接检查定时器
    private Runnable connectionCheckRunnable;
    // 连接检查间隔（毫秒）
    private static final long CONNECTION_CHECK_INTERVAL = 5000;

    private WebSocketManager() {
        try {
            // 初始化Socket.IO客户端
            IO.Options options = new IO.Options();
            options.reconnectionAttempts = 5;
            options.reconnectionDelay = 1000;
            options.timeout = 10000;
            
            mSocket = IO.socket(SOCKET_SERVER_URL, options);
            
            // 注册Socket.IO事件监听器
            mSocket.on(Socket.EVENT_CONNECT, onConnect);
            mSocket.on(Socket.EVENT_DISCONNECT, onDisconnect);
            mSocket.on(Socket.EVENT_CONNECT_ERROR, onConnectError);
            mSocket.on("newMessage", onNewMessage);
        } catch (URISyntaxException e) {
            Log.e(TAG, "WebSocket初始化失败: " + e.getMessage());
        }
    }

    public static WebSocketManager getInstance() {
        if (instance == null) {
            synchronized (WebSocketManager.class) {
                if (instance == null) {
                    instance = new WebSocketManager();
                }
            }
        }
        return instance;
    }

    // 连接到WebSocket服务器
    public void connect(String userId) {
        Log.d(TAG, "连接到WebSocket服务器: " + userId);
        if (mSocket == null) {
            Log.e(TAG, "WebSocket客户端未初始化，无法连接");
            return;
        }
        
        // 如果已经连接，但用户ID不同，需要重新连接
        if (isConnected) {
            if (currentUserId != null && currentUserId.equals(userId)) {
                // 已经连接到正确的房间，不需要重新连接
                Log.d(TAG, "已经连接到正确的房间，不需要重新连接");
                return;
            } else {
                // 连接的用户ID不同，需要重新连接
                Log.d(TAG, "用户ID不同，需要重新连接");
                mSocket.disconnect();
                isConnected = false;
            }
        }
        
        currentUserId = userId;
        notifyStatusChanged("正在连接...");
        mSocket.connect();
        
        // 启动连接检查定时器
        startConnectionCheck();
    }

    // 断开WebSocket连接
    public void disconnect() {
        Log.d(TAG, "断开WebSocket连接");
        if (mSocket != null) {
            mSocket.disconnect();
            isConnected = false;
            notifyStatusChanged("已断开");
        }
        
        // 停止连接检查定时器
        stopConnectionCheck();
    }

    // 发送消息
  public void sendMessage(String token, String receiverId, String content) {
    Log.d(TAG, "发送消息: receiverId=" + receiverId + ", content=" + content);
    
    // 使用UserApi发送消息（后端会处理WebSocket推送）
    com.example.firsttry.remote.Http.UserApi.sendMessage(token, receiverId, content, new com.example.firsttry.remote.Http.UserApi.UserCallback() {
      @Override
      public void onSuccess(String tokenOrMessage) {
        Log.d(TAG, "消息发送成功: " + tokenOrMessage);
      }
      
      @Override
      public void onError(String message) {
        Log.e(TAG, "消息发送错误: " + message);
      }
      
      @Override
      public void onFailure(IOException e) {
        Log.e(TAG, "消息发送失败: " + e.getMessage());
        
        // HTTP失败后，如果WebSocket连接可用，可以尝试使用WebSocket发送
        if (isConnected && mSocket != null) {
          Log.d(TAG, "尝试使用WebSocket发送消息");
          try {
            JSONObject messageObj = new JSONObject();
            // 使用当前用户ID，如果没有则使用默认值
            String senderIdToUse = currentUserId != null ? currentUserId : getDefaultUserId();
            messageObj.put("senderId", senderIdToUse);
            messageObj.put("receiverId", receiverId);
            messageObj.put("content", content);
            mSocket.emit("sendMessage", messageObj);
          } catch (JSONException jsonE) {
            Log.e(TAG, "WebSocket发送失败: " + jsonE.getMessage());
          }
        }
      }
    });
  }

    // 添加监听器
    public void addListener(WebSocketListener listener) {
        if (!listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    // 移除监听器
    public void removeListener(WebSocketListener listener) {
        listeners.remove(listener);
    }

    // 检查连接状态
    public boolean isConnected() {
        return isConnected;
    }
    
    // 重连WebSocket服务器
    public void reconnect(String userId) {
        Log.d(TAG, "重连WebSocket服务器: " + userId);
        if (mSocket == null) {
            Log.e(TAG, "WebSocket客户端未初始化，无法重连");
            return;
        }
        
        currentUserId = userId;
        notifyStatusChanged("正在重连...");
        
        if (isConnected) {
            mSocket.disconnect();
            isConnected = false;
        }
        
        // 确保Socket处于断开状态后再尝试连接
        if (!mSocket.connected()) {
            mSocket.connect();
        }
    }
    
    // 启动连接检查定时器
    private void startConnectionCheck() {
        Log.d(TAG, "启动连接检查定时器");
        // 停止之前的定时器
        stopConnectionCheck();
        
        // 创建连接检查任务
        connectionCheckRunnable = new Runnable() {
            @Override
            public void run() {
                // 检查连接状态
                if (!isConnected && currentUserId != null) {
                    Log.d(TAG, "连接已断开，尝试重新连接");
                    reconnect(currentUserId);
                }
                // 再次安排检查
                handler.postDelayed(this, CONNECTION_CHECK_INTERVAL);
            }
        };
        
        // 开始检查
        handler.postDelayed(connectionCheckRunnable, CONNECTION_CHECK_INTERVAL);
    }
    
    // 停止连接检查定时器
    private void stopConnectionCheck() {
        if (connectionCheckRunnable != null) {
            Log.d(TAG, "停止连接检查定时器");
            handler.removeCallbacks(connectionCheckRunnable);
            connectionCheckRunnable = null;
        }
    }

    // 获取当前用户ID
    public String getCurrentUserId() {
        return currentUserId;
    }
    
    // 获取默认的用户ID（用于测试）
    public String getDefaultUserId() {
        // lyw1的MongoDB ID
        return "69880e5b376d45f00801861a";
    }

    // Socket.IO事件监听器
    private Emitter.Listener onConnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                isConnected = true;
                Log.d(TAG, "WebSocket已连接，Socket ID: " + mSocket.id());
                notifyStatusChanged("已连接");
                
                // 连接成功后加入用户房间
                if (currentUserId != null) {
                    mSocket.emit("join", currentUserId);
                    Log.d(TAG, "加入房间: " + currentUserId);
                }
            });
        }
    };

    private Emitter.Listener onDisconnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                isConnected = false;
                Log.d(TAG, "WebSocket已断开连接");
                notifyStatusChanged("已断开");
                
                // 断开连接后，自动尝试重新连接
                if (currentUserId != null) {
                    Log.d(TAG, "开始重新连接WebSocket...");
                    reconnect(currentUserId);
                }
            });
        }
    };

    private Emitter.Listener onConnectError = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                String errorMsg = args[0] != null ? args[0].toString() : "未知错误";
                Log.e(TAG, "WebSocket连接错误: " + errorMsg);
                notifyStatusChanged("连接错误: " + errorMsg);
                
                // 连接错误后，自动尝试重新连接
                if (currentUserId != null) {
                    Log.d(TAG, "连接错误，开始重新连接WebSocket...");
                    reconnect(currentUserId);
                }
            });
        }
    };

    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                try {
                    // 将收到的消息转换为JSON字符串并通知监听器
                    JSONObject message = (JSONObject) args[0];
                    String messageJson = message.toString();
                    Log.d(TAG, "收到新消息: " + messageJson);
                    notifyMessageReceived(messageJson);
                } catch (Exception e) {
                    Log.e(TAG, "消息处理错误: " + e.getMessage());
                }
            });
        }
    };

    // 通知所有监听器收到新消息
    private void notifyMessageReceived(String text) {
        for (WebSocketListener listener : new ArrayList<>(listeners)) {
            if (listener != null) {
                listener.onWebSocketMessage(text);
            }
        }
    }

    // 通知所有监听器状态变化
    private void notifyStatusChanged(String status) {
        for (WebSocketListener listener : new ArrayList<>(listeners)) {
            if (listener != null) {
                listener.onWebSocketStatusChanged(status);
            }
        }
    }
}
