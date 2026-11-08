package com.aidan.flashcards;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.util.List;
import java.util.Locale;

/**
 * Audio mode. For each card: say the word, leave a gap to answer out loud (nothing is recorded),
 * say the English, repeat the word, move on. A card you don't rate counts as Good — you're testing yourself.
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
    boolean showBack, paused, finished, ttsReady;
    int done;
    String status = "";

    private TextToSpeech tts;
    private final Handler h = new Handler(Looper.getMainLooper());
    private PowerManager.WakeLock wake;
    private final Runnable reveal = () -> { showBack = true; update(); say(cur.back, Locale.US, "back"); };
    private final Runnable advance = this::next;

    // static + explicit constructor: avoids javac's MethodParameters on inner-class constructors, which d8 chokes on
    private static class Progress extends UtteranceProgressListener {
        private final AudioService s;
        Progress(AudioService s) { this.s = s; }
        @Override public void onStart(String u) {}
        @Override public void onError(String u) { s.h.post(() -> s.spoken(u)); }
        @Override public void onDone(String u) { s.h.post(() -> s.spoken(u)); }
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent i, int flags, int id) {
        if (i != null && STOP.equals(i.getAction())) { stopSelf(); return START_NOT_STICKY; }
        instance = this;
        startFg();
        if (i != null) {
            h.removeCallbacksAndMessages(null);
            deck = Deck.get(this, i.getStringExtra("lang"));
            queue = deck.buildQueue(i.getIntExtra("level", -1));
            cur = null; pending = null; done = 0; finished = false; paused = false; lastDone = -1;
        }
        if (wake == null) {
            wake = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "flashcards:audio");
            wake.acquire(3 * 60 * 60 * 1000L);
        }
        if (tts == null) {
            tts = new TextToSpeech(this, s -> {
                if (s != TextToSpeech.SUCCESS) { status = "Text-to-speech unavailable"; update(); return; }
                tts.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                int r = tts.setLanguage(deck.locale);
                if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED)
                    status = "Voice for " + deck.name + " not installed — Settings › Text-to-speech";
                tts.setOnUtteranceProgressListener(new Progress(this));
                ttsReady = true;
                next();
            });
        } else if (ttsReady) {
            tts.stop();
            next();
        }
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
        end(u);
        if (paused || cur == null) return;
        if ("front".equals(u)) h.postDelayed(reveal, 4000 + 60L * cur.front.length());
        else if ("back".equals(u)) say(cur.front, deck.locale, "again");
        else if ("again".equals(u)) h.postDelayed(advance, 1500);
    }

    private void end(String u) {
        if ("end".equals(u)) { stopForeground(STOP_FOREGROUND_REMOVE); stopSelf(); }
    }

    private void say(String s, Locale l, String id) {
        tts.setLanguage(l);
        tts.speak(s, TextToSpeech.QUEUE_FLUSH, null, id);
    }

    void next() {
        h.removeCallbacksAndMessages(null);
        if (cur != null) {
            deck.rateInSession(cur, pending != null ? pending : Deck.GOOD, queue);
            done++;
            cur = null;
        }
        if (queue.isEmpty()) {
            finished = true; update();
            say("Done", Locale.US, "end");
            return;
        }
        cur = queue.remove(0);
        pending = null; showBack = false;
        update();
        startFg(); // refresh notification text
        say(cur.front, deck.locale, "front");
    }

    void rate(int r) { if (cur != null) { pending = r; update(); } }

    void togglePause() {
        paused = !paused;
        h.removeCallbacksAndMessages(null);
        tts.stop();
        if (!paused && cur != null) { showBack = false; say(cur.front, deck.locale, "front"); }
        update();
    }

    private void update() { if (listener != null) listener.run(); }

    @Override public void onDestroy() {
        h.removeCallbacksAndMessages(null);
        if (tts != null) tts.shutdown();
        if (wake != null && wake.isHeld()) wake.release();
        instance = null;
        lastDone = done;
        update();
        super.onDestroy();
    }
}
