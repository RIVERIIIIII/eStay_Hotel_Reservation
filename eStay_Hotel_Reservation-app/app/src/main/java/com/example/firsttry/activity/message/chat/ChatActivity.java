package com.example.firsttry.activity.message.chat;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

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
    private String hotelName; // New field
    private String conversationPartnerId = "698acb0ecfa6fad12150079f";

    private TextView tvUserName;
    private RecyclerView rvMessages;
    private EditText etInput;
    private TextView btnSend;
    private LinearLayout layoutFaq;
    private LinearLayout layoutFaqTabs;
    private LinearLayout layoutFaqQuestions;
    private int selectedTabIndex = -1;

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
        hotelName = getIntent().getStringExtra("hotel_name"); // Get hotel name

        SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
        currentUsername = prefs.getString("account", "");

        dbHelper = UserDbHelper.getInstance(this);
        webSocketManager = WebSocketManager.getInstance();

        if (!TextUtils.isEmpty(currentUsername)) {
            token = dbHelper.getUserToken(currentUsername);
        }

        if (!TextUtils.isEmpty(hotelName) && !TextUtils.isEmpty(conversationPartnerName)) {
            new Thread(() -> dbHelper.updateRemark(conversationPartnerName, hotelName)).start();
        }

        initViews();
        initRecyclerView();
        setupActivityResultLaunchers();
        setupHeader();
        setupFaq();

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
        
        // 连接WebSocket服务器
        if (!TextUtils.isEmpty(currentUsername)) {
            // 使用默认用户ID连接WebSocket
            String currentUserId = webSocketManager.getDefaultUserId();
            if (!TextUtils.isEmpty(currentUserId)) {
                webSocketManager.connect(currentUserId);
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        webSocketManager.removeListener(this);
    }

    private void initViews() {
        tvUserName = findViewById(R.id.tv_user_name);
        rvMessages = findViewById(R.id.rv_messages);
        etInput = findViewById(R.id.et_input);
        btnSend = findViewById(R.id.btn_send);
        layoutFaq = findViewById(R.id.layout_faq);
        layoutFaqTabs = findViewById(R.id.layout_faq_tabs);
        layoutFaqQuestions = findViewById(R.id.layout_faq_questions);
        View.OnClickListener toRemarkListener = v -> {
            Intent it = new Intent(ChatActivity.this, EditRemarkActivity.class);
            it.putExtra("CONVERSATION_ID", conversationPartnerName);
            it.putExtra("CURRENT_REMARK", tvUserName.getText().toString());
            editRemarkLauncher.launch(it);
        };
        tvUserName.setOnClickListener(toRemarkListener);
    }

    private void setupHeader() {
        if (tvUserName == null) return;
        
        // If hotel name is provided, use it directly
        if (!TextUtils.isEmpty(hotelName)) {
            tvUserName.setText("正在咨询：" + hotelName);
            return;
        }

        new Thread(() -> {
            final Message conversation = dbHelper.loadSingleConversation(conversationPartnerName);
            final User partnerUser = dbHelper.searchUserByAccount(conversationPartnerName);
            runOnUiThread(() -> {
                if (conversation != null && !TextUtils.isEmpty(conversation.getRemark())) {
                    tvUserName.setText(conversation.getRemark());
                } else {
                    tvUserName.setText(conversationPartnerName);
                }
                // 已移除头像展示
            });
        }).start();
    }

    private void setupFaq() {
        boolean fromHotel = !TextUtils.isEmpty(hotelName);
        if (!fromHotel) {
            layoutFaq.setVisibility(View.GONE);
            return;
        }
        String welcome = "您好，欢迎使用易宿酒店预订平台！\n常见问题可点击上方卡片进行咨询~";
        String time = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(new java.util.Date());
        ChatMessage welcomeMsg = new ChatMessage(String.valueOf(System.currentTimeMillis()), conversationPartnerName, conversationPartnerName, currentUsername, welcome, time, false);
        handleNewMessage(welcomeMsg);
        layoutFaq.setVisibility(View.VISIBLE);
        String[] tabs = new String[]{"预订相关", "入住须知", "会员服务", "退款政策", "其他问题"};
        for (int i = 0; i < tabs.length; i++) {
            final int index = i;
            TextView tab = new TextView(this);
            tab.setText(tabs[i]);
            tab.setPadding(dp(12), dp(8), dp(12), dp(8));
            tab.setTextSize(14);
            tab.setBackgroundColor(0xFFD7CCC8);
            tab.setTextColor(0xFF5D4037);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.rightMargin = dp(8);
            tab.setLayoutParams(lp);
            tab.setOnClickListener(v -> selectFaqTab(index));
            layoutFaqTabs.addView(tab);
        }
        selectFaqTab(0);
    }

    private void selectFaqTab(int index) {
        selectedTabIndex = index;
        int childCount = layoutFaqTabs.getChildCount();
        for (int i = 0; i < childCount; i++) {
            TextView tab = (TextView) layoutFaqTabs.getChildAt(i);
            if (i == index) {
                tab.setBackgroundColor(0xFF5D4037);
                tab.setTextColor(0xFFFFFFFF);
            } else {
                tab.setBackgroundColor(0xFFD7CCC8);
                tab.setTextColor(0xFF5D4037);
            }
        }
        renderFaqQuestions(getQuestionsForIndex(index));
    }

    private String[] getQuestionsForIndex(int index) {
        switch (index) {
            case 0:
                return new String[]{
                        "如何通过易宿平台搜索并预订特定城市的酒店？",
                        "订单提交后，多久可以收到确认短信或邮件？",
                        "为什么显示的房价与最终支付时的价格不一致？",
                        "是否可以代他人预订酒店？入住人姓名填错如何处理？",
                        "预订时提示“房源紧张”或“满房”该怎么办？",
                        "如何查看我过往的历史订单记录？"
                };
            case 1:
                return new String[]{
                        "酒店的标准入住和退房时间分别是几点？",
                        "办理入住时需要提供哪些有效身份证件？",
                        "由于行程耽搁，凌晨才到达酒店，预订会被取消吗？",
                        "未成年人可否在没有监护人陪同下办理入住？",
                        "酒店是否允许携带宠物入住？是否需要额外收费？",
                        "入住时是否需要缴纳押金？押金金额通常是多少？"
                };
            case 2:
                return new String[]{
                        "如何注册成为易宿会员？不同等级的会员有哪些权益？",
                        "会员积分的有效期是多久？过期后会自动清零吗？",
                        "在预订过程中，如何使用积分抵扣房费？",
                        "会员等级是如何晋升的？黑金会员需要满足什么条件？",
                        "积分除了抵扣房费，还可以兑换礼品或接送机服务吗？",
                        "忘记会员账号或密码，如何通过绑定手机号找回？"
                };
            case 3:
                return new String[]{
                        "如何申请修改订单的入住日期或房型？",
                        "取消预订是否有时间限制？不可取消订单可以退款吗？",
                        "订单取消成功后，退款通常在几个工作日内原路退回？",
                        "因不可抗力无法入住，如何申请全额退款？",
                        "未入住且未提前取消，酒店会扣除首晚房费吗？"
                };
            default:
                return new String[]{
                        "酒店是否提供免费停车场？是否需要提前预订车位？",
                        "酒店早餐的供应时间及具体地点在哪里？",
                        "是否可以申请提前入住或延迟退房？额外费用如何计算？",
                        "如何在线开具电子发票？纸质发票可以邮寄吗？",
                        "酒店是否提供免费接送机或接送站服务？"
                };
        }
    }

    private void renderFaqQuestions(String[] qs) {
        layoutFaqQuestions.removeAllViews();
        for (String q : qs) {
            TextView tv = new TextView(this);
            tv.setText(q);
            tv.setTextSize(15);
            tv.setTextColor(0xFF222222);
            tv.setPadding(dp(8), dp(8), dp(8), dp(8));
            android.widget.LinearLayout.LayoutParams lp = new android.widget.LinearLayout.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.topMargin = dp(6);
            tv.setLayoutParams(lp);
            tv.setBackgroundResource(R.drawable.bg_faq_question_card);
            tv.setOnClickListener(v -> sendFaqQuestion(q));
            layoutFaqQuestions.addView(tv);
        }
    }

    private void sendFaqQuestion(String content) {
        String formattedTime = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(new java.util.Date());
        ChatMessage sentMsg = new ChatMessage(String.valueOf(System.currentTimeMillis()), conversationPartnerName, currentUsername, conversationPartnerName, content, formattedTime, true);
        handleNewMessage(sentMsg);
        try {
            webSocketManager.sendMessage(token, conversationPartnerId, content);
        } catch (Exception ignored) { }
    }

    private int dp(int v) {
        float d = getResources().getDisplayMetrics().density;
        return (int) (v * d);
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
                // 修复：使用正确的用户ID作为receiverId
                // 这里使用lywn（酒店1的负责人）的ID
                String conversationPartnerId = "698acb0ecfa6fad12150079f"; // lywn的有效用户ID
                webSocketManager.sendMessage(token, conversationPartnerId, content);
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
            
            // 如果有 hotelName，保存为备注，这样列表页就会显示酒店名称
            if (!TextUtils.isEmpty(hotelName)) {
                convMsg.setRemark(hotelName);
            }
            
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
                Log.d("ChatActivity_WS", "收到WebSocket消息: " + text);
                JSONObject root = new JSONObject(text);
                
                // 检查消息格式，可能是直接的消息对象，也可能是包含data字段的对象
                JSONObject messageData;
                if (root.has("data")) {
                    Object dataNode = root.get("data");
                    if (dataNode instanceof JSONObject) {
                        messageData = (JSONObject) dataNode;
                    } else if (dataNode instanceof JSONArray) {
                        JSONArray dataArray = (JSONArray) dataNode;
                        if (dataArray.length() > 0) {
                            messageData = dataArray.getJSONObject(0);
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                } else {
                    // 如果没有data字段，直接使用root作为消息对象
                    messageData = root;
                }
                
                Log.d("ChatActivity_WS", "解析后的消息对象: " + messageData.toString());
                
                // 提取必要的字段
                String content = messageData.optString("content");
                String time = messageData.optString("createdAt", messageData.optString("createtime"));
                
                // 获取发送者信息
                String senderId = messageData.optString("senderIdStr", messageData.optString("senderId"));
                String receiverId = messageData.optString("receiverIdStr", messageData.optString("receiverId"));
                
                // 获取发送者名称（可能在senderId对象中）
                String senderName;
                if (messageData.has("senderId") && messageData.get("senderId") instanceof JSONObject) {
                    JSONObject senderObj = messageData.getJSONObject("senderId");
                    senderName = senderObj.optString("username");
                } else {
                    // 如果没有用户名信息，使用conversationPartnerName
                    senderName = conversationPartnerName;
                }
                
                // 检查是否是当前会话的消息
                // 如果是酒店会话，直接处理
                if (!TextUtils.isEmpty(hotelName)) {
                    // 酒店会话，直接显示消息
                    ChatMessage receivedMsg = new ChatMessage(
                            String.valueOf(System.currentTimeMillis()),
                            conversationPartnerName,
                            senderName,  // 使用发送者名称
                            currentUsername,  // 当前用户作为接收者
                            content,
                            time,
                            false  // 不是我发送的
                    );
                    handleNewMessage(receivedMsg);
                } else {
                    // 普通用户会话，检查是否是当前会话的消息
                    // 由于我们没有正确的用户ID映射，暂时使用用户名进行比较
                    boolean isRelated = senderName.equals(conversationPartnerName) || 
                                      senderId.equals("698acb0ecfa6fad12150079f"); // lywn的ID
                    
                    if (isRelated) {
                        ChatMessage receivedMsg = new ChatMessage(
                                String.valueOf(System.currentTimeMillis()),
                                conversationPartnerName,
                                senderName,
                                currentUsername,
                                content,
                                time,
                                false
                        );
                        handleNewMessage(receivedMsg);
                    }
                }
            } catch (JSONException e) {
                Log.e("ChatActivity_WS", "解析JSON失败", e);
            }
        });
    }

    @Override
    public void onWebSocketStatusChanged(String status) {}
}
