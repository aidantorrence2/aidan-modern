package com.aidantorrence.syncstudy

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.PowerOfHabitProps.Battery
import com.aidantorrence.syncstudy.PowerOfHabitProps.Bus
import com.aidantorrence.syncstudy.PowerOfHabitProps.Car
import com.aidantorrence.syncstudy.PowerOfHabitProps.CoffeeCounter
import com.aidantorrence.syncstudy.PowerOfHabitProps.Coupon
import com.aidantorrence.syncstudy.PowerOfHabitProps.Domino
import com.aidantorrence.syncstudy.PowerOfHabitProps.Escalator
import com.aidantorrence.syncstudy.PowerOfHabitProps.FlipCard
import com.aidantorrence.syncstudy.PowerOfHabitProps.Fume
import com.aidantorrence.syncstudy.PowerOfHabitProps.Glass
import com.aidantorrence.syncstudy.PowerOfHabitProps.HardHat
import com.aidantorrence.syncstudy.PowerOfHabitProps.Network
import com.aidantorrence.syncstudy.PowerOfHabitProps.OperatingTable
import com.aidantorrence.syncstudy.PowerOfHabitProps.Padlock
import com.aidantorrence.syncstudy.PowerOfHabitProps.Radio
import com.aidantorrence.syncstudy.PowerOfHabitProps.Road
import com.aidantorrence.syncstudy.PowerOfHabitProps.RuleBook
import com.aidantorrence.syncstudy.PowerOfHabitProps.ScriptCard
import com.aidantorrence.syncstudy.PowerOfHabitProps.ShoppingCart
import com.aidantorrence.syncstudy.PowerOfHabitProps.Siren
import com.aidantorrence.syncstudy.PowerOfHabitProps.SteeringWheel
import com.aidantorrence.syncstudy.PowerOfHabitProps.StormCloud
import com.aidantorrence.syncstudy.PowerOfHabitProps.Stroller
import com.aidantorrence.syncstudy.PowerOfHabitProps.TrafficLight
import com.aidantorrence.syncstudy.PowerOfHabitProps.Trail
import com.aidantorrence.syncstudy.PowerOfHabitProps.Turf

