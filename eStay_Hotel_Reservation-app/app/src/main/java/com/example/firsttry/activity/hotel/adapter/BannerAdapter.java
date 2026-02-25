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
    private List<com.example.firsttry.activity.hotel.model.HotelModel> hotels; // Remote data
    private OnBannerClickListener listener;

    public interface OnBannerClickListener {
        void onBannerClick(int position);
    }

    public BannerAdapter(List<Integer> images) {
        this.images = images;
    }

    public BannerAdapter(List<com.example.firsttry.activity.hotel.model.HotelModel> hotels, boolean isRemote) {
        this.hotels = hotels;
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
            // Load remote image
            com.example.firsttry.activity.hotel.model.HotelModel hotel = hotels.get(position);
            
            // 使用 Glide 加载网络图片
            String imageUrl = hotel.getThumbnailUrl();
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
            
            // Set click listener with real hotel ID
            holder.itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onBannerClick(position);
                }
            });
        } else if (images != null && !images.isEmpty()) {
            // Load local resource
            holder.imageView.setImageResource(images.get(position));
            
            holder.itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onBannerClick(position);
                }
            });
        }
    }

    @Override
    public int getItemCount() {
        if (hotels != null) return hotels.size();
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
