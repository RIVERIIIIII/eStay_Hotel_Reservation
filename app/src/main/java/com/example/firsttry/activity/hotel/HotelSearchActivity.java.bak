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
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HotelSearchActivity extends AppCompatActivity {

    private static final int CITY_PICKER_REQUEST_CODE = 1002;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private TextView tvCity;
    private TextView tvCheckInDate;
    private TextView tvCheckOutDate;
    private TextView tvTotalNights;
    private TextView tvFilterTrigger;
    private android.widget.EditText etKeyword;
    private ChipGroup cgQuickTags;
    private MaterialButton btnSearch;
    private ViewPager2 vpBanner;

    // Search Query Object
    private HotelSearchQuery searchQuery;

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
        
        // Initialize default dates (Today, Tomorrow)
        initDefaultDates();

        initViews();
        setupBanner();
        setupLocation();
        setupDatePicker();
        setupFilter();
        setupSearch();
        setupQuickTags();
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
        etKeyword = findViewById(R.id.et_keyword);
        cgQuickTags = findViewById(R.id.cg_quick_tags);
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

        // City click listener
        tvCity.setOnClickListener(v -> {
            Intent intent = new Intent(this, CityPickerActivity.class);
            startActivityForResult(intent, CITY_PICKER_REQUEST_CODE);
        });
    }

    private void setupBanner() {
        // Mock data: reusing existing drawable resources
        List<Integer> images = Arrays.asList(
                R.drawable.splash_image, // Placeholder 1
                R.drawable.splash_image, // Placeholder 2
                R.drawable.splash_image  // Placeholder 3
        );
        BannerAdapter adapter = new BannerAdapter(images);
        vpBanner.setAdapter(adapter);
    }

    private void setupLocation() {
        ImageView ivLocation = findViewById(R.id.iv_location);
        ivLocation.setOnClickListener(v -> requestLocation());
    }

    private void requestLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                    LOCATION_PERMISSION_REQUEST_CODE);
            return;
        }
        
        // Basic Location Manager implementation
        LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        if (location == null) {
            location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
        }

        if (location != null) {
            // In a real app, use Geocoder to reverse geocode lat/lon to city name
            String msg = "Lat: " + location.getLatitude() + ", Lon: " + location.getLongitude();
            Toast.makeText(this, "定位成功: " + msg, Toast.LENGTH_LONG).show();
            Log.d("HotelSearch", msg);
            // Mock updating city
            // tvCity.setText("当前位置"); 
        } else {
            Toast.makeText(this, "无法获取位置信息", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                requestLocation();
            } else {
                Toast.makeText(this, R.string.location_permission_denied, Toast.LENGTH_SHORT).show();
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
            }
        }
    }

    private void setupQuickTags() {
        cgQuickTags.setSingleSelection(true); // Enforce single selection
        
        for (int i = 0; i < cgQuickTags.getChildCount(); i++) {
            Chip chip = (Chip) cgQuickTags.getChildAt(i);
            chip.setOnClickListener(v -> {
                // If chip is checked, trigger search
                if (chip.isChecked()) {
                     performSearch();
                     // Clear selection after search triggered (delayed slightly or immediately)
                     // Since we navigate away, clearing immediately is fine for when user comes back
                     cgQuickTags.clearCheck();
                }
            });
        }
    }

    private void performSearch() {
        // Collect selected tags
        List<String> selectedTags = new ArrayList<>();
        for (int i = 0; i < cgQuickTags.getChildCount(); i++) {
            Chip chip = (Chip) cgQuickTags.getChildAt(i);
            if (chip.isChecked()) {
                selectedTags.add(chip.getText().toString());
            }
        }
        searchQuery.setTags(selectedTags);
        searchQuery.setCity(tvCity.getText().toString());
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
