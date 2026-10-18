package com.aidantorrence.syncstudy

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.expandVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Shared building blocks for the study screens.

val Mint = Accent
val Card2 = Color(0xFF1A1B22)
val Line = Color(0xFF2C2E38)

@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    Button(
        onClick = onClick, enabled = enabled, modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Mint, contentColor = Background, disabledContainerColor = Line),
    ) { Text(text, fontWeight = FontWeight.Bold, fontSize = 16.sp) }
}

@Composable
fun SecondaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    OutlinedButton(
        onClick = onClick, modifier = modifier.height(52.dp), shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, Line),
    ) { Text(text, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp) }
}

@Composable
fun Pill(text: String, color: Color, dark: Boolean = true) {
    Text(
        text.uppercase(), color = if (dark) Background else Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        modifier = Modifier.background(color, RoundedCornerShape(999.dp)).padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

/** The paragraph's explainer scene, fully played, as a still image (dual coding on question cards). */
@Composable
fun SceneThumb(bookId: String, paragraph: Int, modifier: Modifier = Modifier) {
    val compiled = remember(bookId, paragraph) { STAGE_SCENES[bookId]?.getOrNull(paragraph)?.let { runCatching { CompiledScene(it) }.getOrNull() } }
    val measurer = rememberTextMeasurer(cacheSize = 64)
    Box(modifier.aspectRatio(STAGE_W / STAGE_H).clip(RoundedCornerShape(16.dp)).background(Card2)) {
        if (compiled == null) {
            val clock = rememberVisualClock(LIBRARY_TEMPO)
            BookVisual(artFor(bookId), clock, Modifier.fillMaxSize())
        } else {
            val done = remember(compiled) { FloatArray(compiled.scene.beats.size) { 1e7f } }
            Canvas(Modifier.fillMaxSize()) { drawStage(compiled, done, 9f, measurer) }
        }
    }
}

/** A free-text answer box: the learner recalls before seeing anything. Enter submits. */
@Composable
fun AnswerField(value: String, onChange: (String) -> Unit, enabled: Boolean, onDone: () -> Unit, placeholder: String = "Type your answer") {
    OutlinedTextField(
        value, onChange, Modifier.fillMaxWidth().heightIn(min = 64.dp), enabled = enabled,
        placeholder = { Text(placeholder, color = TextMuted) },
        keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences, imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = { onDone() }),
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Mint, unfocusedBorderColor = Line, cursorColor = Mint,
            focusedTextColor = Color.White, unfocusedTextColor = Color.White, disabledTextColor = Color.White.copy(alpha = 0.75f),
            disabledBorderColor = Line),
    )
}

@Composable
private fun ChoiceRow(choices: List<Pair<String, () -> Unit>>) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        choices.forEach { (l, onClick) ->
            Box(
                Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(Line).clickable(onClick = onClick).padding(vertical = 12.dp),
                contentAlignment = Alignment.Center,
            ) { Text(l, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp) }
        }
    }
}

/**
 * A multiple-choice card asked with no options shown: the learner types an answer from memory, rates their
 * confidence, then sees the answer. Typed answers are scored by key words; when that can't decide, the learner
 * compares with the answer and says whether theirs matched. Calls [onResult] once; [footer] renders after the reveal.
 */
