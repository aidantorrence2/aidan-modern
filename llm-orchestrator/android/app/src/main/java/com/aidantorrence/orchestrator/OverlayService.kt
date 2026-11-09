package com.aidantorrence.orchestrator

import android.annotation.SuppressLint
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.os.SystemClock
import android.view.Gravity
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import com.aidantorrence.orchestrator.Ui.dp
import kotlin.math.abs

/**
 * Foreground service that keeps the always-on-top UI alive: a draggable bubble with an unread badge that
 * expands into the full PanelView. Also keeps the relay sync running while the app is in the background.
 */
class OverlayService : Service() {

    companion object {
        private const val NOTIF_ID = 1
        const val ACTION_STOP = "stop"
        const val ACTION_EXPAND = "expand"
        private const val REOPEN_GRACE_MS = 20_000L
        const val ACTION_DEBUG = "com.aidantorrence.orchestrator.DEBUG"

        fun start(ctx: Context, expand: Boolean = false) {
            if (!Settings.canDrawOverlays(ctx)) return
            val i = Intent(ctx, OverlayService::class.java).apply { if (expand) action = ACTION_EXPAND }
            ctx.startForegroundService(i)
        }

        fun stop(ctx: Context) {
            ctx.startService(Intent(ctx, OverlayService::class.java).setAction(ACTION_STOP))
        }

        @Volatile var running = false
            private set
    }

