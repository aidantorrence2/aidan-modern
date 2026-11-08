package com.aidantorrence.orchestrator

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
 */
class SwipeColumn(ctx: Context, gap: Int, private val onSwipedLeft: () -> Unit) : LinearLayout(ctx) {
    private val slop = ViewConfiguration.get(ctx).scaledTouchSlop
    private val minFling = ViewConfiguration.get(ctx).scaledMinimumFlingVelocity * 4
    private var downX = 0f
    private var downY = 0f
    private var dragging = false
    private var ignore = false
    private var velocity: VelocityTracker? = null

    init {
        orientation = VERTICAL
        showDividers = SHOW_DIVIDER_MIDDLE
        dividerDrawable = GradientDrawable().apply { setSize(1, (gap * ctx.resources.displayMetrics.density).toInt()); setColor(Color.TRANSPARENT) }
    }

    override fun onInterceptTouchEvent(e: MotionEvent): Boolean {
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                downX = e.rawX; downY = e.rawY; dragging = false
                ignore = startsInHorizontalScroller(this, e.rawX.toInt(), e.rawY.toInt())
                velocity?.recycle(); velocity = VelocityTracker.obtain().also { it.addMovement(e) }
            }
            MotionEvent.ACTION_MOVE -> {
                velocity?.addMovement(e)
                val dx = e.rawX - downX
                val dy = e.rawY - downY
                if (!ignore && dx < -slop && abs(dx) > abs(dy) * 1.5f) {
                    dragging = true
                    parent?.requestDisallowInterceptTouchEvent(true)
                    return true
                }
            }
        }
        return false
    }

    override fun onTouchEvent(e: MotionEvent): Boolean {
        if (!dragging) return super.onTouchEvent(e)
        velocity?.addMovement(e)
        val dx = (e.rawX - downX).coerceAtMost(0f)
        when (e.actionMasked) {
            MotionEvent.ACTION_MOVE -> {
                translationX = dx
                alpha = 1f - (abs(dx) / width.coerceAtLeast(1)).coerceIn(0f, 0.7f)
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                velocity?.computeCurrentVelocity(1000)
                val vx = velocity?.xVelocity ?: 0f
                val gone = e.actionMasked == MotionEvent.ACTION_UP && (abs(dx) > width * 0.35f || vx < -minFling)
                if (gone) {
                    animate().translationX(-width.toFloat()).alpha(0f).setDuration(160).withEndAction {
                        onSwipedLeft()
                        translationX = 0f; alpha = 1f
                    }.start()
                } else {
                    animate().translationX(0f).alpha(1f).setDuration(160).start()
                }
                dragging = false
                parent?.requestDisallowInterceptTouchEvent(false)
                velocity?.recycle(); velocity = null
            }
        }
        return true
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
