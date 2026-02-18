package com.example.firsttry.activity.reset_password;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.activity.user.LoginActivity;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;

public class SetNewPasswordActivity extends AppCompatActivity {

    private EditText etPassword;
    private EditText etConfirmedPassword;
    private Button btnConfirm;

    // === 【核心修改点】不再需要 UserDbHelper 实例 ===
    // private UserDbHelper dbHelper; // 不再需要这个，因为本地不操作密码

    private String userEmail;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reset_password); // 请确保你的布局文件名正确

        // 获取从上个页面传来的 email
        Intent intent = getIntent();
        userEmail = intent.getStringExtra("email");
        if (userEmail == null || userEmail.isEmpty()) {
            Toast.makeText(this, "无法获取用户信息，请重试", Toast.LENGTH_LONG).show();
            finish(); // 结束Activity
            return;
        }

        initView();
        setupConfirmButtonListener();
    }

    private void initView() {
        etPassword = findViewById(R.id.et_password);
        etConfirmedPassword = findViewById(R.id.confirmed_password);
        btnConfirm = findViewById(R.id.btn_reset_password);
    }

    private void setupConfirmButtonListener() {
        btnConfirm.setOnClickListener(v -> {
            String newPassword = etPassword.getText().toString().trim();
            String confirmedNewPassword = etConfirmedPassword.getText().toString().trim();

            if (TextUtils.isEmpty(newPassword) || TextUtils.isEmpty(confirmedNewPassword)) {
                Toast.makeText(SetNewPasswordActivity.this, "密码不能为空", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!newPassword.equals(confirmedNewPassword)) {
                Toast.makeText(SetNewPasswordActivity.this, "两次输入的密码不一致", Toast.LENGTH_SHORT).show();
                return;
            }

            // 发送网络请求到服务器来重置密码
            ResetRequest(userEmail, newPassword, confirmedNewPassword);
        });
    }

    private void ResetRequest(String email, String newPassword, String confirmedNewPassword){
        UserApi.reset_password(email, newPassword, confirmedNewPassword, new UserApi.UserCallback() {
            @Override
            public void onSuccess(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(SetNewPasswordActivity.this, message, Toast.LENGTH_SHORT).show();

                    // === 【核心修改点】密码已在服务器端更新，本地无需任何操作 ===
                    // 不再调用 updatePasswordInLocalDatabase()

                    // 成功后直接跳转到登录页面
                    Intent intent = new Intent(SetNewPasswordActivity.this, LoginActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                    finish();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> Toast.makeText(SetNewPasswordActivity.this, "错误: " + message, Toast.LENGTH_LONG).show());
            }

            @Override
            public void onFailure(IOException e) {
                runOnUiThread(() -> Toast.makeText(SetNewPasswordActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show());
            }
        });
    }

}