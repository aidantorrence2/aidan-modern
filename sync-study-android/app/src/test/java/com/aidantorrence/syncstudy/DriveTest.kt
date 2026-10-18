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
    val records = mutableListOf<Triple<String, Grade, Boolean>>()
    val paragraphs = HashMap<String, Int>()
    val finished = mutableListOf<String>()
    override fun record(card: Card, grade: Grade, correct: Boolean) { records += Triple(card.id, grade, correct) }
    override fun due() = dueCards
    override fun paragraph(bookId: String) = paragraphs[bookId] ?: 0
    override fun setParagraph(bookId: String, p: Int) { paragraphs[bookId] = p }
    override fun isNew(bookId: String) = new
    override fun startBook(bookId: String) { new = false }
    override fun finishBook(bookId: String) { finished += bookId }
}

class DriveTest {
    private val fast = DriveTimings(thinkMs = 30, gradeMs = 30, recallMs = 30)
    private val atomic = studyFor("atomic-habits")!!
    private fun mcq(p: Int) = atomic.checkpoints.getValue(p)
    private val cloze = atomic.cards.filterIsInstance<Cloze>().first { it.answer == "majority" }
    private val explain = atomic.cards.filterIsInstance<Recall>().first { it.paragraph == 0 }

    private fun run(plan: List<Segment>, io: FakeIO, mem: FakeMemory = FakeMemory(new = false)) = runBlocking {
        DriveEngine(io, mem, DriveSettings("atomic-habits"), fast).run(plan)
        mem
    }

    // ---- judging typed answers ----

    @Test fun spokenNumbersBecomeDigits() {
        assertEquals(listOf("37"), normalizeSpeech("thirty seven"))
        assertEquals(listOf("0.03"), normalizeSpeech("zero point zero three"))
        assertEquals(listOf("about", "37", "times"), normalizeSpeech("About 37 times!"))
        assertEquals(listOf("the", "first", "one"), normalizeSpeech("the first one"))
    }

    @Test fun questionsAreAskedWithoutReadingOutOptions() {
        for (s in STUDY.values) for (c in s.cards.filterIsInstance<Mcq>()) {
            val prompt = spoken(c).prompt
            c.options.forEach { o -> assertFalse("${c.id} reads out \"$o\"", prompt.contains(o.trimEnd('.'), ignoreCase = true) && o.length > 12) }
            assertFalse("${c.id} needs an open rewrite: $prompt", Regex("(?i)which (of these|reply|opening|approach|action|task|response)").containsMatchIn(prompt))
        }
        for (s in STUDY.values) for (c in s.cards.filterIsInstance<Mcq>()) assertEquals("${c.id} model answer", Verdict.RIGHT, judgeOpen(spoken(c).answer, c))
        DRIVE_OPEN.keys.forEach { id -> assertTrue("$id is not a card", STUDY.values.any { s -> s.cards.any { it.id == id && it is Mcq } }) }
    }

    @Test fun openAnswersAreJudgedAgainstTheRightOption() {
        assertEquals(Verdict.RIGHT, judgeOpen("systems", mcq(8)))
        assertEquals(Verdict.RIGHT, judgeOpen("I think it's your systems", mcq(8)))
        assertEquals(Verdict.WRONG, judgeOpen("habits", mcq(8)))
        assertEquals(Verdict.UNCLEAR, judgeOpen("banana", mcq(8)))
        assertEquals(Verdict.RIGHT, judgeOpen("about thirty seven times better", mcq(0)))
        assertEquals(Verdict.WRONG, judgeOpen("about 365 times better", mcq(0)))
        val ii = atomic.cards.first { it.id == "atomic-habits:3:0" } as Mcq
        assertEquals(Verdict.RIGHT, judgeOpen("it's a plan for exactly when and where you'll do it", ii))
        assertEquals(Verdict.UNCLEAR, judgeOpen("trying harder", ii))
    }

    @Test fun everyParagraphHasASpokenTakeaway() {
        for (b in LIBRARY) assertEquals(b.id, Document(b.summary).paragraphs.size, DRIVE_RECAPS[b.id]?.size)
    }

