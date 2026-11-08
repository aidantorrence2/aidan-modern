package com.aidan.flashcards;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Follows along with AudioService. Tapping the card or a rating never pauses playback. */
public class AudioActivity extends Activity {
    private TextView front, back, hint, counter, status;
    private Button[] rates;
    private Button pause;
    private boolean peek;
    private Deck.Card shown;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Ui.window(this);
        LinearLayout col = Ui.column(this);
        counter = Ui.text(this, "", 13, Ui.MUTED, false);
        col.addView(counter);
        status = Ui.text(this, "", 13, 0xFFB8862E, false);
        col.addView(status);
        front = Ui.text(this, "", 40, 0xFFFFFFFF, true);
        back = Ui.text(this, "", 24, 0xFFDDDDDD, false);
        hint = Ui.text(this, "", 13, Ui.MUTED, false);
        LinearLayout card = Ui.card(this, front, hint, back);
        card.setOnClickListener(v -> { peek = true; refresh(); });
        LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1);
        cp.setMargins(0, Ui.dp(this, 12), 0, Ui.dp(this, 12));
        col.addView(card, cp);
        rates = Ui.rateRow(this, col, r -> { if (AudioService.instance != null) AudioService.instance.rate(r); });
        LinearLayout ctl = new LinearLayout(this);
        pause = Ui.button(this, "Pause", 0xFF2E2E2E, v -> { if (AudioService.instance != null) AudioService.instance.togglePause(); });
        ctl.addView(pause, Ui.lp(0, Ui.dp(this, 52), 1, Ui.dp(this, 4)));
        ctl.addView(Ui.button(this, "Stop", 0xFF2E2E2E, v -> {
            startService(new Intent(this, AudioService.class).setAction(AudioService.STOP));
            finish();
        }), Ui.lp(0, Ui.dp(this, 52), 1, Ui.dp(this, 4)));
        col.addView(ctl);
        setContentView(col);
        if (getIntent().getBooleanExtra("start", false)) {
            getIntent().removeExtra("start");
            AudioService.lastDone = -1;
            startForegroundService(new Intent(this, AudioService.class)
                    .putExtra("lang", getIntent().getStringExtra("lang"))
                    .putExtra("level", getIntent().getIntExtra("level", -1)));
        }
    }

    @Override protected void onResume() {
        super.onResume();
        AudioService.listener = this::refresh;
        refresh();
    }

    @Override protected void onPause() { AudioService.listener = null; super.onPause(); }

    private void refresh() {
        AudioService s = AudioService.instance;
        if (s == null || s.deck == null) {
            if (AudioService.lastDone >= 0) counter.setText(AudioService.lastDone + " cards played");
            front.setText(AudioService.lastDone >= 0 ? "Done for now" : "…");
            back.setText(""); hint.setText(""); status.setText(""); return;
        }
        status.setText(s.status);
        pause.setText(s.paused ? "Resume" : "Pause");
        if (s.finished) {
            counter.setText(s.done + " cards played");
            front.setText("Done for now"); back.setText(""); hint.setText("");
            return;
        }
        Deck.Card c = s.cur;
        if (c == null) return;
        if (c != shown) { shown = c; peek = false; }
        counter.setText(s.done + " done");
        front.setText(c.front);
        back.setText(s.showBack || peek ? c.back : "");
        hint.setText(s.showBack || peek ? "" : "answer out loud  ·  tap to peek");
        for (int i = 0; i < 4; i++) {
            boolean sel = s.pending != null && s.pending == i;
            rates[i].setText(Ui.RATE_LABELS[i] + (sel ? " ✓" : ""));
            rates[i].setAlpha(s.pending == null || sel ? 1f : 0.4f);
        }
    }
}
