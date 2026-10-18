package com.aidantorrence.syncstudy

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

/*
 * Drive mode: hands-free study for the car, a walk or the gym.
 *
 * A session is a planned list of segments (narrate a paragraph, ask a question, review a due card, free recall)
 * played through a DriveIO: a voice, chimes and a listener. Questions are rewritten for listening (two-option
 * "this or that" instead of four options, spoken blanks, out-loud explanations scored by key words), answers are
 * judged from the speech transcript, and everything is recorded in the same spaced-repetition schedule as the
 * rest of the app. Nothing ever waits on the listener: silence just reveals the answer and moves on.
 */

enum class VoiceRole { NARRATOR, COACH }
enum class Chime { QUESTION, LISTEN, RIGHT, WRONG, DONE }
enum class Button { NEXT, PREVIOUS }

sealed class Heard {
    data class Words(val text: String, val alternatives: List<String> = listOf(text)) : Heard()
    data object Silence : Heard()
    /** Speech recognition can't run (no recognizer, no permission, no connection). */
    data object Unavailable : Heard()
}

/** Speaker, chimes and microphone. Suspends until each action finishes; cancellation must stop it promptly. */
interface DriveIO {
    suspend fun say(text: String, role: VoiceRole)
    suspend fun chime(c: Chime)
    suspend fun listen(maxMs: Long): Heard
    fun setNarrationSpeed(speed: Float) {}
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
    val voiceAnswers: Boolean = true,
    val speed: Float = 1.15f,
    val charsPerSecond: Float = DEFAULT_CHARS_PER_SECOND,
)

/** Waiting times, adjustable for tests. */
data class DriveTimings(
    val answerMs: Long = 8_000,
    val explainMs: Long = 16_000,
    val yesNoMs: Long = 5_000,
    val thinkMs: Long = 5_000,
    val buttonMs: Long = 7_000,
    val recallMs: Long = 22_000,
    val recallRounds: Int = 3,
    val silentRecallMs: Long = 30_000,
)

sealed class Segment {
    data class Line(val text: String) : Segment()
    data class Pretest(val card: Mcq) : Segment()
    data class Learn(val bookId: String, val paragraph: Int) : Segment()
    data class Ask(val card: Card, val label: String) : Segment()
    data class Recall(val bookId: String) : Segment()
    data object Outro : Segment()
}

enum class DrivePhase { IDLE, SPEAKING, NARRATING, QUESTION, LISTENING, THINKING, AWAIT_BUTTON, FEEDBACK, RECALL, PAUSED, DONE }

data class DriveState(
    val running: Boolean = false,
    val phase: DrivePhase = DrivePhase.IDLE,
    val title: String = "",
    val label: String = "",
    val line: String = "",
    val heard: String = "",
    val segment: Int = 0,
    val segments: Int = 0,
    val asked: Int = 0,
    val right: Int = 0,
    val speed: Float = 1f,
    val voiceAnswers: Boolean = true,
)

// ---- planning ----------------------------------------------------------------------------------------

private const val SECONDS_PER_QUESTION = 28f
private const val SECONDS_PER_RECALL = 80f

/**
 * Builds a session of about [DriveSettings.minutes]: a short intro, up to two warm-up reviews, two spoken
 * pretest guesses if the book is new, then paragraphs of the book with each paragraph's check question asked
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
        if (memory.isNew(b.id) && start == 0) study?.pretest?.take(2)?.forEach { plan += Segment.Pretest(it); used += 18f }
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
        if (s.voiceAnswers) append("Answer out loud after the chime. You can say repeat, skip, or I don't know.")
        else append("After each question, think of your answer. Press next if you knew it, back if you didn't.")
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
        is Segment.Pretest -> 18.0
        is Segment.Recall -> SECONDS_PER_RECALL.toDouble()
        is Segment.Line -> seg.text.length / 15.0
        Segment.Outro -> 10.0
    }
}.toFloat()

// ---- questions rewritten for listening -------------------------------------------------------------

class SpokenQuestion(val prompt: String, val answer: String, val options: List<String> = emptyList(), val correct: Int = -1)

/** Two-option version of a multiple-choice card: the right answer and one wrong one, in a varying order. */
fun spoken(card: Card, salt: Int = 0): SpokenQuestion = when (card) {
    is Mcq -> {
        val wrong = card.options.indices.filter { it != card.answer }
        val distractor = wrong[abs((card.id.hashCode() * 31 + salt) % wrong.size)]
        val rightFirst = (card.id.hashCode() + salt) % 2 == 0
        val opts = if (rightFirst) listOf(card.options[card.answer], card.options[distractor]) else listOf(card.options[distractor], card.options[card.answer])
        SpokenQuestion("${card.question} Is it: ${opts[0].trimEnd('.')}? Or: ${opts[1].trimEnd('.')}?", card.options[card.answer], opts, if (rightFirst) 0 else 1)
    }
    is Cloze -> SpokenQuestion(card.text.replace("___", "blank") + " What's the missing ${if (card.answer.contains(' ')) "phrase" else "word"}?", card.answer)
    is Recall -> SpokenQuestion(card.prompt + " Answer out loud.", card.answer)
}

