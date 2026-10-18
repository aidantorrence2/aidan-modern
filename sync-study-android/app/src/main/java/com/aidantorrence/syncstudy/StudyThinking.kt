package com.aidantorrence.syncstudy

val THINKING_STUDY = study("thinking-fast-slow") {
    keyIdeas(
        "The mind runs on two systems: a fast, automatic, intuitive System One and a slow, effortful System Two that is lazy and usually endorses whatever System One suggests.",
        "Facing a hard question, intuition quietly answers an easier one and builds a coherent story from whatever it sees, so confidence reflects how well the story fits, not how much evidence there is.",
        "Heuristics like anchoring, availability and representativeness produce predictable biases, above all the neglect of base rates, sample size and regression to the mean.",
        "We overestimate how well we understand the past and predict the future, and in unpredictable fields expert intuition is unreliable while simple formulas often do better.",
        "Trust intuition only in regular environments where people have had long practice with quick feedback, and counter the planning fallacy by taking the outside view of similar cases.",
        "People judge outcomes as gains and losses from a reference point, and losses loom about twice as large as gains, which drives status quo bias, the endowment effect and the fourfold pattern of risk.",
        "Framing and defaults change choices even when the substance is identical, so the way options are presented shapes the decisions people make.",
        "The remembering self judges experiences by their peak and their end while ignoring duration, and because it makes our choices, it often overrules the experiencing self who lives them.",
        "Knowing about biases does not cure them; what helps is recognizing risky situations, slowing down, using other people's eyes, and building procedures like premortems and checklists.",
    )
    section(0) { // Two Systems
        card(
            "What are System One and System Two, and how do they divide the work of thinking?",
            "System One is fast, automatic, effortless and always on, producing impressions and intuitions by association. System Two is slow, deliberate and effortful, handling calculation, self-control and checking. System One does most of the work, and System Two steps in when something is hard or surprising.",
        )
        card(
            "Why does Kahneman call System Two lazy, and why does that matter?",
            "System Two follows a law of least effort, so it usually endorses System One's suggestions without checking them. Many errors happen not because we cannot reason but because we do not bother to, which is why intuitive mistakes slip through unchallenged.",
        )
        card(
            "What does the bat-and-ball puzzle reveal about intuitive thinking?",
            "An intuitive answer, ten cents, comes to mind instantly and feels right, but the ball actually costs five cents. Even very capable students accept the wrong answer because they never check it, showing that confident intuitions often go unexamined.",
        )
        card(
            "How does cognitive ease affect what we believe is true?",
            "Information that feels easy to process, because it is repeated, clearly presented or familiar, feels true and good. That is why repetition persuades even when claims are false, while difficulty or strain makes us more vigilant and analytical.",
        )
        card(
            "What does the invisible gorilla study show about the limits of attention?",
            "Mental effort is a limited resource. When attention is fully occupied by a task like counting passes, people can miss something as obvious as a gorilla walking through the scene, and they are blind to their own blindness.",
        )
    }
    section(1) { // Swapping the Question
        card(
            "What is substitution, and how does it shape our answers to hard questions?",
            "When a question is hard, System One quietly answers an easier related one, such as replacing how happy is my life with what is my mood right now, and the answer feels like a response to the original. The fix is to ask which question you actually answered.",
        )
        card(
            "What does what you see is all there is mean, and why does it produce overconfidence?",
            "System One builds the most coherent story it can from the information at hand and never asks what is missing. Confidence comes from how well the story hangs together, not from how much evidence supports it, so sparse information often produces the most certainty.",
        )
        card(
            "What did the survey about dates and happiness show?",
            "When students were first asked how many dates they had last month, their rating of overall happiness became strongly tied to that answer. The earlier question supplied an easy substitute for the hard question of how happy they were with life.",
        )
        card(
            "What is the affect heuristic?",
            "People let their feelings about something determine their beliefs about it. If you like a technology, you judge its benefits high and its risks low, and if you dislike it, the reverse. Emotion delivers the conclusion and reasoning then defends it.",
        )
        card(
            "What is the halo effect, and how can you reduce it?",
            "An impression of one trait, especially a first impression, colors how we judge everything else about a person or thing. You reduce it by assessing separate features independently before forming an overall view, so early information cannot dominate.",
        )
    }
    section(2) { // Mental Shortcuts
        card(
            "Why do we neglect base rates, and how should you correct for it?",
            "Representativeness makes us judge probability by how well a case fits a stereotype, ignoring how common each category is. Correct for it by starting from the base rate, for example that farmers far outnumber librarians, and adjusting only modestly for the description, especially when the evidence is weak.",
        )
        card(
            "How does anchoring work, and how can you defend against it?",
            "Any number considered before an estimate pulls the estimate toward it, even a random one, because we adjust too little from it and System One recruits evidence that fits it. Defend by refusing to work from outrageous anchors and deliberately thinking of reasons the true value differs.",
        )
        card(
            "How does the availability heuristic distort judgments of risk?",
            "We judge frequency by how easily examples come to mind, so vivid, recent and heavily reported events seem more common than they are, while quiet killers like strokes are underestimated. Media coverage can amplify this into availability cascades that drive public fear and policy.",
        )
        card(
            "What does the Linda problem show about the conjunction fallacy?",
            "Most people judge feminist bank teller more probable than bank teller, which is logically impossible because the first is a subset of the second. Extra detail makes a story more plausible and representative but always less probable.",
        )
        card(
            "Why do the most extreme results so often come from small samples?",
            "Small samples vary more by chance, so both the highest and the lowest rates, as with kidney cancer in rural counties, tend to come from small groups. Our minds invent causal stories for what is really statistical noise.",
        )
        card(
            "Why did flight instructors wrongly conclude that criticism works better than praise?",
            "Exceptional performances are partly luck, so a great maneuver tends to be followed by a worse one and a poor one by a better one regardless of feedback. This is regression to the mean, which we misread as cause and effect.",
        )
    }
    section(3) { // Overconfidence
        card(
            "What is the outside view, and why is it the remedy for the planning fallacy?",
            "Instead of estimating from the details of your own plan, find a reference class of similar projects, use their typical outcomes as your baseline, then adjust modestly. Plans built from the inside sit close to best-case scenarios and ignore the many ways things go wrong.",
        )
        card(
            "When can an expert's intuition be trusted?",
            "Only when the environment is regular enough to be predictable and the expert has had long practice with quick, clear feedback, as with firefighters or chess players. In noisy fields like stock picking, confident intuition reflects a coherent story rather than real skill.",
        )
        card(
            "Why do experts in unpredictable fields stay confident despite poor track records?",
            "Confidence is produced by coherent narratives and a professional culture that shares them, not by accuracy. Investment advisers' rankings barely persist from year to year and political experts forecast worse than equal guesses, yet the feeling of understanding remains. Kahneman calls this the illusion of validity.",
        )
        card(
            "Why do simple formulas often outperform expert judgment?",
            "Formulas weigh a few relevant factors the same way every time, while experts try to be clever, combine cues unreliably, and give different answers to the same case on different occasions. Simple scores like the Apgar rating for newborns usually match or beat holistic expert impressions.",
        )
        card(
            "How do hindsight and outcome bias distort how we judge decisions?",
            "After learning the outcome, we believe we knew it all along and judge decisions by their results rather than the quality of the reasoning. Sound decisions with bad luck get blamed, lucky gambles get rewarded, and professionals become defensively cautious.",
        )
        card(
            "How do success stories mislead us about the role of luck?",
            "We build tidy narratives crediting skill and smart choices for success while leaving out luck. Because the stories feel complete, we overestimate how predictable the world is, and the advantage of supposedly great companies often fades once luck evens out.",
        )
    }
    section(4) { // Losses Loom Larger
        card(
            "What are the core ideas of prospect theory?",
            "People evaluate outcomes as gains and losses relative to a reference point rather than as total wealth, their sensitivity diminishes as amounts grow, and losses loom roughly twice as large as equivalent gains.",
        )
        card(
            "What is loss aversion, and what everyday behavior does it explain?",
            "Losses hurt about twice as much as equal gains feel good. That is why people reject fair bets, stick with the status quo, fight hard over concessions in negotiations, and value what they own more than identical things they could buy.",
        )
        card(
            "What is the endowment effect, and what evidence shows it?",
            "People demand far more to give up something they own than they would pay to acquire it, because selling registers as a loss. Students given coffee mugs asked about twice what others would pay for the same mug. It applies to goods held for use, not for trade.",
        )
        card(
            "What is the fourfold pattern of risk attitudes?",
            "With likely gains we are risk averse and take the sure thing, and with likely losses we gamble to avoid them. With unlikely gains we buy lottery tickets, and with unlikely losses we buy insurance. It comes from overweighting small probabilities combined with loss aversion.",
        )
        card(
            "How does framing change decisions, and how can you guard against it?",
            "Logically identical options described differently produce different choices, so surgery with ninety percent survival is preferred over the same surgery with ten percent mortality. Guard against it by restating the choice in both frames and asking what has actually changed.",
        )
        card(
            "What is broad framing, and why does it lead to better risky decisions?",
            "Instead of evaluating each gamble in isolation, where loss aversion makes us refuse favorable bets, treat decisions as a portfolio governed by a consistent policy. Across many favorable risks, the gains outweigh the losses, and checking results less often reduces the sting of small losses.",
        )
    }
    section(5) { // Peak and End
        card(
            "What is the difference between the experiencing self and the remembering self?",
            "The experiencing self lives through each moment, while the remembering self constructs the story afterward and makes the decisions. Because choices are based on memories, we often choose what makes a better memory rather than a better experience.",
        )
        card(
            "What are the peak-end rule and duration neglect?",
            "Memory of an episode is dominated by its most intense moment and its ending, while its length barely counts. So a longer painful procedure that tapers off gently is remembered as better than a shorter one that ends at its worst.",
        )
        card(
            "What did the cold-hand experiment show about memory and choice?",
            "Most volunteers chose to repeat a longer trial of cold-water pain that ended with slightly milder water over a shorter trial, even though the longer one contained strictly more pain. The remembering self favored the gentler ending and made the choice.",
        )
        card(
            "What is the focusing illusion?",
            "Whatever we are thinking about seems more important to our happiness than it really is. People expect climate, a new car or a raise to change their lives a lot, but they adapt and stop paying attention, so the effect on daily experience is small.",
        )
        card(
            "How do experienced well-being and life satisfaction differ?",
            "Life satisfaction is a remembering-self judgment that keeps rising with income and is easily swayed by mood and focus, while moment-to-moment happiness levels off beyond a moderate income. Experienced well-being depends heavily on how we spend our time, such as commuting versus being with friends.",
        )
    }
    section(6) { // What Actually Helps
        card(
            "Why does knowing about biases not protect you from them, and what does help?",
            "System One runs automatically, so biased impressions still feel true, like an optical illusion you know is false. What helps is recognizing high-risk situations, slowing down to engage System Two, using other people's judgment, and building procedures that force careful thought.",
        )
        card(
            "What is a premortem, and why does it work?",
            "Before committing to a plan, the team imagines it failed disastrously a year from now and writes a brief history of why. It legitimizes doubt, counters group overconfidence, and surfaces threats nobody had voiced.",
        )
        card(
            "Why should you rely on the eyes of others, and how should you gather their opinions?",
            "It is easier to spot errors in other people's thinking than in our own, so informed critique from colleagues improves decisions. Collect opinions independently before discussion so that errors are not all shaped by whoever speaks first.",
        )
        card(
            "How should a structured judgment such as a hiring interview be designed to reduce bias?",
            "Break the evaluation into a few independent traits, score each one separately with factual questions, combine the scores with a simple rule, and only then allow an overall intuitive judgment. This limits the halo effect and inconsistency.",
        )
        card(
            "What is the difference between Econs and Humans, and what does it imply for policy?",
            "Econs are the perfectly rational agents of economic theory, while Humans rely on fast intuitions and are swayed by framing and defaults. Policy can preserve freedom of choice while nudging, for example with automatic enrollment in savings plans or clearer disclosures.",
        )
        card(
            "What are the warning signs that you are in a cognitive minefield?",
            "High stakes, an arbitrary number in play, a vivid story shaping your sense of risk, a forecast about your own project, a choice framed as a loss, or strong confidence where feedback is poor. These call for slowing down and applying base rates and the outside view.",
        )
    }
}
