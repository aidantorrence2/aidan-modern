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
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

// =====================================================================================================
// Characters
// =====================================================================================================

/**
 * The cast: a friendly rounded character. Origin is the ground point between the feet; standing height ~88.
 * Keys: mood (-1 sad .. 1 happy), look (-1 left .. 1 right), arms (0 down .. 1 raised), wave, point (right arm out),
 * walk (leg cycle), sit (cross-legged), wow (surprised face), jump (hop amplitude), hold (arms forward).
 */
class Bean(
    val shirt: Color,
    val skin: Color = Pal.Skin[0],
    val hair: Color = Pal.Hair[0],
    val hairStyle: Int = 0,
    val pants: Color = Color(0xFF2E3550),
    val seed: Int = 0,
) : Prop() {
    override val defaults = mapOf("mood" to 0.45f, "look" to 0f, "arms" to 0f, "wave" to 0f, "point" to 0f,
        "walk" to 0f, "sit" to 0f, "wow" to 0f, "jump" to 0f, "hold" to 0f)

    override fun DrawScope.render(s: PropState) {
        val t = s.t + seed * 1.7f
        val mood = s["mood"]; val look = s["look"]; val arms = s["arms"]; val wave = s["wave"]
        val point = s["point"]; val walk = s["walk"]; val sit = s["sit"]; val wow = s["wow"]
        val hold = s["hold"]
        val hop = abs(sin(t * 6.5f)) * 12f * s["jump"]
        softShadow(0f, 1f, 50f * (1f - hop / 40f), 10f, 0.35f)
        val dy = -hop + sit * 14f
        val breathe = 1f + 0.02f * sin(t * 2.3f)
        val dark = pants.darken(0.35f)

        // legs
        if (sit < 0.5f) {
            val sw = sin(t * 9f) * walk
            limb(Offset(-7f, -16f + dy), Offset(-7f + sw * 7f, -2f + dy - max(0f, sw) * 3f), pants, 10f)
            limb(Offset(7f, -16f + dy), Offset(7f - sw * 7f, -2f + dy - max(0f, -sw) * 3f), pants, 10f)
            drawOval(dark, Offset(-13f + sw * 7f, -4f + dy), Size(12f, 6f))
            drawOval(dark, Offset(1f - sw * 7f, -4f + dy), Size(12f, 6f))
        } else {
            drawOval(shade(pants, -22f + dy, -6f + dy), Offset(-26f, -22f + dy), Size(52f, 17f))
        }

        // body
        val top = -56f * breathe + dy
        val bottom = -13f + dy
        drawRoundRect(shade(shirt, top, bottom), Offset(-18f, top), Size(36f, bottom - top), CornerRadius(17f))
        drawRoundRect(Color.White.copy(alpha = 0.16f), Offset(-12f, top + 4f), Size(9f, (bottom - top) * 0.55f), CornerRadius(5f))

        // arms: shoulders, then hands lerped between poses
        val shL = Offset(-15f, top + 9f)
        val shR = Offset(15f, top + 9f)
        fun lerpO(a: Offset, b: Offset, f: Float) = Offset(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f)
        var handL = lerpO(Offset(-23f, -24f + dy), Offset(-27f, top - 22f), arms)
        var handR = lerpO(Offset(23f, -24f + dy), Offset(27f, top - 22f), arms)
        handL = lerpO(handL, Offset(-12f, top + 22f), hold)
        handR = lerpO(handR, Offset(12f, top + 22f), hold)
        handR = lerpO(handR, Offset(40f, top + 8f), point)
        if (wave > 0f) {
            val ang = -1.9f + sin(t * 9f) * 0.45f
            handR = lerpO(handR, Offset(shR.x + cos(ang) * 26f, shR.y + sin(ang) * 26f), wave)
        }
        val sleeve = shirt.darken(0.12f)
        limb(shL, handL, sleeve, 8f)
        limb(shR, handR, sleeve, 8f)
        drawCircle(skin, 5f, handL)
        drawCircle(skin, 5f, handR)

        // head
        val hc = Offset(0f, top - 15f)
        drawCircle(skin.darken(0.12f), 4f, Offset(hc.x - 17f, hc.y + 2f))
        drawCircle(skin.darken(0.12f), 4f, Offset(hc.x + 17f, hc.y + 2f))
        drawCircle(Brush.radialGradient(listOf(skin.lighten(0.18f), skin, skin.darken(0.1f)), Offset(hc.x - 5f, hc.y - 6f), 24f), 17.5f, hc)
        drawHair(hc)

        // face
        val ex = look * 2.2f
        val blink = frac(t * 0.19f + seed * 0.31f) < 0.03f
        val eyeScale = 1f + 0.3f * wow
        for (side in listOf(-1f, 1f)) {
            val e = Offset(hc.x + side * 6.5f + ex, hc.y - 1f)
            if (blink) {
                drawLine(Pal.Ink, Offset(e.x - 3f, e.y), Offset(e.x + 3f, e.y), 1.8f, StrokeCap.Round)
            } else {
                drawOval(Color.White, Offset(e.x - 3.6f * eyeScale, e.y - 4.2f * eyeScale), Size(7.2f * eyeScale, 8.4f * eyeScale))
                drawCircle(Pal.Ink, 2.5f, Offset(e.x + look * 1.4f, e.y + 0.6f))
                drawCircle(Color.White, 0.9f, Offset(e.x + look * 1.4f + 0.9f, e.y - 0.4f))
            }
            // brow: raised when surprised, slanted when sad
            val by = e.y - 7.5f - wow * 2.5f
            val inner = if (mood < 0f) -mood * 2.5f else 0f
            drawLine(hair.darken(0.1f), Offset(e.x - side * 3.5f, by - inner), Offset(e.x + side * 3.5f, by + 0.5f), 1.7f, StrokeCap.Round)
        }
        if (mood > 0.35f) {
            drawCircle(Pal.Rose.a(0.35f * min(1f, (mood - 0.35f) * 2f)), 3.4f, Offset(hc.x - 11f, hc.y + 5f))
            drawCircle(Pal.Rose.a(0.35f * min(1f, (mood - 0.35f) * 2f)), 3.4f, Offset(hc.x + 11f, hc.y + 5f))
        }
        val my = hc.y + 9f
        if (wow > 0.5f) {
            drawOval(Color(0xFF5A1E2A), Offset(-3f, my - 3.5f), Size(6f, 7f))
        } else {
            val curve = mood * 6f
            val mouth = Path().apply { moveTo(-6f, my); quadraticTo(0f, my + curve, 6f, my) }
            if (mood > 0.65f) {
                val open = Path().apply { moveTo(-6f, my); quadraticTo(0f, my + curve * 1.3f, 6f, my); close() }
                drawPath(open, Color(0xFF6B2232))
            }
            drawPath(mouth, Pal.Ink, style = Stroke(2f, cap = StrokeCap.Round))
        }
    }

    private fun DrawScope.drawHair(hc: Offset) {
        if (hairStyle == 4) return
        val cap = Path().apply {
            moveTo(hc.x - 18f, hc.y + 1f)
            cubicTo(hc.x - 20f, hc.y - 25f, hc.x + 20f, hc.y - 25f, hc.x + 18f, hc.y + 1f)
            lineTo(hc.x + 15f, hc.y - 6f)
            quadraticTo(hc.x + 2f, hc.y - 13f, hc.x - 14f, hc.y - 6f)
            close()
        }
        if (hairStyle == 1) {
            drawRoundRect(hair, Offset(hc.x - 20f, hc.y - 6f), Size(8f, 28f), CornerRadius(4f))
            drawRoundRect(hair, Offset(hc.x + 12f, hc.y - 6f), Size(8f, 28f), CornerRadius(4f))
        }
        drawPath(cap, shade(hair, hc.y - 22f, hc.y, 0.18f, 0.1f))
        if (hairStyle == 2) drawCircle(hair, 7.5f, Offset(hc.x, hc.y - 21f))
        if (hairStyle == 3) for (k in 0..6) drawCircle(hair, 6f, polar(hc, 16f, -3.0f + k * 0.36f))
    }
}

