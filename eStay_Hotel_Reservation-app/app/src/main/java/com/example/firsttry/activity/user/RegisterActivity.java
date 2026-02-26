package com.example.firsttry.activity.user;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.R;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;

public class RegisterActivity extends AppCompatActivity {

    private EditText etAccount;
    private EditText etPassword;
    private EditText etEmail;
    private EditText confirmPassword;
    private Button btnRegister;
    private UserDbHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        // === 【核心修改点】使用单例模式获取 UserDbHelper 实例 ===
        dbHelper = UserDbHelper.getInstance(this);

        initView();
        registerListener();
    }

    private void initView() {
        etAccount = findViewById(R.id.et_account);
        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        confirmPassword = findViewById(R.id.confirmed_password);
        btnRegister = findViewById(R.id.btn_create_account);
    }

    private void registerListener() {
        btnRegister.setOnClickListener(v -> {
            String inputAccount = etAccount.getText().toString().trim();
            String inputEmail = etEmail.getText().toString().trim();
            String inputPassword = etPassword.getText().toString().trim();
            String inputConfirmPassword = confirmPassword.getText().toString().trim();
            String inputPhoto = ""; // 移除输入框后，默认为空或设置默认头像URL

            if (TextUtils.isEmpty(inputAccount) || TextUtils.isEmpty(inputEmail) ||
                    TextUtils.isEmpty(inputPassword) || TextUtils.isEmpty(inputConfirmPassword)) {
                Toast.makeText(this, "所有字段均为必填项", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!inputPassword.equals(inputConfirmPassword)) {
                Toast.makeText(this, "两次输入的密码不一致", Toast.LENGTH_SHORT).show();
                return;
            }

            RegisterRequest(inputAccount, inputPhoto, inputEmail, inputPassword, inputConfirmPassword);
        });
    }

    private void RegisterRequest(String account, String photo, String email, String password, String confirmPassword) {
        UserApi.register(account, email, password, confirmPassword, photo, new UserApi.UserCallback() {
            @Override
            public void onSuccess(String message) {
                // 后台执行数据库插入
                new Thread(() -> {
                    dbHelper.insertUser(account, photo, email, "");

                    // 切回主线程做界面跳转和提示
                    runOnUiThread(() -> {
                        Toast.makeText(RegisterActivity.this, "用户创建成功", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                        finish();
                    });
                }).start();
            }


            @Override
            public void onError(String message) {
                runOnUiThread(() -> Toast.makeText(RegisterActivity.this, message, Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onFailure(IOException e) {
                Log.e("RegisterActivity", "Register API call failed", e);
                runOnUiThread(() -> Toast.makeText(RegisterActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show());
            }
        });
    }
}