package com.example.firsttry.activity.message.fragment;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.R;
import com.example.firsttry.activity.message.Message;
import com.example.firsttry.activity.message.MessageListAdapter;
import com.example.firsttry.activity.message.chat.ChatActivity;
import com.example.firsttry.activity.message.chat.ChatMessage;
import com.example.firsttry.activity.user.LoginActivity;
import com.example.firsttry.remote.socket.WebSocketListener;
import com.example.firsttry.remote.socket.WebSocketManager;
import com.example.firsttry.utils.MockData;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MessageListFragment extends Fragment implements WebSocketListener {

    private RecyclerView messageRecyclerView;
    private MessageListAdapter messageListAdapter;
    private List<Message> messageDataList;
    private UserDbHelper dbHelper;
    private WebSocketManager webSocketManager;
    private String token;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_message_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        dbHelper = UserDbHelper.getInstance(requireContext());
        webSocketManager = WebSocketManager.getInstance();

        initViews(view);
        initRecyclerView();

        SharedPreferences prefs = requireActivity().getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
        String account = prefs.getString("account", null);
        if (account != null) {
            token = dbHelper.getUserToken(account);
        }

        if (token == null || token.isEmpty()) {
            Toast.makeText(getContext(), "尚未登录，无法获取消息", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(getContext(), LoginActivity.class));
            requireActivity().finish();
            return;
        }

        webSocketManager.connect(token);
        loadConversationsFromServer(token);
    }

    @Override
    public void onResume() {
        super.onResume();
        webSocketManager.addListener(this);
        loadConversationsFromLocal();
    }

    @Override
    public void onPause() {
        super.onPause();
        webSocketManager.removeListener(this);
    }

    private void initViews(View view) {
        messageRecyclerView = view.findViewById(R.id.rv_message_list);
    }

    private void initRecyclerView() {
        messageDataList = new ArrayList<>();
        messageListAdapter = new MessageListAdapter(messageDataList);
        messageRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        messageRecyclerView.setAdapter(messageListAdapter);

        messageListAdapter.setOnItemClickListener((message, position) -> {
            Intent intent = new Intent(getContext(), ChatActivity.class);
            intent.putExtra("sender_name", message.getSenderName());
            startActivity(intent);
        });
    }

    private void loadConversationsFromLocal() {
        new Thread(() -> {
            if (getContext() == null) return;
            final List<Message> localList = dbHelper.loadAllConversations();
            if (getActivity() != null) {
                getActivity().runOnUiThread(() -> {
                    messageDataList.clear();
                    messageDataList.addAll(localList);
                    Collections.sort(messageDataList, (a, b) -> {
                        if (a.getTime() == null || b.getTime() == null) return 0;
                        return b.getTime().compareTo(a.getTime());
                    });
                    messageListAdapter.notifyDataSetChanged();
                });
            }
        }).start();
    }

    @Override
    public void onWebSocketMessage(String text) {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(() -> {
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
                Log.d("WS_MessageFragment", "解析JSON失败: " + text, e);
            }
        });
    }

    @Override
    public void onWebSocketStatusChanged(String status) {
        // Optional
    }

    private void handleIncomingMessage(Message newMsg) {
        new Thread(() -> {
            if (getContext() == null) return;
            String currentUsername = requireActivity().getSharedPreferences("app_prefs", Context.MODE_PRIVATE).getString("account", "");
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

            if (getActivity() != null) {
                getActivity().runOnUiThread(this::loadConversationsFromLocal);
            }
        }).start();
    }

    private void loadConversationsFromServer(String token) {
        new Thread(() -> {
            try {
                // Mock implementation
                Thread.sleep(500); // Simulate delay
                List<Message> serverList = MockData.getMockMessages();

                if (serverList != null) {
                    for (Message msg : serverList) {
                        dbHelper.upsertConversationMessage(msg);
                    }
                    if (getActivity() != null) {
                        getActivity().runOnUiThread(this::loadConversationsFromLocal);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}