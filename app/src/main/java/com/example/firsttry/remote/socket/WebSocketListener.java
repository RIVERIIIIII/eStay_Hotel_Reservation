// AppWebSocketListener.java (新文件)
package com.example.firsttry.remote.socket;

public interface WebSocketListener {
    // 当收到新的WebSocket消息时被调用
    void onWebSocketMessage(String text);

    // 当WebSocket状态变化时被调用 (可选，但推荐)
    void onWebSocketStatusChanged(String status);
}