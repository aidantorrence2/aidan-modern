package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.MindsetProps.Ball
import com.aidantorrence.syncstudy.MindsetProps.Crown
import com.aidantorrence.syncstudy.MindsetProps.DoubtCloud
import com.aidantorrence.syncstudy.MindsetProps.Gavel
import com.aidantorrence.syncstudy.MindsetProps.Key
import com.aidantorrence.syncstudy.MindsetProps.Neurons
import com.aidantorrence.syncstudy.MindsetProps.Padlock
import com.aidantorrence.syncstudy.MindsetProps.Puzzle
import com.aidantorrence.syncstudy.MindsetProps.Stamp
import com.aidantorrence.syncstudy.MindsetProps.Staircase
import com.aidantorrence.syncstudy.MindsetProps.TestPaper
import com.aidantorrence.syncstudy.MindsetProps.WateringCan
import kotlin.math.pow

/** Animated explainer films for Mindset, one per paragraph. */
val MINDSET_STAGE = listOf(
    stage("Two beliefs about ability", Backdrops.studio(Color(0xFF243049))) {
        add("hard", Puzzle(5, 4, Pal.Coral, "a hard problem"), 200, 120).with("done", 0.35)
        add("a", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[2], 1, seed = 1), 90, 236).with("mood", 0)
        add("b", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 2), 310, 236)
        add("tA", Tag("wilts", Pal.Slate, dark = false), 90, 270)
        add("tB", Tag("digs in", Pal.Mint), 310, 270)
        add("brainA", Brain(Pal.Rose), 72, 116, 0.5)
        add("lock", Padlock(), 96, 132, 0.6)
        add("fixed", Tag("FIXED: ability is set", Pal.Coral), 92, 66)
        add("nB", Neurons(46f), 328, 112)
        add("brainB", Brain(Pal.Rose), 328, 112, 0.5)
        add("growth", Tag("GROWTH: ability can grow", Pal.Mint), 314, 66)
        add("helper", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 2, seed = 3), 375, 236, 0.75)
        add("esh", Caption("effort · strategy · help", 11f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 310, 292)
        add("think", Bubble("I'm just not a maths person", 110f, -0.3f, thought = true, italic = true), 104, 64)
        add("shapes", Caption("this hidden belief shapes what you do next", 11.5f, Pal.White, chip = Pal.Ink.a(0.6f), maxWidth = 300f), 200, 44)
        beat("some people wilt") {
            show("hard", "a"); set("a", "look", 1, 400); set("a", "mood", -0.6, 600, 600); set("a", "s", 0.9, 800, 600); show("tA", delay = 900)
        }
        beat("others dig in") { show("b", "tB"); set("b", "look", -1, 300); set("b", "arms", 0.7, 500, 400); set("b", "mood", 0.8, 500, 400); set("hard", "done", 0.6, 1500, 600) }
        beat("fixed mindset") { show("brainA", "lock", "fixed", stagger = 150) }
        beat("growth mindset") {
            show("brainB", "nB", "growth", stagger = 150); set("nB", "p", 1, 2200, 400, Ease.Linear); scale("brainB", 0.72, 1600, 400, Ease.InOut)
        }
        beat("effort, strategy, and help") { show("helper"); set("helper", "point", 1, 500, 300); show("esh", delay = 400); set("hard", "done", 1, 1500, 300) }
        beat("often unconscious") { hide("fixed"); show("think") }
        beat("shapes almost everything") { hide("think", "growth"); show("shapes", delay = 300) }
    },
    stage("Inside the fixed mindset", Backdrops.room(Color(0xFF4A3B55))) {
        add("table", Table(110f), 285, 210)
        add("gavel", Gavel(), 290, 204)
        add("paper", TestPaper("C", Pal.Coral), 172, 168, 0.9)
        add("f", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[0], 0, seed = 4), 110, 236)
        add("tTest", Tag("every task = a test of you", Pal.Coral), 200, 58)
        add("verdict", Tag("VERDICT: not smart", Pal.Coral), 285, 120)
        add("easy", Puzzle(2, 2, Pal.Leaf, "easy"), 520, 140)
        add("hardP", Puzzle(5, 4, Pal.Coral, "hard"), 690, 140)
        add("pick", Arrow(-36f, -34f, -12f, Pal.Leaf), 572, 202)
        add("tUp", Tag("gives up", Pal.Slate, dark = false), 600, 280)
        add("rival", Bean(Pal.Mint, Pal.Skin[3], Pal.Hair[3], 3, seed = 5), 720, 236).with("arms", 1).with("mood", 0.9)
        add("trophy", Trophy(), 760, 150, 0.6)
        add("kid", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[2], 2, seed = 6), 960, 236, 0.75)
        add("adult", Bean(Pal.Gold, Pal.Skin[2], Pal.Hair[1], 1, seed = 7), 880, 236)
        add("praise", Bubble("You're so smart!", 96f, -0.2f), 892, 106)
        add("easy2", Puzzle(2, 2, Pal.Leaf, "easy"), 1060, 112, 0.9)
        add("hard2", Puzzle(5, 4, Pal.Coral, "hard"), 1145, 112, 0.9)
        add("tFun", Tag("less fun", Pal.Slate, dark = false), 1145, 66)
        add("score", TestPaper("6/10", Pal.Coral, fake = "9/10"), 955, 92, 0.85)
        add("tLie", Tag("fibs about the score", Pal.Coral), 955, 140)
        beat("a test of whether") { show("f", "paper"); show("tTest", delay = 300); set("f", "look", 1, 300); set("f", "mood", -0.2, 400) }
        beat("not an event but a verdict") {
            show("table", "gavel"); set("gavel", "hit", 1, 700, 400, Ease.In); show("verdict", delay = 900); set("f", "wow", 1, 200, 900); set("f", "wow", 0, 300, 1700); set("f", "mood", -0.6, 400, 1700)
        }
        beat("choosing tasks") {
            hide("tTest", "verdict"); camera(600, 150, 1.0, 1600)
            set("f", "walk", 1, 200); move("f", 600, 236, 1600, 0, Ease.InOut); set("f", "walk", 0, 200, 1600)
            show("easy", "hardP", delay = 900); show("pick", delay = 1700); play("pick", dur = 700, delay = 1700); set("f", "look", -1, 300, 1700)
        }
        beat("hiding mistakes") { move("paper", 610, 196, 900, 0, Ease.InOut); set("paper", "s", 0.6, 900); set("f", "look", 0.8, 300) }
        beat("giving up") { set("f", "sit", 1, 800); set("f", "mood", -0.6, 600); show("tUp") }
        beat("feeling threatened") { show("rival", "trophy"); set("f", "look", 1, 400); set("f", "mood", -0.9, 500, 400) }
        beat("praising them for being smart") { camera(1000, 150, 1.0, 1600); show("adult", "kid", delay = 700); show("praise", delay = 1100); set("kid", "mood", 0.9, 500, 1400) }
        beat("chose easier puzzles") {
            hide("praise"); show("easy2", "hard2")
            set("kid", "walk", 1, 200, 400); move("kid", 1060, 236, 1200, 400, Ease.InOut); set("kid", "walk", 0, 200, 1600)
        }
        beat("enjoyed the hard ones less") { set("kid", "look", 1, 300); set("kid", "mood", -0.5, 500); show("tFun") }
        beat("lied about their scores") { show("score"); set("score", "fake", 1, 600, 800); show("tLie", delay = 1200) }
    },
    stage("Inside the growth mindset", Backdrops.Day) {
        add("g", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 8), 100, 236)
        add("hard", Puzzle(5, 4, Pal.Violet, "a hard problem"), 225, 110).with("done", 0.3)
        add("tChance", Tag("a chance to get better", Pal.Mint), 225, 46)
        add("paper", TestPaper("C", Pal.Coral), 300, 200, 0.9)
        add("lens", Magnifier(), 250, 190)
        add("bulb", Bulb(), 340, 150, 0.7)
        add("tInfo", Tag("failure = information", Pal.Gold), 300, 270)
        add("seed", MansSearchProps.Seedling(Pal.Gold), 600, 238)
        add("tAbility", Tag("ability", Pal.Slate, dark = false), 560, 270)
        add("can", WateringCan(), 642, 150)
        add("tEffort", Tag("effort", Pal.Sky), 690, 110)
        add("tAch", Tag("achievement", Pal.Gold), 600, 100)
        add("adult", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 1, seed = 9), 880, 236)
        add("kid", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[2], 2, seed = 6), 950, 236, 0.75)
        add("praise", Bubble("You worked so hard on that!", 110f, -0.2f), 905, 104)
        add("stairs", Staircase(4, Pal.Mint, 28f, 22f), 1040, 238)
        add("tUp", Tag("kept improving", Pal.Mint), 1120, 70)
        add("t1", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[0], 0, seed = 10), 1330, 236, 0.85)
        add("t2", Bean(Pal.Violet, Pal.Skin[1], Pal.Hair[1], 1, seed = 11), 1400, 236, 1.0)
        add("t3", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[3], 3, seed = 12), 1470, 236, 0.92)
        add("tEq", Caption("not equally talented…", 12f, Pal.White, chip = Pal.Ink.a(0.55f)), 1400, 50)
        add("f1", LineChart(220f, 100f, Pal.Slate, { t -> 0.1f + 0.2f * t }, axes = false), 1400, 120)
        add("f2", LineChart(220f, 100f, Pal.Slate, { t -> 0.1f + 0.45f * t }, axes = false), 1400, 120)
        add("q", Caption("?", 34f, Pal.White), 1530, 80)
        add("far", LineChart(220f, 100f, Pal.Gold, { t -> 0.1f + 0.85f * t.pow(1.7f) }, axes = false, endLabel = "years of practice",
            rider = Bean(Pal.Gold)), 1400, 120)
        beat("opportunity to get better") { show("g", "hard"); show("tChance", delay = 300); set("g", "look", 1, 300); set("g", "mood", 0.8, 500); set("hard", "done", 0.6, 1600, 500) }
        beat("Failure is information") {
            hide("tChance"); show("paper"); show("lens", delay = 300); move("lens", 300, 186, 900, 400, Ease.InOut)
            show("bulb", delay = 1300); show("tInfo", delay = 1300); set("g", "wow", 1, 200, 1300); set("g", "wow", 0, 300, 2000)
        }
        beat("ability into achievement") {
            camera(620, 150, 1.0, 1600); show("seed", "tAbility", delay = 700); show("can", "tEffort", delay = 1100)
            set("can", "pour", 1, 600, 1500); set("seed", "grow", 1, 2600, 1700, Ease.InOut); show("tAch", delay = 3900); set("can", "pour", 0, 500, 3900)
        }
        beat("praised for their process") { camera(1000, 150, 1.0, 1600); show("adult", "kid", delay = 700); show("praise", delay = 1000); set("kid", "mood", 0.9, 500, 1300) }
        beat("kept improving") {
            hide("praise"); show("stairs"); play("stairs", dur = 1000)
            (0 until 4).forEach { i -> move("kid", 1054 + 28 * i, 216 - 22 * i, 450, 900 + i * 500, Ease.Out) }
            show("tUp", delay = 2600); set("kid", "arms", 1, 400, 2900)
        }
        beat("equally talented") { camera(1400, 150, 1.0, 1600); show("t1", "t2", "t3", delay = 700, stagger = 150); show("tEq", delay = 1100) }
        beat("unknown and unknowable") {
            hide("t1", "t2", "t3"); show("f1", "f2", "q", delay = 300); play("f1", dur = 1400, delay = 300); play("f2", dur = 1400, delay = 500)
        }
        beat("years of passion and training") { hide("q", "tEq"); show("far"); play("far", dur = 2600, delay = 200) }
    },
    stage("Everywhere it shows up", Backdrops.studio(Color(0xFF2A3350))) {
        add("tSports", Tag("SPORTS", Pal.Sky), 200, 52)
        add("s1", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[0], 0, seed = 13), 120, 236)
        add("star", Star(Pal.Gold, 12f), 120, 130)
        add("tTal", Tag("\"I'm a natural\"", Pal.Slate, dark = false), 120, 270)
        add("s2", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[3], 3, seed = 14), 280, 236).with("arms", 0.6)
        add("ball", Ball(), 315, 180)
        add("tTrain", Tag("setback = drill it", Pal.Mint), 280, 270)
        add("tBiz", Tag("BUSINESS", Pal.Gold), 600, 52)
        add("boss", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[4], 0, seed = 15), 600, 236)
        add("crown", Crown(), 600, 146, 1.0)
        add("y1", Bean(Pal.Slate, Pal.Skin[3], Pal.Hair[0], 0, seed = 16), 520, 236, 0.7)
        add("y2", Bean(Pal.Slate, Pal.Skin[1], Pal.Hair[2], 1, seed = 17), 680, 236, 0.7)
        add("yb1", Bubble("Yes!", 40f, 0.3f, textSize = 10f), 520, 140)
        add("yb2", Bubble("Yes!", 40f, -0.3f, textSize = 10f), 680, 140)
        add("down", LineChart(70f, 44f, Pal.Coral, { t -> 0.9f - 0.85f * t }, axes = false), 720, 92)
        add("ask", Bubble("What am I missing?", 100f, 0f), 600, 104)
        add("up", LineChart(70f, 44f, Pal.Leaf, { t -> 0.1f + 0.85f * t }, axes = false), 720, 92)
        add("tLove", Tag("RELATIONSHIPS", Pal.Rose), 1000, 52)
        add("r1", Bean(Pal.Rose, Pal.Skin[0], Pal.Hair[1], 1, seed = 18), 945, 236)
        add("r2", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[0], 0, seed = 19), 1055, 236)
        add("heart", Heart(Pal.Rose), 1000, 128)
        add("crack", Mark(false, 12f), 1000, 128)
        add("fix", Puzzle(3, 2, Pal.Gold, "work on it"), 1000, 196, 0.8)
        add("sp", Sparkles(Pal.Rose, 40f, 10), 1000, 128)
        add("tKids", Tag("PARENTING", Pal.Violet), 1400, 52)
        add("parent", Bean(Pal.Violet, Pal.Skin[1], Pal.Hair[1], 2, seed = 20), 1320, 236)
        add("child", Bean(Pal.Leaf, Pal.Skin[1], Pal.Hair[0], 0, seed = 21), 1390, 236, 0.72).with("mood", -0.3)
        add("great", Bubble("Great strategy!", 84f, -0.2f), 1330, 112)
        add("cant", Tile("I can't do it", Pal.Navy, 112f, 34f, textSize = 12f), 1470, 150)
        add("yet", Stamp("YET", Pal.Mint), 1562, 150)
        beat("In sports") { show("tSports", "s1", "s2", stagger = 150) }
        beat("natural talent and faded") { show("star", "tTal"); dim("s1", "star", to = 0.35, delay = 1000); set("s1", "mood", -0.4, 500, 900) }
        beat("training problems") { show("ball", "tTrain"); move("ball", 315, 120, 500, 200, Ease.Out); move("ball", 315, 180, 500, 700, Ease.In); set("s2", "arms", 1, 400, 200); set("s2", "mood", 0.9, 400) }
        beat("In business") { camera(600, 150, 1.0, 1600); show("tBiz", "boss", delay = 800) }
        beat("smartest in the room") { show("crown"); set("boss", "mood", 0.6, 400) }
        beat("yes-men") { show("y1", "y2", stagger = 150); show("yb1", "yb2", delay = 400, stagger = 150) }
        beat("into the ground") { show("down"); play("down", dur = 1200); set("boss", "wow", 1, 300, 1000) }
        beat("asked questions") {
            hide("crown", "yb1", "yb2", "down"); set("boss", "wow", 0, 300); show("ask", delay = 300)
            show("up", delay = 900); play("up", dur = 1200, delay = 900); set("y1", "mood", 0.8, 500, 900); set("y2", "mood", 0.8, 500, 900)
        }
        beat("In relationships") { camera(1000, 150, 1.0, 1600); show("tLove", "r1", "r2", "heart", delay = 800, stagger = 120) }
        beat("should be effortless") { show("crack"); set("r1", "mood", -0.5, 500); set("r2", "mood", -0.5, 500); set("heart", "beat", 0, 300) }
        beat("work on together") {
            hide("crack"); show("fix"); set("r1", "hold", 1, 500); set("r2", "hold", 1, 500)
            set("r1", "mood", 0.8, 500, 800); set("r2", "mood", 0.8, 500, 800); show("sp", delay = 800); set("heart", "beat", 1, 300, 800)
        }
        beat("In parenting") { camera(1420, 150, 1.0, 1600); show("tKids", "parent", "child", delay = 800, stagger = 120) }
        beat("praise process") { show("great"); set("child", "mood", 0.6, 500, 500) }
        beat("the word yet") { hide("great"); show("cant"); show("yet", delay = 300); set("yet", "press", 1, 1200, 500); set("child", "mood", 0.9, 500, 1300); set("child", "arms", 0.8, 500, 1300) }
    },
    stage("Not just effort", Backdrops.Paper) {
        add("tNot", Tag("growth ≠ just trying harder", Pal.Gold), 200, 52)
        add("mill", Treadmill(), 120, 240)
        add("runner", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[0], 0, seed = 22), 110, 234).with("walk", 1).with("mood", -0.2)
        add("sweat", Drips(Color(0xFF9ED7FA), 20f), 110, 150)
        add("flat", LineChart(120f, 70f, Pal.Coral, { t -> 0.15f + 0.04f * t }, yLabel = "progress", endLabel = "stuck"), 300, 140).with("ax", 0)
        add("lock", Padlock(), 600, 150, 1.6)
        add("k1", Key(Pal.Coral), 520, 104)
        add("k2", Key(Pal.Sky), 520, 134)
        add("k3", Key(Pal.Gold), 520, 164)
        add("x1", Mark(false, 10f), 640, 110)
        add("x2", Mark(false, 10f), 660, 110)
        add("ok", Mark(true, 12f), 640, 110)
        add("tNew", Tag("try a new strategy", Pal.Mint), 600, 60)
        add("learner", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 23), 450, 236)
        add("coach", Bean(Pal.Violet, Pal.Skin[3], Pal.Hair[4], 0, seed = 24), 710, 236)
        add("tip", Bubble("Try it this way", 84f, -0.2f), 718, 120)
        add("tBetter", Tag("learn from people who are better", Pal.Violet), 600, 282)
        add("idle", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[1], 1, seed = 25), 1000, 236).with("sit", 1).with("mood", 0.6)
        add("badge", IdBadge("GROWTH MINDSET", Pal.Mint), 1000, 108)
        add("fake", Mark(false, 12f), 1046, 92)
        add("tFake", Tag("says it, doesn't do it", Pal.Coral), 1000, 280)
        add("gauge", Gauge(50f, listOf("fixed", "mix", "growth")), 1000, 130)
        add("tMix", Caption("everyone is a mix of both", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 1000, 280)
        beat("not just about praising effort") { show("tNot") }
        beat("Effort that goes nowhere") {
            show("mill", "runner", "sweat"); show("flat", delay = 500); set("flat", "ax", 1, 600, 500); play("flat", dur = 2000, delay = 900, ease = Ease.Linear)
        }
        beat("new strategies") {
            hide("tNot"); camera(600, 150, 1.0, 1500); show("lock", "learner", "k1", "k2", "k3", "tNew", delay = 600, stagger = 100)
            move("k1", 570, 166, 600, 1400); show("x1", delay = 2000); move("k1", 520, 104, 500, 2200)
            move("k2", 570, 166, 600, 2700); show("x2", delay = 3300); move("k2", 520, 134, 500, 3500)
            move("k3", 570, 166, 600, 4000); set("lock", "open", 1, 600, 4600); hide("x1", "x2", delay = 4600); show("ok", delay = 4700)
            set("learner", "mood", 0.9, 500, 4700)
        }
        beat("seek feedback") { show("coach"); show("tip", delay = 300); set("learner", "look", 1, 300) }
        beat("people who are better") { show("tBetter"); set("coach", "point", 1, 500) }
        beat("false growth mindset") { camera(1000, 150, 1.0, 1500); show("idle", "badge", delay = 700); show("fake", "tFake", delay = 1400) }
        beat("mixture of both") {
            hide("badge", "fake", "tFake"); show("gauge"); set("idle", "sit", 0, 500)
            set("gauge", "v", -0.6, 700, 300); set("gauge", "v", 0.6, 900, 1100); set("gauge", "v", -0.2, 800, 2100); set("gauge", "v", 0.25, 800, 3000)
            show("tMix", delay = 800)
        }
    },
    stage("How to change", Backdrops.studio(Color(0xFF1E2A3A))) {
        add("you", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 26), 200, 236).with("mood", 0.1)
        add("cloud", DoubtCloud(), 90, 130)
        add("whisper", Bubble("You'll fail. Everyone will see.", 110f, -0.5f, italic = true), 120, 72)
        add("tNotice", Tag("notice the voice", Pal.Slate, dark = false), 90, 186)
        add("left", Tile("believe it", Color(0xFF3B3F55), 96f, 32f, textSize = 12f), 92, 210)
        add("right", Tile("answer back", Pal.Mint.darken(0.35f), 104f, 32f, textSize = 12f), 312, 210)
        add("reply", Bubble("Maybe. But I can learn this.", 120f, -0.4f), 272, 96)
        add("stairs", Staircase(4, Pal.Mint, 44f, 24f, listOf("try", "ask", "study", "stretch")), 470, 238)
        add("climber", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 26), 440, 236)
        add("cal", Calendar(7, 2, "PRACTICE", Pal.Mint), 742, 96, 0.72)
        add("tPractice", Tag("a practice, not a switch", Pal.Mint), 742, 146)
        add("nr", Neurons(58f), 1000, 132)
        add("brain", Brain(Pal.Rose), 1000, 132, 0.7)
        add("tUse", Tag("the belief grows with use", Pal.Gold), 1000, 220)
        add("puzzle", Puzzle(5, 4, Pal.Violet, "a hard problem"), 1110, 160).with("done", 0.4)
        add("curious", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 26), 920, 236)
        add("spark", Sparkles(Pal.Gold, 60f, 12), 1110, 150)
        add("tFun", Caption("hard becomes interesting", 12f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1040, 280)
        beat("notice the fixed-mindset voice") {
            show("you", "cloud"); show("whisper", delay = 400); show("tNotice", delay = 900)
            set("you", "look", -1, 300); set("you", "wow", 1, 200, 400); set("you", "wow", 0, 300, 1300)
        }
        beat("you have a choice") { hide("tNotice"); show("left", "right", stagger = 200); set("you", "look", 0, 300) }
        beat("growth-mindset response") {
            hide("whisper", "left"); scale("right", 1.15, 600); show("reply", delay = 300)
            set("cloud", "fade", 1, 1200, 600); set("you", "look", 1, 300); set("you", "mood", 0.7, 500)
        }
        beat("growth-mindset action") {
            hide("reply", "right"); camera(600, 150, 1.0, 1500); show("stairs", "climber", delay = 600); play("stairs", dur = 1000, delay = 600)
            (0 until 4).forEach { i -> move("climber", 492 + 44 * i, 214 - 24 * i, 450, 1600 + i * 550, Ease.Out) }
            set("climber", "arms", 1, 400, 3800)
        }
        beat("one-time conversion") { show("cal", "tPractice"); set("cal", "done", 14, 2000, 300, Ease.Linear) }
        beat("grows with use") {
            camera(1000, 150, 1.0, 1500); show("brain", "nr", delay = 600); set("nr", "p", 1, 2400, 800, Ease.Linear)
            scale("brain", 1.0, 1800, 800, Ease.InOut); show("tUse", delay = 1400)
        }
        beat("interesting rather than threatening") {
            hide("tUse"); move("brain", 1000, 90, 800); scale("brain", 0.6, 800); move("nr", 1000, 90, 800); set("nr", "s", 0.6, 800)
            show("curious", "puzzle", delay = 300); show("spark", delay = 900); set("curious", "look", 1, 300, 600); set("curious", "mood", 0.9, 500, 900)
            set("puzzle", "glow", 1, 800, 900); set("puzzle", "done", 1, 2000, 1200); show("tFun", delay = 1600)
        }
    },
)