// =====================================================================================================
// Text
// =====================================================================================================

class Caption(
    val text: String, val textSize: Float = 15f, val color: Color = Pal.White, val weight: Int = 700,
    val chip: Color? = null, val maxWidth: Float = 300f, val italic: Boolean = false, val align: Align = Align.CENTER,
) : Prop() {
    override fun DrawScope.render(s: PropState) {
        label(s.m, text, 0f, 0f, textSize, color, weight, align, maxWidth, italic, chip, shadow = chip == null)
    }
}

/** Small rounded tag, e.g. a label pinned to a diagram. */
class Tag(val text: String, val color: Color = Pal.Mint, val textSize: Float = 10.5f, val dark: Boolean = true) : Prop() {
    override fun DrawScope.render(s: PropState) {
        label(s.m, text, 0f, 0f, textSize, if (dark) Pal.Ink else Pal.White, 700, chip = color)
    }
}

/** Speech bubble (or thought bubble) centred on its origin, tail pointing toward [tail] (-1 left, 0 down, 1 right). */
class Bubble(
    val text: String, val w: Float = 130f, val tail: Float = -0.6f, val thought: Boolean = false,
    val textSize: Float = 11.5f, val fill: Color = Pal.Paper, val ink: Color = Pal.Ink, val italic: Boolean = false,
) : Prop() {
    override fun DrawScope.render(s: PropState) {
        val layout = s.m.measure(text, androidx.compose.ui.text.TextStyle(fontSize = textSize.toSp(), lineHeight = (textSize * 1.25f).toSp()),
            constraints = androidx.compose.ui.unit.Constraints(maxWidth = (w - 18f).toInt()))
        val h = layout.size.height + 16f
        val bw = min(w, layout.size.width + 22f)
        drawRoundRect(Color.Black.copy(alpha = 0.25f), Offset(-bw / 2f + 2f, -h / 2f + 4f), Size(bw, h), CornerRadius(12f))
        val tx = tail * bw * 0.35f
        if (thought) {
            drawCircle(fill, 5f, Offset(tx * 1.2f, h / 2f + 8f))
            drawCircle(fill, 3f, Offset(tx * 1.5f, h / 2f + 17f))
        } else {
            val tp = Path().apply { moveTo(tx - 7f, h / 2f - 2f); lineTo(tx + 7f, h / 2f - 2f); lineTo(tx + tail * 10f, h / 2f + 12f); close() }
            drawPath(tp, fill)
        }
        drawRoundRect(fill, Offset(-bw / 2f, -h / 2f), Size(bw, h), CornerRadius(if (thought) h / 2f else 12f))
        label(s.m, text, 0f, 0f, textSize, ink, 600, maxWidth = w - 18f, italic = italic)
    }
}

/** A big animated number; key "v". */
class Counter(
    val textSize: Float = 32f, val color: Color = Pal.Gold, val decimals: Int = 0,
    val prefix: String = "", val suffix: String = "", val halo: Boolean = true, val map: (Float) -> Float = { it },
) : Prop() {
    override fun DrawScope.render(s: PropState) {
        val txt = prefix + String.format(java.util.Locale.US, "%,.${decimals}f", map(s["v"])) + suffix
        if (halo) glow(color, Offset.Zero, textSize * 1.8f, 0.25f)
        label(s.m, txt, 0f, 0f, textSize, color, 800, shadow = true)
    }
}

// =====================================================================================================
// Charts and diagrams
// =====================================================================================================

/**
 * Line chart in a w x h box centred on the origin. [fn] maps t (0..1, left to right) to 0..1 (bottom to top).
 * Key "p" draws the curve on; "ax" draws the axes. A glowing dot rides the tip of the curve.
 */
