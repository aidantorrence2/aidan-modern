package com.aidantorrence.syncstudy

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.yield
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FakeIO : DriveIO {
    val log = mutableListOf<String>()
    var narrateDelay = 0L
    var rate = 0f
    override suspend fun say(text: String, role: VoiceRole) {
        log += "${role.name}: $text"
        if (role == VoiceRole.NARRATOR && narrateDelay > 0) delay(narrateDelay) else yield()
    }
    override suspend fun chime(c: Chime) { log += "chime $c" }
    override fun setSpeed(speed: Float) { rate = speed }
}

class FakeMemory(private val dueCards: List<Card> = emptyList(), var new: Boolean = true) : DriveMemory {
    val records = mutableListOf<Pair<String, Grade>>()
    val sections = HashMap<String, Int>()
    val finished = mutableListOf<String>()
    override fun record(card: Card, grade: Grade) { records += card.id to grade }
    override fun due() = dueCards
    override fun section(bookId: String) = sections[bookId] ?: 0
    override fun setSection(bookId: String, s: Int) { sections[bookId] = s }
    override fun isNew(bookId: String) = new
    override fun startBook(bookId: String) { new = false }
    override fun finishBook(bookId: String) { finished += bookId }
}

class DriveTest {
    private val fast = DriveTimings(thinkMs = 30, gradeMs = 30, recallMs = 30)
    private val atomic = studyFor("atomic-habits")!!
    private val atomicDoc = findBook("atomic-habits")!!.document
    private val sections = atomicDoc.sections.size
    private val card = atomic.checks(2).first()
    private val other = atomic.checks(4).first()

    private fun run(plan: List<Segment>, io: FakeIO, mem: FakeMemory = FakeMemory(new = false)) = runBlocking {
        DriveEngine(io, mem, DriveSettings("atomic-habits"), fast).run(plan)
        mem
    }

    @Test fun everySectionHasASpokenTakeaway() {
        for (b in LIBRARY) assertEquals(b.id, b.document.sections.size, DRIVE_RECAPS[b.id]?.size)
    }

    // ---- planning ----

