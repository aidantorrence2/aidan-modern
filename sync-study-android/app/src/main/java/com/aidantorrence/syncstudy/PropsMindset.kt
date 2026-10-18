package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Props for Mindset. */
object MindsetProps {

    /** A marked test paper; key "fake" overlays a scribbled, inflated score. */
    class TestPaper(val grade: String, val gradeColor: Color = Pal.Coral, val fake: String? = null) : Prop() {
        override val defaults = mapOf("fake" to 0f)
        override fun DrawScope.render(s: PropState) {
            card(0f, 0f, 54f, 68f, Pal.Paper, 3f)
            drawRect(Pal.Sky.copy(alpha = 0.3f), Offset(-27f, -34f), Size(54f, 8f))
            for (k in 0 until 6) drawLine(Pal.Slate.copy(alpha = 0.45f), Offset(-20f, -16f + k * 8f), Offset(if (k % 2 == 0) 18f else 8f, -16f + k * 8f), 1.4f, StrokeCap.Round)
            val f = s["fake"].coerceIn(0f, 1f)
            drawCircle(gradeColor.copy(alpha = 1f - 0.6f * f), 12f, Offset(12f, -16f), style = Stroke(2.2f))
            label(s.m, grade, 12f, -16f, 12f, gradeColor.copy(alpha = 1f - 0.6f * f), 900)
            if (fake != null && f > 0.01f) {
                drawLine(Pal.Ink.copy(alpha = f), Offset(2f, -6f), Offset(22f, -26f), 2f, StrokeCap.Round)
                label(s.m, fake, 16f, 4f, 13f, Pal.Navy.copy(alpha = f), 900, italic = true)
            }
        }
    }

    /** A jigsaw puzzle board with [cols] x [rows] pieces; harder puzzles have more pieces. Key "done" fills it in. */
    class Puzzle(val cols: Int, val rows: Int, val color: Color, val text: String) : Prop() {
        override val defaults = mapOf("done" to 1f, "glow" to 0f)
        override fun DrawScope.render(s: PropState) {
            val cell = min(64f / cols, 52f / rows)
            val w = cols * cell; val h = rows * cell
            val g = s["glow"]
            if (g > 0.01f) glow(color, Offset.Zero, max(w, h) * 1.1f, 0.45f * g)
            card(0f, 0f, w + 12f, h + 12f, Color(0xFF2B2D3A), 6f)
            val n = cols * rows
            val done = s["done"] * n
            for (i in 0 until n) {
                val k = (done - i).coerceIn(0f, 1f)
                if (k <= 0f) continue
                val cx = -w / 2f + cell * (i % cols + 0.5f)
                val cy = -h / 2f + cell * (i / cols + 0.5f)
                val c = if ((i + i / cols) % 2 == 0) color else color.darken(0.15f)
                val sz = (cell - 2f) * k
                drawRoundRect(shade(c, cy - sz / 2f, cy + sz / 2f, 0.2f, 0.15f), Offset(cx - sz / 2f, cy - sz / 2f), Size(sz, sz), CornerRadius(2f))
                if (i % cols != cols - 1) drawCircle(c, cell * 0.16f * k, Offset(cx + cell / 2f, cy))
            }
            label(s.m, text, 0f, h / 2f + 16f, 10.5f, Pal.White, 800, chip = Pal.Ink.copy(alpha = 0.55f))
        }
    }

    /** A padlock; key "open" lifts the shackle. */
    class Padlock(val color: Color = Pal.Gold) : Prop() {
        override val defaults = mapOf("open" to 0f)
        override fun DrawScope.render(s: PropState) {
            val o = s["open"].coerceIn(0f, 1f)
            withTransform({ translate(o * 9f, -o * 10f); rotate(o * 20f, Offset(-10f, -8f)) }) {
                drawArc(Pal.Steel, 180f, 180f, false, Offset(-12f, -24f), Size(24f, 26f), style = Stroke(5f))
                drawLine(Pal.Steel, Offset(-12f, -11f), Offset(-12f, -4f), 5f)
                drawLine(Pal.Steel, Offset(12f, -11f), Offset(12f, -4f), 5f)
            }
            drawRoundRect(shade(color, -6f, 22f, 0.3f, 0.2f), Offset(-17f, -6f), Size(34f, 28f), CornerRadius(5f))
            drawCircle(Pal.Ink, 3.5f, Offset(0f, 5f)); drawRect(Pal.Ink, Offset(-1.5f, 5f), Size(3f, 8f))
            if (o > 0.6f) glow(Pal.Leaf, Offset(0f, 4f), 40f, 0.5f * (o - 0.6f) / 0.4f)
        }
    }

