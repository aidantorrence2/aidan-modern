package com.aidantorrence.syncreader

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
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

/** Home screen: every title is represented by its living artwork, Spotify-style. */
@Composable
fun LibraryScreen(
    state: ReaderUiState,
    onOpenBook: (String) -> Unit,
    onOpenCustom: () -> Unit,
    onResume: () -> Unit,
    onTogglePlay: () -> Unit,
) {
    // One shared clock for every cover on screen.
    val clock = rememberVisualClock(LIBRARY_TEMPO)
    val featured = featuredBook(state)
    val showMini = !state.document.isEmpty

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 20.dp, bottom = if (showMini) 104.dp else 32.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column {
                    Text("Sync Reader", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Ten nonfiction classics. Read along with the voice at any speed.",
                        color = TextMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                    )
                }
            }
            item(span = { GridItemSpan(maxLineSpan) }) {
                HeroCard(
                    book = featured,
                    label = when {
                        state.bookId == featured.id && state.playing -> "NOW READING"
                        (state.progressByBook[featured.id] ?: 0f) in 0.0001f..0.999f -> "CONTINUE"
                        else -> "START HERE"
                    },
                    minutes = state.minutesFor(featured.summary),
                    progress = state.progressByBook[featured.id] ?: 0f,
                    clock = clock,
                    onClick = { onOpenBook(featured.id) },
                )
            }
            item(span = { GridItemSpan(maxLineSpan) }) {
                Text("All titles", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
            }
            items(LIBRARY, key = { it.id }) { book ->
                CoverTile(
                    book = book,
                    minutes = state.minutesFor(book.summary),
                    progress = state.progressByBook[book.id] ?: 0f,
                    playing = state.playing && state.bookId == book.id,
                    clock = clock,
                    onClick = { onOpenBook(book.id) },
                )
            }
            item(span = { GridItemSpan(maxLineSpan) }) {
                CustomCard(progress = state.progressByBook[CUSTOM_BOOK_ID] ?: 0f, clock = clock, onClick = onOpenCustom)
            }
        }

        if (showMini) {
            MiniPlayer(
                state = state,
                clock = clock,
                onClick = onResume,
                onTogglePlay = onTogglePlay,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .windowInsetsPadding(WindowInsets.safeDrawing)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
            )
        }
    }
}

/** The title loaded right now, else one in progress, else the first in the library. */
private fun featuredBook(state: ReaderUiState): Book =
    findBook(state.bookId)
        ?: LIBRARY.firstOrNull { (state.progressByBook[it.id] ?: 0f) in 0.0001f..0.999f }
        ?: LIBRARY.first()

private val Fade = Brush.verticalGradient(
    0.25f to Color.Transparent,
    0.6f to Color.Black.copy(alpha = 0.6f),
    1f to Color.Black.copy(alpha = 0.92f),
)

@Composable
private fun HeroCard(book: Book, label: String, minutes: Int, progress: Float, clock: State<Float>, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1.3f)
            .clip(RoundedCornerShape(22.dp))
            .clickable(onClick = onClick),
    ) {
        BookVisual(BookArt(book.visual, book.color), clock, Modifier.fillMaxSize())
        Box(Modifier.fillMaxSize().background(Fade))
        Column(
            modifier = Modifier.align(Alignment.BottomStart).padding(start = 18.dp, end = 86.dp, bottom = 18.dp),
        ) {
            Text(label, color = Accent, fontSize = 11.sp, letterSpacing = 1.4.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(6.dp))
            Text(
                book.title,
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontSize = 24.sp,
                lineHeight = 29.sp,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(4.dp))
            Text("${book.author} · ≈ $minutes min", color = Color(0xFFCCCCCC), fontSize = 13.sp)
            if (progress > 0f) {
                Spacer(Modifier.height(10.dp))
                ProgressLine(progress)
            }
        }
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(18.dp)
                .size(54.dp)
                .clip(CircleShape)
                .background(Accent),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Rounded.PlayArrow, contentDescription = "Open ${book.title}", tint = Background, modifier = Modifier.size(30.dp))
        }
    }
}

