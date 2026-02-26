package com.example.firsttry.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.os.Handler;
import android.os.Looper;

import androidx.core.app.ActivityCompat;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

public class LocationUtils {

    // Mock location settings
    private static final boolean ENABLE_MOCK_LOCATION = true;
    private static final double DEFAULT_MOCK_LATITUDE = 39.9042; // 北京纬度
    private static final double DEFAULT_MOCK_LONGITUDE = 116.4074; // 北京经度
    private static final String DEFAULT_MOCK_CITY = "北京";

    public interface LocationCallback {
        void onLocationSuccess(double latitude, double longitude, String cityName);
        void onLocationFailed(String errorMsg);
    }

    public static void requestLocation(Activity activity, int permissionRequestCode, LocationCallback callback) {
        if (ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                    permissionRequestCode);
            return;
        }

        LocationManager locationManager = (LocationManager) activity.getSystemService(Context.LOCATION_SERVICE);
        Location location = null;
        try {
            // Try GPS first
            location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            // If no GPS, try Network
            if (location == null) {
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (location != null) {
            double lat = location.getLatitude();
            double lon = location.getLongitude();
            
            // Async Geocoding
            new Thread(() -> {
                String city = "未知城市";
                Geocoder geocoder = new Geocoder(activity, Locale.getDefault());
                try {
                    List<Address> addresses = geocoder.getFromLocation(lat, lon, 1);
                    if (addresses != null && !addresses.isEmpty()) {
                        Address address = addresses.get(0);
                        // Try locality (City), then subAdminArea (District), then adminArea (Province)
                        if (address.getLocality() != null) {
                            city = address.getLocality();
                        } else if (address.getSubAdminArea() != null) {
                            city = address.getSubAdminArea();
                        } else {
                            city = address.getAdminArea();
                        }
                        
                        // Simple cleanup: remove "市" suffix
                        if (city != null && city.endsWith("市")) {
                            city = city.substring(0, city.length() - 1);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    // On failure (e.g., network issue), we might still want to return coordinates but unknown city
                    // Or keep default.
                }
                
                String finalCity = city;
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onLocationSuccess(lat, lon, finalCity);
                });
            }).start();

        } else {
            // For better UX in emulator/testing, if location is null, we can return a mock location or error
            if (ENABLE_MOCK_LOCATION) {
                // Use mock location
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onLocationSuccess(DEFAULT_MOCK_LATITUDE, DEFAULT_MOCK_LONGITUDE, DEFAULT_MOCK_CITY);
                });
            } else {
                // Strictly follow "Fail gracefully"
                callback.onLocationFailed("无法获取位置，请确保GPS已开启");
            }
        }
    }
}
