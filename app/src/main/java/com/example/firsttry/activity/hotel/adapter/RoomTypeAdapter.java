package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;
import com.example.firsttry.activity.hotel.model.RoomType;

import java.util.List;

import android.widget.Toast;

public class RoomTypeAdapter extends RecyclerView.Adapter<RoomTypeAdapter.RoomTypeViewHolder> {

    private List<RoomType> roomTypes;

    public RoomTypeAdapter(List<RoomType> roomTypes) {
        this.roomTypes = roomTypes;
    }

    public void updateData(List<RoomType> newRoomTypes) {
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
        RoomType room = roomTypes.get(position);
        holder.tvName.setText(room.getName());
        holder.tvBedInfo.setText(room.getBedType());
        holder.tvArea.setText(room.getArea());
        holder.tvPrice.setText("¥" + room.getPrice());
        
        holder.btnBook.setOnClickListener(v -> {
            Toast.makeText(v.getContext(), "预定成功", Toast.LENGTH_SHORT).show();
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
