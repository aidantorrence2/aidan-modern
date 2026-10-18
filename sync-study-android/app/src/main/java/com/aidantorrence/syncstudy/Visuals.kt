package com.aidantorrence.syncstudy

import android.provider.Settings
import androidx.compose.animation.core.withInfiniteAnimationFrameNanos
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.platform.LocalContext
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Looping generative artwork for each title, drawn in code so it costs nothing to ship and scales to any size,
 * from a 44dp thumbnail to a full-screen backdrop. Each scene is a pure function of time.
 */
enum class VisualStyle {
    CONNECTIONS,  // How to Win Friends: people drifting, links forming between them
    COMPOUND,     // Atomic Habits: a spiral of dots that grows exponentially, 1% at a time
    TWO_SYSTEMS,  // Thinking, Fast and Slow: fast streaks above a slow, deliberate wave
    STAR_TRAILS,  // Sapiens: a turning night sky over a campfire
    CIRCLES,      // 7 Habits: a circle of influence, seven habits in orbit, ripples outward
    DEPTH,        // Deep Work: descending layers of water, light from above
    LOOP,         // The Power of Habit: cue, routine, reward lit by a comet going round
    FLAME,        // Man's Search for Meaning: one light in the dark
    GROWTH,       // Mindset: a branching tree that grows, sways, and grows again
    OUTLIERS,     // Outliers: a quiet field of dots with a few that shine
    AURORA,       // Your own text: soft drifting color
}

class BookArt(val style: VisualStyle, val color: Long)

val CUSTOM_ART = BookArt(VisualStyle.AURORA, 0xFFE9B949)

fun artFor(bookId: String): BookArt = findBook(bookId)?.let { BookArt(it.visual, it.color) } ?: CUSTOM_ART

/** Visual tempo while narration plays: the art moves faster as you read faster, but never frantically. */
fun visualTempo(speed: Float): Float = 0.55f + 0.45f * speed
const val IDLE_TEMPO = 0.3f
const val LIBRARY_TEMPO = 0.6f

/** Set to false to hold every scene still (screenshot tests, or a future "still artwork" setting). */
val LocalVisualMotion = staticCompositionLocalOf { true }

/** A frame of every scene that reads well as a still, used when system animations are turned off. */
private const val STILL_TIME = 9f

/**
 * Time source for the artwork. Advances once per frame at [rate] (smoothly changeable) and freezes on a
 * flattering frame when the user has turned off system animations. Uses the infinite-animation frame clock
 * so the system and tests can suspend it.
 */
@Composable
fun rememberVisualClock(rate: Float): State<Float> {
    val time = remember { mutableFloatStateOf(STILL_TIME) }
    val currentRate by rememberUpdatedState(rate)
    val context = LocalContext.current
    val allowed = LocalVisualMotion.current
    val motion = remember(context, allowed) {
        allowed && runCatching {
            Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)
        }.getOrDefault(1f) > 0f
    }
    LaunchedEffect(motion) {
        if (!motion) return@LaunchedEffect
        var last = withInfiniteAnimationFrameNanos { it }
        while (true) {
            withInfiniteAnimationFrameNanos { now ->
                // Clamp so a long pause (app in background) does not jump the scene.
                val dt = ((now - last) / 1_000_000_000f).coerceIn(0f, 0.1f)
                time.floatValue += dt * currentRate
                last = now
            }
        }
    }
    return time
}

/** Draws [art] at the clock's current time. Reads the clock only in the draw phase, so it never recomposes. */
@Composable
fun BookVisual(art: BookArt, time: State<Float>, modifier: Modifier = Modifier) {
    val palette = remember(art.color) { VisualPalette.from(Color(art.color)) }
    Canvas(modifier.clipToBounds()) {
        drawVisual(art.style, palette, time.value)
    }
}

class VisualPalette(val base: Color, val light: Color, val glow: Color, val deep: Color, val night: Color) {
    companion object {
        fun from(base: Color) = VisualPalette(
            base = base,
            light = lerp(base, Color.White, 0.45f),
            glow = lerp(base, Color.White, 0.78f),
            deep = lerp(base, Color.Black, 0.6f),
            night = lerp(base, Color.Black, 0.88f),
        )
    }
}

