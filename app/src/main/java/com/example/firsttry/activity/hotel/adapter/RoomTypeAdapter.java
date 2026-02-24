package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.model.HotelModel;

import java.util.List;

import android.widget.Toast;

import com.example.firsttry.activity.hotel.BookingConfirmationActivity;
import com.example.firsttry.activity.hotel.HotelDetailActivity;
import android.content.Context;
import android.content.Intent;
import android.app.Activity;

import android.content.ContextWrapper;

public class RoomTypeAdapter extends RecyclerView.Adapter<RoomTypeAdapter.RoomTypeViewHolder> {

    private List<HotelModel.RoomType> roomTypes;

    public RoomTypeAdapter(List<HotelModel.RoomType> roomTypes) {
        this.roomTypes = roomTypes;
    }

    public void updateData(List<HotelModel.RoomType> newRoomTypes) {
        this.roomTypes = newRoomTypes;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public RoomTypeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_room_type, parent, false);
        return new RoomTypeViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RoomTypeViewHolder holder, int position) {
        HotelModel.RoomType room = roomTypes.get(position);
        holder.tvName.setText(room.getType());
        holder.tvBedInfo.setText(room.getDescription()); 
        holder.tvArea.setText(""); 
        holder.tvPrice.setText("¥" + room.getPrice());
        
        holder.btnBook.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, BookingConfirmationActivity.class);
            
            // Unwrap context to find HotelDetailActivity
            Context baseContext = context;
            while (baseContext instanceof ContextWrapper) {
                if (baseContext instanceof HotelDetailActivity) {
                    break;
                }
                baseContext = ((ContextWrapper) baseContext).getBaseContext();
            }
            
            // Get data from HotelDetailActivity
            if (baseContext instanceof HotelDetailActivity) {
                HotelDetailActivity activity = (HotelDetailActivity) baseContext;
                
                intent.putExtra(BookingConfirmationActivity.EXTRA_HOTEL_ID, activity.getHotelId());
                intent.putExtra(BookingConfirmationActivity.EXTRA_HOTEL_NAME, activity.getHotelName());
                intent.putExtra(BookingConfirmationActivity.EXTRA_CHECK_IN, activity.getCheckInDate());
                intent.putExtra(BookingConfirmationActivity.EXTRA_CHECK_OUT, activity.getCheckOutDate());
                intent.putExtra(BookingConfirmationActivity.EXTRA_TOTAL_NIGHTS, activity.getTotalNights());
            } else {
                // Fallback or error
                intent.putExtra(BookingConfirmationActivity.EXTRA_HOTEL_NAME, "未知酒店");
            }
            
            intent.putExtra(BookingConfirmationActivity.EXTRA_ROOM_TYPE, room.getType());
            intent.putExtra(BookingConfirmationActivity.EXTRA_ROOM_DESC, room.getDescription());
            intent.putExtra(BookingConfirmationActivity.EXTRA_PRICE, room.getPrice());
            
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return roomTypes == null ? 0 : roomTypes.size();
    }

    public static class RoomTypeViewHolder extends RecyclerView.ViewHolder {
        ImageView ivThumb;
        TextView tvName, tvBedInfo, tvArea, tvPrice;
        View btnBook;

        public RoomTypeViewHolder(@NonNull View itemView) {
            super(itemView);
            ivThumb = itemView.findViewById(R.id.iv_room_thumb);
            tvName = itemView.findViewById(R.id.tv_room_name);
            tvBedInfo = itemView.findViewById(R.id.tv_bed_info);
            tvArea = itemView.findViewById(R.id.tv_room_area);
            tvPrice = itemView.findViewById(R.id.tv_price);
            btnBook = itemView.findViewById(R.id.btn_book);
        }
    }
}
