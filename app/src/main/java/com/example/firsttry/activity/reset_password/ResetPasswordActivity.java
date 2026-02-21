package com.example.firsttry.activity.reset_password;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.firsttry.R;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;

public class ResetPasswordActivity extends AppCompatActivity {

    private String userEmail; // 用户邮箱
    private String userEnteredOtp;   // 用户实际输入的验证码

    private EditText[] otpEditTexts;
    private Button btnConfirm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_code);

        initView();
        getIntentData();
        setupConfirmButtonListener();
        setupOtpInputListeners();
    }

    private void initView() {
        otpEditTexts = new EditText[]{
                findViewById(R.id.otpEditText1),
                findViewById(R.id.otpEditText2),
                findViewById(R.id.otpEditText3),
                findViewById(R.id.otpEditText4)
        };
        btnConfirm = findViewById(R.id.btn_confirm);
    }

    private void getIntentData() {
        Intent intent = getIntent();
        userEmail = intent.getStringExtra("email");
        if (userEmail == null || userEmail.isEmpty()) {
            // 防御性处理，如果没有 email 也许应该退出
            Log.e("ResetPasswordActivity", "Email is missing!");
        }
        // 不再需要获取本地的 VERIFICATION_CODE
    }

    private void collectOtpInput() {
        StringBuilder otpBuilder = new StringBuilder();
        for (EditText editText : otpEditTexts) {
            otpBuilder.append(editText.getText().toString().trim());
        }
        userEnteredOtp = otpBuilder.toString();
    }

    private void setupConfirmButtonListener() {
        btnConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                collectOtpInput();
                if (userEnteredOtp.length() != 4) {
                    Toast.makeText(ResetPasswordActivity.this, "请输入完整验证码", Toast.LENGTH_SHORT).show();
                    return;
                }
                
                // 调用服务器校验验证码
                UserApi.verifyOtp(userEmail, userEnteredOtp, new UserApi.UserCallback() {
                    @Override
                    public void onSuccess(String message) {
                        runOnUiThread(() -> {
                            Toast.makeText(ResetPasswordActivity.this, "验证成功", Toast.LENGTH_SHORT).show();
                            Intent intent = new Intent(ResetPasswordActivity.this, SetNewPasswordActivity.class);
                            intent.putExtra("email", userEmail);
                            intent.putExtra("otp", userEnteredOtp); // 传递 OTP 给下一步
                            startActivity(intent);
                            finish();
                        });
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> Toast.makeText(ResetPasswordActivity.this, "验证失败: " + message, Toast.LENGTH_SHORT).show());
                    }

                    @Override
                    public void onFailure(IOException e) {
                        runOnUiThread(() -> Toast.makeText(ResetPasswordActivity.this, "网络错误", Toast.LENGTH_SHORT).show());
                    }
                });
            }
        });
    }

    private void setupOtpInputListeners() {
        for (int i = 0; i < otpEditTexts.length; i++) {
            final int index = i;
            otpEditTexts[i].addTextChangedListener(new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {
                    if (s.length() == 1) {
                        if (index < otpEditTexts.length - 1) {
                            otpEditTexts[index + 1].requestFocus();
                        } else {
                            // 最后一个输入框，隐藏键盘或自动提交
                            // InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                            // imm.hideSoftInputFromWindow(otpEditTexts[index].getWindowToken(), 0);
                        }
                    }
                }

                @Override
                public void afterTextChanged(Editable s) {}
            });
            
            // 处理删除键回退
            otpEditTexts[i].setOnKeyListener((v, keyCode, event) -> {
                if (keyCode == KeyEvent.KEYCODE_DEL && event.getAction() == KeyEvent.ACTION_DOWN) {
                    if (otpEditTexts[index].getText().length() == 0 && index > 0) {
                        otpEditTexts[index - 1].requestFocus();
                        otpEditTexts[index - 1].setSelection(otpEditTexts[index - 1].getText().length());
                        return true;
                    }
                }
                return false;
            });
        }
    }
}