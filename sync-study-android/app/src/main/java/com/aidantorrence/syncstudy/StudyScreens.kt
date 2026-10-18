package com.aidantorrence.syncstudy

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.AutoStories
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Insights
import androidx.compose.material.icons.rounded.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/** App root: routes between the study screens and the reader. */
@Composable
fun SyncStudyApp(reader: ReaderViewModel, study: StudyViewModel) {
    val route by study.route.collectAsStateWithLifecycle()
    StudyStore.version.collectAsStateWithLifecycle().value // recompose on progress changes
    BackHandler(enabled = !(route is Route.Home && (route as Route.Home).tab == 0)) {
        if (route is Route.Read) reader.closeReader()
        study.back()
    }
    Box(Modifier.fillMaxSize().background(Background)) {
        when (val r = route) {
            is Route.Home -> HomeScreen(r.tab, study)
            is Route.Intro -> IntroScreen(r.bookId, study)
            is Route.Pretest -> PretestScreen(r.bookId, r.index, study)
            is Route.Read -> ReadRoute(r, reader, study)
            is Route.Recall -> RecallScreen(r.bookId, study)
            is Route.Summary -> SummaryScreen(r.bookId, study)
            Route.Review -> ReviewScreen(study)
        }
    }
}

@Composable
private fun Screen(title: String?, onBack: (() -> Unit)?, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        if (title != null || onBack != null) {
            Row(Modifier.fillMaxWidth().padding(start = 4.dp, end = 16.dp, top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                if (onBack != null) IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Back", tint = Color.White) }
                if (title != null) Text(title, color = Color.White, fontSize = 17.sp, fontFamily = FontFamily.Serif, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        content()
    }
}

// =====================================================================================================
// Home
// =====================================================================================================

@Composable
private fun HomeScreen(tab: Int, study: StudyViewModel) {
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Box(Modifier.weight(1f)) {
            when (tab) {
                0 -> LibraryTab(study)
                1 -> ReviewTab(study)
                2 -> ProgressTab()
                else -> DriveTab()
            }
        }
        val due = StudyStore.dueCount()
        NavigationBar(containerColor = Color(0xFF111217)) {
            val colors = NavigationBarItemDefaults.colors(selectedIconColor = Background, indicatorColor = Mint,
                unselectedIconColor = TextMuted, selectedTextColor = Mint, unselectedTextColor = TextMuted)
            NavigationBarItem(tab == 0, { study.go(Route.Home(0)) }, { Icon(Icons.Rounded.AutoStories, null) }, label = { Text("Library") }, colors = colors)
            NavigationBarItem(tab == 1, { study.go(Route.Home(1)) }, {
                Box { Icon(Icons.Rounded.Style, null); if (due > 0) Box(Modifier.align(Alignment.TopEnd).size(8.dp).clip(CircleShape).background(Pal.Coral)) }
            }, label = { Text(if (due > 0) "Review · $due" else "Review") }, colors = colors)
            NavigationBarItem(tab == 2, { study.go(Route.Home(2)) }, { Icon(Icons.Rounded.Insights, null) }, label = { Text("Progress") }, colors = colors)
            NavigationBarItem(tab == 3, { study.go(Route.Home(3)) }, {
                Box { Icon(Icons.Rounded.DirectionsCar, null); if (DriveController.running) Box(Modifier.align(Alignment.TopEnd).size(8.dp).clip(CircleShape).background(Mint)) }
            }, label = { Text("Drive") }, colors = colors)
        }
    }
}

@Composable
private fun LibraryTab(study: StudyViewModel) {
    val clock = rememberVisualClock(LIBRARY_TEMPO)
    val due = StudyStore.dueCount()
    val streak = StudyStore.streak()
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Sync Study", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
                    Text("Listen, get quizzed, remember it for good.", color = TextMuted, fontSize = 14.sp)
                }
                if (streak > 0) Pill("$streak-day streak", Pal.Gold)
            }
        }
        if (due > 0) item {
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp))
                    .background(Brush.horizontalGradient(listOf(Mint.copy(alpha = 0.28f), Card2))).clickable { study.startReview() }.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text("$due cards ready to review", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Mixed from all your books, timed for right before you'd forget.", color = TextMuted, fontSize = 12.sp, lineHeight = 16.sp)
                }
                Pill("Review", Mint)
            }
        }
        items(LIBRARY, key = { it.id }) { book -> BookRow(book, clock) { study.go(Route.Intro(book.id)) } }
    }
}

