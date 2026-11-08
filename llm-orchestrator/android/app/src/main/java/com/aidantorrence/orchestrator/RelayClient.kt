package com.aidantorrence.orchestrator

import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** Minimal blocking HTTP client for the relay. Call from background threads only. */
object RelayClient {
    class HttpError(val code: Int, msg: String) : IOException("HTTP $code: $msg")

    fun request(method: String, path: String, body: JSONObject? = null, readTimeoutMs: Int = 20_000): JSONObject {
        val conn = URL(Store.relayUrl + path).openConnection() as HttpURLConnection
        try {
            conn.requestMethod = method
            conn.connectTimeout = 10_000
            conn.readTimeout = readTimeoutMs
            conn.setRequestProperty("Authorization", "Bearer ${Store.token}")
            conn.setRequestProperty("Content-Type", "application/json")
            if (body != null) {
                conn.doOutput = true
                conn.outputStream.use { it.write(body.toString().toByteArray()) }
            }
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
            if (code !in 200..299) throw HttpError(code, text.take(200))
            return if (text.isBlank()) JSONObject() else JSONObject(text)
        } finally {
            conn.disconnect()
        }
    }

    fun poll(since: Long, waitSeconds: Int) =
        request("GET", "/api/events?since=$since&wait=$waitSeconds", readTimeoutMs = (waitSeconds + 20) * 1000)

    fun reply(eventId: String, text: String) =
        request("POST", "/api/reply", JSONObject().put("eventId", eventId).put("text", text))

    fun regenerate(eventId: String, hint: String) =
        request("POST", "/api/events/$eventId/suggest", JSONObject().put("hint", hint), readTimeoutMs = 90_000)

    fun dismiss(eventId: String) = request("POST", "/api/events/$eventId/dismiss", JSONObject())

    fun suggest(source: String, title: String, text: String, hint: String = "") = request(
        "POST", "/api/suggest",
        JSONObject().put("source", source).put("title", title).put("text", text).put("hint", hint),
        readTimeoutMs = 90_000,
    )

    fun putTasks() = request("PUT", "/api/tasks", JSONObject().put("tasks", Store.tasksJson()))

    fun health(): Boolean = runCatching {
        request("GET", "/api/sessions"); true
    }.getOrDefault(false)
}