    @Test fun planNarratesEverySectionAndAsksItsKeyCardsOneSectionLater() {
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 180), FakeMemory())
        assertTrue(plan.first() is Segment.Line)
        assertTrue(plan.last() is Segment.Outro)
        val learns = plan.filterIsInstance<Segment.Learn>().filter { it.bookId == "atomic-habits" }.map { it.section }
        assertEquals((0 until sections).toList(), learns)
        for (p in 0 until sections) {
            val learnedAt = plan.indexOfFirst { it is Segment.Learn && it.section == p && it.bookId == "atomic-habits" }
            for (c in atomic.checks(p)) {
                val ask = plan.indexOfFirst { it is Segment.Ask && it.card == c }
                assertTrue("card ${c.id} after its section", ask > learnedAt)
                if (p < sections - 1) assertTrue("card ${c.id} after the next section", ask > plan.indexOfFirst { it is Segment.Learn && it.section == p + 1 })
            }
        }
        assertTrue(plan.indexOfFirst { it is Segment.Recall } > plan.indexOfLast { it is Segment.Learn && it.bookId == "atomic-habits" })
    }

    @Test fun shortSessionsStopEarlyButStillAskTheLastChecks() {
        val settings = DriveSettings("atomic-habits", minutes = 10)
        val plan = buildDrivePlan(settings, FakeMemory())
        val learns = plan.filterIsInstance<Segment.Learn>()
        assertTrue(learns.size in 1 until sections)
        val last = learns.last().section
        atomic.checks(last).forEach { c -> assertTrue(plan.any { it is Segment.Ask && it.card == c }) }
        assertFalse(plan.any { it is Segment.Recall })
    }

    @Test fun finishedBookBecomesReviewOnly() {
        val mem = FakeMemory(dueCards = atomic.cards.take(5), new = false).apply { sections["atomic-habits"] = this@DriveTest.sections }
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 10), mem)
        assertFalse(plan.any { it is Segment.Learn || it is Segment.Recall })
        assertEquals(5, plan.count { it is Segment.Ask })
    }

    @Test fun finishedBookCarriesOnIntoTheNextUnfinishedOne() {
        val plan = buildDrivePlan(DriveSettings("carnegie", minutes = 180), FakeMemory())
        val books = plan.filterIsInstance<Segment.Learn>().map { it.bookId }.distinct()
        assertEquals("carnegie", books.first())
        assertTrue("continues into another book: $books", books.size >= 2)
        assertTrue(plan.any { it is Segment.Line && it.text.startsWith("Next up") })
        val recall = plan.indexOfFirst { it is Segment.Recall && it.bookId == "carnegie" }
        assertTrue(recall in 0 until plan.indexOfFirst { it is Segment.Learn && it.bookId != "carnegie" })
    }

    // ---- the engine ----

    @Test fun flashcardIsAskedThenAnsweredAfterASilentPause() {
        val io = FakeIO()
        val mem = run(listOf(Segment.Ask(card, "Check")), io)
        val q = io.log.indexOfFirst { it.endsWith(card.front) }
        val a = io.log.indexOfFirst { it.endsWith(card.back) }
        assertTrue("asked, then answered: ${io.log}", q in 0 until a)
        assertTrue("no grade without a press", mem.records.isEmpty())
    }

    @Test fun thePauseLastsTenSecondsByDefault() {
        assertEquals(10_000L, DriveTimings().thinkMs)
    }

    @Test fun everyVoiceUsesTheChosenSpeed() {
        val io = FakeIO()
        runBlocking { DriveEngine(io, FakeMemory(new = false), DriveSettings("atomic-habits", speed = 2.5f), fast).run(listOf(Segment.Line("hi"))) }
        assertEquals(2.5f, io.rate)
    }

    private fun pressDuring(c: Card, phase: DrivePhase, b: Button, thinkMs: Long = 30, gradeMs: Long = 30): Pair<FakeIO, FakeMemory> = runBlocking {
        val io = FakeIO()
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), DriveTimings(thinkMs = thinkMs, gradeMs = gradeMs, recallMs = 30))
        val job = launch { e.run(listOf(Segment.Ask(c, "Check"))) }
        try {
            withTimeout(3_000) { e.state.first { it.phase == phase } }
        } catch (t: Throwable) { throw AssertionError("state=${e.state.value} log=${io.log}", t) }
        e.press(b)
        job.join()
        io to mem
    }

    @Test fun nextDuringThePauseRevealsTheAnswerEarly() {
        val (io, mem) = pressDuring(card, DrivePhase.THINKING, Button.NEXT, thinkMs = 60_000)
        assertTrue(io.log.any { it.endsWith(card.back) })
        assertTrue(mem.records.isEmpty())
    }

    @Test fun backDuringThePauseAsksAgain() = runBlocking {
        val io = FakeIO()
        val e = DriveEngine(io, FakeMemory(new = false), DriveSettings("atomic-habits"), DriveTimings(thinkMs = 60_000, gradeMs = 30, recallMs = 30))
        val job = launch { e.run(listOf(Segment.Ask(card, "Check"))) }
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.THINKING } }
        e.press(Button.PREVIOUS)
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.THINKING && io.log.count { l -> l.endsWith(card.front) } == 2 } }
        e.press(Button.NEXT)
        job.join()
        assertTrue(io.log.any { it.endsWith(card.back) })
    }

    @Test fun pressesWhileTheAnswerIsReadGradeTheCard() {
        assertEquals(listOf(card.id to Grade.GOOD), pressDuring(card, DrivePhase.FEEDBACK, Button.NEXT, gradeMs = 60_000).second.records)
        assertEquals(listOf(other.id to Grade.AGAIN), pressDuring(other, DrivePhase.FEEDBACK, Button.PREVIOUS, gradeMs = 60_000).second.records)
    }

    @Test fun sectionTitleIsAnnouncedBeforeTheNarration() {
        val io = FakeIO()
        run(listOf(Segment.Learn("atomic-habits", 1)), io)
        val title = io.log.indexOfFirst { it.endsWith("Section 2: ${atomicDoc.sectionTitles[1]}.") }
        assertTrue(io.log.toString(), title >= 0 && title < io.log.indexOfFirst { it.startsWith("NARRATOR") })
        assertFalse("headings are not read as text", io.log.any { "##" in it })
    }

    @Test fun skippingNarrationMovesOnWithoutMarkingTheSectionRead() = runBlocking {
        val io = FakeIO().apply { narrateDelay = 200 }
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), fast)
        val job = launch { e.run(listOf(Segment.Learn("atomic-habits", 3), Segment.Line("after"))) }
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.NARRATING } }
        e.press(Button.NEXT)
        job.join()
        assertNull(mem.sections["atomic-habits"])
        assertTrue(io.log.last().endsWith("after"))
        assertFalse(io.log.any { it.contains(recapFor("atomic-habits", 3)!!) })
    }

    @Test fun pauseResumesAtTheSameSentence() = runBlocking {
        val io = FakeIO().apply { narrateDelay = 60 }
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), fast)
        val job = launch { e.run(listOf(Segment.Learn("atomic-habits", 0))) }
        withTimeout(3_000) { e.state.first { s -> io.log.count { it.startsWith("NARRATOR") } >= 2 && s.phase == DrivePhase.NARRATING } }
        e.pause()
        delay(150)
        e.resume()
        job.join()
        val narrated = io.log.filter { it.startsWith("NARRATOR") }
        val first = narrated.first()
        assertEquals("the opening sentence is never replayed", 1, narrated.count { it == first })
        assertEquals(1, io.log.count { it.contains("Section 1:") })
        assertEquals(1, mem.sections["atomic-habits"])
    }

    @Test fun brainDumpPausesThenReadsTheKeyIdeasAndFinishesTheBook() {
        val io = FakeIO()
        val mem = run(listOf(Segment.Recall("atomic-habits")), io)
        assertEquals(listOf("atomic-habits"), mem.finished)
        atomic.keyIdeas.forEach { idea -> assertTrue(idea, io.log.any { it.endsWith(idea) }) }
    }

    @Test fun fullSessionRunsEndToEnd() {
        val settings = DriveSettings("atomic-habits", minutes = 180)
        val plan = buildDrivePlan(settings, FakeMemory())
        val mem = FakeMemory()
        val io = FakeIO()
        runBlocking { DriveEngine(io, mem, settings, fast).run(plan) }
        assertEquals(sections, mem.sections["atomic-habits"])
        assertEquals("atomic-habits", mem.finished.first())
        assertTrue("no presses, no grades", mem.records.isEmpty())
        for (p in 0 until sections) atomic.checks(p).forEach { c -> assertTrue(c.id, io.log.any { it.endsWith(c.back) }) }
        assertNotNull(io.log.lastOrNull { it.contains("That's the session") })
    }
}