fun DrawScope.drawVisual(style: VisualStyle, p: VisualPalette, t: Float) {
    if (size.width <= 0f || size.height <= 0f) return
    when (style) {
        VisualStyle.CONNECTIONS -> connections(p, t)
        VisualStyle.COMPOUND -> compound(p, t)
        VisualStyle.TWO_SYSTEMS -> twoSystems(p, t)
        VisualStyle.STAR_TRAILS -> starTrails(p, t)
        VisualStyle.CIRCLES -> circles(p, t)
        VisualStyle.DEPTH -> depth(p, t)
        VisualStyle.LOOP -> loop(p, t)
        VisualStyle.FLAME -> flame(p, t)
        VisualStyle.GROWTH -> growth(p, t)
        VisualStyle.OUTLIERS -> outliers(p, t)
        VisualStyle.AURORA -> aurora(p, t)
    }
}

// ---- helpers -------------------------------------------------------------------------------------


/** Deterministic pseudo-random in [0, 1) so every scene is stable frame to frame without storing state. */
internal fun rnd(i: Int, salt: Int = 0): Float {
    var x = i * 374761393 + salt * 668265263 + 1442695041
    x = (x xor (x ushr 13)) * 1274126177
    x = x xor (x ushr 16)
    return (x and 0x7fffffff) / 2147483648f
}


private val DrawScope.m: Float get() = min(size.width, size.height)

private fun DrawScope.backdrop(top: Color, bottom: Color) {
    drawRect(Brush.verticalGradient(listOf(top, bottom)))
}


// ---- scenes --------------------------------------------------------------------------------------

private fun DrawScope.connections(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val w = size.width
    val h = size.height
    val n = 16
    val xs = FloatArray(n)
    val ys = FloatArray(n)
    for (i in 0 until n) {
        val ax = 0.08f + 0.14f * rnd(i, 1)
        val ay = 0.08f + 0.14f * rnd(i, 2)
        xs[i] = w * (0.5f + 0.42f * sin(t * ax + rnd(i, 3) * TAU))
        ys[i] = h * (0.5f + 0.42f * cos(t * ay + rnd(i, 4) * TAU))
    }
    glow(p.base, Offset(w * 0.5f, h * 0.5f), max(w, h) * 0.6f, 0.35f)
    val link = m * 0.45f
    val stroke = max(1f, m * 0.005f)
    for (i in 0 until n) for (j in i + 1 until n) {
        val dx = xs[i] - xs[j]
        val dy = ys[i] - ys[j]
        val d = sqrt(dx * dx + dy * dy)
        if (d < link) {
            drawLine(p.light.copy(alpha = (1f - d / link) * 0.6f), Offset(xs[i], ys[i]), Offset(xs[j], ys[j]), stroke)
        }
    }
    for (i in 0 until n) {
        val pulse = 0.5f + 0.5f * sin(t * 1.3f + i)
        val c = Offset(xs[i], ys[i])
        glow(p.glow, c, m * 0.07f, 0.35f + 0.25f * pulse)
        drawCircle(p.glow, m * (0.011f + 0.006f * pulse), c)
    }
}

private fun DrawScope.compound(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val period = 14f
    val phase = frac(t / period)
    val grow = (phase / 0.82f).coerceAtMost(1f)
    val fade = if (phase > 0.86f) 1f - (phase - 0.86f) / 0.14f else 1f
    val total = 280
    val k = 4.6f
    val count = total * (exp(k * grow) - 1f) / (exp(k) - 1f)
    val c = Offset(size.width / 2f, size.height / 2f)
    val spacing = m * 0.44f / sqrt(total.toFloat())
    val rot = t * 0.06f
    glow(p.base, c, m * 0.55f * (0.4f + 0.6f * grow), 0.45f * fade)
    val shown = min(total, ceil(count).toInt())
    for (i in 0 until shown) {
        val a = i * 2.39996f + rot
        val r = spacing * sqrt(i.toFloat())
        val partial = (count - i).coerceIn(0f, 1f)
        val f = i / total.toFloat()
        drawCircle(
            color = lerp(p.glow, p.light, f).copy(alpha = fade * partial * (1f - 0.35f * f)),
            radius = m * (0.014f - 0.006f * f),
            center = Offset(c.x + cos(a) * r, c.y + sin(a) * r),
        )
    }
}

