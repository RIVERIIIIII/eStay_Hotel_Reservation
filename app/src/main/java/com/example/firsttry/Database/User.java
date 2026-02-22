package com.example.firsttry.Database;

public class User {
    private final long id;
    private final String account;
    private final String photo;
    private final String email;
    private final String token;
    private final String remark; // 新增字段

    public User(long id,
                String account,
                String photo,
                String email,
                String token,
                String remark) { // 构造函数新增 remark 参数
        this.id = id;
        this.account = account;
        this.photo = photo;
        this.email = email;
        this.token = token;
        this.remark = remark;
    }

    public long getId() { return id; }

    public String getAccount() { return account; }

    public String getPhoto() { return photo; }

    public String getEmail() { return email; }

    public String getToken() { return token; }

    public String getRemark() { return remark; } // 新增 getter
}