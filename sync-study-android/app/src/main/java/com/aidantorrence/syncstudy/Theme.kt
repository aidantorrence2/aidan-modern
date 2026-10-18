package com.aidantorrence.syncstudy

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Background = Color(0xFF0C0C0C)
val Panel = Color(0xFF161616)
val Accent = Color(0xFF4FD1A5)
val TextRead = Color(0x73FFFFFF)
val TextUnread = Color(0xE6FFFFFF)
val TextMuted = Color(0xFF8A8A8A)
val SyncGood = Color(0xFF7FD18A)

private val Scheme = darkColorScheme(
    primary = Accent,
    onPrimary = Background,
    secondary = Accent,
    background = Background,
    onBackground = Color.White,
    surface = Background,
    onSurface = Color.White,
    surfaceVariant = Panel,
    onSurfaceVariant = Color(0xFFCCCCCC),
    outline = Color(0xFF3A3A3A),
)

@Composable
fun SyncStudyTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Scheme, content = content)
}
