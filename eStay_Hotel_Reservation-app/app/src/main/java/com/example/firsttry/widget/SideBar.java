package com.example.firsttry.widget;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.Nullable;

public class SideBar extends View {

    private OnTouchingLetterChangedListener onTouchingLetterChangedListener;
    public static String[] b = {"A", "B", "C", "D", "E", "F", "G", "H", "I",
            "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
            "W", "X", "Y", "Z", "#"};
    private int choose = -1; // Selected index
    private Paint paint = new Paint();

    private TextView mTextDialog;

    public void setTextView(TextView mTextDialog) {
        this.mTextDialog = mTextDialog;
    }

    public SideBar(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public SideBar(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        int height = getHeight();
        int width = getWidth();
        int singleHeight = height / b.length;

        for (int i = 0; i < b.length; i++) {
            paint.setColor(Color.parseColor("#9E948A")); // 默认亚麻灰
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setAntiAlias(true);
            paint.setTextSize(30);
            
            // Highlight selected
            if (i == choose) {
                paint.setColor(Color.parseColor("#8C6A5E")); // 选中焦糖棕
                paint.setFakeBoldText(true);
            }

            float xPos = width / 2 - paint.measureText(b[i]) / 2;
            float yPos = singleHeight * i + singleHeight;
            canvas.drawText(b[i], xPos, yPos, paint);
            paint.reset();
        }
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        final int action = event.getAction();
        final float y = event.getY();
        final int oldChoose = choose;
        final OnTouchingLetterChangedListener listener = onTouchingLetterChangedListener;
        final int c = (int) (y / getHeight() * b.length); // Calculate index

        switch (action) {
            case MotionEvent.ACTION_UP:
                setBackgroundColor(0x00000000);
                // choose = -1;// Remove auto-reset on UP to keep selection state visible if desired?
                // Actually, SideBar usually keeps highlight while scrolling list?
                // But for "Two-way linkage", we want to update choose based on list scroll too.
                // If we reset choose here, it might flicker if list scroll updates it back.
                // Standard behavior: Sidebar touch highlights temporarily or stays?
                // Let's keep choose = -1 for now unless external update sets it.
                // Wait, if user drags, it highlights. If user releases, should it stay highlighted?
                // Usually yes, to show current section.
                // Let's NOT reset choose to -1 immediately if we want persistent indicator of current section.
                // However, "choose" is index in array.
                // If we want two-way binding, we need a method to set selection from outside.
                
                // For now, let's keep it resetting on UP to match standard "touch feedback"
                // But we will add setSelection method.
                choose = -1; 
                invalidate();
                if (mTextDialog != null) {
                    mTextDialog.setVisibility(View.INVISIBLE);
                }
                break;

            default:
                // setBackgroundColor(0x40000000); // Optional background on touch
                if (oldChoose != c) {
                    if (c >= 0 && c < b.length) {
                        if (listener != null) {
                            listener.onTouchingLetterChanged(b[c]);
                        }
                        if (mTextDialog != null) {
                            mTextDialog.setText(b[c]);
                            mTextDialog.setVisibility(View.VISIBLE);
                        }
                        choose = c;
                        invalidate();
                    }
                }
                break;
        }
        return true;
    }

    public void setSelection(String letter) {
        for (int i = 0; i < b.length; i++) {
            if (b[i].equals(letter)) {
                choose = i;
                invalidate();
                return;
            }
        }
        // If not found or empty, maybe reset?
        // choose = -1;
        // invalidate();
    }

    public void setOnTouchingLetterChangedListener(
            OnTouchingLetterChangedListener onTouchingLetterChangedListener) {
        this.onTouchingLetterChangedListener = onTouchingLetterChangedListener;
    }

    public interface OnTouchingLetterChangedListener {
        void onTouchingLetterChanged(String s);
    }
}
