// Java
package com.example.firsttry.activity.message.chat.remark;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.EditText;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.example.firsttry.Database.UserDbHelper;
import com.example.firsttry.activity.message.Message;
import com.example.firsttry.R;
import com.google.android.material.button.MaterialButton;
import java.util.List;

public class EditRemarkActivity extends AppCompatActivity {

    private EditText etRemark;
    private MaterialButton btnSave;
    private UserDbHelper dbHelper;
    private String conversationId;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_remark);

        etRemark = findViewById(R.id.et_remark);
        btnSave = findViewById(R.id.btn_save_remark);
        dbHelper = UserDbHelper.getInstance(this);

        // ✅ 修改这里，使用正确的 Key
        conversationId = getIntent().getStringExtra("CONVERSATION_ID");
        String currentRemark = getIntent().getStringExtra("CURRENT_REMARK");

        Log.d("EditRemark", "conversationId = " + conversationId);
        Log.d("EditRemark", "currentRemark = " + currentRemark);

        // ✅ 直接使用传入的 remark，不需要再从数据库查询
        if (!TextUtils.isEmpty(currentRemark)) {
            etRemark.setText(currentRemark);
        }

        // 保存逻辑
        btnSave.setOnClickListener(v -> {
            String newRemark = etRemark.getText().toString().trim();
            if (conversationId != null) {
                btnSave.setEnabled(false);

                new Thread(() -> {
                    dbHelper.updateRemark(conversationId, newRemark);
                    Log.d("EditRemark", "Remark saved successfully");

                    runOnUiThread(() -> {
                        Intent result = new Intent();
                        result.putExtra("new_remark", newRemark);
                        setResult(RESULT_OK, result);
                        finish();
                    });
                }).start();
            } else {
                Log.e("EditRemark", "conversationId is null, cannot save!");
                finish();
            }
        });
    }
}
