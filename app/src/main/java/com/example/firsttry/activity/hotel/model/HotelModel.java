package com.example.firsttry.activity.hotel.model;

import java.io.Serializable;
import java.util.List;

public class HotelModel implements Serializable {
    private String name;
    private String thumbnailUrl;
    private int startPrice;
    private List<String> tags;
    private double distanceKm; // Relative to current location or city center
    private boolean isCityCenter; // If distance is relative to city center

    public HotelModel(String name, String thumbnailUrl, int startPrice, List<String> tags, double distanceKm, boolean isCityCenter) {
        this.name = name;
        this.thumbnailUrl = thumbnailUrl;
        this.startPrice = startPrice;
        this.tags = tags;
        this.distanceKm = distanceKm;
        this.isCityCenter = isCityCenter;
    }

    public String getName() {
        return name;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public int getStartPrice() {
        return startPrice;
    }

    public List<String> getTags() {
        return tags;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public boolean isCityCenter() {
        return isCityCenter;
    }
}