class LineChart(
    val w: Float, val h: Float, val color: Color, val fn: (Float) -> Float,
    val xLabel: String? = null, val yLabel: String? = null, val endLabel: String? = null,
    val axes: Boolean = true, val fill: Boolean = true, val tEnd: Float = 1f, val width: Float = 3.2f,
    val labelDy: Float = -16f, val labelAlign: Align = Align.END,
    val rider: Prop? = null, val riderScale: Float = 0.38f, val riderMood: Float = 0.6f,
) : Prop() {
    override val defaults = mapOf("p" to 0f, "ax" to 1f, "mood" to riderMood)
    override fun DrawScope.render(s: PropState) {
        val x0 = -w / 2f; val y0 = h / 2f
        val ax = s["ax"]
        if (axes && ax > 0f) {
            val c = Color.White.copy(alpha = 0.35f)
            drawLine(c, Offset(x0, y0), Offset(x0, y0 - h * ax), 1.6f, StrokeCap.Round)
            drawLine(c, Offset(x0, y0), Offset(x0 + w * ax, y0), 1.6f, StrokeCap.Round)
            if (ax > 0.95f) {
                xLabel?.let { label(s.m, it, x0 + w, y0 + 11f, 10f, Color.White.copy(alpha = 0.6f), 500, Align.END) }
                yLabel?.let { label(s.m, it, x0 + 3f, y0 - h - 8f, 10f, Color.White.copy(alpha = 0.6f), 500, Align.START) }
            }
        }
        val p = s["p"] * tEnd
        if (p <= 0.001f) return
        val n = 120
        val line = Path()
        val area = Path()
        var tip = Offset(x0, y0)
        for (k in 0..n) {
            val tt = p * k / n
            val v = fn(tt).coerceIn(-0.05f, 1.1f)
            val pt = Offset(x0 + tt * w, y0 - v * h)
            if (k == 0) { line.moveTo(pt.x, pt.y); area.moveTo(pt.x, y0); area.lineTo(pt.x, pt.y) } else { line.lineTo(pt.x, pt.y); area.lineTo(pt.x, pt.y) }
            tip = pt
        }
        area.lineTo(tip.x, y0); area.close()
        if (fill) drawPath(area, Brush.verticalGradient(listOf(color.a(0.35f), color.a(0.02f)), y0 - h, y0))
        drawPath(line, color.a(0.25f), style = Stroke(width * 3f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(line, color, style = Stroke(width, cap = StrokeCap.Round, join = StrokeJoin.Round))
        glow(color, tip, 16f, 0.6f)
        if (rider != null) {
            withTransform({ translate(tip.x, tip.y); scale(riderScale, riderScale, Offset.Zero) }) { with(rider) { render(s) } }
        } else {
            drawCircle(Color.White, 4.2f, tip)
            drawCircle(color, 2.6f, tip)
        }
        val ring = frac(s.t * 0.9f)
        drawCircle(color.a(0.6f * (1f - ring)), 4f + ring * 12f, tip, style = Stroke(1.5f))
        if (endLabel != null && s["p"] > 0.92f) {
            val a = ((s["p"] - 0.92f) / 0.08f).coerceIn(0f, 1f)
            label(s.m, endLabel, tip.x, tip.y + labelDy, 12f, Pal.Ink, 800, labelAlign, chip = color, alpha = a)
        }
    }
}

/** Bar chart in a w x h box; key "p" grows the bars one after another. */
class Bars(
    val values: List<Float>, val labels: List<String>, val colors: List<Color>, val w: Float, val h: Float,
    val valueLabels: List<String>? = null, val barWidth: Float = 0.62f,
) : Prop() {
    override val defaults = mapOf("p" to 0f)
    override fun DrawScope.render(s: PropState) {
        val n = values.size
        val slot = w / n
        val base = h / 2f
        drawLine(Color.White.copy(alpha = 0.35f), Offset(-w / 2f, base), Offset(w / 2f, base), 1.6f)
        for (i in 0 until n) {
            val local = ((s["p"] * (n + 1) - i) / 1.6f).coerceIn(0f, 1f)
            val e = Ease.Back.apply(local)
            val bh = values[i] * h * e
            val cx = -w / 2f + slot * (i + 0.5f)
            val bw = slot * barWidth
            val col = colors[i % colors.size]
            if (bh > 0.5f) {
                drawRoundRect(shade(col, base - bh, base, 0.25f, 0.2f), Offset(cx - bw / 2f, base - bh), Size(bw, bh), CornerRadius(min(6f, bw / 3f)))
                drawRoundRect(Color.White.copy(alpha = 0.2f), Offset(cx - bw / 2f + 3f, base - bh + 3f), Size(bw * 0.2f, max(0f, bh - 6f)), CornerRadius(3f))
            }
            label(s.m, labels[i], cx, base + 11f, 10f, Color.White.copy(alpha = 0.75f), 600, maxWidth = slot + 10f)
            valueLabels?.getOrNull(i)?.let { if (local > 0.7f) label(s.m, it, cx, base - bh - 11f, 12f, col.lighten(0.2f), 800, alpha = (local - 0.7f) / 0.3f) }
        }
    }
}

/** A curved arrow from the origin to (dx, dy), drawn on by key "p". */
class Arrow(
    val dx: Float, val dy: Float, val bend: Float = 0f, val color: Color = Pal.White, val width: Float = 3f,
    val dashed: Boolean = false, val head: Boolean = true,
) : Prop() {
    override val defaults = mapOf("p" to 0f)
    override fun DrawScope.render(s: PropState) {
        val p = s["p"]
        if (p <= 0.001f) return
        val len = sqrt(dx * dx + dy * dy)
        val nx = -dy / len; val ny = dx / len
        val c = Offset(dx / 2f + nx * bend, dy / 2f + ny * bend)
        fun at(u: Float): Offset {
            val a = (1 - u) * (1 - u); val b = 2 * (1 - u) * u; val d = u * u
            return Offset(b * c.x + d * dx, b * c.y + d * dy)
        }
        val path = Path()
        val n = 40
        for (k in 0..n) { val o = at(p * k / n); if (k == 0) path.moveTo(o.x, o.y) else path.lineTo(o.x, o.y) }
        val effect = if (dashed) PathEffect.dashPathEffect(floatArrayOf(7f, 6f), -s.t * 20f) else null
        drawPath(path, color.a(0.2f), style = Stroke(width * 2.6f, cap = StrokeCap.Round, pathEffect = effect))
        drawPath(path, color, style = Stroke(width, cap = StrokeCap.Round, pathEffect = effect))
        if (head && p > 0.15f) {
            val tip = at(p); val prev = at(max(0f, p - 0.04f))
            val ang = atan2(tip.y - prev.y, tip.x - prev.x)
            val hd = 6f + width * 1.6f
            val hp = Path().apply {
                moveTo(tip.x + cos(ang) * 2f, tip.y + sin(ang) * 2f)
                lineTo(tip.x + cos(ang + 2.6f) * hd, tip.y + sin(ang + 2.6f) * hd)
                lineTo(tip.x + cos(ang - 2.6f) * hd, tip.y + sin(ang - 2.6f) * hd)
                close()
            }
            drawPath(hp, color)
        }
    }
}

/** A labelled rounded card with optional icon on the left. */
class Tile(
    val text: String, val color: Color = Pal.Navy, val w: Float = 120f, val h: Float = 40f,
    val icon: Prop? = null, val textSize: Float = 12.5f, val ink: Color = Pal.White, val iconScale: Float = 0.5f,
) : Prop() {
    override fun DrawScope.render(s: PropState) {
        card(0f, 0f, w, h, color, min(12f, h / 2.6f))
        if (icon != null) {
            withTransform({ translate(-w / 2f + h * 0.55f, h * 0.18f); scale(iconScale, iconScale, Offset.Zero) }) { with(icon) { render(s) } }
            label(s.m, text, -w / 2f + h * 1.05f, 0f, textSize, ink, 700, Align.START, maxWidth = w - h * 1.15f)
        } else {
            label(s.m, text, 0f, 0f, textSize, ink, 700, maxWidth = w - 14f)
        }
    }
}

/** Progress ring; key "p". */
class Ring(val r: Float, val color: Color = Pal.Mint, val width: Float = 6f, val text: String? = null, val textSize: Float = 13f) : Prop() {
    override val defaults = mapOf("p" to 0f)
    override fun DrawScope.render(s: PropState) {
        drawCircle(Color.White.copy(alpha = 0.1f), r, Offset.Zero, style = Stroke(width))
        drawArc(color, -90f, 360f * s["p"], false, Offset(-r, -r), Size(2 * r, 2 * r), style = Stroke(width, cap = StrokeCap.Round))
        text?.let { label(s.m, it, 0f, 0f, textSize, Pal.White, 800, maxWidth = r * 1.8f) }
    }
}

// =====================================================================================================
// Objects
// =====================================================================================================

/** Wall calendar / habit tracker. Key "done" = number of days marked; [misses] are drawn as red crosses. */
class Calendar(val cols: Int = 7, val rows: Int = 3, val title: String = "HABIT TRACKER", val accent: Color = Pal.Mint, val misses: Set<Int> = emptySet()) : Prop() {
    override val defaults = mapOf("done" to 0f)
    override fun DrawScope.render(s: PropState) {
        val cell = 19f
        val w = cols * cell + 16f
        val h = rows * cell + 40f
        card(0f, 0f, w, h, Pal.Paper, 8f)
        drawRoundRect(accent, Offset(-w / 2f, -h / 2f), Size(w, 22f), CornerRadius(8f, 8f))
        drawRect(accent, Offset(-w / 2f, -h / 2f + 12f), Size(w, 10f))
        label(s.m, title, 0f, -h / 2f + 11f, 9f, Pal.Ink, 800, letterSpacing = 0.6f)
        for (k in listOf(-w / 4f, w / 4f)) { drawCircle(Pal.Slate, 3f, Offset(k, -h / 2f)); drawCircle(Color.White, 1.5f, Offset(k, -h / 2f)) }
        val done = s["done"]
        for (i in 0 until cols * rows) {
            val cx = -w / 2f + 8f + cell * (i % cols + 0.5f)
            val cy = -h / 2f + 30f + cell * (i / cols + 0.5f)
            drawRoundRect(Color(0xFFE5DED0), Offset(cx - 7.5f, cy - 7.5f), Size(15f, 15f), CornerRadius(3f))
            val f = (done - i).coerceIn(0f, 1f)
            if (f > 0f) {
                val k = Ease.Back.apply(f)
                if (i in misses) {
                    drawLine(Pal.Coral, Offset(cx - 4.5f * k, cy - 4.5f * k), Offset(cx + 4.5f * k, cy + 4.5f * k), 2.6f, StrokeCap.Round)
                    drawLine(Pal.Coral, Offset(cx + 4.5f * k, cy - 4.5f * k), Offset(cx - 4.5f * k, cy + 4.5f * k), 2.6f, StrokeCap.Round)
                } else {
                    drawRoundRect(accent.a(k), Offset(cx - 7.5f, cy - 7.5f), Size(15f, 15f), CornerRadius(3f))
                    val ck = Path().apply { moveTo(cx - 4f, cy); lineTo(cx - 1f, cy + 3.2f); lineTo(cx + 4.5f, cy - 3.5f) }
                    drawPath(ck, Color.White.a(k), style = Stroke(2.2f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                }
            }
        }
    }
}

/** Countdown/timer dial; key "p" fills the arc. */
class Timer(val r: Float = 26f, val color: Color = Pal.Coral, val text: String = "") : Prop() {
    override val defaults = mapOf("p" to 0f)
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, r + 6f, r * 1.8f, 7f)
        rrect(0f, -r - 4f, 10f, 7f, 2f, Pal.Steel)
        drawCircle(shade(Pal.White, -r, r, 0.05f, 0.12f), r, Offset.Zero)
        drawCircle(color, r, Offset.Zero, style = Stroke(3f))
        drawArc(color.a(0.85f), -90f, 360f * s["p"], true, Offset(-r + 5f, -r + 5f), Size(2 * r - 10f, 2 * r - 10f))
        for (k in 0 until 12) drawLine(Pal.Ink.a(0.5f), polar(Offset.Zero, r - 3f, k * TAU / 12f), polar(Offset.Zero, r - 6f, k * TAU / 12f), 1.2f)
        if (text.isNotEmpty()) label(s.m, text, 0f, r + 16f, 11f, Pal.White, 800)
    }
}

/** Smartphone. Keys: notif (number of notifications), buzz (wiggle), on (screen glow). */
class Phone(val body: Color = Color(0xFF22252E)) : Prop() {
    override val defaults = mapOf("notif" to 0f, "buzz" to 0f, "on" to 1f)
    override fun DrawScope.render(s: PropState) {
        val wig = sin(s.t * 45f) * 5f * s["buzz"]
        rotate(wig, Offset.Zero) {
            softShadow(0f, 44f, 46f, 8f)
            drawRoundRect(shade(body, -40f, 40f), Offset(-22f, -40f), Size(44f, 80f), CornerRadius(9f))
            val on = s["on"]
            drawRoundRect(Brush.verticalGradient(listOf(lerp(Color(0xFF111318), Color(0xFF3B5BDB), on), lerp(Color(0xFF111318), Color(0xFF8E5BD8), on)), -34f, 32f),
                Offset(-18f, -34f), Size(36f, 66f), CornerRadius(5f))
            val n = s["notif"]
            for (i in 0 until min(4, ceil(n).toInt())) {
                val k = Ease.Back.apply((n - i).coerceIn(0f, 1f))
                val y = -26f + i * 14f
                drawRoundRect(Color.White.copy(alpha = 0.92f * min(1f, k)), Offset(-16f, y), Size(32f * k, 11f), CornerRadius(3f))
                drawCircle(listOf(Pal.Coral, Pal.Sky, Pal.Leaf, Pal.Gold)[i].a(min(1f, k)), 3f, Offset(-11f, y + 5.5f))
            }
            if (n >= 1f) {
                drawCircle(Pal.Coral, 7f, Offset(20f, -38f))
                label(s.m, ceil(n).toInt().toString(), 20f, -38f, 9f, Color.White, 800)
            }
            if (s["buzz"] > 0.05f) for (k in 1..2) {
                drawArc(Color.White.a(0.5f * s["buzz"]), -40f, 80f, false, Offset(14f + k * 6f, -10f - k * 6f), Size(12f + k * 8f, 20f + k * 12f), style = Stroke(1.6f))
                drawArc(Color.White.a(0.5f * s["buzz"]), 140f, 80f, false, Offset(-26f - k * 14f, -10f - k * 6f), Size(12f + k * 8f, 20f + k * 12f), style = Stroke(1.6f))
            }
        }
    }
}

/** A stack of paper pages; key "n" = number of sheets (float, animates smoothly). */
class PageStack(val color: Color = Pal.Paper, val label: String = "") : Prop() {
    override val defaults = mapOf("n" to 1f)
    override fun DrawScope.render(s: PropState) {
        val n = max(1f, s["n"])
        val sheets = ceil(n).toInt()
        softShadow(0f, 4f, 76f, 10f)
        for (i in 0 until sheets) {
            val y = -i * 2.4f
            val f = if (i == sheets - 1) n - (sheets - 1) else 1f
            drawRoundRect(color.darken(0.06f + 0.04f * (i % 2)).a(f), Offset(-32f + (i % 3) * 0.6f, y - 6f), Size(64f, 8f), CornerRadius(2f))
        }
        val top = -sheets * 2.4f - 4f
        drawRoundRect(color, Offset(-32f, top - 40f), Size(64f, 44f), CornerRadius(3f))
        for (k in 0 until 5) drawLine(Pal.Slate.a(0.5f), Offset(-24f, top - 32f + k * 7f), Offset(if (k == 4) 6f else 24f, top - 32f + k * 7f), 1.6f, StrokeCap.Round)
        if (label.isNotEmpty()) label(s.m, label, 0f, 20f, 11f, Pal.White, 700)
    }
}

class Coin(val r: Float = 11f) : Prop() {
    override fun DrawScope.render(s: PropState) {
        drawCircle(Brush.radialGradient(listOf(Color(0xFFFFE08A), Pal.Gold, Color(0xFFB9831F)), Offset(-r * 0.3f, -r * 0.4f), r * 1.6f), r, Offset.Zero)
        drawCircle(Color(0xFFB9831F), r * 0.72f, Offset.Zero, style = Stroke(1.4f))
        label(s.m, "$", 0f, 0f, r * 1.05f, Color(0xFF9A6A12), 900)
        val sh = frac(s.t * 0.4f)
        if (sh < 0.25f) drawLine(Color.White.a(0.7f * (1f - sh * 4f)), Offset(-r * 0.6f + sh * r * 4f, -r * 0.6f), Offset(-r * 0.9f + sh * r * 4f, r * 0.2f), 2f, StrokeCap.Round)
    }
}

/** Table/desk top; origin at the centre of the table surface. */
class Table(val w: Float = 140f, val color: Color = Pal.Wood) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 46f, w * 1.05f, 12f, 0.3f)
        drawRect(color.darken(0.35f), Offset(-w / 2f + 10f, 4f), Size(7f, 42f))
        drawRect(color.darken(0.35f), Offset(w / 2f - 17f, 4f), Size(7f, 42f))
        drawRoundRect(shade(color, -4f, 8f), Offset(-w / 2f, -4f), Size(w, 10f), CornerRadius(3f))
        drawRect(color.lighten(0.25f), Offset(-w / 2f + 2f, -4f), Size(w - 4f, 1.5f))
    }
}

