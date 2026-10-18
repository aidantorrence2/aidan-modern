package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Ice cube on a surface; key "melt" 0..1 shrinks and rounds it while a puddle spreads. Origin = surface point. */
class IceCube : Prop() {
    override val defaults = mapOf("melt" to 0f)
    override fun DrawScope.render(s: PropState) {
        val melt = s["melt"]
        val pw = 30f + 70f * melt
        drawOval(Brush.radialGradient(listOf(Color(0xFFBFE6FF).a(0.75f), Color(0xFF7CC4F5).a(0.25f)), Offset(0f, 0f), pw / 2f),
            Offset(-pw / 2f, -3f - 2f * melt), Size(pw, 6f + 4f * melt))
        if (melt > 0.02f) drawOval(Color.White.a(0.5f), Offset(-pw / 4f, -2f - 2f * melt), Size(pw / 3f, 2f))
        val k = 1f - melt
        if (k <= 0.03f) return
        val side = 44f * (0.25f + 0.75f * k)
        val h = side * (0.55f + 0.45f * k)
        val r = 4f + 12f * melt
        softShadow(0f, 0f, side * 1.3f, 6f, 0.25f)
        val tl = Offset(-side / 2f, -h)
        drawRoundRect(Brush.linearGradient(listOf(Color(0xFFE8F7FF), Color(0xFF9ED7FA), Color(0xFF6BB8EC)), tl, Offset(side / 2f, 0f)), tl, Size(side, h), CornerRadius(r))
        drawRoundRect(Color.White.a(0.55f), Offset(-side / 2f + 4f, -h + 4f), Size(side * 0.28f, h * 0.45f), CornerRadius(r / 2f))
        drawRoundRect(Color.White.a(0.7f), tl, Size(side, h), CornerRadius(r), style = Stroke(1.4f))
        // frosty sparkle
        val tw = 0.5f + 0.5f * sin(s.t * 3f)
        drawLine(Color.White.a(tw * k), Offset(side * 0.2f - 4f, -h * 0.7f), Offset(side * 0.2f + 4f, -h * 0.7f), 1.4f, StrokeCap.Round)
        drawLine(Color.White.a(tw * k), Offset(side * 0.2f, -h * 0.7f - 4f), Offset(side * 0.2f, -h * 0.7f + 4f), 1.4f, StrokeCap.Round)
    }
}

/** Wall thermometer; key "temp" in degrees mapped onto [lo]..[hi]; shows the reading in a chip. */
class Thermometer(val lo: Float = 20f, val hi: Float = 36f, val unit: String = "°F") : Prop() {
    override val defaults = mapOf("temp" to 25f)
    override fun DrawScope.render(s: PropState) {
        val temp = s["temp"]
        val f = ((temp - lo) / (hi - lo)).coerceIn(0f, 1f)
        card(0f, 0f, 30f, 120f, Color(0xFF2D3140), 15f)
        drawRoundRect(Color.White.a(0.85f), Offset(-5f, -48f), Size(10f, 86f), CornerRadius(5f))
        val hot = lerp(Pal.Sky, Pal.Coral, f)
        val top = 38f - 86f * f
        drawRoundRect(hot, Offset(-3f, top), Size(6f, 40f - top), CornerRadius(3f))
        drawCircle(hot, 9f, Offset(0f, 44f))
        drawCircle(Color.White.a(0.5f), 3f, Offset(-3f, 41f))
        for (k in 0..6) drawLine(Color.White.a(0.5f), Offset(7f, -44f + k * 13f), Offset(11f, -44f + k * 13f), 1.2f)
        label(s.m, "${floor(temp + 0.5f).toInt()}$unit", 0f, -74f, 13f, Pal.Ink, 800, chip = hot)
    }
}

