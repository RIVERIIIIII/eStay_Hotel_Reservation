package com.example.firsttry.remote.Http;

import android.util.Log;

import com.example.firsttry.activity.message.Message;
import com.example.firsttry.remote.Http.HttpClient;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class UserApi {

    private static final String TAG = "UserApi";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    
    // 暂存重置密码的Token
    private static String currentResetToken = null;

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

    // 注册用户
    public static void register(String account, String email, String password, String confirmedPassword, String photo, UserCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/auth/register";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("username", account);
            requestBody.put("email", email);
            requestBody.put("password", password);
        } catch (JSONException e) {
            if (callback != null) {
                callback.onError("Request body error");
            }
            return;
        }

        RequestBody body = RequestBody.create(requestBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        JSONObject responseBody = new JSONObject(response.body().string());
                        String token = responseBody.getString("token");
                        if (callback != null) {
                            callback.onSuccess(token);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage;
                        if (errorBody.has("errors")) {
                            // 解析 express-validator 返回的数组错误
                            errorMessage = errorBody.getJSONArray("errors")
                                    .getJSONObject(0).getString("msg");
                        } else if (errorBody.has("message")) {
                            errorMessage = errorBody.getString("message");
                        } else {
                            errorMessage = "未知错误";
                        }
                        
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }

    // 登录用户
    public static void login(String account, String password, UserCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/auth/login";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("account", account);
            requestBody.put("password", password);
        } catch (JSONException e) {
            if (callback != null) {
                callback.onError("Request body error");
            }
            return;
        }

        RequestBody body = RequestBody.create(requestBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        JSONObject responseBody = new JSONObject(response.body().string());
                        String token = responseBody.getString("token");
                        if (callback != null) {
                            callback.onSuccess(token);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage = errorBody.getString("message");
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }

    // 忘记密码
    public static void forget_password(String email, UserCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/auth/forgot-password";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("email", email);
        } catch (JSONException e) {
            if (callback != null) {
                callback.onError("Request body error");
            }
            return;
        }

        RequestBody body = RequestBody.create(requestBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        JSONObject responseBody = new JSONObject(response.body().string());
                        String message = responseBody.getString("message");
                        if (responseBody.has("resetToken")) {
                            currentResetToken = responseBody.getString("resetToken");
                        }
                        if (callback != null) {
                            callback.onSuccess(message);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage = errorBody.getString("message");
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }

    // 验证 OTP (Mock)
    public static void verifyOtp(String email, String otp, UserCallback callback) {
        // 由于后端没有OTP验证接口，直接返回成功，并打印Token
        Log.d(TAG, "Mock verify OTP: " + otp + ", Current Token: " + currentResetToken);
        if (callback != null) {
            new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> 
                callback.onSuccess("OTP Verified (Mock)")
            );
        }
    }

    // 重置密码
    public static void reset_password(String email, String password, String confirmPassword, String otp, UserCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/auth/reset-password";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("email", email);
            requestBody.put("newPassword", password); // 后端接收 newPassword
            // 优先使用 currentResetToken (从 forgot-password 接口获取)
            // 如果没有则使用用户输入的 OTP (虽然 OTP 只是验证码，但在此流程中充当 Token 角色)
            // 注意：后端逻辑是用 OTP (resetToken) 来验证，所以这里传 otp
            requestBody.put("token", otp); // 后端接收 token
        } catch (JSONException e) {
            if (callback != null) {
                callback.onError("Request body error");
            }
            return;
        }

        RequestBody body = RequestBody.create(requestBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        JSONObject responseBody = new JSONObject(response.body().string());
                        String message = responseBody.getString("message");
                        if (callback != null) {
                            callback.onSuccess(message);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage = errorBody.getString("message");
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }

    // 获取消息列表
    public static void getMessages(String token, final MessageListCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/messages";

        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("Authorization", "Bearer " + token)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        // 注意：这里需要根据实际的Message类结构进行解析
                        // 由于Message类的具体实现未知，这里只做基本的响应处理
                        // 在实际应用中，需要将JSON响应转换为Message对象列表
                        String responseBody = response.body().string();
                        // 这里假设前端有相应的解析逻辑
                        if (callback != null) {
                            // 由于缺乏具体的Message解析逻辑，这里暂时返回空列表
                            // 在实际应用中，需要解析responseBody并创建Message对象列表
                            callback.onSuccess(java.util.Collections.emptyList());
                        }
                    } catch (Exception e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage = errorBody.getString("message");
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }

    // 发送消息
    public static void sendMessage(String token, String receiverId, String content, UserCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/messages";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("receiverId", receiverId);
            requestBody.put("content", content);
        } catch (JSONException e) {
            if (callback != null) {
                callback.onError("Request body error");
            }
            return;
        }

        RequestBody body = RequestBody.create(requestBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Authorization", "Bearer " + token)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (callback != null) {
                    callback.onFailure(e);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        JSONObject responseBody = new JSONObject(response.body().string());
                        String message = responseBody.getString("message");
                        if (callback != null) {
                            callback.onSuccess(message);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Response parsing error");
                        }
                    }
                } else {
                    try {
                        JSONObject errorBody = new JSONObject(response.body().string());
                        String errorMessage = errorBody.getString("message");
                        if (callback != null) {
                            callback.onError(errorMessage);
                        }
                    } catch (JSONException e) {
                        if (callback != null) {
                            callback.onError("Error parsing error response");
                        }
                    }
                }
            }
        });
    }
}
