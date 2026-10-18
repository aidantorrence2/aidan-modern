package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Illustrated props for Thinking, Fast and Slow. */
object ThinkingProps {

    /** System 1: a quick hare. Origin = ground under its body. Key "run" cycles the legs and adds speed lines. */
    class Hare(val color: Color = Color(0xFFD9B48A)) : Prop() {
        override val defaults = mapOf("run" to 0f)
        override fun DrawScope.render(s: PropState) {
            val run = s["run"]
            val bounce = abs(sin(s.t * 12f)) * 5f * run
            softShadow(0f, 1f, 54f, 9f)
            if (run > 0.05f) for (k in 0..2) {
                val y = -26f + k * 9f
                val off = frac(s.t * 3f + k * 0.3f) * 18f
                drawLine(Color.White.a(0.5f * run), Offset(-34f - off, y), Offset(-48f - off, y), 2f, StrokeCap.Round)
            }
            withTransform({ translate(0f, -bounce) }) {
                val sw = sin(s.t * 12f) * run
                drawLine(color.darken(0.2f), Offset(-12f, -10f), Offset(-18f - sw * 8f, 0f), 6f, StrokeCap.Round)
                drawLine(color.darken(0.2f), Offset(10f, -10f), Offset(16f + sw * 8f, 0f), 6f, StrokeCap.Round)
                drawOval(shade(color, -34f, -6f), Offset(-22f, -34f), Size(42f, 28f))
                drawCircle(Color.White, 6f, Offset(-22f, -24f))
                drawOval(Color(0xFFF2E6D8), Offset(-8f, -22f), Size(18f, 14f))
                val head = Offset(20f, -40f)
                for (dx in listOf(-4f, 3f)) {
                    rotate(-12f + dx * 3f + sin(s.t * 3f + dx) * 4f, Offset(head.x + dx, head.y - 8f)) {
                        drawOval(shade(color, head.y - 42f, head.y - 6f), Offset(head.x + dx - 4.5f, head.y - 40f), Size(9f, 32f))
                        drawOval(Pal.Rose.a(0.6f), Offset(head.x + dx - 2f, head.y - 34f), Size(4f, 22f))
                    }
                }
                drawCircle(shade(color, head.y - 13f, head.y + 13f), 13f, head)
                drawCircle(Color.White, 3.6f, Offset(head.x + 4f, head.y - 3f))
                drawCircle(Pal.Ink, 2f, Offset(head.x + 5f, head.y - 3f))
                drawCircle(Pal.Rose, 2f, Offset(head.x + 12f, head.y + 2f))
            }
        }
    }

    /** System 2: a slow, careful tortoise. Keys: walk, sleep (zzz), sweat. Origin = ground. */
    class Tortoise(val shell: Color = Color(0xFF5E9A5A)) : Prop() {
        override val defaults = mapOf("walk" to 0f, "sleep" to 0f, "sweat" to 0f)
        override fun DrawScope.render(s: PropState) {
            val walk = s["walk"]
            val sleep = s["sleep"]
            val skin = Color(0xFF9CC48A)
            softShadow(0f, 1f, 70f, 10f)
            val sw = sin(s.t * 3f) * walk
            for ((i, x) in listOf(-20f, -6f, 8f, 20f).withIndex()) {
                val o = if (i % 2 == 0) sw * 3f else -sw * 3f
                drawRoundRect(skin.darken(0.1f), Offset(x - 4f + o, -12f), Size(9f, 12f), CornerRadius(4f))
            }
            val head = Offset(34f + sw * 1.5f, -18f + sleep * 6f)
            drawLine(skin, Offset(20f, -14f), head, 10f, StrokeCap.Round)
            drawCircle(shade(skin, head.y - 9f, head.y + 9f), 9f, head)
            if (sleep > 0.5f) {
                drawArc(Pal.Ink, 20f, 140f, false, Offset(head.x - 1f, head.y - 4f), Size(7f, 5f), style = Stroke(1.6f))
                for (k in 0..2) {
                    val ph = frac(s.t * 0.5f + k / 3f)
                    label(s.m, "z", head.x + 10f + ph * 16f, head.y - 12f - ph * 30f, 9f + k * 2f, Color.White, 800, alpha = sleep * (1f - ph))
                }
            } else {
                drawCircle(Color.White, 3f, Offset(head.x + 3f, head.y - 2f))
                drawCircle(Pal.Ink, 1.6f, Offset(head.x + 4f, head.y - 2f))
                drawLine(Pal.Ink, Offset(head.x + 3f, head.y + 4f), Offset(head.x + 7f, head.y + 3f), 1.4f, StrokeCap.Round)
            }
            val dome = Path().apply { moveTo(-30f, -8f); cubicTo(-28f, -44f, 26f, -44f, 28f, -8f); close() }
            drawPath(dome, shade(shell, -40f, -8f, 0.25f, 0.25f))
            for (k in 0..2) drawOval(shell.lighten(0.2f).a(0.6f), Offset(-20f + k * 14f, -28f + (k % 2) * 4f), Size(12f, 9f), style = Stroke(1.6f))
            drawRoundRect(shell.darken(0.3f), Offset(-32f, -10f), Size(62f, 5f), CornerRadius(2.5f))
            if (s["sweat"] > 0.05f) withTransform({ translate(head.x - 6f, head.y - 10f) }) { with(Drips(Pal.Sky, 6f)) { render(s) } }
        }
    }

