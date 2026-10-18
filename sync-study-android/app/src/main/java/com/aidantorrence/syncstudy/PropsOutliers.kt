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
import androidx.compose.ui.graphics.lerp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Props for Outliers. */
object OutliersProps {

    /** A small town house. Origin = ground centre. */
    class House(val wall: Color = Pal.Paper, val roof: Color = Pal.Coral) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 1f, 70f, 8f)
            drawRect(shade(wall, -44f, 0f, 0.05f, 0.15f), Offset(-28f, -44f), Size(56f, 44f))
            val r = Path().apply { moveTo(-34f, -42f); lineTo(0f, -70f); lineTo(34f, -42f); close() }
            drawPath(r, shade(roof, -70f, -42f, 0.2f, 0.15f))
            drawRect(Pal.Wood, Offset(-7f, -22f), Size(14f, 22f))
            val lit = 0.75f + 0.25f * sin(s.t * 1.5f)
            for (x in listOf(-20f, 10f)) drawRect(Color(0xFFFFD98A).copy(alpha = lit), Offset(x, -36f), Size(10f, 10f))
        }
    }

    class PastaPlate : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawOval(Color.White, Offset(-22f, -6f), Size(44f, 12f))
            drawOval(Color(0xFFE2DED6), Offset(-16f, -4f), Size(32f, 8f))
            for (k in 0 until 6) drawArc(Color(0xFFF2C46B), 180f + k * 20f, 160f, false, Offset(-12f + k * 2f, -10f + (k % 2) * 2f), Size(20f, 10f), style = Stroke(2f))
            drawCircle(Pal.Coral, 4f, Offset(2f, -7f))
            with(Steam()) { render(s) }
        }
    }

    class Wine : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRoundRect(shade(Color(0xFF3B1E2E), -40f, 0f, 0.2f, 0.2f), Offset(-7f, -36f), Size(14f, 36f), CornerRadius(4f))
            drawRect(Color(0xFF3B1E2E), Offset(-2.5f, -48f), Size(5f, 14f))
            drawRect(Pal.Paper, Offset(-6f, -24f), Size(12f, 10f))
            drawLine(Color.White.copy(alpha = 0.4f), Offset(-4f, -34f), Offset(-4f, -4f), 1.5f)
        }
    }

    /** A long dinner table with a checked cloth. Origin = centre of the top surface. */
    class LongTable(val w: Float = 220f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 44f, w * 1.05f, 12f)
            drawRect(Pal.Wood.darken(0.35f), Offset(-w / 2f + 10f, 4f), Size(7f, 40f))
            drawRect(Pal.Wood.darken(0.35f), Offset(w / 2f - 17f, 4f), Size(7f, 40f))
            drawRect(Color(0xFFF2EFE8), Offset(-w / 2f - 4f, -4f), Size(w + 8f, 22f))
            var x = -w / 2f - 4f
            var k = 0
            while (x < w / 2f + 4f) { if (k % 2 == 0) drawRect(Pal.Coral.copy(alpha = 0.55f), Offset(x, -4f), Size(10f, 22f)); x += 10f; k++ }
            drawRect(Color.Black.copy(alpha = 0.12f), Offset(-w / 2f - 4f, 10f), Size(w + 8f, 8f))
        }
    }

    /** A young hockey player: a Bean with helmet, stick and jersey number. */
    class Player(val jersey: Color, val number: String, skin: Color = Pal.Skin[0], hair: Color = Pal.Hair[0], seed: Int = 0) : Prop() {
        private val bean = Bean(jersey, skin, hair, 0, Color(0xFF2E3550), seed)
        override val defaults = bean.defaults
        override fun DrawScope.render(s: PropState) {
            // stick behind the body
            drawLine(Pal.Wood, Offset(20f, -30f), Offset(34f, 0f), 4f, StrokeCap.Round)
            drawLine(Pal.Ink, Offset(30f, 0f), Offset(48f, 0f), 5f, StrokeCap.Round)
            with(bean) { render(s) }
            val hc = Offset(0f, -71f + s["sit"] * 14f)
            drawArc(shade(jersey.darken(0.25f), hc.y - 20f, hc.y), 180f, 180f, true, Offset(-19f, hc.y - 20f), Size(38f, 34f))
            drawLine(Pal.Steel, Offset(-12f, hc.y + 5f), Offset(12f, hc.y + 5f), 1.4f)
            label(s.m, number, 0f, -36f, 11f, Color.White, 900)
        }
    }

    /** Twelve birth months; key "cut" draws the Jan 1 cutoff, key "hi" highlights Jan-Mar. */
    class MonthStrip : Prop() {
        override val defaults = mapOf("cut" to 0f, "hi" to 0f)
        override fun DrawScope.render(s: PropState) {
            val names = "JFMAMJJASOND"
            val cw = 24f
            val x0 = -6 * cw
            val hi = s["hi"]
            for (i in 0 until 12) {
                val c = if (i < 3) lerp(Color(0xFF2B3045), Pal.Gold, hi) else Color(0xFF2B3045)
                drawRoundRect(c, Offset(x0 + i * cw + 1f, -12f), Size(cw - 2f, 24f), CornerRadius(4f))
                label(s.m, names[i].toString(), x0 + i * cw + cw / 2f, 0f, 11f, if (i < 3 && hi > 0.5f) Pal.Ink else Pal.White, 800)
            }
            val cut = s["cut"]
            if (cut > 0.01f) {
                drawLine(Pal.Coral, Offset(x0 - 2f, -22f), Offset(x0 - 2f, -22f + 50f * cut), 3f, StrokeCap.Round)
                if (cut > 0.9f) label(s.m, "Jan 1 cutoff", x0 - 2f, 36f, 10f, Pal.Coral, 800)
            }
        }
    }

    /** A small club stage with sweeping spotlights and a sign. Origin = stage floor centre. */
    class ClubStage(val sign: String = "HAMBURG") : Prop() {
        override fun DrawScope.render(s: PropState) {
            for (k in 0..1) {
                val sweep = sin(s.t * 1.2f + k * 2f) * 30f
                val src = Offset(-60f + k * 120f, -120f)
                val p = Path().apply { moveTo(src.x, src.y); lineTo(sweep - 30f, 0f); lineTo(sweep + 30f, 0f); close() }
                drawPath(p, Brush.verticalGradient(listOf(Color(0xFFFFF0C0).copy(alpha = 0.22f), Color.Transparent), -120f, 0f))
            }
            drawRect(shade(Color(0xFF5A3D2E), 0f, 14f), Offset(-110f, 0f), Size(220f, 14f))
            drawRoundRect(Color(0xFF1B1D28), Offset(-50f, -126f), Size(100f, 22f), CornerRadius(4f))
            val neon = 0.75f + 0.25f * sin(s.t * 6f)
            glow(Pal.Rose, Offset(0f, -115f), 50f, 0.3f * neon)
            label(s.m, sign, 0f, -115f, 12f, Pal.Rose.copy(alpha = neon), 900, letterSpacing = 2f)
        }
    }

    /** A 1960s computer terminal with a blinking cursor. Origin = base centre. */
    class Terminal : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 2f, 110f, 10f)
            drawRoundRect(shade(Color(0xFFCFC6B2), -80f, 0f, 0.1f, 0.2f), Offset(-52f, -80f), Size(104f, 80f), CornerRadius(6f))
            drawRoundRect(Color(0xFF0E1A12), Offset(-40f, -72f), Size(80f, 44f), CornerRadius(4f))
            val lines = listOf("> RUN", "HELLO 1968", "> _")
            lines.forEachIndexed { i, l -> label(s.m, l, -34f, -64f + i * 12f, 8.5f, Color(0xFF7CFF9E), 700, Align.START) }
            if (frac(s.t * 1.5f) < 0.5f) drawRect(Color(0xFF7CFF9E), Offset(-20f, -44f), Size(6f, 8f))
            for (k in 0 until 3) for (j in 0 until 8) drawRoundRect(Color(0xFF8C8475), Offset(-40f + j * 10f, -22f + k * 7f), Size(8f, 5f), CornerRadius(1f))
        }
    }

    /** A curling wave; key "rise" lifts it. Origin = water level centre. */
    class Wave(val w: Float = 220f) : Prop() {
        override val defaults = mapOf("rise" to 1f)
        override fun DrawScope.render(s: PropState) {
            val r = s["rise"]
            val p = Path().apply {
                moveTo(-w / 2f, 20f)
                var x = -w / 2f
                while (x <= w / 2f) {
                    val crest = r * 60f * kotlin.math.exp(-((x - 30f) / 50f) * ((x - 30f) / 50f))
                    lineTo(x, -crest + sin(x * 0.05f + s.t * 2f) * 3f)
                    x += 6f
                }
                lineTo(w / 2f, 20f); close()
            }
            drawPath(p, Brush.verticalGradient(listOf(Color(0xFF7CC4F5), Color(0xFF2D6CA8)), -60f, 20f))
            for (i in 0 until 6) {
                val ph = frac(s.t * 0.6f + hash01(i, 1))
                drawCircle(Color.White.copy(alpha = 0.6f * (1 - ph)), 2.5f, Offset(30f - 40f + 80f * hash01(i, 2), -r * 58f + ph * 10f))
            }
        }
    }

    /** A cockpit window and instrument panel, seen from behind the pilots. Origin = panel centre. */
    class Cockpit(val w: Float = 220f) : Prop() {
        override val defaults = mapOf("storm" to 0f)
        override fun DrawScope.render(s: PropState) {
            val storm = s["storm"]
            val win = Path().apply { moveTo(-w / 2f, 0f); lineTo(-w / 2f + 26f, -90f); lineTo(w / 2f - 26f, -90f); lineTo(w / 2f, 0f); close() }
            drawPath(win, Brush.verticalGradient(listOf(lerp(Color(0xFF5FA8E8), Color(0xFF3A3F55), storm), lerp(Color(0xFFBFE2FA), Color(0xFF6B6F86), storm)), -90f, 0f))
            if (storm > 0.05f) {
                for (k in 0 until 3) drawCircle(Color(0xFF2D3045).copy(alpha = storm), 18f + k * 4f, Offset(-30f + k * 30f, -54f + (k % 2) * 6f))
                if (frac(s.t * 0.5f) < 0.06f) drawLine(Color.White.copy(alpha = storm), Offset(10f, -70f), Offset(0f, -40f), 2f)
            }
            drawPath(win, Color(0xFF2A2D3A), style = Stroke(6f))
            drawLine(Color(0xFF2A2D3A), Offset(0f, -90f), Offset(0f, 0f), 5f)
            drawRoundRect(shade(Color(0xFF2E3242), 0f, 34f), Offset(-w / 2f - 6f, -2f), Size(w + 12f, 36f), CornerRadius(6f))
            for (k in 0 until 6) {
                val c = Offset(-w / 2f + 24f + k * (w - 48f) / 5f, 14f)
                drawCircle(Color(0xFF161822), 8f, c)
                drawLine(Pal.Mint, c, polar(c, 6f, s.t * (0.5f + k * 0.2f)), 1.5f, StrokeCap.Round)
            }
        }
    }

    /** Terraced rice paddies; key "grow" raises the green shoots. Origin = centre. */
    class RicePaddy(val w: Float = 240f) : Prop() {
        override val defaults = mapOf("grow" to 1f)
        override fun DrawScope.render(s: PropState) {
            val g = s["grow"]
            for (k in 0 until 3) {
                val y = -40f + k * 30f
                val ww = w - k * 0f + k * 30f
                drawRoundRect(Color(0xFF6E8B4A), Offset(-ww / 2f, y), Size(ww, 26f), CornerRadius(10f))
                drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF9FD4F2), Color(0xFF5E9FC8)), y + 3f, y + 20f), Offset(-ww / 2f + 6f, y + 3f), Size(ww - 12f, 17f), CornerRadius(8f))
                var x = -ww / 2f + 14f
                var i = 0
                while (x < ww / 2f - 10f) {
                    val h = (8f + 6f * hash01(i + k * 40, 3)) * g
                    val sway = sin(s.t * 1.8f + x * 0.1f) * 1.5f
                    drawLine(Pal.Leaf, Offset(x, y + 16f), Offset(x + sway, y + 16f - h), 1.6f, StrokeCap.Round)
                    x += 9f; i++
                }
            }
        }
    }

    /** A door in a frame; key "open" swings it open and spills light. Origin = threshold centre. */
    class Door(val color: Color = Pal.Sky) : Prop() {
        override val defaults = mapOf("open" to 0f)
        override fun DrawScope.render(s: PropState) {
            val o = s["open"].coerceIn(0f, 1f)
            softShadow(0f, 2f, 54f, 8f)
            drawRect(Color(0xFF2A2C38), Offset(-24f, -82f), Size(48f, 82f))
            if (o > 0.02f) {
                drawRect(Brush.verticalGradient(listOf(Color(0xFFFFF4D6), Color(0xFFFFC66B)), -78f, 0f), Offset(-20f, -78f), Size(40f, 78f))
                glow(Color(0xFFFFE0A3), Offset(0f, -40f), 60f, 0.5f * o)
            }
            val dw = 40f * (1f - 0.8f * o)
            drawRect(shade(color, -78f, 0f, 0.15f, 0.25f), Offset(-20f, -78f), Size(dw, 78f))
            drawCircle(Pal.Gold, 2.5f, Offset(-20f + dw - 6f, -38f))
            drawRect(Color(0xFF3A3D4C), Offset(-26f, -86f), Size(52f, 6f))
        }
    }

    /** A ladder of height [h]; key "p" builds it upward. Origin = foot. */
    class Ladder(val h: Float = 90f, val color: Color = Pal.Wood) : Prop() {
        override val defaults = mapOf("p" to 1f)
        override fun DrawScope.render(s: PropState) {
            val hh = h * s["p"].coerceIn(0f, 1f)
            if (hh <= 1f) return
            drawLine(color.darken(0.2f), Offset(-10f, 0f), Offset(-10f, -hh), 3.5f, StrokeCap.Round)
            drawLine(color.darken(0.2f), Offset(10f, 0f), Offset(10f, -hh), 3.5f, StrokeCap.Round)
            var y = -10f
            while (y > -hh) { drawLine(color.lighten(0.1f), Offset(-10f, y), Offset(10f, y), 2.5f, StrokeCap.Round); y -= 14f }
        }
    }
}
