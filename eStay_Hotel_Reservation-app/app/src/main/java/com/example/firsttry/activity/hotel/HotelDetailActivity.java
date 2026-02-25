package com.example.firsttry.activity.hotel;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.adapter.BannerAdapter;
import com.example.firsttry.activity.hotel.adapter.RoomTypeAdapter;
import com.example.firsttry.activity.hotel.dialog.CalendarDialogFragment;
import com.example.firsttry.activity.hotel.model.HotelModel;
import com.google.android.material.appbar.AppBarLayout;
import com.google.android.material.appbar.CollapsingToolbarLayout;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import android.view.LayoutInflater;
import android.widget.RatingBar;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HotelDetailActivity extends AppCompatActivity {

    public static final String EXTRA_HOTEL_ID = "hotel_id";
    public static final String EXTRA_CHECK_IN = "check_in";
    public static final String EXTRA_CHECK_OUT = "check_out";

    private String hotelId;
    private String checkInDate;
    private String checkOutDate;
    private long totalNights = 1;

    private TextView tvDateRange;
    private TextView tvNights;
    private RecyclerView rvRoomList;
    private RoomTypeAdapter roomAdapter;
    private ViewPager2 vpBanner;
    
    // Banner Auto Scroll
    private android.os.Handler bannerHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private Runnable bannerRunnable = new Runnable() {
        @Override
        public void run() {
            if (vpBanner != null && vpBanner.getAdapter() != null) {
                int currentItem = vpBanner.getCurrentItem();
                int nextItem = (currentItem + 1) % vpBanner.getAdapter().getItemCount();
                vpBanner.setCurrentItem(nextItem, true);
                bannerHandler.postDelayed(this, 3000);
            }
        }
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Make status bar transparent for immersive effect
        makeStatusBarTransparent();
        setContentView(R.layout.activity_hotel_detail);

        hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
        checkInDate = getIntent().getStringExtra(EXTRA_CHECK_IN);
        checkOutDate = getIntent().getStringExtra(EXTRA_CHECK_OUT);

        // Default dates if not passed
        if (checkInDate == null) {
            checkInDate = com.example.firsttry.utils.TimeUtils.getTodayDate();
        }
        if (checkOutDate == null) {
            checkOutDate = com.example.firsttry.utils.TimeUtils.getTomorrowDate();
        }

        initViews();
        initData();
        setupBanner();
        updateDateDisplay();
    }

    private void makeStatusBarTransparent() {
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        window.setStatusBarColor(Color.TRANSPARENT);
    }

    private void initData() {
        // Load hotel detail
        if (hotelId != null) {
            loadHotelDetail(hotelId);
        } else {
            Toast.makeText(this, "无效的酒店ID", Toast.LENGTH_SHORT).show();
            finish();
        }
        
        // Calculate nights and update UI
        totalNights = com.example.firsttry.utils.TimeUtils.calculateDaysBetween(checkInDate, checkOutDate);
        updateDateDisplay();
    }

    private void updateDateDisplay() {
        // Format: 05-01 至 05-02
        if (tvDateRange != null) {
            String start = com.example.firsttry.utils.TimeUtils.formatDateMMdd(checkInDate);
            String end = com.example.firsttry.utils.TimeUtils.formatDateMMdd(checkOutDate);
            tvDateRange.setText(String.format("%s 至 %s", start, end));
        }
        if (tvNights != null) {
            tvNights.setText(String.format("共 %d 晚", totalNights));
        }
    }

    private void initViews() {
        tvDateRange = findViewById(R.id.tv_date_range);
        tvNights = findViewById(R.id.tv_nights);
        rvRoomList = findViewById(R.id.rv_room_list);
        
        // Fixed Header Navigation
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        
        // Message Button Logic
        findViewById(R.id.btn_message).setOnClickListener(v -> {
            TextView tvHotelName = findViewById(R.id.tv_hotel_name_cn);
            String hotelName = tvHotelName != null ? tvHotelName.getText().toString() : "酒店咨询";
            String hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
            if (hotelId == null) hotelId = "hotel_service"; // Fallback

            // Navigate to Chat Activity
            android.content.Intent intent = new android.content.Intent(this, com.example.firsttry.activity.message.chat.ChatActivity.class);
            intent.putExtra("sender_name", hotelId); // Treat hotel ID as the chat partner
            intent.putExtra("hotel_name", hotelName);
            startActivity(intent);
        });

        // Sticky Date Bar Click
        findViewById(R.id.layout_date_select).setOnClickListener(v -> showCalendarDialog());
        
        // Setup CollapsingToolbar title behavior
        CollapsingToolbarLayout collapsingToolbar = findViewById(R.id.collapsing_toolbar);
        collapsingToolbar.setTitleEnabled(false); // We use custom title in layout

        // Rating Button Logic
        findViewById(R.id.btn_rating).setOnClickListener(v -> showRatingDialog());
        
        // Load real hotel data
        String hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
        if (hotelId != null) {
            loadHotelDetail(hotelId);
        } else {
            Toast.makeText(this, "无效的酒店ID", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    private void loadHotelDetail(String hotelId) {
        Toast.makeText(this, "正在加载酒店详情...", Toast.LENGTH_SHORT).show();
         com.example.firsttry.remote.Http.HotelApi.getHotelDetail(hotelId, checkInDate, checkOutDate, new com.example.firsttry.remote.Http.HotelApi.HotelDetailCallback() {
         /*com.example.firsttry.remote.Http.HotelApi.getHotelDetail(hotelId, new com.example.firsttry.remote.Http.HotelApi.HotelDetailCallback() {*/
            @Override
            public void onSuccess(HotelModel hotel) {
                runOnUiThread(() -> {
                    updateUI(hotel);
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(HotelDetailActivity.this, "加载失败: " + message, Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onFailure(java.io.IOException e) {
                runOnUiThread(() -> {
                    Toast.makeText(HotelDetailActivity.this, "网络错误: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void updateUI(HotelModel hotel) {
        // Update Name
        TextView tvNameCn = findViewById(R.id.tv_hotel_name_cn);
        TextView tvNameEn = findViewById(R.id.tv_hotel_name_en);
        tvNameCn.setText(hotel.getName());
        tvNameEn.setText(hotel.getNameEn());
        
        // Update Address & Info
        TextView tvAddress = findViewById(R.id.tv_address);
        TextView tvOpenTime = findViewById(R.id.tv_open_time);
        tvAddress.setText("地址：" + hotel.getAddress());
        tvOpenTime.setText("开业时间：" + (hotel.getOpeningTime() != null ? hotel.getOpeningTime().split("T")[0] : "未知"));
        
        // Update Rating
        updateAverageRating(hotel.getAverageRating());
        
        // Update Room List
        setupRoomList(hotel.getRoomTypes());
        
        // Update Facilities (Optional: if we want dynamic facilities)
        // For now, static layout in XML is fine or we can clear and add dynamic views.
    }

    private void updateAverageRating(float rating) {
        TextView tvAvgRating = findViewById(R.id.tv_avg_rating);
        if (tvAvgRating != null) {
            tvAvgRating.setText(String.format("%.1f", rating));
        }
    }

    private void showRatingDialog() {
        BottomSheetDialog dialog = new BottomSheetDialog(this);
        View view = LayoutInflater.from(this).inflate(R.layout.dialog_hotel_rating, null);
        dialog.setContentView(view);

        RatingBar ratingBar = view.findViewById(R.id.rating_bar);
        TextView tvScore = view.findViewById(R.id.tv_rating_value);
        TextView btnCancel = view.findViewById(R.id.btn_cancel);
        TextView btnSubmit = view.findViewById(R.id.btn_submit);

        // Initial state
        ratingBar.setRating(0);
        tvScore.setText("0.0 分");

        ratingBar.setOnRatingBarChangeListener((ratingBar1, rating, fromUser) -> {
            tvScore.setText(rating + " 分");
        });

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSubmit.setOnClickListener(v -> {
            float rating = ratingBar.getRating();
            // Simulate backend submission
            Toast.makeText(this, "评分成功: " + rating + "分", Toast.LENGTH_SHORT).show();
            // In real app, re-fetch hotel details to get updated average rating
            // For now, just simulate a slight change
            updateAverageRating(4.6f); 
            dialog.dismiss();
        });

        dialog.show();
    }

    private void setupBanner() {
        vpBanner = findViewById(R.id.vp_banner);
        List<Integer> images = Arrays.asList(
                R.drawable.splash_image,
                R.drawable.splash_image,
                R.drawable.splash_image
        );
        BannerAdapter bannerAdapter = new BannerAdapter(images);
        vpBanner.setAdapter(bannerAdapter);
        
        // Start Auto Scroll
        vpBanner.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                bannerHandler.removeCallbacks(bannerRunnable);
                bannerHandler.postDelayed(bannerRunnable, 3000);
            }
        });
        bannerHandler.postDelayed(bannerRunnable, 3000);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        bannerHandler.removeCallbacks(bannerRunnable);
    }

    private void setupRoomList(List<HotelModel.RoomType> roomTypes) {
        rvRoomList.setLayoutManager(new LinearLayoutManager(this));
        if (roomTypes != null && !roomTypes.isEmpty()) {
            roomAdapter = new RoomTypeAdapter(roomTypes);
        } else {
            roomAdapter = new RoomTypeAdapter(new ArrayList<>());
            Toast.makeText(this, "暂无房型信息", Toast.LENGTH_SHORT).show();
        }
        rvRoomList.setAdapter(roomAdapter);
    }

    private void showCalendarDialog() {
        CalendarDialogFragment dialog = new CalendarDialogFragment();
        dialog.setOnDateRangeSelectedListener((startDate, endDate, nights) -> {
            this.checkInDate = startDate;
            this.checkOutDate = endDate;
            this.totalNights = nights;
            updateDateDisplay();
            /*refreshRoomPrices();*/
            // 重新加载酒店详情，获取最新的可用房型
            String hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
            if (hotelId != null) {
            loadHotelDetail(hotelId);
            }
        });
        dialog.show(getSupportFragmentManager(), "CalendarDialog");
    }

    private void refreshRoomPrices() {
        // Simulate price change based on date/random
        Toast.makeText(this, "正在更新实时价格...", Toast.LENGTH_SHORT).show();
        // In real app, re-fetch data. Here we just notify adapter to simulate refresh visual
        roomAdapter.notifyDataSetChanged();
    }

    public String getHotelName() {
        TextView tvNameCn = findViewById(R.id.tv_hotel_name_cn);
        return tvNameCn != null ? tvNameCn.getText().toString() : "";
    }
    
    public String getHotelId() {
        return hotelId;
    }

    public String getCheckInDate() {
        return checkInDate;
    }

    public String getCheckOutDate() {
        return checkOutDate;
    }

    public long getTotalNights() {
        return totalNights;
    }

    // private List<HotelModel.RoomType> getMockRoomData() { ... } // Removed mock data
}
