package com.aidantorrence.todos

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.view.View

/** The collapsed bubble: a dark circle, a green progress ring (done / total) and the cards due now (… while cards are away). */
class BubbleView(ctx: Context) : View(ctx) {
    var remaining = 0; var total = 0
    var stale = false   // list is from another day or missing: dim ring

    private val d = ctx.resources.displayMetrics.density
    private val bg = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Ui.CARD }
    private val track = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 4 * d; color = 0xFF2E2E33.toInt() }
    private val ring = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 4 * d; strokeCap = Paint.Cap.ROUND; color = Ui.GREEN }
    private val txt = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Ui.TEXT; textAlign = Paint.Align.CENTER; typeface = Typeface.DEFAULT_BOLD; textSize = 20 * d }
    private val oval = RectF()

    init { elevation = 8 * d }

    var done = 0

    /** remaining = cards to study right now; done / total drives the ring. */
    fun set(remaining: Int, done: Int, total: Int, stale: Boolean) {
        this.remaining = remaining; this.done = done; this.total = total; this.stale = stale; invalidate()
    }

    override fun onMeasure(w: Int, h: Int) { val s = (56 * d).toInt(); setMeasuredDimension(s, s) }

    override fun onDraw(c: Canvas) {
        val r = width / 2f
        c.drawCircle(r, r, r - 1, bg)
        val inset = 5 * d
        oval.set(inset, inset, width - inset, height - inset)
        c.drawArc(oval, 0f, 360f, false, track)
        if (total > 0) {
            ring.color = if (stale) Ui.FAINT else Ui.GREEN
            c.drawArc(oval, -90f, 360f * done / total, false, ring)
        }
        val label = when { total == 0 -> "·"; done >= total -> "✓"; remaining == 0 -> "…"; else -> remaining.toString() }
        txt.color = if (done >= total && total > 0) Ui.GREEN else Ui.TEXT
        c.drawText(label, r, r - (txt.descent() + txt.ascent()) / 2, txt)
    }
}
