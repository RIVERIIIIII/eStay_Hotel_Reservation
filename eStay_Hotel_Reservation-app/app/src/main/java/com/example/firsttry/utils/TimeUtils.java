package com.example.firsttry.utils;

import android.util.Log;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class TimeUtils {

    public static String getTodayDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return sdf.format(new Date());
    }

    public static String getTomorrowDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, 1);
        return sdf.format(calendar.getTime());
    }

    public static String formatDateMMdd(String dateStr) {
        if (dateStr == null) return "";
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date date = inputFormat.parse(dateStr);
            SimpleDateFormat outputFormat = new SimpleDateFormat("MM-dd", Locale.getDefault());
            return outputFormat.format(date);
        } catch (ParseException e) {
            e.printStackTrace();
            return dateStr;
        }
    }

    public static int calculateDaysBetween(String startDateStr, String endDateStr) {
        if (startDateStr == null || endDateStr == null) return 1;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date startDate = sdf.parse(startDateStr);
            Date endDate = sdf.parse(endDateStr);
            long diff = endDate.getTime() - startDate.getTime();
            return (int) (diff / (1000 * 60 * 60 * 24));
        } catch (ParseException e) {
            e.printStackTrace();
            return 1;
        }
    }

    public static long getCurrentTimeMillis() {
        return System.currentTimeMillis();
    }

    // 定义两种可能的输入格式
    private static final DateTimeFormatter INPUT_FORMATTER_DASH = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter INPUT_FORMATTER_SPACE = DateTimeFormatter.ofPattern("yyyy MM dd HH:mm:ss");

    private static final DateTimeFormatter INPUT_FORMATTER_T =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    // 定义输出格式
    private static final ZoneId ZONE_SHANGHAI = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter MONTH_DAY_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");
    private static final DateTimeFormatter FULL_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static String formatFriendlyTime(String timeString) {
        if (timeString == null || timeString.isEmpty()) {
            return "";
        }

        LocalDateTime messageTime;
        try {
            messageTime = LocalDateTime.parse(timeString, INPUT_FORMATTER_DASH);
        } catch (DateTimeParseException e) {
            Log.e("TimeUtils", "无法解析时间字符串: " + timeString, e);
            return timeString;
        }

        // 使用北京时间的“当前时间”
        LocalDateTime now = LocalDateTime.now(ZONE_SHANGHAI);

        long seconds = ChronoUnit.SECONDS.between(messageTime, now);
        if (seconds < 0) seconds = 0;  // 防止未来时间导致负数

        if (seconds < 60) return "刚刚";

        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "分钟前";

        if (messageTime.toLocalDate().equals(now.toLocalDate())) {
            return messageTime.format(TIME_FORMATTER); // 今天 HH:mm
        }
        if (messageTime.toLocalDate().equals(now.toLocalDate().minusDays(1))) {
            return "昨天 " + messageTime.format(TIME_FORMATTER);
        }
        if (messageTime.getYear() == now.getYear()) {
            return messageTime.format(MONTH_DAY_FORMATTER); // 今年 MM-dd
        }

        return messageTime.format(FULL_DATE_FORMATTER); // 往年 yyyy-MM-dd
    }
}