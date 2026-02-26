package com.example.firsttry.activity.message.chat;

public class ChatMessage {
    private String messageId;
    private String conversationId;
    private String sender;
    private String receiver;
    private String content;
    private String timestamp;
    private boolean isSentByMe;

    public ChatMessage(String messageId, String conversationId, String sender, String receiver, String content, String timestamp, boolean isSentByMe) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.isSentByMe = isSentByMe;
    }

    public String getMessageId() { return messageId; }
    public String getConversationId() { return conversationId; }
    public String getSender() { return sender; }
    public String getReceiver() { return receiver; }
    public String getContent() { return content; }
    public String getTimestamp() { return timestamp; }
    public boolean isSentByMe() { return isSentByMe; }
}