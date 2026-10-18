package com.aidantorrence.syncreader

import android.os.SystemClock
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Constraints
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin

/*
 * Explainer scenes: simple diagrams that build up step by step in time with the narration.
 *
 * Every paragraph of a summary has one Scene. A Scene is a list of Beats. Each Beat is pinned to a phrase in
 * that paragraph ("at"); when the reader reaches the phrase, the Beat's elements animate in. Elements live on
 * a virtual 400 x 300 stage, so scenes are authored in fixed coordinates and scale to any screen.
 */

const val STAGE_W = 400f
const val STAGE_H = 300f

object Ink {
    val White = Color(0xFFF2F2F2)
    val Muted = Color(0xFF9A9A9A)
    val Faint = Color(0xFF555555)
    val Gold = Color(0xFFE9B949)
    val Good = Color(0xFF7FD18A)
    val Bad = Color(0xFFFF7B7B)
    val Blue = Color(0xFF7DB8FF)
    val Purple = Color(0xFFB79CFF)
}

enum class Align { START, CENTER, END }

sealed class El(val id: String?, val durationMs: Float)

class TextEl(id: String?, val text: String, val x: Float, val y: Float, val size: Float, val color: Color,
             val bold: Boolean, val italic: Boolean, val align: Align, val maxWidth: Float) : El(id, 450f)
class DotEl(id: String?, val x: Float, val y: Float, val r: Float, val color: Color) : El(id, 400f)
class LineEl(id: String?, val x1: Float, val y1: Float, val x2: Float, val y2: Float, val color: Color,
             val width: Float, val arrow: Boolean, val dashed: Boolean) : El(id, 550f)
class BoxEl(id: String?, val x: Float, val y: Float, val w: Float, val h: Float, val text: String, val color: Color,
            val filled: Boolean, val size: Float) : El(id, 450f)
class BarEl(id: String?, val x: Float, val base: Float, val w: Float, val h: Float, val color: Color,
            val label: String?, val value: String?) : El(id, 750f)
class AxesEl(id: String?, val x: Float, val y: Float, val w: Float, val h: Float, val xLabel: String?,
             val yLabel: String?) : El(id, 500f)
class CurveEl(id: String?, val x: Float, val y: Float, val w: Float, val h: Float, val color: Color,
              val tEnd: Float, val label: String?, val labelDx: Float, val labelDy: Float, val labelAlign: Align,
              val fn: (Float) -> Float) : El(id, 1500f)
class CounterEl(id: String?, val x: Float, val y: Float, val from: Float, val to: Float, val decimals: Int,
                val prefix: String, val suffix: String, val size: Float, val color: Color) : El(id, 1200f)
class GridEl(id: String?, val x: Float, val y: Float, val cols: Int, val rows: Int, val gap: Float, val r: Float,
             val color: Color, val hi: Set<Int>, val hiColor: Color, val bad: Set<Int>) : El(id, 1100f)
class PersonEl(id: String?, val x: Float, val y: Float, val scale: Float, val color: Color, val label: String?) :
    El(id, 450f)
class RingEl(id: String?, val x: Float, val y: Float, val r: Float, val color: Color, val width: Float,
             val filled: Boolean, val label: String?, val labelInside: Boolean) : El(id, 700f)
class MarkEl(id: String?, val x: Float, val y: Float, val s: Float, val good: Boolean) : El(id, 400f)

class Beat(val at: String?, val els: List<El>, val dim: List<String>, val hide: List<String>)
class Scene(val title: String, val beats: List<Beat>)

// ---- authoring DSL ------------------------------------------------------------------------------------

fun scene(title: String, block: SceneBuilder.() -> Unit): Scene = SceneBuilder().apply(block).let { Scene(title, it.beats) }

class SceneBuilder {
    val beats = mutableListOf<Beat>()

