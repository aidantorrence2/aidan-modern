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
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/** Illustrated props for The Power of Habit. */
object PowerOfHabitProps {

    /** A road seen from the side, [w] wide, with lane dashes that scroll with key "move". Origin = road centre. */
    class Road(val w: Float = 480f) : Prop() {
        override val defaults = mapOf("move" to 0f)
        override fun DrawScope.render(s: PropState) {
            drawRect(Color(0xFF2E3140), Offset(-w / 2f, -8f), Size(w, 26f))
            drawRect(Color(0xFF51586E), Offset(-w / 2f, -10f), Size(w, 3f))
            val off = frac(s.t * 0.8f * s["move"]) * 40f
            var x = -w / 2f - off
            while (x < w / 2f) { drawLine(Color(0xFFFFE08A).a(0.8f), Offset(x, 5f), Offset(x + 20f, 5f), 2.5f); x += 40f }
        }
    }

    /** Side-view car with a driver. Keys: "drive" spins the wheels, "sleepy" closes the driver's eyes, "lights". */
    class Car(val color: Color = Pal.Coral, val skin: Color = Pal.Skin[1]) : Prop() {
        override val defaults = mapOf("drive" to 0f, "sleepy" to 0f, "lights" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 96f, 10f)
            val bounce = sin(s.t * 14f) * 0.8f * s["drive"]
            withTransform({ translate(0f, bounce) }) {
                val body = Path().apply {
                    moveTo(-46f, -8f); lineTo(-44f, -24f); lineTo(-24f, -26f); lineTo(-12f, -44f); lineTo(20f, -44f)
                    lineTo(32f, -26f); lineTo(46f, -22f); lineTo(48f, -8f); close()
                }
                drawPath(body, shade(color, -44f, -8f, 0.25f, 0.2f))
                drawPath(Path().apply { moveTo(-8f, -40f); lineTo(16f, -40f); lineTo(26f, -26f); lineTo(-16f, -26f); close() }, Color(0xFFBFE4FF).a(0.85f))
                // driver
                drawCircle(skin, 7f, Offset(6f, -32f))
                val sleepy = s["sleepy"]
                if (sleepy > 0.5f) drawLine(Pal.Ink, Offset(8f, -32f), Offset(12f, -32f), 1.4f)
                else drawCircle(Pal.Ink, 1.4f, Offset(10f, -33f))
                drawArc(Pal.Hair[0], 180f, 180f, true, Offset(-1f, -40f), Size(14f, 12f))
                drawLine(color.darken(0.3f), Offset(-12f, -26f), Offset(-12f, -10f), 1.2f)
                val lights = s["lights"]
                if (lights > 0f) {
                    val beam = Path().apply { moveTo(46f, -20f); lineTo(110f, -34f); lineTo(110f, 0f); close() }
                    drawPath(beam, Brush.horizontalGradient(listOf(Color(0xFFFFF4C2).a(0.45f * lights), Color.Transparent), 46f, 110f))
                    drawCircle(Color(0xFFFFF4C2), 3f, Offset(46f, -18f))
                }
                drawRect(Pal.Coral.darken(0.3f), Offset(-46f, -18f), Size(3f, 5f))
            }
            for (wx in listOf(-28f, 28f)) {
                drawCircle(Pal.Ink, 10f, Offset(wx, -6f))
                drawCircle(Pal.Steel, 4.5f, Offset(wx, -6f))
                val a = -s.t * 12f * s["drive"]
                drawLine(Pal.Ink, polar(Offset(wx, -6f), 4.5f, a), polar(Offset(wx, -6f), -4.5f, a), 1.5f)
            }
        }
    }

    /** Traffic light; key "green" switches red → green. Origin = foot of the pole. */
    class TrafficLight : Prop() {
        override val defaults = mapOf("green" to 0f)
        override fun DrawScope.render(s: PropState) {
            val g = s["green"]
            softShadow(0f, 0f, 24f, 5f)
            drawRect(Pal.Slate.darken(0.3f), Offset(-2.5f, -70f), Size(5f, 70f))
            drawRoundRect(shade(Color(0xFF2B2F3A), -112f, -66f), Offset(-12f, -112f), Size(24f, 48f), CornerRadius(5f))
            drawCircle(lerp(Color(0xFFFF4D4D), Color(0xFF4A2020), g), 7f, Offset(0f, -100f))
            drawCircle(Color(0xFF4A4020), 7f, Offset(0f, -88f))
            drawCircle(lerp(Color(0xFF1F3A26), Color(0xFF5CFF8A), g), 7f, Offset(0f, -76f))
            glow(lerp(Color(0xFFFF4D4D), Color(0xFF5CFF8A), g), Offset(0f, if (g > 0.5f) -76f else -100f), 22f, 0.6f)
        }
    }

    /** A worn footpath across grass: key "wear" (0..1) controls how trodden it looks. */
    class Trail(val w: Float = 220f, val bend: Float = 30f, val color: Color = Color(0xFFD9B98A)) : Prop() {
        override val defaults = mapOf("wear" to 1f, "p" to 1f)
        override fun DrawScope.render(s: PropState) {
            val wear = s["wear"]
            val path = Path().apply { moveTo(-w / 2f, 0f); cubicTo(-w / 6f, -bend, w / 6f, bend, w / 2f, 0f) }
            val len = w * 1.3f * s["p"]
            val eff = PathEffect.dashPathEffect(floatArrayOf(len + 0.01f, 10000f))
            drawPath(path, color.a(0.25f + 0.65f * wear), style = Stroke(6f + 10f * wear, cap = StrokeCap.Round, pathEffect = eff))
            drawPath(path, Color.White.a(0.15f * wear), style = Stroke(2f, cap = StrokeCap.Round, pathEffect = eff))
        }
    }

    /** A card that flips (key "flip" 0 → 1) from [front] to [back]. */
    class FlipCard(val front: String, val back: String, val frontColor: Color, val backColor: Color, val w: Float = 92f, val h: Float = 56f) : Prop() {
        override val defaults = mapOf("flip" to 0f)
        override fun DrawScope.render(s: PropState) {
            val f = s["flip"]
            val sx = abs(cos(f * Math.PI.toFloat()))
            val showBack = f > 0.5f
            withTransform({ scale(sx.coerceAtLeast(0.02f), 1f, Offset.Zero) }) {
                card(0f, 0f, w, h, if (showBack) backColor else frontColor, 10f)
                label(s.m, if (showBack) back else front, 0f, 0f, 12f, Pal.Ink, 800, maxWidth = w - 10f)
            }
        }
    }

    class Padlock(val color: Color = Pal.Gold) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawArc(Pal.Steel, 180f, 180f, false, Offset(-8f, -18f), Size(16f, 18f), style = Stroke(3.5f))
            drawRoundRect(shade(color, -10f, 10f), Offset(-11f, -10f), Size(22f, 18f), CornerRadius(3f))
            drawCircle(Pal.Ink, 2.5f, Offset(0f, -2f))
            drawRect(Pal.Ink, Offset(-1f, -1f), Size(2f, 5f))
        }
    }

    /** A drink glass. */
    class Glass : Prop() {
        override fun DrawScope.render(s: PropState) {
            val g = Path().apply { moveTo(-11f, -30f); lineTo(11f, -30f); lineTo(8f, 0f); lineTo(-8f, 0f); close() }
            drawPath(Path().apply { moveTo(-9.5f, -18f); lineTo(9.5f, -18f); lineTo(8f, 0f); lineTo(-8f, 0f); close() }, Color(0xFFE0A53A).a(0.85f))
            drawPath(g, Color(0xFFBFE4FF).a(0.25f))
            drawPath(g, Color.White.a(0.7f), style = Stroke(1.5f))
            drawLine(Color.White.a(0.6f), Offset(-6f, -26f), Offset(-5f, -6f), 1.5f)
        }
    }

    /** A dark rain cloud of stress; key "on" (rain + flicker). */
    class StormCloud : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            val c = Color(0xFF59607A)
            for (i in 0 until 6) {
                val ph = frac(s.t * 1.4f + i / 6f)
                drawLine(Pal.Sky.a(on * (1f - ph)), Offset(-20f + i * 8f, 10f + ph * 30f), Offset(-22f + i * 8f, 16f + ph * 30f), 1.6f, StrokeCap.Round)
            }
            drawCircle(c, 13f, Offset(-14f, 2f)); drawCircle(c, 17f, Offset(2f, -4f)); drawCircle(c, 12f, Offset(17f, 3f))
            drawRoundRect(c, Offset(-26f, 2f), Size(54f, 12f), CornerRadius(6f))
            if (frac(s.t * 0.6f) < 0.07f) {
                val bolt = Path().apply { moveTo(2f, 10f); lineTo(-4f, 22f); lineTo(2f, 22f); lineTo(-3f, 34f) }
                drawPath(bolt, Pal.Gold, style = Stroke(2.5f))
            }
        }
    }

    /** A strip of football turf with yard lines. Origin = centre. */
    class Turf(val w: Float = 300f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF3F8F4E), Color(0xFF2E6B3B)), -20f, 40f), Offset(-w / 2f, -20f), Size(w, 60f))
            var x = -w / 2f + 20f
            while (x < w / 2f) { drawLine(Color.White.a(0.5f), Offset(x, -20f), Offset(x - 10f, 40f), 1.5f); x += 40f }
        }
    }

    /** A domino; key "fall" tips it over (0 standing .. 1 flat to the right). Origin = its foot. */
    class Domino(val text: String = "", val color: Color = Pal.Paper, val ink: Color = Pal.Ink, val hgt: Float = 64f) : Prop() {
        override val defaults = mapOf("fall" to 0f)
        override fun DrawScope.render(s: PropState) {
            val f = s["fall"]
            softShadow(f * hgt * 0.5f, 0f, 30f + f * hgt * 0.8f, 7f)
            rotate(f * 76f, Offset(12f, 0f)) {
                drawRoundRect(shade(color, -hgt, 0f, 0.1f, 0.2f), Offset(-12f, -hgt), Size(24f, hgt), CornerRadius(4f))
                drawLine(ink.a(0.4f), Offset(-8f, -hgt / 2f), Offset(8f, -hgt / 2f), 1.5f)
                drawCircle(ink.a(0.6f), 2.5f, Offset(0f, -hgt * 0.75f)); drawCircle(ink.a(0.6f), 2.5f, Offset(0f, -hgt * 0.25f))
            }
            if (text.isNotEmpty()) label(s.m, text, 0f, 12f, 8.5f, Color.White, 800, maxWidth = 70f)
        }
    }

    /** Yellow hard hat; place at a Bean's head position. */
    class HardHat : Prop() {
        override fun DrawScope.render(s: PropState) {
            drawArc(shade(Pal.Gold, -20f, 0f, 0.3f, 0.1f), 180f, 180f, true, Offset(-19f, -20f), Size(38f, 36f))
            drawRoundRect(Pal.Gold.darken(0.15f), Offset(-23f, -3f), Size(46f, 5f), CornerRadius(2.5f))
            drawLine(Pal.Gold.darken(0.25f), Offset(0f, -19f), Offset(0f, -3f), 2.5f)
        }
    }

    /** Battery; key "level" 0..1 (colour shifts from green to red as it drains). */
    class Battery(val caption: String = "") : Prop() {
        override val defaults = mapOf("level" to 1f)
        override fun DrawScope.render(s: PropState) {
            val lv = s["level"].coerceIn(0f, 1f)
            softShadow(0f, 40f, 60f, 8f)
            drawRoundRect(Pal.Slate, Offset(-9f, -44f), Size(18f, 8f), CornerRadius(2f))
            drawRoundRect(Color(0xFF22252E), Offset(-26f, -38f), Size(52f, 78f), CornerRadius(8f))
            val col = lerp(Pal.Coral, Pal.Leaf, lv)
            val fh = 68f * lv
            drawRoundRect(shade(col, 35f - fh, 35f), Offset(-21f, 35f - fh), Size(42f, fh), CornerRadius(5f))
            drawRoundRect(Color.White.a(0.6f), Offset(-26f, -38f), Size(52f, 78f), CornerRadius(8f), style = Stroke(2f))
            if (lv < 0.25f) glow(Pal.Coral, Offset(0f, 0f), 50f, 0.3f * (0.6f + 0.4f * sin(s.t * 6f)))
            if (caption.isNotEmpty()) label(s.m, caption, 0f, 54f, 10f, Color.White, 800, maxWidth = 100f)
        }
    }

    /** A coffee-shop counter with an espresso machine. Origin = floor centre. */
    class CoffeeCounter(val w: Float = 150f) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, w * 1.05f, 12f)
            drawRect(shade(Color(0xFF2F6B4B), -60f, 0f, 0.1f, 0.3f), Offset(-w / 2f, -60f), Size(w, 60f))
            drawRoundRect(shade(Pal.Wood.lighten(0.1f), -66f, -58f), Offset(-w / 2f - 4f, -66f), Size(w + 8f, 8f), CornerRadius(3f))
            drawRoundRect(shade(Pal.Steel, -100f, -66f), Offset(w / 2f - 52f, -100f), Size(40f, 34f), CornerRadius(4f))
            drawRect(Pal.Ink, Offset(w / 2f - 44f, -80f), Size(6f, 8f))
            drawRect(Pal.Ink, Offset(w / 2f - 26f, -80f), Size(6f, 8f))
            withTransform({ translate(w / 2f - 32f, -102f) }) { with(Steam()) { render(s) } }
            drawCircle(Color.White.a(0.85f), 9f, Offset(-w / 2f + 26f, -30f))
            drawCircle(Color(0xFF2F6B4B), 6f, Offset(-w / 2f + 26f, -30f))
        }
    }

    /** Puffs of angry red steam above a head. */
    class Fume : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            for (i in 0 until 4) {
                val ph = frac(s.t * 0.9f + i / 4f)
                val x = (if (i % 2 == 0) -1f else 1f) * (8f + ph * 10f)
                drawCircle(Pal.Coral.a(on * (1f - ph) * 0.7f), 4f + ph * 6f, Offset(x, -ph * 26f))
            }
        }
    }

    /** A prepared script card (Starbucks' LATTE); lines appear with key "p". */
    class ScriptCard(val title: String, val lines: List<String>) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val h = 28f + lines.size * 15f
            card(0f, 0f, 132f, h, Pal.Paper, 8f)
            label(s.m, title, 0f, -h / 2f + 12f, 9f, Color(0xFF2F6B4B), 900, letterSpacing = 1f)
            lines.forEachIndexed { i, l ->
                val k = (s["p"] * (lines.size + 1) - i).coerceIn(0f, 1f)
                label(s.m, l, -58f, -h / 2f + 28f + i * 15f, 9.5f, Pal.Ink, 700, Align.START, alpha = k, maxWidth = 120f)
            }
        }
    }

    /** Operating table with a patient under a sheet and a surgical lamp. Origin = floor centre. */
    class OperatingTable : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 130f, 12f)
            drawRect(Pal.Steel.darken(0.3f), Offset(-4f, -40f), Size(8f, 40f))
            drawRoundRect(shade(Pal.Steel, -48f, -38f), Offset(-60f, -48f), Size(120f, 10f), CornerRadius(3f))
            drawRoundRect(shade(Color(0xFF8FC7D6), -62f, -46f), Offset(-50f, -62f), Size(90f, 16f), CornerRadius(8f))
            drawCircle(Pal.Skin[0], 8f, Offset(46f, -54f))
            drawLine(Pal.Steel, Offset(-20f, -150f), Offset(-20f, -120f), 2f)
            drawArc(shade(Pal.Steel, -126f, -110f), 180f, 180f, true, Offset(-40f, -128f), Size(40f, 22f))
            val cone = Path().apply { moveTo(-36f, -118f); lineTo(-4f, -118f); lineTo(30f, -60f); lineTo(-70f, -60f); close() }
            drawPath(cone, Brush.verticalGradient(listOf(Color(0xFFFFF7D6).a(0.35f), Color.Transparent), -118f, -60f))
        }
    }

    /** An escalator with smoke curling from underneath (key "smoke"). Origin = bottom left of the stairs. */
    class Escalator : Prop() {
        override val defaults = mapOf("smoke" to 0f)
        override fun DrawScope.render(s: PropState) {
            val side = Path().apply { moveTo(0f, 0f); lineTo(30f, 0f); lineTo(150f, -110f); lineTo(150f, -96f); lineTo(36f, 8f); lineTo(0f, 8f); close() }
            drawPath(side, shade(Color(0xFF3B4050), -110f, 8f))
            val off = frac(s.t * 0.5f) * 14f
            var k = 0f
            while (k < 120f) {
                val x = 30f + k + off; val y = -k * 0.917f - off * 0.917f
                if (x < 150f) drawLine(Pal.Steel.a(0.6f), Offset(x, y), Offset(x - 12f, y), 2f)
                k += 14f
            }
            drawLine(Color(0xFF1C1C24), Offset(18f, -24f), Offset(150f, -140f), 4f, StrokeCap.Round)
            val sm = s["smoke"]
            if (sm > 0f) for (i in 0 until 7) {
                val ph = frac(s.t * 0.35f + i / 7f)
                drawCircle(Color(0xFF8A8F9E).a(sm * (1f - ph) * 0.6f), 8f + ph * 22f, Offset(70f + sin(s.t + i) * 10f, -40f - ph * 90f))
            }
        }
    }

    /** Rotating emergency light; key "on". */
    class Siren : Prop() {
        override val defaults = mapOf("on" to 0f)
        override fun DrawScope.render(s: PropState) {
            val on = s["on"]
            if (on > 0f) {
                val a = s.t * 5f
                for (side in listOf(0f, Math.PI.toFloat())) {
                    val beam = Path().apply { moveTo(0f, -14f); lineTo(cos(a + side - 0.25f) * 130f, -14f + sin(a + side - 0.25f) * 40f); lineTo(cos(a + side + 0.25f) * 130f, -14f + sin(a + side + 0.25f) * 40f); close() }
                    drawPath(beam, Pal.Coral.a(0.22f * on))
                }
                glow(Pal.Coral, Offset(0f, -14f), 40f, 0.6f * on * (0.6f + 0.4f * sin(s.t * 10f)))
            }
            drawRoundRect(Pal.Slate.darken(0.3f), Offset(-16f, -4f), Size(32f, 8f), CornerRadius(2f))
            drawArc(lerp(Color(0xFF6B2B33), Pal.Coral, on), 180f, 180f, true, Offset(-12f, -26f), Size(24f, 32f))
        }
    }

    /** A rule book whose pages flip with key "p". */
    class RuleBook(val title: String = "HOW WE WORK") : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 34f, 100f, 10f)
            drawRoundRect(Pal.Navy.darken(0.2f), Offset(-52f, -30f), Size(104f, 62f), CornerRadius(4f))
            drawRect(Pal.Paper, Offset(-48f, -26f), Size(46f, 54f))
            drawRect(Pal.Paper.darken(0.05f), Offset(2f, -26f), Size(46f, 54f))
            for (k in 0..4) drawLine(Pal.Slate.a(0.5f), Offset(-42f, -16f + k * 9f), Offset(-8f, -16f + k * 9f), 1.2f)
            val p = s["p"]
            for (k in 0..4) drawLine(Pal.Mint.a(min(1f, p * 1.5f)), Offset(8f, -16f + k * 9f), Offset(8f + 34f * ((p * 5f - k).coerceIn(0f, 1f)), -16f + k * 9f), 1.8f)
            val fl = frac(p * 3f)
            if (p in 0.01f..0.99f) {
                val x = 48f - 50f * fl
                drawPath(Path().apply { moveTo(2f, -26f); lineTo(x, -26f - 10f * sin(fl * Math.PI.toFloat())); lineTo(x, 28f - 10f * sin(fl * Math.PI.toFloat())); lineTo(2f, 28f); close() }, Color.White.a(0.9f))
            }
            label(s.m, title, 0f, -40f, 9f, Pal.Gold, 900, letterSpacing = 1f)
        }
    }

    /** Shopping cart; key "n" = how many of [items] have dropped in. Origin = floor under the cart. */
    class ShoppingCart(val items: List<Color> = listOf(Pal.Sky, Pal.Leaf, Color.White, Pal.Rose)) : Prop() {
        override val defaults = mapOf("n" to 0f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 90f, 10f)
            val n = s["n"]
            items.forEachIndexed { i, c ->
                val k = (n - i).coerceIn(0f, 1f)
                if (k <= 0f) return@forEachIndexed
                val x = -24f + i * 14f
                val y = -44f - (1f - Ease.Out.apply(k)) * 60f
                drawRoundRect(shade(c, y - 18f, y), Offset(x - 5f, y - 18f), Size(10f, 18f), CornerRadius(3f))
                drawRect(c.darken(0.3f), Offset(x - 3f, y - 22f), Size(6f, 4f))
            }
            val basket = Path().apply { moveTo(-40f, -50f); lineTo(36f, -50f); lineTo(28f, -18f); lineTo(-32f, -18f); close() }
            drawPath(basket, Pal.Steel.a(0.35f))
            drawPath(basket, Pal.Steel, style = Stroke(2.5f))
            for (k in 1..4) drawLine(Pal.Steel.a(0.8f), Offset(-40f + k * 15f, -50f), Offset(-32f + k * 12f, -18f), 1.4f)
            drawLine(Pal.Steel, Offset(36f, -50f), Offset(46f, -62f), 2.5f, StrokeCap.Round)
            drawLine(Pal.Steel, Offset(-30f, -18f), Offset(-30f, -8f), 2.5f)
            drawLine(Pal.Steel, Offset(24f, -18f), Offset(24f, -8f), 2.5f)
            drawCircle(Pal.Ink, 5f, Offset(-28f, -5f)); drawCircle(Pal.Ink, 5f, Offset(22f, -5f))
        }
    }

    /** A coupon ticket with dashed border. */
    class Coupon(val text: String, val color: Color = Pal.Paper, val hot: Boolean = false) : Prop() {
        override fun DrawScope.render(s: PropState) {
            if (hot) glow(Pal.Gold, Offset.Zero, 46f, 0.4f + 0.15f * sin(s.t * 3f))
            card(0f, 0f, 70f, 36f, color, 4f)
            drawRoundRect(Pal.Ink.a(0.4f), Offset(-31f, -14f), Size(62f, 28f), CornerRadius(3f), style = Stroke(1.2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 3f))))
            label(s.m, text, 0f, -3f, 9f, Pal.Ink, 800, maxWidth = 60f)
            label(s.m, "% OFF", 0f, 9f, 7f, Pal.Coral, 900)
        }
    }

    class Stroller(val color: Color = Pal.Sky) : Prop() {
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 60f, 8f)
            drawArc(shade(color, -46f, -12f), 180f, 180f, true, Offset(-26f, -46f), Size(44f, 44f))
            drawArc(color.darken(0.25f), 180f, 90f, true, Offset(-26f, -46f), Size(44f, 44f))
            drawRect(color.darken(0.1f), Offset(-26f, -24f), Size(44f, 6f))
            drawLine(Pal.Steel, Offset(18f, -24f), Offset(30f, -48f), 2.5f, StrokeCap.Round)
            drawCircle(Pal.Ink, 7f, Offset(-16f, -7f)); drawCircle(Pal.Ink, 7f, Offset(10f, -7f))
            drawCircle(Pal.Steel, 2.5f, Offset(-16f, -7f)); drawCircle(Pal.Steel, 2.5f, Offset(10f, -7f))
        }
    }

    /** A retro radio with musical notes floating out; key "on". */
    class Radio : Prop() {
        override val defaults = mapOf("on" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 28f, 90f, 10f)
            drawLine(Pal.Steel, Offset(20f, -24f), Offset(40f, -54f), 2f)
            drawRoundRect(shade(Pal.Coral.darken(0.1f), -26f, 26f), Offset(-44f, -26f), Size(88f, 52f), CornerRadius(10f))
            drawCircle(Pal.Ink.a(0.85f), 15f, Offset(-18f, 2f))
            for (k in 0..3) drawCircle(Pal.Steel.a(0.4f), 3f + k * 3.5f, Offset(-18f, 2f), style = Stroke(1f))
            drawRoundRect(Pal.Paper, Offset(4f, -14f), Size(32f, 12f), CornerRadius(2f))
            drawCircle(Pal.Gold, 4f, Offset(12f, 12f)); drawCircle(Pal.Gold, 4f, Offset(28f, 12f))
            val on = s["on"]
            for (k in 0..2) {
                val ph = frac(s.t * 0.6f + k / 3f)
                label(s.m, if (k % 2 == 0) "♪" else "♫", -30f + k * 22f + sin(ph * 6f) * 6f, -36f - ph * 40f, 14f, Pal.Gold, 800, alpha = on * (1f - ph))
            }
        }
    }

    /** A city bus seen from the side; key "full" shows passengers in the windows. Origin = road. */
    class Bus(val color: Color = Color(0xFF3D6FB6)) : Prop() {
        override val defaults = mapOf("full" to 1f)
        override fun DrawScope.render(s: PropState) {
            softShadow(0f, 0f, 170f, 12f)
            drawRoundRect(shade(color, -70f, -10f), Offset(-80f, -70f), Size(160f, 60f), CornerRadius(10f))
            drawRect(Pal.Paper.a(0.9f), Offset(-80f, -30f), Size(160f, 5f))
            val full = s["full"]
            for (k in 0 until 5) {
                val x = -70f + k * 28f
                drawRoundRect(Color(0xFFBFE4FF).a(0.75f), Offset(x, -62f), Size(22f, 20f), CornerRadius(3f))
                if (hash01(k, 7) < full) drawCircle(Pal.Skin[k % 4].a(full), 5f, Offset(x + 11f, -50f))
            }
            drawRoundRect(Color(0xFF1C1C24), Offset(68f, -62f), Size(10f, 40f), CornerRadius(2f))
            for (wx in listOf(-50f, 50f)) { drawCircle(Pal.Ink, 11f, Offset(wx, -8f)); drawCircle(Pal.Steel, 4.5f, Offset(wx, -8f)) }
            label(s.m, "BUS", -40f, -20f, 8f, Color.White, 900, letterSpacing = 1f)
        }
    }

    /**
     * A friendship network. [nodes] in local coordinates, [links] as index pairs. Key "p" grows the network outward
     * (nodes then links), key "lit" highlights everything that has joined.
     */
    class Network(val nodes: List<Offset>, val links: List<Pair<Int, Int>>, val color: Color, val nodeR: Float = 7f, val thick: Float = 2.5f) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            val n = nodes.size
            fun shown(i: Int) = ((p * (n + 1) - i) / 1.5f).coerceIn(0f, 1f)
            for ((a, b) in links) {
                val k = min(shown(a), shown(b))
                if (k <= 0f) continue
                val pa = nodes[a]; val pb = nodes[b]
                drawLine(color.a(0.7f * k), pa, Offset(pa.x + (pb.x - pa.x) * k, pa.y + (pb.y - pa.y) * k), thick, StrokeCap.Round)
            }
            nodes.forEachIndexed { i, o ->
                val k = shown(i)
                if (k <= 0f) return@forEachIndexed
                glow(color, o, nodeR * 2.4f, 0.35f * k)
                drawCircle(shade(color, o.y - nodeR, o.y + nodeR, 0.3f, 0.2f), nodeR * Ease.Back.apply(k), o)
                drawCircle(Pal.Skin[i % 4], nodeR * 0.45f * k, Offset(o.x, o.y - nodeR * 0.1f))
            }
        }
    }

    /** A steering wheel (held in your hands). */
    class SteeringWheel : Prop() {
        override fun DrawScope.render(s: PropState) {
            val r = sin(s.t * 1.2f) * 8f
            rotate(r, Offset.Zero) {
                drawCircle(Pal.Ink, 20f, Offset.Zero, style = Stroke(6f))
                drawCircle(Pal.Slate, 20f, Offset.Zero, style = Stroke(2f))
                drawCircle(Pal.Slate, 6f, Offset.Zero)
                for (a in listOf(0f, 2.1f, 4.2f)) drawLine(Pal.Slate, Offset.Zero, polar(Offset.Zero, 19f, a + TAU / 4f), 3f)
            }
        }
    }

    /** Thin tie line between two points relative to origin, drawn on with key "p" (for network edges with people). */
    class Tie(val dx: Float, val dy: Float, val color: Color = Pal.Gold, val thick: Float = 2.5f) : Prop() {
        override val defaults = mapOf("p" to 0f)
        override fun DrawScope.render(s: PropState) {
            val p = s["p"]
            drawLine(color.a(0.8f), Offset.Zero, Offset(dx * p, dy * p), thick, StrokeCap.Round)
        }
    }
}