/** A raised slab/plinth with a label on its front face. */
class Platform(val w: Float = 160f, val color: Color = Pal.Mint, val text: String = "", val depth: Float = 18f) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, depth + 4f, w * 1.1f, 14f, 0.35f)
        val top = Path().apply { moveTo(-w / 2f, 0f); lineTo(-w / 2f + 12f, -10f); lineTo(w / 2f + 12f, -10f); lineTo(w / 2f, 0f); close() }
        drawPath(top, color.lighten(0.25f))
        drawRect(shade(color, 0f, depth, 0.05f, 0.3f), Offset(-w / 2f, 0f), Size(w, depth))
        val side = Path().apply { moveTo(w / 2f, 0f); lineTo(w / 2f + 12f, -10f); lineTo(w / 2f + 12f, depth - 10f); lineTo(w / 2f, depth); close() }
        drawPath(side, color.darken(0.35f))
        if (text.isNotEmpty()) label(s.m, text, 0f, depth / 2f, 11f, Pal.Ink, 800, letterSpacing = 1f)
    }
}

/** Dial with a needle; key "v" from -1 (left) to 1 (right). Zones: cool, sweet spot, hot. */
class Gauge(val r: Float = 60f, val labels: List<String> = listOf("boring", "just right", "too hard")) : Prop() {
    override val defaults = mapOf("v" to -1f)
    override fun DrawScope.render(s: PropState) {
        val zones = listOf(Pal.Sky to 60f, Pal.Mint to 60f, Pal.Coral to 60f)
        var start = 180f
        for ((c, sweep) in zones) {
            drawArc(c, start + 2f, sweep - 4f, false, Offset(-r, -r), Size(2 * r, 2 * r), style = Stroke(16f))
            start += sweep
        }
        labels.forEachIndexed { i, l ->
            val ang = Math.toRadians((210.0 + i * 60.0)).toFloat()
            label(s.m, l, cos(ang) * (r + 24f), sin(ang) * (r + 24f), 10f, Pal.White, 700)
        }
        val ang = Math.toRadians(270.0 + s["v"] * 80.0).toFloat()
        val tip = Offset(cos(ang) * (r - 8f), sin(ang) * (r - 8f))
        drawLine(Pal.White, Offset.Zero, tip, 4f, StrokeCap.Round)
        drawCircle(Pal.White, 7f, Offset.Zero)
        drawCircle(Pal.Ink, 3f, Offset.Zero)
    }
}

