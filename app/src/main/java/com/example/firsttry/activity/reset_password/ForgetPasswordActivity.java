package com.example.firsttry.activity.reset_password;

import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.activity.user.LoginActivity;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;

public class ForgetPasswordActivity extends AppCompatActivity {

    private EditText etEmail;
    private EditText etOtp;
    private EditText etPassword;
    private EditText etConfirmedPassword;
    private Button btnSendOtp;
    private Button btnConfirmReset;

    private CountDownTimer countDownTimer;
    private boolean isTimerRunning = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_merged_reset_password);

        initView();
        setupListeners();
    }

    private void initView() {
        etEmail = findViewById(R.id.et_email);
        etOtp = findViewById(R.id.et_otp);
        etPassword = findViewById(R.id.et_password);
        etConfirmedPassword = findViewById(R.id.confirmed_password);
        btnSendOtp = findViewById(R.id.btn_send_otp);
        btnConfirmReset = findViewById(R.id.btn_confirm_reset);
    }

    private void setupListeners() {
        // Send OTP Button
        btnSendOtp.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            if (TextUtils.isEmpty(email)) {
                Toast.makeText(this, "请输入邮箱", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(this, "请输入有效的邮箱地址", Toast.LENGTH_SHORT).show();
                return;
            }
            
            sendOtp(email);
        });

        // Confirm Reset Button
        btnConfirmReset.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String otp = etOtp.getText().toString().trim();
            String password = etPassword.getText().toString().trim();
            String confirmedPassword = etConfirmedPassword.getText().toString().trim();

            if (TextUtils.isEmpty(email)) {
                Toast.makeText(this, "请输入邮箱", Toast.LENGTH_SHORT).show();
                return;
            }
            if (TextUtils.isEmpty(otp)) {
                Toast.makeText(this, "请输入验证码", Toast.LENGTH_SHORT).show();
                return;
            }
            if (TextUtils.isEmpty(password)) {
                Toast.makeText(this, "请输入新密码", Toast.LENGTH_SHORT).show();
                return;
            }
            if (TextUtils.isEmpty(confirmedPassword)) {
                Toast.makeText(this, "请再次输入密码", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!password.equals(confirmedPassword)) {
                Toast.makeText(this, "两次输入的密码不一致", Toast.LENGTH_SHORT).show();
                return;
            }

            resetPassword(email, otp, password, confirmedPassword);
        });
    }

    private void sendOtp(String email) {
        btnSendOtp.setEnabled(false);
        
        UserApi.forget_password(email, new UserApi.UserCallback() {
            @Override
            public void onSuccess(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "验证码已发送", Toast.LENGTH_SHORT).show();
                    startCountDown();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "发送失败: " + message, Toast.LENGTH_SHORT).show();
                    btnSendOtp.setEnabled(true);
                });
            }

            @Override
            public void onFailure(IOException e) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "网络错误，请重试", Toast.LENGTH_SHORT).show();
                    btnSendOtp.setEnabled(true);
                });
            }
        });
    }

    private void startCountDown() {
        isTimerRunning = true;
        countDownTimer = new CountDownTimer(60000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                btnSendOtp.setText(millisUntilFinished / 1000 + "s");
            }

            @Override
            public void onFinish() {
                isTimerRunning = false;
                btnSendOtp.setText("重新发送");
                btnSendOtp.setEnabled(true);
            }
        }.start();
    }

    private void resetPassword(String email, String otp, String password, String confirmedPassword) {
        // Disable button to prevent multiple clicks
        btnConfirmReset.setEnabled(false);

        UserApi.reset_password(email, password, confirmedPassword, otp, new UserApi.UserCallback() {
            @Override
            public void onSuccess(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "密码重置成功", Toast.LENGTH_SHORT).show();
                    // Go to Login
                    Intent intent = new Intent(ForgetPasswordActivity.this, LoginActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                    finish();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "重置失败: " + message, Toast.LENGTH_SHORT).show();
                    btnConfirmReset.setEnabled(true);
                });
            }

            @Override
            public void onFailure(IOException e) {
                runOnUiThread(() -> {
                    Toast.makeText(ForgetPasswordActivity.this, "网络错误，请重试", Toast.LENGTH_SHORT).show();
                    btnConfirmReset.setEnabled(true);
                });
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
    }
}