/** A warm haze that builds with key "v". */
class Warmth(val color: Color = Color(0xFFFF9A5A), val r: Float = 120f) : Prop() {
    override val defaults = mapOf("v" to 0f)
    override fun DrawScope.render(s: PropState) {
        glow(color, Offset.Zero, r * (0.8f + 0.2f * sin(s.t * 1.3f)), 0.45f * s["v"])
    }
}

/** A pennant on a pole with text. Origin = base of pole. */
class GoalFlag(val text: String, val color: Color = Pal.Gold) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 0f, 26f, 6f)
        drawLine(Pal.Steel, Offset(0f, 0f), Offset(0f, -90f), 3.5f, StrokeCap.Round)
        drawCircle(Pal.Gold, 4f, Offset(0f, -92f))
        val wave = sin(s.t * 3f) * 4f
        val p = Path().apply {
            moveTo(2f, -86f); quadraticBezierTo(30f, -92f + wave, 62f, -84f + wave)
            lineTo(62f, -58f + wave); quadraticBezierTo(30f, -66f + wave, 2f, -60f); close()
        }
        drawPath(p, shade(color, -90f, -58f, 0.25f, 0.15f))
        label(s.m, text, 32f, -73f + wave * 0.6f, 9.5f, Pal.Ink, 800, maxWidth = 56f)
    }
}

/** Name badge clipped to a lanyard; origin at badge centre. */
class IdBadge(val text: String, val color: Color = Pal.Mint) : Prop() {
    override fun DrawScope.render(s: PropState) {
        card(0f, 0f, 74f, 40f, Pal.Paper, 6f)
        drawRoundRect(color, Offset(-37f, -20f), Size(74f, 11f), CornerRadius(6f, 6f))
        drawRect(color, Offset(-37f, -14f), Size(74f, 5f))
        label(s.m, "I AM", 0f, -14.5f, 7.5f, Pal.Ink, 900, letterSpacing = 1f)
        label(s.m, text, 0f, 5f, 11f, Pal.Ink, 900, maxWidth = 70f)
    }
}

class BallotBox : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 30f, 80f, 12f)
        drawRoundRect(shade(Color(0xFF3D5A9E), -28f, 30f), Offset(-34f, -26f), Size(68f, 56f), CornerRadius(5f))
        drawRoundRect(Color(0xFF2A3F73), Offset(-38f, -32f), Size(76f, 10f), CornerRadius(3f))
        drawRoundRect(Pal.Ink, Offset(-16f, -29f), Size(32f, 4f), CornerRadius(2f))
        label(s.m, "VOTE", 0f, 2f, 12f, Pal.White, 900, letterSpacing = 2f)
    }
}

/** A ballot slip with a tick (for) or cross (against). */
class Ballot(val forIt: Boolean = true) : Prop() {
    override fun DrawScope.render(s: PropState) {
        rotate(sin(s.t * 4f) * 6f, Offset.Zero) {
            drawRoundRect(Pal.Paper, Offset(-11f, -14f), Size(22f, 28f), CornerRadius(2f))
            drawLine(Pal.Slate.a(0.5f), Offset(-6f, -7f), Offset(6f, -7f), 1.2f)
            if (forIt) {
                val ck = Path().apply { moveTo(-5f, 3f); lineTo(-1f, 7f); lineTo(6f, -2f) }
                drawPath(ck, Pal.Leaf, style = Stroke(2.6f, cap = StrokeCap.Round))
            } else {
                drawLine(Pal.Coral, Offset(-5f, -1f), Offset(5f, 8f), 2.4f, StrokeCap.Round)
                drawLine(Pal.Coral, Offset(5f, -1f), Offset(-5f, 8f), 2.4f, StrokeCap.Round)
            }
        }
    }
}

/**
 * The habit loop: a ring with four stations. Key "p" draws the ring on; key "orb" moves a glowing orb from station
 * to station (0 = top, 1 = right, 2 = bottom, 3 = left, 4 = top again...). Each station lights up as the orb passes.
 */
