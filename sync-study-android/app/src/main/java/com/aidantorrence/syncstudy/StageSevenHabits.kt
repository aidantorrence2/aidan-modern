package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.SevenHabitsProps.Blueprint
import com.aidantorrence.syncstudy.SevenHabitsProps.Circles
import com.aidantorrence.syncstudy.SevenHabitsProps.Clipboard
import com.aidantorrence.syncstudy.SevenHabitsProps.Compass
import com.aidantorrence.syncstudy.SevenHabitsProps.Dumbbell
import com.aidantorrence.syncstudy.SevenHabitsProps.Ear
import com.aidantorrence.syncstudy.SevenHabitsProps.Fire
import com.aidantorrence.syncstudy.SevenHabitsProps.Flowers
import com.aidantorrence.syncstudy.SevenHabitsProps.House
import com.aidantorrence.syncstudy.SevenHabitsProps.Iceberg
import com.aidantorrence.syncstudy.SevenHabitsProps.Idea
import com.aidantorrence.syncstudy.SevenHabitsProps.Ladder
import com.aidantorrence.syncstudy.SevenHabitsProps.Log
import com.aidantorrence.syncstudy.SevenHabitsProps.Matrix
import com.aidantorrence.syncstudy.SevenHabitsProps.OpenBook
import com.aidantorrence.syncstudy.SevenHabitsProps.PauseButton
import com.aidantorrence.syncstudy.SevenHabitsProps.Pie
import com.aidantorrence.syncstudy.SevenHabitsProps.Plant
import com.aidantorrence.syncstudy.SevenHabitsProps.Podium
import com.aidantorrence.syncstudy.SevenHabitsProps.RouteMap
import com.aidantorrence.syncstudy.SevenHabitsProps.Saw
import com.aidantorrence.syncstudy.SevenHabitsProps.Scroll
import com.aidantorrence.syncstudy.SevenHabitsProps.Step
import com.aidantorrence.syncstudy.SevenHabitsProps.Sunrise
import com.aidantorrence.syncstudy.SevenHabitsProps.TrustJar
import com.aidantorrence.syncstudy.SevenHabitsProps.Wall
import com.aidantorrence.syncstudy.SevenHabitsProps.WeekPlanner

