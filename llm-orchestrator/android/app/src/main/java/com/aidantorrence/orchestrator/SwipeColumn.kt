package com.aidantorrence.orchestrator

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.GradientDrawable
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import kotlin.math.abs

/**
 * A vertical card that you can swipe left to dismiss. It only takes the gesture once the drag is clearly
 * leftward and mostly horizontal, so vertical scrolling of the list and the reply box keep working, and
 * a drag that starts on a horizontally scrolling row (the chips) is left to that row.
 *
 * Every drag ends in exactly one of two states, never in between: dismissed (onSwipedLeft ran) or back at
 * rest (translationX 0, alpha 1). That holds for UP, CANCEL (e.g. the system back gesture or a list
 * rebuild stealing the touch), a new touch landing mid-animation, the view being detached, and an
 * animation that gets cancelled or never ticks: a watchdog finishes the settle if the animator does not.
 */
class SwipeColumn(ctx: Context, gap: Int, private val onSwipedLeft: () -> Unit) : LinearLayout(ctx) {
    private val slop = ViewConfiguration.get(ctx).scaledTouchSlop
    private val minFling = ViewConfiguration.get(ctx).scaledMinimumFlingVelocity * 4
    private var downX = 0f
    private var downY = 0f
    private var lastDx = 0f
    private var dragging = false
    private var ignore = false
    private var velocity: VelocityTracker? = null

    /** The in-flight settle: true = finishing a dismiss, false = snapping back, null = none. */
    private var settling: Boolean? = null
    private val watchdog = Runnable { finishSettle() }

    init {
        orientation = VERTICAL
        showDividers = SHOW_DIVIDER_MIDDLE
        dividerDrawable = GradientDrawable().apply { setSize(1, (gap * ctx.resources.displayMetrics.density).toInt()); setColor(Color.TRANSPARENT) }
    }

    override fun onInterceptTouchEvent(e: MotionEvent): Boolean {
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> onDown(e)
            MotionEvent.ACTION_MOVE -> if (maybeStartDrag(e)) return true
        }
        return false
    }

    override fun onTouchEvent(e: MotionEvent): Boolean {
        when (e.actionMasked) {
            // Claim the gesture even when it starts on a non-clickable part of the card (title, text),
            // otherwise the card never sees the MOVEs and a swipe there does nothing.
            MotionEvent.ACTION_DOWN -> { onDown(e); super.onTouchEvent(e); return true }
            MotionEvent.ACTION_MOVE -> {
                if (!dragging && !maybeStartDrag(e)) return true
                velocity?.addMovement(e)
                lastDx = (e.rawX - downX).coerceAtMost(0f)
                translationX = lastDx
                alpha = 1f - (abs(lastDx) / width.coerceAtLeast(1)).coerceIn(0f, 0.7f)
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (dragging) {
                    velocity?.addMovement(e)
                    velocity?.computeCurrentVelocity(1000)
                    val vx = velocity?.xVelocity ?: 0f
                    // CANCEL carries no usable coordinates (often 0,0): judge it by the last real MOVE.
                    val up = e.actionMasked == MotionEvent.ACTION_UP
                    if (up) lastDx = (e.rawX - downX).coerceAtMost(0f)
                    val w = width.coerceAtLeast(1)
                    val gone = if (up) abs(lastDx) > w * 0.35f || vx < -minFling else abs(lastDx) > w * 0.5f
                    settle(gone)
                }
                endGesture()
            }
        }
        return true
    }

    private fun onDown(e: MotionEvent) {
        // A new touch while a previous swipe is still animating: land that swipe first.
        if (settling != null) finishSettle()
        downX = e.rawX; downY = e.rawY; lastDx = 0f; dragging = false
        ignore = startsInHorizontalScroller(this, e.rawX.toInt(), e.rawY.toInt())
        velocity?.recycle(); velocity = VelocityTracker.obtain().also { it.addMovement(e) }
    }

    private fun maybeStartDrag(e: MotionEvent): Boolean {
        velocity?.addMovement(e)
        if (dragging) return true
        val dx = e.rawX - downX
        val dy = e.rawY - downY
        if (!ignore && dx < -slop && abs(dx) > abs(dy) * 1.5f) {
            dragging = true
            parent?.requestDisallowInterceptTouchEvent(true)
            return true
        }
        return false
    }

    private fun endGesture() {
        dragging = false
        parent?.requestDisallowInterceptTouchEvent(false)
        velocity?.recycle(); velocity = null
    }

    private fun settle(gone: Boolean) {
        animate().cancel()
        removeCallbacks(watchdog)
        settling = gone
        animate().translationX(if (gone) -width.toFloat() else 0f).alpha(if (gone) 0f else 1f).setDuration(160)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(a: Animator) { finishSettle() }
                override fun onAnimationCancel(a: Animator) { finishSettle() }
            }).start()
        // If the animator is cancelled silently or never runs (detached, animations off), still land it.
        postDelayed(watchdog, 600)
    }

    /** Idempotent: completes whatever settle is in flight and leaves the card at rest. */
    private fun finishSettle(deferDismiss: Boolean = false) {
        val gone = settling ?: return
        settling = null
        removeCallbacks(watchdog)
        animate().setListener(null)
        animate().cancel()
        translationX = 0f; alpha = 1f
        if (gone) {
            // Never mutate the list from inside a detach pass: run the dismiss on the next loop.
            if (deferDismiss) android.os.Handler(android.os.Looper.getMainLooper()).post { onSwipedLeft() } else onSwipedLeft()
        }
    }

    /** Safety net for list refreshes: a card that is not being touched or animated must be at rest. */
    fun ensureAtRest() {
        if (dragging || settling != null) return
        if (translationX != 0f || alpha != 1f) { animate().cancel(); translationX = 0f; alpha = 1f }
    }

    override fun onDetachedFromWindow() {
        // Removed mid-swipe (list rebuilt, panel collapsed): never come back half off-screen.
        finishSettle(deferDismiss = true)
        if (dragging) endGesture()
        ensureAtRest()
        super.onDetachedFromWindow()
    }

    private fun startsInHorizontalScroller(v: View, x: Int, y: Int): Boolean {
        if (v !== this && v is HorizontalScrollView && v.canScrollHorizontally(1).or(v.canScrollHorizontally(-1))) {
            val r = Rect(); v.getGlobalVisibleRect(r)
            if (r.contains(x, y)) return true
        }
        if (v is ViewGroup) for (i in 0 until v.childCount) if (startsInHorizontalScroller(v.getChildAt(i), x, y)) return true
        return false
    }
}
