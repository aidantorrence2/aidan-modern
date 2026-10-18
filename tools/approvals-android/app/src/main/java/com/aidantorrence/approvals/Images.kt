package com.aidantorrence.approvals

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Handler
import android.os.Looper
import android.util.LruCache
import android.widget.ImageView
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/** Tiny remote image loader: downsampled decode, memory cache, main-thread delivery. */
object Images {
    private val cache = LruCache<String, Bitmap>(24 * 1024 * 1024).also { }
    private val pool = Executors.newFixedThreadPool(2)
    private val main = Handler(Looper.getMainLooper())

    fun cached(url: String, maxPx: Int): Bitmap? = cache.get("$maxPx|$url")

    fun load(url: String, maxPx: Int, done: (Bitmap?) -> Unit) {
        cached(url, maxPx)?.let { done(it); return }
        pool.execute {
            val bmp = try { fetch(url, maxPx) } catch (e: Exception) { android.util.Log.w("Approvals", "image $url", e); null }
            if (bmp != null) cache.put("$maxPx|$url", bmp)
            main.post { done(bmp) }
        }
    }

    fun loadBlocking(url: String, maxPx: Int): Bitmap? =
        cached(url, maxPx) ?: try { fetch(url, maxPx)?.also { cache.put("$maxPx|$url", it) } } catch (_: Exception) { null }

    fun into(view: ImageView, url: String, maxPx: Int) {
        view.tag = url
        load(url, maxPx) { if (view.tag == url && it != null) view.setImageBitmap(it) }
    }

    private fun fetch(url: String, maxPx: Int): Bitmap? {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 15_000; c.readTimeout = 20_000
        val bytes = try {
            if (c.responseCode != 200) { android.util.Log.w("Approvals", "image $url -> HTTP ${c.responseCode}"); return null }
            c.inputStream.use { it.readBytes() }
        } finally { c.disconnect() }
        android.util.Log.i("Approvals", "image $url ${bytes.size} bytes")
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
        var sample = 1
        while (bounds.outWidth / (sample * 2) >= maxPx && bounds.outHeight / (sample * 2) >= maxPx) sample *= 2
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = sample })
    }
}
