package com.aidantorrence.syncstudy

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Mic
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/** Drive tab: set up a hands-free session, or control the one that's running. */
@Composable
fun DriveTab() {
    val state by DriveController.state.collectAsStateWithLifecycle()
    if (state.running) DriveLive(state) else DriveSetup(state)
}

@Composable
private fun DriveSetup(last: DriveState) {
    val context = LocalContext.current
    val memory = remember { StoreMemory(context) }
    val defaultBook = remember { LIBRARY.firstOrNull { StudyStore.stage(it.id) < Stage.DONE && studyFor(it.id) != null }?.id ?: LIBRARY.first().id }
    var bookId by rememberSaveable { mutableStateOf(defaultBook) }
    var minutes by rememberSaveable { mutableIntStateOf(20) }
    var voice by rememberSaveable { mutableStateOf(true) }
    var speed by rememberSaveable { mutableFloatStateOf(1.15f) }
    val settings = DriveSettings(bookId, minutes, voice, speed)
    val plan = remember(settings, StudyStore.version.value) { buildDrivePlan(settings, memory) }

    val permissions = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { granted ->
        val mic = granted[Manifest.permission.RECORD_AUDIO] ?: hasMic(context)
        DriveController.start(context, settings.copy(voiceAnswers = voice && mic))
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Drive mode", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
        Text("Learn hands-free in the car, on a walk or at the gym. Set it up here, then put the phone away.",
            color = TextMuted, fontSize = 14.sp, lineHeight = 20.sp)
        if (last.phase == DrivePhase.DONE && last.asked > 0) {
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Mint.copy(alpha = 0.14f)).padding(14.dp)) {
                Text("Last session: ${last.right} of ${last.asked} right", color = Mint, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }

        SectionLabel("Book")
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val clock = rememberVisualClock(LIBRARY_TEMPO)
            LIBRARY.forEach { b ->
                val on = b.id == bookId
                Column(
                    Modifier.width(112.dp).clip(RoundedCornerShape(16.dp)).background(if (on) Mint.copy(alpha = 0.14f) else Card2)
                        .border(1.5.dp, if (on) Mint else Line, RoundedCornerShape(16.dp)).clickable { bookId = b.id }.padding(8.dp),
                ) {
                    BookVisual(BookArt(b.visual, b.color), clock, Modifier.fillMaxWidth().height(70.dp).clip(RoundedCornerShape(10.dp)))
                    Spacer(Modifier.height(6.dp))
                    Text(b.title, color = Color.White, fontSize = 12.sp, lineHeight = 15.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    val p = memory.paragraph(b.id); val n = Document(b.summary).paragraphs.size
                    Text(if (p == 0) "not started" else if (p >= n) "finished" else "part ${p + 1} of $n", color = TextMuted, fontSize = 10.sp)
                }
            }
        }

        SectionLabel("Session length")
        Choices(listOf(10, 20, 30, 45).map { "$it min" to (minutes == it) }) { minutes = listOf(10, 20, 30, 45)[it] }

        SectionLabel("How you'll answer")
        Choices(listOf("Out loud" to voice, "Buttons only" to !voice)) { voice = it == 0 }
        Text(if (voice) "After each question you'll hear a chime. Just say your answer." else
            "You'll get a moment to think, hear the answer, then press next if you knew it or back if you didn't.",
            color = TextMuted, fontSize = 12.sp, lineHeight = 16.sp)

        SectionLabel("Narration speed")
        val speeds = listOf(1f, 1.15f, 1.35f, 1.6f, 2f)
        Choices(speeds.map { "${it}x".replace(".0x", "x") to (speed == it) }) { speed = speeds[it] }

        val learn = plan.count { it is Segment.Learn }
        val checks = plan.count { it is Segment.Ask && it.label == "Check" }
        val reviews = plan.count { it is Segment.Ask && it.label != "Check" }
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Card2).padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("This session, about ${(planSeconds(plan, settings) / 60f).toInt().coerceAtLeast(1)} min", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            if (learn > 0) Text("• $learn ${if (learn == 1) "part" else "parts"} of ${findBook(bookId)?.title}, each with a one-line takeaway", color = TextMuted, fontSize = 13.sp)
            if (checks > 0) Text("• $checks check questions, each asked one part later so you really recall it", color = TextMuted, fontSize = 13.sp)
            if (reviews > 0) Text("• $reviews review questions mixed in from your other books", color = TextMuted, fontSize = 13.sp)
            if (plan.any { it is Segment.Recall }) Text("• a spoken brain dump to finish the book", color = TextMuted, fontSize = 13.sp)
            if (plan.any { it is Segment.Pretest }) Text("• two guess-first questions to start", color = TextMuted, fontSize = 13.sp)
        }

        PrimaryButton("Start drive session", {
            val need = buildList {
                if (voice && !hasMic(context)) add(Manifest.permission.RECORD_AUDIO)
                if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) add(Manifest.permission.POST_NOTIFICATIONS)
            }
            if (need.isEmpty()) DriveController.start(context, settings) else permissions.launch(need.toTypedArray())
        }, Modifier.fillMaxWidth())

        SectionLabel("Controls, no screen needed")
        listOf(
            "Steering wheel / headset" to "Play-pause pauses. Next skips. Back repeats. After an answer is read out, next means \"I knew it\" and back means \"I didn't\".",
            "Say it" to "\"repeat\", \"skip\", \"I don't know\", \"slower\", \"faster\", \"pause\". At the end of a book, say \"done\" when you've finished your brain dump.",
            "No answer?" to "That's fine. After a few seconds you'll hear the answer, and the question comes back sooner next time.",
            "Calls and directions" to "The session pauses for navigation prompts and phone calls, and picks up again afterwards.",
        ).forEach { (h, b) ->
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Card2).padding(12.dp)) {
                Text(h, color = Mint, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.width(100.dp))
                Text(b, color = Color.White.copy(alpha = 0.85f), fontSize = 12.sp, lineHeight = 17.sp)
            }
        }
        Text("Keep your eyes on the road. Everything works by voice and buttons; don't use the screen while driving.",
            color = TextMuted, fontSize = 11.sp, lineHeight = 15.sp)
        Spacer(Modifier.height(8.dp))
    }
}

