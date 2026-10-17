package com.aidantorrence.syncreader

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.animateScrollBy
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.activity.compose.BackHandler
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ContentPaste
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Forward10
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.Replay10
import androidx.compose.material.icons.automirrored.rounded.VolumeOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/** Root: the library is home, the reader opens on top of it. */
@Composable
fun SyncReaderApp(viewModel: ReaderViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    when (state.screen) {
        Screen.LIBRARY -> LibraryScreen(
            state = state,
            onOpenBook = viewModel::openBook,
            onOpenCustom = viewModel::openCustom,
        )
        Screen.READER -> ReaderScreen(viewModel, state)
    }
}

@Composable
fun ReaderScreen(viewModel: ReaderViewModel, state: ReaderUiState) {
    var editing by remember { mutableStateOf(false) }
    BackHandler(onBack = viewModel::closeReader)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        TopBar(state, onBack = viewModel::closeReader, onMode = viewModel::setMode, onEdit = { editing = true })
        SpeedRow(state, onSpeed = viewModel::setSpeed, onStep = viewModel::stepSpeed)

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when {
                state.document.isEmpty -> EmptyState(onEdit = { editing = true })
                state.mode == ViewMode.FLOW -> FlowView(state.document, state.currentWord, onTapWord = viewModel::seekToWord)
                else -> FocusView(state.document, state.currentWord)
            }
        }

        BottomBar(
            state = state,
            onTogglePlay = viewModel::togglePlay,
            onRestart = viewModel::restart,
            onSkip = viewModel::skipWords,
            onSeek = viewModel::seekToProgress,
            onSilent = viewModel::setSilent,
        )
    }

    if (editing) {
        EditorDialog(
            initial = state.document.text,
            onDismiss = { editing = false },
            onSave = { viewModel.setText(it); editing = false },
        )
    }
}

// ---- top ---------------------------------------------------------------------------------------

@Composable
private fun TopBar(state: ReaderUiState, onBack: () -> Unit, onMode: (ViewMode) -> Unit, onEdit: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(start = 4.dp, end = 8.dp, top = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back to library", tint = Color.White)
        }
        Text(
            state.title,
            modifier = Modifier.weight(1f).padding(end = 8.dp),
            fontFamily = FontFamily.Serif,
            fontSize = 17.sp,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        SingleChoiceSegmentedButtonRow {
            ViewMode.entries.forEachIndexed { i, mode ->
                SegmentedButton(
                    selected = state.mode == mode,
                    onClick = { onMode(mode) },
                    shape = SegmentedButtonDefaults.itemShape(index = i, count = ViewMode.entries.size),
                    colors = SegmentedButtonDefaults.colors(
                        activeContainerColor = Accent,
                        activeContentColor = Background,
                        inactiveContainerColor = Color.Transparent,
                        inactiveContentColor = TextMuted,
                    ),
                    icon = {},
                ) {
                    Text(if (mode == ViewMode.FLOW) "Flow" else "Focus", fontSize = 13.sp)
                }
            }
        }
        if (state.isCustom) {
            IconButton(onClick = onEdit) {
                Icon(Icons.Rounded.Edit, contentDescription = "Edit text", tint = Color.White)
            }
        }
    }
}