class HabitLoop(val r: Float = 92f, val colors: List<Color> = listOf(Pal.Sky, Pal.Rose, Pal.Mint, Pal.Gold)) : Prop() {
    override val defaults = mapOf("p" to 0f, "orb" to 0f, "orbOn" to 0f)
    override fun DrawScope.render(s: PropState) {
        val p = s["p"]
        for (k in 0 until 4) {
            val start = -90f + k * 90f + 14f
            val sweep = (62f * ((p * 4f - k).coerceIn(0f, 1f)))
            if (sweep <= 0f) continue
            drawArc(colors[k].a(0.25f), start, sweep, false, Offset(-r, -r), Size(2 * r, 2 * r), style = Stroke(12f, cap = StrokeCap.Round))
            drawArc(colors[k], start, sweep, false, Offset(-r, -r), Size(2 * r, 2 * r), style = Stroke(4f, cap = StrokeCap.Round))
            if (sweep > 55f) {
                val a = Math.toRadians((start + sweep).toDouble()).toFloat()
                val tip = polar(Offset.Zero, r, a)
                val dir = a + TAU / 4f
                val hp = Path().apply {
                    moveTo(tip.x + cos(dir) * 7f, tip.y + sin(dir) * 7f)
                    lineTo(tip.x + cos(dir + 2.5f) * 9f, tip.y + sin(dir + 2.5f) * 9f)
                    lineTo(tip.x + cos(dir - 2.5f) * 9f, tip.y + sin(dir - 2.5f) * 9f); close()
                }
                drawPath(hp, colors[k])
            }
        }
        val on = s["orbOn"]
        if (on > 0.01f) {
            val orb = s["orb"]
            val ang = -TAU / 4f + orb * TAU / 4f
            for (k in 0 until 14) {
                val a2 = ang - k * 0.045f
                drawCircle(Pal.White.a(on * (1f - k / 14f) * 0.6f), 6f * (1f - k / 18f), polar(Offset.Zero, r, a2))
            }
            val c = polar(Offset.Zero, r, ang)
            glow(Pal.White, c, 26f, 0.8f * on)
            drawCircle(Color.White.a(on), 6.5f, c)
        }
    }
}

class CoffeeCup(val color: Color = Pal.Coral) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 2f, 40f, 7f)
        drawOval(Pal.White.darken(0.1f), Offset(-22f, -4f), Size(44f, 8f))
        drawArc(color.darken(0.1f), -90f, 180f, false, Offset(8f, -24f), Size(16f, 14f), style = Stroke(4.5f))
        val cup = Path().apply { moveTo(-15f, -30f); lineTo(15f, -30f); lineTo(12f, -2f); quadraticBezierTo(0f, 2f, -12f, -2f); close() }
        drawPath(cup, shade(color, -30f, 0f))
        drawOval(Color(0xFF5B3A26), Offset(-14f, -33f), Size(28f, 6f))
        withTransform({ translate(0f, -34f) }) { with(Steam()) { render(s) } }
    }
}

class Guitar(val color: Color = Color(0xFFD9822B)) : Prop() {
    override fun DrawScope.render(s: PropState) {
        rotate(-14f, Offset(0f, 30f)) {
            softShadow(0f, 34f, 50f, 8f)
            drawRoundRect(shade(Pal.Wood.darken(0.3f), -90f, -20f), Offset(-4f, -92f), Size(8f, 70f), CornerRadius(3f))
            drawRoundRect(Pal.Ink, Offset(-6f, -104f), Size(12f, 16f), CornerRadius(3f))
            drawCircle(shade(color, -26f, 28f), 22f, Offset(0f, 12f))
            drawCircle(shade(color, -36f, -6f), 17f, Offset(0f, -18f))
            drawCircle(Pal.Ink.a(0.85f), 6.5f, Offset(0f, -6f))
            drawRect(Pal.Ink, Offset(-9f, 22f), Size(18f, 4f))
            for (k in -1..1) drawLine(Pal.Steel.a(0.8f), Offset(k * 1.6f, -100f), Offset(k * 1.6f, 24f), 0.8f)
        }
    }
}

