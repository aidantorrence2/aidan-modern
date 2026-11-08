package com.aidantorrence.orchestrator

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

/** Tiny programmatic UI kit (dark theme matching the portfolio: #0c0c0c, white, Georgia-ish serif accents). */
object Ui {
    val BG = Color.parseColor("#0C0C0C")
    val CARD = Color.parseColor("#17171A")
    val CARD_HI = Color.parseColor("#1F1F24")
    val LINE = Color.parseColor("#2A2A30")
    val TEXT = Color.WHITE
    val MUTED = Color.parseColor("#9A9AA2")
    val ACCENT = Color.parseColor("#E8C26B")
    val GOOD = Color.parseColor("#6BD49A")
    val BAD = Color.parseColor("#F07A7A")

    fun sourceColor(source: String) = when (source) {
        "claude-code", "claude-code-cloud", "claude-code-rc", "claude-app", "claude-web" -> Color.parseColor("#D97757")
        "codex" -> Color.parseColor("#7AA2F7")
        "chatgpt" -> Color.parseColor("#10A37F")
        else -> MUTED
    }

    fun Context.dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    fun View.dp(v: Int) = context.dp(v)
    fun Context.dpf(v: Float) = v * resources.displayMetrics.density

    fun rounded(ctx: Context, color: Int, radiusDp: Int = 12, stroke: Int? = null) = GradientDrawable().apply {
        setColor(color)
        cornerRadius = ctx.dpf(radiusDp.toFloat())
        if (stroke != null) setStroke(ctx.dp(1), stroke)
    }

    fun text(ctx: Context, s: CharSequence = "", size: Float = 14f, color: Int = TEXT, bold: Boolean = false, serif: Boolean = false) =
        TextView(ctx).apply {
            text = s
            setTextColor(color)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
            typeface = Typeface.create(if (serif) Typeface.SERIF else Typeface.SANS_SERIF, if (bold) Typeface.BOLD else Typeface.NORMAL)
        }

    fun button(ctx: Context, label: String, primary: Boolean = false, onClick: () -> Unit) = Button(ctx).apply {
        text = label
        isAllCaps = false
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
        setTextColor(if (primary) BG else TEXT)
        background = rounded(ctx, if (primary) ACCENT else CARD_HI, 18, if (primary) null else LINE)
        backgroundTintList = null
        minHeight = 0; minimumHeight = 0; minWidth = 0; minimumWidth = 0
        with(ctx) { setPadding(dp(14), dp(7), dp(14), dp(7)) }
        stateListAnimator = null
        setOnClickListener { onClick() }
    }

    fun chip(ctx: Context, label: String, color: Int = MUTED, onClick: (() -> Unit)? = null) = TextView(ctx).apply {
        text = label
        setTextColor(color)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
        with(ctx) { setPadding(dp(10), dp(4), dp(10), dp(4)) }
        background = rounded(ctx, Color.TRANSPARENT, 14, color)
        maxLines = 1
        if (onClick != null) setOnClickListener { onClick() }
    }

    fun input(ctx: Context, hint: String, multiLine: Boolean = false) = EditText(ctx).apply {
        this.hint = hint
        setHintTextColor(MUTED)
        setTextColor(TEXT)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
        background = rounded(ctx, BG, 10, LINE)
        backgroundTintList = ColorStateList.valueOf(LINE)
        with(ctx) { setPadding(dp(10), dp(8), dp(10), dp(8)) }
        if (multiLine) {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            maxLines = 6
            gravity = Gravity.TOP or Gravity.START
        } else {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            maxLines = 1
        }
    }

    fun row(ctx: Context, gap: Int = 6) = LinearLayout(ctx).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        showDividers = LinearLayout.SHOW_DIVIDER_MIDDLE
        dividerDrawable = GradientDrawable().apply { setSize(ctx.dp(gap), 1); setColor(Color.TRANSPARENT) }
    }

    fun column(ctx: Context, gap: Int = 8) = LinearLayout(ctx).apply {
        orientation = LinearLayout.VERTICAL
        showDividers = LinearLayout.SHOW_DIVIDER_MIDDLE
        dividerDrawable = GradientDrawable().apply { setSize(1, ctx.dp(gap)); setColor(Color.TRANSPARENT) }
    }

    fun lp(w: Int = ViewGroup.LayoutParams.MATCH_PARENT, h: Int = ViewGroup.LayoutParams.WRAP_CONTENT, weight: Float = 0f) =
        LinearLayout.LayoutParams(w, h, weight)

    val WRAP = ViewGroup.LayoutParams.WRAP_CONTENT
    val MATCH = ViewGroup.LayoutParams.MATCH_PARENT

    fun spacer(ctx: Context) = View(ctx).apply { layoutParams = LinearLayout.LayoutParams(0, 1, 1f) }

    fun ago(ts: Long): String {
        val s = (System.currentTimeMillis() - ts) / 1000
        return when {
            s < 60 -> "now"
            s < 3600 -> "${s / 60}m"
            s < 86400 -> "${s / 3600}h"
            else -> "${s / 86400}d"
        }
    }
}
