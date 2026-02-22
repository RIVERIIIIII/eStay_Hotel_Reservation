package com.example.firsttry.remote.socket;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class WebSocketManager {

    private static final String TAG = "WebSocketManager";
    private static volatile WebSocketManager instance;
    private boolean isConnected = false;
    private final List<WebSocketListener> listeners = new ArrayList<>();
    private Handler handler = new Handler(Looper.getMainLooper());

    private WebSocketManager() {
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

    public void connect(String token) {
        Log.d(TAG, "Mock connect with token: " + token);
        if (isConnected) return;
        
        notifyStatusChanged("正在连接...");
        handler.postDelayed(() -> {
            isConnected = true;
            notifyStatusChanged("已连接");
            Log.d(TAG, "Mock WebSocket Connected");
        }, 1000);
    }

    public void disconnect() {
        isConnected = false;
        notifyStatusChanged("已断开");
    }

    public void sendMessage(String text) {
        Log.d(TAG, "Mock sendMessage: " + text);
        // Simulate echo or just log
    }

    public void addListener(WebSocketListener listener) {
        if (!listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    public void removeListener(WebSocketListener listener) {
        listeners.remove(listener);
    }

    private void notifyMessageReceived(String text) {
        for (WebSocketListener listener : new ArrayList<>(listeners)) {
            if (listener != null) {
                listener.onWebSocketMessage(text);
            }
        }
    }

    private void notifyStatusChanged(String status) {
        for (WebSocketListener listener : new ArrayList<>(listeners)) {
            if (listener != null) {
                listener.onWebSocketStatusChanged(status);
            }
        }
    }
}
