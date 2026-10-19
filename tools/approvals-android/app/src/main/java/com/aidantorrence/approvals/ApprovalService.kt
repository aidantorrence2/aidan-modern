package com.aidantorrence.approvals

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
import android.graphics.drawable.Icon
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.widget.Toast
import java.util.concurrent.Executors

/**
 * Keeps the inbox live: polls the GitHub queue every minute (and on screen-on), keeps one ongoing
 * notification per waiting item with Approve / Deny right in it (a heads-up banner the first time,
 * silently re-posted until decided), and writes decisions back (kept on the phone and retried until
 * GitHub accepts them).
 */
class ApprovalService : Service(), Ui.CardActions {
    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private lateinit var nm: NotificationManager
    private val listener: () -> Unit = { render() }
    private val pollTick = object : Runnable {
        // Every 15 s while a request is waiting (so a Mac decision clears the phone fast), else 60 s.
        override fun run() { pollNow(); main.postDelayed(this, if (Store.visible().isEmpty()) POLL_MS else POLL_FAST_MS) }
    }
    private val screenOn = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { pollNow() }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Store.init(this)
        nm = getSystemService(NotificationManager::class.java)
        nm.deleteNotificationChannel("requests")   // pre-heads-up channel (importance can't be raised in place)
        nm.createNotificationChannel(NotificationChannel(CH_ITEMS, "Approval requests", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Drops down when a request arrives; Approve or Deny right in the notification"
            lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        })
        nm.createNotificationChannel(NotificationChannel(CH_QUIET, "Approval requests (reminders)", NotificationManager.IMPORTANCE_LOW).apply {
            description = "Silent re-posts of requests you were already alerted about"
        })
        nm.createNotificationChannel(NotificationChannel(CH_SERVICE, "Inbox status", NotificationManager.IMPORTANCE_MIN).apply {
            setShowBadge(false)
        })
        startForeground(ID_SERVICE, serviceNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        Store.addListener(listener)
        registerReceiver(screenOn, IntentFilter(Intent.ACTION_SCREEN_ON))
        main.post(pollTick)
    }

    override fun onDestroy() {
        Store.removeListener(listener)
        main.removeCallbacksAndMessages(null)
        try { unregisterReceiver(screenOn) } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val id = intent?.getStringExtra(EXTRA_ID)
        when (intent?.action) {
            ACTION_APPROVE -> Store.item(id ?: "")?.let { approve(it) }
            ACTION_DENY -> Store.item(id ?: "")?.let { deny(it) }
            ACTION_SNOOZE -> Store.item(id ?: "")?.let { snooze(it) }
            ACTION_DECIDE -> if (id != null) decide(id, intent.getStringExtra(EXTRA_STATUS) ?: return START_STICKY, intent.getStringExtra(EXTRA_NOTE) ?: "")
            ACTION_POLL -> pollNow()
            ACTION_SWIPED -> if (id != null) Store.swiped = Store.swiped + id
        }
        return START_STICKY
    }

    // ---------------- polling ----------------

