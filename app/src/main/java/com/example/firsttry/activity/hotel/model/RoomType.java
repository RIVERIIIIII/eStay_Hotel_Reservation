package com.example.firsttry.activity.hotel.model;

import java.io.Serializable;

public class RoomType implements Serializable {
    private String name;
    private String bedType;
    private String area;
    private String price;
    private String imageUrl;

    public RoomType(String name, String bedType, String area, String price, String imageUrl) {
        this.name = name;
        this.bedType = bedType;
        this.area = area;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public String getName() {
        return name;
    }

    public String getBedType() {
        return bedType;
    }

    public String getArea() {
        return area;
    }

    public String getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
