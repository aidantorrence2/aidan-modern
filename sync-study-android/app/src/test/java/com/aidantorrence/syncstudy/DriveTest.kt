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

class FakeIO(vararg heard: Heard) : DriveIO {
    val queue = ArrayDeque(heard.toList())
    val log = mutableListOf<String>()
    var narrateDelay = 0L
    override suspend fun say(text: String, role: VoiceRole) {
        log += "${role.name}: $text"
        if (role == VoiceRole.NARRATOR && narrateDelay > 0) delay(narrateDelay) else yield()
    }
    override suspend fun chime(c: Chime) { log += "chime $c" }
    override suspend fun listen(maxMs: Long): Heard { log += "listen"; return queue.removeFirstOrNull() ?: Heard.Silence }
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
    private val fast = DriveTimings(answerMs = 50, explainMs = 50, yesNoMs = 50, thinkMs = 30, buttonMs = 2_000, recallMs = 50, silentRecallMs = 30)
    private val atomic = studyFor("atomic-habits")!!
    private fun mcq(p: Int) = atomic.checkpoints.getValue(p)
    private val cloze = atomic.cards.filterIsInstance<Cloze>().first { it.answer == "majority" }
    private val explain = atomic.cards.filterIsInstance<Recall>().first { it.paragraph == 0 }

    private fun run(plan: List<Segment>, io: FakeIO, mem: FakeMemory = FakeMemory(new = false), voice: Boolean = true) = runBlocking {
        DriveEngine(io, mem, DriveSettings("atomic-habits", voiceAnswers = voice), fast).run(plan)
        mem
    }

