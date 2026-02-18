package com.example.firsttry.activity.hotel;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.adapter.HotelListAdapter;
import com.example.firsttry.activity.hotel.dialog.CalendarDialogFragment;
import com.example.firsttry.activity.hotel.model.HotelModel;
import com.example.firsttry.activity.hotel.model.HotelSearchQuery;

import com.example.firsttry.utils.LocationUtils;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import com.example.firsttry.activity.hotel.adapter.QuickFilterAdapter;

public class HotelListActivity extends AppCompatActivity {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1003;
    private static final int CITY_PICKER_REQUEST_CODE = 1004;

    private HotelSearchQuery searchQuery;
    private TextView tvHeaderCity;
    private TextView tvHeaderDate;
    private FrameLayout flTopSheetContainer;
    private LinearLayout llTopSheetContent;
    private RecyclerView rvHotelList;
    private RecyclerView rvQuickFilters;
    private HotelListAdapter adapter;
    private QuickFilterAdapter quickFilterAdapter;

    // Top Sheet Views
    private TextView tvTopSheetCity;
    private TextView tvLocationStatus;
    private TextView tvTopSheetDate;
    private EditText etTopSheetSearch;

    // Temp State for Top Sheet
    private String tempCity;
    private String tempCheckIn;
    private String tempCheckOut;