@Composable
private fun BookRow(book: Book, clock: androidx.compose.runtime.State<Float>, onClick: () -> Unit) {
    val stage = StudyStore.stage(book.id)
    val mastery = StudyStore.mastery(book.id)
    val due = StudyStore.dueCount(book.id)
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Card2).clickable(onClick = onClick).padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BookVisual(BookArt(book.visual, book.color), clock, Modifier.size(72.dp).clip(RoundedCornerShape(12.dp)))
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(book.title, color = Color.White, fontFamily = FontFamily.Serif, fontSize = 16.sp, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 20.sp)
            Text(book.author, color = TextMuted, fontSize = 12.sp)
            Spacer(Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                MasteryBar(mastery, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                Text(
                    when { studyFor(book.id) == null -> "listen only"; stage == Stage.NEW -> "new"; stage < Stage.DONE -> "in progress"; else -> "${(mastery * 100).toInt()}% mastered" },
                    color = TextMuted, fontSize = 11.sp,
                )
            }
        }
        if (due > 0) { Spacer(Modifier.width(8.dp)); Pill("$due due", Pal.Coral) }
    }
}

@Composable
private fun ReviewTab(study: StudyViewModel) {
    val due = StudyStore.dueCount()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Review", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Card2).padding(20.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text("$due", color = if (due > 0) Mint else Color.White, fontSize = 56.sp, fontWeight = FontWeight.Bold)
                Text(if (due > 0) "cards due now" else "Nothing due. You're all caught up.", color = TextMuted, fontSize = 14.sp)
                val soon = StudyStore.dueWithin(1)
                if (soon > 0) Text("$soon more in the next 24 hours", color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(14.dp))
                PrimaryButton(if (due > 0) "Start review" else "No cards due", { study.startReview() }, Modifier.fillMaxWidth(), enabled = due > 0)
            }
        }
        SectionLabel("Why it works")
        listOf(
            "Spaced" to "Each card returns just before you'd forget it, a little later every time you get it right.",
            "Mixed" to "Books are interleaved, so you practise telling ideas apart, not just repeating one.",
            "Retrieval" to "You answer from memory before seeing anything. That effort is what makes it stick.",
            "Confidence" to "Rate how sure you are. Confident mistakes get flagged; they're the easiest to fix for good.",
        ).forEach { (h, b) ->
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Card2).padding(14.dp)) {
                Text(h, color = Mint, fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.width(86.dp))
                Text(b, color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp, lineHeight = 18.sp)
            }
        }
    }
}

@Composable
private fun ProgressTab() {
    val days = StudyStore.lastDays(14)
    val max = (days.maxOrNull() ?: 0).coerceAtLeast(1)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Progress", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile("${StudyStore.streak()}", "day streak", Pal.Gold, Modifier.weight(1f))
            StatTile(StudyStore.accuracy(7)?.let { "${(it * 100).toInt()}%" } ?: "–", "correct, last 7 days", Mint, Modifier.weight(1f))
            StatTile("${StudyStore.cardsStarted()}", "cards in rotation", Pal.Sky, Modifier.weight(1f))
        }
        SectionLabel("Answers per day, last 2 weeks")
        Row(Modifier.fillMaxWidth().height(90.dp).clip(RoundedCornerShape(16.dp)).background(Card2).padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Bottom) {
            days.forEach { n ->
                Box(Modifier.weight(1f).fillMaxHeight((n.toFloat() / max).coerceAtLeast(0.04f)).clip(RoundedCornerShape(3.dp))
                    .background(if (n > 0) Mint else Line))
            }
        }
        SectionLabel("Mastery by book")
        LIBRARY.forEach { b ->
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Card2).padding(12.dp)) {
                Row { Text(b.title, color = Color.White, fontSize = 13.sp, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("${(StudyStore.mastery(b.id) * 100).toInt()}%", color = TextMuted, fontSize = 12.sp) }
                Spacer(Modifier.height(6.dp))
                MasteryBar(StudyStore.mastery(b.id), Color(b.color).lighten(0.25f))
            }
        }
    }
}

// =====================================================================================================
// Book flow
// =====================================================================================================