private fun DrawScope.twoSystems(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val w = size.width
    val h = size.height
    // System 2: slow, deliberate waves.
    val step = max(4f, w / 90f)
    for (k in 0..2) {
        val path = Path()
        var x = 0f
        while (x <= w + step) {
            val y = h * 0.66f + sin(x / w * TAU * 0.8f + t * 0.35f + k * 0.9f) * h * 0.12f * (1f - k * 0.25f)
            if (x == 0f) path.moveTo(x, y) else path.lineTo(x, y)
            x += step
        }
        drawPath(path, p.light.copy(alpha = 0.55f - 0.15f * k), style = Stroke(width = max(1.5f, m * (0.012f - 0.003f * k)), cap = StrokeCap.Round))
    }
    glow(p.base, Offset(w * 0.5f, h * 0.66f), m * 0.5f, 0.3f)
    // System 1: quick, automatic streaks.
    for (i in 0 until 44) {
        val speed = w * (0.35f + 0.65f * rnd(i, 1))
        val span = w * 1.3f
        val x = frac((rnd(i, 2) * span + t * speed) / span) * span - w * 0.15f
        val y = h * (0.1f + 0.38f * rnd(i, 3)) + sin(t * 3f + i) * m * 0.008f
        val len = m * (0.03f + 0.08f * rnd(i, 4))
        val a = 0.35f + 0.5f * rnd(i, 5)
        drawLine(
            Brush.horizontalGradient(listOf(Color.Transparent, p.glow.copy(alpha = a)), x - len, x),
            Offset(x - len, y), Offset(x, y), max(1f, m * 0.006f), StrokeCap.Round,
        )
    }
}

private fun DrawScope.starTrails(p: VisualPalette, t: Float) {
    backdrop(Color(0xFF07070B), p.deep)
    val w = size.width
    val h = size.height
    val c = Offset(w * 0.5f, h * 1.02f)
    val reach = sqrt(w * w + h * h) * 1.05f
    val rot = t * 0.035f
    val trail = 14f
    for (i in 0 until 110) {
        val r = reach * sqrt(0.02f + 0.98f * rnd(i, 1))
        val a = PI.toFloat() + rnd(i, 2) * PI.toFloat() + rot
        val pos = Offset(c.x + cos(a) * r, c.y + sin(a) * r)
        if (pos.y > h + 4f) continue
        val tw = 0.45f + 0.55f * (0.5f + 0.5f * sin(t * (1f + 2.5f * rnd(i, 3)) + i))
        val starColor = lerp(Color.White, p.glow, rnd(i, 4) * 0.6f)
        drawArc(
            color = starColor.copy(alpha = 0.22f),
            startAngle = Math.toDegrees(a.toDouble()).toFloat() - trail,
            sweepAngle = trail,
            useCenter = false,
            topLeft = Offset(c.x - r, c.y - r),
            size = Size(r * 2, r * 2),
            style = Stroke(width = max(1f, m * 0.0035f), cap = StrokeCap.Round),
        )
        drawCircle(starColor.copy(alpha = tw), max(0.8f, m * 0.005f * (0.6f + rnd(i, 5))), pos)
    }
    val fire = Color(0xFFFFB45A)
    val flick = 0.85f + 0.1f * sin(t * 6.1f) + 0.05f * sin(t * 9.7f)
    glow(lerp(p.base, fire, 0.6f), Offset(w * 0.5f, h * 1.0f), m * 0.75f * flick, 0.55f)
    for (i in 0 until 18) {
        val period = 5f + 4f * rnd(i, 6)
        val ph = frac((t + rnd(i, 7) * 10f) / period)
        val x = w * (0.5f + (rnd(i, 8) - 0.5f) * 0.3f) + sin(t * 0.9f + i) * m * 0.05f * ph
        val y = h * (1.0f - ph * 0.65f)
        drawCircle(fire.copy(alpha = (1f - ph) * 0.85f), max(0.8f, m * 0.006f * (1f - ph * 0.5f)), Offset(x, y))
    }
}

