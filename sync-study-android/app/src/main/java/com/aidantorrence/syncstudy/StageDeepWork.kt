package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.DeepWorkProps.AreaBox
import com.aidantorrence.syncstudy.DeepWorkProps.Balance
import com.aidantorrence.syncstudy.DeepWorkProps.Bathtub
import com.aidantorrence.syncstudy.DeepWorkProps.Cabin
import com.aidantorrence.syncstudy.DeepWorkProps.ClosedLoop
import com.aidantorrence.syncstudy.DeepWorkProps.DayBar
import com.aidantorrence.syncstudy.DeepWorkProps.DayPlanner
import com.aidantorrence.syncstudy.DeepWorkProps.Desk
import com.aidantorrence.syncstudy.DeepWorkProps.Drawer
import com.aidantorrence.syncstudy.DeepWorkProps.Envelope
import com.aidantorrence.syncstudy.DeepWorkProps.FocusBeam
import com.aidantorrence.syncstudy.DeepWorkProps.FocusDome
import com.aidantorrence.syncstudy.DeepWorkProps.Fog
import com.aidantorrence.syncstudy.DeepWorkProps.Funnel
import com.aidantorrence.syncstudy.DeepWorkProps.GradCap
import com.aidantorrence.syncstudy.DeepWorkProps.Moon
import com.aidantorrence.syncstudy.DeepWorkProps.OnlineDot
import com.aidantorrence.syncstudy.DeepWorkProps.Orbit
import com.aidantorrence.syncstudy.DeepWorkProps.Ping
import com.aidantorrence.syncstudy.DeepWorkProps.PopupStorm
import com.aidantorrence.syncstudy.DeepWorkProps.Pottery
import com.aidantorrence.syncstudy.DeepWorkProps.Puzzle
import com.aidantorrence.syncstudy.DeepWorkProps.Scoreboard
import com.aidantorrence.syncstudy.DeepWorkProps.WallClock
import com.aidantorrence.syncstudy.DeepWorkProps.WeekRow
import kotlin.math.exp

