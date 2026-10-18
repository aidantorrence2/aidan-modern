package com.aidantorrence.syncstudy

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.ZoneId

/** Where a reader is with a book. */
object Stage { const val NEW = 0; const val STARTED = 1; const val READ = 2; const val DONE = 3 }

/** Persistent study progress: card memory, book stages and the daily review log. */
object StudyStore {
    private var prefs: SharedPreferences? = null
    private val states = HashMap<String, CardState>()
    private val stages = HashMap<String, Int>()
    private val recall = HashMap<String, Float>()
    private val log = HashMap<Long, IntArray>()
    private val _version = MutableStateFlow(0)
    /** Bumps whenever anything changes, so screens can recompose. */
    val version: StateFlow<Int> = _version.asStateFlow()

    fun init(context: Context) {
        if (prefs != null) return
        prefs = context.getSharedPreferences("study", Context.MODE_PRIVATE)
        load()
    }

    fun day(now: Long): Long = Instant.ofEpochMilli(now).atZone(ZoneId.systemDefault()).toLocalDate().toEpochDay()

    // ---- cards --------------------------------------------------------------------------------------
    fun state(id: String): CardState? = states[id]

    /** Records a flashcard answer; anything but AGAIN counts as known. */
    fun record(card: Card, grade: Grade, now: Long = System.currentTimeMillis()) {
        states[card.id] = Scheduler.next(states[card.id], grade, now)
        val d = day(now)
        val e = log.getOrPut(d) { IntArray(2) }
        e[0]++; if (grade != Grade.AGAIN) e[1]++
        changed()
    }

    /** Makes a finished book's unseen cards available for review right away. */
    fun introduce(bookId: String, now: Long = System.currentTimeMillis()) {
        studyFor(bookId)?.cards?.forEach { if (states[it.id] == null) states[it.id] = CardState(due = now) }
        changed()
    }

    fun due(now: Long = System.currentTimeMillis()): List<Card> =
        STUDY.values.flatMap { it.cards }.filter { c -> states[c.id]?.let { it.due <= now } == true }

    fun dueCount(bookId: String? = null, now: Long = System.currentTimeMillis()): Int =
        due(now).count { bookId == null || it.bookId == bookId }

    fun dueWithin(days: Int, now: Long = System.currentTimeMillis()): Int {
        val limit = now + days * Scheduler.DAY
        return states.values.count { it.due in (now + 1)..limit }
    }

    fun mastery(bookId: String): Float {
        val cards = studyFor(bookId)?.cards ?: return 0f
        if (cards.isEmpty()) return 0f
        return cards.sumOf { Scheduler.strength(states[it.id]).toDouble() }.toFloat() / cards.size
    }

    fun cardsStarted(): Int = states.size

    // ---- book flow ----------------------------------------------------------------------------------
    fun stage(bookId: String): Int = stages[bookId] ?: Stage.NEW
    fun advance(bookId: String, to: Int) { if (to > stage(bookId)) { stages[bookId] = to; changed() } }

    fun setRecallScore(bookId: String, score: Float) { recall[bookId] = score; changed() }
    fun recallScore(bookId: String): Float? = recall[bookId]

    // ---- stats -------------------------------------------------------------------------------------
    fun reviewsOn(day: Long): Int = log[day]?.get(0) ?: 0

    /** Consecutive days with at least one answer, ending today (or yesterday, if today has none yet). */
    fun streak(now: Long = System.currentTimeMillis()): Int {
        var d = day(now)
        if (reviewsOn(d) == 0) d -= 1
        var n = 0
        while (reviewsOn(d) > 0) { n++; d-- }
        return n
    }

    fun accuracy(days: Int, now: Long = System.currentTimeMillis()): Float? {
        val today = day(now)
        var total = 0; var right = 0
        for (d in (today - days + 1)..today) log[d]?.let { total += it[0]; right += it[1] }
        return if (total == 0) null else right.toFloat() / total
    }

    fun lastDays(days: Int, now: Long = System.currentTimeMillis()): List<Int> {
        val today = day(now)
        return ((today - days + 1)..today).map { reviewsOn(it) }
    }

    // ---- persistence ------------------------------------------------------------------------------
    private fun changed() { save(); _version.value++ }

    private fun save() {
        val p = prefs ?: return
        val st = JSONObject()
        for ((k, v) in states) st.put(k, JSONArray(listOf(v.ease.toDouble(), v.interval.toDouble(), v.due, v.reps, v.lapses, v.lastReview, if (v.lastCorrect) 1 else 0)))
        val lg = JSONObject()
        for ((k, v) in log) lg.put(k.toString(), JSONArray(listOf(v[0], v[1])))
        p.edit()
            .putString("states", st.toString())
            .putString("stages", JSONObject(stages as Map<*, *>).toString())
            .putString("recall", JSONObject(recall.mapValues { it.value.toDouble() } as Map<*, *>).toString())
            .putString("log", lg.toString())
            .apply()
    }

    private fun load() {
        val p = prefs ?: return
        runCatching {
            val st = JSONObject(p.getString("states", "{}")!!)
            for (k in st.keys()) {
                val a = st.getJSONArray(k)
                states[k] = CardState(a.getDouble(0).toFloat(), a.getDouble(1).toFloat(), a.getLong(2), a.getInt(3), a.getInt(4), a.getLong(5), a.getInt(6) == 1)
            }
            val sg = JSONObject(p.getString("stages", "{}")!!); for (k in sg.keys()) stages[k] = sg.getInt(k)
            val rc = JSONObject(p.getString("recall", "{}")!!); for (k in rc.keys()) recall[k] = rc.getDouble(k).toFloat()
            val lg = JSONObject(p.getString("log", "{}")!!); for (k in lg.keys()) { val a = lg.getJSONArray(k); log[k.toLong()] = intArrayOf(a.getInt(0), a.getInt(1)) }
        }
    }

    /** Test hook: forget everything in memory (does not touch disk). */
    internal fun resetForTest() { states.clear(); stages.clear(); recall.clear(); log.clear(); prefs = null }
}
