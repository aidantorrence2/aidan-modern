package com.aidan.flashcards;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import java.util.List;

/**
 * Audio mode. For each card: say the word, leave a gap to answer out loud (nothing is recorded),
 * say the English, move on. A card you don't rate is left exactly as it was — only taps are recorded.
 * Tapping a rating while it plays just changes how that card is scheduled; it never pauses playback.
 */
public class AudioService extends Service {
    static final String STOP = "stop";
    static AudioService instance;
    static Runnable listener;   // UI refresh callback (main thread)
    static int lastDone = -1;   // cards played in the last finished session

    Deck deck;
    List<Deck.Card> queue;
    Deck.Card cur;
    Integer pending;            // rating tapped for the current card
    boolean showBack, paused, finished;
    private boolean backDone;   // English for the current card has finished playing
    int done, level = -1;
    private final java.util.Set<Deck.Card> played = new java.util.HashSet<>();   // this session; not repeated on refill
    String status = "";

    private Voice voice;
    private final Handler h = new Handler(Looper.getMainLooper());
    private PowerManager.WakeLock wake;
    private final Runnable reveal = () -> { showBack = true; update(); say(cur.back, true, "back"); };
    private final Runnable advance = this::next;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent i, int flags, int id) {
        if (i != null && STOP.equals(i.getAction())) { stopSelf(); return START_NOT_STICKY; }
        instance = this;
        startFg();
        if (i != null) {
            h.removeCallbacksAndMessages(null);
            deck = Deck.get(this, i.getStringExtra("lang"));
            level = i.getIntExtra("level", -1);
            played.clear();
            queue = deck.buildQueue(level);
            cur = null; pending = null; done = 0; finished = false; paused = false; lastDone = -1;
        }
        if (wake == null) {
            wake = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "flashcards:audio");
            wake.acquire(3 * 60 * 60 * 1000L);
        }
        if (voice == null) voice = new Voice(this, deck.locale);
        next();
        return START_NOT_STICKY;
    }

    private void startFg() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel("audio", "Audio mode", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0,
                new Intent(this, AudioActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1,
                new Intent(this, AudioService.class).setAction(STOP), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(this, "audio")
                .setSmallIcon(android.R.drawable.ic_lock_silent_mode_off)
                .setContentTitle("Ouvido — audio")
                .setContentText(cur == null ? "Playing" : cur.front)
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder(null, "Stop", stop).build())
                .setOngoing(true).build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(7, n);
    }

    private void spoken(String u) {
        if (paused || cur == null) return;
        if ("front".equals(u)) h.postDelayed(reveal, 4000 + 60L * cur.front.length());
        else if ("back".equals(u)) { backDone = true; h.postDelayed(advance, pending != null ? 400 : 1500); }
    }

    private void say(String text, boolean en, String step) { voice.say(text, en, () -> spoken(step)); }

    void next() {
        h.removeCallbacksAndMessages(null);
        if (cur != null) {
            if (pending != null) deck.rateInSession(cur, pending, queue);
            played.add(cur);
            done++;
            cur = null;
        }
        if (queue.isEmpty()) queue.addAll(deck.buildQueue(level, played));   // keep going: next due + new cards
        if (queue.isEmpty()) {
            finished = true; update();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return;
        }
        cur = queue.remove(0);
        pending = null; showBack = false; backDone = false;
        update();
        startFg(); // refresh notification text
        say(cur.front, false, "front");
    }

    /** Tapping a rating: play the answer now (if it hasn't played yet), then go straight to the next card. */
    void rate(int r) {
        if (cur == null) return;
        boolean again = pending != null;
        pending = r;
        update();
        if (paused || again && !backDone) return;   // already heading to the answer; just update the rating
        h.removeCallbacksAndMessages(null);
        if (backDone) next();
        else if (!showBack) reveal.run();            // interrupts the word / answer gap
        // else: English is playing now; spoken("back") advances right after it
    }

    void togglePause() {
        paused = !paused;
        h.removeCallbacksAndMessages(null);
        voice.stop();
        if (!paused && cur != null) { showBack = false; backDone = false; say(cur.front, false, "front"); }
        update();
    }

    private void update() { if (listener != null) listener.run(); }

    @Override public void onDestroy() {
        h.removeCallbacksAndMessages(null);
        if (voice != null) voice.shutdown();
        if (wake != null && wake.isHeld()) wake.release();
        instance = null;
        lastDone = done;
        update();
        super.onDestroy();
    }
}
