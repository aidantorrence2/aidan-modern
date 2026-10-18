package com.aidantorrence.syncreader

import kotlin.math.floor
import kotlin.math.pow

val POWER_OF_HABIT_SCENES = listOf(
    scene("The habit loop") {
        beat("A cue triggers") { box(80, 82, 100, 34, "Cue", Ink.Blue) }
        beat("triggers a routine") { arrow(132, 82, 148, 82); box(200, 82, 100, 34, "Routine", Ink.White) }
        beat("produces a reward") { arrow(252, 82, 268, 82); box(320, 82, 100, 34, "Reward", Ink.Gold) }
        beat("anticipate the reward") {
            line(320, 100, 320, 128, Ink.Gold, dashed = true)
            line(320, 128, 80, 128, Ink.Gold, dashed = true)
            arrow(80, 128, 80, 102, Ink.Gold)
            text("the brain expects the reward at the cue", 200, 146, 11.5, Ink.Gold)
        }
        beat("basal ganglia") { text("then autopilot takes over", 200, 192, 13, Ink.Blue) }
        beat("drive home") { text("you drive home and remember nothing", 200, 215, 11.5, Ink.Muted) }
        beat("never truly disappear") { text("habits never vanish, they get overwritten", 200, 260, 12.5, Ink.Gold) }
    },
    scene("The golden rule") {
        beat("keep the cue") {
            box(80, 80, 100, 34, "same cue", Ink.Blue)
            arrow(132, 80, 148, 80)
            box(200, 80, 100, 34, "old routine", Ink.Bad, id = "old")
            arrow(252, 80, 268, 80)
            box(320, 80, 100, 34, "same reward", Ink.Gold)
        }
        beat("swap in a new routine") { hide("old"); box(200, 80, 100, 34, "new routine", Ink.Good, filled = true) }
        beat("Alcoholics Anonymous") { text("stress → drink → relief", 200, 132, 12.5, Ink.Bad, id = "aa") }
        beat("meetings and conversation") { dim("aa"); text("stress → meeting → relief", 200, 156, 12.5, Ink.Good) }
        beat("belief") { text("+ belief", 200, 202, 16, Ink.Gold, bold = true) }
        beat("inside a group") {
            person(160, 252, 0.7, Ink.Muted); person(200, 252, 0.7); person(240, 252, 0.7, Ink.Muted)
            text("easiest inside a group", 200, 284, 11.5, Ink.Muted)
        }
    },
    scene("Keystone habits") {
        beat("keystone habits") { text("one habit that knocks over others", 200, 48, 12, Ink.Muted) }
        beat("worker safety") { box(80, 84, 120, 30, "safety first", Ink.Gold, filled = true, size = 11.5) }
        beat("investors panicked") { text("investors panic", 148, 84, 11, Ink.Bad, align = Align.START) }
        beat("fixing communication") { arrow(80, 100, 80, 118); box(80, 134, 120, 30, "communication", Ink.Blue, size = 11.5) }
        beat("manufacturing processes") { arrow(80, 150, 80, 168); box(80, 184, 120, 30, "processes", Ink.Blue, size = 11.5) }
        beat("profits followed") { arrow(80, 200, 80, 218); box(80, 234, 120, 30, "profits ↑", Ink.Good, filled = true, size = 11.5) }
        beat("Exercise is a keystone") { box(305, 100, 120, 30, "exercise", Ink.Gold, filled = true, size = 11.5) }
        beat("eating, spending, and sleeping") {
            arrow(290, 116, 255, 146); arrow(305, 116, 305, 146); arrow(320, 116, 355, 146)
            text("eat", 250, 160, 11.5, Ink.Good); text("spend", 305, 160, 11.5, Ink.Good); text("sleep", 360, 160, 11.5, Ink.Good)
        }
        beat("small wins") { text("small wins → new structures → new culture", 300, 220, 11.5, Ink.Gold, maxWidth = 170) }
    },
    scene("Willpower") {
        beat("gets depleted") {
            axes(30, 60, 160, 110, xLabel = "day", yLabel = "willpower")
            curve(30, 60, 160, 110, Ink.Bad, label = "drains") { t -> 0.9f - 0.7f * t }
        }
        beat("Starbucks") { box(300, 74, 150, 30, "rude customer", Ink.Bad, size = 12) }
        beat("plan in advance") { arrow(300, 91, 300, 111); box(300, 128, 150, 30, "pre-planned reply", Ink.Good, size = 12) }
        beat("already scripted") { text("no willpower needed", 300, 162, 11.5, Ink.Good) }
        beat("sense of autonomy") {
            curve(30, 60, 160, 110, Ink.Good, label = "with autonomy") { t -> 0.9f - 0.3f * t }
        }
        beat("lasts longer") { text("a sense of control makes willpower last", 200, 238, 12.5, Ink.Gold) }
    },
    scene("Habits nobody designed") {
        beat("nobody designs") { text("every group has habits, designed or not", 200, 50, 12, Ink.Muted) }
        beat("deference to surgeons") {
            person(85, 118, 1.1, Ink.Gold, label = "surgeon")
            person(155, 126, 0.75, Ink.Muted, label = "nurse")
            text("(stays quiet)", 155, 82, 10.5, Ink.Muted, italic = true)
        }
        beat("preventable errors") { text("→ preventable errors", 120, 186, 11.5, Ink.Bad) }
        beat("fire nobody owned") {
            box(300, 105, 110, 34, "fire", Ink.Bad, filled = true)
            text("“not my department”", 300, 142, 11.5, Ink.Bad, italic = true)
        }
        beat("Crises") { text("crisis = habits become visible", 200, 222, 12.5, Ink.Gold) }
        beat("rewritten") { text("the moment to rewrite them", 200, 246, 12, Ink.Good) }
    },
    scene("Selling a habit") {
        beat("analyzing purchases") {
            grid(105, 105, 8, 4, 16, 4.5, color = Ink.Faint, hi = setOf(3, 12, 21, 26), hiColor = Ink.Blue)
            text("what you buy", 105, 144, 11, Ink.Muted)
        }
        beat("predict a pregnancy") { arrow(180, 105, 222, 105, Ink.Gold); text("“expecting a baby”", 300, 105, 12.5, Ink.Gold, italic = true) }
        beat("baby coupons") {
            box(135, 196, 64, 28, "lawnmower", Ink.Muted, size = 9.5)
            box(205, 196, 64, 28, "crib", Ink.Gold, filled = true, size = 10.5)
            box(275, 196, 64, 28, "wine glasses", Ink.Muted, size = 9.5)
        }
        beat("felt like coincidence") { text("feels like coincidence", 205, 226, 11.5, Ink.Muted) }
        beat("dressed in old ones") { text("a new habit, dressed as an old one", 200, 262, 12.5, Ink.Gold) }
        beat("pop song") { text("(same way a pop song grows on you)", 200, 284, 10.5, Ink.Muted) }
    },
    scene("Movements, and you") {
        beat("strong ties of friendship") {
            line(110, 105, 80, 78, Ink.Gold); line(110, 105, 142, 78, Ink.Gold)
            line(110, 105, 78, 134, Ink.Gold); line(110, 105, 142, 134, Ink.Gold)
            dot(110, 105, 7); dot(80, 78, 5, Ink.White); dot(142, 78, 5, Ink.White); dot(78, 134, 5, Ink.White); dot(142, 134, 5, Ink.White)
            text("friends start it", 110, 160, 11, Ink.Gold)
        }
        beat("weak ties of community") {
            grid(290, 105, 9, 5, 12, 2.8, hi = first(45), hiColor = Ink.Blue)
            text("community spreads it", 290, 160, 11, Ink.Blue)
        }
        beat("new habits of identity") { text("new habits make it last", 200, 190, 12, Ink.Good) }
        beat("responsibility to change it") { text("know your habit → own your habit", 200, 216, 12.5, Ink.Gold, bold = true) }
        beat("Identify the routine") { box(57, 260, 86, 28, "1 · routine", Ink.Muted, size = 10.5) }
        beat("experiment with rewards") { box(150, 260, 86, 28, "2 · rewards", Ink.Muted, size = 10.5) }
        beat("isolate the cue") { box(243, 260, 86, 28, "3 · cue", Ink.Muted, size = 10.5) }
        beat("write a plan") { box(338, 260, 86, 28, "4 · plan", Ink.Gold, filled = true, size = 10.5) }
    },
)