private fun DrawScope.circles(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val c = Offset(size.width / 2f, size.height / 2f)
    val thin = max(1f, m * 0.004f)
    for (k in 0..3) {
        val ph = frac(t * 0.1f + k / 4f)
        drawCircle(p.light.copy(alpha = (1f - ph) * 0.45f), m * (0.12f + 0.6f * ph), c, style = Stroke(thin))
    }
    val inner = m * (0.16f + 0.015f * sin(t * 0.8f))
    glow(p.base, c, inner * 2.4f, 0.75f)
    drawCircle(p.glow.copy(alpha = 0.85f), inner, c, style = Stroke(max(1.5f, m * 0.008f)))
    val ring = m * 0.3f
    val pts = Array(7) { i ->
        val a = t * 0.22f + i * TAU / 7f
        Offset(c.x + cos(a) * ring, c.y + sin(a) * ring)
    }
    for (i in 0 until 7) drawLine(p.light.copy(alpha = 0.3f), pts[i], pts[(i + 1) % 7], thin)
    for (i in 0 until 7) {
        glow(p.glow, pts[i], m * 0.06f, 0.5f)
        drawCircle(p.glow, m * 0.018f, pts[i])
    }
}

private fun DrawScope.depth(p: VisualPalette, t: Float) {
    val w = size.width
    val h = size.height
    backdrop(lerp(p.base, Color.Black, 0.35f), p.night)
    // Light shafts from the surface.
    for (i in 0 until 4) {
        val x = w * (0.15f + 0.24f * i) + sin(t * 0.12f + i) * w * 0.05f
        val spread = w * (0.1f + 0.05f * rnd(i, 1))
        val path = Path().apply {
            moveTo(x - spread * 0.2f, 0f)
            lineTo(x + spread * 0.2f, 0f)
            lineTo(x + spread + w * 0.08f, h * 0.85f)
            lineTo(x - spread + w * 0.08f, h * 0.85f)
            close()
        }
        drawPath(path, Brush.verticalGradient(listOf(p.glow.copy(alpha = 0.16f), Color.Transparent), 0f, h * 0.85f))
    }
    val step = max(4f, w / 80f)
    for (k in 0..4) {
        val base = h * (0.32f + 0.15f * k)
        val path = Path().apply { moveTo(0f, h) }
        var x = 0f
        while (x <= w + step) {
            val y = base + sin(x / w * TAU * (0.6f + 0.15f * k) + t * (0.28f - 0.035f * k) + k) * h * 0.03f
            path.lineTo(x, y)
            x += step
        }
        path.lineTo(w, h)
        path.close()
        drawPath(path, lerp(p.base, Color.Black, 0.35f + 0.13f * k).copy(alpha = 0.6f))
    }
    for (i in 0 until 26) {
        val ph = frac(t * 0.03f * (0.5f + rnd(i, 2)) + rnd(i, 3))
        val x = w * rnd(i, 4) + sin(t * 0.5f + i) * m * 0.02f
        drawCircle(p.glow.copy(alpha = 0.45f * sin(ph * PI.toFloat())), max(0.8f, m * 0.006f), Offset(x, h * (1f - ph)))
    }
}

