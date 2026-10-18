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
    fun confidenceShapesTheGrade() {
        assertEquals(Grade.AGAIN, Scheduler.grade(false, Confidence.SURE))
        assertEquals(Grade.HARD, Scheduler.grade(true, Confidence.GUESS))
        assertEquals(Grade.GOOD, Scheduler.grade(true, Confidence.UNSURE))
        assertEquals(Grade.EASY, Scheduler.grade(true, Confidence.SURE))
    }

    @Test
    fun interleavingAlternatesBooks() {
        val mixed = interleave(listOf(listOf("a1", "a2", "a3"), listOf("b1"), listOf("c1", "c2")))
        assertEquals(listOf("a1", "b1", "c1", "a2", "c2", "a3"), mixed)
    }

    @Test
    fun answersAreForgiving() {
        assertTrue(answerMatches("Majority", "majority"))
        assertTrue(answerMatches("the majorty", "majority"))
        assertTrue(answerMatches("centre", "middle", listOf("center", "centre")))
        assertTrue(answerMatches("showing up!", "showing up"))
        assertFalse(answerMatches("minority", "majority"))
        assertFalse(answerMatches("", "habit"))
    }

    @Test
    fun studyContentIsComplete() {
        for ((id, s) in STUDY) {
            val book = findBook(id) ?: error("no book $id")
            val paragraphs = Document(book.summary).paragraphs.size
            assertEquals("$id: one checkpoint per paragraph", (0 until paragraphs).toSet(), s.checkpoints.keys)
            assertEquals("$id: three pretest questions", 3, s.pretest.size)
            assertTrue("$id: key ideas", s.keyIdeas.size in 5..9)
            assertEquals("$id: unique ids", s.cards.size, s.cards.map { it.id }.toSet().size)
            assertTrue("$id: explain cards", s.cards.count { it is Recall } >= paragraphs - 1)
            s.cards.filterIsInstance<Mcq>().forEach { assertTrue("${it.id} options", it.options.size >= 3) }
        }
    }

    @Test
    fun correctAnswersAreNotAlwaysInTheSameSlot() {
        // Options are shuffled on screen, but authored positions shouldn't give the answer away either.
        for ((id, s) in STUDY) {
            val positions = s.cards.filterIsInstance<Mcq>().map { it.answer }
            assertTrue("$id: answers all in slot ${positions.firstOrNull()}", positions.toSet().size > 1 || positions.size < 3)
        }
    }
}
