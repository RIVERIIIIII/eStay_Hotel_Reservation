package com.example.firsttry.remote.Http;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.firsttry.activity.message.Message;
import com.example.firsttry.utils.MockData;

import java.io.IOException;
import java.util.List;

public class UserApi {

    private static final String TAG = "UserApi";

    public interface UserCallback {
        void onSuccess(String tokenOrMessage);
        void onError(String message);
        void onFailure(IOException e);
    }

    public interface MessageListCallback {
        void onSuccess(List<Message> messages);
        void onError(String message);
        void onFailure(IOException e);
    }

    private static void simulateNetworkDelay(Runnable runnable) {
        new Handler(Looper.getMainLooper()).postDelayed(runnable, 1000); // 1秒延迟
    }

    public static void register(String account, String email, String password, String confirmedPassword, String photo, UserCallback callback) {
        Log.d(TAG, "Mock register: " + account);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockToken());
            }
        });
    }

    public static void login(String account, String password, UserCallback callback) {
        Log.d(TAG, "Mock login: " + account);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockToken());
            }
        });
    }

    public static void forget_password(String email, UserCallback callback) {
        Log.d(TAG, "Mock forget_password: " + email);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess("123456"); // Mock verification code
            }
        });
    }

    public static void reset_password(String email, String password, String confirmPassword, UserCallback callback) {
        Log.d(TAG, "Mock reset_password: " + email);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess("密码重置成功");
            }
        });
    }

    public static void getMessages(String token, final MessageListCallback callback) {
        Log.d(TAG, "Mock getMessages");
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockMessages());
            }
        });
    }
}