    // ---- planning ----

    @Test fun planNarratesInOrderAndAsksEachCheckOneParagraphLater() {
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 90), FakeMemory())
        assertTrue(plan.first() is Segment.Line)
        assertTrue(plan.last() is Segment.Outro)
        assertTrue("no pre-read questions", plan.none { it is Segment.Ask && it.label != "Check" && it.card.bookId == "atomic-habits" })
        val learns = plan.filterIsInstance<Segment.Learn>().filter { it.bookId == "atomic-habits" }.map { it.paragraph }
        assertEquals((0..8).toList(), learns)
        for (p in 0..8) {
            val ask = plan.indexOfFirst { it is Segment.Ask && it.card == mcq(p) }
            val learnedAt = plan.indexOfFirst { it is Segment.Learn && it.paragraph == p }
            assertTrue("check $p after its paragraph", ask > learnedAt)
            if (p < 8) assertTrue("check $p comes after the next paragraph", ask > plan.indexOfFirst { it is Segment.Learn && it.paragraph == p + 1 })
        }
        assertTrue(plan.indexOfFirst { it is Segment.Recall } > plan.indexOfLast { it is Segment.Learn && it.bookId == "atomic-habits" })
    }

    @Test fun shortSessionsStopEarlyButStillAskTheLastCheck() {
        val settings = DriveSettings("atomic-habits", minutes = 5)
        val plan = buildDrivePlan(settings, FakeMemory())
        val learns = plan.filterIsInstance<Segment.Learn>()
        assertTrue(learns.size in 1..8)
        assertTrue("fits the time budget", planSeconds(plan, settings) <= 5 * 60 * 1.15f)
        val last = learns.last().paragraph
        assertTrue(plan.any { it is Segment.Ask && it.card == mcq(last) })
        assertFalse(plan.any { it is Segment.Recall })
    }

    @Test fun finishedBookBecomesReviewOnly() {
        val mem = FakeMemory(dueCards = atomic.cards.take(5), new = false).apply { paragraphs["atomic-habits"] = 9 }
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 10), mem)
        assertFalse(plan.any { it is Segment.Learn || it is Segment.Recall })
        assertEquals(5, plan.count { it is Segment.Ask })
    }

    // ---- the engine ----

    @Test fun questionPausesInSilenceThenReadsTheAnswerWithoutListening() {
        val io = FakeIO()
        val mem = run(listOf(Segment.Ask(mcq(8), "Check")), io)
        val q = io.log.indexOfFirst { it.contains(mcq(8).question) }
        val a = io.log.indexOfFirst { it.contains("The answer: systems") }
        assertTrue("asked, then answered: ${io.log}", q in 0 until a)
        assertFalse("no options read out", io.log.any { "habits?" in it || "Or:" in it })
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

    private fun pressDuring(card: Card, phase: DrivePhase, b: Button, thinkMs: Long = 30, gradeMs: Long = 30): Pair<FakeIO, FakeMemory> = runBlocking {
        val io = FakeIO()
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), DriveTimings(thinkMs = thinkMs, gradeMs = gradeMs, recallMs = 30))
        val job = launch { e.run(listOf(Segment.Ask(card, "Check"))) }
        try {
            withTimeout(3_000) { e.state.first { it.phase == phase } }
        } catch (t: Throwable) { throw AssertionError("state=${e.state.value} log=${io.log}", t) }
        e.press(b)
        job.join()
        io to mem
    }

    @Test fun nextDuringThePauseRevealsTheAnswerEarly() {
        val (io, mem) = pressDuring(mcq(8), DrivePhase.THINKING, Button.NEXT, thinkMs = 60_000)
        assertTrue(io.log.any { it.contains("The answer: systems") })
        assertTrue(mem.records.isEmpty())
    }

    @Test fun backDuringThePauseAsksAgain() = runBlocking {
        val io = FakeIO()
        val e = DriveEngine(io, FakeMemory(new = false), DriveSettings("atomic-habits"), DriveTimings(thinkMs = 60_000, gradeMs = 30, recallMs = 30))
        val job = launch { e.run(listOf(Segment.Ask(mcq(8), "Check"))) }
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.THINKING } }
        e.press(Button.PREVIOUS)
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.THINKING && io.log.count { l -> l.contains(mcq(8).question) } == 2 } }
        e.press(Button.NEXT)
        job.join()
        assertTrue(io.log.any { it.contains("The answer: systems") })
    }

    @Test fun pressesWhileTheAnswerIsReadGradeTheCard() {
        assertEquals(listOf(Triple(mcq(8).id, Grade.GOOD, true)), pressDuring(mcq(8), DrivePhase.FEEDBACK, Button.NEXT, gradeMs = 60_000).second.records)
        assertEquals(Grade.AGAIN, pressDuring(cloze, DrivePhase.FEEDBACK, Button.PREVIOUS, gradeMs = 60_000).second.records.single().second)
    }

    @Test fun explainAndBlankCardsReadTheirAnswers() {
        val io = FakeIO()
        run(listOf(Segment.Ask(explain, "Review"), Segment.Ask(cloze, "Review")), io)
        assertTrue(io.log.any { it.contains("A strong answer: ${explain.answer}") })
        assertTrue(io.log.any { it.contains("The answer: majority") })
        assertFalse(io.log.any { it.contains("out loud") })
    }

    @Test fun skippingNarrationMovesOnWithoutMarkingTheParagraphRead() = runBlocking {
        val io = FakeIO().apply { narrateDelay = 200 }
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), fast)
        val job = launch { e.run(listOf(Segment.Learn("atomic-habits", 3), Segment.Line("after"))) }
        withTimeout(3_000) { e.state.first { it.phase == DrivePhase.NARRATING } }
        e.press(Button.NEXT)
        job.join()
        assertNull(mem.paragraphs["atomic-habits"])
        assertTrue(io.log.last().endsWith("after"))
        assertFalse(io.log.any { it.contains(recapFor("atomic-habits", 3)!!) })
    }

    @Test fun pauseResumesAtTheSameSentence() = runBlocking {
        val io = FakeIO().apply { narrateDelay = 120 }
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
        assertEquals(1, mem.paragraphs["atomic-habits"])
    }

    @Test fun brainDumpPausesThenReadsTheKeyIdeasAndFinishesTheBook() {
        val io = FakeIO()
        val mem = run(listOf(Segment.Recall("atomic-habits")), io)
        assertEquals(listOf("atomic-habits"), mem.finished)
        atomic.keyIdeas.forEach { idea -> assertTrue(idea, io.log.any { it.endsWith(idea) }) }
    }

    @Test fun fullSessionRunsEndToEnd() {
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 90), FakeMemory())
        val mem = FakeMemory()
        val io = FakeIO()
        runBlocking { DriveEngine(io, mem, DriveSettings("atomic-habits", minutes = 90), fast).run(plan) }
        assertEquals(9, mem.paragraphs["atomic-habits"])
        assertEquals("atomic-habits", mem.finished.first())
        assertTrue("no presses, no grades", mem.records.isEmpty())
        assertEquals(9, io.log.count { it.contains("The answer:") && atomic.checkpoints.values.any { c -> it.contains(c.why) } })
        assertNotNull(io.log.lastOrNull { it.contains("That's the session") })
    }

    @Test fun shortBookCarriesOnIntoTheNextUnfinishedOne() {
        val plan = buildDrivePlan(DriveSettings("carnegie", minutes = 25), FakeMemory())
        val books = plan.filterIsInstance<Segment.Learn>().map { it.bookId }.distinct()
        assertEquals("carnegie", books.first())
        assertTrue("continues into another book: $books", books.size >= 2)
        assertTrue(plan.any { it is Segment.Line && it.text.startsWith("Next up") })
        val recall = plan.indexOfFirst { it is Segment.Recall && it.bookId == "carnegie" }
        assertTrue(recall in 0 until plan.indexOfFirst { it is Segment.Learn && it.bookId != "carnegie" })
    }
}
