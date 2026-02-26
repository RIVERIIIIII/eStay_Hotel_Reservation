package com.example.firsttry.activity.message;

import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;
import com.example.firsttry.utils.TimeUtils;
import java.util.List;

public class MessageListAdapter extends RecyclerView.Adapter<MessageListAdapter.MessageViewHolder> {

    public interface OnItemClickListener {
        void onItemClick(Message message, int position);
    }

    private List<Message> messageList;
    private OnItemClickListener onItemClickListener;

    public MessageListAdapter(List<Message> messageList) {
        this.messageList = messageList;
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.onItemClickListener = listener;
    }

    @NonNull
    @Override
    public MessageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_message, parent, false);
        return new MessageViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull MessageViewHolder holder, int position) {
        Log.d("123",String.valueOf(position));
        Message currentMessage = messageList.get(position);
        // 已移除头像展示

        // --- 设置备注或昵称 ---
        String displayName = currentMessage.getRemark();
        if (TextUtils.isEmpty(displayName)) {
            displayName = currentMessage.getSenderName();
        }
        holder.userName.setText(displayName);

        // --- 设置其他信息 ---
        holder.messageSnippet.setText(currentMessage.getContent());
        holder.timestamp.setText(TimeUtils.formatFriendlyTime(currentMessage.getTime()));

        int unread = currentMessage.getUnreadCount();
        if (unread > 0) {
            holder.unreadCount.setVisibility(View.VISIBLE);
            holder.unreadCount.setText(String.valueOf(unread));
        } else {
            holder.unreadCount.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (onItemClickListener != null) {
                onItemClickListener.onItemClick(currentMessage, position);
            }
        });
    }

    @Override
    public int getItemCount() {
        return messageList == null ? 0 : messageList.size();
    }

    public static class MessageViewHolder extends RecyclerView.ViewHolder {
        public TextView userName;
        public TextView messageSnippet;
        public TextView timestamp;
        public TextView unreadCount;
        public View statusDot;

        public MessageViewHolder(View view) {
            super(view);
            userName = view.findViewById(R.id.tv_user_name);
            messageSnippet = view.findViewById(R.id.tv_message_snippet);
            timestamp = view.findViewById(R.id.tv_timestamp);
            unreadCount = view.findViewById(R.id.tv_unread_count);
            statusDot = null;

            if (userName == null || messageSnippet == null ||
                    timestamp == null || unreadCount == null) {
                throw new IllegalStateException("A required view was not found in the layout R.layout.activity_list_item. Please check all IDs.");
            }
        }
    }
}