@Composable
private fun IntroScreen(bookId: String, study: StudyViewModel) {
    val book = findBook(bookId) ?: return
    val s = studyFor(bookId)
    val stage = StudyStore.stage(bookId)
    val clock = rememberVisualClock(LIBRARY_TEMPO)
    Screen(null, { study.back() }) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Box(Modifier.fillMaxWidth().aspectRatio(1.6f).clip(RoundedCornerShape(22.dp))) {
                BookVisual(BookArt(book.visual, book.color), clock, Modifier.fillMaxSize())
                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f)))))
                Column(Modifier.align(Alignment.BottomStart).padding(18.dp)) {
                    Text(book.title, color = Color.White, fontFamily = FontFamily.Serif, fontSize = 26.sp, lineHeight = 31.sp)
                    Text("${book.author} · ${book.year}", color = Color(0xFFCCCCCC), fontSize = 13.sp)
                }
            }
            if (s == null) {
                BigNote("Listen-only title", "Study cards for this title are on their way. You can still listen with the explainer.")
                PrimaryButton("Listen", { study.go(Route.Read(bookId, quiz = false)) }, Modifier.fillMaxWidth())
                return@Column
            }
            SectionLabel("Your study path")
            val steps = listOf(
                Triple("Guess first", "${s.pretest.size} questions before you read. Wrong guesses still prime your memory.", stage >= Stage.PRETESTED),
                Triple("Listen and check", "Narrated summary with animated explainers. ${s.checkpoints.size} quick checkpoints along the way.", stage >= Stage.READ),
                Triple("Brain dump", "Write down everything you remember, then compare with the ${s.keyIdeas.size} key ideas.", stage >= Stage.DONE),
                Triple("Spaced review", "${s.cards.size} cards come back over the next weeks, mixed with your other books.", stage >= Stage.DONE && StudyStore.mastery(bookId) > 0.5f),
            )
            steps.forEachIndexed { i, (h, b, done) ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Card2).padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(30.dp).clip(CircleShape).background(if (done) Mint else Line), contentAlignment = Alignment.Center) {
                        if (done) Icon(Icons.Rounded.Check, null, tint = Background, modifier = Modifier.size(18.dp))
                        else Text("${i + 1}", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.width(12.dp))
                    Column { Text(h, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp); Text(b, color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp) }
                }
            }
            val due = StudyStore.dueCount(bookId)
            when {
                stage < Stage.READ -> PrimaryButton(if (stage == Stage.NEW) "Start studying" else "Continue reading", { study.startBook(bookId) }, Modifier.fillMaxWidth())
                stage == Stage.READ -> PrimaryButton("Do the brain dump", { study.go(Route.Recall(bookId)) }, Modifier.fillMaxWidth())
                due > 0 -> PrimaryButton("Review this book ($due due)", { study.startReview(bookId) }, Modifier.fillMaxWidth())
                else -> PrimaryButton("Read again with checkpoints", { study.go(Route.Read(bookId)) }, Modifier.fillMaxWidth())
            }
            SecondaryButton("Just listen (no questions)", { study.go(Route.Read(bookId, quiz = false)) }, Modifier.fillMaxWidth())
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun PretestScreen(bookId: String, index: Int, study: StudyViewModel) {
    val pre = studyFor(bookId)?.pretest ?: return
    val card = pre.getOrNull(index) ?: return
    Screen("Guess first", { study.back() }) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                pre.indices.forEach { i -> Box(Modifier.weight(1f).height(5.dp).clip(RoundedCornerShape(3.dp)).background(if (i <= index) Pal.Gold else Line)) }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Pill("Pretest ${index + 1} of ${pre.size}", Pal.Gold)
                Spacer(Modifier.width(8.dp))
                Text("No score. Just guess.", color = TextMuted, fontSize = 13.sp)
            }
            Text("You haven't read this yet. Guess anyway: trying to answer first makes the real answer stick when you hear it.",
                color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp)
            var guess by remember(card.id) { mutableStateOf("") }
            val last = index + 1 >= pre.size
            Text(spoken(card).prompt, color = Color.White, fontSize = 19.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
            AnswerField(guess, { guess = it }, enabled = true, onDone = { if (guess.isNotBlank()) study.answerPretest(bookId, index, guess) }, placeholder = "Your best guess")
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SecondaryButton("No idea", { study.answerPretest(bookId, index, "") }, Modifier.weight(1f))
                PrimaryButton(if (last) "Lock in, start" else "Lock in guess", { study.answerPretest(bookId, index, guess) }, Modifier.weight(1f), enabled = guess.isNotBlank())
            }
        }
    }
}

