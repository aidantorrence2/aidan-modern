package com.aidantorrence.syncstudy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Every animated step must be pinned to a phrase that appears, in order, in its paragraph. */
class StageSceneTest {
    @Test
    fun scenesMatchParagraphsAndPhrasesResolve() {
        val problems = mutableListOf<String>()
        for ((id, scenes) in STAGE_SCENES) {
            val book = findBook(id) ?: error("unknown book $id")
            val doc = Document(book.summary)
            assertEquals("$id scene count", doc.paragraphs.size, scenes.size)
            problems += syncScenes(doc, scenes).problems.map { "$id: $it" }
        }
        assertTrue(problems.joinToString("\n"), problems.isEmpty())
    }

    @Test
    fun everySceneHasSeveralSteps() {
        for ((id, scenes) in STAGE_SCENES) scenes.forEachIndexed { i, s -> assertTrue("$id scene $i has too few steps", s.beats.size >= 3) }
    }
}
