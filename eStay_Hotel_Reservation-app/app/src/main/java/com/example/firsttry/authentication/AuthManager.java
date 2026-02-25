package com.example.firsttry.authentication;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * 负责 JWT Token 的存取。
 */
public class AuthManager {

    private static final String PREF_NAME = "auth_prefs";
    private static final String KEY_TOKEN  = "jwt_token";

    private final SharedPreferences prefs;

    // 单例
    private static AuthManager instance;

    public static void init(Context context) {
        if (instance == null) {
            instance = new AuthManager(context.getApplicationContext());
        }
    }

    public static AuthManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("AuthManager not initialized, " +
                    "call AuthManager.init(context) in Application.onCreate()");
        }
        return instance;
    }

    private AuthManager(Context appContext) {
        prefs = appContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void saveToken(String token) {
        prefs.edit().putString(KEY_TOKEN, token).apply();
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public void clearToken() {
        prefs.edit().remove(KEY_TOKEN).apply();
    }

    public boolean isLoggedIn() {
        return getToken() != null;
    }
}