package com.aidan.flashcards;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** A language deck (cards in frequency order, phrases mixed in) plus its spaced-repetition state. */
public class Deck {
    public static final String[] LANGS = {"pt"};
    public static final int NEW_PER_SESSION = 20;
    static final long MIN = 60_000L, DAY = 86_400_000L;
    public static final int AGAIN = 0, HARD = 1, GOOD = 2, EASY = 3;

    public static class Card {
        public final String front, back;
        public final int level;
        Card(String f, String b, int l) { front = f; back = b; level = l; }
    }

    /** Scheduling state: no state = new card. */
    public static class State {
        long due; double ivl; double ease = 2.5; int reps;
    }

    private static final Map<String, Deck> CACHE = new HashMap<>();

    public final String code, name;
    public final Locale locale;
    public final List<String> levelNames = new ArrayList<>();
    public final List<Card> cards = new ArrayList<>();
    private final SharedPreferences prefs;
    private final Map<String, State> states = new HashMap<>();

    public static synchronized Deck get(Context c, String code) {
        Deck d = CACHE.get(code);
        if (d == null) { d = new Deck(c.getApplicationContext(), code); CACHE.put(code, d); }
        return d;
    }

    private Deck(Context c, String code) {
        this.code = code;
        String n = code; Locale loc = Locale.forLanguageTag(code);
        try {
            InputStream in = c.getAssets().open(code + ".json");
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[16384]; int r;
            while ((r = in.read(buf)) > 0) bo.write(buf, 0, r);
            in.close();
            JSONObject o = new JSONObject(bo.toString("UTF-8"));
            n = o.getString("name");
            loc = Locale.forLanguageTag(o.getString("lang"));
            JSONArray levels = o.getJSONArray("levels");
            for (int li = 0; li < levels.length(); li++) {
                JSONObject lv = levels.getJSONObject(li);
                levelNames.add(lv.getString("name"));
                JSONArray w = lv.getJSONArray("words");
                JSONArray p = lv.optJSONArray("phrases");
                int np = p == null ? 0 : p.length();
                int step = np == 0 ? Integer.MAX_VALUE : Math.max(1, w.length() / np);
                int pi = 0;
                for (int wi = 0; wi < w.length(); wi++) {
                    add(w.getJSONArray(wi), li);
                    if ((wi + 1) % step == 0 && pi < np) add(p.getJSONArray(pi++), li);
                }
                while (pi < np) add(p.getJSONArray(pi++), li);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load deck " + code, e);
        }
        name = n; locale = loc;
        prefs = c.getSharedPreferences("srs_" + code, 0);
        for (Map.Entry<String, ?> e : prefs.getAll().entrySet()) {
            String[] s = String.valueOf(e.getValue()).split("\\|");
            if (s.length < 4) continue;
            State st = new State();
            st.due = Long.parseLong(s[0]); st.ivl = Double.parseDouble(s[1]);
            st.ease = Double.parseDouble(s[2]); st.reps = Integer.parseInt(s[3]);
            states.put(e.getKey(), st);
        }
    }

    private void add(JSONArray pair, int level) throws Exception {
        cards.add(new Card(pair.getString(0), pair.getString(1), level));
    }

    public State state(Card c) { return states.get(c.front); }

    /** Anki-style scheduling (SM-2 variant). */
    static State next(State s, int r, long now) {
        State n = new State();
        if (s != null) { n.ivl = s.ivl; n.ease = s.ease; n.reps = s.reps; }
        if (n.reps == 0) {             // new / learning
            switch (r) {
                case AGAIN: n.ivl = 0; n.due = now + MIN; break;
                case HARD:  n.ivl = 0; n.due = now + 6 * MIN; break;
                case GOOD:  n.ivl = 1; n.reps = 1; n.due = now + DAY; break;
                default:    n.ivl = 4; n.reps = 1; n.due = now + 4 * DAY; break;
            }
            return n;
        }
        switch (r) {                    // review
            case AGAIN: n.ease -= 0.2; n.ivl = 0; n.reps = 0; n.due = now + 10 * MIN; return clamp(n);
            case HARD:  n.ease -= 0.15; n.ivl = Math.max(1, n.ivl * 1.2); break;
            case GOOD:  n.ivl = Math.max(n.ivl + 1, n.ivl * n.ease); break;
            default:    n.ease += 0.15; n.ivl = Math.max(n.ivl + 1, n.ivl * n.ease * 1.3); break;
        }
        n.reps++;
        n.due = now + (long) (n.ivl * DAY);
        return clamp(n);
    }

    private static State clamp(State n) { if (n.ease < 1.3) n.ease = 1.3; return n; }

    public State rate(Card c, int r) {
        State n = next(state(c), r, System.currentTimeMillis());
        states.put(c.front, n);
        prefs.edit().putString(c.front, n.due + "|" + n.ivl + "|" + n.ease + "|" + n.reps).apply();
        return n;
    }

    /** Label like "1m", "10m", "3d" for the button preview. */
    public String preview(Card c, int r) {
        long now = System.currentTimeMillis();
        long ms = next(state(c), r, now).due - now;
        if (ms < 60 * MIN) return Math.max(1, Math.round(ms / (double) MIN)) + "m";
        if (ms < DAY) return Math.round(ms / (60.0 * MIN)) + "h";
        double d = ms / (double) DAY;
        if (d < 30) return Math.round(d) + "d";
        if (d < 365) return Math.round(d / 30) + "mo";
        return String.format(Locale.US, "%.1fy", d / 365);
    }

    public boolean known(Card c) { State s = state(c); return s != null && s.ivl >= 21; }

    public int dueCount(int level) {
        long now = System.currentTimeMillis(); int n = 0;
        for (Card c : cards) {
            if (level >= 0 && c.level != level) continue;
            State s = state(c); if (s != null && s.due <= now) n++;
        }
        return n;
    }

    /** Session queue: due reviews (oldest first), then the next new cards in frequency order. */
    public List<Card> buildQueue(int level) { return buildQueue(level, java.util.Collections.<Card>emptySet()); }

    /** Same, skipping cards in {@code skip} (cards already played this audio session). */
    public List<Card> buildQueue(int level, java.util.Set<Card> skip) {
        long now = System.currentTimeMillis();
        List<Card> due = new ArrayList<>(), fresh = new ArrayList<>();
        for (Card c : cards) {
            if (level >= 0 && c.level != level || skip.contains(c)) continue;
            State s = state(c);
            if (s == null) { if (fresh.size() < NEW_PER_SESSION) fresh.add(c); }
            else if (s.due <= now) due.add(c);
        }
        Collections.sort(due, (a, b) -> Long.compare(state(a).due, state(b).due));
        due.addAll(fresh);
        return due;
    }

    /** Rate the card and, if it's due again soon (Again / Hard on a new card), put it back in the queue. */
    public void rateInSession(Card c, int r, List<Card> queue) {
        State n = rate(c, r);
        if (n.due - System.currentTimeMillis() < 20 * MIN) {
            int pos = Math.min(queue.size(), r == AGAIN ? 3 : 6);
            queue.add(pos, c);
        }
    }

    public static String prefLang(Context c) {
        return c.getSharedPreferences("app", 0).getString("lang", "pt");
    }
}
