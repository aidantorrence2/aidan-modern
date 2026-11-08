package com.aidan.flashcards;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;

/**
 * Plays the bundled neural-voice clips (pt-BR-AntonioNeural / en-US-AndrewNeural, made by gen_audio.py).
 * Falls back to the phone's text-to-speech only if a clip is missing.
 */
final class Voice {
    private static final AudioAttributes ATTRS = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build();

    private final Context ctx;
    private final Locale pt;
    private final Handler h = new Handler(Looper.getMainLooper());
    private TextToSpeech tts;
    private boolean ttsReady;
    private MediaPlayer mp;
    private int token;            // invalidates callbacks from playback that was stopped
    private Runnable ttsDone;

    Voice(Context c, Locale pt) {
        this.ctx = c.getApplicationContext();
        this.pt = pt;
    }

    /** Speak a card's Portuguese (en=false) or English (en=true); onDone runs on the main thread (may be null). */
    void say(String text, boolean en, Runnable onDone) {
        stop();
        final int t = ++token;
        Runnable done = () -> { if (t == token && onDone != null) onDone.run(); };
        try {
            AssetFileDescriptor fd = ctx.getAssets().openFd("audio/" + (en ? "e_" : "p_") + key(text) + ".mp3");
            MediaPlayer p = new MediaPlayer();
            p.setAudioAttributes(ATTRS);
            p.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
            fd.close();
            p.setOnCompletionListener(x -> { release(x); done.run(); });
            p.setOnErrorListener((x, w, e) -> { release(x); done.run(); return true; });
            p.prepare();
            p.start();
            mp = p;
            return;
        } catch (Exception ignored) {
            // no clip for this text: fall back to TTS
        }
        fallback(en ? spokenEn(text) : text, en ? Locale.US : pt, done);
    }

    private void fallback(String text, Locale l, Runnable done) {
        if (tts == null) {
            tts = new TextToSpeech(ctx, s -> {
                if (s != TextToSpeech.SUCCESS) return;
                tts.setAudioAttributes(ATTRS);
                tts.setOnUtteranceProgressListener(new Progress(this));
                ttsReady = true;
            });
        }
        if (!ttsReady) { h.postDelayed(done, 1200); return; }
        ttsDone = done;
        tts.setLanguage(l);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "u");
    }

    void stop() {
        token++;
        h.removeCallbacksAndMessages(null);
        if (mp != null) { release(mp); }
        if (tts != null && ttsReady) tts.stop();
    }

    void shutdown() {
        stop();
        if (tts != null) tts.shutdown();
        tts = null;
    }

    private void release(MediaPlayer p) {
        try { p.release(); } catch (Exception ignored) {}
        if (p == mp) mp = null;
    }

    // static nested class: avoids javac MethodParameters on inner-class constructors, which d8 chokes on
    private static final class Progress extends UtteranceProgressListener {
        private final Voice v;
        Progress(Voice v) { this.v = v; }
        @Override public void onStart(String u) {}
        @Override public void onDone(String u) { v.h.post(v::ttsFinished); }
        @Override public void onError(String u) { v.h.post(v::ttsFinished); }
    }

    private void ttsFinished() { Runnable r = ttsDone; ttsDone = null; if (r != null) r.run(); }

    /** Must match gen_audio.py: sha1(text)[:16]. */
    static String key(String s) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-1").digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder b = new StringBuilder();
            for (int i = 0; i < 8; i++) b.append(String.format("%02x", d[i] & 0xff));
            return b.toString();
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    /** Same cleanup as gen_audio.py: drop "(f.)"-style notes, read "/" as "or". */
    static String spokenEn(String s) {
        String r = s.replaceAll("\\([^)]*\\)", "").replaceAll("\\s*/\\s*", ", or ").replaceAll("\\s+", " ").trim();
        r = r.replaceAll("^[ ,]+|[ ,]+$", "");
        return r.isEmpty() ? s : r;
    }
}
