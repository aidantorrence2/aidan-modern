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
import java.security.KeyFactory
import java.security.spec.MGF1ParameterSpec
import java.security.spec.PKCS8EncodedKeySpec
import javax.crypto.Cipher
import javax.crypto.spec.OAEPParameterSpec
import javax.crypto.spec.PSource
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

const val REPO = "aidantorrence2/aidan-modern"
const val BRANCH = "ccr-d1938557-3pv196"
const val TODOS_PATH = "data/todos.enc.json"
const val STATE_PATH = "data/todos-state.json"

data class Todo(
    val id: String, val rank: Int, val title: String, val why: String,
    val nextStep: String, val minutes: Int, val source: String,
)

data class TodoList(val date: String, val generated: String, val items: List<Todo>) {
    companion object {
        fun parse(text: String): TodoList {
            val j = JV.parse(text)
            val items = ((j["items"] as? JV.Arr)?.items ?: emptyList()).mapNotNull { v ->
                val id = v["id"]?.str ?: return@mapNotNull null
                Todo(
                    id = id,
                    rank = (v["rank"] as? JV.Num)?.raw?.toIntOrNull() ?: 0,
                    title = v["title"]?.str ?: "",
                    why = v["why"]?.str ?: "",
                    nextStep = v["next_step"]?.str ?: "",
                    minutes = (v["minutes"] as? JV.Num)?.raw?.toDoubleOrNull()?.toInt() ?: 0,
                    source = v["source"]?.str ?: "",
                )
            }.sortedBy { it.rank }
            return TodoList(j["date"]?.str ?: "", j["generated"]?.str ?: "", items)
        }

        /**
         * Envelope written by build-todos.mjs: a one-time AES-256 key wrapped with RSA-OAEP(SHA-256)
         * in `ek`, then AES-GCM with ct = ciphertext || 16-byte tag.
         */
        fun decrypt(envelope: String, privatePkcs8: ByteArray): String {
            val e = JV.parse(envelope)
            fun b64(k: String) = Base64.decode(e[k]?.str ?: throw IllegalArgumentException("no $k"), Base64.DEFAULT)
            val priv = KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(privatePkcs8))
            val rsa = Cipher.getInstance("RSA/ECB/OAEPPadding")
            rsa.init(Cipher.DECRYPT_MODE, priv, OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT))
            val c = Cipher.getInstance("AES/GCM/NoPadding")
            c.init(Cipher.DECRYPT_MODE, SecretKeySpec(rsa.doFinal(b64("ek")), "AES"), GCMParameterSpec(128, b64("iv")))
            return String(c.doFinal(b64("ct")), Charsets.UTF_8)
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

    /** Token-free read of the public branch (the list itself is encrypted). Null when missing. */
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
 * Today's deck and the game state, kept on the phone so the bubble works offline and instantly.
 * The deck order changes as you play (Again puts a card two places back, Later puts it last);
 * done ids are also written to data/todos-state.json so tomorrow's list knows what you finished.
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
    }

    private fun ids(key: String) = prefs.getString(key, "")!!.split(',').filter { it.isNotEmpty() }

    val done: Set<String> get() = ids("done").toSet()
    val points: Int get() = prefs.getInt("points", 0)
    val combo: Int get() = prefs.getInt("combo", 0)
    val streak: Int get() {
        val s = prefs.getInt("streak", 0); val d = prefs.getString("streakDate", "")
        return if (d == today() || d == yesterday()) s else 0
    }
    val stateDirty: Boolean get() = prefs.getBoolean("stateDirty", false)

    /** Cards still in play, in play order. */
    fun deck(): List<Todo> {
        val l = list ?: return emptyList()
        val byId = l.items.associateBy { it.id }
        val order = ids("order").filter { it in byId } + l.items.map { it.id }.filter { it !in ids("order") }
        val d = done
        return order.filter { it !in d }.mapNotNull { byId[it] }
    }
    val total: Int get() = list?.items?.size ?: 0

    /** New list from GitHub. A new date resets the game; the same date keeps progress. */
    fun setList(json: String, remoteDone: Set<String>?) {
        val l = TodoList.parse(json)
        val e = prefs.edit().putString("list", json)
        if (l.date != prefs.getString("listDate", null)) {
            e.putString("listDate", l.date).putString("order", l.items.joinToString(",") { it.id })
                .putString("done", "").putInt("combo", 0).putBoolean("stateDirty", false)
        } else if (remoteDone != null && !stateDirty) {
            // Same day: merge what the server says is done (e.g. reinstall) with what we have.
            e.putString("done", (done + remoteDone).filter { id -> l.items.any { it.id == id } }.joinToString(","))
        }
        e.apply()
        list = l
        changed()
    }

    fun markDone(t: Todo): Int {
        val c = (combo + 1).coerceAtMost(5)
        val gained = 10 * c
        val newDone = done + t.id
        val e = prefs.edit().putString("done", newDone.joinToString(",")).putInt("combo", c)
            .putInt("points", points + gained).putBoolean("stateDirty", true)
        // A day counts for the streak once half the deck is cleared.
        if (newDone.size >= (total + 1) / 2 && prefs.getString("streakDate", "") != today()) {
            e.putInt("streak", streak + 1).putString("streakDate", today())
        }
        e.apply(); changed()
        return gained
    }

    fun again(t: Todo) = move(t, 2)
    fun later(t: Todo) = move(t, Int.MAX_VALUE)

    private fun move(t: Todo, by: Int) {
        val order = deck().map { it.id }.toMutableList()
        val i = order.indexOf(t.id); if (i < 0) return
        order.removeAt(i)
        val at = if (by == Int.MAX_VALUE) order.size else (i + by).coerceAtMost(order.size)
        order.add(at, t.id)
        prefs.edit().putString("order", (order + done).joinToString(",")).putInt("combo", 0).apply()
        changed()
    }

    fun undo(t: Todo) {
        prefs.edit().putString("done", (done - t.id).joinToString(",")).putBoolean("stateDirty", true).apply()
        changed()
    }

    fun stateWritten() = prefs.edit().putBoolean("stateDirty", false).apply()

    fun addListener(l: () -> Unit) { listeners.add(l) }
    fun removeListener(l: () -> Unit) { listeners.remove(l) }
    fun changed() = main.post { listeners.toList().forEach { it() } }

    fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    private fun yesterday(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(System.currentTimeMillis() - 86_400_000))
    fun isoNow(): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date())
}
