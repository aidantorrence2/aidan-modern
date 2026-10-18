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
    fun record(card: Card, grade: Grade)
    /** Due cards, oldest first. */
    fun due(): List<Card>
    /** The next section to narrate. */
    fun section(bookId: String): Int
    fun setSection(bookId: String, s: Int)
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
    data class Learn(val bookId: String, val section: Int) : Segment()
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
 * Builds a session of about [DriveSettings.minutes]: a short intro, up to two warm-up reviews, then sections of the book,
 * with each section's key flashcards asked one section later (a short lag makes retrieval effortful) and due reviews
 * woven in between. If the book is finished, a free-recall segment closes it out; spare time goes to more reviews.
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
        memory.section(it.id) < it.document.sections.size && !(memory.section(it.id) == 0 && !memory.isNew(it.id)) }
    val covered = mutableListOf<Pair<Book, Int>>()
    for (b in order) {
        if (b != book && used + 90f > budget) break
        val study = studyFor(b.id)
        val doc = b.document
        val start = memory.section(b.id).coerceIn(0, doc.sections.size)
        if (start >= doc.sections.size) continue
        if (b != book) plan += Segment.Line("Next up: ${b.title}.")
        var p = start
        var pending: List<Card> = emptyList()
        while (p < doc.sections.size) {
            val narrate = sectionSeconds(doc, p, s)
            if (p > start && used + narrate + SECONDS_PER_QUESTION * pending.size > budget) break
            plan += Segment.Learn(b.id, p)
            used += narrate
            pending.forEach { plan += Segment.Ask(it, "Check"); used += SECONDS_PER_QUESTION }
            pending = study?.checks(p).orEmpty()
            if (due.isNotEmpty() && used + SECONDS_PER_QUESTION < budget) { plan += Segment.Ask(due.removeFirst(), "Review"); used += SECONDS_PER_QUESTION }
            p++
        }
        pending.forEach { plan += Segment.Ask(it, "Check"); used += SECONDS_PER_QUESTION }
        covered += b to (p - start)
        // Close out a book with free recall only when this session reached its end.
        if (p >= doc.sections.size && study != null) { plan += Segment.Recall(b.id); used += SECONDS_PER_RECALL } else break
    }
    while (due.isNotEmpty() && used + SECONDS_PER_QUESTION <= budget) { plan += Segment.Ask(due.removeFirst(), "Review"); used += SECONDS_PER_QUESTION }

    val reviews = plan.count { it is Segment.Ask && it.label != "Check" }
    val intro = buildString {
        append("Drive session, about ${max(1, (used / 60f).toInt())} minutes. ")
        val first = covered.firstOrNull()
        when {
            first != null && first.second > 0 -> {
                val start = memory.section(first.first.id)
                append("${first.first.title}: ${if (start == 0) "from the start" else "picking up where you left off"}, ${first.second} ${if (first.second == 1) "section" else "sections"}. ")
                if (covered.size > 1) append("Then ${covered.drop(1).joinToString(" and ") { it.first.title }}. ")
            }
            else -> append("You've finished ${book.title}, so this one is all review. ")
        }
        if (reviews > 0) append("Plus $reviews review ${if (reviews == 1) "card" else "cards"}. ")
        append("After each question, answer in your head. The answer comes ten seconds later.")
    }
    return listOf(Segment.Line(intro)) + plan + Segment.Outro
}

private fun sectionSeconds(doc: Document, p: Int, s: DriveSettings): Float {
    val r = doc.sections[p]
    return (doc.words[r.last].end - doc.words[r.first].start) / (s.charsPerSecond * s.speed) + 10f
}

/** Rough length of a plan in seconds, for the setup screen. */
fun planSeconds(plan: List<Segment>, s: DriveSettings): Float = plan.sumOf { seg ->
    when (seg) {
        is Segment.Learn -> sectionSeconds(findBook(seg.bookId)!!.document, seg.section, s).toDouble()
        is Segment.Ask -> SECONDS_PER_QUESTION.toDouble()
        is Segment.Recall -> SECONDS_PER_RECALL.toDouble()
        is Segment.Line -> seg.text.length / 15.0
        Segment.Outro -> 10.0
    }
}.toFloat()

/** Splits narration into sentences so pausing and resuming can pick up mid-section. */
fun sentences(text: String): List<String> =
    text.split(Regex("(?<=[.!?])\\s+")).map { it.trim() }.filter { it.isNotEmpty() }
