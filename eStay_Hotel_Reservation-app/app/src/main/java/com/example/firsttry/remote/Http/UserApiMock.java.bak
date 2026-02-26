package com.example.firsttry.remote.Http;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.example.firsttry.activity.hotel.model.HotelModel;
import com.example.firsttry.activity.hotel.model.HotelSearchQuery;
import com.example.firsttry.activity.message.Message;
import com.example.firsttry.utils.MockData;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class UserApiMock {

    private static final String TAG = "UserApiMock";

    private static void simulateNetworkDelay(Runnable runnable) {
        new Handler(Looper.getMainLooper()).postDelayed(runnable, 1000); // 1秒延迟
    }

    public static void register(String username, String email, String password, String passwordCheck, String image, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock register: " + username);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockToken());
            }
        });
    }

    public static void login(String username, String password, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock login: " + username);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockToken());
            }
        });
    }

    public static void forget_password(String email, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock forget_password: " + email);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                if (MockData.ResetPasswordFlow.EMAIL.equals(email)) {
                    callback.onSuccess(MockData.ResetPasswordFlow.VERIFICATION_CODE);
                } else {
                    callback.onSuccess("123456");
                }
            }
        });
    }

    public static void verifyOtp(String email, String code, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock verifyOtp: " + email + ", code: " + code);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                if (MockData.ResetPasswordFlow.EMAIL.equals(email) && MockData.ResetPasswordFlow.VERIFICATION_CODE.equals(code)) {
                    callback.onSuccess("验证成功");
                } else if ("preview@example.com".equals(email) && "1234".equals(code)) {
                    callback.onSuccess("验证成功");
                } else {
                    callback.onError("验证码错误");
                }
            }
        });
    }

    public static void reset_password(String email, String password, String passwordCheck, String code, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock reset_password: " + email + ", code: " + code);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess("密码重置成功");
            }
        });
    }

    public static void getMessages(String token, final UserApi.MessageListCallback callback) {
        Log.d(TAG, "Mock getMessages");
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(MockData.getMockMessages());
            }
        });
    }
    
    public static void getMessageHistory(String partnerAccount, String cursor, String direction, int pageSize, UserApi.MessageHistoryCallback callback) {
        Log.d(TAG, "Mock getMessageHistory: " + partnerAccount);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                // Return some mock history
                List<Message> list = MockData.getMockMessages();
                callback.onSuccess(list, false, "");
            }
        });
    }
    
    public static void sendMessage(String hotelId, String username, String content, UserApi.SendMessageCallback callback) {
        Log.d(TAG, "Mock sendMessage to " + username);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess("msg_" + System.currentTimeMillis(), String.valueOf(System.currentTimeMillis()));
            }
        });
    }

    public static void getHotelList(HotelSearchQuery query, UserApi.HotelListCallback callback) {
        Log.d(TAG, "Mock getHotelList: " + (query != null ? query.getCity() : "null"));
        simulateNetworkDelay(() -> {
            if (callback != null) {
                List<HotelModel> list = new ArrayList<>();
                for (int i = 0; i < 10; i++) {
                    List<String> tags = new ArrayList<>();
                    if (i % 2 == 0) tags.add("免费停车");
                    if (i % 3 == 0) tags.add("健身房");
                    tags.add("免费WiFi");
                    
                    list.add(new HotelModel(
                            "Mock Hotel " + (i + 1),
                            null,
                            300 + (i * 50),
                            tags,
                            1.5 + (i * 0.5),
                            query != null && query.isLocationMode(),
                            4.0f + (i % 10) * 0.1f
                    ));
                }
                callback.onSuccess(list);
            }
        });
    }

    public static void getSearchInitData(UserApi.SearchInitCallback callback) {
        Log.d(TAG, "Mock getSearchInitData");
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess(new ArrayList<>()); 
            }
        });
    }

    public static void getHotelDetail(String hotelId, String checkInDate, String checkOutDate, UserApi.HotelDetailCallback callback) {
        Log.d(TAG, "Mock getHotelDetail: " + hotelId);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                JSONObject mockDetail = new JSONObject();
                try {
                    mockDetail.put("name", "Mock Hotel Detail");
                    mockDetail.put("address", "123 Mock St");
                } catch (Exception e) {}
                callback.onSuccess(mockDetail);
            }
        });
    }

    public static void submitHotelScore(String hotelId, float score, UserApi.UserCallback callback) {
        Log.d(TAG, "Mock submitHotelScore: " + hotelId + " = " + score);
        simulateNetworkDelay(() -> {
            if (callback != null) {
                callback.onSuccess("评分提交成功");
            }
        });
    }
}
