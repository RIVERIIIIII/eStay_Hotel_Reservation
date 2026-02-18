package com.example.firsttry.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MockData {

    public static List<String> getCities() {
        return Arrays.asList(
                "北京", "保定", "宝鸡", "包头", "北海",
                "成都", "重庆", "长春", "长沙", "常州", "沧州", "赤峰",
                "大连", "东莞", "大庆", "德阳",
                "福州", "佛山", "抚顺",
                "广州", "贵阳", "桂林", "赣州",
                "杭州", "哈尔滨", "合肥", "海口", "惠州", "呼和浩特",
                "济南", "嘉兴", "金华", "江门",
                "昆明", "开封",
                "兰州", "拉萨", "临沂", "洛阳",
                "南京", "宁波", "南宁", "南昌", "南通",
                "青岛", "秦皇岛", "泉州",
                "上海", "深圳", "苏州", "石家庄", "沈阳", "三亚", "绍兴",
                "天津", "太原", "唐山", "台州",
                "武汉", "无锡", "温州", "潍坊", "乌鲁木齐",
                "西安", "厦门", "徐州", "西宁", "襄阳",
                "银川", "烟台", "扬州", "宜昌",
                "郑州", "珠海", "中山", "淄博", "张家口"
        );
    }
    
    public static Map<String, List<String>> getGroupedCities() {
        Map<String, List<String>> map = new HashMap<>();
        map.put("B", Arrays.asList("北京", "保定", "宝鸡", "包头", "北海"));
        map.put("C", Arrays.asList("成都", "重庆", "长春", "长沙", "常州", "沧州", "赤峰"));
        map.put("D", Arrays.asList("大连", "东莞", "大庆", "德阳"));
        map.put("F", Arrays.asList("福州", "佛山", "抚顺"));
        map.put("G", Arrays.asList("广州", "贵阳", "桂林", "赣州"));
        map.put("H", Arrays.asList("杭州", "哈尔滨", "合肥", "海口", "惠州", "呼和浩特"));
        map.put("J", Arrays.asList("济南", "嘉兴", "金华", "江门"));
        map.put("K", Arrays.asList("昆明", "开封"));
        map.put("L", Arrays.asList("兰州", "拉萨", "临沂", "洛阳"));
        map.put("N", Arrays.asList("南京", "宁波", "南宁", "南昌", "南通"));
        map.put("Q", Arrays.asList("青岛", "秦皇岛", "泉州"));
        map.put("S", Arrays.asList("上海", "深圳", "苏州", "石家庄", "沈阳", "三亚", "绍兴"));
        map.put("T", Arrays.asList("天津", "太原", "唐山", "台州"));
        map.put("W", Arrays.asList("武汉", "无锡", "温州", "潍坊", "乌鲁木齐"));
        map.put("X", Arrays.asList("西安", "厦门", "徐州", "西宁", "襄阳"));
        map.put("Y", Arrays.asList("银川", "烟台", "扬州", "宜昌"));
        map.put("Z", Arrays.asList("郑州", "珠海", "中山", "淄博", "张家口"));
        return map;
    }
    
    public static List<String> getSortedAlphabets() {
        List<String> alphabets = new ArrayList<>(getGroupedCities().keySet());
        Collections.sort(alphabets);
        return alphabets;
    }

    public static String getMockToken() {
        return "mock_token_123456";
    }

    public static String getMockUser() {
        return "MockUser";
    }

    // 需要引入 Message 类，注意包名
    public static List<com.example.firsttry.activity.message.Message> getMockMessages() {
        List<com.example.firsttry.activity.message.Message> messages = new ArrayList<>();
        
        com.example.firsttry.activity.message.Message m1 = new com.example.firsttry.activity.message.Message("1", "Alice", "Hello there!", "10:00", 1);
        m1.setReceiver(getMockUser());
        messages.add(m1);

        com.example.firsttry.activity.message.Message m2 = new com.example.firsttry.activity.message.Message("2", "Bob", "How are you?", "10:05", 2);
        m2.setReceiver(getMockUser());
        messages.add(m2);

        com.example.firsttry.activity.message.Message m3 = new com.example.firsttry.activity.message.Message("3", "Charlie", "See you later.", "11:00", 0);
        m3.setReceiver(getMockUser());
        messages.add(m3);
        
        return messages;
    }
}
