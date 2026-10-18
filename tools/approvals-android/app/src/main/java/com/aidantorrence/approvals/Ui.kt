package com.aidantorrence.approvals

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.text.TextUtils
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

fun Context.dp(v: Number): Int = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics).toInt()

object Ui {
    const val BG = 0xFF0E0E10.toInt()
    const val CARD = 0xFF171719.toInt()
    const val GREEN = 0xFF5CE38C.toInt()
    const val RED = 0xFFFF5A52.toInt()
    const val WHITE = Color.WHITE
    const val DIM = 0xB3FFFFFF.toInt()
    const val FAINT = 0x80FFFFFF.toInt()

    fun rounded(color: Int, radiusDp: Number, ctx: Context, stroke: Int? = null) = GradientDrawable().apply {
        setColor(color); cornerRadius = ctx.dp(radiusDp).toFloat()
        if (stroke != null) setStroke(ctx.dp(1), stroke)
    }

    fun text(ctx: Context, s: String, sp: Float, color: Int = WHITE, bold: Boolean = false, lines: Int = 0) =
        TextView(ctx).apply {
            text = s; setTextSize(TypedValue.COMPLEX_UNIT_SP, sp); setTextColor(color)
            if (bold) typeface = Typeface.DEFAULT_BOLD
            if (lines > 0) { maxLines = lines; ellipsize = TextUtils.TruncateAt.END }
            setLineSpacing(0f, 1.12f)
        }

    enum class Style { PRIMARY, DANGER, QUIET }

    fun button(ctx: Context, label: String, style: Style, onClick: () -> Unit) = TextView(ctx).apply {
        text = label
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
        typeface = Typeface.DEFAULT_BOLD
        gravity = Gravity.CENTER
        val (fg, bg) = when (style) {
            Style.PRIMARY -> Color.BLACK to GREEN
            Style.DANGER -> 0xFFFF7A73.toInt() to 0x33FF5A52
            Style.QUIET -> DIM to 0x14FFFFFF
        }
        setTextColor(fg); background = rounded(bg, 22, ctx)
        val h = if (style == Style.QUIET) 12 else 18
        setPadding(ctx.dp(h), ctx.dp(10), ctx.dp(h), ctx.dp(10))
        isClickable = true
        setOnClickListener { onClick() }
    }

    fun row(ctx: Context, vararg views: View, gravity: Int = Gravity.CENTER_VERTICAL) = LinearLayout(ctx).apply {
        orientation = LinearLayout.HORIZONTAL; this.gravity = gravity
        views.forEach { addView(it) }
    }

    fun spacer(ctx: Context) = View(ctx).apply { layoutParams = LinearLayout.LayoutParams(0, 1, 1f) }

    fun gap(ctx: Context, dp: Int) = View(ctx).apply { layoutParams = LinearLayout.LayoutParams(dp, dp) }

    interface CardActions {
        fun approve(item: Item)
        fun deny(item: Item)
        fun snooze(item: Item)
        fun review(item: Item)
        fun close(item: Item)
    }

    /** The approval card used by the pop-up overlay and the in-app list. */
    fun card(ctx: Context, item: Item, actions: CardActions, showClose: Boolean): View {
        val pres = Presentation(item)
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(CARD, 20, ctx, stroke = 0x1FFFFFFF)
            setPadding(ctx.dp(16), ctx.dp(14), ctx.dp(16), ctx.dp(14))
            elevation = ctx.dp(8).toFloat()
        }
        // 1. What approving does
        val dot = View(ctx).apply {
            background = rounded(Presentation.kindColor(item.kind), 5, ctx)
            layoutParams = LinearLayout.LayoutParams(ctx.dp(10), ctx.dp(10)).apply { rightMargin = ctx.dp(8) }
        }
        val headline = text(ctx, pres.headline, 16f, bold = true, lines = 1).apply {
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        val header = row(ctx, dot, headline, text(ctx, Presentation.age(item.created), 12f, FAINT))
        if (showClose) header.addView(text(ctx, "✕", 18f, FAINT).apply {
            setPadding(ctx.dp(14), 0, ctx.dp(2), 0); setOnClickListener { actions.close(item) }
        })
        root.addView(header)

        // 2. The content that goes out
        val body = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, ctx.dp(10), 0, 0)
            setOnClickListener { actions.review(item) }
        }
        pres.images.firstOrNull()?.let { (_, url) ->
            val img = ImageView(ctx).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                background = rounded(0x14FFFFFF, 10, ctx); clipToOutline = true
                layoutParams = LinearLayout.LayoutParams(ctx.dp(84), ctx.dp(105)).apply { rightMargin = ctx.dp(12) }
            }
            Images.into(img, url, 400)
            body.addView(img)
        }
        val col = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        col.addView(text(ctx, pres.displayTitle, 15f, bold = true, lines = 2))
        col.addView(text(ctx, pres.cardText(item), 14f, 0xD9FFFFFF.toInt(), lines = 5).apply { setPadding(0, ctx.dp(4), 0, 0) })
        body.addView(col)
        root.addView(body)

        // 3. Who asked and where it links
        val from = "from ${Presentation.agentName(item.source)}" +
            (pres.links.firstOrNull()?.let { " · " + Presentation.shortUrl(it.second) } ?: "")
        root.addView(text(ctx, from, 12f, FAINT, lines = 1).apply { setPadding(0, ctx.dp(10), 0, ctx.dp(12)) })

        // 4. Decide
        root.addView(row(ctx,
            button(ctx, "✓  Approve", Style.PRIMARY) { actions.approve(item) }, gap(ctx, 8),
            button(ctx, "✕  Deny", Style.DANGER) { actions.deny(item) }, spacer(ctx),
            button(ctx, "4h", Style.QUIET) { actions.snooze(item) }, gap(ctx, 6),
            button(ctx, "Review", Style.QUIET) { actions.review(item) },
        ))
        return root
    }
}
