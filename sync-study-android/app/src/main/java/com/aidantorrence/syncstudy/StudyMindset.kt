package com.aidantorrence.syncstudy

val MINDSET_STUDY = study("mindset") {
    keyIdeas(
        "A fixed mindset treats ability as set; a growth mindset treats it as something you develop.",
        "In a fixed mindset, every task is a test and failure is a verdict on you.",
        "In a growth mindset, failure is information and effort turns ability into achievement.",
        "Praise the process (effort, strategy, persistence), not the person (\"you're smart\").",
        "Growth isn't just effort: change strategies, seek feedback, learn from people who are better.",
        "Everyone is a mix of both mindsets, and the mix shifts with circumstances.",
        "Change is a practice: notice the fixed voice, choose, answer it, act. Add \"yet\".",
    )
    para(0) {
        mcq("Sam believes, \"Some people are just born good at maths, and I'm not one of them.\" Which mindset is this?",
            "Growth mindset", "Fixed mindset", "False growth mindset", "No mindset, just a fact", answer = 1,
            why = "A fixed mindset sees intelligence and talent as set traits. A growth mindset sees them as developable through effort, strategy and help.",
            pretest = true)
        why("What exactly is a mindset, according to Dweck, and why does it matter so much?",
            "It's a belief about the nature of ability: fixed or developable. It's often unconscious, can differ between areas of life, and quietly shapes how you respond to challenges, effort and failure.")
        cloze("A growth mindset holds that ability can be developed through effort, strategy, and ___ from others.", "help")
    }
    para(1) {
        mcq("Children were praised for being smart after a puzzle. What did Dweck find they did next?",
            "Chose harder puzzles", "Chose easier puzzles and some lied about their scores", "Worked longer on every puzzle", "Showed no change at all", answer = 1,
            why = "One round of intelligence praise pushed kids toward easier tasks, less enjoyment of hard ones, and inflated scores. Looking smart became the goal.",
            pretest = true)
        why("Why does a fixed mindset make people avoid challenges and hide mistakes?",
            "If ability is fixed, every task tests whether you have it, and failure is a verdict on who you are. So you protect your image: pick safe tasks, hide errors, give up early, and see effort as proof you lack talent.")
        cloze("In a fixed mindset, failure is not an event but a ___.", "verdict")
    }
    para(2) {
        mcq("Jo fails her first driving test. What would a growth-mindset response look like?",
            "\"I'm just not a natural driver.\"", "\"The test was unfair.\"", "\"What did I get wrong, and how do I practise that?\"", "\"I'll never try again.\"", answer = 2,
            why = "In a growth mindset failure is information: it shows what to work on next.",
            pretest = true)
        why("Does a growth mindset claim anyone can become anything? What does it actually claim?",
            "No. It doesn't say everyone is equally talented. It says a person's true potential is unknown in advance, and years of passion and training can take people much further than their starting point suggests.")
        cloze("In a growth mindset, failure is ___.", "information")
    }
    para(3) {
        mcq("Your child brings home a bad maths grade. Which response fits Dweck's advice?",
            "\"Don't worry, you're just not a maths person.\"", "\"You're so smart, you'll do better next time.\"", "\"Let's look at how you studied and try a different strategy.\"", "\"Grades don't matter.\"", answer = 2,
            why = "Treat a bad grade as a signal about strategy and praise process rather than person.")
        why("Contrast fixed and growth mindsets in leadership.",
            "Fixed-mindset leaders need to be the smartest in the room, surround themselves with yes-men and can sink companies. Growth-minded leaders ask questions, admit mistakes and build organisations that learn.")
        cloze("Add the word ___ to any statement of what a child cannot do.", "yet")
    }
    para(4) {
        mcq("Alex has studied the same way for weeks, harder and harder, with no improvement. What does Dweck say is missing?",
            "Even more hours", "New strategies, feedback and learning from people who are better", "More praise for effort", "Natural talent", answer = 1,
            why = "Effort that goes nowhere isn't a virtue. Growth means trying new strategies and seeking feedback, not grinding harder at a failing approach.")
        why("What is a \"false growth mindset\"?",
            "Claiming to have a growth mindset, or just praising effort, without actually acting on it: no new strategies, no feedback, no real learning.")
        cloze("Everyone carries a ___ of both mindsets.", "mixture", "mix")
    }
    para(5) {
        mcq("A voice in your head says, \"You'll fail and everyone will see.\" What is Dweck's first step?",
            "Ignore it completely", "Notice it and recognise it as the fixed-mindset voice", "Avoid the challenge", "Agree with it to stay safe", answer = 1,
            why = "Change starts by noticing the fixed-mindset voice, then recognising you have a choice, answering it, and taking growth-mindset action.")
        why("Why does Dweck call changing your mindset a practice rather than a conversion?",
            "Both mindsets keep showing up. You keep noticing the fixed voice, choosing, answering it and acting. The belief that abilities grow itself grows with use.")
    }
}
