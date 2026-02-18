package com.example.firsttry.activity.reset_password;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View; // 导入 View
import android.widget.Button; // 导入 Button
import android.widget.EditText;
import android.widget.Toast;

import com.example.firsttry.R;

public class ResetPasswordActivity extends AppCompatActivity {

    private String verificationCode; // 从上个页面接收的正确验证码
    private String userEnteredOtp;   // 用户实际输入的验证码

    private EditText[] otpEditTexts;
    private Button btnConfirm; // 声明确认按钮

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_code);

        initView();
        getVerificationCode();
        setupConfirmButtonListener(); // 设置按钮监听
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

    // 从Intent获取正确的验证码
    private void getVerificationCode() {
        Intent intent = getIntent();
        String receivedCode = intent.getStringExtra("VERIFICATION_CODE");

        if (receivedCode != null && !receivedCode.isEmpty()) {
            this.verificationCode = receivedCode;
            Log.d("ResetPasswordActivity", "成功接收到的验证码是: " + this.verificationCode);
        } else {
            Log.e("ResetPasswordActivity", "没有在Intent中找到有效的验证码!");
            Toast.makeText(this, "获取验证码失败，请返回重试", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    // 从输入框收集用户输入的验证码
    private void collectOtpInput() {
        StringBuilder otpBuilder = new StringBuilder();
        for (EditText editText : otpEditTexts) {
            otpBuilder.append(editText.getText().toString().trim());
        }
        userEnteredOtp = otpBuilder.toString();
    }

    // 设置确认按钮的点击监听
    private void setupConfirmButtonListener() {
        btnConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 只有当用户点击按钮时，才收集并检查验证码
                collectOtpInput();
                Log.d("ResetPasswordActivity", "用户点击确认，输入的验证码是: " + userEnteredOtp);

                // 进行比较
                if (verificationCode.equals(userEnteredOtp)) {
                    Toast.makeText(ResetPasswordActivity.this, "验证码正确", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(ResetPasswordActivity.this, SetNewPasswordActivity.class);
                    // 把 email 继续传递给下一个页面
                    intent.putExtra("email", getIntent().getStringExtra("email"));
                    startActivity(intent);
                    finish(); // 验证成功后，关闭当前页面
                } else {
                    Toast.makeText(ResetPasswordActivity.this, "验证码错误，请重新输入", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
}