package com.aidantorrence.syncstudy

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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin

/*
 * The animated explainer stage.
 *
 * A StageScene is a little animated film for one paragraph. It has a backdrop, a cast of actors (illustrated props
 * placed on a 400 x 300 stage), and a list of beats. Each beat is pinned to a phrase in the paragraph; when the
 * narration reaches that phrase, the beat's changes start tweening actor properties: position, scale, rotation,
 * opacity, and any prop-specific value (a character's mood, an ice cube's melt, a chart's progress).
 *
 * Every property is a pure function of "how long ago did each beat start", so scenes are deterministic, can be
 * scrubbed by seeking, render identically in tests, and speed up with the narration.
 */

const val STAGE_W = 400f
const val STAGE_H = 300f

enum class Ease { Out, InOut, Back, Linear, Elastic, In }

fun Ease.apply(p: Float): Float = when (this) {
    Ease.Linear -> p
    Ease.In -> p * p * p
    Ease.Out -> 1f - (1f - p).pow(3)
    Ease.InOut -> if (p < 0.5f) 4f * p * p * p else 1f - (-2f * p + 2f).pow(3) / 2f
    Ease.Back -> {
        val c1 = 1.70158f
        val c3 = c1 + 1f
        1f + c3 * (p - 1f).pow(3) + c1 * (p - 1f).pow(2)
    }
    Ease.Elastic -> if (p <= 0f || p >= 1f) p else {
        val c4 = (2 * PI / 3).toFloat()
        2f.pow(-10f * p) * sin((p * 10f - 0.75f) * c4) + 1f
    }
}

/** Something that can be drawn on the stage, centred on its own origin, reading its animated values from [s]. */
abstract class Prop {
    /** Default values for this prop's own keys (e.g. "melt" to 0f). */
    open val defaults: Map<String, Float> = emptyMap()
    abstract fun DrawScope.render(s: PropState)
}

/** Live values of one actor during a frame. */
class PropState internal constructor(
    private val scene: CompiledScene,
    private val elapsed: FloatArray,
    val t: Float,
    val m: TextMeasurer,
) {
    internal var actor = 0
    operator fun get(key: String): Float = scene.value(actor, key, elapsed)
}

class Change(val actor: String, val key: String, val to: Float, val dur: Float, val delay: Float, val ease: Ease)
class StageBeat(val at: String?, val changes: List<Change>)
class ActorDef(val id: String, val prop: Prop, val init: Map<String, Float>)
class StageScene(val title: String, val backdrop: Backdrop, val actors: List<ActorDef>, val beats: List<StageBeat>)

// ---- authoring DSL ----------------------------------------------------------------------------------------

fun stage(title: String, backdrop: Backdrop, block: SceneScope.() -> Unit): StageScene {
    val sc = SceneScope().apply(block)
    return StageScene(title, backdrop, sc.actors.map { ActorDef(it.id, it.prop, it.init) }, sc.beats)
}

class ActorHandle(val id: String, val prop: Prop, val init: MutableMap<String, Float>) {
    fun with(key: String, v: Number): ActorHandle { init[key] = v.toFloat(); return this }
}

class SceneScope {
    internal val actors = mutableListOf<ActorHandle>()
    internal val beats = mutableListOf<StageBeat>()

    /** Places an actor. Actors start hidden unless [visible]; later actors draw on top. */
    fun add(id: String, prop: Prop, x: Number, y: Number, s: Number = 1, r: Number = 0, visible: Boolean = false): ActorHandle {
        require(actors.none { it.id == id }) { "duplicate actor $id" }
        val v = if (visible) 1f else 0f
        val h = ActorHandle(id, prop, mutableMapOf("x" to x.toFloat(), "y" to y.toFloat(), "s" to s.toFloat(),
            "r" to r.toFloat(), "a" to v, "pop" to v))
        actors += h
        return h
    }

    /** A step that starts when the narration reaches [at] (null: as soon as the paragraph starts). */
    fun beat(at: String? = null, block: BeatScope.() -> Unit) {
        beats += StageBeat(at, BeatScope().apply(block).changes)
    }
}

class BeatScope {
    internal val changes = mutableListOf<Change>()

    fun set(id: String, key: String, to: Number, dur: Number = 700, delay: Number = 0, ease: Ease = Ease.Out) {
        changes += Change(id, key, to.toFloat(), dur.toFloat(), delay.toFloat(), ease)
    }

    /** Pops actors in with a springy scale, staggered. */
    fun show(vararg ids: String, delay: Number = 0, stagger: Number = 110) {
        ids.forEachIndexed { i, id ->
            val d = delay.toFloat() + i * stagger.toFloat()
            set(id, "a", 1, 280, d)
            set(id, "pop", 1, 620, d, Ease.Back)
        }
    }

    fun hide(vararg ids: String, delay: Number = 0, dur: Number = 350) {
        ids.forEach { set(it, "a", 0, dur, delay, Ease.Out) }
    }

    /** Fades to a dimmed state, keeping the actor visible as context. */
    fun dim(vararg ids: String, to: Number = 0.3, delay: Number = 0) {
        ids.forEach { set(it, "a", to, 500, delay) }
    }

