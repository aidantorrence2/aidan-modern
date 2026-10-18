package com.aidantorrence.syncstudy

import kotlin.math.max
import kotlin.math.min

/*
 * Drive mode: hands-free study for the car, a walk or the gym.
 *
 * A session is a planned list of segments (narrate a paragraph, ask a question, review a due card, free recall)
 * played through a DriveIO: a voice and chimes, never the microphone. Each question is asked open-ended, then a
 * silent pause gives you time to answer in your head before the answer is read out. Everything is spoken at the
 * chosen speed. A press of next/back while the answer is read records "knew it" / "didn't" in the same
 * spaced-repetition schedule as the rest of the app; with no press, nothing is recorded.
 */

enum class VoiceRole { NARRATOR, COACH }
enum class Chime { QUESTION, RIGHT, WRONG, DONE }
enum class Button { NEXT, PREVIOUS }

/** Speaker and chimes. Suspends until each action finishes; cancellation must stop it promptly. */
interface DriveIO {
    suspend fun say(text: String, role: VoiceRole)
    suspend fun chime(c: Chime)
    /** Speech rate for every voice, narration and questions alike. */
    fun setSpeed(speed: Float) {}
}

/** Where drive sessions read and write study progress. */
interface DriveMemory {
    fun record(card: Card, grade: Grade, correct: Boolean)
    /** Due cards, oldest first. */
    fun due(): List<Card>
    fun paragraph(bookId: String): Int
    fun setParagraph(bookId: String, p: Int)
    fun isNew(bookId: String): Boolean
    fun startBook(bookId: String)
    fun finishBook(bookId: String)
}

data class DriveSettings(
    val bookId: String,
    val minutes: Int = 20,
    val speed: Float = 1.5f,
    val charsPerSecond: Float = DEFAULT_CHARS_PER_SECOND,
)

/** Waiting times, adjustable for tests. */
data class DriveTimings(
    /** Silent time to answer in your head before the answer is read. */
    val thinkMs: Long = 10_000,
    /** After the answer, how long a next/back press still counts as "knew it" / "didn't". */
    val gradeMs: Long = 3_000,
    /** Silent time to go over the whole book before its key ideas are read. */
    val recallMs: Long = 30_000,
)

sealed class Segment {
    data class Line(val text: String) : Segment()
    data class Learn(val bookId: String, val paragraph: Int) : Segment()
    data class Ask(val card: Card, val label: String) : Segment()
    data class Recall(val bookId: String) : Segment()
    data object Outro : Segment()
}

enum class DrivePhase { IDLE, SPEAKING, NARRATING, QUESTION, THINKING, FEEDBACK, RECALL, PAUSED, DONE }

data class DriveState(
    val running: Boolean = false,
    val phase: DrivePhase = DrivePhase.IDLE,
    val title: String = "",
    val label: String = "",
    val line: String = "",
    val segment: Int = 0,
    val segments: Int = 0,
    val asked: Int = 0,
    val right: Int = 0,
    val speed: Float = 1f,
)

// ---- planning ----------------------------------------------------------------------------------------

private const val SECONDS_PER_QUESTION = 24f
private const val SECONDS_PER_RECALL = 60f

/**
 * Builds a session of about [DriveSettings.minutes]: a short intro, up to two warm-up reviews, then paragraphs of the book with each paragraph's check question asked
 * one paragraph later (a short lag makes retrieval effortful), with due reviews woven in between. If the book is
 * finished, a free-recall segment closes it out; spare time goes to more reviews.
 */