@Composable
fun McqPanel(
    card: Mcq,
    salt: Int,
    onResult: (correct: Boolean, confidence: Confidence) -> Unit,
    footer: @Composable (correct: Boolean) -> Unit,
    askConfidence: Boolean = true,
) {
    val q = remember(card.id) { spoken(card) }
    var typed by remember(card.id, salt) { mutableStateOf("") }
    var submitted by remember(card.id, salt) { mutableStateOf(false) }
    var conf by remember(card.id, salt) { mutableStateOf<Confidence?>(null) }
    var correct by remember(card.id, salt) { mutableStateOf<Boolean?>(null) }
    var gaveUp by remember(card.id, salt) { mutableStateOf(false) }
    fun settle(c: Confidence) {
        conf = c
        when (judgeOpen(typed, card)) {
            Verdict.RIGHT -> { correct = true; onResult(true, c) }
            Verdict.WRONG -> { correct = false; onResult(false, c) }
            Verdict.UNCLEAR -> Unit // the learner compares with the answer below
        }
    }
    fun submit() {
        if (typed.isBlank() || submitted) return
        submitted = true
        if (!askConfidence) settle(Confidence.UNSURE)
    }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(q.prompt, color = Color.White, fontSize = 19.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
        AnswerField(typed, { typed = it }, enabled = !submitted, onDone = ::submit)
        if (!submitted) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SecondaryButton("I don't know", {
                    submitted = true; gaveUp = true; conf = Confidence.GUESS; correct = false; onResult(false, Confidence.GUESS)
                }, Modifier.weight(1f))
                PrimaryButton("Check", ::submit, Modifier.weight(1f), enabled = typed.isNotBlank())
            }
        }
        AnimatedVisibility(submitted && conf == null, enter = fadeIn() + expandVertically()) {
            Column {
                Text("How sure are you?", color = TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp, bottom = 6.dp))
                ChoiceRow(listOf("Guessing" to { settle(Confidence.GUESS) }, "Fairly sure" to { settle(Confidence.UNSURE) }, "Certain" to { settle(Confidence.SURE) }))
            }
        }
        val c = conf
        if (c != null) {
            val ok = correct
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp))
                    .background(Brush.verticalGradient(listOf((when (ok) { true -> Pal.Leaf; false -> Pal.Coral; null -> Mint }).copy(alpha = 0.16f), Card2)))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    when {
                        ok == null -> "Compare with your answer"
                        gaveUp -> "Here's the answer."
                        ok && c == Confidence.GUESS -> "Right, and now you know why."
                        ok -> "Correct."
                        c == Confidence.SURE -> "Surprise! You were sure. Confident mistakes like this are the ones memory fixes best."
                        else -> "Not quite."
                    },
                    color = when (ok) { true -> Pal.Leaf; false -> Pal.Coral; null -> Mint }, fontWeight = FontWeight.Bold, fontSize = 15.sp, lineHeight = 20.sp,
                )
                Text(q.answer, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 21.sp)
                Text(card.why, color = Color.White.copy(alpha = 0.9f), fontSize = 14.sp, lineHeight = 20.sp)
            }
            if (ok == null) {
                Text("Did you get it?", color = TextMuted, fontSize = 13.sp)
                ChoiceRow(listOf(
                    "No" to { correct = false; onResult(false, c) },
                    "Yes, I had it" to { correct = true; onResult(true, c) },
                ))
            } else {
                footer(ok)
            }
        }
    }
}

@Composable
fun GradeButtons(card: Card, onGrade: (Grade) -> Unit) {
    val now = remember(card.id) { System.currentTimeMillis() }
    val prev = StudyStore.state(card.id)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(Grade.AGAIN to ("Forgot" to Pal.Coral), Grade.HARD to ("Hard" to Pal.Gold), Grade.GOOD to ("Good" to Mint), Grade.EASY to ("Easy" to Pal.Sky))
            .forEach { (g, lc) ->
                Column(
                    Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(lc.second.copy(alpha = 0.16f))
                        .border(1.dp, lc.second.copy(alpha = 0.6f), RoundedCornerShape(12.dp)).clickable { onGrade(g) }.padding(vertical = 10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(lc.first, color = lc.second, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(Scheduler.preview(prev, g, now), color = TextMuted, fontSize = 11.sp)
                }
            }
    }
}

@Composable
fun SectionLabel(text: String) {
    Text(text.uppercase(), color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp,
        modifier = Modifier.padding(top = 6.dp, bottom = 2.dp))
}

@Composable
fun StatTile(value: String, label: String, color: Color, modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(16.dp)).background(Card2).padding(14.dp)) {
        Text(value, color = color, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(label, color = TextMuted, fontSize = 12.sp, lineHeight = 15.sp)
    }
}

@Composable
fun MasteryBar(f: Float, color: Color = Mint, modifier: Modifier = Modifier) {
    Box(modifier.height(6.dp).clip(RoundedCornerShape(3.dp)).background(Line)) {
        Box(Modifier.fillMaxWidth(f.coerceIn(0f, 1f)).height(6.dp).background(color))
    }
}

@Composable
fun Centered(content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { content() }
}

@Composable
fun BigNote(title: String, body: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
        Text(title, color = Color.White, fontSize = 22.sp, fontFamily = FontFamily.Serif, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text(body, color = TextMuted, fontSize = 14.sp, lineHeight = 20.sp, textAlign = TextAlign.Center)
    }
}
