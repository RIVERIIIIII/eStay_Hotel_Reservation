package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.firsttry.R;

import java.util.List;

public class BannerAdapter extends RecyclerView.Adapter<BannerAdapter.BannerViewHolder> {

    private final List<String> imageUrls;
    private OnBannerClickListener listener;

    public interface OnBannerClickListener {
        void onBannerClick(int position);
    }

    public BannerAdapter(List<String> imageUrls) {
        this.imageUrls = imageUrls;
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
        String imageUrl = imageUrls.get(position);
        // 使用Glide加载图片
        Glide.with(holder.itemView.getContext())
            .load(imageUrl)
            .placeholder(R.drawable.splash_image) // 占位图
            .error(R.drawable.splash_image) // 错误图
            .into(holder.imageView);
            
        if (listener != null) {
            holder.itemView.setOnClickListener(v -> listener.onBannerClick(position));
            holder.itemView.setClickable(true);
        } else {
            holder.itemView.setOnClickListener(null);
            holder.itemView.setClickable(false);
        }
    }

    @Override
    public int getItemCount() {
        return imageUrls.size();
    }

    static class BannerViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;

        public BannerViewHolder(@NonNull View itemView) {
            super(itemView);
            imageView = itemView.findViewById(R.id.iv_banner_image);
        }
    }
}
