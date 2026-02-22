// 文件名: VideoActivity.java
package com.example.firsttry.activity.utils;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView; // 假设 ivMessage 是一个 ImageView

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.activity.message.MessageActivity;

public class VideoActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video);
        ImageView messageButton = findViewById(R.id.ivMessage);
        messageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(VideoActivity.this, MessageActivity.class);
                intent.putExtra("account", intent.getExtras());
                startActivity(intent);
            }
        });

    }
}
