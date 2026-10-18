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
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Props for Man's Search for Meaning. Quiet, symbolic imagery only. */
object MansSearchProps {

    /** A long wooden hut silhouette with small windows; key "lit" warms the windows. Origin = ground centre. */
    class Hut(val w: Float = 170f) : Prop() {
        override val defaults = mapOf("lit" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 2f, w * 1.05f, 12f, 0.35f)
            val h = 46f
            val body = Color(0xFF2A2730)
            drawRect(shade(body, -h, 0f, 0.1f, 0.25f), Offset(-w / 2f, -h), Size(w, h))
            var x = -w / 2f
            while (x < w / 2f) { drawLine(Color.Black.copy(alpha = 0.25f), Offset(x, -h), Offset(x, 0f), 1f); x += 14f }
            val roof = Path().apply { moveTo(-w / 2f - 8f, -h); lineTo(0f, -h - 26f); lineTo(w / 2f + 8f, -h); close() }
            drawPath(roof, shade(Color(0xFF3A3540), -h - 26f, -h, 0.1f, 0.2f))
            val lit = s["lit"]
            val n = 5
            for (i in 0 until n) {
                val wx = -w / 2f + w * (i + 0.5f) / n
                if (i == n / 2) continue
                val flick = 0.85f + 0.15f * sin(s.t * 3f + i * 1.7f)
                val c = lerp(Color(0xFF15141A), Color(0xFFFFC66B), lit * flick)
                if (lit > 0.05f) glow(Color(0xFFFFC66B), Offset(wx, -h * 0.55f), 22f, 0.35f * lit)
                drawRoundRect(c, Offset(wx - 6f, -h * 0.72f), Size(12f, 12f), CornerRadius(2f))
            }
            drawRoundRect(Color(0xFF1A181E), Offset(-8f, -26f), Size(16f, 26f), CornerRadius(2f))
        }
    }

    /** A candle; key "lit" 0..1 lights the flame and its glow. Origin = base of candle. */
    class Candle(val wax: Color = Color(0xFFF1E6CF)) : Prop() {
        override val defaults = mapOf("lit" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 30f, 6f)
            drawOval(Color(0xFF8A6A42), Offset(-14f, -4f), Size(28f, 8f))
            drawRoundRect(shade(wax, -38f, 0f, 0.15f, 0.2f), Offset(-7f, -38f), Size(14f, 36f), CornerRadius(3f))
            drawLine(Color(0xFF3A2A1A), Offset(0f, -38f), Offset(0f, -44f), 1.5f, StrokeCap.Round)
            val lit = s["lit"].coerceIn(0f, 1f)
            if (lit <= 0.02f) return
            val f = 0.9f + 0.08f * sin(s.t * 9f) + 0.05f * sin(s.t * 13f + 1f)
            val sway = sin(s.t * 2.3f) * 1.5f
            glow(Color(0xFFFFB45A), Offset(0f, -52f), 60f * f * lit, 0.45f * lit)
            val tip = -42f - 20f * f * lit
            val flame = Path().apply {
                moveTo(0f, -42f)
                cubicTo(-7f * lit, -46f, -4f * lit, -52f, sway, tip)
                cubicTo(4f * lit, -52f, 7f * lit, -46f, 0f, -42f); close()
            }
            drawPath(flame, Brush.verticalGradient(listOf(Color(0xFFFFF4D6), Color(0xFFFFB45A)), tip, -42f))
        }
    }

    /** A window looking out on a sunset; key "glow" fades the sunset in. Origin = window centre. */
    class SunsetWindow(val w: Float = 90f, val h: Float = 70f) : Prop() {
        override val defaults = mapOf("glow" to 1f)
        override fun DrawScope.render(s: PropState) {
            val g = s["glow"].coerceIn(0f, 1f)
            card(0f, 0f, w + 12f, h + 12f, Color(0xFF3A3038), 6f)
            val dark = Color(0xFF151320)
            val sky = Brush.verticalGradient(listOf(lerp(dark, Color(0xFF6E4A8A), g), lerp(dark, Color(0xFFF08A6A), g), lerp(dark, Color(0xFFFFC98B), g)), -h / 2f, h / 2f)
            drawRect(sky, Offset(-w / 2f, -h / 2f), Size(w, h))
            if (g > 0.05f) {
                glow(Color(0xFFFFE0A3), Offset(10f, h * 0.2f), 40f, 0.6f * g)
                drawCircle(Color(0xFFFFE7B8).copy(alpha = g), 11f, Offset(10f, h * 0.22f))
            }
            drawRect(Color(0xFF221A24), Offset(-w / 2f, h * 0.32f), Size(w, h * 0.18f))
            drawLine(Color(0xFF3A3038), Offset(0f, -h / 2f), Offset(0f, h / 2f), 4f)
            drawLine(Color(0xFF3A3038), Offset(-w / 2f, 0f), Offset(w / 2f, 0f), 4f)
        }
    }

    /** A compass whose needle spins until key "settle" reaches 1, then points north and glows. */
    class Compass(val r: Float = 24f) : Prop() {
        override val defaults = mapOf("settle" to 1f)
        override fun DrawScope.render(s: PropState) {
            val settle = s["settle"].coerceIn(0f, 1f)
            glow(Pal.Gold, Offset.Zero, r * 2.4f, 0.4f * settle)
            drawCircle(shade(Pal.Gold, -r, r, 0.3f, 0.25f), r, Offset.Zero)
            drawCircle(Color(0xFF1C1E2A), r - 4f, Offset.Zero)
            for (k in 0 until 8) drawLine(Color.White.copy(alpha = if (k % 2 == 0) 0.7f else 0.3f),
                polar(Offset.Zero, r - 6f, k * TAU / 8f), polar(Offset.Zero, r - (if (k % 2 == 0) 10f else 8f), k * TAU / 8f), 1.4f)
            val deg = (1f - settle) * (s.t * 400f % 360f)
            rotate(deg, Offset.Zero) {
                val n = Path().apply { moveTo(0f, -(r - 7f)); lineTo(4f, 0f); lineTo(-4f, 0f); close() }
                val so = Path().apply { moveTo(0f, r - 7f); lineTo(4f, 0f); lineTo(-4f, 0f); close() }
                drawPath(n, Pal.Coral); drawPath(so, Color.White.copy(alpha = 0.85f))
            }
            drawCircle(Pal.Gold, 2.5f, Offset.Zero)
        }
    }

    class Crown(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(color, Offset(0f, -6f), 30f, 0.25f)
            val p = Path().apply { moveTo(-20f, 8f); lineTo(-22f, -14f); lineTo(-10f, -2f); lineTo(0f, -18f); lineTo(10f, -2f); lineTo(22f, -14f); lineTo(20f, 8f); close() }
            drawPath(p, shade(color, -18f, 8f, 0.3f, 0.2f))
            drawRect(color.darken(0.2f), Offset(-20f, 4f), Size(40f, 6f))
            for ((x, c) in listOf(-11f to Pal.Coral, 0f to Pal.Sky, 11f to Pal.Mint)) drawCircle(c, 2.6f, Offset(x, 6.5f))
        }
    }

    /** A wooden signpost with a board pointing left or right. Origin = foot of the post. */
    class Signpost(val text: String, val color: Color = Pal.Gold, val right: Boolean = true) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 24f, 5f)
            drawRoundRect(shade(Pal.Wood, -70f, 0f), Offset(-3f, -70f), Size(6f, 70f), CornerRadius(2f))
            val w = 78f
            val dir = if (right) 1f else -1f
            val board = Path().apply {
                moveTo(-dir * 6f, -68f); lineTo(dir * (w - 10f), -68f); lineTo(dir * w, -58f); lineTo(dir * (w - 10f), -48f); lineTo(-dir * 6f, -48f); close()
            }
            drawPath(board, shade(color, -68f, -48f, 0.25f, 0.15f))
            label(s.m, text, dir * (w / 2f - 6f), -58f, 9.5f, Pal.Ink, 800, maxWidth = w - 14f)
        }
    }

    /** A road from the origin to (dx, dy), drawn on by key "p", with a glowing centre line when "lit". */
    class Road(val dx: Float, val dy: Float, val color: Color = Pal.Gold) : Prop() {
        override val defaults = mapOf("p" to 0f, "lit" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"].coerceIn(0f, 1f)
            if (p <= 0.01f) return
            val end = Offset(dx * p, dy * p)
            drawLine(Color(0xFF3E3746), Offset.Zero, end, 20f, StrokeCap.Round)
            drawLine(Color(0xFF574E60), Offset.Zero, end, 15f, StrokeCap.Round)
            val lit = s["lit"]
            if (lit > 0.01f) {
                drawLine(color.copy(alpha = 0.3f * lit), Offset.Zero, end, 12f, StrokeCap.Round)
                drawLine(color.copy(alpha = 0.9f * lit), Offset.Zero, end, 3f, StrokeCap.Round)
            } else {
                drawLine(Color.White.copy(alpha = 0.35f), Offset.Zero, end, 1.4f, StrokeCap.Round, PathEffect.dashPathEffect(floatArrayOf(5f, 6f)))
            }
        }
    }

    /** A swirling empty spiral that pulls things in; key "p" strengthens it. */
    class Vacuum(val r: Float = 40f) : Prop() {
        override val defaults = mapOf("p" to 1f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            drawCircle(Brush.radialGradient(listOf(Color.Black.copy(alpha = 0.9f * p), Color(0xFF2B2140).copy(alpha = 0.5f * p), Color.Transparent), Offset.Zero, r * 1.4f), r * 1.4f, Offset.Zero)
            for (k in 0 until 4) {
                val path = Path()
                for (i in 0..40) {
                    val f = i / 40f
                    val a = k * TAU / 4f + f * 4.5f - s.t * 1.6f
                    val o = polar(Offset.Zero, r * (1f - f * 0.85f), a)
                    if (i == 0) path.moveTo(o.x, o.y) else path.lineTo(o.x, o.y)
                }
                drawPath(path, Pal.Violet.copy(alpha = 0.5f * p), style = roundStroke(2f))
            }
            for (i in 0 until 10) {
                val ph = frac(s.t * 0.5f + hash01(i, 3))
                val a = hash01(i, 4) * TAU + ph * 3f
                drawCircle(Color.White.copy(alpha = (1f - ph) * 0.6f * p), 1.6f, polar(Offset.Zero, r * 1.3f * (1f - ph), a))
            }
        }
    }

    /** Fluttering butterfly. */
    class Butterfly(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val flap = 0.3f + 0.7f * abs(sin(s.t * 9f))
            glow(color, Offset.Zero, 24f, 0.35f)
            for (side in listOf(-1f, 1f)) {
                withTransform({ scale(side * flap, 1f, Offset.Zero) }) {
                    drawOval(shade(color, -13f, 0f, 0.3f, 0.1f), Offset(1f, -13f), Size(14f, 13f))
                    drawOval(shade(color.darken(0.12f), 0f, 10f, 0.2f, 0.1f), Offset(1f, -1f), Size(10f, 10f))
                    drawCircle(Color.White.copy(alpha = 0.5f), 2f, Offset(8f, -8f))
                }
            }
            drawRoundRect(Pal.Ink, Offset(-1.5f, -12f), Size(3f, 20f), CornerRadius(1.5f))
            drawLine(Pal.Ink, Offset(0f, -12f), Offset(-4f, -18f), 1f)
            drawLine(Pal.Ink, Offset(0f, -12f), Offset(4f, -18f), 1f)
        }
    }

    /** A seedling in a pot; key "grow" 0..1 grows stem, leaves and a flower. Origin = base of pot. */
    class Seedling(val flower: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("grow" to 0.15f)
        override fun DrawScope.render(s: PropState) {
            val g = s["grow"].coerceIn(0f, 1f)
            softShadow(0f, 1f, 36f, 7f)
            val pot = Path().apply { moveTo(-15f, -22f); lineTo(15f, -22f); lineTo(11f, 0f); lineTo(-11f, 0f); close() }
            drawPath(pot, shade(Color(0xFFC0673E), -22f, 0f))
            drawRoundRect(Color(0xFFD27A4E), Offset(-17f, -26f), Size(34f, 6f), CornerRadius(2f))
            val top = -26f - 52f * g
            val sway = sin(s.t * 1.5f) * 2f * g
            drawLine(Pal.Leaf.darken(0.2f), Offset(0f, -26f), Offset(sway, top), 3f, StrokeCap.Round)
            if (g > 0.25f) {
                val k = min(1f, (g - 0.25f) * 3f)
                val y = -36f - 16f * g
                drawOval(shade(Pal.Leaf, y - 5f, y + 5f), Offset(-18f * k, y - 4f * k), Size(18f * k, 9f * k))
                drawOval(shade(Pal.Leaf, y - 5f, y + 5f), Offset(0f, y - 4f * k - 6f), Size(18f * k, 9f * k))
            }
            if (g > 0.7f) {
                val k = (g - 0.7f) / 0.3f
                for (i in 0 until 5) drawCircle(flower, 5.5f * k, polar(Offset(sway, top), 6.5f * k, i * TAU / 5f + s.t * 0.3f))
                drawCircle(Pal.Gold, 3.8f * k, Offset(sway, top))
            }
        }
    }

    /** A dark rain cloud; key "clear" 0..1 thins it and stops the rain. */
    class Storm(val w: Float = 70f) : Prop() {
        override val defaults = mapOf("clear" to 0f)
        override fun DrawScope.render(s: PropState) {
            val c = (1f - s["clear"]).coerceIn(0f, 1f)
            if (c <= 0.02f) return
            val col = Color(0xFF4A4F63).copy(alpha = c)
            for (i in 0 until 7) {
                val ph = frac(s.t * 1.4f + hash01(i, 2))
                val x = (hash01(i, 5) - 0.5f) * w * 0.8f
                drawLine(Pal.Sky.copy(alpha = 0.6f * c * (1 - ph)), Offset(x, 10f + ph * 40f), Offset(x - 2f, 16f + ph * 40f), 1.6f, StrokeCap.Round)
            }
            drawCircle(col, 16f, Offset(-w * 0.25f, 0f)); drawCircle(col, 21f, Offset(0f, -6f)); drawCircle(col, 15f, Offset(w * 0.27f, 1f))
            drawRoundRect(col, Offset(-w / 2f, 0f), Size(w, 14f), CornerRadius(7f))
        }
    }

    /** A sun on the horizon; key "rise" lifts it and brightens its rays. */
    class Sun(val r: Float = 26f) : Prop() {
        override val defaults = mapOf("rise" to 0f)
        override fun DrawScope.render(s: PropState) {
            val rise = s["rise"]
            val c = Offset(0f, -rise * 70f)
            glow(Color(0xFFFFE0A3), c, r * 4f, 0.6f * max(0.2f, rise))
            for (k in 0 until 12) {
                val a = k * TAU / 12f + s.t * 0.1f
                drawLine(Color(0xFFFFD98A).copy(alpha = (0.5f * rise).coerceIn(0f, 1f)), polar(c, r + 6f, a), polar(c, r + 14f + 4f * sin(s.t * 2f + k), a), 2.5f, StrokeCap.Round)
            }
            drawCircle(Brush.radialGradient(listOf(Color(0xFFFFF4D6), Color(0xFFFFC66B)), c, r), r, c)
        }
    }

    /** Keepsakes that can be taken away: 0 home, 1 suitcase, 2 book, 3 ring. */
    class Keepsake(val kind: Int) : Prop() {
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 46f, 46f, Color(0xFF2B2D3A), 12f)
            when (kind) {
                0 -> {
                    val roof = Path().apply { moveTo(-15f, -2f); lineTo(0f, -15f); lineTo(15f, -2f); close() }
                    drawPath(roof, Pal.Coral)
                    drawRect(shade(Pal.Paper, -2f, 12f), Offset(-10f, -2f), Size(20f, 14f))
                    drawRect(Pal.Wood, Offset(-3f, 4f), Size(6f, 8f))
                }
                1 -> {
                    drawRoundRect(shade(Pal.Wood, -8f, 12f), Offset(-14f, -8f), Size(28f, 20f), CornerRadius(3f))
                    drawRoundRect(Pal.Wood.darken(0.3f), Offset(-5f, -13f), Size(10f, 6f), CornerRadius(2f), style = Stroke(2f))
                    drawLine(Pal.Gold, Offset(-14f, 1f), Offset(14f, 1f), 2f)
                }
                2 -> {
                    drawRoundRect(shade(Pal.Sky, -13f, 13f), Offset(-11f, -13f), Size(22f, 26f), CornerRadius(2f))
                    drawRect(Pal.Paper, Offset(8f, -11f), Size(3f, 22f))
                    drawLine(Color.White.copy(alpha = 0.6f), Offset(-6f, -6f), Offset(4f, -6f), 1.5f)
                }
                else -> {
                    drawCircle(Pal.Gold, 10f, Offset(0f, 3f), style = Stroke(3.5f))
                    glow(Color.White, Offset(0f, -8f), 10f, 0.5f)
                    drawCircle(Color.White, 3.5f, Offset(0f, -8f))
                }
            }
        }
    }

    /** Open book with two pages; keys "left" and "right" light each page. */
    class OpenBook(val leftText: String, val rightText: String) : Prop() {
        override val defaults = mapOf("left" to 0f, "right" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 34f, 200f, 14f)
            drawRoundRect(shade(Color(0xFF6B3A2E), -40f, 36f), Offset(-102f, -38f), Size(204f, 74f), CornerRadius(6f))
            for ((side, key, text) in listOf(Triple(-1f, "left", leftText), Triple(1f, "right", rightText))) {
                val lit = s[key].coerceIn(0f, 1f)
                val page = Path().apply {
                    if (side < 0) { moveTo(-2f, -30f); quadraticTo(-50f, -40f, -96f, -32f); lineTo(-96f, 30f); quadraticTo(-50f, 22f, -2f, 32f); close() }
                    else { moveTo(2f, -30f); quadraticTo(50f, -40f, 96f, -32f); lineTo(96f, 30f); quadraticTo(50f, 22f, 2f, 32f); close() }
                }
                drawPath(page, shade(lerp(Color(0xFFBDB4A4), Pal.Paper, lit), -36f, 32f, 0.05f, 0.08f))
                if (lit > 0.05f) glow(Pal.Gold, Offset(side * 48f, 0f), 60f, 0.25f * lit)
                for (k in 0 until 3) drawLine(Pal.Slate.copy(alpha = 0.35f), Offset(side * 18f, 14f + k * 6f), Offset(side * 80f, 14f + k * 6f), 1.2f)
                label(s.m, text, side * 49f, -8f, 11f, Pal.Ink.copy(alpha = 0.35f + 0.65f * lit), 800, maxWidth = 80f)
            }
            drawLine(Color(0xFF8A7A66), Offset(0f, -32f), Offset(0f, 33f), 1.5f)
        }
    }
}
