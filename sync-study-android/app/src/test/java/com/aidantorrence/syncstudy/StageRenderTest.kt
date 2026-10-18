package com.aidantorrence.syncstudy

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.font.createFontFamilyResolver
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * Renders explainer scenes on the JVM, simulating the narration at 1x: each beat starts when the voice would reach
 * its phrase. Writes stills (every scene, fully played) and frame sequences (for GIF previews) to build/stage.
 *
 * Filter with -Pstage.books=atomic-habits,carnegie and -Pstage.frames=true to control the output.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class StageRenderTest {

    private val out = File("build/stage").apply { mkdirs() }
    private val books = System.getProperty("stage.books")?.takeIf { it.isNotBlank() }?.split(',')?.toSet()
    private val frames = System.getProperty("stage.frames") == "true"
    private val scale = 2f

    private val measurer by lazy {
        TextMeasurer(createFontFamilyResolver(ApplicationProvider.getApplicationContext()), Density(scale), LayoutDirection.Ltr)
    }

    /** Seconds at which each beat fires, from the voice's average speaking rate. */
    private fun beatTimes(doc: Document, scene: SyncedScene, paragraph: Int): FloatArray {
        val start = doc.words[doc.paragraphs[paragraph].first].start
        return FloatArray(scene.beatWords.size) { (doc.words[scene.beatWords[it]].start - start) / DEFAULT_CHARS_PER_SECOND }
    }

    private fun render(scene: SyncedScene, times: FloatArray, at: Float): Bitmap {
        val w = (STAGE_W * scale).toInt(); val h = (STAGE_H * scale).toInt()
        val image = ImageBitmap(w, h)
        val elapsed = FloatArray(times.size) { if (at >= times[it]) (at - times[it]) * 1000f else -1f }
        CanvasDrawScope().draw(Density(scale), LayoutDirection.Ltr, Canvas(image), Size(w.toFloat(), h.toFloat())) {
            drawStage(scene.compiled, elapsed, at, measurer)
        }
        return image.asAndroidBitmap()
    }

    private fun save(b: Bitmap, f: File) { f.parentFile?.mkdirs(); f.outputStream().use { b.compress(Bitmap.CompressFormat.PNG, 100, it) } }

    @Test
    fun renderScenes() {
        var rendered = 0
        for ((id, scenes) in STAGE_SCENES) {
            if (books != null && id !in books) continue
            val book = findBook(id) ?: continue
            val doc = Document(book.summary)
            val sync = syncScenes(doc, scenes)
            sync.scenes.forEachIndexed { p, scene ->
                val times = beatTimes(doc, scene, p)
                val end = doc.words[doc.paragraphs[p].last].end - doc.words[doc.paragraphs[p].first].start
                val duration = end / DEFAULT_CHARS_PER_SECOND
                // Still: the end of the paragraph, everything settled.
                save(render(scene, times, duration + 4f), File(out, "stills/$id-$p.png"))
                // A frame just after each beat settles, to review each step.
                times.forEachIndexed { i, tb -> save(render(scene, times, tb + 1.6f), File(out, "steps/$id-$p/step-${"%02d".format(i)}.png")) }
                if (frames) {
                    var t = 0f; var k = 0
                    while (t <= duration + 2f) { save(render(scene, times, t), File(out, "frames/$id-$p/f${"%04d".format(k)}.png")); t += 1f / 12f; k++ }
                }
                rendered++
            }
        }
        assertTrue(rendered > 0)
    }
}
