package com.aidantorrence.syncstudy

import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToLong

/*
 * Study content and the learning engine.
 *
 * Every book's study set is a deck of flashcards: a question about an important idea on the front, a short synthesis
 * on the back. You answer from memory, flip, and say how well you knew it. Techniques used:
 *  - Retrieval practice: answering from memory beats re-reading (Roediger & Karpicke 2006).
 *  - Spaced repetition: reviews spread over growing gaps (Cepeda et al. 2006; SM-2 style scheduling).
 *  - Interleaving: mixing books in a review session (Rohrer & Taylor 2007).
 *  - Successive relearning: a missed card comes back in the same session until you know it (Rawson & Dunlosky 2011).
 *  - Free recall: writing down everything you remember from a book before checking (a strong retrieval task).
 *  - Dual coding: every card is paired with the animated scene for its section.
 */

/** A flashcard about section [section] of a book. */
class Card(val id: String, val bookId: String, val section: Int, val front: String, val back: String)

class BookStudy(val bookId: String, val keyIdeas: List<String>, val cards: List<Card>) {
    /** Cards per section, most important first. */
    val bySection: Map<Int, List<Card>> = cards.groupBy { it.section }
    /** The cards checked at the end of each section while reading, and asked in drive mode. */
    fun checks(section: Int): List<Card> = bySection[section].orEmpty().take(CHECKS_PER_SECTION)
}

const val CHECKS_PER_SECTION = 2

// ---- authoring DSL -----------------------------------------------------------------------------------

fun study(bookId: String, block: StudyScope.() -> Unit): BookStudy {
    val s = StudyScope(bookId).apply(block)
    return BookStudy(bookId, s.ideas, s.cards)
}

class StudyScope(private val bookId: String) {
    internal val ideas = mutableListOf<String>()
    internal val cards = mutableListOf<Card>()
    fun keyIdeas(vararg i: String) { ideas += i }
    fun section(n: Int, block: SectionScope.() -> Unit) { cards += SectionScope(bookId, n).apply(block).cards }
}

class SectionScope(private val bookId: String, private val n: Int) {
    internal val cards = mutableListOf<Card>()
    fun card(front: String, back: String) { cards += Card("$bookId/$n/${cards.size}", bookId, n, front, back) }
}

// ---- scheduling ------------------------------------------------------------------------------------------

enum class Grade { AGAIN, HARD, GOOD, EASY }

/** Memory state of one card. Times in epoch millis; [interval] in days. */
data class CardState(
    val ease: Float = 2.5f,
    val interval: Float = 0f,
    val due: Long = 0L,
    val reps: Int = 0,
    val lapses: Int = 0,
    val lastReview: Long = 0L,
    val lastCorrect: Boolean = false,
)

object Scheduler {
    const val DAY = 86_400_000L
    const val RELEARN = 10 * 60_000L

    /** SM-2 style update. AGAIN brings the card back in 10 minutes and resets its streak. */
    fun next(prev: CardState?, grade: Grade, now: Long): CardState {
        val s = prev ?: CardState()
        return when (grade) {
            Grade.AGAIN -> s.copy(ease = max(1.3f, s.ease - 0.2f), interval = 0f, due = now + RELEARN, reps = 0,
                lapses = s.lapses + 1, lastReview = now, lastCorrect = false)
            else -> {
                val ease = when (grade) { Grade.HARD -> max(1.3f, s.ease - 0.15f); Grade.EASY -> s.ease + 0.15f; else -> s.ease }
                val interval = when {
                    s.reps == 0 -> when (grade) { Grade.HARD -> 1f; Grade.GOOD -> 1f; else -> 3f }
                    s.reps == 1 -> when (grade) { Grade.HARD -> 2f; Grade.GOOD -> 3f; else -> 5f }
                    else -> when (grade) {
                        Grade.HARD -> max(s.interval + 1f, s.interval * 1.2f)
                        Grade.GOOD -> s.interval * ease
                        else -> s.interval * ease * 1.3f
                    }
                }.coerceAtMost(365f)
                s.copy(ease = ease, interval = interval, due = now + (interval * DAY).roundToLong(), reps = s.reps + 1,
                    lastReview = now, lastCorrect = true)
            }
        }
    }

    /** Short label of when a card would next appear, e.g. "10m", "3d". */
    fun preview(prev: CardState?, grade: Grade, now: Long): String {
        val n = next(prev, grade, now)
        val ms = n.due - now
        return when {
            ms < 60 * 60_000L -> "${ms / 60_000L}m"
            ms < DAY -> "${ms / 3_600_000L}h"
            else -> "${(ms + DAY / 2) / DAY}d"
        }
    }

    /** 0..1: how well established a card is (an interval of 3 weeks or more counts as mastered). */
    fun strength(s: CardState?): Float = if (s == null) 0f else min(1f, s.interval / 21f)
}

/** Round-robin across books so consecutive cards come from different books when possible. */
fun <T> interleave(groups: List<List<T>>): List<T> {
    val out = mutableListOf<T>()
    val its = groups.filter { it.isNotEmpty() }.map { it.iterator() }.toMutableList()
    while (its.isNotEmpty()) {
        val iter = its.iterator()
        while (iter.hasNext()) { val i = iter.next(); if (i.hasNext()) out += i.next() else iter.remove() }
    }
    return out
}
