package com.aidantorrence.syncstudy

val OUTLIERS_STUDY = study("outliers") {
    keyIdeas(
        "Success is explained by hidden advantages, cultural legacies and opportunities, not just talent and grit.",
        "Roseto's low heart disease came from its tight-knit community, not individual habits.",
        "Accumulative advantage: a small early edge (like a birth month near the cutoff) compounds.",
        "Mastery takes enormous practice (around 10,000 hours), and the chance to practise depends on luck, family and timing.",
        "Beyond a threshold, IQ matters less than practical intelligence, which is learned at home.",
        "Cultural legacies shape behaviour: deference in cockpits, patience from rice farming.",
        "Effort counts only where opportunity exists, so build structures that create outliers.",
    )
    para(0) {
        mcq("Researchers studied Roseto's unusually low heart disease. What did they conclude explained it?",
            "Their diet", "Their genes", "The close-knit community itself", "Lots of exercise", answer = 2,
            why = "Despite smoking, drinking and heavy eating, Roseto's protection came from tight families, shared meals and a culture that discouraged showing off.",
            pretest = true)
        why("What does Gladwell mean by \"look around them, not just at them\"?",
            "To explain outliers, look at the advantages, cultural legacies and opportunities surrounding them, not only at their individual talent and grit.")
        cloze("Outliers are products of hidden advantages, cultural ___ and extraordinary opportunities.", "legacies", "legacy")
    }
    para(1) {
        mcq("In a youth hockey league with a January 1 cutoff, which player is most likely to end up elite?",
            "One born in December", "One born in January", "One born in July", "Birth month makes no difference", answer = 1,
            why = "Children born just after the cutoff are the oldest in their group, get picked for better teams, receive more coaching and games, and the edge compounds.",
            pretest = true)
        why("Explain accumulative advantage using the hockey example.",
            "A small initial edge (being a few months older) gets you selected, which brings more coaching and games, which makes you genuinely better, which gets you selected again. The gap snowballs.")
        cloze("The cutoff date for Canadian youth hockey is January ___.", "first", "1", "1st")
    }
    para(2) {
        mcq("What is the real point of the ten thousand hour rule?",
            "Exactly 10,000 hours guarantees genius", "Mastery needs enormous practice, and getting to practise that much depends on luck and timing", "Talent matters more than practice", "Only musicians need practice", answer = 1,
            why = "The exact number matters less than the scale of practice, and the chance to practise that much (Beatles in Hamburg, Gates's 1968 terminal) came from luck, family and timing.",
            pretest = true)
        why("Why does Gladwell point out that many software billionaires were born around 1955?",
            "They were the right age to catch the personal-computer wave: old enough to seize it, young enough not to be locked into older careers. Birth timing created the opportunity.")
        cloze("The Beatles played ___-hour sets in Hamburg clubs.", "eight", "8")
    }
    para(3) {
        mcq("Two equally brilliant people: one can talk teachers and officials round, one can't. Which matters more for success, past a threshold?",
            "Extra IQ points", "Practical intelligence", "Memory", "Reading speed", answer = 1,
            why = "Beyond a threshold, IQ matters less than practical intelligence: reading situations, talking to authority and getting what you want.")
        why("Why did Oppenheimer succeed where Chris Langan struggled, according to Gladwell?",
            "Both were brilliant, but Oppenheimer had practical intelligence, learned through concerted cultivation in a middle-class family, so he knew how to deal with institutions and authority. Langan, isolated, didn't.")
        cloze("Middle-class parenting that teaches kids to negotiate with adults is called concerted ___.", "cultivation")
    }
    para(4) {
        mcq("A co-pilot sees danger but only hints at it to the captain. Which idea does this illustrate?",
            "The ten thousand hour rule", "High deference to authority as a cultural legacy", "Accumulative advantage", "The summer gap", answer = 1,
            why = "Crews from cultures with high deference to authority struggled to challenge a captain's mistake; retraining how pilots communicated fixed an airline's safety record.")
        why("What does the summer gap explain, and how can schools close it?",
            "Rich and poor students learn similarly during the school year; the gap grows over summer. Extending the school day and year closes it.")
        cloze("The patience and precision of ___ farming may underlie East Asian strength in maths.", "rice")
    }
    para(5) {
        mcq("What is Gladwell's final conclusion about effort?",
            "Effort doesn't matter", "Effort can only pay off when opportunity exists", "Effort alone creates outliers", "Only geniuses should try", answer = 1,
            why = "Effort matters, but it can only be exercised where opportunity exists. To get more outliers, build the structures that create opportunities.")
        why("How does Gladwell's own family story support his thesis?",
            "His mother's path from Jamaica ran through a chain of opportunities that had nothing to do with merit. Her success depended on those openings as much as on her effort.")
    }
}
