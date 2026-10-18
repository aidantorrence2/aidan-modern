package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.abs
import kotlin.math.sin

/** Illustrated props for How to Win Friends and Influence People. */
object CarnegieProps {

    /** Kite shield, origin at its centre. */
    class Shield(val color: Color = Pal.Steel) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val p = Path().apply {
                moveTo(0f, -30f); quadraticTo(16f, -24f, 24f, -26f); quadraticTo(26f, 6f, 0f, 30f)
                quadraticTo(-26f, 6f, -24f, -26f); quadraticTo(-16f, -24f, 0f, -30f); close()
            }
            glow(color, Offset.Zero, 44f, 0.25f)
            drawPath(p, shade(color, -30f, 30f, 0.3f, 0.25f))
            drawPath(p, color.darken(0.35f), style = Stroke(2.5f, join = StrokeJoin.Round))
            drawLine(color.darken(0.25f), Offset(0f, -26f), Offset(0f, 24f), 3f)
            drawLine(color.darken(0.25f), Offset(-20f, -6f), Offset(20f, -6f), 3f)
            drawCircle(Color.White.a(0.5f), 3f, Offset(-10f, -16f))
        }
    }

    /** A small crown; origin at the bottom centre of the band. */
    class Crown(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(color, Offset(0f, -8f), 34f, 0.35f + 0.1f * sin(s.t * 3f))
            val p = Path().apply {
                moveTo(-16f, 0f); lineTo(-18f, -16f); lineTo(-9f, -8f); lineTo(0f, -20f); lineTo(9f, -8f); lineTo(18f, -16f); lineTo(16f, 0f); close()
            }
            drawPath(p, shade(color, -20f, 0f, 0.35f, 0.2f))
            drawRect(color.darken(0.2f), Offset(-16f, -4f), Size(32f, 4f))
            drawCircle(Pal.Coral, 2.2f, Offset(0f, -9f)); drawCircle(Pal.Sky, 1.8f, Offset(-9f, -4f)); drawCircle(Pal.Sky, 1.8f, Offset(9f, -4f))
            for (x in listOf(-18f, 0f, 18f)) drawCircle(color.lighten(0.4f), 2f, Offset(x, if (x == 0f) -20f else -16f))
        }
    }

    /** "HELLO my name is" sticker; origin at centre. */
    class NameTag(val name: String) : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(-6f, Offset.Zero) {
                card(0f, 0f, 70f, 42f, Pal.Paper, 6f)
                drawRoundRect(Pal.Coral, Offset(-35f, -21f), Size(70f, 15f), CornerRadius(6f, 6f))
                drawRect(Pal.Coral, Offset(-35f, -12f), Size(70f, 6f))
                label(s.m, "HELLO my name is", 0f, -14f, 6.5f, Color.White, 900, letterSpacing = 0.4f)
                label(s.m, name, 0f, 6f, 13f, Pal.Ink, 900, italic = true)
            }
        }
    }

    /** Stage spotlight: a cone from above onto the origin (ground). Key "on". */
    class Spotlight(val color: Color = Color(0xFFFFF1C8), val h: Float = 200f, val w: Float = 70f) : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            if (on <= 0f) return
            val cone = Path().apply { moveTo(-10f, -h); lineTo(10f, -h); lineTo(w / 2f, 0f); lineTo(-w / 2f, 0f); close() }
            drawPath(cone, Brush.verticalGradient(listOf(color.a(0.05f * on), color.a(0.32f * on)), -h, 0f))
            withTransform({ scale(1f, 0.22f, Offset.Zero) }) { drawCircle(color.a(0.45f * on), w / 2f, Offset.Zero) }
        }
    }

    /** Crackling bolts between two arguing people; origin at the centre, spans ±w/2. */
    class Clash(val w: Float = 90f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val flick = 0.6f + 0.4f * abs(sin(s.t * 13f))
            glow(Pal.Gold, Offset.Zero, 40f, 0.4f * flick)
            for (k in 0..1) {
                val p = Path()
                val n = 7
                for (i in 0..n) {
                    val x = -w / 2f + w * i / n
                    val y = (if (i % 2 == 0) -1f else 1f) * (8f + 6f * hash01(i + k * 11 + (s.t * 8f).toInt(), 3)) + (k - 0.5f) * 10f
                    if (i == 0) p.moveTo(x, y) else p.lineTo(x, y)
                }
                drawPath(p, Pal.Gold.a(flick), style = Stroke(3f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                drawPath(p, Color.White.a(0.7f * flick), style = Stroke(1.2f, cap = StrokeCap.Round, join = StrokeJoin.Round))
            }
        }
    }

    /** A staircase of [n] steps rising to the right; origin at the bottom-left. Key "lit" lights steps one by one. */
    class Steps(val n: Int = 4, val stepW: Float = 46f, val stepH: Float = 22f, val labels: List<String> = listOf("yes", "yes", "yes", "YES!")) : Prop() {
        override val defaults = mapOf("lit" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(n * stepW / 2f, 2f, n * stepW * 1.05f, 12f, 0.3f)
            for (i in 0 until n) {
                val x = i * stepW
                val top = -(i + 1) * stepH
                val lit = (s["lit"] - i).coerceIn(0f, 1f)
                val c = lerp(Color(0xFF3B4160), if (i == n - 1) Pal.Gold else Pal.Mint, lit)
                drawRect(shade(c, top, 0f, 0.15f, 0.25f), Offset(x, top), Size(stepW, -top))
                drawRect(c.lighten(0.3f), Offset(x, top), Size(stepW, 3f))
                if (lit > 0.05f) label(s.m, labels.getOrElse(i) { "yes" }, x + stepW / 2f, top + 11f, if (i == n - 1) 11f else 9.5f, Pal.Ink, 900, alpha = lit)
            }
        }
    }

    /** A report on the desk; key "fixed" turns the red error circle into a green tick. Origin at centre. */
    class Report : Prop() {
        override val defaults = mapOf("fixed" to 0f)
        override fun DrawScope.render(s: PropState) {
            rotate(-4f, Offset.Zero) {
                card(0f, 0f, 46f, 58f, Pal.Paper, 3f)
                for (k in 0 until 6) drawLine(Pal.Slate.a(0.55f), Offset(-15f, -18f + k * 7f), Offset(if (k % 3 == 2) 4f else 15f, -18f + k * 7f), 1.6f, StrokeCap.Round)
                val f = s["fixed"]
                if (f < 1f) drawOval(Pal.Coral.a(1f - f), Offset(-4f, 2f), Size(24f, 12f), style = Stroke(2.2f))
                if (f > 0f) {
                    val ck = Path().apply { moveTo(2f, 9f); lineTo(7f, 14f); lineTo(16f, 2f) }
                    drawPath(ck, Pal.Leaf.a(f), style = Stroke(3f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                }
            }
        }
    }

    /** A row of [n] numbered dots; key "n" lights them in order. Origin at centre. */
    class StepDots(val n: Int = 9, val gap: Float = 21f, val color: Color = Pal.Mint) : Prop() {
        override val defaults = mapOf("n" to 0f)
        override fun DrawScope.render(s: PropState) {
            val x0 = -(n - 1) * gap / 2f
            for (i in 0 until n) {
                val on = (s["n"] - i).coerceIn(0f, 1f)
                val c = Offset(x0 + i * gap, 0f)
                if (on > 0f) glow(color, c, 14f, 0.4f * on)
                drawCircle(lerp(Color(0xFF2F3345), color, on), 8f, c)
                label(s.m, "${i + 1}", c.x, c.y, 8.5f, if (on > 0.5f) Pal.Ink else Pal.Slate, 900)
            }
        }
    }

    /** A medal on a ribbon with a short title. Origin at the medal centre. */
    class Medal(val text: String, val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val rib = Path().apply { moveTo(-10f, -30f); lineTo(-2f, -10f); lineTo(4f, -12f); lineTo(-2f, -30f); close() }
            drawPath(rib, Pal.Sky)
            val rib2 = Path().apply { moveTo(10f, -30f); lineTo(2f, -10f); lineTo(-4f, -12f); lineTo(2f, -30f); close() }
            drawPath(rib2, Pal.Coral)
            glow(color, Offset.Zero, 30f, 0.35f)
            drawCircle(shade(color, -13f, 13f, 0.35f, 0.2f), 13f, Offset.Zero)
            drawCircle(color.darken(0.25f), 9.5f, Offset.Zero, style = Stroke(1.6f))
            withTransform({ scale(0.5f, 0.5f, Offset.Zero) }) { with(Star(color.lighten(0.3f), 14f)) { render(s) } }
            label(s.m, text, 0f, 24f, 9.5f, Pal.Ink, 900, chip = color)
        }
    }

    /** Puppet controller with strings hanging to a point (dx, dy) below. Origin at the controller. */
    class Strings(val dx: Float, val dy: Float) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val sway = sin(s.t * 1.6f) * 3f
            for (k in -1..1) drawLine(Color.White.a(0.6f), Offset(k * 14f, 0f), Offset(dx + k * 14f + sway, dy), 1.1f)
            rotate(sway * 2f, Offset.Zero) {
                drawRoundRect(shade(Pal.Wood, -3f, 3f), Offset(-20f, -3f), Size(40f, 6f), CornerRadius(3f))
                drawRoundRect(shade(Pal.Wood, -14f, 14f), Offset(-3f, -14f), Size(6f, 28f), CornerRadius(3f))
            }
        }
    }

    /** A pond seen from the side: water surface at the origin, [w] wide, [h] deep. */
    class Pond(val w: Float = 220f, val h: Float = 60f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val top = Path().apply {
                moveTo(-w / 2f, h)
                var x = -w / 2f
                while (x <= w / 2f) { lineTo(x, 2f * sin(x * 0.08f + s.t * 2f)); x += 6f }
                lineTo(w / 2f, h); close()
            }
            drawPath(top, Brush.verticalGradient(listOf(Color(0xFF3FA1D8), Color(0xFF1C4E7A)), 0f, h))
            for (k in 0 until 4) {
                val x = -w / 2f + frac(hash01(k, 2) + s.t * 0.05f) * (w - 20f)
                drawLine(Color.White.a(0.35f), Offset(x, 10f + k * 10f), Offset(x + 18f, 10f + k * 10f), 1.4f, StrokeCap.Round)
            }
        }
    }

    /** Fishing rod held at the origin; line drops to (hx, hy). */
    class Rod(val hx: Float, val hy: Float) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val tip = Offset(hx - 6f, -64f)
            drawLine(Pal.Wood.darken(0.2f), Offset.Zero, tip, 3.5f, StrokeCap.Round)
            drawCircle(Pal.Steel, 4f, Offset(6f, -8f))
            val bob = sin(s.t * 2f) * 2f
            drawLine(Color.White.a(0.75f), tip, Offset(hx, hy + bob), 1f)
            drawArc(Pal.Steel, 0f, 180f, false, Offset(hx - 4f, hy + bob - 2f), Size(8f, 8f), style = Stroke(1.6f))
        }
    }

    class Strawberry : Prop() {
        override fun DrawScope.render(s: PropState) {
            val p = Path().apply { moveTo(0f, 10f); cubicTo(-14f, 0f, -10f, -10f, 0f, -9f); cubicTo(10f, -10f, 14f, 0f, 0f, 10f); close() }
            drawPath(p, shade(Pal.Coral, -10f, 10f, 0.25f, 0.2f))
            for (i in 0 until 6) drawCircle(Color(0xFFFFE08A), 0.9f, Offset(-5f + (i % 3) * 5f, -3f + (i / 3) * 6f))
            drawPath(Path().apply { moveTo(-6f, -9f); lineTo(0f, -13f); lineTo(6f, -9f); lineTo(0f, -7f); close() }, Pal.Leaf)
        }
    }

    class Worm : Prop() {
        override fun DrawScope.render(s: PropState) {
            val p = Path()
            for (k in 0..10) {
                val x = -10f + k * 2f
                val y = sin(k * 0.9f + s.t * 7f) * 3f
                if (k == 0) p.moveTo(x, y) else p.lineTo(x, y)
            }
            drawPath(p, Color(0xFFE88A9A), style = Stroke(5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
            drawCircle(Pal.Ink, 0.9f, Offset(9f, sin(10 * 0.9f + s.t * 7f) * 3f - 1f))
        }
    }

    /** A fish facing [dir] (-1 left, 1 right) with a wiggling tail. Origin at centre. */
    class Fish(val color: Color = Pal.Gold, val dir: Float = -1f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            withTransform({ scale(-dir, 1f, Offset.Zero) }) {
                val wig = sin(s.t * 9f) * 5f
                val tail = Path().apply { moveTo(14f, 0f); lineTo(28f, -10f + wig); lineTo(26f, 10f + wig); close() }
                drawPath(tail, color.darken(0.15f))
                drawOval(shade(color, -10f, 10f, 0.3f, 0.2f), Offset(-18f, -10f), Size(36f, 20f))
                drawPath(Path().apply { moveTo(-2f, -9f); lineTo(6f, -16f); lineTo(10f, -8f); close() }, color.darken(0.1f))
                drawCircle(Color.White, 3.2f, Offset(-10f, -2f)); drawCircle(Pal.Ink, 1.6f, Offset(-11f, -2f))
                drawArc(color.darken(0.3f), 100f, 160f, false, Offset(-4f, -6f), Size(8f, 12f), style = Stroke(1.2f))
            }
        }
    }

    /** Little hearts floating upward from the origin; key "on". */
    class Hearts(val color: Color = Pal.Rose) : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            for (i in 0 until 5) {
                val ph = frac(s.t * 0.35f + hash01(i, 1))
                val c = Offset((hash01(i, 2) - 0.5f) * 50f + sin(s.t * 2f + i) * 6f, -ph * 70f)
                val k = 4f + 3f * hash01(i, 3)
                val p = Path().apply {
                    moveTo(c.x, c.y + k); cubicTo(c.x - 2.2f * k, c.y - 0.2f * k, c.x - 1.4f * k, c.y - 2f * k, c.x, c.y - 0.9f * k)
                    cubicTo(c.x + 1.4f * k, c.y - 2f * k, c.x + 2.2f * k, c.y - 0.2f * k, c.x, c.y + k); close()
                }
                drawPath(p, color.a(on * sin(ph * TAU / 2f)))
            }
        }
    }
}
