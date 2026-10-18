package com.aidantorrence.syncstudy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StudyModelTest {
    private val now = 1_700_000_000_000L
    private val day = Scheduler.DAY

    @Test
    fun wrongAnswerComesBackInTenMinutes() {
        val s = Scheduler.next(null, Grade.AGAIN, now)
        assertEquals(now + Scheduler.RELEARN, s.due)
        assertEquals(1, s.lapses)
        assertFalse(s.lastCorrect)
    }

    @Test
    fun intervalsGrowWithEachCorrectAnswer() {
        var s = Scheduler.next(null, Grade.GOOD, now)
        assertEquals(1f, s.interval)
        s = Scheduler.next(s, Grade.GOOD, s.due)
        assertEquals(3f, s.interval)
        val third = Scheduler.next(s, Grade.GOOD, s.due)
        assertTrue(third.interval > 6f)
        val easy = Scheduler.next(s, Grade.EASY, s.due)
        assertTrue(easy.interval > third.interval)
        val hard = Scheduler.next(s, Grade.HARD, s.due)
        assertTrue(hard.interval < third.interval)
    }

    @Test
    fun lapseResetsTheStreakAndLowersEase() {
        var s = Scheduler.next(null, Grade.GOOD, now)
        s = Scheduler.next(s, Grade.GOOD, now + day)
        val lapsed = Scheduler.next(s, Grade.AGAIN, now + 4 * day)
        assertEquals(0, lapsed.reps)
        assertTrue(lapsed.ease < s.ease)
    }

    @Test
    fun interleavingAlternatesBooks() {
        val mixed = interleave(listOf(listOf("a1", "a2", "a3"), listOf("b1"), listOf("c1", "c2")))
        assertEquals(listOf("a1", "b1", "c1", "a2", "c2", "a3"), mixed)
    }

    @Test
    fun everyBookIsAFullSummaryWithFlashcardsForEverySection() {
        for ((id, s) in STUDY) {
            val doc = (findBook(id) ?: error("no book $id")).document
            assertTrue("$id: a full summary, not a skim (${doc.words.size} words)", doc.words.size >= 3_300)
            assertEquals("$id: every section titled", doc.sections.size, doc.sectionTitles.size)
            assertEquals("$id: flashcards for every section", (0 until doc.sections.size).toSet(), s.bySection.keys)
            s.bySection.forEach { (n, cards) -> assertTrue("$id section $n: ${cards.size} cards", cards.size in 4..6) }
            assertTrue("$id: key ideas", s.keyIdeas.size in 6..9)
            assertEquals("$id: unique ids", s.cards.size, s.cards.map { it.id }.toSet().size)
            for (c in s.cards) {
                assertTrue("${c.id}: the front is a question", c.front.trim().endsWith("?"))
                assertFalse("${c.id}: no fill-in-the-blank", "___" in c.front)
                assertTrue("${c.id}: the back synthesises the idea", c.back.split(" ").size >= 8)
                assertEquals(c, cardById(c.id))
            }
        }
    }
}
