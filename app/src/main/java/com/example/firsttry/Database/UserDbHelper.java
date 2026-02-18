package com.example.firsttry.Database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.example.firsttry.activity.message.chat.ChatMessage;
import com.example.firsttry.activity.message.Message;

import java.util.ArrayList;
import java.util.List;

public class UserDbHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "user.db";
    // 每次修改表结构，都应增加版本号，以触发 onUpgrade
    private static final int DB_VERSION = 15; // 升级至 15

    // === 单例模式实现 ===
    private static UserDbHelper instance;
    private static SQLiteDatabase database;

    public static synchronized UserDbHelper getInstance(Context context) {
        if (instance == null) {
            instance = new UserDbHelper(context.getApplicationContext());
            database = instance.getWritableDatabase();
        }
        return instance;
    }

    // --- 表和字段定义 ---
    public static final String TABLE_USER = "user";
    public static final String COL_ID = "_id";
    public static final String COL_ACCOUNT = "account";
    public static final String COL_PHOTO = "photo";
    public static final String COL_EMAIL = "email";
    public static final String COL_TOKEN = "token";

    public static final String TABLE_CONVERSATIONS = "conversations";
    public static final String COL_CONV_ID = "conv_id";
    public static final String COL_SENDER = "sender_name";
    public static final String COL_CONTENT = "content";
    public static final String COL_TIME = "time";
    public static final String COL_UNREAD = "unread";
    public static final String COL_REMARK = "remark"; // remark 字段复用

    public static final String TABLE_CHAT_MESSAGES = "chat_messages";
    public static final String COL_CHAT_MSG_ID = "msg_id";
    public static final String COL_CHAT_SENDER = "sender";
    public static final String COL_CHAT_RECEIVER = "receiver";
    public static final String COL_CHAT_CONTENT = "content";
    public static final String COL_CHAT_TIMESTAMP = "timestamp";

    private UserDbHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String createUserTableSql = "CREATE TABLE " + TABLE_USER + " ("
                + COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COL_ACCOUNT + " TEXT UNIQUE, "
                + COL_PHOTO + " TEXT, "
                + COL_EMAIL + " TEXT, "
                + COL_TOKEN + " TEXT, "
                + COL_REMARK + " TEXT" // 在 user 表中加入 remark
                + ");";
        db.execSQL(createUserTableSql);

        String createConversationsTableSql = "CREATE TABLE " + TABLE_CONVERSATIONS + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_CONV_ID + " TEXT UNIQUE, " +
                COL_SENDER + " TEXT, " +
                COL_CONTENT + " TEXT, " +
                COL_TIME + " TEXT, " +
                COL_UNREAD + " INTEGER, " +
                COL_REMARK + " TEXT" +
                ")";
        db.execSQL(createConversationsTableSql);

        String createChatMessagesTableSql = "CREATE TABLE " + TABLE_CHAT_MESSAGES + " ("
                + COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COL_CHAT_MSG_ID + " TEXT, "
                + COL_CONV_ID + " TEXT, "
                + COL_CHAT_SENDER + " TEXT, "
                + COL_CHAT_RECEIVER + " TEXT, "
                + COL_CHAT_CONTENT + " TEXT, "
                + COL_CHAT_TIMESTAMP + " TEXT"
                + ");";
        db.execSQL(createChatMessagesTableSql);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // 使用非破坏性升级方式
        if (oldVersion < 14) {
            try {
                db.execSQL("ALTER TABLE " + TABLE_CONVERSATIONS + " ADD COLUMN " + COL_REMARK + " TEXT");
                Log.i("UserDbHelper", "Upgraded to version 14: Added 'remark' column to conversations.");
            } catch (Exception e) {
                Log.e("UserDbHelper", "Failed to upgrade to version 14 for conversations, falling back to destructive migration.", e);
                fallbackToDestructiveMigration(db);
                return;
            }
        }
        if (oldVersion < 15) {
            try {
                db.execSQL("ALTER TABLE " + TABLE_USER + " ADD COLUMN " + COL_REMARK + " TEXT");
                Log.i("UserDbHelper", "Upgraded to version 15: Added 'remark' column to user.");
            } catch (Exception e) {
                Log.e("UserDbHelper", "Failed to upgrade to version 15 for user.remark, falling back to destructive migration.", e);
                fallbackToDestructiveMigration(db);
            }
        }
    }

    private void fallbackToDestructiveMigration(SQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USER);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_CONVERSATIONS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_CHAT_MESSAGES);
        onCreate(db);
    }

    // --- Conversation (会话列表) 相关方法 ---
    public void upsertConversationMessage(Message msg) {
        String convId = msg.getSenderName();
        if (convId == null || convId.isEmpty()) return;
        ContentValues values = new ContentValues();
        values.put(COL_CONV_ID, convId);
        values.put(COL_SENDER, msg.getSenderName());
        values.put(COL_CONTENT, msg.getContent());
        values.put(COL_TIME, msg.getTime());
        values.put(COL_UNREAD, msg.getUnreadCount());
        database.insertWithOnConflict(TABLE_CONVERSATIONS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
    }

    public List<Message> loadAllConversations() {
        List<Message> list = new ArrayList<>();
        String query = "SELECT T1.*, T2." + COL_PHOTO + " as sender_avatar, T2." + COL_REMARK + " as sender_remark " +
                "FROM " + TABLE_CONVERSATIONS + " T1 " +
                "LEFT JOIN " + TABLE_USER + " T2 ON T1." + COL_SENDER + " = T2." + COL_ACCOUNT +
                " ORDER BY T1." + COL_TIME + " DESC";
        Cursor cursor = database.rawQuery(query, null);
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    do {
                        Message msg = new Message();
                        msg.setId(cursor.getString(cursor.getColumnIndexOrThrow(COL_CONV_ID)));
                        msg.setSenderName(cursor.getString(cursor.getColumnIndexOrThrow(COL_SENDER)));
                        msg.setContent(cursor.getString(cursor.getColumnIndexOrThrow(COL_CONTENT)));
                        msg.setTime(cursor.getString(cursor.getColumnIndexOrThrow(COL_TIME)));
                        msg.setUnreadCount(cursor.getInt(cursor.getColumnIndexOrThrow(COL_UNREAD)));
                        // 优先使用 user 表的 remark（sender_remark），若无则使用 conversations.remark
                        String userRemark = null;
                        try {
                            userRemark = cursor.getString(cursor.getColumnIndexOrThrow("sender_remark"));
                        } catch (Exception ignored) {}
                        String convRemark = null;
                        try {
                            convRemark = cursor.getString(cursor.getColumnIndexOrThrow(COL_REMARK));
                        } catch (Exception ignored) {}
                        if (userRemark != null && !userRemark.isEmpty()) {
                            msg.setRemark(userRemark);
                        } else {
                            msg.setRemark(convRemark);
                        }
                        msg.setSenderAvatar(cursor.getString(cursor.getColumnIndexOrThrow("sender_avatar")));
                        list.add(msg);
                    } while (cursor.moveToNext());
                }
            } finally {
                cursor.close();
            }
        }
        return list;
    }

    public void clearUnreadCount(String senderName) {
        if (senderName == null || senderName.isEmpty()) return;
        ContentValues values = new ContentValues();
        values.put(COL_UNREAD, 0);
        database.update(TABLE_CONVERSATIONS, values, COL_CONV_ID + " = ?", new String[]{senderName});
    }

    public void saveRemark(String conversationId, String remark) {
        if (conversationId == null || conversationId.isEmpty()) return;
        ContentValues values = new ContentValues();
        values.put(COL_REMARK, remark);
        database.update(TABLE_CONVERSATIONS, values, COL_CONV_ID + " = ?", new String[]{conversationId});
    }

    // 新增：同时保存到 user 表的 remark 字段
    public void saveUserRemark(String account, String remark) {
        if (account == null || account.isEmpty()) return;
        try {
            ContentValues values = new ContentValues();
            values.put(COL_REMARK, remark);
            int updated = database.update(TABLE_USER, values, COL_ACCOUNT + " = ?", new String[]{account});
            if (updated == 0) {
                // 如果没有该行，尝试插入一条最少信息的用户记录（避免重复）
                ContentValues cv = new ContentValues();
                cv.put(COL_ACCOUNT, account);
                cv.put(COL_REMARK, remark);
                database.insertWithOnConflict(TABLE_USER, null, cv, SQLiteDatabase.CONFLICT_IGNORE);
            }
        } catch (Exception e) {
            Log.e("UserDbHelper", "saveUserRemark failed", e);
        }
    }

    // --- ChatMessage (详细聊天记录) 相关方法 ---
    public void insertChatMessage(ChatMessage chatMessage) {
        ContentValues values = new ContentValues();
        values.put(COL_CHAT_MSG_ID, chatMessage.getMessageId());
        values.put(COL_CONV_ID, chatMessage.getConversationId());
        values.put(COL_CHAT_SENDER, chatMessage.getSender());
        values.put(COL_CHAT_RECEIVER, chatMessage.getReceiver());
        values.put(COL_CHAT_CONTENT, chatMessage.getContent());
        values.put(COL_CHAT_TIMESTAMP, chatMessage.getTimestamp());
        database.insert(TABLE_CHAT_MESSAGES, null, values);
    }
    public Message loadSingleConversation(String conversationId) {
        Message msg = null;
        // 只查询 conversations 表中，conv_id 匹配的那一行
        Cursor cursor = database.query(TABLE_CONVERSATIONS, null, COL_CONV_ID + " = ?", new String[]{conversationId}, null, null, null);

        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    // 如果找到了记录，就创建一个 Message 对象并填充数据
                    msg = new Message();
                    msg.setId(cursor.getString(cursor.getColumnIndexOrThrow(COL_CONV_ID)));
                    msg.setSenderName(cursor.getString(cursor.getColumnIndexOrThrow(COL_SENDER)));
                    msg.setContent(cursor.getString(cursor.getColumnIndexOrThrow(COL_CONTENT)));
                    msg.setTime(cursor.getString(cursor.getColumnIndexOrThrow(COL_TIME)));
                    msg.setUnreadCount(cursor.getInt(cursor.getColumnIndexOrThrow(COL_UNREAD)));
                    // 最关键的一步：获取 remark
                    msg.setRemark(cursor.getString(cursor.getColumnIndexOrThrow(COL_REMARK)));
                    // 注意：这个查询不包含头像，因为头像在 user 表中
                }
            } finally {
                cursor.close(); // 查完后必须关闭 cursor
            }
        }
        return msg; // 返回找到的 Message 对象，如果没找到则返回 null
    }
    public List<ChatMessage> loadMessagesForConversation(String conversationId, String currentUsername) {
        List<ChatMessage> list = new ArrayList<>();
        Cursor cursor = database.query(TABLE_CHAT_MESSAGES, null, COL_CONV_ID + " = ?", new String[]{conversationId}, null, null, COL_CHAT_TIMESTAMP + " ASC");
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    do {
                        String msgId = cursor.getString(cursor.getColumnIndexOrThrow(COL_CHAT_MSG_ID));
                        String sender = cursor.getString(cursor.getColumnIndexOrThrow(COL_CHAT_SENDER));
                        String receiver = cursor.getString(cursor.getColumnIndexOrThrow(COL_CHAT_RECEIVER));
                        String content = cursor.getString(cursor.getColumnIndexOrThrow(COL_CHAT_CONTENT));
                        String timestamp = cursor.getString(cursor.getColumnIndexOrThrow(COL_CHAT_TIMESTAMP));
                        boolean isSentByMe = sender.equals(currentUsername);
                        list.add(new ChatMessage(msgId, conversationId, sender, receiver, content, timestamp, isSentByMe));
                    } while (cursor.moveToNext());
                }
            } finally {
                cursor.close();
            }
        }
        return list;
    }

    // --- User 表相关方法 ---
    public void insertUser(String account, String photo, String email, String token) {
        ContentValues values = new ContentValues();
        values.put(COL_ACCOUNT, account);
        values.put(COL_PHOTO, photo);
        values.put(COL_EMAIL, email);
        values.put(COL_TOKEN, token);
        values.put(COL_REMARK, ""); // 默认写入空 remark
        database.insert(TABLE_USER, null, values);
    }

    public String getUserToken(String account) {
        String token = null;
        Cursor cursor = database.query(TABLE_USER, new String[]{COL_TOKEN}, COL_ACCOUNT + " = ?", new String[]{account}, null, null, null);
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    token = cursor.getString(cursor.getColumnIndexOrThrow(COL_TOKEN));
                }
            } finally {
                cursor.close();
            }
        }
        return token;
    }

    public User searchUserByAccount(String account) {
        User user = null;
        Cursor cursor = database.query(TABLE_USER, null, COL_ACCOUNT + " = ?", new String[]{account}, null, null, null);
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    long id = cursor.getLong(cursor.getColumnIndexOrThrow(COL_ID));
                    String foundAccount = cursor.getString(cursor.getColumnIndexOrThrow(COL_ACCOUNT));
                    String photo = cursor.getString(cursor.getColumnIndexOrThrow(COL_PHOTO));
                    String email = cursor.getString(cursor.getColumnIndexOrThrow(COL_EMAIL));
                    String token = cursor.getString(cursor.getColumnIndexOrThrow(COL_TOKEN));
                    String remark = null;
                    try {
                        remark = cursor.getString(cursor.getColumnIndexOrThrow(COL_REMARK));
                    } catch (Exception ignored) {}
                    user = new User(id, foundAccount, photo, email, token, remark);
                }
            } finally {
                cursor.close();
            }
        }
        return user;
    }

    public void updateUserInfo(String account, String newEmail, String newToken, String newPhoto) {
        ContentValues values = new ContentValues();
        values.put(COL_EMAIL, newEmail);
        values.put(COL_TOKEN, newToken);
        values.put(COL_PHOTO, newPhoto);
        database.update(TABLE_USER, values, COL_ACCOUNT + " = ?", new String[]{account});
    }

    public void deleteUserByAccount(String account) {
        database.delete(TABLE_USER, COL_ACCOUNT + " = ?", new String[]{account});
    }

    public void deleteAllUsers() {
        database.delete(TABLE_USER, null, null);
    }

    // UserDbHelper.java

    // 修改后的 updateRemark：作为一个统一的入口，同时更新两张表
    public void updateRemark(String account, String newRemark) {
        if (account == null) return;
        Log.d("UserDbHelper", "updateRemark called: account=" + account + ", remark=" + newRemark);
        saveRemark(account, newRemark);
        saveUserRemark(account, newRemark);
        Log.d("UserDbHelper", "updateRemark completed");
    }


}