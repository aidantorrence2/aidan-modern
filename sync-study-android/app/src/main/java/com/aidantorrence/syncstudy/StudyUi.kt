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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
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

enum class OptionLook { IDLE, PICKED, RIGHT, WRONG, FADED }

@Composable
fun OptionRow(letter: Char, text: String, look: OptionLook, onClick: (() -> Unit)?) {
    val border by animateColorAsState(
        when (look) { OptionLook.PICKED -> Mint; OptionLook.RIGHT -> Pal.Leaf; OptionLook.WRONG -> Pal.Coral; else -> Line }, label = "b")
    val bg = when (look) {
        OptionLook.RIGHT -> Pal.Leaf.copy(alpha = 0.14f)
        OptionLook.WRONG -> Pal.Coral.copy(alpha = 0.14f)
        OptionLook.PICKED -> Mint.copy(alpha = 0.10f)
        else -> Card2
    }
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(bg).border(1.5.dp, border, RoundedCornerShape(14.dp))
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(26.dp).clip(CircleShape).background(if (look == OptionLook.IDLE || look == OptionLook.FADED) Line else border), contentAlignment = Alignment.Center) {
            Text(
                when (look) { OptionLook.RIGHT -> "✓"; OptionLook.WRONG -> "✕"; else -> letter.toString() },
                color = if (look == OptionLook.IDLE || look == OptionLook.FADED) Color.White else Background, fontWeight = FontWeight.Bold, fontSize = 13.sp,
            )
        }
        Spacer(Modifier.width(12.dp))
        Text(text, color = Color.White.copy(alpha = if (look == OptionLook.FADED) 0.45f else 1f), fontSize = 15.sp, lineHeight = 20.sp)
    }
}

/**
 * A multiple-choice question with a confidence step before the reveal.
 * Calls [onResult] once, when the answer is revealed; [footer] renders actions after the reveal.
 */
@Composable
fun McqPanel(
    card: Mcq,
    salt: Int,
    onResult: (correct: Boolean, confidence: Confidence) -> Unit,
    footer: @Composable (correct: Boolean) -> Unit,
    askConfidence: Boolean = true,
) {
    val order = remember(card.id, salt) { card.options.indices.shuffled(java.util.Random((card.id.hashCode() * 31L + salt))) }
    var picked by remember(card.id, salt) { mutableStateOf<Int?>(null) }
    var revealed by remember(card.id, salt) { mutableStateOf<Confidence?>(null) }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(card.question, color = Color.White, fontSize = 19.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
        order.forEachIndexed { pos, i ->
            val look = when {
                revealed != null && i == card.answer -> OptionLook.RIGHT
                revealed != null && i == picked -> OptionLook.WRONG
                revealed != null -> OptionLook.FADED
                i == picked -> OptionLook.PICKED
                else -> OptionLook.IDLE
            }
            OptionRow('A' + pos, card.options[i], look, if (revealed == null) ({
                picked = i
                if (!askConfidence) { revealed = Confidence.UNSURE; onResult(i == card.answer, Confidence.UNSURE) }
            }) else null)
        }
        AnimatedVisibility(picked != null && revealed == null && askConfidence, enter = fadeIn() + expandVertically()) {
            Column {
                Text("How sure are you?", color = TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp, bottom = 6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(Confidence.GUESS to "Guessing", Confidence.UNSURE to "Fairly sure", Confidence.SURE to "Certain").forEach { (c, l) ->
                        Box(
                            Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(Line).clickable {
                                revealed = c
                                onResult(picked == card.answer, c)
                            }.padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center,
                        ) { Text(l, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp) }
                    }
                }
            }
        }
        val conf = revealed
        if (conf != null) {
            val correct = picked == card.answer
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp))
                    .background(Brush.verticalGradient(listOf((if (correct) Pal.Leaf else Pal.Coral).copy(alpha = 0.16f), Card2)))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    when {
                        correct && conf == Confidence.GUESS -> "Right, and now you know why."
                        correct -> "Correct."
                        conf == Confidence.SURE -> "Surprise! You were sure. Confident mistakes like this are the ones memory fixes best."
                        else -> "Not quite."
                    },
                    color = if (correct) Pal.Leaf else Pal.Coral, fontWeight = FontWeight.Bold, fontSize = 15.sp, lineHeight = 20.sp,
                )
                Text(card.why, color = Color.White.copy(alpha = 0.9f), fontSize = 14.sp, lineHeight = 20.sp)
            }
            footer(correct)
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
