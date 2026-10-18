package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Illustrated props for The 7 Habits of Highly Effective People. */
object SevenHabitsProps {

    /** Iceberg at the waterline (origin). Key "sub" reveals the huge mass below the surface. */
    class Iceberg : Prop() {
        override val defaults = mapOf("sub" to 0f)
        override fun DrawScope.render(s: PropState) {
            val sub = s["sub"]
            val under = Path().apply {
                moveTo(-52f, 0f); lineTo(-118f, 34f); lineTo(-104f, 92f); lineTo(-30f, 128f); lineTo(46f, 122f)
                lineTo(116f, 78f); lineTo(104f, 22f); lineTo(56f, 0f); close()
            }
            drawPath(under, Brush.verticalGradient(listOf(Color(0xFFBFE8FF).a(0.85f * sub), Color(0xFF3E7FC1).a(0.75f * sub)), 0f, 128f))
            drawPath(under, Color.White.a(0.35f * sub), style = Stroke(1.5f))
            drawRect(Brush.verticalGradient(listOf(Color(0xFF2F78C4).a(0.5f), Color(0xFF0E2A55).a(0.7f)), 0f, 140f), Offset(-230f, 0f), Size(460f, 140f))
            val wave = Path().apply {
                moveTo(-230f, 0f)
                var x = -230f
                while (x <= 230f) { lineTo(x, 2.5f * sin(x * 0.06f + s.t * 2f)); x += 6f }
            }
            drawPath(wave, Color.White.a(0.7f), style = roundStroke(2f))
            val tip = Path().apply {
                moveTo(-50f, 0f); lineTo(-30f, -40f); lineTo(-12f, -36f); lineTo(4f, -72f); lineTo(22f, -50f); lineTo(36f, -54f); lineTo(54f, 0f); close()
            }
            drawPath(tip, Brush.linearGradient(listOf(Color.White, Color(0xFFCFEAFF), Color(0xFF8FC3EE)), Offset(-30f, -70f), Offset(40f, 0f)))
            drawPath(Path().apply { moveTo(4f, -72f); lineTo(10f, -30f); lineTo(22f, -50f); close() }, Color(0xFF9CC9EE).a(0.7f))
        }
    }

