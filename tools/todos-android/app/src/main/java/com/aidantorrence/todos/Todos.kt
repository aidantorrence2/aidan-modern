package com.aidantorrence.todos

import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import android.util.Base64
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

const val REPO = "aidantorrence2/aidan-modern"
const val BRANCH = "ccr-858db8c5-lx4rbu"
const val TODOS_PATH = "data/todos.json"
const val STATE_PATH = "data/todos-state.json"

/**
 * One card. Several cards can belong to one task (same [task]): different ways of asking the same
 * thing. [text] is a sentence with the part to recall in {{double braces}}; it is hidden on the
 * question side and revealed on the answer side, like an Anki cloze card. [note] shows under the answer.
 */
data class Todo(
    val id: String, val task: String, val rank: Int, val title: String,
    val text: String, val note: String, val minutes: Int, val source: String,
)

data class TodoList(val date: String, val generated: String, val items: List<Todo>) {
    companion object {
        fun parse(text: String): TodoList {
            val j = JV.parse(text)
            val items = ((j["items"] as? JV.Arr)?.items ?: emptyList()).mapNotNull { v ->
                val id = v["id"]?.str ?: return@mapNotNull null
                val title = v["title"]?.str ?: ""
                // Older lists have no cloze text: hide the first step behind the task title.
                val text = v["text"]?.str?.takeIf { "{{" in it }
                    ?: "$title: {{${v["next_step"]?.str?.ifBlank { null } ?: "do it"}}}"
                Todo(
                    id = id,
                    task = v["task"]?.str ?: id,
                    rank = (v["rank"] as? JV.Num)?.raw?.toIntOrNull() ?: 0,
                    title = title,
                    text = text,
                    note = v["note"]?.str ?: v["why"]?.str ?: "",
                    minutes = (v["minutes"] as? JV.Num)?.raw?.toDoubleOrNull()?.toInt() ?: 0,
                    source = v["source"]?.str ?: "",
                )
            }   // file order is study order: the builder interleaves the variations of each task
            return TodoList(j["date"]?.str ?: "", j["generated"]?.str ?: "", items)
        }
    }
}

class GitHubException(val code: Int, msg: String) : Exception(msg)

/** GitHub Contents API on the queue branch. */
class GitHub(private val token: String?) {
    private fun open(u: String, method: String): HttpURLConnection =
        (URL(u).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 20_000; readTimeout = 30_000; useCaches = false
            if (token != null) setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
            setRequestProperty("User-Agent", "todos-android")
        }

