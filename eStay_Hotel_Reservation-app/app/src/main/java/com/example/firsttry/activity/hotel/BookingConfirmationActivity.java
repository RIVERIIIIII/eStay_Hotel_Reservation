package com.example.firsttry.activity.hotel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.model.HotelModel;
import com.google.android.material.button.MaterialButton;

public class BookingConfirmationActivity extends AppCompatActivity {

    public static final String EXTRA_HOTEL_ID = "hotel_id";
    public static final String EXTRA_HOTEL_NAME = "hotel_name";
    public static final String EXTRA_ROOM_TYPE = "room_type";
    public static final String EXTRA_ROOM_DESC = "room_desc";
    public static final String EXTRA_PRICE = "price";
    public static final String EXTRA_CHECK_IN = "check_in";
    public static final String EXTRA_CHECK_OUT = "check_out";
    public static final String EXTRA_TOTAL_NIGHTS = "total_nights";

    private String hotelId;
    private String hotelName;
    private String checkIn;
    private String checkOut;
    private long totalNights;
    private String roomType;
    private String roomDesc;
    private int price;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_confirmation);

        initData();
        initViews();
    }

    private void initData() {
        android.content.Intent intent = getIntent();
        hotelId = intent.getStringExtra(EXTRA_HOTEL_ID);
        hotelName = intent.getStringExtra(EXTRA_HOTEL_NAME);
        checkIn = intent.getStringExtra(EXTRA_CHECK_IN);
        checkOut = intent.getStringExtra(EXTRA_CHECK_OUT);
        roomType = intent.getStringExtra(EXTRA_ROOM_TYPE);
        roomDesc = intent.getStringExtra(EXTRA_ROOM_DESC);
        totalNights = intent.getLongExtra(EXTRA_TOTAL_NIGHTS, 1);
        price = intent.getIntExtra(EXTRA_PRICE, 0);
    }

    private void initViews() {
        TextView tvHotelName = findViewById(R.id.tv_hotel_name);
        TextView tvCheckIn = findViewById(R.id.tv_check_in_date);
        TextView tvCheckOut = findViewById(R.id.tv_check_out_date);
        TextView tvNights = findViewById(R.id.tv_total_nights);
        TextView tvRoomType = findViewById(R.id.tv_room_type);
        TextView tvRoomDesc = findViewById(R.id.tv_room_desc);
        TextView tvTotalPrice = findViewById(R.id.tv_total_price);
        MaterialButton btnConfirm = findViewById(R.id.btn_confirm_booking);

        tvHotelName.setText(hotelName != null ? hotelName : "未知酒店");
        tvCheckIn.setText(checkIn != null ? checkIn : "");
        tvCheckOut.setText(checkOut != null ? checkOut : "");
        tvNights.setText("共" + totalNights + "晚");
        tvRoomType.setText(roomType != null ? roomType : "未知房型");
        tvRoomDesc.setText(roomDesc != null ? roomDesc : "");
        tvTotalPrice.setText("¥" + (price * totalNights));

        btnConfirm.setOnClickListener(v -> {
            // Simulate booking process
            Toast.makeText(this, "预定成功", Toast.LENGTH_LONG).show();
            
            // Navigate back to home or order list
            // For now, just finish
            finish();
        });
        
        findViewById(R.id.toolbar).setOnClickListener(v -> finish());
    }
}