    private boolean isTopSheetVisible = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hotel_list);

        // Receive Data
        searchQuery = (HotelSearchQuery) getIntent().getSerializableExtra("search_query");
        if (searchQuery == null) {
            searchQuery = new HotelSearchQuery();
            searchQuery.setCity("北京");
            // Default dates if null
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Calendar cal = Calendar.getInstance();
            searchQuery.setCheckInDate(sdf.format(cal.getTime()));
            cal.add(Calendar.DAY_OF_MONTH, 1);
            searchQuery.setCheckOutDate(sdf.format(cal.getTime()));
        }

        initViews();
        setupHeader();
        setupTopSheet();
        setupSubFilter();
        setupRecyclerView();
        updateHeaderUI();
    }

    private void setupSubFilter() {
        TextView tvSort = findViewById(R.id.tv_sort);
        tvSort.setOnClickListener(v -> showSortPopup(v));

        TextView tvFilter = findViewById(R.id.tv_filter);
        tvFilter.setOnClickListener(v -> showFilterPopup(v));
    }

    private void showSortPopup(View anchor) {
        final String[] sortOptions = {"推荐排序", "直线距离优先", "低价优先"};
        android.widget.ListPopupWindow listPopupWindow = new android.widget.ListPopupWindow(this);
        listPopupWindow.setAnchorView(anchor);
        listPopupWindow.setAdapter(new android.widget.ArrayAdapter<>(this, android.R.layout.simple_list_item_1, sortOptions));
        listPopupWindow.setWidth(anchor.getWidth());
        listPopupWindow.setOnItemClickListener((parent, view, position, id) -> {
            ((TextView) anchor).setText(sortOptions[position] + " ▼");
            listPopupWindow.dismiss();
            refreshList();
        });
        listPopupWindow.show();
    }

    private void showFilterPopup(View anchor) {
        View popupView = getLayoutInflater().inflate(R.layout.popup_filter, null);
        android.widget.PopupWindow popupWindow = new android.widget.PopupWindow(
                popupView,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.WRAP_CONTENT,
                true
        );
        popupWindow.setOutsideTouchable(true);
        popupWindow.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));

        ChipGroup chipGroup = popupView.findViewById(R.id.chip_group_filter);

        // Initialize Chips Selection based on searchQuery.getTags()
        List<String> currentTags = searchQuery.getTags();
        if (currentTags != null && !currentTags.isEmpty()) {
            for (int i = 0; i < chipGroup.getChildCount(); i++) {
                View child = chipGroup.getChildAt(i);
                if (child instanceof Chip) {
                    Chip chip = (Chip) child;
                    if (currentTags.contains(chip.getText().toString())) {
                        chip.setChecked(true);
                    }
                }
            }
        }

        // Reset Button
        popupView.findViewById(R.id.btn_reset).setOnClickListener(v -> {
            chipGroup.clearCheck();
            if (quickFilterAdapter != null) {
                quickFilterAdapter.clearSelection();
            }
            Toast.makeText(this, "已重置筛选条件", Toast.LENGTH_SHORT).show();
        });

        // Confirm Button
        popupView.findViewById(R.id.btn_confirm).setOnClickListener(v -> {
            List<String> newTags = new ArrayList<>();
            for (int id : chipGroup.getCheckedChipIds()) {
                Chip chip = popupView.findViewById(id);
                if (chip != null) {
                    newTags.add(chip.getText().toString());
                }
            }

            // Compare with Original
            List<String> oldTags = searchQuery.getTags();
            if (oldTags == null) oldTags = new ArrayList<>();

            // Check equality (Using HashSet for order-independent comparison)
            boolean isSame = new java.util.HashSet<>(newTags).equals(new java.util.HashSet<>(oldTags));
            boolean isEmpty = newTags.isEmpty();

            // Logic: No change OR Empty selection -> No Request
            if (isSame || isEmpty) {
                popupWindow.dismiss();
                return;
            }

            // Change AND Non-empty -> Request
            searchQuery.setTags(newTags);
            popupWindow.dismiss();
            refreshList();
        });

        popupWindow.showAsDropDown(anchor);
    }

    private void initViews() {
        tvHeaderCity = findViewById(R.id.tv_header_city);
        tvHeaderDate = findViewById(R.id.tv_header_date);
        flTopSheetContainer = findViewById(R.id.fl_top_sheet_container);
        llTopSheetContent = findViewById(R.id.ll_top_sheet_content);
        rvHotelList = findViewById(R.id.rv_hotel_list);
        rvQuickFilters = findViewById(R.id.rv_quick_filters);
        
        tvTopSheetCity = findViewById(R.id.tv_top_sheet_city);
        tvLocationStatus = findViewById(R.id.tv_location_status);
        tvTopSheetDate = findViewById(R.id.tv_top_sheet_date);
        etTopSheetSearch = findViewById(R.id.et_top_sheet_search);
        
        // Header click to toggle top sheet
        findViewById(R.id.ll_header).setOnClickListener(v -> toggleTopSheet());
        
        // Background click to close
        flTopSheetContainer.setOnClickListener(v -> {
            if (isTopSheetVisible) toggleTopSheet();
        });

        // Prevent click through on content
        llTopSheetContent.setOnClickListener(v -> {}); 
    }

    private void setupHeader() {
        // No extra setup needed for now, handled in updateHeaderUI
    }

    private void updateHeaderUI() {
        tvHeaderCity.setText(searchQuery.getCity());
        
        // Format Date: "05-01 - 05-02"
        String checkIn = searchQuery.getCheckInDate();
        String checkOut = searchQuery.getCheckOutDate();
        
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date dateIn = sdf.parse(checkIn);
            Date dateOut = sdf.parse(checkOut);
            
            SimpleDateFormat outputFormat = new SimpleDateFormat("MM-dd", Locale.getDefault());
            String inStr = outputFormat.format(dateIn);
            String outStr = outputFormat.format(dateOut);
            
            tvHeaderDate.setText(String.format("%s - %s", inStr, outStr));
            
        } catch (ParseException e) {
            e.printStackTrace();
            tvHeaderDate.setText(checkIn + " - " + checkOut);
        }
    }

    private void toggleTopSheet() {
        if (isTopSheetVisible) {
            // Hide with ObjectAnimator
            ObjectAnimator animator = ObjectAnimator.ofFloat(
                    llTopSheetContent, "translationY", 0f, -llTopSheetContent.getHeight());
            animator.setDuration(300);
            animator.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    flTopSheetContainer.setVisibility(View.GONE);
                }
            });
            animator.start();
        } else {
            // Sync temp state with current query before showing
            tempCity = searchQuery.getCity();
            tempCheckIn = searchQuery.getCheckInDate();
            tempCheckOut = searchQuery.getCheckOutDate();
            
            tvTopSheetCity.setText("当前城市: " + tempCity);
            tvLocationStatus.setText("定位为当前位置"); // Reset text
            if (searchQuery.getKeyword() != null) {
                etTopSheetSearch.setText(searchQuery.getKeyword());
            } else {
                etTopSheetSearch.setText("");
            }
            
            updateTopSheetDateUI();

            // Show
            flTopSheetContainer.setVisibility(View.VISIBLE);
            
            // Measure height to animate correctly
            int widthSpec = View.MeasureSpec.makeMeasureSpec(flTopSheetContainer.getWidth(), View.MeasureSpec.EXACTLY);
            int heightSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
            llTopSheetContent.measure(widthSpec, heightSpec);
            int height = llTopSheetContent.getMeasuredHeight();

            ObjectAnimator animator = ObjectAnimator.ofFloat(
                    llTopSheetContent, "translationY", -height, 0f);
            animator.setDuration(300);
            animator.start();
        }
        isTopSheetVisible = !isTopSheetVisible;
    }

    private void updateTopSheetDateUI() {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date dateIn = sdf.parse(tempCheckIn);
            Date dateOut = sdf.parse(tempCheckOut);
            SimpleDateFormat outputFormat = new SimpleDateFormat("MM-dd", Locale.getDefault());
            tvTopSheetDate.setText(outputFormat.format(dateIn) + " 至 " + outputFormat.format(dateOut));
        } catch (Exception e) {
            tvTopSheetDate.setText(tempCheckIn + " 至 " + tempCheckOut);
        }
    }

    private void setupTopSheet() {
        // Re-select City
        findViewById(R.id.ll_reselect_city).setOnClickListener(v -> {
            Intent intent = new Intent(this, CityPickerActivity.class);
            startActivityForResult(intent, CITY_PICKER_REQUEST_CODE);
        });

        // Re-locate
        findViewById(R.id.ll_relocate).setOnClickListener(v -> requestLocation());

        // Date Selection
        findViewById(R.id.ll_date_selection).setOnClickListener(v -> {
            CalendarDialogFragment dialog = new CalendarDialogFragment();
            dialog.setOnDateRangeSelectedListener((startDate, endDate, nights) -> {
                tempCheckIn = startDate;
                tempCheckOut = endDate;
                updateTopSheetDateUI();
            });
            dialog.show(getSupportFragmentManager(), "CalendarDialog");
        });

        // Reset
        findViewById(R.id.btn_top_sheet_reset).setOnClickListener(v -> {
             // 1. Revert to original searchQuery values
             tempCity = searchQuery.getCity();
             tempCheckIn = searchQuery.getCheckInDate();
             tempCheckOut = searchQuery.getCheckOutDate();
             
             // 2. Clear Search
             etTopSheetSearch.setText("");
             
             // 3. Update UI
             tvTopSheetCity.setText("当前城市: " + tempCity);
             tvLocationStatus.setText("定位为当前位置");
             updateTopSheetDateUI();
             
             Toast.makeText(this, "已重置", Toast.LENGTH_SHORT).show();
        });

        // Done
        findViewById(R.id.btn_top_sheet_done).setOnClickListener(v -> {
            boolean changed = false;
            
            // Check City Change
            if (!tempCity.equals(searchQuery.getCity())) {
                searchQuery.setCity(tempCity);
                changed = true;
            }
            
            // Check Date Change
            if (!tempCheckIn.equals(searchQuery.getCheckInDate()) || !tempCheckOut.equals(searchQuery.getCheckOutDate())) {
                searchQuery.setCheckInDate(tempCheckIn);
                searchQuery.setCheckOutDate(tempCheckOut);
                changed = true;
            }
            
            // Check Search Keyword Change
            String newKeyword = etTopSheetSearch.getText().toString().trim();
            String oldKeyword = searchQuery.getKeyword() == null ? "" : searchQuery.getKeyword();
            if (!newKeyword.equals(oldKeyword)) {
                searchQuery.setKeyword(newKeyword);
                changed = true;
            }

            toggleTopSheet();
            updateHeaderUI();
            if (changed) {
                refreshList();
            }
        });
    }

    private void requestLocation() {
        tvLocationStatus.setText("正在定位...");
        
        LocationUtils.requestLocation(this, LOCATION_PERMISSION_REQUEST_CODE, new LocationUtils.LocationCallback() {
            @Override
            public void onLocationSuccess(double latitude, double longitude, String cityName) {
                tempCity = cityName;
                tvTopSheetCity.setText("当前城市: " + cityName);
                tvLocationStatus.setText("已定位: " + cityName);
                Toast.makeText(HotelListActivity.this, "定位成功", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onLocationFailed(String errorMsg) {
                tvLocationStatus.setText("定位失败，请重试");
                Toast.makeText(HotelListActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
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
                Toast.makeText(this, "定位权限被拒绝", Toast.LENGTH_SHORT).show();
                tvLocationStatus.setText("定位权限未开启");
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CITY_PICKER_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            String city = data.getStringExtra(CityPickerActivity.KEY_SELECTED_CITY);
            if (city != null) {
                // Update temp state, not main query yet
                tempCity = city;
                tvTopSheetCity.setText("当前城市: " + city);
            }
        }
    }

    private void setupRecyclerView() {
        // Setup Quick Filters
        rvQuickFilters.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        List<String> quickFilters = new ArrayList<>();
        quickFilters.add("含早餐");
        quickFilters.add("免费停车");
        quickFilters.add("接送机");
        quickFilters.add("静音房");
        quickFilters.add("影音房");
        quickFilters.add("近地铁");
        quickFilters.add("4.8分+");
        
        quickFilterAdapter = new QuickFilterAdapter(quickFilters, activeFilters -> {
            List<String> currentTags = searchQuery.getTags();
            if (currentTags == null) currentTags = new ArrayList<>();
            
            List<String> finalTags = new ArrayList<>(currentTags);
            finalTags.removeAll(quickFilters);
            finalTags.addAll(activeFilters);
            
            searchQuery.setTags(finalTags);
            refreshList();
        });
        
        // Sync initial state from searchQuery (passed from Search Activity)
        List<String> currentTags = searchQuery.getTags();
        if (currentTags != null) {
            for (String tag : currentTags) {
                if (quickFilters.contains(tag)) {
                    quickFilterAdapter.addActiveFilter(tag);
                }
            }
        }
        
        rvQuickFilters.setAdapter(quickFilterAdapter);

        // Setup Hotel List
        rvHotelList.setLayoutManager(new LinearLayoutManager(this));
        adapter = new HotelListAdapter(getMockData());
        rvHotelList.setAdapter(adapter);
    }

    private void refreshList() {
        // Simulate refresh with new query parameters
        Toast.makeText(this, "正在刷新列表...", Toast.LENGTH_SHORT).show();
        adapter.updateData(getMockData());
    }

    private List<HotelModel> getMockData() {
        List<HotelModel> list = new ArrayList<>();
        // Create 10 mock items
        for (int i = 0; i < 10; i++) {
            List<String> tags = new ArrayList<>();
            if (i % 2 == 0) tags.add("免费停车");
            if (i % 3 == 0) tags.add("健身房");
            if (i % 5 == 0) tags.add("游泳池");
            tags.add("免费WiFi");

            list.add(new HotelModel(
                    "Mock Hotel " + (i + 1),
                    null, // No real URL for now
                    300 + (i * 50),
                    tags,
                    1.5 + (i * 0.5),
                    searchQuery.isLocationMode() // Use isLocationMode flag from query
            ));
        }
        return list;
    }
}