class Magnifier(val color: Color = Pal.Steel) : Prop() {
    override fun DrawScope.render(s: PropState) {
        rotate(-35f, Offset.Zero) { drawRoundRect(shade(Pal.Wood, 16f, 50f), Offset(-4f, 16f), Size(8f, 34f), CornerRadius(4f)) }
        drawCircle(Color(0xFFBFE4FF).a(0.25f), 17f, Offset.Zero)
        drawCircle(color, 17f, Offset.Zero, style = Stroke(5f))
        drawArc(Color.White.a(0.7f), 200f, 60f, false, Offset(-12f, -12f), Size(24f, 24f), style = roundStroke(2.5f))
    }
}

// =====================================================================================================
// Icons
// =====================================================================================================

class Bell(val color: Color = Pal.Gold) : Prop() {
    override val defaults = mapOf("ring" to 0f)
    override fun DrawScope.render(s: PropState) {
        val ring = s["ring"]
        rotate(sin(s.t * 16f) * 18f * ring, Offset(0f, -22f)) {
            val p = Path().apply {
                moveTo(-20f, 12f); cubicTo(-14f, 6f, -16f, -20f, 0f, -20f); cubicTo(16f, -20f, 14f, 6f, 20f, 12f); close()
            }
            drawPath(p, shade(color, -20f, 12f, 0.3f, 0.2f))
            drawRoundRect(color.darken(0.15f), Offset(-22f, 10f), Size(44f, 6f), CornerRadius(3f))
            drawCircle(color.darken(0.3f), 5f, Offset(sin(s.t * 16f) * 4f * ring, 18f))
            drawCircle(color.darken(0.2f), 3.5f, Offset(0f, -22f))
        }
        if (ring > 0.05f) for (k in 1..2) {
            val a = ring * (0.7f - 0.25f * k)
            drawArc(color.a(a), -50f, 60f, false, Offset(-14f - k * 9f, -18f - k * 7f), Size(28f + k * 18f, 28f + k * 14f), style = roundStroke(2.2f))
            drawArc(color.a(a), 170f, 60f, false, Offset(-14f - k * 9f, -18f - k * 7f), Size(28f + k * 18f, 28f + k * 14f), style = roundStroke(2.2f))
        }
    }
}

