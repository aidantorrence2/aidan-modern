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
}
