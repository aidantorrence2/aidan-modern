package com.aidantorrence.approvals

import android.util.Base64
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

const val QUEUE_REPO = "aidantorrence2/aidan-modern"
const val QUEUE_BRANCH = "ccr-d1938557-3pv196"
const val QUEUE_PATH = "data/approvals.json"

data class Item(
    val id: String, val kind: String, val source: String, val title: String, val summary: String,
    val previewUrl: String?, val payload: JV, val created: Long?, val expires: Long?,
    val status: String, val decided: String?, val note: String,
) {
    val expired: Boolean get() = expires != null && expires < System.currentTimeMillis()
    val pending: Boolean get() = status == "pending" && !expired

    companion object {
        fun from(v: JV): Item? {
            val id = v["id"]?.str ?: return null
            return Item(
                id = id,
                kind = v["kind"]?.str ?: "other",
                source = v["source"]?.str ?: "unknown",
                title = v["title"]?.str ?: id,
                summary = v["summary"]?.str ?: "",
                previewUrl = v["preview_url"]?.str,
                payload = v["payload"] ?: JV.Null,
                created = v["created"]?.str?.let(Iso::parse),
                expires = v["expires"]?.str?.let(Iso::parse),
                status = v["status"]?.str ?: "pending",
                decided = v["decided"]?.str,
                note = v["note"]?.str ?: "",
            )
        }
    }
}

object Iso {
    private val formats = listOf("yyyy-MM-dd'T'HH:mm:ssX", "yyyy-MM-dd'T'HH:mm:ss.SSSX", "yyyy-MM-dd'T'HH:mmX")
    fun parse(s: String): Long? {
        for (f in formats) {
            try {
                val df = SimpleDateFormat(f, Locale.US); df.timeZone = TimeZone.getTimeZone("UTC"); df.isLenient = false
                return df.parse(s)?.time
            } catch (_: Exception) {}
        }
        return null
    }
    fun now(): String {
        val df = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US); df.timeZone = TimeZone.getTimeZone("UTC")
        return df.format(Date())
    }
}

class GitHubException(val code: Int, msg: String) : Exception(msg)

/** GitHub Contents API: GET the queue file with its sha, PUT it back with that sha. */
class QueueClient(private val token: String) {
    private val url = "https://api.github.com/repos/$QUEUE_REPO/contents/$QUEUE_PATH"

    private fun open(u: String, method: String): HttpURLConnection =
        (URL(u).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 20_000; readTimeout = 30_000
            useCaches = false
            setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
            setRequestProperty("User-Agent", "approvals-android")
        }

    private fun body(c: HttpURLConnection): String =
        (if (c.responseCode < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""

    fun fetch(): Pair<JV, String> {
        val c = open("$url?ref=$QUEUE_BRANCH", "GET")
        try {
            val text = body(c)
            if (c.responseCode != 200) throw GitHubException(c.responseCode, "GitHub ${c.responseCode}: ${message(text)}")
            val meta = JV.parse(text)
            val sha = meta["sha"]?.str ?: throw GitHubException(0, "no sha")
            val b64 = (meta["content"]?.str ?: "").filterNot { it.isWhitespace() }
            val content = String(Base64.decode(b64, Base64.DEFAULT), Charsets.UTF_8)
            return JV.parse(content) to sha
        } finally { c.disconnect() }
    }

    /** Returns false on a stale sha (409/422) so the caller can re-read and retry. */
    fun put(root: JV, sha: String, message: String): Boolean {
        val c = open(url, "PUT")
        try {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            val content = Base64.encodeToString((root.serialize() + "\n").toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
            val req = JV.Obj(mutableListOf(
                "message" to JV.Str(message), "content" to JV.Str(content),
                "sha" to JV.Str(sha), "branch" to JV.Str(QUEUE_BRANCH),
            ))
            c.outputStream.use { it.write(req.serialize().toByteArray(Charsets.UTF_8)) }
            val text = body(c)
            if (c.responseCode == 409 || c.responseCode == 422) return false
            if (c.responseCode !in 200..201) throw GitHubException(c.responseCode, "GitHub ${c.responseCode}: ${message(text)}")
            return true
        } finally { c.disconnect() }
    }

    /**
     * Applies decisions (id -> Decision) to the latest file and writes it. Re-reads and retries on
     * a concurrent write. Returns the commit message, or null when none of the ids exist any more.
     */
    fun decide(decisions: Map<String, Decision>): DecideResult {
        repeat(4) { attempt ->
            val (root, sha) = fetch()
            val items = (root["items"] as? JV.Arr)?.items ?: throw GitHubException(0, "no items array")
            val applied = mutableListOf<Pair<String, Decision>>()
            val already = mutableMapOf<String, String>()
            for (entry in items) {
                val obj = entry as? JV.Obj ?: continue
                val id = obj["id"]?.str ?: continue
                val d = decisions[id] ?: continue
                // First decision wins: never flip an item another device (or person) already decided.
                val current = obj["status"]?.str ?: "pending"
                if (current != "pending" && d.status != "pending") { already[id] = current; continue }
                obj["status"] = JV.Str(d.status)
                obj["decided"] = if (d.status == "pending") JV.Null else JV.Str(d.decided)
                obj["note"] = JV.Str(d.note)
                applied.add(id to d)
            }
            if (applied.isEmpty()) return DecideResult(null, already)
            val msg = commitMessage(applied)
            if (put(root, sha, msg)) return DecideResult(msg, already)
            Thread.sleep(400L * (attempt + 1))
        }
        throw GitHubException(409, "the queue kept changing; will retry")
    }

    private fun message(text: String): String =
        try { JV.parse(text)["message"]?.str ?: text.take(160) } catch (_: Exception) { text.take(160) }

    companion object {
        fun verb(status: String) = when (status) { "approved" -> "Approve"; "denied" -> "Deny"; else -> "Reset" }
        fun commitMessage(applied: List<Pair<String, Decision>>): String {
            if (applied.size == 1) return "${verb(applied[0].second.status)} ${applied[0].first}"
            val statuses = applied.map { it.second.status }.toSet()
            val v = if (statuses.size == 1) verb(statuses.first()) else "Decide"
            return "$v ${applied.size} items: " + applied.joinToString(", ") {
                if (statuses.size > 1) "${it.second.status} ${it.first}" else it.first
            }
        }
    }
}

data class Decision(val status: String, val decided: String, val note: String)

/** message = the commit written (null if nothing to write); already = id -> status someone else set first. */
data class DecideResult(val message: String?, val already: Map<String, String>)