val MANS_SEARCH_SCENES = listOf(
    scene("The book in two halves") {
        beat("three years") { text("3 years in the camps", 200, 52, 13, Ink.Muted) }
        beat("first half") { box(110, 112, 160, 52, "Part 1\nhow people endured", Ink.Muted, size = 12) }
        beat("second half") { box(290, 112, 160, 52, "Part 2\nlogotherapy", size = 12) }
        beat("not pleasure") { text("pleasure", 90, 200, 13, Ink.Faint); cross(90, 226, 7) }
        beat("or power") { text("power", 200, 200, 13, Ink.Faint); cross(200, 226, 7) }
        beat("search for meaning") { text("meaning", 310, 200, 16, Ink.Gold, bold = true); ring(310, 200, 38) }
    },
    scene("Three phases") {
        beat("three phases") { line(40, 150, 360, 150, Ink.Faint, width = 2) }
        beat("came shock") {
            dot(80, 150, 7, Ink.Bad); text("1 · shock", 80, 124, 13, Ink.Bad, bold = true)
            text("detached curiosity", 80, 176, 11, Ink.Muted)
        }
        beat("apathy") { dot(200, 150, 7, Ink.Muted); text("2 · apathy", 200, 124, 13, Ink.Muted, bold = true) }
        beat("armor") { text("numbness as armor", 200, 176, 11, Ink.Muted) }
        beat("liberated") { dot(320, 150, 7, Ink.Blue); text("3 · release", 320, 124, 13, Ink.Blue, bold = true) }
        beat("confusing rather than joyful") { text("confusing, not joyful", 320, 176, 11, Ink.Muted) }
        beat("not been waiting") { text("the world had moved on", 320, 198, 11, Ink.Muted) }
    },
    scene("A reason to live") {
        beat("something to live for") { person(100, 88, color = Ink.Gold, label = "had a why") }
        beat("a person they loved") { text("someone they loved", 100, 140, 11.5, Ink.Gold) }
        beat("a work left unfinished") { text("unfinished work", 100, 158, 11.5, Ink.Gold) }
        beat("a faith") { text("a faith", 100, 176, 11.5, Ink.Gold) }
        beat("more likely to endure") { text("endured", 100, 204, 13, Ink.Good, bold = true) }
        beat("lost their sense of a future") { person(300, 88, color = Ink.Muted, label = "lost the why") }
        beat("declined quickly") { text("declined", 300, 150, 13, Ink.Bad, bold = true) }
        beat("a why to live") { text("“He who has a why to live can bear almost any how.”", 200, 244, 12.5, Ink.Gold, italic = true, maxWidth = 330) }
        beat("love is the ultimate goal") { text("love: the highest goal", 200, 280, 11.5) }
    },
    scene("The last freedom") {
        beat("everything can be taken") {
            person(200, 140, 1.2)
            text("home", 90, 80, 12, Ink.Muted, id = "a"); text("family", 310, 80, 12, Ink.Muted, id = "b")
            text("name", 90, 200, 12, Ink.Muted, id = "c"); text("health", 310, 200, 12, Ink.Muted, id = "d")
        }
        beat("except one thing") { hide("a", "b", "c", "d"); ring(200, 135, 54) }
        beat("choose one's attitude") { text("your attitude", 200, 214, 15, Ink.Gold, bold = true) }
        beat("most prisoners did not") { text("most couldn't", 110, 252, 11.5, Ink.Muted) }
        beat("But some did") { text("some did", 290, 252, 11.5, Ink.Good) }
        beat("does not determine character") { text("suffering doesn't decide who you become", 200, 282, 11.5) }
    },
    scene("Three roads to meaning") {
        beat("will to pleasure") { text("Freud: pleasure", 70, 52, 11.5, Ink.Muted) }
        beat("will to power") { text("Adler: power", 200, 52, 11.5, Ink.Muted) }
        beat("will to meaning") { text("Frankl: meaning", 330, 52, 12.5, Ink.Gold, bold = true) }
        beat("existential vacuum") {
            ring(200, 108, 24, Ink.Faint, width = 2)
            text("the empty feeling → boredom, addiction, aggression", 200, 150, 11, Ink.Bad, maxWidth = 320)
        }
        beat("creating a work") { box(80, 212, 120, 46, "1 · create or do something", Ink.Blue, size = 11.5) }
        beat("experiencing something") { box(200, 212, 110, 46, "2 · love, experience", size = 11.5) }
        beat("unavoidable suffering") { box(320, 212, 120, 46, "3 · your stance on suffering", Ink.Purple, size = 11.5) }
        beat("finds a meaning") { text("suffering with a meaning stops being only suffering", 200, 268, 11.5, Ink.Gold, maxWidth = 340) }
    },
    scene("Practical tools") {
        beat("Paradoxical intention") { text("Paradoxical intention", 110, 52, 12.5, Ink.Gold, bold = true) }
        beat("wish for exactly the thing they fear") { text("“Let me sweat as much as I can!”", 110, 78, 11, italic = true, maxWidth = 190) }
        beat("brings humor") { text("the fear loop breaks, humor arrives", 110, 104, 11, Ink.Good, maxWidth = 190) }
        beat("Dereflection") { text("Dereflection", 300, 52, 12.5, Ink.Blue, bold = true) }
        beat("toward the task or person") { text("look outward, not inward", 300, 78, 11, Ink.Muted) }
        beat("aiming at happiness directly") {
            person(70, 190, label = "chasing")
            arrow(100, 182, 190, 182, Ink.Muted, dashed = true)
            dot(220, 182, 8)
            text("happiness", 220, 204, 11, Ink.Gold)
        }
        beat("side effect") { text("aim at meaning, and happiness follows", 200, 262, 12.5, Ink.Gold) }
        beat("eludes you") { text("chase it and it slips away", 310, 182, 11.5, Ink.Bad, maxWidth = 140) }
    },
    scene("Tragic optimism") {
        beat("say yes to life") { text("yes to life", 200, 86, 22, Ink.Gold, bold = true) }
        beat("pain, guilt, and death") { text("in spite of pain · guilt · death", 200, 122, 12, Ink.Muted) }
        beat("He lost") { text("he lost his wife, parents and brother", 200, 172, 12, Ink.Muted) }
        beat("rebuilt a career") { text("and rebuilt his life helping others", 200, 200, 12.5, Ink.Good) }
        beat("reasons to continue") { dot(200, 252, 10) }
    },
)