private fun DrawScope.loop(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val c = Offset(size.width / 2f, size.height / 2f)
    val r = m * 0.3f
    drawCircle(p.light.copy(alpha = 0.2f), r, c, style = Stroke(max(1f, m * 0.006f)))
    val a = t * 0.9f
    val nodes = floatArrayOf(-PI.toFloat() / 2f, PI.toFloat() / 6f, PI.toFloat() * 5f / 6f)
    for (na in nodes) {
        val behind = frac((a - na) / TAU) * TAU
        val lit = exp(-behind * 1.6f)
        val pos = Offset(c.x + cos(na) * r, c.y + sin(na) * r)
        glow(p.glow, pos, m * (0.09f + 0.05f * lit), 0.25f + 0.6f * lit)
        drawCircle(p.night, m * 0.034f, pos)
        drawCircle(p.glow.copy(alpha = 0.45f + 0.55f * lit), m * 0.034f, pos, style = Stroke(max(1.5f, m * 0.007f)))
    }
    val segments = 46
    for (s in segments downTo 0) {
        val f = s / segments.toFloat()
        val aa = a - s * 0.035f
        drawCircle(
            p.glow.copy(alpha = (1f - f) * 0.9f),
            m * 0.013f * (1f - f * 0.65f),
            Offset(c.x + cos(aa) * r, c.y + sin(aa) * r),
        )
    }
    glow(p.glow, Offset(c.x + cos(a) * r, c.y + sin(a) * r), m * 0.08f, 0.7f)
}

private fun DrawScope.flame(p: VisualPalette, t: Float) {
    val w = size.width
    val h = size.height
    backdrop(Color(0xFF050505), lerp(p.base, Color.Black, 0.82f))
    val warm = Color(0xFFFFB45A)
    val hot = Color(0xFFFFF1D0)
    val base = Offset(w * 0.5f, h * 0.64f)
    val flick = 0.88f + 0.06f * sin(t * 7.3f) + 0.04f * sin(t * 11.1f + 1f) + 0.03f * sin(t * 3.7f)
    glow(warm, base, m * 0.75f * flick, 0.32f)
    glow(warm, base, m * 0.28f * flick, 0.5f)
    val height = m * 0.17f * flick
    val half = m * 0.045f
    val sway = sin(t * 2.1f) * m * 0.012f
    val outer = Path().apply {
        moveTo(base.x, base.y + half * 0.9f)
        cubicTo(base.x - half * 1.6f, base.y + half * 0.4f, base.x - half * 0.9f, base.y - height * 0.5f, base.x + sway, base.y - height)
        cubicTo(base.x + half * 0.9f, base.y - height * 0.5f, base.x + half * 1.6f, base.y + half * 0.4f, base.x, base.y + half * 0.9f)
        close()
    }
    drawPath(outer, Brush.verticalGradient(listOf(warm.copy(alpha = 0.2f), warm, hot), base.y - height, base.y + half))
    val core = Path().apply {
        val ch = height * 0.5f
        val cw = half * 0.5f
        moveTo(base.x, base.y + cw)
        cubicTo(base.x - cw * 1.4f, base.y, base.x - cw, base.y - ch * 0.5f, base.x + sway * 0.6f, base.y - ch)
        cubicTo(base.x + cw, base.y - ch * 0.5f, base.x + cw * 1.4f, base.y, base.x, base.y + cw)
        close()
    }
    drawPath(core, hot.copy(alpha = 0.9f))
    for (i in 0 until 14) {
        val period = 6f + 5f * rnd(i, 1)
        val ph = frac((t + rnd(i, 2) * 12f) / period)
        val x = base.x + (rnd(i, 3) - 0.5f) * m * 0.08f + sin(t * 0.7f + i * 1.7f) * m * 0.08f * ph
        val y = base.y - height - ph * h * 0.55f
        drawCircle(warm.copy(alpha = (1f - ph) * 0.8f), max(0.8f, m * 0.0055f * (1f - 0.5f * ph)), Offset(x, y))
    }
}

