package com.example.firsttry.remote.socket;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class WebSocketManager {

    private static final String TAG = "WebSocketManager";
    private static final String SOCKET_SERVER_URL = "http://10.0.2.2:5000";
    private static volatile WebSocketManager instance;
    private Socket mSocket;
    private boolean isConnected = false;
    private final List<WebSocketListener> listeners = new ArrayList<>();
    private Handler handler = new Handler(Looper.getMainLooper());
    private String currentUserId;

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
        if (isConnected || mSocket == null) return;
        
        currentUserId = userId;
        notifyStatusChanged("正在连接...");
        mSocket.connect();
    }

    // 断开WebSocket连接
    public void disconnect() {
        Log.d(TAG, "断开WebSocket连接");
        if (mSocket != null) {
            mSocket.disconnect();
            isConnected = false;
            notifyStatusChanged("已断开");
        }
    }

    // 发送消息
    public void sendMessage(String receiverId, String content) {
        Log.d(TAG, "发送消息: receiverId=" + receiverId + ", content=" + content);
        if (!isConnected || mSocket == null) {
            Log.e(TAG, "WebSocket未连接，无法发送消息");
            return;
        }
        
        try {
            // 创建消息对象
            JSONObject message = new JSONObject();
            message.put("senderId", currentUserId);
            message.put("receiverId", receiverId);
            message.put("content", content);
            mSocket.emit("sendMessage", message);
        } catch (JSONException e) {
            Log.e(TAG, "发送消息失败: " + e.getMessage());
        }
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

    // 获取当前用户ID
    public String getCurrentUserId() {
        return currentUserId;
    }

    // Socket.IO事件监听器
    private Emitter.Listener onConnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                isConnected = true;
                Log.d(TAG, "WebSocket已连接");
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
                Log.d(TAG, "WebSocket已断开");
                notifyStatusChanged("已断开");
            });
        }
    };

    private Emitter.Listener onConnectError = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            handler.post(() -> {
                Log.e(TAG, "WebSocket连接错误: " + args[0]);
                notifyStatusChanged("连接错误: " + args[0]);
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
