package com.example.firsttry.activity.hotel.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.firsttry.R;

import java.util.ArrayList;
import java.util.List;

public class QuickFilterAdapter extends RecyclerView.Adapter<QuickFilterAdapter.ViewHolder> {

    private final List<String> filters;
    private final List<String> activeFilters = new ArrayList<>();
    private final OnFilterClickListener listener;

    public interface OnFilterClickListener {
        void onFilterClick(List<String> activeFilters);
    }

    private boolean isSingleSelectionMode = false;

    public QuickFilterAdapter(List<String> filters, OnFilterClickListener listener) {
        this.filters = filters;
        this.listener = listener;
    }

    public void setSingleSelectionMode(boolean singleSelectionMode) {
        isSingleSelectionMode = singleSelectionMode;
    }

    public void clearSelection() {
        activeFilters.clear();
        notifyDataSetChanged();
    }

    public void addActiveFilter(String filter) {
        if (!activeFilters.contains(filter)) {
            activeFilters.add(filter);
            notifyDataSetChanged();
        }
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_quick_filter, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        String filter = filters.get(position);
        boolean isActive = activeFilters.contains(filter);

        holder.tvFilter.setText(filter);
        if (isActive) {
            holder.tvFilter.setBackgroundResource(R.drawable.bg_filter_tag_selected);
            holder.tvFilter.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.white));
        } else {
            holder.tvFilter.setBackgroundResource(R.drawable.bg_filter_tag_unselected);
            holder.tvFilter.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.text_primary));
        }

        holder.itemView.setOnClickListener(v -> {
            if (isSingleSelectionMode) {
                // Single Selection Logic
                activeFilters.clear();
                activeFilters.add(filter);
                notifyDataSetChanged();
            } else {
                // Multi Selection Logic
                if (isActive) {
                    activeFilters.remove(filter);
                } else {
                    activeFilters.add(filter);
                }
                notifyItemChanged(position);
            }
            listener.onFilterClick(activeFilters);
        });
    }

    @Override
    public int getItemCount() {
        return filters.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvFilter;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvFilter = itemView.findViewById(R.id.tv_quick_filter);
        }
    }
}
