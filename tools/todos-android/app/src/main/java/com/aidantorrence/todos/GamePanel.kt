package com.aidantorrence.todos

import android.content.Context
import android.graphics.Typeface
import android.os.VibrationEffect
import android.os.Vibrator
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.text.style.UnderlineSpan
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView

/**
 * The expanded bubble: today's to-dos studied the way Anki studies a deck.
 * Question side: the to-do. "Show Answer" reveals the first step and why under a divider.
 * Then rate it: Again (1 min), Hard (10 min), Good (1 h) send the card away and it comes back when
 * its time is up; Done retires it. Counts at the top: new (blue), learning (red), done (green).
 */
class GamePanel(
    private val ctx: Context,
    private val onCollapse: () -> Unit,
    private val onRefresh: () -> Unit,
) {
    private fun dp(v: Int) = Ui.dp(ctx, v)

    val root = LinearLayout(ctx).apply {
        orientation = LinearLayout.VERTICAL
        background = Ui.round(Ui.BG, 22, ctx, stroke = 0xFF2A2A2E.toInt())
        elevation = dp(12).toFloat()
        setPadding(dp(16), dp(14), dp(16), dp(16))
    }

    private var answerShown = false
    private var shownId: String? = null
    private var lastDone: Todo? = null

    fun render() {
        root.removeAllViews()
        val deck = Game.deck()
        val card = deck.firstOrNull()
        if (card?.id != shownId) { answerShown = false; shownId = card?.id }

        // Top bar: deck name, the three Anki counts (current card's kind underlined), minimize.
        val (new, learning, done) = Game.counts()
        val isLearning = card != null && card.id in Game.seen
        val counts = SpannableStringBuilder()
        fun add(n: Int, color: Int, underline: Boolean) {
            val start = counts.length; counts.append(n.toString())
            counts.setSpan(ForegroundColorSpan(color), start, counts.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            if (underline) counts.setSpan(UnderlineSpan(), start, counts.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            counts.append("   ")
        }
        add(new, BLUE, card != null && !isLearning); add(learning, Ui.RED, isLearning); add(done, Ui.GREEN, false)
        val countsView = TextView(ctx).apply { text = counts; textSize = 16f; typeface = Typeface.DEFAULT_BOLD }
        val min = Ui.text(ctx, "—", 20f, Ui.DIM, bold = true).apply {
            setPadding(dp(14), 0, dp(4), dp(4)); setOnClickListener { onCollapse() }
        }
        root.addView(Ui.row(ctx, Ui.text(ctx, "Today", 17f, bold = true), Ui.spacer(ctx), countsView, min))

        when {
            Game.total == 0 -> empty()
            card == null -> finished()
            else -> study(card)
        }

        val list = Game.list
        val stale = list != null && list.date != Game.today()
        val foot = when {
            Game.lastError != null -> Game.lastError!!
            stale -> "List is from ${list!!.date} · the new one arrives each morning"
            else -> ""
        }
        if (foot.isNotEmpty()) root.addView(Ui.text(ctx, foot, 11f, if (Game.lastError != null) Ui.AMBER else Ui.FAINT).apply {
            setPadding(0, dp(10), 0, 0); gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(-1, -2)
        })
    }

    private fun study(t: Todo) {
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = Ui.round(Ui.CARD, 16, ctx)
            setPadding(dp(18), dp(22), dp(18), dp(22))
            minimumHeight = dp(200)
            gravity = Gravity.CENTER_VERTICAL
            if (!answerShown) setOnClickListener { answerShown = true; render() }
        }
        fun centered(v: TextView) = v.apply { gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2) }
        card.addView(centered(Ui.text(ctx, t.title, 22f, Ui.TEXT, bold = true, serif = true)))
        if (answerShown) {
            card.addView(View(ctx).apply {
                setBackgroundColor(0xFF3A3A40.toInt())
                layoutParams = LinearLayout.LayoutParams(-1, dp(1)).apply { topMargin = dp(16); bottomMargin = dp(16) }
            })
            if (t.nextStep.isNotBlank()) card.addView(centered(Ui.text(ctx, t.nextStep, 17f, Ui.TEXT)))
            if (t.why.isNotBlank()) card.addView(centered(Ui.text(ctx, t.why, 14f, Ui.DIM)).apply { setPadding(0, dp(12), 0, 0) })
            val meta = listOfNotNull(if (t.minutes > 0) "~${t.minutes} min" else null, t.source.ifBlank { null }).joinToString("  ·  ")
            if (meta.isNotEmpty()) card.addView(centered(Ui.text(ctx, meta, 12f, Ui.FAINT)).apply { setPadding(0, dp(12), 0, 0) })
        }
        root.addView(card, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(12) })

        val buttons = if (!answerShown) {
            Ui.button(ctx, "Show Answer", Ui.TEXT, 0xFF2A2A2E.toInt()) { answerShown = true; render() }
        } else Ui.row(ctx,
            grade("1m", "Again", Ui.RED) { Game.answer(t, 1) },
            grade("10m", "Hard", Ui.AMBER) { Game.answer(t, 10) },
            grade("1h", "Good", Ui.GREEN) { Game.answer(t, 60) },
            grade("✓", "Done", BLUE) { lastDone = t; buzz(); Game.markDone(t) },
        )
        root.addView(buttons, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(12) })
        undoLink()
    }

    /** One answer button: when the card comes back, on top of the rating, like Anki's. */
    private fun grade(time: String, label: String, color: Int, onClick: () -> Unit) = LinearLayout(ctx).apply {
        orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER
        background = Ui.round(0xFF1F1F23.toInt(), 12, ctx)
        setPadding(dp(4), dp(8), dp(4), dp(10))
        addView(Ui.text(ctx, time, 12f, Ui.DIM).apply { gravity = Gravity.CENTER })
        addView(Ui.text(ctx, label, 15f, color, bold = true).apply { gravity = Gravity.CENTER })
        layoutParams = LinearLayout.LayoutParams(0, -2, 1f).apply { marginStart = dp(3); marginEnd = dp(3) }
        setOnClickListener { onClick() }
    }

    private fun undoLink() {
        val d = lastDone ?: return
        if (d.id !in Game.done) { lastDone = null; return }
        root.addView(Ui.text(ctx, "Undo “${d.title.take(32)}${if (d.title.length > 32) "…" else ""}”", 12f, Ui.FAINT).apply {
            setPadding(0, dp(10), 0, 0); gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(-1, -2)
            setOnClickListener { lastDone = null; Game.undo(d) }
        })
    }

    private fun empty() {
        root.addView(Ui.text(ctx, "No list yet", 20f, bold = true, serif = true).apply { setPadding(0, dp(18), 0, dp(6)) })
        root.addView(Ui.text(ctx, "Today's top 10 arrives each morning.", 14f, Ui.DIM))
        root.addView(Ui.button(ctx, "Check now", Ui.BG, Ui.TEXT) { onRefresh() }.apply {
            layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(16) }
        })
    }

    /** Nothing to study right now: either waiting cards are still away, or the whole deck is done. */
    private fun finished() {
        val next = Game.nextDue()
        fun centered(v: TextView) = v.apply { gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2) }
        root.addView(centered(Ui.text(ctx, "Congratulations!", 22f, Ui.TEXT, bold = true, serif = true)).apply { setPadding(0, dp(22), 0, dp(6)) })
        val (_, learning, done) = Game.counts()
        val msg = if (next == null) "You have finished today's deck: all $done done."
        else {
            val mins = ((next - System.currentTimeMillis()) / 60_000L + 1).coerceAtLeast(1)
            "You have finished this deck for now.\n$learning ${if (learning == 1) "card comes" else "cards come"} back, the next in ${if (mins >= 60) "${mins / 60} h ${mins % 60} min" else "$mins min"}."
        }
        root.addView(centered(Ui.text(ctx, msg, 14f, Ui.DIM)).apply { setPadding(0, 0, 0, dp(12)) })
        undoLink()
    }

    private fun buzz() {
        try {
            ctx.getSystemService(Vibrator::class.java)?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
        } catch (_: Exception) {}
    }

    companion object { const val BLUE = 0xFF5AA9FF.toInt() }
}
