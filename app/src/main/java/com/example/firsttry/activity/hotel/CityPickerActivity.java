package com.example.firsttry.activity.hotel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.firsttry.R;
import com.example.firsttry.utils.MockData;
import com.example.firsttry.widget.SideBar;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CityPickerActivity extends AppCompatActivity {

    public static final String KEY_SELECTED_CITY = "selected_city";
    private ListView lvCities;
    private SideBar sideBar;
    private TextView tvDialog;
    private ArrayAdapter<String> adapter;
    private List<String> displayList;
    private List<String> sectionList; // Parallel list to store alphabet for each city
    private Map<String, Integer> alphabetPositionMap;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_city_picker);

        lvCities = findViewById(R.id.lv_cities);
        sideBar = findViewById(R.id.side_bar);
        tvDialog = findViewById(R.id.tv_dialog);

        if (sideBar != null) {
            sideBar.setTextView(tvDialog);
        }

        initData();
        setupSideBar();
    }

    private void initData() {
        Map<String, List<String>> groupedCities = MockData.getGroupedCities();
        List<String> alphabets = MockData.getSortedAlphabets();
        
        displayList = new ArrayList<>();
        sectionList = new ArrayList<>();
        alphabetPositionMap = new java.util.HashMap<>();

        // Flatten the list and map positions
        for (String alphabet : alphabets) {
            alphabetPositionMap.put(alphabet, displayList.size());
            List<String> cities = groupedCities.get(alphabet);
            if (cities != null) {
                displayList.addAll(cities);
                for (int i = 0; i < cities.size(); i++) {
                    sectionList.add(alphabet);
                }
            }
        }

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, displayList);
        lvCities.setAdapter(adapter);

        lvCities.setOnItemClickListener((parent, view, position, id) -> {
            String selectedCity = displayList.get(position);
            Intent resultIntent = new Intent();
            resultIntent.putExtra(KEY_SELECTED_CITY, selectedCity);
            setResult(RESULT_OK, resultIntent);
            finish();
        });
    }

    private void setupSideBar() {
        if (sideBar == null) return;

        sideBar.setOnTouchingLetterChangedListener(s -> {
            Integer position = alphabetPositionMap.get(s);
            if (position != null) {
                lvCities.setSelection(position);
            }
        });
        
        // Two-way linkage: Listen to list scroll
        lvCities.setOnScrollListener(new android.widget.AbsListView.OnScrollListener() {
            @Override
            public void onScrollStateChanged(android.widget.AbsListView view, int scrollState) {}

            @Override
            public void onScroll(android.widget.AbsListView view, int firstVisibleItem, int visibleItemCount, int totalItemCount) {
                if (sectionList != null && !sectionList.isEmpty() && firstVisibleItem < sectionList.size()) {
                    String currentAlphabet = sectionList.get(firstVisibleItem);
                    sideBar.setSelection(currentAlphabet);
                }
            }
        });
    }
}
