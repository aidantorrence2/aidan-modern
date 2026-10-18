package com.aidantorrence.syncreader

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LibraryTest {

    @Test
    fun hasTenTitlesWithUniqueIds() {
        assertEquals(10, LIBRARY.size)
        assertEquals(10, LIBRARY.map { it.id }.toSet().size)
        assertTrue(LIBRARY.none { it.id == CUSTOM_BOOK_ID })
    }

    @Test
    fun includesHowToWinFriends() {
        val book = LIBRARY.first { it.title == "How to Win Friends and Influence People" }
        assertEquals("Dale Carnegie", book.author)
        assertEquals(book, findBook(book.id))
    }

    @Test
    fun everySummaryIsSubstantialAndReadable() {
        for (book in LIBRARY) {
            val doc = Document(book.summary)
            assertTrue("${book.title} is too short", doc.words.size >= 450)
            assertTrue("${book.title} should have several paragraphs", doc.paragraphs.size >= 4)
            assertTrue("${book.title} should chunk", doc.chunks.isNotEmpty())
            assertTrue(book.blurb.isNotBlank())
        }
    }

    @Test
    fun everyTitleHasItsOwnScene() {
        assertEquals(10, LIBRARY.map { it.visual }.toSet().size)
        assertTrue(LIBRARY.none { it.visual == CUSTOM_ART.style })
        for (book in LIBRARY) assertEquals(book.visual, artFor(book.id).style)
        assertEquals(CUSTOM_ART.style, artFor(CUSTOM_BOOK_ID).style)
    }

    @Test
    fun artTempoRisesWithReadingSpeed() {
        assertTrue(visualTempo(1f) < visualTempo(2f))
        assertTrue(visualTempo(2f) < visualTempo(3f))
        assertTrue(IDLE_TEMPO < visualTempo(0.5f))
    }
}
