package com.aidan.flashcards;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    private String lang;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Ui.window(this);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != 0)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
    }

    @Override protected void onResume() { super.onResume(); lang = Deck.prefLang(this); render(); }

    private void render() {
        Deck d = Deck.get(this, lang);
        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(Ui.BG);
        LinearLayout col = Ui.column(this);
        sv.addView(col);

        // language switch
        LinearLayout langs = new LinearLayout(this);
        for (String code : Deck.LANGS) {
            Deck x = Deck.get(this, code);
            Button btn = Ui.button(this, x.name, code.equals(lang) ? 0xFF333333 : Ui.BG, v -> {
                getSharedPreferences("app", 0).edit().putString("lang", code).apply();
                lang = code; render();
            });
            btn.setTextSize(14);
            langs.addView(btn, Ui.lp(0, Ui.dp(this, 44), 1, Ui.dp(this, 2)));
        }
        col.addView(langs);

        int total = d.cards.size(), seen = 0, known = 0;
        for (Deck.Card c : d.cards) { if (d.state(c) != null) seen++; if (d.known(c)) known++; }
        TextView stats = Ui.text(this, d.dueCount(-1) + " due  ·  " + seen + " / " + total + " seen  ·  " + known + " known",
                14, Ui.MUTED, false);
        stats.setGravity(Gravity.CENTER);
        stats.setPadding(0, Ui.dp(this, 22), 0, Ui.dp(this, 14));
        col.addView(stats);

        LinearLayout modes = new LinearLayout(this);
        modes.addView(Ui.button(this, "Study", 0xFF2E2E2E, v -> start(false, -1)), Ui.lp(0, Ui.dp(this, 64), 1, Ui.dp(this, 4)));
        modes.addView(Ui.button(this, "Audio", 0xFF2E2E2E, v -> start(true, -1)), Ui.lp(0, Ui.dp(this, 64), 1, Ui.dp(this, 4)));
        col.addView(modes);

        TextView h = Ui.text(this, "Levels", 20, 0xFFFFFFFF, true);
        h.setPadding(Ui.dp(this, 4), Ui.dp(this, 28), 0, Ui.dp(this, 8));
        col.addView(h);

        for (int li = 0; li < d.levelNames.size(); li++) {
            int n = 0, s = 0, k = 0;
            for (Deck.Card c : d.cards) if (c.level == li) { n++; if (d.state(c) != null) s++; if (d.known(c)) k++; }
            final int level = li;
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.VERTICAL);
            row.setBackground(Ui.rounded(Ui.CARD, Ui.dp(this, 10)));
            int p = Ui.dp(this, 14);
            row.setPadding(p, p, p, p);
            row.addView(Ui.text(this, d.levelNames.get(li), 17, 0xFFFFFFFF, true));
            row.addView(Ui.text(this, s + " / " + n + " seen  ·  " + k + " known  ·  " + d.dueCount(li) + " due", 13, Ui.MUTED, false));
            // progress bar
            LinearLayout bar = new LinearLayout(this);
            bar.setBackground(Ui.rounded(0xFF2A2A2A, Ui.dp(this, 2)));
            android.view.View fillSeen = new android.view.View(this);
            fillSeen.setBackground(Ui.rounded(0xFF3F8F4F, Ui.dp(this, 2)));
            bar.addView(fillSeen, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, s));
            bar.addView(new android.view.View(this), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, n - s));
            LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 4));
            bp.topMargin = Ui.dp(this, 10);
            row.addView(bar, bp);
            row.setOnClickListener(v -> new AlertDialog.Builder(this)
                    .setTitle(d.levelNames.get(level))
                    .setItems(new String[]{"Study", "Audio"}, (dlg, which) -> start(which == 1, level))
                    .show());
            col.addView(row, Ui.lp(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, Ui.dp(this, 4)));
        }
        setContentView(sv);
    }

    private void start(boolean audio, int level) {
        Intent i = new Intent(this, audio ? AudioActivity.class : StudyActivity.class);
        i.putExtra("lang", lang).putExtra("level", level).putExtra("start", true);
        startActivity(i);
    }
}