@Composable
private fun ReadRoute(r: Route.Read, reader: ReaderViewModel, study: StudyViewModel) {
    LaunchedEffect(r.bookId, r.quiz) {
        if (r.bookId == CUSTOM_BOOK_ID) reader.openCustom() else reader.openBook(r.bookId)
        reader.setQuiz(r.quiz && studyFor(r.bookId) != null)
    }
    val state by reader.state.collectAsStateWithLifecycle()
    if (state.bookId != r.bookId || state.document.isEmpty) return
    ReaderScreen(reader, state, onBack = { reader.closeReader(); study.back() }) {
        val p = state.checkpoint
        val card = p?.let { studyFor(r.bookId)?.checkpoints?.get(it) }
        AnimatedVisibility(card != null, enter = slideInVertically { it / 2 } + fadeIn(), modifier = Modifier.align(Alignment.BottomCenter)) {
            if (card != null) CheckpointSheet(card, card.paragraph, state.document.paragraphs.size, reader, study)
        }
        val showDone = state.finished && state.checkpoint == null && state.quiz && studyFor(r.bookId) != null
        AnimatedVisibility(showDone, enter = slideInVertically { it / 2 } + fadeIn(), modifier = Modifier.align(Alignment.BottomCenter)) {
            Sheet {
                val res = study.checkpointResults[r.bookId].orEmpty()
                Text("You finished the summary", color = Color.White, fontSize = 20.sp, fontFamily = FontFamily.Serif)
                if (res.isNotEmpty()) Text("Checkpoints: ${res.values.count { it }} of ${res.size} right", color = Mint, fontSize = 14.sp)
                Text("Next: a brain dump. Write down everything you remember before checking. It's the strongest memory exercise there is.",
                    color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp)
                PrimaryButton("Start brain dump", { reader.closeReader(); study.finishReading(r.bookId) }, Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun Sheet(content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxWidth().heightIn(max = 560.dp).clip(RoundedCornerShape(topStart = 26.dp, topEnd = 26.dp))
            .background(Color(0xFF15161C)).border(1.dp, Line, RoundedCornerShape(topStart = 26.dp, topEnd = 26.dp))
            .verticalScroll(rememberScrollState()).windowInsetsPadding(WindowInsets.safeDrawing).padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(Modifier.align(Alignment.CenterHorizontally).width(40.dp).height(4.dp).clip(RoundedCornerShape(2.dp)).background(Line))
        content()
    }
}

@Composable
private fun CheckpointSheet(card: Mcq, p: Int, total: Int, reader: ReaderViewModel, study: StudyViewModel) {
    Sheet {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Pill("Checkpoint ${p + 1} of $total", Mint)
            Spacer(Modifier.width(8.dp))
            Text("Answer from memory", color = TextMuted, fontSize = 12.sp)
        }
        McqPanel(card, salt = 0, onResult = { correct, conf -> study.recordCheckpoint(card, correct, conf) }, footer = { correct ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (!correct) SecondaryButton("Replay this part", { reader.replayParagraph(p) }, Modifier.weight(1f))
                PrimaryButton("Continue", { reader.continueAfterCheckpoint() }, Modifier.weight(1f))
            }
        })
    }
}

@Composable
private fun RecallScreen(bookId: String, study: StudyViewModel) {
    val book = findBook(bookId) ?: return
    val s = studyFor(bookId) ?: return
    var notes by remember(bookId) { mutableStateOf("") }
    var checking by remember(bookId) { mutableStateOf(false) }
    val got = remember(bookId) { mutableStateListOf<Int>() }
    Screen("Brain dump", { study.back() }) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Without looking, write down everything you remember from ${book.title}.", color = Color.White, fontSize = 18.sp,
                lineHeight = 24.sp, fontFamily = FontFamily.Serif)
            Text("Messy is fine. Bullet points, keywords, examples. Free recall like this is harder than re-reading, which is exactly why it works.",
                color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp)
            OutlinedTextField(
                notes, { notes = it }, Modifier.fillMaxWidth().heightIn(min = 180.dp), enabled = !checking,
                placeholder = { Text("Tap the mic on your keyboard to say it out loud…", color = TextMuted) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Mint, unfocusedBorderColor = Line, cursorColor = Mint,
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White, disabledTextColor = Color.White.copy(alpha = 0.7f)),
            )
            if (!checking) {
                PrimaryButton("Compare with the key ideas", { checking = true }, Modifier.fillMaxWidth())
            } else {
                SectionLabel("Tick each idea you got (roughly is fine)")
                s.keyIdeas.forEachIndexed { i, idea ->
                    val on = i in got
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(if (on) Mint.copy(alpha = 0.12f) else Card2)
                            .border(1.dp, if (on) Mint else Line, RoundedCornerShape(14.dp)).clickable { if (on) got.remove(i) else got.add(i) }.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(Modifier.size(24.dp).clip(CircleShape).background(if (on) Mint else Line), contentAlignment = Alignment.Center) {
                            if (on) Icon(Icons.Rounded.Check, null, tint = Background, modifier = Modifier.size(16.dp))
                        }
                        Spacer(Modifier.width(10.dp))
                        Text(idea, color = Color.White, fontSize = 14.sp, lineHeight = 19.sp)
                    }
                }
                PrimaryButton("Finish: ${got.size} of ${s.keyIdeas.size} recalled", { study.finishRecall(bookId, got.size, s.keyIdeas.size) }, Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun SummaryScreen(bookId: String, study: StudyViewModel) {
    val book = findBook(bookId) ?: return
    val s = studyFor(bookId) ?: return
    val res = study.checkpointResults[bookId].orEmpty()
    Screen(null, { study.back() }) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Nice work.", color = Color.White, fontSize = 30.sp, fontFamily = FontFamily.Serif)
            Text(book.title, color = TextMuted, fontSize = 14.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile(if (res.isEmpty()) "–" else "${res.values.count { it }}/${res.size}", "checkpoints right", Mint, Modifier.weight(1f))
                StatTile("${((StudyStore.recallScore(bookId) ?: 0f) * s.keyIdeas.size + 0.5f).toInt()}/${s.keyIdeas.size}", "key ideas recalled", Pal.Gold, Modifier.weight(1f))
                StatTile("${s.cards.size}", "cards scheduled", Pal.Sky, Modifier.weight(1f))
            }
            if (s.pretest.isNotEmpty()) {
                SectionLabel("Your first guesses, now with answers")
                s.pretest.forEach { c ->
                    val g = StudyStore.pretestGuess(c.id)
                    val q = spoken(c)
                    val right = !g.isNullOrBlank() && judgeOpen(g, c) == Verdict.RIGHT
                    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Card2).padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(q.prompt, color = Color.White, fontSize = 14.sp, lineHeight = 19.sp)
                        if (g != null) Text(if (g.isBlank()) "You had no idea yet" else "You guessed: $g", color = if (right) Pal.Leaf else Pal.Coral, fontSize = 13.sp)
                        if (!right) Text("Answer: ${q.answer}", color = Pal.Leaf, fontSize = 13.sp)
                    }
                }
            }
            Text("Your cards will come back tomorrow, then in a few days, then weeks apart. A few minutes a day is enough.",
                color = TextMuted, fontSize = 13.sp, lineHeight = 18.sp)
            PrimaryButton("Start first review now", { study.startReview(bookId) }, Modifier.fillMaxWidth())
            SecondaryButton("Back to library", { study.go(Route.Home(0)) }, Modifier.fillMaxWidth())
        }
    }
}