class CookieJar : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 2f, 50f, 8f)
        drawRoundRect(Color(0xFFBFE4FF).a(0.35f), Offset(-20f, -42f), Size(40f, 42f), CornerRadius(10f))
        for ((k, o) in listOf(Offset(-8f, -12f), Offset(7f, -14f), Offset(0f, -26f)).withIndex()) {
            drawCircle(Color(0xFFC8873F), 8f, o)
            for (c in 0..2) drawCircle(Color(0xFF4A2C17), 1.4f, Offset(o.x - 3f + c * 3f, o.y - 2f + (c + k) % 2 * 3f))
        }
        drawRoundRect(Color.White.a(0.6f), Offset(-20f, -42f), Size(40f, 42f), CornerRadius(10f), style = Stroke(1.6f))
        drawRoundRect(shade(Pal.Coral, -50f, -42f), Offset(-16f, -50f), Size(32f, 9f), CornerRadius(3f))
    }
}

/** Treadmill with a moving belt; key "run" speeds the belt. */
class Treadmill : Prop() {
    override val defaults = mapOf("run" to 1f)
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 6f, 130f, 12f)
        drawLine(Pal.Steel, Offset(42f, -2f), Offset(52f, -70f), 5f, StrokeCap.Round)
        drawRoundRect(Color(0xFF2B2F3A), Offset(40f, -82f), Size(26f, 14f), CornerRadius(3f))
        drawRoundRect(Pal.Mint.a(0.8f), Offset(44f, -79f), Size(12f, 6f), CornerRadius(1f))
        drawRoundRect(shade(Color(0xFF3B4050), -6f, 6f), Offset(-62f, -6f), Size(124f, 12f), CornerRadius(6f))
        val off = frac(s.t * 1.6f * s["run"]) * 16f
        var x = -58f + off
        while (x < 58f) { drawLine(Color.White.a(0.25f), Offset(x, -5f), Offset(x, 5f), 1.4f); x += 16f }
    }
}

/** Over-ear headphones; drawn to sit on a Bean's head when placed at the head position. */
class Headphones(val color: Color = Pal.Violet) : Prop() {
    override fun DrawScope.render(s: PropState) {
        drawArc(Pal.Ink, 180f, 180f, false, Offset(-20f, -20f), Size(40f, 40f), style = Stroke(4f))
        drawRoundRect(shade(color, -6f, 14f), Offset(-24f, -6f), Size(9f, 18f), CornerRadius(4f))
        drawRoundRect(shade(color, -6f, 14f), Offset(15f, -6f), Size(9f, 18f), CornerRadius(4f))
        for (k in 0..1) {
            val ph = frac(s.t * 0.8f + k * 0.5f)
            label(s.m, "♪", 30f + ph * 14f, -10f - ph * 26f, 12f, color.lighten(0.3f), 800, alpha = 1f - ph)
        }
    }
}

class Shoes(val color: Color = Pal.Coral) : Prop() {
    override fun DrawScope.render(s: PropState) {
        for (dx in listOf(-14f, 12f)) {
            softShadow(dx, 1f, 30f, 5f)
            val p = Path().apply { moveTo(dx - 13f, 0f); lineTo(dx - 13f, -12f); quadraticBezierTo(dx - 4f, -16f, dx + 2f, -8f); quadraticBezierTo(dx + 14f, -6f, dx + 14f, 0f); close() }
            drawPath(p, shade(color, -16f, 0f))
            drawRect(Color.White, Offset(dx - 13f, -3f), Size(27f, 3f))
            for (k in 0..2) drawLine(Color.White, Offset(dx - 8f + k * 3f, -12f + k), Offset(dx - 4f + k * 3f, -11f + k), 1.2f)
        }
    }
}

