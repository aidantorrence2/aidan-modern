package com.aidan.flashcards;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.List;

/** Text mode: see the word, try to recall, tap to flip, rate. */
public class StudyActivity extends Activity {
    private Deck deck;
    private List<Deck.Card> queue;
    private Deck.Card cur;
    private boolean flipped;
    private TextView front, back, hint, counter;
    private LinearLayout rateRow;
    private Button[] rates;
    private Voice voice;
    private int done, level;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Ui.window(this);
        deck = Deck.get(this, getIntent().getStringExtra("lang"));
        level = getIntent().getIntExtra("level", -1);
        queue = deck.buildQueue(level);
        voice = new Voice(this, deck.locale);

        LinearLayout col = Ui.column(this);
        counter = Ui.text(this, "", 13, Ui.MUTED, false);
        col.addView(counter);
        front = Ui.text(this, "", 40, 0xFFFFFFFF, true);
        back = Ui.text(this, "", 24, 0xFFDDDDDD, false);
        hint = Ui.text(this, "tap to flip", 13, Ui.MUTED, false);
        LinearLayout card = Ui.card(this, front, hint, back);
        card.setOnClickListener(v -> flip());
        LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1);
        cp.setMargins(0, Ui.dp(this, 12), 0, Ui.dp(this, 12));
        col.addView(card, cp);
        rateRow = new LinearLayout(this);
        rateRow.setOrientation(LinearLayout.VERTICAL);
        rates = Ui.rateRow(this, rateRow, this::rate);
        LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 72));
        col.addView(rateRow, rp);
        setContentView(col);
        show();
    }

    private void show() {
        if (queue.isEmpty()) queue.addAll(deck.buildQueue(level));   // keep going: next due + new cards
        if (queue.isEmpty()) {
            counter.setText(done + " cards reviewed");
            front.setText("Done for now");
            back.setText("You've been through every card in this set.");
            hint.setText("");
            rateRow.setVisibility(View.INVISIBLE);
            return;
        }
        cur = queue.remove(0);
        flipped = false;
        counter.setText(done + " done" + (deck.state(cur) == null ? "  ·  new" : ""));
        front.setText(cur.front);
        back.setText("");
        hint.setText("tap to flip");
        rateRow.setVisibility(View.INVISIBLE);
    }

    private void flip() {
        if (cur == null || queue == null) return;
        if (flipped) { speak(); return; }
        flipped = true;
        back.setText(cur.back);
        hint.setText("");
        for (int i = 0; i < 4; i++) rates[i].setText(Ui.RATE_LABELS[i] + "\n" + deck.preview(cur, i));
        rateRow.setVisibility(View.VISIBLE);
        speak();
    }

    private void speak() { voice.say(cur.front, false, null); }

    private void rate(int r) {
        if (!flipped) return;
        deck.rateInSession(cur, r, queue);
        done++;
        cur = null;
        show();
    }

    @Override protected void onDestroy() { voice.shutdown(); super.onDestroy(); }
}
