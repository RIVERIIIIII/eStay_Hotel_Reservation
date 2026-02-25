package com.example.firsttry.activity.hotel.fragment;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.CityPickerActivity;
import com.example.firsttry.activity.hotel.HotelDetailActivity;
import com.example.firsttry.activity.hotel.HotelListActivity;
import com.example.firsttry.activity.hotel.adapter.BannerAdapter;
import com.example.firsttry.activity.hotel.adapter.QuickFilterAdapter;
import com.example.firsttry.activity.hotel.dialog.CalendarDialogFragment;
import com.example.firsttry.activity.hotel.dialog.FilterBottomSheetDialogFragment;
import com.example.firsttry.activity.hotel.model.HotelModel;
import com.example.firsttry.activity.hotel.model.HotelSearchQuery;
import com.example.firsttry.utils.LocationUtils;
import com.example.firsttry.utils.TimeProvider;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.button.MaterialButton;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

public class HotelSearchFragment extends Fragment {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private TextView tvCity;
    private TextView tvCheckInDate;
    private TextView tvCheckOutDate;
    private TextView tvTotalNights;
    private TextView tvFilterTrigger;
    private TextView tvLogout; // New Logout Button
    private TextView tvRoomGuestInfo;
    private EditText etKeyword;
    private RecyclerView rvQuickTags;
    private QuickFilterAdapter quickFilterAdapter;
    private MaterialButton btnSearch;
    private ViewPager2 vpBanner;

    // Search Query Object
    private HotelSearchQuery searchQuery;

    // Banner Auto Scroll
    private Handler bannerHandler = new Handler(Looper.getMainLooper());
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

    private ActivityResultLauncher<Intent> cityPickerLauncher;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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