    /** Adds a step that appears when the narration reaches [at] (null = as soon as the paragraph starts). */
    fun beat(at: String? = null, block: BeatBuilder.() -> Unit) {
        val b = BeatBuilder().apply(block)
        beats.add(Beat(at, b.els, b.dims, b.hides))
    }
}

class BeatBuilder {
    val els = mutableListOf<El>()
    val dims = mutableListOf<String>()
    val hides = mutableListOf<String>()

    private val Number.f: Float get() = toFloat()

    fun dim(vararg ids: String) { dims += ids }
    fun hide(vararg ids: String) { hides += ids }

    fun text(s: String, x: Number, y: Number, size: Number = 14, color: Color = Ink.White, bold: Boolean = false,
             italic: Boolean = false, align: Align = Align.CENTER, maxWidth: Number = 380, id: String? = null) {
        els += TextEl(id, s, x.f, y.f, size.f, color, bold, italic, align, maxWidth.f)
    }
    fun dot(x: Number, y: Number, r: Number = 6, color: Color = Ink.Gold, id: String? = null) {
        els += DotEl(id, x.f, y.f, r.f, color)
    }
    fun line(x1: Number, y1: Number, x2: Number, y2: Number, color: Color = Ink.Muted, width: Number = 2,
             dashed: Boolean = false, id: String? = null) {
        els += LineEl(id, x1.f, y1.f, x2.f, y2.f, color, width.f, false, dashed)
    }
    fun arrow(x1: Number, y1: Number, x2: Number, y2: Number, color: Color = Ink.Muted, width: Number = 2,
              dashed: Boolean = false, id: String? = null) {
        els += LineEl(id, x1.f, y1.f, x2.f, y2.f, color, width.f, true, dashed)
    }
    fun box(x: Number, y: Number, w: Number, h: Number, s: String, color: Color = Ink.Gold, filled: Boolean = false,
            size: Number = 13, id: String? = null) {
        els += BoxEl(id, x.f, y.f, w.f, h.f, s, color, filled, size.f)
    }
    fun bar(x: Number, base: Number, w: Number, h: Number, color: Color = Ink.Gold, label: String? = null,
            value: String? = null, id: String? = null) {
        els += BarEl(id, x.f, base.f, w.f, h.f, color, label, value)
    }
    fun axes(x: Number, y: Number, w: Number, h: Number, xLabel: String? = null, yLabel: String? = null, id: String? = null) {
        els += AxesEl(id, x.f, y.f, w.f, h.f, xLabel, yLabel)
    }
    /** [fn] maps t in 0..1 (left to right) to a height in 0..1 (bottom to top) of the box x, y, w, h. */
    fun curve(x: Number, y: Number, w: Number, h: Number, color: Color = Ink.Gold, tEnd: Number = 1,
              label: String? = null, labelDx: Number = 0, labelDy: Number = -12, labelAlign: Align = Align.END,
              id: String? = null, fn: (Float) -> Float) {
        els += CurveEl(id, x.f, y.f, w.f, h.f, color, tEnd.f, label, labelDx.f, labelDy.f, labelAlign, fn)
    }
    fun counter(x: Number, y: Number, from: Number, to: Number, decimals: Int = 0, prefix: String = "",
                suffix: String = "", size: Number = 26, color: Color = Ink.Gold, id: String? = null) {
        els += CounterEl(id, x.f, y.f, from.f, to.f, decimals, prefix, suffix, size.f, color)
    }
    fun grid(x: Number, y: Number, cols: Int, rows: Int, gap: Number = 12, r: Number = 3.5, color: Color = Ink.Faint,
             hi: Set<Int> = emptySet(), hiColor: Color = Ink.Gold, bad: Set<Int> = emptySet(), id: String? = null) {
        els += GridEl(id, x.f, y.f, cols, rows, gap.f, r.f, color, hi, hiColor, bad)
    }
    fun person(x: Number, y: Number, scale: Number = 1, color: Color = Ink.White, label: String? = null, id: String? = null) {
        els += PersonEl(id, x.f, y.f, scale.f, color, label)
    }
    fun ring(x: Number, y: Number, r: Number, color: Color = Ink.Gold, width: Number = 2.5, filled: Boolean = false,
             label: String? = null, labelInside: Boolean = false, id: String? = null) {
        els += RingEl(id, x.f, y.f, r.f, color, width.f, filled, label, labelInside)
    }
    fun check(x: Number, y: Number, s: Number = 12, id: String? = null) { els += MarkEl(id, x.f, y.f, s.f, true) }
    fun cross(x: Number, y: Number, s: Number = 12, id: String? = null) { els += MarkEl(id, x.f, y.f, s.f, false) }
}

