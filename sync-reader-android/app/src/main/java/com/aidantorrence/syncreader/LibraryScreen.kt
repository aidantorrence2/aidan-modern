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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** Home screen: the built-in titles, each with its read time and how far along the reader is. */
@Composable
fun LibraryScreen(state: ReaderUiState, onOpenBook: (String) -> Unit, onOpenCustom: () -> Unit) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .windowInsetsPadding(WindowInsets.safeDrawing),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Column(modifier = Modifier.padding(bottom = 8.dp)) {
                Text("Sync Reader", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 30.sp)
                Spacer(Modifier.height(6.dp))
                Text(
                    "Ten nonfiction classics, summarized. Pick one, choose a speed, and read along with the voice.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    lineHeight = 21.sp,
                )
            }
        }
        items(LIBRARY, key = { it.id }) { book ->
            BookCard(
                book = book,
                index = LIBRARY.indexOf(book) + 1,
                minutes = state.minutesFor(book.summary),
                progress = state.progressByBook[book.id] ?: 0f,
                onClick = { onOpenBook(book.id) },
            )
        }
        item {
            CustomCard(progress = state.progressByBook[CUSTOM_BOOK_ID] ?: 0f, onClick = onOpenCustom)
        }
    }
}

@Composable
private fun BookCard(book: Book, index: Int, minutes: Int, progress: Float, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Panel)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .width(52.dp)
                .height(72.dp)
                .clip(RoundedCornerShape(topStart = 4.dp, bottomStart = 4.dp, topEnd = 8.dp, bottomEnd = 8.dp))
                .background(Color(book.color)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                index.toString().padStart(2, '0'),
                color = Color.White.copy(alpha = 0.9f),
                fontFamily = FontFamily.Serif,
                fontSize = 20.sp,
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                book.title,
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontSize = 17.sp,
                lineHeight = 22.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(2.dp))
            Text("${book.author} · ${book.year}", color = TextMuted, fontSize = 12.sp)
            Spacer(Modifier.height(6.dp))
            Text(
                book.blurb,
                color = Color(0xFFB0B0B0),
                fontSize = 12.sp,
                lineHeight = 17.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(8.dp))
            MetaRow(minutes = minutes, progress = progress)
        }
    }
}

@Composable
private fun CustomCard(progress: Float, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Panel)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .width(52.dp)
                .height(72.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF262626)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Rounded.Edit, contentDescription = null, tint = Accent, modifier = Modifier.size(22.dp))
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

@Composable
private fun MetaRow(minutes: Int, progress: Float) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("≈ $minutes min at 1x", color = TextMuted, fontSize = 11.sp)
        when {
            progress >= 0.999f -> Text("Finished", color = SyncGood, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            progress > 0f -> Box(modifier = Modifier.weight(1f)) { ProgressLine(progress) }
        }
    }
}

@Composable
private fun ProgressLine(progress: Float) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(3.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(Color(0xFF2A2A2A)),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .height(3.dp)
                .background(Accent),
        )
    }
}