fun buildDrivePlan(s: DriveSettings, memory: DriveMemory): List<Segment> {
    val book = findBook(s.bookId) ?: return listOf(Segment.Line("That book isn't available."), Segment.Outro)
    val budget = s.minutes * 60f
    var used = 12f
    val due = ArrayDeque(interleave(memory.due().groupBy { it.bookId }.values.toList()))
    val plan = mutableListOf<Segment>()
    repeat(min(2, due.size)) { plan += Segment.Ask(due.removeFirst(), "Warm-up"); used += SECONDS_PER_QUESTION }

    // The chosen book first; if it ends with time to spare, carry on into the next unfinished one.
    val order = listOf(book) + LIBRARY.filter { it.id != book.id && studyFor(it.id) != null &&
        memory.paragraph(it.id) < Document(it.summary).paragraphs.size && !(memory.paragraph(it.id) == 0 && !memory.isNew(it.id)) }
    val covered = mutableListOf<Pair<Book, Int>>()
    for (b in order) {
        if (b != book && used + 90f > budget) break
        val study = studyFor(b.id)
        val doc = Document(b.summary)
        val start = memory.paragraph(b.id).coerceIn(0, doc.paragraphs.size)
        if (start >= doc.paragraphs.size) continue
        if (b != book) plan += Segment.Line("Next up: ${b.title}.")
        var p = start
        var pending: Mcq? = null
        while (p < doc.paragraphs.size) {
            val range = doc.paragraphs[p]
            val chars = doc.words[range.last].end - doc.words[range.first].start
            val narrate = chars / (s.charsPerSecond * s.speed) + 8f
            if (p > start && used + narrate + SECONDS_PER_QUESTION > budget) break
            plan += Segment.Learn(b.id, p)
            used += narrate
            pending?.let { plan += Segment.Ask(it, "Check"); used += SECONDS_PER_QUESTION }
            pending = study?.checkpoints?.get(p)
            if (due.isNotEmpty() && used + SECONDS_PER_QUESTION < budget) { plan += Segment.Ask(due.removeFirst(), "Review"); used += SECONDS_PER_QUESTION }
            p++
        }
        pending?.let { plan += Segment.Ask(it, "Check"); used += SECONDS_PER_QUESTION }
        covered += b to (p - start)
        // Close out a book with free recall only when this session reached its end.
        if (p >= doc.paragraphs.size && study != null) { plan += Segment.Recall(b.id); used += SECONDS_PER_RECALL } else break
    }
    while (due.isNotEmpty() && used + SECONDS_PER_QUESTION <= budget) { plan += Segment.Ask(due.removeFirst(), "Review"); used += SECONDS_PER_QUESTION }

    val reviews = plan.count { it is Segment.Ask && it.label != "Check" }
    val intro = buildString {
        append("Drive session, about ${max(1, (used / 60f).toInt())} minutes. ")
        val first = covered.firstOrNull()
        when {
            first != null && first.second > 0 -> {
                val start = memory.paragraph(first.first.id)
                append("${first.first.title}: ${if (start == 0) "from the start" else "picking up where you left off"}, ${first.second} ${if (first.second == 1) "part" else "parts"}. ")
                if (covered.size > 1) append("Then ${covered.drop(1).joinToString(" and ") { it.first.title }}. ")
            }
            else -> append("You've finished ${book.title}, so this one is all review. ")
        }
        if (reviews > 0) append("Plus $reviews review ${if (reviews == 1) "question" else "questions"}. ")
        append("After each question, answer in your head. The answer comes ten seconds later.")
    }
    return listOf(Segment.Line(intro)) + plan + Segment.Outro
}

/** Rough length of a plan in seconds, for the setup screen. */
fun planSeconds(plan: List<Segment>, s: DriveSettings): Float = plan.sumOf { seg ->
    when (seg) {
        is Segment.Learn -> {
            val doc = Document(findBook(seg.bookId)!!.summary)
            val r = doc.paragraphs[seg.paragraph]
            ((doc.words[r.last].end - doc.words[r.first].start) / (s.charsPerSecond * s.speed) + 8f).toDouble()
        }
        is Segment.Ask -> SECONDS_PER_QUESTION.toDouble()
        is Segment.Recall -> SECONDS_PER_RECALL.toDouble()
        is Segment.Line -> seg.text.length / 15.0
        Segment.Outro -> 10.0
    }
}.toFloat()

// ---- questions rewritten for listening -------------------------------------------------------------

class SpokenQuestion(val prompt: String, val answer: String)

/**
 * Multiple-choice cards are asked open-ended, with no options read out: recalling an answer builds stronger memory
 * than recognising it in a list. Stems that only make sense with options use a rewritten open question.
 */
fun spoken(card: Card): SpokenQuestion = when (card) {
    is Mcq -> DRIVE_OPEN[card.id]?.let { SpokenQuestion(it.prompt, it.answer) }
        ?: SpokenQuestion(card.question, card.options[card.answer])
    is Cloze -> SpokenQuestion(card.text.replace("___", "blank") + " What's the missing ${if (card.answer.contains(' ')) "phrase" else "word"}?", card.answer)
    is Recall -> SpokenQuestion(card.prompt, card.answer)
}

/** Short explanation spoken after an answer. */
fun explanation(card: Card): String = when (card) {
    is Mcq -> card.why
    is Cloze -> card.text.replace("___", card.answer)
    is Recall -> card.answer
}

// ---- judging typed answers ------------------------------------------------------------------------------

private val STOP = setOf(
    "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "is", "it", "its", "it's", "be", "are",
    "was", "were", "that", "this", "these", "those", "you", "your", "they", "their", "them", "we", "our", "i", "my", "me",
    "as", "by", "from", "so", "if", "then", "than", "not", "no", "do", "does", "did", "have", "has", "had", "just", "about",
    "into", "over", "more", "most", "some", "any", "can", "will", "would", "should", "could", "what", "which", "who",
    "when", "where", "how", "why", "there", "here", "um", "uh", "like", "think", "guess", "maybe", "answer", "one",
    "really", "very", "also", "get", "gets", "make", "makes", "thing", "things", "way", "even", "only", "each", "every",
    "because", "being", "been", "out", "up", "all", "own", "same", "other", "say", "said",
)

private val UNITS = mapOf("zero" to 0, "oh" to 0, "one" to 1, "two" to 2, "three" to 3, "four" to 4, "five" to 5, "six" to 6,
    "seven" to 7, "eight" to 8, "nine" to 9, "ten" to 10, "eleven" to 11, "twelve" to 12, "thirteen" to 13, "fourteen" to 14,
    "fifteen" to 15, "sixteen" to 16, "seventeen" to 17, "eighteen" to 18, "nineteen" to 19)
