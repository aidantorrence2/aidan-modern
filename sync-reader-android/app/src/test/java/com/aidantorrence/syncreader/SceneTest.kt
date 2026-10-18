package com.aidantorrence.syncreader

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Every explainer step must be pinned to a phrase that really appears, in order, in its paragraph. */
class SceneTest {

    @Test
    fun everyBookHasOneScenePerParagraph() {
        for (book in LIBRARY) {
            val scenes = SCENES[book.id]
            assertTrue("${book.id} has no scenes", scenes != null)
            assertEquals("${book.id} scene count", Document(book.summary).paragraphs.size, scenes!!.size)
        }
    }

    @Test
    fun everyAnchorResolvesInOrder() {
        val problems = LIBRARY.flatMap { book ->
            resolveScenes(Document(book.summary), SCENES.getValue(book.id)).problems.map { "${book.id}: $it" }
        }
        assertTrue(problems.joinToString("\n"), problems.isEmpty())
    }

    @Test
    fun stepsBuildUpGradually() {
        for (book in LIBRARY) {
            val doc = Document(book.summary)
            val resolved = resolveScenes(doc, SCENES.getValue(book.id))
            resolved.scenes.forEachIndexed { p, scene ->
                val beats = scene.scene.beats
                assertTrue("${book.id} scene $p needs at least 3 steps", beats.size >= 3)
                for (i in 1 until scene.beatWords.size) {
                    assertTrue("${book.id} scene $p steps out of order", scene.beatWords[i] >= scene.beatWords[i - 1])
                }
                val range = doc.paragraphs[p]
                assertTrue(scene.beatWords.all { it in range })
            }
        }
    }

    @Test
    fun customTextHasNoScenes() {
        assertTrue(SCENES[CUSTOM_BOOK_ID] == null)
    }
}