    private fun pollNow() = io.execute {
        val pm = getSystemService(PowerManager::class.java)
        val wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "approvals:poll").apply { acquire(30_000) }
        try {
            val token = TokenStore.load(this)
            if (token == null) { Store.lastError = "No GitHub token yet: run install-phone.sh on the Mac"; Store.changed(); return@execute }
            val client = QueueClient(token)
            flush(client)
            val (root, _) = client.fetch()
            val list = (root["items"] as? JV.Arr)?.items?.mapNotNull { Item.from(it) } ?: emptyList()
            // fetch images first so the banner can show the picture the moment it drops down
            list.filter { it.pending }.forEach { item -> Presentation(item).images.firstOrNull()?.let { Images.loadBlocking(it.second, IMG_PX) } }
            android.util.Log.i("Approvals", "poll: ${list.size} items, pending=${list.count { it.status == "pending" }}, " +
                "open=${list.count { it.pending }}: " + list.filter { it.status == "pending" }.joinToString { "${it.id} exp=${it.expires} now=${System.currentTimeMillis()}" })
            main.post { Store.lastError = null; Store.setItems(list) }
        } catch (e: Exception) {
            android.util.Log.w("Approvals", "poll failed", e)
            Store.lastError = e.message ?: e.toString(); Store.changed()
        } finally { if (wl.isHeld) wl.release() }
    }

    /** Writes decisions made on this phone; on failure they stay queued for the next poll. */
    private fun flush(client: QueueClient): DecideResult? {
        val pending = Store.pendingDecisions
        if (pending.isEmpty()) return null
        val res = client.decide(pending)
        val now = Store.pendingDecisions
        Store.pendingDecisions = now - pending.keys
        return res
    }

    // ---------------- decisions ----------------

    override fun approve(item: Item) = decide(item.id, "approved", "")
    override fun deny(item: Item) = decide(item.id, "denied", "")
    override fun snooze(item: Item) {
        Store.snooze(item.id); nm.cancel(notifId(item.id)); render()
        Toast.makeText(this, "Snoozed for 4 hours", Toast.LENGTH_SHORT).show()
    }
    override fun close(item: Item) {}
    override fun review(item: Item) {
        startActivity(Intent(this, ReviewActivity::class.java).putExtra(EXTRA_ID, item.id)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP))
    }

    fun decide(id: String, status: String, note: String) {
        Store.pendingDecisions = Store.pendingDecisions + (id to Decision(status, Iso.now(), note))
        render()   // moves the foreground notification off this item first, so the cancel below sticks
        nm.cancel(notifId(id))
        io.execute {
            try {
                val token = TokenStore.load(this) ?: throw IllegalStateException("no token")
                val res = flush(QueueClient(token))
                main.post {
                    res?.message?.let { Toast.makeText(this, "✓ $it", Toast.LENGTH_SHORT).show() }
                    res?.already?.forEach { (_, st) -> Toast.makeText(this, "Already $st elsewhere; left as is", Toast.LENGTH_LONG).show() }
                }
                pollNow()
            } catch (e: Exception) {
                Store.lastError = e.message
                main.post { Toast.makeText(this, "Saved on the phone; will retry: ${e.message}", Toast.LENGTH_LONG).show() }
            }
        }
    }

    // ---------------- rendering ----------------

    /**
     * One notification per waiting request. The oldest request IS the service's foreground
     * notification, so there is no separate "inbox" line pushing it down (HyperOS collapsed the
     * request under it). With nothing waiting, the quiet status notification takes that slot.
     */
    private fun render() {
        val visible = Store.visible()
        val first = visible.firstOrNull()
        if (first != null) {
            startForeground(notifId(first.id), buildItem(first), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            nm.cancel(ID_SERVICE)
        } else {
            startForeground(ID_SERVICE, serviceNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        }
        val keep = visible.map { notifId(it.id) }.toSet()
        nm.activeNotifications.filter { it.id != ID_SERVICE && it.id !in keep }.forEach { nm.cancel(it.id) }
        for (item in visible.drop(1)) postItem(item)
        val chimed = Store.chimed
        if (visible.any { it.id !in chimed }) Store.chimed = chimed + visible.map { it.id }
    }

    private fun postItem(item: Item) { nm.notify(notifId(item.id), buildItem(item)) }

    private fun buildItem(item: Item): Notification {
        val pres = Presentation(item)
        val body = pres.cardText(item)
        // Alerting channel (heads-up the first time; updates don't re-alert thanks to onlyAlertOnce),
        // unless you swiped it away: then it comes back quietly instead of buzzing every minute.
        val b = Notification.Builder(this, if (item.id in Store.swiped) CH_QUIET else CH_ITEMS)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(pres.headline)
            .setContentText(pres.displayTitle)
            .setSubText(Presentation.agentName(item.source))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(Notification.CATEGORY_REMINDER)
            .setColor(Presentation.kindColor(item.kind))
            .setContentIntent(activity(item.id))
            // Own group per request: stops Android bundling it with the status notification, which hides the buttons.
            .setGroup("item:${item.id}")
            .setDeleteIntent(service(ACTION_SWIPED, item.id))
            .addAction(action("Approve", ACTION_APPROVE, item.id))
            .addAction(action("Deny", ACTION_DENY, item.id))
            .addAction(Notification.Action.Builder(null, "Later (4h)", service(ACTION_SNOOZE, item.id)).build())
        val img = pres.images.firstOrNull()?.second?.let { Images.cached(it, IMG_PX) }
        if (img != null) {
            b.setLargeIcon(Icon.createWithBitmap(img))
            b.setStyle(Notification.BigPictureStyle().bigPicture(img).bigLargeIcon(null as Icon?)
                .setSummaryText("${pres.displayTitle}: $body"))
        } else {
            b.setStyle(Notification.BigTextStyle().bigText("${pres.displayTitle}\n$body"))
            pres.images.firstOrNull()?.second?.let { url ->
                Images.load(url, IMG_PX) { bmp -> if (bmp != null && Store.visible().any { it.id == item.id }) render() }
            }
        }
        return b.build()
    }

    /** Approve / Deny run in the background straight from the notification, no unlock or app needed. */
    private fun action(label: String, act: String, id: String): Notification.Action =
        Notification.Action.Builder(null, label, service(act, id)).build()

    private fun serviceNotification(): Notification {
        val text = if (Store.lastError != null) "Problem: ${Store.lastError}" else "Nothing waiting"
        return Notification.Builder(this, CH_SERVICE)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("Approvals inbox")
            .setGroup("status")
            .setContentText(text)
            .setOngoing(true)
            .setContentIntent(PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE))
            .build()
    }

    private fun activity(id: String) = PendingIntent.getActivity(this, id.hashCode(),
        Intent(this, ReviewActivity::class.java).putExtra(EXTRA_ID, id), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

    private fun service(action: String, id: String) = PendingIntent.getForegroundService(this, (action + id).hashCode(),
        Intent(this, ApprovalService::class.java).setAction(action).putExtra(EXTRA_ID, id),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

    companion object {
        const val CH_ITEMS = "requests-alert"
        const val IMG_PX = 900
        const val CH_QUIET = "requests-quiet"
        const val CH_SERVICE = "service"
        const val ID_SERVICE = 1
        const val POLL_MS = 60_000L
        const val POLL_FAST_MS = 15_000L
        const val EXTRA_ID = "id"
        const val EXTRA_STATUS = "status"
        const val EXTRA_NOTE = "note"
        const val ACTION_APPROVE = "com.aidantorrence.approvals.APPROVE"
        const val ACTION_DENY = "com.aidantorrence.approvals.DENY"
        const val ACTION_SNOOZE = "com.aidantorrence.approvals.SNOOZE"
        const val ACTION_DECIDE = "com.aidantorrence.approvals.DECIDE"
        const val ACTION_POLL = "com.aidantorrence.approvals.POLL"
        const val ACTION_SWIPED = "com.aidantorrence.approvals.SWIPED"
        fun notifId(id: String) = 1000 + (id.hashCode() and 0x7fffffff) % 1_000_000

        fun start(ctx: Context, action: String? = null) {
            ctx.startForegroundService(Intent(ctx, ApprovalService::class.java).apply { if (action != null) setAction(action) })
        }
    }
}
