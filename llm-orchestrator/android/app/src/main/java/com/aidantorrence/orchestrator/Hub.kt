package com.aidantorrence.orchestrator

import android.app.ActivityOptions
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.RemoteInput
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.widget.Toast
import org.json.JSONObject
import java.util.concurrent.Executors

/** Reply handles captured from another app's notification (ChatGPT, Claude app, ...). Memory only. */
class DeviceHandle(val contentIntent: PendingIntent?, val replyAction: Notification.Action?)

/** Central coordinator: relay sync, alerts, sending replies, suggestions, task sync. */
object Hub {
    const val CHANNEL_ALERTS = "completions"
    const val CHANNEL_SERVICE = "service"

    private lateinit var app: Context
    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newFixedThreadPool(3)
    private var syncThread: Thread? = null
    @Volatile private var syncing = false
    @Volatile var relayStatus = "Relay not configured"
        private set
    @Volatile private var tasksDirty = false
    @Volatile private var initialSynced = false
    /** Per-computer bridge health, e.g. "laptop: claude ✓ codex ✓ chatgpt ✗". */
    @Volatile var bridgeStatus = ""
        private set

    val deviceHandles = mutableMapOf<String, DeviceHandle>()
    /** Called when a brand-new completion arrives (overlay pulses its bubble). */
    var onNewCompletion: ((InboxItem) -> Unit)? = null