/** First [n] indices, for grids where a leading run of dots is highlighted. */
fun first(n: Int): Set<Int> = (0 until n).toSet()

// ---- syncing scenes to the text ----------------------------------------------------------------------

/** A scene with each beat's anchor resolved to the word index where it fires. */
class ResolvedScene(val scene: Scene, val beatWords: IntArray)

class SceneResolution(val scenes: List<ResolvedScene>, val problems: List<String>)

/**
 * Pins every beat to a word. Anchors are searched case-insensitively inside their own section, each one after
 * the previous, so beats always fire in order. Missing anchors fall back to the previous beat and are reported.
 */
fun resolveScenes(doc: Document, scenes: List<Scene>): SceneResolution {
    val problems = mutableListOf<String>()
    if (scenes.size != doc.sections.size) {
        problems += "expected ${doc.sections.size} scenes, found ${scenes.size}"
    }
    val resolved = doc.sections.mapIndexed { p, range ->
        val scene = scenes.getOrNull(p) ?: Scene("", emptyList())
        val startChar = doc.words[range.first].start
        val text = doc.text.substring(startChar, doc.words[range.last].end).lowercase()
        var from = 0
        var lastWord = range.first
        val words = IntArray(scene.beats.size) { i ->
            val at = scene.beats[i].at
            if (at == null) return@IntArray lastWord
            val idx = text.indexOf(at.lowercase(), from)
            if (idx < 0) {
                problems += "section $p (${scene.title}): anchor not found in order: \"$at\""
                return@IntArray lastWord
            }
            from = idx + 1
            lastWord = doc.wordAtChar(startChar + idx, range.first, range.last + 1)
            lastWord
        }
        ResolvedScene(scene, words)
    }
    return SceneResolution(resolved, problems)
}

// ---- rendering ---------------------------------------------------------------------------------------

/**
 * The explainer panel. Shows the scene for the paragraph being read, with beats appearing as the narration
 * reaches them. Titles with no scenes (the user's own text) get the ambient artwork instead.
 */
@Composable
fun ExplainerStage(
    bookId: String,
    doc: Document,
    currentWord: Int,
    speed: Float,
    playing: Boolean,
    clock: State<Float>,
    modifier: Modifier = Modifier,
) {
    val resolution = remember(bookId, doc) { SCENES[bookId]?.let { resolveScenes(doc, it) } }
    val motion = LocalVisualMotion.current
    Box(modifier.clip(RoundedCornerShape(22.dp)).background(Color(0xFF121212))) {
        BookVisual(artFor(bookId), clock, Modifier.fillMaxSize().graphicsLayer { alpha = if (resolution == null) 0.9f else 0.06f })
        if (resolution == null || doc.isEmpty) return@Box
        val word = currentWord.coerceIn(0, doc.lastWord)
        val section = doc.words[word].section
        val tempo = if (playing) max(1f, speed).pow(0.6f) else 1f
        Crossfade(targetState = section, animationSpec = tween(350), label = "scene") { p ->
            resolution.scenes.getOrNull(p)?.let { SceneCanvas(it, word, tempo, motion, clock) }
        }
    }
}

private val Int.dp get() = androidx.compose.ui.unit.Dp(this.toFloat())