    fun move(id: String, x: Number, y: Number, dur: Number = 900, delay: Number = 0, ease: Ease = Ease.InOut) {
        set(id, "x", x, dur, delay, ease)
        set(id, "y", y, dur, delay, ease)
    }

    fun scale(id: String, s: Number, dur: Number = 700, delay: Number = 0, ease: Ease = Ease.Back) = set(id, "s", s, dur, delay, ease)
    fun rotate(id: String, r: Number, dur: Number = 700, delay: Number = 0, ease: Ease = Ease.InOut) = set(id, "r", r, dur, delay, ease)

    /** Runs a prop's 0→1 progress key (draw-on lines, chart curves, bursts) over [dur] ms. */
    fun play(id: String, key: String = "p", to: Number = 1, dur: Number = 1600, delay: Number = 0, ease: Ease = Ease.InOut) =
        set(id, key, to, dur, delay, ease)

    /** Moves the camera to look at (x, y) with [zoom]. */
    fun camera(x: Number, y: Number, zoom: Number = 1, dur: Number = 1300, delay: Number = 0) {
        set(CAMERA, "cx", x, dur, delay, Ease.InOut)
        set(CAMERA, "cy", y, dur, delay, Ease.InOut)
        set(CAMERA, "zoom", zoom, dur, delay, Ease.InOut)
    }

    companion object { const val CAMERA = "camera" }
}

// ---- evaluation ---------------------------------------------------------------------------------------

/** A scene indexed for fast per-frame evaluation. Throws on references to unknown actors. */
class CompiledScene(val scene: StageScene) {
    private val index = scene.actors.withIndex().associate { it.value.id to it.index }
    private val cam = scene.actors.size
    private val inits: Array<Map<String, Float>> = Array(cam + 1) { i ->
        if (i == cam) mapOf("cx" to 200f, "cy" to 150f, "zoom" to 1f)
        else scene.actors[i].prop.defaults + scene.actors[i].init
    }
    private class Step(val beat: Int, val c: Change)
    private val steps: Array<HashMap<String, MutableList<Step>>> = Array(cam + 1) { HashMap() }

    init {
        scene.beats.forEachIndexed { b, beat ->
            for (c in beat.changes) {
                val i = if (c.actor == BeatScope.CAMERA) cam else index[c.actor]
                    ?: throw IllegalArgumentException("scene \"${scene.title}\": unknown actor \"${c.actor}\"")
                steps[i].getOrPut(c.key) { mutableListOf() } += Step(b, c)
            }
        }
    }

    val actorCount: Int get() = cam

    /** Value of [key] for actor [i] given each beat's elapsed time in ms (negative = not started). */
    fun value(i: Int, key: String, elapsed: FloatArray): Float {
        var v = inits[i][key] ?: defaultFor(key)
        val list = steps[i][key] ?: return v
        for (st in list) {
            val e = elapsed.getOrElse(st.beat) { -1f }
            if (e < 0f) continue
            val p = ((e - st.c.delay) / st.c.dur).coerceIn(0f, 1f)
            if (p <= 0f) continue
            v += (st.c.to - v) * st.c.ease.apply(p)
        }
        return v
    }

    fun camera(key: String, elapsed: FloatArray) = value(cam, key, elapsed)

    /** Longest time any beat needs to finish, used to know when a scene has settled. */
    val settleMs: Float = scene.beats.flatMap { it.changes }.maxOfOrNull { it.delay + it.dur } ?: 0f

    private fun defaultFor(key: String) = when (key) { "s", "zoom" -> 1f; else -> 0f }
}

// ---- rendering ----------------------------------------------------------------------------------------

/** Draws one frame: backdrop filling the canvas, the 400 x 300 stage fitted inside, camera, actors, title. */
fun DrawScope.drawStage(scene: CompiledScene, elapsed: FloatArray, t: Float, m: TextMeasurer, showTitle: Boolean = true) {
    val s = min(size.width / STAGE_W, size.height / STAGE_H)
    val ox = (size.width - STAGE_W * s) / 2f
    val oy = (size.height - STAGE_H * s) / 2f
    withTransform({
        translate(ox, oy)
        scale(s, s, Offset.Zero)
    }) {
        val view = Rect(-ox / s, -oy / s, (size.width - ox) / s, (size.height - oy) / s)
        with(scene.scene.backdrop) { paint(view, t) }

        val cx = scene.camera("cx", elapsed)
        val cy = scene.camera("cy", elapsed)
        val zoom = scene.camera("zoom", elapsed)
        val state = PropState(scene, elapsed, t, m)
        withTransform({
            translate(STAGE_W / 2f, STAGE_H / 2f)
            scale(zoom, zoom, Offset.Zero)
            translate(-cx, -cy)
        }) {
            for (i in 0 until scene.actorCount) {
                state.actor = i
                val a = state["a"].coerceIn(0f, 1f)
                if (a <= 0.004f) continue
                val pop = state["pop"]
                val sc = state["s"] * (0.3f + 0.7f * pop)
                if (sc <= 0.001f) continue
                withTransform({
                    translate(state["x"], state["y"])
                    rotate(state["r"], Offset.Zero)
                    scale(sc, sc, Offset.Zero)
                }) {
                    val layered = a < 0.995f
                    if (layered) drawIntoCanvas {
                        it.saveLayer(Rect(-3000f, -3000f, 3000f, 3000f), Paint().apply { alpha = a })
                    }
                    with(scene.scene.actors[i].prop) { render(state) }
                    if (layered) drawIntoCanvas { it.restore() }
                }
            }
        }
        if (showTitle) titleChip(m, scene.scene.title)
    }
}

