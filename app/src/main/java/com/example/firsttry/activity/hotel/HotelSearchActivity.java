package com.example.firsttry.activity.hotel;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.viewpager2.widget.ViewPager2;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.adapter.BannerAdapter;
import com.example.firsttry.activity.hotel.dialog.CalendarDialogFragment;
import com.example.firsttry.activity.hotel.dialog.FilterBottomSheetDialogFragment;
import com.example.firsttry.activity.hotel.model.HotelSearchQuery;
import com.example.firsttry.utils.LocationUtils;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.firsttry.activity.hotel.adapter.QuickFilterAdapter;

public class HotelSearchActivity extends AppCompatActivity {

    private static final int CITY_PICKER_REQUEST_CODE = 1002;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private TextView tvCity;
    private TextView tvCheckInDate;
    private TextView tvCheckOutDate;
    private TextView tvTotalNights;
    private TextView tvFilterTrigger;
    private TextView tvRoomGuestInfo;
    private android.widget.EditText etKeyword;
    private RecyclerView rvQuickTags;
    private QuickFilterAdapter quickFilterAdapter;
    private MaterialButton btnSearch;
    private ViewPager2 vpBanner;

    // Search Query Object
    private HotelSearchQuery searchQuery;
    
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
        setContentView(R.layout.activity_hotel_search);

        searchQuery = new HotelSearchQuery();
        // Initialize default values
        searchQuery.setCity("北京"); // Default
        searchQuery.setMinPrice(0);
        searchQuery.setMaxPrice(1300);
        searchQuery.setStarRating(0); // Any
        searchQuery.setRoomCount(1);
        searchQuery.setAdultCount(1);
        searchQuery.setChildCount(0);
        
        // Initialize default dates (Today, Tomorrow)
        initDefaultDates();