/** Animated explainer films for Deep Work, one per paragraph. */
val DEEP_WORK_STAGE = listOf(
    stage("Deep vs. shallow", Backdrops.room(Color(0xFF2F3E5E))) {
        add("dome", FocusDome(96f), 196, 238).with("on", 0)
        add("worker", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[0], 0, seed = 1), 148, 236).with("hold", 0.8).with("look", 1)
        add("desk", Desk(134f), 200, 238)
        add("bulb", Bulb(), 148, 118, 0.6)
        add("tDeep", Tag("deep work", Pal.Mint), 200, 48)
        add("sh", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[2], 1, seed = 2), 640, 236).with("arms", 0.7).with("wow", 1)
        add("orb", Orbit(48f), 640, 150).with("n", 0)
        add("c1", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[2], 1, seed = 3), 560, 236, 0.85).with("arms", 0.7)
        add("c2", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[2], 1, seed = 4), 720, 236, 0.85).with("arms", 0.7)
        add("tShallow", Tag("shallow work", Pal.Coral), 640, 48)
        add("copy", Tag("easy to copy", Pal.Slate, dark = false), 640, 270)
        add("lowv", Caption("little new value", 12f, Pal.Coral, chip = Pal.Ink.a(0.6f)), 640, 82)
        add("value", LineChart(190f, 110f, Pal.Mint, { t -> 0.1f + 0.85f * t * t }, endLabel = "value ↑"), 975, 140).with("ax", 0)
        add("rare", LineChart(190f, 110f, Pal.Coral, { t -> 0.85f - 0.7f * t }, axes = false, endLabel = "people who can ↓", labelDy = 16f), 975, 140)
        add("champ", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[0], 0, seed = 5), 1170, 236)
        add("trophy", Trophy(), 1170, 112, 0.7)
        add("conf", Confetti(), 1170, 130)
        beat("deep work") { show("worker", "desk", "tDeep", stagger = 150) }
        beat("distraction-free concentration") { show("dome"); set("dome", "on", 1, 1000); set("desk", "lamp", 1, 600) }
        beat("pushes your abilities") { show("bulb"); move("bulb", 148, 96, 900); set("worker", "mood", 0.95, 500) }
        beat("Shallow work") { camera(640, 150, 1, 1500); show("sh", "orb", "tShallow", delay = 500); set("orb", "n", 6, 1600, 700) }
        beat("easily replicated") { show("c1", "c2", stagger = 200); show("copy", delay = 400) }
        beat("little new value") { show("lowv") }
        beat("more valuable") { camera(1040, 150, 1, 1500); show("value", delay = 500); set("value", "ax", 1, 700, 600); play("value", dur = 1800, delay = 900) }
        beat("becoming rarer") { show("rare"); play("rare", dur = 1600) }
        beat("outsized advantage") { show("champ", "trophy", stagger = 200); set("champ", "arms", 1, 500, 300); show("conf", delay = 400); play("conf", dur = 1700, delay = 400, ease = Ease.Out) }
    },
    stage("Output = time × focus", Backdrops.studio(Color(0xFF2A2A4E))) {
        add("t1", Tile("1 · learn hard things fast", Pal.Navy, 176f, 40f, Brain(), 11f, iconScale = 0.45f), 105, 56)
        add("t2", Tile("2 · produce elite work", Pal.Navy, 176f, 40f, Trophy(), 11f, iconScale = 0.42f), 295, 56)
        add("beam", FocusBeam(), 200, 128)
        add("sus", Caption("both need sustained focus", 12f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 200, 262)
        add("player", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[0], 0, seed = 6), 560, 236).with("hold", 0.6)
        add("guitar", Guitar(), 610, 222, 0.8)
        add("tPrac", Tag("deliberate practice", Pal.Sky), 600, 50)
        add("p1", Ping("ping!"), 520, 112)
        add("p2", Ping("new msg", Pal.Gold), 640, 96)
        add("p3", Ping("@you", Pal.Rose), 690, 134)
        add("area", AreaBox(170f, 110f), 1010, 150).with("w", 0).with("h", 0)
        add("eq", Caption("output = time × focus", 14f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1010, 54)
        add("mail", Envelope(), 1125, 92, 1.3)
        add("fog", Fog(170f), 1010, 150)
        add("tRes", Tag("attention residue", Color(0xFFB8BCC8)), 1010, 236)
        add("less", Caption("same time, less output", 12f, Pal.Coral, chip = Pal.Ink.a(0.6f)), 1010, 270)
        beat("master hard things") { show("t1") }
        beat("elite level") { show("t2") }
        beat("sustained focus") { show("beam"); set("beam", "focus", 1, 2200, 300, Ease.InOut); show("sus", delay = 1600) }
        beat("deliberate practice") { camera(600, 150, 1, 1500); show("player", "guitar", "tPrac", delay = 500, stagger = 150); set("player", "mood", 0.8, 400, 900) }
        beat("chat window") { show("p1", "p2", "p3", stagger = 350); set("player", "wow", 1, 300, 300); set("player", "look", -1, 300, 300) }
        beat("time spent multiplied by intensity") {
            camera(1010, 150, 1, 1500); show("area", "eq", delay = 500)
            set("area", "w", 1, 1200, 700); set("area", "h", 1, 1200, 1700)
        }
        beat("glance at email") { show("mail"); rotate("mail", -15, 300); set("area", "h", 0.6, 900, 300) }
        beat("attention residue") { show("fog"); set("fog", "v", 1, 1500); show("tRes", delay = 500) }
        beat("lowers the intensity") { set("area", "h", 0.35, 1200); show("less", delay = 600) }
    },
    stage("Why deep work is rare", Backdrops.City) {
        add("d1", Desk(80f), 80, 242)
        add("w1", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 7), 60, 240, 0.85).with("hold", 0.7)
        add("d2", Desk(80f), 200, 242)
        add("w2", Bean(Pal.Gold, Pal.Skin[2], Pal.Hair[1], 1, seed = 8), 180, 240, 0.85).with("hold", 0.7)
        add("d3", Desk(80f), 320, 242)
        add("w3", Bean(Pal.Rose, Pal.Skin[3], Pal.Hair[3], 3, seed = 9), 300, 240, 0.85).with("hold", 0.7)
        add("tOpen", Tag("open office", Pal.Slate, dark = false), 200, 48)
        add("g1", Ping("ping!"), 70, 112)
        add("g2", Ping("got a sec?", Pal.Gold), 196, 98)
        add("g3", Ping("urgent!!", Pal.Coral), 312, 112)
        add("o1", OnlineDot(), 92, 150)
        add("o2", OnlineDot(), 212, 150)
        add("o3", OnlineDot(), 332, 150)
        add("bars", Bars(listOf(0.95f, 0.3f), listOf("looks busy", "real output"), listOf(Pal.Coral, Pal.Mint), 160f, 110f), 590, 150)
        add("lens", Magnifier(), 640, 150)
        add("q", Caption("hard to measure", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 600, 60)
        add("resp", Bean(Pal.Violet, Pal.Skin[1], Pal.Hair[2], 2, seed = 10), 730, 240).with("wave", 1)
        add("onit", Ping("on it!", Pal.Leaf), 742, 128)
        add("fan", Bean(Pal.Mint, Pal.Skin[0], Pal.Hair[0], 0, seed = 11), 940, 240).with("hold", 1).with("mood", 0.95)
        add("phone", Phone(), 985, 172, 0.6).with("notif", 2)
        add("h1", Heart(Pal.Rose), 1010, 110, 0.35)
        add("h2", Heart(Pal.Rose), 1040, 135, 0.28)
        add("h3", Heart(Pal.Rose), 975, 95, 0.25)
        add("drawer", Drawer(), 1100, 212)
        add("tStruct", Tag("a deliberate structure", Pal.Mint), 1060, 60)
        beat("open offices") { show("d1", "w1", "d2", "w2", "d3", "w3", stagger = 100); show("tOpen", delay = 500) }
        beat("instant messaging") { show("g1", "g2", "g3", stagger = 350); set("w1", "wow", 1, 300, 200); set("w2", "wow", 1, 300, 550); set("w3", "wow", 1, 300, 900) }
        beat("constant availability") { show("o1", "o2", "o3", stagger = 150) }
        beat("busyness") { camera(640, 150, 1, 1500); show("bars", delay = 500); play("bars", dur = 1500, delay = 600) }
        beat("hard to measure") { show("lens", "q"); move("lens", 615, 175, 1200, 0) }
        beat("looking responsive") { show("resp", "onit", stagger = 200) }
        beat("distraction feels good") { camera(1020, 150, 1, 1500); show("fan", "phone", delay = 500); show("h1", "h2", "h3", delay = 900, stagger = 200) }
        beat("deliberate structure") {
            hide("h1", "h2", "h3"); show("drawer", "tStruct")
            move("phone", 1100, 206, 800, 400, Ease.InOut); scale("phone", 0.35, 800, 400, Ease.InOut)
            set("drawer", "shut", 1, 600, 1200); hide("phone", delay = 1300, dur = 150); set("fan", "hold", 0, 400, 1300); set("fan", "mood", 0.5, 400, 1300)
        }
    },
    stage("Rule 1 · Work deeply", Backdrops.studio(Color(0xFF1F3B33))) {
        add("me", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[1], 2, seed = 12), 150, 236).with("hold", 0.8).with("look", 1)
        add("desk", Desk(134f), 200, 238)
        add("clock", WallClock(6f, 0f), 320, 70).with("p", 0)
        add("tRit", Tag("a ritual: same place, same time", Pal.Mint), 168, 48)
        add("l1", Caption("monastic", 12f, Pal.Gold, align = Align.START), 466, 70)
        add("l2", Caption("bimodal", 12f, Pal.Gold, align = Align.START), 466, 115)
        add("l3", Caption("rhythmic", 12f, Pal.Sky, align = Align.START), 466, 160)
        add("l4", Caption("journalistic", 12f, Pal.Violet, align = Align.START), 466, 205)
        add("r1", WeekRow(List(7) { 1f }, Pal.Gold), 648, 68)
        add("r2", WeekRow(listOf(1f, 1f, 1f, 0.1f, 0.1f, 0.1f, 0.1f), Pal.Gold), 648, 113)
        add("r3", WeekRow(List(7) { 0.35f }, Pal.Sky), 648, 158)
        add("r4", WeekRow(listOf(0.2f, 0f, 0.5f, 0.15f, 0f, 0.4f, 0.1f), Pal.Violet), 648, 203)
        add("cabin", Cabin(), 790, 90, 0.5)
        add("tLoc", Tag("place", Pal.Sky), 70, 120)
        add("tTime", Tag("time", Pal.Sky), 70, 150)
        add("tRules", Tag("rules: no web", Pal.Sky), 280, 128)
        add("tFood", Tag("food + movement", Pal.Sky), 290, 160)
        add("goal", Star(Pal.Gold, 20f), 950, 96)
        add("tGoal", Tag("a few big goals", Pal.Gold), 950, 136)
        add("board", Scoreboard(), 1060, 96)
        add("desk2", Desk(120f), 1030, 238)
        add("moon", Moon(), 1180, 58)
        add("done", Tag("shutdown complete", Pal.Violet), 1030, 270)
        beat("rituals and routines") { show("me", "desk", "tRit", stagger = 150); show("clock", delay = 300); play("clock", dur = 1200, delay = 300); set("desk", "lamp", 1, 500, 600) }
        beat("monastic approach") { camera(630, 145, 1, 1500); show("l1", "r1", delay = 500); play("r1", dur = 1200, delay = 600); show("cabin", delay = 1000) }
        beat("bimodal approach") { show("l2", "r2"); play("r2", dur = 1200, delay = 100) }
        beat("rhythmic approach") { show("l3", "r3"); play("r3", dur = 1200, delay = 100) }
        beat("journalistic approach") { show("l4", "r4"); play("r4", dur = 1200, delay = 100) }
        beat("specific location and time") { camera(200, 150, 1, 1500); show("tLoc", "tTime", delay = 600, stagger = 200) }
        beat("defining rules") { show("tRules") }
        beat("food and movement") { show("tFood") }
        beat("wildly important goals") { camera(1040, 150, 1, 1500); show("goal", "tGoal", delay = 500) }
        beat("visible scoreboard") { show("board"); set("board", "n", 12, 2200, 300, Ease.Linear) }
        beat("shutdown ritual") { show("desk2"); set("desk2", "lid", 0, 900, 500); show("moon", "done", delay = 1000) }
    },
    stage("Rule 2 · Embrace boredom", Backdrops.studio(Color(0xFF1F4545))) {
        add("lifter", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 13), 120, 236).with("arms", 1)
        add("bell", SevenHabitsProps.Dumbbell(Pal.Mint), 120, 156, 1.3)
        add("ring", Ring(32f, Pal.Mint, 7f, "focus", 10f), 290, 130)
        add("tMus", Tag("focus is a muscle", Pal.Mint), 200, 48)
        add("q1", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[1], 1, seed = 14), 520, 236, 0.9).with("look", 1).with("mood", 0)
        add("q2", Bean(Pal.Sky, Pal.Skin[3], Pal.Hair[3], 3, seed = 15), 580, 236, 0.9).with("look", 1).with("mood", 0)
        add("you", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 13), 650, 236).with("mood", -0.2)
        add("bored", Bubble("…boring…", 70f, 0f, thought = true), 650, 104)
        add("ph", Phone(), 674, 194, 0.42).with("notif", 3)
        add("ring2", Ring(30f, Pal.Coral, 7f, "focus", 10f), 760, 92).with("p", 0.8)
        add("weak", Tag("weaker", Pal.Coral), 760, 138)
        add("cap", Caption("plan when you go online", 13f, Pal.White, chip = Pal.Ink.a(0.6f)), 1010, 74)
        add("day", DayBar(listOf(
            (0f to 0.3f) to (Pal.Mint to "offline"), (0.3f to 0.08f) to (Pal.Sky to "web"),
            (0.38f to 0.32f) to (Pal.Mint to "offline"), (0.7f to 0.08f) to (Pal.Sky to "web"), (0.78f to 0.22f) to (Pal.Mint to "offline"),
        ), 300f), 1010, 140)
        add("drawer", Drawer(), 1010, 220)
        add("ph2", Phone(), 1010, 210, 0.35)
        add("walker", Bean(Pal.Violet, Pal.Skin[2], Pal.Hair[2], 2, seed = 16), 1360, 236).with("walk", 1).with("look", 1)
        add("bub", Bubble("                 ", 70f, -0.4f, thought = true), 1380, 104)
        add("puz", Puzzle(), 1380, 104, 0.7)
        add("tMed", Tag("one problem, held in mind", Pal.Violet), 1430, 50)
        beat("has to be trained") {
            show("lifter", "bell", "tMus"); show("ring", delay = 300); play("ring", to = 0.8, dur = 2600, delay = 300)
            for (k in 0..3) { set("lifter", "arms", if (k % 2 == 0) 0.5 else 1, 450, k * 650); move("bell", 120, if (k % 2 == 0) 178 else 156, 450, k * 650) }
        }
        beat("reach for your phone") {
            camera(640, 150, 1, 1500); show("q1", "q2", "you", delay = 400, stagger = 120); show("bored", delay = 900)
            show("ph", delay = 1600); set("you", "hold", 1, 400, 1600); set("you", "look", 0, 300, 1600)
            show("ring2", delay = 1800); play("ring2", to = 0.35, dur = 1200, delay = 2000); show("weak", delay = 2600)
        }
        beat("schedule breaks from focus") { camera(1010, 150, 1, 1500); show("cap", "day", delay = 500); play("day", dur = 2200, delay = 600) }
        beat("stay offline") { show("drawer", "ph2"); set("ph2", "y", 222, 600, 300); set("drawer", "shut", 1, 600, 800); hide("ph2", delay = 900, dur = 150) }
        beat("productive meditation") { camera(1400, 150, 1, 1500); show("walker", delay = 400); show("bub", "puz", "tMed", delay = 900); play("puz", dur = 3000, delay = 1200) }
    },
    stage("Rule 3 · Quit social media", Backdrops.room(Color(0xFF3A3352))) {
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 17), 90, 236).with("look", 1).with("hold", 0.4)
        add("phone", Phone(), 230, 150, 1.4).with("notif", 0)
        add("tDef", Tag("by default?", Pal.Coral), 230, 48)
        add("nope", Mark(false, 13f), 270, 98)
        add("smith", Bean(Pal.Wood, Pal.Skin[2], Pal.Hair[1], 1, seed = 18), 480, 236).with("look", 1)
        add("scale", Balance("benefits", "costs"), 620, 236)
        add("tCraft", Tag("the craftsman test", Pal.Gold), 600, 48)
        add("keep", Caption("keep it only if the benefits clearly win", 11.5f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 620, 270)
        add("cal", Calendar(6, 5, "30 DAYS OFF", Pal.Sky), 960, 140)
        add("f1", Bean(Pal.Rose, Pal.Skin[1], Pal.Hair[2], 2, seed = 19), 1100, 236, 0.85).with("look", 1)
        add("f2", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[0], 0, seed = 20), 1150, 236, 0.85).with("look", 1)
        add("shrug", Bubble("did anyone notice?", 100f, 0f), 1120, 100)
        add("fine", Caption("life: not worse at all", 13f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 960, 270)
        beat("quit social media") { show("you", "phone", stagger = 200); set("phone", "notif", 4, 1200, 300); set("phone", "buzz", 1, 200, 300); set("phone", "buzz", 0, 300, 1600) }
        beat("using tools by default") { show("tDef", "nope", stagger = 300); dim("phone", to = 0.5, delay = 500) }
        beat("craftsman approach") { camera(600, 150, 1, 1500); show("smith", "scale", "tCraft", delay = 500, stagger = 150) }
        beat("substantially outweigh") { set("scale", "tilt", -1, 1200, 0, Ease.Back); show("keep", delay = 900); set("smith", "mood", 0.8, 400, 900) }
        beat("thirty-day break") { camera(1030, 150, 1, 1500); show("cal", delay = 500); set("cal", "done", 30, 2600, 700, Ease.Linear) }
        beat("anyone cared") { show("f1", "f2", stagger = 150); show("shrug", delay = 500) }
        beat("life got worse") { show("fine"); set("f1", "mood", 0.8, 400); set("f2", "mood", 0.8, 400) }
    },
    stage("Rule 4 · Drain the shallows", Backdrops.room(Color(0xFF2E4A5A))) {
        add("tub", Bathtub(), 200, 238)
        add("tDrain", Tag("drain the shallows", Pal.Sky), 200, 70)
        add("plan", DayPlanner(listOf(
            (0 to 2) to (Pal.Mint to "DEEP"), (2 to 1) to (Pal.Slate to "email"), (3 to 2) to (Pal.Mint to "DEEP"),
            (5 to 1) to (Pal.Slate to "admin"), (6 to 2) to (Pal.Mint to "DEEP"), (8 to 1) to (Pal.Slate to "calls"),
        )), 590, 140)
        add("planner", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 1, seed = 21), 700, 236).with("look", -1)
        add("tBox", Tag("shallow work, boxed in", Pal.Slate, dark = false), 590, 238)
        add("grad", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[0], 0, seed = 22), 940, 236)
        add("cap", GradCap(), 940, 151)
        add("q", Bubble("How long to train me to do it?", 120f, -0.3f), 980, 82)
        add("deep", Tag("months → deep", Pal.Mint), 1080, 150)
        add("shal", Tag("days → shallow", Pal.Slate, dark = false), 1080, 182)
        add("pie", SevenHabitsProps.Pie(40f, Pal.Slate, Pal.Mint), 1330, 180).with("split", 0.3)
        add("tBud", Tag("an agreed shallow budget", Pal.Gold), 1340, 110)
        add("clock", WallClock(5f, 30f), 1460, 76).with("p", 0)
        add("leaver", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[3], 3, seed = 23), 1460, 236).with("look", 1)
        add("no", Bubble("Sorry, I'm done for today.", 100f, 0f), 1460, 126)
        add("funnel", Funnel(), 1770, 140)
        add("loop", ClosedLoop(), 1890, 140)
        add("tLoop", Tag("replies that close loops", Pal.Mint), 1840, 222)
        beat("drain the shallows") { show("tub", "tDrain"); set("tub", "level", 0.2, 3000, 400, Ease.InOut) }
        beat("Schedule every minute") { camera(620, 150, 1, 1500); show("plan", "planner", delay = 500); play("plan", dur = 2400, delay = 600); set("planner", "point", 1, 500, 900) }
        beat("contained") { show("tBox"); set("planner", "point", 0, 300) }
        beat("smart recent graduate") { camera(1010, 150, 1, 1500); show("grad", "cap", delay = 500); show("q", delay = 900) }
        beat("to do it") { show("deep", "shal", stagger = 400) }
        beat("shallow work budget") { camera(1400, 150, 1, 1500); show("pie", "tBud", delay = 500); set("pie", "grow", 1.15, 700, 900) }
        beat("fixed time each day") { show("clock", "leaver"); play("clock", dur = 1200); set("leaver", "walk", 1, 300, 900); move("leaver", 1530, 236, 1600, 900) }
        beat("decline low-value commitments") { show("no"); set("leaver", "walk", 0, 300); set("leaver", "wave", 1, 400) }
        beat("filtering email") { camera(1830, 150, 1, 1500); show("funnel", delay = 500); play("funnel", dur = 600, delay = 600) }
        beat("close loops") { show("loop", "tLoop"); play("loop", dur = 1200) }
    },
    stage("A deep life", Backdrops.Dusk) {
        add("potter", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[1], 2, seed = 24), 120, 236).with("hold", 1).with("look", 1)
        add("wheel", Pottery(), 190, 238)
        add("flow", Sparkles(Pal.Gold, 50f, 14), 190, 170)
        add("heart", Heart(Pal.Rose), 120, 110, 0.55)
        add("tProd", Tag("more productive", Pal.Mint), 150, 52)
        add("tSat", Tag("more satisfying", Pal.Rose), 150, 78)
        add("mean", Caption("flow + craft = meaning", 13f, Pal.Gold, chip = Pal.Ink.a(0.5f)), 150, 270)
        add("busy", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[0], 0, seed = 25), 320, 236).with("wow", 1)
        add("storm", PopupStorm(56f), 320, 170).with("n", 0)
        add("scat", Tag("scattered attention", Pal.Slate, dark = false), 320, 270)
        beat("deep life") { show("potter", "wheel", stagger = 200); set("wheel", "form", 0.35, 1500, 300) }
        beat("more productive") { show("tProd"); set("wheel", "form", 0.7, 1500) }
        beat("more satisfying") { show("tSat", "heart"); set("potter", "mood", 1, 500) }
        beat("flow and craftsmanship") { show("flow"); set("wheel", "form", 1, 1500); show("mean", delay = 900) }
        beat("scattered attention") { show("busy", "storm", "scat"); set("storm", "n", 1, 1800); set("busy", "mood", -0.5, 500, 900); dim("busy", "scat", to = 0.6, delay = 1800) }
    },
)