private fun DrawScope.titleChip(m: TextMeasurer, title: String) {
    if (title.isEmpty()) return
    label(m, title.uppercase(), 14f, 16f, 9.5f, Color.White.copy(alpha = 0.78f), weight = 700, align = Align.START,
        chip = Color.Black.copy(alpha = 0.32f), letterSpacing = 0.8f)
}

// ---- syncing to the text -------------------------------------------------------------------------------

class SyncedScene(val compiled: CompiledScene, val beatWords: IntArray)
class SceneSync(val scenes: List<SyncedScene>, val problems: List<String>)

/** Pins every beat to the word where its phrase starts, searching in order within its own paragraph. */
fun syncScenes(doc: Document, scenes: List<StageScene>): SceneSync {
    val problems = mutableListOf<String>()
    if (scenes.size != doc.sections.size) problems += "expected ${doc.sections.size} scenes, found ${scenes.size}"
    val out = doc.sections.mapIndexed { p, range ->
        val scene = scenes.getOrNull(p) ?: StageScene("", Backdrops.Studio, emptyList(), emptyList())
        val compiled = runCatching { CompiledScene(scene) }.getOrElse {
            problems += it.message ?: "scene $p failed"
            CompiledScene(StageScene(scene.title, scene.backdrop, emptyList(), emptyList()))
        }
        val start = doc.words[range.first].start
        val text = doc.text.substring(start, doc.words[range.last].end).lowercase()
        var from = 0
        var last = range.first
        val words = IntArray(scene.beats.size) { i ->
            val at = scene.beats[i].at ?: return@IntArray last
            val idx = text.indexOf(at.lowercase(), from)
            if (idx < 0) {
                problems += "section $p (${scene.title}): phrase not found in order: \"$at\""
                return@IntArray last
            }
            from = idx + 1
            last = doc.wordAtChar(start + idx, range.first, range.last + 1)
            last
        }
        SyncedScene(compiled, words)
    }
    return SceneSync(out, problems)
}

/**
 * The explainer panel: plays the scene for the paragraph being read, with each beat starting as the narration
 * reaches its phrase. Titles without scenes show their ambient cover art instead.
 */
@Composable
fun StagePanel(
    bookId: String,
    doc: Document,
    currentWord: Int,
    speed: Float,
    playing: Boolean,
    clock: State<Float>,
    modifier: Modifier = Modifier,
) {
    val sync = remember(bookId, doc) { STAGE_SCENES[bookId]?.let { syncScenes(doc, it) } }
    val motion = LocalVisualMotion.current
    Box(modifier.clip(RoundedCornerShape(22.dp)).background(Color(0xFF101014))) {
        if (sync == null || doc.isEmpty) {
            BookVisual(artFor(bookId), clock, Modifier.fillMaxSize().graphicsLayer { alpha = 0.9f })
            return@Box
        }
        val word = currentWord.coerceIn(0, doc.lastWord)
        val section = doc.words[word].section
        val tempo = if (playing) max(1f, speed).pow(0.7f) else 1f
        Crossfade(targetState = section, animationSpec = tween(450), label = "scene") { p ->
            sync.scenes.getOrNull(p)?.let { SceneCanvas(it, word, tempo, motion, clock) }
        }
    }
}

@Composable
private fun SceneCanvas(scene: SyncedScene, currentWord: Int, tempo: Float, motion: Boolean, clock: State<Float>) {
    val measurer = rememberTextMeasurer(cacheSize = 128)
    // Per beat: wall-clock start, and scene-time accumulated so far (so tempo changes don't jump).
    val starts = remember(scene) { LongArray(scene.beatWords.size) { -1L } }
    val elapsed = remember(scene) { FloatArray(scene.beatWords.size) { -1f } }
    val lastFrame = remember(scene) { longArrayOf(-1L) }
    Canvas(Modifier.fillMaxSize()) {
        val t = clock.value
        val now = SystemClock.uptimeMillis()
        val dt = if (lastFrame[0] < 0) 0f else (now - lastFrame[0]).coerceIn(0, 100).toFloat()
        lastFrame[0] = now
        for (i in elapsed.indices) {
            if (scene.beatWords[i] <= currentWord) {
                if (starts[i] < 0) { starts[i] = now; elapsed[i] = 0f } else elapsed[i] += dt * tempo
                if (!motion) elapsed[i] = 1e7f
            } else {
                starts[i] = -1
                elapsed[i] = -1f
            }
        }
        drawStage(scene.compiled, elapsed, t, measurer)
    }
}