private val TENS = mapOf("twenty" to 20, "thirty" to 30, "forty" to 40, "fifty" to 50, "sixty" to 60, "seventy" to 70, "eighty" to 80, "ninety" to 90)

/** Lowercases, strips punctuation (keeping decimals) and turns spoken numbers into digits ("thirty seven" → "37"). */
fun normalizeSpeech(text: String): List<String> {
    val raw = text.lowercase().replace("percent", " percent").replace(Regex("[^a-z0-9.%' ]+"), " ")
        .split(' ').map { it.trim('.', '\'') }.filter { it.isNotEmpty() }
    val out = mutableListOf<String>()
    var i = 0
    while (i < raw.size) {
        val w = raw[i]
        if (w in TENS || w in UNITS) {
            var n = TENS[w] ?: UNITS[w]!!
            var j = i + 1
            if (w in TENS && j < raw.size && raw[j] in UNITS && UNITS[raw[j]]!! in 1..9) { n += UNITS[raw[j]]!!; j++ }
            var s = n.toString()
            if (j + 1 < raw.size && raw[j] == "point") {
                val frac = StringBuilder()
                var k = j + 1
                while (k < raw.size && raw[k] in UNITS && UNITS[raw[k]]!! < 10) { frac.append(UNITS[raw[k]]); k++ }
                if (frac.isNotEmpty()) { s = "$s.$frac"; j = k }
            }
            // keep "one" as a word when it's clearly not a number ("the first one")
            if (w == "one" && j == i + 1 && i > 0 && raw[i - 1] in setOf("first", "second", "that", "this", "the")) out += w else out += s
            i = j
        } else { out += w; i++ }
    }
    return out
}

private fun lev(a: String, b: String): Int {
    val dp = IntArray(b.length + 1) { it }
    for (i in 1..a.length) {
        var prev = dp[0]; dp[0] = i
        for (j in 1..b.length) { val t = dp[j]; dp[j] = minOf(dp[j] + 1, dp[j - 1] + 1, prev + if (a[i - 1] == b[j - 1]) 0 else 1); prev = t }
    }
    return dp[b.length]
}

/** Loose word match for speech: same word, a near miss, or a shared stem ("compound" ~ "compounds"). */
fun wordsMatch(a: String, b: String): Boolean {
    if (a == b) return true
    if (a.length >= 5 && b.length >= 5 && a.take(5) == b.take(5)) return true
    val n = max(a.length, b.length)
    return n >= 5 && lev(a, b) <= 1
}

fun contentWords(text: String): List<String> = normalizeSpeech(text).filter { it !in STOP && (it.length >= 3 || it.any(Char::isDigit)) }.distinct()

enum class Verdict { RIGHT, WRONG, UNCLEAR }

private fun tokenMatch(heard: String, key: String) =
    if (key.any(Char::isDigit)) heard == key else wordsMatch(heard, key) || (key.length >= 4 && heard.startsWith(key))

/** True when every word of [phrase] was heard (stems like "appreciat" match "appreciation"). */
fun phraseHeard(said: String, phrase: String): Boolean {
    val heard = normalizeSpeech(said)
    val need = normalizeSpeech(phrase)
    return need.isNotEmpty() && need.all { k -> heard.any { tokenMatch(it, k) } }
}

private fun optionCoverage(said: String, option: String): Float {
    val keys = contentWords(option)
    if (keys.isEmpty()) return 0f
    val heard = normalizeSpeech(said)
    val hit = keys.map { k -> heard.any { tokenMatch(it, k) } }
    // A number in the answer has to be the right number: "365 times better" is not "37 times better".
    if (keys.indices.any { keys[it].any(Char::isDigit) && !hit[it] }) return 0f
    return hit.count { it }.toFloat() / keys.size
}

/**
 * Judges an open (typed) answer to a multiple-choice card. RIGHT when it clearly carries the right answer, WRONG
 * when it clearly matches one of the wrong options instead, otherwise UNCLEAR (the listener self-checks).
 */
fun judgeOpen(said: String, card: Mcq): Verdict {
    DRIVE_OPEN[card.id]?.let { o ->
        if (o.keys.count { phraseHeard(said, it) } >= o.need) return Verdict.RIGHT
    }
    val right = optionCoverage(said, card.options[card.answer])
    if (right >= 0.5f) return Verdict.RIGHT
    val wrong = card.options.indices.filter { it != card.answer }.maxOf { optionCoverage(said, card.options[it]) }
    if (wrong >= 0.6f && right < 0.3f) return Verdict.WRONG
    return Verdict.UNCLEAR
}

/** Splits narration into sentences so pausing and resuming can pick up mid-paragraph. */
fun sentences(text: String): List<String> =
    text.split(Regex("(?<=[.!?])\\s+")).map { it.trim() }.filter { it.isNotEmpty() }