@Composable
private fun SceneCanvas(scene: ResolvedScene, currentWord: Int, tempo: Float, motion: Boolean, clock: State<Float>) {
    val measurer = rememberTextMeasurer(cacheSize = 96)
    val starts = remember(scene) { LongArray(scene.beatWords.size) { -1L } }
    Canvas(Modifier.fillMaxSize()) {
        clock.value // redraw every frame while beats animate
        val now = SystemClock.uptimeMillis()
        val beats = scene.scene.beats
        for (i in beats.indices) {
            if (scene.beatWords[i] <= currentWord) {
                if (starts[i] < 0) starts[i] = now
            } else {
                starts[i] = -1
            }
        }
        fun progress(i: Int, duration: Float): Float =
            if (!motion) 1f else ((now - starts[i]) / (duration / tempo)).coerceIn(0f, 1f)

        // Which elements have been dimmed or hidden by later beats, and how far that fade has got.
        val fadeOut = HashMap<String, Float>()
        val dimmed = HashMap<String, Float>()
        for (i in beats.indices) {
            if (starts[i] < 0) continue
            val p = progress(i, 400f)
            for (id in beats[i].hide) fadeOut[id] = max(fadeOut[id] ?: 0f, p)
            for (id in beats[i].dim) dimmed[id] = max(dimmed[id] ?: 0f, p)
        }

        val s = min(size.width / STAGE_W, size.height / STAGE_H)
        val ox = (size.width - STAGE_W * s) / 2f
        val oy = (size.height - STAGE_H * s) / 2f
        withTransform({
            translate(ox, oy)
            scale(s, s, Offset.Zero)
        }) {
            drawLabel(measurer, scene.scene.title.uppercase(), 16f, 18f, 10.5f, Ink.Muted, 1f, bold = true, align = Align.START)
            for (i in beats.indices) {
                if (starts[i] < 0) continue
                for (el in beats[i].els) {
                    val id = el.id
                    var alpha = 1f
                    if (id != null) {
                        fadeOut[id]?.let { alpha *= 1f - it }
                        dimmed[id]?.let { alpha *= 1f - 0.7f * it }
                    }
                    if (alpha <= 0.01f) continue
                    drawElement(el, ease(progress(i, el.durationMs)), alpha, measurer)
                }
            }
        }
    }
}

private fun ease(p: Float): Float = 1f - (1f - p).pow(3)

private fun DrawScope.drawLabel(
    m: TextMeasurer, text: String, x: Float, y: Float, size: Float, color: Color, alpha: Float,
    bold: Boolean = false, italic: Boolean = false, align: Align = Align.CENTER, maxWidth: Float = 380f,
) {
    if (text.isEmpty() || alpha <= 0.01f) return
    val layout = m.measure(
        text,
        style = TextStyle(
            color = color,
            fontSize = size.toSp(),
            lineHeight = (size * 1.25f).toSp(),
            fontWeight = if (bold) FontWeight.SemiBold else FontWeight.Normal,
            fontStyle = if (italic) FontStyle.Italic else FontStyle.Normal,
            textAlign = when (align) {
                Align.START -> TextAlign.Start
                Align.CENTER -> TextAlign.Center
                Align.END -> TextAlign.End
            },
        ),
        constraints = Constraints(maxWidth = max(1, maxWidth.toInt())),
    )
    val w = layout.size.width
    val left = when (align) {
        Align.START -> x
        Align.CENTER -> x - w / 2f
        Align.END -> x - w
    }
    drawText(layout, topLeft = Offset(left, y - layout.size.height / 2f), alpha = alpha.coerceIn(0f, 1f))
}

