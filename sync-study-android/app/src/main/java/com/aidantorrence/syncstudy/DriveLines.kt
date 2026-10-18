package com.aidantorrence.syncstudy

/**
 * One short spoken takeaway per paragraph, read right after the narration. Each one turns that paragraph's
 * animated scene into a picture you can hold in your head without looking at a screen.
 */
val DRIVE_RECAPS: Map<String, List<String>> = mapOf(
    "carnegie" to listOf(
        "Picture two bars: being right is a short one, how people feel is a tall one. That's the whole book.",
        "Three rules: don't criticize, give honest appreciation, and frame what you want as what they want. Bait the hook with what the fish likes.",
        "Six ways to be liked, and they all come down to one thing: real attention.",
        "You can't win an argument. Start friendly, collect small yeses, and let the idea become theirs.",
        "Correct people gently: praise first, hint at the mistake, admit your own, and let them save face.",
        "It only works if you mean it. People want to be heard, respected and appreciated.",
    ),
    "atomic-habits" to listOf(
        "Picture an ice cube: nothing happens from twenty-five degrees to thirty-one, then at thirty-two it melts. One percent a day works the same way.",
        "Winners and losers share the same goals; the daily system is the difference. And every action is a vote for who you're becoming.",
        "The loop: cue, craving, response, reward. Make it obvious, attractive, easy and satisfying.",
        "Say exactly when and where, stack it on a habit you already have, and keep the guitar in the middle of the room.",
        "Dopamine spikes when you want something, not when you get it. Bundle what you need to do with what you love.",
        "Shrink it to two minutes. Read one page, not thirty. The habit is showing up.",
        "Give yourself a tiny reward now, protect the streak, and never miss twice.",
        "Stay at just-manageable difficulty, review your progress, and keep your identity loose.",
        "You don't rise to the level of your goals. You fall to the level of your systems.",
    ),
    "thinking-fast-slow" to listOf(
        "System one is the quick hare. System two is the lazy tortoise that mostly signs off on whatever the hare says.",
        "Asked a hard question, your mind quietly answers an easier one, and feels completely sure about it.",
        "Anchors pull your guesses, vivid examples feel common, and a neat story makes you forget the base rates.",
        "Experts in unpredictable fields often do no better than a coin flip. Before predicting, ask how similar cases usually went.",
        "A loss hurts about twice as much as an equal gain feels good. And ninety percent survival sounds safer than ten percent mortality.",
        "Memory keeps the peak and the end, not the length. And we make choices for the memory.",
        "Knowing about biases doesn't switch them off. Slow down, ask others, and use checklists and premortems.",
    ),
    "sapiens" to listOf(
        "Three revolutions: language seventy thousand years ago, farming twelve thousand, science five hundred.",
        "Strangers cooperate in millions because they believe the same stories: gods, nations, money, companies.",
        "Wheat gave more food per acre but harder lives. In a way, wheat domesticated us.",
        "Money, empires and universal religions pulled humanity together, for better and for worse.",
        "Science began by admitting ignorance, then fed a loop with empire and capital, powered by trust in a richer future.",
        "We gained enormous power, but not much happiness, because expectations rise with every gain.",
    ),
    "seven-habits" to listOf(
        "Character beats technique. Change the map in your head and the results follow.",
        "From dependence, to independence, to interdependence. The first three habits are the work on yourself.",
        "Habit one: between what happens and how you respond there is a pause. Work inside your circle of influence and it grows.",
        "Habit two: imagine your own funeral. Make sure your ladder is leaning against the right wall.",
        "Habit three: live in important but not urgent. Plan the week, not just the day.",
        "Habit four: think win-win. Bake a bigger pie, or walk away with no deal.",
        "Habit five: listen to understand before you try to be understood. Diagnose before you prescribe.",
        "Habit six: trust plus different views makes a third, better option.",
        "Habit seven: stop and sharpen the saw: body, mind, people and values.",
        "Underneath everything is an emotional bank account. Keep promises and stay loyal to make deposits.",
    ),
    "deep-work" to listOf(
        "Deep work is rare and valuable. Shallow work is easy to copy.",
        "Output equals time times focus. Every glance at email leaves a fog of attention residue.",
        "Looking busy passes for productivity, and distraction feels good, so depth needs structure.",
        "Rule one: build rituals, choose a schedule like monastic or rhythmic, count your deep hours, and shut down each evening.",
        "Rule two: schedule breaks from focus, not from distraction. Let yourself be bored.",
        "Rule three: keep a tool only if its benefits clearly beat its costs. Try thirty days without it.",
        "Rule four: give every hour a job, budget the shallow work, and stop at a fixed time.",
        "A deep life is more productive, and more satisfying.",
    ),
    "power-of-habit" to listOf(
        "Cue, routine, reward. Habits never disappear; they get overwritten.",
        "The golden rule: keep the cue, keep the reward, swap the routine, and believe change is possible.",
        "Keystone habits, like safety at Alcoa or daily exercise, set off chain reactions of small wins.",
        "Willpower is a muscle that tires. Plan your response in advance, and give people a sense of control.",
        "Every group has habits, designed or not. A crisis makes them visible, and changeable.",
        "New habits sell best when they're dressed up as old ones, like a new song between two familiar hits.",
        "Movements spread through strong ties and weak ties. Once you know a habit exists, it's yours to change.",
    ),
    "mans-search" to listOf(
        "Frankl's core idea: our deepest drive is not pleasure or power, but meaning.",
        "In the camps he saw three phases: shock, apathy, and a confusing release.",
        "Those who had a why to live could bear almost any how.",
        "The last freedom: whatever happens, you can choose your attitude.",
        "Meaning comes from three places: what you create, who you love, and how you face suffering.",
        "Chase happiness and it slips away. Aim at meaning, and happiness follows.",
        "Tragic optimism: saying yes to life in spite of everything.",
    ),
    "mindset" to listOf(
        "Fixed mindset: ability is set. Growth mindset: ability can grow.",
        "In a fixed mindset every task is a test, and failure is a verdict on you.",
        "In a growth mindset failure is information, and effort is the path.",
        "It shows up in sports, business, love and parenting. Praise the process, and add the word yet.",
        "Growth isn't just trying harder. It's new strategies, feedback, and learning from people who are better.",
        "Hear the fixed voice, remember you can choose, talk back, and act.",
    ),
    "outliers" to listOf(
        "Success comes from hidden advantages and opportunities, not just talent. Look around people, not just at them.",
        "Elite hockey players are mostly born early in the year: a small head start, compounded.",
        "Mastery takes enormous practice, and the chance to practice that much depends on luck and timing.",
        "Past a certain threshold, IQ matters less than practical intelligence, which is often learned at home.",
        "Cultural legacies shape everything from cockpits to math class to the summer learning gap.",
        "Effort needs opportunity. Build the ladders instead of waiting for geniuses.",
    ),
)

fun recapFor(bookId: String, paragraph: Int): String? = DRIVE_RECAPS[bookId]?.getOrNull(paragraph)
