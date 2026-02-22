package com.example.firsttry.activity.hotel.dialog;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RadioGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.firsttry.R;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.slider.RangeSlider;

import java.util.List;

public class FilterBottomSheetDialogFragment extends BottomSheetDialogFragment {

    public interface OnFilterAppliedListener {
        void onFilterApplied(int minPrice, int maxPrice, int starRating);
    }

    private OnFilterAppliedListener listener;
    private RangeSlider rangeSlider;
    private RadioGroup rgStarRating;

    public void setOnFilterAppliedListener(OnFilterAppliedListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.dialog_bottom_sheet_filter, container, false);
        
        rangeSlider = view.findViewById(R.id.slider_price);
        rgStarRating = view.findViewById(R.id.rg_star_rating);
        Button btnReset = view.findViewById(R.id.btn_reset);
        Button btnConfirm = view.findViewById(R.id.btn_confirm);

        // Ensure RangeSlider starts with two thumbs
        rangeSlider.setValues(0f, 1300f);

        btnReset.setOnClickListener(v -> {
            // Reset to initial range but DO NOT dismiss
            rangeSlider.setValues(0f, 1300f);
            rgStarRating.clearCheck();
        });

        btnConfirm.setOnClickListener(v -> {
            if (listener != null) {
                List<Float> values = rangeSlider.getValues();
                int minPrice = Math.round(values.get(0));
                int maxPrice = Math.round(values.get(1));
                
                int selectedId = rgStarRating.getCheckedRadioButtonId();
                int starRating = 0;
                if (selectedId == R.id.rb_star_2) starRating = 2;
                else if (selectedId == R.id.rb_star_3) starRating = 3;
                else if (selectedId == R.id.rb_star_4) starRating = 4;
                else if (selectedId == R.id.rb_star_5) starRating = 5;

                listener.onFilterApplied(minPrice, maxPrice, starRating);
                dismiss();
            }
        });

        return view;
    }
}
