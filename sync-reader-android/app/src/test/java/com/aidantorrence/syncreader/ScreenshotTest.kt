package com.aidantorrence.syncreader

import android.app.Application
import android.graphics.Bitmap
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * Renders every scene and the two main screens to PNGs under app/build/screenshots so the artwork can be
 * reviewed without a device. Also checks each scene actually draws something and actually moves.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w411dp-h891dp-xxhdpi")
class ScreenshotTest {

    private val out = File("build/screenshots").apply { mkdirs() }

    private fun render(art: BookArt, t: Float, w: Int, h: Int): Bitmap {
        val image = ImageBitmap(w, h)
        CanvasDrawScope().draw(Density(2.6f), LayoutDirection.Ltr, Canvas(image), Size(w.toFloat(), h.toFloat())) {
            drawRect(Color.Black)
            drawVisual(art.style, VisualPalette.from(Color(art.color)), t)
        }
        return image.asAndroidBitmap()
    }

    private fun save(bitmap: Bitmap, name: String) {
        File(out, name).outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    private fun Bitmap.signature(): IntArray {
        val s = IntArray(64)
        for (i in 0 until 64) s[i] = getPixel((i % 8) * width / 8 + width / 16, (i / 8) * height / 8 + height / 16)
        return s
    }

    @Test
    fun everySceneDrawsAndMoves() {
        val arts = LIBRARY.map { BookArt(it.visual, it.color) to it.id } + (CUSTOM_ART to "custom")
        for ((art, id) in arts) {
            // A square cover and a tall phone backdrop, at two moments in time.
            val a = render(art, 9f, 540, 540)
            val b = render(art, 13f, 540, 540)
            save(a, "scene-$id.png")
            save(render(art, 9f, 540, 1170), "scene-$id-tall.png")
            val distinctColors = IntArray(a.width * a.height).also { a.getPixels(it, 0, a.width, 0, 0, a.width, a.height) }.toSet().size
            assertTrue("$id draws almost nothing", distinctColors > 50)
            assertTrue("$id does not animate", !a.signature().contentEquals(b.signature()) || !pixelsEqual(a, b))
        }
    }

    @Composable
    private fun Still(content: @Composable () -> Unit) {
        CompositionLocalProvider(LocalVisualMotion provides false) { SyncReaderTheme(content) }
    }

    private fun pixelsEqual(a: Bitmap, b: Bitmap): Boolean = a.sameAs(b)

    @Test
    fun libraryScreen() {
        val state = ReaderUiState(progressByBook = mapOf("atomic-habits" to 0.4f, "mans-search" to 1f))
        captureRoboImage("build/screenshots/screen-library.png") {
            Still { LibraryScreen(state, {}, {}, {}, {}) }
        }
    }

    @Test
    fun libraryWithNowPlaying() {
        val book = LIBRARY[1]
        val doc = Document(book.summary)
        val state = ReaderUiState(
            bookId = book.id, title = book.title, document = doc, currentWord = doc.words.size / 3,
            playing = true, speed = 2f, progressByBook = mapOf(book.id to 0.33f),
        )
        captureRoboImage("build/screenshots/screen-library-playing.png") {
            Still { LibraryScreen(state, {}, {}, {}, {}) }
        }
    }

    @Test
    fun readerInEachMode() {
        for (mode in ViewMode.entries) {
            val vm = ReaderViewModel(ApplicationProvider.getApplicationContext<Application>())
            vm.openBook("atomic-habits")
            vm.setMode(mode)
            vm.seekToWord(vm.state.value.document.paragraphs[0].last - 3)
            captureRoboImage("build/screenshots/screen-reader-${mode.name.lowercase()}.png") {
                Still { ReaderScreen(vm, vm.state.value) }
            }
        }
    }

    /** Every scene in its finished state, one PNG per scene. */
    @Test
    fun everyExplainerScene() {
        for (book in LIBRARY) {
            val doc = Document(book.summary)
            for (p in doc.paragraphs.indices) {
                val last = doc.paragraphs[p].last
                captureRoboImage("build/screenshots/explainer/${book.id}-$p.png") {
                    Still {
                        ExplainerStage(book.id, doc, last, 1f, false, mutableFloatStateOf(9f),
                            Modifier.size(400.dp, 300.dp))
                    }
                }
            }
        }
    }

    /** One scene captured at each step, to show how it builds up. */
    @Test
    fun explainerStepByStep() {
        val book = LIBRARY.first { it.id == "atomic-habits" }
        val doc = Document(book.summary)
        val scene = resolveScenes(doc, SCENES.getValue(book.id)).scenes[0]
        scene.beatWords.forEachIndexed { i, word ->
            captureRoboImage("build/screenshots/steps/step-$i.png") {
                Still {
                    ExplainerStage(book.id, doc, word, 1f, false, mutableFloatStateOf(9f), Modifier.size(400.dp, 300.dp))
                }
            }
        }
    }
}
