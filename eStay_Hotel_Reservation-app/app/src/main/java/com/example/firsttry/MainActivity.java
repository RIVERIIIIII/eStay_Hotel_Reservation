package com.example.firsttry;

import android.os.Bundle;
import android.view.MenuItem;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.example.firsttry.activity.hotel.fragment.HotelSearchFragment;
import com.example.firsttry.activity.message.fragment.MessageListFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;

public class MainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;
    private Fragment searchFragment;
    private Fragment messageFragment;
    private Fragment activeFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        bottomNavigationView = findViewById(R.id.nav_view);

        // Initialize fragments if not restored
        if (savedInstanceState == null) {
            searchFragment = new HotelSearchFragment();
            messageFragment = new MessageListFragment();
            
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.fragment_container, searchFragment, "SEARCH")
                    .commit();
            activeFragment = searchFragment;
        } else {
            // Restore fragments
            searchFragment = getSupportFragmentManager().findFragmentByTag("SEARCH");
            messageFragment = getSupportFragmentManager().findFragmentByTag("MESSAGE");
            if (searchFragment == null) searchFragment = new HotelSearchFragment();
            if (messageFragment == null) messageFragment = new MessageListFragment();
            
            // Restore active fragment logic could be complex, for simplicity, default to search or check visibility
            // But let's just let user click again or rely on system restoration.
            // A simple way is to reset to search or try to find visible one.
            Fragment visible = getSupportFragmentManager().findFragmentById(R.id.fragment_container);
            if (visible != null) {
                activeFragment = visible;
            } else {
                activeFragment = searchFragment;
            }
        }

        bottomNavigationView.setOnItemSelectedListener(new NavigationBarView.OnItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                int itemId = item.getItemId();
                if (itemId == R.id.navigation_search) {
                    if (activeFragment != searchFragment) {
                        showFragment(searchFragment);
                    }
                    return true;
                } else if (itemId == R.id.navigation_message) {
                    if (activeFragment != messageFragment) {
                        if (messageFragment == null) messageFragment = new MessageListFragment();
                        if (!messageFragment.isAdded()) {
                             getSupportFragmentManager().beginTransaction()
                                    .hide(activeFragment)
                                    .add(R.id.fragment_container, messageFragment, "MESSAGE")
                                    .commit();
                             activeFragment = messageFragment;
                        } else {
                            showFragment(messageFragment);
                        }
                    }
                    return true;
                }
                return false;
            }
        });
    }

    private void showFragment(Fragment targetFragment) {
        if (activeFragment == targetFragment) return;

        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.hide(activeFragment);
        transaction.show(targetFragment);
        transaction.commit();
        activeFragment = targetFragment;
    }
}