@Composable
private fun SpeedRow(state: ReaderUiState, onSpeed: (Float) -> Unit, onStep: (Int) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        IconButton(onClick = { onStep(-1) }, enabled = state.speed > MIN_SPEED) {
            Icon(Icons.Rounded.Remove, contentDescription = "Slower", tint = TextMuted)
        }
        SPEED_PRESETS.forEach { preset ->
            val selected = kotlin.math.abs(state.speed - preset) < 0.01f
            FilterChip(
                selected = selected,
                onClick = { onSpeed(preset) },
                label = { Text(formatSpeed(preset), fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Accent,
                    selectedLabelColor = Background,
                    labelColor = Color(0xFFBBBBBB),
                ),
            )
        }
        IconButton(onClick = { onStep(1) }, enabled = state.speed < MAX_SPEED) {
            Icon(Icons.Rounded.Add, contentDescription = "Faster", tint = TextMuted)
        }
        if (SPEED_PRESETS.none { kotlin.math.abs(state.speed - it) < 0.01f }) {
            Text(formatSpeed(state.speed), color = Accent, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

private fun formatSpeed(speed: Float): String =
    if (speed == speed.toInt().toFloat()) "${speed.toInt()}x" else "${speed}x".replace(".0x", "x")

// ---- reading views -----------------------------------------------------------------------------

private val FlowStyle = TextStyle(fontFamily = FontFamily.Serif, fontSize = 21.sp, lineHeight = 36.sp)

/** Full text with the spoken word highlighted; read words dim, unread words bright. Auto-scrolls. */
@Composable
private fun FlowView(doc: Document, current: Int, onTapWord: (Int) -> Unit) {
    val listState = rememberLazyListState()
    val layouts = remember(doc) { HashMap<Int, TextLayoutResult>() }
    val safeCurrent = current.coerceIn(0, doc.lastWord)
    val currentPara = doc.words[safeCurrent].paragraph

    LaunchedEffect(doc, safeCurrent) {
        val info = listState.layoutInfo
        val viewport = info.viewportSize.height
        if (viewport <= 0) return@LaunchedEffect
        val item = info.visibleItemsInfo.firstOrNull { it.index == currentPara }
        val layout = layouts[currentPara]
        if (item == null || layout == null) {
            listState.animateScrollToItem(currentPara, -(viewport * 0.3f).toInt())
            return@LaunchedEffect
        }
        val range = doc.paragraphs[currentPara]
        val rel = doc.words[safeCurrent].start - doc.words[range.first].start
        val line = layout.getLineForOffset(rel.coerceIn(0, maxOf(0, layout.layoutInput.text.length - 1)))
        val y = item.offset + layout.getLineTop(line)
        if (y < viewport * 0.12f || y > viewport * 0.62f) {
            listState.animateScrollBy(y - viewport * 0.35f)
        }
    }

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 40.dp),
        verticalArrangement = Arrangement.spacedBy(22.dp),
    ) {
        itemsIndexed(doc.paragraphs, key = { i, _ -> i }) { i, range ->
            ParagraphText(
                doc = doc,
                range = range,
                current = safeCurrent,
                onLayout = { layouts[i] = it },
                onTapWord = onTapWord,
            )
        }
    }
}

private val ReadSpan = SpanStyle(color = TextRead)
private val UnreadSpan = SpanStyle(color = TextUnread)
private val CurrentSpan = SpanStyle(color = Background, background = Accent)

@Composable
private fun ParagraphText(
    doc: Document,
    range: IntRange,
    current: Int,
    onLayout: (TextLayoutResult) -> Unit,
    onTapWord: (Int) -> Unit,
) {
    val base = doc.words[range.first].start
    val end = doc.words[range.last].end
    // -1: whole paragraph already read; -2: not reached yet; otherwise the highlighted word.
    val marker = when {
        current > range.last -> -1
        current < range.first -> -2
        else -> current
    }
    val text = remember(doc, range, marker) {
        buildAnnotatedString {
            append(doc.text, base, end)
            when (marker) {
                -1 -> addStyle(ReadSpan, 0, length)
                -2 -> addStyle(UnreadSpan, 0, length)
                else -> {
                    val w = doc.words[marker]
                    addStyle(ReadSpan, 0, w.start - base)
                    addStyle(CurrentSpan, w.start - base, w.end - base)
                    addStyle(UnreadSpan, w.end - base, length)
                }
            }
        }
    }
    val layoutHolder = remember { arrayOfNulls<TextLayoutResult>(1) }

    Text(
        text = text,
        style = FlowStyle,
        onTextLayout = { layoutHolder[0] = it; onLayout(it) },
        modifier = Modifier
            .fillMaxWidth()
            .pointerInput(doc, range) {
                detectTapGestures { pos ->
                    val layout = layoutHolder[0] ?: return@detectTapGestures
                    val offset = layout.getOffsetForPosition(pos)
                    onTapWord(doc.wordAtChar(base + offset, range.first, range.last + 1))
                }
            },
    )
}

/** One word at a time, centered on its optimal recognition point. */
@Composable
private fun FocusView(doc: Document, current: Int) {
    val idx = current.coerceIn(0, doc.lastWord)
    val word = doc.words[idx].text
    val orp = orpIndex(word.length).coerceAtMost(word.length - 1)
    val size = when {
        word.length <= 8 -> 56.sp
        word.length <= 12 -> 42.sp
        else -> 30.sp
    }
    val big = TextStyle(fontFamily = FontFamily.Serif, fontSize = size, lineHeight = size * 1.2f)

    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(modifier = Modifier.width(1.dp).height(22.dp).background(Color(0xFF444444)))
        Spacer(Modifier.height(14.dp))
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                word.substring(0, orp),
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.End,
                style = big,
                color = Color.White,
                maxLines = 1,
                softWrap = false,
            )
            Text(word.substring(orp, orp + 1), style = big, color = Accent)
            Text(
                word.substring(orp + 1),
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Start,
                style = big,
                color = Color.White,
                maxLines = 1,
                softWrap = false,
            )
        }
        Spacer(Modifier.height(14.dp))
        Box(modifier = Modifier.width(1.dp).height(22.dp).background(Color(0xFF444444)))
        Spacer(Modifier.height(40.dp))
        Text(
            text = contextLine(doc, idx),
            color = TextMuted,
            fontSize = 14.sp,
            lineHeight = 22.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(0.85f),
        )
    }
}