@Composable
private fun CoverTile(book: Book, minutes: Int, progress: Float, playing: Boolean, clock: State<Float>, onClick: () -> Unit) {
    Column(modifier = Modifier.clickable(onClick = onClick)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(16.dp)),
        ) {
            BookVisual(BookArt(book.visual, book.color), clock, Modifier.fillMaxSize())
            if (playing) {
                Text(
                    "PLAYING",
                    color = Background,
                    fontSize = 9.sp,
                    letterSpacing = 1.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                        .background(Accent, RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp),
                )
            }
            if (progress > 0f) {
                Box(Modifier.align(Alignment.BottomCenter).padding(10.dp)) { ProgressLine(progress) }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            book.title,
            color = Color.White,
            fontFamily = FontFamily.Serif,
            fontSize = 15.sp,
            lineHeight = 19.sp,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.height(2.dp))
        Text(
            if (progress >= 0.999f) "${book.author} · Finished" else "${book.author} · $minutes min",
            color = if (progress >= 0.999f) SyncGood else TextMuted,
            fontSize = 12.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun CustomCard(progress: Float, clock: State<Float>, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Panel)
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(modifier = Modifier.size(64.dp).clip(RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
            BookVisual(CUSTOM_ART, clock, Modifier.fillMaxSize())
            Icon(Icons.Rounded.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text("Your own text", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 17.sp)
            Spacer(Modifier.height(4.dp))
            Text(
                "Paste an article or notes, or share text here from any app.",
                color = Color(0xFFB0B0B0),
                fontSize = 12.sp,
                lineHeight = 17.sp,
            )
            if (progress > 0f) {
                Spacer(Modifier.height(8.dp))
                ProgressLine(progress)
            }
        }
    }
}

/** Spotify-style now-playing bar: tap to return to the reader, or play and pause from here. */
@Composable
private fun MiniPlayer(
    state: ReaderUiState,
    clock: State<Float>,
    onClick: () -> Unit,
    onTogglePlay: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val art = artFor(state.bookId)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(lerpPanel(art.color))
            .clickable(onClick = onClick),
    ) {
        Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            BookVisual(art, clock, Modifier.size(48.dp).clip(RoundedCornerShape(8.dp)))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    state.title,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                val speed = formatSpeedLabel(state.speed)
                Text(
                    when {
                        state.finished -> "Finished"
                        state.playing -> "Reading at $speed · ${state.wordsPerMinute} wpm"
                        else -> "Paused · ${(state.progress * 100).toInt()}%"
                    },
                    color = Color(0xFFCCCCCC),
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            IconButton(onClick = onTogglePlay) {
                Icon(
                    if (state.playing) Icons.Rounded.Pause else Icons.Rounded.PlayArrow,
                    contentDescription = if (state.playing) "Pause" else "Play",
                    tint = Color.White,
                    modifier = Modifier.size(30.dp),
                )
            }
        }
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth(state.progress.coerceIn(0f, 1f))
                .height(2.dp)
                .background(Color.White.copy(alpha = 0.85f)),
        )
    }
}

/** A dark panel tinted with the title's color, like Spotify's now-playing bar. */
private fun lerpPanel(color: Long): Color =
    androidx.compose.ui.graphics.lerp(Color(color), Color(0xFF111111), 0.72f)

internal fun formatSpeedLabel(speed: Float): String {
    val r = Math.round(speed * 100) / 100f
    return if (r == r.toInt().toFloat()) "${r.toInt()}x" else "${r}x"
}

@Composable
private fun ProgressLine(progress: Float) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(3.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(Color.White.copy(alpha = 0.2f)),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .height(3.dp)
                .background(Accent),
        )
    }
}
