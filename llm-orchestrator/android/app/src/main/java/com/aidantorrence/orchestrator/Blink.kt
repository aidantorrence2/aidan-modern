package com.aidantorrence.orchestrator

import android.animation.ValueAnimator
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator

/** Red = the agent is waiting on you; green = done, nothing needed (blinks for 5 minutes after it arrives). */
object Blink {
    const val RED = 0xFFF24D47.toInt()
    const val GREEN = 0xFF59D973.toInt()
    const val GREEN_MS = 5 * 60_000L

    fun waiting(item: InboxItem): Boolean? = item.needsReply
        ?: if (item.needs.isBlank()) null else !item.needs.trim().lowercase().startsWith("nothing")

    /** The color an item should blink right now, or null for no blink. */
    fun colorFor(item: InboxItem, now: Long = System.currentTimeMillis()): Int? = when (waiting(item)) {
        true -> RED
        false -> if (now - item.ts < GREEN_MS) GREEN else null
        null -> null
    }

    /**
     * Pulses the stroke of [drawable] (owned by [view]) in [color]; null stops it and restores [restStroke].
     * Re-calling with the same color keeps the running animation.
     */
    fun apply(view: View, drawable: GradientDrawable, color: Int?, restStroke: Int, widthPx: Int, restWidthPx: Int) {
        @Suppress("UNCHECKED_CAST") val running = view.getTag(R_TAG) as? Pair<Int?, ValueAnimator>
        if (running?.first == color && (color == null || running?.second?.isRunning == true)) return
        running?.second?.cancel()
        if (color == null) {
            drawable.setStroke(restWidthPx, restStroke)
            view.setTag(R_TAG, null)
            return
        }
        val anim = ValueAnimator.ofFloat(0.25f, 1f).apply {
            duration = 650
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener {
                val a = (it.animatedValue as Float * 255).toInt()
                drawable.setStroke(widthPx, Color.argb(a, Color.red(color), Color.green(color), Color.blue(color)))
            }
            start()
        }
        view.setTag(R_TAG, color to anim)
        view.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(v: View) {}
            override fun onViewDetachedFromWindow(v: View) { anim.cancel(); v.setTag(R_TAG, null); v.removeOnAttachStateChangeListener(this) }
        })
    }

    private val R_TAG = "blink".hashCode()
}