// =====================================================================================================
// Review
// =====================================================================================================

@Composable
private fun ReviewScreen(study: StudyViewModel) {
    val session by study.session.collectAsStateWithLifecycle()
    val s = session ?: return
    Screen("Review", { study.endReview() }) {
        Column(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
            val total = s.queue.size
            Row(verticalAlignment = Alignment.CenterVertically) {
                MasteryBar(if (total == 0) 1f else s.pos.toFloat() / total, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(10.dp))
                Text("${minOf(s.pos + 1, total)}/$total", color = TextMuted, fontSize = 12.sp)
            }
            Spacer(Modifier.height(12.dp))
            val card = s.current
            if (s.done || card == null) {
                ReviewDone(s) { study.endReview() }
            } else {
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    val book = findBook(card.bookId)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Pill(when (card) { is Mcq -> "Recall"; is Recall -> "Explain"; is Cloze -> "Fill the gap" }, Color(book?.color ?: 0xFF4FD1A5).lighten(0.3f))
                        Spacer(Modifier.width(8.dp))
                        Text(book?.title ?: "", color = TextMuted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    when (card) {
                        is Mcq -> McqReview(card, s.pos, study)
                        is Recall -> RecallReview(card, s.pos, study)
                        is Cloze -> ClozeReview(card, s.pos, study)
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
private fun McqReview(card: Mcq, pos: Int, study: StudyViewModel) {
    var result by remember(card.id, pos) { mutableStateOf<Pair<Boolean, Confidence>?>(null) }
    McqPanel(card, salt = pos + 1, onResult = { c, conf -> result = c to conf }, footer = {
        SceneThumb(card.bookId, card.paragraph, Modifier.fillMaxWidth())
        PrimaryButton("Next", { result?.let { (c, conf) -> study.answerReview(card, Scheduler.grade(c, conf), c) } }, Modifier.fillMaxWidth())
    })
}

@Composable
private fun RecallReview(card: Recall, pos: Int, study: StudyViewModel) {
    var shown by remember(card.id, pos) { mutableStateOf(false) }
    var typed by remember(card.id, pos) { mutableStateOf("") }
    Text(card.prompt, color = Color.White, fontSize = 19.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
    Text("Answer in your own words first: out loud, in your head, or typed below.", color = TextMuted, fontSize = 13.sp)
    OutlinedTextField(typed, { typed = it }, Modifier.fillMaxWidth().heightIn(min = 90.dp), enabled = !shown,
        placeholder = { Text("Optional", color = TextMuted) },
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Mint, unfocusedBorderColor = Line, cursorColor = Mint,
            focusedTextColor = Color.White, unfocusedTextColor = Color.White, disabledTextColor = Color.White.copy(alpha = 0.7f)))
    if (!shown) {
        PrimaryButton("Show answer", { shown = true }, Modifier.fillMaxWidth())
    } else {
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Card2).padding(14.dp)) {
            Text("A good answer", color = Mint, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(Modifier.height(4.dp))
            Text(card.answer, color = Color.White, fontSize = 15.sp, lineHeight = 21.sp)
        }
        SceneThumb(card.bookId, card.paragraph, Modifier.fillMaxWidth())
        Text("How well did you know it?", color = TextMuted, fontSize = 13.sp)
        GradeButtons(card) { g -> study.answerReview(card, g, g != Grade.AGAIN) }
    }
}

@Composable
private fun ClozeReview(card: Cloze, pos: Int, study: StudyViewModel) {
    var typed by remember(card.id, pos) { mutableStateOf("") }
    var checked by remember(card.id, pos) { mutableStateOf<Boolean?>(null) }
    Text(card.text.replace("___", "______"), color = Color.White, fontSize = 19.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
    OutlinedTextField(typed, { typed = it }, Modifier.fillMaxWidth(), singleLine = true, enabled = checked == null,
        placeholder = { Text("Type the missing word", color = TextMuted) },
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Mint, unfocusedBorderColor = Line, cursorColor = Mint,
            focusedTextColor = Color.White, unfocusedTextColor = Color.White, disabledTextColor = Color.White))
    val c = checked
    if (c == null) {
        PrimaryButton("Check", { checked = answerMatches(typed, card.answer, card.accept) }, Modifier.fillMaxWidth(), enabled = typed.isNotBlank())
    } else {
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background((if (c) Pal.Leaf else Pal.Coral).copy(alpha = 0.14f)).padding(14.dp)) {
            Text(if (c) "Correct." else "Answer: ${card.answer}", color = if (c) Pal.Leaf else Pal.Coral, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(card.text.replace("___", card.answer), color = Color.White, fontSize = 14.sp, lineHeight = 20.sp)
        }
        SceneThumb(card.bookId, card.paragraph, Modifier.fillMaxWidth())
        if (c) {
            PrimaryButton("Next", { study.answerReview(card, Grade.GOOD, true) }, Modifier.fillMaxWidth())
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SecondaryButton("I was right (typo)", { study.answerReview(card, Grade.HARD, true) }, Modifier.weight(1f))
                PrimaryButton("Next", { study.answerReview(card, Grade.AGAIN, false) }, Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun ReviewDone(s: ReviewSession, onDone: () -> Unit) {
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text("Session complete", color = Color.White, fontSize = 26.sp, fontFamily = FontFamily.Serif)
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val unique = s.firstTry.size
            StatTile("$unique", "cards reviewed", Pal.Sky, Modifier.weight(1f))
            StatTile(if (unique == 0) "–" else "${s.correct * 100 / unique}%", "right first time", Mint, Modifier.weight(1f))
            StatTile("${s.relearned}", "relearned in session", Pal.Gold, Modifier.weight(1f))
        }
        Spacer(Modifier.height(16.dp))
        Text("Each card is now scheduled for just before you'd forget it.", color = TextMuted, fontSize = 13.sp)
        Spacer(Modifier.height(20.dp))
        PrimaryButton("Done", onDone, Modifier.fillMaxWidth())
    }
}
