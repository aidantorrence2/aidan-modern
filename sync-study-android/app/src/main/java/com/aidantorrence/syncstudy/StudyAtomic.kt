package com.aidantorrence.syncstudy

val ATOMIC_STUDY = study("atomic-habits") {
    keyIdeas(
        "Tiny 1% improvements compound into huge results, but only after a delay (the plateau of latent potential).",
        "Focus on systems, not goals: winners and losers share the same goals.",
        "Every action is a vote for the type of person you want to become.",
        "The habit loop: cue, craving, response, reward.",
        "The four laws: make it obvious, attractive, easy and satisfying. Invert them to break a habit.",
        "The two-minute rule: master showing up before you optimise.",
        "Never miss twice.",
    )
    para(0) {
        mcq("Your friend gets 1% better every day for a year. About how much better are they at the end?",
            "About 3.65× better", "About 37× better", "About 365× better", "Exactly 2× better", answer = 1,
            why = "1.01 multiplied by itself 365 times is about 37.8. Gains compound like interest, so the line looks flat for months and then shoots up.",
            pretest = true)
        why("Why do new habits often feel useless for the first few weeks?",
            "Results are delayed. Like ice warming from 25° to 31°, the work builds up out of sight (the plateau of latent potential) before anything visible happens at 32°.")
        cloze("Getting 1% worse every day for a year leaves you at about ___ times where you started.", "0.03", "0.03x", "3%", "3 percent")
    }
    para(1) {
        mcq("Two runners have exactly the same goal. According to Clear, what separates the winner from the loser?",
            "How badly they want it", "Their system of daily actions", "A more specific goal", "Natural talent", answer = 1,
            why = "Winners and losers share the same goals, so the goal can't be the difference. The daily system is.",
            pretest = true)
        why("What does \"every action is a vote\" mean for building a new identity?",
            "Each time you do the habit you cast a vote for being that kind of person. You don't need every vote, just a majority, so small consistent wins gradually prove the new identity to yourself.")
        cloze("You do not need a unanimous election, just a ___.", "majority")
    }
    para(2) {
        mcq("Your phone buzzes and you feel an itch to check it. In the habit loop, the buzz is the…",
            "Cue", "Craving", "Response", "Reward", answer = 0,
            why = "The buzz is the cue. The itch is the craving, checking is the response, and the new message is the reward.",
            pretest = true)
        why("How would you use the four laws to break a bad habit?",
            "Invert them: make it invisible (remove the cues), unattractive, difficult (add friction) and unsatisfying.")
        cloze("The four stages of every habit: cue, craving, ___, reward.", "response")
    }
    para(3) {
        mcq("Which of these is an implementation intention?",
            "I want to read more", "I will read for 10 minutes at 9 pm in bed", "Reading matters to me", "I'll read when I find time", answer = 1,
            why = "It names the behaviour, the time and the place. Stating when and where roughly doubles follow-through compared with a vague goal.")
        why("Explain habit stacking and give an example from your own day.",
            "Attach a new habit to one you already do: \"After I [current habit], I will [new habit].\" For example: after I pour my morning coffee, I meditate for one minute.")
        cloze("Want to practise guitar more? Put it in the ___ of the room.", "middle", "center", "centre")
    }
    para(4) {
        mcq("When does dopamine spike the most?",
            "After you receive the reward", "In anticipation of the reward", "Only for surprise rewards", "During sleep", answer = 1,
            why = "Wanting, not getting, drives the biggest spike. That's why making a habit attractive beforehand matters.")
        why("What is temptation bundling, and why does it work?",
            "Pair something you need to do with something you want to do, like only listening to a favourite podcast on the treadmill. Anticipating the \"want\" makes the \"need\" attractive.")
        cloze("Join a group where your desired behaviour is ___.", "normal")
    }
    para(5) {
        mcq("Using the two-minute rule, how should \"run a marathon\" start?",
            "Run 5 km every day", "Put on your running shoes", "Sign up for a race", "Buy a fitness watch", answer = 1,
            why = "Scale the habit down to something that takes two minutes. The hard part is showing up; master starting before you optimise.")
        why("Why does reducing friction matter more than relying on motivation?",
            "We follow the path of least resistance. Every extra step lowers the odds of doing it, so priming the environment (shoes by the door) and automating choices make the good behaviour the default.")
        cloze("The two-minute rule: the hard part is ___, not performing.", "showing up")
    }
    para(6) {
        mcq("You missed your workout yesterday. What matters most today?",
            "Doing a double workout", "Not missing twice in a row", "Starting fresh next Monday", "Resetting your tracker", answer = 1,
            why = "Missing once is an accident; missing twice is the start of a new habit.")
        why("Why attach a small immediate reward to a habit whose payoff is far away?",
            "The brain prioritises immediate rewards. A distant payoff feels unsatisfying now, so an instant pleasure (ticking off a streak, a small treat) closes the loop.")
        cloze("Missing once is an accident; missing twice is the start of a new ___.", "habit")
    }
    para(7) {
        mcq("Your practice has become boring and you've stopped improving. What does Clear suggest?",
            "Make it easier", "Push to just-manageable difficulty and review your progress", "Quit and pick a new habit", "Do it less often", answer = 1,
            why = "Engagement peaks at just-manageable difficulty. Reflection and review stop autopilot from becoming a plateau.")
        why("Why should you keep your identity \"loose\"?",
            "If your whole self rests on one role, a setback there feels like losing who you are. A looser identity lets you adapt when one role slips.")
    }
    para(8) {
        mcq("\"You do not rise to the level of your goals; you fall to the level of your…\"",
            "habits", "systems", "motivation", "environment", answer = 1,
            why = "Systems: the daily processes that actually produce results.")
        why("Summarise Atomic Habits in two sentences, from memory.",
            "Tiny habits compound into big results, so focus on the system rather than the goal. Build habits by making them obvious, attractive, easy and satisfying, and let each one be a vote for who you want to become.")
    }
}