private fun DrawScope.growth(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val w = size.width
    val h = size.height
    val period = 16f
    val phase = frac(t / period)
    val grow = (phase / 0.7f).coerceAtMost(1f).let { it * it * (3f - 2f * it) }
    val fade = if (phase > 0.9f) 1f - (phase - 0.9f) / 0.1f else 1f
    val maxDepth = 8
    glow(p.base, Offset(w * 0.5f, h * 0.55f), m * 0.6f, 0.4f * fade)
    fun branch(x: Float, y: Float, angle: Float, len: Float, depth: Int, id: Int) {
        val lp = (grow * (maxDepth + 1) - depth).coerceIn(0f, 1f)
        if (lp <= 0f) return
        val sway = sin(t * 0.6f + depth * 0.5f + id * 0.1f) * 0.025f * depth
        val ex = x + cos(angle + sway) * len * lp
        val ey = y + sin(angle + sway) * len * lp
        val f = depth / maxDepth.toFloat()
        drawLine(
            lerp(p.light, p.glow, f).copy(alpha = fade * (0.95f - 0.3f * f)),
            Offset(x, y), Offset(ex, ey),
            max(1f, m * 0.022f * Math.pow(0.7, depth.toDouble()).toFloat()),
            StrokeCap.Round,
        )
        if (depth == maxDepth) {
            glow(p.glow, Offset(ex, ey), m * 0.025f, 0.6f * fade * lp)
            return
        }
        if (lp >= 1f) {
            val a = 0.3f + 0.22f * rnd(id, 1)
            val b = 0.3f + 0.22f * rnd(id, 2)
            branch(ex, ey, angle + sway - a, len * 0.76f, depth + 1, id * 2)
            branch(ex, ey, angle + sway + b, len * 0.76f, depth + 1, id * 2 + 1)
        }
    }
    branch(w * 0.5f, h * 0.94f, -PI.toFloat() / 2f, min(h * 0.2f, m * 0.3f), 0, 1)
}

private fun DrawScope.outliers(p: VisualPalette, t: Float) {
    backdrop(p.deep, p.night)
    val w = size.width
    val h = size.height
    val cols = 9
    val gap = w / (cols + 1)
    val rows = max(3, ((h * 0.66f) / gap).toInt())
    val cells = cols * rows
    for (i in 0 until cells) {
        val cx = gap * (i % cols + 1)
        val cy = gap * (i / cols + 1)
        val breathe = 0.5f + 0.5f * sin(t * 0.6f + rnd(i, 1) * TAU)
        drawCircle(p.light.copy(alpha = 0.18f + 0.12f * breathe), max(0.8f, m * 0.008f), Offset(cx, cy))
    }
    val epochLen = 5f
    for (layer in 0..1) {
        val tt = t + layer * epochLen / 2f
        val epoch = floor(tt / epochLen).toInt()
        val local = frac(tt / epochLen)
        val a = sin(local * PI.toFloat())
        for (j in 0..1) {
            val idx = (rnd(epoch * 7 + j + layer * 101, 9) * cells).toInt().coerceIn(0, cells - 1)
            val c = Offset(gap * (idx % cols + 1), gap * (idx / cols + 1))
            glow(p.glow, c, m * 0.1f, 0.7f * a)
            drawCircle(p.glow.copy(alpha = a), m * 0.016f, c)
        }
    }
    // A bell curve with one point far out on the tail.
    val path = Path()
    val step = max(4f, w / 80f)
    val baseY = h * 0.94f
    var x = 0f
    while (x <= w + step) {
        val u = (x / w - 0.42f) / 0.14f
        val y = baseY - exp(-u * u) * h * 0.16f
        if (x == 0f) path.moveTo(x, y) else path.lineTo(x, y)
        x += step
    }
    drawPath(path, p.light.copy(alpha = 0.4f), style = Stroke(max(1f, m * 0.005f)))
    val tail = Offset(w * 0.9f, baseY - h * 0.01f)
    val pulse = 0.6f + 0.4f * sin(t * 1.4f)
    glow(p.glow, tail, m * 0.08f * pulse, 0.8f)
    drawCircle(p.glow, m * 0.014f, tail)
}

private fun DrawScope.aurora(p: VisualPalette, t: Float) {
    backdrop(Color(0xFF0D0D10), Color(0xFF050505))
    val w = size.width
    val h = size.height
    val colors = listOf(p.base, Color(0xFF8E5BD8), Color(0xFF3FA7A0), Color(0xFFD86A5B))
    for (i in colors.indices) {
        val c = Offset(
            w * (0.5f + 0.35f * sin(t * (0.07f + 0.03f * i) + i * 1.7f)),
            h * (0.5f + 0.35f * cos(t * (0.05f + 0.025f * i) + i * 2.3f)),
        )
        glow(colors[i], c, max(w, h) * 0.55f, 0.42f)
    }
}