private fun DrawScope.drawElement(el: El, p: Float, a: Float, m: TextMeasurer) {
    when (el) {
        is TextEl -> drawLabel(m, el.text, el.x, el.y + (1f - p) * 6f, el.size, el.color, a * p, el.bold, el.italic, el.align, el.maxWidth)

        is DotEl -> {
            val r = el.r * (if (p < 1f) p * (1.15f - 0.15f * p) else 1f)
            drawCircle(el.color.copy(alpha = 0.18f * a), r * 2.6f, Offset(el.x, el.y))
            drawCircle(el.color.copy(alpha = a), r, Offset(el.x, el.y))
        }

        is LineEl -> {
            val ex = el.x1 + (el.x2 - el.x1) * p
            val ey = el.y1 + (el.y2 - el.y1) * p
            drawLine(
                el.color.copy(alpha = a), Offset(el.x1, el.y1), Offset(ex, ey), el.width, StrokeCap.Round,
                pathEffect = if (el.dashed) PathEffect.dashPathEffect(floatArrayOf(6f, 5f)) else null,
            )
            if (el.arrow && p > 0.85f) {
                val ang = kotlin.math.atan2(el.y2 - el.y1, el.x2 - el.x1)
                val head = 8f
                for (side in listOf(-1f, 1f)) {
                    val aa = ang + PI.toFloat() + side * 0.45f
                    drawLine(el.color.copy(alpha = a), Offset(ex, ey), Offset(ex + cos(aa) * head, ey + sin(aa) * head), el.width, StrokeCap.Round)
                }
            }
        }

        is BoxEl -> {
            val sc = 0.9f + 0.1f * p
            val w = el.w * sc
            val h = el.h * sc
            val tl = Offset(el.x - w / 2f, el.y - h / 2f)
            val corner = CornerRadius(min(10f, h / 2f))
            drawRoundRect(el.color.copy(alpha = (if (el.filled) 0.95f else 0.12f) * a * p), tl, Size(w, h), corner)
            drawRoundRect(el.color.copy(alpha = a * p), tl, Size(w, h), corner, style = Stroke(1.6f))
            drawLabel(m, el.text, el.x, el.y, el.size, if (el.filled) Color(0xFF0C0C0C) else Ink.White, a * p,
                bold = el.filled, maxWidth = el.w - 12f)
        }

        is BarEl -> {
            val h = el.h * p
            val top = if (h >= 0) el.base - h else el.base
            drawRoundRect(el.color.copy(alpha = a), Offset(el.x - el.w / 2f, top), Size(el.w, kotlin.math.abs(h)), CornerRadius(4f))
            el.label?.let {
                val ly = if (el.h >= 0) el.base + 11f else el.base - 11f
                drawLabel(m, it, el.x, ly, 10.5f, Ink.Muted, a, maxWidth = max(el.w + 40f, 70f))
            }
            el.value?.let {
                val vy = if (el.h >= 0) el.base - h - 11f else el.base - h + 11f
                drawLabel(m, it, el.x, vy, 12f, el.color, a * p, bold = true, maxWidth = 120f)
            }
        }

        is AxesEl -> {
            val c = Ink.Faint.copy(alpha = a)
            drawLine(c, Offset(el.x, el.y + el.h), Offset(el.x, el.y + el.h - el.h * p), 1.5f)
            drawLine(c, Offset(el.x, el.y + el.h), Offset(el.x + el.w * p, el.y + el.h), 1.5f)
            el.xLabel?.let { drawLabel(m, it, el.x + el.w, el.y + el.h + 10f, 10f, Ink.Muted, a * p, align = Align.END) }
            el.yLabel?.let { drawLabel(m, it, el.x + 4f, el.y - 4f, 10f, Ink.Muted, a * p, align = Align.START) }
        }

        is CurveEl -> {
            val end = el.tEnd * p
            if (end <= 0f) return
            val path = Path()
            val n = 90
            var lx = el.x
            var ly = el.y + el.h
            for (k in 0..n) {
                val t = end * k / n
                val v = el.fn(t).coerceIn(-0.05f, 1.08f)
                lx = el.x + t * el.w
                ly = el.y + el.h - v * el.h
                if (k == 0) path.moveTo(lx, ly) else path.lineTo(lx, ly)
            }
            drawPath(path, el.color.copy(alpha = a), style = Stroke(2.6f, cap = StrokeCap.Round))
            drawCircle(el.color.copy(alpha = a), 3.5f, Offset(lx, ly))
            if (el.label != null && p > 0.85f) {
                drawLabel(m, el.label, lx + el.labelDx, ly + el.labelDy, 11f, el.color, a * ((p - 0.85f) / 0.15f),
                    bold = true, align = el.labelAlign, maxWidth = 180f)
            }
        }

        is CounterEl -> {
            val v = el.from + (el.to - el.from) * p
            val txt = el.prefix + String.format(java.util.Locale.US, "%,.${el.decimals}f", v) + el.suffix
            drawLabel(m, txt, el.x, el.y, el.size, el.color, a * min(1f, p * 3f), bold = true)
        }

        is GridEl -> {
            val total = el.cols * el.rows
            val shown = ceil(total * p).toInt()
            val w = (el.cols - 1) * el.gap
            val h = (el.rows - 1) * el.gap
            for (i in 0 until shown) {
                val cx = el.x - w / 2f + (i % el.cols) * el.gap
                val cy = el.y - h / 2f + (i / el.cols) * el.gap
                val color = when (i) {
                    in el.bad -> Ink.Bad
                    in el.hi -> el.hiColor
                    else -> el.color
                }
                drawCircle(color.copy(alpha = a), el.r, Offset(cx, cy))
            }
        }

        is PersonEl -> {
            val s = el.scale * (0.85f + 0.15f * p)
            val c = el.color.copy(alpha = a * p)
            drawCircle(c, 9f * s, Offset(el.x, el.y - 13f * s))
            drawRoundRect(c, Offset(el.x - 14f * s, el.y), Size(28f * s, 22f * s), CornerRadius(12f * s, 12f * s))
            el.label?.let { drawLabel(m, it, el.x, el.y + 22f * s + 11f, 11f, Ink.Muted, a * p, maxWidth = 140f) }
        }

        is RingEl -> {
            if (el.filled) drawCircle(el.color.copy(alpha = 0.16f * a * p), el.r, Offset(el.x, el.y))
            drawArc(
                el.color.copy(alpha = a), -90f, 360f * p, false,
                Offset(el.x - el.r, el.y - el.r), Size(el.r * 2, el.r * 2), style = Stroke(el.width, cap = StrokeCap.Round),
            )
            el.label?.let {
                val ly = if (el.labelInside) el.y else el.y + el.r + 12f
                drawLabel(m, it, el.x, ly, 11.5f, if (el.labelInside) Ink.White else el.color, a * p, bold = el.labelInside,
                    maxWidth = if (el.labelInside) el.r * 1.8f else 200f)
            }
        }

        is MarkEl -> {
            val c = (if (el.good) Ink.Good else Ink.Bad).copy(alpha = a)
            val s = el.s
            if (el.good) {
                val p1 = Offset(el.x - s, el.y)
                val p2 = Offset(el.x - s * 0.3f, el.y + s * 0.7f)
                val p3 = Offset(el.x + s, el.y - s * 0.8f)
                val k = (p * 2f).coerceAtMost(1f)
                drawLine(c, p1, p1 + (p2 - p1) * k, 3f, StrokeCap.Round)
                if (p > 0.5f) drawLine(c, p2, p2 + (p3 - p2) * ((p - 0.5f) * 2f), 3f, StrokeCap.Round)
            } else {
                val k = (p * 2f).coerceAtMost(1f)
                drawLine(c, Offset(el.x - s, el.y - s), Offset(el.x - s + 2 * s * k, el.y - s + 2 * s * k), 3f, StrokeCap.Round)
                if (p > 0.5f) {
                    val k2 = (p - 0.5f) * 2f
                    drawLine(c, Offset(el.x + s, el.y - s), Offset(el.x + s - 2 * s * k2, el.y - s + 2 * s * k2), 3f, StrokeCap.Round)
                }
            }
        }
    }
}