    private fun body(c: HttpURLConnection): String =
        (if (c.responseCode < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""

    /** (content, sha), or (null, null) when the file doesn't exist yet. */
    fun get(path: String): Pair<String?, String?> {
        val c = open("https://api.github.com/repos/$REPO/contents/$path?ref=$BRANCH", "GET")
        try {
            val text = body(c)
            if (c.responseCode == 404) return null to null
            if (c.responseCode != 200) throw GitHubException(c.responseCode, "GitHub ${c.responseCode}")
            val meta = JV.parse(text)
            val b64 = (meta["content"]?.str ?: "").filterNot { it.isWhitespace() }
            return String(Base64.decode(b64, Base64.DEFAULT), Charsets.UTF_8) to meta["sha"]?.str
        } finally { c.disconnect() }
    }

    /** Token-free read of the public branch. Null when missing. */
    fun getPublic(path: String): String? {
        val c = open("https://raw.githubusercontent.com/$REPO/$BRANCH/$path?t=${System.currentTimeMillis() / 300_000}", "GET")
        try {
            val text = body(c)
            if (c.responseCode == 404) return null
            if (c.responseCode != 200) throw GitHubException(c.responseCode, "GitHub ${c.responseCode}")
            return text
        } finally { c.disconnect() }
    }

    /** False on a stale sha so the caller can re-read and retry. */
    fun put(path: String, content: String, sha: String?, message: String): Boolean {
        val c = open("https://api.github.com/repos/$REPO/contents/$path", "PUT")
        try {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            val members = mutableListOf<Pair<String, JV>>(
                "message" to JV.Str(message),
                "content" to JV.Str(Base64.encodeToString(content.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)),
                "branch" to JV.Str(BRANCH),
            )
            if (sha != null) members += "sha" to JV.Str(sha)
            c.outputStream.use { it.write(JV.Obj(members).serialize().toByteArray(Charsets.UTF_8)) }
            body(c)
            if (c.responseCode == 409 || c.responseCode == 422) return false
            if (c.responseCode !in 200..201) throw GitHubException(c.responseCode, "GitHub ${c.responseCode}")
            return true
        } finally { c.disconnect() }
    }
}

/**
 * Today's deck and its Anki-style study state, kept on the phone so the bubble works offline.
 * Every card starts new. Again / Hard / Good / Easy send it away for 1 min / 10 min / 1 h / 1 day and
 * it comes back when its time is up. Nothing is ever retired: the deck cycles forever.
 */
object Game {
    private lateinit var prefs: SharedPreferences
    private val main = Handler(Looper.getMainLooper())
    private val listeners = mutableListOf<() -> Unit>()

    var list: TodoList? = null; private set
    var lastSync: Long = 0
    var lastError: String? = null

    fun init(ctx: Context) {
        if (::prefs.isInitialized) return
        prefs = ctx.applicationContext.getSharedPreferences("game", Context.MODE_PRIVATE)
        prefs.getString("list", null)?.let { try { list = TodoList.parse(it) } catch (_: Exception) {} }
        // The list bundled in the APK: used on first open, or when it is newer than the saved one.
        try {
            val bundled = ctx.assets.open("todos.json").bufferedReader().use { it.readText() }
            if (isNewer(bundled)) setList(bundled, null)
        } catch (_: Exception) {}
    }

    /** True when this list JSON was generated after the one we hold (never go back to an older list). */
    fun isNewer(json: String): Boolean {
        val cur = list ?: return true
        return try { TodoList.parse(json).generated > cur.generated } catch (_: Exception) { false }
    }

    private fun ids(key: String) = prefs.getString(key, "")!!.split(',').filter { it.isNotEmpty() }

    val done: Set<String> get() = ids("done").toSet()
    /** Cards answered at least once today and not done: Anki's "learning" cards. */
    val seen: Set<String> get() = ids("seen").toSet()
    val stateDirty: Boolean get() = prefs.getBoolean("stateDirty", false)
    val total: Int get() = list?.items?.size ?: 0

    fun due(id: String): Long = prefs.getLong("due:$id", 0)
    private fun open(): List<Todo> { val d = done; return list?.items?.filter { it.id !in d } ?: emptyList() }

    /**
     * Cards to study now: cards whose time has come (oldest first), then new cards. The deck never
     * runs dry: when nothing is due and nothing is new, it serves the card seen longest ago.
     */
    fun deck(now: Long = System.currentTimeMillis()): List<Todo> {
        val o = open(); val s = seen
        val ready = o.filter { it.id in s && due(it.id) <= now }.sortedBy { due(it.id) } + o.filter { it.id !in s }
        if (ready.isNotEmpty() || o.isEmpty()) return ready
        return listOf(o.minByOrNull { prefs.getLong("seenAt:${it.id}", 0) }!!)
    }

    /** True when the card on top is being shown ahead of its time because nothing else is due. */
    fun ahead(now: Long = System.currentTimeMillis()): Boolean {
        val s = seen
        return open().isNotEmpty() && open().none { it.id !in s || due(it.id) <= now }
    }

    /** (new, due, away): blue = never seen, red = back and waiting for you, green = sent away for later. */
    fun counts(now: Long = System.currentTimeMillis()): Triple<Int, Int, Int> {
        val o = open(); val s = seen
        val dueNow = o.count { it.id in s && due(it.id) <= now }
        return Triple(o.count { it.id !in s }, dueNow, o.count { it.id in s } - dueNow)
    }

    /** When the next waiting card comes back, or null if none is waiting. */
    fun nextDue(now: Long = System.currentTimeMillis()): Long? {
        val s = seen
        return open().filter { it.id in s && due(it.id) > now }.minOfOrNull { due(it.id) }
    }

    /**
     * New list from GitHub or the APK. Study progress is kept per card id across lists and days
     * (goals last longer than a day); progress for cards that no longer exist is dropped.
     */
    fun setList(json: String, remoteDone: Set<String>?) {
        val l = TodoList.parse(json)
        val ids = l.items.map { it.id }.toSet()
        val e = prefs.edit().putString("list", json).putString("listDate", l.date)
            .putString("done", "").putBoolean("stateDirty", false)
            .putString("seen", seen.filter { it in ids }.joinToString(","))
        prefs.all.keys.filter { (it.startsWith("due:") || it.startsWith("seenAt:")) && it.substringAfter(':') !in ids }.forEach { e.remove(it) }
        e.apply()
        list = l
        changed()
    }

    /** Again / Hard / Good / Easy: the card comes back after [minutes]. */
    fun answer(t: Todo, minutes: Int) {
        val now = System.currentTimeMillis()
        prefs.edit().putString("seen", (seen + t.id).joinToString(","))
            .putLong("due:${t.id}", now + minutes * 60_000L).putLong("seenAt:${t.id}", now).apply()
        changed()
    }

    /** Cards of the same task. */
    private fun siblings(t: Todo): Set<String> = list?.items?.filter { it.task == t.task }?.map { it.id }?.toSet() ?: setOf(t.id)

    /** The task is finished: every card about it leaves the deck. */
    fun markDone(t: Todo) {
        prefs.edit().putString("done", (done + siblings(t)).joinToString(",")).putBoolean("stateDirty", true).apply()
        changed()
    }

    fun undo(t: Todo) {
        prefs.edit().putString("done", (done - siblings(t)).joinToString(",")).putLong("due:${t.id}", 0).putBoolean("stateDirty", true).apply()
        changed()
    }

    fun stateWritten() = prefs.edit().putBoolean("stateDirty", false).apply()

    fun addListener(l: () -> Unit) { listeners.add(l) }
    fun removeListener(l: () -> Unit) { listeners.remove(l) }
    fun changed() = main.post { listeners.toList().forEach { it() } }

    fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    fun isoNow(): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date())
}
