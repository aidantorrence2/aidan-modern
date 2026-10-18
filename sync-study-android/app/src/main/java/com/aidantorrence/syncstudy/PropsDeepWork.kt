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
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/** Illustrated props for Deep Work. */
object DeepWorkProps {

    /** A desk with a laptop. Key "lid" (1 open, 0 closed), "lamp" turns on a desk lamp. Origin = floor centre. */
    class Desk(val w: Float = 120f, val lampOn: Boolean = false) : Prop() {
        override val defaults = mapOf("lid" to 1f, "lamp" to (if (lampOn) 1f else 0f))
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, w * 1.1f, 12f, 0.32f)
            drawRect(Pal.Wood.darken(0.35f), Offset(-w / 2f + 8f, -52f), Size(7f, 52f))
            drawRect(Pal.Wood.darken(0.35f), Offset(w / 2f - 15f, -52f), Size(7f, 52f))
            drawRoundRect(shade(Pal.Wood, -60f, -50f), Offset(-w / 2f, -60f), Size(w, 10f), CornerRadius(3f))
            // laptop
            val lid = s["lid"]
            drawRoundRect(Color(0xFF3A3F4E), Offset(-26f, -64f), Size(52f, 5f), CornerRadius(2f))
            val lh = 36f * lid
            if (lh > 1f) {
                drawRoundRect(Color(0xFF2B2F3A), Offset(-24f, -64f - lh), Size(48f, lh), CornerRadius(3f))
                drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF5B8DEF), Color(0xFF8E5BD8)), -64f - lh, -64f), Offset(-21f, -61f - lh), Size(42f, lh - 6f), CornerRadius(2f))
                for (k in 0..2) if (lh > 20f) drawLine(Color.White.a(0.6f), Offset(-15f, -58f - lh + 8f + k * 7f), Offset(if (k == 2) 0f else 15f, -58f - lh + 8f + k * 7f), 1.6f, StrokeCap.Round)
            }
            val lamp = s["lamp"]
            val lx = w / 2f - 18f
            if (lamp > 0f) {
                val cone = Path().apply { moveTo(lx - 10f, -94f); lineTo(lx + 4f, -94f); lineTo(lx + 16f, -60f); lineTo(lx - 40f, -60f); close() }
                drawPath(cone, Brush.verticalGradient(listOf(Color(0xFFFFE9A8).a(0.55f * lamp), Color.Transparent), -94f, -60f))
            }
            drawLine(Pal.Steel, Offset(lx, -60f), Offset(lx + 6f, -86f), 2.5f)
            drawLine(Pal.Steel, Offset(lx + 6f, -86f), Offset(lx - 4f, -96f), 2.5f)
            drawArc(Pal.Gold, 160f, 180f, true, Offset(lx - 14f, -104f), Size(20f, 16f))
        }
    }

    /** Glowing dome of concentration around a person; key "on". */
    class FocusDome(val r: Float = 70f, val color: Color = Pal.Mint) : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            val pulse = 1f + 0.02f * sin(s.t * 2f)
            drawArc(Brush.radialGradient(listOf(color.a(0.05f * on), color.a(0.22f * on)), Offset.Zero, r * pulse), 180f, 180f, true, Offset(-r * pulse, -r * pulse), Size(2 * r * pulse, 2 * r * pulse))
            drawArc(color.a(0.8f * on), 180f, 180f, false, Offset(-r * pulse, -r * pulse), Size(2 * r * pulse, 2 * r * pulse), style = Stroke(2f))
            drawArc(Color.White.a(0.4f * on), 205f, 40f, false, Offset(-r * 0.86f, -r * 0.86f), Size(r * 1.72f, r * 1.72f), style = roundStroke(3f))
        }
    }

    class Envelope(val color: Color = Pal.Paper) : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(sin(s.t * 3f) * 6f, Offset.Zero) {
                drawRoundRect(Color.Black.a(0.25f), Offset(-13f, -7f), Size(28f, 20f), CornerRadius(2f))
                drawRoundRect(shade(color, -9f, 9f, 0.05f, 0.12f), Offset(-14f, -9f), Size(28f, 19f), CornerRadius(2f))
                val fl = Path().apply { moveTo(-14f, -9f); lineTo(0f, 2f); lineTo(14f, -9f) }
                drawPath(fl, Pal.Slate, style = Stroke(1.5f))
                drawCircle(Pal.Coral, 3.5f, Offset(12f, -9f))
            }
        }
    }

    /** Envelopes orbiting the origin (someone juggling messages); key "n" = how many. */
    class Orbit(val r: Float = 52f) : Prop() {
        override val defaults = mapOf("n" to 5f)
        override fun DrawScope.render(s: PropState) {
            val n = s["n"]
            val count = ceil(n).toInt()
            for (i in 0 until count) {
                val k = (n - i).coerceIn(0f, 1f)
                val a = s.t * 2.4f + i * TAU / count
                val c = Offset(cos(a) * r, sin(a) * r * 0.45f)
                withTransform({ translate(c.x, c.y); scale(0.7f * k, 0.7f * k, Offset.Zero) }) {
                    drawRoundRect(shade(Pal.Paper, -9f, 9f, 0.05f, 0.12f), Offset(-14f, -9f), Size(28f, 19f), CornerRadius(2f))
                    drawPath(Path().apply { moveTo(-14f, -9f); lineTo(0f, 2f); lineTo(14f, -9f) }, Pal.Slate, style = Stroke(1.5f))
                }
            }
        }
    }

    /** Grey fog of attention residue; key "v" thickness. */
    class Fog(val w: Float = 90f) : Prop() {
        override val defaults = mapOf("v" to 0f)
        override fun DrawScope.render(s: PropState) {
            val v = s["v"]
            if (v <= 0.01f) return
            for (i in 0 until 9) {
                val x = (hash01(i, 1) - 0.5f) * w + sin(s.t * 0.6f + i) * 8f
                val y = (hash01(i, 2) - 0.5f) * w * 0.4f + cos(s.t * 0.5f + i) * 4f
                val r = w * (0.18f + 0.12f * hash01(i, 3))
                drawCircle(Brush.radialGradient(listOf(Color(0xFFB8BCC8).a(0.55f * v), Color.Transparent), Offset(x, y), r), r, Offset(x, y))
            }
        }
    }

    /** Output as an area: width = time (key "w", 0..1), height = focus (key "h", 0..1). */
    class AreaBox(val maxW: Float = 150f, val maxH: Float = 100f, val color: Color = Pal.Gold) : Prop() {
        override val defaults = mapOf("w" to 0f, "h" to 0f)
        override fun DrawScope.render(s: PropState) {
            val ww = maxW * s["w"]; val hh = maxH * s["h"]
            val x0 = -maxW / 2f; val y0 = maxH / 2f
            drawLine(Color.White.a(0.4f), Offset(x0, y0), Offset(x0 + maxW + 8f, y0), 1.6f)
            drawLine(Color.White.a(0.4f), Offset(x0, y0), Offset(x0, y0 - maxH - 8f), 1.6f)
            label(s.m, "time →", x0 + maxW, y0 + 11f, 10f, Color.White.a(0.7f), 700, Align.END)
            label(s.m, "focus ↑", x0 - 4f, y0 - maxH - 14f, 10f, Color.White.a(0.7f), 700, Align.START)
            if (ww > 1f && hh > 1f) {
                drawRect(shade(color, y0 - hh, y0, 0.25f, 0.2f), Offset(x0 + 1f, y0 - hh), Size(ww, hh))
                drawRect(Color.White.a(0.25f), Offset(x0 + 1f, y0 - hh), Size(ww, hh), style = Stroke(1.5f))
                if (ww > 50f && hh > 22f) label(s.m, "OUTPUT", x0 + ww / 2f, y0 - hh / 2f, 11f, Pal.Ink, 900, letterSpacing = 1f)
            }
        }
    }

    /** Sunlight through a lens: diffuse rays become a hot point as key "focus" goes 0 → 1. Origin = lens. */
    class FocusBeam : Prop() {
        override val defaults = mapOf("focus" to 0f)
        override fun DrawScope.render(s: PropState) {
            val f = s["focus"]
            val target = Offset(0f, 90f)
            for (k in 0 until 7) {
                val x = -42f + k * 14f
                val end = Offset(x * (1f - f) + target.x * f, target.y)
                drawLine(Color(0xFFFFE9A8).a(0.35f + 0.4f * f), Offset(x, -60f), Offset(x, 0f), 2f)
                drawLine(Color(0xFFFFE9A8).a(0.35f + 0.4f * f), Offset(x, 0f), end, 2f)
            }
            drawOval(Color(0xFFBFE4FF).a(0.45f), Offset(-46f, -7f), Size(92f, 14f))
            drawOval(Pal.Steel, Offset(-46f, -7f), Size(92f, 14f), style = Stroke(3f))
            drawRect(Pal.Paper.darken(0.1f), Offset(-50f, 90f), Size(100f, 6f))
            if (f > 0.6f) {
                val hot = (f - 0.6f) / 0.4f
                glow(Color(0xFFFFB347), target, 30f * hot, 0.9f)
                drawCircle(Color.White.a(hot), 4f * hot, target)
                for (k in 0 until 4) {
                    val ph = frac(s.t * 0.8f + k / 4f)
                    drawCircle(Color(0xFFB8BCC8).a(hot * (1f - ph) * 0.6f), 3f + ph * 6f, Offset(target.x + sin(k + s.t) * 4f, target.y - 4f - ph * 30f))
                }
            }
        }
    }

    /** A chat ping bubble that pops and wobbles. */
    class Ping(val text: String = "ping!", val color: Color = Pal.Sky) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val b = 1f + 0.06f * sin(s.t * 8f)
            withTransform({ scale(b, b, Offset.Zero) }) {
                drawPath(Path().apply { moveTo(-6f, 8f); lineTo(-12f, 16f); lineTo(2f, 8f); close() }, color)
                drawRoundRect(color, Offset(-22f, -10f), Size(44f, 19f), CornerRadius(9f))
                label(s.m, text, 0f, -0.5f, 9f, Pal.Ink, 800)
            }
        }
    }

    /** Log cabin in the woods. Origin = ground. */
    class Cabin : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 120f, 12f)
            for (x in listOf(-58f, 56f)) {
                drawRect(Pal.Wood.darken(0.4f), Offset(x - 2f, -14f), Size(5f, 14f))
                drawPath(Path().apply { moveTo(x - 16f, -14f); lineTo(x, -60f); lineTo(x + 16f, -14f); close() }, shade(Color(0xFF2F6B4B), -60f, -14f))
            }
            drawRect(shade(Color(0xFF8A5A33), -40f, 0f), Offset(-34f, -40f), Size(68f, 40f))
            for (k in 1..4) drawLine(Color(0xFF5E3B1F), Offset(-34f, -k * 8f), Offset(34f, -k * 8f), 1.5f)
            drawPath(Path().apply { moveTo(-42f, -38f); lineTo(0f, -68f); lineTo(42f, -38f); close() }, shade(Color(0xFF6E3A2A), -68f, -38f))
            drawRect(Color(0xFFFFD98A).a(0.9f), Offset(10f, -30f), Size(12f, 11f))
            drawRect(Color(0xFF4A2E18), Offset(-16f, -24f), Size(12f, 24f))
            for (k in 0..2) {
                val ph = frac(s.t * 0.4f + k / 3f)
                drawCircle(Color.White.a(0.35f * (1f - ph)), 4f + ph * 6f, Offset(24f + ph * 10f, -70f - ph * 26f))
            }
            drawRect(Color(0xFF5E3B1F), Offset(18f, -70f), Size(8f, 16f))
        }
    }

    /** A row of 7 day cells; [deep] lists the deep-work fraction (0..1) of each day; key "p" fills them. */
    class WeekRow(val deep: List<Float>, val color: Color) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val cell = 24f
            for (d in 0 until 7) {
                val x = -3.5f * cell + d * cell + cell / 2f
                drawRoundRect(Color.White.a(0.08f), Offset(x - 10f, -10f), Size(20f, 20f), CornerRadius(4f))
                val k = ((s["p"] * 8f - d) / 1.2f).coerceIn(0f, 1f)
                val f = deep[d] * k
                if (f > 0.01f) drawRoundRect(color.a(0.9f), Offset(x - 10f, 10f - 20f * f), Size(20f, 20f * f), CornerRadius(4f))
            }
            listOf("M", "T", "W", "T", "F", "S", "S").forEachIndexed { d, l -> label(s.m, l, -3.5f * cell + d * cell + cell / 2f, 18f, 7f, Color.White.a(0.5f), 700) }
        }
    }

    /** Scoreboard of deep hours; key "n" counts tally marks. */
    class Scoreboard(val title: String = "DEEP HOURS") : Prop() {
        override val defaults = mapOf("n" to 0f)
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 120f, 70f, Color(0xFF1F2A24), 6f)
            drawRoundRect(Pal.Wood, Offset(-60f, -35f), Size(120f, 70f), CornerRadius(6f), style = Stroke(4f))
            label(s.m, title, 0f, -22f, 9f, Pal.Gold, 900, letterSpacing = 1f)
            val n = s["n"].toInt()
            for (i in 0 until n) {
                val group = i / 5; val j = i % 5
                val gx = -48f + group * 26f
                if (j < 4) drawLine(Color.White.a(0.85f), Offset(gx + j * 5f, -8f), Offset(gx + j * 5f, 16f), 2.2f, StrokeCap.Round)
                else drawLine(Color.White.a(0.85f), Offset(gx - 3f, 12f), Offset(gx + 19f, -4f), 2.2f, StrokeCap.Round)
            }
        }
    }

    class Moon : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(Color(0xFFFFF4D6), Offset.Zero, 46f, 0.4f)
            drawCircle(Color(0xFFFFF4D6), 18f, Offset.Zero)
            drawCircle(Color(0xFF1B2242), 16f, Offset(8f, -5f))
            for (k in 0..2) {
                val tw = 0.4f + 0.6f * (0.5f + 0.5f * sin(s.t * 2f + k * 2f))
                drawCircle(Color.White.a(tw), 1.5f, Offset(-34f + k * 26f, -20f + (k % 2) * 30f))
            }
        }
    }

    /** One day as a horizontal bar: [blocks] = (start, length, colour, label) in 0..1; key "p" fills them. */
    class DayBar(val blocks: List<Pair<Pair<Float, Float>, Pair<Color, String>>>, val w: Float = 300f) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(Color.White.a(0.08f), Offset(-w / 2f, -14f), Size(w, 28f), CornerRadius(8f))
            blocks.forEachIndexed { i, (se, cl) ->
                val k = ((s["p"] * (blocks.size + 1) - i) / 1.2f).coerceIn(0f, 1f)
                if (k <= 0f) return@forEachIndexed
                val x = -w / 2f + se.first * w
                val bw = se.second * w
                drawRoundRect(cl.first.a(min(1f, k * 2f)), Offset(x + 1f, -13f), Size(bw * Ease.Out.apply(k) - 2f, 26f), CornerRadius(7f))
                if (bw > 30f) label(s.m, cl.second, x + bw / 2f, 0f, 9f, Pal.Ink, 800, alpha = k, maxWidth = bw - 4f)
            }
            label(s.m, "9am", -w / 2f, 24f, 8f, Color.White.a(0.5f), 700, Align.START)
            label(s.m, "6pm", w / 2f, 24f, 8f, Color.White.a(0.5f), 700, Align.END)
        }
    }

    /** Jigsaw pieces that click together as key "p" goes 0 → 1. */
    class Puzzle(val color: Color = Pal.Gold) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            val homes = listOf(Offset(-11f, -11f), Offset(11f, -11f), Offset(-11f, 11f), Offset(11f, 11f))
            val starts = listOf(Offset(-30f, -26f), Offset(32f, -20f), Offset(-26f, 28f), Offset(34f, 24f))
            for (i in 0..3) {
                val k = ((p * 5f - i) / 1.5f).coerceIn(0f, 1f)
                val e = Ease.Back.apply(k)
                val c = Offset(starts[i].x + (homes[i].x - starts[i].x) * e, starts[i].y + (homes[i].y - starts[i].y) * e)
                val col = listOf(color, color.lighten(0.2f), color.darken(0.1f), color.lighten(0.1f))[i]
                drawRoundRect(shade(col, c.y - 10f, c.y + 10f), Offset(c.x - 10f, c.y - 10f), Size(20f, 20f), CornerRadius(3f))
                drawCircle(col, 4f, Offset(c.x + (if (i % 2 == 0) 10f else -10f), c.y))
            }
            if (p > 0.95f) glow(color, Offset.Zero, 40f, 0.5f)
        }
    }

    /** A balance scale with two labelled pans; key "tilt" (-1 left heavy .. 1 right heavy). */
    class Balance(val leftText: String, val rightText: String, val leftColor: Color = Pal.Leaf, val rightColor: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("tilt" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 70f, 10f)
            drawRoundRect(shade(Pal.Wood, -8f, 0f), Offset(-26f, -8f), Size(52f, 8f), CornerRadius(3f))
            drawRect(Pal.Steel, Offset(-3f, -80f), Size(6f, 72f))
            val ang = s["tilt"] * 0.32f
            val l = Offset(-cos(ang) * 60f, -80f + sin(ang) * 60f)
            val r = Offset(cos(ang) * 60f, -80f - sin(ang) * 60f)
            drawLine(Pal.Steel, l, r, 4f, StrokeCap.Round)
            drawCircle(Pal.Gold, 6f, Offset(0f, -80f))
            for ((pt, txt, col) in listOf(Triple(l, leftText, leftColor), Triple(r, rightText, rightColor))) {
                drawLine(Pal.Steel.a(0.7f), pt, Offset(pt.x - 16f, pt.y + 26f), 1.2f)
                drawLine(Pal.Steel.a(0.7f), pt, Offset(pt.x + 16f, pt.y + 26f), 1.2f)
                drawArc(shade(Pal.Steel, pt.y + 22f, pt.y + 34f), 0f, 180f, true, Offset(pt.x - 22f, pt.y + 18f), Size(44f, 16f))
                label(s.m, txt, pt.x, pt.y + 10f, 9.5f, Pal.Ink, 800, chip = col, maxWidth = 70f)
            }
        }
    }

    /** Desk drawer; key "shut" slides it closed (hiding whatever was put in). Origin = drawer front centre. */
    class Drawer : Prop() {
        override val defaults = mapOf("shut" to 0f)
        override fun DrawScope.render(s: PropState) {
            val out = 26f * (1f - s["shut"])
            drawRect(shade(Pal.Wood.darken(0.2f), -30f, 30f), Offset(-56f, -30f), Size(112f, 60f))
            drawRect(Color.Black.a(0.5f), Offset(-48f, -18f), Size(96f, 30f))
            drawRect(shade(Pal.Wood.lighten(0.05f), -18f + out * 0.2f, 12f), Offset(-50f, -18f + out), Size(100f, 30f))
            drawRoundRect(Pal.Steel, Offset(-12f, -6f + out), Size(24f, 5f), CornerRadius(2.5f))
        }
    }

    /** Vertical day planner with hour rows; [blocks] = (start row, rows, colour, label); key "p" fills. */
    class DayPlanner(val blocks: List<Pair<Pair<Int, Int>, Pair<Color, String>>>, val rows: Int = 9) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val rh = 14f; val w = 120f; val h = rows * rh + 24f
            card(0f, 0f, w, h, Pal.Paper, 6f)
            label(s.m, "TODAY", 0f, -h / 2f + 10f, 8.5f, Pal.Navy, 900, letterSpacing = 1f)
            val top = -h / 2f + 20f
            for (r in 0..rows) drawLine(Pal.Slate.a(0.25f), Offset(-w / 2f + 22f, top + r * rh), Offset(w / 2f - 4f, top + r * rh), 1f)
            for (r in 0 until rows) label(s.m, "${(r + 9 - 1) % 12 + 1}", -w / 2f + 11f, top + r * rh + rh / 2f, 7f, Pal.Slate, 700)
            blocks.forEachIndexed { i, (se, cl) ->
                val k = ((s["p"] * (blocks.size + 1) - i) / 1.2f).coerceIn(0f, 1f)
                if (k <= 0f) return@forEachIndexed
                val y = top + se.first * rh
                drawRoundRect(cl.first.a(min(1f, k * 2f)), Offset(-w / 2f + 24f, y + 1f), Size((w - 30f) * Ease.Out.apply(k), se.second * rh - 2f), CornerRadius(3f))
                label(s.m, cl.second, 6f, y + se.second * rh / 2f, 8.5f, Pal.Ink, 800, alpha = k, maxWidth = w - 34f)
            }
        }
    }

    /** A bathtub of shallow water that drains with key "level" (1 full .. 0 empty). Origin = floor centre. */
    class Bathtub : Prop() {
        override val defaults = mapOf("level" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 150f, 12f)
            val lv = s["level"]
            for (x in listOf(-50f, 46f)) drawRoundRect(Pal.Gold.darken(0.2f), Offset(x, -8f), Size(6f, 8f), CornerRadius(2f))
            val tub = Path().apply { moveTo(-66f, -56f); lineTo(66f, -56f); quadraticTo(62f, -6f, 40f, -6f); lineTo(-40f, -6f); quadraticTo(-62f, -6f, -66f, -56f); close() }
            drawPath(tub, shade(Color.White, -56f, -6f, 0f, 0.15f))
            val wy = -50f + 36f * (1f - lv)
            clipRect(-62f, wy, 62f, -8f) {
                drawPath(tub, Color(0xFF7CC4F5).a(0.8f))
                val wave = Path().apply { moveTo(-62f, wy); var x = -62f; while (x <= 62f) { lineTo(x, wy + 1.5f * sin(x * 0.15f + s.t * 3f)); x += 4f } }
                drawPath(wave, Color.White.a(0.7f), style = Stroke(1.5f))
            }
            if (lv < 0.98f && lv > 0.02f) for (k in 0..2) {
                val a = s.t * 4f + k * TAU / 3f
                drawArc(Color.White.a(0.6f), Math.toDegrees(a.toDouble()).toFloat(), 90f, false, Offset(-8f + k * 2f, wy + 3f), Size(14f - k * 4f, 5f), style = Stroke(1.2f))
            }
            drawRoundRect(Color.White.a(0.9f), Offset(-68f, -60f), Size(136f, 6f), CornerRadius(3f))
            drawLine(Pal.Steel, Offset(56f, -60f), Offset(56f, -78f), 3f, StrokeCap.Round)
            drawLine(Pal.Steel, Offset(56f, -78f), Offset(46f, -78f), 3f, StrokeCap.Round)
        }
    }

    /** Graduation cap; sits on a Bean head when placed at head position. */
    class GradCap : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawPath(Path().apply { moveTo(-24f, -6f); lineTo(0f, -16f); lineTo(24f, -6f); lineTo(0f, 4f); close() }, shade(Pal.Ink.lighten(0.15f), -16f, 4f))
            drawRoundRect(Pal.Ink, Offset(-12f, -2f), Size(24f, 9f), CornerRadius(2f))
            drawLine(Pal.Gold, Offset(0f, -6f), Offset(18f, 2f), 1.5f)
            drawLine(Pal.Gold, Offset(18f, 2f), Offset(19f, 14f + sin(s.t * 3f) * 1.5f), 1.5f)
            drawCircle(Pal.Gold, 2.2f, Offset(19f, 15f + sin(s.t * 3f) * 1.5f))
        }
    }

    /** A funnel: many envelopes go in at the top, only a few drip out; key "p" runs the flow. */
    class Funnel : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            if (p > 0f) for (i in 0 until 8) {
                val ph = frac(s.t * 0.5f + i / 8f)
                val passes = i % 4 == 0
                val y = -70f + ph * (if (passes) 130f else 50f)
                val x = (hash01(i, 2) - 0.5f) * 70f * (1f - ph * 0.8f)
                val a = p * if (passes) 1f else (1f - ph)
                withTransform({ translate(x, y); scale(0.5f, 0.5f, Offset.Zero) }) {
                    drawRoundRect((if (passes) Pal.Gold else Pal.Paper).a(a), Offset(-14f, -9f), Size(28f, 19f), CornerRadius(2f))
                }
            }
            val f = Path().apply { moveTo(-48f, -24f); lineTo(48f, -24f); lineTo(8f, 20f); lineTo(8f, 40f); lineTo(-8f, 40f); lineTo(-8f, 20f); close() }
            drawPath(f, Brush.verticalGradient(listOf(Pal.Steel.a(0.85f), Pal.Slate.a(0.85f)), -24f, 40f))
            drawOval(Pal.Slate.darken(0.3f), Offset(-48f, -28f), Size(96f, 9f))
            label(s.m, "FILTER", 0f, -6f, 8.5f, Pal.Ink, 900, letterSpacing = 1f)
        }
    }

    /** Wall clock at [hour]:[minute] (hands sweep in with key "p"). */
    class WallClock(val hour: Float, val minute: Float) : Prop() {
        override val defaults = mapOf("p" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 30f, 50f, 8f, 0.2f)
            drawCircle(shade(Pal.White, -24f, 24f, 0f, 0.12f), 24f, Offset.Zero)
            drawCircle(Pal.Ink, 24f, Offset.Zero, style = Stroke(3f))
            for (k in 0 until 12) drawLine(Pal.Ink.a(0.6f), polar(Offset.Zero, 20f, k * TAU / 12f), polar(Offset.Zero, 17f, k * TAU / 12f), 1.5f)
            val p = s["p"]
            val ha = -TAU / 4f + (hour % 12 + minute / 60f) / 12f * TAU * p
            val ma = -TAU / 4f + minute / 60f * TAU * p + (1f - p) * TAU * 3f
            drawLine(Pal.Ink, Offset.Zero, polar(Offset.Zero, 11f, ha), 3f, StrokeCap.Round)
            drawLine(Pal.Coral, Offset.Zero, polar(Offset.Zero, 17f, ma), 2f, StrokeCap.Round)
            drawCircle(Pal.Ink, 2.5f, Offset.Zero)
        }
    }

    /** Potter's wheel; key "form" raises the vase from a lump of clay. Origin = floor. */
    class Pottery : Prop() {
        override val defaults = mapOf("form" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 90f, 12f)
            drawRect(Pal.Slate.darken(0.3f), Offset(-6f, -36f), Size(12f, 36f))
            drawOval(shade(Pal.Slate, -44f, -32f), Offset(-40f, -44f), Size(80f, 14f))
            val f = s["form"]
            val h = 14f + 46f * f
            val w = 34f - 12f * f
            val spin = sin(s.t * 12f) * 2f
            val vase = Path().apply {
                moveTo(-w / 2f, -40f)
                cubicTo(-w * 0.9f, -40f - h * 0.4f, -w * 0.25f, -40f - h * 0.75f, -w * 0.32f, -40f - h)
                lineTo(w * 0.32f, -40f - h)
                cubicTo(w * 0.25f, -40f - h * 0.75f, w * 0.9f, -40f - h * 0.4f, w / 2f, -40f)
                close()
            }
            drawPath(vase, Brush.horizontalGradient(listOf(Color(0xFFB5643C), Color(0xFFE29A6C), Color(0xFFB5643C)), -w + spin, w + spin))
            for (k in 1..3) drawLine(Color(0xFF8E4A28).a(0.4f), Offset(-w * 0.45f, -40f - h * k / 4f), Offset(w * 0.45f, -40f - h * k / 4f), 1f)
        }
    }

    /** A storm of notification cards swirling around the origin; key "n" = intensity (0..1). */
    class PopupStorm(val r: Float = 70f) : Prop() {
        override val defaults = mapOf("n" to 0f)
        override fun DrawScope.render(s: PropState) {
            val n = s["n"]
            val cols = listOf(Pal.Coral, Pal.Sky, Pal.Gold, Pal.Violet, Pal.Leaf)
            for (i in 0 until 12) {
                val k = (n * 12f - i).coerceIn(0f, 1f)
                if (k <= 0f) continue
                val a = hash01(i, 1) * TAU + s.t * (0.5f + 0.4f * hash01(i, 2))
                val rr = r * (0.55f + 0.45f * hash01(i, 3))
                val c = Offset(cos(a) * rr, sin(a) * rr * 0.7f - 20f)
                withTransform({ translate(c.x, c.y); rotate(sin(s.t * 3f + i) * 10f, Offset.Zero); scale(k, k, Offset.Zero) }) {
                    drawRoundRect(Color.White.a(0.95f), Offset(-16f, -7f), Size(32f, 14f), CornerRadius(4f))
                    drawCircle(cols[i % cols.size], 3.5f, Offset(-10f, 0f))
                    drawLine(Pal.Slate, Offset(-4f, -1f), Offset(11f, -1f), 1.5f)
                    drawLine(Pal.Slate.a(0.5f), Offset(-4f, 3f), Offset(6f, 3f), 1.2f)
                }
            }
        }
    }

    /** "Online" status dot that pulses. */
    class OnlineDot : Prop() {
        override fun DrawScope.render(s: PropState) {
            val ph = frac(s.t * 0.9f)
            drawCircle(Pal.Leaf.a(1f - ph), 5f + ph * 8f, Offset.Zero, style = Stroke(1.5f))
            drawCircle(Pal.Leaf, 5f, Offset.Zero)
        }
    }

    /** A loop arrow that closes (key "p" 0..1) with a tick in the middle: a message that closes a loop. */
    class ClosedLoop : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            drawArc(Pal.Mint, -80f, 340f * p, false, Offset(-20f, -20f), Size(40f, 40f), style = roundStroke(4f))
            if (p > 0.95f) {
                val ck = Path().apply { moveTo(-8f, 0f); lineTo(-2f, 6f); lineTo(9f, -6f) }
                drawPath(ck, Pal.Mint, style = Stroke(3.5f, cap = StrokeCap.Round))
            }
        }
    }

    /** Dashed placeholder line used to show a gap in a schedule. */
    class GapMarker(val w: Float = 40f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawLine(Pal.Gold, Offset(-w / 2f, 0f), Offset(w / 2f, 0f), 2f, StrokeCap.Round, PathEffect.dashPathEffect(floatArrayOf(4f, 4f), s.t * 10f))
        }
    }
}