/** Short explanation spoken after an answer. */
fun explanation(card: Card): String = when (card) {
    is Mcq -> card.why
    is Cloze -> card.text.replace("___", card.answer)
    is Recall -> card.answer
}

// ---- understanding speech ---------------------------------------------------------------------------

enum class Command { REPEAT, SKIP, DONT_KNOW, PAUSE, SLOWER, FASTER, DONE }

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

/** The key words of a model answer, used to judge an out-loud explanation. */
fun keywords(text: String, max: Int = 8): List<String> = contentWords(text).filter { it.length >= 4 || it.any(Char::isDigit) }.take(max)

fun coverage(said: String, keys: List<String>): Float {
    if (keys.isEmpty()) return 0f
    val heard = contentWords(said)
    return keys.count { k -> heard.any { wordsMatch(it, k) } }.toFloat() / keys.size
}

fun command(text: String): Command? {
    val w = normalizeSpeech(text)
    val s = w.joinToString(" ")
    if (listOf("don't know", "dont know", "do not know", "no idea", "not sure", "dunno", "no clue").any { it in s } || s == "pass") return Command.DONT_KNOW
    if (w.size > 4) return null
    return when {
        w.any { it in setOf("repeat", "again", "pardon", "what") } -> Command.REPEAT
        w.any { it in setOf("skip", "next") } -> Command.SKIP
        w.any { it in setOf("pause", "stop", "wait", "hold") } -> Command.PAUSE
        w.any { it in setOf("slower", "slow") } -> Command.SLOWER
        w.any { it in setOf("faster", "fast", "quicker") } -> Command.FASTER
        w.any { it in setOf("done", "finished", "that's", "thats") } && w.size <= 3 -> Command.DONE
        else -> null
    }
}

fun yesNo(text: String): Boolean? {
    val w = normalizeSpeech(text)
    return when {
        w.any { it in setOf("yes", "yeah", "yep", "yup", "sure", "correct", "right", "did", "got") } -> true
        w.any { it in setOf("no", "nope", "nah", "didn't", "missed", "wrong") } -> false
        else -> null
    }
}

enum class Verdict { RIGHT, WRONG, UNCLEAR }

/** Which of two spoken options was chosen ("the first one", "B", or words from an option). */
fun judgeEitherOr(said: String, q: SpokenQuestion): Verdict {
    val w = normalizeSpeech(said)
    val s = " ${w.joinToString(" ")} "
    val pick = when {
        listOf(" first ", " option a ", " letter a ", " the a ").any { it in s } || w == listOf("a") || w == listOf("ay") -> 0
        listOf(" second ", " option b ", " letter b ", " last ", " latter ").any { it in s } || w == listOf("b") || w == listOf("be") || w == listOf("bee") -> 1
        else -> {
            val scores = q.options.map { opt ->
                val keys = contentWords(opt)
                if (keys.isEmpty()) 0f else keys.count { k -> w.any { wordsMatch(it, k) } }.toFloat() / keys.size
            }
            when {
                scores[0] >= 0.34f && scores[0] > scores[1] + 0.15f -> 0
                scores[1] >= 0.34f && scores[1] > scores[0] + 0.15f -> 1
                else -> -1
            }
        }
    }
    return when (pick) { -1 -> Verdict.UNCLEAR; q.correct -> Verdict.RIGHT; else -> Verdict.WRONG }
}

/** A fill-in-the-blank is right when every word of an accepted answer was said. */
fun judgeCloze(said: String, card: Cloze): Boolean {
    val heard = normalizeSpeech(said)
    return (listOf(card.answer) + card.accept).any { a ->
        val need = normalizeSpeech(a).filter { it !in setOf("the", "a", "an") }
        need.isNotEmpty() && need.all { n -> heard.any { wordsMatch(it, n) || it.trimEnd('x') == n.trimEnd('x') } }
    }
}

/** Free recall: which key ideas were covered (at least two key words, or half of them). */
fun recalledIdeas(said: String, ideas: List<String>): List<Boolean> = ideas.map { idea ->
    val keys = keywords(idea, 5)
    val hit = keys.count { k -> contentWords(said).any { wordsMatch(it, k) } }
    hit >= 2 || (keys.isNotEmpty() && hit * 2 >= keys.size)
}

/** Splits narration into sentences so pausing and resuming can pick up mid-paragraph. */
fun sentences(text: String): List<String> =
    text.split(Regex("(?<=[.!?])\\s+")).map { it.trim() }.filter { it.isNotEmpty() }