val MINDSET_SCENES = listOf(
    scene("Two beliefs about ability") {
        beat("some people wilt") { person(110, 95, color = Ink.Muted, label = "wilts") }
        beat("others dig in") { person(290, 95, color = Ink.Gold, label = "digs in") }
        beat("fixed mindset") { box(110, 175, 160, 46, "FIXED\n“ability is set”", Ink.Bad, size = 12) }
        beat("growth mindset") { box(290, 175, 160, 46, "GROWTH\n“ability can grow”", Ink.Good, size = 12) }
        beat("effort, strategy, and help") { text("effort · strategy · help", 290, 214, 11, Ink.Good) }
        beat("often unconscious") { text("usually unconscious, and it shapes almost everything", 200, 262, 11.5, Ink.Muted, maxWidth = 340) }
    },
    scene("Inside the fixed mindset") {
        beat("a test") { text("every task = a test of you", 200, 50, 13, Ink.Bad) }
        beat("not an event but a verdict") { text("failure = a verdict", 200, 72, 12, Ink.Bad) }
        beat("choosing tasks") { text("· picks easy tasks", 24, 108, 11.5, Ink.Muted, align = Align.START) }
        beat("hiding mistakes") { text("· hides mistakes", 24, 128, 11.5, Ink.Muted, align = Align.START) }
        beat("giving up") { text("· gives up when it's hard", 24, 148, 11.5, Ink.Muted, align = Align.START) }
        beat("feeling threatened") { text("· threatened by others' success", 24, 168, 11.5, Ink.Muted, align = Align.START) }
        beat("treating effort") { text("· effort = no talent", 24, 188, 11.5, Ink.Muted, align = Align.START) }
        beat("praising them for being smart") { text("“You're so smart!”", 300, 108, 13, Ink.Gold, italic = true) }
        beat("chose easier puzzles") { bar(265, 240, 40, 70, Ink.Bad, "chose easy") }
        beat("enjoyed the hard ones less") { bar(335, 240, 40, 28, Ink.Muted, "enjoyed hard") }
        beat("lied about their scores") { text("and lied about scores more", 300, 276, 11, Ink.Bad) }
    },
    scene("Inside the growth mindset") {
        beat("opportunity to get better") { text("every task = a chance to improve", 200, 50, 13, Ink.Good) }
        beat("Failure is information") { text("failure = information", 200, 72, 12, Ink.Good) }
        beat("ability into achievement") {
            box(65, 112, 100, 32, "ability", Ink.Muted)
            text("× effort", 162, 112, 13, Ink.Gold, bold = true)
            arrow(198, 112, 238, 112, Ink.Gold)
            box(305, 112, 120, 32, "achievement", Ink.Good)
        }
        beat("praised for their process") { text("“You worked hard on that!”", 200, 152, 12.5, Ink.Good, italic = true) }
        beat("unknown and unknowable") {
            axes(60, 185, 280, 82, xLabel = "years")
            curve(60, 185, 280, 82, Ink.Faint) { t -> 0.1f + 0.2f * t }
            curve(60, 185, 280, 82, Ink.Faint) { t -> 0.1f + 0.45f * t }
            text("where you start", 64, 274, 10, Ink.Muted, align = Align.START)
        }
        beat("much further") {
            curve(60, 185, 280, 82, Ink.Gold, label = "years of practice") { t -> 0.1f + 0.88f * t.pow(1.6f) }
        }
    },
    scene("Everywhere it shows up") {
        beat { text("fixed", 165, 50, 12, Ink.Bad, bold = true); text("growth", 310, 50, 12, Ink.Good, bold = true) }
        beat("In sports") { text("sports", 24, 84, 12.5, align = Align.START) }
        beat("natural talent and faded") { text("relied on talent, faded", 165, 84, 10.5, Ink.Muted, maxWidth = 135) }
        beat("training problems") { text("setback = training problem", 310, 84, 10.5, Ink.Good, maxWidth = 140) }
        beat("In business") { text("business", 24, 128, 12.5, align = Align.START) }
        beat("smartest in the room") { text("must be the smartest", 165, 128, 10.5, Ink.Muted, maxWidth = 135) }
        beat("asked questions") { text("asks, admits, learns", 310, 128, 10.5, Ink.Good, maxWidth = 140) }
        beat("In relationships") { text("love", 24, 172, 12.5, align = Align.START) }
        beat("should be effortless") { text("should be effortless", 165, 172, 10.5, Ink.Muted, maxWidth = 135) }
        beat("work on together") { text("work on it together", 310, 172, 10.5, Ink.Good, maxWidth = 140) }
        beat("In parenting") { text("kids", 24, 216, 12.5, align = Align.START); text("“you're smart”", 165, 216, 10.5, Ink.Muted) }
        beat("praise process") { text("praise the process", 310, 216, 10.5, Ink.Good) }
        beat("the word yet") { text("“I can't do it… yet.”", 200, 266, 16, Ink.Gold, bold = true) }
    },
    scene("Not just effort") {
        beat("not just about praising effort") { text("growth ≠ just trying harder", 200, 50, 13.5, Ink.Gold) }
        beat("Effort that goes nowhere") {
            axes(40, 80, 150, 100, xLabel = "effort", yLabel = "progress")
            curve(40, 80, 150, 100, Ink.Bad, label = "same approach") { t -> 0.15f + 0.08f * t }
        }
        beat("new strategies") {
            axes(220, 80, 150, 100, xLabel = "effort", yLabel = "progress")
            curve(220, 80, 150, 100, Ink.Good, label = "new strategies") { t -> 0.12f + 0.75f * (floor(t * 4f) / 4f) + 0.1f * t }
        }
        beat("seek feedback") { text("+ feedback + better mentors", 295, 206, 11, Ink.Good) }
        beat("false growth mindset") { text("saying it ≠ doing it", 115, 206, 11, Ink.Bad) }
        beat("mixture of both") { text("everyone is a mix of both", 200, 252, 12.5) }
    },
    scene("How to change") {
        beat("notice the fixed-mindset voice") { box(200, 60, 270, 36, "1 · hear it: “you'll fail and they'll see”", Ink.Bad, size = 11.5) }
        beat("you have a choice") { arrow(200, 80, 200, 92); box(200, 110, 270, 36, "2 · remember: you can choose", Ink.Blue, size = 11.5) }
        beat("growth-mindset response") { arrow(200, 130, 200, 142); box(200, 160, 270, 36, "3 · talk back: “I can learn this”", Ink.Good, size = 11.5) }
        beat("growth-mindset action") { arrow(200, 180, 200, 192); box(200, 210, 270, 36, "4 · act: try · ask · study · stretch", Ink.Gold, filled = true, size = 11.5) }
        beat("one-time conversion") { text("a practice, not a switch", 200, 250, 12, Ink.Muted) }
        beat("interesting rather than threatening") { text("hard things start to feel interesting", 200, 276, 12.5, Ink.Gold) }
    },
)