        // Register Activity Result Launcher
        cityPickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == android.app.Activity.RESULT_OK && result.getData() != null) {
                        String selectedCity = result.getData().getStringExtra(CityPickerActivity.KEY_SELECTED_CITY);
                        if (selectedCity != null) {
                            tvCity.setText(selectedCity);
                            searchQuery.setCity(selectedCity);
                            // Disable location mode if manually selected
                            searchQuery.setLocationMode(false);
                        }
                    }
                }
        );
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_hotel_search, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        initViews(view);
        setupBanner();
        setupLocation(view);
        setupDatePicker(view);
        setupRoomGuestSelector(view);
        setupFilter(view);
        setupSearch();
        setupQuickTags();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        bannerHandler.removeCallbacks(bannerRunnable);
    }

    private void initDefaultDates() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        Calendar cal = TimeProvider.getInstance().getTodayCalendar();
        String today = sdf.format(cal.getTime());
        searchQuery.setCheckInDate(today);

        cal.add(Calendar.DAY_OF_MONTH, 1);
        String tomorrow = sdf.format(cal.getTime());
        searchQuery.setCheckOutDate(tomorrow);
    }

    private void initViews(View view) {
        tvCity = view.findViewById(R.id.tv_city);
        tvCheckInDate = view.findViewById(R.id.tv_check_in_date);
        tvCheckOutDate = view.findViewById(R.id.tv_check_out_date);
        tvTotalNights = view.findViewById(R.id.tv_total_nights);
        tvFilterTrigger = view.findViewById(R.id.tv_filter_trigger);
        tvRoomGuestInfo = view.findViewById(R.id.tv_room_guest_info);
        etKeyword = view.findViewById(R.id.et_keyword);
        rvQuickTags = view.findViewById(R.id.rv_quick_tags);
        btnSearch = view.findViewById(R.id.btn_search);
        tvLogout = view.findViewById(R.id.tv_logout);
        vpBanner = view.findViewById(R.id.vp_banner);

        // 增加判空保护
        if (tvCity == null || tvCheckInDate == null || btnSearch == null) {
            Log.e("HotelSearchFragment", "Critical views not found!");
            Toast.makeText(getContext(), "页面初始化异常", Toast.LENGTH_SHORT).show();
            return;
        }

        // Set default text
        tvCheckInDate.setText(searchQuery.getCheckInDate());
        tvCheckOutDate.setText(searchQuery.getCheckOutDate());
        tvTotalNights.setText("共 1 晚");
        updateRoomGuestText();

        // City click listener
        tvCity.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), CityPickerActivity.class);
            cityPickerLauncher.launch(intent);
        });
    }

    private void updateRoomGuestText() {
        if (tvRoomGuestInfo != null) {
            tvRoomGuestInfo.setText(String.format(Locale.getDefault(), "%d间 · %d成人 · %d儿童",
                    searchQuery.getRoomCount(), searchQuery.getAdultCount(), searchQuery.getChildCount()));
        }
    }

    private void setupBanner() {
        // Fetch featured hotels from backend
        com.example.firsttry.remote.Http.HotelApi.getFeaturedHotels(new com.example.firsttry.remote.Http.HotelApi.FeaturedHotelsCallback() {
            @Override
            public void onSuccess(java.util.List<HotelModel> hotels) {
                if (getActivity() == null) return;
                
                getActivity().runOnUiThread(() -> {
                    // Update Banner with real data
                    if (hotels != null && !hotels.isEmpty()) {
                        com.example.firsttry.activity.hotel.adapter.BannerAdapter adapter = 
                            new com.example.firsttry.activity.hotel.adapter.BannerAdapter(hotels, true);
                        
                        adapter.setOnBannerClickListener(position -> {
                            HotelModel hotel = hotels.get(position);
                            android.content.Intent intent = new android.content.Intent(getContext(), com.example.firsttry.activity.hotel.HotelDetailActivity.class);
                            intent.putExtra(com.example.firsttry.activity.hotel.HotelDetailActivity.EXTRA_HOTEL_ID, hotel.getId());
                            startActivity(intent);
                        });
                        vpBanner.setAdapter(adapter);
                    } else {
                        // Fallback to placeholder if no featured hotels
                        setupPlaceholderBanner();
                    }
                });
            }

            @Override
            public void onError(String message) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> setupPlaceholderBanner());
            }

            @Override
            public void onFailure(java.io.IOException e) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> setupPlaceholderBanner());
            }
        });

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

    private void setupPlaceholderBanner() {
        List<Integer> images = java.util.Arrays.asList(
                R.drawable.splash_image,
                R.drawable.splash_image,
                R.drawable.splash_image
        );
        com.example.firsttry.activity.hotel.adapter.BannerAdapter adapter = 
            new com.example.firsttry.activity.hotel.adapter.BannerAdapter(images);
            
        // No click listener for placeholders, or show "Coming Soon"
        adapter.setOnBannerClickListener(position -> 
            android.widget.Toast.makeText(getContext(), "暂无推荐酒店", android.widget.Toast.LENGTH_SHORT).show()
        );
        
        vpBanner.setAdapter(adapter);
    }

    private void setupRoomGuestSelector(View rootView) {
        rootView.findViewById(R.id.layout_room_guest).setOnClickListener(v -> {
            BottomSheetDialog dialog = new BottomSheetDialog(requireContext(), com.google.android.material.R.style.Theme_Design_BottomSheetDialog);
            dialog.setContentView(R.layout.dialog_room_guest_selector);
            // Handle null view if layout inflation failed
            View sheetView = dialog.getWindow().findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (sheetView != null) {
                sheetView.setBackgroundResource(android.R.color.transparent); // For rounded corners
            }

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

    private void setupLocation(View view) {
        ImageView ivLocation = view.findViewById(R.id.iv_location);
        ivLocation.setOnClickListener(v -> requestLocation());
    }

    private void requestLocation() {
        // UI Feedback: Positioning...
        tvCity.setText("定位中...");
        tvCity.setTextColor(getResources().getColor(R.color.app_primary_brown)); // Use caramel brown

        LocationUtils.requestLocation(requireActivity(), LOCATION_PERMISSION_REQUEST_CODE, new LocationUtils.LocationCallback() {
            @Override
            public void onLocationSuccess(double latitude, double longitude, String cityName) {
                if (getContext() == null) return;
                // Update Model
                searchQuery.setLatitude(latitude);
                searchQuery.setLongitude(longitude);
                searchQuery.setLocationMode(true);
                searchQuery.setCity(cityName);

                // Update UI
                tvCity.setText(cityName);
                tvCity.setTextColor(getResources().getColor(R.color.text_primary)); // Reset color
                Toast.makeText(getContext(), "已为您定位到 " + cityName, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onLocationFailed(String errorMsg) {
                if (getContext() == null) return;
                // Revert UI
                tvCity.setText("北京"); // Fallback to default or keep previous
                searchQuery.setCity("北京");
                tvCity.setTextColor(getResources().getColor(R.color.text_primary));
                Toast.makeText(getContext(), errorMsg, Toast.LENGTH_SHORT).show();
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
                Toast.makeText(getContext(), R.string.location_permission_denied, Toast.LENGTH_SHORT).show();
                // Reset UI if permission denied
                tvCity.setText("北京");
                tvCity.setTextColor(getResources().getColor(R.color.text_primary));
            }
        }
    }

    private void setupDatePicker(View view) {
        view.findViewById(R.id.layout_date_picker).setOnClickListener(v -> {
            CalendarDialogFragment dialog = new CalendarDialogFragment();
            dialog.setOnDateRangeSelectedListener((startDate, endDate, nights) -> {
                tvCheckInDate.setText(startDate);
                tvCheckOutDate.setText(endDate);
                tvTotalNights.setText(String.format(Locale.getDefault(), "共 %d 晚", nights));

                searchQuery.setCheckInDate(startDate);
                searchQuery.setCheckOutDate(endDate);
            });
            dialog.show(getChildFragmentManager(), "CalendarDialog");
        });
    }

    private void setupFilter(View view) {
        tvFilterTrigger.setOnClickListener(v -> {
            FilterBottomSheetDialogFragment bottomSheet = new FilterBottomSheetDialogFragment();
            bottomSheet.setOnFilterAppliedListener((minPrice, maxPrice, starRating) -> {
                searchQuery.setMinPrice(minPrice);
                searchQuery.setMaxPrice(maxPrice);
                searchQuery.setStarRating(starRating);

                String starText = starRating == 0 ? "不限" : starRating + "星";
                tvFilterTrigger.setText("价格: ¥" + minPrice + "-" + maxPrice + ", 星级: " + starText);
            });
            bottomSheet.show(getChildFragmentManager(), "FilterBottomSheet");
        });
    }

    private void setupQuickTags() {
        rvQuickTags.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
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
        Intent intent = new Intent(getContext(), HotelListActivity.class);
        intent.putExtra("search_query", searchQuery);
        startActivity(intent);
    }

    private void setupSearch() {
        btnSearch.setOnClickListener(v -> performSearch());
        
        // Setup Logout Listener
        if (tvLogout != null) {
            tvLogout.setOnClickListener(v -> performLogout());
        }
    }
    
    private void performLogout() {
        // 1. Clear SharedPreferences (Auth token, user info)
        android.content.SharedPreferences prefs = requireContext().getSharedPreferences("app_prefs", android.content.Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
        
        // 2. Navigate to LoginActivity
        android.content.Intent intent = new android.content.Intent(requireContext(), com.example.firsttry.activity.user.LoginActivity.class);
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        
        // 3. Show Toast
        android.widget.Toast.makeText(requireContext(), "已退出登录", android.widget.Toast.LENGTH_SHORT).show();
    }
}