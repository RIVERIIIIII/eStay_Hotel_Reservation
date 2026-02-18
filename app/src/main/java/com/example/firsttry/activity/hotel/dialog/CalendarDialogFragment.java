package com.example.firsttry.activity.hotel.dialog;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import com.example.firsttry.R;
import com.example.firsttry.utils.TimeProvider;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class CalendarDialogFragment extends DialogFragment {

    public interface OnDateRangeSelectedListener {
        void onDateRangeSelected(String startDate, String endDate, long nights);
    }

    private OnDateRangeSelectedListener listener;
    private Calendar startCalendar;
    private Calendar endCalendar;
    private TextView tvSelectionHint;
    private Button btnConfirm;
    private boolean isSelectingStart = true;

    public void setOnDateRangeSelectedListener(OnDateRangeSelectedListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.dialog_calendar_picker, container, false);
        
        CalendarView calendarView = view.findViewById(R.id.calendar_view);
        tvSelectionHint = view.findViewById(R.id.tv_selection_hint);
        btnConfirm = view.findViewById(R.id.btn_confirm);
        
        // Initialize default hint
        tvSelectionHint.setText("请选择入住日期");
        btnConfirm.setEnabled(false);

        // Disable past dates
        long todayMillis = TimeProvider.getInstance().getTodayCalendar().getTimeInMillis();
        calendarView.setMinDate(todayMillis);

        calendarView.setOnDateChangeListener((view1, year, month, dayOfMonth) -> {
            Calendar selected = Calendar.getInstance();
            selected.set(year, month, dayOfMonth);
            // Reset time part for accurate comparison
            selected.set(Calendar.HOUR_OF_DAY, 0);
            selected.set(Calendar.MINUTE, 0);
            selected.set(Calendar.SECOND, 0);
            selected.set(Calendar.MILLISECOND, 0);

            handleDateSelection(selected);
        });
        
        btnConfirm.setOnClickListener(v -> {
            if (startCalendar != null && endCalendar != null && listener != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                long diff = endCalendar.getTimeInMillis() - startCalendar.getTimeInMillis();
                long nights = diff / (24 * 60 * 60 * 1000);
                listener.onDateRangeSelected(sdf.format(startCalendar.getTime()), sdf.format(endCalendar.getTime()), nights);
                dismiss();
            }
        });

        return view;
    }

    private void handleDateSelection(Calendar selected) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        if (isSelectingStart) {
            startCalendar = selected;
            isSelectingStart = false;
            tvSelectionHint.setText("入住: " + sdf.format(selected.getTime()) + "\n请选择离店日期");
            endCalendar = null;
            btnConfirm.setEnabled(false);
        } else {
            if (selected.before(startCalendar)) {
                // If selected date is before start date, treat it as new start date
                startCalendar = selected;
                tvSelectionHint.setText("入住: " + sdf.format(selected.getTime()) + "\n请选择离店日期 (重新选择)");
                endCalendar = null;
                btnConfirm.setEnabled(false);
            } else if (selected.equals(startCalendar)) {
                 Toast.makeText(getContext(), "入住和离店不能是同一天", Toast.LENGTH_SHORT).show();
            } else {
                endCalendar = selected;
                isSelectingStart = true; // Reset for next interaction if needed, or stay done
                tvSelectionHint.setText("入住: " + sdf.format(startCalendar.getTime()) + "\n离店: " + sdf.format(endCalendar.getTime()));
                btnConfirm.setEnabled(true);
            }
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        Dialog dialog = getDialog();
        if (dialog != null) {
            int width = ViewGroup.LayoutParams.MATCH_PARENT;
            int height = ViewGroup.LayoutParams.WRAP_CONTENT;
            dialog.getWindow().setLayout(width, height);
        }
    }
}
