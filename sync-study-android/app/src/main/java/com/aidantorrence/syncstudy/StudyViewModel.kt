package com.aidantorrence.syncstudy

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

sealed class Route {
    data class Home(val tab: Int = 0) : Route()
    data class Intro(val bookId: String) : Route()
    data class Pretest(val bookId: String, val index: Int = 0) : Route()
    data class Read(val bookId: String, val quiz: Boolean = true) : Route()
    data class Recall(val bookId: String) : Route()
    data class Summary(val bookId: String) : Route()
    data object Review : Route()
}

/** A review session: a queue of card ids, worked through front to back. Missed cards are re-queued. */
data class ReviewSession(
    val queue: List<String>,
    val pos: Int = 0,
    val answered: Int = 0,
    val correct: Int = 0,
    val relearned: Int = 0,
    val firstTry: Set<String> = emptySet(),
) {
    val done: Boolean get() = pos >= queue.size
    val current: Card? get() = queue.getOrNull(pos)?.let { cardById(it) }
}

class StudyViewModel(app: Application) : AndroidViewModel(app) {

    init { StudyStore.init(app) }

    private val _route = MutableStateFlow<Route>(Route.Home())
    val route: StateFlow<Route> = _route.asStateFlow()

    private val _session = MutableStateFlow<ReviewSession?>(null)
    val session: StateFlow<ReviewSession?> = _session.asStateFlow()

    /** Checkpoint results from the current reading of each book: paragraph → answered correctly. */
    val checkpointResults = HashMap<String, MutableMap<Int, Boolean>>()

    fun go(r: Route) { _route.value = r }

    /** System back. Returns false when already at the top level (let the app close). */
    fun back(): Boolean {
        _route.value = when (val r = _route.value) {
            is Route.Home -> if (r.tab != 0) Route.Home(0) else return false
            is Route.Intro -> Route.Home(0)
            is Route.Pretest -> Route.Intro(r.bookId)
            is Route.Read -> if (r.bookId == CUSTOM_BOOK_ID) Route.Home(0) else Route.Intro(r.bookId)
            is Route.Recall -> Route.Intro(r.bookId)
            is Route.Summary -> Route.Home(0)
            Route.Review -> Route.Home(1)
        }
        return true
    }

    // ---- book flow -----------------------------------------------------------------------------------

    fun startBook(bookId: String) {
        val study = studyFor(bookId)
        val unanswered = study?.pretest?.indexOfFirst { StudyStore.pretestChoice(it.id) == null } ?: -1
        _route.value = if (StudyStore.stage(bookId) == Stage.NEW && unanswered >= 0) Route.Pretest(bookId, unanswered) else Route.Read(bookId)
    }

    fun answerPretest(bookId: String, index: Int, choice: Int) {
        val pre = studyFor(bookId)?.pretest ?: return
        pre.getOrNull(index)?.let { StudyStore.setPretest(it.id, choice) }
        if (index + 1 < pre.size) {
            _route.value = Route.Pretest(bookId, index + 1)
        } else {
            StudyStore.advance(bookId, Stage.PRETESTED)
            checkpointResults.remove(bookId)
            _route.value = Route.Read(bookId)
        }
    }

    fun recordCheckpoint(card: Mcq, correct: Boolean, confidence: Confidence) {
        StudyStore.record(card, Scheduler.grade(correct, confidence), correct)
        checkpointResults.getOrPut(card.bookId) { mutableMapOf() }[card.paragraph] = correct
    }

    fun finishReading(bookId: String) {
        StudyStore.advance(bookId, Stage.READ)
        _route.value = Route.Recall(bookId)
    }

    fun finishRecall(bookId: String, recalled: Int, total: Int) {
        StudyStore.setRecallScore(bookId, if (total == 0) 0f else recalled.toFloat() / total)
        StudyStore.advance(bookId, Stage.DONE)
        StudyStore.introduce(bookId)
        _route.value = Route.Summary(bookId)
    }

    // ---- review --------------------------------------------------------------------------------------

    /** Builds an interleaved queue of due cards (optionally one book), up to [limit]. */
    fun startReview(bookId: String? = null, limit: Int = 25) {
        val now = System.currentTimeMillis()
        val due = StudyStore.due(now).filter { bookId == null || it.bookId == bookId }
            .sortedBy { StudyStore.state(it.id)?.due ?: 0L }
        val byBook = due.groupBy { it.bookId }.values.map { cards -> cards.shuffled(java.util.Random(now)) }
        val queue = interleave(byBook).take(limit).map { it.id }
        _session.value = ReviewSession(queue)
        _route.value = Route.Review
    }

    fun answerReview(card: Card, grade: Grade, correct: Boolean) {
        StudyStore.record(card, grade, correct)
        _session.update { s ->
            if (s == null) return@update null
            var q = s.queue
            var relearned = s.relearned
            if (grade == Grade.AGAIN) {
                // successive relearning: see it again a few cards later in this session
                val at = minOf(q.size, s.pos + 4)
                q = q.toMutableList().apply { add(at, card.id) }
                relearned++
            }
            val first = card.id !in s.firstTry
            s.copy(
                queue = q, pos = s.pos + 1, answered = s.answered + 1,
                correct = s.correct + if (correct && first) 1 else 0,
                relearned = relearned, firstTry = s.firstTry + card.id,
            )
        }
    }

    fun endReview() { _session.value = null; _route.value = Route.Home(1) }
}
