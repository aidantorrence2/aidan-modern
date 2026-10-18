package com.aidantorrence.syncstudy

import android.app.Application
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.hasSetTextAction
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/** Captures the main study screens, driving taps where a state needs interaction. Output: build/screens. */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w411dp-h891dp-xxhdpi")
class StudyScreensTest {
    @get:Rule val rule = createComposeRule()
    private val app get() = ApplicationProvider.getApplicationContext<Application>()
    private lateinit var reader: ReaderViewModel
    private lateinit var study: StudyViewModel

    @Before fun setUp() {
        StudyStore.resetForTest()
        reader = ReaderViewModel(app)
        study = StudyViewModel(app)
    }

    private fun show(content: @Composable () -> Unit) = rule.setContent {
        CompositionLocalProvider(LocalVisualMotion provides false) { SyncStudyTheme(content) }
    }

    private fun shot(name: String) { rule.waitForIdle(); rule.onRoot().captureRoboImage("build/screens/$name.png") }

    private fun seedProgress() {
        val now = System.currentTimeMillis()
        val s = studyFor("atomic-habits")!!
        StudyStore.advance("atomic-habits", Stage.DONE)
        s.cards.take(6).forEachIndexed { i, c -> StudyStore.record(c, if (i % 3 == 0) Grade.AGAIN else Grade.GOOD, i % 3 != 0, now - 3 * Scheduler.DAY) }
        StudyStore.introduce("atomic-habits", now - 1000)
    }

    @Test fun home() { show { SyncStudyApp(reader, study) }; shot("01-home") }

    @Test fun homeWithProgress() { seedProgress(); show { SyncStudyApp(reader, study) }; shot("02-home-progress") }

    @Test fun intro() { study.go(Route.Intro("atomic-habits")); show { SyncStudyApp(reader, study) }; shot("03-intro") }

    @Test fun pretest() {
        study.go(Route.Pretest("atomic-habits", 0)); show { SyncStudyApp(reader, study) }
        rule.onNode(hasSetTextAction()).performTextInput("maybe twice as good?"); shot("04-pretest")
    }

    @Test fun checkpoint() {
        study.go(Route.Read("atomic-habits")); show { SyncStudyApp(reader, study) }
        rule.waitForIdle(); reader.checkpointForTest(0); shot("05-checkpoint")
        rule.onNode(hasSetTextAction()).performTextInput("About 37 times better")
        rule.onNodeWithText("Check").performClick(); shot("06-checkpoint-confidence")
        rule.onNodeWithText("Fairly sure").performClick(); shot("07-checkpoint-revealed")
    }

    @Test fun checkpointWrongButSure() {
        study.go(Route.Read("atomic-habits")); show { SyncStudyApp(reader, study) }
        rule.waitForIdle(); reader.checkpointForTest(2)
        rule.onNode(hasSetTextAction()).performTextInput("Craving")
        rule.onNodeWithText("Check").performClick(); rule.onNodeWithText("Certain").performClick(); shot("08-checkpoint-hypercorrection")
    }

    @Test fun recall() {
        study.go(Route.Recall("atomic-habits")); show { SyncStudyApp(reader, study) }
        rule.onNodeWithText("Compare with the key ideas").performClick()
        rule.onNodeWithText("Never miss twice.").performClick(); shot("09-recall")
    }

    @Test fun reviewCards() {
        seedProgress(); study.startReview("atomic-habits"); show { SyncStudyApp(reader, study) }
        shot("10-review-first")
    }

    @Test fun reviewRecallRevealed() {
        val card = studyFor("atomic-habits")!!.cards.first { it is Recall }
        study.startReview("atomic-habits")
        // force a session holding just this card
        StudyStore.introduce("atomic-habits")
        study.startReview("atomic-habits", limit = 40)
        show { SyncStudyApp(reader, study) }
        var guard = 0
        while (study.session.value?.current?.id != card.id && guard++ < 40) { study.answerReview(study.session.value!!.current!!, Grade.GOOD, true); rule.waitForIdle() }
        rule.onNodeWithText("Show answer").performClick(); shot("11-review-explain")
    }

    @Test fun progress() { seedProgress(); study.go(Route.Home(2)); show { SyncStudyApp(reader, study) }; shot("12-progress") }

    @Test fun driveSetup() {
        DriveController.showForTest(DriveState())
        study.go(Route.Home(3)); show { SyncStudyApp(reader, study) }; shot("13-drive-setup")
    }

    @Test fun driveThinking() {
        DriveController.showForTest(DriveState(running = true, phase = DrivePhase.THINKING, title = "Atomic Habits", label = "Check",
            line = "Two runners have exactly the same goal. What separates the winner from the loser?",
            segment = 6, segments = 18, asked = 3, right = 2))
        study.go(Route.Home(3)); show { SyncStudyApp(reader, study) }; shot("14-drive-thinking")
        DriveController.showForTest(DriveState())
    }

    @Test fun driveAnswer() {
        DriveController.showForTest(DriveState(running = true, phase = DrivePhase.FEEDBACK, title = "Sapiens", label = "Review",
            line = "The answer: The Cognitive Revolution. Fiction let large groups cooperate.", segment = 9, segments = 18, asked = 5, right = 4))
        study.go(Route.Home(3)); show { SyncStudyApp(reader, study) }; shot("15-drive-answer")
        DriveController.showForTest(DriveState())
    }
}