    // ---- understanding speech ----

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
        val ii = atomic.cards.first { it.id == "atomic-habits:3:0" } as Mcq
        assertEquals(Verdict.RIGHT, judgeOpen("it's a plan for exactly when and where you'll do it", ii))
        assertEquals(Verdict.UNCLEAR, judgeOpen("trying harder", ii))
    }

    @Test fun clozeAcceptsNearMissesAndNumbers() {
        assertTrue(judgeCloze("the majority", cloze))
        assertTrue(judgeCloze("majorty", cloze))
        assertFalse(judgeCloze("minority", cloze))
        val pct = atomic.cards.filterIsInstance<Cloze>().first { it.answer == "0.03" }
        assertTrue(judgeCloze("zero point zero three", pct))
        assertTrue(judgeCloze("about three percent", pct))
    }

    @Test fun commandsAndYesNo() {
        assertEquals(Command.REPEAT, command("can you repeat"))
        assertEquals(Command.SKIP, command("skip"))
        assertEquals(Command.DONT_KNOW, command("honestly I don't know this one"))
        assertEquals(Command.SLOWER, command("slower please"))
        assertNull(command("the habit loop has four stages and the second is craving"))
        assertEquals(true, yesNo("yeah I got it"))
        assertEquals(false, yesNo("nope"))
    }

    @Test fun keywordCoverageRewardsTheGist() {
        val keys = keywords(explain.answer)
        assertTrue(coverage("results are delayed, the work builds up below the surface like ice before it melts", keys) >= 0.4f)
        assertTrue(coverage("I am not sure", keys) < 0.2f)
    }

    @Test fun everyParagraphHasASpokenTakeaway() {
        for (b in LIBRARY) assertEquals(b.id, Document(b.summary).paragraphs.size, DRIVE_RECAPS[b.id]?.size)
    }

    // ---- planning ----

    @Test fun planNarratesInOrderAndAsksEachCheckOneParagraphLater() {
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 90), FakeMemory())
        assertTrue(plan.first() is Segment.Line)
        assertTrue(plan.last() is Segment.Outro)
        assertEquals(2, plan.count { it is Segment.Pretest && it.card.bookId == "atomic-habits" })
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

    @Test fun rightSpokenAnswerIsRecordedAsGood() {
        val io = FakeIO(Heard.Words("systems"))
        val mem = run(listOf(Segment.Ask(mcq(8), "Check")), io)
        assertFalse(io.log.any { "habits?" in it || "Or:" in it })
        assertEquals(listOf(Triple(mcq(8).id, Grade.GOOD, true)), mem.records)
    }

    @Test fun wrongSilentAndDontKnowAreAllRelearned() {
        assertEquals(Grade.AGAIN, run(listOf(Segment.Ask(mcq(8), "Check")), FakeIO(Heard.Words("habits"))).records.single().second)
        assertEquals(Grade.AGAIN, run(listOf(Segment.Ask(mcq(8), "Check")), FakeIO(Heard.Silence)).records.single().second)
        assertEquals(Grade.AGAIN, run(listOf(Segment.Ask(mcq(8), "Check")), FakeIO(Heard.Words("I don't know"))).records.single().second)
    }

    @Test fun unclearAnswerIsCheckedAgainstTheModelAnswer() {
        val yes = FakeIO(Heard.Words("something about consistency"), Heard.Words("yes"))
        assertEquals(Grade.GOOD, run(listOf(Segment.Ask(mcq(8), "Check")), yes).records.single().second)
        assertTrue(yes.log.any { it.contains("The answer: systems") })
        assertEquals(Grade.AGAIN, run(listOf(Segment.Ask(mcq(8), "Check")), FakeIO(Heard.Words("something about consistency"), Heard.Words("no"))).records.single().second)
    }

    @Test fun skipRecordsNothing() {
        assertTrue(run(listOf(Segment.Ask(mcq(8), "Check")), FakeIO(Heard.Words("skip"))).records.isEmpty())
    }

    @Test fun repeatAsksAgainThenAccepts() {
        val io = FakeIO(Heard.Words("repeat"), Heard.Words("systems"))
        val mem = run(listOf(Segment.Ask(mcq(8), "Check")), io)
        assertEquals(2, io.log.count { it.contains(mcq(8).question) })
        assertTrue(mem.records.single().third)
    }

    @Test fun spokenBlankIsJudged() {
        assertTrue(run(listOf(Segment.Ask(cloze, "Review")), FakeIO(Heard.Words("a majority"))).records.single().third)
    }

    @Test fun outLoudExplanationScoredByKeyWordsOrSelfAssessed() {
        val good = run(listOf(Segment.Ask(explain, "Review")), FakeIO(Heard.Words("because results are delayed and the work builds up out of sight until it suddenly shows, like ice melting")))
        assertTrue(good.records.single().third)
        val weak = run(listOf(Segment.Ask(explain, "Review")), FakeIO(Heard.Words("something about motivation"), Heard.Words("no")))
        assertEquals(Grade.AGAIN, weak.records.single().second)
        val unsure = run(listOf(Segment.Ask(explain, "Review")), FakeIO(Heard.Words("something about motivation"), Heard.Silence))
        assertTrue(unsure.records.isEmpty())
    }

    @Test fun withoutAMicrophoneButtonsGradeTheAnswer() = runBlocking {
        val mem = FakeMemory(new = false)
        val io = FakeIO(Heard.Unavailable)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), fast)
        val job = launch { e.run(listOf(Segment.Ask(mcq(8), "Check"), Segment.Ask(cloze, "Review"))) }
        repeat(2) { n ->
            try {
                withTimeout(3_000) { e.state.first { it.segment == n && it.phase == DrivePhase.AWAIT_BUTTON && it.line.startsWith("Press next") } }
            } catch (t: Throwable) { throw AssertionError("state=${e.state.value} log=${io.log}", t) }
            e.press(if (n == 0) Button.NEXT else Button.PREVIOUS)
            try {
                withTimeout(3_000) { e.state.first { it.asked == n + 1 } }
            } catch (t: Throwable) { throw AssertionError("after press $n: state=${e.state.value} log=${io.log}", t) }
        }
        job.join()
        assertEquals(listOf(true, false), mem.records.map { it.third })
        assertFalse(e.state.value.voiceAnswers)
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

    @Test fun brainDumpScoresIdeasAndFinishesTheBook() {
        val io = FakeIO(Heard.Words("tiny one percent improvements compound but there is a delay, focus on systems not goals"), Heard.Words("done"))
        val mem = run(listOf(Segment.Recall("atomic-habits")), io)
        assertEquals(listOf("atomic-habits"), mem.finished)
        val score = io.log.first { it.contains("You covered") }
        assertTrue(score, Regex("covered (\\d+) of 7").find(score)!!.groupValues[1].toInt() >= 2)
        assertTrue(io.log.any { it.contains("Here's what you missed") })
    }

    @Test fun fullSessionRunsEndToEnd() {
        val plan = buildDrivePlan(DriveSettings("atomic-habits", minutes = 90), FakeMemory())
        val mem = FakeMemory()
        val io = FakeIO()
        runBlocking { DriveEngine(io, mem, DriveSettings("atomic-habits", minutes = 90), fast).run(plan) }
        assertEquals(9, mem.paragraphs["atomic-habits"])
        assertEquals("atomic-habits", mem.finished.first())
        assertTrue(mem.records.size >= 9) // every check question, unanswered (silent) → relearn
        assertNotNull(io.log.lastOrNull { it.contains("That's the session") })
    }

    @Test fun pressingDuringTheSpokenAnswerCountsAsKnewIt() = runBlocking {
        val io = FakeIO(Heard.Unavailable).apply { narrateDelay = 0 }
        val mem = FakeMemory(new = false)
        val e = DriveEngine(io, mem, DriveSettings("atomic-habits"), fast)
        val job = launch { e.run(listOf(Segment.Ask(mcq(8), "Check"))) }
        withTimeout(3_000) { e.state.first { it.line.startsWith("The answer") } }
        e.press(Button.NEXT)
        job.join()
        assertEquals(listOf(true), mem.records.map { it.third })
        assertFalse("no need to prompt after an early press", io.log.any { it.contains("Press next") })
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
