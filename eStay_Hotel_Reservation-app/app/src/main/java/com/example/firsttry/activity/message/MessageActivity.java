package com.example.firsttry.activity.message;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.R;
import com.example.firsttry.activity.message.chat.ChatMessage;
// 引入你新的 socket 包下的监听器
import com.example.firsttry.remote.socket.WebSocketListener;
import com.example.firsttry.remote.socket.WebSocketManager;
import com.example.firsttry.activity.user.LoginActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MessageActivity extends AppCompatActivity implements WebSocketListener {

    private RecyclerView messageRecyclerView;
    private MessageListAdapter messageListAdapter;
    private List<Message> messageDataList;
    private UserDbHelper dbHelper;
    private WebSocketManager webSocketManager;
    private String token;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_message);

        dbHelper = UserDbHelper.getInstance(this);
        webSocketManager = WebSocketManager.getInstance();

        initViews();
        initRecyclerView();

        SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
        String account = prefs.getString("account", null);
        if (account != null) {
            token = dbHelper.getUserToken(account);
        }

        if (token == null || token.isEmpty()) {
            Toast.makeText(this, "尚未登录，无法获取消息", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        webSocketManager.connect(token);
        loadConversationsFromServer(token);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webSocketManager.addListener(this);
        loadConversationsFromLocal();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webSocketManager.removeListener(this);
    }

    private void initViews() {
        messageRecyclerView = findViewById(R.id.rv_message_list);
    }

    private void initRecyclerView() {
        messageDataList = new ArrayList<>();
        messageListAdapter = new MessageListAdapter(messageDataList);
        messageRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        messageRecyclerView.setAdapter(messageListAdapter);

        messageListAdapter.setOnItemClickListener((message, position) -> {
            // === 【核心修改点 3】在这里也使用 ChatActivity 的完整路径 ===
            Intent intent = new Intent(MessageActivity.this, com.example.firsttry.activity.message.chat.ChatActivity.class);
            intent.putExtra("sender_name", message.getSenderName());
            startActivity(intent);
        });
    }

    private void loadConversationsFromLocal() {
        new Thread(() -> {
            final List<Message> localList = dbHelper.loadAllConversations();
            runOnUiThread(() -> {
                messageDataList.clear();
                messageDataList.addAll(localList);
                Collections.sort(messageDataList, (a, b) -> {
                    if (a.getTime() == null || b.getTime() == null) return 0;
                    return b.getTime().compareTo(a.getTime());
                });
                messageListAdapter.notifyDataSetChanged();
            });
        }).start();
    }

    @Override
    public void onWebSocketMessage(String text) {
        runOnUiThread(() -> {
            try {
                JSONObject root = new JSONObject(text);
                if (!root.has("data")) return;
                Object dataNode = root.get("data");
                List<Message> messagesToProcess = new ArrayList<>();
                if (dataNode instanceof JSONObject) {
                    messagesToProcess.add(Message.fromJson((JSONObject) dataNode));
                } else if (dataNode instanceof JSONArray) {
                    JSONArray dataArray = (JSONArray) dataNode;
                    for (int i = 0; i < dataArray.length(); i++) {
                        messagesToProcess.add(Message.fromJson(dataArray.optJSONObject(i)));
                    }
                }
                for (Message message : messagesToProcess) {
                    if (message != null && message.getSenderName() != null && !message.getSenderName().isEmpty()) {
                        handleIncomingMessage(message);
                    }
                }
            } catch (JSONException e) {
                Log.d("WS_MessageActivity", "解析JSON失败: " + text, e);
            }
        });
    }

    @Override
    public void onWebSocketStatusChanged(String status) {
        // 可选
    }

    private void handleIncomingMessage(Message newMsg) {
        new Thread(() -> {
            String currentUsername = getSharedPreferences("app_prefs", MODE_PRIVATE).getString("account", "");
            List<Message> currentList = dbHelper.loadAllConversations();
            Message targetConversation = null;
            for (Message item : currentList) {
                if (newMsg.getSenderName().equals(item.getSenderName())) {
                    targetConversation = item;
                    break;
                }
            }
            newMsg.setUnreadCount(targetConversation == null ? 1 : targetConversation.getUnreadCount() + 1);
            dbHelper.upsertConversationMessage(newMsg);

            boolean isSentByMe = newMsg.getSenderName().equals(currentUsername);
            String conversationPartner = isSentByMe ? newMsg.getReceiver() : newMsg.getSenderName();
            ChatMessage chatMessage = new ChatMessage(
                    newMsg.getId(), conversationPartner, newMsg.getSenderName(),
                    newMsg.getReceiver(), newMsg.getContent(), newMsg.getTime(), isSentByMe
            );
            dbHelper.insertChatMessage(chatMessage);

            runOnUiThread(this::loadConversationsFromLocal);
        }).start();
    }

    private void loadConversationsFromServer(String token) {
        new Thread(() -> {
            try {
                // Mock implementation
                Thread.sleep(500); // Simulate delay
                List<Message> serverList = com.example.firsttry.utils.MockData.getMockMessages();

                if (serverList != null) {
                    for (Message msg : serverList) {
                        dbHelper.upsertConversationMessage(msg);
                    }
                    runOnUiThread(this::loadConversationsFromLocal);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}