    private lateinit var wm: WindowManager
    private var bubble: FrameLayout? = null
    private var bubbleCore: TextView? = null
    private val bubbleBg by lazy { Ui.rounded(this, Ui.BG, 28, Ui.ACCENT) }
    private var badge: TextView? = null
    private var panelHost: FrameLayout? = null
    private lateinit var bubbleParams: WindowManager.LayoutParams
    private lateinit var panelParams: WindowManager.LayoutParams
    private val listener: () -> Unit = { updateBadge() }
    private var lastCollapse = 0L
    private var debugReceiver: android.content.BroadcastReceiver? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Hub.init(this)
        wm = getSystemService(WindowManager::class.java)
        startAsForeground()
        running = true
        Hub.startSync()
        addBubble()
        Store.addListener(listener)
        // A new completion opens the panel. If it is already open, the new card just appears in it.
        // Right after you close the panel it stays closed (the badge still counts the new card), so a burst
        // of completions can't pop it back open faster than you can close it.
        Hub.onNewCompletion = {
            if (panelHost == null && SystemClock.uptimeMillis() - lastCollapse > REOPEN_GRACE_MS) expand()
        }
        registerDebugReceiver()
        tickHandler.postDelayed(badgeTick, 30_000)
        updateBadge()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                Store.overlayEnabled = false
                stopSelf()
            }
            ACTION_EXPAND -> expand()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        Store.removeListener(listener)
        Hub.onNewCompletion = null
        tickHandler.removeCallbacks(badgeTick)
        debugReceiver?.let { runCatching { unregisterReceiver(it) } }
        bubble?.let { runCatching { wm.removeView(it) } }
        panelHost?.let { runCatching { wm.removeView(it) } }
        super.onDestroy()
    }

    private fun startAsForeground() {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE,
        )
        val stop = PendingIntent.getService(
            this, 1, Intent(this, OverlayService::class.java).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE,
        )
        val n = Notification.Builder(this, Hub.CHANNEL_SERVICE)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("Orchestrator is listening")
            .setContentText("Completions from your AI sessions will pop up here")
            .setContentIntent(open)
            .addAction(Notification.Action.Builder(null, "Hide bubble", stop).build())
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIF_ID, n)
        }
    }

    // ------------------------------------------------------------------ bubble

    @SuppressLint("ClickableViewAccessibility")
    private fun addBubble() {
        val size = dp(56)
        val b = FrameLayout(this)
        val core = TextView(this).apply {
            text = "◆"
            textSize = 22f
            setTextColor(Ui.ACCENT)
            gravity = Gravity.CENTER
            background = bubbleBg
            elevation = dp(6).toFloat()
        }
        bubbleCore = core
        b.addView(core, FrameLayout.LayoutParams(size, size))
        val bd = TextView(this).apply {
            textSize = 11f
            setTextColor(Ui.BG)
            gravity = Gravity.CENTER
            background = Ui.rounded(context, Ui.ACCENT, 10)
            setPadding(dp(5), 0, dp(5), 0)
            elevation = dp(8).toFloat()
        }
        b.addView(bd, FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, dp(20), Gravity.TOP or Gravity.END))
        badge = bd

        bubbleParams = WindowManager.LayoutParams(
            size + dp(8), size + dp(8),
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = resources.displayMetrics.widthPixels - size - dp(12)
            y = dp(180)
        }

        var downX = 0f; var downY = 0f; var startX = 0; var startY = 0; var moved = false
        b.setOnTouchListener { _, e ->
            when (e.action) {
                MotionEvent.ACTION_DOWN -> {
                    downX = e.rawX; downY = e.rawY; startX = bubbleParams.x; startY = bubbleParams.y; moved = false
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = e.rawX - downX; val dy = e.rawY - downY
                    if (abs(dx) > dp(6) || abs(dy) > dp(6)) moved = true
                    if (moved) {
                        bubbleParams.x = (startX + dx).toInt()
                        bubbleParams.y = (startY + dy).toInt()
                        runCatching { wm.updateViewLayout(b, bubbleParams) }
                    }
                }
                MotionEvent.ACTION_UP -> {
                    if (!moved) expand() else snapToEdge(b)
                }
            }
            true
        }
        try {
            wm.addView(b, bubbleParams)
            bubble = b
        } catch (e: Exception) {
            Hub.toast("Can't draw over other apps — grant the permission and try again")
            stopSelf()
        }
    }

    private fun snapToEdge(b: View) {
        val w = resources.displayMetrics.widthPixels
        bubbleParams.x = if (bubbleParams.x + b.width / 2 < w / 2) dp(4) else w - b.width - dp(4)
        val h = resources.displayMetrics.heightPixels
        bubbleParams.y = bubbleParams.y.coerceIn(dp(40), (h - b.height - dp(40)).coerceAtLeast(dp(40)))
        runCatching { wm.updateViewLayout(b, bubbleParams) }
    }

    private fun updateBadge() {
        val pending = Store.pending()
        val n = pending.size
        badge?.text = n.toString()
        badge?.visibility = if (n > 0) View.VISIBLE else View.GONE
        // Bubble blinks red if anything waits on you, else green while a "done" turn is under 5 minutes old.
        val colors = pending.mapNotNull { Blink.colorFor(it) }
        val color = if (Blink.RED in colors) Blink.RED else colors.firstOrNull()
        bubbleCore?.let { Blink.apply(it, bubbleBg, color, Ui.ACCENT, dp(3), dp(1)) }
    }

    private val tickHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private val badgeTick = object : Runnable {
        override fun run() { updateBadge(); tickHandler.postDelayed(this, 30_000) }
    }

    private fun pulse() {
        val b = bubble ?: return
        if (b.visibility != View.VISIBLE) return
        b.animate().scaleX(1.25f).scaleY(1.25f).setDuration(160).withEndAction {
            b.animate().scaleX(1f).scaleY(1f).setDuration(220).start()
        }.start()
    }

    // ------------------------------------------------------------------ panel

    /** Panel root: the back key / back gesture closes the panel instead of being swallowed by it. */
    private inner class PanelHost : FrameLayout(this@OverlayService) {
        override fun dispatchKeyEvent(event: KeyEvent): Boolean {
            if (event.keyCode == KeyEvent.KEYCODE_BACK || event.keyCode == KeyEvent.KEYCODE_ESCAPE) {
                if (event.action == KeyEvent.ACTION_UP && !event.isCanceled) collapse()
                return true
            }
            return super.dispatchKeyEvent(event)
        }
    }

    private fun expand() {
        if (panelHost != null) return
        val host = PanelHost()
        val panel = PanelView(this, onMinimize = { collapse() }, onWantsKeyboard = { setFocusable(it) })
        host.addView(panel, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        val (pw, ph) = panelSize()
        panelParams = WindowManager.LayoutParams(
            pw,
            ph,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = dp(40)
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        }
        // Tapping outside while typing gives the keyboard back to the app underneath.
        host.setOnTouchListener { _, e ->
            if (e.action == MotionEvent.ACTION_OUTSIDE) setFocusable(false)
            false
        }
        try {
            wm.addView(host, panelParams)
        } catch (e: Exception) {
            // Overlay permission reset (HyperOS does this on updates) or a bad window: keep the bubble.
            bubble?.visibility = View.VISIBLE
            return
        }
        panelHost = host
        bubble?.visibility = View.GONE
    }

    /** Always fits the screen as it is now: never wider than the screen, never taller than ~62% of it. */
    private fun panelSize(): Pair<Int, Int> {
        val b = wm.currentWindowMetrics.bounds
        val w = (b.width() - dp(16)).coerceAtMost(dp(520)).coerceAtLeast(dp(200))
        val h = (b.height() * 0.62f).toInt().coerceAtMost(b.height() - dp(120)).coerceAtLeast(dp(200))
        return w to h
    }

    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        // Rotation or screen-size change: resize the open panel and keep the bubble on screen.
        panelHost?.let { host ->
            val (pw, ph) = panelSize()
            panelParams.width = pw
            panelParams.height = ph
            runCatching { wm.updateViewLayout(host, panelParams) }
        }
        bubble?.let { b -> b.post { runCatching { snapToEdge(b) } } }
    }

    private fun setFocusable(focusable: Boolean) {
        val host = panelHost ?: return
        val f = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        val was = panelParams.flags and f == 0
        if (was == focusable) return
        panelParams.flags = if (focusable) panelParams.flags and f.inv() else panelParams.flags or f
        runCatching { wm.updateViewLayout(host, panelParams) }
        if (focusable) {
            host.post {
                val v = host.findFocus() ?: return@post
                getSystemService(android.view.inputmethod.InputMethodManager::class.java)
                    ?.showSoftInput(v, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT)
            }
        }
    }

    /** Always ends with the panel gone and the bubble showing, whatever state the panel window is in. */
    private fun collapse() {
        lastCollapse = SystemClock.uptimeMillis()
        val host = panelHost
        panelHost = null
        if (host != null) {
            runCatching {
                getSystemService(android.view.inputmethod.InputMethodManager::class.java)
                    ?.hideSoftInputFromWindow(host.windowToken, 0)
            }
            host.visibility = View.GONE
            if (runCatching { wm.removeViewImmediate(host) }.isFailure) runCatching { wm.removeView(host) }
        }
        val b = bubble
        if (b == null || !b.isAttachedToWindow) {
            b?.let { runCatching { wm.removeView(it) } }
            bubble = null
            addBubble()
        } else {
            b.visibility = View.VISIBLE
        }
        updateBadge()
    }

    // ------------------------------------------------------------------ debug hook (debug builds only)

    /**
     * adb shell am broadcast -a com.aidantorrence.orchestrator.DEBUG --es op <op> [--ei n <count>]
     *   inject  : add n local test cards (origin "test", never sent to the relay) and open the panel
     *   isolate : --ez on true|false, show only test cards (in memory, so real cards are left untouched)
     *   clear   : delete test cards and stop isolating
     *   expand / collapse
     */
    private fun registerDebugReceiver() {
        if (applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE == 0) return
        val r = object : android.content.BroadcastReceiver() {
            override fun onReceive(c: Context, i: Intent) {
                when (i.getStringExtra("op")) {
                    "inject" -> {
                        val n = i.getIntExtra("n", 3)
                        val now = System.currentTimeMillis()
                        repeat(n) { k ->
                            Store.items += InboxItem(
                                id = "test-${now.toString(36)}-$k", origin = "test", source = "claude-code",
                                sessionId = "test-$now-$k", title = "Test card ${k + 1}", text = "Injected test completion ${k + 1}",
                                ts = now - k, replyMode = "none", did = "Test card ${k + 1} of $n", needs = "Nothing — swipe me",
                            )
                        }
                        Store.changed()
                        if (panelHost == null) expand()
                    }
                    "isolate" -> { Store.debugIsolate = i.getBooleanExtra("on", true); Store.changed() }
                    "clear" -> { Store.items.removeAll { it.origin == "test" }; Store.debugIsolate = false; Store.changed() }
                    "expand" -> expand()
                    "collapse" -> collapse()
                }
            }
        }
        val f = android.content.IntentFilter(ACTION_DEBUG)
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(r, f, Context.RECEIVER_EXPORTED) else registerReceiver(r, f)
        debugReceiver = r
    }
}
