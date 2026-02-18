package com.example.firsttry.activity.message.chat;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.firsttry.Database.User;
import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.R;
import com.example.firsttry.activity.message.Message;
import com.example.firsttry.activity.message.chat.remark.EditRemarkActivity;
import com.example.firsttry.remote.Http.UserApi;
import com.example.firsttry.remote.socket.WebSocketListener;
import com.example.firsttry.remote.socket.WebSocketManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ChatActivity extends AppCompatActivity implements WebSocketListener {

    private String conversationPartnerName;
    private String currentUsername;
    private String token;

    private ImageView ivAvatar;
    private TextView tvUserStatus;
    private TextView tvUserName;
    private RecyclerView rvMessages;
    private EditText etInput;
    private TextView btnSend;

    private UserDbHelper dbHelper;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> chatMessageList;
    private WebSocketManager webSocketManager;
    private ActivityResultLauncher<Intent> editRemarkLauncher;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_message_chat);

        conversationPartnerName = getIntent().getStringExtra("sender_name");
        SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
        currentUsername = prefs.getString("account", "");

        dbHelper = UserDbHelper.getInstance(this);
        webSocketManager = WebSocketManager.getInstance();

        if (!TextUtils.isEmpty(currentUsername)) {
            token = dbHelper.getUserToken(currentUsername);
        }

        initViews();
        initRecyclerView();
        setupActivityResultLaunchers();
        setupHeader();

        if (conversationPartnerName != null && !conversationPartnerName.isEmpty()) {
            clearUnreadCountForConversation(conversationPartnerName);
        }

        // === 【核心修改点】调用新的同步逻辑 ===
        syncHistoryFromServerIfNeeded();

        setupSendButton();
    }

    private void syncHistoryFromServerIfNeeded() {
        new Thread(() -> {
            final List<ChatMessage> localHistory = dbHelper.loadMessagesForConversation(conversationPartnerName, currentUsername);

            if (!localHistory.isEmpty()) {
                runOnUiThread(() -> {
                    updateChatList(localHistory);
                });
            } else {
                if (token == null) {
                    Log.w("ChatActivity", "无法从服务器同步，token is null.");
                    return;
                }
                UserApi.getMessages(token, new UserApi.MessageListCallback() {
                    @Override
                    public void onSuccess(List<Message> serverMessages) {
                        new Thread(() -> {
                            final List<ChatMessage> historyToDisplay = new ArrayList<>();
                            for (Message msg : serverMessages) {
                                boolean isSentByMe = msg.getSenderName().equals(currentUsername);
                                ChatMessage chatMessage = new ChatMessage(
                                        msg.getId(), msg.getSenderName(), msg.getSenderName(),
                                        msg.getReceiver(), msg.getContent(), msg.getTime(), isSentByMe
                                );
                                dbHelper.insertChatMessage(chatMessage);
                                historyToDisplay.add(chatMessage);
                            }
                            runOnUiThread(() -> updateChatList(historyToDisplay));
                        }).start();
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> Log.e("ChatActivity", "同步历史记录失败: " + message));
                    }

                    @Override
                    public void onFailure(@NonNull IOException e) {
                        runOnUiThread(() -> Log.e("ChatActivity", "同步历史记录网络失败", e));
                    }
                });
            }
        }).start();
    }
    private void updateChatList(List<ChatMessage> messages) {
        chatMessageList.clear();
        chatMessageList.addAll(messages);
        chatAdapter.notifyDataSetChanged();
        if (!chatMessageList.isEmpty()) {
            rvMessages.scrollToPosition(chatMessageList.size() - 1);
        }
    }
    //滚动到底部
    private void scrollToBottom() {
        if (!chatMessageList.isEmpty()) {
            rvMessages.scrollToPosition(chatMessageList.size() - 1);
        }
    }


    @Override
    protected void onResume() {
        super.onResume();
        webSocketManager.addListener(this);
        setupHeader();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webSocketManager.removeListener(this);
    }

    private void initViews() {
        ivAvatar = findViewById(R.id.iv_avatar);
        tvUserName = findViewById(R.id.tv_user_name);
        tvUserStatus = findViewById(R.id.tv_user_status);
        rvMessages = findViewById(R.id.rv_messages);
        etInput = findViewById(R.id.et_input);
        btnSend = findViewById(R.id.btn_send);
        View.OnClickListener toRemarkListener = v -> {
            Intent it = new Intent(ChatActivity.this, EditRemarkActivity.class);
            it.putExtra("CONVERSATION_ID", conversationPartnerName);
            it.putExtra("CURRENT_REMARK", tvUserName.getText().toString());
            editRemarkLauncher.launch(it);
        };
        ivAvatar.setOnClickListener(toRemarkListener);
        tvUserName.setOnClickListener(toRemarkListener);
    }

    private void setupHeader() {
        if (tvUserName == null) return;
        new Thread(() -> {
            final Message conversation = dbHelper.loadSingleConversation(conversationPartnerName);
            final User partnerUser = dbHelper.searchUserByAccount(conversationPartnerName);
            runOnUiThread(() -> {
                if (conversation != null && !TextUtils.isEmpty(conversation.getRemark())) {
                    tvUserName.setText(conversation.getRemark());
                } else {
                    tvUserName.setText(conversationPartnerName);
                }
                if (partnerUser != null && !TextUtils.isEmpty(partnerUser.getPhoto())) {
                    Glide.with(ChatActivity.this).load(partnerUser.getPhoto()).placeholder(R.mipmap.ic_launcher).error(R.mipmap.ic_launcher).circleCrop().into(ivAvatar);
                }
            });
        }).start();
    }

    private void initRecyclerView() {
        chatMessageList = new ArrayList<>();
        chatAdapter = new ChatAdapter(chatMessageList);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        rvMessages.setLayoutManager(layoutManager);
        rvMessages.setAdapter(chatAdapter);
    }

    private void setupActivityResultLaunchers() {
        editRemarkLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == Activity.RESULT_OK) {
                setupHeader();
            }
        });
    }

    private void setupSendButton() {
        btnSend.setOnClickListener(v -> {
            String content = etInput.getText().toString().trim();
            if (TextUtils.isEmpty(content)) {
                Toast.makeText(ChatActivity.this, "消息不能为空", Toast.LENGTH_SHORT).show();
                return;
            }
            etInput.setText("");
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Shanghai")); // 关键加上这一行
            String formattedTime = sdf.format(new Date());
            ChatMessage sentMsg = new ChatMessage(String.valueOf(System.currentTimeMillis()), conversationPartnerName, currentUsername, conversationPartnerName, content, formattedTime, true);
            handleNewMessage(sentMsg);
            try {
                JSONObject messageJson = new JSONObject();
                messageJson.put("content", content);
                messageJson.put("writer", currentUsername);
                messageJson.put("receiver", conversationPartnerName);
                messageJson.put("createtime", formattedTime);
                webSocketManager.sendMessage(messageJson.toString());
            } catch (JSONException e) {
                Log.e("ChatActivity", "构造发送 JSON 失败", e);
            }
        });
    }

    private void handleNewMessage(ChatMessage newMessage) {
        chatMessageList.add(newMessage);
        chatAdapter.notifyItemInserted(chatMessageList.size() - 1);
        scrollToBottom();
        new Thread(() -> {
            dbHelper.insertChatMessage(newMessage);
            Message convMsg = new Message();
            convMsg.setSenderName(conversationPartnerName);
            convMsg.setContent(newMessage.getContent());
            convMsg.setTime(newMessage.getTimestamp());
            convMsg.setUnreadCount(0);
            dbHelper.upsertConversationMessage(convMsg);
        }).start();
    }

    private void clearUnreadCountForConversation(String senderNameToClear) {
        new Thread(() -> dbHelper.clearUnreadCount(senderNameToClear)).start();
    }

    @Override
    public void onWebSocketMessage(String text) {
        runOnUiThread(() -> {
            try {
                JSONObject root = new JSONObject(text);
                if (!root.has("data")) return;
                Object dataNode = root.get("data");
                JSONObject data = null;
                if (dataNode instanceof JSONObject) data = (JSONObject) dataNode;
                else if (dataNode instanceof JSONArray) {
                    JSONArray dataArray = (JSONArray) dataNode;
                    if (dataArray.length() > 0) data = dataArray.getJSONObject(0);
                }
                if (data == null) return;
                String sender = data.optString("writer");
                String receiver = data.optString("receiver");
                boolean isRelated = (sender.equals(conversationPartnerName) && receiver.equals(currentUsername));
                if (isRelated) {
                    ChatMessage receivedMsg = new ChatMessage(String.valueOf(System.currentTimeMillis()), conversationPartnerName, sender, receiver, data.optString("content"), data.optString("createtime"), false);
                    handleNewMessage(receivedMsg);
                }
            } catch (JSONException e) {
                Log.e("ChatActivity_WS", "解析JSON失败", e);
            }
        });
    }

    @Override
    public void onWebSocketStatusChanged(String status) {}
}