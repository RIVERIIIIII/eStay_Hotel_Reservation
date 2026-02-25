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
            
            // Try to get data from HotelDetailActivity context if possible, or pass mock/default data
            if (context instanceof HotelDetailActivity) {
                HotelDetailActivity activity = (HotelDetailActivity) context;
                // Note: You might need to expose getters in HotelDetailActivity for these fields
                // For now, let's assume we can get them or pass defaults. 
                // Since fields are private, we need to add public getters in HotelDetailActivity
                // OR put these extras in the intent directly if we had access.
                
                // Let's modify HotelDetailActivity to expose current check-in/out dates or hotel name.
                // For this step, I'll pass room info. Hotel info might be missing if not passed.
                
                // HACK: Since we are inside Adapter, we don't have easy access to Activity's private fields.
                // Ideally, we should use a callback interface.
                // For simplicity as requested, let's try to get hotel name from a TextView if possible, or pass "当前酒店"
                
                TextView tvHotelName = ((Activity)context).findViewById(R.id.tv_hotel_name_cn);
                String hotelName = tvHotelName != null ? tvHotelName.getText().toString() : "当前酒店";
                
                // Get dates from activity intent or static/public fields?
                // Let's assume default dates for now or try to parse from UI (not robust).
                // Better approach: Pass hotelName and dates to Adapter constructor or updateData.
                
                intent.putExtra(BookingConfirmationActivity.EXTRA_HOTEL_NAME, hotelName);
                intent.putExtra(BookingConfirmationActivity.EXTRA_ROOM_TYPE, room.getType());
                intent.putExtra(BookingConfirmationActivity.EXTRA_ROOM_DESC, room.getDescription());
                intent.putExtra(BookingConfirmationActivity.EXTRA_PRICE, room.getPrice());
                
                // We need date info. Let's try to get it from the Activity if we add getters.
                // I will add getters to HotelDetailActivity in next step.
                 intent.putExtra(BookingConfirmationActivity.EXTRA_CHECK_IN, ((HotelDetailActivity) context).getCheckInDate());
                 intent.putExtra(BookingConfirmationActivity.EXTRA_CHECK_OUT, ((HotelDetailActivity) context).getCheckOutDate());
                 intent.putExtra(BookingConfirmationActivity.EXTRA_TOTAL_NIGHTS, ((HotelDetailActivity) context).getTotalNights());
            }
            
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