class Heart(val color: Color = Pal.Coral) : Prop() {
    override val defaults = mapOf("beat" to 0.5f)
    override fun DrawScope.render(s: PropState) {
        val b = 1f + 0.12f * s["beat"] * max(0f, sin(s.t * 7f)).let { it * it }
        withTransform({ scale(b, b, Offset.Zero) }) {
            val p = Path().apply {
                moveTo(0f, 16f)
                cubicTo(-26f, -2f, -18f, -26f, 0f, -12f)
                cubicTo(18f, -26f, 26f, -2f, 0f, 16f)
                close()
            }
            glow(color, Offset.Zero, 34f, 0.35f)
            drawPath(p, shade(color, -20f, 16f, 0.3f, 0.2f))
            drawCircle(Color.White.a(0.5f), 3.5f, Offset(-9f, -9f))
        }
    }
}

class Star(val color: Color = Pal.Gold, val r: Float = 14f) : Prop() {
    override fun DrawScope.render(s: PropState) {
        val p = Path()
        for (k in 0 until 10) {
            val rr = if (k % 2 == 0) r else r * 0.45f
            val a = -TAU / 4f + k * TAU / 10f
            val o = polar(Offset.Zero, rr, a)
            if (k == 0) p.moveTo(o.x, o.y) else p.lineTo(o.x, o.y)
        }
        p.close()
        glow(color, Offset.Zero, r * 2.4f, 0.35f + 0.15f * sin(s.t * 3f))
        drawPath(p, shade(color, -r, r, 0.35f, 0.2f))
    }
}