class PiggyBank(val color: Color = Pal.Rose) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 4f, 70f, 10f)
        for (dx in listOf(-16f, -4f, 8f, 18f)) drawRoundRect(color.darken(0.2f), Offset(dx - 3f, -6f), Size(7f, 10f), CornerRadius(2f))
        drawOval(shade(color, -40f, 0f), Offset(-30f, -40f), Size(60f, 38f))
        drawOval(color.darken(0.1f), Offset(22f, -28f), Size(12f, 12f))
        drawCircle(Pal.Ink, 1.3f, Offset(26f, -22f)); drawCircle(Pal.Ink, 1.3f, Offset(30f, -22f))
        drawCircle(Pal.Ink, 2f, Offset(16f, -28f))
        drawRoundRect(color.darken(0.35f), Offset(-8f, -41f), Size(16f, 3.5f), CornerRadius(2f))
        val ear = Path().apply { moveTo(6f, -36f); lineTo(12f, -46f); lineTo(16f, -34f); close() }
        drawPath(ear, color.darken(0.1f))
        drawArc(color.darken(0.2f), 90f, 270f, false, Offset(-38f, -30f), Size(10f, 10f), style = Stroke(2f))
    }
}

/**
 * A horizontal chain of [n] links. Key "broken" (fractional) breaks links listed in [breakAt] in order:
 * 1 breaks the first, 2 breaks the first two. Broken links turn red and spring apart.
 */
class Chain(val n: Int = 7, val breakAt: List<Int> = listOf(3, 4)) : Prop() {
    override val defaults = mapOf("broken" to 0f, "p" to 1f)
    override fun DrawScope.render(s: PropState) {
        val step = 30f
        val x0 = -(n - 1) * step / 2f
        val shown = s["p"] * n
        for (i in 0 until n) {
            val appear = (shown - i).coerceIn(0f, 1f)
            if (appear <= 0f) continue
            val bi = breakAt.indexOf(i)
            val b = if (bi >= 0) (s["broken"] - bi).coerceIn(0f, 1f) else 0f
            val cx = x0 + i * step
            val col = lerp(Pal.Steel, Pal.Coral, b)
            val horiz = i % 2 == 0
            withTransform({ translate(cx, b * 8f * (if (i % 2 == 0) 1f else -1f)); rotate(b * 25f * (if (i % 2 == 0) 1f else -1f), Offset.Zero); scale(appear, appear, Offset.Zero) }) {
                if (horiz) {
                    drawRoundRect(col.darken(0.3f), Offset(-21f, -10f), Size(42f, 20f), CornerRadius(10f), style = Stroke(7f))
                    drawRoundRect(col.lighten(0.2f), Offset(-21f, -10f), Size(42f, 20f), CornerRadius(10f), style = Stroke(3f))
                } else {
                    drawRoundRect(col.darken(0.3f), Offset(-21f, -5f), Size(42f, 10f), CornerRadius(5f), style = Stroke(7f))
                    drawRoundRect(col.lighten(0.2f), Offset(-21f, -5f), Size(42f, 10f), CornerRadius(5f), style = Stroke(3f))
                }
                if (b > 0.5f) drawRect(Pal.Ink, Offset(16f, -12f), Size(6f, 24f))
            }
        }
    }
}

/** A dashed horizontal line with a label at its right end. */
class Dash(val w: Float = 260f, val text: String = "", val color: Color = Pal.Slate) : Prop() {
    override fun DrawScope.render(s: PropState) {
        drawLine(color, Offset(-w / 2f, 0f), Offset(w / 2f, 0f), 2f, StrokeCap.Round, PathEffect.dashPathEffect(floatArrayOf(8f, 6f)))
        if (text.isNotEmpty()) label(s.m, text, w / 2f + 8f, 0f, 11f, color, 800, Align.START, letterSpacing = 1f)
    }
}
