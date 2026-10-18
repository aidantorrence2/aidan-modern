package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.sp
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.sin

/*
 * Shared illustration style: flat shapes with soft vertical shading, a light rim on top, soft contact shadows,
 * and a small warm/cool palette so every prop looks like it belongs to the same world.
 */
object Pal {
    val Ink = Color(0xFF15131F)
    val Paper = Color(0xFFF6F1E7)
    val White = Color(0xFFF7F5F0)
    val Mint = Color(0xFF4FD1A5)
    val Gold = Color(0xFFF4B942)
    val Coral = Color(0xFFFF6B6B)
    val Sky = Color(0xFF63B3FF)
    val Violet = Color(0xFFA48BFA)
    val Peach = Color(0xFFFFB38A)
    val Leaf = Color(0xFF6CCB7E)
    val Slate = Color(0xFF8B91A8)
    val Wood = Color(0xFFB07A4F)
    val Steel = Color(0xFFB9C2D0)
    val Navy = Color(0xFF263A6B)
    val Rose = Color(0xFFF28DB2)
    val Skin = listOf(Color(0xFFF3CBA5), Color(0xFFDDA67E), Color(0xFFB07650), Color(0xFF6F4A33))
    val Hair = listOf(Color(0xFF2B1D16), Color(0xFF5A3A24), Color(0xFFC9893F), Color(0xFF1C1C24), Color(0xFF9C9C9C))
}

fun Color.lighten(f: Float): Color = lerp(this, Color.White, f)
fun Color.darken(f: Float): Color = lerp(this, Color.Black, f)
fun Color.a(alpha: Float): Color = copy(alpha = (this.alpha * alpha).coerceIn(0f, 1f))

/** Vertical shading for a shape spanning [top]..[bottom]. */
fun shade(base: Color, top: Float, bottom: Float, light: Float = 0.22f, dark: Float = 0.18f): Brush =
    Brush.verticalGradient(listOf(base.lighten(light), base, base.darken(dark)), top, bottom)

fun DrawScope.softShadow(cx: Float, cy: Float, w: Float, h: Float = w * 0.22f, alpha: Float = 0.38f) {
    if (w <= 0f) return
    withTransform({ scale(1f, h / w, Offset(cx, cy)) }) {
        drawCircle(Brush.radialGradient(listOf(Color.Black.copy(alpha = alpha), Color.Transparent), Offset(cx, cy), w / 2f), w / 2f, Offset(cx, cy))
    }
}

fun DrawScope.glow(color: Color, c: Offset, r: Float, alpha: Float = 0.5f) {
    if (r <= 0.5f || alpha <= 0.01f) return
    drawCircle(Brush.radialGradient(listOf(color.a(alpha), Color.Transparent), c, r), r, c)
}

fun DrawScope.rrect(cx: Float, cy: Float, w: Float, h: Float, r: Float, brush: Brush) =
    drawRoundRect(brush, Offset(cx - w / 2f, cy - h / 2f), Size(w, h), CornerRadius(r, r))

fun DrawScope.rrect(cx: Float, cy: Float, w: Float, h: Float, r: Float, color: Color) =
    drawRoundRect(color, Offset(cx - w / 2f, cy - h / 2f), Size(w, h), CornerRadius(r, r))

fun DrawScope.rrectStroke(cx: Float, cy: Float, w: Float, h: Float, r: Float, color: Color, width: Float) =
    drawRoundRect(color, Offset(cx - w / 2f, cy - h / 2f), Size(w, h), CornerRadius(r, r), style = Stroke(width))

/** A shaded panel/card with a top highlight and a soft drop shadow. */
fun DrawScope.card(cx: Float, cy: Float, w: Float, h: Float, base: Color, r: Float = 10f, shadow: Boolean = true) {
    if (shadow) drawRoundRect(Color.Black.copy(alpha = 0.28f), Offset(cx - w / 2f + 2f, cy - h / 2f + 5f), Size(w, h), CornerRadius(r, r))
    rrect(cx, cy, w, h, r, shade(base, cy - h / 2f, cy + h / 2f, 0.12f, 0.12f))
    drawRoundRect(Color.White.copy(alpha = 0.18f), Offset(cx - w / 2f + 1f, cy - h / 2f + 1f), Size(w - 2f, h - 2f), CornerRadius(r, r), style = Stroke(1.2f))
}