    /** A framed photo of an angry face, read in an instant. Origin = centre. */
    class FaceCard : Prop() {
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 58f, 64f, Pal.Paper, 6f)
            drawCircle(shade(Pal.Skin[1], -20f, 20f), 19f, Offset(0f, -2f))
            drawLine(Pal.Ink, Offset(-12f, -12f), Offset(-3f, -8f), 2.5f, StrokeCap.Round)
            drawLine(Pal.Ink, Offset(12f, -12f), Offset(3f, -8f), 2.5f, StrokeCap.Round)
            drawCircle(Pal.Ink, 2.2f, Offset(-7f, -4f)); drawCircle(Pal.Ink, 2.2f, Offset(7f, -4f))
            drawArc(Pal.Ink, 200f, 140f, false, Offset(-7f, 6f), Size(14f, 10f), style = Stroke(2.2f, cap = StrokeCap.Round))
            drawCircle(Pal.Coral.a(0.35f), 4f, Offset(-12f, 4f)); drawCircle(Pal.Coral.a(0.35f), 4f, Offset(12f, 4f))
        }
    }

    /** A little car; key "drive" spins the wheels. Origin = ground. */
    class Car(val color: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("drive" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 70f, 8f)
            val body = Path().apply {
                moveTo(-34f, -8f); lineTo(-34f, -20f); quadraticTo(-30f, -24f, -18f, -24f); lineTo(-10f, -36f)
                lineTo(14f, -36f); lineTo(24f, -24f); quadraticTo(34f, -23f, 35f, -14f); lineTo(35f, -8f); close()
            }
            drawPath(body, shade(color, -36f, -8f))
            drawPath(Path().apply { moveTo(-7f, -33f); lineTo(1f, -33f); lineTo(1f, -25f); lineTo(-13f, -25f); close() }, Color(0xFFBFE4FF))
            drawPath(Path().apply { moveTo(4f, -33f); lineTo(13f, -33f); lineTo(20f, -25f); lineTo(4f, -25f); close() }, Color(0xFFBFE4FF))
            drawCircle(Pal.Gold, 2.5f, Offset(32f, -17f))
            for (x in listOf(-20f, 20f)) {
                drawCircle(Pal.Ink, 8f, Offset(x, -6f)); drawCircle(Pal.Steel, 3.5f, Offset(x, -6f))
                val a = s.t * 10f * s["drive"]
                drawLine(Pal.Ink, Offset(x + cos(a) * 3f, -6f + sin(a) * 3f), Offset(x - cos(a) * 3f, -6f - sin(a) * 3f), 1.5f)
            }
        }
    }

    /** Rubber stamp that thumps down and leaves an "OK" mark; key "p" 0→1. Origin = where the mark lands. */
    class Stamp(val text: String = "OK", val color: Color = Pal.Leaf) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            if (p > 0.5f) {
                val k = min(1f, (p - 0.5f) * 3f)
                rotate(-10f, Offset.Zero) {
                    drawRoundRect(color.a(k), Offset(-22f, -11f), Size(44f, 22f), CornerRadius(4f), style = Stroke(2.5f))
                    label(s.m, text, 0f, 0f, 13f, color, 900, alpha = k, letterSpacing = 2f)
                }
            }
            val lift = if (p < 0.5f) 40f * (1f - p * 2f) else 40f * min(1f, (p - 0.5f) * 2.5f)
            withTransform({ translate(0f, -lift - 14f) }) {
                drawRoundRect(shade(Pal.Wood, -26f, -8f), Offset(-6f, -26f), Size(12f, 18f), CornerRadius(4f))
                drawCircle(shade(Pal.Wood, -36f, -24f), 8f, Offset(0f, -30f))
                drawRoundRect(shade(Pal.Slate, -10f, 0f), Offset(-20f, -10f), Size(40f, 10f), CornerRadius(3f))
            }
        }
    }

    /** A jigsaw of cols x rows slots; key "n" fills pieces in order, key "glow" makes the picture feel complete. */
    class Puzzle(val cols: Int = 3, val rows: Int = 2, val cell: Float = 34f, val fillOrder: List<Int> = listOf(0, 4)) : Prop() {
        override val defaults = mapOf("n" to 0f, "glow" to 0f)
        override fun DrawScope.render(s: PropState) {
            val w = cols * cell; val h = rows * cell
            val g = s["glow"]
            if (g > 0f) glow(Pal.Gold, Offset.Zero, w, 0.45f * g)
            drawRoundRect(Color.White.a(0.35f), Offset(-w / 2f, -h / 2f), Size(w, h), CornerRadius(4f),
                style = Stroke(1.6f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 4f))))
            val colors = listOf(Pal.Sky, Pal.Gold, Pal.Mint, Pal.Rose, Pal.Violet, Pal.Peach)
            val n = s["n"]
            fillOrder.forEachIndexed { k, idx ->
                val f = (n - k).coerceIn(0f, 1f)
                if (f <= 0f) return@forEachIndexed
                val cx = -w / 2f + cell * (idx % cols + 0.5f)
                val cy = -h / 2f + cell * (idx / cols + 0.5f)
                val sc = Ease.Back.apply(f)
                withTransform({ scale(sc, sc, Offset(cx, cy)) }) {
                    drawRoundRect(shade(colors[idx % colors.size], cy - cell / 2f, cy + cell / 2f), Offset(cx - cell / 2f + 1f, cy - cell / 2f + 1f), Size(cell - 2f, cell - 2f), CornerRadius(3f))
                    drawCircle(colors[idx % colors.size], 6f, Offset(cx + cell / 2f, cy))
                }
            }
            // gaps get filled in by imagination when the story "feels" complete
            if (g > 0f) for (i in 0 until cols * rows) if (i !in fillOrder) {
                val cx = -w / 2f + cell * (i % cols + 0.5f); val cy = -h / 2f + cell * (i / cols + 0.5f)
                drawRoundRect(Pal.Gold.a(0.28f * g), Offset(cx - cell / 2f + 1f, cy - cell / 2f + 1f), Size(cell - 2f, cell - 2f), CornerRadius(3f))
                label(s.m, "?", cx, cy, 14f, Pal.Gold, 900, alpha = g)
            }
        }
    }

    /** Wheel of fortune; key "spin" 0→1 spins and stops on the segment labelled [stopAt]. Origin = hub. */
    class Wheel(val values: List<String> = listOf("10", "65", "30", "90", "15", "50", "25", "80"), val stopAt: Int = 1, val r: Float = 52f) : Prop() {
        override val defaults = mapOf("spin" to 0f)
        override fun DrawScope.render(s: PropState) {
            val n = values.size
            val seg = 360f / n
            val end = 720f + (270f - (stopAt + 0.5f) * seg)
            val rot = end * s["spin"]
            drawRect(Pal.Steel.darken(0.3f), Offset(-4f, 0f), Size(8f, r + 34f))
            softShadow(0f, r + 34f, 60f, 8f)
            rotate(rot, Offset.Zero) {
                for (i in 0 until n) {
                    val c = listOf(Pal.Coral, Pal.Gold, Pal.Sky, Pal.Mint)[i % 4]
                    drawArc(shade(c, -r, r, 0.15f, 0.1f), i * seg, seg, true, Offset(-r, -r), Size(2 * r, 2 * r))
                    val mid = Math.toRadians((i * seg + seg / 2f).toDouble()).toFloat()
                    rotate(i * seg + seg / 2f + 90f, polar(Offset.Zero, r * 0.68f, mid)) {
                        val p = polar(Offset.Zero, r * 0.68f, mid)
                        label(s.m, values[i], p.x, p.y, 10f, Pal.Ink, 900)
                    }
                }
            }
            drawCircle(Color.White, r, Offset.Zero, style = Stroke(3f))
            drawCircle(shade(Pal.Steel, -7f, 7f), 7f, Offset.Zero)
            val ptr = Path().apply { moveTo(-7f, -r - 10f); lineTo(7f, -r - 10f); lineTo(0f, -r + 6f); close() }
            drawPath(ptr, Pal.White)
        }
    }

    /** Passenger plane; key "wobble" rocks it and trails smoke (the vivid headline). Origin = centre. */
    class Plane(val color: Color = Pal.White) : Prop() {
        override val defaults = mapOf("wobble" to 0f)
        override fun DrawScope.render(s: PropState) {
            val wob = s["wobble"]
            if (wob > 0.05f) for (k in 0 until 6) {
                val ph = frac(s.t * 0.8f + k / 6f)
                drawCircle(Color(0xFF6B6B78).a(0.5f * wob * (1f - ph)), 6f + ph * 10f, Offset(-36f - ph * 50f, 4f + ph * 10f))
            }
            rotate(sin(s.t * 5f) * 8f * wob, Offset.Zero) {
                drawPath(Path().apply { moveTo(-6f, 0f); lineTo(-20f, 26f); lineTo(-10f, 26f); lineTo(10f, 2f); close() }, color.darken(0.2f))
                drawRoundRect(shade(color, -9f, 9f, 0.1f, 0.2f), Offset(-40f, -8f), Size(80f, 16f), CornerRadius(8f))
                drawPath(Path().apply { moveTo(-36f, -6f); lineTo(-44f, -24f); lineTo(-34f, -24f); lineTo(-26f, -6f); close() }, Pal.Coral)
                drawPath(Path().apply { moveTo(-6f, -2f); lineTo(-18f, -22f); lineTo(-8f, -22f); lineTo(10f, -2f); close() }, color.darken(0.1f))
                for (k in 0 until 6) drawCircle(Pal.Sky, 2f, Offset(-18f + k * 8f, -2f))
                drawCircle(Pal.Sky.darken(0.2f), 4f, Offset(34f, -2f))
            }
            if (wob > 0.3f) for (k in 0 until 4) {
                val a = s.t * 12f + k
                drawCircle(Pal.Gold.a(wob * 0.8f), 3f + 2f * abs(sin(a)), Offset(-40f + sin(a) * 4f, 6f + k * 3f))
            }
        }
    }

    /**
     * A crowd of tiny people in a grid. [special] indices get [specialColor]; everyone else gets [color] (and a hat).
     * Key "n" reveals people in order.
     */
    class Crowd(val cols: Int, val rows: Int, val gap: Float = 13f, val color: Color = Pal.Leaf, val special: Set<Int> = emptySet(),
                val specialColor: Color = Pal.Sky, val hats: Boolean = true) : Prop() {
        override val defaults = mapOf("n" to 1000f)
        override fun DrawScope.render(s: PropState) {
            val n = s["n"]
            val w = (cols - 1) * gap; val h = (rows - 1) * gap
            for (i in 0 until cols * rows) {
                val f = (n - i).coerceIn(0f, 1f)
                if (f <= 0f) continue
                val c = Offset(-w / 2f + (i % cols) * gap, -h / 2f + (i / cols) * gap * 1.25f)
                val sp = i in special
                val col = if (sp) specialColor else color
                val k = Ease.Back.apply(f)
                drawRoundRect(col.a(f), Offset(c.x - 3.6f * k, c.y - 1f), Size(7.2f * k, 7f * k), CornerRadius(3f))
                drawCircle(Pal.Skin[i % 4].a(f), 3f * k, Offset(c.x, c.y - 3.5f))
                if (hats && !sp) drawRoundRect(Pal.Gold.darken(0.2f).a(f), Offset(c.x - 4.5f, c.y - 7.5f), Size(9f, 2.2f), CornerRadius(1f))
                if (sp) glow(specialColor, c, 10f, 0.6f)
            }
        }
    }

    /** Euler diagram for the conjunction fallacy. Key "p" grows the inner circle. Origin = centre of the big circle. */
    class Venn(val outer: String = "bank tellers", val inner: String = "bank tellers\nwho are activists") : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            drawCircle(Pal.Sky.a(0.22f), 68f, Offset.Zero)
            drawCircle(Pal.Sky, 68f, Offset.Zero, style = Stroke(2.5f))
            label(s.m, outer, 0f, -46f, 11f, Pal.White, 800)
            val p = Ease.Back.apply(s["p"])
            if (p > 0.01f) {
                drawCircle(Pal.Coral.a(0.3f), 30f * p, Offset(8f, 12f))
                drawCircle(Pal.Coral, 30f * p, Offset(8f, 12f), style = Stroke(2.5f))
                label(s.m, inner, 8f, 12f, 8.5f, Pal.White, 800, maxWidth = 58f, alpha = min(1f, s["p"]))
            }
        }
    }

    /** A coin spinning in the air; key "flip". Origin = centre. */
    class CoinFlip : Prop() {
        override val defaults = mapOf("flip" to 1f)
        override fun DrawScope.render(s: PropState) {
            val f = s["flip"]
            val sx = if (f > 0.01f) cos(s.t * 9f) else 1f
            val heads = sx >= 0f
            withTransform({ translate(0f, -abs(sin(s.t * 4.5f)) * 14f * f); scale(max(0.08f, abs(sx)), 1f, Offset.Zero) }) {
                drawCircle(Brush.radialGradient(listOf(Color(0xFFFFE08A), Pal.Gold, Color(0xFFB9831F)), Offset(-5f, -6f), 28f), 17f, Offset.Zero)
                drawCircle(Color(0xFFB9831F), 12.5f, Offset.Zero, style = Stroke(1.5f))
                label(s.m, if (heads) "H" else "T", 0f, 0f, 13f, Color(0xFF9A6A12), 900)
            }
        }
    }

    /** A balance scale; key "tilt" from -1 (left down) to 1 (right down). Pans carry labels. Origin = base. */
    class Scale(val left: String, val right: String, val leftColor: Color = Pal.Leaf, val rightColor: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("tilt" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 70f, 10f)
            drawRoundRect(shade(Pal.Wood, -8f, 0f), Offset(-28f, -8f), Size(56f, 8f), CornerRadius(3f))
            drawRect(shade(Pal.Steel, -110f, -8f), Offset(-3f, -110f), Size(6f, 102f))
            val ang = s["tilt"] * 16f
            val pivot = Offset(0f, -110f)
            val rad = Math.toRadians(ang.toDouble()).toFloat()
            val armL = Offset(pivot.x - cos(rad) * 70f, pivot.y - sin(rad) * 70f)
            val armR = Offset(pivot.x + cos(rad) * 70f, pivot.y + sin(rad) * 70f)
            drawLine(Pal.Steel, armL, armR, 5f, StrokeCap.Round)
            drawCircle(Pal.Gold, 6f, pivot)
            for ((end, txt, col) in listOf(Triple(armL, left, leftColor), Triple(armR, right, rightColor))) {
                drawLine(Pal.Steel.a(0.8f), end, Offset(end.x - 18f, end.y + 34f), 1.4f)
                drawLine(Pal.Steel.a(0.8f), end, Offset(end.x + 18f, end.y + 34f), 1.4f)
                drawArc(shade(Pal.Steel, end.y + 30f, end.y + 44f), 0f, 180f, true, Offset(end.x - 24f, end.y + 26f), Size(48f, 18f))
                label(s.m, txt, end.x, end.y + 22f, 11f, Pal.Ink, 900, chip = col)
            }
        }
    }

    /** A mug with a price tag; origin = ground. */
    class Mug(val color: Color = Pal.Sky) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 44f, 7f)
            drawArc(color.darken(0.15f), -90f, 180f, false, Offset(10f, -30f), Size(18f, 18f), style = Stroke(5f))
            drawRoundRect(shade(color, -40f, 0f), Offset(-16f, -40f), Size(32f, 40f), CornerRadius(5f))
            drawOval(color.darken(0.35f), Offset(-15f, -43f), Size(30f, 7f))
            drawCircle(Color.White.a(0.85f), 6f, Offset(0f, -20f))
            label(s.m, "♥", 0f, -20f, 8f, Pal.Coral, 900)
        }
    }

    class Ticket : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(-8f + sin(s.t * 2f) * 3f, Offset.Zero) {
                drawRoundRect(shade(Pal.Gold, -16f, 16f), Offset(-34f, -16f), Size(68f, 32f), CornerRadius(4f))
                for (k in 0 until 5) drawCircle(Color(0xFF1A1B22), 2.2f, Offset(-14f, -12f + k * 6f))
                label(s.m, "LOTTO", 9f, -5f, 10f, Pal.Ink, 900, letterSpacing = 1f)
                label(s.m, "07 13 42", 9f, 8f, 8f, Pal.Ink, 700)
            }
        }
    }

    class Umbrella(val color: Color = Pal.Violet) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawLine(Pal.Ink, Offset(0f, -26f), Offset(0f, 22f), 2.5f)
            drawArc(Pal.Ink, 0f, 180f, false, Offset(0f, 16f), Size(10f, 10f), style = Stroke(2.5f))
            val canopy = Path().apply {
                moveTo(-34f, -24f); cubicTo(-30f, -54f, 30f, -54f, 34f, -24f)
                quadraticTo(23f, -30f, 11f, -24f); quadraticTo(0f, -30f, -11f, -24f); quadraticTo(-23f, -30f, -34f, -24f); close()
            }
            drawPath(canopy, shade(color, -50f, -24f, 0.3f, 0.2f))
        }
    }

    /** Müller-Lyer illusion: two equal lines with inward/outward fins. Key "ruler" shows they're equal. Origin = centre. */
    class MullerLyer : Prop() {
        override val defaults = mapOf("ruler" to 0f)
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 170f, 100f, Pal.Paper, 8f)
            val len = 100f
            for ((i, y) in listOf(-22f, 22f).withIndex()) {
                drawLine(Pal.Ink, Offset(-len / 2f, y), Offset(len / 2f, y), 3f, StrokeCap.Round)
                val d = if (i == 0) 1f else -1f
                for (x in listOf(-len / 2f, len / 2f)) {
                    val dir = if (x < 0) 1f else -1f
                    drawLine(Pal.Ink, Offset(x, y), Offset(x + dir * 12f * d, y - 10f), 2.5f, StrokeCap.Round)
                    drawLine(Pal.Ink, Offset(x, y), Offset(x + dir * 12f * d, y + 10f), 2.5f, StrokeCap.Round)
                }
            }
            val r = s["ruler"]
            if (r > 0f) for (x in listOf(-len / 2f, len / 2f)) {
                drawLine(Pal.Coral.a(r), Offset(x, -40f), Offset(x, 40f), 1.6f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 4f)))
            }
        }
    }

    class Warning : Prop() {
        override fun DrawScope.render(s: PropState) {
            val pulse = 1f + 0.06f * sin(s.t * 6f)
            withTransform({ scale(pulse, pulse, Offset.Zero) }) {
                glow(Pal.Gold, Offset.Zero, 46f, 0.4f)
                val p = Path().apply { moveTo(0f, -26f); lineTo(28f, 22f); lineTo(-28f, 22f); close() }
                drawPath(p, shade(Pal.Gold, -26f, 22f, 0.3f, 0.2f))
                drawPath(p, Pal.Ink, style = Stroke(3f, join = StrokeJoin.Round))
                label(s.m, "!", 0f, 6f, 24f, Pal.Ink, 900)
            }
        }
    }

    /** Clipboard checklist; key "done" ticks items in order. Origin = centre. */
    class Checklist(val items: List<String>) : Prop() {
        override val defaults = mapOf("done" to 0f)
        override fun DrawScope.render(s: PropState) {
            val h = 30f + items.size * 18f
            card(0f, 0f, 112f, h, Pal.Wood, 6f)
            drawRoundRect(Pal.Paper, Offset(-50f, -h / 2f + 10f), Size(100f, h - 16f), CornerRadius(3f))
            drawRoundRect(shade(Pal.Steel, -h / 2f - 4f, -h / 2f + 8f), Offset(-18f, -h / 2f - 4f), Size(36f, 12f), CornerRadius(3f))
            items.forEachIndexed { i, t ->
                val y = -h / 2f + 26f + i * 18f
                drawRoundRect(Pal.Slate, Offset(-42f, y - 5f), Size(10f, 10f), CornerRadius(2f), style = Stroke(1.4f))
                val f = (s["done"] - i).coerceIn(0f, 1f)
                if (f > 0f) {
                    val ck = Path().apply { moveTo(-41f, y); lineTo(-38f, y + 3f); lineTo(-31f, y - 5f) }
                    drawPath(ck, Pal.Leaf.a(f), style = Stroke(2.4f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                }
                label(s.m, t, -26f, y, 8.5f, Pal.Ink, 700, Align.START, maxWidth = 72f)
            }
        }
    }

    /** Holiday postcard; origin = centre. */
    class Postcard : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(4f, Offset.Zero) {
                card(0f, 0f, 92f, 64f, Pal.Paper, 4f)
                drawRect(Brush.verticalGradient(listOf(Color(0xFF7CC4F5), Color(0xFFFFD49A)), -26f, 8f), Offset(-40f, -26f), Size(80f, 34f))
                drawCircle(Color(0xFFFFE7B8), 8f, Offset(18f, -10f))
                drawRect(Color(0xFF2F8FC4), Offset(-40f, 8f), Size(80f, 8f))
                drawRect(Color(0xFFF2D49A), Offset(-40f, 16f), Size(80f, 10f))
                drawLine(Pal.Wood, Offset(-22f, 18f), Offset(-18f, -12f), 3f, StrokeCap.Round)
                for (k in 0..3) drawLine(Pal.Leaf, Offset(-18f, -12f), polar(Offset(-18f, -12f), 13f, -2.6f + k * 0.75f), 3f, StrokeCap.Round)
            }
        }
    }

    /** A strip of holiday days rated by mood; [best] and [last] get stars. Origin = centre. */
    class DayStrip(val moods: List<Float> = listOf(0.3f, 0.5f, 0.2f, 1f, 0.4f, 0.3f, 0.8f), val best: Int = 3) : Prop() {
        override val defaults = mapOf("mark" to 0f)
        override fun DrawScope.render(s: PropState) {
            val n = moods.size; val gap = 26f
            val x0 = -(n - 1) * gap / 2f
            val mark = s["mark"]
            moods.forEachIndexed { i, m ->
                val c = Offset(x0 + i * gap, 0f)
                val key = i == best || i == n - 1
                val col = lerp(Pal.Slate, Pal.Gold, m)
                drawRoundRect(col.a(if (key || mark < 0.5f) 1f else 1f - 0.6f * min(1f, (mark - 0.5f) * 2f)), Offset(c.x - 11f, -11f), Size(22f, 22f), CornerRadius(5f))
                drawArc(Pal.Ink, 20f, 140f, false, Offset(c.x - 5f, -2f - (m - 0.5f) * 4f), Size(10f, 6f + m * 4f), style = Stroke(1.5f))
                label(s.m, "d${i + 1}", c.x, 20f, 8f, Pal.White, 700)
                if (key && mark > 0f) withTransform({ translate(c.x, -24f); scale(mark * 0.5f, mark * 0.5f, Offset.Zero) }) { with(Star(Pal.Gold, 14f)) { render(s) } }
            }
        }
    }
}
