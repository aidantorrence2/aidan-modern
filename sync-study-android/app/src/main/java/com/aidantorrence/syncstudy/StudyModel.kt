package com.aidantorrence.syncstudy

import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToLong

/*
 * Study content and the learning engine.
 *
 * Techniques used, with the research they come from:
 *  - Pretesting: guessing before learning improves later recall, even when the guess is wrong (Richland et al. 2009).
 *  - Retrieval practice: answering from memory beats re-reading (Roediger & Karpicke 2006).
 *  - Spaced repetition: reviews spread over growing gaps (Cepeda et al. 2006; SM-2 style scheduling).
 *  - Interleaving: mixing topics in a review session (Rohrer & Taylor 2007).
 *  - Elaborative interrogation and self-explanation: "why" and "explain" prompts (Dunlosky et al. 2013).
 *  - Confidence ratings and the hypercorrection effect: confident errors get corrected best (Butterfield & Metcalfe 2001).
 *  - Successive relearning: a missed card comes back in the same session until answered (Rawson & Dunlosky 2011).
 *  - Free recall: writing down everything you remember before checking (a strong retrieval task).
 *  - Dual coding: every card is paired with the animated scene for its paragraph.
 */

sealed class Card(val id: String, val bookId: String, val paragraph: Int)

/** Multiple choice. The first one per paragraph is that paragraph's reading checkpoint. */
class Mcq(id: String, bookId: String, paragraph: Int, val question: String, val options: List<String>, val answer: Int,
          val why: String, val pretest: Boolean) : Card(id, bookId, paragraph)

/** Open "why / explain / apply" prompt, answered in your own words, then self-graded. */
class Recall(id: String, bookId: String, paragraph: Int, val prompt: String, val answer: String) : Card(id, bookId, paragraph)

/** Type the missing word(s). "___" marks the blank. */
class Cloze(id: String, bookId: String, paragraph: Int, val text: String, val answer: String, val accept: List<String>) :
    Card(id, bookId, paragraph)

class BookStudy(val bookId: String, val keyIdeas: List<String>, val cards: List<Card>) {
    val checkpoints: Map<Int, Mcq> = cards.filterIsInstance<Mcq>().groupBy { it.paragraph }.mapValues { it.value.first() }
    val pretest: List<Mcq> = cards.filterIsInstance<Mcq>().filter { it.pretest }
}

// ---- authoring DSL -----------------------------------------------------------------------------------

fun study(bookId: String, block: StudyScope.() -> Unit): BookStudy {
    val s = StudyScope(bookId).apply(block)
    return BookStudy(bookId, s.ideas, s.cards)
}

class StudyScope(private val bookId: String) {
    internal val ideas = mutableListOf<String>()
    internal val cards = mutableListOf<Card>()
    fun keyIdeas(vararg i: String) { ideas += i }
    fun para(p: Int, block: ParaScope.() -> Unit) { cards += ParaScope(bookId, p).apply(block).cards }
}

class ParaScope(private val bookId: String, private val p: Int) {
    internal val cards = mutableListOf<Card>()
    private fun nextId() = "$bookId:$p:${cards.size}"

    /** [options] in any order; [answer] is the index of the correct one. */
    fun mcq(question: String, vararg options: String, answer: Int, why: String, pretest: Boolean = false) {
        require(options.size in 2..5 && answer in options.indices) { "bad mcq: $question" }
        cards += Mcq(nextId(), bookId, p, question, options.toList(), answer, why, pretest)
    }
    fun why(prompt: String, answer: String) { cards += Recall(nextId(), bookId, p, prompt, answer) }
    fun cloze(text: String, answer: String, vararg accept: String) {
        require("___" in text) { "cloze needs ___: $text" }
        cards += Cloze(nextId(), bookId, p, text, answer, accept.toList())
    }
}

// ---- scheduling ------------------------------------------------------------------------------------------

enum class Grade { AGAIN, HARD, GOOD, EASY }
enum class Confidence { GUESS, UNSURE, SURE }

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

    /** Objective answers: correctness plus how sure you were. */
    fun grade(correct: Boolean, confidence: Confidence): Grade = when {
        !correct -> Grade.AGAIN
        confidence == Confidence.GUESS -> Grade.HARD
        confidence == Confidence.UNSURE -> Grade.GOOD
        else -> Grade.EASY
    }

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

/** Forgiving answer check: case, punctuation and one typo per ~6 letters are ignored. */
fun answerMatches(given: String, answer: String, accept: List<String> = emptyList()): Boolean {
    fun norm(x: String) = x.lowercase().replace(Regex("[^a-z0-9.%]+"), " ").trim().replace(Regex("^(the|a|an) "), "")
    val g = norm(given)
    if (g.isEmpty()) return false
    return (listOf(answer) + accept).any { a ->
        val n = norm(a)
        n == g || levenshtein(n, g) <= max(0, n.length / 6)
    }
}

private fun levenshtein(a: String, b: String): Int {
    val dp = IntArray(b.length + 1) { it }
    for (i in 1..a.length) {
        var prev = dp[0]; dp[0] = i
        for (j in 1..b.length) {
            val tmp = dp[j]
            dp[j] = minOf(dp[j] + 1, dp[j - 1] + 1, prev + if (a[i - 1] == b[j - 1]) 0 else 1)
            prev = tmp
        }
    }
    return dp[b.length]
}
