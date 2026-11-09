package com.aidantorrence.todos

import android.content.Context
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView

object Ui {
    const val BG = 0xFF0C0C0C.toInt()
    const val CARD = 0xFF161618.toInt()
    const val CARD2 = 0xFF1F1F23.toInt()
    const val TEXT = 0xFFF2F2F2.toInt()
    const val DIM = 0xFFB4B4B8.toInt()
    const val FAINT = 0xFF77777C.toInt()
    const val GREEN = 0xFF5CE38C.toInt()
    const val RED = 0xFFFF6B6B.toInt()
    const val AMBER = 0xFFFFB454.toInt()

    fun dp(ctx: Context, v: Int) = (v * ctx.resources.displayMetrics.density).toInt()

    fun round(color: Int, radiusDp: Int, ctx: Context, stroke: Int? = null) = GradientDrawable().apply {
        setColor(color); cornerRadius = dp(ctx, radiusDp).toFloat()
        if (stroke != null) setStroke(dp(ctx, 1), stroke)
    }

    fun text(ctx: Context, s: String, size: Float, color: Int = TEXT, bold: Boolean = false, serif: Boolean = false) =
        TextView(ctx).apply {
            text = s; textSize = size; setTextColor(color)
            typeface = when {
                serif -> Typeface.create(Typeface.SERIF, if (bold) Typeface.BOLD else Typeface.NORMAL)
                bold -> Typeface.DEFAULT_BOLD
                else -> Typeface.DEFAULT
            }
            setLineSpacing(0f, 1.15f)
        }

    fun button(ctx: Context, label: String, fg: Int, bg: Int, onClick: () -> Unit) = text(ctx, label, 15f, fg, bold = true).apply {
        gravity = Gravity.CENTER
        setPadding(dp(ctx, 12), dp(ctx, 12), dp(ctx, 12), dp(ctx, 12))
        background = round(bg, 12, ctx)
        isClickable = true
        setOnClickListener { onClick() }
    }

    fun row(ctx: Context, vararg views: View) = LinearLayout(ctx).apply {
        orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
        views.forEach { addView(it) }
    }

    fun weighted(v: View, marginDp: Int = 0) = v.apply {
        layoutParams = LinearLayout.LayoutParams(0, -2, 1f).apply {
            marginStart = dp(context, marginDp); marginEnd = dp(context, marginDp)
        }
    }

    fun spacer(ctx: Context) = View(ctx).apply { layoutParams = LinearLayout.LayoutParams(0, 1, 1f) }
}