val OUTLIERS_SCENES = listOf(
    scene("Look around, not just at") {
        beat("low rates of heart disease") {
            text("heart disease", 110, 48, 11, Ink.Muted)
            bar(80, 135, 42, 25, Ink.Good, "Roseto")
            bar(140, 135, 42, 72, Ink.Muted, "nearby")
        }
        beat("smoking, drinking") { text("despite smoking & heavy food", 110, 166, 11, Ink.Bad) }
        beat("the community itself") {
            person(255, 100, 0.8); person(295, 92, 0.8, Ink.Gold); person(335, 100, 0.8)
            text("the community", 295, 140, 12, Ink.Gold, bold = true)
        }
        beat("talent and grit") { person(200, 230); text("talent + grit?", 200, 282, 11.5, Ink.Muted, id = "tg") }
        beat("hidden advantages") { hide("tg"); text("advantages", 100, 215, 11.5, Ink.Gold) }
        beat("cultural legacies") { text("culture", 300, 215, 11.5, Ink.Gold) }
        beat("extraordinary opportunities") { text("opportunities", 200, 285, 11.5, Ink.Gold) }
        beat("look around them") { ring(200, 226, 48) }
    },
    scene("The birthday advantage") {
        beat("elite Canadian hockey players") { text("elite players, by birth month", 160, 48, 11.5, Ink.Muted) }
        beat("January, February, or March") {
            bar(70, 155, 42, 85, Ink.Gold, "Jan–Mar")
            bar(130, 155, 42, 58, Ink.Muted, "Apr–Jun")
            bar(190, 155, 42, 38, Ink.Muted, "Jul–Sep")
            bar(250, 155, 42, 24, Ink.Muted, "Oct–Dec")
        }
        beat("cutoff date") { text("cutoff: Jan 1", 338, 96, 12.5, Ink.Blue, bold = true) }
        beat("bigger and more coordinated") { box(50, 208, 78, 30, "a bit bigger", Ink.Muted, size = 10.5) }
        beat("better teams") { arrow(91, 208, 103, 208); box(144, 208, 78, 30, "better team", Ink.Muted, size = 10.5) }
        beat("more coaching") { arrow(185, 208, 197, 208); box(238, 208, 78, 30, "more coaching", Ink.Muted, size = 10.5) }
        beat("really are better") { arrow(279, 208, 291, 208); box(334, 208, 84, 30, "truly better", Ink.Gold, filled = true, size = 10.5) }
        beat("arbitrary calendar") { text("a calendar quirk compounds", 200, 252, 12.5, Ink.Gold) }
        beat("identified as gifted") { text("same pattern in school", 200, 276, 11, Ink.Muted) }
    },
    scene("10,000 hours") {
        beat("ten thousand hour rule") { counter(200, 62, 0, 10000, suffix = " hours", size = 28) }
        beat("Beatles played eight-hour sets") {
            grid(105, 125, 12, 4, 10, 3, hi = first(48), hiColor = Ink.Blue)
            text("Beatles: 8-hour sets", 105, 160, 11, Ink.Blue)
        }
        beat("Gates had rare") {
            grid(295, 125, 12, 4, 10, 3, hi = first(48), hiColor = Ink.Good)
            text("Gates: rare computer access", 295, 160, 11, Ink.Good)
        }
        beat("luck, family, and timing") { text("the chance to practice = luck · family · timing", 200, 196, 12, Ink.Gold, maxWidth = 340) }
        beat("1830s") { line(50, 245, 350, 245, Ink.Faint); dot(110, 245, 6, Ink.Muted); text("born 1830s", 110, 266, 11, Ink.Muted) }
        beat("born around 1955") { dot(290, 245, 6); text("born ~1955", 290, 266, 11, Ink.Gold) }
        beat("specific wave") { text("each caught a wave", 200, 228, 11, Ink.Muted) }
    },
    scene("Smart enough, then what?") {
        beat("raw intelligence") { axes(30, 60, 170, 120, xLabel = "IQ", yLabel = "success") }
        beat("beyond a threshold") {
            curve(30, 60, 170, 120, Ink.Blue, label = "levels off") { t -> if (t < 0.5f) t * 1.4f else 0.7f + (t - 0.5f) * 0.1f }
        }
        beat("practical intelligence") { text("practical intelligence:", 305, 66, 12, Ink.Gold, bold = true) }
        beat("read situations") { text("read the room", 305, 90, 11.5) }
        beat("talk to authority") { text("talk to authority", 305, 110, 11.5) }
        beat("get what you want") { text("ask for what you want", 305, 130, 11.5) }
        beat("taught by class") { text("learned at home", 305, 160, 11.5, Ink.Muted) }
        beat("concerted cultivation") { person(120, 228, 0.85, Ink.Good, label = "taught to negotiate") }
        beat("taught deference") { person(290, 228, 0.85, Ink.Muted, label = "taught to defer") }
    },
    scene("Cultural legacy") {
        beat("culture of honor") { text("honor culture → feuds, generations later", 200, 50, 11.5, Ink.Muted) }
        beat("high deference to authority") {
            text("“…maybe check the weather?”", 105, 78, 10.5, italic = true, maxWidth = 180)
            person(70, 118, 0.85, Ink.Gold, label = "captain")
            person(140, 122, 0.7, Ink.Muted, label = "co-pilot")
        }
        beat("retraining how its pilots communicated") { text("trained to speak up → safer", 105, 172, 11, Ink.Good) }
        beat("rice farming") { text("rice paddies: patience, precision", 300, 92, 11, Ink.Muted, maxWidth = 180) }
        beat("simpler to learn") { text("eleven = “ten-one”", 300, 120, 12.5, Ink.Gold) }
        beat("summer gap") { text("school year: everyone gains about the same", 200, 210, 11, Ink.Muted) }
        beat("rich and poor") { text("summer: the gap opens", 200, 234, 12, Ink.Bad) }
        beat("extends the school day") { text("a longer school year closes it", 200, 262, 12.5, Ink.Good) }
    },
    scene("Build the ladders") {
        beat("chain of opportunities") {
            dot(60, 88, 6, Ink.Muted); arrow(72, 88, 128, 88); dot(140, 88, 6, Ink.Muted); arrow(152, 88, 208, 88)
            dot(220, 88, 6, Ink.Muted); arrow(232, 88, 288, 88); dot(300, 88, 8)
            text("a chain of lucky breaks", 180, 116, 11.5, Ink.Muted)
        }
        beat("effort is unimportant") { box(120, 170, 130, 40, "effort", Ink.Blue) }
        beat("opportunity exists") { text("×", 200, 170, 20, bold = true); box(280, 170, 130, 40, "opportunity") }
        beat("build the structures") { text("build structures → more outliers", 200, 238, 13.5, Ink.Gold, bold = true) }
        beat("wait for geniuses") { text("instead of waiting for geniuses", 200, 264, 11.5, Ink.Muted) }
    },
)

/** Explainer scenes for every built-in title, one per paragraph of its summary. */
val SCENES: Map<String, List<Scene>> by lazy {
    mapOf(
        "carnegie" to CARNEGIE_SCENES,
        "atomic-habits" to ATOMIC_HABITS_SCENES,
        "thinking-fast-slow" to THINKING_SCENES,
        "sapiens" to SAPIENS_SCENES,
        "seven-habits" to SEVEN_HABITS_SCENES,
        "deep-work" to DEEP_WORK_SCENES,
        "power-of-habit" to POWER_OF_HABIT_SCENES,
        "mans-search" to MANS_SEARCH_SCENES,
        "mindset" to MINDSET_SCENES,
        "outliers" to OUTLIERS_SCENES,
    )
}
