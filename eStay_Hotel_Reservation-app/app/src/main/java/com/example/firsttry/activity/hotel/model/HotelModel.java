package com.example.firsttry.activity.hotel.model;

import java.io.Serializable;
import java.util.List;

public class HotelModel implements Serializable {
    private String id;
    private String name;
    private String nameEn;
    private String address;
    private int starRating;
    private List<RoomType> roomTypes;
    private int startPrice;
    private String openingTime;
    private String description;
    private List<String> amenities;
    private List<String> images;
    private String thumbnailUrl;
    private List<String> tags;
    private double distanceKm; // Relative to current location or city center
    private boolean isCityCenter; // If distance is relative to city center
    private float averageRating; // Added for rating display

    public HotelModel(String id, String name, String nameEn, String address, int starRating, List<RoomType> roomTypes, int startPrice, String openingTime, String description, List<String> amenities, List<String> images, String thumbnailUrl, List<String> tags, double distanceKm, boolean isCityCenter, float averageRating) {
        this.id = id;
        this.name = name;
        this.nameEn = nameEn;
        this.address = address;
        this.starRating = starRating;
        this.roomTypes = roomTypes;
        this.startPrice = startPrice;
        this.openingTime = openingTime;
        this.description = description;
        this.amenities = amenities;
        this.images = images;
        this.thumbnailUrl = thumbnailUrl;
        this.tags = tags;
        this.distanceKm = distanceKm;
        this.isCityCenter = isCityCenter;
        this.averageRating = averageRating;
    }

    public static class RoomType implements Serializable {
        private String type;
        private int price;
        private String description;

        public RoomType(String type, int price, String description) {
            this.type = type;
            this.price = price;
            this.description = description;
        }

        public String getType() { return type; }
        public int getPrice() { return price; }
        public String getDescription() { return description; }
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getNameEn() { return nameEn; }
    public String getAddress() { return address; }
    public int getStarRating() { return starRating; }
    public List<RoomType> getRoomTypes() { return roomTypes; }
    public int getStartPrice() { return startPrice; }
    public String getOpeningTime() { return openingTime; }
    public String getDescription() { return description; }
    public List<String> getAmenities() { return amenities; }
    public List<String> getImages() { return images; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public List<String> getTags() { return tags; }
    public double getDistanceKm() { return distanceKm; }
    public boolean isCityCenter() { return isCityCenter; }
    public float getAverageRating() { return averageRating; }
}
