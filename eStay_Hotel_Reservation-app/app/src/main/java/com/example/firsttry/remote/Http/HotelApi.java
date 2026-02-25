package com.example.firsttry.remote.Http;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.example.firsttry.activity.hotel.model.HotelModel;
import com.example.firsttry.activity.hotel.model.HotelSearchQuery;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.json.JSONArray;
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
                            HotelModel hotel = parseHotelJson(hotelJson, false);
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
    public static void getHotelList(HotelSearchQuery query, HotelListCallback callback) {
        String url = HttpClient.BASE_URL + "api/public/hotels";
        
        // 构建URL参数
        okhttp3.HttpUrl.Builder urlBuilder = okhttp3.HttpUrl.parse(url).newBuilder();
        
        if (query.getCity() != null) urlBuilder.addQueryParameter("city", query.getCity());
        
        // 注意：后端似乎不直接支持 locationMode, latitude, longitude 在查询参数中进行复杂的地理位置过滤
        // 如果后端支持，应该添加。这里暂时保留原有逻辑的意图，但作为 query param 可能无效
        // 建议后端增加对 lat/lng 的支持。目前先作为 query param 传递。
        if (query.isLocationMode()) {
            urlBuilder.addQueryParameter("latitude", String.valueOf(query.getLatitude()));
            urlBuilder.addQueryParameter("longitude", String.valueOf(query.getLongitude()));
        }
        
        if (query.getKeyword() != null) urlBuilder.addQueryParameter("keyword", query.getKeyword());
        if (query.getCheckInDate() != null) urlBuilder.addQueryParameter("checkInDate", query.getCheckInDate());
        if (query.getCheckOutDate() != null) urlBuilder.addQueryParameter("checkOutDate", query.getCheckOutDate());
        
        // 房间/人数信息 (后端未明确列出支持，但作为 query 传递无害)
        urlBuilder.addQueryParameter("roomCount", String.valueOf(query.getRoomCount()));
        urlBuilder.addQueryParameter("adultCount", String.valueOf(query.getAdultCount()));
        urlBuilder.addQueryParameter("childCount", String.valueOf(query.getChildCount()));
        
        if (query.getMinPrice() > 0) urlBuilder.addQueryParameter("minPrice", String.valueOf(query.getMinPrice()));
        if (query.getMaxPrice() > 0) urlBuilder.addQueryParameter("maxPrice", String.valueOf(query.getMaxPrice()));
        if (query.getStarRating() > 0) urlBuilder.addQueryParameter("starRating", String.valueOf(query.getStarRating()));
        
        // 设施/标签
        // 将 quickTags 和 facilities 合并传给 amenities 参数
        List<String> allAmenities = new ArrayList<>();
        if (query.getQuickTags() != null) allAmenities.addAll(query.getQuickTags());
        if (query.getFacilities() != null) allAmenities.addAll(query.getFacilities());
        
        for (String amenity : allAmenities) {
            urlBuilder.addQueryParameter("amenities", amenity);
        }
        
        if (query.getSortBy() != null) urlBuilder.addQueryParameter("sortBy", query.getSortBy());
        
        urlBuilder.addQueryParameter("page", String.valueOf(query.getPage()));
        urlBuilder.addQueryParameter("pageSize", String.valueOf(query.getPageSize()));

        String finalUrl = urlBuilder.build().toString();
        Log.d(TAG, "GET: " + finalUrl);

        Request request = new Request.Builder()
                .url(finalUrl)
                .get()
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
                            HotelModel hotel = parseHotelJson(hotelJson, query.isLocationMode());
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
    public static void getHotelDetail(String hotelId, String checkInDate, String checkOutDate, HotelDetailCallback callback) {
        String url = HttpClient.BASE_URL + "api/public/hotels/" + hotelId;
        
        // 构建URL参数
        okhttp3.HttpUrl.Builder urlBuilder = okhttp3.HttpUrl.parse(url).newBuilder();
        if (checkInDate != null) urlBuilder.addQueryParameter("checkInDate", checkInDate);
        if (checkOutDate != null) urlBuilder.addQueryParameter("checkOutDate", checkOutDate);
        
        String finalUrl = urlBuilder.build().toString();
        Log.d(TAG, "GET: " + finalUrl);

        Request request = new Request.Builder()
                .url(finalUrl)
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
                        HotelModel hotel = parseHotelJson(hotelJson, false);
                        
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
    private static HotelModel parseHotelJson(JsonObject hotelJson, boolean isLocationMode) {
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
            
            // 设置距离和位置显示逻辑
            // 距离：尝试从后端获取真实距离，如果不存在则默认为0
            double distanceKm = 0.0;
            if (hotelJson.has("distance") && !hotelJson.get("distance").isJsonNull()) {
                distanceKm = hotelJson.get("distance").getAsDouble();
                // 如果后端返回的是米，转换为千米 (假设后端可能返回米)
                // 但根据通常API设计，我们假设它已经是km或我们可以直接使用
                // 这里假设是km，如果数值很大可能是米，暂时按km处理
            }
            
            // 距离类型：根据查询模式决定
            // 如果是定位模式(isLocationMode=true)，则显示"距离我" -> isCityCenter=false
            // 如果是城市模式(isLocationMode=false)，则显示"距离市中心" -> isCityCenter=true
            boolean isCityCenter = !isLocationMode;

            // 从服务器获取真实评分数据
            float averageRating = 0.0f;
            if (hotelJson.has("averageRating") && !hotelJson.get("averageRating").isJsonNull()) {
                averageRating = hotelJson.get("averageRating").getAsFloat();
            } else if (hotelJson.has("rating") && !hotelJson.get("rating").isJsonNull()) {
                // 兼容 rating 字段
                averageRating = hotelJson.get("rating").getAsFloat();
            }
            
            return new HotelModel(id, name, nameEn, address, starRating, roomTypes, startPrice, openingTime, description, amenities, images, thumbnailUrl, tags, distanceKm, isCityCenter, averageRating);
        } catch (Exception e) {
            Log.e(TAG, "解析单个酒店失败: " + e.getMessage());
            return null;
        }
    }
}
