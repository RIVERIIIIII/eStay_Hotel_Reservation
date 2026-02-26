package com.example.firsttry.utils;

import java.util.Calendar;

public class TimeProvider {

    private static TimeProvider instance;
    private long serverOffset = 0;

    private TimeProvider() {}

    public static synchronized TimeProvider getInstance() {
        if (instance == null) {
            instance = new TimeProvider();
        }
        return instance;
    }

    public void setServerOffset(long offset) {
        this.serverOffset = offset;
    }

    public Calendar getTodayCalendar() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis() + serverOffset);
        // Reset to start of day for accurate comparison
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar;
    }
}
