package com.example.firsttry.activity.message;

import org.json.JSONException;
import org.json.JSONObject;

public class Message {
    private String id;
    private String senderName;
    private String receiver;
    private String content;
    private String time;
    private int unreadCount;
    private String senderAvatar; // === 新增：发送者头像URL字段 ===
    private String remark;       // 你之前添加的备注字段

    public Message() {}

    public Message(String id, String senderName, String content, String time, int unreadCount) {
        this.id = id;
        this.senderName = senderName;
        this.content = content;
        this.time = time;
        this.unreadCount = unreadCount;
    }

    // ====== Getter 和 Setter 方法 ======
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getReceiver() { return receiver; }
    public void setReceiver(String receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }

    // === 新增：senderAvatar 的 Getter 和 Setter ===
    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", senderName='" + senderName + '\'' +
                ", receiver='" + receiver + '\'' + // 添加到 toString 中方便调试
                ", content='" + content + '\'' +
                ", time='" + time + '\'' +
                ", unreadCount=" + unreadCount +
                '}';
    }

    /**
     * 从 WebSocket 返回的 JSON 对象创建 Message 对象
     * @param obj WebSocket JSON 数据中的 "data" 对象
     * @return Message 实例
     */
    public static Message fromJson(JSONObject obj) {
        if (obj == null) return null;

        Message msg = new Message();
        // 使用时间戳作为临时唯一ID，因为WebSocket消息可能没有唯一ID
        msg.setId(String.valueOf(System.currentTimeMillis()));

        // === 【核心修改点】确保 fromJson 方法也解析 receiver ===
        // 根据你的WebSocket JSON结构，从 "writer" 和 "receiver" 字段获取数据
        msg.setSenderName(obj.optString("writer", ""));
        msg.setReceiver(obj.optString("receiver", ""));

        msg.setContent(obj.optString("content", ""));
        msg.setTime(obj.optString("createtime", ""));

        // 未读数在 handleIncomingMessage 中计算，这里可以不设置
        // msg.setUnreadCount(1);

        return msg;
    }

}