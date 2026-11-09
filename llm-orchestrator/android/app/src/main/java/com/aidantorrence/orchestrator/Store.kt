package com.aidantorrence.orchestrator

import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/** One finished turn from an LLM session, waiting for (or having received) the user's reply. */
data class InboxItem(
    val id: String,
    /** "relay" (Claude Code / Codex via the relay) or "device" (captured from a phone notification). */
    val origin: String,
    val source: String,
    val sessionId: String,
    var title: String,
    var text: String,
    var prompt: String = "",
    var ts: Long = System.currentTimeMillis(),
    /** new | replied | dismissed | superseded */
    var status: String = "new",
    var suggestion: String = "",
    var alternatives: List<String> = emptyList(),
    var suggesting: Boolean = false,
    /** What the user typed; null means "use the suggestion". */
    var draft: String? = null,
    var url: String = "",
    var replyMode: String = "bridge",
    var reply: String = "",
    var delivery: String = "",
    var packageName: String = "",
    /** Shown on the card, e.g. why an automatic send failed. */
    var note: String = "",
    /** Card summary from the relay's drafter: shorthand title, what the agent did, what it needs. */
    var shortTitle: String = "",
    var did: String = "",
    var needs: String = "",
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id); put("origin", origin); put("source", source); put("sessionId", sessionId)
        put("title", title); put("text", text); put("prompt", prompt); put("ts", ts); put("status", status)
        put("suggestion", suggestion); put("alternatives", JSONArray(alternatives)); put("draft", draft ?: JSONObject.NULL)
        put("url", url); put("replyMode", replyMode); put("reply", reply); put("delivery", delivery)
        put("packageName", packageName); put("note", note)
        put("shortTitle", shortTitle); put("did", did); put("needs", needs)
    }

    companion object {
        fun fromJson(o: JSONObject) = InboxItem(
            id = o.getString("id"),
            origin = o.optString("origin", "relay"),
            source = o.optString("source"),
            sessionId = o.optString("sessionId"),
            title = o.optString("title"),
            text = o.optString("text"),
            prompt = o.optString("prompt"),
            ts = o.optLong("ts"),
            status = o.optString("status", "new"),
            suggestion = o.optString("suggestion"),
            alternatives = o.optJSONArray("alternatives").toStringList(),
            draft = if (o.isNull("draft")) null else o.optString("draft"),
            url = o.optString("url"),
            replyMode = o.optString("replyMode", "bridge"),
            reply = o.optString("reply"),
            delivery = o.optString("delivery"),
            packageName = o.optString("packageName"),
            note = o.optString("note"),
            shortTitle = o.optString("shortTitle"),
            did = o.optString("did"),
            needs = o.optString("needs"),
        )
    }
}

data class Task(
    val id: String = UUID.randomUUID().toString().take(12),
    var title: String,
    var priority: Int = 2,
    var done: Boolean = false,
    var notes: String = "",
    val createdAt: Long = System.currentTimeMillis(),
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id); put("title", title); put("priority", priority); put("done", done)
        put("notes", notes); put("createdAt", createdAt)
    }

    companion object {
        fun fromJson(o: JSONObject) = Task(
            id = o.optString("id", UUID.randomUUID().toString().take(12)),
            title = o.optString("title"),
            priority = o.optInt("priority", 2),
            done = o.optBoolean("done"),
            notes = o.optString("notes"),
            createdAt = o.optLong("createdAt", System.currentTimeMillis()),
        )
    }
}

fun JSONArray?.toStringList(): List<String> =
    if (this == null) emptyList() else (0 until length()).map { optString(it) }.filter { it.isNotBlank() }

/** In-memory app state with SharedPreferences persistence. All mutation happens on the main thread. */
object Store {
    private lateinit var prefs: SharedPreferences
    private val main = Handler(Looper.getMainLooper())
    private val listeners = mutableSetOf<() -> Unit>()

    val items = mutableListOf<InboxItem>()
    val tasks = mutableListOf<Task>()
    var relaySeq = 0L

    var relayUrl: String
        get() = prefs.getString("relayUrl", "")!!.trimEnd('/')
        set(v) = prefs.edit().putString("relayUrl", v.trim().trimEnd('/')).apply()
    var token: String
        get() = prefs.getString("token", "")!!
        set(v) = prefs.edit().putString("token", v.trim()).apply()
    /** Extra package names whose notifications count as AI completions (comma separated). */
    var extraPackages: String
        get() = prefs.getString("extraPackages", "")!!
        set(v) = prefs.edit().putString("extraPackages", v).apply()
    var overlayEnabled: Boolean
        get() = prefs.getBoolean("overlayEnabled", false)
        set(v) = prefs.edit().putBoolean("overlayEnabled", v).apply()

    val relayConfigured get() = relayUrl.isNotBlank() && token.isNotBlank()

    private var loaded = false

    fun init(ctx: Context) {
        if (loaded) return
        loaded = true
        prefs = ctx.applicationContext.getSharedPreferences("orchestrator", Context.MODE_PRIVATE)
        runCatching {
            JSONArray(prefs.getString("items", "[]")).let { a ->
                for (i in 0 until a.length()) items += InboxItem.fromJson(a.getJSONObject(i))
            }
        }
        runCatching {
            JSONArray(prefs.getString("tasks", "[]")).let { a ->
                for (i in 0 until a.length()) tasks += Task.fromJson(a.getJSONObject(i))
            }
        }
        relaySeq = prefs.getLong("relaySeq", 0)
        items.forEach { it.suggesting = false }
    }

    fun addListener(l: () -> Unit) { listeners += l }
    fun removeListener(l: () -> Unit) { listeners -= l }

    /** Persist and notify UI. Safe to call from any thread. */
    fun changed() {
        if (Looper.myLooper() != Looper.getMainLooper()) { main.post { changed() }; return }
        if (items.size > 250) items.sortedBy { it.ts }.take(items.size - 250).forEach { items.remove(it) }
        prefs.edit()
            .putString("items", JSONArray(items.map { it.toJson() }).toString())
            .putString("tasks", JSONArray(tasks.map { it.toJson() }).toString())
            .putLong("relaySeq", relaySeq)
            .apply()
        listeners.toList().forEach { it() }
    }

    fun item(id: String) = items.find { it.id == id }

    /** Unanswered items, newest first. */
    fun pending() = items.filter { it.status == "new" }.sortedByDescending { it.ts }
    fun recent(limit: Int = 12) =
        items.filter { it.status == "replied" || it.status == "dismissed" }.sortedByDescending { it.ts }.take(limit)

    /** Sorted by priority; within a priority, list order (stable sort) so manual promotion sticks. */
    fun openTasks() = tasks.filter { !it.done }.sortedBy { it.priority }
    fun doneTasks() = tasks.filter { it.done }.sortedByDescending { it.createdAt }

    /** Supersede older unanswered items from the same session (only the latest turn matters). */
    fun supersedeOlder(item: InboxItem) {
        items.filter { it !== item && it.sessionId == item.sessionId && it.status == "new" && it.ts <= item.ts }
            .forEach { it.status = "superseded" }
    }

    fun tasksJson(): JSONArray = JSONArray(tasks.map { it.toJson() })
}