        initViews();
        setupBanner();
        setupLocation();
        setupDatePicker();
        setupRoomGuestSelector();
        setupFilter();
        setupSearch();
        setupQuickTags();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        bannerHandler.removeCallbacks(bannerRunnable);
    }

    private void initDefaultDates() {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault());
        java.util.Calendar cal = com.example.firsttry.utils.TimeProvider.getInstance().getTodayCalendar();
        String today = sdf.format(cal.getTime());
        searchQuery.setCheckInDate(today);
        
        cal.add(java.util.Calendar.DAY_OF_MONTH, 1);
        String tomorrow = sdf.format(cal.getTime());
        searchQuery.setCheckOutDate(tomorrow);
    }

    private void initViews() {
        tvCity = findViewById(R.id.tv_city);
        tvCheckInDate = findViewById(R.id.tv_check_in_date);
        tvCheckOutDate = findViewById(R.id.tv_check_out_date);
        tvTotalNights = findViewById(R.id.tv_total_nights);
        tvFilterTrigger = findViewById(R.id.tv_filter_trigger);
        tvRoomGuestInfo = findViewById(R.id.tv_room_guest_info);
        etKeyword = findViewById(R.id.et_keyword);
        rvQuickTags = findViewById(R.id.rv_quick_tags);
        btnSearch = findViewById(R.id.btn_search);
        vpBanner = findViewById(R.id.vp_banner);
        
        // 增加判空保护，防止布局修改导致ID丢失时的闪退
        if (tvCity == null || tvCheckInDate == null || btnSearch == null) {
             Log.e("HotelSearchActivity", "Critical views not found!");
             Toast.makeText(this, "页面初始化异常", Toast.LENGTH_SHORT).show();
             finish();
             return;
        }
        
        // Set default text
        tvCheckInDate.setText(searchQuery.getCheckInDate());
        tvCheckOutDate.setText(searchQuery.getCheckOutDate());
        tvTotalNights.setText("共 1 晚");
        updateRoomGuestText();

        // City click listener
        tvCity.setOnClickListener(v -> {
            Intent intent = new Intent(this, CityPickerActivity.class);
            startActivityForResult(intent, CITY_PICKER_REQUEST_CODE);
        });
    }

    private void updateRoomGuestText() {
        if (tvRoomGuestInfo != null) {
            tvRoomGuestInfo.setText(String.format("%d间 · %d成人 · %d儿童", 
                searchQuery.getRoomCount(), searchQuery.getAdultCount(), searchQuery.getChildCount()));
        }
    }

    private void setupBanner() {
        // Mock data: reusing existing drawable resources
        List<Integer> images = Arrays.asList(
                R.drawable.splash_image, // Placeholder 1
                R.drawable.splash_image, // Placeholder 2
                R.drawable.splash_image  // Placeholder 3
        );
        BannerAdapter adapter = new BannerAdapter(images);
        adapter.setOnBannerClickListener(position -> {
            // Click to navigate to Hotel Detail
            Intent intent = new Intent(HotelSearchActivity.this, HotelDetailActivity.class);
            intent.putExtra(HotelDetailActivity.EXTRA_HOTEL_ID, "banner_hotel_" + position);
            startActivity(intent);
        });
        vpBanner.setAdapter(adapter);
        
        // Start Auto Scroll
        vpBanner.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                bannerHandler.removeCallbacks(bannerRunnable);
                bannerHandler.postDelayed(bannerRunnable, 3000);
            }
        });
        // Kick off
        bannerHandler.postDelayed(bannerRunnable, 3000);
    }

    private void setupRoomGuestSelector() {
        findViewById(R.id.layout_room_guest).setOnClickListener(v -> {
            com.google.android.material.bottomsheet.BottomSheetDialog dialog = 
                new com.google.android.material.bottomsheet.BottomSheetDialog(this, com.google.android.material.R.style.Theme_Design_BottomSheetDialog);
            dialog.setContentView(R.layout.dialog_room_guest_selector);
            dialog.getWindow().findViewById(com.google.android.material.R.id.design_bottom_sheet)
                  .setBackgroundResource(android.R.color.transparent); // For rounded corners

            // Find Views
            TextView tvRoomCount = dialog.findViewById(R.id.tv_room_count);
            TextView tvAdultCount = dialog.findViewById(R.id.tv_adult_count);
            TextView tvChildCount = dialog.findViewById(R.id.tv_child_count);
            
            final int[] counts = {searchQuery.getRoomCount(), searchQuery.getAdultCount(), searchQuery.getChildCount()};
            
            // Init Text
            tvRoomCount.setText(String.valueOf(counts[0]));
            tvAdultCount.setText(String.valueOf(counts[1]));
            tvChildCount.setText(String.valueOf(counts[2]));
            
            // Room Listeners
            dialog.findViewById(R.id.btn_room_minus).setOnClickListener(view -> {
                if (counts[0] > 1) {
                    counts[0]--;
                    tvRoomCount.setText(String.valueOf(counts[0]));
                }
            });
            dialog.findViewById(R.id.btn_room_plus).setOnClickListener(view -> {
                if (counts[0] < 10) {
                    counts[0]++;
                    tvRoomCount.setText(String.valueOf(counts[0]));
                }
            });
            
            // Adult Listeners
            dialog.findViewById(R.id.btn_adult_minus).setOnClickListener(view -> {
                if (counts[1] > 1) {
                    counts[1]--;
                    tvAdultCount.setText(String.valueOf(counts[1]));
                }
            });
            dialog.findViewById(R.id.btn_adult_plus).setOnClickListener(view -> {
                if (counts[1] < 20) {
                    counts[1]++;
                    tvAdultCount.setText(String.valueOf(counts[1]));
                }
            });
            
            // Child Listeners
            dialog.findViewById(R.id.btn_child_minus).setOnClickListener(view -> {
                if (counts[2] > 0) {
                    counts[2]--;
                    tvChildCount.setText(String.valueOf(counts[2]));
                }
            });
            dialog.findViewById(R.id.btn_child_plus).setOnClickListener(view -> {
                if (counts[2] < 10) {
                    counts[2]++;
                    tvChildCount.setText(String.valueOf(counts[2]));
                }
            });
            
            // Confirm
            dialog.findViewById(R.id.btn_confirm_guest).setOnClickListener(view -> {
                searchQuery.setRoomCount(counts[0]);
                searchQuery.setAdultCount(counts[1]);
                searchQuery.setChildCount(counts[2]);
                updateRoomGuestText();
                dialog.dismiss();
            });
            
            dialog.show();
        });
    }

    private void setupLocation() {
        ImageView ivLocation = findViewById(R.id.iv_location);
        ivLocation.setOnClickListener(v -> requestLocation());
    }

    private void requestLocation() {
        // UI Feedback: Positioning...
        tvCity.setText("定位中...");
        tvCity.setTextColor(getResources().getColor(R.color.app_primary_brown)); // Use caramel brown

        LocationUtils.requestLocation(this, LOCATION_PERMISSION_REQUEST_CODE, new LocationUtils.LocationCallback() {
            @Override
            public void onLocationSuccess(double latitude, double longitude, String cityName) {
                // Update Model
                searchQuery.setLatitude(latitude);
                searchQuery.setLongitude(longitude);
                searchQuery.setLocationMode(true);
                searchQuery.setCity(cityName);
                
                // Update UI
                tvCity.setText(cityName);
                tvCity.setTextColor(getResources().getColor(R.color.text_primary)); // Reset color
                Toast.makeText(HotelSearchActivity.this, "已为您定位到 " + cityName, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onLocationFailed(String errorMsg) {
                // Revert UI
                tvCity.setText("北京"); // Fallback to default or keep previous
                searchQuery.setCity("北京");
                tvCity.setTextColor(getResources().getColor(R.color.text_primary));
                Toast.makeText(HotelSearchActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                requestLocation();
            } else {
                Toast.makeText(this, R.string.location_permission_denied, Toast.LENGTH_SHORT).show();
                // Reset UI if permission denied
                tvCity.setText("北京");
                tvCity.setTextColor(getResources().getColor(R.color.text_primary));
            }
        }
    }

    private void setupDatePicker() {
        findViewById(R.id.layout_date_picker).setOnClickListener(v -> {
            CalendarDialogFragment dialog = new CalendarDialogFragment();
            dialog.setOnDateRangeSelectedListener((startDate, endDate, nights) -> {
                tvCheckInDate.setText(startDate);
                tvCheckOutDate.setText(endDate);
                tvTotalNights.setText(String.format("共 %d 晚", nights));
                
                searchQuery.setCheckInDate(startDate);
                searchQuery.setCheckOutDate(endDate);
            });
            dialog.show(getSupportFragmentManager(), "CalendarDialog");
        });
    }

    private void setupFilter() {
        tvFilterTrigger.setOnClickListener(v -> {
            FilterBottomSheetDialogFragment bottomSheet = new FilterBottomSheetDialogFragment();
            bottomSheet.setOnFilterAppliedListener((minPrice, maxPrice, starRating) -> {
                searchQuery.setMinPrice(minPrice);
                searchQuery.setMaxPrice(maxPrice);
                searchQuery.setStarRating(starRating);
                
                String starText = starRating == 0 ? "不限" : starRating + "星";
                tvFilterTrigger.setText("价格: ¥" + minPrice + "-" + maxPrice + ", 星级: " + starText);
            });
            bottomSheet.show(getSupportFragmentManager(), "FilterBottomSheet");
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CITY_PICKER_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            String selectedCity = data.getStringExtra(CityPickerActivity.KEY_SELECTED_CITY);
            if (selectedCity != null) {
                tvCity.setText(selectedCity);
                searchQuery.setCity(selectedCity);
                // Disable location mode if manually selected
                searchQuery.setLocationMode(false);
            }
        }
    }

    private void setupQuickTags() {
        rvQuickTags.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        List<String> quickFilters = new ArrayList<>();
        quickFilters.add("含早餐");
        quickFilters.add("免费停车");
        quickFilters.add("接送机");
        quickFilters.add("静音房");
        quickFilters.add("影音房");
        quickFilters.add("近地铁");
        quickFilters.add("4.8分+");
        
        quickFilterAdapter = new QuickFilterAdapter(quickFilters, activeFilters -> {
             // Single Selection Mode: Active filters will only contain the one clicked (or empty if deselected)
             searchQuery.setTags(new ArrayList<>(activeFilters));
             
             // Trigger search immediately if a tag is selected
             if (!activeFilters.isEmpty()) {
                 performSearch();
                 // Optional: Clear selection after search or keep it?
                 // Requirement: "跳转：直接启动 Intent...无需用户手动再点“查询酒店”按钮"
                 // If we come back, maybe we want it cleared or kept.
                 // Let's keep it consistent with "Click -> Search".
                 
                 // Note: Since we are leaving the activity, the state here might persist if we don't finish().
                 // If user presses back from ListActivity, they might see the tag still selected.
                 // We can clear it to allow fresh selection.
                 quickFilterAdapter.clearSelection(); 
             }
        });
        quickFilterAdapter.setSingleSelectionMode(true);
        rvQuickTags.setAdapter(quickFilterAdapter);
    }

    private void performSearch() {
        // Ensure city is set
        String currentCity = tvCity.getText().toString();
        if (!"定位中...".equals(currentCity)) {
             searchQuery.setCity(currentCity);
        }
        
        if (etKeyword != null) {
            searchQuery.setKeyword(etKeyword.getText().toString().trim());
        }

        // Navigate to HotelListActivity
        Intent intent = new Intent(HotelSearchActivity.this, HotelListActivity.class);
        intent.putExtra("search_query", searchQuery);
        startActivity(intent);
    }

    private void setupSearch() {
        btnSearch.setOnClickListener(v -> performSearch());
    }
}
