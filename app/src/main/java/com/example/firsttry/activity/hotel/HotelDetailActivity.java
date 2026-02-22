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

import com.example.firsttry.authentication.AuthManager;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.adapter.BannerAdapter;
import com.example.firsttry.activity.hotel.adapter.RoomTypeAdapter;
import com.example.firsttry.activity.hotel.dialog.CalendarDialogFragment;
import com.example.firsttry.activity.hotel.model.RoomType;
import com.example.firsttry.remote.Http.HotelApi;
import com.google.android.material.appbar.AppBarLayout;
import com.google.android.material.appbar.CollapsingToolbarLayout;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import android.view.LayoutInflater;
import android.widget.RatingBar;

import java.io.IOException;
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
        // 初始化默认Banner
        setupDefaultBanner();
        // 获取酒店详情数据
        fetchHotelDetail();
        // 设置房间列表
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
        
        // 初始显示暂无评分，等待API调用后更新
        updateAverageRating(0);
    }

    private void updateAverageRating(float rating) {
        TextView tvAvgRating = findViewById(R.id.tv_avg_rating);
        if (tvAvgRating != null) {
            if (rating > 0) {
                tvAvgRating.setText(String.valueOf(rating));
            } else {
                tvAvgRating.setText("暂无评分");
            }
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
            
            // 获取认证token
            AuthManager authManager = AuthManager.getInstance();
            String token = authManager.getToken();
            if (token == null) {
                Toast.makeText(this, "请先登录", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                return;
            }
            
            // 获取酒店ID
            String hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
            if (hotelId == null) {
                Toast.makeText(this, "酒店ID无效", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                return;
            }
            
            // 提交评分到服务器
            HotelApi.submitRating(hotelId, rating, "", token, new HotelApi.RatingCallback() {
                @Override
                public void onSuccess(String message) {
                    Toast.makeText(HotelDetailActivity.this, "评分成功: " + rating + "分", Toast.LENGTH_SHORT).show();
                    // 重新获取酒店详情以更新平均评分
                    fetchHotelDetail();
                    dialog.dismiss();
                }
                
                @Override
                public void onError(String errorMessage) {
                    Toast.makeText(HotelDetailActivity.this, "评分失败: " + errorMessage, Toast.LENGTH_SHORT).show();
                }
                
                @Override
                public void onFailure(IOException e) {
                    Toast.makeText(HotelDetailActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.show();
    }

    private void setupDefaultBanner() {
        vpBanner = findViewById(R.id.vp_banner);
        List<String> images = Arrays.asList(
                "https://via.placeholder.com/1024x512?text=Loading...",
                "https://via.placeholder.com/1024x512?text=Loading...",
                "https://via.placeholder.com/1024x512?text=Loading..."
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
    
    // 从API获取酒店详情
    private void fetchHotelDetail() {
        String hotelId = getIntent().getStringExtra(EXTRA_HOTEL_ID);
        if (hotelId == null) {
            Toast.makeText(this, "酒店ID无效", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        HotelApi.getHotelDetail(hotelId, new HotelApi.HotelDetailCallback() {
            @Override
            public void onSuccess(com.example.firsttry.activity.hotel.model.HotelModel hotel) {
                if (hotel != null) {
                    // 更新酒店名称
                    TextView tvHotelName = findViewById(R.id.tv_hotel_name_cn);
                    if (tvHotelName != null) {
                        tvHotelName.setText(hotel.getName());
                    }
                    
                    // 更新英文名称
                    TextView tvHotelNameEn = findViewById(R.id.tv_hotel_name_en);
                    if (tvHotelNameEn != null) {
                        tvHotelNameEn.setText(hotel.getNameEn());
                    }
                    
                    // 更新酒店地址
                    TextView tvHotelAddress = findViewById(R.id.tv_address);
                    if (tvHotelAddress != null) {
                        tvHotelAddress.setText("地址：" + hotel.getAddress());
                    }
                    
                    // 更新评分
                    updateAverageRating(hotel.getAverageRating());
                    
                    // 更新开业时间
                    TextView tvOpenTime = findViewById(R.id.tv_open_time);
                    if (tvOpenTime != null && hotel.getOpeningTime() != null) {
                        tvOpenTime.setText("开业时间：" + hotel.getOpeningTime());
                    }
                    
                    // 更新酒店图片
                    List<String> imageUrls = hotel.getImages();
                    if (imageUrls == null || imageUrls.isEmpty()) {
                        // 回退到缩略图
                        imageUrls = new ArrayList<>();
                        imageUrls.add(hotel.getThumbnailUrl());
                    }
                    
                    // 更新Banner
                    BannerAdapter bannerAdapter = new BannerAdapter(imageUrls);
                    vpBanner.setAdapter(bannerAdapter);
                    
                    // 更新房型列表
                    updateRoomList(hotel);
                }
            }
            
            @Override
            public void onError(String message) {
                Toast.makeText(HotelDetailActivity.this, "加载酒店详情失败: " + message, Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onFailure(IOException e) {
                Toast.makeText(HotelDetailActivity.this, "网络请求失败", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    // 更新房型列表
    private void updateRoomList(com.example.firsttry.activity.hotel.model.HotelModel hotel) {
        List<RoomType> roomTypes = new ArrayList<>();
        for (com.example.firsttry.activity.hotel.model.HotelModel.RoomType apiRoomType : hotel.getRoomTypes()) {
            // 转换为UI使用的RoomType
            roomTypes.add(new RoomType(
                apiRoomType.getType(),
                apiRoomType.getDescription(),
                "", // 面积信息，API中没有提供
                String.valueOf(apiRoomType.getPrice()),
                ""
            ));
        }
        
        // 更新适配器
        roomAdapter = new RoomTypeAdapter(roomTypes);
        rvRoomList.setAdapter(roomAdapter);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        bannerHandler.removeCallbacks(bannerRunnable);
    }

    private void setupRoomList() {
        rvRoomList.setLayoutManager(new LinearLayoutManager(this));
        // 初始化一个空的适配器，稍后会从API获取数据后更新
        roomAdapter = new RoomTypeAdapter(new ArrayList<>());
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

    private List<RoomType> getMockRoomData() {
        List<RoomType> list = new ArrayList<>();
        list.add(new RoomType("雅致大床房", "1.8米大床 | 有窗", "30㎡", "1288", ""));
        list.add(new RoomType("豪华双床房", "1.3米双床 | 有窗", "35㎡", "1488", ""));
        list.add(new RoomType("行政套房", "2.0米特大床 | 全景落地窗", "60㎡", "2888", ""));
        list.add(new RoomType("总统套房", "2.4米特大床 | 独立泳池", "120㎡", "8888", ""));
        list.add(new RoomType("家庭亲子房", "1.8米大床 + 1.2米单人床", "45㎡", "1688", ""));
        return list;
    }
}