private fun hasMic(context: android.content.Context) =
    ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

@Composable
private fun Choices(items: List<Pair<String, Boolean>>, onPick: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items.forEachIndexed { i, (label, on) ->
            Box(
                Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(if (on) Mint else Card2)
                    .border(1.dp, if (on) Mint else Line, RoundedCornerShape(12.dp)).clickable { onPick(i) }.padding(vertical = 12.dp),
                contentAlignment = Alignment.Center,
            ) { Text(label, color = if (on) Background else Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp) }
        }
    }
}

/** Running session: big, high-contrast, glanceable. Three huge targets; the voice does the rest. */
@Composable
private fun DriveLive(s: DriveState) {
    val context = LocalContext.current
    val pulse = rememberInfiniteTransition(label = "pulse").animateFloat(1f, 1.18f, infiniteRepeatable(tween(700), RepeatMode.Reverse), label = "p")
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(s.title, color = TextMuted, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(s.label.ifEmpty { "Drive mode" }, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            if (s.asked > 0) Pill("${s.right}/${s.asked} right", Mint)
        }
        Spacer(Modifier.height(8.dp))
        MasteryBar(if (s.segments == 0) 0f else s.segment.toFloat() / s.segments)
        Spacer(Modifier.height(18.dp))
        val (phaseText, phaseColor) = when (s.phase) {
            DrivePhase.LISTENING -> "Listening…" to Pal.Coral
            DrivePhase.QUESTION -> "Question" to Pal.Gold
            DrivePhase.NARRATING -> "Reading" to Pal.Sky
            DrivePhase.FEEDBACK -> "Answer" to Mint
            DrivePhase.THINKING -> "Think of your answer" to Pal.Violet
            DrivePhase.AWAIT_BUTTON -> "Next = knew it · Back = didn't" to Pal.Violet
            DrivePhase.RECALL -> "Brain dump" to Pal.Gold
            DrivePhase.PAUSED -> "Paused" to TextMuted
            else -> "Drive mode" to TextMuted
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(14.dp).scale(if (s.phase == DrivePhase.LISTENING) pulse.value else 1f).clip(CircleShape).background(phaseColor))
            Spacer(Modifier.width(8.dp))
            if (s.phase == DrivePhase.LISTENING) { Icon(Icons.Rounded.Mic, null, tint = phaseColor, modifier = Modifier.size(20.dp)); Spacer(Modifier.width(4.dp)) }
            Text(phaseText, color = phaseColor, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(12.dp))
        Text(s.line, color = Color.White, fontSize = 24.sp, lineHeight = 32.sp, fontFamily = FontFamily.Serif,
            maxLines = 7, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
        if (s.heard.isNotEmpty()) Text("You said: “${s.heard}”", color = TextMuted, fontSize = 14.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        if (!s.voiceAnswers) Text("Buttons mode: next = knew it, back = didn't", color = TextMuted, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            BigButton(Icons.Rounded.Replay, "Repeat", Card2, Modifier.weight(1f)) { DriveController.press(Button.PREVIOUS) }
            val paused = s.phase == DrivePhase.PAUSED
            BigButton(if (paused) Icons.Rounded.PlayArrow else Icons.Rounded.Pause, if (paused) "Resume" else "Pause", Mint, Modifier.weight(1.2f), dark = true) { DriveController.togglePause() }
            BigButton(Icons.Rounded.SkipNext, if (s.phase == DrivePhase.AWAIT_BUTTON) "Knew it" else "Skip", Card2, Modifier.weight(1f)) { DriveController.press(Button.NEXT) }
        }
        Spacer(Modifier.height(10.dp))
        Text("End session", color = TextMuted, fontSize = 13.sp, textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().clickable { DriveController.stop(context) }.padding(10.dp))
    }
}

@Composable
private fun BigButton(icon: ImageVector, label: String, bg: Color, modifier: Modifier, dark: Boolean = false, onClick: () -> Unit) {
    Column(
        modifier.height(118.dp).clip(RoundedCornerShape(24.dp)).background(bg).border(1.dp, Line, RoundedCornerShape(24.dp)).clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
    ) {
        Icon(icon, label, tint = if (dark) Background else Color.White, modifier = Modifier.size(44.dp))
        Text(label, color = if (dark) Background else Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
    }
}
