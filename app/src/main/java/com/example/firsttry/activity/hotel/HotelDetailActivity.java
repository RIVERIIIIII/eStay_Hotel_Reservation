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

        initData();
        initViews();
        setupBanner();
        setupRoomList();
        updateDateUI();
    }

    private void makeStatusBarTransparent() {
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        window.setStatusBarColor(Color.TRANSPARENT);
    }

    private void initData() {
        checkInDate = getIntent().getStringExtra(EXTRA_CHECK_IN);
        checkOutDate = getIntent().getStringExtra(EXTRA_CHECK_OUT);
        
        // Default if null
        if (checkInDate == null) checkInDate = "2024-05-01";
        if (checkOutDate == null) checkOutDate = "2024-05-02";
        
        // Calculate initial nights (simplified)
        // In real app, parse dates. For now assume 1 night default or passed via intent?
        // We will recalculate when date is picked.
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
        
        // Mock average rating (In real app, fetch from API)
        updateAverageRating(4.5f);
    }

    private void updateAverageRating(float rating) {
        TextView tvAvgRating = findViewById(R.id.tv_avg_rating);
        if (tvAvgRating != null) {
            tvAvgRating.setText(String.valueOf(rating));
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

    private void setupRoomList() {
        rvRoomList.setLayoutManager(new LinearLayoutManager(this));
        roomAdapter = new RoomTypeAdapter(getMockRoomData());
        rvRoomList.setAdapter(roomAdapter);
    }

    private void showCalendarDialog() {
        CalendarDialogFragment dialog = new CalendarDialogFragment();
        dialog.setOnDateRangeSelectedListener((startDate, endDate, nights) -> {
            this.checkInDate = startDate;
            this.checkOutDate = endDate;
            this.totalNights = nights;
            updateDateUI();
            refreshRoomPrices();
        });
        dialog.show(getSupportFragmentManager(), "CalendarDialog");
    }

    private void updateDateUI() {
        // Format: 05-01 至 05-02
        try {
            String start = checkInDate.substring(5); // Remove yyyy-
            String end = checkOutDate.substring(5);
            tvDateRange.setText(String.format("%s 至 %s", start, end));
            tvNights.setText(String.format("共 %d 晚", totalNights));
        } catch (Exception e) {
            tvDateRange.setText(checkInDate + " 至 " + checkOutDate);
        }
    }

    private void refreshRoomPrices() {
        // Simulate price change based on date/random
        Toast.makeText(this, "正在更新实时价格...", Toast.LENGTH_SHORT).show();
        // In real app, re-fetch data. Here we just notify adapter to simulate refresh visual
        roomAdapter.notifyDataSetChanged();
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

    private List<HotelModel.RoomType> getMockRoomData() {
        List<HotelModel.RoomType> list = new ArrayList<>();
        list.add(new HotelModel.RoomType("雅致大床房", 1288, "1.8米大床 | 有窗 | 30㎡"));
        list.add(new HotelModel.RoomType("豪华双床房", 1488, "1.3米双床 | 有窗 | 35㎡"));
        list.add(new HotelModel.RoomType("行政套房", 2888, "2.0米特大床 | 全景落地窗 | 60㎡"));
        list.add(new HotelModel.RoomType("总统套房", 8888, "2.4米特大床 | 独立泳池 | 120㎡"));
        list.add(new HotelModel.RoomType("家庭亲子房", 1688, "1.8米大床 + 1.2米单人床 | 45㎡"));
        return list;
    }
}
