package com.aidantorrence.syncstudy

/** Animated explainer scenes for every built-in title, one per paragraph of its summary. */
val STAGE_SCENES: Map<String, List<StageScene>> by lazy {
    mapOf(
        "carnegie" to CARNEGIE_STAGE,
        "atomic-habits" to ATOMIC_STAGE,
        "thinking-fast-slow" to THINKING_STAGE,
        "sapiens" to SAPIENS_STAGE,
        "mans-search" to MANS_SEARCH_STAGE,
        "mindset" to MINDSET_STAGE,
        "outliers" to OUTLIERS_STAGE,
    )
}
