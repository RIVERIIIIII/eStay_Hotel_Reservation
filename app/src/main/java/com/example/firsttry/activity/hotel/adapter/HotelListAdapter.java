package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.model.HotelModel;

import java.util.List;

import com.google.android.material.chip.Chip;

import android.content.Intent;
import com.example.firsttry.activity.hotel.HotelDetailActivity;

public class HotelListAdapter extends RecyclerView.Adapter<HotelListAdapter.HotelViewHolder> {

    private List<HotelModel> hotelList;

    public HotelListAdapter(List<HotelModel> hotelList) {
        this.hotelList = hotelList;
    }

    public void updateData(List<HotelModel> newData) {
        this.hotelList = newData;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public HotelViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_hotel, parent, false);
        return new HotelViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull HotelViewHolder holder, int position) {
        HotelModel hotel = hotelList.get(position);
        holder.bind(hotel);
    }

    @Override
    public int getItemCount() {
        return hotelList == null ? 0 : hotelList.size();
    }

    static class HotelViewHolder extends RecyclerView.ViewHolder {
        ImageView ivThumbnail;
        TextView tvName;
        TextView tvDistance;
        TextView tvPrice;
        TextView tvRatingBadge;
        LinearLayout llTags;

        public HotelViewHolder(@NonNull View itemView) {
            super(itemView);
            ivThumbnail = itemView.findViewById(R.id.iv_hotel_thumb);
            tvName = itemView.findViewById(R.id.tv_hotel_name);
            tvDistance = itemView.findViewById(R.id.tv_distance);
            tvPrice = itemView.findViewById(R.id.tv_price);
            tvRatingBadge = itemView.findViewById(R.id.tv_rating_badge);
            llTags = itemView.findViewById(R.id.ll_tags);
        }

        public void bind(HotelModel hotel) {
            tvName.setText(hotel.getName());
            
            // Rating (Format to 1 decimal place, high contrast badge)
            // 强校验逻辑：如果评分 <= 0，强制显示 4.8 预览，方便调试
            float rating = hotel.getAverageRating();
            if (rating <= 0) {
                rating = 4.8f; // Fallback for debugging/mock
            }
            
            tvRatingBadge.setVisibility(View.VISIBLE);
            tvRatingBadge.setText(String.format("%.1f", rating));
            
            // Distance logic
            if (hotel.getDistanceKm() > 0) {
                String distanceText;
                if (hotel.isCityCenter()) {
                    distanceText = String.format("距市中心 %.1f km", hotel.getDistanceKm());
                } else {
                    distanceText = String.format("距离我 %.1f km", hotel.getDistanceKm());
                }
                tvDistance.setText(distanceText);
                tvDistance.setVisibility(View.VISIBLE);
            } else {
                tvDistance.setVisibility(View.GONE);
            }
            
            tvPrice.setText(String.format("¥ %d 起", hotel.getStartPrice()));

            // Load Image with Glide
            if (hotel.getThumbnailUrl() != null && !hotel.getThumbnailUrl().isEmpty()) {
                Glide.with(itemView.getContext())
                        .load(hotel.getThumbnailUrl())
                        .placeholder(R.drawable.ic_launcher_background)
                        .centerCrop()
                        .into(ivThumbnail);
            } else {
                ivThumbnail.setImageResource(R.drawable.ic_launcher_background);
            }

            // Tags
            llTags.removeAllViews();
            if (hotel.getTags() != null) {
                for (String tag : hotel.getTags()) {
                    TextView chip = new TextView(itemView.getContext());
                    chip.setText(tag);
                    chip.setTextSize(10);
                    chip.setTextColor(itemView.getContext().getResources().getColor(R.color.app_primary_brown));
                    chip.setBackgroundResource(R.drawable.bg_search_rounded); // Use existing rounded bg
                    chip.setPadding(12, 6, 12, 6);
                    
                    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.WRAP_CONTENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                    );
                    params.setMarginEnd(8);
                    chip.setLayoutParams(params);
                    
                    llTags.addView(chip);
                }
            }

            // Click Listener to open Detail
            itemView.setOnClickListener(v -> {
                Intent intent = new Intent(itemView.getContext(), HotelDetailActivity.class);
                intent.putExtra(HotelDetailActivity.EXTRA_HOTEL_ID, hotel.getId()); // Use real ID
                // Dates? We don't have access to search query here easily unless passed.
                // For now, let HotelDetailActivity use defaults.
                itemView.getContext().startActivity(intent);
            });
        }
    }
}
