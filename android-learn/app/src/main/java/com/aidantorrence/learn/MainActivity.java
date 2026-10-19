package com.aidantorrence.learn;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Hosts the /learn web app from bundled assets. Serving through WebViewAssetLoader gives the page a
 * stable https origin, so localStorage (where progress lives) persists across launches.
 */
public class MainActivity extends Activity {
    private static final String START_URL = "https://appassets.androidplatform.net/assets/index.html";
    private static final int REQUEST_SAVE = 1;
    private static final int REQUEST_OPEN = 2;

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady;
    private boolean warnedMissingVoice;
    private String pendingSave;
    private ValueCallback<Uri[]> pendingOpen;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tts = new TextToSpeech(this, status -> ttsReady = status == TextToSpeech.SUCCESS);

        web = new WebView(this);
        web.setBackgroundColor(0xFF0C0C0C);
        // Keep content clear of the status / navigation bars and the keyboard (Android 15 is edge-to-edge).
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingOpen != null) pendingOpen.onReceiveValue(null);
                pendingOpen = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT)
                        .addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("*/*");
                startActivityForResult(intent, REQUEST_OPEN);
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "LearnNative");

        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
    }

    /** Called from JS as window.LearnNative. Methods run on a background thread. */
    private class Bridge {
        @JavascriptInterface
        public void speak(String text, String lang, float rate) {
            if (!ttsReady) return;
            int result = tts.setLanguage(Locale.forLanguageTag(lang));
            if ((result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) && !warnedMissingVoice) {
                warnedMissingVoice = true;
                runOnUiThread(() -> Toast.makeText(MainActivity.this,
                        "Install a Portuguese (Brazil) voice in Settings → Text-to-speech", Toast.LENGTH_LONG).show());
            }
            tts.setSpeechRate(rate);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "learn");
        }

        @JavascriptInterface
        public void saveFile(String name, String content) {
            runOnUiThread(() -> {
                pendingSave = content;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                        .addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/json")
                        .putExtra(Intent.EXTRA_TITLE, name);
                startActivityForResult(intent, REQUEST_SAVE);
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
        if (requestCode == REQUEST_OPEN && pendingOpen != null) {
            pendingOpen.onReceiveValue(uri == null ? null : new Uri[] {uri});
            pendingOpen = null;
        } else if (requestCode == REQUEST_SAVE && pendingSave != null) {
            if (uri != null) {
                try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                    out.write(pendingSave.getBytes(StandardCharsets.UTF_8));
                    Toast.makeText(this, "Progress exported", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(this, "Couldn’t save the file", Toast.LENGTH_LONG).show();
                }
            }
            pendingSave = null;
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        // The web app closes sub-screens itself; exit only from the overview.
        web.evaluateJavascript("window.learnBack ? window.learnBack() : false", result -> {
            if (!"true".equals(result)) finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