    class Key(val color: Color) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawCircle(color, 8f, Offset(-14f, 0f)); drawCircle(Color(0xFF1C1E2A), 3f, Offset(-14f, 0f))
            drawRoundRect(color, Offset(-7f, -2.5f), Size(26f, 5f), CornerRadius(2f))
            drawRect(color, Offset(12f, 2f), Size(3f, 5f)); drawRect(color, Offset(16f, 2f), Size(3f, 4f))
        }
    }

    /** A rubber stamp that presses down and leaves an imprint of [text]. Key "press" 0..1. Origin = imprint. */
    class Stamp(val text: String, val color: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("press" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["press"].coerceIn(0f, 1f)
            val down = if (p < 0.5f) p * 2f else 1f - (p - 0.5f) * 2f
            if (p >= 0.5f) {
                val a = min(1f, (p - 0.5f) * 4f)
                rotate(-8f, Offset.Zero) {
                    drawRoundRect(color.copy(alpha = a), Offset(-26f, -12f), Size(52f, 24f), CornerRadius(4f), style = Stroke(3f))
                    label(s.m, text, 0f, 0f, 15f, color.copy(alpha = a), 900, letterSpacing = 2f)
                }
            }
            val y = -60f + 46f * down
            drawRoundRect(shade(Pal.Wood, y - 30f, y - 10f), Offset(-7f, y - 34f), Size(14f, 24f), CornerRadius(5f))
            drawCircle(shade(Pal.Wood, y - 46f, y - 30f), 9f, Offset(0f, y - 38f))
            drawRoundRect(Color(0xFF3A3D4C), Offset(-24f, y - 12f), Size(48f, 10f), CornerRadius(2f))
            drawRect(color.darken(0.2f), Offset(-22f, y - 3f), Size(44f, 4f))
        }
    }

    /** A staircase of [steps] steps rising left to right; key "p" builds it. Origin = bottom-left corner. */
    class Staircase(val steps: Int = 5, val color: Color = Pal.Mint, val stepW: Float = 34f, val stepH: Float = 22f, val labels: List<String> = emptyList()) : Prop() {
        override val defaults = mapOf("p" to 1f)
        override fun DrawScope.render(s: PropState) {
            val shown = s["p"] * steps
            for (i in 0 until steps) {
                val k = (shown - i).coerceIn(0f, 1f)
                if (k <= 0f) continue
                val h = stepH * (i + 1) * k
                val x = i * stepW
                drawRect(shade(color, -h, 0f, 0.15f, 0.3f), Offset(x, -h), Size(stepW, h))
                drawRect(color.lighten(0.3f), Offset(x, -h), Size(stepW, 3f))
                labels.getOrNull(i)?.let { label(s.m, it, x + stepW / 2f, -h + 10f, 8.5f, Pal.Ink, 800, alpha = k, maxWidth = stepW - 2f) }
            }
        }
    }

    /** A judge's gavel; key "hit" swings it down onto the block. */
    class Gavel : Prop() {
        override val defaults = mapOf("hit" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 4f, 50f, 8f)
            drawRoundRect(shade(Pal.Wood.darken(0.2f), -6f, 4f), Offset(-22f, -6f), Size(44f, 10f), CornerRadius(3f))
            val h = s["hit"].coerceIn(0f, 1f)
            val ang = -55f + 55f * (if (h < 0.6f) h / 0.6f else 1f - (h - 0.6f) * 0.5f)
            rotate(ang, Offset(26f, -10f)) {
                drawRoundRect(shade(Pal.Wood, -14f, -6f), Offset(-6f, -13f), Size(32f, 6f), CornerRadius(3f))
                drawRoundRect(shade(Pal.Wood.darken(0.25f), -26f, 6f), Offset(-18f, -24f), Size(14f, 28f), CornerRadius(4f))
            }
            if (h in 0.55f..0.95f) for (k in 0..3) drawLine(Pal.Gold.copy(alpha = 0.8f), polar(Offset(-12f, -6f), 12f, -2.6f + k * 0.5f), polar(Offset(-12f, -6f), 22f, -2.6f + k * 0.5f), 2f, StrokeCap.Round)
        }
    }

    /** Neural connections that grow around a brain; key "p" adds links and nodes. */
    class Neurons(val r: Float = 52f, val color: Color = Pal.Gold) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"].coerceIn(0f, 1f)
            val n = 14
            val pts = List(n) { polar(Offset.Zero, r * (0.55f + 0.45f * hash01(it, 1)), it * TAU / n + hash01(it, 2) * 0.4f) }
            val links = (0 until n).flatMap { listOf(it to (it + 1) % n, it to (it + 4) % n) }
            val shown = p * links.size
            links.forEachIndexed { i, (a, b) ->
                val k = (shown - i).coerceIn(0f, 1f)
                if (k <= 0f) return@forEachIndexed
                val e = Offset(pts[a].x + (pts[b].x - pts[a].x) * k, pts[a].y + (pts[b].y - pts[a].y) * k)
                drawLine(color.copy(alpha = 0.7f), pts[a], e, 1.6f, StrokeCap.Round)
            }
            for (i in 0 until n) if (p * n > i) {
                val tw = 0.6f + 0.4f * sin(s.t * 3f + i)
                glow(color, pts[i], 7f, 0.5f * tw)
                drawCircle(color, 2.4f, pts[i])
            }
        }
    }

    /** A watering can; key "pour" tilts it and pours drops. */
    class WateringCan(val color: Color = Pal.Sky) : Prop() {
        override val defaults = mapOf("pour" to 0f)
        override fun DrawScope.render(s: PropState) {
            val pour = s["pour"].coerceIn(0f, 1f)
            rotate(-35f * pour, Offset.Zero) {
                drawRoundRect(shade(color, -14f, 14f), Offset(-16f, -14f), Size(32f, 28f), CornerRadius(6f))
                drawArc(color.darken(0.2f), 180f, 180f, false, Offset(-10f, -26f), Size(20f, 20f), style = Stroke(3.5f))
                val spout = Path().apply { moveTo(-14f, 4f); lineTo(-34f, -10f); lineTo(-36f, -6f); lineTo(-14f, 10f); close() }
                drawPath(spout, color.darken(0.1f))
                drawRoundRect(color.darken(0.25f), Offset(-40f, -14f), Size(8f, 8f), CornerRadius(2f))
            }
            if (pour > 0.4f) for (i in 0 until 6) {
                val ph = frac(s.t * 1.3f + hash01(i, 1))
                drawCircle(Pal.Sky.copy(alpha = (1f - ph) * pour), 2f, Offset(-38f - hash01(i, 2) * 6f, 6f + ph * 34f))
            }
        }
    }

    class Ball(val color: Color = Color(0xFFE8823A)) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 16f, 26f, 5f)
            drawCircle(Brush.radialGradient(listOf(color.lighten(0.25f), color, color.darken(0.25f)), Offset(-4f, -5f), 18f), 12f, Offset.Zero)
            drawLine(Pal.Ink.copy(alpha = 0.6f), Offset(-12f, 0f), Offset(12f, 0f), 1.2f)
            drawLine(Pal.Ink.copy(alpha = 0.6f), Offset(0f, -12f), Offset(0f, 12f), 1.2f)
            drawArc(Pal.Ink.copy(alpha = 0.6f), -60f, 120f, false, Offset(-20f, -10f), Size(20f, 20f), style = Stroke(1.2f))
            drawArc(Pal.Ink.copy(alpha = 0.6f), 120f, 120f, false, Offset(0f, -10f), Size(20f, 20f), style = Stroke(1.2f))
        }
    }

    class Crown(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(color, Offset(0f, -4f), 24f, 0.25f)
            val p = Path().apply { moveTo(-16f, 6f); lineTo(-18f, -11f); lineTo(-8f, -2f); lineTo(0f, -15f); lineTo(8f, -2f); lineTo(18f, -11f); lineTo(16f, 6f); close() }
            drawPath(p, shade(color, -15f, 6f, 0.3f, 0.2f))
            drawRect(color.darken(0.2f), Offset(-16f, 3f), Size(32f, 5f))
        }
    }

    /** A thundercloud with a face: the fixed-mindset voice. Key "fade" dissolves it. */
    class DoubtCloud : Prop() {
        override val defaults = mapOf("fade" to 0f)
        override fun DrawScope.render(s: PropState) {
            val a = (1f - s["fade"]).coerceIn(0f, 1f)
            if (a <= 0.02f) return
            val bob = sin(s.t * 2f) * 2f
            val col = Color(0xFF575C74).copy(alpha = a)
            drawCircle(col, 14f, Offset(-16f, 2f + bob)); drawCircle(col, 19f, Offset(0f, -6f + bob)); drawCircle(col, 13f, Offset(17f, 3f + bob))
            drawRoundRect(col, Offset(-28f, 2f + bob), Size(56f, 13f), CornerRadius(6f))
            drawLine(Pal.Ink.copy(alpha = a), Offset(-10f, -8f + bob), Offset(-4f, -5f + bob), 2f, StrokeCap.Round)
            drawLine(Pal.Ink.copy(alpha = a), Offset(10f, -8f + bob), Offset(4f, -5f + bob), 2f, StrokeCap.Round)
            drawArc(Pal.Ink.copy(alpha = a), 200f, 140f, false, Offset(-6f, 2f + bob), Size(12f, 8f), style = Stroke(1.8f))
        }
    }
}
