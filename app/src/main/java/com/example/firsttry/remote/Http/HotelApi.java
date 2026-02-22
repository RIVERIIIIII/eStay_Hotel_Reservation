package com.example.firsttry.remote.Http;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.example.firsttry.activity.hotel.model.HotelModel;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class HotelApi {

    private static final String TAG = "HotelApi";
    private static final OkHttpClient client = HttpClient.getClient();
    private static final Gson gson = new Gson();

    public interface FeaturedHotelsCallback {
        void onSuccess(List<HotelModel> hotels);
        void onError(String message);
        void onFailure(IOException e);
    }

    public interface HotelListCallback {
        void onSuccess(List<HotelModel> hotels);
        void onError(String message);
        void onFailure(IOException e);
    }

    public interface HotelDetailCallback {
        void onSuccess(HotelModel hotel);
        void onError(String message);
        void onFailure(IOException e);
    }

    public interface RatingCallback {
        void onSuccess(String message);
        void onError(String message);
        void onFailure(IOException e);
    }

    // 获取推荐酒店（用于首页Banner）
    public static void getFeaturedHotels(FeaturedHotelsCallback callback) {
        String url = HttpClient.BASE_URL + "api/public/hotels/featured";
        Log.d(TAG, "GET: " + url);

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull IOException e) {
                if (callback != null) {
                    new Handler(Looper.getMainLooper()).post(() -> callback.onFailure(e));
                }
            }

            @Override
            public void onResponse(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    Log.d(TAG, "Response: " + responseBody);
                    
                    // 解析JSON响应
                    try {
                        JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();
                        JsonArray hotelsArray = jsonObject.getAsJsonArray("hotels");
                        
                        List<HotelModel> hotels = new ArrayList<>();
                        for (JsonElement hotelElement : hotelsArray) {
                            JsonObject hotelJson = hotelElement.getAsJsonObject();
                            HotelModel hotel = parseHotelJson(hotelJson);
                            if (hotel != null) {
                                hotels.add(hotel);
                            }
                        }
                        
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onSuccess(hotels));
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "解析酒店数据失败: " + e.getMessage());
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onError("解析酒店数据失败"));
                        }
                    }
                } else {
                    if (callback != null) {
                        new Handler(Looper.getMainLooper()).post(() -> callback.onError("请求失败: " + response.code()));
                    }
                }
            }
        });
    }

    // 获取酒店列表
    public static void getHotelList(String city, String keyword, String checkInDate, String checkOutDate, int page, int limit, String sortBy, Integer minPrice, Integer maxPrice, Integer starRating, List<String> amenities, HotelListCallback callback) {
        // 构建查询参数
        StringBuilder urlBuilder = new StringBuilder(HttpClient.BASE_URL + "api/public/hotels?");
        urlBuilder.append("page=").append(page);
        urlBuilder.append("&limit=").append(limit);
        if (city != null && !city.isEmpty()) {
            urlBuilder.append("&city=").append(city);
        }
        if (keyword != null && !keyword.isEmpty()) {
            urlBuilder.append("&keyword=").append(keyword);
        }
        if (checkInDate != null && !checkInDate.isEmpty()) {
            urlBuilder.append("&checkInDate=").append(checkInDate);
        }
        if (checkOutDate != null && !checkOutDate.isEmpty()) {
            urlBuilder.append("&checkOutDate=").append(checkOutDate);
        }
        if (minPrice != null) {
            urlBuilder.append("&minPrice=").append(minPrice);
        }
        if (maxPrice != null) {
            urlBuilder.append("&maxPrice=").append(maxPrice);
        }
        if (starRating != null) {
            urlBuilder.append("&starRating=").append(starRating);
        }
        if (amenities != null && !amenities.isEmpty()) {
            // 将设施列表转换为逗号分隔的字符串
            String amenitiesStr = String.join(",", amenities);
            urlBuilder.append("&amenities=").append(amenitiesStr);
        }
        // 添加排序参数
        if (sortBy != null && !sortBy.isEmpty()) {
            String sorterParam = "";
            switch (sortBy) {
                case "price_asc":
                    sorterParam = "price_asc";
                    break;
                case "price_desc":
                    sorterParam = "price_desc";
                    break;
                case "recommend":
                    // 推荐排序，不传递sorter参数，使用默认的按创建时间降序
                    break;
                case "distance":
                    // 距离排序，暂时不支持
                    break;
            }
            if (!sorterParam.isEmpty()) {
                urlBuilder.append("&sorter=").append(sorterParam);
            }
        }
        
        String url = urlBuilder.toString();
        Log.d(TAG, "GET: " + url);

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull IOException e) {
                if (callback != null) {
                    new Handler(Looper.getMainLooper()).post(() -> callback.onFailure(e));
                }
            }

            @Override
            public void onResponse(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    Log.d(TAG, "Response: " + responseBody);
                    
                    // 解析JSON响应
                    try {
                        JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();
                        JsonArray hotelsArray = jsonObject.getAsJsonArray("hotels");
                        
                        List<HotelModel> hotels = new ArrayList<>();
                        for (JsonElement hotelElement : hotelsArray) {
                            JsonObject hotelJson = hotelElement.getAsJsonObject();
                            HotelModel hotel = parseHotelJson(hotelJson);
                            if (hotel != null) {
                                hotels.add(hotel);
                            }
                        }
                        
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onSuccess(hotels));
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "解析酒店数据失败: " + e.getMessage());
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onError("解析酒店数据失败"));
                        }
                    }
                } else {
                    if (callback != null) {
                        new Handler(Looper.getMainLooper()).post(() -> callback.onError("请求失败: " + response.code()));
                    }
                }
            }
        });
    }

    // 获取酒店详情
    public static void getHotelDetail(String hotelId, HotelDetailCallback callback) {
        String url = HttpClient.BASE_URL + "api/public/hotels/" + hotelId;
        Log.d(TAG, "GET: " + url);

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull IOException e) {
                if (callback != null) {
                    new Handler(Looper.getMainLooper()).post(() -> callback.onFailure(e));
                }
            }

            @Override
            public void onResponse(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    Log.d(TAG, "Response: " + responseBody);
                    
                    // 解析JSON响应
                    try {
                        JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();
                        JsonObject hotelJson = jsonObject.getAsJsonObject("hotel");
                        HotelModel hotel = parseHotelJson(hotelJson);
                        
                        if (hotel != null) {
                            if (callback != null) {
                                new Handler(Looper.getMainLooper()).post(() -> callback.onSuccess(hotel));
                            }
                        } else {
                            if (callback != null) {
                                new Handler(Looper.getMainLooper()).post(() -> callback.onError("解析酒店数据失败"));
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "解析酒店数据失败: " + e.getMessage());
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onError("解析酒店数据失败"));
                        }
                    }
                } else {
                    if (callback != null) {
                        new Handler(Looper.getMainLooper()).post(() -> callback.onError("请求失败: " + response.code()));
                    }
                }
            }
        });
    }

    // 提交酒店评分
    public static void submitRating(String hotelId, float rating, String comment, String token, RatingCallback callback) {
        OkHttpClient client = HttpClient.getClient();
        String url = HttpClient.BASE_URL + "api/ratings/" + hotelId;
        
        try {
            // 创建请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("rating", rating);
            if (comment != null && !comment.isEmpty()) {
                requestBody.put("comment", comment);
            }
            
            RequestBody body = RequestBody.create(
                requestBody.toString(),
                MediaType.get("application/json; charset=utf-8")
            );
            
            // 创建请求
            Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Authorization", "Bearer " + token)
                .build();
            
            Log.d(TAG, "POST: " + url);
            Log.d(TAG, "Request Body: " + requestBody.toString());
            
            // 发送请求
            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull IOException e) {
                    if (callback != null) {
                        new Handler(Looper.getMainLooper()).post(() -> callback.onFailure(e));
                    }
                }
                
                @Override
                public void onResponse(@androidx.annotation.NonNull Call call, @androidx.annotation.NonNull Response response) throws IOException {
                    if (response.isSuccessful()) {
                        String responseBody = response.body() != null ? response.body().string() : "";
                        Log.d(TAG, "Response: " + responseBody);
                        
                        try {
                            JSONObject jsonObject = new JSONObject(responseBody);
                            String message = jsonObject.getString("message");
                            if (callback != null) {
                                new Handler(Looper.getMainLooper()).post(() -> callback.onSuccess(message));
                            }
                        } catch (JSONException e) {
                            Log.e(TAG, "解析响应数据失败: " + e.getMessage());
                            if (callback != null) {
                                new Handler(Looper.getMainLooper()).post(() -> callback.onError("解析响应数据失败"));
                            }
                        }
                    } else {
                        String errorBody = response.body() != null ? response.body().string() : "";
                        Log.e(TAG, "请求失败: " + response.code() + ", " + errorBody);
                        if (callback != null) {
                            new Handler(Looper.getMainLooper()).post(() -> callback.onError("请求失败: " + response.code()));
                        }
                    }
                }
            });
            
        } catch (JSONException e) {
            Log.e(TAG, "创建请求体失败: " + e.getMessage());
            if (callback != null) {
                callback.onError("创建请求体失败");
            }
        }
    }

    // 将JSON对象转换为HotelModel
    private static HotelModel parseHotelJson(JsonObject hotelJson) {
        try {
            // 获取酒店ID
            String id = hotelJson.get("_id").getAsString();
            
            // 获取酒店名称
            String name = hotelJson.get("name").getAsString();
            String nameEn = hotelJson.has("name_en") ? hotelJson.get("name_en").getAsString() : "";
            
            // 获取酒店地址
            String address = hotelJson.get("address").getAsString();
            
            // 获取酒店星级
            int starRating = hotelJson.get("starRating").getAsInt();
            
            // 获取酒店价格
            int startPrice = hotelJson.get("price").getAsInt();
            
            // 获取开业时间
            String openingTime = hotelJson.has("openingTime") ? hotelJson.get("openingTime").getAsString() : "";
            
            // 获取酒店描述
            String description = hotelJson.has("description") ? hotelJson.get("description").getAsString() : "";
            
            // 获取酒店设施
            List<String> amenities = new ArrayList<>();
            if (hotelJson.has("amenities")) {
                JsonArray amenitiesArray = hotelJson.getAsJsonArray("amenities");
                for (JsonElement amenity : amenitiesArray) {
                    amenities.add(amenity.getAsString());
                }
            }
            
            // 获取酒店图片
            List<String> images = new ArrayList<>();
            String thumbnailUrl = "https://via.placeholder.com/300x200?text=Hotel+Image";
            if (hotelJson.has("images")) {
                JsonArray imagesArray = hotelJson.getAsJsonArray("images");
                for (JsonElement image : imagesArray) {
                    String imageUrl = image.getAsString();
                    images.add(imageUrl);
                    if (thumbnailUrl.equals("https://via.placeholder.com/300x200?text=Hotel+Image")) {
                        thumbnailUrl = imageUrl;
                    }
                }
            }
            
            // 解析房型
            List<HotelModel.RoomType> roomTypes = new ArrayList<>();
            if (hotelJson.has("roomTypes")) {
                JsonArray roomTypesArray = hotelJson.getAsJsonArray("roomTypes");
                for (JsonElement roomTypeElement : roomTypesArray) {
                    JsonObject roomTypeJson = roomTypeElement.getAsJsonObject();
                    String type = roomTypeJson.has("type") ? roomTypeJson.get("type").getAsString() : "";
                    int price = roomTypeJson.has("price") ? roomTypeJson.get("price").getAsInt() : 0;
                    String roomDesc = roomTypeJson.has("description") ? roomTypeJson.get("description").getAsString() : "";
                    roomTypes.add(new HotelModel.RoomType(type, price, roomDesc));
                }
            }
            
            // 创建标签列表
            List<String> tags = new ArrayList<>();
            tags.add(starRating + "星级酒店");
            if (amenities.size() > 0) {
                tags.addAll(amenities.subList(0, Math.min(2, amenities.size())));
            }
            
            // 设置默认距离和评分
            double distanceKm = Math.round(Math.random() * 10 * 10) / 10.0; // 0-10公里随机
            boolean isCityCenter = Math.random() > 0.5;
            // 从服务器获取真实评分数据，如果没有评分则设为0
            float averageRating = 0.0f;
            if (hotelJson.has("averageRating")) {
                try {
                    if (!hotelJson.get("averageRating").isJsonNull()) {
                        averageRating = hotelJson.get("averageRating").getAsFloat();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "解析评分数据失败: " + e.getMessage());
                }
            }
            
            return new HotelModel(id, name, nameEn, address, starRating, roomTypes, startPrice, openingTime, description, amenities, images, thumbnailUrl, tags, distanceKm, isCityCenter, averageRating);
        } catch (Exception e) {
            Log.e(TAG, "解析单个酒店失败: " + e.getMessage());
            return null;
        }
    }
}
