package com.aidantorrence.todos

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.GestureDetector
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.math.abs

/**
 * The expanded bubble: today's to-dos as an Anki-style deck.
 * Front: the task. Tap (or "Show") to flip: why it matters and the first step.
 * Then grade it: Again (comes back in two cards), Later (bottom of the deck), Done (+points, combo).
 * Swipe right = Done, swipe left = Again.
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

    private var flipped = false
    private var shownId: String? = null
    private var lastDone: Todo? = null
    private var busy = false
    private var face: View? = null

    fun render() {
        if (busy) return
        root.removeAllViews()
        val deck = Game.deck()
        val total = Game.total
        val doneCount = total - deck.size
        face = null
        if (deck.firstOrNull()?.id != shownId) { flipped = false; shownId = deck.firstOrNull()?.id }

        // Header: progress, streak, points, minimize.
        val title = Ui.text(ctx, if (total == 0) "Today" else "Today · $doneCount/$total", 17f, bold = true)
        val streak = Game.streak
        val stats = Ui.text(ctx, listOfNotNull(
            if (streak > 0) "🔥 $streak" else null,
            "★ ${Game.points}",
            if (Game.combo >= 2) "×${Game.combo}" else null,
        ).joinToString("   "), 14f, Ui.DIM).apply { setPadding(0, 0, dp(12), 0) }
        val min = Ui.text(ctx, "—", 20f, Ui.DIM, bold = true).apply {
            setPadding(dp(10), 0, dp(4), dp(4)); setOnClickListener { onCollapse() }
        }
        root.addView(Ui.row(ctx, title, Ui.spacer(ctx), stats, min))

        // Segmented progress bar: one segment per card.
        if (total > 0) {
            val bar = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, dp(12)) }
            val doneIds = Game.done
            Game.list?.items?.forEach { t ->
                val color = when { t.id in doneIds -> Ui.GREEN; t.id == shownId -> Ui.TEXT; else -> 0xFF2E2E33.toInt() }
                bar.addView(View(ctx).apply {
                    background = Ui.round(color, 3, ctx)
                    layoutParams = LinearLayout.LayoutParams(0, dp(5), 1f).apply { marginEnd = dp(3) }
                })
            }
            root.addView(bar)
        }

        when {
            total == 0 -> empty()
            deck.isEmpty() -> cleared()
            else -> card(deck.first(), deck.size)
        }

        val list = Game.list
        val stale = list != null && list.date != Game.today()
        val foot = when {
            Game.lastError != null -> Game.lastError!!
            stale -> "List is from ${list!!.date} · the new one arrives each morning"
            else -> list?.let { "Built ${it.generated.take(16).replace('T', ' ')} UTC" } ?: ""
        }
        if (foot.isNotEmpty()) root.addView(Ui.text(ctx, foot, 11f, if (Game.lastError != null) Ui.AMBER else Ui.FAINT).apply {
            setPadding(0, dp(10), 0, 0); gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(-1, -2)
        })
    }

    private fun card(t: Todo, left: Int) {
        val face = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = Ui.round(if (flipped) Ui.CARD2 else Ui.CARD, 18, ctx)
            setPadding(dp(18), dp(16), dp(18), dp(18))
            minimumHeight = dp(210)
            cameraDistance = 12000 * resources.displayMetrics.density
        }
        val meta = listOfNotNull("#${t.rank}", if (t.minutes > 0) "~${t.minutes} min" else null, t.source.ifBlank { null }).joinToString("  ·  ")
        face.addView(Ui.text(ctx, meta, 12f, Ui.FAINT))
        face.addView(Ui.text(ctx, t.title, if (flipped) 17f else 23f, Ui.TEXT, bold = true, serif = true).apply { setPadding(0, dp(10), 0, dp(6)) })
        if (!flipped) {
            face.addView(Ui.spacer(ctx).apply { layoutParams = LinearLayout.LayoutParams(1, 0, 1f) })
            face.addView(Ui.text(ctx, "tap to flip  ·  $left left", 12f, Ui.FAINT).apply {
                gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2)
            })
        } else {
            if (t.why.isNotBlank()) {
                face.addView(Ui.text(ctx, "WHY", 11f, Ui.FAINT, bold = true).apply { setPadding(0, dp(8), 0, dp(2)) })
                face.addView(Ui.text(ctx, t.why, 15f, Ui.DIM))
            }
            if (t.nextStep.isNotBlank()) {
                face.addView(Ui.text(ctx, "FIRST STEP", 11f, Ui.GREEN, bold = true).apply { setPadding(0, dp(12), 0, dp(2)) })
                face.addView(Ui.text(ctx, t.nextStep, 16f, Ui.TEXT))
            }
        }
        this.face = face
        val holder = FrameLayout(ctx).apply { addView(face, FrameLayout.LayoutParams(-1, -2)) }
        attachGestures(face, t)
        root.addView(holder, LinearLayout.LayoutParams(-1, -2))

        val buttons = if (!flipped) Ui.row(ctx,
            Ui.weighted(Ui.button(ctx, "Later", Ui.DIM, Ui.CARD) { animateOut(face, -1) { Game.later(t) } }, 4),
            Ui.weighted(Ui.button(ctx, "Show", Ui.BG, Ui.TEXT) { flip(face) }, 4),
        ) else Ui.row(ctx,
            Ui.weighted(Ui.button(ctx, "Again", Ui.RED, Ui.CARD) { animateOut(face, -1) { Game.again(t) } }, 4),
            Ui.weighted(Ui.button(ctx, "Later", Ui.DIM, Ui.CARD) { animateOut(face, -1) { Game.later(t) } }, 4),
            Ui.weighted(Ui.button(ctx, "Done ✓", Ui.BG, Ui.GREEN) { complete(face, t) }, 4),
        )
        buttons.setPadding(0, dp(14), 0, 0)
        root.addView(buttons, LinearLayout.LayoutParams(-1, -2))

        lastDone?.let { d ->
            root.addView(Ui.text(ctx, "Undo “${d.title.take(32)}${if (d.title.length > 32) "…" else ""}”", 12f, Ui.FAINT).apply {
                setPadding(0, dp(10), 0, 0); gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(-1, -2)
                setOnClickListener { lastDone = null; Game.undo(d) }
            })
        }
    }

    private fun attachGestures(face: View, t: Todo) {
        val g = GestureDetector(ctx, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(e: MotionEvent) = true
            override fun onSingleTapUp(e: MotionEvent): Boolean { flip(face); return true }
            override fun onFling(e1: MotionEvent?, e2: MotionEvent, vx: Float, vy: Float): Boolean {
                if (abs(vx) < abs(vy) || abs(vx) < 600) return false
                if (vx > 0) complete(face, t) else animateOut(face, -1) { Game.again(t) }
                return true
            }
        })
        face.setOnTouchListener { _, e -> g.onTouchEvent(e) }
    }

    private fun flip(face: View) {
        if (busy) return
        busy = true
        face.animate().rotationY(90f).setDuration(120).setListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(a: Animator) {
                face.animate().setListener(null)
                busy = false; flipped = !flipped; render()
                // The new face starts edge-on and turns in.
                this@GamePanel.face?.let { nf ->
                    nf.rotationY = -90f; nf.animate().rotationY(0f).setDuration(120).start()
                }
            }
        }).start()
    }

    private fun complete(face: View, t: Todo) {
        if (busy) return
        val gained = Game.markDone(t).also { buzz() }
        lastDone = t
        // Keep the card on screen for the slide-out; Game already moved on.
        busy = true
        face.animate().translationX(face.width * 1.2f).rotation(8f).alpha(0f).setDuration(220)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(a: Animator) {
                    face.animate().setListener(null); busy = false; render(); toast("+$gained")
                }
            }).start()
    }

    private fun animateOut(face: View, dir: Int, then: () -> Unit) {
        if (busy) return
        busy = true
        face.animate().translationX(dir * face.width * 1.2f).rotation(dir * 6f).alpha(0f).setDuration(200)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(a: Animator) { face.animate().setListener(null); busy = false; then(); render() }
            }).start()
    }

    private fun toast(s: String) {
        val tv = Ui.text(ctx, s, 22f, Ui.GREEN, bold = true).apply { gravity = Gravity.CENTER }
        val holder = (0 until root.childCount).map { root.getChildAt(it) }.firstOrNull { it is FrameLayout } as? FrameLayout ?: return
        holder.addView(tv, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER))
        tv.animate().translationY(-dp(50).toFloat()).alpha(0f).setDuration(700).withEndAction { holder.removeView(tv) }.start()
    }

    private fun empty() {
        root.addView(Ui.text(ctx, "No list yet", 20f, bold = true, serif = true).apply { setPadding(0, dp(18), 0, dp(6)) })
        root.addView(Ui.text(ctx, "Today's top 10 arrives each morning.", 14f, Ui.DIM))
        root.addView(Ui.button(ctx, "Check now", Ui.BG, Ui.TEXT) { onRefresh() }.apply {
            layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(16) }
        })
    }

    private fun cleared() {
        lastDone = null
        root.addView(Ui.text(ctx, "🎉", 44f).apply { gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2); setPadding(0, dp(8), 0, 0) })
        root.addView(Ui.text(ctx, "Deck cleared", 22f, Ui.GREEN, bold = true, serif = true).apply {
            gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2)
        })
        root.addView(Ui.text(ctx, "All ${Game.total} done · ★ ${Game.points} · 🔥 ${Game.streak}-day streak", 14f, Ui.DIM).apply {
            gravity = Gravity.CENTER; layoutParams = LinearLayout.LayoutParams(-1, -2); setPadding(0, dp(6), 0, dp(6))
        })
        val doneList = Game.list?.items ?: emptyList()
        for (t in doneList) root.addView(Ui.text(ctx, "✓  ${t.title}", 13f, Ui.FAINT).apply { setPadding(0, dp(3), 0, 0) })
    }

    private fun buzz() {
        try {
            ctx.getSystemService(Vibrator::class.java)?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
        } catch (_: Exception) {}
    }
}
