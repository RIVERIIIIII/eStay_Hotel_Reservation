package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;

import java.util.List;

import com.bumptech.glide.Glide;

public class BannerAdapter extends RecyclerView.Adapter<BannerAdapter.BannerViewHolder> {

    private List<Integer> images; // Local resources
    private List<com.example.firsttry.activity.hotel.model.HotelModel> hotels; // Remote hotel data
    private List<String> imageUrls; // Remote image URLs
    private OnBannerClickListener listener;

    public interface OnBannerClickListener {
        void onBannerClick(int position);
    }

    // Private constructor to enforce factory method usage
    private BannerAdapter() {
    }
    
    // Factory methods to create different types of BannerAdapter instances
    public static BannerAdapter fromLocalImages(List<Integer> images) {
        BannerAdapter adapter = new BannerAdapter();
        adapter.images = images;
        return adapter;
    }
    
    public static BannerAdapter fromHotelData(List<com.example.firsttry.activity.hotel.model.HotelModel> hotels) {
        BannerAdapter adapter = new BannerAdapter();
        adapter.hotels = hotels;
        return adapter;
    }
    
    public static BannerAdapter fromImageUrls(List<String> imageUrls) {
        BannerAdapter adapter = new BannerAdapter();
        adapter.imageUrls = imageUrls;
        return adapter;
    }

    public void setOnBannerClickListener(OnBannerClickListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public BannerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_banner_image, parent, false);
        return new BannerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BannerViewHolder holder, int position) {
        if (hotels != null && !hotels.isEmpty()) {
            // Load remote image from hotel data
            com.example.firsttry.activity.hotel.model.HotelModel hotel = hotels.get(position);
            
            // 使用 Glide 加载网络图片
            String imageUrl = hotel.getThumbnailUrl();
            loadImage(holder, imageUrl);
        } else if (imageUrls != null && !imageUrls.isEmpty()) {
            // Load remote image from URL list
            String imageUrl = imageUrls.get(position);
            loadImage(holder, imageUrl);
        } else if (images != null && !images.isEmpty()) {
            // Load local resource
            holder.imageView.setImageResource(images.get(position));
        }
        
        // Set click listener
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onBannerClick(position);
            }
        });
    }
    
    private void loadImage(BannerViewHolder holder, String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(imageUrl)
                    .placeholder(R.drawable.splash_image) // 加载中显示的占位图
                    .error(R.drawable.splash_image) // 加载失败显示的图片
                    .centerCrop()
                    .into(holder.imageView);
        } else {
            holder.imageView.setImageResource(R.drawable.splash_image);
        }
    }

    @Override
    public int getItemCount() {
        if (hotels != null) return hotels.size();
        if (imageUrls != null) return imageUrls.size();
        if (images != null) return images.size();
        return 0;
    }

    static class BannerViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;

        public BannerViewHolder(@NonNull View itemView) {
            super(itemView);
            imageView = itemView.findViewById(R.id.iv_banner_image);
        }
    }
}