private fun contextLine(doc: Document, idx: Int): AnnotatedString = buildAnnotatedString {
    val from = maxOf(0, idx - 7)
    val to = minOf(doc.lastWord, idx + 7)
    for (i in from..to) {
        if (i > from) append(' ')
        if (i == idx) {
            val s = length
            append(doc.words[i].text)
            addStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.SemiBold), s, length)
        } else {
            append(doc.words[i].text)
        }
    }
}

@Composable
private fun EmptyState(onEdit: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Nothing to read yet", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 22.sp)
        Spacer(Modifier.height(8.dp))
        Text(
            "Paste an article or share text from any app.",
            color = TextMuted,
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(20.dp))
        Button(onClick = onEdit, colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Background)) {
            Text("Add text")
        }
    }
}

// ---- bottom ------------------------------------------------------------------------------------

@Composable
private fun BottomBar(
    state: ReaderUiState,
    onTogglePlay: () -> Unit,
    onRestart: () -> Unit,
    onSkip: (Int) -> Unit,
    onSeek: (Float) -> Unit,
    onSilent: (Boolean) -> Unit,
) {
    var dragging by remember { mutableStateOf(false) }
    var sliderValue by remember { mutableFloatStateOf(state.progress) }
    LaunchedEffect(state.progress, dragging) {
        if (!dragging) sliderValue = state.progress
    }

    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)) {
        Slider(
            value = sliderValue,
            onValueChange = { dragging = true; sliderValue = it },
            onValueChangeFinished = { dragging = false; onSeek(sliderValue) },
            enabled = !state.document.isEmpty,
            colors = SliderDefaults.colors(
                thumbColor = Accent,
                activeTrackColor = Accent,
                inactiveTrackColor = Color(0xFF2A2A2A),
            ),
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            IconButton(onClick = onRestart) {
                Icon(Icons.Rounded.Replay, contentDescription = "Restart", tint = TextMuted)
            }
            IconButton(onClick = { onSkip(-10) }) {
                Icon(Icons.Rounded.Replay10, contentDescription = "Back 10 words", tint = Color.White)
            }
            FilledIconButton(
                onClick = onTogglePlay,
                enabled = !state.document.isEmpty,
                modifier = Modifier.size(64.dp),
                shape = CircleShape,
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = Color.White, contentColor = Background),
            ) {
                Icon(
                    if (state.playing) Icons.Rounded.Pause else Icons.Rounded.PlayArrow,
                    contentDescription = if (state.playing) "Pause" else "Play",
                    modifier = Modifier.size(32.dp),
                )
            }
            IconButton(onClick = { onSkip(10) }) {
                Icon(Icons.Rounded.Forward10, contentDescription = "Forward 10 words", tint = Color.White)
            }
            IconButton(onClick = { onSilent(!state.silent) }) {
                Icon(
                    if (state.silent) Icons.AutoMirrored.Rounded.VolumeOff else Icons.AutoMirrored.Rounded.VolumeUp,
                    contentDescription = if (state.silent) "Audio off" else "Audio on",
                    tint = if (state.silent) Accent else TextMuted,
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(formatTime(state.secondsRemaining) + " left", color = TextMuted, fontSize = 12.sp)
            Text("≈ ${state.wordsPerMinute} wpm", color = TextMuted, fontSize = 12.sp)
            Spacer(Modifier.weight(1f))
            SyncBadge(state)
        }

        state.error?.let {
            Text(it, color = Color(0xFFFF7B7B), fontSize = 12.sp, lineHeight = 16.sp, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

@Composable
private fun SyncBadge(state: ReaderUiState) {
    val (label, color) = when {
        state.silent -> "Silent" to TextMuted
        state.finished -> "Finished" to TextMuted
        !state.ttsReady -> "No voice" to Color(0xFFFF7B7B)
        state.sync == SyncQuality.EXACT -> "Word-exact sync" to SyncGood
        state.sync == SyncQuality.ESTIMATED -> "Estimated sync" to Accent
        else -> "Ready" to TextMuted
    }
    Text(
        label.uppercase(),
        color = color,
        fontSize = 10.sp,
        letterSpacing = 1.2.sp,
        modifier = Modifier
            .background(Panel, RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

private fun formatTime(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%d:%02d".format(m, s)
}

// ---- editor ------------------------------------------------------------------------------------

@Composable
private fun EditorDialog(initial: String, onDismiss: () -> Unit, onSave: (String) -> Unit) {
    var text by remember { mutableStateOf(initial) }
    val clipboard = LocalClipboardManager.current

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(modifier = Modifier.fillMaxSize(), color = Background) {
            Column(modifier = Modifier.fillMaxSize().systemBarsPadding().padding(16.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = onDismiss) { Text("Cancel", color = TextMuted) }
                    Spacer(Modifier.weight(1f))
                    Text("Your text", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 18.sp)
                    Spacer(Modifier.weight(1f))
                    Button(
                        onClick = { onSave(text) },
                        colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Background),
                    ) { Text("Read") }
                }
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    OutlinedButton(onClick = { clipboard.getText()?.text?.let { text = it } }) {
                        Icon(Icons.Rounded.ContentPaste, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Paste")
                    }
                    OutlinedButton(onClick = { text = SAMPLE_TEXT }) { Text("Sample") }
                    OutlinedButton(onClick = { text = "" }) { Text("Clear") }
                }
                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    placeholder = { Text("Paste or type anything you want to read.", color = TextMuted) },
                    textStyle = TextStyle(fontSize = 16.sp, lineHeight = 26.sp, color = Color.White),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Accent,
                        unfocusedBorderColor = Color(0xFF333333),
                        cursorColor = Accent,
                    ),
                )
                val words = remember(text) { Document(text).words.size }
                Text("$words words", color = TextMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
            }
        }
    }
}
