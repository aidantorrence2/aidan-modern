package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/** Illustrated props for Sapiens. */
object SapiensProps {

    /** A lion seen from the side, facing left. Origin = ground. */
    class Lion(val color: Color = Color(0xFFE0A84E)) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 96f, 12f)
            val tail = Path().apply { moveTo(40f, -30f); quadraticTo(62f, -40f + sin(s.t * 2f) * 6f, 60f, -60f) }
            drawPath(tail, color.darken(0.15f), style = Stroke(4f, cap = StrokeCap.Round))
            drawCircle(color.darken(0.45f), 6f, Offset(60f, -61f + sin(s.t * 2f) * 3f))
            for (x in listOf(-24f, -12f, 22f, 34f)) drawRoundRect(color.darken(0.12f), Offset(x - 5f, -26f), Size(10f, 26f), CornerRadius(4f))
            drawRoundRect(shade(color, -52f, -18f), Offset(-32f, -52f), Size(78f, 34f), CornerRadius(17f))
            val head = Offset(-36f, -54f)
            for (k in 0 until 12) drawCircle(Color(0xFFA85D24), 11f, polar(head, 15f, k * TAU / 12f + 0.2f))
            drawCircle(Color(0xFF8C4A1A), 20f, head)
            drawCircle(shade(color, head.y - 15f, head.y + 15f), 14.5f, head)
            drawCircle(Pal.Ink, 2f, Offset(head.x - 6f, head.y - 4f))
            drawOval(Color(0xFFF2D7A8), Offset(head.x - 13f, head.y + 1f), Size(12f, 9f))
            drawCircle(Pal.Ink, 2.2f, Offset(head.x - 12f, head.y + 2f))
        }
    }

    /** River band, [w] wide, centred on the origin. */
    class River(val w: Float = 220f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF4FA9DE), Color(0xFF2A6FA3)), -10f, 12f), Offset(-w / 2f, -10f), Size(w, 22f), CornerRadius(11f))
            for (k in 0 until 6) {
                val x = -w / 2f + 10f + frac(hash01(k, 3) + s.t * 0.06f) * (w - 30f)
                drawLine(Color.White.a(0.45f), Offset(x, -2f + (k % 3) * 4f), Offset(x + 14f, -2f + (k % 3) * 4f), 1.4f, StrokeCap.Round)
            }
        }
    }

    /** The Lion-man of Hohlenstein-Stadel: lion head, human body, carved ivory. Key "glow". Origin = base. */
    class LionMan : Prop() {
        override val defaults = mapOf("glow" to 1f)
        override fun DrawScope.render(s: PropState) {
            val ivory = Color(0xFFEFE3C8)
            val g = s["glow"]
            glow(Pal.Gold, Offset(0f, -36f), 60f, 0.5f * g * (0.85f + 0.15f * sin(s.t * 2.5f)))
            softShadow(0f, 0f, 30f, 6f)
            drawRoundRect(shade(ivory, -10f, 0f), Offset(-6f, -18f), Size(5f, 18f), CornerRadius(2f))
            drawRoundRect(shade(ivory, -10f, 0f), Offset(1f, -18f), Size(5f, 18f), CornerRadius(2f))
            drawRoundRect(shade(ivory, -50f, -14f), Offset(-9f, -50f), Size(18f, 36f), CornerRadius(8f))
            drawLine(ivory.darken(0.1f), Offset(-9f, -44f), Offset(-11f, -24f), 5f, StrokeCap.Round)
            drawLine(ivory.darken(0.1f), Offset(9f, -44f), Offset(11f, -24f), 5f, StrokeCap.Round)
            drawCircle(shade(ivory, -66f, -48f), 9.5f, Offset(0f, -58f))
            drawCircle(ivory.darken(0.1f), 3f, Offset(-7f, -66f)); drawCircle(ivory.darken(0.1f), 3f, Offset(7f, -66f))
            drawOval(ivory.darken(0.08f), Offset(-4f, -56f), Size(8f, 6f))
            drawCircle(Pal.Ink, 1.2f, Offset(-3.5f, -60f)); drawCircle(Pal.Ink, 1.2f, Offset(3.5f, -60f))
            for (k in 0 until 4) drawLine(ivory.darken(0.25f), Offset(-6f, -40f + k * 5f), Offset(6f, -40f + k * 5f), 0.8f)
        }
    }

    /** Campfire with flickering flames and rising sparks. Origin = ground. */
    class Campfire : Prop() {
        override fun DrawScope.render(s: PropState) {
            val fl = 0.85f + 0.1f * sin(s.t * 9f) + 0.05f * sin(s.t * 13f)
            glow(Color(0xFFFFA24A), Offset(0f, -14f), 70f * fl, 0.5f)
            rotate(18f, Offset(0f, -3f)) { drawRoundRect(shade(Pal.Wood, -7f, 1f), Offset(-22f, -7f), Size(44f, 8f), CornerRadius(4f)) }
            rotate(-18f, Offset(0f, -3f)) { drawRoundRect(shade(Pal.Wood.darken(0.1f), -7f, 1f), Offset(-22f, -7f), Size(44f, 8f), CornerRadius(4f)) }
            for ((k, c) in listOf(Color(0xFFFF6A2B), Color(0xFFFFB347), Color(0xFFFFF1B0)).withIndex()) {
                val hgt = (38f - k * 11f) * fl
                val wd = 14f - k * 4f
                val sway = sin(s.t * 4f + k) * 3f
                val p = Path().apply {
                    moveTo(-wd, -4f); cubicTo(-wd - 2f, -hgt * 0.4f, sway - wd * 0.4f, -hgt * 0.7f, sway, -hgt - 4f)
                    cubicTo(sway + wd * 0.4f, -hgt * 0.7f, wd + 2f, -hgt * 0.4f, wd, -4f); close()
                }
                drawPath(p, c)
            }
            for (i in 0 until 6) {
                val ph = frac(s.t * 0.6f + hash01(i, 1))
                drawCircle(Color(0xFFFFC56B).a(1f - ph), 1.6f, Offset((hash01(i, 2) - 0.5f) * 24f + sin(s.t * 2f + i) * 6f * ph, -30f - ph * 50f))
            }
        }
    }

    /** Earth. Key "spread" paints an empire spreading across it; key "flag" plants a flag on top. Origin = centre. */
    class Globe(val r: Float = 52f, val empire: Color = Pal.Coral) : Prop() {
        override val defaults = mapOf("spread" to 0f, "flag" to 0f)
        override fun DrawScope.render(s: PropState) {
            glow(Pal.Sky, Offset.Zero, r * 1.6f, 0.3f)
            drawCircle(Brush.radialGradient(listOf(Color(0xFF6CC3F5), Color(0xFF2A6FB0), Color(0xFF173E6E)), Offset(-r * 0.3f, -r * 0.35f), r * 1.5f), r, Offset.Zero)
            val disc = Path().apply { addOval(Rect(Offset.Zero, r)) }
            clipPath(disc) {
                val drift = s.t * 4f
                val blobs = listOf(Offset(-20f, -18f) to 18f, Offset(-8f, -6f) to 14f, Offset(16f, 10f) to 16f, Offset(26f, -20f) to 11f, Offset(-24f, 22f) to 12f, Offset(4f, 28f) to 9f)
                for ((c, rr) in blobs) {
                    val x = ((c.x + drift + r) % (2 * r)) - r
                    drawCircle(Color(0xFF6CB86A), rr * r / 52f, Offset(x * r / 52f, c.y * r / 52f))
                }
                val sp = s["spread"]
                if (sp > 0f) drawCircle(empire.a(0.55f), r * 1.5f * sp, Offset(-r * 0.35f, -r * 0.1f))
                drawCircle(Color.White.a(0.12f), r * 0.6f, Offset(-r * 0.45f, -r * 0.5f))
            }
            drawCircle(Color.White.a(0.25f), r, Offset.Zero, style = Stroke(1.5f))
            val f = s["flag"]
            if (f > 0f) {
                val k = Ease.Back.apply(f)
                drawLine(Pal.Steel, Offset(0f, -r + 2f), Offset(0f, -r - 34f * k), 2.5f)
                val wave = sin(s.t * 3f) * 3f
                drawPath(Path().apply { moveTo(1f, -r - 34f * k); lineTo(24f * k, -r - 28f * k + wave); lineTo(1f, -r - 20f * k); close() }, Pal.Gold)
            }
        }
    }

    /** A chimp; [dir] 1 faces right, -1 faces left. Origin = ground. */
    class Chimp(val dir: Float = 1f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val fur = Color(0xFF4A3426)
            val face = Color(0xFFD9B08C)
            softShadow(0f, 1f, 42f, 8f)
            withTransform({ scale(dir, 1f, Offset.Zero); translate(0f, -abs(sin(s.t * 3f + dir)) * 2f) }) {
                drawLine(fur, Offset(-10f, -20f), Offset(-16f, 0f), 7f, StrokeCap.Round)
                drawLine(fur, Offset(8f, -20f), Offset(14f, 0f), 7f, StrokeCap.Round)
                drawOval(shade(fur, -40f, -8f), Offset(-15f, -40f), Size(30f, 32f))
                drawCircle(fur, 5f, Offset(-12f, -54f)); drawCircle(fur, 5f, Offset(12f, -54f))
                drawCircle(face, 3f, Offset(-12f, -54f)); drawCircle(face, 3f, Offset(12f, -54f))
                drawCircle(shade(fur, -66f, -42f), 12f, Offset(0f, -54f))
                drawOval(face, Offset(-8f, -60f), Size(16f, 16f))
                drawCircle(Pal.Ink, 1.5f, Offset(-3.5f, -56f)); drawCircle(Pal.Ink, 1.5f, Offset(3.5f, -56f))
                drawArc(Pal.Ink, 20f, 140f, false, Offset(-4f, -52f), Size(8f, 5f), style = Stroke(1.2f))
            }
        }
    }

    /** A sea of tiny people. Key "n" reveals them; key "spread" turns them gold from the centre outward (a shared story). */
    class Multitude(val cols: Int, val rows: Int, val gap: Float = 9f) : Prop() {
        override val defaults = mapOf("n" to 100000f, "spread" to 0f)
        override fun DrawScope.render(s: PropState) {
            val w = (cols - 1) * gap; val h = (rows - 1) * gap
            val maxD = sqrt(w * w / 4f + h * h / 4f)
            val n = s["n"]; val sp = s["spread"]
            for (i in 0 until cols * rows) {
                val f = (n - i).coerceIn(0f, 1f)
                if (f <= 0f) continue
                val c = Offset(-w / 2f + (i % cols) * gap + (hash01(i, 1) - 0.5f) * 3f, -h / 2f + (i / cols) * gap + (hash01(i, 2) - 0.5f) * 3f)
                val d = sqrt(c.x * c.x + c.y * c.y) / maxD
                val lit = ((sp * 1.25f - d) * 5f).coerceIn(0f, 1f)
                val body = lerp(Pal.Slate, Pal.Gold, lit)
                drawRoundRect(body.a(f), Offset(c.x - 2.6f, c.y - 0.5f), Size(5.2f, 5f), CornerRadius(2f))
                drawCircle(Pal.Skin[i % 4].a(f), 2.2f, Offset(c.x, c.y - 2.8f))
            }
        }
    }

    /** A company headquarters. Key "ghost" 1 draws it as a dashed outline: it exists only as a legal story. Origin = ground. */
    class Company(val sign: String = "LLC") : Prop() {
        override val defaults = mapOf("ghost" to 1f)
        override fun DrawScope.render(s: PropState) {
            val g = s["ghost"]
            val solid = 1f - g
            if (solid > 0f) {
                softShadow(0f, 1f, 110f, 12f, 0.3f * solid)
                drawRect(shade(Color(0xFF5A6C95), -120f, 0f).let { it }, Offset(-46f, -110f), Size(92f, 110f), alpha = solid)
                for (r in 0 until 6) for (c in 0 until 4) drawRect(Color(0xFFFFD98A).a(0.8f * solid), Offset(-38f + c * 21f, -100f + r * 16f), Size(12f, 9f))
            }
            if (g > 0f) drawRect(Pal.Violet.a(g), Offset(-46f, -110f), Size(92f, 110f),
                style = Stroke(2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(7f, 5f), s.t * 12f)))
            label(s.m, sign, 0f, -124f, 13f, Pal.Ink, 900, chip = Pal.Violet, letterSpacing = 2f)
        }
    }

    /** A clump of wheat stalks swaying. Key "grow" 0..1. Origin = ground. */
    class Wheat(val stalks: Int = 3) : Prop() {
        override val defaults = mapOf("grow" to 1f)
        override fun DrawScope.render(s: PropState) {
            val g = s["grow"]
            for (k in 0 until stalks) {
                val x0 = (k - (stalks - 1) / 2f) * 10f
                val sway = sin(s.t * 1.6f + k) * 6f
                val top = Offset(x0 + sway, -70f * g - (k % 2) * 8f)
                drawLine(Color(0xFFB98F3A), Offset(x0, 0f), top, 2.5f, StrokeCap.Round)
                for (j in 0 until 6) {
                    val t = j / 6f
                    val c = Offset(x0 + (top.x - x0) * (1f - t * 0.3f), top.y + t * 26f * g)
                    for (side in listOf(-1f, 1f)) drawOval(shade(Color(0xFFE8C163), c.y - 4f, c.y + 4f), Offset(c.x + side * 2.5f - 3f, c.y - 4.5f), Size(6f, 9f))
                }
                drawLine(Color(0xFFE8C163), top, Offset(top.x + 2f, top.y - 10f), 1f)
            }
        }
    }

    class Hut : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 80f, 10f)
            drawRect(shade(Color(0xFFC79A64), -34f, 0f), Offset(-28f, -34f), Size(56f, 34f))
            drawRoundRect(Color(0xFF4A3426), Offset(-8f, -24f), Size(16f, 24f), CornerRadius(8f, 8f))
            val roof = Path().apply { moveTo(-38f, -32f); lineTo(0f, -64f); lineTo(38f, -32f); close() }
            drawPath(roof, shade(Color(0xFFD9B45A), -64f, -32f, 0.15f, 0.25f))
            for (k in 0 until 5) drawLine(Color(0xFF9C7A33), Offset(-30f + k * 15f, -34f), Offset(0f, -62f), 1f)
        }
    }

    /** Granary that fills with grain; key "fill". Origin = ground. */
    class Silo : Prop() {
        override val defaults = mapOf("fill" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 64f, 9f)
            drawRoundRect(shade(Color(0xFFC0B6A6), -80f, 0f), Offset(-24f, -80f), Size(48f, 80f), CornerRadius(4f))
            val f = s["fill"]
            drawRect(shade(Color(0xFFE8C163), -80f * f, 0f), Offset(-20f, -76f * f), Size(40f, 76f * f))
            for (k in 1..4) drawLine(Color.Black.a(0.15f), Offset(-24f, -k * 16f), Offset(24f, -k * 16f), 1f)
            drawArc(shade(Color(0xFF9C4A3A), -100f, -80f), 180f, 180f, true, Offset(-26f, -102f), Size(52f, 44f))
            label(s.m, "SURPLUS", 0f, 14f, 9f, Pal.Ink, 900, chip = Pal.Gold)
        }
    }

    /** Social pyramid: king, priests and soldiers, many farmers. Key "p" builds it tier by tier. Origin = base centre. */
    class Pyramid : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            val tiers = listOf(Triple(150f, Pal.Leaf, "farmers"), Triple(100f, Pal.Sky, "priests · soldiers"), Triple(50f, Pal.Gold, "king"))
            tiers.forEachIndexed { i, (w, c, l) ->
                val f = (p * 3f - i).coerceIn(0f, 1f)
                if (f <= 0f) return@forEachIndexed
                val y = -i * 34f
                val k = Ease.Back.apply(f)
                withTransform({ scale(k, k, Offset(0f, y - 15f)) }) {
                    val tp = Path().apply { moveTo(-w / 2f, y); lineTo(w / 2f, y); lineTo(w / 2f - 22f, y - 30f); lineTo(-w / 2f + 22f, y - 30f); close() }
                    drawPath(tp, shade(c, y - 30f, y, 0.2f, 0.25f))
                    label(s.m, l, 0f, y - 15f, 9f, Pal.Ink, 900, maxWidth = max(w - 40f, 70f))
                }
            }
            if (p > 0.95f) withTransform({ translate(0f, -112f); scale(0.6f, 0.6f, Offset.Zero) }) {
                val crown = Path().apply { moveTo(-16f, 0f); lineTo(-18f, -16f); lineTo(-9f, -8f); lineTo(0f, -20f); lineTo(9f, -8f); lineTo(18f, -16f); lineTo(16f, 0f); close() }
                drawPath(crown, shade(Pal.Gold, -20f, 0f, 0.35f, 0.2f))
            }
        }
    }

    /** A columned temple with light rays; key "glow". Origin = ground. */
    class Temple : Prop() {
        override val defaults = mapOf("glow" to 1f)
        override fun DrawScope.render(s: PropState) {
            val g = s["glow"]
            if (g > 0f) for (k in 0 until 9) {
                val a = -TAU / 4f + (k - 4) * 0.22f
                drawLine(Pal.Gold.a(0.35f * g * (0.7f + 0.3f * sin(s.t * 2f + k))), polar(Offset(0f, -70f), 34f, a), polar(Offset(0f, -70f), 70f, a), 3f, StrokeCap.Round)
            }
            softShadow(0f, 1f, 110f, 12f)
            drawRect(shade(Pal.Paper, -8f, 0f), Offset(-50f, -8f), Size(100f, 8f))
            for (k in 0 until 5) drawRect(shade(Pal.Paper, -58f, -8f), Offset(-42f + k * 19f, -58f), Size(8f, 50f))
            drawRect(shade(Pal.Paper, -66f, -58f), Offset(-50f, -66f), Size(100f, 8f))
            val roof = Path().apply { moveTo(-56f, -66f); lineTo(0f, -92f); lineTo(56f, -66f); close() }
            drawPath(roof, shade(Pal.Paper, -92f, -66f))
        }
    }

    /** A coin that is half bright, half dark: neither purely good nor purely evil. Origin = centre. */
    class SplitCoin(val r: Float = 26f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(sin(s.t * 1.2f) * 10f, Offset.Zero) {
                drawArc(shade(Pal.Gold, -r, r, 0.3f, 0.1f), 90f, 180f, true, Offset(-r, -r), Size(2 * r, 2 * r))
                drawArc(shade(Color(0xFF3A3550), -r, r, 0.1f, 0.2f), -90f, 180f, true, Offset(-r, -r), Size(2 * r, 2 * r))
                drawCircle(Color.White.a(0.35f), r, Offset.Zero, style = Stroke(2f))
                drawLine(Color.White.a(0.4f), Offset(0f, -r), Offset(0f, r), 1.5f)
            }
        }
    }

    /** A map. Key "blank" turns the unexplored half into honest empty space with question marks. Origin = centre. */
    class OldMap(val w: Float = 190f, val h: Float = 120f) : Prop() {
        override val defaults = mapOf("blank" to 0f)
        override fun DrawScope.render(s: PropState) {
            val parch = Color(0xFFE9D6AE)
            rotate(-2f, Offset.Zero) {
                card(0f, 0f, w, h, parch, 6f)
                val coast = Path().apply {
                    moveTo(-w / 2f + 14f, -h / 2f + 20f); cubicTo(-30f, -40f, -50f, 10f, -20f, 20f); cubicTo(0f, 30f, -40f, 50f, -w / 2f + 20f, h / 2f - 12f)
                }
                drawPath(coast, Color(0xFF7A5B33), style = Stroke(2f, cap = StrokeCap.Round))
                for (k in 0 until 3) {
                    val c = Offset(-60f + k * 18f, -18f + (k % 2) * 16f)
                    drawPath(Path().apply { moveTo(c.x - 7f, c.y + 5f); lineTo(c.x, c.y - 6f); lineTo(c.x + 7f, c.y + 5f) }, Color(0xFF7A5B33), style = Stroke(1.6f))
                }
                val b = s["blank"]
                // the right half: imagined monsters and invented coasts fade, leaving honest blank space
                val inv = 1f - b
                if (inv > 0f) {
                    val serp = Path()
                    for (k in 0..12) { val x = 10f + k * 6f; val y = -10f + sin(k * 0.9f + s.t * 2f) * 6f; if (k == 0) serp.moveTo(x, y) else serp.lineTo(x, y) }
                    drawPath(serp, Color(0xFF3F6E5A).a(inv), style = Stroke(4f, cap = StrokeCap.Round))
                    drawCircle(Color(0xFF3F6E5A).a(inv), 5f, Offset(10f, -10f + sin(s.t * 2f) * 6f))
                    drawPath(Path().apply { moveTo(20f, 30f); cubicTo(50f, 10f, 70f, 40f, 84f, 20f) }, Color(0xFF7A5B33).a(inv), style = Stroke(2f))
                    label(s.m, "here be dragons", 46f, -38f, 8f, Color(0xFF7A5B33), 700, italic = true, alpha = inv)
                }
                if (b > 0f) {
                    drawPath(Path().apply { moveTo(-20f, 20f); lineTo(4f, 26f) }, Color(0xFF7A5B33).a(b),
                        style = Stroke(2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 4f))))
                    for ((k, c) in listOf(Offset(30f, -20f), Offset(60f, 14f), Offset(28f, 34f)).withIndex()) {
                        label(s.m, "?", c.x, c.y, 18f + k * 2f, Color(0xFF9C7A33), 900, alpha = b)
                    }
                    label(s.m, "unexplored", 46f, -42f, 8f, Color(0xFF7A5B33), 700, italic = true, alpha = b)
                }
            }
        }
    }

    class Telescope : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 50f, 8f)
            drawLine(Pal.Wood, Offset(0f, -30f), Offset(-14f, 0f), 3f, StrokeCap.Round)
            drawLine(Pal.Wood, Offset(0f, -30f), Offset(14f, 0f), 3f, StrokeCap.Round)
            drawLine(Pal.Wood, Offset(0f, -30f), Offset(0f, 0f), 3f, StrokeCap.Round)
            rotate(-32f, Offset(0f, -32f)) {
                drawRoundRect(shade(Pal.Gold, -40f, -26f), Offset(-26f, -40f), Size(56f, 14f), CornerRadius(4f))
                drawRoundRect(shade(Pal.Gold.darken(0.2f), -38f, -28f), Offset(28f, -38f), Size(10f, 10f), CornerRadius(2f))
            }
        }
    }

    /** Sailing ship bobbing on the waterline (origin). */
    class Ship : Prop() {
        override fun DrawScope.render(s: PropState) {
            rotate(sin(s.t * 1.8f) * 4f, Offset(0f, 0f)) {
                val hull = Path().apply { moveTo(-40f, -14f); lineTo(40f, -14f); lineTo(30f, 4f); lineTo(-30f, 4f); close() }
                drawPath(hull, shade(Pal.Wood, -14f, 4f))
                drawLine(Pal.Wood.darken(0.4f), Offset(0f, -14f), Offset(0f, -76f), 3f)
                val sail1 = Path().apply { moveTo(2f, -72f); quadraticTo(30f + sin(s.t * 2f) * 3f, -50f, 2f, -22f); close() }
                val sail2 = Path().apply { moveTo(-2f, -66f); quadraticTo(-26f + sin(s.t * 2f) * 3f, -46f, -2f, -24f); close() }
                drawPath(sail1, shade(Pal.Paper, -72f, -22f)); drawPath(sail2, shade(Pal.Paper.darken(0.05f), -66f, -24f))
                drawPath(Path().apply { moveTo(0f, -76f); lineTo(14f, -72f); lineTo(0f, -68f); close() }, Pal.Coral)
            }
        }
    }

    /** A strip of sea, [w] wide, surface at the origin. */
    class Waves(val w: Float = 240f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val p = Path().apply {
                moveTo(-w / 2f, 30f)
                var x = -w / 2f
                while (x <= w / 2f) { lineTo(x, 3f * sin(x * 0.07f + s.t * 2.2f)); x += 6f }
                lineTo(w / 2f, 30f); close()
            }
            drawPath(p, Brush.verticalGradient(listOf(Color(0xFF3F8FCC), Color(0xFF1C4E7A)), 0f, 30f))
        }
    }

    /** Factory with a clock tower; key "spin" speeds the clock (industrial time). Origin = ground. */
    class Factory : Prop() {
        override val defaults = mapOf("spin" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 130f, 12f)
            for (k in 0 until 2) {
                val x = 10f + k * 22f
                drawRect(shade(Color(0xFF7A5A4A), -110f, -50f), Offset(x, -110f), Size(12f, 60f))
                for (j in 0 until 3) {
                    val ph = frac(s.t * 0.4f + j / 3f + k * 0.2f)
                    drawCircle(Color(0xFF8A8F9C).a(0.5f * (1f - ph)), 6f + ph * 10f, Offset(x + 6f + ph * 16f, -114f - ph * 36f))
                }
            }
            val roof = Path().apply { moveTo(-60f, -50f); lineTo(-40f, -66f); lineTo(-40f, -50f); lineTo(-20f, -66f); lineTo(-20f, -50f); lineTo(0f, -66f); lineTo(0f, -50f); lineTo(60f, -50f); lineTo(60f, 0f); lineTo(-60f, 0f); close() }
            drawPath(roof, shade(Color(0xFF8C5A4A), -66f, 0f))
            for (k in 0 until 4) drawRect(Color(0xFFFFD98A).a(0.7f), Offset(-52f + k * 26f, -36f), Size(14f, 12f))
            drawRect(shade(Color(0xFF6A4A3A), -96f, -50f), Offset(-56f, -96f), Size(26f, 46f))
            val c = Offset(-43f, -80f)
            drawCircle(Pal.Paper, 10f, c)
            val spin = s["spin"]
            val a = s.t * (0.4f + 8f * spin)
            drawLine(Pal.Ink, c, polar(c, 7f, a), 1.6f, StrokeCap.Round)
            drawLine(Pal.Ink, c, polar(c, 5f, a / 12f), 2f, StrokeCap.Round)
        }
    }

    /** A rotating DNA double helix. Origin = centre. */
    class Dna(val h: Float = 90f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            val n = 14
            for (i in 0 until n) {
                val y = -h / 2f + i * h / (n - 1)
                val a = i * 0.55f + s.t * 2f
                val x1 = sin(a) * 18f; val x2 = -x1
                val front = cos(a) > 0f
                drawLine(Color.White.a(0.35f), Offset(x1, y), Offset(x2, y), 1.6f)
                drawCircle((if (front) Pal.Sky else Pal.Sky.darken(0.4f)), 4f, Offset(x1, y))
                drawCircle((if (!front) Pal.Rose else Pal.Rose.darken(0.4f)), 4f, Offset(x2, y))
            }
        }
    }

    class Robot : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 46f, 50f, 8f)
            drawLine(Pal.Steel, Offset(0f, -40f), Offset(0f, -52f), 2.5f)
            drawCircle(Pal.Coral.a(0.6f + 0.4f * sin(s.t * 4f)), 4f, Offset(0f, -54f))
            drawRoundRect(shade(Pal.Steel, -40f, -4f), Offset(-24f, -40f), Size(48f, 36f), CornerRadius(10f))
            drawRoundRect(Color(0xFF1A2236), Offset(-18f, -34f), Size(36f, 22f), CornerRadius(6f))
            val blink = frac(s.t * 0.3f) < 0.05f
            for (dx in listOf(-8f, 8f)) if (blink) drawLine(Pal.Mint, Offset(dx - 3f, -23f), Offset(dx + 3f, -23f), 2f) else { glow(Pal.Mint, Offset(dx, -23f), 8f, 0.6f); drawCircle(Pal.Mint, 3.2f, Offset(dx, -23f)) }
            drawRoundRect(shade(Pal.Steel.darken(0.1f), 0f, 44f), Offset(-18f, 0f), Size(36f, 44f), CornerRadius(8f))
            drawCircle(Pal.Mint.a(0.8f), 4f, Offset(0f, 20f))
        }
    }

    /** A glowing halo ring; origin = centre. */
    class Halo : Prop() {
        override fun DrawScope.render(s: PropState) {
            glow(Pal.Gold, Offset.Zero, 40f, 0.5f + 0.15f * sin(s.t * 3f))
            withTransform({ scale(1f, 0.32f, Offset.Zero) }) {
                drawCircle(Pal.Gold, 20f, Offset.Zero, style = Stroke(4f))
                drawCircle(Color.White.a(0.7f), 20f, Offset.Zero, style = Stroke(1.5f))
            }
        }
    }

    /** A fruit tree; origin = ground. */
    class FruitTree : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 70f, 10f)
            drawRoundRect(shade(Pal.Wood, -60f, 0f), Offset(-6f, -60f), Size(12f, 60f), CornerRadius(4f))
            val sway = sin(s.t * 1.2f) * 2f
            for ((c, r) in listOf(Offset(-18f, -70f) to 22f, Offset(16f, -72f) to 24f, Offset(0f, -92f) to 24f)) drawCircle(shade(Color(0xFF4F9A50), c.y - r, c.y + r), r, Offset(c.x + sway, c.y))
            for (k in 0 until 6) drawCircle(Pal.Coral, 3.5f, Offset(-24f + k * 9f + sway, -66f - (k % 3) * 12f))
        }
    }
}
