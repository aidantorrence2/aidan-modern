package com.aidan.flashcards;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

final class Ui {
    static final int BG = 0xFF0C0C0C, CARD = 0xFF1A1A1A, MUTED = 0xFF8A8A8A, LINE = 0xFF2A2A2A;
    static final int[] RATE_COLORS = {0xFFB3413A, 0xFFB8862E, 0xFF3F8F4F, 0xFF3C7FB5};
    static final String[] RATE_LABELS = {"Again", "Hard", "Good", "Easy"};

    static int dp(Activity a, float v) { return Math.round(v * a.getResources().getDisplayMetrics().density); }

    static void window(Activity a) {
        Window w = a.getWindow();
        w.setStatusBarColor(BG);
        w.setNavigationBarColor(BG);
        w.getDecorView().setBackgroundColor(BG);
    }

    static LinearLayout column(Activity a) {
        LinearLayout l = new LinearLayout(a);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setBackgroundColor(BG);
        int p = dp(a, 20);
        l.setPadding(p, dp(a, 28), p, p);
        return l;
    }

    static TextView text(Activity a, String s, float sp, int color, boolean serif) {
        TextView t = new TextView(a);
        t.setText(s);
        t.setTextSize(sp);
        t.setTextColor(color);
        if (serif) t.setTypeface(Typeface.SERIF);
        return t;
    }

    static GradientDrawable rounded(int color, float r) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(r);
        return g;
    }

    static Button button(Activity a, String s, int bg, View.OnClickListener l) {
        Button b = new Button(a);
        b.setText(s);
        b.setAllCaps(false);
        b.setTextColor(Color.WHITE);
        b.setTextSize(16);
        b.setBackground(rounded(bg, dp(a, 10)));
        b.setStateListAnimator(null);
        b.setGravity(Gravity.CENTER);
        b.setOnClickListener(l);
        return b;
    }

    static LinearLayout.LayoutParams lp(int w, int h, float weight, int margin) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(w, h, weight);
        p.setMargins(margin, margin, margin, margin);
        return p;
    }

    /** Big tappable card with front/back text. */
    static LinearLayout card(Activity a, TextView front, TextView hint, TextView back) {
        LinearLayout c = new LinearLayout(a);
        c.setOrientation(LinearLayout.VERTICAL);
        c.setGravity(Gravity.CENTER);
        c.setBackground(rounded(CARD, dp(a, 16)));
        int p = dp(a, 20);
        c.setPadding(p, p, p, p);
        front.setGravity(Gravity.CENTER);
        back.setGravity(Gravity.CENTER);
        hint.setGravity(Gravity.CENTER);
        c.addView(front);
        View line = new View(a);
        line.setBackgroundColor(LINE);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(a, 80), dp(a, 1));
        lp.setMargins(0, dp(a, 22), 0, dp(a, 22));
        c.addView(line, lp);
        c.addView(back);
        c.addView(hint);
        return c;
    }

    /** Row of Again/Hard/Good/Easy buttons; returns the buttons so callers can update labels. */
    static Button[] rateRow(Activity a, LinearLayout parent, RateListener l) {
        LinearLayout row = new LinearLayout(a);
        row.setOrientation(LinearLayout.HORIZONTAL);
        Button[] bs = new Button[4];
        for (int i = 0; i < 4; i++) {
            final int r = i;
            bs[i] = button(a, RATE_LABELS[i], RATE_COLORS[i], v -> l.rate(r));
            bs[i].setTextSize(14);
            row.addView(bs[i], lp(0, dp(a, 64), 1, dp(a, 4)));
        }
        parent.addView(row);
        return bs;
    }

    interface RateListener { void rate(int r); }
}