    /** Folded paper map. Key "right" swaps a looping, lost route for a straight one to the X. */
    class RouteMap : Prop() {
        override val defaults = mapOf("right" to 0f)
        override fun DrawScope.render(s: PropState) {
            val r = s["right"]
            softShadow(0f, 34f, 90f, 10f)
            for (k in 0..2) {
                val x = -45f + k * 30f
                drawRect(shade(if (k % 2 == 0) Color(0xFFF3E7C9) else Color(0xFFE6D6B0), -30f, 30f), Offset(x, -30f), Size(30f, 60f))
            }
            drawLine(Color(0xFF7CC4F5), Offset(-45f, 12f), Offset(45f, -6f), 4f)
            drawCircle(Pal.Leaf.a(0.6f), 9f, Offset(-24f, -14f))
            val wrong = Path().apply { moveTo(-36f, 22f); cubicTo(-10f, -30f, 20f, 30f, -6f, 4f); cubicTo(-24f, -10f, -10f, -22f, 4f, -16f) }
            val right = Path().apply { moveTo(-36f, 22f); quadraticTo(0f, 10f, 30f, -18f) }
            drawPath(wrong, Pal.Coral.a(1f - r), style = Stroke(2.4f, cap = StrokeCap.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 4f))))
            drawPath(right, Pal.Mint.a(r), style = Stroke(2.8f, cap = StrokeCap.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 4f))))
            drawLine(Pal.Coral, Offset(25f, -23f), Offset(35f, -13f), 3f, StrokeCap.Round)
            drawLine(Pal.Coral, Offset(35f, -23f), Offset(25f, -13f), 3f, StrokeCap.Round)
        }
    }

    /** A big pause button. Key "press" pushes it down; it glows while pressed. */
    class PauseButton(val color: Color = Pal.Mint) : Prop() {
        override val defaults = mapOf("press" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["press"]
            glow(color, Offset(0f, 0f), 60f, 0.25f + 0.35f * p * (0.7f + 0.3f * sin(s.t * 4f)))
            softShadow(0f, 34f, 70f, 10f)
            drawCircle(color.darken(0.45f), 30f, Offset(0f, 6f))
            drawCircle(Brush.radialGradient(listOf(color.lighten(0.3f), color, color.darken(0.2f)), Offset(-8f, -8f + 4f * p), 40f), 30f, Offset(0f, 4f * p))
            drawRoundRect(Color.White, Offset(-11f, -12f + 4f * p), Size(7f, 24f), CornerRadius(2f))
            drawRoundRect(Color.White, Offset(4f, -12f + 4f * p), Size(7f, 24f), CornerRadius(2f))
        }
    }

    /** Circle of concern with a circle of influence inside it. Key "inf" = influence radius as a fraction of [r]. */
    class Circles(
        val r: Float = 90f, val outer: List<String>, val inner: List<String>,
        val concern: Color = Pal.Slate, val influence: Color = Pal.Mint,
    ) : Prop() {
        override val defaults = mapOf("inf" to 0.4f)
        override fun DrawScope.render(s: PropState) {
            drawCircle(concern.a(0.16f), r, Offset.Zero)
            drawCircle(concern, r, Offset.Zero, style = Stroke(2.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(7f, 5f), s.t * 6f)))
            outer.forEachIndexed { i, l ->
                val a = if (outer.size == 1) -1.6f else -2.55f + i * (1.9f / max(1, outer.size - 1).toFloat())
                val p = polar(Offset.Zero, r * 0.84f, a)
                label(s.m, l, p.x, p.y, 9f, Color.White.a(0.85f), 600, maxWidth = 64f)
            }
            label(s.m, "CONCERN", 0f, r - 11f, 8.5f, concern.lighten(0.35f), 800, letterSpacing = 1f)
            val ri = r * s["inf"]
            glow(influence, Offset.Zero, ri * 1.4f, 0.35f)
            drawCircle(shade(influence, -ri, ri, 0.2f, 0.25f), ri, Offset.Zero)
            drawCircle(Color.White.a(0.35f), ri, Offset.Zero, style = Stroke(1.5f))
            if (ri > 30f) {
                label(s.m, "INFLUENCE", 0f, -ri * 0.42f, 8f, Pal.Ink, 900, letterSpacing = 0.8f)
                inner.forEachIndexed { i, l -> label(s.m, l, 0f, -ri * 0.05f + i * 12f, 9f, Pal.Ink, 700, maxWidth = ri * 1.7f) }
            }
        }
    }

    /** Wooden lectern with a little microphone. Origin = floor. */
    class Podium : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 90f, 12f)
            val body = Path().apply { moveTo(-30f, 0f); lineTo(-24f, -56f); lineTo(24f, -56f); lineTo(30f, 0f); close() }
            drawPath(body, shade(Pal.Wood, -56f, 0f, 0.15f, 0.3f))
            drawRoundRect(shade(Pal.Wood.lighten(0.1f), -66f, -54f), Offset(-36f, -66f), Size(72f, 12f), CornerRadius(3f))
            drawRect(Pal.Wood.darken(0.35f), Offset(-10f, -40f), Size(20f, 22f))
            drawLine(Pal.Steel, Offset(14f, -66f), Offset(8f, -86f), 2f)
            drawRoundRect(Pal.Ink, Offset(4f, -94f), Size(8f, 11f), CornerRadius(4f))
        }
    }

    /** A vase of flowers. Origin = vase base. */
    class Flowers(val colors: List<Color> = listOf(Pal.Rose, Color.White, Pal.Gold)) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 36f, 6f)
            for (i in 0 until 5) {
                val a = -1.97f + i * 0.2f
                val tip = polar(Offset(0f, -18f), 30f, a)
                drawLine(Pal.Leaf.darken(0.2f), Offset(0f, -18f), tip, 2f)
                for (k in 0 until 5) drawCircle(colors[i % colors.size], 4f, polar(tip, 4.5f, k * TAU / 5f + s.t * 0.2f))
                drawCircle(Pal.Gold, 2.6f, tip)
            }
            val vase = Path().apply { moveTo(-10f, -22f); lineTo(10f, -22f); quadraticTo(16f, -8f, 9f, 0f); lineTo(-9f, 0f); quadraticTo(-16f, -8f, -10f, -22f); close() }
            drawPath(vase, shade(Pal.Sky, -22f, 0f))
        }
    }

    /** Parchment scroll that unrolls with key "p"; [lines] are written onto it as it opens. */
    class Scroll(val title: String, val lines: List<String>) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            val h = 18f + 140f * p
            softShadow(0f, h / 2f + 14f, 120f, 12f)
            drawRect(shade(Color(0xFFF4E6C4), -h / 2f, h / 2f, 0.1f, 0.12f), Offset(-62f, -h / 2f), Size(124f, h))
            if (p > 0.25f) {
                clipRect(-60f, -h / 2f + 6f, 60f, h / 2f - 6f) {
                    label(s.m, title, 0f, -h / 2f + 22f, 12f, Color(0xFF5A3A1E), 900, letterSpacing = 1.2f)
                    lines.forEachIndexed { i, l ->
                        val a = ((p - 0.35f) * lines.size * 1.6f - i).coerceIn(0f, 1f)
                        label(s.m, l, 0f, -h / 2f + 46f + i * 22f, 10.5f, Color(0xFF5A3A1E), 600, italic = true, alpha = a, maxWidth = 112f)
                    }
                }
            }
            for (y in listOf(-h / 2f, h / 2f)) {
                drawRoundRect(shade(Color(0xFFC9A46B), y - 7f, y + 7f), Offset(-70f, y - 7f), Size(140f, 14f), CornerRadius(7f))
                drawCircle(Pal.Wood.darken(0.2f), 6f, Offset(-72f, y)); drawCircle(Pal.Wood.darken(0.2f), 6f, Offset(72f, y))
            }
        }
    }

    /** Blueprint of a house; key "p" draws the white lines on. */
    class Blueprint : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 120f, 92f, Color(0xFF1F4FA3), 4f)
            var gx = -54f
            while (gx < 60f) { drawLine(Color.White.a(0.08f), Offset(gx, -42f), Offset(gx, 42f), 1f); gx += 12f }
            val house = Path().apply {
                moveTo(-34f, 30f); lineTo(-34f, -6f); lineTo(0f, -32f); lineTo(34f, -6f); lineTo(34f, 30f); close()
                moveTo(-8f, 30f); lineTo(-8f, 10f); lineTo(8f, 10f); lineTo(8f, 30f)
                moveTo(16f, 0f); lineTo(28f, 0f); lineTo(28f, 12f); lineTo(16f, 12f); close()
            }
            val len = 330f * s["p"]
            drawPath(house, Color.White, style = Stroke(1.8f, cap = StrokeCap.Round, join = StrokeJoin.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(len + 0.01f, 1000f))))
            label(s.m, "PLAN", -44f, -36f, 7.5f, Color.White.a(0.8f), 900, Align.START, letterSpacing = 1f)
        }
    }

    /** A house that builds up from its foundation with key "build". Origin = ground. */
    class House(val wall: Color = Pal.Peach, val roof: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("build" to 0f)
        override fun DrawScope.render(s: PropState) {
            val b = s["build"]
            softShadow(0f, 0f, 110f, 12f)
            drawRect(Pal.Slate.darken(0.3f), Offset(-46f, -4f), Size(92f, 6f))
            val wallH = 60f * min(1f, b / 0.7f)
            if (wallH > 0f) {
                drawRect(shade(wall, -wallH, 0f), Offset(-40f, -wallH), Size(80f, wallH))
                for (row in 0 until (wallH / 8f).toInt()) drawLine(wall.darken(0.15f).a(0.5f), Offset(-40f, -row * 8f), Offset(40f, -row * 8f), 0.8f)
                if (wallH > 30f) {
                    drawRect(Pal.Wood.darken(0.2f), Offset(-8f, -26f), Size(16f, 26f))
                    val lit = 0.75f + 0.25f * sin(s.t * 1.5f)
                    drawRect(lerp(Color(0xFF2A3550), Color(0xFFFFE08A), b * lit), Offset(16f, -44f), Size(16f, 14f))
                    drawRect(lerp(Color(0xFF2A3550), Color(0xFFFFE08A), b * lit), Offset(-32f, -44f), Size(16f, 14f))
                }
            }
            val rb = ((b - 0.7f) / 0.3f).coerceIn(0f, 1f)
            if (rb > 0f) {
                val roofP = Path().apply { moveTo(-48f, -60f); lineTo(0f, -60f - 38f * rb); lineTo(48f, -60f); close() }
                drawPath(roofP, shade(roof, -98f, -60f))
            }
        }
    }

    /** A ladder; origin at its foot, extending straight up [len]. Lean it with the actor's rotation. */
    class Ladder(val len: Float = 130f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val c = Pal.Wood.lighten(0.15f)
            drawLine(c.darken(0.2f), Offset(-12f, 0f), Offset(-12f, -len), 4.5f, StrokeCap.Round)
            drawLine(c.darken(0.2f), Offset(12f, 0f), Offset(12f, -len), 4.5f, StrokeCap.Round)
            var y = -12f
            while (y > -len) { drawLine(c, Offset(-12f, y), Offset(12f, y), 3.5f, StrokeCap.Round); y -= 16f }
        }
    }

    /** A tall brick wall with a sign. Origin = ground centre. */
    class Wall(val text: String, val color: Color, val h: Float = 150f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 90f, 12f)
            drawRect(shade(color, -h, 0f, 0.12f, 0.3f), Offset(-30f, -h), Size(60f, h))
            for (row in 1 until (h / 14f).toInt()) {
                val off = if (row % 2 == 0) 0f else 10f
                drawLine(color.darken(0.25f).a(0.6f), Offset(-30f, -row * 14f), Offset(30f, -row * 14f), 1f)
                var x = -30f + off
                while (x < 30f) { drawLine(color.darken(0.25f).a(0.6f), Offset(x, -row * 14f), Offset(x, -row * 14f + 14f), 1f); x += 20f }
            }
            label(s.m, text, 0f, -h - 12f, 10f, Pal.Ink, 900, chip = color.lighten(0.35f), maxWidth = 90f)
        }
    }

    /** The urgent/important 2x2. Keys: "p" draws it in, "hot" reddens the urgent column, "q2" lights quadrant II. */
    class Matrix(val cw: Float = 110f, val ch: Float = 72f) : Prop() {
        override val defaults = mapOf("p" to 0f, "hot" to 0f, "q2" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            val names = listOf("I · crises", "II · plan, people, renew", "III · interruptions", "IV · time-wasters")
            for (i in 0 until 4) {
                val k = ((p * 4f - i) / 1.2f).coerceIn(0f, 1f)
                if (k <= 0f) continue
                val cx = if (i % 2 == 0) -cw / 2f - 3f else cw / 2f + 3f
                val cy = if (i < 2) -ch / 2f - 3f else ch / 2f + 3f
                val base = when (i) {
                    0, 2 -> lerp(Color(0xFF2B2F3D), Color(0xFF6B2B33), s["hot"])
                    1 -> lerp(Color(0xFF2B2F3D), Color(0xFF2E6B57), s["q2"])
                    else -> Color(0xFF24262F)
                }
                if (i == 1 && s["q2"] > 0.05f) glow(Pal.Mint, Offset(cx, cy), cw * 0.9f, 0.3f * s["q2"])
                val e = Ease.Back.apply(k)
                withTransform({ scale(e, e, Offset(cx, cy)) }) {
                    card(cx, cy, cw, ch, base, 10f)
                    label(s.m, names[i], cx, cy - ch / 2f + 11f, 8.5f, Color.White.a(0.85f), 800, maxWidth = cw - 10f)
                }
            }
            if (p > 0.9f) {
                label(s.m, "URGENT", -cw / 2f - 3f, -ch - 16f, 9f, Pal.Coral, 900, letterSpacing = 1f)
                label(s.m, "NOT URGENT", cw / 2f + 3f, -ch - 16f, 9f, Pal.Slate.lighten(0.3f), 900, letterSpacing = 1f)
            }
        }
    }

    /** Flickering fire; key "big" scales the flames. Origin = base. */
    class Fire(val w: Float = 30f) : Prop() {
        override val defaults = mapOf("big" to 1f)
        override fun DrawScope.render(s: PropState) {
            val b = s["big"]
            if (b <= 0.01f) return
            glow(Color(0xFFFF9A3C), Offset(0f, -w * 0.6f * b), w * 1.6f * b, 0.55f)
            for ((k, col) in listOf(Color(0xFFE8452C), Color(0xFFFF9A3C), Color(0xFFFFE08A)).withIndex()) {
                val sc = (1f - k * 0.28f) * b
                for (j in -1..1) {
                    val fl = 1f + 0.18f * sin(s.t * (9f + j * 2f) + k + j)
                    val hw = w * 0.38f * sc
                    val ht = w * 1.3f * sc * fl * (if (j == 0) 1f else 0.7f)
                    val x = j * w * 0.28f * sc
                    val sway = sin(s.t * 5f + j) * 3f * sc
                    val f = Path().apply { moveTo(x - hw, 0f); quadraticTo(x - hw, -ht * 0.5f, x + sway, -ht); quadraticTo(x + hw, -ht * 0.5f, x + hw, 0f); close() }
                    drawPath(f, col)
                }
            }
        }
    }

    /** A pot plant that grows with key "grow". Origin = pot base. */
    class Plant : Prop() {
        override val defaults = mapOf("grow" to 0.2f)
        override fun DrawScope.render(s: PropState) {
            val g = s["grow"]
            softShadow(0f, 0f, 40f, 7f)
            val top = -24f - 50f * g
            val sway = sin(s.t * 1.4f) * 3f * g
            drawLine(Pal.Leaf.darken(0.2f), Offset(0f, -22f), Offset(sway, top), 3f, StrokeCap.Round)
            val leaves = (g * 6f).toInt()
            for (i in 0 until leaves) {
                val y = -30f - i * 8f
                val x = sway * (i / 6f)
                val side = if (i % 2 == 0) -1f else 1f
                withTransform({ rotate(side * -30f, Offset(x, y)) }) {
                    drawOval(shade(Pal.Leaf, y - 5f, y + 5f), Offset(x + (if (side < 0) -18f else 0f), y - 5f), Size(18f, 10f))
                }
            }
            if (g > 0.85f) {
                for (k in 0 until 5) drawCircle(Pal.Rose, 3.5f, polar(Offset(sway, top), 4.5f, k * TAU / 5f))
                drawCircle(Pal.Gold, 2.5f, Offset(sway, top))
            }
            val pot = Path().apply { moveTo(-15f, -22f); lineTo(15f, -22f); lineTo(11f, 0f); lineTo(-11f, 0f); close() }
            drawPath(pot, shade(Pal.Coral.darken(0.1f), -22f, 0f))
        }
    }

    /** Week planner: [blocks] = (day, (start 0..1, length 0..1), colour); key "p" fills them in order. */
    class WeekPlanner(val blocks: List<Triple<Int, Pair<Float, Float>, Color>>, val title: String = "THIS WEEK") : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val w = 196f; val h = 120f
            card(0f, 0f, w, h, Pal.Paper, 8f)
            drawRoundRect(Pal.Navy, Offset(-w / 2f, -h / 2f), Size(w, 20f), CornerRadius(8f, 8f))
            drawRect(Pal.Navy, Offset(-w / 2f, -h / 2f + 10f), Size(w, 10f))
            label(s.m, title, 0f, -h / 2f + 10f, 8.5f, Color.White, 900, letterSpacing = 1f)
            val colW = (w - 14f) / 7f
            val days = listOf("M", "T", "W", "T", "F", "S", "S")
            for (d in 0 until 7) {
                val x = -w / 2f + 7f + d * colW
                label(s.m, days[d], x + colW / 2f, -h / 2f + 28f, 8f, Pal.Slate, 800)
                if (d > 0) drawLine(Pal.Slate.a(0.25f), Offset(x, -h / 2f + 34f), Offset(x, h / 2f - 6f), 1f)
            }
            val top = -h / 2f + 36f; val bh = h - 44f
            blocks.forEachIndexed { i, (d, se, c) ->
                val k = ((s["p"] * (blocks.size + 1) - i) / 1.2f).coerceIn(0f, 1f)
                if (k <= 0f) return@forEachIndexed
                val x = -w / 2f + 7f + d * colW
                drawRoundRect(c.a(min(1f, k * 2f)), Offset(x + 1.5f, top + se.first * bh), Size(colW - 3f, se.second * bh * Ease.Back.apply(k)), CornerRadius(3f))
            }
        }
    }

    /** A pie seen at an angle; key "grow" scales it, key "split" is the left share (0..1). */
    class Pie(val r: Float = 40f, val left: Color = Pal.Sky, val right: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("grow" to 1f, "split" to 0.5f)
        override fun DrawScope.render(s: PropState) {
            val rr = r * s["grow"]
            softShadow(0f, rr * 0.5f + 6f, rr * 2.4f, rr * 0.35f)
            drawOval(Color.White.a(0.92f), Offset(-rr * 1.18f, -rr * 0.58f + 4f), Size(rr * 2.36f, rr * 1.16f + 4f))
            withTransform({ scale(1f, 0.5f, Offset.Zero) }) {
                val sw = 360f * s["split"]
                drawArc(shade(left, -rr, rr), 90f, sw, true, Offset(-rr, -rr), Size(rr * 2, rr * 2))
                drawArc(shade(right, -rr, rr), 90f + sw, 360f - sw, true, Offset(-rr, -rr), Size(rr * 2, rr * 2))
                drawCircle(Color(0xFFE9B97A), rr, Offset.Zero, style = Stroke(rr * 0.14f))
                drawLine(Color.White.a(0.85f), Offset.Zero, polar(Offset.Zero, rr, Math.toRadians(90.0).toFloat()), 2.5f)
                drawLine(Color.White.a(0.85f), Offset.Zero, polar(Offset.Zero, rr, Math.toRadians(90.0 + sw).toFloat()), 2.5f)
            }
        }
    }

    /** A big ear; key "on" makes it listen (waves travel into it). */
    class Ear(val skin: Color = Pal.Skin[0]) : Prop() {
        override val defaults = mapOf("on" to 0f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            if (on > 0f) for (k in 0..2) {
                val ph = frac(-s.t * 0.7f + k / 3f)
                drawArc(Pal.Mint.a(on * (1f - ph)), 120f, 120f, false, Offset(-34f - ph * 34f, -34f - ph * 34f), Size(68f + ph * 68f, 68f + ph * 68f), style = roundStroke(2.5f))
            }
            val ear = Path().apply { moveTo(0f, -26f); cubicTo(26f, -32f, 30f, 6f, 10f, 14f); cubicTo(2f, 18f, 8f, 30f, -4f, 30f); cubicTo(-14f, 30f, -16f, 14f, -12f, 6f); cubicTo(-22f, -10f, -14f, -24f, 0f, -26f); close() }
            drawPath(ear, shade(skin, -30f, 30f, 0.2f, 0.15f))
            drawPath(Path().apply { moveTo(-2f, -14f); cubicTo(14f, -18f, 16f, 2f, 4f, 6f); cubicTo(-2f, 8f, 0f, 16f, -6f, 16f) }, skin.darken(0.3f), style = roundStroke(3f))
        }
    }

    /** Doctor's clipboard with a stethoscope. */
    class Clipboard(val text: String = "Rx") : Prop() {
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 46f, 60f, Pal.Wood, 4f)
            drawRect(Pal.Paper, Offset(-19f, -24f), Size(38f, 48f))
            drawRoundRect(Pal.Steel, Offset(-9f, -34f), Size(18f, 9f), CornerRadius(2f))
            label(s.m, text, 0f, -10f, 13f, Pal.Coral, 900)
            for (k in 0..2) drawLine(Pal.Slate.a(0.5f), Offset(-14f, 4f + k * 6f), Offset(14f, 4f + k * 6f), 1.4f)
            drawArc(Pal.Ink, 0f, 180f, false, Offset(-34f, -16f), Size(26f, 34f), style = Stroke(2.5f))
            drawCircle(Pal.Steel, 5f, Offset(-21f, 18f))
        }
    }

    /** A glowing idea shape: 0 square, 1 triangle, 2 star. Bobs gently. */
    class Idea(val kind: Int, val color: Color, val r: Float = 18f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val bob = sin(s.t * 2f + kind) * 3f
            glow(color, Offset(0f, bob), r * 2.2f, 0.5f)
            val p = Path()
            when (kind) {
                0 -> p.addRoundRect(RoundRect(-r * 0.8f, -r * 0.8f + bob, r * 0.8f, r * 0.8f + bob, CornerRadius(4f)))
                1 -> { p.moveTo(0f, -r + bob); p.lineTo(r, r * 0.75f + bob); p.lineTo(-r, r * 0.75f + bob); p.close() }
                else -> {
                    for (k in 0 until 10) {
                        val rr = if (k % 2 == 0) r * 1.15f else r * 0.5f
                        val o = polar(Offset(0f, bob), rr, -TAU / 4f + k * TAU / 10f)
                        if (k == 0) p.moveTo(o.x, o.y) else p.lineTo(o.x, o.y)
                    }
                    p.close()
                }
            }
            drawPath(p, shade(color, -r + bob, r + bob, 0.35f, 0.2f))
            drawCircle(Color.White.a(0.5f), r * 0.16f, Offset(-r * 0.3f, -r * 0.3f + bob))
        }
    }

    /** A log on trestles; key "cut" deepens the saw cut (0..1). Origin = ground. */
    class Log : Prop() {
        override val defaults = mapOf("cut" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 150f, 12f)
            for (x in listOf(-50f, 50f)) {
                drawLine(Pal.Wood.darken(0.4f), Offset(x - 14f, 0f), Offset(x + 6f, -34f), 4f)
                drawLine(Pal.Wood.darken(0.4f), Offset(x + 14f, 0f), Offset(x - 6f, -34f), 4f)
            }
            drawRoundRect(shade(Color(0xFF9A6638), -58f, -30f, 0.15f, 0.25f), Offset(-80f, -58f), Size(160f, 28f), CornerRadius(14f))
            drawOval(Color(0xFFE2B57E), Offset(70f, -58f), Size(18f, 28f))
            drawOval(Color(0xFFB98552), Offset(75f, -50f), Size(8f, 12f), style = Stroke(1.2f))
            for (k in 0..3) drawLine(Color(0xFF6E4524).a(0.5f), Offset(-70f + k * 30f, -50f), Offset(-50f + k * 30f, -48f), 1.2f)
            val c = s["cut"]
            if (c > 0f) {
                drawRect(Color(0xFF3B2412), Offset(8f, -58f), Size(3f, 28f * c))
                for (k in 0 until 6) {
                    val ph = frac(s.t * 1.3f + k / 6f)
                    drawCircle(Color(0xFFE2B57E).a(1f - ph), 1.6f, Offset(10f + (hash01(k, 3) - 0.5f) * 20f * ph, -30f + ph * 30f))
                }
            }
        }
    }

    /** Handsaw. Key "saw" moves it back and forth; key "sharp" makes the teeth glint. Origin = blade middle. */
    class Saw : Prop() {
        override val defaults = mapOf("saw" to 0f, "sharp" to 0f)
        override fun DrawScope.render(s: PropState) {
            val dx = sin(s.t * 9f) * 16f * s["saw"]
            withTransform({ translate(dx, 0f) }) {
                val blade = Path().apply { moveTo(-50f, -8f); lineTo(30f, -14f); lineTo(30f, 6f); lineTo(-50f, 6f); close() }
                drawPath(blade, Brush.verticalGradient(listOf(Color(0xFFE6EBF2), Color(0xFF9AA4B4)), -14f, 6f))
                var x = -50f
                val teeth = Path().apply { moveTo(-50f, 6f); while (x < 30f) { lineTo(x + 2.5f, 10f); lineTo(x + 5f, 6f); x += 5f } }
                drawPath(teeth, Color(0xFF8A94A6), style = Stroke(1.2f))
                drawRoundRect(shade(Pal.Coral.darken(0.2f), -18f, 10f), Offset(28f, -18f), Size(22f, 28f), CornerRadius(8f))
                drawRoundRect(Color(0xFF1C1C24), Offset(34f, -10f), Size(10f, 12f), CornerRadius(4f))
                val sh = s["sharp"]
                if (sh > 0.05f) {
                    val gx = -50f + frac(s.t * 0.6f) * 80f
                    glow(Color.White, Offset(gx, 7f), 12f, sh)
                    drawLine(Color.White.a(sh), Offset(gx - 6f, 8f), Offset(gx + 6f, 8f), 1.5f)
                }
            }
        }
    }

    class Dumbbell(val color: Color = Pal.Slate) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(Pal.Steel, Offset(-16f, -2.5f), Size(32f, 5f), CornerRadius(2f))
            for (x in listOf(-20f, 14f)) drawRoundRect(shade(color, -11f, 11f), Offset(x, -11f), Size(6f, 22f), CornerRadius(2f))
            for (x in listOf(-25f, 20f)) drawRoundRect(shade(color, -8f, 8f), Offset(x, -8f), Size(5f, 16f), CornerRadius(2f))
        }
    }

    class OpenBook(val color: Color = Pal.Sky) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(color.darken(0.2f), Offset(-26f, -14f), Size(52f, 30f), CornerRadius(3f))
            val l = Path().apply { moveTo(0f, -12f); quadraticTo(-12f, -18f, -24f, -14f); lineTo(-24f, 12f); quadraticTo(-12f, 8f, 0f, 14f); close() }
            val r = Path().apply { moveTo(0f, -12f); quadraticTo(12f, -18f, 24f, -14f); lineTo(24f, 12f); quadraticTo(12f, 8f, 0f, 14f); close() }
            drawPath(l, Pal.Paper); drawPath(r, Pal.Paper.darken(0.05f))
            for (k in 0..3) {
                drawLine(Pal.Slate.a(0.5f), Offset(-20f, -8f + k * 5f), Offset(-5f, -7f + k * 5f), 1f)
                drawLine(Pal.Slate.a(0.5f), Offset(5f, -7f + k * 5f), Offset(20f, -8f + k * 5f), 1f)
            }
        }
    }

    /** A rising sun over a horizon line. */
    class Sunrise(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(color, Offset(0f, 4f), 40f, 0.5f)
            for (k in 0 until 7) {
                val a = -TAU / 2f + (k + 0.5f) * TAU / 14f
                drawLine(color.a(0.8f), polar(Offset(0f, 4f), 17f, a), polar(Offset(0f, 4f), 24f + 2f * sin(s.t * 3f + k), a), 2.2f, StrokeCap.Round)
            }
            drawArc(shade(color, -10f, 4f, 0.3f, 0.1f), 180f, 180f, true, Offset(-13f, -9f), Size(26f, 26f))
            drawLine(color.darken(0.3f), Offset(-26f, 4f), Offset(26f, 4f), 2f, StrokeCap.Round)
        }
    }

    /** Glass jar labelled TRUST; key "level" (0..1) fills it with coins. Origin = base. */
    class TrustJar : Prop() {
        override val defaults = mapOf("level" to 0.15f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 2f, 80f, 10f)
            val lv = s["level"].coerceIn(0f, 1f)
            val top = -86f; val bottom = 0f
            val fillTop = bottom - (bottom - top - 12f) * lv
            if (lv > 0.01f) {
                drawRoundRect(Brush.verticalGradient(listOf(Pal.Gold.lighten(0.2f), Pal.Gold.darken(0.2f)), fillTop, bottom), Offset(-30f, fillTop), Size(60f, bottom - fillTop - 2f), CornerRadius(6f))
                var y = bottom - 8f
                var row = 0
                while (y > fillTop + 4f) {
                    for (k in 0..4) drawOval(Color(0xFFB9831F).a(0.6f), Offset(-28f + k * 11f + (row % 2) * 5f, y - 3f), Size(10f, 5f), style = Stroke(1f))
                    y -= 6f; row++
                }
            }
            drawRoundRect(Color(0xFFBFE4FF).a(0.16f), Offset(-34f, top), Size(68f, bottom - top), CornerRadius(12f))
            drawRoundRect(Color.White.a(0.55f), Offset(-34f, top), Size(68f, bottom - top), CornerRadius(12f), style = Stroke(2f))
            drawRoundRect(Color.White.a(0.35f), Offset(-26f, top + 10f), Size(6f, 50f), CornerRadius(3f))
            drawRoundRect(shade(Pal.Slate, top - 10f, top + 2f), Offset(-28f, top - 10f), Size(56f, 12f), CornerRadius(3f))
            drawRoundRect(Pal.Ink, Offset(-10f, top - 8f), Size(20f, 3f), CornerRadius(1.5f))
            label(s.m, "TRUST", 0f, -46f, 10f, Pal.Ink, 900, chip = Pal.Paper, letterSpacing = 1.5f)
        }
    }

    /** A compass whose needle wobbles and settles on north as key "settle" goes to 1. */
    class Compass : Prop() {
        override val defaults = mapOf("settle" to 0f)
        override fun DrawScope.render(s: PropState) {
            val st = s["settle"]
            softShadow(0f, 34f, 70f, 10f)
            if (st > 0.5f) glow(Pal.Gold, Offset.Zero, 60f, 0.4f * st)
            drawCircle(shade(Pal.Gold.darken(0.1f), -32f, 32f), 32f, Offset.Zero)
            drawCircle(Brush.radialGradient(listOf(Pal.Paper, Color(0xFFDCD3C0)), Offset(-6f, -6f), 40f), 26f, Offset.Zero)
            for (k in 0 until 16) drawLine(Pal.Ink.a(if (k % 4 == 0) 0.7f else 0.3f), polar(Offset.Zero, 25f, k * TAU / 16f), polar(Offset.Zero, if (k % 4 == 0) 19f else 22f, k * TAU / 16f), 1.2f)
            label(s.m, "N", 0f, -14f, 8f, Pal.Coral, 900)
            val ang = (1f - st) * (sin(s.t * 3.1f) * 70f + sin(s.t * 1.7f) * 50f)
            rotate(ang, Offset.Zero) {
                drawPath(Path().apply { moveTo(0f, -21f); lineTo(5f, 0f); lineTo(-5f, 0f); close() }, Pal.Coral)
                drawPath(Path().apply { moveTo(0f, 21f); lineTo(5f, 0f); lineTo(-5f, 0f); close() }, Pal.Slate)
            }
            drawCircle(Pal.Gold, 3f, Offset.Zero)
        }
    }

    /** A labelled step block for staircases. Origin = ground centre. */
    class Step(val w: Float, val h: Float, val color: Color, val text: String) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, w * 1.05f, 10f)
            drawRect(shade(color, -h, 0f, 0.15f, 0.35f), Offset(-w / 2f, -h), Size(w, h))
            drawRect(color.lighten(0.3f), Offset(-w / 2f, -h), Size(w, 4f))
            label(s.m, text, 0f, -h / 2f + 2f, 9.5f, Pal.Ink, 900, maxWidth = w - 6f, letterSpacing = 0.5f)
        }
    }

    /** A zipped mouth (staying silent). */
    class Zip : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(Pal.Steel, Offset(-10f, -2f), Size(20f, 4f), CornerRadius(2f))
            for (k in 0..4) drawLine(Pal.Ink, Offset(-8f + k * 4f, -3f), Offset(-8f + k * 4f, 3f), 1f)
            drawRoundRect(Pal.Gold, Offset(9f, -3f), Size(5f, 8f), CornerRadius(1.5f))
        }
    }
}