enum class Align { START, CENTER, END }

/** Text centred vertically on [y]; optional rounded chip behind it. */
fun DrawScope.label(
    m: TextMeasurer, text: String, x: Float, y: Float, size: Float, color: Color = Pal.White,
    weight: Int = 500, align: Align = Align.CENTER, maxWidth: Float = 360f, italic: Boolean = false,
    chip: Color? = null, letterSpacing: Float = 0f, shadow: Boolean = false, alpha: Float = 1f,
) {
    if (text.isEmpty() || alpha <= 0.01f) return
    val layout = m.measure(
        text,
        style = TextStyle(
            color = color,
            fontSize = size.toSp(),
            lineHeight = (size * 1.22f).toSp(),
            fontWeight = FontWeight(weight),
            fontStyle = if (italic) FontStyle.Italic else FontStyle.Normal,
            letterSpacing = if (letterSpacing != 0f) letterSpacing.toSp() else 0.sp,
            textAlign = when (align) { Align.START -> TextAlign.Start; Align.CENTER -> TextAlign.Center; Align.END -> TextAlign.End },
        ),
        constraints = Constraints(maxWidth = max(1, maxWidth.toInt())),
    )
    val w = layout.size.width.toFloat()
    val h = layout.size.height.toFloat()
    val left = when (align) { Align.START -> x; Align.CENTER -> x - w / 2f; Align.END -> x - w }
    val top = y - h / 2f
    if (chip != null) {
        val px = size * 0.6f
        val py = size * 0.32f
        drawRoundRect(chip.a(alpha), Offset(left - px, top - py), Size(w + 2 * px, h + 2 * py), CornerRadius((h + 2 * py) / 2f))
    }
    if (shadow) drawText(layout, color = Color.Black.copy(alpha = 0.55f), topLeft = Offset(left + 0.8f, top + 1.4f), alpha = alpha)
    drawText(layout, topLeft = Offset(left, top), alpha = alpha.coerceIn(0f, 1f))
}

fun hash01(i: Int, salt: Int = 0): Float {
    var x = i * 374761393 + salt * 668265263 + 1442695041
    x = (x xor (x ushr 13)) * 1274126177
    x = x xor (x ushr 16)
    return (x and 0x7fffffff) / 2147483648f
}

fun frac(x: Float): Float = x - floor(x)
val TAU = (2 * PI).toFloat()

/** Rounded line from a to b. */
fun DrawScope.limb(a: Offset, b: Offset, color: Color, width: Float) = drawLine(color, a, b, width, StrokeCap.Round)

fun polar(c: Offset, r: Float, ang: Float) = Offset(c.x + cos(ang) * r, c.y + sin(ang) * r)

// ---- backdrops ------------------------------------------------------------------------------------------

/** Full-bleed environment behind a scene. [view] is the visible area in stage units (may exceed 400 x 300). */
abstract class Backdrop {
    abstract fun DrawScope.paint(view: Rect, t: Float)
}

private fun DrawScope.vignette(view: Rect, strength: Float = 0.55f) {
    val c = view.center
    drawRect(
        Brush.radialGradient(listOf(Color.Transparent, Color.Black.copy(alpha = strength)), c, max(view.width, view.height) * 0.75f),
        view.topLeft, view.size,
    )
}

