package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color

/** Animated explainer films for How to Win Friends and Influence People, one per paragraph. */
val CARNEGIE_STAGE = listOf(
    stage("The big idea", Backdrops.room()) {
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 1), 110, 236).with("look", 1)
        add("them", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[1], 1, seed = 2), 290, 236).with("look", -1)
        add("right", Bubble("Actually, I'm right.", 110f, 0.6f), 140, 108)
        add("heart", Heart(Pal.Rose), 200, 150, 0.9)
        add("hearts", CarnegieProps.Hearts(), 290, 150)
        add("feel", Tag("what counts: how they feel", Pal.Rose), 200, 52)
        add("cal", Calendar(7, 2, "PRACTICE", Pal.Mint), 630, 108)
        add("s1", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[2], 2, seed = 3), 545, 236).with("sit", 1).with("look", 1)
        add("s2", Bean(Pal.Violet, Pal.Skin[3], Pal.Hair[0], 0, seed = 4), 595, 236).with("sit", 1).with("look", 1)
        add("s3", Bean(Pal.Leaf, Pal.Skin[0], Pal.Hair[1], 1, seed = 5), 645, 236).with("sit", 1).with("look", 1)
        add("teach", Bean(Pal.Navy.lighten(0.25f), Pal.Skin[1], Pal.Hair[4], 4, seed = 6), 740, 236).with("look", -1)
        add("tClass", Tag("decades of classes for adults", Pal.Sky), 640, 50)
        beat { show("you", "them") }
        beat("being right") { show("right"); set("you", "point", 1, 500); set("you", "mood", 0.7, 400); set("them", "mood", -0.5, 600, 400) }
        beat("how we make them feel") {
            dim("right", to = 0.35, delay = 600); set("you", "point", 0, 500); set("you", "mood", 0.6, 400)
            show("heart", delay = 200); show("feel", delay = 500)
            set("them", "mood", 0.95, 600, 300); show("hearts", delay = 600)
        }
        beat("decades of teaching adults") {
            camera(650, 150, 1.05, 1500)
            hide("right")
            show("s1", "s2", "s3", delay = 600, stagger = 150); show("teach", delay = 900)
            set("teach", "wave", 1, 400, 1300); show("tClass", delay = 1100)
        }
        beat("set of habits to practice") { set("teach", "wave", 0, 300); show("cal"); set("cal", "done", 14, 2400, 300, Ease.Linear) }
    },
    stage("3 rules for handling people", Backdrops.studio(Color(0xFF2A2F4A))) {
        add("critic", Bean(Pal.Slate, Pal.Skin[1], Pal.Hair[3], 3, seed = 7), 100, 236).with("look", 1)
        add("target", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[1], 1, seed = 8), 290, 236).with("look", -1)
        add("crit", Bubble("You did it all wrong!", 110f, 0.5f, fill = Pal.Coral, ink = Color.White), 120, 104)
        add("shield", CarnegieProps.Shield(), 243, 186)
        add("excuse", Bubble("It wasn't my fault!", 100f, -0.5f), 300, 100)
        add("good", Counter(17f, Pal.Coral, 0, prefix = "goodwill ", suffix = "%", halo = false), 200, 46).with("v", 100)
        add("r1", Tag("rule 1 · don't criticize", Pal.Coral), 200, 272)
        add("worker", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[0], 0, seed = 9), 580, 236).with("look", 1)
        add("boss", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 10), 720, 236).with("look", -1)
        add("praise", Bubble("Your report was really clear.", 110f, -0.6f), 702, 104)
        add("crown", CarnegieProps.Crown(), 580, 149)
        add("flat", Bubble("You're a GENIUS!!!", 100f, -0.6f, fill = Pal.Slate, ink = Color.White), 702, 104)
        add("fake", Tag("flattery feels fake", Pal.Slate, dark = false), 650, 50)
        add("r2", Tag("rule 2 · honest appreciation", Pal.Mint), 650, 272)
        add("pond", CarnegieProps.Pond(210f, 50f), 1205, 238)
        add("angler", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 10), 1060, 236).with("point", 1).with("look", 1)
        add("rod", CarnegieProps.Rod(72f, 72f), 1098, 190)
        add("berry", CarnegieProps.Strawberry(), 1170, 265)
        add("worm", CarnegieProps.Worm(), 1170, 265)
        add("fish", CarnegieProps.Fish(Pal.Gold, -1f), 1270, 265)
        add("tYou", Tag("bait YOU like", Pal.Coral), 1170, 128)
        add("tThem", Tag("bait THEY want", Pal.Leaf), 1170, 128)
        add("r3", Tag("rule 3 · arouse an eager want", Pal.Gold), 1150, 64)
        add("bite", Confetti(count = 24, power = 60f), 1170, 255)
        beat("do not criticize") { show("critic", "target"); show("crit", "r1", delay = 300); set("critic", "point", 1, 400); set("critic", "mood", -0.4, 400) }
        beat("on the defensive") { show("shield"); set("target", "hold", 1, 400); set("target", "mood", -0.5, 400) }
        beat("justify themselves") { show("excuse") }
        beat("costs you goodwill") { show("good"); set("good", "v", 35, 1600, 200) }
        beat("honest and sincere appreciation") {
            camera(650, 150, 1.05, 1500); show("worker", "boss", delay = 500); show("praise", "r2", delay = 900)
        }
        beat("feel important") { show("crown"); set("worker", "mood", 0.95, 400); set("worker", "jump", 1, 300); set("worker", "jump", 0, 300, 1300) }
        beat("Flattery") { hide("praise"); show("flat", delay = 200); set("worker", "mood", 0.05, 600, 400); show("fake", delay = 600) }
        beat("eager want") {
            camera(1160, 165, 1.05, 1500)
            show("pond", "angler", "rod", "berry", "fish", delay = 500, stagger = 100); show("r3", delay = 1000)
        }
        beat("what you need") {
            show("tYou")
            move("fish", 1200, 265, 1100, 0, Ease.InOut); move("fish", 1290, 272, 1100, 1300, Ease.InOut)
            set("angler", "mood", -0.2, 400, 1600)
        }
        beat("what the other person wants") {
            hide("berry", "tYou"); show("worm", delay = 200); show("tThem", delay = 300)
            move("fish", 1188, 265, 1500, 400, Ease.InOut)
            set("angler", "mood", 1, 400, 1800); show("bite", delay = 1800); play("bite", dur = 1400, delay = 1800, ease = Ease.Out)
        }
    },
    stage("6 ways to be liked", Backdrops.Day) {
        add("spot", CarnegieProps.Spotlight(h = 220f, w = 80f), 300, 238)
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 11), 160, 236).with("look", 1)
        add("maya", Bean(Pal.Rose, Pal.Skin[2], Pal.Hair[1], 1, seed = 12), 300, 236).with("look", -1).with("mood", 0.25)
        add("f1", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[3], 3, seed = 13), -40, 236).with("look", 1)
        add("f2", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[2], 2, seed = 14), -90, 236).with("look", 1)
        add("count", Counter(16f, Pal.Navy, 0, suffix = " of 6", halo = false), 200, 46)
        add("b1", Bubble("How did you get into guitar?", 115f, 0.5f), 170, 100)
        add("smile", Sparkles(Pal.Gold, 26f, 8), 160, 160)
        add("tag", CarnegieProps.NameTag("Maya"), 302, 200, 0.55)
        add("b3", Bubble("Great to see you, Maya!", 110f, 0.5f), 170, 100)
        add("b4", Bubble("…and then I played my first gig!", 120f, -0.5f), 300, 100)
        add("listen", Tag("listening", Pal.Sky), 160, 128)
        add("guitar", Guitar(), 362, 212, 0.72)
        add("b5", Bubble("What are you learning to play?", 115f, 0.5f), 170, 100)
        add("crown", CarnegieProps.Crown(), 300, 149)
        add("tAtt", Tag("all six are attention", Pal.Gold), 300, 70)
        beat { show("you", "maya", "count") }
        beat("genuinely interested") { show("b1"); set("count", "v", 1, 500); set("maya", "mood", 0.6, 500, 400) }
        beat("Smile") { hide("b1"); set("you", "mood", 1, 400); show("smile"); set("count", "v", 2, 500); set("maya", "mood", 0.75, 500) }
        beat("name is") { hide("smile"); show("tag", "b3", stagger = 300); set("count", "v", 3, 500) }
        beat("good listener") { hide("b3"); show("b4", "listen", stagger = 200); set("you", "mood", 0.7, 400); set("count", "v", 4, 500) }
        beat("other person's interests") { hide("b4", "listen"); show("guitar", "b5", stagger = 300); set("count", "v", 5, 500); set("maya", "mood", 0.95, 500) }
        beat("feel important, sincerely") {
            hide("b5"); show("crown"); set("count", "v", 6, 500)
            set("maya", "jump", 1, 300); set("maya", "jump", 0, 300, 1300)
        }
        beat("is attention") { show("spot", "tAtt", stagger = 300) }
        beat("drawn to those") {
            show("f1", "f2")
            move("f1", 65, 236, 1600, 0, Ease.Out); move("f2", 105, 236, 1800, 100, Ease.Out)
            set("f1", "walk", 1, 200); set("f2", "walk", 1, 200); set("f1", "walk", 0, 300, 1500); set("f2", "walk", 0, 300, 1700)
            set("you", "mood", 1, 400, 1600)
        }
    },
    stage("Winning people over", Backdrops.studio(Color(0xFF34284F))) {
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 15), 110, 236).with("look", 1)
        add("other", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[2], 2, seed = 16), 290, 236).with("look", -1)
        add("clash", CarnegieProps.Clash(70f), 200, 150)
        add("yb", Bubble("I'm right!", 70f, 0.5f, fill = Pal.Coral, ink = Color.White), 112, 104)
        add("ob", Bubble("No, I'M right!", 84f, -0.5f, fill = Pal.Coral, ink = Color.White), 290, 104)
        add("avoid", Tag("the only way to win an argument: avoid it", Pal.Mint), 200, 50)
        add("trophy", Trophy(), 110, 120, 0.6)
        add("lostHeart", Heart(Pal.Rose), 290, 128, 0.7)
        add("x", Mark(false, 11f), 306, 112)
        add("lost", Tag("won the point, lost the person", Pal.Coral), 200, 50)
        add("admit", Bubble("You're right. I was wrong.", 110f, 0.5f), 125, 104)
        add("steps", CarnegieProps.Steps(4), 560, 238)
        add("climb", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[2], 2, seed = 16), 535, 236)
        add("tYes", Tag("small yeses → a big yes", Pal.Gold), 650, 66)
        add("yay", Confetti(), 721, 120)
        add("you3", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 15), 1040, 236).with("look", 1)
        add("friend", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[2], 2, seed = 16), 1180, 236).with("look", -1)
        add("talk", Bubble("…so here's how I see it.", 100f, -0.3f), 1180, 102)
        add("bulb", Bulb(), 1180, 118, 0.55)
        add("mine", Bubble("It was my idea!", 84f, -0.6f, thought = true), 1258, 74)
        add("tView", Tag("see it from their side", Pal.Sky), 1130, 50)
        add("dare", Bubble("Bet nobody can beat last month's record.", 120f, 0.85f), 1200, 100)
        beat { show("you", "other") }
        beat("argument") { show("yb", "ob", stagger = 200); show("clash", delay = 400); set("you", "mood", -0.5, 400); set("other", "mood", -0.6, 400) }
        beat("avoid it") { hide("yb", "ob", "clash"); show("avoid", delay = 300); set("you", "mood", 0.3, 500); set("other", "mood", 0.1, 500) }
        beat("Even when you win, you lose") {
            hide("avoid"); show("trophy"); set("you", "arms", 1, 400)
            show("lostHeart", delay = 500); show("x", delay = 1000); show("lost", delay = 900)
            set("other", "mood", -0.8, 500, 800); set("other", "look", 1, 500, 800)
        }
        beat("admit it quickly") {
            hide("trophy", "lostHeart", "x", "lost"); set("you", "arms", 0, 400)
            show("admit", delay = 300); set("other", "look", -1, 400, 500); set("other", "mood", 0.85, 500, 800)
        }
        beat("Begin in a friendly way") { camera(650, 165, 1.05, 1500); show("steps", "climb", delay = 500) }
        beat("saying yes early") {
            set("steps", "lit", 3, 2400, 200, Ease.Linear)
            move("climb", 583, 216, 600, 200); move("climb", 629, 194, 600, 1000); move("climb", 675, 172, 600, 1800)
        }
        beat("a larger one easier") {
            set("steps", "lit", 4, 600); move("climb", 721, 150, 700)
            set("climb", "arms", 1, 400, 600); set("climb", "mood", 1, 400, 600)
            show("yay", delay = 700); play("yay", dur = 1700, delay = 700, ease = Ease.Out); show("tYes", delay = 500)
        }
        beat("most of the talking") { camera(1120, 160, 1.05, 1500); show("you3", "friend", delay = 500); show("talk", delay = 1000) }
        beat("the idea is theirs") { hide("talk"); show("bulb", "mine", stagger = 300); set("friend", "mood", 1, 500) }
        beat("point of view") {
            hide("mine", "bulb")
            set("you3", "walk", 1, 200); move("you3", 1236, 236, 1400, 200); set("you3", "walk", 0, 300, 1500)
            set("you3", "look", -1, 300, 1600); show("tView", delay = 600)
        }
        beat("throw down a challenge") {
            hide("tView"); show("dare")
            set("friend", "arms", 1, 400, 800); set("friend", "jump", 1, 300, 800); set("friend", "jump", 0, 300, 2200)
        }
    },
    stage("Correcting without offense", Backdrops.room(Color(0xFF4A3F5E))) {
        add("boss", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 17), 85, 236).with("look", 1)
        add("emp", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[3], 3, seed = 18), 322, 236).with("look", -1).with("mood", -0.1)
        add("desk", Table(110f), 205, 214)
        add("report", CarnegieProps.Report(), 205, 188)
        add("dots", CarnegieProps.StepDots(9), 262, 44)
        val lines = listOf(
            "The layout here is excellent!",
            "What if the totals got a second check?",
            "I mixed these up last year too.",
            "How could we catch this next time?",
            "Easy slip. Happens to everyone.",
            "Much better!",
            "You're our detail person.",
            "It's just a quick tweak.",
            "Want to lead the next one?",
        )
        lines.forEachIndexed { i, l -> add("b$i", Bubble(l, 120f, 0.4f), 150, 104) }
        add("shine", Sparkles(Pal.Gold, 30f, 10), 205, 186)
        add("medal", CarnegieProps.Medal("detail pro"), 322, 192, 0.7)
        add("yay", Confetti(), 322, 150)
        val anchors = listOf("Begin with praise", "mistakes indirectly", "your own mistakes", "Ask questions", "save face",
            "Praise every improvement", "fine reputation", "easy to correct", "happy about doing")
        beat { show("boss", "emp", "desk", "report", "dots", stagger = 90) }
        anchors.forEachIndexed { i, a ->
            beat(a) {
                if (i > 0) hide("b${i - 1}")
                show("b$i", delay = 150)
                set("dots", "n", i + 1, 500)
                when (i) {
                    0 -> set("emp", "mood", 0.5, 500)
                    4 -> set("emp", "mood", 0.6, 500)
                    5 -> { set("report", "fixed", 1, 700); show("shine"); set("emp", "mood", 0.85, 500) }
                    6 -> { hide("shine"); show("medal", delay = 300) }
                    8 -> { set("emp", "arms", 1, 400); set("emp", "jump", 1, 300); set("emp", "jump", 0, 300, 1600); show("yay", delay = 300); play("yay", dur = 1700, delay = 300, ease = Ease.Out) }
                }
            }
        }
    },
    stage("Why it works", Backdrops.Dusk) {
        add("pup", Bean(Pal.Slate, Pal.Skin[1], Pal.Hair[3], 3, seed = 19), 100, 236).with("arms", 1).with("look", 1)
        add("puppet", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[1], 1, seed = 20), 290, 236).with("look", -1).with("mood", -0.3)
        add("strings", CarnegieProps.Strings(150f, 76f), 140, 92)
        add("tMan", Tag("techniques alone = manipulation", Pal.Coral), 200, 50)
        add("heart", Heart(Pal.Rose), 200, 145)
        add("hearts", CarnegieProps.Hearts(), 200, 150)
        add("tCare", Tag("techniques + real care", Pal.Leaf), 200, 50)
        add("c1", Tag("curiosity", Pal.Sky), 95, 88)
        add("c2", Tag("generosity", Pal.Gold), 200, 88)
        add("c3", Tag("restraint", Pal.Violet), 305, 88)
        add("years", Counter(22f, Pal.Gold, 0, prefix = "~", suffix = " years later"), 700, 52)
        add("spot", CarnegieProps.Spotlight(h = 220f, w = 80f), 580, 238)
        add("me", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 21), 580, 236).with("look", 1)
        add("q1", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[2], 2, seed = 22), 680, 236).with("look", -1).with("mood", 0.2)
        add("q2", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 1, seed = 23), 750, 236).with("look", -1).with("mood", 0.2)
        add("q3", Bean(Pal.Rose, Pal.Skin[3], Pal.Hair[3], 3, seed = 24), 820, 236).with("look", -1).with("mood", 0.2)
        add("t1", Tag("heard", Pal.Mint), 680, 132)
        add("t2", Tag("respected", Pal.Gold), 750, 112)
        add("t3", Tag("appreciated", Pal.Rose), 820, 132)
        add("love", CarnegieProps.Hearts(), 580, 168)
        add("tInf", Tag("influence, never demanded", Pal.Gold), 700, 84)
        beat("manipulation") { show("pup", "puppet", "strings", stagger = 150); show("tMan", delay = 500) }
        beat("sincerity") {
            hide("strings", "tMan"); set("pup", "arms", 0, 500); set("pup", "mood", 0.8, 500)
            show("heart", delay = 400); show("tCare", delay = 700); set("puppet", "mood", 0.8, 500, 600)
        }
        beat("actually care") { set("heart", "beat", 1, 300); show("hearts") }
        beat("curiosity, generosity, and restraint") { hide("hearts"); show("c1", "c2", "c3", stagger = 450) }
        beat("Nearly a century later") { camera(700, 150, 1.05, 1500); show("years", delay = 500); set("years", "v", 90, 1800, 600) }
        beat("be heard") { show("me", "q1", delay = 0, stagger = 150); show("t1", delay = 400); set("q1", "mood", 0.8, 400, 500) }
        beat("respected") { show("q2"); show("t2", delay = 300); set("q2", "mood", 0.8, 400, 400) }
        beat("appreciated") { show("q3"); show("t3", delay = 300); set("q3", "mood", 0.8, 400, 400) }
        beat("ends up with influence") {
            hide("years"); show("spot"); show("love", delay = 400); show("tInf", delay = 600)
            set("me", "mood", 0.9, 400)
            listOf("q1", "q2", "q3").forEach { set(it, "mood", 1, 400, 300) }
        }
    },
)
