package com.aidantorrence.syncstudy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DocumentTest {

    private val text = "Hello world. This is a test!\n\nSecond paragraph here. It has two sentences, and some more words to say."

    @Test
    fun tokenizesWordsWithOffsets() {
        val doc = Document(text)
        assertEquals("Hello", doc.words[0].text)
        assertEquals(0, doc.words[0].start)
        assertEquals(5, doc.words[0].end)
        assertEquals("world.", doc.words[1].text)
        assertEquals(6, doc.words[1].start)
        assertEquals(text.length, doc.words.last().end)
    }

    @Test
    fun splitsParagraphsOnNewlines() {
        val doc = Document(text)
        assertEquals(2, doc.paragraphs.size)
        assertEquals(0..5, doc.paragraphs[0])
        assertEquals(6, doc.paragraphs[1].first)
        assertEquals(doc.lastWord, doc.paragraphs[1].last)
    }

    @Test
    fun chunksCoverEveryWordExactlyOnce() {
        val doc = Document(SAMPLE_TEXT)
        var expected = 0
        for (c in doc.chunks) {
            assertEquals(expected, c.firstWord)
            assertTrue(c.endWord > c.firstWord)
            assertTrue(c.endWord - c.firstWord <= Document.MAX_CHUNK_WORDS)
            expected = c.endWord
        }
        assertEquals(doc.words.size, expected)
        for (i in doc.words.indices) {
            val c = doc.chunkOf(i)
            assertTrue(i >= c.firstWord && i < c.endWord)
        }
    }

    @Test
    fun chunksNeverSpanParagraphs() {
        val doc = Document(text)
        for (c in doc.chunks) {
            assertEquals(doc.words[c.firstWord].paragraph, doc.words[c.endWord - 1].paragraph)
        }
    }

    @Test
    fun chunkTextMatchesEngineOffsets() {
        val doc = Document(text)
        val chunk = doc.chunkOf(8)
        val spoken = doc.chunkText(chunk, 8)
        // A range callback at character 0 of the utterance must map back to word 8.
        assertEquals(8, doc.wordAtChar(doc.words[8].start + 0, 8, chunk.endWord))
        assertTrue(spoken.startsWith(doc.words[8].text))
    }

    @Test
    fun wordAtCharFindsContainingWordAndRollsForwardInGaps() {
        val doc = Document(text)
        assertEquals(0, doc.wordAtChar(2, 0, doc.words.size))      // inside "Hello"
        assertEquals(1, doc.wordAtChar(5, 0, doc.words.size))      // the space after "Hello" -> next word
        assertEquals(1, doc.wordAtChar(7, 0, doc.words.size))      // inside "world."
        assertEquals(doc.lastWord, doc.wordAtChar(10_000, 0, doc.words.size))
        assertEquals(3, doc.wordAtChar(0, 3, 6))                   // clamped to the lower bound
    }

    @Test
    fun emptyDocumentIsSafe() {
        val doc = Document("")
        assertTrue(doc.isEmpty)
        assertEquals(0, doc.chunks.size)
        assertEquals(0, doc.wordAtChar(5, 0, 0))
    }

    @Test
    fun orpIndexFollowsWordLength() {
        assertEquals(0, orpIndex(1))
        assertEquals(1, orpIndex(4))
        assertEquals(2, orpIndex(8))
        assertEquals(3, orpIndex(12))
        assertEquals(4, orpIndex(20))
    }
}