/** Animated explainer films for The Power of Habit, one per paragraph. */
val POWER_OF_HABIT_STAGE = listOf(
    stage("The habit loop", Backdrops.Night) {
        add("road", Road(520f), 200, 236)
        add("light", TrafficLight(), 66, 228)
        add("car", Car(Pal.Coral), 120, 232)
        add("home", SevenHabitsProps.House(), 340, 226).with("build", 1)
        add("tTitle", Tag("the habit loop", Pal.Gold), 200, 46)
        add("tCue", Tag("CUE", Pal.Sky), 66, 98)
        add("tRout", Tag("ROUTINE", Pal.White), 200, 150)
        add("tRew", Tag("REWARD", Pal.Gold), 340, 104)
        add("star", Sparkles(Pal.Gold, 50f, 12), 340, 170)
        add("mini", TrafficLight(), 520, 210, 0.75).with("green", 1)
        add("ar1", Arrow(80f, -30f, -20f, Pal.Gold, 3f), 540, 150)
        add("brain", Brain(), 650, 120)
        add("ar2", Arrow(70f, 0f, -20f, Pal.Gold, 3f), 690, 120)
        add("goal", Star(Pal.Gold, 18f), 780, 120)
        add("tAnt", Tag("the brain expects the reward at the cue", Pal.Gold), 650, 210)
        add("tAuto", Tag("autopilot: basal ganglia take over", Pal.Violet), 650, 46)
        add("road2", Road(520f), 1010, 236)
        add("car2", Car(Pal.Sky, Pal.Skin[2]), 820, 232).with("sleepy", 1)
        add("huh", Bubble("wait… how did I get home?", 130f, 0f), 1010, 110)
        add("turf", Turf(330f), 1400, 220)
        add("old", Trail(260f, 30f), 1400, 228).with("wear", 0.4)
        add("new", Trail(260f, -36f, Pal.Mint), 1400, 214).with("p", 0)
        add("tOld", Tag("old loop: never erased", Pal.Slate, dark = false), 1330, 110)
        add("tNew", Tag("new loop: same cue, same reward", Pal.Mint), 1460, 150)
        beat("habit loop") { show("road", "light", "car", "home", stagger = 150); show("tTitle", delay = 300) }
        beat("A cue triggers") { set("light", "green", 1, 500); show("tCue", delay = 300) }
        beat("a routine") { show("tRout"); set("car", "drive", 1, 300); move("car", 250, 232, 2200, 200); set("road", "move", 1, 400) }
        beat("produces a reward") { set("car", "drive", 0, 400); set("road", "move", 0, 400); show("tRew", "star", stagger = 200) }
        beat("anticipate the reward") {
            camera(660, 150, 1, 1600); show("mini", delay = 500); show("ar1", delay = 800); play("ar1", dur = 700, delay = 800)
            show("brain", delay = 1100); set("brain", "glow", 1, 700, 1300); show("ar2", delay = 1600); play("ar2", dur = 600, delay = 1600); show("goal", "tAnt", delay = 1900)
        }
        beat("basal ganglia") { show("tAuto") }
        beat("drive home") {
            camera(1010, 150, 1, 1600); show("road2", "car2", delay = 400)
            set("car2", "drive", 1, 300, 600); set("road2", "move", 1, 300, 600); move("car2", 1180, 232, 3000, 600, Ease.Linear); show("huh", delay = 1800)
        }
        beat("never truly disappear") { camera(1400, 150, 1, 1600); hide("car2", "road2", "huh", delay = 600); show("turf", "old", "tOld", delay = 500, stagger = 200) }
        beat("same cue") { show("new", "tNew"); play("new", dur = 1600) }
    },
    stage("The golden rule", Backdrops.studio(Color(0xFF2E2350))) {
        add("cCue", FlipCard("CUE: stress", "CUE: stress", Pal.Sky, Pal.Sky, 84f), 90, 120)
        add("cRout", FlipCard("drink", "go to a meeting", Pal.Coral, Pal.Mint, 84f), 200, 120)
        add("cRew", FlipCard("REWARD: relief", "REWARD: relief", Pal.Gold, Pal.Gold, 84f), 310, 120)
        add("a1", Arrow(22f, 0f, 0f, Pal.White, 2.5f), 134, 120)
        add("a2", Arrow(22f, 0f, 0f, Pal.White, 2.5f), 244, 120)
        add("lk1", Padlock(), 90, 80)
        add("lk2", Padlock(), 310, 80)
        add("rule", Caption("the golden rule of habit change", 13f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 200, 46)
        add("me", Bean(Pal.Violet, Pal.Skin[1], Pal.Hair[1], 1, seed = 1), 200, 236).with("mood", 0)
        add("sad", Bean(Pal.Slate, Pal.Skin[2], Pal.Hair[0], 0, seed = 2), 520, 236).with("mood", -0.7)
        add("cloud", StormCloud(), 520, 104)
        add("tbl", Table(60f), 590, 214)
        add("glass", Glass(), 590, 210)
        add("no", Mark(false, 10f), 590, 172)
        add("g1", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[2], 2, seed = 3), 680, 236, 0.9).with("look", -1).with("mood", 0.6)
        add("g2", Bean(Pal.Rose, Pal.Skin[3], Pal.Hair[3], 3, seed = 4), 730, 236, 0.9).with("look", -1).with("mood", 0.6)
        add("g3", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[0], 0, seed = 5), 780, 236, 0.9).with("look", -1).with("mood", 0.6)
        add("tAA", Tag("stress → meeting → relief", Pal.Mint), 650, 46)
        add("h1", Heart(Pal.Rose), 700, 110, 0.4)
        add("tRel", Tag("relief + companionship", Pal.Rose), 700, 70)
        add("turf", Turf(330f), 1030, 238)
        add("coach", Bean(Pal.Navy, Pal.Skin[2], Pal.Hair[4], 4, seed = 6), 890, 236).with("look", 1)
        add("clip", SevenHabitsProps.Clipboard("PLAY"), 926, 190, 0.6)
        add("p1", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[0], 0, seed = 7), 990, 236, 0.85).with("look", 1)
        add("p2", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[3], 3, seed = 8), 1050, 236, 0.85).with("look", 1)
        add("p3", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[2], 1, seed = 9), 1110, 236, 0.85).with("look", 1)
        add("cue", Tag("CUE!", Pal.Gold), 1050, 104)
        add("belief", Caption("+ belief", 22f, Pal.Gold), 1050, 60)
        add("spark", Sparkles(Pal.Gold, 90f, 16), 1050, 170)
        add("tGroup", Tag("easiest to believe in a group", Pal.Mint), 1050, 272)
        beat("golden rule") { show("rule"); show("cCue", "a1", "cRout", "a2", "cRew", delay = 300, stagger = 150); show("me", delay = 800) }
        beat("keep the cue and the reward") { show("lk1", "lk2", stagger = 250) }
        beat("swap in a new routine") { set("cRout", "flip", 1, 900, 0, Ease.InOut); set("me", "mood", 0.8, 500, 700); set("me", "jump", 0.6, 300, 700); set("me", "jump", 0, 300, 1700) }
        beat("Alcoholics Anonymous") { camera(650, 150, 1, 1600); show("sad", "cloud", "tbl", "glass", delay = 500, stagger = 150) }
        beat("meetings and conversation") {
            show("no"); dim("glass", to = 0.3, delay = 300); show("g1", "g2", "g3", delay = 400, stagger = 150); show("tAA", delay = 500)
            set("sad", "walk", 1, 300, 900); move("sad", 628, 236, 1300, 900); set("sad", "walk", 0, 300, 2200); move("cloud", 628, 104, 1300, 900)
        }
        beat("relief and companionship") { hide("cloud"); show("h1", "tRel", stagger = 200); set("sad", "mood", 0.8, 600); set("sad", "look", 1, 300) }
        beat("football coach") { camera(1030, 150, 1, 1600); show("turf", "coach", "clip", "p1", "p2", "p3", delay = 400, stagger = 120) }
        beat("key cues") {
            show("cue"); for ((i, id) in listOf("p1", "p2", "p3").withIndex()) { move(id, 1020 + i * 60, 236, 450, 300, Ease.Out); set(id, "walk", 1, 100, 300); set(id, "walk", 0, 200, 750) }
            hide("cue", delay = 1400)
        }
        beat("belief") { show("belief", "spark"); for (id in listOf("p1", "p2", "p3")) set(id, "mood", 0.9, 400, 300) }
        beat("inside a group") {
            show("tGroup"); move("p1", 1035, 236, 900); move("p3", 1110, 236, 900); move("coach", 960, 236, 900)
            for (id in listOf("p1", "p2", "p3", "coach")) set(id, "arms", 1, 500, 900)
        }
    },
    stage("Keystone habits", Backdrops.studio(Color(0xFF2B3442))) {
        for (i in 0 until 6) add("d$i", Domino(if (i == 0) "keystone" else "", if (i == 0) Pal.Gold else Pal.Paper), 60 + i * 52, 236)
        add("tKey", Caption("one small habit tips the rest", 13f, Pal.White, chip = Pal.Ink.a(0.6f)), 200, 60)
        add("worker", Bean(Pal.Coral.darken(0.1f), Pal.Skin[2], Pal.Hair[0], 0, seed = 10), 520, 236)
        add("hat", HardHat(), 520, 152)
        add("tSafe", Tag("only priority: safety", Pal.Gold), 520, 96)
        add("chart", LineChart(120f, 70f, Pal.Mint, { t -> if (t < 0.4f) 0.6f - t * 1.1f else 0.16f + (t - 0.4f) * 1.35f }, yLabel = "stock", axes = true, fill = true), 700, 90).with("ax", 0)
        add("i1", Bean(Pal.Navy, Pal.Skin[0], Pal.Hair[4], 4, seed = 11), 760, 236).with("look", -1)
        add("i2", Bean(Pal.Navy, Pal.Skin[1], Pal.Hair[0], 0, seed = 12), 812, 236).with("look", -1)
        listOf("communication", "processes", "accountability").forEachIndexed { i, t ->
            add("k$i", Domino("", Pal.Sky), 570 + i * 44, 236, 0.75)
            add("kt$i", Tag(t, Pal.Sky, 8.5f), 570 + i * 44, if (i % 2 == 0) 256 else 274)
        }
        add("coins", Sparkles(Pal.Gold, 50f, 12), 700, 90)
        add("jog", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[1], 2, seed = 13), 960, 236).with("walk", 1)
        listOf("eat better", "spend less", "sleep more").forEachIndexed { i, t ->
            add("e$i", Domino("", Pal.Mint), 1040 + i * 52, 236)
            add("et$i", Tag(t, Pal.Mint, 9f), 1040 + i * 52, 258)
        }
        add("wins", Caption("small wins → new structures → new culture", 12f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1060, 60)
        beat("keystone habits") { for (i in 0 until 6) show("d$i", delay = i * 90); show("tKey", delay = 500) }
        beat("chain reactions") { for (i in 0 until 6) set("d$i", "fall", 1, 360, 200 + i * 230, Ease.In) }
        beat("worker safety") { camera(660, 150, 1, 1600); show("worker", "hat", "tSafe", delay = 500, stagger = 150) }
        beat("investors panicked") { show("chart", "i1", "i2", stagger = 150); set("chart", "ax", 1, 600); play("chart", to = 0.42, dur = 1200, delay = 400); set("i1", "wow", 1, 300, 900); set("i2", "wow", 1, 300, 900) }
        beat("fixing communication") {
            for (i in 0 until 3) { show("k$i", "kt$i", delay = i * 200); set("k$i", "fall", 1, 380, 900 + i * 260, Ease.In) }
            set("worker", "point", 1, 500)
        }
        beat("profits followed") { play("chart", to = 1, dur = 1600); show("coins", delay = 900); set("i1", "wow", 0, 300, 1200); set("i2", "wow", 0, 300, 1200); set("i1", "mood", 0.9, 400, 1200); set("i2", "mood", 0.9, 400, 1200) }
        beat("Exercise is a keystone") { camera(1060, 150, 1, 1600); show("jog", delay = 500) }
        beat("eating, spending, and sleeping") { for (i in 0 until 3) { show("e$i", "et$i", delay = i * 150); set("e$i", "fall", 1, 380, 700 + i * 260, Ease.In) } }
        beat("small wins") { show("wins"); set("jog", "walk", 0, 300); set("jog", "arms", 1, 500) }
    },
    stage("Willpower", Backdrops.studio(Color(0xFF1F4545))) {
        add("bat", Battery(), 110, 146)
        add("tWill", Tag("willpower", Pal.Mint), 110, 62)
        add("me", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 14), 250, 236)
        add("tStrong", Tag("it can be trained", Pal.Leaf), 250, 112)
        add("tDrain", Tag("…and it runs out", Pal.Coral), 250, 112)
        add("barista", Bean(Pal.Leaf.darken(0.2f), Pal.Skin[3], Pal.Hair[0], 0, seed = 15), 690, 212).with("look", -1)
        add("counter", CoffeeCounter(150f), 660, 238)
        add("cust", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[2], 1, seed = 16), 520, 236).with("look", 1)
        add("fume", Fume(), 520, 140)
        add("yell", Bubble("This is WRONG!", 84f, 0.3f), 520, 92)
        add("script", ScriptCard("PLANNED REPLY", listOf("Listen", "Acknowledge", "Take action", "Thank them", "Explain")), 690, 76)
        add("calm", Tag("no willpower needed", Pal.Mint), 600, 272)
        add("b1", Battery("told what to do"), 990, 140)
        add("b2", Battery("given some say"), 1130, 140)
        add("tAut", Tag("a sense of control makes it last", Pal.Mint), 1060, 46)
        beat("Willpower") { show("bat", "tWill", "me", stagger = 150) }
        beat("can be strengthened") { scale("bat", 1.2, 900); set("me", "arms", 1, 500); show("tStrong", delay = 300) }
        beat("gets depleted") { hide("tStrong"); show("tDrain", delay = 200); set("bat", "level", 0.12, 2600, 300, Ease.InOut); set("me", "arms", 0, 500); set("me", "mood", -0.5, 600, 1200) }
        beat("Starbucks") { camera(640, 150, 1, 1600); show("barista", "counter", delay = 500, stagger = 150) }
        beat("plan in advance") { show("script"); play("script", dur = 2200); set("barista", "mood", 0.6, 400) }
        beat("rude customer") { show("cust", "fume", "yell", stagger = 200); set("cust", "mood", -0.9, 400); set("barista", "look", -1, 300) }
        beat("already scripted") { hide("yell"); set("fume", "on", 0, 800); set("barista", "mood", 0.9, 500); set("cust", "mood", 0.4, 800, 600); show("calm", delay = 500) }
        beat("sense of autonomy") {
            camera(1060, 150, 1, 1600); show("b1", "b2", delay = 500, stagger = 150)
            set("b1", "level", 0.12, 2600, 900, Ease.InOut); set("b2", "level", 0.72, 2600, 900, Ease.InOut)
        }
        beat("lasts longer") { show("tAut") }
    },
    stage("Habits nobody designed", Backdrops.studio(Color(0xFF3A2430))) {
        add("title", Tag("habits nobody chose", Pal.Coral), 200, 46)
        add("or", OperatingTable(), 200, 238)
        add("nurse", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[1], 1, seed = 17), 92, 236, 0.9).with("look", 1)
        add("surgeon", Bean(Color(0xFF4F9E86), Pal.Skin[2], Pal.Hair[4], 4, seed = 18), 300, 236).with("look", -1)
        add("doubt", Bubble("wrong side…?", 74f, 0f, thought = true), 92, 90)
        add("zip", SevenHabitsProps.Zip(), 92, 180, 0.7)
        add("err", Tag("preventable error", Pal.Coral), 200, 80)
        add("x", Mark(false, 12f), 262, 80)
        add("esc", Escalator(), 560, 238)
        add("fire", SevenHabitsProps.Fire(22f), 640, 238).with("big", 0)
        add("tLU", Tag("London Underground", Pal.Slate, dark = false), 650, 46)
        add("s1", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 19), 740, 236, 0.85).with("look", 1)
        add("s2", Bean(Pal.Sky, Pal.Skin[3], Pal.Hair[3], 3, seed = 20), 790, 236, 0.85).with("look", 1)
        add("s3", Bean(Pal.Violet, Pal.Skin[2], Pal.Hair[2], 2, seed = 21), 840, 236, 0.85).with("look", -1)
        add("j1", Tag("tickets", Pal.Gold, 8.5f), 740, 136)
        add("j2", Tag("cleaning", Pal.Sky, 8.5f), 790, 118)
        add("j3", Tag("trains", Pal.Violet, 8.5f), 840, 136)
        add("nm", Bubble("not my job", 66f, 0f), 790, 80)
        add("siren", Siren(), 1100, 92)
        add("book", RuleBook(), 1100, 190)
        add("lead", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[1], 2, seed = 22), 990, 236).with("look", 1)
        add("tCrisis", Tag("in a crisis, habits become visible", Pal.Gold), 1060, 46)
        add("tRe", Tag("…and can be rewritten", Pal.Mint), 1100, 262)
        beat("institutional habits") { show("title", "or", stagger = 200) }
        beat("deference to surgeons") { show("nurse", "surgeon", stagger = 150); scale("surgeon", 1.2, 700, 300); scale("nurse", 0.8, 700, 300); show("doubt", delay = 900) }
        beat("preventable errors") { show("zip"); show("err", "x", delay = 400, stagger = 200); set("nurse", "mood", -0.5, 400) }
        beat("London Underground") { camera(690, 150, 1, 1600); show("esc", "tLU", delay = 500, stagger = 150) }
        beat("rigid division of responsibilities") { show("s1", "j1", "s2", "j2", "s3", "j3", stagger = 120) }
        beat("fire nobody owned") {
            show("fire"); set("fire", "big", 1.8, 3000, 0, Ease.InOut); set("esc", "smoke", 1, 2000)
            show("nm", delay = 900); set("s2", "wave", 0.6, 400, 900)
        }
        beat("Crises") { camera(1060, 150, 1, 1600); hide("fire", "nm", delay = 500); show("siren", "lead", "tCrisis", delay = 500, stagger = 150); set("siren", "on", 1, 400, 700) }
        beat("can be rewritten") { show("book"); play("book", dur = 2200); show("tRe", delay = 1000) }
        beat("sense of emergency") { set("lead", "point", 1, 500); set("siren", "on", 1, 100) }
    },
    stage("Selling a habit", Backdrops.studio(Color(0xFF23365C))) {
        add("shopper", Bean(Pal.Rose, Pal.Skin[1], Pal.Hair[1], 1, seed = 23), 60, 236).with("hold", 0.8).with("look", 1)
        add("cart", ShoppingCart(listOf(Color.White, Pal.Leaf, Pal.Sky, Pal.Peach)), 130, 238)
        add("tWatch", Caption("a retailer studies what you buy", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 200, 46)
        add("link", Arrow(100f, -60f, -30f, Pal.Gold, 2.5f, dashed = true), 160, 160)
        add("model", Tile("purchase pattern", Pal.Navy, 104f, 34f, textSize = 10.5f), 300, 96)
        add("baby", Stroller(), 300, 236)
        add("tBaby", Tag("“expecting a baby”", Pal.Gold), 300, 150)
        add("cp1", Coupon("lawnmower"), 556, 116, r = -10)
        add("cp2", Coupon("crib", Pal.Paper, hot = true), 630, 104)
        add("cp3", Coupon("wine glasses"), 704, 116, r = 10)
        add("reader", Bean(Pal.Rose, Pal.Skin[1], Pal.Hair[1], 1, seed = 23), 630, 236)
        add("coinc", Bubble("What a coincidence!", 100f, 0f), 720, 186)
        add("gift", Gift(Pal.Violet, Pal.Gold), 985, 210)
        add("tWrap", Tag("new habit, familiar wrapping", Pal.Violet), 1000, 150)
        add("radio", Radio(), 1060, 156)
        add("pl1", Tag("familiar hit", Pal.Slate, dark = false), 990, 70)
        add("pl2", Tag("NEW SONG", Pal.Gold), 1070, 70)
        add("pl3", Tag("familiar hit", Pal.Slate, dark = false), 1150, 70)
        add("fan", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 24), 1170, 236).with("look", -1)
        add("hit", Caption("…played enough, it becomes a hit", 11f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1070, 272)
        beat("Target") { show("tWatch", "shopper", "cart", stagger = 150) }
        beat("analyzing purchases") { set("cart", "n", 4, 2000, 0, Ease.Linear); show("link", delay = 1200); play("link", dur = 900, delay = 1200); show("model", delay = 1800) }
        beat("predict a pregnancy") { show("baby", "tBaby", stagger = 250); set("shopper", "wow", 1, 300) }
        beat("baby coupons") { camera(640, 150, 1, 1600); show("reader", delay = 400); show("cp1", "cp2", "cp3", delay = 700, stagger = 250) }
        beat("felt like coincidence") { show("coinc"); set("reader", "mood", 0.95, 500) }
        beat("dressed in old ones") { camera(1060, 150, 1, 1600); show("gift", "tWrap", delay = 500, stagger = 200); set("gift", "open", 0.6, 800, 1200) }
        beat("pop song") { hide("gift", "tWrap"); show("radio", "fan", delay = 250); show("pl1", "pl2", "pl3", delay = 300, stagger = 350); set("fan", "mood", 0.9, 500, 1200); set("fan", "wave", 0.7, 400, 1200); show("hit", delay = 1500) }
    },
    stage("Movements, and you", Backdrops.Day) {
        add("bus", Bus(), 230, 236).with("full", 0)
        for (i in 0 until 4) add("w$i", Bean(listOf(Pal.Gold, Pal.Rose, Pal.Sky, Pal.Violet)[i], Pal.Skin[(i + 2) % 4], Pal.Hair[i], i % 4, seed = 30 + i), 20 + i * 40, 244, 0.85).with("walk", 1).with("look", 1).with("mood", 0.7)
        add("tMove", Tag("how do movements spread?", Pal.Navy, dark = false), 200, 46)
        add("tBoy", Tag("Montgomery bus boycott", Pal.Coral), 230, 120)
        val strongN = listOf(Offset(0f, -34f), Offset(30f, -10f), Offset(18f, 26f), Offset(-18f, 26f), Offset(-30f, -10f))
        val strongL = listOf(0 to 1, 0 to 2, 0 to 3, 0 to 4, 1 to 2, 1 to 3, 1 to 4, 2 to 3, 2 to 4, 3 to 4)
        add("strong", Network(strongN, strongL, Pal.Gold, 8f, 3f), 560, 140)
        val weakN = listOf(Offset(-70f, -40f), Offset(-20f, -70f), Offset(40f, -50f), Offset(80f, -10f), Offset(60f, 50f), Offset(0f, 70f), Offset(-60f, 40f), Offset(-90f, 0f), Offset(110f, 40f))
        val weakL = listOf(0 to 1, 1 to 2, 2 to 3, 3 to 4, 4 to 5, 5 to 6, 6 to 7, 7 to 0, 3 to 8, 2 to 5)
        add("weak", Network(weakN, weakL, Pal.Sky, 6f, 1.6f), 720, 140)
        add("bridge", PowerOfHabitProps.Tie(70f, 0f, Pal.Sky, 1.6f), 590, 140)
        add("tStrong", Tag("strong ties: friends start it", Pal.Gold), 560, 236)
        add("tWeak", Tag("weak ties: community spreads it", Pal.Sky), 740, 262)
        add("lone", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[0], 0, seed = 35), 846, 236, 0.85).with("look", -1)
        add("awk", Bubble("everyone's walking…", 90f, 0f), 818, 104)
        add("tId", Tag("new habits: identity, self-direction", Pal.Mint), 700, 282)
        add("you", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[1], 2, seed = 36), 1000, 236)
        add("ask", Bubble("Am I responsible for my habits?", 110f, 0f), 1000, 104)
        add("wheel", SteeringWheel(), 1000, 194)
        add("tHands", Tag("once you know it, it's yours to change", Pal.Gold), 1060, 46)
        val steps = listOf("1 · routine", "2 · rewards", "3 · cue", "4 · plan")
        steps.forEachIndexed { i, t -> add("st$i", Tile(t, if (i == 3) Pal.Mint else Pal.Navy, 76f, 28f, textSize = 10f, ink = if (i == 3) Pal.Ink else Pal.White), 950 + i * 82, 270) }
        beat("movements happen") { show("tMove", "bus", stagger = 200) }
        beat("Montgomery bus boycott") {
            show("tBoy"); for (i in 0 until 4) { show("w$i", delay = i * 150); move("w$i", 200 + i * 50, 244, 3000, i * 150, Ease.Linear) }
            set("bus", "x", 180, 3000, 0, Ease.Linear)
        }
        beat("strong ties of friendship") { camera(680, 150, 1, 1600); show("strong", delay = 500); play("strong", dur = 1600, delay = 600); show("tStrong", delay = 1200) }
        beat("weak ties of community") { show("bridge", "weak"); play("bridge", dur = 600); play("weak", dur = 2200, delay = 300); show("tWeak", delay = 1400) }
        beat("costly to stand aside") { show("lone", "awk", stagger = 300); set("lone", "mood", -0.5, 500) }
        beat("new habits of identity") { show("tId"); hide("awk"); set("lone", "mood", 0.6, 500); set("lone", "walk", 1, 300); move("lone", 808, 236, 1200, 0) }
        beat("are we responsible") { camera(1060, 150, 1, 1600); show("you", delay = 400); show("ask", delay = 800); set("you", "wow", 1, 300, 800) }
        beat("responsibility to change it") { hide("ask"); set("you", "wow", 0, 300); set("you", "hold", 1, 500); show("wheel", delay = 300); show("tHands", delay = 600); set("you", "mood", 0.8, 500, 600) }
        beat("Identify the routine") { show("st0") }
        beat("experiment with rewards") { show("st1") }
        beat("isolate the cue") { show("st2") }
        beat("write a plan") { show("st3"); set("you", "jump", 0.6, 300); set("you", "jump", 0, 300, 1200) }
    },
)