class Trophy(val color: Color = Pal.Gold) : Prop() {
    override fun DrawScope.render(s: PropState) {
        softShadow(0f, 30f, 46f, 8f)
        glow(color, Offset(0f, -8f), 50f, 0.3f)
        drawArc(color.darken(0.15f), 90f, 180f, false, Offset(-30f, -22f), Size(22f, 22f), style = Stroke(5f))
        drawArc(color.darken(0.15f), -90f, 180f, false, Offset(8f, -22f), Size(22f, 22f), style = Stroke(5f))
        val cup = Path().apply { moveTo(-20f, -26f); lineTo(20f, -26f); cubicTo(20f, 2f, 8f, 8f, 0f, 8f); cubicTo(-8f, 8f, -20f, 2f, -20f, -26f); close() }
        drawPath(cup, shade(color, -26f, 8f, 0.35f, 0.2f))
        drawRect(color.darken(0.2f), Offset(-4f, 8f), Size(8f, 12f))
        drawRoundRect(shade(Pal.Wood, 18f, 30f), Offset(-16f, 18f), Size(32f, 11f), CornerRadius(3f))
        val sh = frac(s.t * 0.35f)
        if (sh < 0.3f) drawLine(Color.White.a(0.75f), Offset(-14f + sh * 90f, -24f), Offset(-20f + sh * 90f, 0f), 3f, StrokeCap.Round)
    }
}

class Bulb(val color: Color = Pal.Gold) : Prop() {
    override val defaults = mapOf("on" to 1f)
    override fun DrawScope.render(s: PropState) {
        val on = s["on"]
        if (on > 0f) {
            glow(color, Offset(0f, -6f), 60f, 0.55f * on)
            for (k in 0 until 8) {
                val a = k * TAU / 8f + s.t * 0.3f
                drawLine(color.a(0.7f * on), polar(Offset(0f, -6f), 30f, a), polar(Offset(0f, -6f), 38f + 3f * sin(s.t * 4f + k), a), 2.5f, StrokeCap.Round)
            }
        }
        drawCircle(Brush.radialGradient(listOf(lerp(Color(0xFFDDE3EA), Color(0xFFFFF6C8), on), lerp(Color(0xFFAEB7C2), color, on)), Offset(-6f, -14f), 30f), 20f, Offset(0f, -6f))
        drawRoundRect(Pal.Steel, Offset(-9f, 12f), Size(18f, 14f), CornerRadius(3f))
        for (k in 0..2) drawLine(Pal.Slate, Offset(-9f, 15f + k * 4f), Offset(9f, 15f + k * 4f), 1.4f)
        drawCircle(Color.White.a(0.6f), 4f, Offset(-8f, -14f))
    }
}

class Brain(val color: Color = Pal.Rose) : Prop() {
    override val defaults = mapOf("glow" to 0f)
    override fun DrawScope.render(s: PropState) {
        val g = s["glow"]
        if (g > 0f) {
            glow(Pal.Gold, Offset.Zero, 70f, 0.55f * g)
            for (k in 0 until 6) {
                val a = k * TAU / 6f + s.t * 0.8f
                drawCircle(Pal.Gold.a(g * (0.5f + 0.5f * sin(s.t * 5f + k))), 2.6f, polar(Offset.Zero, 42f + 4f * sin(s.t * 3f + k), a))
            }
        }
        val lobes = listOf(Offset(-14f, -8f) to 17f, Offset(10f, -12f) to 18f, Offset(-16f, 8f) to 14f, Offset(12f, 8f) to 15f, Offset(0f, -2f) to 16f)
        for ((c, r) in lobes) drawCircle(shade(color, c.y - r, c.y + r, 0.25f, 0.15f), r, c)
        val sq = color.darken(0.3f)
        drawLine(sq, Offset(0f, -26f), Offset(0f, 20f), 2f, StrokeCap.Round)
        val squig = listOf(Path().apply { moveTo(-22f, -10f); quadraticTo(-14f, -16f, -8f, -8f); quadraticTo(-4f, -2f, -12f, 2f) },
            Path().apply { moveTo(20f, -14f); quadraticTo(12f, -6f, 18f, 0f); quadraticTo(22f, 6f, 12f, 10f) },
            Path().apply { moveTo(-22f, 12f); quadraticTo(-12f, 8f, -8f, 16f) })
        for (q in squig) drawPath(q, sq, style = roundStroke(2f))
        drawRoundRect(color.darken(0.25f), Offset(-4f, 18f), Size(8f, 12f), CornerRadius(3f))
    }
}

class Gift(val color: Color = Pal.Coral, val ribbon: Color = Pal.Gold) : Prop() {
    override val defaults = mapOf("open" to 0f)
    override fun DrawScope.render(s: PropState) {
        val open = s["open"]
        softShadow(0f, 22f, 60f, 10f)
        if (open > 0.1f) {
            glow(Pal.Gold, Offset(0f, -8f), 60f * open, 0.7f * open)
            for (k in 0 until 7) {
                val a = -TAU / 4f + (k - 3) * 0.32f
                drawLine(Pal.Gold.a(0.6f * open), polar(Offset(0f, -6f), 18f, a), polar(Offset(0f, -6f), 18f + 34f * open, a), 3f, StrokeCap.Round)
            }
        }
        drawRoundRect(shade(color, -8f, 22f), Offset(-22f, -8f), Size(44f, 30f), CornerRadius(3f))
        drawRect(ribbon, Offset(-4f, -8f), Size(8f, 30f))
        withTransform({ rotate(-30f * open, Offset(-24f, -8f)); translate(0f, -14f * open) }) {
            drawRoundRect(shade(color.lighten(0.08f), -18f, -6f), Offset(-25f, -18f), Size(50f, 11f), CornerRadius(3f))
            drawRect(ribbon, Offset(-4f, -18f), Size(8f, 11f))
            drawOval(ribbon, Offset(-15f, -27f), Size(14f, 10f), style = Stroke(3.5f))
            drawOval(ribbon, Offset(1f, -27f), Size(14f, 10f), style = Stroke(3.5f))
        }
    }
}