/** Animated explainer films for The 7 Habits of Highly Effective People, one per paragraph. */
val SEVEN_HABITS_STAGE = listOf(
    stage("Character over technique", Backdrops.studio(Color(0xFF1E3A5C))) {
        add("berg", Iceberg(), 200, 150)
        add("tP", Tag("PERSONALITY ETHIC", Pal.Coral), 200, 50)
        add("t1", Tag("techniques", Pal.Coral, dark = false), 92, 96)
        add("t2", Tag("image", Pal.Coral, dark = false), 310, 96)
        add("t3", Tag("quick fixes", Pal.Coral, dark = false), 312, 128)
        add("tC", Tag("CHARACTER ETHIC", Pal.Mint), 200, 180)
        add("c1", Tag("integrity", Color.White, 10f), 200, 208)
        add("c2", Tag("fairness", Color.White, 10f), 148, 238)
        add("c3", Tag("patience", Color.White, 10f), 254, 238)
        add("deep", Sparkles(Pal.Mint, 80f, 14), 200, 225)
        add("lasts", Caption("what lasts is under the surface", 11f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 200, 278)
        add("walker", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 2), 560, 236).with("hold", 1)
        add("map", RouteMap(), 560, 196, 0.7)
        add("think", Bubble("the map in my head", 110f, 0f, thought = true), 560, 98)
        add("lost", Caption("try harder, still lost", 12f, Pal.Coral, chip = Pal.Ink.a(0.6f)), 640, 58)
        add("flag", GoalFlag("THERE!", Pal.Mint), 740, 236)
        add("found", Caption("change the map, change the results", 12f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 640, 58)
        beat("personality ethic") { show("berg", "tP") }
        beat("techniques, image") { show("t1", "t2", "t3", stagger = 220) }
        beat("character ethic") { set("berg", "sub", 1, 1600, 0, Ease.InOut); show("tC", delay = 900) }
        beat("integrity, fairness") { show("c1", "c2", "c3", stagger = 260) }
        beat("lasting effectiveness comes from character") { show("deep", "lasts"); dim("t1", "t2", "t3", to = 0.45) }
        beat("paradigms") { hide("berg", "tP", "t1", "t2", "t3", "tC", "c1", "c2", "c3", "deep", "lasts", dur = 600); camera(620, 150, 1, 1600); show("walker", "map", delay = 600); show("think", delay = 1100) }
        beat("Small changes in behavior") {
            hide("think"); show("lost"); set("walker", "walk", 1, 300); set("walker", "mood", -0.4, 500)
            move("walker", 660, 236, 1100, 0, Ease.InOut); move("map", 660, 196, 1100, 0, Ease.InOut)
            move("walker", 520, 236, 1400, 1200, Ease.InOut); move("map", 520, 196, 1400, 1200, Ease.InOut)
            set("walker", "walk", 0, 300, 2600)
        }
        beat("changing the map") {
            hide("lost"); set("map", "right", 1, 700); show("flag", delay = 400)
            set("walker", "walk", 1, 300, 700); move("walker", 690, 236, 1700, 700); move("map", 690, 196, 1700, 700)
            set("walker", "walk", 0, 300, 2400); set("walker", "mood", 0.9, 500, 2400); set("walker", "jump", 1, 300, 2400)
            show("found", delay = 2400)
        }
    },
    stage("From me to we", Backdrops.Day) {
        add("s1", Step(110f, 30f, Pal.Slate, "DEPENDENCE"), 85, 238)
        add("s2", Step(110f, 65f, Pal.Sky, "INDEPENDENCE"), 200, 238)
        add("s3", Step(110f, 100f, Pal.Mint, "INTERDEPENDENCE"), 315, 238)
        add("parent", Bean(Pal.Violet, Pal.Skin[1], Pal.Hair[1], 1, seed = 3), 102, 208).with("hold", 0.7)
        add("kid", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 4), 66, 208, 0.62).with("arms", 0.5).with("look", 1)
        add("b1", Bubble("take care of me", 86f, 0.4f), 62, 104)
        add("solo", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[3], 3, seed = 5), 200, 173)
        add("b2", Bubble("I can do it", 80f, 0f), 200, 54)
        add("p1", Bean(Pal.Mint, Pal.Skin[0], Pal.Hair[2], 1, seed = 6), 296, 138).with("look", 1).with("hold", 0.6)
        add("p2", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[0], 0, seed = 7), 336, 138).with("look", -1).with("hold", 0.6)
        add("heart", Heart(), 316, 40, 0.55)
        add("up", Arrow(108f, -34f, -26f, Pal.Gold, 3f), 92, 180)
        add("priv", Tag("habits 1–3: private victories", Pal.Gold), 160, 268)
        add("spark", Sparkles(Pal.Gold, 46f, 12), 200, 120)
        add("conf", Confetti(count = 30, power = 90f), 200, 110)
        beat("dependence") { show("s1", "parent", "kid", stagger = 160); show("b1", delay = 700) }
        beat("independence") { show("s2", "solo"); set("solo", "arms", 1, 600, 300); show("b2", delay = 700) }
        beat("interdependence") { show("s3", "p1", "p2", stagger = 160); show("heart", delay = 600); set("p1", "mood", 0.9, 500); set("p2", "mood", 0.9, 500) }
        beat("private victories") { show("up"); play("up", dur = 1000); show("priv", delay = 600); show("spark", delay = 600) }
        beat("work you do on yourself") { set("solo", "jump", 1, 300); set("solo", "jump", 0, 300, 1500); show("conf"); play("conf", dur = 1700, ease = Ease.Out) }
    },
    stage("Habit 1 · Be proactive", Backdrops.studio(Color(0xFF2B3A5E))) {
        add("table", Table(80f), 70, 214)
        add("phone", Phone(), 70, 172, 0.8).with("notif", 0)
        add("tS", Tag("stimulus", Pal.Coral), 70, 100)
        add("a1", Arrow(56f, -14f, -14f, Pal.White.a(0.7f), 2.5f), 108, 166)
        add("pause", PauseButton(), 200, 150)
        add("tG", Tag("the gap", Pal.Mint), 200, 96)
        add("a2", Arrow(56f, 24f, -14f, Pal.White.a(0.7f), 2.5f), 238, 152)
        add("you", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 2, seed = 8), 330, 236)
        add("tR", Tag("response", Pal.Sky), 330, 128)
        add("react", Tag("snap back", Pal.Coral), 286, 62)
        add("respond", Tag("choose calmly", Pal.Mint), 314, 90)
        add("x", Mark(false, 9f), 330, 62)
        add("ok", Mark(true, 9f), 370, 90)
        val outer = listOf("weather", "economy", "others")
        val inner = listOf("my effort", "my words")
        add("cP", Circles(70f, outer, inner), 586, 128).with("inf", 0.3)
        add("cR", Circles(70f, outer, inner, Pal.Coral.darken(0.2f)), 744, 128).with("inf", 0.3)
        add("pro", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 9), 488, 236)
        add("rea", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[2], 1, seed = 10), 842, 236)
        add("tPro", Tag("proactive", Pal.Mint), 586, 222)
        add("tRea", Tag("reactive", Pal.Coral), 744, 222)
        add("moan", Bubble("It's not fair!", 80f, 0.5f), 822, 62)
        beat("Between stimulus") { show("table", "phone", "tS"); set("phone", "notif", 3, 900); set("phone", "buzz", 1, 200); set("phone", "buzz", 0, 400, 1500) }
        beat("and response") { show("you", "tR"); set("you", "wow", 1, 300) }
        beat("there is a gap") {
            show("a1"); play("a1", dur = 600); show("pause", "tG", delay = 400)
            set("pause", "press", 1, 300, 900); show("a2", delay = 1100); play("a2", dur = 600, delay = 1100)
            set("you", "wow", 0, 300, 1200)
        }
        beat("freedom to choose") {
            hide("tR"); show("react", "x", stagger = 200); show("respond", "ok", delay = 700, stagger = 200)
            dim("react", to = 0.5, delay = 900); set("you", "mood", 0.7, 500, 900); set("you", "look", 0.6, 400, 900)
        }
        beat("circle of influence") { camera(665, 150, 0.92, 1700); show("cP", "pro", "tPro", delay = 700, stagger = 180) }
        beat("that circle grows") { set("cP", "inf", 0.62, 2000, 0, Ease.InOut); set("pro", "arms", 1, 600, 600); set("pro", "mood", 0.9, 500, 600) }
        beat("Reactive people") { show("cR", "rea", "tRea", stagger = 180); set("rea", "mood", -0.4, 500) }
        beat("complain") { show("moan"); set("rea", "arms", 0.7, 400); set("rea", "mood", -0.8, 500) }
        beat("influence shrinks") { set("cR", "inf", 0.12, 2000, 0, Ease.InOut); set("rea", "arms", 0, 500, 800) }
    },
    stage("Habit 2 · Begin with the end", Backdrops.room(Color(0xFF3A2E52), Color(0xFF4A3A3A))) {
        add("speaker", Bean(Pal.Navy, Pal.Skin[2], Pal.Hair[4], 4, seed = 11), 200, 212).with("mood", 0.35)
        add("podium", Podium(), 200, 238)
        add("fl1", Flowers(), 110, 238)
        add("fl2", Flowers(listOf(Color.White, Pal.Violet, Pal.Gold)), 290, 238)
        add("cap", Caption("Imagine: your own funeral", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 200, 48)
        add("q1", Bubble("She was kind.", 82f, 0.5f), 84, 88)
        add("q2", Bubble("Always showed up.", 92f, -0.5f), 318, 88)
        add("q3", Bubble("Brave and honest.", 96f, 0f), 200, 98)
        add("scroll", Scroll("MY MISSION", listOf("Be kind first", "Keep my word", "Make things", "Show up")), 610, 140)
        add("writer", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[0], 0, seed = 12), 720, 236).with("hold", 0.8).with("look", -1)
        add("r1", Tag("parent", Pal.Rose), 488, 92)
        add("r2", Tag("friend", Pal.Sky), 488, 128)
        add("r3", Tag("builder", Pal.Gold), 488, 164)
        add("plan", Blueprint(), 950, 140)
        add("tPlan", Tag("1 · first, in your mind", Pal.Sky), 950, 70)
        add("house", House(), 1085, 236)
        add("tHouse", Tag("2 · then, in the world", Pal.Mint), 1085, 108)
        add("wA", Wall("WRONG WALL", Pal.Slate), 1330, 238)
        add("wB", Wall("RIGHT WALL", Pal.Mint), 1480, 238)
        add("ladder", Ladder(140f), 1405, 238, r = -18)
        add("climber", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[0], 0, seed = 13), 1405, 236, 0.7).with("arms", 1)
        add("q", Caption("is your ladder on the right wall?", 12f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1405, 286)
        beat("imagine their own funeral") { show("podium", "speaker", "fl1", "fl2", stagger = 120); show("cap", delay = 400) }
        beat("what they would want said") { show("q1", "q3", "q2", delay = 300, stagger = 700); set("speaker", "wave", 0.4, 600) }
        beat("mission statement") { camera(605, 150, 1, 1600); show("scroll", delay = 500); play("scroll", dur = 2400, delay = 600); show("writer", delay = 700) }
        beat("principles and roles") { show("r1", "r2", "r3", stagger = 250); set("writer", "mood", 0.9, 500) }
        beat("created twice") { camera(1015, 150, 1, 1600); show("plan", "tPlan", delay = 500); play("plan", dur = 1800, delay = 600) }
        beat("then physically") { show("house", "tHouse"); set("house", "build", 1, 2600, 200, Ease.InOut) }
        beat("ladder is leaning against") {
            camera(1405, 150, 1, 1500); show("wA", "wB", "ladder", "climber", delay = 400, stagger = 120)
            move("climber", 1380, 162, 1300, 1000); set("climber", "wow", 1, 300, 2300)
            rotate("ladder", 18, 1300, 2600); move("climber", 1430, 162, 1300, 2600)
            set("climber", "wow", 0, 300, 3900); set("climber", "mood", 0.9, 400, 3900); show("q", delay = 3600)
        }
    },
    stage("Habit 3 · First things first", Backdrops.Paper) {
        add("mx", Matrix(120f, 74f), 200, 150)
        add("imp", Tag("important", Pal.Gold, 8.5f), 38, 112)
        add("nimp", Tag("not important", Pal.Slate, 8.5f, dark = false), 40, 190)
        add("fire", Fire(26f), 168, 140)
        add("ring", Phone(), 168, 196, 0.42).with("notif", 1)
        add("runner", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[0], 0, seed = 14), 110, 141, 0.55).with("walk", 1)
        add("plant", Plant(), 236, 145, 0.6).with("grow", 0.1)
        add("love", Heart(Pal.Rose), 296, 124, 0.45)
        add("week", WeekPlanner(listOf(
            Triple(0, 0.05f to 0.3f, Pal.Mint), Triple(1, 0.5f to 0.3f, Pal.Sky), Triple(2, 0.1f to 0.25f, Pal.Gold),
            Triple(3, 0.55f to 0.35f, Pal.Rose), Triple(4, 0.05f to 0.3f, Pal.Mint), Triple(5, 0.3f to 0.5f, Pal.Violet), Triple(6, 0.2f to 0.3f, Pal.Leaf),
        )), 600, 132)
        add("roles", Tag("roles + goals first", Pal.Mint), 600, 216)
        add("todo", Tile("daily to-do list", Pal.Slate, 104f, 34f, textSize = 10.5f), 600, 256)
        add("no", Mark(false, 9f), 656, 244)
        beat("four quadrants") { show("mx"); play("mx", dur = 1500, ease = Ease.Out) }
        beat("urgency and importance") { show("imp", "nimp", stagger = 200) }
        beat("urgent quadrants") {
            set("mx", "hot", 1, 800); show("fire", "ring", "runner", stagger = 150); set("runner", "wow", 1, 300)
            move("runner", 110, 222, 700, 700); move("runner", 110, 141, 700, 1600); move("runner", 110, 222, 700, 2500)
        }
        beat("answering whatever is loudest") { set("ring", "notif", 4, 900); set("ring", "buzz", 1, 200); set("ring", "buzz", 0, 300, 1800); set("fire", "big", 1.4, 800) }
        beat("important but not urgent") {
            set("mx", "q2", 1, 900); set("mx", "hot", 0.45, 900)
            move("runner", 222, 141, 1100, 0); set("runner", "wow", 0, 300, 900); set("runner", "walk", 0, 300, 1100); set("runner", "mood", 0.9, 400, 1100)
            set("fire", "big", 0.6, 900)
        }
        beat("planning, relationships") { show("plant", "love", stagger = 250); set("plant", "grow", 1, 2200, 200) }
        beat("weekly planning") { camera(600, 150, 1, 1600); show("week", delay = 500); play("week", dur = 2200, delay = 600); show("roles", delay = 1400) }
        beat("daily to-do list") { show("todo"); show("no", delay = 400); dim("todo", to = 0.5, delay = 600) }
    },
    stage("Habit 4 · Think win-win", Backdrops.Day) {
        add("pub", Tag("habits 4–6: public victories, with others", Pal.Sky), 200, 46)
        add("l", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 15), 40, 236).with("walk", 1).with("look", 1)
        add("r", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[1], 1, seed = 16), 360, 236).with("walk", 1).with("look", -1)
        add("table", Table(110f), 200, 214)
        add("pie", Pie(34f), 200, 196).with("grow", 0.8)
        add("scar", Caption("your gain = my loss", 13f, Pal.Coral, chip = Pal.Ink.a(0.55f)), 200, 96)
        add("abund", Caption("bake a bigger pie", 13f, Pal.Mint, chip = Pal.Ink.a(0.55f)), 200, 96)
        add("spark", Sparkles(Pal.Gold, 60f, 12), 200, 175)
        add("ok1", Mark(true, 11f), 120, 122)
        add("ok2", Mark(true, 11f), 280, 122)
        add("nd", Bubble("No deal is fine too.", 110f, 0f), 200, 96)
        beat("public victories") { show("pub", "l", "r"); move("l", 118, 236, 1400, 200); move("r", 282, 236, 1400, 200); set("l", "walk", 0, 300, 1600); set("r", "walk", 0, 300, 1600) }
        beat("think win-win") { show("table", "pie") }
        beat("scarcity mentality") {
            set("pie", "split", 0.82, 900); set("l", "point", 1, 500); set("r", "mood", -0.6, 500); show("scar", delay = 300)
        }
        beat("their loss") { set("pie", "split", 0.2, 1000); set("l", "point", 0, 400); set("l", "mood", -0.6, 500); set("r", "mood", 0.2, 500); set("r", "point", 0.8, 400) }
        beat("abundance mentality") {
            hide("scar"); set("r", "point", 0, 300)
            set("pie", "grow", 1.45, 1600, 0, Ease.Back); set("pie", "split", 0.5, 1200)
            set("l", "mood", 0.9, 500, 800); set("r", "mood", 0.9, 500, 800); show("abund", "spark", delay = 600)
        }
        beat("everyone benefits") { show("ok1", "ok2", stagger = 200); set("l", "arms", 1, 500); set("r", "arms", 1, 500) }
        beat("no deal") { hide("abund", "ok1", "ok2"); set("l", "arms", 0, 400); set("r", "arms", 0, 400); show("nd", delay = 300); set("l", "wave", 1, 400, 600); set("r", "wave", 1, 400, 600) }
    },
    stage("Habit 5 · Understand first", Backdrops.room(Color(0xFF3E5A5A))) {
        add("a", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[1], 1, seed = 17), 100, 236).with("look", 1).with("mood", -0.4)
        add("b", Bean(Pal.Sky, Pal.Skin[3], Pal.Hair[0], 0, seed = 18), 300, 236).with("look", -1)
        add("say", Bubble("My week was awful…", 100f, 0.3f), 100, 100)
        add("me", Bubble("Me too! Once I…", 92f, 0.3f, thought = true), 304, 96)
        add("auto", Tag("filtered through MY story", Pal.Coral), 300, 50)
        add("ear", Ear(Pal.Skin[3]), 200, 146)
        add("what", Tag("what you say", Pal.Sky), 200, 84)
        add("feel", Tag("how you feel", Pal.Rose), 200, 206)
        add("heart", Heart(Pal.Rose), 154, 146, 0.4)
        add("ok", Mark(true, 11f), 100, 98)
        add("idea", Bubble("Here's one idea…", 96f, 0f), 300, 100)
        add("doc", Bean(Color.White, Pal.Skin[2], Pal.Hair[4], 4, seed = 19), 560, 236).with("look", 1)
        add("pat", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[2], 2, seed = 20), 690, 236).with("look", -1).with("mood", -0.3)
        add("clip", Clipboard(), 620, 150)
        add("d1", Tag("1 · diagnose", Pal.Sky), 560, 70)
        add("d2", Tag("2 · then prescribe", Pal.Mint), 690, 70)
        beat("seek first to understand") { show("a", "b", stagger = 200) }
        beat("intent to reply") { show("say"); show("me", delay = 600); set("b", "look", 1, 300, 600) }
        beat("own autobiography") { show("auto"); set("b", "mood", 0.8, 400) }
        beat("Empathic listening") { hide("me", "auto"); set("b", "look", -1, 400); set("b", "mood", 0.4, 400); show("ear"); set("ear", "on", 1, 600, 300) }
        beat("the content") { show("what") }
        beat("the feeling") { show("feel", "heart", stagger = 200) }
        beat("feel understood") { hide("say"); show("ok"); set("a", "mood", 0.8, 600) }
        beat("open to your view") { show("idea"); set("a", "look", 1, 300); set("a", "jump", 0.4, 300); set("a", "jump", 0, 300, 900) }
        beat("diagnoses before prescribing") {
            camera(625, 150, 1, 1500); show("doc", "pat", delay = 500, stagger = 150)
            show("d1", delay = 900); show("clip", "d2", delay = 2200, stagger = 200); set("pat", "mood", 0.7, 500, 2600)
        }
    },
    stage("Habit 6 · Synergize", Backdrops.studio(Color(0xFF1F4545))) {
        add("a", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 21), 80, 236).with("look", 1)
        add("b", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[1], 1, seed = 22), 320, 236).with("look", -1)
        add("ia", Idea(0, Pal.Sky), 80, 108)
        add("ib", Idea(1, Pal.Coral), 320, 108)
        add("bridge", Arrow(160f, 0f, 22f, Pal.Mint, 3f, dashed = true, head = false), 120, 160)
        add("trust", Tag("trust", Pal.Mint), 200, 142)
        add("sa", Bubble("what if…?", 70f, -0.4f), 136, 72)
        add("sb", Bubble("and also…", 70f, 0.4f), 264, 72)
        add("third", Idea(2, Pal.Gold, 22f), 200, 112)
        add("conf", Confetti(), 200, 112)
        add("eq", Caption("1 + 1 = 3", 18f, Pal.Gold), 200, 170)
        add("bars", Bars(listOf(0.45f, 0.45f, 0.95f), listOf("mine", "yours", "ours"), listOf(Pal.Sky, Pal.Coral, Pal.Gold), 130f, 50f), 200, 232)
        add("raw", Caption("differences = raw material", 12f, Pal.Mint), 200, 284)
        add("spark", Sparkles(Pal.Gold, 90f, 16), 200, 140)
        beat("different perspectives") { show("a", "ia", "b", "ib", stagger = 180) }
        beat("trust each other") { show("bridge"); play("bridge", dur = 1000); show("trust", delay = 700); set("a", "mood", 0.7, 400); set("b", "mood", 0.7, 400) }
        beat("communicate openly") { hide("trust"); show("sa", "sb", stagger = 400) }
        beat("third alternative") {
            hide("sa", "sb", "bridge")
            move("ia", 200, 112, 900, 0, Ease.In); move("ib", 200, 112, 900, 0, Ease.In)
            scale("ia", 0.2, 900, 0, Ease.In); scale("ib", 0.2, 900, 0, Ease.In); hide("ia", "ib", delay = 800)
            show("third", delay = 850); scale("third", 1.5, 900, 900); show("conf", delay = 950); play("conf", dur = 1600, delay = 950, ease = Ease.Out)
            show("eq", delay = 1300); set("a", "wow", 1, 300, 900); set("b", "wow", 1, 300, 900)
        }
        beat("better than either side") { show("bars"); play("bars", dur = 1500); set("a", "wow", 0, 300); set("b", "wow", 0, 300); set("a", "mood", 0.9, 400); set("b", "mood", 0.9, 400) }
        beat("raw material of creativity") { show("raw", "spark"); set("a", "arms", 1, 500); set("b", "arms", 1, 500) }
    },
    stage("Habit 7 · Sharpen the saw", Backdrops.Field) {
        add("friend", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[2], 2, seed = 23), 70, 236).with("look", 1)
        add("log", Log(), 200, 236)
        add("man", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[0], 0, seed = 24), 300, 236).with("hold", 1).with("look", -1)
        add("saw", Saw(), 228, 198).with("saw", 1)
        add("hours", Counter(16f, Pal.Gold, 0, suffix = " hrs sawing", map = { it * 5f }), 320, 60)
        add("sweat", Drips(Pal.Sky, 24f), 300, 134).with("rate", 0.7)
        add("tip", Bubble("Stop and sharpen it!", 96f, 0f), 76, 100)
        add("busy", Bubble("Too busy sawing!", 90f, 0f), 310, 100)
        add("me", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[3], 3, seed = 25), 600, 236)
        add("ph", Tile("Physical", Pal.Navy, 112f, 40f, Dumbbell(), 12f, iconScale = 0.55f), 510, 92)
        add("mn", Tile("Mental", Pal.Navy, 112f, 40f, OpenBook(), 12f, iconScale = 0.5f), 690, 92)
        add("so", Tile("Social", Pal.Navy, 112f, 40f, Heart(Pal.Rose), 12f, iconScale = 0.45f), 510, 160)
        add("sp", Tile("Spiritual", Pal.Navy, 112f, 40f, Sunrise(), 12f, iconScale = 0.55f), 690, 160)
        add("glow", Sparkles(Pal.Mint, 50f, 12), 600, 180)
        for (i in 1..6) add("h$i", Tag("$i", Pal.Gold, 11f), 480 + i * 34, 268)
        add("decay", Caption("skip renewal and the rest decay", 11f, Pal.Coral, chip = Pal.Ink.a(0.6f)), 600, 40)
        beat("sawing a tree") {
            show("log", "man", "saw", stagger = 150); show("hours", delay = 400)
            set("log", "cut", 0.35, 5000, 400, Ease.Linear); set("hours", "v", 1, 5000, 400, Ease.Linear)
        }
        beat("refuses to stop") { show("friend"); show("tip", delay = 300); set("friend", "point", 1, 500) }
        beat("too busy sawing") { show("busy", "sweat"); set("man", "mood", -0.6, 500); set("friend", "mood", -0.2, 400) }
        beat("four dimensions") { camera(600, 150, 1, 1600); show("me", delay = 500) }
        beat("physical") { show("ph"); set("me", "arms", 1, 500); set("me", "arms", 0, 400, 900) }
        beat("mental") { show("mn"); set("me", "look", 1, 300) }
        beat("social and emotional") { show("so"); set("me", "look", -1, 300); set("me", "mood", 0.9, 400) }
        beat("spiritual") { show("sp", "glow"); set("me", "look", 0, 300); set("me", "sit", 1, 600) }
        beat("other six habits decay") {
            set("me", "sit", 0, 500)
            for (i in 1..6) show("h$i", delay = i * 80)
            for (i in 1..6) { dim("h$i", to = 0.3, delay = 1100 + i * 120); rotate("h$i", if (i % 2 == 0) 20 else -20, 800, 1100 + i * 120); set("h$i", "y", 282, 800, 1100 + i * 120, Ease.In) }
            dim("ph", "mn", "so", "sp", to = 0.35, delay = 900); show("decay", delay = 900); set("me", "mood", -0.5, 500, 1200)
        }
    },
    stage("The emotional bank account", Backdrops.room(Color(0xFF4A3B5C), Color(0xFF5B4632))) {
        add("a", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[0], 0, seed = 26), 90, 236).with("look", 1)
        add("b", Bean(Pal.Rose, Pal.Skin[2], Pal.Hair[1], 1, seed = 27), 310, 236).with("look", -1)
        add("jar", TrustJar(), 200, 236).with("level", 0.2)
        for (i in 0 until 4) add("c$i", Coin(9f), 118, 180)
        add("plus", Tag("+ built up", Pal.Leaf), 200, 112)
        add("minus", Tag("− drained", Pal.Coral), 200, 112)
        add("d1", Tag("kept a promise", Pal.Gold), 92, 52)
        add("d2", Tag("clear expectations", Pal.Gold), 92, 76)
        add("d3", Tag("loyal when they're away", Pal.Gold), 92, 100)
        add("d4", Tag("sincere apology", Pal.Gold), 300, 52)
        add("love", Heart(Pal.Rose), 310, 120, 0.5)
        add("cmp", Compass(), 600, 140)
        add("trick", Caption("not a trick…", 14f, Pal.White), 600, 56)
        add("north", Tag("principles: true north", Pal.Gold), 600, 214)
        beat("emotional bank account") { show("jar", "a", "b", stagger = 150) }
        beat("built up or drained") {
            show("plus"); set("jar", "level", 0.45, 900); hide("plus", delay = 1100)
            show("minus", delay = 1200); set("jar", "level", 0.12, 900, 1200); hide("minus", delay = 2300)
        }
        val deposits = listOf("keeping commitments", "clarifying expectations", "loyalty to those who are absent", "apologizing sincerely")
        deposits.forEachIndexed { i, phrase ->
            beat(phrase) {
                show("c$i"); move("c$i", 200, 146, 700, 100, Ease.In); hide("c$i", delay = 780, dur = 120)
                set("jar", "level", 0.3f + i * 0.18f, 700, 750); show("d${i + 1}", delay = 200)
                if (i == 3) { show("love", delay = 700); set("b", "mood", 0.95, 500, 700); set("a", "mood", 0.9, 500, 700) }
            }
        }
        beat("not a trick") { camera(600, 150, 1, 1600); show("cmp", delay = 500); show("trick", delay = 800) }
        beat("principles that do not change") { set("cmp", "settle", 1, 2200, 0, Ease.InOut); show("north", delay = 1600) }
    },
)
