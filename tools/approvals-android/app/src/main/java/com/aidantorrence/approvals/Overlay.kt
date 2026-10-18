package com.aidantorrence.approvals

import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * The pop-up: a card drawn over whatever app is open (TYPE_APPLICATION_OVERLAY). It stays until
 * every waiting item is approved, denied, snoozed or closed with ✕; the next one replaces it.
 */
class Overlay(private val ctx: Context, private val actions: Ui.CardActions) {
    private val wm = ctx.getSystemService(WindowManager::class.java)
    private var root: FrameLayout? = null
    private var shownId: String? = null
    private var shownCount = -1

    val canDraw: Boolean get() = Settings.canDrawOverlays(ctx)

    fun update(items: List<Item>) {
        if (items.isEmpty()) { hide(); return }
        if (!canDraw) return
        val first = items.first()
        if (root != null && shownId == first.id && shownCount == items.size) return
        val content = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(ctx.dp(10), ctx.dp(6), ctx.dp(10), ctx.dp(10))
        }
        content.addView(Ui.card(ctx, first, actions, showClose = true))
        if (items.size > 1) content.addView(TextView(ctx).apply {
            text = "1 of ${items.size} waiting"
            setTextColor(Ui.WHITE); textSize = 12f
            background = Ui.rounded(0xE6171719.toInt(), 12, ctx)
            setPadding(ctx.dp(12), ctx.dp(5), ctx.dp(12), ctx.dp(5))
            layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
                .apply { topMargin = ctx.dp(6); gravity = Gravity.END }
        })
        val isNew = shownId != first.id
        val frame = root ?: FrameLayout(ctx).also { f ->
            val lp = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT,
            ).apply {
                gravity = Gravity.TOP
                y = statusBarHeight()
                if (Build.VERSION.SDK_INT >= 31) alpha = 1f
            }
            try { wm.addView(f, lp); root = f } catch (e: Exception) { Store.lastError = "overlay: ${e.message}"; return }
        }
        frame.removeAllViews()
        frame.addView(content)
        if (isNew) {
            content.translationY = -ctx.dp(80).toFloat(); content.alpha = 0f
            content.animate().translationY(0f).alpha(1f).setDuration(260).start()
        }
        shownId = first.id; shownCount = items.size
    }

    fun hide() {
        root?.let { r -> try { wm.removeView(r) } catch (_: Exception) {} }
        root = null; shownId = null; shownCount = -1
    }

    private fun statusBarHeight(): Int {
        val id = ctx.resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (id > 0) ctx.resources.getDimensionPixelSize(id) else ctx.dp(24)
    }

    @Suppress("unused") private fun View.gone() { visibility = View.GONE }
}