    fun init(ctx: Context) {
        if (::app.isInitialized) return
        app = ctx.applicationContext
        Store.init(app)
        val nm = app.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ALERTS, "AI completions", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "A session finished and is waiting for you"
            },
        )
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_SERVICE, "Floating panel", NotificationManager.IMPORTANCE_MIN),
        )
        // The overlay is always either the bubble or the open panel: whatever wakes the process
        // (notification listener, boot, update, the app itself) brings it back if it was on.
        if (Store.overlayEnabled && !OverlayService.running) main.post {
            if (!OverlayService.running) runCatching { OverlayService.start(app) }
        }
    }

    fun bg(block: () -> Unit) = io.execute { runCatching(block).onFailure { it.printStackTrace() } }
    fun ui(block: () -> Unit) = main.post(block)
    fun toast(msg: String) = ui { Toast.makeText(app, msg, Toast.LENGTH_SHORT).show() }

    // ------------------------------------------------------------------ relay sync

    fun startSync() {
        if (syncing) return
        syncing = true
        syncThread = Thread({ syncLoop() }, "relay-sync").apply { isDaemon = true; start() }
    }

    fun restartSync() {
        syncing = false
        syncThread?.interrupt()
        syncThread = null
        Store.relaySeq = 0
        initialSynced = false
        startSync()
    }

    private fun syncLoop() {
        var backoff = 2000L
        while (syncing) {
            if (!Store.relayConfigured) {
                relayStatus = "Relay not configured"
                Thread.sleep(5000)
                continue
            }
            try {
                if (tasksDirty) pushTasksNow()
                val since = Store.relaySeq
                val res = RelayClient.poll(since, if (initialSynced) 40 else 0)
                relayStatus = "Connected"
                backoff = 2000
                if (res.optLong("seq") < since) {
                    // Relay restarted with fresh state: resync from scratch.
                    Store.relaySeq = 0
                    continue
                }
                initialSynced = true
                // Only alert once we have a baseline; the very first sync just loads history.
                ui { apply(res, firstLoad = since == 0L) }
            } catch (e: InterruptedException) {
                return
            } catch (e: Exception) {
                relayStatus = "Relay offline: ${e.message?.take(60)}"
                Store.changed()
                try { Thread.sleep(backoff) } catch (_: InterruptedException) { return }
                backoff = (backoff * 2).coerceAtMost(30_000)
            }
        }
    }

    private fun apply(res: JSONObject, firstLoad: Boolean) {
        val events = res.optJSONArray("events")
        if (events != null) {
            for (i in 0 until events.length()) merge(events.getJSONObject(i), alert = !firstLoad)
        }
        res.optJSONObject("bridges")?.let { b ->
            bridgeStatus = b.keys().asSequence().joinToString("  ") { host ->
                val srcs = b.getJSONObject(host).optJSONObject("sources") ?: JSONObject()
                host + ": " + srcs.keys().asSequence().filter { it != "relay" }.joinToString(" ") { k ->
                    val ok = srcs.getJSONObject(k).optBoolean("ok")
                    k.removeSuffix("-web").removeSuffix("-files").removeSuffix("-sessions") + if (ok) " ✓" else " ✗"
                }
            }
        }
        val tasks = res.optJSONArray("tasks")
        if (tasks != null && !tasksDirty) {
            Store.tasks.clear()
            for (i in 0 until tasks.length()) Store.tasks += Task.fromJson(tasks.getJSONObject(i))
        }
        Store.relaySeq = res.optLong("seq", Store.relaySeq)
        Store.changed()
    }

    private fun merge(o: JSONObject, alert: Boolean) {
        val id = o.getString("id")
        val existing = Store.item(id)
        val item = existing ?: InboxItem(
            id = id, origin = "relay", source = o.optString("source"), sessionId = o.optString("sessionId"),
            title = o.optString("title"), text = o.optString("text"), ts = o.optLong("ts"),
        ).also { Store.items += it }
        val hadSuggestion = item.suggestion.isNotBlank()
        item.title = o.optString("title", item.title)
        item.text = o.optString("text", item.text)
        item.prompt = o.optString("prompt", item.prompt)
        val remoteStatus = o.optString("status", item.status)
        val failed = o.optString("delivery") == "failed" && item.delivery != "failed"
        // Never let a stale poll resurrect something the user already answered or dismissed on the phone,
        // unless the bridge reports it couldn't deliver the reply (then it comes back with the reply filled in).
        if (failed) {
            item.status = "new"
            item.draft = o.optString("failedReply").ifBlank { item.reply }
            item.note = "Couldn't send automatically: ${o.optString("deliveryError").take(120)}. Tap Copy & open."
        } else if (!(remoteStatus == "new" && (item.status == "replied" || item.status == "dismissed"))) {
            item.status = remoteStatus
        }
        item.url = o.optString("url", item.url)
        item.replyMode = o.optString("replyMode", item.replyMode)
        item.delivery = o.optString("delivery", item.delivery)
        item.reply = o.optString("reply", item.reply)
        item.suggesting = o.optBoolean("suggesting")
        o.optJSONObject("suggestion")?.let { s ->
            item.suggestion = s.optString("primary")
            item.alternatives = s.optJSONArray("alternatives").toStringList()
        }
        if (existing == null) supersedeDeviceCopies(item)
        if (item.status != "new") {
            cancelAlert(item)
        } else if (failed) {
            postAlert(item, quiet = false)
        } else if (existing == null && alert) {
            newCompletion(item)
        } else if (!hadSuggestion && item.suggestion.isNotBlank() && alert) {
            postAlert(item, quiet = true)
        }
    }

    // ------------------------------------------------------------------ device notifications

    private fun norm(s: String) = s.replace(Regex("\\s+"), " ").trim().trimEnd('…', '.').lowercase()

    /** Same turn seen both as a phone notification and through the bridge: keep the bridge copy (it can reply). */
    private fun sameTurn(device: String, polled: String): Boolean {
        val d = norm(device).take(60)
        return d.length >= 12 && norm(polled).contains(d)
    }

    private fun supersedeDeviceCopies(relayItem: InboxItem) {
        Store.items.filter {
            it.origin == "device" && it.status == "new" && relayItem.ts - it.ts < 15 * 60_000 && sameTurn(it.text, relayItem.text)
        }.forEach { it.status = "superseded"; cancelAlert(it) }
    }

    /** A watched app (ChatGPT, Claude, ...) posted a "response ready" style notification. */
    fun onDeviceCompletion(pkg: String, source: String, key: String, title: String, text: String, handle: DeviceHandle) = ui {
        val sessionId = "$pkg:$key"
        val dup = Store.items.find { it.sessionId == sessionId && it.status == "new" && it.text == text }
        if (dup != null) { deviceHandles[dup.id] = handle; return@ui }
        // Already reported by the bridge (which can reply directly)? Then the notification adds nothing.
        val polled = Store.items.find {
            it.origin == "relay" && System.currentTimeMillis() - it.ts < 15 * 60_000 && sameTurn(text, it.text)
        }
        if (polled != null) return@ui
        val item = InboxItem(
            id = "dev-" + System.currentTimeMillis().toString(36) + (0..999).random(),
            origin = "device", source = source, sessionId = sessionId, title = title, text = text,
            replyMode = if (handle.replyAction != null) "device" else "clipboard", packageName = pkg,
        )
        deviceHandles[item.id] = handle
        Store.items += item
        Store.supersedeOlder(item)
        Store.changed()
        newCompletion(item)
        requestSuggestion(item, "")
    }

    private fun newCompletion(item: InboxItem) {
        postAlert(item, quiet = false)
        onNewCompletion?.invoke(item)
        runCatching {
            app.getSystemService(Vibrator::class.java)
                ?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 40, 80, 40), -1))
        }
    }

    // ------------------------------------------------------------------ suggestions

    fun requestSuggestion(item: InboxItem, hint: String) {
        item.suggesting = true
        Store.changed()
        bg {
            var primary = ""
            var alts = emptyList<String>()
            try {
                if (!Store.relayConfigured) throw IllegalStateException("no relay")
                val s = if (item.origin == "relay") RelayClient.regenerate(item.id, hint)
                else RelayClient.suggest(item.source, item.title, item.text, hint)
                primary = s.optString("primary")
                alts = s.optJSONArray("alternatives").toStringList()
            } catch (_: Exception) {
                val l = localSuggestion(item.text)
                primary = l.first; alts = l.second
            }
            ui {
                item.suggesting = false
                if (primary.isNotBlank()) {
                    item.suggestion = primary
                    item.alternatives = alts
                    if (hint.isNotBlank()) item.draft = null // the rewritten draft replaces what was typed
                }
                Store.changed()
                if (item.status == "new") postAlert(item, quiet = true)
            }
        }
    }

    fun localSuggestion(text: String): Pair<String, List<String>> {
        val t = text.lowercase()
        val primary = when {
            text.trim().endsWith("?") || Regex("should i|would you like|do you want|which option").containsMatchIn(t) ->
                "Yes, go with your recommended option and continue."
            Regex("error|failed|failing|exception|blocked|cannot|can't").containsMatchIn(t) ->
                "Investigate the root cause of that error, fix it, and re-run to confirm."
            else -> "Looks good. Verify it works, then commit and push."
        }
        return primary to listOf("Continue.", "Explain what you changed first.", "Stop here, thanks.")
    }

    // ------------------------------------------------------------------ actions

    private var lastSendAt = 0L

    fun send(item: InboxItem, raw: String) {
        val text = raw.trim()
        if (text.isEmpty()) { toast("Nothing to send"); return }
        // Ignore a repeat tap: this exact reply already went out for this completion.
        if (item.status == "replied" && item.reply == text && System.currentTimeMillis() - lastSendAt < 15_000) return
        lastSendAt = System.currentTimeMillis()
        val prevStatus = item.status
        item.status = "replied"
        item.reply = text
        item.draft = null
        item.note = ""
        cancelAlert(item)
        Store.changed()

        if (item.origin == "device") { sendDevice(item, text); return }
        if (item.replyMode == "none") {
            copyAndOpen(item, text, "Session isn't listening — reply copied")
            bg { runCatching { RelayClient.reply(item.id, text) } }
            return
        }
        bg {
            try {
                val r = RelayClient.reply(item.id, text)
                val via = r.optString("deliveredVia")
                ui {
                    item.delivery = via
                    Store.changed()
                    when (via) {
                        "hook" -> toast("Sent — session is continuing")
                        "bridge" -> toast("Queued — the bridge will resume the session")
                        "next-turn" -> copyAndOpen(item, text, "Cloud session isn't waiting — reply copied")
                        "bridge" -> {}
                    }
                }
            } catch (e: Exception) {
                ui {
                    item.status = prevStatus
                    item.draft = text
                    Store.changed()
                    toast("Send failed: ${e.message}")
                }
            }
        }
    }

    private fun sendDevice(item: InboxItem, text: String) {
        val handle = deviceHandles[item.id]
        val action = handle?.replyAction
        val inputs = action?.remoteInputs
        if (action != null && !inputs.isNullOrEmpty()) {
            try {
                val intent = Intent()
                val results = Bundle()
                inputs.forEach { results.putCharSequence(it.resultKey, text) }
                RemoteInput.addResultsToIntent(inputs, intent, results)
                action.actionIntent.send(app, 0, intent)
                item.delivery = "notification"
                Store.changed()
                toast("Replied via ${label(item.source)}")
                return
            } catch (e: Exception) {
                // fall through to clipboard
            }
        }
        item.delivery = "clipboard"
        Store.changed()
        copyAndOpen(item, text, "Reply copied — paste it in ${label(item.source)}")
    }

    /** The official app that can send into this item's conversation, if any. */
    fun appPackage(item: InboxItem): String? = item.packageName.ifBlank { null } ?: when (item.source) {
        "chatgpt" -> "com.openai.chatgpt"
        "claude-app", "claude-web", "claude" -> "com.anthropic.claude"
        else -> null
    }

    fun copyAndOpen(item: InboxItem, text: String, msg: String) {
        copy(text)
        val pkg = appPackage(item)
        if (pkg != null && AutoSendService.connected) {
            AutoSendService.request(pkg, text)
            toast("Sending in ${label(item.source)}…")
        } else {
            toast(msg)
        }
        open(item)
    }

    fun copy(text: String) {
        app.getSystemService(ClipboardManager::class.java)?.setPrimaryClip(ClipData.newPlainText("reply", text))
    }

    fun open(item: InboxItem) {
        val handle = deviceHandles[item.id]
        try {
            when {
                handle?.contentIntent != null -> {
                    if (Build.VERSION.SDK_INT >= 34) {
                        val opts = ActivityOptions.makeBasic()
                            .setPendingIntentBackgroundActivityStartMode(ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED)
                        handle.contentIntent.send(app, 0, null, null, null, null, opts.toBundle())
                    } else handle.contentIntent.send()
                }
                item.url.isNotBlank() -> {
                    val view = Intent(Intent.ACTION_VIEW, Uri.parse(item.url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    // Prefer the official app (it can send; a browser tab would hit the website's bot check).
                    val inApp = appPackage(item)?.let { Intent(view).setPackage(it) }
                    if (inApp != null && inApp.resolveActivity(app.packageManager) != null) app.startActivity(inApp)
                    else app.startActivity(view)
                }
                item.packageName.isNotBlank() ->
                    app.packageManager.getLaunchIntentForPackage(item.packageName)
                        ?.let { app.startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                else -> toast("No way to open this session from the phone")
            }
        } catch (e: Exception) {
            toast("Couldn't open: ${e.message}")
        }
    }

    fun dismiss(item: InboxItem) {
        item.status = "dismissed"
        cancelAlert(item)
        Store.changed()
        if (item.origin == "relay") bg { RelayClient.dismiss(item.id) }
    }

    // ------------------------------------------------------------------ tasks

    fun tasksChanged() {
        tasksDirty = true
        Store.changed()
        if (Store.relayConfigured) bg { pushTasksNow() }
    }

    @Synchronized private fun pushTasksNow() {
        try {
            RelayClient.putTasks()
            tasksDirty = false
        } catch (_: Exception) { /* retried by the sync loop */ }
    }

    fun addTask(title: String, priority: Int = 2, notes: String = "") {
        if (title.isBlank()) return
        Store.tasks += Task(title = title.trim(), priority = priority, notes = notes)
        tasksChanged()
    }

    // ------------------------------------------------------------------ alerts

    fun label(source: String) = when (source) {
        "claude-code" -> "Claude Code"
        "claude-code-cloud" -> "Claude Code ☁"
        "claude-code-rc" -> "Claude Code 💻"
        "claude-code-local" -> "Claude Code (local)"
        "claude-web" -> "Claude"
        "codex" -> "Codex"
        "chatgpt" -> "ChatGPT"
        "claude-app" -> "Claude"
        else -> source.replaceFirstChar { it.uppercase() }
    }

    private fun notifId(item: InboxItem) = item.id.hashCode()

    private fun postAlert(item: InboxItem, quiet: Boolean) {
        val nm = app.getSystemService(NotificationManager::class.java)
        if (!nm.areNotificationsEnabled()) return
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val open = PendingIntent.getActivity(
            app, notifId(item),
            Intent(app, MainActivity::class.java).putExtra("itemId", item.id).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            flags,
        )
        val b = Notification.Builder(app, CHANNEL_ALERTS)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("${label(item.source)} · ${item.title.ifBlank { "Session finished" }}")
            .setContentText(item.text.take(200))
            .setStyle(Notification.BigTextStyle().bigText(
                item.text.take(1200) + if (item.suggestion.isNotBlank()) "\n\n➜ ${item.suggestion}" else "",
            ))
            .setContentIntent(open)
            .setAutoCancel(true)
            .setOnlyAlertOnce(quiet)
            .setCategory(Notification.CATEGORY_MESSAGE)

        if (item.suggestion.isNotBlank()) {
            val sendIntent = PendingIntent.getBroadcast(
                app, notifId(item) + 1,
                Intent(app, ActionReceiver::class.java).setAction(ActionReceiver.SEND_SUGGESTED).putExtra("itemId", item.id),
                flags,
            )
            b.addAction(Notification.Action.Builder(null, "Send suggestion", sendIntent).build())
        }
        val replyIntent = PendingIntent.getBroadcast(
            app, notifId(item) + 2,
            Intent(app, ActionReceiver::class.java).setAction(ActionReceiver.REPLY).putExtra("itemId", item.id),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
        )
        val choices = (listOf(item.suggestion) + item.alternatives).filter { it.isNotBlank() }.take(4)
        val input = RemoteInput.Builder(ActionReceiver.KEY_TEXT)
            .setLabel("Reply to ${label(item.source)}")
            .apply { if (choices.isNotEmpty()) setChoices(choices.toTypedArray()) }
            .build()
        b.addAction(Notification.Action.Builder(null, "Reply", replyIntent).addRemoteInput(input).build())
        runCatching { nm.notify(notifId(item), b.build()) }
    }

    fun cancelAlert(item: InboxItem) {
        app.getSystemService(NotificationManager::class.java).cancel(notifId(item))
    }
}
