package com.example.firsttry.activity.reset_password;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.remote.Http.UserApi;

import java.io.IOException;


public class ForgetPasswordActivity extends AppCompatActivity {

    private Button btnNext;
    private EditText reset_email;

    private void initView() {
        reset_email= findViewById(R.id.et_email);
        btnNext= findViewById(R.id.btn_reset_account);
        forgetPasswordListener();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forget_password);
        initView();

    }
    private void forgetPasswordListener() {
        btnNext.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v) {
                RestRequest(reset_email);
            }
        });
    }

    private void RestRequest(EditText email){
        UserApi.forget_password(email.getText().toString().trim(), new UserApi.UserCallback() {
            @Override
            public void onSuccess(String code) {
                // 网络回调在子线程，UI操作（Toast和跳转）需要回到主线程
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(ForgetPasswordActivity.this, "验证码已发送", Toast.LENGTH_SHORT).show();
                        // 1. 创建 Intent
                        Intent intent = new Intent(ForgetPasswordActivity.this, ResetPasswordActivity.class);
                        intent.putExtra("VERIFICATION_CODE", code);
                        intent.putExtra("email", email.getText().toString().trim());
                        // 3. 启动 Activity
                        startActivity(intent);
                    }
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(ForgetPasswordActivity.this, "错误: " + message, Toast.LENGTH_LONG).show();
                    }
                });
            }

            @Override
            public void onFailure(IOException e) {
                    runOnUiThread(() ->
                            Toast.makeText(ForgetPasswordActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show()
                    );
            }
        });
    }
}