/** Round badge with a tick (good) or cross; key "p" draws the mark on. */
class Mark(val good: Boolean, val r: Float = 14f) : Prop() {
    override val defaults = mapOf("p" to 1f)
    override fun DrawScope.render(s: PropState) {
        val c = if (good) Pal.Leaf else Pal.Coral
        glow(c, Offset.Zero, r * 2.2f, 0.35f)
        drawCircle(shade(c, -r, r, 0.25f, 0.15f), r, Offset.Zero)
        val p = s["p"]
        if (good) {
            val path = Path().apply { moveTo(-r * 0.45f, 0f); lineTo(-r * 0.1f, r * 0.35f); lineTo(r * 0.5f, -r * 0.35f) }
            drawPath(path, Color.White, style = Stroke(r * 0.22f, cap = StrokeCap.Round, join = StrokeJoin.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(r * 2f * p + 0.01f, 1000f))))
        } else {
            val k = r * 0.38f
            drawLine(Color.White, Offset(-k, -k), Offset(-k + 2 * k * min(1f, p * 2f), -k + 2 * k * min(1f, p * 2f)), r * 0.22f, StrokeCap.Round)
            if (p > 0.5f) drawLine(Color.White, Offset(k, -k), Offset(k - 2 * k * (p - 0.5f) * 2f, -k + 2 * k * (p - 0.5f) * 2f), r * 0.22f, StrokeCap.Round)
        }
    }
}

// =====================================================================================================
// Effects
// =====================================================================================================

/** Confetti burst from the origin; key "p" runs the burst 0→1. */
class Confetti(val colors: List<Color> = listOf(Pal.Gold, Pal.Mint, Pal.Coral, Pal.Sky, Pal.Violet), val count: Int = 46, val power: Float = 120f) : Prop() {
    override val defaults = mapOf("p" to 0f)
    override fun DrawScope.render(s: PropState) {
        val p = s["p"]
        if (p <= 0f || p >= 1f) return
        for (i in 0 until count) {
            val ang = -TAU / 4f + (hash01(i, 1) - 0.5f) * 2.6f
            val v = power * (0.45f + 0.55f * hash01(i, 2))
            val x = cos(ang) * v * p
            val y = sin(ang) * v * p + 160f * p * p
            val rot = (hash01(i, 3) * 360f + p * 720f)
            rotate(rot, Offset(x, y)) {
                drawRect(colors[i % colors.size].a(1f - p * p), Offset(x - 3f, y - 1.6f), Size(6f, 3.2f))
            }
        }
    }
}

/** Gentle twinkles around the origin within [radius]. */
class Sparkles(val color: Color = Pal.Gold, val radius: Float = 40f, val count: Int = 10) : Prop() {
    override fun DrawScope.render(s: PropState) {
        for (i in 0 until count) {
            val ph = frac(s.t * (0.4f + 0.4f * hash01(i, 1)) + hash01(i, 2))
            val a = sin(ph * TAU / 2f)
            if (a <= 0.02f) continue
            val c = polar(Offset.Zero, radius * (0.4f + 0.6f * hash01(i, 3)), hash01(i, 4) * TAU)
            val r = 2.5f + 4.5f * a
            glow(color, c, r * 2.6f, 0.45f * a)
            val star = Path().apply {
                moveTo(c.x, c.y - r); quadraticTo(c.x, c.y, c.x + r, c.y)
                quadraticTo(c.x, c.y, c.x, c.y + r); quadraticTo(c.x, c.y, c.x - r, c.y)
                quadraticTo(c.x, c.y, c.x, c.y - r); close()
            }
            drawPath(star, color.lighten(0.4f).a(a))
        }
    }
}

/** Falling drops from the origin; key "rate" 0..1. */
class Drips(val color: Color = Pal.Sky, val spread: Float = 30f) : Prop() {
    override val defaults = mapOf("rate" to 1f)
    override fun DrawScope.render(s: PropState) {
        val rate = s["rate"]
        if (rate <= 0f) return
        for (i in 0 until 6) {
            val ph = frac(s.t * 0.9f + hash01(i, 1))
            val x = (hash01(i, 2) - 0.5f) * spread
            val y = ph * ph * 40f
            val path = Path().apply {
                moveTo(x, y - 5f); quadraticTo(x + 3.5f, y + 1f, x, y + 3f); quadraticTo(x - 3.5f, y + 1f, x, y - 5f); close()
            }
            drawPath(path, color.a(rate * (1f - ph * 0.6f)))
        }
    }
}

/** Rising wisps of steam; key "on". */
class Steam(val color: Color = Color.White) : Prop() {
    override val defaults = mapOf("on" to 1f)
    override fun DrawScope.render(s: PropState) {
        val on = s["on"]
        for (i in 0 until 3) {
            val ph = frac(s.t * 0.45f + i / 3f)
            val path = Path()
            for (k in 0..10) {
                val y = -k * 3.2f - ph * 14f
                val x = (i - 1) * 7f + sin(k * 0.7f + s.t * 2.2f + i) * 3.5f
                if (k == 0) path.moveTo(x, y) else path.lineTo(x, y)
            }
            drawPath(path, color.a(0.45f * on * sin(ph * TAU / 2f)), style = roundStroke(2.4f))
        }
    }
}
