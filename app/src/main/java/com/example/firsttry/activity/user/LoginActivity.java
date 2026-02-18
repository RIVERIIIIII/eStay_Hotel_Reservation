package com.example.firsttry.activity.user;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.Database.User;
import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.R;
import com.example.firsttry.activity.utils.VideoActivity;
import com.example.firsttry.activity.reset_password.ForgetPasswordActivity;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;

public class LoginActivity extends AppCompatActivity {

    private EditText etAccount;
    private EditText etPassword;
    private Button btnLogin;
    private Button btnRegister;
    private Button btnForgetPassword;
    private Button btnSkipLogin; // 临时跳过按钮
    private UserDbHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // === 【核心修改点】使用单例模式获取 UserDbHelper 实例 ===
        dbHelper = UserDbHelper.getInstance(this);

        initView();
        initListeners();
    }

    private void initView() {
        etAccount = findViewById(R.id.et_account);
        etPassword = findViewById(R.id.et_password);
        btnLogin  = findViewById(R.id.btn_login);
        btnRegister = findViewById(R.id.btn_register);
        btnForgetPassword = findViewById(R.id.forgotPasswordTextView);
        btnSkipLogin = findViewById(R.id.btn_skip_login);
    }

    private void initListeners() {
        btnLogin.setOnClickListener(v -> {
            String inputAccount = etAccount.getText().toString().trim();
            String inputPassword = etPassword.getText().toString().trim();

            if (TextUtils.isEmpty(inputAccount) || TextUtils.isEmpty(inputPassword)) {
                Toast.makeText(LoginActivity.this, "账号和密码不能为空", Toast.LENGTH_SHORT).show();
                return;
            }

            UserApi.login(inputAccount, inputPassword, new UserApi.UserCallback() {
                // java
// 在 UserApi.login 的回调 onSuccess 内使用这个代码替换原有 runOnUiThread(...) 部分
                @Override
                public void onSuccess(String token) {
                    // 在后台线程做数据库相关阻塞操作
                    new Thread(() -> {
                        User user = dbHelper.searchUserByAccount(inputAccount);
                        if (user == null) {
                            dbHelper.insertUser(inputAccount, null, null, token);
                        } else {
                            dbHelper.updateUserInfo(inputAccount, user.getEmail(), token, user.getPhoto());
                        }

                        // 保存账号到 SharedPreferences（可以在后台调用 apply）
                        SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
                        prefs.edit().putString("account", inputAccount).apply();

                        // 仅 UI 操作回到主线程
                        runOnUiThread(() -> {
                            Toast.makeText(LoginActivity.this, "登录成功", Toast.LENGTH_SHORT).show();
                            try {
                                // 防御性跳转：检查目标类是否存在
                                Class<?> targetClass = Class.forName("com.example.firsttry.activity.hotel.HotelSearchActivity");
                                Intent intent = new Intent(LoginActivity.this, targetClass);
                                startActivity(intent);
                                finish();
                            } catch (ClassNotFoundException e) {
                                Log.e("LoginActivity", "Target activity not found", e);
                                Toast.makeText(LoginActivity.this, "无法跳转：目标页面未找到", Toast.LENGTH_SHORT).show();
                            } catch (Exception e) {
                                Log.e("LoginActivity", "Navigation failed", e);
                                Toast.makeText(LoginActivity.this, "页面跳转发生错误", Toast.LENGTH_SHORT).show();
                            }
                        });
                    }).start();
                }


                @Override
                public void onError(String message) {
                    runOnUiThread(() -> Toast.makeText(LoginActivity.this, message, Toast.LENGTH_SHORT).show());
                }

                @Override
                public void onFailure(IOException e) {
                    Log.e("LoginActivity", "Login API call failed", e);
                    runOnUiThread(() -> Toast.makeText(LoginActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show());
                }
            });
        });

        btnRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });

        btnForgetPassword.setOnClickListener(view -> {
            startActivity(new Intent(LoginActivity.this, ForgetPasswordActivity.class));
        });

        if (btnSkipLogin != null) {
            btnSkipLogin.setOnClickListener(v -> {
                try {
                    Class<?> targetClass = Class.forName("com.example.firsttry.activity.hotel.HotelSearchActivity");
                    Intent intent = new Intent(LoginActivity.this, targetClass);
                    startActivity(intent);
                    // 跳过登录通常不finish，方便返回测试，正式上线可去掉
                } catch (ClassNotFoundException e) {
                    Toast.makeText(LoginActivity.this, "目标页面未找到", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(LoginActivity.this, "跳转异常", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
}