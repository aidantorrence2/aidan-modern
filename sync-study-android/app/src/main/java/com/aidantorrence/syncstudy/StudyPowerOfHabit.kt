package com.aidantorrence.syncstudy

val POWER_OF_HABIT_STUDY = study("power-of-habit") {
    keyIdeas(
        "The habit loop: a cue triggers a routine that produces a reward, and the brain learns to anticipate the reward at the cue.",
        "Once a loop is set, the basal ganglia take over. Habits never truly disappear; they get overwritten.",
        "The golden rule: keep the cue and the reward, swap in a new routine. Belief, often from a group, makes it stick.",
        "Keystone habits start chain reactions through small wins, new structures and culture.",
        "Willpower is a habit that can be strengthened. Plan in advance how you'll respond, and give people autonomy.",
        "Crises expose institutional habits and make them easier to rewrite.",
        "To change a habit: identify the routine, experiment with rewards, isolate the cue, and write a plan.",
    )
    para(0) {
        mcq("Every afternoon at 3 pm you walk to the café, buy a cookie and chat with coworkers. In the habit loop, what is \"3 pm\"?",
            "The reward", "The routine", "The craving", "The cue", answer = 3,
            why = "The time is the cue. Walking and buying is the routine, and whatever you get from it (sugar, a break, chatting) is the reward.",
            pretest = true)
        why("Why can you drive home without remembering the trip?",
            "Once a habit loop is set, the basal ganglia take over and the conscious mind steps back. The brain runs the routine automatically from the cue.")
        cloze("Once a loop is established, the ___ ganglia take over.", "basal")
    }
    para(1) {
        mcq("You snack whenever you feel stressed, mainly for a few minutes of relief. Using the golden rule, what should you change?",
            "Remove all stress from your life", "Keep stress as the cue and relief as the reward, but swap the snack for a short walk", "Throw out all snacks and rely on willpower", "Change the reward to something healthier", answer = 1,
            why = "You can't easily remove a cue or a craving. Keep the cue and reward and swap in a new routine, the way AA swaps drinking for meetings.",
            pretest = true)
        why("Why did belief matter so much for routines holding under stress?",
            "A new routine can crack when life gets hard. People need to believe change is possible, and belief is easiest to keep up inside a group, which is part of why AA works.")
        cloze("Habits are not erased; they are overwritten by loops with the same cue and the same ___.", "reward")
    }
    para(2) {
        mcq("Paul O'Neill told Alcoa's investors his only priority was worker safety. Why did profits follow?",
            "Safety cut insurance costs to zero", "Investors bought more stock", "Fixing safety forced fixes to communication, processes and accountability", "Workers were paid more", answer = 2,
            why = "Safety was a keystone habit. Fixing it required changing how the whole company communicated and worked, and profits followed.",
            pretest = true)
        why("What are the three ways keystone habits work?",
            "They produce small wins, they create structures that help other habits grow, and they build a culture where new values feel normal.")
        cloze("Small changes that start chain reactions are called ___ habits.", "keystone")
    }
    para(3) {
        mcq("A barista is trained, before a shift, on exactly what to do if a customer yells. What is that training for?",
            "So the stressful moment has a pre-scripted response that doesn't drain willpower", "To make customers feel guilty", "To raise prices", "To avoid hiring managers", answer = 0,
            why = "Planning in advance how to respond means at the moment of stress the response is already scripted, so willpower lasts.")
        why("Why does a sense of autonomy make willpower last longer?",
            "When people feel some control, even over small things, self-control feels less like a drain. Being ordered around depletes willpower faster.")
        cloze("Willpower is itself a ___ that can be strengthened.", "habit")
    }
    para(4) {
        mcq("In a hospital, nurses notice a surgeon making a mistake but stay quiet out of deference. What does Duhigg call this kind of habit?",
            "A keystone habit", "An institutional habit nobody designed", "A cue", "A small win", answer = 1,
            why = "Nobody chose this culture of deference, yet it produces preventable errors. It's an institutional habit.")
        why("Why might a good leader prolong a sense of emergency?",
            "Crises make organizational habits visible and easier to rewrite. Keeping the urgency alive keeps that window for change open.")
        cloze("The London Underground fire turned deadly because nobody ___ it.", "owned")
    }
    para(5) {
        mcq("A store wants you to start buying its fresh salads. Using Duhigg's lesson, how should it sell them?",
            "Shout \"NEW!\" on every sign", "Put them beside the familiar items you already buy", "Hide them so they feel exclusive", "Double the price", answer = 1,
            why = "New habits sell most easily when dressed in old ones. Target hid baby coupons among ordinary offers; pop songs become hits wedged between familiar ones.")
        why("Why did Target mix baby coupons among unrelated offers?",
            "Openly targeted coupons felt creepy. Mixing them in with ordinary offers made the targeting feel like coincidence, so customers used them.")
        cloze("New habits are most easily sold when they are dressed in ___ ones.", "old", "familiar")
    }
    para(6) {
        mcq("You keep checking your phone when you sit at your desk. What's the first step of Duhigg's framework?",
            "Write a plan", "Isolate the cue", "Identify the routine", "Experiment with rewards", answer = 2,
            why = "The order is: identify the routine, experiment with rewards, isolate the cue, write a plan.")
        why("How did strong and weak ties work together in the Montgomery bus boycott?",
            "Strong ties of friendship started it. Weak ties of community spread it and made it costly to stand aside. New habits of identity and self-direction made it last.")
        cloze("Once you know a habit exists, you have the ___ to change it.", "responsibility")
    }
}