object Backdrops {
    /** Deep blue spotlight stage: the default for abstract ideas. */
    val Studio = studio(Color(0xFF232845))
    fun studio(tint: Color): Backdrop = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(tint.darken(0.35f), tint.darken(0.7f)), view.top, view.bottom), view.topLeft, view.size)
            glow(tint.lighten(0.35f), Offset(200f, 120f), 260f, 0.45f)
            // floor
            drawRect(Brush.verticalGradient(listOf(tint.darken(0.45f), tint.darken(0.8f)), 238f, view.bottom), Offset(view.left, 238f), Size(view.width, view.bottom - 238f))
            drawLine(tint.lighten(0.25f).a(0.35f), Offset(view.left, 238f), Offset(view.right, 238f), 1.2f)
            withTransform({ scale(1f, 0.18f, Offset(200f, 250f)) }) {
                drawCircle(Brush.radialGradient(listOf(Color.White.copy(alpha = 0.13f), Color.Transparent), Offset(200f, 250f), 190f), 190f, Offset(200f, 250f))
            }
            vignette(view)
        }
    }

    /** A cosy room: wall, window light, wooden floor. */
    fun room(wall: Color = Color(0xFF3C4C6E), floor: Color = Color(0xFF6B4A35)): Backdrop = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(wall.lighten(0.06f), wall.darken(0.3f)), view.top, 236f), view.topLeft, Size(view.width, 236f - view.top))
            // window with light shaft
            rrect(70f, 92f, 74f, 84f, 5f, wall.darken(0.35f))
            rrect(70f, 92f, 64f, 74f, 3f, Brush.verticalGradient(listOf(Color(0xFF9FD4FF), Color(0xFFFFE2B0)), 55f, 129f))
            drawLine(wall.darken(0.35f), Offset(70f, 55f), Offset(70f, 129f), 3f)
            drawLine(wall.darken(0.35f), Offset(38f, 92f), Offset(102f, 92f), 3f)
            val shaft = Path().apply { moveTo(38f, 129f); lineTo(102f, 129f); lineTo(190f, 300f); lineTo(60f, 300f); close() }
            drawPath(shaft, Brush.verticalGradient(listOf(Color(0xFFFFE9C2).a(0.16f), Color.Transparent), 129f, 300f))
            // floor boards
            drawRect(Brush.verticalGradient(listOf(floor, floor.darken(0.45f)), 236f, view.bottom), Offset(view.left, 236f), Size(view.width, view.bottom - 236f))
            for (k in 0..8) drawLine(floor.darken(0.3f).a(0.5f), Offset(view.left + k * 52f, 236f), Offset(view.left + k * 52f - 30f, view.bottom), 1f)
            drawRect(wall.darken(0.5f), Offset(view.left, 232f), Size(view.width, 5f))
            vignette(view, 0.45f)
        }
    }

    /** Starry night with a moon. */
    val Night = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF0B1030), Color(0xFF1E2A5A), Color(0xFF3A3466)), view.top, view.bottom), view.topLeft, view.size)
            for (i in 0 until 70) {
                val x = view.left + hash01(i, 1) * view.width
                val y = view.top + hash01(i, 2) * view.height * 0.75f
                val tw = 0.35f + 0.65f * (0.5f + 0.5f * sin(t * (0.8f + 2f * hash01(i, 3)) + i))
                drawCircle(Color.White.copy(alpha = 0.7f * tw), 0.6f + 1.1f * hash01(i, 4), Offset(x, y))
            }
            glow(Color(0xFFFFF4D6), Offset(330f, 60f), 70f, 0.35f)
            drawCircle(Color(0xFFFFF4D6), 17f, Offset(330f, 60f))
            drawCircle(Color(0xFF0B1030).a(0.9f), 15f, Offset(338f, 55f))
            vignette(view, 0.4f)
        }
    }

    /** Warm evening sky over rolling hills. */
    val Dusk = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF2B2353), Color(0xFF7A4A86), Color(0xFFF08A6A), Color(0xFFFFC98B)), view.top, 250f), view.topLeft, Size(view.width, 250f - view.top))
            glow(Color(0xFFFFE0A3), Offset(300f, 210f), 150f, 0.7f)
            drawCircle(Color(0xFFFFE7B8), 26f, Offset(300f, 214f))
            hills(view, 222f, Color(0xFF4B3264), 0.012f, 18f, t * 0.0f)
            hills(view, 244f, Color(0xFF2E2147), 0.02f, 12f, 2f)
            drawRect(Color(0xFF221836), Offset(view.left, 262f), Size(view.width, view.bottom - 262f))
            vignette(view, 0.4f)
        }
    }

    /** Bright day sky, drifting clouds, green ground. */
    val Day = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF3F8EDB), Color(0xFF8FC8F5), Color(0xFFCFE8F7)), view.top, 236f), view.topLeft, Size(view.width, 236f - view.top))
            for (i in 0 until 4) {
                val x = view.left + frac(hash01(i, 5) + t * 0.006f * (1 + i % 2)) * (view.width + 120f) - 60f
                cloud(Offset(x, 40f + 34f * i % 90f), 0.7f + 0.4f * hash01(i, 6))
            }
            hills(view, 226f, Color(0xFF5DB36B), 0.015f, 10f, 0f)
            drawRect(Brush.verticalGradient(listOf(Color(0xFF4FA25E), Color(0xFF2F6B3B)), 236f, view.bottom), Offset(view.left, 236f), Size(view.width, view.bottom - 236f))
            vignette(view, 0.3f)
        }
    }

    /** Dark warm paper with a faint grid: for charts and thinking. */
    val Paper = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF2A2622), Color(0xFF1A1714)), view.top, view.bottom), view.topLeft, view.size)
            var x = floor(view.left / 20f) * 20f
            while (x < view.right) { drawLine(Color.White.copy(alpha = 0.035f), Offset(x, view.top), Offset(x, view.bottom), 1f); x += 20f }
            var y = floor(view.top / 20f) * 20f
            while (y < view.bottom) { drawLine(Color.White.copy(alpha = 0.035f), Offset(view.left, y), Offset(view.right, y), 1f); y += 20f }
            glow(Color(0xFFFFD9A0), Offset(200f, 140f), 240f, 0.10f)
            vignette(view, 0.5f)
        }
    }

    /** Fields and farmland under a soft sky. */
    val Field = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF6AA6D8), Color(0xFFF6D9A0)), view.top, 220f), view.topLeft, Size(view.width, 220f - view.top))
            glow(Color(0xFFFFF0C0), Offset(90f, 150f), 120f, 0.6f)
            hills(view, 205f, Color(0xFF8DA65A), 0.018f, 14f, 1f)
            drawRect(Brush.verticalGradient(listOf(Color(0xFFD9B45A), Color(0xFF9C7A33)), 222f, view.bottom), Offset(view.left, 222f), Size(view.width, view.bottom - 222f))
            for (k in 0 until 14) drawLine(Color(0xFF7D6128).a(0.45f), Offset(view.left + k * 34f, 222f), Offset(200f + (view.left + k * 34f - 200f) * 2.2f, view.bottom), 1.2f)
            vignette(view, 0.35f)
        }
    }

    /** City skyline at night: offices, institutions, crowds. */
    val City = object : Backdrop() {
        override fun DrawScope.paint(view: Rect, t: Float) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF141A33), Color(0xFF2C3A66)), view.top, 240f), view.topLeft, Size(view.width, 240f - view.top))
            for (i in 0 until 14) {
                val w = 22f + 26f * hash01(i, 1)
                val h = 50f + 110f * hash01(i, 2)
                val x = view.left + i * (view.width / 13f)
                drawRect(Color(0xFF1B2242), Offset(x, 240f - h), Size(w, h))
                for (wy in 0 until (h / 12f).toInt()) for (wx in 0 until (w / 9f).toInt()) {
                    if (hash01(i * 97 + wy * 13 + wx, 3) > 0.55f) drawRect(Color(0xFFFFD98A).a(0.55f), Offset(x + 3f + wx * 8f, 240f - h + 5f + wy * 12f), Size(4f, 5f))
                }
            }
            drawRect(Brush.verticalGradient(listOf(Color(0xFF2A2F44), Color(0xFF14161F)), 240f, view.bottom), Offset(view.left, 240f), Size(view.width, view.bottom - 240f))
            vignette(view, 0.45f)
        }
    }

    private fun DrawScope.hills(view: Rect, base: Float, color: Color, freq: Float, amp: Float, phase: Float) {
        val p = Path().apply {
            moveTo(view.left, view.bottom)
            var x = view.left
            while (x <= view.right + 8f) { lineTo(x, base - amp * (0.5f + 0.5f * sin(x * freq + phase)) ); x += 8f }
            lineTo(view.right, view.bottom); close()
        }
        drawPath(p, color)
    }

    fun DrawScope.cloud(c: Offset, s: Float) {
        val col = Color.White.copy(alpha = 0.85f)
        drawCircle(col, 13f * s, Offset(c.x - 14f * s, c.y + 3f * s))
        drawCircle(col, 18f * s, Offset(c.x, c.y - 3f * s))
        drawCircle(col, 12f * s, Offset(c.x + 16f * s, c.y + 4f * s))
        drawRoundRect(col, Offset(c.x - 26f * s, c.y + 2f * s), Size(54f * s, 13f * s), CornerRadius(7f * s))
    }
}

/** Stroke with round caps, used by many props. */
fun roundStroke(w: Float) = Stroke(w, cap = StrokeCap.Round)
