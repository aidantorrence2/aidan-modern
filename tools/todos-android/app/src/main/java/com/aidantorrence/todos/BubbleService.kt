package com.aidantorrence.todos

import android.animation.ValueAnimator
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import java.util.concurrent.Executors
import kotlin.math.abs

/**
 * Draws the always-on-top bubble over every app (SYSTEM_ALERT_WINDOW), expands it into the game
 * panel on tap, and keeps today's list synced from GitHub (every 15 min, on screen-on, on expand).
 */
class BubbleService : Service() {
    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private lateinit var wm: WindowManager
    private var bubble: BubbleView? = null
    private var bubbleParams: WindowManager.LayoutParams? = null
    private var panel: GamePanel? = null
    private var panelShown = false
    private var panelWindow: View? = null
    private var outsideHideAt = 0L   // when a tap outside last collapsed the panel
    private val listener: () -> Unit = { refreshViews() }
    private val tick = object : Runnable {
        override fun run() { sync(); main.postDelayed(this, POLL_MS) }
    }
    private val dueTick = Runnable {
        refreshViews()
        bubble?.animate()?.scaleX(1.25f)?.scaleY(1.25f)?.setDuration(160)?.withEndAction {
            bubble?.animate()?.scaleX(1f)?.scaleY(1f)?.setDuration(160)?.start()
        }?.start()
    }
    private val screenOn = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { refreshViews(); sync() }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Game.init(this)
        wm = getSystemService(WindowManager::class.java)
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CH, "Bubble", NotificationManager.IMPORTANCE_MIN).apply { setShowBadge(false) })
        startForeground(1, notification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        Game.addListener(listener)
        registerReceiver(screenOn, IntentFilter(Intent.ACTION_SCREEN_ON))
        showBubble()
        main.post(tick)
    }

    override fun onDestroy() {
        Game.removeListener(listener)
        main.removeCallbacksAndMessages(null)
        try { unregisterReceiver(screenOn) } catch (_: Exception) {}
        hidePanel(); bubble?.let { try { wm.removeView(it) } catch (_: Exception) {} }
        super.onDestroy()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SYNC -> sync()
            ACTION_EXPAND -> { showBubble(); showPanel() }
            ACTION_HIDE -> { hidePanel(); bubble?.visibility = View.GONE }
            else -> { showBubble(); bubble?.visibility = View.VISIBLE }
        }
        return START_STICKY
    }

    // ---------- bubble ----------

    private fun overlayType() = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY

    private fun showBubble() {
        if (bubble != null || !Settings.canDrawOverlays(this)) return
        val prefs = getSharedPreferences("bubble", MODE_PRIVATE)
        val p = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT, overlayType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = prefs.getInt("x", screenW() - Ui.dp(this@BubbleService, 64))
            y = prefs.getInt("y", Ui.dp(this@BubbleService, 220))
        }
        val v = BubbleView(this)
        v.setOnTouchListener(DragListener(p))
        wm.addView(v, p)
        bubble = v; bubbleParams = p
        refreshViews()
    }

    private inner class DragListener(private val p: WindowManager.LayoutParams) : View.OnTouchListener {
        private val slop = ViewConfiguration.get(this@BubbleService).scaledTouchSlop
        private var downX = 0f; private var downY = 0f; private var startX = 0; private var startY = 0; private var moved = false

        override fun onTouch(v: View, e: MotionEvent): Boolean {
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN -> { downX = e.rawX; downY = e.rawY; startX = p.x; startY = p.y; moved = false; v.animate().scaleX(0.9f).scaleY(0.9f).setDuration(80).start() }
                MotionEvent.ACTION_MOVE -> {
                    val dx = e.rawX - downX; val dy = e.rawY - downY
                    if (!moved && (abs(dx) > slop || abs(dy) > slop)) moved = true
                    if (moved) { p.x = startX + dx.toInt(); p.y = startY + dy.toInt(); wm.updateViewLayout(v, p) }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(80).start()
                    if (!moved) {
                        val justClosed = android.os.SystemClock.uptimeMillis() - outsideHideAt < 600
                        if (panelShown) hidePanel() else if (!justClosed) showPanel()
                    } else snap(v)
                }
            }
            return true
        }

        /** Glide to the nearest screen edge, like a chat head. */
        private fun snap(v: View) {
            val target = if (p.x + v.width / 2 < screenW() / 2) Ui.dp(this@BubbleService, 6) else screenW() - v.width - Ui.dp(this@BubbleService, 6)
            p.y = p.y.coerceIn(Ui.dp(this@BubbleService, 24), screenH() - v.height - Ui.dp(this@BubbleService, 48))
            ValueAnimator.ofInt(p.x, target).apply {
                duration = 220; interpolator = DecelerateInterpolator()
                addUpdateListener { p.x = it.animatedValue as Int; try { wm.updateViewLayout(v, p) } catch (_: Exception) {} }
                start()
            }
            getSharedPreferences("bubble", MODE_PRIVATE).edit().putInt("x", target).putInt("y", p.y).apply()
        }
    }

    // ---------- panel ----------

    private fun showPanel() {
        if (panelShown || !Settings.canDrawOverlays(this)) return
        val gp = panel ?: GamePanel(this, onCollapse = { hidePanel() }, onRefresh = { sync() }).also { panel = it }
        val p = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT, overlayType(),
            // Not focusable (never steals the keyboard), outside touches go to the app below and also
            // reach us as ACTION_OUTSIDE so a tap elsewhere collapses the panel.
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP
            val bp = bubbleParams
            // Open below the bubble when it sits high on screen, above it when it sits low.
            y = if (bp == null || bp.y < screenH() / 2) (bp?.y ?: 0) + Ui.dp(this@BubbleService, 64) else (bp.y - Ui.dp(this@BubbleService, 470)).coerceAtLeast(Ui.dp(this@BubbleService, 24))
            windowAnimations = android.R.style.Animation_Dialog
        }
        // Detach the deck from the previous window's wrapper before putting it in a new one.
        (gp.root.parent as? android.view.ViewGroup)?.removeView(gp.root)
        val wrap = android.widget.FrameLayout(this).apply {
            setPadding(Ui.dp(context, 10), 0, Ui.dp(context, 10), 0)
            addView(gp.root, android.widget.FrameLayout.LayoutParams(-1, -2))
            setOnTouchListener { _, e ->
                if (e.actionMasked == MotionEvent.ACTION_OUTSIDE) { outsideHideAt = android.os.SystemClock.uptimeMillis(); hidePanel(); true } else false
            }
        }
        gp.render()
        try { wm.addView(wrap, p) } catch (e: Exception) { Game.lastError = "Couldn't open the deck: ${e.message}"; return }
        panelWindow = wrap
        panelShown = true
        sync()
    }

    private fun hidePanel() {
        if (!panelShown) return
        panelWindow?.let { try { wm.removeView(it) } catch (_: Exception) {} }
        panelWindow = null
        panelShown = false
    }

    private fun refreshViews() {
        val list = Game.list
        val (new, due, away) = Game.counts()
        bubble?.set(new + due, away, Game.total, list == null)
        if (panelShown) panel?.render()
        // Wake up when the next waiting card comes back, so the bubble's count rises on time.
        main.removeCallbacks(dueTick)
        Game.nextDue()?.let { main.postDelayed(dueTick, (it - System.currentTimeMillis() + 500).coerceAtLeast(500)) }
    }

    // ---------- sync ----------

    private fun sync() {
        io.execute {
            try {
                // No token needed to read. A token (only install-phone.sh provides one) adds done-sync.
                val token = Secrets.token(this)
                val gh = GitHub(token)
                val json = gh.getPublic(TODOS_PATH)
                if (json != null && Game.isNewer(json)) main.post { Game.setList(json, null) }
                if (token != null && Game.stateDirty) writeState(gh)
                main.post { Game.lastError = null; Game.lastSync = System.currentTimeMillis(); Game.changed() }
            } catch (e: Exception) {
                val msg = when (e) {
                    is GitHubException -> if (e.code == 401) "GitHub rejected the token" else "Couldn't refresh · showing the saved list"
                    is java.io.IOException -> "Offline · showing the saved list"
                    else -> e.message
                }
                main.post { Game.lastError = msg; Game.changed() }
            }
        }
    }

    /** data/todos-state.json = {date, done[], updated}: tells tomorrow's build what you finished. */
    private fun writeState(gh: GitHub) {
        val list = Game.list ?: return
        repeat(3) {
            val (_, sha) = gh.get(STATE_PATH)
            val body = JV.Obj(mutableListOf(
                "date" to JV.Str(list.date),
                "done" to JV.Arr(Game.done.sorted().map { JV.Str(it) as JV }.toMutableList()),
                "updated" to JV.Str(Game.isoNow()),
            )).serialize() + "\n"
            if (gh.put(STATE_PATH, body, sha, "Todos ${list.date}: ${Game.done.size}/${list.items.size} done")) { Game.stateWritten(); return }
        }
    }

    // ---------- misc ----------

    private fun notification(): Notification {
        val open = PendingIntent.getService(this, 1, Intent(this, BubbleService::class.java).setAction(ACTION_EXPAND), PendingIntent.FLAG_IMMUTABLE)
        return Notification.Builder(this, CH)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("Today's to-dos")
            .setContentText("Tap to open the deck")
            .setContentIntent(open)
            .setOngoing(true)
            .build()
    }

    private fun screenW() = resources.displayMetrics.widthPixels
    private fun screenH() = resources.displayMetrics.heightPixels

    companion object {
        const val CH = "bubble"
        const val POLL_MS = 15 * 60_000L
        const val ACTION_SYNC = "sync"
        const val ACTION_EXPAND = "expand"
        const val ACTION_HIDE = "hide"

        fun start(ctx: Context, action: String? = null) {
            ctx.startForegroundService(Intent(ctx, BubbleService::class.java).setAction(action))
        }
    }
}
